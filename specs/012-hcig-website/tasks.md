---
description: "Task list for spec 012, the healthcareig.com rebuild"
---

# Tasks: healthcareig.com, the HCIG group website

**Input**: `specs/012-hcig-website/` (spec approved 2026-10-18, plan, research, data-model, contracts, quickstart)

**Organization**: grouped by his nine phases, in his order. Story labels map each task to the user stories in
`spec.md` (US1 to US12). Owners: **Opus** (planning, research, design, key builds, anything live), **Gemini** (only
implementation of medium and low priority work on approved templates, generation, second-opinion reviews; Opus reads
every diff and runs the checks before it lands), **GATE** (his or Irina's decision; nothing after it starts until it is
recorded in `docs/hcig-website-worklog.md`).

**Tests**: the spec asks for measurable checks, so check tasks are included where a phase needs proof.

## Format: `[ID] [P?] [Story] Owner: description with path`

- **[P]**: can run in parallel (different files, no dependency on an unfinished task)
- Hive tickets carry `epic: "012-hcig-website"`; the spec is approved, so the gate lets them dispatch.

---

## Phase 0: Live fixes and baseline (US6), weeks 0 to 1

**Goal**: today's site fixed invisibly and measured, previewed on `/hcig-live` first.
**Independent test**: rendered heads of all 10 pages show the fixes; GA4 records visits; visible text unchanged.

- [ ] T001 GATE (Mohamed): import `~/.ssh/hcig_rsa.pub` in cPanel (Security, SSH Access, Manage SSH Keys, Import, Authorize) and send the cPanel username; Opus then adds `Host hcig` to `~/.ssh/config` like `Host tmasi`
- [ ] T002 [US6] Opus: add `hcig-live/` to the root `.gitignore`; full backup with `tar` of `public_html` to `~/backups/pre-phase0-<date>.tgz`; download a local mirror to `hcig-live/backup-<date>/`; compare file counts
- [ ] T003 [US6] Opus: read `send.php`, `.htaccess`, the page PHP files and shared includes; list the PHP versions cPanel offers; note all of it in `docs/hcig-website-worklog.md`
- [ ] T004 [US6] Opus: write `scripts/hcig-phase0.mjs`, one function per head fix in `contracts/phase0-live-fixes.md` items 3, 4, 5, 7, 9, 12, 14 (absolute self-canonical, `lang="de"` on the 4 German pages, hreflang pairs plus x-default, correct `og:url`, one structured-data graph without `Offer`, `EducationalOrganization` or stray `MedicalClinic`, favicon links, single Ads tag), applied to the downloaded PHP files in `hcig-live/work/` and by `scripts/mirror-hcig-live.mjs --phase0`
- [ ] T005 [US6] Opus: patch `hcig-live/work/i18n.js` so the SEO block never runs when `seoData` is undefined and never overrides the canonical; guard the home language switcher (`langSwitcher` null); console clean on all 25 pages in the preview
- [ ] T006 [P] [US6] Gemini (generation, Opus art-directs and reviews): four share images, 1200 x 630, replacing the 404 files `hcig-live/work/assets/images/og-services.jpg`, `og-partners.jpg`, `og-contact.jpg`, `og-blog.jpg`, built on real HCIG photos and the brand, no text that is not already on the site
- [ ] T007 [P] [US6] Opus: favicon set from the brand mark (`favicon.ico`, 16 and 32 px PNG, 180 px touch icon, 512 px icon) in `hcig-live/work/`
- [ ] T008 [P] [US6] Opus: re-encode the three testimonial films at the same file names in `hcig-live/work/testimonial/` (H.264, faststart, at least 720p, no visible loss); record sizes before and after; compare as video, never by stills
- [ ] T009 [US6] Opus: German title for `/de/ueber-uns/` built only from that page's own German words; one line in chat for his yes
- [ ] T010 [US6] Opus: standalone consent banner `hcig-live/work/consent/consent.js` and `consent.css` (contracts/leads-and-events.md: Accept all, Reject, Settings; `hcig_consent` cookie; Consent Mode v2 denied by default), new GA4 property loader, Yandex counters 110788507 and 110788548 loaded only after an analytics yes; banner wording drafted for his yes
- [ ] T011 GATE (Mohamed): yes to the banner wording, the German About title and the four share images, seen on `/hcig-live`
- [ ] T012 [US6] Opus: `node scripts/mirror-hcig-live.mjs --phase0`, root `npm test`, push, so he sees every Phase 0 change at `https://hcig-passport.vercel.app/hcig-live/` before upload
- [ ] T013 [US6] Opus: `hcig-live/work/.htaccess` with the Phase 0 one-hop 301s from `contracts/urls.md` and `hcig-live/work/sitemap.xml` listing the 15 news posts; the two-column indexing note to him in chat first
- [ ] T014 GATE (Mohamed): his word to upload Phase 0 to healthcareig.com
- [ ] T015 [US6] Opus: upload over one SFTP connection with `hcig-live/phase0.sftp`, `.htaccess` last, originals kept in `~/backups/`; verify rendered heads on all 10 pages, redirects, console, tags only after consent; before and after in `docs/hcig-website-worklog.md`
- [ ] T016 [US6] Opus: Search Console (HTML-file verification, sitemap submitted), Bing Webmaster Tools (import), GA4 key events for the old contact form and phone and email taps; IDs recorded in `C:/Users/maqmo/.claude/skills/hcig/memory/stack-access.md` (no secrets)
- [ ] T017 [US6] Opus: email test from partner@healthcareig.com to Gmail and a header checker; then, after DNS and Microsoft 365 admin access, SPF `include:spf.protection.outlook.com include:secureserver.net -all`, DKIM enabled in Microsoft 365 (two CNAMEs), DMARC `p=none` with reports; old records saved in `hcig-live/dns-before.txt`; re-test
- [ ] T018 [US6] Opus: if cPanel offers PHP 8.1 or newer, test `send.php` on a copy, switch the domain, test the form; otherwise record why not
- [ ] T019 [US6] Opus: harden `send.php` if T003 finds header injection or missing validation; test send
- [ ] T020 [P] [US6] Opus: baselines in `docs/hcig-website-baseline.md`: Lighthouse mobile and desktop on the 10 pages, Search Console export (queries, pages, countries, `?lang=` URLs in the index), the 30 AI prompts in ChatGPT, Perplexity, Gemini and Copilot plus AI Overviews, backlinks from Search Console
- [ ] T021 [US6] Opus: refresh `/hcig-live` from the live site after upload; update `content/registry.js` and the work log

---

## Phase 1: Research and fact base (foundational), weeks 0 to 2

**Purpose**: the words, facts, keywords and site map every page depends on. Blocks Phases 3 to 8.

- [ ] T022 Opus: adapt TMASI's extractor to `hcig-v3/scripts/extract-live.py`; output `hcig-v3/src/content/source/en.json` and `de.json` from `hcig-v3/material/live-site/pages/` (desktop and phone copies of a section extracted once; HTML comments ignored)
- [ ] T023 Opus: fact sheet `docs/hcig-website-fact-sheet.md` and `hcig-v3/src/content/facts.ts`: every number, name, address, partnership, brand site and board title with its source
- [ ] T024 GATE (Mohamed): confirm the fact sheet, the board list with real photos, MedOne's facts, testimonial consent
- [ ] T025 Opus: `hcig-v3/scripts/keywords/autocomplete.mjs` harvesting Google autocomplete for the seed clusters per partner type in 7 languages and their source countries; output `docs/hcig-website-keywords-raw.json`
- [ ] T026 Opus: Keyword Planner through Claude in Chrome on the HCIG Ads account (DE, AT, CH, PL, CZ, FR, IT, ES, UK, Nordics, EG) and free Semrush spot checks; volumes and CPCs added to the raw file
- [ ] T027 Opus: keyword map `docs/hcig-website-keywords.md`: intent clusters, one main keyword per page per language, no two pages competing, CPC ranges for the ads proposal
- [ ] T028 Opus: competitors and AI baseline `docs/hcig-website-competitors.md` (CONNEX, Egypt In-Touch, The Integrated Clinic Company, Egypt Global Assistance, Remed; who ranks; who AI tools name; which directories they use)
- [ ] T029 Opus: freeze the site map in `hcig-v3/src/lib/routes.ts` and `docs/hcig-website-sitemap.md` (page ids, section roots per language from `contracts/urls.md`, leaf slugs from the keyword map, news slugs from post titles)
- [ ] T030 GATE (Mohamed): confirm the site map and the news slugs
- [ ] T031 [P] Gemini (implementation, low): official logo files (SVG where it exists) for the 23 insurers, 8 brands, GHA, DMWV, UCA into `hcig-v3/public/logos/` with sources in `docs/hcig-website-logo-sources.md`; Opus checks each against its official source
- [ ] T032 [P] Opus: asset library `hcig-v3/material/library/` from the live pull and the group sites' own material in this repo, listed in `docs/hcig-website-assets.md` (source, licence, where usable) with a gap list
- [ ] T033 [P] Gemini (generation, Opus art-directs and reviews): images (Nano Banana) and film shots (Veo) for the gap list through the `imagine` skill into `hcig-v3/material/generated/`; AI-made people never shown as named leaders, staff, patients or testimonials

---

## Phase 2: Design system and canvas (US3), weeks 1 to 4

**Goal**: he sees and picks the look before any code. **Independent test**: his recorded picks and yeses.

- [ ] T034 [US3] Opus: luxury layer in `C:/Users/maqmo/.claude/skills/hcig/references/design-md/hcig/DESIGN.md`: space, type scale, motion tokens and hairline icon rules on the exact HCIG colours, Helma and Inter, measured contrast pairs
- [ ] T035 [US3] Opus: Claude Design canvas, board 1: Ivory editorial, Noir and turquoise, Hybrid as complete home pages (working menu, real words and photos, footer, consent banner), desktop first, then phone
- [ ] T036 [US3] Opus: canvas board 2: five heroes (film, network map, editorial photo, the system drawn, the 3D ecosystem) in the leading direction, with the B2B recommendation and the reason
- [ ] T037 GATE (Mohamed): pick the direction and the hero
- [ ] T038 [US3] Opus: canvas board 3: the full home in the chosen direction, every section, desktop then phone, plus the hairline icon set
- [ ] T039 GATE (Mohamed): yes to the full home
- [ ] T040 [US3] Opus: canvas board 4: templates for service, partner type, brand, trust, news post, leadership, network, contact; desktop then phone
- [ ] T041 GATE (Mohamed): yes to the templates

---

## Phase 3: Scaffold and home (US1, US3, US4), weeks 4 to 6

**Goal**: the approved home, live on `/hcig/v3`. **Independent test**: US1 five-person test, aura test, checks green.

- [ ] T042 Opus: scaffold `hcig-v3/` on the tmasi-next pattern: `package.json` (next 16.3.6, react 19.2.8, tailwindcss 4, motion), `next.config.ts` (`output: "export"`, `trailingSlash: true`, `images.unoptimized`, `globalNotFound`, basePath from `HCIG_BASE_PATH`, default `/hcig/v3`), `tsconfig.json`, eslint, `hcig-v3/.gitignore`
- [ ] T043 Opus: `hcig-v3/scripts/sync-preview.mjs` (to `../src/hcig-v3`), `flatten-prefetch.mjs`, `build-live.mjs` (`HCIG_BASE_PATH=""`, `SITE_URL`, `NEXT_PUBLIC_LEAD_ENDPOINT`, `LIVE_OUT` into `../hcig-live/`); root `build.js` block serving `src/hcig-v3` at `/hcig/v3`
- [ ] T044 Opus: `hcig-v3/scripts/check-words.mjs`, `check-hreflang.mjs`, `check-links.mjs`, `check-weight.mjs` and `npm run check` per `contracts/content.md`
- [ ] T045 Opus: tokens and fonts: `hcig-v3/src/app/globals.css` from DESIGN.md; `hcig-v3/src/app/fonts.ts` (Inter through `next/font`; Helma through `next/font/local` from `public/fonts/Helma.woff2` once the licence is confirmed, stand-in otherwise, `size-adjust` fallback)
- [ ] T046 Opus: `hcig-v3/src/lib/routes.ts`, `seo.ts` (title, description, canonical, hreflang for existing languages only, OG) and `schema.ts` (graph per `contracts/seo-schema.md`)
- [ ] T047 Opus: `hcig-v3/src/app/(en)/layout.tsx` (lang en), `(en)/[[...slug]]/page.tsx`, `global-not-found.tsx`, `robots.ts`, `sitemap.ts` (index plus `sitemap-en.xml`), `llms.txt`
- [ ] T048 Opus: `hcig-v3/src/components/Header.tsx` (semantic nav, menus for Services, Partners, Group, language switch, Talk to our team) and `Footer.tsx` (both offices, partner desk, languages, "Powered by Pulse Marketing", Cookie settings)
- [ ] T049 Opus: `hcig-v3/src/components/Consent.tsx`, `src/lib/consent.ts`, `src/lib/analytics.ts` per `contracts/leads-and-events.md` (script ids `hcig-*-init`; preview build loads no tags)
- [ ] T050 [US1] Opus: hero per the approved canvas; `hcig-v3/scripts/media.mjs` for desktop and phone film cuts, designed poster, `preload="none"`, attach after load; Watch film lightbox with sound
- [ ] T051 [US4] Opus: proof band and numbers from `facts.ts`; insurer logo marquee (23 logos, own colours, two rows, pause on hover, readable as a list) in `hcig-v3/src/components/`
- [ ] T052 [US1] Opus: "How Our System Works" six steps, services overview and the six-door partner chooser, site words only
- [ ] T053 [US7] Opus: eight brand blocks in their own colours with links; the CEO quote moment with his real photo
- [ ] T054 [US1] Opus: news rail; "partner with us" band; newsletter field (UI until Phase 4); JotForm agent loaded on idle after first interaction or 4 s
- [ ] T055 Opus: build, check, sync, root `npm test`, push; Playwright at 360, 390, 768, 1280, 1440, reduced motion, JavaScript off; aura test; item in `content/registry.js`
- [ ] T056 GATE (Mohamed): review rounds until the home is locked (each note scoped to the device he names)

---

## Phase 4: Inner pages and leads (US2, US4, US7, US10, US12), weeks 6 to 9

**Goal**: every English page and a working lead flow on `/hcig/v3`.
**Independent test**: six partner pages reachable in two clicks; 10 of 10 test leads land everywhere within 5 minutes.

- [ ] T057 [US2] Opus: partner-type template and the Insurance & Assistance Companies page in `hcig-v3/src/components/pages/PartnerType.tsx`
- [ ] T058 [P] [US2] Gemini (on the approved template; Opus reviews the diff): the other five partner-type pages from `routes.ts` and `content/`
- [ ] T059 [US2] Opus: partners hub `/partner/` with the site's existing words
- [ ] T060 [US4] Opus: Trust and Standards page `/trust/`: each proof item with its source; testimonials as video; events; named hotels
- [ ] T061 [US1] Opus: services hub, service template and the three key service pages (case management, evacuation and repatriation, insurance and claims)
- [ ] T062 [P] [US1] Gemini (on the approved template; Opus reviews): the remaining service pages
- [ ] T063 [US7] Opus: group hub `/group/`, brand template and the MedPark page
- [ ] T064 [P] [US7] Gemini (on the template; Opus checks every fact against the brand's own site): the other seven brand pages
- [ ] T065 [US7] Opus: About, Leadership (board, CEO quote) and Network (SVG map adapted from `tmasi-next/src/components/WorldMap.tsx` and `HubsMap.tsx`, places from `facts.ts`)
- [ ] T066 [P] Gemini (implementation; Opus runs the word checker): the 15 news posts word for word with their photos, and the `/blog/` index
- [ ] T067 [P] [US12] Gemini (implementation; Opus reviews): press room `/press/` with media kit; events index and event template `/events/<slug>/`; `hcig-v3/scripts/qr.mjs` for UTM-tagged QR codes
- [ ] T068 [P] Gemini (layout only; Opus writes the text from his legal details after GATE T024): privacy, cookies and legal notice pages
- [ ] T069 [US10] Opus: `hcig-v3/server/lead.php`, `server/tests/run.php` and `server/lead-config.example.php` per `contracts/leads-and-events.md`: `type` one of "enquiry, kit, newsletter"; `name` "2 to 120 characters"; `company` "2 to 160 characters"; `message` "Up to 2,000 characters"; honeypot `website`; `t` under 2,500 dropped; "more than 5 posts a minute" answers 429; email, CSV outside `public_html`, hub event, kit link, Brevo double opt-in
- [ ] T070 [US10] Opus: enquiry forms (contact and partner pages), kit form `/partner/kit/` with a noindex thank-you, newsletter field; events from the contract
- [ ] T071 [US2] Opus: partner kit: `hcig-v3/kit/templates/<type>.html` and `hcig-v3/scripts/kit-pdf.mjs` (Playwright print) to `public/kit/<type>-en.pdf`
- [ ] T072 Opus: new-copy review pack `docs/hcig-website-new-copy-1.md` (every new line with the fact it rests on)
- [ ] T073 GATE (Mohamed, then Irina): approve the new copy; Opus moves it into `hcig-v3/src/content/approved/en.json` with names and dates
- [ ] T074 Gemini (read-only review): second opinion on the Phase 4 diff against the contracts; Opus decides each point

---

## Phase 5: Quality and approval (US9, US11, US5), weeks 9 to 10

**Independent test**: SC-001 to SC-004 met on the preview.

- [ ] T075 [US9] Opus: structured data valid on every template; hreflang reciprocal; titles and descriptions unique; share images per page from `hcig-v3/scripts/og.mjs`; `llms.txt` and `llms-full.txt`
- [ ] T076 [US11] Opus: speed pass until every template scores 90 or more on mobile Lighthouse; weight budget green; film sizes within budget
- [ ] T077 [P] Gemini (sweep; Opus verifies findings): Playwright on every page at five widths, link check, axe report into `docs/hcig-website-qa-<date>.md`
- [ ] T078 [US5] Opus: `hcig-v3/scripts/check-redirects.mjs` and `hcig-live/htaccess.new` with every go-live rule (`contracts/urls.md`, `contracts/deploy-cpanel.md`)
- [ ] T079 Opus: compliance pass: every claim against `facts.ts`, partnership wording, the flagged wording list for Irina in `docs/hcig-website-flags.md`
- [ ] T080 GATE (Irina): approve the site on `/hcig/v3`; registry status approved

---

## Phase 6: English go-live (US5), week 10

**Independent test**: SC-003 (every old address answers or redirects once; no new 404s in 14 days).

- [ ] T081 GATE (Mohamed): his word to go live
- [ ] T082 [US5] Opus: `LIVE_OUT=build-<date> npm run build:live`; `lead.php` and `~/hcig-private/lead-config.php` on the host; backup; stage; swap (English PHP files to `~/old-site-<date>/`, `/de/` and its files kept); `.htaccess` last
- [ ] T083 [US5] Opus: `hcig-live/verify.sh` (old addresses, rendered heads, a real test lead, consent and tags); sitemaps in Search Console and Bing; IndexNow; `/hcig-live` refreshed; work log and registry set to live
- [ ] T084 [US5] Opus: 14-day watch: daily Search Console coverage and 404s, top-term positions, lead health; same-day fixes

---

## Phase 7: Six languages (US8), weeks 10 to 15

**Independent test**: every page in all seven languages, reciprocal hreflang, language switch keeps the page.

- [ ] T085 [US8] Opus: `hcig-v3/scripts/i18n-todo.mjs`, `i18n-fill.mjs`, `hcig-v3/src/content/dict/<lang>.json` and a fixed term list `dict/terms.json` (Medcierge pattern)
- [ ] T086 [US8] Opus: German: live German words kept, the rest translated; `(de)/de` route group; new German pages at the four existing addresses plus the new ones; German kit PDFs
- [ ] T087 [P] [US8] Gemini (read-only cross-check): German translation against the term list; Opus resolves each point
- [ ] T088 GATE (Mohamed): German wave go
- [ ] T089 [US8] Opus: upload German, replacing the old German PHP files at the same addresses only after the new files check out; old files to `~/old-site-<date>/`; verify; sitemaps
- [ ] T090 [US8] Opus: Polish, French, Italian, Spanish and Czech translations with their route groups and slugs from `contracts/urls.md`; check the `.pl.` host trap on Polish files
- [ ] T091 [P] [US8] Gemini (cross-check, then news first pass; Opus reviews): the five languages and the news posts
- [ ] T092 GATE (Mohamed): five-language wave go
- [ ] T093 [US8] Opus: diff upload of the five languages; hreflang reciprocity checked live; per-language sitemaps; IndexNow

---

## Phase 8: Growth (US9, US12), week 10 onward

- [ ] T094 [US9] Opus: one set of facts everywhere: LinkedIn company page, Crunchbase, Wikidata (with GHA's news as a reference), Google Business Profile for the Cairo office if eligible, Bing Places; name spelling and board titles identical
- [ ] T095 [P] [US9] Gemini (drafts; Opus approves): directory listings (ITIJ service directory, assistance and medical travel directories, GHA and DMWV partner listings) in `docs/hcig-website-listings.md`
- [ ] T096 [US9] Opus: partner link requests to GHA, DMWV, UCA and named hotels as email drafts (skill `hcig-writing`) for him to send
- [ ] T097 [P] [US12] Gemini (draft; Opus edits; he approves): four-week LinkedIn calendar from news and events in `docs/hcig-linkedin-plan.md`
- [ ] T098 [US12] Opus: Brevo newsletter template and the first issue draft (after he opens the account)
- [ ] T099 [US12] Opus: first event page and QR code from the template when he names the event
- [ ] T100 [US9] Opus: keyword articles for map gaps, two a month, facts from `facts.ts` only
- [ ] T101 Opus: ads proposal `docs/hcig-website-ads-proposal.md`: Google Search per partner type, LinkedIn audiences, CPCs, budget options, after 2 to 4 weeks of tracked leads
- [ ] T102 GATE (Irina): ads budget
- [ ] T103 Opus: build the Google Ads and LinkedIn campaigns from the proposal, conversions verified end to end first
- [ ] T104 [US9] Opus: monthly AI re-run and report to Irina; keyword map review 8 weeks after launch with Search Console data

---

## Polish and cross-cutting

- [ ] T105 Opus: add healthcareig.com to the site watchdog (spec 005): key pages, lead endpoint health, tags after consent, certificate expiry
- [ ] T106 Opus: at each phase end, update `C:/Users/maqmo/.claude/skills/hcig/memory/tasks/hcig-website.md`, `content/registry.js` and `docs/hcig-website-worklog.md`

---

## Dependencies and execution order

- **Phase 0** starts at T001 (his SSH import). Phase 1 and Phase 2 run alongside it (they need no server access).
- **Phase 3** needs T030 (site map), T039 (home canvas yes) and T041 (templates yes).
- **Phase 4** needs the home locked (T056) and the fact sheet confirmed (T024).
- **Phase 5** needs Phase 4 and the copy approved (T073). **Phase 6** needs T080 and T081.
- **Phase 7** needs Phase 6. **Phase 8** listings and content can start at Phase 6; ads need T101 and T102.

### Story map

| Story | Delivered in |
|---|---|
| US6 live site now | Phase 0 |
| US3 world-class feel | Phases 2, 3 |
| US1 insurer decides | Phases 3, 4 |
| US4 proof | Phases 3, 4 |
| US2 partner pages and kit | Phase 4 |
| US7 the group | Phases 3, 4 |
| US10 leads | Phase 4 |
| US9 search and AI | Phases 5, 8 |
| US11 speed | Phase 5 |
| US5 old addresses | Phases 0, 5, 6 |
| US8 languages | Phase 7 |
| US12 campaigns | Phases 4, 8 |

## Parallel examples

- Phase 0 after T003: T006 (share images, Gemini), T007 (favicons), T008 (films) and T020 (baselines) together.
- Phase 1: T031 (logos, Gemini), T032 (asset library) and T033 (generation, Gemini) while Opus does T025 to T029.
- Phase 4 after T057, T061, T063: T058, T062, T064, T066, T067, T068 as Gemini tickets in clean worktrees, reviewed one by one.

## Implementation strategy

1. **First value in week 1**: Phase 0 fixes the live site and starts measurement while the design is still on the canvas.
2. **Home first**: nothing beyond the home is built until he locks it.
3. **English live, then languages**: the German addresses never go missing.
4. **Growth only on proof**: ads start after tracked leads exist.
