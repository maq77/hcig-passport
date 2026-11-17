// Splits a built KB doc into chunks of about 400 tokens (words * 1.3) with 15% overlap.
// A [src:...] tag is never split, and every chunk starts with the tag of its first paragraph.
import { splitSentences } from "./build.ts";

export interface Chunk {
  idx: number;
  text: string;
  tokens: number;
}

export const TARGET_TOKENS = 400;
export const OVERLAP_RATIO = 0.15;

export const estimateTokens = (s: string): number => Math.ceil(s.split(/\s+/).filter(Boolean).length * 1.3);

const TAG = /^\[src:[^\]\s]+\]/;

interface Unit {
  text: string; // starts with a src tag
  tokens: number;
}

export function chunkMarkdown(md: string, target = TARGET_TOKENS): Chunk[] {
  // drop a front-matter block if present
  const body = md.replace(/^---\n[\s\S]*?\n---\n/, "");
  const units: Unit[] = [];
  let heading = "";
  let headingPending = false;
  for (const block of body.split(/\n\s*\n/)) {
    const t = block.trim();
    if (!t) continue;
    const hm = /^#{1,6}\s+(.*)$/.exec(t);
    if (hm) {
      heading = hm[1]!.trim();
      headingPending = true;
      continue;
    }
    const tm = TAG.exec(t);
    if (!tm) continue; // text without a tag is not citable
    const tag = tm[0];
    let rest = t.slice(tag.length).trim();
    if (headingPending && heading) rest = `${heading}: ${rest}`;
    headingPending = false;
    const full = `${tag} ${rest}`;
    if (estimateTokens(full) <= target) {
      units.push({ text: full, tokens: estimateTokens(full) });
      continue;
    }
    // oversized paragraph: pack sentences into pieces, each piece repeats the tag
    let cur: string[] = [];
    const flush = () => {
      if (!cur.length) return;
      const text = `${tag} ${cur.join(" ")}`;
      units.push({ text, tokens: estimateTokens(text) });
      cur = [];
    };
    for (const s of splitSentences(rest)) {
      const next = [...cur, s].join(" ");
      if (cur.length && estimateTokens(`${tag} ${next}`) > target) flush();
      cur.push(s);
    }
    flush();
  }

  const chunks: Chunk[] = [];
  const overlapBudget = Math.floor(target * OVERLAP_RATIO);
  let i = 0;
  let prevStart = -1;
  while (i < units.length) {
    let start = i;
    // carry trailing units of the previous chunk as overlap
    if (chunks.length) {
      let acc = 0;
      let k = i;
      while (k - 1 > prevStart && acc + units[k - 1]!.tokens <= overlapBudget) {
        acc += units[k - 1]!.tokens;
        k--;
      }
      start = k;
    }
    let total = 0;
    let end = start;
    while (end < units.length && (end === start || total + units[end]!.tokens <= target)) {
      total += units[end]!.tokens;
      end++;
    }
    if (end <= i) end = i + 1; // always make progress
    const text = units.slice(start, end).map((u) => u.text).join("\n\n");
    chunks.push({ idx: chunks.length, text, tokens: estimateTokens(text) });
    prevStart = start;
    i = end;
  }
  return chunks;
}
