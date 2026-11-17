// Vendor-neutral adapter for the live voice runtime. ElevenLabs Agents today, a custom pipeline later.
// No vendor field names in this file. The vendor mapping lives in elevenlabs.ts.

// ---------- agent spec (what we want the agent to be) ----------

export interface ClientToolSpec {
  name: string;
  description: string;
  /** JSON Schema (draft 2020-12 subset: type, properties, required, enum, description). */
  parameters: Record<string, unknown>;
  /** false means fire and forget: the call never waits for the tool (save_note). */
  waitForResponse: boolean;
}

export interface SupportedVoiceSpec {
  /** For example DE_F. The agent speaks inside <LABEL>...</LABEL> to switch voice. */
  label: string;
  voiceId: string;
  description?: string;
}

export interface KnowledgeAttachment {
  elDocId: string;
  name: string;
  usageMode: "prompt" | "rag";
}

export interface EvaluationCriterionSpec {
  id: string;
  name: string;
  prompt: string;
}

export interface DataCollectionSpec {
  id: string;
  type: "string" | "boolean";
  description: string;
}

export interface AgentSpec {
  name: string;
  systemPrompt: string;
  llmModel: string;
  temperature: number;
  ttsModel: string;
  expressive: boolean;
  turn: {
    eagerness: "patient" | "normal" | "eager";
    interruptions: boolean;
    silenceRepromptSeconds: number;
    maxSilenceEndSeconds: number;
  };
  /** BCP-47 tag from the config, for example en or ar-EG. */
  defaultLang: string;
  languages: string[];
  languageDetection: boolean;
  /** Voice used when nothing else is chosen (the default persona's voice). */
  defaultVoiceId: string | null;
  /** Used ONLY for the woman and man switch (R4a). Never per language. */
  supportedVoices: SupportedVoiceSpec[];
  /** Fallback first message. The demo page overrides it per persona. */
  firstMessage: string;
  clientTools: ClientToolSpec[];
  dynamicVariables: Record<string, string>;
  knowledge: KnowledgeAttachment[];
  evaluation: EvaluationCriterionSpec[];
  dataCollection: DataCollectionSpec[];
  /** Let the session choose first message, voice and language (the demo page picks the starting persona). */
  allowSessionOverrides: boolean;
}

// ---------- sessions ----------

export type ConversationAccess =
  | { kind: "webrtc"; token: string; conversationId: string | null }
  | { kind: "websocket"; signedUrl: string };

// ---------- conversations (neutral shape) ----------

export interface NeutralToolCall {
  name: string;
  args: unknown;
  requestId: string | null;
}

export interface NeutralToolResult {
  name: string;
  result: unknown;
  isError: boolean;
  latencyS: number | null;
}

export interface NeutralTurn {
  role: "agent" | "caller";
  text: string | null;
  timeInCallSecs: number;
  /** Agent turns only: model plus voice time to first audio, when the runtime reports it. */
  latencyMs: number | null;
  interrupted: boolean;
  toolCalls: NeutralToolCall[];
  toolResults: NeutralToolResult[];
}

export interface NeutralConversation {
  id: string;
  status: "initiated" | "live" | "processing" | "done" | "failed";
  startedAt: Date | null;
  durationS: number | null;
  transcript: NeutralTurn[];
  metadata: {
    terminationReason: string | null;
    mainLanguage: string | null;
    hasAudio: boolean;
    dynamicVariables: Record<string, unknown> | null;
  };
  analysis: { summary: string | null; title: string | null; successful: string | null };
  /** Data collection results keyed by their id. */
  dataCollection: Record<string, { value: unknown; rationale: string | null }>;
  /** Evaluation criteria results keyed by criteria id. */
  evaluation: Record<string, { result: string; rationale: string | null }>;
  /** Runtime cost as reported (credits or currency units of the vendor). */
  cost: number | null;
}

export interface VoiceFilter {
  gender?: "female" | "male";
  language?: string;
  search?: string;
  /** premade, professional, cloned and so on. */
  category?: string;
  pageSize?: number;
}

export interface VoiceInfo {
  voiceId: string;
  name: string;
  gender: string | null;
  category: string | null;
  languages: string[];
  previewUrl: string | null;
  /** True when the voice lists a verified language on a multilingual model. */
  multilingual: boolean;
}

export interface VoiceRuntime {
  /** Create the agent, or update it when existingAgentId is given. */
  pushAgent(spec: AgentSpec, existingAgentId?: string | null): Promise<{ agentId: string; created: boolean }>;
  /** Short-lived access for a private agent. WebRTC token when offered, else a signed URL. */
  getConversationToken(agentId: string): Promise<ConversationAccess>;
  getConversation(conversationId: string): Promise<NeutralConversation>;
  /** MP3 (or the runtime's audio) bytes, or null when the runtime holds no audio. */
  getAudio(conversationId: string): Promise<Buffer | null>;
  deleteConversation(conversationId: string): Promise<void>;
  /** Returns the runtime's own document id. */
  uploadKnowledgeText(name: string, text: string): Promise<string>;
  deleteKnowledge(docId: string): Promise<void>;
  listVoices(filter?: VoiceFilter): Promise<VoiceInfo[]>;
}
