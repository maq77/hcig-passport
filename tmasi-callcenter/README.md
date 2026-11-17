# TMASI AI Call Center (V1 local demo)

A local app that runs at http://127.0.0.1:3017. Live voice runs on ElevenLabs Agents. This app holds
the data (embedded Postgres), the knowledge, the tools, the post-call jobs and the tests.

Spec, plan, data model and contracts: `../specs/017-tmasi-ai-callcenter/`.

## Setup

```bash
cd tmasi-callcenter
npm install
npm run migrate          # creates data/pg
npm run seed:admin       # one admin login
npm run kb:build         # compiles TMASI knowledge into data/kb
npm run kb:sync          # uploads changed docs, embeds locally
npm run agent:push       # writes agent.config.ts to the agent as a draft version
npm run eval -- --mode text --all-langs
npm run dev              # http://127.0.0.1:3017
```

Copy `.env.example` to `.env.local` and fill in the values. That file is never committed.
`npm test` runs the copy check, then the unit tests.

## Two ElevenLabs accounts

- Keys: `ELEVENLABS_API_KEY` (account 1) and `ELEVENLABS_API_KEY_2` (account 2) in `.env.local`.
- New calls use account 1 until its credits drop below about 2 minutes (1,600 credits), then switch to account 2 by themselves (`data/active-account.json`).
- Switch by hand: `npm run key:use -- 2` (or `-- 1`); `npm run key:use` shows both balances.
- After changing the agent or knowledge, mirror them to account 2: `npm run kb:sync -- --account 2` and `npm run agent:push -- --account 2`.
- Finished calls are imported from whichever account they ran on.
