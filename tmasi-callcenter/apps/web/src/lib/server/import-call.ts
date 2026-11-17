// Import of a finished conversation (R10): details, turns, MP3 (only with consent), then the post-call jobs.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { eq } from "drizzle-orm";
import type { NeutralConversation, VoiceRuntime } from "@tc/voice";
import { callEvents, calls, dataDir, getDb, turns, writeAudit } from "@tc/db";
import { runPostCall } from "../../../../../packages/llm/src/postcall.ts";
import { personaById } from "./personas.ts";
import { baseLang } from "./say.ts";

const AFFIRM = /\b(yes|yeah|yep|sure|ok|okay|of course|fine|go ahead|ja|klar|gern|natürlich|да|конечно|хорошо|tak|jasne|oczywiście|sí|si|claro|por supuesto|oui|bien sûr|d'accord|ano|jistě|samozřejmě)\b|نعم|أيوه|ايوه|اه|آه|طبعا|طبعاً|تمام|اكيد|أكيد|موافق/i;
const NEGATE = /\b(no|nope|nein|нет|не надо|nie|non|ne)\b|لا\b|مش موافق|لأ/i;

export interface ConsentGuess {
  consent: boolean;
  basis: "data_collection" | "caller_agreed" | "caller_declined" | "unclear" | "judge";
}

/**
 * Recording consent (FR-003, FR-022). Safe by default: audio is kept only on a clear yes.
 * Order: the agent's "recording_consent" data collection value; else the first caller reply (a yes without a no);
 * else "unclear", which keeps no audio. After the post-call judge, an unclear call takes the judge's reading.
 */
export function guessRecordingConsent(conv: NeutralConversation): ConsentGuess {
  const dc = conv.dataCollection["recording_consent"]?.value;
  if (typeof dc === "boolean") return { consent: dc, basis: "data_collection" };
  if (typeof dc === "string" && /^(true|yes|false|no)$/i.test(dc)) return { consent: /^(true|yes)$/i.test(dc), basis: "data_collection" };
  const first = conv.transcript.find((t) => t.role === "caller" && t.text);
  const text = first?.text ?? "";
  if (text && NEGATE.test(text)) return { consent: false, basis: "caller_declined" };
  if (text && AFFIRM.test(text)) return { consent: true, basis: "caller_agreed" };
  return { consent: false, basis: "unclear" };
}

interface TurnInsert {
  callId: string;
  idx: number;
  role: "agent" | "caller" | "tool";
  text: string | null;
  lang: string | null;
  tStartMs: number | null;
  latencyMs: number | null;
  toolName: string | null;
  toolArgs: unknown;
  toolResult: unknown;
}

/** Flatten the neutral transcript into turns rows: spoken turns plus one "tool" row per tool call. */
export function buildTurns(callId: string, conv: NeutralConversation, startLang: string | null): { rows: TurnInsert[]; langsSeen: string[]; lastLang: string | null } {
  const rows: TurnInsert[] = [];
  const seen: string[] = [];
  let lang = startLang;
  if (lang) seen.push(lang);
  let idx = 0;
  for (const t of conv.transcript) {
    // the language detection tool names the new language before the reply that uses it
    for (const tc of t.toolCalls) {
      if (tc.name === "language_detection") {
        const a = tc.args as { language?: string } | null;
        if (a?.language) {
          lang = baseLang(a.language);
          if (!seen.includes(lang)) seen.push(lang);
        }
      }
    }
    if (t.text) {
      rows.push({
        callId,
        idx: idx++,
        role: t.role,
        text: t.text,
        lang,
        tStartMs: Math.round(t.timeInCallSecs * 1000),
        latencyMs: t.role === "agent" ? t.latencyMs : null,
        toolName: null,
        toolArgs: null,
        toolResult: null,
      });
    }
    t.toolCalls.forEach((tc, i) => {
      const res = t.toolResults.find((r) => r.name === tc.name) ?? t.toolResults[i];
      rows.push({
        callId,
        idx: idx++,
        role: "tool",
        text: null,
        lang,
        tStartMs: Math.round(t.timeInCallSecs * 1000),
        latencyMs: res?.latencyS != null ? Math.round(res.latencyS * 1000) : null,
        toolName: tc.name,
        toolArgs: tc.args ?? null,
        toolResult: res?.result ?? null,
      });
    });
  }
  return { rows, langsSeen: seen, lastLang: lang };
}

async function waitUntilDone(rt: VoiceRuntime, id: string): Promise<NeutralConversation> {
  let conv = await rt.getConversation(id);
  for (let i = 0; i < 8 && (conv.status === "initiated" || conv.status === "live" || conv.status === "processing"); i++) {
    await new Promise((r) => setTimeout(r, 1500));
    conv = await rt.getConversation(id);
  }
  return conv;
}

export interface ImportResult {
  ok: boolean;
  callId: string;
  status: "imported" | "import_failed";
  turns: number;
  durationS: number | null;
  recordingConsent: boolean;
  consentBasis: ConsentGuess["basis"];
  recordingPath: string | null;
  langsSeen: string[];
  conversationStatus: NeutralConversation["status"] | null;
  postCall: "ok" | "failed";
  error?: string;
}

export async function importCall(rt: VoiceRuntime, conversationId: string): Promise<ImportResult> {
  const db = await getDb();
  let [call] = await db.select().from(calls).where(eq(calls.elConversationId, conversationId));
  if (!call) {
    // the session never reached /api/calls/link: keep the conversation anyway
    [call] = await db.insert(calls).values({ elConversationId: conversationId, status: "live" }).returning();
  }
  const callId = call!.id;
  try {
    const conv = await waitUntilDone(rt, conversationId);
    const startLang = await personaById(call!.personaIdStart).then((p) => (p ? baseLang(p.lang) : null));
    const built = buildTurns(callId, conv, startLang);
    let consent = guessRecordingConsent(conv);
    let recordingPath: string | null = null;

    await db.transaction(async (tx) => {
      await tx.delete(turns).where(eq(turns.callId, callId)); // idempotent: a re-import replaces the turns
      for (let i = 0; i < built.rows.length; i += 50) await tx.insert(turns).values(built.rows.slice(i, i + 50));
      const aiDisclosed = conv.evaluation["ai_disclosed"]?.result === "success";
      await tx
        .update(calls)
        .set({
          status: "imported",
          startedAt: conv.startedAt,
          endedAt: conv.startedAt && conv.durationS != null ? new Date(conv.startedAt.getTime() + conv.durationS * 1000) : null,
          durationS: conv.durationS != null ? Math.round(conv.durationS) : null,
          recordingConsent: false, // set after the post-call judge, below
          recordingPath: null,
          aiDisclosed,
          langDetected: built.lastLang ?? (conv.metadata.mainLanguage ? baseLang(conv.metadata.mainLanguage) : null),
          langsSeen: built.langsSeen,
          endReason: conv.metadata.terminationReason,
        })
        .where(eq(calls.id, callId));
      await tx.insert(callEvents).values({
        callId,
        kind: "import",
        data: { turns: built.rows.length, consent, hasAudio: conv.metadata.hasAudio, conversationStatus: conv.status },
      });
      if (conv.cost != null) await tx.insert(callEvents).values({ callId, kind: "cost", data: { elevenlabsCostRaw: conv.cost } });
    });
    await writeAudit(null, "call.import", "calls", callId, null, { turns: built.rows.length, consent });

    let postCall: "ok" | "failed" = "ok";
    let judgeConsent: boolean | null = null;
    try {
      const r = await runPostCall(callId);
      judgeConsent = r?.judge.recording_consent ?? null;
    } catch (e) {
      postCall = "failed";
      await db.insert(callEvents).values({ callId, kind: "judge", data: { error: e instanceof Error ? e.message : String(e) } });
    }

    // the agent's own data collection wins; otherwise the judge's reading settles an unclear or heuristic answer
    if (consent.basis !== "data_collection" && judgeConsent !== null) consent = { consent: judgeConsent, basis: "judge" };

    if (consent.consent && conv.metadata.hasAudio) {
      const audio = await rt.getAudio(conversationId);
      if (audio) {
        const when = conv.startedAt ?? new Date();
        const rel = join("recordings", String(when.getUTCFullYear()), String(when.getUTCMonth() + 1).padStart(2, "0"), `${callId}.mp3`);
        const abs = join(dataDir(), rel);
        mkdirSync(dirname(abs), { recursive: true });
        writeFileSync(abs, audio);
        recordingPath = rel.replaceAll("\\", "/");
      }
    }
    await db.update(calls).set({ recordingConsent: consent.consent, recordingPath }).where(eq(calls.id, callId));
    await db.insert(callEvents).values({ callId, kind: "import", data: { consentFinal: consent } });

    // no consent: the vendor copy (which holds the audio) is deleted too; the transcript is already stored locally
    if (!consent.consent && conv.metadata.hasAudio) {
      try {
        await rt.deleteConversation(conversationId);
        await db.insert(callEvents).values({ callId, kind: "import", data: { vendorCopyDeleted: true } });
      } catch (e) {
        await db.insert(callEvents).values({ callId, kind: "import", data: { vendorCopyDeleted: false, error: e instanceof Error ? e.message : String(e) } });
      }
    }
    return {
      ok: true,
      callId,
      status: "imported",
      turns: built.rows.length,
      durationS: conv.durationS,
      recordingConsent: consent.consent,
      consentBasis: consent.basis,
      recordingPath,
      langsSeen: built.langsSeen,
      conversationStatus: conv.status,
      postCall,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    await db.update(calls).set({ status: "import_failed" }).where(eq(calls.id, callId));
    await db.insert(callEvents).values({ callId, kind: "import", data: { error: message } });
    throw e instanceof Error ? e : new Error(message);
  }
}
