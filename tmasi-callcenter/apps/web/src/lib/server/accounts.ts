// Two ElevenLabs accounts (his order 2026-11-17: "add this api key as second when i tell you to switch or when
// credits of key 1 finish"). Each account has its own key, its own copy of the agent and of the knowledge base.
// The active account lives in data/active-account.json (written by `npm run key:use -- 2` or by the auto switch);
// without that file ELEVENLABS_ACTIVE_KEY decides, else account 1.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { dataDir, writeAudit } from "@tc/db";

export type Account = "1" | "2";
export const ACCOUNTS: Account[] = ["1", "2"];

/** Below this many credits (about 2 minutes of a call) a new call starts on the other account. */
export const LOW_CREDITS = 1600;

const KEY_VAR: Record<Account, string> = { "1": "ELEVENLABS_API_KEY", "2": "ELEVENLABS_API_KEY_2" };

export function keyFor(a: Account): string | undefined {
  const v = process.env[KEY_VAR[a]];
  return v && v.trim() ? v.trim() : undefined;
}

export const otherAccount = (a: Account): Account => (a === "1" ? "2" : "1");

const activeFile = () => join(dataDir(), "active-account.json");

export function activeAccount(): Account {
  try {
    if (existsSync(activeFile())) {
      const a = (JSON.parse(readFileSync(activeFile(), "utf8")) as { account?: string }).account;
      if ((a === "1" || a === "2") && keyFor(a)) return a;
    }
  } catch {
    /* fall through to env */
  }
  const env = process.env.ELEVENLABS_ACTIVE_KEY;
  if ((env === "1" || env === "2") && keyFor(env)) return env;
  return "1";
}

export async function setActiveAccount(a: Account, reason: string): Promise<void> {
  mkdirSync(dataDir(), { recursive: true });
  writeFileSync(activeFile(), JSON.stringify({ account: a, reason, at: new Date().toISOString() }, null, 2) + "\n");
  await writeAudit(null, "account.switch", "accounts", a, null, { account: a, reason }).catch(() => {});
}

export const agentFileName = (a: Account) => (a === "1" ? "agent.json" : `agent-${a}.json`);

/** The agent id of one account, or null when that account has no agent yet (run `npm run agent:push -- --account 2`). */
export function agentIdFor(a: Account): string | null {
  const f = join(dataDir(), agentFileName(a));
  if (existsSync(f)) {
    try {
      const id = (JSON.parse(readFileSync(f, "utf8")) as { agentId?: string }).agentId;
      if (id) return id;
    } catch {
      /* none */
    }
  }
  if (a === "1" && process.env.ELEVENLABS_AGENT_ID) return process.env.ELEVENLABS_AGENT_ID;
  return null;
}

const creditCache = new Map<Account, { at: number; left: number | null }>();

/** Credits left this month on one account (cached 30 s). Null when unknown (no key, network error). */
export async function creditsLeft(a: Account, fetchImpl: typeof fetch = fetch): Promise<number | null> {
  const hit = creditCache.get(a);
  if (hit && Date.now() - hit.at < 30_000) return hit.left;
  const key = keyFor(a);
  if (!key) return null;
  let left: number | null = null;
  try {
    const r = await fetchImpl("https://api.elevenlabs.io/v1/user/subscription", { headers: { "xi-api-key": key } });
    if (r.ok) {
      const j = (await r.json()) as { character_count?: number; character_limit?: number };
      if (typeof j.character_count === "number" && typeof j.character_limit === "number") left = j.character_limit - j.character_count;
    }
  } catch {
    left = null;
  }
  creditCache.set(a, { at: Date.now(), left });
  return left;
}

/** Tests only. */
export function clearCreditCache(): void {
  creditCache.clear();
}

/**
 * The account a new call should use. Stays on the active account unless its credits are below LOW_CREDITS and the
 * other account has a key, an agent and enough credits; then it switches (persisted) and says why.
 */
export async function accountForNewCall(fetchImpl: typeof fetch = fetch): Promise<{ account: Account; switched: boolean; reason?: string }> {
  const a = activeAccount();
  const left = await creditsLeft(a, fetchImpl);
  if (left === null || left >= LOW_CREDITS) return { account: a, switched: false };
  const b = otherAccount(a);
  if (!keyFor(b) || !agentIdFor(b)) return { account: a, switched: false };
  const leftB = await creditsLeft(b, fetchImpl);
  if (leftB === null || leftB < LOW_CREDITS) return { account: a, switched: false };
  const reason = `Account ${a} had ${left} credits left (below ${LOW_CREDITS}); switched to account ${b} with ${leftB}.`;
  await setActiveAccount(b, reason);
  return { account: b, switched: true, reason };
}
