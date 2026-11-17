// Post-call job (task T032, owner Opus): summary, case fields, judge and knowledge gaps for one imported call.
// One structured Claude call per call (research R11). Writes results back to calls, cases, kb_gaps and call_events.
import { and, asc, eq, isNotNull } from 'drizzle-orm';
import { callEvents, callNotes, calls, cases, getDb, kbGaps, turns, writeAudit } from '@tc/db';
import { hasEmergencySignal, llmCost } from '@tc/core';
import { LocalPgvector, type KnowledgeProvider } from '@tc/kb';
import { AnthropicProvider } from './anthropic.ts';
import type { LlmProvider } from './provider.ts';
import { POSTCALL_SYSTEM, PostCallSchema, buildPostCallPrompt, type PostCallInput, type PostCallResult } from './postcall-prompt.ts';

// His choice 2026-11-17: "Claude for cents". Haiku 5.5 keeps a demo month under a dollar.
// Set LLM_POSTCALL_MODEL=claude-sonnet-5-5 (about $0.04 a call) or claude-opus-5-5 for stricter grading.
export const POSTCALL_DEFAULT_MODEL = 'claude-haiku-5-5';

export interface PostCallDeps {
  llm?: LlmProvider;
  kb?: KnowledgeProvider;
  model?: string;
}

/** Agent turns with factual content get knowledge retrieved for them; short courtesy turns do not. */
const FACTUAL_MIN_CHARS = 40;

export async function runPostCall(callId: string, deps: PostCallDeps = {}): Promise<PostCallResult | null> {
  const db = await getDb();
  if (!deps.llm && !process.env.ANTHROPIC_API_KEY) {
    await db.insert(callEvents).values({ callId, kind: 'judge', data: { skipped: 'Add ANTHROPIC_API_KEY to tmasi-callcenter/.env.local' } });
    return null;
  }
  const model = deps.model ?? process.env.LLM_POSTCALL_MODEL ?? POSTCALL_DEFAULT_MODEL;
  const llm = deps.llm ?? new AnthropicProvider({ model });
  const kb = deps.kb ?? new LocalPgvector();

  const rows = await db
    .select()
    .from(turns)
    .where(and(eq(turns.callId, callId), isNotNull(turns.text)))
    .orderBy(asc(turns.idx));
  const spoken = rows.filter((r) => r.role === 'agent' || r.role === 'caller');
  if (!spoken.length) {
    await db.insert(callEvents).values({ callId, kind: 'judge', data: { skipped: 'no spoken turns' } });
    return null;
  }
  const notes = await db.select().from(callNotes).where(eq(callNotes.callId, callId)).orderBy(asc(callNotes.at));

  const knowledge: PostCallInput['knowledge'] = [];
  for (const t of spoken) {
    if (t.role !== 'agent' || (t.text ?? '').length < FACTUAL_MIN_CHARS) continue;
    const hits = await kb.search(t.text!, t.lang ?? 'en', 4);
    knowledge.push({ turnIdx: t.idx, chunks: hits.map((h) => ({ src: `[src:${h.src}]`, text: h.text })) });
  }

  const input: PostCallInput = {
    turns: spoken.map((t) => ({ idx: t.idx, role: t.role as 'agent' | 'caller', text: t.text! })),
    notes: notes.map((n) => ({ key: n.key, value: n.value })),
    knowledge,
  };
  const { data: r, usage } = await llm.structured({
    system: POSTCALL_SYSTEM,
    prompt: buildPostCallPrompt(input),
    schema: PostCallSchema,
    cacheSystem: true,
    model,
  });

  let cost: number | null = null;
  try {
    cost = llmCost(model, usage);
  } catch {
    cost = null; // unknown price for a custom model id
  }

  // a keyword net on caller turns, in case the model missed an emergency
  const emergency = r.emergency || spoken.some((t) => t.role === 'caller' && hasEmergencySignal(t.text ?? ''));

  await db.transaction(async (tx) => {
    await tx
      .update(calls)
      .set({
        judgeScore: String(r.judge.score),
        judgePass: r.judge.pass,
        aiDisclosed: r.judge.ai_disclosed,
        llmCostUsd: cost != null ? cost.toFixed(6) : null,
      })
      .where(eq(calls.id, callId));

    const [existing] = await tx.select().from(cases).where(eq(cases.callId, callId));
    if (existing) {
      await tx
        .update(cases)
        .set({
          summaryEn: r.summary_en,
          summaryCallerLang: r.summary_caller_lang,
          interest: existing.interest ?? r.case_fields.interest,
          preferredContactTime: existing.preferredContactTime ?? r.case_fields.preferred_contact_time,
          sensitiveNote: existing.sensitiveNote ?? r.case_fields.sensitive_note,
          ...(emergency ? { type: 'urgent' as const, priority: 'urgent' as const } : {}),
        })
        .where(eq(cases.id, existing.id));
    } else if (emergency) {
      // FR-014: an emergency call always leaves an urgent case, even without contact details
      await tx.insert(cases).values({
        callId,
        type: 'urgent',
        priority: 'urgent',
        interest: r.case_fields.interest ?? 'Possible medical emergency during the call',
        summaryEn: r.summary_en,
        summaryCallerLang: r.summary_caller_lang,
        sensitiveNote: r.case_fields.sensitive_note,
      });
    }

    // idempotent on re-import: open gaps from an earlier run of this call are replaced
    await tx.delete(kbGaps).where(and(eq(kbGaps.callId, callId), eq(kbGaps.status, 'open')));
    for (const g of r.gaps) {
      const turn = spoken.find((t) => t.idx === g.turn_idx);
      await tx.insert(kbGaps).values({ callId, turnId: turn?.id ?? null, question: g.question, lang: g.lang });
    }

    await tx.insert(callEvents).values({ callId, kind: 'judge', data: { model, usage, costUsd: cost, result: r } });
  });
  await writeAudit(null, 'call.postcall', 'calls', callId, null, { pass: r.judge.pass, score: r.judge.score, gaps: r.gaps.length });
  return r;
}
