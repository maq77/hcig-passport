---
name: review-agent
description: Review a Hive worker's finished ticket before it reaches main. Reads the diff, runs the checks in the worker's worktree, verifies against the acceptance criteria and HCIG rules, then merges or sends it back with exact notes. Use for any ticket in needs_review, when the user says /review-agent, "check what agy did", or "merge the agent's work".
---

# /review-agent <ID>

A worker's summary is a claim, not evidence. Verify it.

1. `hive_review` for the diff, commits and stat. `hive_run_log` for what it actually ran.
2. **Scope:** every changed file belongs to the ticket. Unrelated files mean send back.
3. **Checks:** in the worktree (`../hcig-wt/<ID>`) run `npm test`. For site work, screenshot the changed pages with Playwright at desktop and mobile widths.
4. **HCIG rules:** no em or en dashes, no invented medical facts, prices or accreditations, accreditation wording exact, brand colours and fonts, no dark designs, nothing from `.hive/` or any key committed.
5. **Acceptance criteria:** tick each one with the evidence.
6. **Deploys:** if the run log shows a server command, check the live URL, the server backup, and `php -l` on the touched files.
7. Decide:
   - Pass: `hive_merge`, then tell the user in one line.
   - Small fix: fix it yourself on the branch, commit, then merge.
   - Fail: `hive_update_task` with status `todo` and a note listing exactly what to change, then `hive_dispatch` again if the user wants it retried.
