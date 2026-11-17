# Contract: client tools (agent to browser to local API)

The agent calls these tools during a live call. The test line page registers them with the ElevenLabs React SDK (`clientTools`). Each tool runs with "wait for response" on, POSTs to the local API, and returns a short string or JSON that the agent reads.

**Before a tool call:** the agent says one filler in the caller's language ("One moment, let me note that"). Phase 0 checks whether the tool's own pre-tool speech setting can carry it.

**Errors:** every tool returns `{ ok: false, say: "<short line>" }` on failure. The agent reads `say` and carries on; it never reads error details aloud.

## capture_lead

Saves or updates the caller as a contact. It is called once the caller has given at least a name and one way to contact them.

| Arg | Type | Rule |
|---|---|---|
| name | string | 1 to 120 chars |
| country | string | ISO 3166 alpha-2 or a country name |
| lang | string | BCP-47 of the conversation |
| phone | string? | E.164 after normalising; read back to the caller before the call |
| email | string? | valid email |
| interest | string | 1 to 500 chars, the caller's own words, short |
| preferred_contact_time | string? | free text |
| sensitive_note | string? | any medical detail the caller volunteered, max 1,000 chars, flagged sensitive |

- **Rules:** at least one of `phone` or `email` is required. Unknown fields are rejected (FR-018).
- **Returns:** `{ ok: true, contact_id, returning: boolean }`. When `returning` is true, the agent may say "welcome back".

## open_case

Opens a case for the contact on this call.

| Arg | Type | Rule |
|---|---|---|
| contact_id | string | from capture_lead |
| type | enum | lead, assistance, urgent |
| interest | string | short |
| priority | enum? | normal, high, urgent (urgent forced when type = urgent) |

- **Returns:** `{ ok: true, case_id, say }`, where `say` is a localised line, for example "A coordinator will contact you within one working day."
- **Response time:** that promise is shown in the dashboard as a setting; by default it says "soon", until he sets a real time.

## switch_persona

Records a switch between the woman and the man voice in the current language.

| Arg | Type | Rule |
|---|---|---|
| gender | enum | female, male |
| lang | string | current language |

- **Returns:** `{ ok: true, label, display_name }`. The agent then speaks inside `<label>...</label>` and introduces itself with `display_name` (R4).
- **If the switch fails:** the agent keeps the current voice and says so politely.

## end_call_csat

Stores the satisfaction answer at the end of the call.

| Arg | Type | Rule |
|---|---|---|
| score | integer | 1 to 5 |
| comment | string? | max 300 chars |

- **Returns:** `{ ok: true }`. The agent thanks the caller and ends the call.

## save_note (added 2026-11-17)

Keeps running notes during the call (FR-034). "Wait for response" is **off**, so the call never waits for it.

| Arg | Type | Rule |
|---|---|---|
| key | enum | name, need, dates, contact, preference, question, other |
| value | string | max 300 chars |

- **Returns:** nothing the agent waits for.
- **Memory:** the conversation itself is the agent's memory. The prompt forbids asking again for anything already given, in any language, and requires a short read-back before the end of the call (FR-035).

## Not tools (handled by the platform or by import)

- **Language switch:** the system language detection tool (R5).
- **Emergency:** the agent says the emergency line, then calls `open_case` with `type=urgent`, then ends the call. If no contact details were given, the import job still opens an urgent case on the call.
- **Knowledge gaps:** found by the post-call judge, not by a live tool, so live latency stays low.
