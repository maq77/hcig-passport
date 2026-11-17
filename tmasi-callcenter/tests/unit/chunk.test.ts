import { describe, expect, it } from "vitest";
import { chunkMarkdown, estimateTokens } from "../../packages/kb/src/chunk.ts";
import { stripAccreditation } from "../../packages/kb/src/build.ts";

const para = (n: number, words: number) => `[src:doc-en#${n}] ${Array.from({ length: words }, (_, i) => `w${n}x${i}`).join(" ")}.`;

describe("chunkMarkdown", () => {
  it("keeps small docs in one chunk starting with the first tag", () => {
    const c = chunkMarkdown(`# T\n\n${para(1, 20)}\n\n${para(2, 20)}`);
    expect(c).toHaveLength(1);
    expect(c[0]!.text.startsWith("[src:doc-en#1]")).toBe(true);
  });

  it("splits long docs near 400 tokens with overlap and every chunk starts with a tag", () => {
    const md = Array.from({ length: 40 }, (_, i) => para(i + 1, 40)).join("\n\n");
    const c = chunkMarkdown(md);
    expect(c.length).toBeGreaterThan(3);
    for (const ch of c) {
      expect(ch.text).toMatch(/^\[src:doc-en#\d+\]/);
      expect(ch.tokens).toBe(estimateTokens(ch.text));
      expect(ch.tokens).toBeLessThanOrEqual(440);
    }
    const first = /^\[src:doc-en#(\d+)\]/.exec(c[1]!.text)![1]!;
    expect(c[0]!.text).toContain(`[src:doc-en#${first}]`);
  });

  it("never splits a tag and repeats it on the pieces of an oversized paragraph", () => {
    const sentence = (i: number) => `Sentence ${i} has some plain words in it for counting.`;
    const big = `[src:big-en#1] ${Array.from({ length: 120 }, (_, i) => sentence(i)).join(" ")}`;
    const c = chunkMarkdown(big);
    expect(c.length).toBeGreaterThan(1);
    for (const ch of c) {
      expect(ch.text).toMatch(/^\[src:big-en#1\] /);
      expect(ch.text.match(/\[src:/g)!.length).toBe(1);
    }
  });

  it("is deterministic", () => {
    const md = Array.from({ length: 30 }, (_, i) => para(i + 1, 35)).join("\n\n");
    expect(chunkMarkdown(md)).toEqual(chunkMarkdown(md));
  });
});

describe("stripAccreditation", () => {
  it("drops only the sentence that mentions accreditation", () => {
    const r = stripAccreditation("Dr. Amr leads the team. The hospital is accredited by a body. We answer 24/7.");
    expect(r.kept).toBe("Dr. Amr leads the team. We answer 24/7.");
    expect(r.removed).toEqual(["The hospital is accredited by a body."]);
  });
  it("catches other languages", () => {
    expect(stripAccreditation("Das Krankenhaus ist akkreditiert.").kept).toBe("");
    expect(stripAccreditation("Hospital acreditado.").removed).toHaveLength(1);
  });
});
