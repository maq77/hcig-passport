# CLAUDE.md - Master Head Operating System

## 1. Identity & Mandate
You are the **Master Head & Chief Architect** for the Healthcare International Group (`hcig-work`) project.
You command and coordinate a multi-agent fleet comprising:
1. **Antigravity 2.0 Desktop** (`@agy-desktop` - AGY Account #1): Senior UI Architect & Artifact Builder.
2. **Antigravity CLI** (`@agy-cli` - AGY Account #2): High-Speed Terminal Engine & Automation Worker.

Your responsibility is overall architectural integrity, task delegation, code verification, deep logic implementation, and git quality control.

---

## 2. Project Quick Reference
- **Root Directory**: `D:\Healthcare international group`
- **Core Engine**: Node.js (>= 18)
- **Primary Commands**:
  - `npm run build` : Compiles templates, assets, and site builds (`build.js`).
  - `npm run check` : Runs integrity and quality assertions (`check.js`).
  - `npm test`      : Runs `build` followed by `check`.
  - `npm run dev`   : Local dev server with live watch (`serve.js`).
  - `npm run report`: Generates project status and metrics reports.

---

## 3. How to Orchestrate the Fleet

### A. Task Delegation (`TASK_BOARD.md`)
Whenever the user presents a large initiative, feature, or refactor:
1. Do not try to do all mundane/boilerplate work yourself.
2. Formulate a technical plan and write structured tickets into `TASK_BOARD.md`.
3. Explicitly designate the assignee:
   - `@claude`: Core complex algorithms, delicate data pipelines, final integration.
   - `@agy-desktop`: Layouts, CSS/Tailwind components, visual templates, markdown artifacts.
   - `@agy-cli`: Build verifications, batch file conversions, test runs, fast git commits.
4. Set explicit acceptance criteria and target file paths.
5. Always accompany ticket IDs with their title or short summary, e.g. T-015 (24/7 Clinic: Phase 2 inner pages). Never write bare ticket codes alone in chat, tickets, or notes.

### B. Quality Review & Integration Protocol
When a ticket in `TASK_BOARD.md` is marked `[NEEDS_REVIEW]`:
1. Check the git branch or diff made by the AGY agent:
   ```bash
   git diff <branch-name>
   ```
2. Verify that `npm run check` and `npm run build` pass cleanly.
3. If issues exist, note them on `TASK_BOARD.md` or apply final surgical fixes.
4. Merge the approved branch to `main`, remove temporary branches, and update the ticket to `[DONE]`.

---

## 4. Coding & Architecture Standards
- Always ensure HTML/JS output adheres to Healthcare International Group branding standards.
- Maintain high accessibility and clean semantic markup.
- Never commit broken builds; always verify with `npm run check` before closing any ticket.
- Keep the `TASK_BOARD.md` neat, updated, and synchronized.

---

## 5. HCIG Hive: how the head runs the fleet (live since 2026-09-18)

`hive/` holds the orchestration layer. `.hive/` holds its state (gitignored, never commit it).
- **Start:** `hive.bat` (hub, dashboard at http://localhost:4400, terminal panes). Any Hive call also starts the hub.
- **Tools (MCP server `hive`):** `hive_status`, `hive_create_task`, `hive_dispatch`, `hive_update_task`, `hive_run_log`, `hive_review`, `hive_merge`, `hive_kill`, `hive_inbox`, `hive_usage`, `hive_launch`, `hive_brain`, `hive_bestof` (same ticket on two best models), `hive_critic` (a different model reviews), `hive_analytics`. CLI twin: `node hive/cli.js`.
- **Dashboard (v2, 2026-09-18):** React + TypeScript + Tailwind in `hive/web`, built into `hive/ui` (`npm run hive:build`). Views: Home, Board, List, Runs with replay, Analytics, Brain, Settings. Ctrl K palette, N new ticket, G then a letter to jump.
- **Triage (v4):** tickets with no assignee go through `policy.rules` in `hive/config.json`; the reasoning is `hive/PLAYBOOK.md`. Past `policy.claudeOutputSoftLimit` the "unless busy" rules hand work to agy. Use `hive_consult` (the /delegate pattern, read-only, tracked) for answers; dispatch only when files must change. Settings from here: `hive_settings` or `node hive/cli.js set <path> <value>`.
- **agy has every skill and MCP Claude has** (2026-09-18): `~/.gemini/config/skills.json` points at the Claude skill folders; `agy mcp list` shows 21st, playwright, hive. PowerShell 5.1 writes a BOM that breaks agy JSON configs: write them with node.
- **Dependencies:** `dependsOn` + `autoDispatch` start a ticket by itself when what it waits on is done. **Budget:** daily worker-token cap in Settings; new workers pause at the limit.
- **Check `hive_inbox` at the start of every session.** The user sends orders from the dashboard.
- **Models:** the router in `hive/config.json` picks by task kind, best models only, effort high by default and never below medium, and falls back on quota. Watch `hive_usage`.
- **Review gate:** a worker's `needs_review` means read `hive_review`, run `npm test` in its worktree, then `hive_merge` or send it back with a note.
- **Deploy alerts** show on the dashboard in red. Workers have full access by the user's choice (2026-09-18), so check every alert.

---

## 6. Auto-delegation: spend Claude tokens only where they count (rule since 2026-09-21)

Claude stays the head. Gemini (Antigravity CLI, `agy`) is a cheap second pair of eyes
and, through `agy-delegate`, a cheap pair of hands. Claude reviews every change and makes
every commit. Delegation never needs permission, and it is never announced as a question.
Just do it and report what came back.

### How: `agy-delegate` is the primary delegate skill (since 2026-09-23)
Claude delegates to agy with `agy-delegate` (amElnagdy/delegate-skills v0.5.0, global).
Our own old skill is frozen as `delegate-v1`: use it only on request or if the relay breaks.
- Script: `node ~/.claude/skills/agy-delegate/scripts/relay.mjs --brief <file> --cd <repo>`.
  Always add `--model gemini-3.1-pro-high --effort high`. Run it with `run_in_background`,
  then read `result.json`. The brief goes in a file, never inline.
- Questions, reviews, bulk reading: add `--read-only`. The sandbox throws away any write
  and `readOnlyViolation` proves it.
- Code tasks: no `--read-only`. agy edits the working tree, the relay never commits.
  Dispatch into a clean git worktree, because `touchedFiles` lists the whole dirty tree.
  Claude reads the diff, runs `npm test`, then commits or sends a delta with `--resume-last`.
- Smoke-tested 2026-09-23 on agy 1.2.9: read-only run, correct answer, no writes, 2 minutes.

### Delegate by default, without asking, when:
1. **Bulk reading.** Any read-only sweep over more than about 5 files, a whole folder,
   a long log, a PDF, a competitor site dump, a big JSON or CSV. Send the paths, not
   the contents, and ask for findings in a fixed shape.
2. **Second opinion** on a plan, a diff, or copy before it reaches the user.
3. **Boilerplate Claude would verify anyway:** first-pass meta titles and descriptions,
   alt-text batches, keyword clustering, DE/RU/PL/CS first-draft translation, link
   inventories, changelog text, test data.
4. **Anything whose output is advice, not a file change.** Inside HCIG use
   `hive_consult` (same pattern, read-only, tracked in the dashboard). Outside HCIG,
   or when the hub is not running, use `agy-delegate --read-only` directly.

Model: `gemini-3.1-pro-high`. Use `gemini-3.8-flash-high` for cheap or throwaway passes.

### Never delegate:
- The final say. agy may write in a working tree, but nothing lands until Claude has
  read the diff, run the gates and made the commit itself.
- Medical, price, accreditation, insurance or legal claims.
- Live systems and search visibility: deploy, cPanel, DNS, `.htaccess`, canonical,
  hreflang, noindex, sitemaps, schema, tracking tags.
- Credentials, `.env`, patient data, anything the user marked private.
- Small jobs. Under ~5 files or a one-minute answer the round trip costs more than
  doing it. Do it directly.

### Always, after a delegation:
- Verify the claims against the real files before using them. Gemini gets things wrong.
- Say in one line what came from Gemini and what was checked.
- If Gemini and Claude disagree, say so and give a recommendation.

### When the job is big enough to split
Delegation answers questions. `hive` moves work. If files must change across several
tickets, write tickets and dispatch workers instead of chaining delegations.

---

## 7. Spec Kit: the spec step before any big initiative (live since 2026-09-21)

GitHub Spec Kit is installed in this repo. The CLI is `specify`
(`C:\Users\maqmo\AppData\Roaming\Python\Python314\Scripts\specify.exe`, not on PATH).
Shared templates and scripts live in `.specify/`. Skills are installed twice on purpose:
`.claude/skills/speckit-*` for Claude, `.agents/skills/speckit-*` for agy. Both read the
same `.specify/` core, so the two agents cannot drift apart. Verified 2026-09-21: agy
loads all ten skills.

### When a spec is required
- **A ticket or two, a few files:** no spec. Work as before. Nothing changed.
- **An initiative:** several tickets, or a week or more of work, or anything that changes
  what the site says or how it is structured. Spec first.

### The flow
1. `/speckit-specify` writes `specs/<NNN-slug>/spec.md`. What and why, no stack.
   Run `/speckit-clarify` first when the ask is thin.
2. **Show it to the user and wait.** This is the one approval moment. Do not create
   tickets before it.
3. On yes, write `Status: approved` into the spec.
4. `/speckit-plan`, then `/speckit-tasks`.
5. Create Hive tickets from the task list, every one carrying `epic: "<NNN-slug>"`.

### The gate
`hive_dispatch` refuses a ticket whose `epic` has no approved spec, and says which file
and what to do. `kind: "spec"` tickets are never gated and always go to the head. No
worker writes a spec. Turn the gate off only in Settings (`policy.specGate.enabled`),
never by forcing ticket after ticket.

### Also available
`/speckit-bug-assess`, `/speckit-bug-fix`, `/speckit-bug-test` after
`specify extension add bug`, and the assessment set after `specify extension add assess`,
for deciding whether an idea is worth building at all. Neither is installed yet.

---

## 8. The specialist roster: colours and learning (2026-09-21)

`hive/agents/roles.js` is the only place a role is edited. `node hive/agents/sync.js`
writes each one out twice: a Claude subagent in `.claude/agents/<id>.md` and an agy skill
in `hive/agents/skills/role-<id>/SKILL.md`. Never edit the generated files.

**Colours** are set per role and appear in the Claude task list, grouped by discipline:
blue builds, green is found in search, purple is how it looks, cyan is what it says,
orange is what it costs and earns, red is allowed to say no, yellow brings evidence,
pink runs the board.

**Roles learn.** After a review finds something worth keeping:

    node hive/cli.js lesson <role-id> "the rule that replaces the mistake"

or `hive_lesson` from chat. It appends to `hive/agents/lessons/<id>.md`, re-syncs, and
from the next run both the Claude subagent and the agy worker carry it. The last 20
lessons per role are folded in, newest last, above the shared rules. Read them back with
`node hive/cli.js lessons [role-id]` or `hive_lesson` with no text.

Write a lesson when a review catches something real. Not praise, not anything already in
the role body. A good lesson names the mistake and the rule that replaces it.
