import type { z } from "zod";

export interface LlmUsageInfo {
  input_tokens: number;
  output_tokens: number;
  cache_read_input_tokens?: number;
  cache_creation_input_tokens?: number;
}

export interface StructuredOptions<T> {
  system: string;
  prompt: string;
  schema: z.ZodType<T>;
  /** Mark the system prompt as cacheable (prompt caching). */
  cacheSystem: boolean;
  /** Overrides the provider default model. */
  model?: string;
}

export interface StructuredResult<T> {
  data: T;
  usage: LlmUsageInfo;
}

export interface LlmProvider {
  structured<T>(opts: StructuredOptions<T>): Promise<StructuredResult<T>>;
}
