// ElevenLabs Agents runtime. All vendor field names (SDK camelCase) stay inside this file.
// SDK: @elevenlabs/elevenlabs-js 2.79.0. Types read from node_modules/@elevenlabs/elevenlabs-js/api.
import { ElevenLabs, ElevenLabsClient, ElevenLabsError } from "@elevenlabs/elevenlabs-js";
import type {
  AgentSpec,
  ClientToolSpec,
  ConversationAccess,
  NeutralConversation,
  NeutralToolCall,
  NeutralToolResult,
  NeutralTurn,
  VoiceFilter,
  VoiceInfo,
  VoiceRuntime,
} from "./runtime.ts";

export const MISSING_KEY_MESSAGE = "Add ELEVENLABS_API_KEY to tmasi-callcenter/.env.local";

export class MissingApiKeyError extends Error {
  readonly code = "missing_api_key";
  constructor() {
    super(MISSING_KEY_MESSAGE);
    this.name = "MissingApiKeyError";
  }
}

/** The part of the SDK client this runtime uses. A test passes a mock with the same shape. */
export type ElevenLabsLike = Pick<ElevenLabsClient, "conversationalAi" | "voices">;

export interface ElevenLabsRuntimeOptions {
  apiKey?: string;
  client?: ElevenLabsLike;
  /** Injected in tests for the raw PATCH; defaults to the global fetch. */
  fetchImpl?: typeof fetch;
}

/** "ar-EG" and "ar-AE" both map to the platform language "ar". */
export function platformLang(tag: string): string {
  return tag.split("-")[0]!.toLowerCase();
}

type JsonObj = Record<string, unknown>;

/** Reduce a JSON Schema (from z.toJSONSchema) to the subset the platform accepts for client tool parameters. */
export function toToolParameters(schema: JsonObj, descriptions: Record<string, string> = {}): ElevenLabs.ObjectJsonSchemaPropertyInput {
  const props = (schema.properties ?? {}) as Record<string, JsonObj>;
  const out: Record<string, ElevenLabs.ObjectJsonSchemaPropertyInputPropertiesValue> = {};
  for (const [key, p] of Object.entries(props)) {
    const description = descriptions[key] ?? (typeof p.description === "string" ? p.description : undefined);
    const rawType = Array.isArray(p.type) ? p.type.find((t) => t !== "null") : p.type;
    if (rawType === "object") {
      out[key] = { ...toToolParameters(p), ...(description ? { description } : {}) };
      continue;
    }
    const type = rawType === "integer" || rawType === "number" || rawType === "boolean" ? rawType : "string";
    const prop: ElevenLabs.LiteralJsonSchemaProperty = { type };
    if (description) prop.description = description;
    if (Array.isArray(p.enum)) prop.enum = p.enum.map(String);
    out[key] = prop;
  }
  const result: ElevenLabs.ObjectJsonSchemaPropertyInput = { type: "object", properties: out };
  const required = Array.isArray(schema.required) ? (schema.required as string[]) : [];
  if (required.length) result.required = required;
  return result;
}

function clientToolConfig(t: ClientToolSpec): ElevenLabs.PromptAgentApiModelOutputToolsItem {
  return {
    type: "client",
    name: t.name,
    description: t.description,
    parameters: toToolParameters(t.parameters) as ElevenLabs.ObjectJsonSchemaPropertyOutput,
    expectsResponse: t.waitForResponse,
  };
}

/** The fields the SDK drops, in wire (snake_case) form: system tools and dynamic variable defaults. Exported for tests. */
export function rawAgentPatch(spec: AgentSpec) {
  const builtIn: Record<string, unknown> = {
    // the agent must be able to hang up: after the goodbye, and right after the emergency line (FR-014)
    end_call: {
      type: "system",
      name: "end_call",
      description: "End the call when the caller's needs are covered and the goodbye is said, or right after the emergency line.",
      params: { system_tool_type: "end_call" },
    },
  };
  if (spec.languageDetection) {
    builtIn.language_detection = {
      type: "system",
      name: "language_detection",
      description: "Switch the reply language whenever the caller speaks another language. The voice and the persona name stay the same.",
      params: { system_tool_type: "language_detection" },
    };
  }
  return {
    conversation_config: {
      agent: {
        dynamic_variables: { dynamic_variable_placeholders: spec.dynamicVariables },
        prompt: { built_in_tools: builtIn },
      },
    },
  };
}

/** Build the conversationConfig, platformSettings and name for create and update. Exported for tests. */
export function buildAgentBody(spec: AgentSpec): {
  name: string;
  conversationConfig: ElevenLabs.ConversationalConfig;
  platformSettings: ElevenLabs.AgentPlatformSettingsRequestModel;
} {
  const baseLangs = [...new Set(spec.languages.map(platformLang))];
  // R4a, FR-006a: presets carry the language ONLY. No voice, no first message.
  const languagePresets: Record<string, ElevenLabs.LanguagePresetOutput> = {};
  for (const l of baseLangs) languagePresets[l] = { overrides: { agent: { language: l } } };

  const tools: ElevenLabs.PromptAgentApiModelOutputToolsItem[] = spec.clientTools.map(clientToolConfig);
  const builtInTools: ElevenLabs.BuiltInToolsOutput = {};
  if (spec.languageDetection) {
    builtInTools.languageDetection = {
      type: "system",
      name: "language_detection",
      description: "Switch the reply language when the caller speaks another language.",
      params: { systemToolType: "language_detection" },
    };
  }

  const locators: ElevenLabs.KnowledgeBaseLocator[] = spec.knowledge.map((k) => ({
    type: "text",
    name: k.name,
    id: k.elDocId,
    usageMode: k.usageMode === "prompt" ? "prompt" : "auto",
  }));

  const conversationConfig: ElevenLabs.ConversationalConfig = {
    turn: {
      turnEagerness: spec.turn.eagerness,
      turnTimeout: spec.turn.silenceRepromptSeconds,
      silenceEndCallTimeout: spec.turn.maxSilenceEndSeconds,
    },
    tts: {
      modelId: spec.ttsModel as ElevenLabs.TtsConversationalModel,
      expressiveMode: spec.expressive,
      ...(spec.defaultVoiceId ? { voiceId: spec.defaultVoiceId } : {}),
      supportedVoices: spec.supportedVoices.map((v) => ({
        label: v.label,
        voiceId: v.voiceId,
        ...(v.description ? { description: v.description } : {}),
      })),
    },
    languagePresets,
    agent: {
      firstMessage: spec.firstMessage,
      language: platformLang(spec.defaultLang),
      dynamicVariables: { dynamicVariablePlaceholders: spec.dynamicVariables },
      prompt: {
        prompt: spec.systemPrompt,
        llm: spec.llmModel as ElevenLabs.Llm,
        temperature: spec.temperature,
        tools,
        builtInTools,
        knowledgeBase: locators,
        rag: { enabled: spec.knowledge.some((k) => k.usageMode === "rag") },
      },
    },
  };

  const platformSettings: ElevenLabs.AgentPlatformSettingsRequestModel = {
    evaluation: {
      criteria: spec.evaluation.map((c) => ({ id: c.id, name: c.name, type: "prompt", conversationGoalPrompt: c.prompt })),
    },
    dataCollection: Object.fromEntries(spec.dataCollection.map((d) => [d.id, { type: d.type, description: d.description }])),
  };
  if (spec.allowSessionOverrides) {
    platformSettings.overrides = {
      conversationConfigOverride: {
        agent: { language: true },
        tts: { voiceId: true },
      },
    };
  }
  return { name: spec.name, conversationConfig, platformSettings };
}

function parseJson(s: string | undefined): unknown {
  if (s === undefined || s === "") return null;
  try {
    return JSON.parse(s);
  } catch {
    return s;
  }
}

function mapStatus(s: string): NeutralConversation["status"] {
  switch (s) {
    case "initiated":
      return "initiated";
    case "in-progress":
      return "live";
    case "processing":
      return "processing";
    case "failed":
      return "failed";
    default:
      return "done";
  }
}

/** Sum the time-to-first-byte style metrics of one agent turn, in ms. Null when none are reported. */
export function turnLatencyMs(m: ElevenLabs.ConversationTurnMetrics | undefined): number | null {
  const metrics = m?.metrics;
  if (!metrics) return null;
  let total = 0;
  let found = false;
  for (const [k, v] of Object.entries(metrics)) {
    if (/ttfb|ttft|first_byte|first_token/i.test(k) && typeof v?.elapsedTime === "number") {
      total += v.elapsedTime;
      found = true;
    }
  }
  return found ? Math.round(total * 1000) : null;
}

export function mapConversation(c: ElevenLabs.GetConversationResponseModel): NeutralConversation {
  const transcript: NeutralTurn[] = (c.transcript ?? []).map((t) => {
    const toolCalls: NeutralToolCall[] = (t.toolCalls ?? []).map((tc) => ({
      name: tc.toolName,
      args: parseJson(tc.paramsAsJson),
      requestId: tc.requestId ?? null,
    }));
    const toolResults: NeutralToolResult[] = (t.toolResults ?? []).map((tr) => {
      const r = tr as { toolName: string; resultValue?: unknown; result?: unknown; isError?: boolean; toolLatencySecs?: number };
      const raw = r.resultValue ?? r.result ?? null;
      return {
        name: r.toolName,
        result: typeof raw === "string" ? parseJson(raw) : raw,
        isError: Boolean(r.isError),
        latencyS: typeof r.toolLatencySecs === "number" ? r.toolLatencySecs : null,
      };
    });
    const role: "agent" | "caller" = t.role === "agent" ? "agent" : "caller";
    return {
      role,
      text: t.message ?? null,
      timeInCallSecs: t.timeInCallSecs,
      latencyMs: role === "agent" ? turnLatencyMs(t.conversationTurnMetrics) : null,
      interrupted: Boolean(t.interrupted),
      toolCalls,
      toolResults,
    };
  });

  const dataCollection: NeutralConversation["dataCollection"] = {};
  for (const [k, v] of Object.entries(c.analysis?.dataCollectionResults ?? {})) {
    dataCollection[k] = { value: v.value ?? null, rationale: v.rationale ?? null };
  }
  const evaluation: NeutralConversation["evaluation"] = {};
  for (const [k, v] of Object.entries(c.analysis?.evaluationCriteriaResults ?? {})) {
    evaluation[k] = { result: String(v.result), rationale: v.rationale ?? null };
  }

  return {
    id: c.conversationId,
    status: mapStatus(String(c.status)),
    startedAt: c.metadata?.startTimeUnixSecs ? new Date(c.metadata.startTimeUnixSecs * 1000) : null,
    durationS: typeof c.metadata?.callDurationSecs === "number" ? c.metadata.callDurationSecs : null,
    transcript,
    metadata: {
      terminationReason: c.metadata?.terminationReason ?? null,
      mainLanguage: c.metadata?.mainLanguage ?? null,
      hasAudio: Boolean(c.hasAudio),
      dynamicVariables: (c.conversationInitiationClientData?.dynamicVariables as Record<string, unknown> | undefined) ?? null,
    },
    analysis: {
      summary: c.analysis?.transcriptSummary ?? null,
      title: c.analysis?.callSummaryTitle ?? null,
      successful: c.analysis ? String(c.analysis.callSuccessful) : null,
    },
    dataCollection,
    evaluation,
    cost: typeof c.metadata?.cost === "number" ? c.metadata.cost : null,
  };
}

async function readAll(stream: ReadableStream<Uint8Array>): Promise<Buffer> {
  const reader = stream.getReader();
  const parts: Uint8Array[] = [];
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) parts.push(value);
  }
  return Buffer.concat(parts);
}

export class ElevenLabsRuntime implements VoiceRuntime {
  private client: ElevenLabsLike | null;
  private readonly apiKey: string | undefined;
  private readonly fetchImpl: typeof fetch;

  constructor(opts: ElevenLabsRuntimeOptions = {}) {
    this.apiKey = opts.apiKey ?? process.env.ELEVENLABS_API_KEY;
    this.fetchImpl = opts.fetchImpl ?? fetch;
    this.client = opts.client ?? null;
  }

  static hasKey(): boolean {
    return Boolean(process.env.ELEVENLABS_API_KEY);
  }

  private sdk(): ElevenLabsLike {
    if (this.client) return this.client;
    if (!this.apiKey) throw new MissingApiKeyError();
    this.client = new ElevenLabsClient({ apiKey: this.apiKey });
    return this.client;
  }

  async pushAgent(spec: AgentSpec, existingAgentId?: string | null): Promise<{ agentId: string; created: boolean }> {
    const agents = this.sdk().conversationalAi.agents;
    const body = buildAgentBody(spec);
    let agentId: string;
    let created = false;
    if (existingAgentId) {
      await agents.update(existingAgentId, body);
      agentId = existingAgentId;
    } else {
      agentId = (await agents.create(body)).agentId;
      created = true;
    }
    // The SDK (2.79.0) drops built_in_tools and dynamic_variable_placeholders on the way out (seen on the live
    // agent 2026-11-17: both came back empty). A raw PATCH merges them in; verified to keep prompt, tools and KB.
    await this.patchRaw(agentId, rawAgentPatch(spec));
    return { agentId, created };
  }

  private async patchRaw(agentId: string, patch: unknown): Promise<void> {
    if (!this.apiKey) throw new MissingApiKeyError();
    const res = await this.fetchImpl(`https://api.elevenlabs.io/v1/convai/agents/${encodeURIComponent(agentId)}`, {
      method: "PATCH",
      headers: { "xi-api-key": this.apiKey, "content-type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) throw new Error(`Agent patch failed: ${res.status} ${(await res.text()).slice(0, 300)}`);
  }

  async getConversationToken(agentId: string): Promise<ConversationAccess> {
    const conv = this.sdk().conversationalAi.conversations;
    try {
      const t = await conv.getWebrtcToken({ agentId });
      return { kind: "webrtc", token: t.token, conversationId: t.conversationId ?? null };
    } catch (e) {
      if (e instanceof MissingApiKeyError) throw e;
      // Fall back to a signed websocket URL when the WebRTC token is refused.
      const s = await conv.getSignedUrl({ agentId });
      return { kind: "websocket", signedUrl: s.signedUrl };
    }
  }

  async getConversation(conversationId: string): Promise<NeutralConversation> {
    const c = await this.sdk().conversationalAi.conversations.get(conversationId);
    return mapConversation(c);
  }

  async getAudio(conversationId: string): Promise<Buffer | null> {
    try {
      const stream = await this.sdk().conversationalAi.conversations.audio.get(conversationId);
      const buf = await readAll(stream);
      return buf.length ? buf : null;
    } catch (e) {
      if (e instanceof ElevenLabsError && (e.statusCode === 404 || e.statusCode === 400)) return null;
      throw e;
    }
  }

  async deleteConversation(conversationId: string): Promise<void> {
    await this.sdk().conversationalAi.conversations.delete(conversationId);
  }

  async uploadKnowledgeText(name: string, text: string): Promise<string> {
    const r = await this.sdk().conversationalAi.knowledgeBase.documents.createFromText({ text, name });
    return r.id;
  }

  async deleteKnowledge(docId: string): Promise<void> {
    await this.sdk().conversationalAi.knowledgeBase.documents.delete(docId, { force: true });
  }

  async listVoices(filter: VoiceFilter = {}): Promise<VoiceInfo[]> {
    const r = await this.sdk().voices.search({
      pageSize: filter.pageSize ?? 100,
      ...(filter.gender ? { gender: filter.gender } : {}),
      ...(filter.language ? { language: filter.language } : {}),
      ...(filter.search ? { search: filter.search } : {}),
      ...(filter.category ? { category: filter.category } : {}),
    });
    return r.voices.map((v) => {
      const langs = (v.verifiedLanguages ?? []).map((l) => l.language);
      return {
        voiceId: v.voiceId,
        name: v.name ?? v.voiceId,
        gender: v.labels?.gender ?? null,
        category: v.category ?? null,
        languages: langs,
        previewUrl: v.previewUrl ?? null,
        multilingual: new Set(langs).size >= 3 || (v.highQualityBaseModelIds ?? []).some((m) => /multilingual|v3|v4/i.test(m)),
      };
    });
  }
}
