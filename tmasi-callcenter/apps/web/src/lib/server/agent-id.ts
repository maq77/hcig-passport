import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { dataDir } from "@tc/db";
import { HttpError } from "./http.ts";

/** Agent id written by `npm run agent:push` (data/agent.json), or ELEVENLABS_AGENT_ID. */
export function readAgentId(): string {
  const f = join(dataDir(), "agent.json");
  if (existsSync(f)) {
    try {
      const id = (JSON.parse(readFileSync(f, "utf8")) as { agentId?: string }).agentId;
      if (id) return id;
    } catch {
      /* fall through */
    }
  }
  if (process.env.ELEVENLABS_AGENT_ID) return process.env.ELEVENLABS_AGENT_ID;
  throw new HttpError(503, "No agent yet. Run `npm run agent:push` first.", { code: "no_agent" });
}
