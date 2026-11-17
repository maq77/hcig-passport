import { handle, json, HttpError } from "../../../../../lib/server/http.ts";
import { importCall } from "../../../../../lib/server/import-call.ts";
import { runtimeForConversation } from "../../../../../lib/server/runtime.ts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Pull the finished conversation, store turns, fetch the MP3 when there is consent, run the post-call jobs. Idempotent. */
export const POST = handle(async (_req: Request, ctx: { params: Promise<{ conversationId: string }> }) => {
  const { conversationId } = await ctx.params;
  if (!/^[A-Za-z0-9_-]{4,200}$/.test(conversationId)) throw new HttpError(400, "Bad conversation id");
  // the call is fetched from the account it ran on (key 1 or key 2)
  const result = await importCall(await runtimeForConversation(conversationId), conversationId);
  return json(result);
});
