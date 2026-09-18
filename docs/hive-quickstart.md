# HCIG Hive Quickstart

## Start

Run `hive.bat` from the repo root. It starts the hub, opens http://localhost:4400, and launches Claude and agy side by side in Windows Terminal.
`hive.bat hub` starts only the hub and dashboard.

## Give an order

Add and dispatch in one step:
```
node hive/cli.js add "Fix the footer links" --to @agy-cli --kind code --go
```
Add first, dispatch later:
```
node hive/cli.js go TASK-ID --model claude-opus-4-6-thinking
```
`add` options: `--to`, `--desc`, `--folder`, `--accept`, `--kind`, `--priority`, `--go`.
`go` options: `--account`, `--model`, `--effort`, `--main`, `--say`.

## Tickets

`node hive/cli.js status` shows all open tickets and agents.
`node hive/cli.js status T-001 needs_review` changes a ticket status.
`node hive/cli.js note T-001 "what you did"` adds a progress note.
Valid statuses: `todo`, `in_progress`, `needs_review`, `blocked`, `done`.

## Workers and models

Each worker runs in its own worktree under `../hcig-wt/<ID>` on branch `hive/<id>`.
Claude Code (`@claude`) is the head. It plans, assigns, reviews and merges.

Model tiers (from `hive/config.json`):
- **best**: claude-opus-4-6-thinking, gemini-3.1-pro-high
- **strong**: claude-sonnet-4-6
- **below best**: gemini-3.8-flash-high, switched off by default

Effort is high by default and never below medium. Only Gemini takes an effort setting.

The router picks a model by task kind (code, design, content, review, bulk, research). Override with `--model`.

## Usage

| Command | What it does |
|---|---|
| `node hive/cli.js log RUN-ID` | Last steps of a worker run |
| `node hive/cli.js kill RUN-ID` | Stop a running worker |
| `node hive/cli.js diff TASK-ID` | Review a branch diff |
| `node hive/cli.js merge TASK-ID` | Merge a finished branch |
| `node hive/cli.js usage` | Token usage summary |
| `node hive/cli.js brain` | Print the shared brain |
| `node hive/cli.js open` | Open the dashboard |

## Stop

`hive.bat stop` stops the hub and every worker it started.
