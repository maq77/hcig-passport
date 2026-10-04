# Quickstart: run and check TMASI v4

Shell: Git Bash or PowerShell from `D:\Healthcare international group`. Never leave a shell inside
`tmasi-v4/out` (EBUSY on the next build). Use `127.0.0.1`, not `localhost` (his WorldTrips app may sit
on IPv6 port 3000).

## Run

```bash
cd tmasi-v4
npm install
npm run content        # pull-content.mjs: writes src/content/home.en.json from v3 words
npm run dev -- -H 127.0.0.1 -p 4620
```
Expected: the home at http://127.0.0.1:4620/tmasi/v4/ with real words; the globe arrives after the words.

## Build and check

```bash
npm run build          # next build + flatten-prefetch + check:words (fails on any foreign or missing sentence)
npm run sync           # out/ -> ../src/tmasi-v4
cd .. && npm test      # HCIG Work build + check (must pass before any commit)
```
Expected: `check:words` prints "0 foreign, 0 missing"; root test passes.

## Scenarios to prove (map to spec)

| # | Scenario | How | Pass when |
|---|---|---|---|
| 1 | Words (SC-001) | `npm run check:words` | 0 foreign, 0 missing |
| 2 | First screen (US1, SC-002, SC-003) | Lighthouse mobile and desktop on the static export | LCP at or under 2.5 s mobile, 1.0 s desktop; LCP element is the headline; CLS at or under 0.05 |
| 3 | Story (US1) | Playwright 1440 px, wait for `state=idle` | Egypt lit first, four arcs drawn in the picked order |
| 4 | Office details (FR-007, FR-008) | hover or click each pin; Tab through the office list | five offices with footer words; USA shows usa@tmasi.net |
| 5 | Phone hero (US5, FR-010) | Playwright 390 x 844, touch emulation | globe on top, tour runs, cards follow, tap and swipe jump, vertical swipe scrolls the page |
| 6 | Fallbacks (FR-011, FR-021) | `emulateMedia({ reducedMotion: 'reduce' })`; Chrome with `--disable-webgl` | the designed still, same layout, no errors in the console |
| 7 | Smoothness (SC-004) | Chrome trace, 4x CPU slowdown, scroll top to bottom | no frame over 50 ms; globe paused when off screen |
| 8 | Actions (US2, FR-012, FR-012a) | from each section, desktop and phone | quote form or WhatsApp one tap away; form payload correct against a local mock |
| 9 | Widths (SC-008) | Playwright at 360, 390, 768, 1024, 1440, 1920 | no sideways scroll; screenshots saved |
| 10 | Contrast and keyboard (SC-007) | axe scan plus a manual Tab pass | no AA failures; every action and office reachable |
| 11 | Media (FR-015, media contract) | network panel | loops start only near the screen; film loads only on Watch; every file within budget |
| 12 | Links (FR-023a) | click every outbound link | each opens the matching `/tmasi/v3/` page |
| 13 | Sofia (FR-024) | load at 390 px and wait 30 s | it never opens by itself |
| 14 | Preview (FR-023) | read the rendered head | `noindex, nofollow`; v3 files unchanged (`git status tmasi-next src/tmasi-v3` is clean of v4 edits) |
| 15 | Long text (FR-003) | open every read-more on desktop and phone | full paragraph shows in place; the word check still counts it |
| 16 | Icons (FR-014) | side-by-side screenshot of all icons at 1x and 2x | one light, one material, teal; each matches its item's meaning |
| 17 | Context loss | `WEBGL_lose_context` extension: lose, then restore | still shows at once; scene comes back; no console errors |
| 18 | Real phones (US5) | his own phone plus one other (one iPhone and one Android), on the pushed preview | tour smooth, nothing hot or stuck, Sofia closed, words first |

## Preview on HCIG Work (only on his yes)

Commit by named path (`tmasi-v4/`, `src/tmasi-v4/`, `build.js`, `content/registry.js`,
`.gitignore`, `specs/009-tmasi-v4/`, `docs/tmasi-worklog.md` lines for v4 only), push, then open
https://hcig-passport.vercel.app/tmasi/v4 at desktop and phone width and repeat scenarios 3, 5 and 13.
