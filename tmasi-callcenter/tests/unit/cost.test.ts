import { describe, it, expect } from "vitest";
import { elevenLabsCost, llmCost } from "../../packages/core/src/cost.ts";

describe("elevenLabsCost", () => {
  it("is free inside included minutes", () => {
    expect(elevenLabsCost(15, "free")).toBe(0);
    expect(elevenLabsCost(275, "creator")).toBe(0);
  });
  it("charges $0.08 per minute beyond included", () => {
    expect(elevenLabsCost(25, "free")).toBeCloseTo(0.8);
    expect(elevenLabsCost(375, "creator")).toBeCloseTo(8);
  });
});

describe("llmCost", () => {
  it("prices plain input and output", () => {
    expect(llmCost("claude-opus-5-5", { input_tokens: 1_000_000, output_tokens: 1_000_000 })).toBeCloseTo(24);
    expect(llmCost("claude-sonnet-5-5", { input_tokens: 1_000_000, output_tokens: 1_000_000 })).toBeCloseTo(12);
    expect(llmCost("claude-haiku-5-5", { input_tokens: 1_000_000, output_tokens: 1_000_000 })).toBeCloseTo(0.6);
  });
  it("prices cache reads at 0.1x and writes at 1.25x input", () => {
    const c = llmCost("claude-opus-5-5", {
      input_tokens: 0,
      output_tokens: 0,
      cache_read_input_tokens: 1_000_000,
      cache_creation_input_tokens: 1_000_000,
    });
    expect(c).toBeCloseTo(4 * 0.1 + 4 * 1.25);
  });
  it("throws for an unknown model", () => {
    expect(() => llmCost("nope", { input_tokens: 1, output_tokens: 1 })).toThrow();
  });
});
