import { desc, inArray } from "drizzle-orm";
import { calls, cases, contacts, getDb, kbGaps } from "@tc/db";
import { handle, json } from "../../../lib/server/http.ts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Recent calls for the start screen: GET /api/calls?limit=5 */
export const GET = handle(async (req: Request) => {
  const raw = Number(new URL(req.url).searchParams.get("limit") ?? "5");
  const limit = Number.isFinite(raw) ? Math.min(Math.max(Math.trunc(raw), 1), 50) : 5;
  const db = await getDb();
  const rows = await db.select().from(calls).where(inArray(calls.status, ["imported", "import_failed"])) // a call that never connected is not a "recent call".orderBy(desc(calls.createdAt)).limit(limit);
  if (!rows.length) return json({ ok: true, calls: [] });
  const ids = rows.map((r) => r.id);
  const [caseRows, gapRows] = await Promise.all([
    db.select().from(cases).where(inArray(cases.callId, ids)),
    db.select({ callId: kbGaps.callId }).from(kbGaps).where(inArray(kbGaps.callId, ids)),
  ]);
  const contactIds = caseRows.map((c) => c.contactId).filter((x): x is string => Boolean(x));
  const contactRows = contactIds.length ? await db.select().from(contacts).where(inArray(contacts.id, contactIds)) : [];
  const out = rows.map((r) => {
    const c = caseRows.find((x) => x.callId === r.id) ?? null;
    const contact = c?.contactId ? (contactRows.find((x) => x.id === c.contactId) ?? null) : null;
    return {
      id: r.id,
      status: r.status,
      startedAt: r.startedAt ?? r.createdAt,
      durationS: r.durationS,
      langsSeen: r.langsSeen,
      hasCase: Boolean(c),
      contactName: contact?.name ?? null,
      interest: c?.interest ?? null,
      gapCount: gapRows.filter((g) => g.callId === r.id).length,
    };
  });
  return json({ ok: true, calls: out });
});
