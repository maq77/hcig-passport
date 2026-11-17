export type ElevenLabsPlan = "free" | "creator";

export const ELEVENLABS_PER_MIN_USD = 0.08;
export const INCLUDED_MINUTES: Record<ElevenLabsPlan, number> = { free: 15, creator: 275 };

/** Cost in USD of `minutes` of agent time: $0.08 per minute beyond the included minutes of the plan. */
export function elevenLabsCost(minutes: number, plan: ElevenLabsPlan): number {
  const billable = Math.max(0, minutes - INCLUDED_MINUTES[plan]);
  return billable * ELEVENLABS_PER_MIN_USD;
}

/** USD per million tokens. One place to edit, rechecked before purchase. */
export const PRICES = {
  "claude-opus-5-5": { input: 4, output: 20 },
  "claude-sonnet-5-5": { input: 2, output: 10 },
  "claude-haiku-5-5": { input: 0.1, output: 0.5 },
} as const;

export const CACHE_READ_MULT = 0.1;
export const CACHE_WRITE_MULT = 1.25;

export type LlmModelId = keyof typeof PRICES;

export interface LlmUsage {
  input_tokens: number;
  output_tokens: number;
  cache_read_input_tokens?: number;
  cache_creation_input_tokens?: number;
}

export function llmCost(model: string, usage: LlmUsage): number {
  const p = (PRICES as Record<string, { input: number; output: number }>)[model];
  if (!p) throw new Error(`No price configured for model "${model}"`);
  const read = usage.cache_read_input_tokens ?? 0;
  const write = usage.cache_creation_input_tokens ?? 0;
  const perTok = 1 / 1_000_000;
  return (
    usage.input_tokens * p.input * perTok +
    usage.output_tokens * p.output * perTok +
    read * p.input * CACHE_READ_MULT * perTok +
    write * p.input * CACHE_WRITE_MULT * perTok
  );
}
