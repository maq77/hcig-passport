import { asc, eq } from "drizzle-orm";
import { callNotes, getDb } from "@tc/db";
import { requireCall } from "../../../../../lib/server/calls.ts";
import { handle, json } from "../../../../../lib/server/http.ts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Notes of a call only. The demo page polls this every 2 seconds. */
export const GET = handle(async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const { id } = await ctx.params;
  const call = await requireCall(id);
  const db = await getDb();
  const notes = await db.select().from(callNotes).where(eq(callNotes.callId, call.id)).orderBy(asc(callNotes.at));
  return json({ ok: true, notes });
});
