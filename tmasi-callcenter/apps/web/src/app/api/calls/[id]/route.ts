import { asc, eq } from "drizzle-orm";
import { callNotes, cases, contacts, getDb, turns } from "@tc/db";
import { requireCall } from "../../../../lib/server/calls.ts";
import { handle, json } from "../../../../lib/server/http.ts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** One call with its turns, notes, contact and case. */
export const GET = handle(async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const { id } = await ctx.params;
  const call = await requireCall(id);
  const db = await getDb();
  const [turnRows, noteRows, caseRows] = await Promise.all([
    db.select().from(turns).where(eq(turns.callId, call.id)).orderBy(asc(turns.idx)),
    db.select().from(callNotes).where(eq(callNotes.callId, call.id)).orderBy(asc(callNotes.at)),
    db.select().from(cases).where(eq(cases.callId, call.id)),
  ]);
  const contactId = caseRows[0]?.contactId ?? null;
  const [contact] = contactId ? await db.select().from(contacts).where(eq(contacts.id, contactId)) : [];
  return json({ call, turns: turnRows, notes: noteRows, contact: contact ?? null, case: caseRows[0] ?? null, cases: caseRows });
});
