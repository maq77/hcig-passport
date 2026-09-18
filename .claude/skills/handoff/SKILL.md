---
name: handoff
description: Rewrite the HCIG handover so the next session (Claude or any agent) starts current. Use when the user says /handoff, at the end of a long session, after a big merge or deploy, or when HANDOVER.md no longer matches reality.
---

# /handoff

1. Read `~/.claude/skills/hcig/memory/HANDOVER.md`, `hive_status`, and today's events.
2. Rewrite HANDOVER.md in place, keeping its structure: what is live, what is blocked on whom, the numbered task queue, traps. Dates absolute. Remove what is no longer true instead of appending.
3. Update the task memory files that changed, and `memory/decisions.md` for any decision with a trade-off.
4. `hive_brain` with `rebuild: true` so every agent sees the new state.
5. Update the HCIG Work registry if any deliverable changed state, per the hcig skill section 0.
6. Tell the user what changed in the handover, in short lines.
