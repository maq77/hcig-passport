// TMASI Call Center agent, config as code (contracts/agent-config.md).
// `npm run agent:push` writes this to the ElevenLabs agent and records an agent_versions row.
// Nobody edits the agent in the ElevenLabs console: a console edit is overwritten on the next push.
// Owner: Opus. Field names marked [spike] are confirmed against the live API in Phase 0 (tasks T001).

export type Lang = 'en' | 'de' | 'ru' | 'pl' | 'ar-EG' | 'ar-AE' | 'es' | 'it' | 'fr' | 'cs';

export interface AgentConfig {
  name: string;
  llm: { model: string; temperature: number };
  turn: { eagerness: 'patient' | 'normal' | 'eager'; interruptions: boolean; silenceRepromptSeconds: number; maxSilenceEndSeconds: number };
  tts: { model: string; expressive: boolean };
  defaultLang: Lang;
  languages: Lang[];
  languageDetection: boolean;
  keepVoiceOnLanguageSwitch: boolean;
  asrKeywords: string[];
  files: {
    basePrompt: string;
    firstMessages: string;
    personas: string;
    coreFactsDir: string;
  };
  knowledge: { coreFacts: 'prompt'; rest: 'rag' };
  clientTools: { name: string; waitForResponse: boolean }[];
  dynamicVariables: Record<string, string>;
  evaluation: string[];
  dataCollection: string[];
}

const config: AgentConfig = {
  name: 'TMASI Call Center',
  llm: { model: 'claude-haiku-4-5', temperature: 0.3 }, // R3; Sonnet 5.5 is the A/B candidate if the gate fails
  turn: { eagerness: 'patient', interruptions: true, silenceRepromptSeconds: 6, maxSilenceEndSeconds: 20 },
  tts: { model: 'eleven_v4_turbo', expressive: true }, // [spike] confirm the model id
  defaultLang: 'en',
  languages: ['en', 'de', 'ru', 'pl', 'ar-EG', 'ar-AE', 'es', 'it', 'fr', 'cs'],
  languageDetection: true, // R5 and FR-002a: switch at any moment, any direction
  keepVoiceOnLanguageSwitch: true, // R4a and FR-006a: language presets carry NO voice override; voice changes only on a man/woman request
  // his test 2026-11-17: "Tmasi" said as a word was heard as "Timothy". Names the recognition should expect.
  asrKeywords: ['TMASI', 'Tmasi', 'TMASI Global', 'Hurghada', 'Marsa Alam', 'El Gouna', 'Sharm El Sheikh', 'Hansa Medica', 'ITIC'],
  files: {
    basePrompt: 'agent/prompts/base.md',
    firstMessages: 'agent/prompts/first-messages.json',
    personas: 'agent/personas.json',
    coreFactsDir: 'agent/core-facts',
  },
  knowledge: { coreFacts: 'prompt', rest: 'rag' }, // R6
  clientTools: [
    { name: 'capture_lead', waitForResponse: true },
    { name: 'open_case', waitForResponse: true },
    { name: 'switch_persona', waitForResponse: true },
    { name: 'end_call_csat', waitForResponse: true },
    { name: 'save_note', waitForResponse: false }, // fire and forget, no added delay (FR-034)
  ],
  dynamicVariables: {
    persona_name: 'Emma',
    // Draft line from the spec, used until he changes it in the dashboard. The agent says it in the caller's language.
    emergency_line:
      'This sounds urgent. Please hang up and call 112 now, or 123 for an ambulance in Egypt. I am opening an urgent case so our team can follow up.',
  },
  evaluation: ['ai_disclosed', 'consent_asked', 'stayed_in_scope', 'lead_captured_when_interested', 'reply_language_matched', 'no_repeated_questions'],
  dataCollection: ['caller_lang', 'langs_used', 'interest', 'emergency_flag', 'recording_consent'],
};

export default config;
