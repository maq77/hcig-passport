import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import type { LlmProvider, StructuredOptions, StructuredResult } from "./provider.ts";

export const DEFAULT_POSTCALL_MODEL = "claude-opus-5-5";
export const MAX_TOKENS = 16000;

export class LlmError extends Error {
  constructor(
    message: string,
    readonly kind: "rate_limit" | "api" | "parse" | "refusal" | "truncated",
    readonly status?: number,
    readonly requestId?: string | null,
  ) {
    super(message);
    this.name = "LlmError";
  }
}

/** The slice of the SDK this provider uses, so tests can pass a mock. */
export interface AnthropicLike {
  messages: { create(params: any, options?: any): Promise<any> };
}

export class AnthropicProvider implements LlmProvider {
  private readonly client: AnthropicLike;
  private readonly defaultModel: string;

  constructor(opts: { client?: AnthropicLike; apiKey?: string; model?: string } = {}) {
    this.client =
      opts.client ?? (new Anthropic({ apiKey: opts.apiKey ?? process.env.ANTHROPIC_API_KEY }) as unknown as AnthropicLike);
    this.defaultModel = opts.model ?? process.env.LLM_POSTCALL_MODEL ?? DEFAULT_POSTCALL_MODEL;
  }

  async structured<T>(opts: StructuredOptions<T>): Promise<StructuredResult<T>> {
    const jsonSchema = z.toJSONSchema(opts.schema) as Record<string, unknown>;
    delete jsonSchema["$schema"];
    const system = [
      {
        type: "text" as const,
        text: opts.system,
        ...(opts.cacheSystem ? { cache_control: { type: "ephemeral" as const } } : {}),
      },
    ];

    let msg: any;
    try {
      msg = await this.client.messages.create({
        model: opts.model ?? this.defaultModel,
        max_tokens: MAX_TOKENS,
        system,
        messages: [{ role: "user", content: opts.prompt }],
        output_config: { format: { type: "json_schema", schema: jsonSchema } },
      });
    } catch (e) {
      if (e instanceof Anthropic.RateLimitError) {
        throw new LlmError(`Rate limited by the API: ${e.message}`, "rate_limit", e.status, e.requestID);
      }
      if (e instanceof Anthropic.APIError) {
        throw new LlmError(`Anthropic API error ${e.status ?? ""}: ${e.message}`, "api", e.status, e.requestID);
      }
      throw e;
    }

    if (msg.stop_reason === "refusal") throw new LlmError("The model refused the request", "refusal");
    if (msg.stop_reason === "max_tokens") throw new LlmError("The output was cut off at max_tokens", "truncated");

    const block = (msg.content as Array<{ type: string; text?: string }>).find((b) => b.type === "text");
    if (!block?.text) throw new LlmError("The response had no text block", "parse");
    let raw: unknown;
    try {
      raw = JSON.parse(block.text);
    } catch {
      throw new LlmError("The response was not valid JSON", "parse");
    }
    const parsed = opts.schema.safeParse(raw);
    if (!parsed.success) throw new LlmError(`The response did not match the schema: ${parsed.error.message}`, "parse");

    const u = msg.usage ?? {};
    return {
      data: parsed.data,
      usage: {
        input_tokens: u.input_tokens ?? 0,
        output_tokens: u.output_tokens ?? 0,
        cache_read_input_tokens: u.cache_read_input_tokens ?? 0,
        cache_creation_input_tokens: u.cache_creation_input_tokens ?? 0,
      },
    };
  }
}
