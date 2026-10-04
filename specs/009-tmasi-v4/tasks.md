# Tasks: TMASI v4 home, a 3D global-network remake

**Input**: Design documents from `specs/009-tmasi-v4/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md, canvas/board-1-hero.md, canvas/board-2-page.md

**Tests**: no unit-test suite was requested. The spec's own checks are tasks: the build-failing word
check (FR-001), the weight check (FR-022b) and the quickstart scenarios, run at the end of each story.

**Organization**: grouped by user story. Owner in brackets at the end of each task: (Claude),
(agy: Hive ticket, Claude reviews) or (Mohamed). Hive tickets carry `epic: "009-tmasi-v4"`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: can run in parallel (different files, no unfinished dependency)
- **[Story]**: US1 to US6 from spec.md

## Path Conventions

App: `tmasi-v4/` (repo root `D:\Healthcare international group`). Served copy: `src/tmasi-v4/`.
v3 (`tmasi-next/`, `src/tmasi-v3/`) is read, never edited.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: the empty app, wired for build, sync and preview, nothing pushed

- [ ] T001 Create `tmasi-v4/` as a Next.js 16.3.6 app: copy `tsconfig.json`, `postcss.config.mjs`, `eslint.config.mjs` from `tmasi-next/`; write `tmasi-v4/package.json` with next 16.3.6, react and react-dom 19.2.8, framer-motion ^13.4.4, lucide-react ^1.48.0, three 0.186.1, tailwindcss 4 (no lenis); write `tmasi-v4/next.config.ts` with `output: "export"`, `basePath: "/tmasi/v4"`, `trailingSlash: true`, `env.NEXT_PUBLIC_BASE_PATH` (Claude)
- [ ] T002 [P] Add to `.gitignore`: `!tmasi-v4/public/**/*.jpg`, `!src/tmasi-v4/**/*.jpg`, `tmasi-v4/out/`, `tmasi-v4/node_modules/`, `tmasi-v4/.work/` (raw downloads); confirm with `git status --ignored --porcelain tmasi-v4` (Claude)
- [ ] T003 [P] Copy `tmasi-next/scripts/flatten-prefetch.mjs` to `tmasi-v4/scripts/flatten-prefetch.mjs` and `tmasi-next/scripts/sync-preview.mjs` to `tmasi-v4/scripts/sync-preview.mjs`, retargeted to `../src/tmasi-v4` (agy)
- [ ] T004 [P] Copy `tmasi-next/src/app/fonts.ts` to `tmasi-v4/src/app/fonts.ts` and the font files it names into `tmasi-v4/public/fonts/`; keep `adjustFontFallback: false` on Big Noodle and the Bebas Neue latin-ext fallback (agy)
- [ ] T005 [P] Write `tmasi-v4/src/styles/tokens.css` with the brand tokens from the TMASI guideline and v3 design rules: teal #009A9C (dominant), teal field #008486, teal on dark #7FE0E1, black, white, medium blue #007AB5 and indigo #0F205C (sparingly), radius 16px cards and 24px bands (Claude)
- [ ] T006 Add the copy step `src/tmasi-v4` to `out/tmasi/v4` in `build.js`, next to `TMASI_V3_SRC`, and the scripts `content`, `check:words`, `check:weight`, `build` (`next build && node scripts/flatten-prefetch.mjs && node scripts/check-words.mjs && node scripts/check-weight.mjs`), `sync`, `dev` in `tmasi-v4/package.json` (Claude)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: the words, the offices, the globe engine, and his picks on both canvas boards

**CRITICAL**: no section is built until T021 and T024 (his picks) are recorded

### Words and data

- [ ] T007 Write `tmasi-v4/scripts/pull-content.mjs` producing `tmasi-v4/src/content/home.en.json` from `tmasi-next/src/content/live/en.json` (`home`, `shell`, `posts`) and the English block of `tmasi-next/src/content/ui.ts`, plus only usa@tmasi.net from `contact.offices[4].email`, keyed by section (`header`, `hero`, `about`, `relax`, `values`, `mission`, `why`, `services`, `quote`, `hubs`, `news`, `partner`, `footer`), per `contracts/content-contract.md` (Claude)
- [ ] T008 [P] Write `tmasi-v4/src/content/approved-edits.json` (empty list; each grammar, punctuation or capital fix as source sentence, fixed sentence, reason, date, per FR-004) and `tmasi-v4/src/content/approved-labels.json`: every v3 label not on the live site (stats labels, Global Operational Hubs, Quick Links, View Details, View All News, Read more, Latest News & Updates, Ready to partner band, Get in Touch, Request a Quote in the band), each with "approved 2026-09-28 in v3" and his words where recorded (Claude)
- [ ] T009 Write `tmasi-v4/scripts/check-words.mjs`: read `out/index.html`, collect visible text nodes plus `alt`, `aria-label`, `title`; normalise only spacing, curly versus straight quotes and the `·` separator; fail on any foreign sentence and on any missing source sentence (read-more text included); accept a fixed sentence only when `approved-edits.json` lists it; print the section key per failure (Claude)
- [ ] T010 [P] Write `tmasi-v4/src/content/offices.ts` with the five offices of `data-model.md` ("exactly five offices; no other pin may be drawn"; footer words kept, Germany keeps the footer version; USA adds usa@tmasi.net); check each lat, lng on OpenStreetMap against the contact page address and note the check in the file header (Claude)
- [ ] T011 [P] Write `tmasi-v4/scripts/build-land.mjs`: Natural Earth 110m land from `world-atlas` to Fibonacci-sphere land points, quantised to two 16-bit values per point, written to `tmasi-v4/public/globe/land-desktop.bin` (about 12,000 points) and `land-phone.bin` (about 6,000), each at or under 40 KB (Claude)
- [ ] T012 [P] Write `tmasi-v4/scripts/check-weight.mjs` failing the build when any file in `out/` breaks the budgets of `contracts/media-contract.md` and plan.md (first-load JS at or under 180 KB gzip, 3D chunk at or under 190 KB gzip) (agy)

### Globe engine (shared by the canvas and the site)

- [ ] T013 Write `tmasi-v4/src/globe/profile.ts`: the capability gate (WebGL, reduced motion, Save-Data, deviceMemory at or under 2 gives the still) and the frame-time probe (starts after `arriving`, skips 20 frames, averages 60, slower than 22 ms steps down: pixel ratio 2 to 1.5 to 1.25, then phone profile, then still) per research R6 (Claude)
- [ ] T014 Write `tmasi-v4/src/globe/scene.ts`: renderer, camera, land points from the `.bin` file, five pins, look presets L1 dotted, L2 realistic, L3 glass, L4 hologram as parameter sets, `renderer.compile(scene, camera)` behind the still before fade-in, render loop paused off screen and on hidden tab, `webglcontextlost` to state `lost` and `webglcontextrestored` rebuild, full dispose on unmount (Claude)
- [ ] T015 Write `tmasi-v4/src/globe/arcs.ts`: arcs from `eg` to each office, lifted by distance, shader draw-in progress and a travelling pulse (Claude)
- [ ] T016 Write `tmasi-v4/src/globe/story.ts`: the state machine of `data-model.md` (`still`, `arriving`, `story`, `idle`, `focus(office)`, `paused`, `lost`, `fallback`; "`paused` returns to the state it left. `fallback` is final for the visit"), story order nearest to farthest by default (Claude)

### Canvas board 1: the hero (Stage B)

- [ ] T017 [P] Reference sweep: agy (gemini-3.1-pro-high, read-only) lists candidate globe and B2B network sites; Claude opens each in Chrome, keeps six, one line each on what to take, saved in `specs/009-tmasi-v4/canvas/references.md` (agy draft, Claude verifies)
- [ ] T018 Build `specs/009-tmasi-v4/canvas/board-1.html` per `canvas/board-1-hero.md`: three 0.186.1 from cdnjs, the T013 to T016 code bundled inline with esbuild, rows L1 to L4, M1 to M3, D1 to D3, P1 in a 390 x 844 frame, dark and light hero switch, Big Noodle versus Montserrat Bold, each with its reduced-motion still and its 3D weight in KB (Claude)
- [ ] T019 Screenshot board 1 at 1440 and 390 with Playwright and fix what the screenshots show before he sees it (Claude)
- [ ] T020 Load `artifact-design`, publish board 1 as a private design canvas artifact, record its URL in `~/.claude/skills/hcig/memory/tasks/tmasi-website.md` and as a link item in `content/registry.js` (Claude)
- [ ] T021 GATE: he picks look, motion, desktop layout, phone hero, background and headline type; record in `specs/009-tmasi-v4/canvas/picks.json` (board, row, option, his words, date) (Mohamed)

### Canvas board 2: the page (Stage C)

- [ ] T022 Icon shoot-out sources for three meanings (emergency medical assistance, air and ground evacuation, hospital coordination): (a) generated in one locked style in his Gemini (Claude drives Chrome, he downloads), (b) the CC0 set after saving its licence page, (c) built in a three.js scene and rendered to transparent PNG; files in `tmasi-v4/.work/icons-shootout/` (Claude + Mohamed)
- [ ] T023 Build `specs/009-tmasi-v4/canvas/board-2.html` per `canvas/board-2-page.md` on the picked hero: desktop and phone frame per section, creative moments C1 to C3, the icon shoot-out, loop and film placement, partner logo row; publish to the same artifact or a second one; screenshot and fix first (Claude)
- [ ] T024 GATE: he picks per section, the creative moments, the icon source, where loops and the film go; record in `canvas/picks.json` (Mohamed)

**Checkpoint**: words, offices and engine ready; every visual decision picked by him

---

## Phase 3: User Story 1 - A partner sees the global network at first sight (Priority: P1), MVP

**Goal**: the hero with the picked globe, its story, office details and the still, on desktop

**Independent Test**: quickstart scenarios 2, 3, 4, 6, 17 pass at 1440 px

- [ ] T025 [US1] Write `tmasi-v4/src/globe/presets.ts` from `canvas/picks.json`: the picked look parameters, story timings and order (Claude)
- [ ] T026 [US1] Write `tmasi-v4/src/components/GlobeStage.tsx`: the still as `<picture>` in the HTML (desktop and phone sources), the globe module loaded by dynamic import after first paint, canvas `aria-hidden`, `touch-action: pan-y`, fade-in over the still (Claude)
- [ ] T027 [P] [US1] Write `tmasi-v4/src/globe/labels.ts`: desktop HTML labels moved with `transform: translate3d()` only and `will-change: transform`, faded behind the Earth, pin glow and pointer cursor on hover (Claude)
- [ ] T028 [P] [US1] Write `tmasi-v4/src/components/OfficeList.tsx`: the five offices as a keyboard-reachable list with footer words (USA with usa@tmasi.net), driving `focus(office)` on desktop (Claude)
- [ ] T029 [US1] Write `tmasi-v4/src/components/Hero.tsx`: the picked desktop layout, hero title and paragraph from `home.en.json`, "Request A Quote" and "CALL THE TEAM" at equal weight (FR-012) (Claude)
- [ ] T030 [US1] Write `tmasi-v4/scripts/render-still.mjs`: render the picked scene's composed idle frame with Playwright to `tmasi-v4/public/globe/still-desktop.{avif,webp}` (at or under 120 KB) and `still-phone.{avif,webp}` (at or under 80 KB) (Claude)
- [ ] T031 [US1] Run quickstart scenarios 2, 3, 4, 6, 17 and log results in `docs/tmasi-worklog.md` (Claude)

**Checkpoint**: the hero tells the network story on desktop

---

## Phase 4: User Story 2 - A partner reaches TMASI in one step (Priority: P1)

**Goal**: header, quote form, WhatsApp and the partner band, one tap away from anywhere

**Independent Test**: quickstart scenario 8 passes on desktop and phone

- [ ] T032 [P] [US2] Copy `tmasi-next/src/components/QuoteForm.tsx` to `tmasi-v4/src/components/QuoteForm.tsx`, restyled; keep live field names, the send.php no-cors post, the success words and `NEXT_PUBLIC_QUOTE_ENDPOINT` (Claude)
- [ ] T033 [US2] Write `tmasi-v4/src/components/Header.tsx`: logo, menu to `/tmasi/v3/about/`, `/tmasi/v3/services/`, `/tmasi/v3/contacts/`, `/tmasi/v3/blog/`, language switch to `/tmasi/v3/de/`, `/pl/`, `/es/`, both actions at equal weight, compact on scroll; phone menu (Claude)
- [ ] T034 [US2] Keep both actions one tap away on phones (FR-012a) in the form picked on board 2 (header or bottom action bar) in `tmasi-v4/src/components/ActionBar.tsx` (Claude)
- [ ] T035 [P] [US2] Write `tmasi-v4/src/components/PartnerBand.tsx`: "Ready to partner with TMASI Global?", its line, "Get in Touch" and "Request a Quote" at equal weight (agy)
- [ ] T036 [US2] Write `tmasi-v4/scripts/mock-send.mjs` (local endpoint that records the payload) and run quickstart scenario 8 against it; never post to TMASI's inbox in tests (Claude)

**Checkpoint**: MVP complete: hero plus actions, ready to show him locally

---

## Phase 5: User Story 3 - A partner reads what TMASI does, in its own words (Priority: P2)

**Goal**: every v3 home section with all its words, in the picked compositions

**Independent Test**: `npm run build` prints 0 foreign, 0 missing; quickstart scenarios 1 and 15 pass

- [ ] T037 [US3] Write `tmasi-v4/src/components/Reveal.tsx`: read-more that keeps the full text in the DOM (so the word check counts it), `aria-expanded`, opens in place (FR-003); with reduced motion it opens without animation (FR-021) (Claude)
- [ ] T038 [P] [US3] Write `tmasi-v4/src/components/About.tsx` with the stats band (copy `tmasi-next/src/components/CountUp.tsx` and add reduced motion: the final number shows at once, FR-021; v3's copy has no such check) per board 2, desktop and phone compositions (agy)
- [ ] T039 [P] [US3] Write `tmasi-v4/src/components/Relax.tsx` per board 2 (agy)
- [ ] T040 [P] [US3] Write `tmasi-v4/src/components/CoreValues.tsx` per board 2 (agy)
- [ ] T041 [P] [US3] Write `tmasi-v4/src/components/MissionVision.tsx` with `Reveal` per board 2 (agy)
- [ ] T042 [P] [US3] Write `tmasi-v4/src/components/WhyChoose.tsx` per board 2 (agy)
- [ ] T043 [P] [US3] Write `tmasi-v4/src/components/Services.tsx`: six groups with every item; View Details to the five v3 service pages, Additional Services to `/tmasi/v3/services/` (agy)
- [ ] T044 [P] [US3] Write `tmasi-v4/src/components/Hubs.tsx`: five office cards, selecting one turns the hero globe to it, links to `/tmasi/v3/contacts/` (Claude)
- [ ] T045 [P] [US3] Write `tmasi-v4/src/components/News.tsx`: latest posts with their own pictures, links to `/tmasi/v3/blog/<post>/` and "View All News" (agy)
- [ ] T046 [P] [US3] Write `tmasi-v4/src/components/Footer.tsx`: Quick Links, offices, social links (copy `tmasi-next/src/components/SocialLinks.tsx`), copyright line, "Powered by" PULSE Marketing link (agy)
- [ ] T047 [US3] Write `tmasi-v4/src/app/layout.tsx` (lang en, fonts, `data-scroll-behavior="smooth"` from `tmasi-next/src/components/site/RootHtml.tsx`, noindex, one H1 rule, JSON-LD organisation graph pattern from `tmasi-next/src/lib/seo.ts` with the five offices) and `tmasi-v4/src/app/page.tsx` composing all sections in the board 2 order (Claude)
- [ ] T048 [US3] Run `npm run build`, fix every word-check failure by moving words, never by editing them; run quickstart scenarios 1 and 15 (Claude)

---

## Phase 6: User Story 4 - A partner trusts what they see (Priority: P2)

**Goal**: official partner logos linked to their posts; every number traced

**Independent Test**: each logo opens its post; every number matches a word source

- [ ] T049 [P] [US4] Download the official logos (SVG preferred) of Egypt Healthcare Authority, Hansa Medica Group, ITIC Global, Uniglobal from their own sites into `tmasi-v4/public/logos/`; record `logoSource` in `tmasi-v4/src/content/media.json` (Claude)
- [ ] T050 [US4] Write `tmasi-v4/src/components/PartnerLogos.tsx`: full colour row, links to `egypt-healthcare-authority-agreement-africa-health-excon-2025`, `hansa-medica-group-partnership-grand-egyptian-museum`, `itic-global-2026-istanbul-official-sponsor`, `uniglobal-global-insurance-conference-barcelona` under `/tmasi/v3/blog/` (agy)
- [ ] T051 [US4] List every number on the built page with its word source in `specs/009-tmasi-v4/numbers-trace.md` (Claude)

---

## Phase 7: User Story 5 - It feels premium on a phone, with real 3D (Priority: P2)

**Goal**: the phone's own composition of every section and the real-3D guided tour

**Independent Test**: quickstart scenarios 5 and 9 pass at 390 x 844; scenario 18 on real phones after the push

- [ ] T052 [US5] Write `tmasi-v4/src/globe/tour.ts` and `tmasi-v4/src/components/OfficeCards.tsx`: guided tour in story order, card row with scroll-snap that follows it, tap on 44 px pin targets and card swipe jump to an office, no drag (Claude)
- [ ] T053 [US5] Add the phone profile to `tmasi-v4/src/globe/profile.ts` and `scene.ts`: about 6,000 dots from `land-phone.bin`, no effects, pixel ratio rules of the globe contract (Claude)
- [ ] T054 [US5] Check the phone composition that each section component (T038 to T046) carries from board 2 at 360 and 390 px, and fix any section that is a squeezed desktop instead of its own phone form (agy, Claude reviews)
- [ ] T055 [US5] Run quickstart scenarios 5 and 9 (Claude)

---

## Phase 8: User Story 6 - Motion and media that mean something (Priority: P3)

**Goal**: 3D icon set, silent loops, the film, all images, every asset approved and in budget

**Independent Test**: quickstart scenarios 11 and 16 pass; every `media.json` entry is `approved`

- [ ] T056 [US6] Write `specs/009-tmasi-v4/media/prompts-images.md` (one prompt per image of the plan's asset inventory, with target file name and size); drive his Gemini in Chrome; he downloads into `tmasi-v4/.work/images/` (Claude + Mohamed)
- [ ] T057 [P] [US6] Pick stock where it reads truer (Pexels), log each page URL and licence in `tmasi-v4/src/content/media.json` (agy draft, Claude verifies by eye)
- [ ] T058 [US6] Write `specs/009-tmasi-v4/media/prompts-veo.md`: 4 to 6 film shots and 1 or 2 loops; he makes the clips; check each for watermark and artefacts before use (Claude + Mohamed)
- [ ] T059 [US6] Write `tmasi-v4/scripts/encode-media.sh` (ffmpeg 8.1.1): loops 1080p and 720p MP4 H.264 (+ WebM VP9 if smaller), no audio, within budget; film 1080p and 720p with AAC; output to `tmasi-v4/public/loops/` and `public/film/` (Claude)
- [ ] T060 [P] [US6] Make every poster as its own image (generated or built), never a frame from a video, into `tmasi-v4/public/posters/` (Claude)
- [ ] T061 [US6] Make the full icon set from the winning source, one light, one material, teal, at or under 25 KB each at 2x, into `tmasi-v4/public/icons/` (Claude + Mohamed)
- [ ] T062 [P] [US6] Write `tmasi-v4/src/components/VideoLoop.tsx` (`preload="none"`, starts near the screen, pauses off screen, catches `play()`, poster stays on refusal) and `FilmModal.tsx` (full screen, sound, focus trap, Esc closes, focus returns); with reduced motion loops show their poster and do not play (FR-021) (Claude)
- [ ] T063 [US6] Write `tmasi-v4/src/components/Icon3D.tsx` and place icons in Why Choose, Core Values, Mission and Vision, Services as picked (agy)
- [ ] T064 [US6] Complete `media.json` (every asset: source, licence, files with KB, alt, status); he approves each; any asset not ready ships on the preview as a labelled design slot (purpose, pixel size, format) listed in `docs/tmasi-v4-design-slots.md`; run quickstart scenarios 11 and 16 (Claude + Mohamed)

---

## Phase 9: Polish & Cross-Cutting Concerns

- [ ] T065 Load Sofia per research R7 (after the first scroll or tap) in `tmasi-v4/src/app/layout.tsx`; run quickstart scenario 13; if it still opens by itself, ask him to switch auto-open off in TMASI's Jotform account (Claude)
- [ ] T066 [P] Accessibility pass: axe scan and a manual Tab pass, contrast of every word over the globe, photos and video (quickstart 10) (Claude)
- [ ] T067 [P] Speed pass: Lighthouse mobile and desktop on the static export, Chrome trace at 4x CPU, `check:weight` green (quickstart 2, 7) (agy runs, Claude reads)
- [ ] T068 [P] Width screenshots at 360, 390, 768, 1024, 1440, 1920; every outbound link; the rendered head (quickstart 9, 12, 14) (agy, Claude reviews)
- [ ] T069 Run `/impeccable audit` and `/impeccable polish` on the built home and `review-animations` on its motion; fix what holds up (Claude)
- [ ] T070 Gemini second opinion on the full diff (`agy-delegate --read-only --model gemini-3.1-pro-high --effort high`); Claude verifies every point (Claude)
- [ ] T071 `npm run sync`, root `npm test`, registry status to `draft`, a line per stage in `docs/tmasi-worklog.md` (Claude)
- [ ] T072 GATE: his yes to push; commit by named path, push, open https://hcig-passport.vercel.app/tmasi/v4 on desktop and phones, run quickstart 3, 5, 13, 18 online (Mohamed, then Claude)
- [ ] T073 Review rounds desktop then phone until he approves (SC-009); registry to `review`, then `approved`; update memory and HANDOVER; open the inner-pages and languages spec (Claude)

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (T001 to T006): none
- Foundational: T007 to T016 after Setup; T017 and T018 need T013 to T016; **T021 (his board 1 picks) blocks US1 and US5**; T022 and T023 need T021; **T024 (his board 2 picks) blocks US2's phone action form, US3, US4, US6**
- US1 after T021; US2 after T021 (T034 after T024); US3 and US4 after T024; US5 after US1 and T024; US6 after T024 (media can start right after T024, in parallel with US3)
- Polish after the stories in scope are done

### User Story Dependencies

- US1 (P1): the base everything sits on
- US2 (P1): independent of US1 except sharing the header slot
- US3 (P2): independent; Hubs (T044) talks to the globe through `focus(office)`
- US4 (P2): independent
- US5 (P2): builds on US1's engine and US3's sections
- US6 (P3): independent build; its assets feed US3 sections

### Within Each User Story

Data and content before components; components before the page; the story's quickstart scenarios last.

### Parallel Opportunities

- Setup: T002 to T005 together
- Foundational: T008, T010, T011, T012 together; T017 while T018 is built
- US3: T038 to T046 as parallel Hive tickets once T037 and the board 2 picks exist
- US6: T057, T060, T062 together while he makes clips

## Parallel Example: User Story 3

```text
Hive tickets (epic 009-tmasi-v4), dispatched together after T024:
T038 About.tsx   T039 Relax.tsx   T040 CoreValues.tsx   T041 MissionVision.tsx
T042 WhyChoose.tsx   T043 Services.tsx   T045 News.tsx   T046 Footer.tsx
Claude reviews each diff with `npm run build` (word check) before merge.
```

## Implementation Strategy

### MVP first (User Stories 1 and 2)

1. Setup, then Foundational through both canvas gates
2. US1 hero, then US2 actions
3. **Stop and show him locally** (screenshots desktop and phone): the network story and both actions

### Incremental delivery

1. US3 words in the picked compositions, word check green
2. US4 logos and the numbers trace
3. US5 phone compositions and the real-3D tour
4. US6 media as he approves each asset
5. Polish, then the push on his yes, then review rounds

### Rules that hold at every step

Words never edited (only moved); no em or en dashes; nothing pushed without his yes; v3 untouched;
commit by named path; never `npm run publish`; never a shell inside `tmasi-v4/out`.
