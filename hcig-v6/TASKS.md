# TASKS.md: HCIG v6

One owner per task, set by Claude. Take only tasks in your lane (see `AGENTS.md`). Status: open, in progress, review,
done. agy tasks run in their own worktree and branch and hand back in `handbacks/<ID>.md`.

## P0 and P1

| ID | Title | Owner | Status | Branch | May touch | Notes |
|---|---|---|---|---|---|---|
| V6-001 | Step 0: gitignore the secrets | claude | done | main | `.gitignore` | 2026-10-26 |
| V6-002 | SSH host `hcig` + live-site backup `old_hcig_backup_website.zip` | claude | in progress | main | `hcig-v6/material/backup/` (local only) | SFTP only, the account has no shell |
| V6-003 | Brain files in `hcig-v6/` | claude | done | main | `hcig-v6/*.md` | |
| V6-004 | Spec 013: spec, plan, research, data model, contracts, tasks | claude | open | main | `specs/013-hcig-v6/` | |
| V6-005 | Gemini review of the spec and plan | claude | in progress | | | owner's Gemini Pro in Chrome + agy read-only |

## P2: research and fact base

| ID | Title | Owner | Status | Branch | May touch | Notes |
|---|---|---|---|---|---|---|
| V6-006 | Fresh capture of the 25 live pages, diff with the 2026-10-18 mirror | claude | done | main | `hcig-v6/src/content/live/` | |
| V6-007 | Maritime copy: clean final block, diff of the versions | claude | done | main | `hcig-v6/src/content/manager/` | |
| V6-008 | Brand voice from the guideline (essence, promise, tone, messages, pitch, slogans), word for word | claude | done | main | `hcig-v6/src/content/guideline/` | |
| V6-009 | Fact sheet with a source for every fact, conflicts listed | claude | done (approved) | main | `specs/013-hcig-v6/fact-sheet.md` | |
| V6-010 | Keyword research in 7 languages and the keyword map | claude | open | main | `specs/013-hcig-v6/keywords/` | |
| V6-011 | Google autocomplete expansion for the seed list, 7 languages (raw suggestions only) | agy-delegate | in progress | v6/V6-011 | `hcig-v6/incoming/V6-011/` | Claude writes the brief and seeds |
| V6-012 | Official logo hunt for the gap list (brands, GHA, DMWV, hotels HCIG names) | agy-delegate | in progress | v6/V6-012 | `hcig-v6/incoming/V6-012/` | gap list in the brief |
| V6-013 | Official logo files for the 15 live-site insurers that exist only as small crops | agy-delegate (moved from agy-2 for the deadline) | in progress | v6/V6-013 | `hcig-v6/incoming/V6-013/` | adec, Admiral, AllClear, avanti, Aviva, CoverWise, ERGO Hestia, Europe Insurance, Gouda, Groupama, Leisure Guard, Liberty Mutual, Lloyds, Post Office, Vienna Insurance Group. Vector (SVG) first, else the largest official PNG. Official sites or Wikimedia Commons only |
| V6-014 | AI visibility baseline (ChatGPT, Perplexity, Gemini) | claude | open | main | `specs/013-hcig-v6/ai-baseline.md` | |
| V6-015 | Media manifest: every image, video and logo with source and licence | claude | open | main | `hcig-v6/media-manifest.json` | |
| V6-016 | URL map and one-hop 301 map | claude | done (approved) | main | `specs/013-hcig-v6/contracts/urls.md` | |
| V6-017 | Public crawl of healthcareig.com: every internal link, image and script with its status code | agy-2 | open | v6/V6-017 | `hcig-v6/incoming/V6-017/` | HTTP reads only, browser user agent, one request per second, no login of any kind. Output: `crawl.csv` (url, status, type, found on) + `SUMMARY.md` |
| V6-018 | Security: move the public SQL file, old admin panel and test files out of `public_html` (reversible) | claude | in progress | main | host only | his OK 2026-10-26; after the backup download |

## Build (two-day push)

| ID | Title | Owner | Status | Branch | May touch | Notes |
|---|---|---|---|---|---|---|
| V6-019 | Live words of every inner page into content files, word for word | agy-delegate | in progress | v6/V6-019 | `hcig-v6/src/content/live/` | from `hcig-v6/material/live-capture/2026-10-26/` |
| V6-020 | Web video encodes (group film, testimonial videos), no frames, no posters | agy-delegate | in progress | v6/V6-020 | `hcig-v6/material/media/video/` (local) + `hcig-v6/handbacks/V6-020.md` | ffmpeg only |
| V6-021 | Generated images for the maritime page and gaps (no people shown as staff or patients) | agy-delegate | in progress | v6/V6-021 | `hcig-v6/material/media/generated/` (local) + handback | Claude picks by eye |
| V6-022 | Next.js app, design system in code, home page (day and night) | claude | in progress | main | `hcig-v6/` | highest priority |
| V6-023 | Important pages: About, Services, Maritime, For Partners, Group, Contact, Blog | claude | open | main | `hcig-v6/` | day only |
| V6-024 | All other pages (service lines, partner types, brands, network, trust, press, leadership, legal) | claude | open | main | `hcig-v6/` | day only, thin pages merged |
| V6-025 | SEO, AEO, schema, sitemaps, llms.txt, redirects map in code | claude | open | main | `hcig-v6/` | |
| V6-026 | Preview on HCIG Work `/hcig/v6`, QA pass, note for Irina | claude | open | main | root `build.js`, `src/hcig-v6/` | |
| V6-027 | Seven-language B2B glossary, then first-draft translations | agy-delegate | open | v6/V6-027 | `hcig-v6/scripts/dict/` | after English is locked; Claude checks |
