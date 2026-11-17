// Post-call job: writes the judge result, summaries, gaps, and always leaves an urgent case after an emergency.
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { PostCallResult } from "../../packages/llm/src/postcall-prompt.ts";

const dir = mkdtempSync(join(tmpdir(), "tc-postcall-"));
process.env.DATA_DIR = dir;

let db: typeof import("../../packages/db/src/index.ts");
let runPostCall: typeof import("../../packages/llm/src/postcall.ts").runPostCall;

const result = (over: Partial<PostCallResult> = {}): PostCallResult => ({
  summary_en: "Caller asked about a check-up in Hurghada.",
  summary_caller_lang: "Der Anrufer fragte nach einem Check-up in Hurghada.",
  caller_main_lang: "de",
  langs_used: ["de", "en"],
  case_fields: { name: "Anna", country: "DE", phone: null, email: null, interest: "check-up", preferred_contact_time: null, sensitive_note: null },
  emergency: false,
  judge: {
    ai_disclosed: true, consent_asked: true, recording_consent: true, readback_done: true,
    turns: [{ turn_idx: 2, reply_lang_ok: true, claims: [{ text: "Hub in Hurghada", supported: true, src: "[src:offices-en#1]" }], policy_flags: [] }],
    repeated_questions: [], fact_ok: true, policy_ok: true, lang_ok: true, memory_ok: true, pass: true, score: 1, rationale: "clean",
  },
  gaps: [{ question: "How much is a check-up?", lang: "de", turn_idx: 3 }],
  ...over,
});

const fakeLlm = (r: PostCallResult) => ({
  structured: async () => ({ data: r as any, usage: { input_tokens: 5000, output_tokens: 800, cache_read_input_tokens: 2000, cache_creation_input_tokens: 0 } }),
});
const fakeKb = { search: async () => [{ docId: "d", src: "offices-en#1", text: "[src:offices-en#1] Egypt, Hurghada", score: 0.9 }] };

async function seedCall(callerText: string) {
  const d = await db.getDb();
  const [call] = await d.insert(db.calls).values({ elConversationId: `conv-${Math.random()}`, status: "imported" }).returning();
  await d.insert(db.turns).values([
    { callId: call!.id, idx: 0, role: "agent", text: "Hallo, ich bin Lena, die KI-Assistentin von TMASI Global. Darf ich aufzeichnen?", lang: "de" },
    { callId: call!.id, idx: 1, role: "caller", text: callerText, lang: "de" },
    { callId: call!.id, idx: 2, role: "agent", text: "Unser Hauptsitz ist in Hurghada am Roten Meer, mit einem Team rund um die Uhr.", lang: "de" },
    { callId: call!.id, idx: 3, role: "caller", text: "Was kostet ein Check-up?", lang: "de" },
  ]);
  return call!.id;
}

beforeAll(async () => {
  db = await import("../../packages/db/src/index.ts");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  await migrate(await db.getDb(), { migrationsFolder: join(__dirname, "..", "..", "packages", "db", "drizzle") });
  ({ runPostCall } = await import("../../packages/llm/src/postcall.ts"));
});

afterAll(async () => {
  await db.closeDb();
  rmSync(dir, { recursive: true, force: true });
});

describe("runPostCall", () => {
  it("writes the judge result, cost and gaps", async () => {
    const callId = await seedCall("Ja, gerne. Ich interessiere mich für ein Check-up.");
    const r = await runPostCall(callId, { llm: fakeLlm(result()), kb: fakeKb as any, model: "claude-haiku-5-5" });
    expect(r?.judge.pass).toBe(true);
    const d = await db.getDb();
    const { eq } = await import("drizzle-orm");
    const [call] = await d.select().from(db.calls).where(eq(db.calls.id, callId));
    expect(call!.judgePass).toBe(true);
    expect(Number(call!.judgeScore)).toBe(1);
    expect(Number(call!.llmCostUsd)).toBeGreaterThan(0);
    const gaps = await d.select().from(db.kbGaps).where(eq(db.kbGaps.callId, callId));
    expect(gaps.map((g) => g.question)).toEqual(["How much is a check-up?"]);
    // re-run replaces open gaps instead of duplicating them
    await runPostCall(callId, { llm: fakeLlm(result()), kb: fakeKb as any, model: "claude-haiku-5-5" });
    expect((await d.select().from(db.kbGaps).where(eq(db.kbGaps.callId, callId))).length).toBe(1);
  });

  it("opens an urgent case after an emergency even if the model missed it", async () => {
    const callId = await seedCall("Ich habe gerade starke Brustschmerzen.");
    await runPostCall(callId, { llm: fakeLlm(result({ emergency: false, gaps: [] })), kb: fakeKb as any, model: "claude-haiku-5-5" });
    const d = await db.getDb();
    const { eq } = await import("drizzle-orm");
    const found = await d.select().from(db.cases).where(eq(db.cases.callId, callId));
    expect(found).toHaveLength(1);
    expect(found[0]).toMatchObject({ type: "urgent", priority: "urgent" });
  });

  it("skips cleanly without an Anthropic key", async () => {
    const saved = process.env.ANTHROPIC_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
    const callId = await seedCall("Hallo");
    expect(await runPostCall(callId)).toBeNull();
    if (saved) process.env.ANTHROPIC_API_KEY = saved;
  });
});
