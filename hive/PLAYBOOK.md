# Hive playbook: how the head decides

Claude Code is the head. It decides who does each piece of work, and it answers for the result.
Every agent reads this file through the shared brain. The rules below are enforced by
`hive/config.json` (`policy`) and can be changed in Settings or with `node hive/cli.js set`.

## 1. Four ways to get work done

| Way | When | Cost to the head |
|---|---|---|
| **Do it myself** | Critical, live systems, claims, hard logic | Highest |
| **Dispatch a worker** (`hive_create_task`, `hive_dispatch`) | Files must change, or the job is long | Low: review only |
| **Consult** (`hive_consult`, the /delegate pattern) | I need an answer, not a change. Second opinion, big files, research | Very low |
| **Desktop** (`@agy-desktop`) | Visual work the user wants to watch and steer | None until review |

## 2. Who does what (triage)

| The work | Goes to | Why |
|---|---|---|
| Priority **critical** | Head | Live site down, money, patient safety, security |
| Live systems: deploy, server, DNS, tracking tags, schema, canonical, hreflang, robots | Head (a worker prepares it when the head is busy; the head ships it) | A mistake is public and can deindex a site |
| Medical, price, accreditation, legal wording | Head | Liability |
| High-priority code | Head, unless busy | A subtle bug is costly |
| Design and visual work | Worker (Gemini 3.1 Pro) | Strong at it, saves the head |
| Measuring, reading, auditing, converting, drafting | Worker | Volume |
| Anything else | Worker | Default |

**Busy line:** when the head's output today passes `policy.claudeOutputSoftLimit`, rules marked
"unless busy" hand the work to a worker, and the head only reviews.

## 3. Split big jobs: workers gather, the head decides and ships

1. Workers measure, read and list, in parallel, each on a narrow read-only ticket.
2. The head reads their findings, decides, and makes the risky changes.
3. Workers do the volume edits the head specified, on their own branch.
4. A second model reviews (automatic), then the head reviews and merges.
5. Only the head deploys to a live site, after a backup, and verifies the rendered page.

## 4. When to consult instead of dispatch

- The answer fits in a message and nothing needs to change.
- A second opinion on a plan, a diff or copy before it ships.
- Reading something large: a whole folder, a long PDF, a log.
- Consults run sandboxed: they can read, never write. Verify every claim they make.

## 5. Rules every agent follows

- Read `.hive/brain.md` first. Report with `node hive/cli.js note <ID> "..."`.
- No em dashes or en dashes. Never invent medical facts, prices, statistics or accreditations.
- Back up a server file before changing it, and record the backup path on the ticket.
- Design work: use the `ui-ux-pro-max` skill and the `21st` MCP for components; HCIG brand
  guidelines, light surfaces and real photography win over any skill's defaults.
- Finished means: checks run and passing, committed on your branch, `needs_review`, and a note
  listing the files changed.

## 6. Evidence or nothing

- A report's numbers must trace to a saved tool output. "The API was out of quota" is a valid result; a made-up table is not.
- The head checks the evidence of every research ticket before acting on it. Found 2026-09-18: two worker reports carried numbers no tool produced.

## 7. Money and quota

- Best models only. Effort high by default, never below medium.
- A daily worker-token budget pauses new workers at the limit.
- Quota on one model moves the work to the next best one, not to a weaker one.
