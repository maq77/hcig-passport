# Research: TMASI AI Call Center V1

Sources: ElevenLabs docs and pricing pages, checked by a Fable plan agent on 2026-11-17 (links in the study doc https://claude.ai/artifact/P4Bf96ddhvp7Tszv2J1dRo). Claude prices came from third-party trackers (the Anthropic pricing page refused the connection) and are rechecked before purchase. Items marked **[spike]** are confirmed or replaced in Phase 0.

## R1. Voice runtime: ElevenLabs Agents

- **Decision**: ElevenLabs Agents runs the live call: speech recognition, turn-taking, LLM call, voice, knowledge search.
- **Rationale**: it bundles the human-sounding parts he asked for, at $0.08 a minute:
  - expressive v4 Turbo with audio tags
  - multi-voice
  - language detection
  - patient turn-taking
  - interruptions
- **Alternatives**:
  - Vapi or Retell: similar, but weaker voices for "sounds human".
  - A custom LiveKit or Pipecat pipeline: months longer. It stays the Phase 4 option behind `VoiceRuntime`.

## R2. Plan tier and spend

- **Decision**: Free tier (15 minutes) for the Phase 0 spike, Creator ($22, $11 the first month, 275 minutes) for the build. Set an ElevenLabs usage cap and an Anthropic spend limit of $20.
- **Rationale**: his choice ("Free tier first, then Creator") and the under $100 rule. A demo month comes to about $70.
- **Alternatives**: Pro at $99 (no room left for the LLM).

## R3. Live LLM

- **Decision**: Claude Haiku 4.5, hosted inside ElevenLabs. Sonnet 5.5 is the A/B candidate if accuracy falls short of the gate.
- **Rationale**: the lowest latency and cost, with no public endpoint needed. Haiku 5.5 is not yet offered inside ElevenLabs.
- **Alternatives**: a custom LLM endpoint (needs a public URL; Phase 2).

## R4. Man and woman voice switch [spike]

- **Decision**: `tts.supported_voices` with labels per language (for example `DE_F`, `DE_M`). The prompt tells the agent to wrap replies in the requested label after a switch, and the `switch_persona` client tool records the change and returns the new persona name.
- **Risk**: the label must be used on every turn after the switch.
- **Fallback**: end the session and restart it with a voice override, passing a running summary as a dynamic variable.
- **Spike check**: v4 Turbo works together with `supported_voices`.

## R4a. One voice for the whole call (his order, 2026-11-17)

- **Decision**: the persona that answers keeps its name and voice through every language switch. The voice changes only when the caller asks for a man or a woman.
- **How:** language presets carry no voice override. Language changes only the reply language. `supported_voices` is used only for the woman and man switch.
- **Which persona answers:** it is set by the line's language: the language picked on the demo page now, the phone number's country later. If the caller then switches language, the same persona simply speaks the new language.
- **Voice shortlist rule:** every persona voice must sound natural in all 10 tuned languages on the multilingual v4 Turbo model. The spike plays each candidate reading one fixed line in all 10 languages, and he picks by ear.

## R5. Languages [spike]

- **Decision**:
  - The language detection system tool, plus a preset per tuned language: greeting, prompt addendum, default persona.
  - Other languages run best effort on the base prompt.
  - Egyptian and Gulf Arabic are separate personas (voice choice).
- **Spike check**: how a mid-call language switch behaves, and expressiveness in Czech and Polish.

## R6. Knowledge (RAG)

- **Decision**: the ElevenLabs built-in knowledge base for the live call:
  - one "TMASI Core Facts" document per language, in prompt mode (always in context)
  - every other source searched on each turn, with source IDs written into the chunk text
  - in parallel, our own pgvector index of the same compiled documents, used for test grading, citation checks and gap drafting

  `KnowledgeProvider` has two implementations: `ElevenLabsKb` (live) and `LocalPgvector` (grading now, the server-side search tool in Phase 2).
- **Rationale**: built-in search adds about 250 ms with no extra round trip. A client-tool search would add about 1 s a question.
- **Alternatives**: a client-tool search (slower), or a custom LLM with our own retrieval (needs a public URL).

## R7. Embeddings

- **Decision**: local `@huggingface/transformers` with a multilingual-e5 model (small or base, picked in the spike by speed on the laptop).
- **Rationale**: $0 and no extra key, it covers all 9 languages, and the corpus is small.
- **Alternatives**: Voyage or Cohere multilingual (extra key and cost).

## R8. Database

- **Decision**: PGlite (embedded Postgres) with the vector extension, behind Drizzle. One process owns the data folder: a singleton client in `packages/db`. Migrations run from a script while the app is stopped.
- **Rationale**: Docker is not installed, and PGlite needs nothing installed. Its SQL and schema are the same we run on Neon in Phase 2.
- **Alternatives**:
  - SQLite plus sqlite-vec (schema rewrite later)
  - native Postgres (an install and a service on the laptop)

## R9. Tools without a public URL

- **Decision**: four client tools in the browser SDK (`capture_lead`, `open_case`, `switch_persona`, `end_call_csat`), each with "wait for response". They POST to `/api/tools/*` on 127.0.0.1; the server validates with zod and writes. See `contracts/client-tools.md`.
- **Rationale**: it works on a laptop with no tunnel.
- **Alternatives**: server tools with a cloudflared tunnel (kept as an optional fallback only).

## R10. Getting calls and recordings [spike]

- **Decision**: when the session ends, the test line calls `POST /api/calls/import/:conversationId`. The server:
  1. fetches the conversation details: transcript, metadata, analysis, data collection
  2. fetches the MP3 if consent was given
  3. stores turns and latencies
  4. runs the post-call jobs

  A "Re-import" button covers failures.
- **Spike check**: which fields the details response carries (transcript roles, timing, cost, evaluation results).
- **Alternatives**: post-call webhooks (need a public URL; Phase 2).

## R11. Post-call jobs

- **Decision**: one Sonnet 5.5 call per finished call, with structured output and three parts:
  - (a) a summary in English plus the caller's language
  - (b) case fields extracted and checked against what the client tools captured
  - (c) the judge: every factual claim mapped to local knowledge chunks, policy checks, language check, plus a list of gaps

  Prompt caching covers the fixed rubric plus the Core Facts prefix. About $0.015 a call.
- **Rationale**: one call keeps cost and latency low, and caching cuts the repeated prefix.

## R12. Test program and gate

- **Decision**:
  - 120 English items drafted by Claude from the knowledge base and approved by him or staff, then translated to the 8 other languages.
  - Stored as yaml in `packages/evals/sets/<lang>.yaml`.
  - The runner uses text-only conversations against the candidate agent version **[spike: confirm text mode]**.
  - Gate: at least 92% per tuned language and 100% on emergency and forbidden-claim items.
  - A version can be published only when its last run passed.
- **Alternatives**: voice-only testing (about 20 times the cost per item). It is used only for about 20 simulated calls per language.

## Related lessons

`tasks/medpark-ai-chatbot.md` (HCIG memory) records a MedPark v1 assistant that is live on v1 pages. Read its recorded conversations before writing the TMASI agent prompt, for the questions real visitors ask.

## Spike results

To be filled in Phase 0: one line per check, with what was confirmed or what changed.
