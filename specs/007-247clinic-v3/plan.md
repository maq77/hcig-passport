# Implementation Plan: 24/7 Clinic v3

**Branch**: `007-247clinic-v3` (work lands on `main` in small commits, as for Medcierge) | **Date**: 2026-09-23 | **Spec**: `spec.md`

**Input**: Feature specification from `specs/007-247clinic-v3/spec.md`

## Summary

A premium, bespoke 24/7 Clinic site with the brief's words exactly, built as a Next.js
static export in `247clinic-v3/`. One codebase, two builds: a preview under
`/247clinic/v3` on HCIG Work (noindex), and a production build uploaded as plain files
over FTP to their IIS server. Home first, reviewed by the user, then inner pages, then
6 destination pages and 30 hotel pages on the home's approved patterns.

Design system: `brand guideline/design-md/clinic247/DESIGN.md` (v3, 2026-09-23).
Research and decisions: `research.md`. Entities: `data-model.md`.
Interfaces: `contracts/`. How to prove it works: `quickstart.md`. All in `specs/007-247clinic-v3/`.

## Technical Context

**Language/Version**: TypeScript 5, React 19, Node 18+ (build only)

**Primary Dependencies**: Next.js 16 (`output: "export"`), Tailwind CSS v4, `motion` (hero and viewer only), Leaflet with OpenStreetMap tiles (map, loaded on scroll), `lucide-react` icons, `sharp` and `ffmpeg` (media pipeline, build time only)

**Storage**: Files. Content from `content/247clinic/en/*.json`, clinic data from `content/247clinic/clinics.json` plus a verified v3 overlay. No database, no CMS.

**Testing**: word-for-word brief checker (build fails on any unregistered text), Playwright (375 and 1440, reduced motion, JavaScript off), axe scan, Lighthouse mobile, link checker, `npm test` in the root repo

**Target Platform**: Any static host. Preview: Vercel (HCIG Work). Live: IIS on Windows (SolidCP 1.5.0), Cloudflare in front. Nothing runs on the server.

**Project Type**: Static marketing website (multi-page, multilingual-ready)

**Performance Goals**: mobile LCP under 2.5 s, CLS under 0.1, Lighthouse mobile 90+, first-screen weight under 1.5 MB before the film, hero film under 2.5 MB

**Constraints**: content word for word; light only; no frames from films; content visible without JavaScript; no server runtime; repo is public (no secrets, no licensed files without a decision, see research R5)

**Scale/Scope**: phase A 1 page (home); phase B 11 inner pages; phase C 6 destination pages, 30 hotel pages; later x4 languages

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

`.specify/memory/constitution.md` is still the blank template, so the gates are the HCIG
standing rules (CLAUDE.md, the HCIG skill, the user's memory). All pass by design:

| Gate | How the plan meets it |
|---|---|
| Content strict (WEBSITE.docx) | Content only from the JSON; checker fails the build on any other text (contracts/content.md) |
| No invented facts or claims | Numbers, phone, insurers, accreditation wording all stated by the user or in the brief; gaps go to a gaps file |
| Cashless always conditional | Only the brief's wording; checker has a banned-phrase list ("guaranteed", "always cashless") |
| No dark designs | Tokens have no dark ground; one red band per page max |
| Never a frame from a film | No `poster` from films; stills are design slots, Pexels or Gemini |
| No em dashes | Checker rejects U+2013 and U+2014 in output |
| Preview is noindex | Preview build injects robots noindex and `X-Robots-Tag`; verified on the rendered page |
| Verify rendered head before any cutover | quickstart step 7, on the live preview and on the IIS test folder |
| Never commit a broken build | `npm test` in root plus v3 checks before every publish |
| Publish only with a clean tree | `npm run publish` runs `git add -A`; unrelated dirty work is committed or stashed first |
| Outward or irreversible actions confirmed | FTP upload to 247clinic.net needs the user's separate yes |

## Project Structure

### Documentation (this feature)

```text
specs/007-247clinic-v3/
├── spec.md              # what and why (approval gate)
├── plan.md              # this file
├── research.md          # decisions with alternatives
├── data-model.md        # entities and their fields
├── quickstart.md        # how to run and verify
├── contracts/
│   ├── content.md       # content JSON, UI labels, the checker
│   ├── urls.md          # every route, live vs new, redirects
│   ├── whatsapp-events.md  # pre-filled messages and tracking events
│   └── iis-deploy.md    # production build, web.config, FTP, rollback
└── tasks.md             # after approval (/speckit-tasks)
```

### Source Code (repository root)

```text
247clinic-v3/                    # the Next.js app (tracked, like medcierge-next)
├── next.config.ts               # output export; basePath "/247clinic/v3" when V3_TARGET=preview, "" when live
├── src/
│   ├── app/
│   │   ├── layout.tsx           # fonts, header, footer, WhatsApp float, sticky bar
│   │   ├── page.tsx             # home (phase A)
│   │   ├── not-found.tsx        # real 404
│   │   ├── globals.css          # DESIGN.md tokens as Tailwind v4 @theme
│   │   └── (inner routes, phase B and C; see contracts/urls.md)
│   ├── components/
│   │   ├── layout/              # Header, MobileMenu, Footer, WhatsAppFloat, StickyBar, SkipLink
│   │   ├── home/                # HeroFilm, Accreditation, Intro, WhyHotel, Services, Insurance,
│   │   │                        # HowItWorks, Stories, FilmViewer, Finder, Numbers, FinalCta
│   │   └── ui/                  # Button, Card, DesignSlot, Marquee, Reveal, CountUp, Icon, Section
│   ├── content/                 # loader for content/247clinic/en/*.json, ui-labels.json
│   ├── data/                    # clinics.ts, destinations.ts, logos.ts, films.ts, slots.ts
│   └── lib/                     # wa.ts (links), track.ts (events), seo.ts (meta, schema)
├── public/
│   ├── media/                   # transcoded films (gitignored; generated from 247 material/)
│   ├── logos/                   # insurers, assistance, hotels, accreditation (+ SOURCES.md)
│   ├── img/                     # Pexels and Gemini stills, AVIF + WebP
│   ├── slots/                   # the user's dedicated designs as they arrive
│   └── fonts/                   # Calisto MT (see research R5 before committing)
├── scripts/
│   ├── check-brief.mjs          # word-for-word gate over out/**/*.html
│   ├── media.mjs                # ffmpeg + sharp pipeline
│   ├── flatten-rsc.mjs          # from medcierge-next (Next 16 static export fix)
│   ├── sync-preview.mjs         # out/ -> ../src/247clinic-v3
│   └── build-live.mjs           # production build + web.config -> ../dist/247clinic-live (never committed)
└── deploy/web.config            # IIS config for the live upload

src/247clinic-v3/                # committed preview export, served at /247clinic/v3 by build.js
docs/247clinic-v3-design-slots.md   # every slot: page, section, purpose, size, status
docs/247clinic-v3-gaps.md           # lines a page needs that the brief lacks
docs/247clinic-v3-media-credits.md  # every logo, photo and film with its source
```

**Structure Decision**: one Next.js app beside the root pipeline, exactly the Medcierge
pattern, so `node build.js` keeps working and Vercel never runs Next. Media masters stay
in `247 material/`; only the exported copy in `src/247clinic-v3/` is committed, so each
film is stored once in git.

## Phases, gates and who does what

`@claude` = the head (this session). `agy` = Antigravity worker through Hive or
`agy-delegate`. Every agy change is reviewed and committed by Claude.

### Phase 0. Setup (no review needed)

| Step | Who | Done when |
|---|---|---|
| 0.1 Scaffold `247clinic-v3/` from the medcierge-next config (Next 16, Tailwind v4, TS, export, basePath by target) | claude | `npm run build` exports an empty home |
| 0.2 Tokens from DESIGN.md into `globals.css` `@theme`; Poppins via next/font; Calisto via next/font/local with the fallback stack | claude | tokens render in a test page |
| 0.3 Content loader + `ui-labels.json` + `check-brief.mjs` | claude | checker passes on the loader test, fails on a planted sentence |
| 0.4 Wiring: `sync-preview.mjs`, build.js block for `/247clinic/v3` with noindex, registry item under 24/7 Clinic | claude | `node build.js` serves `/247clinic/v3/` locally |
| 0.5 IIS probe: a harmless test folder with a web.config (rewrite rule, MIME, 404) on their server | claude, with the user's yes | research R3 answered with evidence |

### Phase 1. Assets (runs in parallel with 0.2 to 0.4)

| Step | Who | Done when |
|---|---|---|
| 1.1 Hero film: the first 14 s of the Le Rêve commercial, 1280x720 H.264 + VP9 WebM, no audio, under 2.5 MB; 540p phone cut under 1.2 MB | agy (ffmpeg batch), claude reviews by metadata only | files in `public/media`, sizes logged |
| 1.2 Story and staff films: portrait 540x960 cards under 1.2 MB each, full-size for the viewer | agy | same |
| 1.3 Insurer and assistance logos: Medcierge set (Allianz, AXA, Bupa, Cigna, Generali, MetLife, International SOS) + 24/7's own (ADAC, Mondial, ConnecX) + candidates (Europ Assistance, ERV, HanseMerkur, Würzburger, Signal Iduna, Ergo, PZU, Warta, Uniqa, Kooperativa, Allianz Partners, AXA Assistance), official sources only | agy (bulk fetch), claude verifies each file and source | `public/logos` + SOURCES.md |
| 1.4 Hotel brand logos for brands in their clinic data (Steigenberger, Jaz, Iberotel, Hilton, Radisson Blu, Premier Le Rêve, Baron, Pyramisa, Long Beach, Amwaj, Caribbean World, Old Palace, Palm Royale, Reef Oasis, True Beach, Casa Mare) | agy, claude verifies | same |
| 1.5 Clinic data v3: destination per clinic from coordinates, slugs, Premier Le Rêve corrected, shared placeholder coordinates flagged | claude (data, SEO-sensitive) | `data/clinics.ts` + gaps entries |
| 1.6 Supporting stills: Pexels shortlist per section, Gemini only where Pexels lacks the scene | agy proposes, claude picks | `public/img` + credits |
| 1.7 Design slots list, first draft (hero still, 6 service cards, section art, CAUCQ mark) | claude | `docs/247clinic-v3-design-slots.md` |

### Phase 2. Home (most effort) -> REVIEW GATE 1

| Step | Who |
|---|---|
| 2.1 21st.dev search per section (hero video, logo marquee, feature cards, step timeline, video testimonial carousel, accordion, sticky CTA); pick, adapt to tokens | claude |
| 2.2 Build section by section in brief order (spec FR-007); verify each in Playwright at 375 and 1440 before the next | claude |
| 2.3 Motion pass: reveals, count-up, marquee, step line, hero panel entrance, viewer; reduced-motion and no-JS states | claude |
| 2.4 `/impeccable critique` and `audit`, contrast table check, `check-brief`, Lighthouse, axe | claude |
| 2.5 Second opinion on the finished home from Gemini (`hive_consult`, read-only) | agy, claude decides |
| 2.6 Publish the preview (clean tree first), update HCIG Work, send the user the link and the slots list | claude |

**Gate 1**: the user reviews the home and sends what lacks. Nothing in phase 4 starts before his yes.

### Phase 3. Apply his notes, lock the patterns

Apply every note. Turn the approved sections into the component set the inner pages
reuse. Record each real correction as a Hive lesson for the frontend and ui-ux roles.

### Phase 4. Inner pages (brief sections 17 to 29) -> REVIEW GATE 2

Medical Services (`/services`), Insurance & Cashless Care (`/insurance`), Find a Clinic
(`/our-clinics`), Hotel Clinics (`/hotel-clinics`), Accreditation
(`/international-accreditation`), For Hotels (`/for-hotels`), For Insurance & Assistance
Companies (`/insurance-assistance-partners`), About Us (`/about-us`), Contact
(`/contact-us`), FAQ (`/faqs`), Beauty & Wellness (`/beauty-wellness`). Tickets can go to
agy workers once the component set is locked; Claude reviews every diff.

### Phase 5. Destinations and 30 hotel pages -> REVIEW GATE 3

6 destination pages from the brief's template (section 21), 30 hotel pages from its
template (section 20), each with its own data (contracts/urls.md), generated from
`data/clinics.ts` through `generateStaticParams` (the export needs every path listed). Find a Clinic filters
by destination and hotel. Thin-content guard: every hotel page carries its own map,
directions, destination links and nearest clinics; missing facts go to the gaps file.

### Phase 6. SEO, AEO, performance hardening

Meta from the brief's own lines (spec assumptions), schema per contracts, sitemap,
robots, llms.txt, internal links, Lighthouse and axe on every template, rendered-head
check on the preview.

### Phase 7. Languages (separate yes)

DE, PL, CS on the Medcierge dictionary recipe, first drafts by Gemini, native review.

### Phase 8. Go-live on 247clinic.net (separate yes)

Backup of their `wwwroot` over FTP, the production build uploaded beside it, switch
`web.config`, Cloudflare purge, rendered-head check, Search Console sitemap, 4 weeks of
monitoring. Rollback: restore the backup's `web.config` and folder (contracts/iis-deploy.md).

## Added 2026-09-23 after the user's gap check (his original rebuild brief)

He asked what his original rebuild brief wanted that this plan did not yet cover.
Covered already: from-scratch design, Next.js, concise sections, films and motion,
partner and insurer logos, conversion to WhatsApp and calls. Missing, now added:

### Phase G1. Business, audience and system analysis (docs, before inner pages)
- `docs/247clinic-v3/01-business.md`: how a case flows (WhatsApp, coordination, clinic
  visit, insurer billing), services, the 30 clinics, what separates 24/7 from MedPark and
  Medcierge so the three sites never compete.
- `02-audience.md`: guest (DE, PL, CS, EN, often with travel insurance), companion, hotel
  reception, tour-operator rep, insurer case handler; their questions in order; where each
  converts.
- `03-system-analysis.md`: use cases, flows (urgent, insurance check, B2B enquiry), data
  model (already in data-model.md), integrations, non-functional targets.
- `06-fact-sheet.md`: every number and claim the site and blog may use, with its source.

### Phase G2. Keyword research and mapping
- Extend `docs/247clinic-keywords.md` (autocomplete evidence exists) with Keyword Planner
  volumes once an Ads account is reachable.
- Clusters: doctor + destination, **hotel name + doctor/clinic for all 30 hotels**,
  symptom + destination, travel insurance + clinic, dentist/pharmacy + destination, B2B
  (hotel doctor service Egypt). EN, DE, PL, CS.
- Output: one keyword per page (home, 11 inner, 6 destinations, 30 hotels), no two pages
  on the same term, and the MedPark/Medcierge split respected.

### Phase G3. On-page and technical SEO (every page)
Titles and descriptions from the page's own words plus its keyword, one h1, schema
(MedicalClinic per clinic with real coordinates, Organization, BreadcrumbList, FAQPage,
Article for posts), sitemap, robots, canonical, hreflang when languages ship, internal
links from the keyword map (Spec 004 tooling), image alt text, Core Web Vitals.

### Phase G4. AEO and GEO (cited by ChatGPT, Gemini, Perplexity, AI Overviews)
- Baseline: ~30 prompts in EN, DE, PL, CS ("doctor in my hotel Hurghada", "Arzt
  Hurghada Hotel", "czy ubezpieczenie pokrywa lekarza w Egipcie") recorded before launch,
  repeated monthly (`scripts/ai-visibility/`).
- Answer-first blocks (the brief's FAQ answers), `llms.txt`, Organization schema with
  `sameAs`, one consistent name, phone and description everywhere (entity consistency).

### Phase G5. Off-page (after go-live)
Google Business Profile per clinic (never fake listings), partner hotel pages and guest
info folders linking to their clinic page, insurer and assistance provider networks,
medical-travel directories, cross-links from healthcareig.com, MedPark and Medcierge with
planned anchors, a review request flow that never scripts keywords.

### Phase G6. Blog and news
The brief's seven topics first (section 30), then a monthly plan from the keyword
clusters, in four languages. Drafted with AI where useful, every fact from the fact
sheet, and **approved by him before publishing** (the content rule covers new articles
too). The two 2023 posts from their site show on the home now.

### Phase G7. Measurement
GA4 property for 247clinic.net (still missing), Search Console for 247clinic.net, the
first-party tracker (already on), rank tracking for the G2 keyword set, monthly report.

### Phase G8. Backend for forms (before go-live)
The B2B and contact forms need somewhere to send. Options (research R12): a hosted form
service, or a thin ASP.NET endpoint on their existing .NET host. Decided with him.

## Risks

| Risk | Answer |
|---|---|
| Client brief section 2 says "no complete redesign" | v3 is shown next to v2; the user decides what Irina sees |
| IIS URL Rewrite module missing | Phase 0.5 probe decides; fallback is trailing-slash URLs with IIS's own 301, or a thin .NET host (research R3) |
| Hero film is 720p, soft on large monitors | Light scrim, panel over the lower left, 1280 max encode; replace when a higher-resolution master exists |
| Licensed Calisto MT in a public repo | research R5, a decision for the user before the files are committed |
| 30 hotel pages read as thin | Per-hotel data, maps and links; hold back any page whose data is only a name (gaps file) |
| Three clinics share one placeholder coordinate | Not shown on a map until checked; flagged in gaps |
| Hiding content behind motion (the v2 bug) | Reveal classes only apply after JS adds `html.js`; checker screenshot with JS off |

## Complexity Tracking

No constitution violations. The one addition over the root pipeline (a Next.js app) is
the proven Medcierge pattern and exports to plain files.
