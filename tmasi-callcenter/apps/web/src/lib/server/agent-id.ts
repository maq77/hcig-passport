import { HttpError } from "./http.ts";
import { activeAccount, agentIdFor, type Account } from "./accounts.ts";

/** Agent id of one account (default: the active one), written by `npm run agent:push` (data/agent.json, data/agent-2.json). */
export function readAgentId(account: Account = activeAccount()): string {
  const id = agentIdFor(account);
  if (id) return id;
  const cmd = account === "1" ? "npm run agent:push" : `npm run agent:push -- --account ${account}`;
  throw new HttpError(503, `No agent yet on account ${account}. Run \`${cmd}\` first.`, { code: "no_agent" });
}
