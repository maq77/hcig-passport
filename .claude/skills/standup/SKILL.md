---
name: standup
description: Daily standup for the HCIG Hive. What every agent did since the last standup, what is running, what is blocked, what waits for review, usage and quota. Use when the user says /standup, "what happened", "what did the agents do", "morning report", or at the start of a working day.
---

# /standup

1. `hive_status` and `hive_usage`. Read `.hive/events.jsonl` since the last standup (the last `standup` event, else 24 hours).
2. Write it as short lines under these headings, and skip any that are empty:
   - **Done** (merged or finished, one line each, with the ticket id)
   - **Waiting for review**
   - **Running now** (agent, ticket, model, how long)
   - **Blocked** (and exactly what it needs, from whom)
   - **Deploys** (every `deploy.alert`, with what was changed and whether it was checked)
   - **Usage** (tokens per account and model, anything resting after a quota hit, Claude's own usage)
   - **Orders waiting** (unread inbox)
3. End with the one next action you recommend.
4. Record it: `node hive/cli.js event standup "Standup written"`.

No em dashes. No paragraphs.
