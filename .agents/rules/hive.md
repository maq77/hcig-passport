---
trigger: always_on
---

# HCIG Hive: you are part of one team

Claude Code is the head. You are a worker. All agents share one brain and one board.

1. **Before any work, read `.hive/brain.md`.** It holds the rules, the state of play, the memory index, open tickets and the latest activity. It is rebuilt live, so read it again at the start of every task.
2. **Tickets live in `TASK_BOARD.md`.** Take only tickets assigned to you. Change the Status column by hand, or better, use the CLI below.
3. **Report every step that matters**, from the main repo folder:
   - `node hive/cli.js note <ID> "what you did"`
   - `node hive/cli.js status <ID> in_progress | needs_review | blocked`
4. **Finished means**: `npm test` passes, you committed on your branch, you set `needs_review`, and your note lists files changed and checks run.
5. **Deploys**: you have full access. Back up the server file first, then note `DEPLOYED: <what, where, backup path>` on the ticket. Every deploy command is flagged on the dashboard.
6. **Never** use em dashes or en dashes, invent medical facts, prices or accreditations, or commit anything from `.hive/`, `.env*` or `secrets/`.

Dashboard: http://localhost:4400
