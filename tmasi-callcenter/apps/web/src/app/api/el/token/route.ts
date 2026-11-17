import { z } from "zod";
import { uuidv7 } from "@tc/core";
import { calls, getDb, writeAudit } from "@tc/db";
import { readAgentId } from "../../../../lib/server/agent-id.ts";
import { handle, json, readJsonObject } from "../../../../lib/server/http.ts";
import {
  DEFAULT_LANG,
  EMERGENCY_LINE,
  ensurePersonaRows,
  firstMessageFor,
  pickPersona,
  voiceIdFor,
} from "../../../../lib/server/personas.ts";
import { getRuntime } from "../../../../lib/server/runtime.ts";
import { mintToolToken } from "../../../../lib/server/tool-auth.ts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const body = z.object({ lang: z.string().min(2).max(12).default(DEFAULT_LANG), gender: z.enum(["female", "male"]).default("female") }).strict();

/** Start a test call: pick the persona, mint the ElevenLabs token server side, create the calls row and the per-call tool token. */
export const POST = handle(async (req: Request) => {
  const input = body.parse(await readJsonObject(req));
  const rt = getRuntime(); // 503 with the clear message when the key is missing
  const agentId = readAgentId();
  const persona = pickPersona(input.lang, input.gender);
  const access = await rt.getConversationToken(agentId);

  const ids = await ensurePersonaRows();
  const db = await getDb();
  const personaId = ids.get(persona.label) ?? null;
  const callId = uuidv7();
  const conversationId = access.kind === "webrtc" ? access.conversationId : null;
  await db.insert(calls).values({
    id: callId,
    // the real id arrives with /api/calls/link when the session connects (or now, when the token already carries it)
    elConversationId: conversationId ?? `pending-${callId}`,
    personaIdStart: personaId,
    personaIdEnd: personaId,
    status: "live",
    startedAt: new Date(),
  });
  await writeAudit(null, "call.start", "calls", callId, null, { persona: persona.label, lang: input.lang });

  return json({
    ok: true,
    ...(access.kind === "webrtc" ? { conversationToken: access.token, connectionType: "webrtc" } : { signedUrl: access.signedUrl, connectionType: "websocket" }),
    callId,
    toolToken: mintToolToken(callId),
    agentId,
    persona: { label: persona.label, displayName: persona.display_name, voiceId: voiceIdFor(persona), lang: persona.lang },
    firstMessage: firstMessageFor(persona.label, persona.display_name),
    dynamicVariables: { persona_name: persona.display_name, emergency_line: EMERGENCY_LINE },
  });
});
