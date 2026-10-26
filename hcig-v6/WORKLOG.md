# WORKLOG.md: HCIG v6 (one line per thing done or fixed, newest last)

Owner's rule: log everything from the first change, for the final email.

| Date | Area | What | How checked |
|---|---|---|---|
| 2026-10-26 | Plan | Full plan approved after five question rounds; three read-only explorations of v3, reference sites and materials | plan file approved |
| 2026-10-26 | Safety | Root `.gitignore` now ignores `prompt hcig.txt`, `hcig material/`, `*.ppk`, `id_rsa*`, `*.pem`, private `hcig-v6/` folders (the repo is public and publish runs `git add -A`) | `git status --ignored` shows both as ignored |
| 2026-10-26 | Access | `Host hcig` added to `~/.ssh/config` with the key kept in `~/.ssh` like the other host keys. The account has SFTP but no shell | SFTP login and listing worked |
| 2026-10-26 | Workspace | `hcig-v6/` created with BRAIN, AGENTS, CLAUDE, TASKS, DELEGATION, DECISIONS, WORKLOG and its own `.gitignore` | files reviewed |
| 2026-10-26 | Research | Fresh capture of all 25 live pages: all answer 200, visible text unchanged since 2026-10-18 | `capture-live.mjs` diff, spot check of known sentences |
| 2026-10-26 | Words | Manager's maritime copy saved word for word (page, home block, SEO table); all saved versions in the scrape are identical | line diff of the four versions |
| 2026-10-26 | Words | Guideline verbal identity transcribed word for word (essence, promise, tone, 5 key messages, elevator pitch, 5 slogans) | read from full-resolution crops |
| 2026-10-26 | Review | agy read-only review of spec and plan: 15 findings, 12 taken into the plan, 2 not taken (his decisions) | each checked against files and decisions |
| 2026-10-26 | Facts | Fact sheet written (28 live pages, company profile); conflicts resolved by him: profile titles for leadership, five countries for presence | his answers |
| 2026-10-26 | URLs | Address and redirect contract written: 10 live paths kept, 3 leadership pages and every duplicate or leftover get one-hop 301s | `contracts/urls.md` |
| 2026-10-26 | Security | Found: `hcigdb.sql` public (HTTP 200, admins table with a `pass` column), `hcigadmins/` and four legacy PHP files public; `error_log` already blocked (403) | curl status codes; SQL structure read without printing values |
