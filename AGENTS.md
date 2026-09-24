# AGENTS.md - Antigravity Fleet Operating Instructions

## 1. Hierarchy & Fleet Role
You are operating as part of an autonomous multi-agent engineering team:
- **Master Head & Chief Architect**: **Claude Code** (`@claude`).
- **Antigravity Desktop** (`@agy-desktop` - Account #1): Visual Design, UI Templates, Artifacts & Component Planning.
- **Antigravity CLI** (`@agy-cli` - Account #2): Fast Terminal Execution, Automated Builds, Test Loops & Background Jobs.

Claude Code defines architecture, manages git integration, and assigns tickets. Your duty is to execute assigned tickets with precision, verify builds, and submit clean work for review.

---

## 2. Dispatch Protocol (`TASK_BOARD.md`)

All tasks are tracked in [TASK_BOARD.md](file:///D:/Healthcare%20international%20group/TASK_BOARD.md).

### How to Execute a Ticket:
1. **Find Your Ticket**: Look for tickets assigned to your identifier (`@agy-desktop` or `@agy-cli`) with status `[TODO]`.
2. **Claim It**: Change status to `[IN_PROGRESS]`. Note the timestamp and branch.
3. **Isolate Work**: Ensure you are working on a dedicated git branch or worktree (e.g. `git checkout -b feature/task-<id>`). Never commit unreviewed work directly to `main`.
4. **Implement**: Make clean, targeted modifications fulfilling all Acceptance Criteria.
5. **Verify**:
   - Run `npm run build`
   - Run `npm run check`
   - Ensure all checks exit with code 0.
6. **Hand Off**:
   - Commit changes cleanly: `git commit -m "feat(task-<id>): <summary>"`
   - Update the ticket in `TASK_BOARD.md` to `[NEEDS_REVIEW]`.
   - Add a brief summary of completed files and test results under the ticket notes.

---

## 3. Project Standards & Commands
- **Repository**: Healthcare International Group (`hcig-work`)
- **Key Commands**:
  - `npm run build` : Builds landing pages and web assets.
  - `npm run check` : Asserts markup integrity and broken links.
  - `npm test`      : Executes full build + check pipeline.
- Maintain Healthcare International Group branding and aesthetic guidelines.
- Do not modify files outside the ticket scope without approval.
- **Ticket Reference Protocol**: Never write bare ticket IDs like T-015 or TASK-247-01 alone. Always include its title or a brief explanation of what it does, e.g. T-015 (24/7 Clinic: Phase 2 inner pages).

---

## 4. HCIG Hive (live since 2026-09-18)

The board is now run by the Hive. `TASK_BOARD.md` is generated from `.hive/tasks.json`.
- **Read `.hive/brain.md` before any work.** It is the shared memory of every agent, rebuilt live.
- Report with `node hive/cli.js note <ID> "..."` and `node hive/cli.js status <ID> <status>`.
- Workers started by the Hive get a brief in `.hive/runs/<run>.brief.md` and usually work in their own worktree under `../hcig-wt/<ID>`.
- Dashboard: http://localhost:4400. Start everything with `hive.bat`.
