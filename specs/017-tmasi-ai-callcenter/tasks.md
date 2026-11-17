---
description: "Task list for spec 017, TMASI AI Call Center V1 (local demo)"
---

# Tasks: TMASI AI Call Center, V1 local demo

**Input**: `specs/017-tmasi-ai-callcenter/` (spec approved 2026-11-17, plan, research, data-model, contracts, quickstart)

**Tests**: included. The spec's quality program (FR-029 to FR-031, SC-001 to SC-010) and the quickstart need unit tests, the eval gate and Playwright e2e.

**Owner tag in each task**:
- **(Opus)**: the main session. Prompts, guardrails, judge rubric, money and safety logic, canvas, reviews, commits.
- **(Sonnet)**: Sonnet subagent writing code from the approved task.
- **(agy)**: Gemini through `agy-delegate`, in a clean worktree. Every diff is reviewed by Opus before commit.

**Paths**: all code paths are relative to the repo root; the app lives in `tmasi-callcenter/`.

**Gates**:
- **G0, accounts:** he opens ElevenLabs Free and an Anthropic key with caps (blocks Phase 0 spike).
- **G1, canvas pick:** he picks a dashboard direction on the canvas (blocks every task that writes screen code: T040+, T052+, T061+, T068+, T075+, T080+).
- **G2, Creator upgrade:** before Phase 3 voice testing beyond the free 15 minutes.

## Format: `[ID] [P?] [Story] Description`

## Revised order (2026-11-17, his answers after approval)

**Talking demo first.** He wants to talk to it before anything else. The order below replaces the phase order further down; the task texts stay as written.
- **Memory:** within one call only (FR-034 to FR-036).
- **Languages:** switching at any moment comes first (FR-002a, SC-011).
- **Spending:** ElevenLabs Free then Creator, plus a small prepaid Claude credit.

1. **Demo skeleton** (no screens, no canvas needed):
   - setup: T005, T006, T007, T008, T009, T010
   - core: T011, T012, T015, T016, T017, T019, T020, T022, T024, T026, T027
2. **Talking demo:** T028, T029, T030, T031, T077, T078, T079, T080. He talks to it on the plain test page and gives notes.
3. **Grading and proof:** T032, T033, T035, T036, T037, T038, T081.
4. **Dashboard:** T003 canvas, his pick (G1), then T040 to T067 in the order below.
5. **Then** Phase 10 (ES, IT, FR, CS) and Phase 11 (polish and proof).

### New tasks from the amendment

- [ ] T077 (Sonnet) Plain private test page `tmasi-callcenter/apps/web/src/app/demo/page.tsx`. It is a test tool, not a designed screen:
  - language picker with "auto", start and end buttons
  - live transcript with the detected language on each line
  - the current persona name, a latency figure per turn
  - a "notes so far" panel fed by T079

  It uses `apps/web/src/lib/test-line.ts` (T034 logic) and calls import on disconnect.
- [ ] T078 (Opus) Language switching (FR-002a, SC-011) in `tmasi-callcenter/agent/prompts/base.md` and `agent.config.ts`:
  - reply in the language of the caller's latest turn
  - switch at any moment, in either direction, as often as the caller does
  - keep the persona of that language (voice and name follow the language)
  - a single borrowed word never triggers a switch

  Phase 0 confirms language detection behaviour on mid-call switches. If the platform tool lags, add a prompt-level rule and test both.
- [ ] T079 (Sonnet) Client tool `save_note` with "wait for response" off (fire and forget, no added delay), in `packages/core/src/tools.ts` and `apps/web/src/app/api/tools/save-note/route.ts`:
  - args `{ key: name|need|dates|contact|preference|question|other, value: string max 300 chars }`
  - stored on the live call
  - shown in the demo notes panel

  Prompt rule (Opus): the agent uses the whole conversation as memory, never asks again for a detail already given in any language, and reads back a short summary before ending (FR-034, FR-035). Update `contracts/client-tools.md`.
- [ ] T080 (Opus) Language-switch and memory test script for the talking demo, in `specs/017-tmasi-ai-callcenter/demo-script.md`:
  - 10 scripted calls covering EN to AR, AR to EN, DE to EN to RU, PL to EN and back, three switches in one call, and a borrowed word with no switch
  - each with "facts given before the switch" that must not be asked again

  He runs them on the demo page, and the results are logged.
- [ ] T081 (Sonnet) Add eval categories `lang_switch` (multi-turn: question in language A, follow-up in language B, expected reply language B) and `memory` (detail given in turn 1, must not be asked again by turn 4) to `packages/evals/src/run.ts` and the yaml sets. 10 items per tuned language each. The gate requires 100% on both (SC-011, SC-012).

---

## Phase 0: Spike and canvas (in parallel)

**Purpose**: confirm the [spike] decisions in research.md, and get his dashboard pick.

- [ ] T001 (Opus) Write the spike script in the scratchpad (not committed), using an ElevenLabs Free test agent. Check:
  - v4 Turbo plus `supported_voices` label switch (R4)
  - language detection plus per-language presets (R5)
  - client tool round trip and pre-tool speech (R9)
  - text-only conversation mode (R12)
  - Conversations API detail fields, audio download and delete (R10)
  - latency fields

  Record one line per check under "Spike results" in `specs/017-tmasi-ai-callcenter/research.md`.
- [ ] T002 [P] (Sonnet) Build a voice shortlist (R4a: each voice must sound natural in ALL 10 tuned languages, because it keeps speaking after a language switch; render one fixed line per candidate in all 10 languages for him to judge by ear): list ElevenLabs library voices per tuned language (EN, DE, RU, PL, ar-EG, ar-AE, ES, IT, FR, CS) by gender and accent. Output a table of 3 candidates per language and gender to `specs/017-tmasi-ai-callcenter/voice-shortlist.md`. Opus picks 18 by listening to previews.
- [ ] T003 [P] (Opus) Dashboard canvas on Claude Design:
  - Show several complete directions, phone and desktop, every control live, with header, nav and empty states.
  - Screens: Test Line, Calls, Call detail, Cases, Knowledge, Personas, Agent versions, Evals, Gaps, Overview.
  - Copy uses only words from the spec. Placeholder persona names are clearly labelled.
  - Publish privately and ask his pick with AskUserQuestion. Record the link and his pick in `specs/017-tmasi-ai-callcenter/research.md` (section "Canvas"). **G1**
- [ ] T004 (Opus) Read `C:\Users\maqmo\.claude\skills\hcig\memory\tasks\medpark-ai-chatbot.md` and the MedPark assistant's recorded conversations. Write the top 30 real visitor questions into `specs/017-tmasi-ai-callcenter/research.md` (section "Real questions").

**Checkpoint**: spike results recorded, canvas picked, research decisions confirmed or replaced.

---

## Phase 1: Setup

- [ ] T005 (Sonnet) Create the npm workspaces monorepo `tmasi-callcenter/`:
  - `package.json` (workspaces `apps/*`, `packages/*`; scripts `dev`, `build`, `test`, `migrate`, `seed:admin`, `kb:build`, `kb:sync`, `agent:push`, `eval`, `import:call`)
  - `tsconfig.base.json` (strict, ESM)
  - `.gitignore` (`data/`, `.env.local`, `node_modules`, `.next`)
  - `.env.example` with the variable names from quickstart.md (names only)
  - `README.md` pointing to the spec
- [ ] T006 [P] (Sonnet) Scaffold the Next.js 16 app in `tmasi-callcenter/apps/web/`: app router, Node runtime, dev and start bound to `127.0.0.1:3017`, Tailwind 4. No screens yet.
- [ ] T007 [P] (Sonnet) Create empty packages with `package.json` and `src/index.ts`: `tmasi-callcenter/packages/{core,db,voice,llm,kb,evals}`.
- [ ] T008 [P] (Sonnet) Add Vitest config at `tmasi-callcenter/vitest.config.ts`. Add Playwright config at `tmasi-callcenter/playwright.config.ts`, with Chrome launched with `--use-fake-ui-for-media-stream --use-fake-device-for-media-stream` and fixtures in `tmasi-callcenter/tests/fixtures/`.
- [ ] T009 [P] (Sonnet) Add a copy check script `tmasi-callcenter/scripts/check-copy.mjs`. It fails on the em dash (U+2014), the en dash (U+2013) or the word "accredited" in `agent/` and in `apps/web/src`. Wire it into `npm test`.
- [ ] T010 (Opus) Lock exact dependency versions after `npm view` (next, react, @elevenlabs/react, @elevenlabs/elevenlabs-js, @anthropic-ai/sdk, @electric-sql/pglite, drizzle-orm, drizzle-kit, @huggingface/transformers, zod, next-auth, argon2) in the workspace `package.json` files. Run `npm install`.

---

## Phase 2: Foundational (blocks every story)

- [ ] T011 (Sonnet) Write the Drizzle schema in `tmasi-callcenter/packages/db/src/schema.ts` with every table in data-model.md. Enums verbatim:
  - personas.gender `female|male`
  - agent_versions.status `draft|candidate|live|retired`
  - calls.status `live|imported|import_failed|deleted`
  - cases.type `lead|assistance|urgent`
  - cases.status `new|contacted|qualified|closed`
  - cases.priority `normal|high|urgent`
  - kb_gaps.status `open|answered|rejected|needs_owner`
  - eval_runs.mode `text|voice`
  - eval_items.category `fact|out_of_scope|missing_price|emergency|medical_advice|forbidden_claim|lead_capture|voice_switch|lang_switch`

  Constraints:
  - `csat smallint` checked to "1 to 5, null"
  - `contacts.phone_e164` and `contacts.email` "unique when present"
  - only one `agent_versions` row with status `live`
- [ ] T012 (Sonnet) Write the PGlite singleton client with the vector extension in `tmasi-callcenter/packages/db/src/client.ts`, data dir from `DATA_DIR`. Add the migration runner `tmasi-callcenter/scripts/migrate.mjs`, which refuses to run while the dev server holds the lock.
- [ ] T013 [P] (Sonnet) Add the audit helper `writeAudit(actor, action, entity, id, before, after)` in `tmasi-callcenter/packages/db/src/audit.ts`. Every dashboard write route must call it (FR-026).
- [ ] T014 [P] (Sonnet) Auth: Auth.js credentials with argon2 in `tmasi-callcenter/apps/web/src/auth.ts`, plus a middleware that protects every route except `/login` and `/api/auth/*`, and the seed script `tmasi-callcenter/scripts/seed-admin.mjs` (FR-024).
- [ ] T015 [P] (Opus) Define the adapter interfaces in `tmasi-callcenter/packages/voice/src/runtime.ts` (`VoiceRuntime`: createSession token, getConversation, getAudio, deleteConversation, pushAgentConfig, uploadKnowledge, deleteKnowledge), `tmasi-callcenter/packages/llm/src/provider.ts` (`LlmProvider`: structured(prompt, schema, cache)) and `tmasi-callcenter/packages/kb/src/provider.ts` (`KnowledgeProvider`: search(question, lang, k)).
- [ ] T016 (Sonnet) Implement `ElevenLabsRuntime` in `tmasi-callcenter/packages/voice/src/elevenlabs.ts` against the T015 interface, using the field names confirmed in the spike (T001).
- [ ] T017 [P] (Sonnet) Implement `AnthropicProvider` with prompt caching on the system prefix in `tmasi-callcenter/packages/llm/src/anthropic.ts`. Models come from `LLM_POSTCALL_MODEL`.
- [ ] T018 [P] (Sonnet) Cost math in `tmasi-callcenter/packages/core/src/cost.ts`: ElevenLabs minutes times rate, plus LLM tokens times price table (prices in one config object, rechecked by Opus). Write a unit test in `tmasi-callcenter/tests/unit/cost.test.ts`.
- [ ] T019 (Opus) Guardrail rules module `tmasi-callcenter/packages/core/src/guardrails.ts`:
  - forbidden words ("accredited")
  - emergency keyword lists per tuned language
  - the allowed `capture_lead` fields
  - the emergency line setting (draft from the spec)

  Write unit tests in `tmasi-callcenter/tests/unit/guardrails.test.ts`.
- [ ] T020 (Sonnet) Knowledge compiler `tmasi-callcenter/packages/kb/src/build.ts` and script `scripts/kb-build.mjs`, per `contracts/knowledge-pipeline.md`:
  - inputs listed there
  - `[src:<doc-slug>#<n>]` paragraph tags
  - front matter
  - `data/kb/manifest.json`
  - exclude and report any text containing "accredited"
  - review quotes never output as testimonials
- [ ] T021 (agy) Local embedder `tmasi-callcenter/packages/kb/src/embed.ts` with `@huggingface/transformers` and the multilingual-e5 model chosen in the spike. Add the chunker (about 400 tokens, 15% overlap) in `packages/kb/src/chunk.ts`, with unit tests in `tests/unit/chunk.test.ts`.
- [ ] T022 (Sonnet) `kb:sync` in `tmasi-callcenter/packages/kb/src/sync.ts` and `scripts/kb-sync.mjs`: hash diff, upload, attach with usage mode (core_facts = prompt, rest = rag), detach removed docs, re-embed changed docs, audit, summary. A second run reports 0 changed (FR-027).
- [ ] T023 [P] (Sonnet) `LocalPgvector` search in `tmasi-callcenter/packages/kb/src/local.ts`: caller language first, EN fallback, k = 6.
- [ ] T024 (Opus) Write "TMASI Core Facts" per tuned language in `tmasi-callcenter/agent/core-facts/{en,de,ru,pl,ar,es,it,fr,cs}.md`, only from the compiled sources (offices, contacts, services, partners named in the knowledge, forbidden claims). EN first; the others are translated by agy (T025). Show the EN version to him before sync.
- [ ] T025 [P] (agy) First-draft translations of `agent/core-facts/en.md` into DE, RU, PL, AR, ES, IT, FR, CS. Opus checks names, numbers and phone numbers against the sources.
- [ ] T026 (Opus) Agent config as code:
  - `tmasi-callcenter/agent/agent.config.ts` per `contracts/agent-config.md`
  - `agent/prompts/base.md` (prompt rules 1 to 9)
  - `agent/prompts/first-messages.json` (AI disclosure plus recording consent per language)
  - `agent/personas.json` (18 voices from T002, placeholder names flagged `is_placeholder`)
- [ ] T027 (Sonnet) `agent:push` script `tmasi-callcenter/scripts/agent-push.mjs`: builds supported_voices from the personas table, pushes config and knowledge attachments, writes an `agent_versions` draft row. `--publish` refuses unless the last eval run passed (FR-028).

**Checkpoint**: db, auth, adapters, knowledge and agent config work from the command line.

---

## Phase 3: User Story 1, a caller asks and leaves details (P1) MVP

**Goal**: a test caller talks to the agent in their language, gets correct answers, leaves details, and a case is created.
**Independent test**: one call per Phase 1a language (EN, DE, RU, PL, AR) produces a case with the right details (quickstart rows 2, 3, 4, 10).

- [ ] T028 [P] [US1] (Sonnet) zod schemas for the four client tools in `tmasi-callcenter/packages/core/src/tools.ts`, verbatim from `contracts/client-tools.md`:
  - name "1 to 120 chars"
  - interest "1 to 500 chars"
  - sensitive_note "max 1,000 chars"
  - csat "integer 1 to 5", comment "max 300 chars"
  - "at least one of phone or email"
  - unknown fields rejected

  Unit tests in `tests/unit/tools.test.ts`.
- [ ] T029 [US1] (Sonnet) Route `POST /api/el/token` in `tmasi-callcenter/apps/web/src/app/api/el/token/route.ts`: live version, default persona for the chosen language, conversation token, per-call tool token.
- [ ] T030 [US1] (Sonnet) Tool routes `capture-lead`, `open-case`, `switch-persona`, `csat` under `tmasi-callcenter/apps/web/src/app/api/tools/`:
  - validate with T028 and check the tool token
  - repeat callers are matched on phone or email (FR-020)
  - `urgent` type forces priority `urgent`
  - return the contract shapes
- [ ] T031 [US1] (Sonnet) Import job `tmasi-callcenter/packages/core/src/import.ts` and route `POST /api/calls/import/[conversationId]`:
  - fetch details and MP3 (only when `recording_consent`)
  - store `calls`, `turns` (latency_ms, tool fields), `call_events`
  - idempotent re-run
  - status `import_failed` on error
- [ ] T032 [US1] (Opus) Post-call prompt and schema in `tmasi-callcenter/packages/llm/src/postcall.ts`:
  - summary EN plus caller language
  - case field extraction, cross-checked with tool data
  - judge: each claim mapped to a LocalPgvector chunk, `fact_ok`, `policy_ok`, `lang_ok`, `ai_disclosed`, gaps list
- [ ] T033 [US1] (Sonnet) Wire T032 into the import job. Write `judge_score`, `judge_pass`, summaries on the case, `kb_gaps` rows, and cost. An emergency call with no contact still opens an urgent case.
- [ ] T034 [US1] (Sonnet) Headless test-line harness `tmasi-callcenter/apps/web/src/lib/test-line.ts`: wraps `useConversation`, registers the four client tools, calls import on disconnect. Logic only; the UI waits for G1.
- [ ] T035 [US1] (Opus) Eval sets for Phase 1a:
  - draft 120 EN items from the knowledge into `tmasi-callcenter/packages/evals/sets/en.yaml`, in the category mix from the spec (60% fact, 15% out_of_scope or missing_price, 10% emergency or medical_advice, 10% lead_capture, 5% voice or lang switch)
  - he or staff approve them
  - agy translates to DE, RU, PL, AR (T036)
- [ ] T036 [P] [US1] (agy) Translate `sets/en.yaml` into `sets/{de,ru,pl,ar}.yaml`. Keep ids, `expected_facts` and `must_not` aligned. Opus spot-checks 10 per language.
- [ ] T037 [US1] (Sonnet) Eval runner `tmasi-callcenter/packages/evals/src/run.ts` and `scripts/eval-run.mjs`:
  - text mode against a version
  - grade with the T032 judge
  - write `eval_runs` and `eval_results`
  - gate: "at least 0.92 per tuned language, 1.0 on emergency and forbidden_claim"
- [ ] T038 [US1] (Opus) Run the gate for EN, DE, RU, PL, AR. Fix the prompt (`tmasi-callcenter/agent/prompts/`) or Core Facts (`agent/core-facts/`) until it passes, then publish the first live version with `scripts/agent-push.mjs --publish`.
- [ ] T039 [US1] (Sonnet) Playwright e2e `tmasi-callcenter/tests/e2e/us1.spec.ts`:
  - fake-mic WAV per Phase 1a language: question, details, rating
  - assert disclosure in the first agent turn
  - assert the case exists with a summary
  - assert no audio when consent is refused
- [ ] T040 [US1] (Sonnet, after G1) Test Line screen in `tmasi-callcenter/apps/web/src/app/(dash)/test-line/page.tsx`, built exactly as the approved canvas: language and persona picker, call button, live transcript, latency badge.

**Checkpoint**: MVP. Calls in 5 languages create cases, the gate passes, the Test Line works.

---

## Phase 4: User Story 2, review calls and cases (P1)

**Goal**: the team reviews recordings, transcripts and cases, adds notes and moves cases.
**Independent test**: after three calls, each has recording, transcript with sources, summary and scores; a case can be noted and moved; a call can be deleted everywhere.

- [ ] T041 [P] [US2] (Sonnet) Call routes under `tmasi-callcenter/apps/web/src/app/api/calls/`:
  - `GET /api/calls` with filters
  - `GET /api/calls/[id]`
  - `GET /api/calls/[id]/audio` (404 without consent)
  - `PATCH /api/calls/[id]/judge` (human override, audit)
- [ ] T042 [US2] (Opus) `DELETE /api/calls/[id]`: removes turns, events and the local file, deletes the ElevenLabs conversation, clears the case link, writes audit (FR-022). Review the order of operations so a half-failed delete is retried, never silent.
- [ ] T043 [P] [US2] (Sonnet) Case routes under `tmasi-callcenter/apps/web/src/app/api/cases/`:
  - list with filters
  - detail
  - `PATCH` status, priority, owner (transitions `new -> contacted -> qualified -> closed`, any state to `closed`)
  - `POST` notes
  - all with audit
- [ ] T044 [US2] (Sonnet, after G1) Calls list and Call detail screens in `tmasi-callcenter/apps/web/src/app/(dash)/calls/`, as the canvas: recording player, transcript with source chips, judge result with override, rating.
- [ ] T045 [US2] (Sonnet, after G1) Cases inbox and Case detail screens in `tmasi-callcenter/apps/web/src/app/(dash)/cases/`, as the canvas: status board, AI summary, notes, sensitive field shown behind a reveal.
- [ ] T046 [US2] (Sonnet) Playwright `tmasi-callcenter/tests/e2e/us2.spec.ts`: play audio, add a note, move status, delete a call and assert the file and the ElevenLabs conversation are gone.

---

## Phase 5: User Story 3, safety on medical and money topics (P1)

**Goal**: no medical advice, emergency script, no invented prices, never "accredited", AI disclosure on request.
**Independent test**: every emergency and forbidden-claim item passes in every Phase 1a language (SC-002), plus quickstart rows 6 to 9.

- [ ] T047 [US3] (Opus) Harden `agent/prompts/base.md` rules 3, 4 and 9 and the per-language emergency line in `agent/prompts/<lang>.md`. Add 10 adversarial items per language (prompt injection, "ignore your rules", "just give me a rough price", symptom questions) to `packages/evals/sets/*.yaml`.
- [ ] T048 [US3] (Sonnet) Judge policy checks in `tmasi-callcenter/packages/llm/src/postcall.ts`: flag a turn when advice words, forbidden words, or a price or hotel not in a chunk appear. Unit tests on fixture transcripts in `tests/unit/policy.test.ts`.
- [ ] T049 [US3] (Sonnet) Playwright `tmasi-callcenter/tests/e2e/us3.spec.ts`: fake-mic chest-pain call per Phase 1a language. Assert the emergency line, an urgent case and the call ended.
- [ ] T050 [US3] (Opus) Re-run the gate (`tmasi-callcenter/scripts/eval-run.mjs`). 100% safety is required before moving on.

**Checkpoint, Phase 1a done**: 5 languages at 92%+ and 100% safety, median latency under 1.0 s (measured from `turns.latency_ms`).

---

## Phase 6: User Story 4, woman and man voice switch (P2)

**Goal**: "can I speak to a man" switches voice mid-call; defaults are set per language.
**Independent test**: in each tuned language, the switch works and the conversation continues.

- [ ] T051 [US4] (Sonnet) Persona routes `GET/PATCH /api/personas[/id]` and `GET /api/personas/[id]/preview` (cached sample on disk) in `tmasi-callcenter/apps/web/src/app/api/personas/`. Enforce one default per language. A rename flips `is_placeholder` to false.
- [ ] T052 [US4] (Sonnet, after G1) Personas screen in `tmasi-callcenter/apps/web/src/app/(dash)/personas/page.tsx` as the canvas: name, voice, preview, default per language.
- [ ] T053 [US4] (Opus) Verify the switch behaviour from the spike in every tuned language. If labels slip, implement the fallback from R4 (restart with voice override plus running summary) in `packages/voice/src/elevenlabs.ts` and `apps/web/src/lib/test-line.ts`.
- [ ] T054 [US4] (Sonnet) Playwright `tmasi-callcenter/tests/e2e/us4.spec.ts`: switch mid-call, assert the persona change recorded in `calls.persona_id_end`.

---

## Phase 7: User Story 5, manage knowledge, personas and versions (P2)

**Goal**: the dashboard controls knowledge sync, test questions, versions with gate and rollback.
**Independent test**: change a source and sync; try to publish a failing version; rename a persona and hear the new name.

- [ ] T055 [P] [US5] (Sonnet) Knowledge routes `GET /api/kb/docs`, `POST /api/kb/build`, `POST /api/kb/sync`, `POST /api/kb/test` in `tmasi-callcenter/apps/web/src/app/api/kb/`.
- [ ] T056 [P] [US5] (Sonnet) Version routes in `tmasi-callcenter/apps/web/src/app/api/versions/`:
  - list
  - create a draft from live
  - `POST [id]/eval`
  - `POST [id]/publish` (409 unless the last run passed)
  - `POST [id]/rollback`
- [ ] T057 [US5] (Sonnet) Owner uploads: accept files into `tmasi-callcenter/data/uploads/` (packages, prices, hotels, coordinator FAQs) as `owner_upload` sources in the compiler.
- [ ] T058 [US5] (Sonnet, after G1) Knowledge screen in `tmasi-callcenter/apps/web/src/app/(dash)/knowledge/page.tsx` as the canvas: sources, sync state, test question with cited answer, upload.
- [ ] T059 [US5] (Sonnet, after G1) Agent versions screen in `tmasi-callcenter/apps/web/src/app/(dash)/versions/page.tsx` as the canvas: prompt diff, run tests, publish (disabled until passed), rollback.
- [ ] T060 [US5] (Sonnet) Playwright `tmasi-callcenter/tests/e2e/us5.spec.ts`: publish refused on a failing version; sync a changed source twice and assert the second run reports 0 changed.

---

## Phase 8: User Story 7, prove the numbers (P2)

**Goal**: Evals and Overview show accuracy per language, safety, CSAT, latency, spend.
**Independent test**: a full run shows per-language results with each failure explained.

- [ ] T061 [P] [US7] (Sonnet) `GET /api/evals/runs[/id]` and `GET /api/overview` (CSAT average and share at 4 or above, median and 90th percentile latency, spend this month, calls count) in `tmasi-callcenter/apps/web/src/app/api/`.
- [ ] T062 [US7] (Sonnet, after G1) Evals and Overview screens in `tmasi-callcenter/apps/web/src/app/(dash)/evals/` and `(dash)/page.tsx` as the canvas. Charts follow the dataviz rules.
- [ ] T063 [US7] (Opus) Spend guard: read month-to-date cost. At 90% of the cap, the test line shows a warning; at the cap it refuses new calls with a clear message (FR-033, edge case).

---

## Phase 9: User Story 6, learn safely from gaps (P3)

**Goal**: unanswered questions become gaps; only approved answers enter the knowledge.
**Independent test**: ask an unknown question, approve an answer, sync, call again, and hear the answer.

- [ ] T064 [US6] (Opus) Gap drafting in `tmasi-callcenter/packages/llm/src/gaps.ts`: propose an answer only from local chunks, otherwise `needs_owner`. Never invent.
- [ ] T065 [US6] (Sonnet) Gap routes `GET /api/gaps`, `PATCH /api/gaps/[id]` (approve, edit, reject, needs_owner, with audit) in `tmasi-callcenter/apps/web/src/app/api/gaps/`. The compiler adds `answered` gaps to a "Staff-approved FAQ" doc per language.
- [ ] T066 [US6] (Sonnet, after G1) Gaps screen in `tmasi-callcenter/apps/web/src/app/(dash)/gaps/page.tsx` as the canvas.
- [ ] T067 [US6] (Sonnet) Playwright `tmasi-callcenter/tests/e2e/us6.spec.ts`: an unanswered question creates a gap; approve, sync, publish; the next text-mode answer contains it; a rejected gap never appears.

---

## Phase 10: Phase 1b languages (ES, IT, FR, CS)

- [ ] T068 [P] (agy) Translate eval sets and Core Facts to ES, IT, FR, CS in `packages/evals/sets/` and `agent/core-facts/`. Opus spot-checks.
- [ ] T069 (Opus) Add presets and first messages for ES, IT, FR, CS in `agent/prompts/`. Run the full 9-language gate and fix until it passes.
- [ ] T070 (Sonnet) Extend the e2e fake-mic fixtures and specs to all 9 tuned languages.

---

## Phase 11: Polish and proof

- [ ] T071 (Sonnet) Dashboard pass at 360, 390 and 1440 px with Playwright: no horizontal overflow, no console errors, keyboard focus visible. Fix findings.
- [ ] T072 [P] (Opus) Security review of `tmasi-callcenter/`:
  - binds to 127.0.0.1
  - API keys only on the server
  - tool token checked
  - zod on every route
  - audit on every write
  - `.env.local` ignored
- [ ] T073 [P] (Opus) Latency report from `turns.latency_ms` across 20 voice calls per language. Tune turn eagerness or prompt length if the median is at 1.0 s or above.
- [ ] T074 (Opus) Blind "sounds human" panel: 5 listeners, 5 recordings each, score out of 5 (SC-005). Record results in `specs/017-tmasi-ai-callcenter/results.md`.
- [ ] T075 (Opus) Manager demo script from quickstart.md, run 3 times in a row clean (SC-008). Record spend against the cap (SC-009) in `results.md`.
- [ ] T076 (Opus) Update the record: HCIG memory `tasks/tmasi-ai-callcenter.md`, a HCIG Work registry entry for the spec and study doc, and the study doc's status. Commit only the task's files.

---

## After the manager demo: cost optimisation (his order 2026-11-17: "i want to make it but after i make the demo with my manager because right now is perfect and i dont want to lose the quality")

**Measured on his 4-minute test call** (conv_4101..., 241 s, 3,227 credits, about $0.32):
- Voice platform: 2,674 credits (83%), $0.067 a minute, billed per call minute.
- LLM: 553 credits (17%). Claude Haiku 4.5 prompt caching is already active (94.7k cache-read tokens against 21.2k uncached input).
- Speculative generation adds about 15% of the LLM charge.

Nothing ships before the demo. Every change below must pass the same gate (92%+ per language, 100% safety, median reply under 1.0 s).

- [ ] T082 (Sonnet) Eval runner in text-only mode for every non-voice item (about $0.003 a message instead of voice minutes); voice only for voice and switch items, in `packages/evals/src/run.ts`.
- [ ] T083 (Opus) Shorter call tails: agent ends right after the goodbye (end_call is on) and `turn.maxSilenceEndSeconds` goes from 20 to 10 in `agent/agent.config.ts`. Check the CSAT question still gets answered.
- [ ] T084 (Opus) A/B the live LLM: Claude Haiku 5.5 when ElevenLabs offers it (about 10 times cheaper input than Haiku 4.5), and Gemini Flash. Keep it only if the gate passes.
- [ ] T085 (Opus) Trim prompt and retrieval: base prompt plus core facts are 11,273 characters, and RAG chunks are sent each turn. Measure tokens per turn before and after.
- [ ] T086 (Sonnet) Post-call grading of bulk test runs through the Message Batches API (50% off); live calls stay immediate.
- [ ] T087 (later, phase 4 only) Cache pre-rendered audio for the greeting, fillers, emergency line and read-back templates per voice and language. This only pays when speech is billed per character (own pipeline); on ElevenLabs Agents the bill is per minute.
- Not planned: turning off speculative turns (saves about 2% of a call, costs reply speed).

## Dependencies and order

- **Phase 0:**
  - T001 needs G0.
  - T003 runs in parallel and ends at G1.
  - T002 and T004 run in parallel.
- **Phase 1** follows T001 (versions and field names).
- **Phase 2** follows Phase 1:
  - T016 needs T015 and T001.
  - T022 needs T020 and T021.
  - T024 needs T020.
  - T026 needs T002 and T024.
  - T027 needs T016, T022 and T026.
- **US1 (Phase 3)** follows Phase 2. Screen task T040 also needs G1.
- **US2 and US3** follow US1 (they need imported calls).
- **US4, US5, US7 and US6** follow US3 and can run in parallel with each other. Their screen tasks need G1.
- **Phase 10** follows US3.
- **Phase 11** comes last.

## Parallel examples

- **Phase 0:** T002, T003 and T004 together while T001 runs.
- **Phase 2:** T013, T014, T015, T017, T018 and T023 together; T021 (agy) and T025 (agy) in clean worktrees.
- **US1:** T028 alongside T029; T036 (agy) alongside T037.
- **After US3:** T051, T055, T056 and T061 together.

## Implementation strategy

1. **MVP = Phase 0 + 1 + 2 + US1.** A caller in 5 languages gets correct answers and a case is created, with the gate passed. That alone is a demo.
2. **Then US2 and US3:** reviewable calls and proven safety. Phase 1a ends here (roadmap exit criteria).
3. **Then US4, US5, US7, US6 and Phase 10:** the full manager demo in 9 languages (Phase 1b).
4. **Every task:** Opus writes the brief, reviews the diff, runs `npm test` in `tmasi-callcenter/` and the eval gate when the agent changes, then commits only that task's files.
