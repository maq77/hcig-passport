// Builds the vendor-neutral AgentSpec from agent/agent.config.ts, the prompt files, personas and KB attachments.
// Pure functions: no file reads, no network. scripts/agent-push.mjs does the reading.
import { z } from "zod";
import {
  captureLeadSchema,
  endCallCsatSchema,
  openCaseSchema,
  saveNoteSchema,
  switchPersonaSchema,
} from "@tc/core";
import type {
  AgentSpec,
  ClientToolSpec,
  DataCollectionSpec,
  EvaluationCriterionSpec,
  KnowledgeAttachment,
  SupportedVoiceSpec,
} from "./runtime.ts";

export interface AgentConfigLike {
  name: string;
  llm: { model: string; temperature: number };
  turn: { eagerness: "patient" | "normal" | "eager"; interruptions: boolean; silenceRepromptSeconds: number; maxSilenceEndSeconds: number };
  tts: { model: string; expressive: boolean };
  defaultLang: string;
  languages: string[];
  languageDetection: boolean;
  keepVoiceOnLanguageSwitch: boolean;
  clientTools: { name: string; waitForResponse: boolean }[];
  dynamicVariables: Record<string, string>;
  evaluation: string[];
  dataCollection: string[];
}

export interface PersonaEntry {
  lang: string;
  gender: "female" | "male";
  label: string;
  display_name: string;
  el_voice_id: string;
  is_default: boolean;
}

export interface VoiceFallback {
  female: string | null;
  male: string | null;
}

const TOOL_SCHEMAS: Record<string, { schema: z.ZodType; description: string; fields: Record<string, string> }> = {
  capture_lead: {
    schema: captureLeadSchema,
    description:
      "Save or update the caller as a contact. Call it once you have at least a name and one way to contact them (phone or email). Read a phone number back to the caller first. Returns contact_id and whether the caller is returning.",
    fields: {
      name: "Full name, 1 to 120 characters.",
      country: "Country of the caller (ISO 3166 alpha-2 or the country name).",
      lang: "BCP-47 language of the conversation, for example en or de.",
      phone: "Phone number with country code, E.164, read back and confirmed.",
      email: "Email address.",
      interest: "What the caller wants, in their own words, short, max 500 characters.",
      preferred_contact_time: "Best time to be contacted, free text.",
      sensitive_note: "Any medical detail the caller volunteered, short, max 1000 characters.",
    },
  },
  open_case: {
    schema: openCaseSchema,
    description:
      "Open a case for the contact of this call. Use the contact_id returned by capture_lead. Returns a line to say to the caller about what happens next.",
    fields: {
      contact_id: "The contact_id returned by capture_lead.",
      type: "lead, assistance (help during a trip) or urgent (emergency).",
      interest: "Short description of the need.",
      priority: "normal, high or urgent. Urgent is forced when type is urgent.",
    },
  },
  switch_persona: {
    schema: switchPersonaSchema,
    description:
      "Switch between the woman and the man voice when the caller asks for it. Then speak inside the returned label and introduce yourself with the returned name. Never call it for a language change.",
    fields: { gender: "female or male, the voice the caller asked for.", lang: "The current conversation language." },
  },
  end_call_csat: {
    schema: endCallCsatSchema,
    description: "Store the caller's satisfaction answer (1 to 5) at the end of the call, then thank them and end the call.",
    fields: { score: "Integer from 1 to 5.", comment: "Optional comment, max 300 characters." },
  },
  save_note: {
    schema: saveNoteSchema,
    description:
      "Keep a running note of something the caller said (name, need, dates, contact, preference, question). Fire and forget: do not wait and do not mention it to the caller.",
    fields: {
      key: "name, need, dates, contact, preference, question or other.",
      value: "The detail, max 300 characters.",
    },
  },
};

const EVALUATION_PROMPTS: Record<string, string> = {
  ai_disclosed: "The agent said in its first turn that it is an AI assistant of TMASI.",
  consent_asked: "The agent asked for permission to record the call in its first turn.",
  stayed_in_scope: "The agent answered only about TMASI from its knowledge, gave no medical advice, no invented prices, and never said accredited.",
  lead_captured_when_interested: "When the caller showed interest or asked to be contacted, the agent collected their details and saved them with the tools.",
  reply_language_matched: "The agent replied in the language of the caller's latest turn and switched language when the caller did.",
  no_repeated_questions: "The agent never asked again for a detail the caller had already given.",
};

const DATA_COLLECTION: Record<string, { type: "string" | "boolean"; description: string }> = {
  caller_lang: { type: "string", description: "The main language the caller spoke, as a BCP-47 tag." },
  langs_used: { type: "string", description: "Every language used in the call, comma separated BCP-47 tags." },
  interest: { type: "string", description: "What the caller was interested in, one short sentence." },
  emergency_flag: { type: "boolean", description: "True if the caller described a medical emergency." },
  recording_consent: {
    type: "boolean",
    description:
      "True only if the caller clearly agreed to the call being recorded when asked at the start. False if they declined, hesitated, or never answered.",
  },
};

export function clientToolSpecs(config: Pick<AgentConfigLike, "clientTools">): ClientToolSpec[] {
  return config.clientTools.map((t) => {
    const def = TOOL_SCHEMAS[t.name];
    if (!def) throw new Error(`No schema for client tool "${t.name}". Add it to packages/voice/src/spec.ts.`);
    const json = z.toJSONSchema(def.schema, { io: "input", unrepresentable: "any" }) as Record<string, unknown>;
    // add the per-field descriptions
    const props = (json.properties ?? {}) as Record<string, Record<string, unknown>>;
    for (const [k, d] of Object.entries(def.fields)) if (props[k]) props[k] = { ...props[k], description: d };
    return { name: t.name, description: def.description, parameters: json, waitForResponse: t.waitForResponse };
  });
}

/** One entry per label with a voice id. Entries with an empty id use the gender fallback when there is one. */
export function buildSupportedVoices(personas: PersonaEntry[], fallback: VoiceFallback | null): SupportedVoiceSpec[] {
  const out: SupportedVoiceSpec[] = [];
  for (const p of personas) {
    const voiceId = p.el_voice_id || (fallback ? fallback[p.gender] : null);
    if (!voiceId) continue;
    out.push({ label: p.label, voiceId, description: `${p.display_name}, ${p.gender}, ${p.lang}` });
  }
  return out;
}

export function allVoiceIdsEmpty(personas: PersonaEntry[]): boolean {
  return personas.every((p) => !p.el_voice_id);
}

export interface BuildSpecInput {
  config: AgentConfigLike;
  basePrompt: string;
  /** Core facts text by language tag (en, de, ...). Only languages that have a file. */
  coreFacts: Record<string, string>;
  firstMessages: Record<string, string>;
  personas: PersonaEntry[];
  voiceFallback: VoiceFallback | null;
  knowledge: KnowledgeAttachment[];
}

export function composeSystemPrompt(basePrompt: string, coreFacts: Record<string, string>, languages: string[]): string {
  const parts = [basePrompt.trimEnd()];
  const langs = languages.filter((l) => coreFacts[l]);
  parts.push("\n\n## TMASI Core Facts\n");
  if (langs.length === 0) {
    parts.push("(no core facts file found)");
  }
  for (const l of langs) {
    const body = coreFacts[l]!.replace(/^---\n[\s\S]*?\n---\n+/, "").trim();
    parts.push(langs.length > 1 ? `\n### Core facts (${l})\n\n${body}\n` : `\n${body}\n`);
  }
  return parts.join("\n");
}

export function buildAgentSpec(i: BuildSpecInput): AgentSpec {
  const { config } = i;
  const supportedVoices = buildSupportedVoices(i.personas, i.voiceFallback);
  const defaultPersona = i.personas.find((p) => p.lang === config.defaultLang && p.is_default) ?? i.personas[0];
  const defaultVoiceId = supportedVoices.find((v) => v.label === defaultPersona?.label)?.voiceId ?? null;
  const evaluation: EvaluationCriterionSpec[] = config.evaluation.map((id) => ({
    id,
    name: id,
    prompt: EVALUATION_PROMPTS[id] ?? id.replace(/_/g, " "),
  }));
  const dataCollection: DataCollectionSpec[] = config.dataCollection.map((id) => ({
    id,
    type: DATA_COLLECTION[id]?.type ?? "string",
    description: DATA_COLLECTION[id]?.description ?? id.replace(/_/g, " "),
  }));
  return {
    name: config.name,
    systemPrompt: composeSystemPrompt(i.basePrompt, i.coreFacts, config.languages),
    llmModel: config.llm.model,
    temperature: config.llm.temperature,
    ttsModel: config.tts.model,
    expressive: config.tts.expressive,
    turn: config.turn,
    defaultLang: config.defaultLang,
    languages: config.languages,
    languageDetection: config.languageDetection,
    defaultVoiceId,
    supportedVoices,
    // ElevenLabs refuses a first_message session override (live test 2026-11-17: close 1008 "Override for field
    // 'first_message' is not allowed by config", although the platform setting says allowed). The greeting is therefore
    // a dynamic variable: each session sends its persona's greeting, in its language and gender form.
    firstMessage: "{{greeting}}",
    clientTools: clientToolSpecs(config),
    dynamicVariables: {
      ...config.dynamicVariables,
      greeting: (i.firstMessages[defaultPersona?.label ?? ""] ?? "").replaceAll("{{persona_name}}", defaultPersona?.display_name ?? ""),
    },
    knowledge: i.knowledge,
    evaluation,
    dataCollection,
    allowSessionOverrides: true,
  };
}
