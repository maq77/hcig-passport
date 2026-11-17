# Implementation Plan: TMASI AI Call Center, V1 local demo

**Branch**: `017-tmasi-ai-callcenter` | **Date**: 2026-11-17 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/017-tmasi-ai-callcenter/spec.md` (approved 2026-11-17)

**Technical source**: the approved study `C:\Users\maqmo\.claude\plans\lets-do-one-big-mighty-walrus.md` and the study doc https://claude.ai/artifact/P4Bf96ddhvp7Tszv2J1dRo .

## Summary

A new local app, `tmasi-callcenter/`, runs on his laptop at 127.0.0.1.
- **Live voice:** ElevenLabs Agents does it: Eleven v4 Turbo expressive voices, a woman and a man voice per language, language detection, built-in knowledge search, and Claude Haiku 4.5 as the live model.
- **Our app:** holds everything else in an embedded Postgres (PGlite with pgvector): calls, turns, contacts, cases, notes, knowledge, personas, agent versions, tests, gaps and the audit log.
- **The browser test line:** runs four client tools that call our local API, so no public URL is needed.
- **After each call:** the app pulls the transcript, analysis and MP3 from the Conversations API, then Claude Sonnet 5.5 writes the summary, extracts the case fields and grades the call.
- **Adapters:** the voice runtime, the LLM and the knowledge search each sit behind one. That way phone numbers, handover, booking, WhatsApp, outbound and a custom pipeline plug in later without a rebuild.
- **Dashboard:** its screens are designed on a Claude Design canvas and built only after his pick.

**Amended 2026-11-17 (spec amendment):**
- Talking demo first, on a plain private test page; the dashboard follows after the canvas pick.
- Language switching at any moment (FR-002a).
- Memory within one call only (FR-034 to FR-036), with a fire-and-forget `save_note` tool and a `call_notes` table.
- Paid: ElevenLabs only, plus a small prepaid Claude credit.

The revised task order is at the top of tasks.md.

## Technical Context

**Language/Version**: TypeScript 5.x, Node 24 (installed: v24.12.0), ESM.

**Primary Dependencies** (exact versions locked in Phase 0 after `npm view`):
- next 16.4, react 19
- @elevenlabs/react 1.22 (browser session and client tools)
- @elevenlabs/elevenlabs-js 2.79 (server: agent config, knowledge upload, conversations, audio, delete)
- @anthropic-ai/sdk (post-call summary, extraction, judge, test-set drafting)
- @electric-sql/pglite 0.5 with the vector extension, drizzle-orm 0.45 plus drizzle-kit
- @huggingface/transformers with a multilingual-e5 model (local embeddings, no key)
- zod, Auth.js credentials plus argon2
- Tailwind 4 plus shadcn/ui (only where the approved canvas needs it)

**Storage**:
- PGlite data directory `tmasi-callcenter/data/pg/`.
- Recordings at `data/recordings/YYYY/MM/<callId>.mp3`.
- Compiled knowledge at `data/kb/`.
- All of `data/` is gitignored. Everything is kept until deleted (FR-022).

**Testing**:
- Vitest for core logic: tool validation, guardrail rules, case extraction mapping, gate math.
- The eval runner (`npm run eval`) in text mode against the live agent version.
- Playwright on the test line with a fake microphone (one WAV per tuned language).
- Playwright on the dashboard at 360, 390 and 1440 px.
- The root repo `npm test` stays green (the app lives outside the HCIG Work build).

**Target Platform**: Windows 11 laptop, Chrome or Edge, internet needed during calls. The app binds to 127.0.0.1 only.

**Project Type**: Local full-stack web app (dashboard plus API) with a hosted voice service, set up as an npm workspaces monorepo.

**Performance Goals**:
- Median voice-to-voice reply under 1.0 s, 90th percentile under 1.6 s (SC-004).
- Dashboard pages render in under 1 s on the laptop.
- A call is imported, summarised and graded within 60 s after hang-up.

**Constraints**:
- Under $100 a month (FR-033): ElevenLabs Free tier for the spike, Creator for the build, spend caps in both consoles.
- No public endpoint, no Docker.
- Test callers only, no real patients (spec Assumptions).
- AI disclosure plus recording consent in the first turn (FR-003).
- The agent says only what the knowledge holds (FR-009).
- No em dashes in any copy. Canvas before any screen code.

**Scale/Scope**:
- One admin user, about 150 test calls a month, 9 tuned languages, 18 personas.
- About 216 KB of knowledge today.
- 8 dashboard screens.
- About 1,080 test items (120 times 9 languages).

## Constitution Check

The project constitution is still the empty template, so the HCIG rules stand in as gates.

| Gate | Status |
|---|---|
| Spec approved before build (CLAUDE.md section 7) | Pass: approved 2026-11-17 |
| Canvas before code (2026-09-28, 2026-10-02) | Pass: dashboard screens are designed on Claude Design first; no screen code before his pick. API, data and agent work (invisible) may start before the pick |
| No invented content or claims (compliance) | Pass: the agent answers only from the knowledge base; never "accredited"; prices, hotels and packages only when present; the judge checks every claim |
| Medical safety | Pass: no diagnosis or treatment advice; the emergency script is tested at 100% in every language |
| AI never shown as real staff (2026-10-07) | Pass: personas disclose they are AI in the first turn and whenever asked |
| Privacy (GDPR, health data) | Pass for V1: test callers only, minimal fields, sensitive field flag, local storage, delete removes every copy. Real patients wait for Phase 2 with a DPA |
| Spend only on what matters (his order) | Pass: Free tier for the spike, Creator for the build, local embeddings, no hosting, caps set |
| Delegation (global rules) | Pass: Opus writes the agent prompt, guardrails, judge rubric and reviews every diff; Sonnet subagents and agy write code from approved tasks |
| No em dashes | Pass: copy check in the test suite |

Re-checked after Phase 1 design: unchanged, all pass.

## Project Structure

### Documentation (this feature)

```text
specs/017-tmasi-ai-callcenter/
├── spec.md              approved
├── plan.md              this file
├── research.md          decisions R1 to R12
├── data-model.md        tables, fields, states
├── quickstart.md        run and validate the demo end to end
├── contracts/
│   ├── client-tools.md      the 4 tools the agent calls in the browser
│   ├── local-api.md         /api routes the browser and dashboard use
│   ├── agent-config.md      agent.config.ts shape, personas, prompts, gate
│   └── knowledge-pipeline.md kb:build / kb:sync inputs and outputs
├── checklists/requirements.md
└── tasks.md             next step (/speckit-tasks)
```

### Source Code

```text
tmasi-callcenter/                 (new, npm workspaces, own package.json, own .gitignore)
├── apps/web/                     Next.js 16 app router, 127.0.0.1:3017
│   ├── src/app/(dash)/           test-line, calls, cases, knowledge, personas, versions, evals, gaps
│   ├── src/app/api/              el/token, tools/*, calls/*, kb/*, personas/*, versions/*, evals/*, gaps/*
│   └── src/components/           built from the approved canvas only
├── packages/core/                domain types, zod schemas, guardrail rules, cost math
├── packages/db/                  drizzle schema, migrations, PGlite singleton (to Neon later)
├── packages/voice/               VoiceRuntime interface + ElevenLabsRuntime
├── packages/llm/                 LlmProvider interface + AnthropicProvider, summary/extract/judge prompts
├── packages/kb/                  compiler, chunker, local embedder, ElevenLabs sync, KnowledgeProvider
├── packages/evals/               golden sets (yaml per language), runner, rubric, gate
├── agent/                        agent.config.ts, prompts/<lang>.md, core-facts/<lang>.md, personas.json
├── scripts/                      migrate, kb-build, kb-sync, agent-push, eval-run, import-call, seed-admin
├── tests/                        vitest unit, playwright e2e (fake-mic WAVs in tests/fixtures/)
└── data/                         gitignored: pg/, recordings/, kb/
```

**Structure Decision**: one standalone monorepo folder next to the other apps in the repo. It is not part of the root HCIG Work build (`build.js` does not touch it), so the root `npm test` is unaffected. A new HCIG Work registry entry links the spec and the study doc. Port 3017 avoids the other local dev servers.

## Phase plan (maps to roadmap phases 0, 1a, 1b)

1. **Phase 0, spike** (ElevenLabs Free tier, about half a day, scratch folder, nothing committed but notes).
   Each check confirms or replaces an R decision in research.md:
   - v4 Turbo with `supported_voices` and the label switch
   - language detection plus per-language presets
   - client tool round trip and pre-tool speech
   - text-only conversation mode for the eval runner
   - the Conversations API detail fields and the audio download
   - delete conversation
   - the latency fields in the metadata
   - a shortlist of 18 voices (2 per language)

   Notes go to `research.md` "Spike results".
2. **Canvas** (in parallel with the spike): dashboard screens on Claude Design, several complete directions, phone and desktop. He picks; code copies it exactly.
3. **Phase 1a, demo core**: monorepo, db, kb build and sync, agent config as code, test line plus 4 client tools, import job, summary and judge, then the Test Line, Calls and Cases screens. Languages: EN, DE, RU, PL, AR. Gate: 92%+ each, 100% safety, median under 1.0 s.
4. **Phase 1b, full demo**: the Knowledge, Personas, Versions, Evals and Gaps screens; ES, IT, FR and CS. Gate: 9 languages pass, the manager demo script clean 3 times in a row, spend under $100.

## Complexity Tracking

| Choice | Why needed | Simpler alternative rejected because |
|---|---|---|
| Three adapter interfaces (voice, LLM, knowledge) | He asked for scalability to "almost any and all features" and a path to a custom pipeline | Calling the vendor SDKs directly would tie cases, evals and dashboard to one vendor and force a rewrite at Phase 4 |
| Our own local vector index beside the ElevenLabs knowledge base | Test grading, citation checks and gap drafting need retrieval we control; it becomes the server-side search tool in Phase 2 | Relying on the vendor knowledge base alone gives no way to grade citations offline |
| Monorepo with packages | Phase 2 adds a cloud deploy and Phase 3 adds WhatsApp workers that reuse core, db, llm and kb | A single Next.js app would mix worker code into the web app later |
