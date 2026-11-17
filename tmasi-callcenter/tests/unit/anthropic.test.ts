import { describe, it, expect, vi } from "vitest";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { AnthropicProvider, LlmError } from "../../packages/llm/src/anthropic.ts";

const schema = z.object({ summary: z.string(), score: z.number() });
const ok = (text: string) => ({
  stop_reason: "end_turn",
  content: [{ type: "text", text }],
  usage: { input_tokens: 10, output_tokens: 5, cache_read_input_tokens: 100, cache_creation_input_tokens: 0 },
});

describe("AnthropicProvider", () => {
  it("sends json_schema output_config and cache_control on the system block, and parses the result", async () => {
    const create = vi.fn().mockResolvedValue(ok('{"summary":"hi","score":4}'));
    const p = new AnthropicProvider({ client: { messages: { create } }, model: "claude-opus-5-5" });
    const r = await p.structured({ system: "SYS", prompt: "P", schema, cacheSystem: true });
    expect(r.data).toEqual({ summary: "hi", score: 4 });
    expect(r.usage.cache_read_input_tokens).toBe(100);
    const params = create.mock.calls[0]![0];
    expect(params.model).toBe("claude-opus-5-5");
    expect(params.max_tokens).toBe(16000);
    expect(params.system[0].cache_control).toEqual({ type: "ephemeral" });
    expect(params.output_config.format.type).toBe("json_schema");
    expect(params.output_config.format.schema.properties.summary).toBeDefined();
  });

  it("omits cache_control when cacheSystem is false and honours a model override", async () => {
    const create = vi.fn().mockResolvedValue(ok('{"summary":"a","score":1}'));
    const p = new AnthropicProvider({ client: { messages: { create } } });
    await p.structured({ system: "S", prompt: "P", schema, cacheSystem: false, model: "claude-sonnet-5-5" });
    const params = create.mock.calls[0]![0];
    expect(params.system[0].cache_control).toBeUndefined();
    expect(params.model).toBe("claude-sonnet-5-5");
  });

  it("maps a rate limit error", async () => {
    const err = new Anthropic.RateLimitError(429, { type: "error" }, "slow down", new Headers());
    const p = new AnthropicProvider({ client: { messages: { create: vi.fn().mockRejectedValue(err) } } });
    await expect(p.structured({ system: "S", prompt: "P", schema, cacheSystem: false })).rejects.toMatchObject({
      name: "LlmError",
      kind: "rate_limit",
    });
  });

  it("rejects invalid JSON and schema mismatches", async () => {
    const bad = new AnthropicProvider({ client: { messages: { create: vi.fn().mockResolvedValue(ok("nope")) } } });
    await expect(bad.structured({ system: "S", prompt: "P", schema, cacheSystem: false })).rejects.toBeInstanceOf(LlmError);
    const mism = new AnthropicProvider({ client: { messages: { create: vi.fn().mockResolvedValue(ok('{"summary":1}')) } } });
    await expect(mism.structured({ system: "S", prompt: "P", schema, cacheSystem: false })).rejects.toMatchObject({ kind: "parse" });
  });

  it("reports truncation", async () => {
    const create = vi.fn().mockResolvedValue({ ...ok("{}"), stop_reason: "max_tokens" });
    const p = new AnthropicProvider({ client: { messages: { create } } });
    await expect(p.structured({ system: "S", prompt: "P", schema, cacheSystem: false })).rejects.toMatchObject({ kind: "truncated" });
  });
});
