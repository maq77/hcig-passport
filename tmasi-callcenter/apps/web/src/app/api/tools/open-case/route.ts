import { handle, json } from "../../../../lib/server/http.ts";
import { openCase, parseToolRequest } from "../../../../lib/server/tools.ts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Client tool open_case. Body: { callId, toolToken, lang?, ...args }. 403 on a wrong token, 400 on bad args. */
export const POST = handle(async (req: Request) => {
  const env = await parseToolRequest(req);
  return json(await openCase(env));
});
