import { ElevenLabsRuntime, MissingApiKeyError, type VoiceRuntime } from "@tc/voice";

const KEY = Symbol.for("tc.runtime.override");
const g = globalThis as unknown as Record<symbol, VoiceRuntime | undefined>;

/** The voice runtime. Throws MissingApiKeyError when ELEVENLABS_API_KEY is not set (and no test runtime is installed). */
export function getRuntime(): VoiceRuntime {
  const o = g[KEY];
  if (o) return o;
  if (!ElevenLabsRuntime.hasKey()) throw new MissingApiKeyError();
  return new ElevenLabsRuntime();
}

/** Tests only: swap the runtime. Pass undefined to restore. */
export function setRuntimeForTests(rt: VoiceRuntime | undefined): void {
  g[KEY] = rt;
}
