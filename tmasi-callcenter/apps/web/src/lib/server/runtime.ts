import { ElevenLabsRuntime, MissingApiKeyError, type VoiceRuntime } from "@tc/voice";
import { ACCOUNTS, activeAccount, keyFor, type Account } from "./accounts.ts";

const KEY = Symbol.for("tc.runtime.override");
const g = globalThis as unknown as Record<symbol, VoiceRuntime | undefined>;

/** The voice runtime of one account (default: the active one). Throws MissingApiKeyError when that account has no key. */
export function getRuntime(account: Account = activeAccount()): VoiceRuntime {
  const o = g[KEY];
  if (o) return o;
  const apiKey = keyFor(account);
  if (!apiKey) throw new MissingApiKeyError();
  return new ElevenLabsRuntime({ apiKey });
}

/**
 * The runtime of the account that holds a conversation: the active account first, then the other one.
 * A finished call is imported from the account it ran on, even after a switch.
 */
export async function runtimeForConversation(conversationId: string): Promise<VoiceRuntime> {
  const o = g[KEY];
  if (o) return o;
  const first = activeAccount();
  const order = [first, ...ACCOUNTS.filter((a) => a !== first)].filter((a) => keyFor(a));
  if (!order.length) throw new MissingApiKeyError();
  for (const a of order) {
    const rt = getRuntime(a);
    try {
      await rt.getConversation(conversationId);
      return rt;
    } catch (e) {
      const status = (e as { statusCode?: number; status?: number })?.statusCode ?? (e as { status?: number })?.status;
      if (status !== 404) throw e;
    }
  }
  // not found on any account: let the import report it from the active account
  return getRuntime(first);
}

/** Tests only: swap the runtime. Pass undefined to restore. */
export function setRuntimeForTests(rt: VoiceRuntime | undefined): void {
  g[KEY] = rt;
}
