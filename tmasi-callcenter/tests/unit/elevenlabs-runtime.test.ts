import { describe, expect, it, vi } from "vitest";
import { ElevenLabsRuntime, MISSING_KEY_MESSAGE, MissingApiKeyError, buildAgentBody, mapConversation, platformLang, toToolParameters } from "../../packages/voice/src/elevenlabs.ts";
import { buildAgentSpec, buildSupportedVoices, clientToolSpecs, composeSystemPrompt, allVoiceIdsEmpty, type PersonaEntry } from "../../packages/voice/src/spec.ts";
import config from "../../agent/agent.config.ts";
import personasJson from "../../agent/personas.json";
import firstMessages from "../../agent/prompts/first-messages.json";

const personas = (personasJson as { personas: PersonaEntry[] }).personas;

function spec(overrides: Partial<Parameters<typeof buildAgentSpec>[0]> = {}) {
  return buildAgentSpec({
    config,
    basePrompt: "You are {{persona_name}}.",
    coreFacts: { en: "---\nkind: core_facts\n---\n\n# TMASI Core Facts\n\nFacts here." },
    firstMessages: firstMessages as Record<string, string>,
    personas,
    voiceFallback: { female: "voice_f", male: "voice_m" },
    knowledge: [
      { elDocId: "doc_core", name: "Core facts (en)", usageMode: "prompt" },
      { elDocId: "doc_news", name: "News (de)", usageMode: "rag" },
    ],
    ...overrides,
  });
}

describe("agent spec", () => {
  it("appends core facts under the TMASI Core Facts heading and strips front matter", () => {
    const p = composeSystemPrompt("BASE", { en: "---\nk: v\n---\n\nHello facts" }, ["en", "de"]);
    expect(p).toContain("BASE");
    expect(p).toContain("## TMASI Core Facts");
    expect(p).toContain("Hello facts");
    expect(p).not.toContain("k: v");
  });

  it("skips personas without a voice id, and uses the gender fallback when given", () => {
    const some = personas.map((p) => (p.label === "EN_F" ? { ...p, el_voice_id: "abc" } : p));
    const strict = buildSupportedVoices(some, null);
    expect(strict).toEqual([expect.objectContaining({ label: "EN_F", voiceId: "abc" })]);
    expect(allVoiceIdsEmpty(personas)).toBe(true);
    const fb = buildSupportedVoices(personas, { female: "vf", male: "vm" });
    expect(fb).toHaveLength(20);
    expect(fb.find((v) => v.label === "DE_M")?.voiceId).toBe("vm");
  });

  it("generates JSON schemas for the five client tools; save_note does not wait", () => {
    const tools = clientToolSpecs(config);
    expect(tools.map((t) => t.name)).toEqual(["capture_lead", "open_case", "switch_persona", "end_call_csat", "save_note"]);
    expect(tools.find((t) => t.name === "save_note")!.waitForResponse).toBe(false);
    expect(tools.find((t) => t.name === "capture_lead")!.waitForResponse).toBe(true);
    const lead = toToolParameters(tools.find((t) => t.name === "capture_lead")!.parameters);
    expect(lead.required).toEqual(expect.arrayContaining(["name", "country", "lang", "interest"]));
    expect(Object.keys(lead.properties!)).toContain("sensitive_note");
  });
});

describe("buildAgentBody (vendor mapping)", () => {
  const body = buildAgentBody(spec());

  it("keeps the voice constant across languages: presets carry the language only", () => {
    const presets = body.conversationConfig.languagePresets!;
    expect(Object.keys(presets).sort()).toEqual(["ar", "cs", "de", "en", "es", "fr", "it", "pl", "ru"]);
    for (const p of Object.values(presets)) {
      expect(p.overrides.tts).toBeUndefined();
      expect(p.firstMessageTranslation).toBeUndefined();
      expect(Object.keys(p.overrides.agent ?? {})).toEqual(["language"]);
    }
  });

  it("maps llm, tts, turn, tools, knowledge and session overrides", () => {
    const c = body.conversationConfig;
    expect(c.agent!.prompt!.llm).toBe("claude-haiku-4-5");
    expect(c.tts!.modelId).toBe("eleven_v4_turbo");
    expect(c.tts!.expressiveMode).toBe(true);
    expect(c.tts!.supportedVoices).toHaveLength(20);
    expect(c.turn!.turnEagerness).toBe("patient");
    expect(c.agent!.prompt!.builtInTools!.languageDetection).toBeDefined();
    const save = c.agent!.prompt!.tools!.find((t) => t.type === "client" && t.name === "save_note");
    expect(save).toMatchObject({ type: "client", expectsResponse: false });
    expect(c.agent!.prompt!.knowledgeBase).toEqual([
      { type: "text", name: "Core facts (en)", id: "doc_core", usageMode: "prompt" },
      { type: "text", name: "News (de)", id: "doc_news", usageMode: "auto" },
    ]);
    // the greeting is a dynamic variable (ElevenLabs refuses a first_message session override)
    expect(c.agent!.firstMessage).toBe("{{greeting}}");
    expect(c.agent!.dynamicVariables).toEqual({ dynamicVariablePlaceholders: { persona_name: "Emma", emergency_line: expect.any(String), greeting: expect.stringContaining("Emma") } });
    expect(body.platformSettings.overrides!.conversationConfigOverride).toEqual({
      agent: { language: true },
      tts: { voiceId: true },
    });
  });
});

const sampleConversation = {
  agentId: "agent_1",
  status: "done",
  conversationId: "conv_1",
  hasAudio: true,
  hasUserAudio: true,
  hasResponseAudio: true,
  hasAuxiliaryAudio: false,
  metadata: { startTimeUnixSecs: 1_800_000_000, callDurationSecs: 42, cost: 1234, terminationReason: "client disconnected", mainLanguage: "de" },
  analysis: {
    callSuccessful: "success",
    transcriptSummary: "Caller asked about a knee check.",
    dataCollectionResults: { emergency_flag: { dataCollectionId: "emergency_flag", value: false, rationale: "none" } },
    evaluationCriteriaResults: { ai_disclosed: { criteriaId: "ai_disclosed", result: "success", rationale: "said so" } },
  },
  conversationInitiationClientData: { dynamicVariables: { persona_name: "Lena" } },
  transcript: [
    { role: "agent", message: "Hallo, ich bin Lena.", timeInCallSecs: 0, conversationTurnMetrics: { metrics: { convai_llm_service_ttfb: { elapsedTime: 0.4 }, convai_tts_service_ttfb: { elapsedTime: 0.25 } } } },
    { role: "user", message: "Ja, bitte.", timeInCallSecs: 5 },
    {
      role: "agent",
      message: "Gern.",
      timeInCallSecs: 7,
      toolCalls: [{ requestId: "r1", toolName: "capture_lead", paramsAsJson: '{"name":"Anna"}', toolHasBeenCalled: true }],
      toolResults: [{ requestId: "r1", toolName: "capture_lead", resultValue: '{"ok":true}', isError: false, toolHasBeenCalled: true, toolLatencySecs: 0.12 }],
    },
  ],
};

describe("ElevenLabsRuntime with a mocked SDK client", () => {
  it("maps a conversation to the neutral shape", () => {
    const c = mapConversation(sampleConversation as never);
    expect(c.status).toBe("done");
    expect(c.durationS).toBe(42);
    expect(c.startedAt?.getTime()).toBe(1_800_000_000_000);
    expect(c.transcript.map((t) => t.role)).toEqual(["agent", "caller", "agent"]);
    expect(c.transcript[0]!.latencyMs).toBe(650);
    expect(c.transcript[2]!.toolCalls[0]).toEqual({ name: "capture_lead", args: { name: "Anna" }, requestId: "r1" });
    expect(c.transcript[2]!.toolResults[0]).toMatchObject({ name: "capture_lead", result: { ok: true }, isError: false, latencyS: 0.12 });
    expect(c.dataCollection.emergency_flag).toEqual({ value: false, rationale: "none" });
    expect(c.evaluation.ai_disclosed!.result).toBe("success");
    expect(c.analysis.summary).toContain("knee");
    expect(c.metadata.dynamicVariables).toEqual({ persona_name: "Lena" });
    expect(c.cost).toBe(1234);
  });

  it("creates, then updates the agent; falls back to a signed url; reads audio", async () => {
    const create = vi.fn().mockResolvedValue({ agentId: "agent_new" });
    const update = vi.fn().mockResolvedValue({});
    const getWebrtcToken = vi.fn().mockRejectedValueOnce(new Error("no webrtc")).mockResolvedValueOnce({ token: "tok", conversationId: "conv_9" });
    const getSignedUrl = vi.fn().mockResolvedValue({ signedUrl: "wss://x" });
    const audioStream = new ReadableStream<Uint8Array>({
      start(c) {
        c.enqueue(new Uint8Array([1, 2]));
        c.enqueue(new Uint8Array([3]));
        c.close();
      },
    });
    const client = {
      conversationalAi: {
        agents: { create, update },
        conversations: { getWebrtcToken, getSignedUrl, get: vi.fn().mockResolvedValue(sampleConversation), delete: vi.fn().mockResolvedValue({}), audio: { get: vi.fn().mockResolvedValue(audioStream) } },
        knowledgeBase: { documents: { createFromText: vi.fn().mockResolvedValue({ id: "doc_1", name: "n" }), delete: vi.fn().mockResolvedValue({}) } },
      },
      voices: { search: vi.fn().mockResolvedValue({ voices: [{ voiceId: "v1", name: "Ana", labels: { gender: "female" }, category: "premade", verifiedLanguages: [{ language: "en" }, { language: "de" }, { language: "ru" }] }], hasMore: false, totalCount: 1 }) },
    };
    const fetchImpl = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    const rt = new ElevenLabsRuntime({ client: client as never, apiKey: "test-key", fetchImpl: fetchImpl as never });
    expect(await rt.pushAgent(spec())).toEqual({ agentId: "agent_new", created: true });
    // the raw PATCH carries what the SDK drops: language detection, end_call and the dynamic variable defaults
    const patch = JSON.parse(fetchImpl.mock.calls[0]![1].body);
    expect(Object.keys(patch.conversation_config.agent.prompt.built_in_tools).sort()).toEqual(["end_call", "language_detection"]);
    expect(patch.conversation_config.agent.dynamic_variables.dynamic_variable_placeholders).toBeTypeOf("object");
    expect(create).toHaveBeenCalledOnce();
    expect(await rt.pushAgent(spec(), "agent_new")).toEqual({ agentId: "agent_new", created: false });
    expect(update).toHaveBeenCalledWith("agent_new", expect.objectContaining({ name: "TMASI Call Center" }));
    expect(await rt.getConversationToken("agent_new")).toEqual({ kind: "websocket", signedUrl: "wss://x" });
    expect(await rt.getConversationToken("agent_new")).toEqual({ kind: "webrtc", token: "tok", conversationId: "conv_9" });
    expect((await rt.getAudio("conv_1"))!.equals(Buffer.from([1, 2, 3]))).toBe(true);
    expect(await rt.uploadKnowledgeText("n", "t")).toBe("doc_1");
    await rt.deleteKnowledge("doc_1");
    expect(client.conversationalAi.knowledgeBase.documents.delete).toHaveBeenCalledWith("doc_1", { force: true });
    const voices = await rt.listVoices({ gender: "female" });
    expect(voices[0]).toMatchObject({ voiceId: "v1", gender: "female", multilingual: true });
  });

  it("fails with the clear message when there is no key", async () => {
    const saved = process.env.ELEVENLABS_API_KEY;
    delete process.env.ELEVENLABS_API_KEY;
    try {
      const rt = new ElevenLabsRuntime();
      await expect(rt.getConversation("x")).rejects.toThrow(MISSING_KEY_MESSAGE);
      await expect(rt.getConversation("x")).rejects.toBeInstanceOf(MissingApiKeyError);
    } finally {
      if (saved !== undefined) process.env.ELEVENLABS_API_KEY = saved;
    }
  });

  it("maps ar-EG and ar-AE to ar", () => {
    expect(platformLang("ar-EG")).toBe("ar");
    expect(platformLang("ar-AE")).toBe("ar");
    expect(platformLang("en")).toBe("en");
  });
});
