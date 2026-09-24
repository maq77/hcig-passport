# Lessons

One file per role, `<role-id>.md`. One lesson per line, starting with `- `, newest last.
Everything that is not a `- ` line is ignored, so notes and dates in between are fine.

`node hive/agents/sync.js` folds the last 20 lessons of a role into both generated files:
the Claude subagent in `.claude/agents/` and the agy skill in `hive/agents/skills/`.
So a lesson written once is carried by both fleets from the next run onwards.

Add one with:

    node hive/cli.js lesson seo-specialist "Check the rendered head, not the template. A canonical in the template was overwritten at build time on 2026-09-14."

Write lessons that change what an agent does next time. A good lesson names the mistake
and the rule that replaces it. Do not write praise, and do not write anything that is
already in the role's body or in the shared rules.
