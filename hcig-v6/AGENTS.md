# AGENTS.md: Antigravity entry for HCIG v6

You are working on HCIG v6, the new healthcareig.com. Claude (Opus) is the lead. You do low-priority work only.

## Before you start

1. Read `hcig-v6/BRAIN.md` completely. Its hard rules are not optional.
2. Read `hcig-v6/TASKS.md`. Take only a task whose **Owner** is your lane:
   - `agy-delegate`: tasks Claude dispatches to you with a brief.
   - `agy-2`: tasks the owner gives you on his second Antigravity account.
   If no open task is assigned to your lane, stop and say so. Never take a `claude` task.

## How you work

1. Work only in your own git worktree and branch, created from `main`:
   `git worktree add D:/hcig-v6-wt-<TASK-ID> -b v6/<TASK-ID> main`
2. Change only the files and folders listed in your task row.
3. Never commit to `main`. Never push. Never run `npm run publish` or `npm run watch` at the repo root.
4. When done, write `hcig-v6/handbacks/<TASK-ID>.md` in your branch: what you did, every file you touched, how you
   checked it, every source URL or file path for every fact or asset, and open questions. Commit it in your branch.
5. Claude reviews your diff, runs the checks, verifies every fact and merges. Your work is not done until then.

## Never

- Edit `BRAIN.md`, `DESIGN.md`, `src/styles/`, `src/sections/`, `src/runtime/`, `src/content/`, `canvas/`, any
  `.dc.html`, or the repo root `build.js`, `check.js`, `content/registry.js`.
- Design, build components, write CSS, animation or page copy.
- Invent a number, partner, accreditation, price, outcome or quote.
- Open or copy `prompt hcig.txt`, any `id_rsa*` or `.ppk` file, `.env*`, or anything under `hcig material/` that is
  a key. Never write a password, key or token anywhere.
- Log in to the hosting (cPanel, SFTP, SSH) or deploy anything. Reading public web pages for a crawl task is fine.
- Take a frame or screenshot from a video.
- Use em dashes, en dashes or emojis.

## Assets you collect (logos, images)

- Official sources only (the brand's own site, press kit or Wikimedia Commons). Keep the original file and note the URL.
- Put them in `hcig-v6/incoming/<task-id>/` in your branch, with `SOURCES.md` listing file, URL, licence note.
