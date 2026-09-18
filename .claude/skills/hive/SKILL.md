---
name: hive
description: Run the HCIG Hive as the head. Plan a job, split it into tickets, route each to the right agent and model, dispatch Antigravity workers, watch them, review and merge. Use when the user says /hive, "split this up", "give this to agy", "use the agents", "run it in parallel", or hands over any job big enough to share across workers.
---

# /hive: plan, split, dispatch, watch, review

Claude is the head. Workers do the volume. Claude keeps architecture, live-site risk and the final check.

## 1. Read the room
Call `hive_status` and `hive_inbox`. Unread orders from the dashboard come first.

## 2. Split the job
Each ticket must stand alone, because the worker starts cold:
- One outcome, one folder, no overlap with another ticket's files (overlap means merge conflicts).
- A full description: what, where, why, the exact files, the rules that apply.
- 2 to 5 acceptance criteria a script or a screenshot can prove.
- A `kind` when it is obvious: `design`, `content`, `code`, `review`, `bulk`, `research`.

Who takes what:
| Work | Goes to |
|---|---|
| Architecture, live-site logic, anything touching patient safety, final integration | `@claude` (keep it) |
| Bulk edits, conversions, translations, audits, test runs, research over big folders | `@agy-cli` (dispatch) |
| Visual layouts, artifacts, work he wants to watch and steer by hand | `@agy-desktop` (board only) |

## 3. Dispatch
`hive_create_task` with `dispatch: true`, or `hive_dispatch` on an existing ticket. Let the router pick model and effort unless there is a reason. The rules: best models only, effort high by default, never below medium.
Parallel is fine when tickets touch different files. Keep to each account's `maxParallel`.

**Best of N** for design or copy options: create two tickets with the same brief, force different models (`claude-opus-4-6-thinking` and `gemini-3.1-pro-high`), and put both results in front of the user.

**Critic pass** for anything risky: after a worker finishes, dispatch a `review` ticket on its branch with a different model from the one that wrote it.

## 4. Watch
`hive_status` for the fleet, `hive_run_log` for a single run. A red `deploy.alert` event means a worker ran a server command: read its log straight away and check the live URL.
On `quota` events the router already moved to the next model. If every model is resting, say so.

## 5. Review and merge
Use `/review-agent <ID>` for each `needs_review` ticket. Never merge on the worker's word alone.

## 6. Report
Tell the user in short lines: what was split, who took what, what is done, what waits for them. Update the HCIG Work registry if a deliverable changed state.
