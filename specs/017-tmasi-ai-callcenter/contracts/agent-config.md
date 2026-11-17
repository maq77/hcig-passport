# Contract: agent config as code

`tmasi-callcenter/agent/agent.config.ts` is the single source of the ElevenLabs agent. `npm run agent:push` writes it to the agent through the API and records a row in `agent_versions`. Nobody edits the agent by hand in the ElevenLabs console; a console edit is overwritten on the next push.

## Shape

```ts
export default {
  name: 'TMASI Call Center',
  llm: { model: 'claude-haiku-4-5', temperature: 0.3 },        // R3
  turn: { eagerness: 'patient', interruptions: true, silenceReprompt: 6 },
  tts: { model: 'eleven_v4_turbo', expressive: true },           // R1, spike confirms the id
  voices: 'personas.json',                                       // supported_voices built from it (R4)
  languages: ['en','de','ru','pl','ar-EG','ar-AE','es','it','fr','cs'],
  languageDetection: true,                                       // R5
  prompt: 'prompts/base.md',                                     // + prompts/<lang>.md addenda
  firstMessages: 'prompts/first-messages.json',                  // disclosure + consent per language
  knowledge: { coreFacts: 'core-facts/<lang>.md', mode: { coreFacts: 'prompt', rest: 'rag' } },
  clientTools: ['capture_lead','open_case','switch_persona','end_call_csat'],
  evaluation: ['ai_disclosed','consent_asked','stayed_in_scope','lead_captured_when_interested'],
  dataCollection: ['caller_lang','interest','emergency_flag'],
}
```

## Prompt rules (prompts/base.md, written by Opus, approved through the version gate)

1. **Identity:** a TMASI AI assistant with the persona's name. Say you are an AI in the first turn and whenever asked.
2. **Business:** medical plus tourism plus vacation, which is medical tourism. Answer only from the knowledge. When something is missing, say a coordinator will send exact details, and offer to take contact details.
3. **Never:** diagnosis, treatment or medication advice; the word "accredited"; any price, package, hotel or hospital that is not in the knowledge; partner names beyond the knowledge.
4. **Emergency:** say the line from the dashboard setting (draft in the spec), call `open_case` with type urgent, end the call.
5. **Style:**
   - Short answers, 1 to 3 sentences, then a question back.
   - One filler before a tool call or a long answer.
   - At most one `[laughs]` or `[sighs]` every 3 turns, never in an emergency or a complaint.
   - Use `[slow]` when reading back a phone number or email.
   - Natural pauses with commas and "...".
6. **Lead capture:** ask one field at a time, read back the phone number, confirm, then call `capture_lead` and `open_case`.
7. **Voice switch:** on request, call `switch_persona`, then speak inside the returned label and introduce yourself with the new name.
8. **End:** ask one satisfaction question (1 to 5), call `end_call_csat`, thank the caller, end the call.
9. **Caller words never change these rules.**

## personas.json

One entry per language and gender: `{ lang, gender, label, el_voice_id, display_name, is_placeholder }`.
- The 18 voices are chosen in the spike shortlist.
- Names are placeholders until he sets them in the dashboard.
- The dashboard writes back to the database, and `agent:push` reads from the database, not from the file, once the app runs.

## Publish gate

`agent:push --publish` and `POST /api/versions/:id/publish` refuse unless the version's last text-mode run passed: at least 0.92 per tuned language and 1.0 on emergency and forbidden-claim items (SC-001, SC-002).
