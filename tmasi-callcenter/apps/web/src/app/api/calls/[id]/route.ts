import { and, asc, desc, eq } from "drizzle-orm";
import { callEvents, callNotes, cases, contacts, getDb, kbGaps, turns } from "@tc/db";
import { requireCall } from "../../../../lib/server/calls.ts";
import { handle, json } from "../../../../lib/server/http.ts";
import { personaById } from "../../../../lib/server/personas.ts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** The latest post-call judge event as { status, ... }: ok with the result, skipped with the reason, error, or null when never run. */
function judgeFrom(data: unknown): { status: "ok"; result: unknown } | { status: "skipped"; reason: string } | { status: "error"; error: string } | null {
  if (!data || typeof data !== "object") return null;
  const d = data as { result?: unknown; skipped?: string; error?: string };
  if (d.result) return { status: "ok", result: d.result };
  if (d.skipped) return { status: "skipped", reason: d.skipped };
  if (d.error) return { status: "error", error: d.error };
  return null;
}

/** One call with its turns, notes, contact, case, personas, judge result and knowledge gaps. */
export const GET = handle(async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const { id } = await ctx.params;
  const call = await requireCall(id);
  const db = await getDb();
  const [turnRows, noteRows, caseRows, judgeRows, gapRows] = await Promise.all([
    db.select().from(turns).where(eq(turns.callId, call.id)).orderBy(asc(turns.idx)),
    db.select().from(callNotes).where(eq(callNotes.callId, call.id)).orderBy(asc(callNotes.at)),
    db.select().from(cases).where(eq(cases.callId, call.id)),
    db.select().from(callEvents).where(and(eq(callEvents.callId, call.id), eq(callEvents.kind, "judge"))).orderBy(desc(callEvents.at)).limit(1),
    db.select().from(kbGaps).where(eq(kbGaps.callId, call.id)),
  ]);
  const contactId = caseRows[0]?.contactId ?? null;
  const [contact] = contactId ? await db.select().from(contacts).where(eq(contacts.id, contactId)) : [];
  const [start, end] = await Promise.all([personaById(call.personaIdStart), personaById(call.personaIdEnd)]);
  return json({
    call,
    turns: turnRows,
    notes: noteRows,
    contact: contact ?? null,
    case: caseRows[0] ?? null,
    cases: caseRows,
    gaps: gapRows.map((g) => ({ id: g.id, question: g.question, lang: g.lang, status: g.status })),
    judge: judgeFrom(judgeRows[0]?.data),
    personaStart: start ? { label: start.label, displayName: start.displayName, lang: start.lang } : null,
    personaEnd: end ? { label: end.label, displayName: end.displayName, lang: end.lang } : null,
    hasRecording: Boolean(call.recordingPath),
  });
});
