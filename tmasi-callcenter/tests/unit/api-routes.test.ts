// Route handlers: validation (400), tool-token check (403), the happy paths, with a temporary DATA_DIR and a mocked runtime.
import { mkdtempSync, rmSync, existsSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { NeutralConversation, VoiceRuntime } from "../../packages/voice/src/index.ts";

const dir = mkdtempSync(join(tmpdir(), "tc-api-"));
process.env.DATA_DIR = dir;
delete process.env.ELEVENLABS_API_KEY;
delete process.env.ELEVENLABS_AGENT_ID;
process.env.AUTH_SECRET = "test-secret";

type Handler = (req: Request, ctx?: { params: Promise<Record<string, string>> }) => Promise<Response>;
let routes: Record<string, Handler>;
let setRuntime: (rt: VoiceRuntime | undefined) => void;
let closeDb: () => Promise<void>;

const post = (url: string, body: unknown) => new Request(`http://x${url}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
const params = (p: Record<string, string>) => ({ params: Promise.resolve(p) });

const conversation: NeutralConversation = {
  id: "conv_test_1",
  status: "done",
  startedAt: new Date("2026-11-17T10:00:00Z"),
  durationS: 61,
  transcript: [
    { role: "agent", text: "Hello, I'm Emma.", timeInCallSecs: 0, latencyMs: 700, interrupted: false, toolCalls: [], toolResults: [] },
    { role: "caller", text: "Yes, that is fine.", timeInCallSecs: 6, latencyMs: null, interrupted: false, toolCalls: [], toolResults: [] },
    {
      role: "agent",
      text: "Wunderbar.",
      timeInCallSecs: 9,
      latencyMs: 820,
      interrupted: false,
      toolCalls: [{ name: "language_detection", args: { language: "de" }, requestId: "r0" }],
      toolResults: [],
    },
    {
      role: "agent",
      text: "Noted.",
      timeInCallSecs: 12,
      latencyMs: null,
      interrupted: false,
      toolCalls: [{ name: "save_note", args: { key: "name", value: "Anna" }, requestId: "r1" }],
      toolResults: [{ name: "save_note", result: { ok: true }, isError: false, latencyS: 0.05 }],
    },
  ],
  metadata: { terminationReason: "client disconnected", mainLanguage: "en", hasAudio: true, dynamicVariables: null },
  analysis: { summary: "s", title: "t", successful: "success" },
  dataCollection: {},
  evaluation: { ai_disclosed: { result: "success", rationale: null } },
  cost: 10,
};

let tokenCount = 0;
const fakeRuntime: VoiceRuntime = {
  pushAgent: async () => ({ agentId: "agent_x", created: true }),
  getConversationToken: async () => ({ kind: "webrtc", token: "jwt-token", conversationId: `conv_test_${++tokenCount}` }),
  getConversation: async () => conversation,
  getAudio: async () => Buffer.from([1, 2, 3]),
  deleteConversation: async () => {},
  uploadKnowledgeText: async () => "doc",
  deleteKnowledge: async () => {},
  listVoices: async () => [],
};

beforeAll(async () => {
  const db = await import("../../packages/db/src/index.ts");
  closeDb = db.closeDb;
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  await migrate(await db.getDb(), { migrationsFolder: join(__dirname, "..", "..", "packages", "db", "drizzle") });
  const rt = await import("../../apps/web/src/lib/server/runtime.ts");
  setRuntime = rt.setRuntimeForTests;
  routes = {
    token: (await import("../../apps/web/src/app/api/el/token/route.ts")).POST as Handler,
    lead: (await import("../../apps/web/src/app/api/tools/capture-lead/route.ts")).POST as Handler,
    openCase: (await import("../../apps/web/src/app/api/tools/open-case/route.ts")).POST as Handler,
    switch: (await import("../../apps/web/src/app/api/tools/switch-persona/route.ts")).POST as Handler,
    csat: (await import("../../apps/web/src/app/api/tools/csat/route.ts")).POST as Handler,
    note: (await import("../../apps/web/src/app/api/tools/save-note/route.ts")).POST as Handler,
    link: (await import("../../apps/web/src/app/api/calls/link/route.ts")).POST as Handler,
    import: (await import("../../apps/web/src/app/api/calls/import/[conversationId]/route.ts")).POST as Handler,
    getCall: (await import("../../apps/web/src/app/api/calls/[id]/route.ts")).GET as Handler,
    getNotes: (await import("../../apps/web/src/app/api/calls/[id]/notes/route.ts")).GET as Handler,
  };
}, 120_000);

afterAll(async () => {
  setRuntime?.(undefined);
  await closeDb?.();
  rmSync(dir, { recursive: true, force: true });
});

let callId = "";
let toolToken = "";

describe("POST /api/el/token", () => {
  it("returns 503 with the clear message when the key is missing", async () => {
    const res = await routes.token!(post("/api/el/token", { lang: "en", gender: "female" }));
    expect(res.status).toBe(503);
    const j = await res.json();
    expect(j.error).toBe("Add ELEVENLABS_API_KEY to tmasi-callcenter/.env.local");
    expect(j.code).toBe("missing_api_key");
  });

  it("returns 400 on bad input", async () => {
    setRuntime(fakeRuntime);
    expect((await routes.token!(post("/api/el/token", { lang: "en", gender: "robot" }))).status).toBe(400);
    expect((await routes.token!(new Request("http://x/api/el/token", { method: "POST", body: "not json" }))).status).toBe(400);
  });

  it("asks for agent:push when there is no agent id", async () => {
    setRuntime(fakeRuntime);
    const res = await routes.token!(post("/api/el/token", { lang: "de", gender: "male" }));
    expect(res.status).toBe(503);
    expect((await res.json()).code).toBe("no_agent");
  });

  it("picks the persona, creates a live call and mints a tool token", async () => {
    setRuntime(fakeRuntime);
    writeFileSync(join(dir, "agent.json"), JSON.stringify({ agentId: "agent_x" }));
    const res = await routes.token!(post("/api/el/token", { lang: "de", gender: "male" }));
    expect(res.status).toBe(200);
    const j = await res.json();
    expect(j.conversationToken).toBe("jwt-token");
    expect(j.persona).toMatchObject({ label: "DE_M", displayName: "Jonas", lang: "de" });
    expect(j.firstMessage).toContain("Jonas");
    expect(j.firstMessage).not.toContain("{{persona_name}}");
    expect(j.dynamicVariables.persona_name).toBe("Jonas");
    expect(j.dynamicVariables.emergency_line).toContain("112");
    expect(j.callId).toMatch(/^[0-9a-f-]{36}$/);
    expect(j.toolToken).toMatch(/^[0-9a-f]{64}$/);
    callId = j.callId;
    toolToken = j.toolToken;
  });

  it("falls back to English for an unknown language", async () => {
    const res = await routes.token!(post("/api/el/token", { lang: "xx", gender: "female" }));
    expect((await res.json()).persona.label).toBe("EN_F");
  });
});

describe("tool routes", () => {
  const lead = { name: "Anna Weber", country: "DE", lang: "de", phone: "00 49 170 935 0490", interest: "Knee check and a week by the sea" };

  it("reject a wrong or missing tool token with 403", async () => {
    for (const [name, body] of [
      ["lead", lead],
      ["openCase", { contact_id: "x", type: "lead", interest: "i" }],
      ["switch", { gender: "female", lang: "de" }],
      ["csat", { score: 5 }],
      ["note", { key: "name", value: "A" }],
    ] as const) {
      expect((await routes[name]!(post("/x", { ...body, callId, toolToken: "wrong" }))).status).toBe(403);
      expect((await routes[name]!(post("/x", { ...body, callId }))).status).toBe(403);
    }
    // a token of another call does not work either
    expect((await routes.csat!(post("/x", { score: 5, callId: "0197f0a0-0000-7000-8000-000000000000", toolToken }))).status).toBe(403);
  });

  it("return 400 on invalid args (and unknown fields)", async () => {
    expect((await routes.lead!(post("/x", { callId, toolToken, name: "A", country: "DE", lang: "de", interest: "x" }))).status).toBe(400); // no phone or email
    expect((await routes.lead!(post("/x", { callId, toolToken, ...lead, surprise: 1 }))).status).toBe(400);
    expect((await routes.csat!(post("/x", { callId, toolToken, score: 9 }))).status).toBe(400);
    expect((await routes.note!(post("/x", { callId, toolToken, key: "nope", value: "v" }))).status).toBe(400);
    expect((await routes.openCase!(post("/x", { callId, toolToken, contact_id: "not-a-uuid", type: "lead", interest: "i" }))).status).toBe(400);
  });

  it("capture_lead upserts on phone, then on email, and flags a returning caller", async () => {
    const first = await (await routes.lead!(post("/x", { callId, toolToken, ...lead }))).json();
    expect(first).toMatchObject({ ok: true, returning: false });
    const again = await (await routes.lead!(post("/x", { callId, toolToken, ...lead, phone: "+49 170 9350490", name: "Anna W." }))).json();
    expect(again).toMatchObject({ ok: true, returning: true, contact_id: first.contact_id });
    const byEmail = await (await routes.lead!(post("/x", { callId, toolToken, name: "Ben", country: "PL", lang: "pl", email: "ben@example.com", interest: "x" }))).json();
    expect(byEmail.returning).toBe(false);
    const again2 = await (await routes.lead!(post("/x", { callId, toolToken, name: "Ben K", country: "PL", lang: "pl", email: "ben@example.com", interest: "x" }))).json();
    expect(again2).toMatchObject({ returning: true, contact_id: byEmail.contact_id });
    (globalThis as Record<string, unknown>).__contactId = first.contact_id;
  });

  it("open_case forces urgent priority and returns a localised line", async () => {
    const contact_id = (globalThis as Record<string, unknown>).__contactId as string;
    const res = await (await routes.openCase!(post("/x", { callId, toolToken, contact_id, type: "urgent", interest: "chest pain", priority: "normal" }))).json();
    expect(res.ok).toBe(true);
    expect(res.case_id).toBeTruthy();
    expect(res.say).toBe("Ein Koordinator wird sich bald bei Ihnen melden."); // call started on the DE line
    const ru = await (await routes.openCase!(post("/x", { callId, toolToken, ctxLang: "ru", contact_id, type: "lead", interest: "x" }))).json();
    expect(ru.say).toContain("Координатор");
    const { cases, getDb } = await import("../../packages/db/src/index.ts");
    const rows = await (await getDb()).select().from(cases);
    expect(rows.find((r) => r.id === res.case_id)!.priority).toBe("urgent");
    expect(rows.find((r) => r.id === ru.case_id)!.priority).toBe("normal");
  });

  it("switch_persona returns the other gender in the starting language", async () => {
    const res = await (await routes.switch!(post("/x", { callId, toolToken, gender: "female", lang: "en" }))).json();
    expect(res).toEqual({ ok: true, label: "woman", display_name: "Lena" });
  });

  it("csat stores 1 to 5 and save_note feeds the notes endpoint", async () => {
    expect((await (await routes.csat!(post("/x", { callId, toolToken, score: 4 }))).json()).ok).toBe(true);
    expect((await (await routes.note!(post("/x", { callId, toolToken, key: "need", value: "knee check" }))).json()).ok).toBe(true);
    const notes = await (await routes.getNotes!(new Request("http://x"), params({ id: callId }))).json();
    expect(notes.notes.map((n: { key: string; value: string }) => `${n.key}:${n.value}`)).toContain("need:knee check");
    const full = await (await routes.getCall!(new Request("http://x"), params({ id: callId }))).json();
    expect(full.call.csat).toBe(4);
    expect(full.cases.length).toBeGreaterThanOrEqual(2);
    expect(full.contact.name).toBeTruthy();
  });

  it("GET /api/calls/:id is 404 for an unknown call and 400 for a bad id", async () => {
    expect((await routes.getCall!(new Request("http://x"), params({ id: "0197f0a0-0000-7000-8000-000000000000" }))).status).toBe(404);
    expect((await routes.getCall!(new Request("http://x"), params({ id: "nope" }))).status).toBe(400);
  });
});

describe("link and import", () => {
  it("link needs the tool token and stores the conversation id", async () => {
    expect((await routes.link!(post("/x", { callId, conversationId: "conv_test_1", toolToken: "bad" }))).status).toBe(403);
    expect((await routes.link!(post("/x", { callId, toolToken }))).status).toBe(400);
    const ok = await routes.link!(post("/x", { callId, conversationId: "conv_test_1", toolToken }));
    expect(ok.status).toBe(200);
  });

  it("import stores turns, the recording, and is idempotent", async () => {
    const run = async () => (await routes.import!(post("/x", {}), params({ conversationId: "conv_test_1" }))).json();
    const r1 = await run();
    expect(r1).toMatchObject({ ok: true, status: "imported", turns: 6, recordingConsent: true, consentBasis: "caller_agreed" });
    expect(r1.recordingPath).toMatch(/^recordings\/\d{4}\/\d{2}\/.+\.mp3$/);
    expect(existsSync(join(dir, r1.recordingPath))).toBe(true);
    const r2 = await run();
    expect(r2.turns).toBe(6);
    const full = await (await routes.getCall!(new Request("http://x"), params({ id: callId }))).json();
    expect(full.turns).toHaveLength(6);
    expect(full.turns.map((t: { role: string }) => t.role)).toEqual(["agent", "caller", "agent", "tool", "agent", "tool"]);
    expect(full.turns[2].lang).toBe("de"); // language_detection tool call names the language before the reply
    expect(full.turns[0].latencyMs).toBe(700);
    expect(full.turns[3]).toMatchObject({ toolName: "language_detection", toolArgs: { language: "de" } });
    expect(full.turns[5]).toMatchObject({ toolName: "save_note", toolArgs: { key: "name", value: "Anna" }, toolResult: { ok: true } });
    expect(full.call.status).toBe("imported");
    expect(full.call.durationS).toBe(61);
    expect(full.call.langsSeen).toEqual(["de"]);
  });

  it("import without a key is a clean 503", async () => {
    setRuntime(undefined);
    const res = await routes.import!(post("/x", {}), params({ conversationId: "conv_other_1" }));
    expect(res.status).toBe(503);
    expect((await res.json()).error).toContain("ELEVENLABS_API_KEY");
  });

  it("does not store audio when the caller declined recording", async () => {
    const { guessRecordingConsent } = await import("../../apps/web/src/lib/server/import-call.ts");
    const declined = { ...conversation, transcript: [conversation.transcript[0]!, { ...conversation.transcript[1]!, text: "No, please do not record." }] };
    expect(guessRecordingConsent(declined)).toEqual({ consent: false, basis: "caller_declined" });
    expect(guessRecordingConsent(conversation).consent).toBe(true);
    const viaData = { ...conversation, dataCollection: { recording_consent: { value: false, rationale: null } } };
    expect(guessRecordingConsent(viaData)).toEqual({ consent: false, basis: "data_collection" });
  });

  it("keeps no audio when the consent answer is unclear (safe default)", async () => {
    const { guessRecordingConsent } = await import("../../apps/web/src/lib/server/import-call.ts");
    const unclear = { ...conversation, transcript: [conversation.transcript[0]!, { ...conversation.transcript[1]!, text: "I need help with a knee operation in Hurghada." }] };
    expect(guessRecordingConsent(unclear)).toEqual({ consent: false, basis: "unclear" });
    const silent = { ...conversation, transcript: [conversation.transcript[0]!] };
    expect(guessRecordingConsent(silent)).toEqual({ consent: false, basis: "unclear" });
  });
});
