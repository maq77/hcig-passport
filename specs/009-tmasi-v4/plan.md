# Implementation Plan: TMASI v4 home, a 3D global-network remake

**Branch**: `009-tmasi-v4` (work stays on `main`, commits by named path, as with spec 008) | **Date**: 2026-10-01 | **Spec**: `specs/009-tmasi-v4/spec.md`

**Input**: Feature specification from `specs/009-tmasi-v4/spec.md` (approved 2026-10-01, amended the same day)

## Summary

Rebuild the TMASI home from scratch for B2B buyers around one idea: a real-time 3D Earth on
which TMASI's five offices light up and connect, Egypt first. Desktop and phone each get their
own composition of every section; phones run real 3D on a lighter profile. Every word comes from
the v3 English text through a build-failing word check. Nothing is built before Mohamed picks the
look on two design canvas boards. The page is a Next.js static export in a new `tmasi-v4/` app,
served on HCIG Work at `/tmasi/v4` next to the untouched v3, and pushed only on his yes.

## Technical Context

**Language/Version**: TypeScript 5, React 19.2, Next.js 16.3 static export (same stack as v3 `tmasi-next/`)

**Primary Dependencies**: three 0.186 (hand-built scene, loaded after first paint), framer-motion 13 for DOM motion (as v3), Tailwind 4, lucide-react. No React Three Fiber, no globe.gl, no Lenis, no GSAP (see research R1, R17)

**Storage**: None. Content is a generated JSON file; media are static files

**Testing**: word check script (build fails on any foreign or missing sentence); Playwright at 360, 390, 768, 1024, 1440, 1920 px; reduced-motion and no-WebGL emulation; local Lighthouse (mobile and desktop); Chrome performance trace at 4x CPU slowdown; root `npm test` of HCIG Work

**Target Platform**: evergreen desktop browsers; phones from about 2021 on (iOS 16+ Safari, Android Chrome on mid-range devices); a still fallback for the rest

**Project Type**: static website, one page (the home), English only

**Performance Goals**: LCP at or under 2.5 s on Lighthouse mobile (4G, mid phone) and at or under 1.0 s desktop; CLS at or under 0.05; INP at or under 200 ms; globe 60 fps on desktop and at least 45 fps on a mid phone; no frame over 50 ms while scrolling at 4x CPU slowdown

**Constraints**: words exactly as v3 (FR-001); native scroll (FR-022); reduced motion and no-3D stills (FR-011, FR-021); weight budget below; preview noindex and v3 untouched (FR-023); push gate; never a still taken from a video; no em or en dashes in any text we write

**Weight budget (FR-022b)**: first load without 3D or video: JS at or under 180 KB gzip, page at or under 1.5 MB phone and 2.5 MB desktop. 3D chunk (three plus scene plus land data) at or under 190 KB gzip, fetched after first paint. Hero still at or under 120 KB. Section images at or under 200 KB desktop and 120 KB phone (AVIF with WebP fallback). Each 3D icon at or under 25 KB at 2x. Each silent loop at or under 1.5 MB desktop and 1.0 MB phone, fetched only when near the screen. The film loads only on Watch (1080p at or under 14 MB, 720p at or under 7 MB)

**Scale/Scope**: 1 page, 13 sections, 5 offices, 6 service groups, about 16 icons, 1 or 2 loops, 1 film, about 8 to 10 images, 4 partner logos

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

`.specify/memory/constitution.md` is still the blank template, so the gates are the HCIG rules
that govern every site (CLAUDE.md, the hcig skill, Mohamed Memory). Proposal: ratify these as the
constitution with `/speckit-constitution` once v4 ships.

| # | Gate | Status |
|---|---|---|
| G1 | Client words kept exactly; new labels only with his yes | PASS: word sources table in the spec; word check fails the build (contracts/content-contract.md) |
| G2 | No invented facts, numbers, partners, places | PASS: offices from the site's own addresses, partners verified in posts, numbers traced |
| G3 | Design canvas before any build; he picks | PASS: two canvas boards are gates before Stage E |
| G4 | Nothing pushed to HCIG Work without his yes (push gate 2026-09-29) | PASS: local build and screenshots first; push is its own step |
| G5 | Preview out of search; v3 untouched | PASS: noindex preview; separate app and folder; v3 files not edited |
| G6 | Native scroll; reduced motion respected; no perpetual decorative motion | PASS: globe pauses off screen; still states defined |
| G7 | Never a still from inside a video | PASS: posters are made separately (contracts/media-contract.md) |
| G8 | TMASI guideline as the base | PASS: teal #009A9C dominant, white, black; #007AB5 and #0F205C sparingly; Big Noodle Titling and Montserrat |
| G9 | Every change logged in `docs/tmasi-worklog.md` | PASS: a log line per stage |
| G10 | Technical first, copy last; obvious fixes made, new copy reviewed | PASS: no new copy in scope |

Re-check after Phase 1 design: all gates still pass. No violations, so Complexity Tracking stays empty.

## Project Structure

### Documentation (this feature)

```text
specs/009-tmasi-v4/
├── spec.md                 # approved spec
├── plan.md                 # this file
├── research.md             # R1 to R18: every technical decision, with the numbers behind it
├── data-model.md           # offices, story, partners, section text, media, canvas picks
├── quickstart.md           # how to run, check and preview it
├── contracts/
│   ├── content-contract.md # word sources, the word check, approved labels
│   ├── globe-contract.md   # globe inputs, states, story, device profiles, guards, access
│   ├── media-contract.md   # formats, budgets, sources, licences, posters, naming
│   └── preview-contract.md # paths, noindex, links to v3, sync, push gate
├── canvas/                 # design canvas sources (board 1 hero, board 2 page)
├── checklists/requirements.md
└── tasks.md                # next step: /speckit-tasks
```

### Source Code

```text
tmasi-v4/                          # new Next.js app; v3 (tmasi-next/) is never edited
├── next.config.ts                 # output export, basePath /tmasi/v4, trailingSlash
├── package.json                   # scripts: content, check:words, build, sync
├── scripts/
│   ├── pull-content.mjs           # tmasi-next en.json + ui.ts (en) -> src/content/home.en.json
│   ├── check-words.mjs            # built out/index.html vs home.en.json + approved-labels.json
│   ├── build-land.mjs             # Natural Earth land -> public/globe/land-{desktop,phone}.bin
│   ├── flatten-prefetch.mjs       # copied from tmasi-next/scripts (Next 16 payload names)
│   └── sync-preview.mjs           # copied pattern: out/ -> ../src/tmasi-v4
├── src/
│   ├── app/                       # layout.tsx (lang en, fonts, Sofia), page.tsx (the home)
│   ├── content/                   # home.en.json (generated), approved-labels.json, offices.ts, media.json
│   ├── globe/                     # scene.ts, land.ts, arcs.ts, story.ts, profile.ts (capability gate), labels.ts
│   ├── components/                # Header, Hero, GlobeStage, OfficeCards, About, Relax, Values,
│   │                              # MissionVision, WhyChoose, Services, Quote(Form), Hubs, News,
│   │                              # PartnerBand, Footer, VideoLoop, FilmModal, Icon3D, Reveal
│   └── styles/                    # tokens.css (brand), globals.css
└── public/                        # fonts/, globe/, img/, icons/, loops/, film/, logos/
src/tmasi-v4/                      # synced export served by HCIG Work (like src/tmasi-v3)
build.js                           # + copy step src/tmasi-v4 -> out/tmasi/v4
content/registry.js                # + project "Website v4 home" under TMASI
.gitignore                         # + !tmasi-v4/public/**/*.jpg and !src/tmasi-v4/**/*.jpg
```

**Structure Decision**: a separate app keeps v3 byte-for-byte untouched (FR-023) and lets v4 drop
v3 weight it no longer needs (Lenis, smooth-scroll wrapper). Proven pieces are copied in, not
imported across apps:

| Reused from v3 | Path | Use in v4 |
|---|---|---|
| Quote form (live field names, send.php no-cors, success words) | `tmasi-next/src/components/QuoteForm.tsx` | copied, restyled |
| Count-up numbers | `tmasi-next/src/components/CountUp.tsx` | copied |
| Social icons | `tmasi-next/src/components/SocialLinks.tsx` | copied |
| Fonts (Big Noodle, Bebas latin-ext fallback, Montserrat; `adjustFontFallback: false`) | `tmasi-next/src/app/fonts.ts` | copied |
| `data-scroll-behavior="smooth"` fix for Next 16 | `tmasi-next/src/components/site/RootHtml.tsx` | copied |
| Sofia embed (Jotform agent script) | `tmasi-next/src/components/site/RootHtml.tsx` | copied, loaded late (R7) |
| Payload flattening for Next 16 | `tmasi-next/scripts/flatten-prefetch.mjs` | copied |
| Preview sync | `tmasi-next/scripts/sync-preview.mjs` | copied, target `src/tmasi-v4` |
| Words and labels | `tmasi-next/src/content/live/en.json`, `tmasi-next/src/content/ui.ts` | read by `pull-content.mjs` |
| Noindex and preview flag | `tmasi-next/src/lib/seo.ts` (IS_PREVIEW) | pattern reused |

## Delivery stages and gates

| Stage | What | Who | Gate to leave it |
|---|---|---|---|
| A. Foundation | Scaffold `tmasi-v4/`, pull content, word check (fails on purpose against a blank page), office data, land data, build and sync wiring (not pushed) | Claude; agy for scaffolding chores | word check runs; build passes |
| B. Canvas board 1: hero | Live and moving: 4 globe looks, 3 story motions, 3 desktop layouts, the phone "globe on top, guided tour", 2 headline type options, top 6 references (verified by eye) | Claude | **he picks** look, motion, layout, phone |
| C. Canvas board 2: page | Desktop and phone composition of every section, 2 or 3 creative moments, icon shoot-out (3 sources), loop places, film place, partner logo row | Claude; agy drafts the reference sweep | **he picks** |
| D. Media | Images in his Gemini (Claude drives Chrome), stock picks, Veo shot prompts (he makes clips), film cut, separately made posters, icons, official logos, all in the media register and within budget | Claude + him | every asset approved in the register |
| E. Build | Globe module and story, sections desktop and phone, motion, still states, access | Claude for the globe and integration; Hive tickets for section builds | word check, build, quickstart checks pass |
| F. QA | Widths, reduced motion, no WebGL, context loss, keyboard, contrast, speed, frame trace, form payload (to a local mock, never their inbox), Sofia, links to v3; real phones (one iPhone, one Android) once pushed | Claude; agy for screenshot and Lighthouse batches | every success criterion measured |
| G. Review | Local screenshots to him; push to HCIG Work only on his yes; review rounds desktop then phone; registry status | Claude + him | **he approves** (SC-009) |
| H. Close | Memory, work log, handover; next spec (inner pages, DE PL ES) | Claude | none |

Board briefs: `canvas/board-1-hero.md` and `canvas/board-2-page.md`.

## Asset inventory (first draft; confirmed on board 2)

| Asset | Kind | Source (planned) | Notes |
|---|---|---|---|
| Hero globe still (desktop, phone) | globe-still | built: rendered from the picked scene | in the first paint; also the reduced-motion and no-3D state |
| Relax band | loop or image | Veo clip (he makes) or generated | traveller at ease on the Red Sea coast; no faces presented as staff |
| About band | image | v3 headset photo kept or a new generated one | v3 photo was his pick on 2026-09-30 |
| Six service groups | image | generated in one style, or the six v3 photos of 2026-09-30 where they fit | bright, neutral, brand colours by CSS only |
| Quote section | image | stock or generated | a coordination desk scene |
| Partner band | loop or image | Veo or stock | Earth at night or an airport apron at dusk |
| About 16 icons | icon | shoot-out winner (R10) | 6 services, 5 why choose, 4 values, 2 mission and vision; exact count on board 2 |
| Four partner logos | logo | official sites | linked to their posts |
| Film, 30 to 45 s | film | 4 to 6 Veo clips he makes, cut by Claude | shots: coordination desk on a call, air ambulance, ground ambulance, airport meet and assist, hotel doctor visit, the globe |
| Film poster, loop posters | poster | generated or built, never from the video | |

## What he does, and when

| When | His step |
|---|---|
| Stage B | pick the hero on board 1 |
| Stage C | pick the page on board 2, including the icon source |
| Stage D | keep the Gemini tab open while Claude makes images; make the Veo clips from the shot prompts |
| Stage G | say yes to the push; review desktop then phone; open it on his own phone and one other (one iPhone, one Android) |

## Ready for go-live later (built now, switched on later)

One H1 and an ordered heading outline; the v3 JSON-LD organisation graph pattern from
`tmasi-next/src/lib/seo.ts` carried over with the five offices; canonical and hreflang wiring left
off while the preview is noindex, so the go-live spec only flips flags.

Hive tickets carry `epic: "009-tmasi-v4"`. Bulk read-only work (reference sweeps, screenshot
batches, alt text drafts) goes to agy; the globe, the story, integration and every review stay with
Claude.

## Risks and how each is handled

| Risk | Handling |
|---|---|
| 3D stutters or crashes on phones (memory, heat) | phone profile (fewer dots, DPR 1.5, no post effects), frame-time probe that steps down then falls back to the still, pause off screen and on hidden tab, WebGL context loss handled |
| Globe steals the vertical swipe | phone: no drag at all; `touch-action: pan-y` on the canvas; taps only on enlarged pin targets |
| 3D delays the words | words are server-rendered HTML; the 3D chunk loads after first paint; the still is in the HTML |
| Generated images look AI-made (he rejects this) | judged at 100% for natural light, imperfections, no garbled text, no fake logos, no faces presented as staff; stock wins where it feels more real |
| Veo clips carry a visible watermark or artefacts | checked at source before cutting; if a visible mark remains, he decides (never cropped around silently) |
| Sofia opens by itself over the hero | loaded late; behaviour verified; options in R7 |
| Words drift during design | the word check runs in every build and fails it |
| Shared dirty tree (other sessions build 247 v4 at the same time) | commit by named path only; never `npm run publish`; check `git status` of `src/tmasi-v4` after commit |
| `*.jpg` ignored repo-wide | `.gitignore` exceptions for the new folders before the first commit |
| `next build` EBUSY | never leave a shell inside `out/` |
| Local server dies at the 10-minute background limit | verify with Playwright `page.route` serving `out/`, as on v3 |
| Claude in Chrome wedges on heavy motion | judge motion on the canvas artifact and on the pushed preview |

## Complexity Tracking

No gate violations.
