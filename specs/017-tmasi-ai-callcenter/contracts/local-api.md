# Contract: local API (127.0.0.1:3017)

All routes are Next.js route handlers on the Node runtime.
- **Auth:** routes under `/api` need a session cookie (Auth.js) except `/api/auth/*`.
- **Tool routes:** they also need a per-call token minted with `/api/el/token` and sent by the test line.
- **Validation:** request bodies are validated with zod; on failure the route returns 400 `{ error }`.
- **Audit:** every write route writes `audit_log`.

## Session

| Method and path | Purpose | Returns |
|---|---|---|
| POST `/api/el/token` | Start a test call: picks the live agent version and default persona for the chosen language, mints an ElevenLabs conversation token server side, creates a per-call tool token | `{ conversationToken, toolToken, agentVersionId, persona }` |

## Tools (called by the client tools, see client-tools.md)

| Method and path | Body | Returns |
|---|---|---|
| POST `/api/tools/capture-lead` | capture_lead args + `conversationId` | `{ ok, contact_id, returning }` |
| POST `/api/tools/open-case` | open_case args + `conversationId` | `{ ok, case_id, say }` |
| POST `/api/tools/switch-persona` | switch_persona args + `conversationId` | `{ ok, label, display_name }` |
| POST `/api/tools/csat` | end_call_csat args + `conversationId` | `{ ok }` |

## Calls

| Method and path | Purpose |
|---|---|
| POST `/api/calls/import/:conversationId` | Pull details and MP3, store turns and latencies, run summary, extraction and judge. It is idempotent: a re-run replaces the turns and the judge result |
| GET `/api/calls` | List, with filters: lang, persona, date, judge pass, csat |
| GET `/api/calls/:id` | One call with its turns, chunks, judge result and case link |
| GET `/api/calls/:id/audio` | Streams the local MP3 (404 when there was no consent) |
| DELETE `/api/calls/:id` | Removes the local turns, events and file, and deletes the ElevenLabs conversation (FR-022) |
| PATCH `/api/calls/:id/judge` | Human override of the judge result (FR-031) |

## Cases

| Method and path | Purpose |
|---|---|
| GET `/api/cases` | Inbox, filtered by status, type, priority |
| GET `/api/cases/:id` | Case with contact, notes and call |
| PATCH `/api/cases/:id` | Status, priority, owner |
| POST `/api/cases/:id/notes` | Add a note |

## Knowledge

| Method and path | Purpose |
|---|---|
| GET `/api/kb/docs` | Sources with sync state |
| POST `/api/kb/build` | Runs the compiler (same as `npm run kb:build`) |
| POST `/api/kb/sync` | Uploads changed docs to ElevenLabs and re-embeds them locally |
| POST `/api/kb/test` | `{ question, lang }` returns the local top chunks plus a text-mode agent reply with citations |

## Personas, versions, tests, gaps

| Method and path | Purpose |
|---|---|
| GET/PATCH `/api/personas[/:id]` | Name, voice, default, active |
| GET `/api/personas/:id/preview` | A short voice sample (cached on disk after the first request) |
| GET/POST `/api/versions` | List, create a draft from live |
| POST `/api/versions/:id/eval` | Runs the gate in text mode |
| POST `/api/versions/:id/publish` | Refused with 409 unless its last run passed; pushes the config to the agent |
| POST `/api/versions/:id/rollback` | Makes a retired version live again |
| GET `/api/evals/runs[/:id]` | Results per language, failures with reasons |
| GET `/api/gaps`, PATCH `/api/gaps/:id` | Approve, edit, reject, needs_owner |
| GET `/api/overview` | CSAT average, share at 4 or above, median and 90th percentile latency, spend this month, calls count |
