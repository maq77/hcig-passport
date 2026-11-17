import { eq } from "drizzle-orm";
import { calls, getDb, writeAudit } from "@tc/db";
import { requireCall } from "../../../../lib/server/calls.ts";
import { HttpError, handle, json, readJsonObject } from "../../../../lib/server/http.ts";
import { linkBody } from "../../../../lib/server/tools.ts";
import { requireToolToken } from "../../../../lib/server/tool-auth.ts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Store the ElevenLabs conversation id on the call when the session connects. Body: { callId, conversationId, toolToken }. */
export const POST = handle(async (req: Request) => {
  const raw = await readJsonObject(req);
  requireToolToken(raw.callId, raw.toolToken); // 403 first
  const input = linkBody.parse(raw);
  const call = await requireCall(input.callId);
  const db = await getDb();
  const [other] = await db.select({ id: calls.id }).from(calls).where(eq(calls.elConversationId, input.conversationId));
  if (other && other.id !== call.id) throw new HttpError(409, "That conversation id belongs to another call");
  if (call.elConversationId !== input.conversationId) {
    await db.update(calls).set({ elConversationId: input.conversationId }).where(eq(calls.id, call.id));
    await writeAudit(null, "call.link", "calls", call.id, { elConversationId: call.elConversationId }, { elConversationId: input.conversationId });
  }
  return json({ ok: true, callId: call.id, conversationId: input.conversationId });
});
