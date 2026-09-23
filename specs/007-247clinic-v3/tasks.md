---
description: "Task list for 24/7 Clinic v3"
---

# Tasks: 24/7 Clinic v3

**Input**: `specs/007-247clinic-v3/` (spec approved 2026-09-23, plan, research, data-model, contracts, quickstart)

**Tests**: the spec requires gates, not unit tests: the word-for-word checker, Playwright at 375 and 1440, reduced motion, JavaScript off, axe, Lighthouse. They appear as verification tasks.

**Paths**: the app is `247clinic-v3/` at the repo root; content is `content/247clinic/`; preview export goes to `src/247clinic-v3/`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: can run in parallel (different files, no open dependency)
- **[Story]**: US1 unwell guest, US2 insurance, US3 his review, US4 find a clinic, US5 B2B, US6 search and AI

---

## Phase 1: Setup

- [x] T001 Scaffold `247clinic-v3/` from `medcierge-next/` config: `package.json` (next 16.3.5, react 19.2.8, tailwindcss 4, motion, leaflet, lucide-react; dev: sharp), `tsconfig.json`, `postcss.config.mjs`, `eslint.config.mjs`, `.gitignore` (`/out`, `/.next`, `/node_modules`, `/public/media`)
- [x] T002 Write `247clinic-v3/next.config.ts`: `output: "export"`, `images.unoptimized`, `trailingSlash: false`, `basePath` "/247clinic/v3" when `V3_TARGET=preview` (default) and "" when `live`, `env.NEXT_PUBLIC_BASE_PATH`, `env.NEXT_PUBLIC_TARGET`
- [x] T003 [P] Copy `medcierge-next/scripts/flatten-rsc.mjs` to `247clinic-v3/scripts/flatten-rsc.mjs`; npm `build` = `next build && node scripts/flatten-rsc.mjs && node scripts/check-brief.mjs`
- [x] T004 [P] Subset Calisto MT Regular and Bold (from `247 material/*.ttf`, gitignored) to Latin woff2 in `247clinic-v3/src/fonts/`
- [x] T005 Install dependencies in `247clinic-v3/` and confirm an empty export builds

## Phase 2: Foundational (blocks every story)

- [x] T006 Tokens from DESIGN.md v3 into `247clinic-v3/src/app/globals.css` (`@theme`: colours incl. `wa #0E8340`, `wa-deep #0B6E36`, `primary #C00000`, radii, shadows, easing; base type; `.container`, `.section`, eyebrow, h1, h2, lead; `html.js` reveal gate; reduced-motion block)
- [x] T007 Fonts in `247clinic-v3/src/app/layout.tsx`: Poppins 400/500/600/700 via `next/font/google`, Calisto via `next/font/local` with fallback "Book Antiqua, Palatino, Georgia"; `<html lang="en">`; inline script that adds `js` to `<html>`; preview robots `noindex, nofollow`
- [x] T008 [P] Content loader `247clinic-v3/src/content/load.ts` reading `content/247clinic/en/*.json` at build time; `section(page, id)` helper; `devNotes` never exposed
- [x] T009 [P] `247clinic-v3/src/content/ui-labels.json` (our interface words only, per contracts/content.md) and `247clinic-v3/src/data/facts.ts` (phone +20 122 222 8247; 20 years; 30 clinics; 300 staff; each with "stated by the user 2026-09-23")
- [x] T010 [P] `247clinic-v3/src/lib/wa.ts` (wa.me links from data-model WhatsAppContext, exact brief messages) and `247clinic-v3/src/lib/track.ts` (events from contracts/whatsapp-events.md, fire and forget)
- [x] T011 `247clinic-v3/scripts/check-brief.mjs`: every visible sentence, alt, aria-label, title in `out/**/*.html` must be a substring of the normalised brief or a ui-label; fail on U+2013, U+2014, "Lorem", "guarantee" with cashless, "accredited" next to GHA/DMWV; print page, element, nearest brief line
- [x] T012 [P] UI primitives in `247clinic-v3/src/components/ui/`: `Button.tsx` (variants wa green, call red, secondary, link), `Section.tsx` (eyebrow, h2, lead), `DesignSlot.tsx` (tint ground, dashed primary-line border, label "Dedicated design: {purpose}, {px}"), `Reveal.tsx`, `CountUp.tsx` (final value in HTML), `Marquee.tsx` (CSS loop, pause on hover and focus, static grid under reduced motion), `Icon.tsx` (lucide + WhatsApp glyph from Medcierge)
- [x] T013 Preview wiring: `247clinic-v3/scripts/sync-preview.mjs` (out/ to `src/247clinic-v3/`), block in root `build.js` copying `src/247clinic-v3` to `dist/247clinic/v3` with noindex, registry link in `content/registry.js` (247clinic > website-v3)

**Checkpoint**: `npm run build` in `247clinic-v3/` exports, the checker passes, `node build.js` serves `/247clinic/v3/`.

## Phase 3 (assets, parallel with Phase 2)

- [x] T014 [P] Hero film: first 14 s of `247 material/Le reve 247 full commercial.mp4`, no audio, 1276x720 H.264 faststart + VP9 WebM, and a 960x540 phone cut, into `247clinic-v3/public/media/hero-*.{mp4,webm}`; log sizes (targets 2.5 MB and 1.2 MB)
- [x] T015 [P] Story and staff films: portrait 540x960 card cuts and a 720x1280 viewer cut for patient 1, 3, 4, 5 and staff 1 to 3; landscape 960x540 for the two Poland and Romania patient films, into `247clinic-v3/public/media/`; film list in `247clinic-v3/src/data/films.ts` (labels from his file names)
- [x] T016 [P] Logos into `247clinic-v3/public/logos/` with `SOURCES.md`: Medcierge set (allianz, axa, bupa, cigna, generali, metlife, intl), 24/7 own (adac, connecx, international-sos, mondial), accreditation (uca, gha, dmwv/gmwa); `247clinic-v3/src/data/logos.ts`
- [ ] T017 Hive ticket (agy): source more insurer and assistance logos and the hotel brand logos listed in plan 1.3 and 1.4, official sources only, into a worktree for review
- [x] T018 [P] `247clinic-v3/src/data/clinics.ts` + `destinations.ts`: 30 clinics from `content/247clinic/clinics.json`, destination derived from coordinates, Premier Le Rêve corrected to 27.024343, 33.887027, the three at 27.2578957, 33.8116067 marked `placeholder`; counts per destination
- [x] T019 [P] `docs/247clinic-v3-design-slots.md`, `docs/247clinic-v3-gaps.md`, `docs/247clinic-v3-media-credits.md` first drafts

## Phase 4: User Story 1, an unwell guest reaches a doctor in one tap (P1, MVP)

**Goal**: the home tells a guest what 24/7 Clinic is in five seconds and WhatsApp is always one tap away.
**Independent test**: quickstart steps 2 to 6 on the home.

- [x] T020 [US1] `247clinic-v3/src/components/layout/Header.tsx`: glass over the hero, solid after 24px; brief nav (global.json); red call button; green "WhatsApp Us 24/7"; phone: green "Need a Doctor?", red call icon, menu sheet `MobileMenu.tsx`
- [x] T021 [US1] `247clinic-v3/src/components/layout/WhatsAppFloat.tsx` copied from `medcierge-next/src/components/WhatsAppFloat.tsx` and its CSS: prompts from the brief ("Need a Doctor?", "Need Medical Help?", "WhatsApp Us 24/7"), small line "WhatsApp Medical Support 24/7", green `#0E8340` so white text passes
- [x] T022 [US1] `247clinic-v3/src/components/home/HeroFilm.tsx`: full-bleed film (T014), light scrim, glass panel with h1, paragraph, supporting line, "WhatsApp Us 24/7" (green), "Find Your Clinic", trust statement with UCA mark; pause button; design slot "Hero still" under reduced motion; no poster from the film
- [x] T023 [P] [US1] `home/Accreditation.tsx`: brief 7 heading, sentence, four points with icons, UCA logo, CAUCQ design slot, "Learn About Our Accreditation"
- [x] T024 [P] [US1] `home/Intro.tsx`: brief 8 text, pull line "Hospital care when necessary - not automatically.", a staff or clinic film card, "Find a Clinic"
- [x] T025 [P] [US1] `home/WhyHotel.tsx`: brief 9, four icon cards with hover lift
- [x] T026 [P] [US1] `home/Services.tsx`: brief 10, six cards, each with a 4:3 design slot "Service card, {title}, 1200 x 900", "View All Medical Services"
- [x] T027 [P] [US1] `home/HowItWorks.tsx`: brief 12, four steps, line that draws on view, "Get Medical Help Now" (green)
- [x] T028 [P] [US1] `home/Stories.tsx` + `FilmViewer.tsx`: "What Our Patients Say", films at natural shape in a snap row, play in view, tap opens a frosted-white viewer with sound; written reviews quoted exactly from their site
- [x] T029 [P] [US1] `home/Finder.tsx` + `Numbers.tsx`: brief 13 (active destinations only, counts from T018, links later), Leaflet map on scroll, numbers band 20 / 30 / 300 with brief labels, "View All Clinics"
- [x] T030 [P] [US1] `home/HotelMarquee.tsx`: hotel brand logos from T016/T017
- [x] T031 [US1] `home/FinalCta.tsx`: brief 16 on a light panel (no red band), "WhatsApp Us Now" green, "Find Your Nearest Clinic"; `layout/Footer.tsx` light, nav + footer-only links, contact, accreditation wording, HCIG line
- [x] T032 [US1] Compose `247clinic-v3/src/app/page.tsx` in FR-007 order; WhatsApp after each major section
- [x] T033 [US1] Motion pass: reveals, count-up, marquees, step line, hero panel entrance; verify JavaScript off and reduced motion

## Phase 5: User Story 2, insurance and cashless (P1)

- [x] T034 [US2] `home/Insurance.tsx`: brief 11 heading, subheading, both paragraphs, six assist items with check icons, "Check Your Insurance on WhatsApp" (green, insurance message), "Learn About Insurance & Cashless Care"; insurer marquee (T016/T017)
- [x] T035 [US2] Checker confirms no cashless sentence outside the brief's own

## Phase 6: User Story 3, his review of the home (P1, review gate 1)

- [x] T036 [US3] Playwright pass at 375x667 and 1440x900, videos hidden before screenshots; fix what the screenshots show
- [ ] T037 [US3] `/impeccable critique` and `audit`; axe; Lighthouse mobile; contrast table (contrast table done in DESIGN.md; design hook ran on every file; full critique, axe and Lighthouse on the published URL still to do)
- [x] T038 [US3] Second opinion on the finished home via `hive_consult`; apply what holds
- [x] T039 [US3] Slots document matches the page one for one
- [ ] T040 [US3] Publish preview (commit only v3 paths, clean of unrelated work), rendered-head check on `https://hcig-passport.vercel.app/247clinic/v3`, registry status `review`, send him the link and the slots list

**Gate 1**: his notes on the home. Phases below start after his yes and carry his notes.

## Phase 7: Apply his notes (coarse)

- [ ] T041 Apply every note from his home review; record real corrections as Hive lessons (`node hive/cli.js lesson frontend-engineer "..."`)

## Phase 8: User Story 4, find a clinic, destinations, 30 hotel pages (P2, coarse)

- [ ] T042 [US4] `/our-clinics` with destination and hotel filters, clinic cards (brief 19)
- [ ] T043 [US4] 6 destination pages (brief 21) and 30 hotel pages (brief 20) via `generateStaticParams`, per contracts/urls.md
- [ ] T044 [US4] Gate 3 review

## Phase 9: User Story 5, B2B and inner pages (P3, coarse)

- [ ] T045 [US5] Inner pages of brief 17 to 29 on the locked components, per contracts/urls.md; contact form handoff (FR-025)
- [ ] T046 [US5] Gate 2 review

## Phase 10: User Story 6, search and AI (P3, coarse)

- [ ] T047 [US6] Meta from the brief's own lines, schema (MedicalClinic, Organization, BreadcrumbList, FAQPage on `/faqs`), sitemap, robots, llms.txt, internal links

## Phase 11: Polish, languages, go-live (coarse, separate yeses)

- [ ] T048 DE, PL, CS on the Medcierge dictionary recipe (separate yes)
- [ ] T049 IIS probe, production build, `deploy/web.config`, backup, cutover, rollback plan per contracts/iis-deploy.md (separate yes)

## Dependencies

Setup (T001 to T005) then Foundational (T006 to T013). Assets (T014 to T019) run alongside
Foundational. US1 and US2 need both. US3 needs US1 and US2. Everything from Phase 7 on waits
for gate 1.

## Parallel examples

- After T012: T023, T024, T025, T026, T027, T028, T029, T030 are separate files.
- T014, T015, T016, T018, T019 run together; T017 runs on agy in the background.

## Implementation strategy

MVP is the home (US1 + US2) shown to him (US3). Nothing else is built before his notes.
