# Implementation Plan: healthcareig.com, the HCIG group website

**Branch**: `012-hcig-website` (work lands on `main` in small commits, as for TMASI and 24/7) | **Date**: 2026-10-18 | **Spec**: `spec.md` (approved 2026-10-18)

**Input**: Feature specification from `specs/012-hcig-website/spec.md`

## Summary

A luxury B2B group site with every existing word kept, built as a Next.js static export in `hcig-v3/`. It reuses the
TMASI v3 machinery almost one to one, because healthcareig.com is the same Pulse Marketing template as tmasi.net (same
`about/`, `services/`, `contacts/`, `blog/newsN.php` layout, same `i18n.js`) and sits on the same kind of host (GoDaddy
cPanel, Apache). One codebase, two builds: a preview at `/hcig/v3` on HCIG Work (noindex, no tags) and a live build
uploaded over SFTP to `public_html` with an `.htaccess` that redirects every old address once.

Before the rebuild, Phase 0 fixes the live PHP site in place (invisible fixes, tracking, consent, email authentication)
so the before numbers exist. English launches first; the old German PHP pages keep serving `/de/` until the new German
pages replace them. A small PHP 8 endpoint on the same host takes partner enquiries, kit requests and newsletter
signups; everything else is static.

Research and decisions: `research.md`. Entities: `data-model.md`. Interfaces: `contracts/`. How to prove it works:
`quickstart.md`. Business plan and phases: the plan page (`docs/hcig-website-plan.html`).

## Technical Context

**Language/Version**: TypeScript 5, React 19.2, Node 18+ (build only). PHP 8.1+ for one form endpoint on the host.

**Primary Dependencies**: Next.js 16.3 (`output: "export"`, `trailingSlash: true`, per-language route groups,
`globalNotFound`), Tailwind CSS v4, `motion` (hero, viewer, a few reveals), self-hosted fonts through `next/font`,
hairline SVG icon set of our own (lucide at stroke 1.25 only as a fallback), `sharp` and `ffmpeg` at build time,
Playwright (QA, partner kit PDFs). Optional after the canvas pick: `three` for the 3D concept, lazy-loaded.

**Storage**: Files. Words in `hcig-v3/src/content/` (source words extracted from the live site, approved new copy,
per-language dictionaries). Leads: emailed to partner@healthcareig.com, a CSV outside the web root on the host, a
no-personal-data event to the HCIG tracking hub, and Brevo (newsletter, double opt-in). No database, no CMS.

**Testing**: word checker (build fails on any sentence that is neither source nor approved), banned-pattern check (em
and en dashes, emoji, "accredited by"/"certified by" for HCIG), hreflang reciprocity check, redirect checker against
the old address list, Playwright at 360, 390, 768, 1280 and 1440 px plus reduced motion and JavaScript off, axe scan,
Lighthouse mobile per template, internal link checker, structured data validation, lead endpoint tests, root `npm test`.

**Target Platform**: Static files on GoDaddy cPanel Apache (healthcareig.com, IP 23.229.177.7). Preview on Vercel
(HCIG Work). Evergreen browsers; iOS Safari and Android Chrome first.

**Project Type**: Static multilingual marketing website with one server-side form endpoint.

**Performance Goals**: mobile Lighthouse performance 90+ on every template, LCP under 2.5 s, CLS under 0.1, INP under
200 ms. First screen under 1.2 MB before the film. Hero film loop under 3 MB on desktop and 1.5 MB on phones.

**Constraints**: words kept exactly (spec FR-001); no emoji, no em dashes; canvas approval before code; no frames from
films; content readable with JavaScript off; repo is public (no secrets, no raw licensed fonts); Phase 0 changes nothing
visitors read; the four old German addresses answer 200 throughout; GoDaddy host traps (research R5); Gemini only in
implementation, every diff reviewed by Opus.

**Scale/Scope**: about 45 pages per language plus 15 news posts and later articles; 7 languages (about 400 pages at the
end of wave two); 8 brands, 6 partner types, about 11 service pages, 23 insurer logos, 3 testimonial films.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

`.specify/memory/constitution.md` is still the blank template, so the gates are the HCIG standing rules (CLAUDE.md,
the HCIG skill, his memory). All pass by design:

| Gate | How the plan meets it |
|---|---|
| Words kept exactly | Source words extracted from the live HTML; the checker fails the build on any unknown sentence (contracts/content.md) |
| No invented facts or claims | Fact sheet with a source per line; banned-claim list in the checker; flagged wording goes to Irina |
| Partnership wording exact | "Official Partner of ..." strings live in one place; "accredited by" and "certified by" banned for HCIG |
| Luxury: no emoji, hairline icons | Checker rejects Extended_Pictographic characters in output; icons come from the project's own SVG set |
| No em or en dashes | Checker rejects U+2013 and U+2014 in output and in content files |
| Canvas before code | Tasks gate every template on a canvas approval recorded in the work log |
| Never a frame from a film | Posters are designed images (real photos or generated), never extracted; ffmpeg runs only for encoding |
| Preview is noindex | Preview build sets robots noindex and nofollow on every page and `Disallow: /`; no analytics tags |
| Verify rendered head before cutover | Deploy contract step: fetch every template's rendered head on the live host and diff against the expected list |
| Never commit a broken build | `npm run check` in `hcig-v3/` and root `npm test` before every commit that touches the preview |
| Outward actions confirmed | Phase 0 upload, DNS changes, go-live and each language wave each need his explicit word |
| Public repo | API keys and SMTP details live in a config file outside `public_html` on the host; raw font files gitignored |
| Gemini only in implementation | Hive tickets for Gemini carry approved templates only; Opus reads every diff and runs the checks |
| Mobile first, reduced motion, WCAG 2.2 AA | Phone layouts designed on the canvas; Playwright and axe gates per template |

Post-design re-check (after contracts): still all pass. Two justified complexities are recorded below.

## Project Structure

### Documentation (this feature)

```text
specs/012-hcig-website/
├── spec.md              # what and why (approved 2026-10-18)
├── plan.md              # this file
├── research.md          # decisions with alternatives (R1 to R24)
├── data-model.md        # entities and fields
├── quickstart.md        # how to run, build, check, deploy, verify
├── contracts/
│   ├── content.md       # word sources, approved-copy log, the checker
│   ├── urls.md          # every address: old, new, per language, redirects, the German gap
│   ├── seo-schema.md    # metadata, hreflang, JSON-LD graph, sitemaps, llms.txt, IndexNow
│   ├── leads-and-events.md  # form endpoint, kit, newsletter, consent, tracking events
│   ├── deploy-cpanel.md # live build, .htaccess, host traps, upload, rollback, verification
│   └── phase0-live-fixes.md # every change to the current PHP site, with checks and what needs his yes
├── checklists/requirements.md
└── tasks.md             # next (/speckit-tasks)
```

### Source Code (repository root)

```text
hcig-v3/                          # the new site (Next.js static export)
├── next.config.ts                # basePath from HCIG_BASE_PATH (preview "/hcig/v3", live "")
├── src/
│   ├── app/
│   │   ├── (en)/[[...slug]]/     # one root layout per language (TMASI pattern)
│   │   ├── (de)/de/[[...slug]]/  # added in wave two, with pl, fr, it, es, cs
│   │   ├── global-not-found.tsx
│   │   ├── robots.ts  sitemap.ts  llms.txt/
│   ├── components/               # sections, header, footer, consent, forms, video viewer, map
│   ├── icons/                    # hairline SVG set
│   ├── content/
│   │   ├── source/               # words extracted from the live site, per language (generated, then frozen)
│   │   ├── approved/             # new copy, each entry with who approved it and when
│   │   ├── dict/                 # translation dictionaries per language
│   │   └── facts.ts              # the fact sheet (numbers, names, partnerships) with sources
│   └── lib/                      # routes (page id to slug per language), seo, schema, consent, analytics
├── public/                       # images (AVIF/WebP), films, logos, kit PDFs, fonts (subset woff2)
├── scripts/                      # extract-live, check-words, check-hreflang, check-redirects, media, kit-pdf,
│                                 # build-live, sync-preview, flatten-prefetch, i18n-todo, i18n-fill
├── server/                       # lead.php and its tests, uploaded to public_html/api/ (no secrets inside)
├── fonts-licensed/               # any desktop font set he supplies (gitignored); web Helma is already on the live server
└── material/                     # live-site mirror and assets (gitignored)
src/hcig-v3/                      # synced preview export, served by HCIG Work at /hcig/v3
build.js                          # gains one block: src/hcig-v3 -> dist/hcig/v3
hcig-live/                        # local working folder for Phase 0 and go-live: backups, .htaccess versions,
                                  # sftp batches, verify scripts (gitignored like tmasi-live/)
```

**Structure Decision**: a single static web project in `hcig-v3/`, following `tmasi-next/` (route groups per
language, live-word extraction, `build:live`, `sync`) and `medcierge-next/` (dictionary translation for seven
languages). The only server code is `hcig-v3/server/lead.php`. Phase 0 works directly on the live PHP files from
`hcig-live/`, never through the new codebase.

## Phases (technical view)

| Phase | Weeks | Technical work | Gate |
|---|---|---|---|
| 0 Live fixes and baseline | 0 to 1 | Server backup; head fixes in the PHP templates; redirects for duplicates; share images; sitemap with news; favicon; testimonial re-encode at the same paths; send.php review; GA4 + consent banner (after his wording yes); Search Console and Bing; email test, then SPF, DKIM, DMARC (monitor); speed and AI baselines | His access and DNS; banner wording |
| 1 Research and fact base | 0 to 2 | `extract-live` into `content/source/`; fact sheet; keyword harvest and map in 7 languages; competitor and AI baseline; site map frozen into `lib/routes.ts`; asset library sorted and optimised | He confirms fact sheet and site map |
| 2 Design system and canvas | 1 to 4 | DESIGN.md luxury layer; Claude Design canvas: 3 directions, 5 heroes, desktop then phone; then full home and page templates; generated film and images | His pick, then his yes |
| 3 Home | 4 to 6 | Scaffold `hcig-v3/`, tokens, fonts, header, footer, consent, home sections, preview sync, review rounds | Home locked |
| 4 Inner pages, leads | 6 to 9 | Templates and key pages (Opus); brand, news, legal, event pages on templates (Gemini); `lead.php`, kit PDFs, Brevo, hub events; new-copy review pack | His yes, then Irina's, on new copy |
| 5 Quality | 9 to 10 | Schema, hreflang, redirects, speed, axe, links, forms, consent, claims; full Playwright sweep | Irina approves |
| 6 English go-live | 10 | Live build, stage upload, `.htaccess` swap, rendered-head check, sitemaps, IndexNow, 14-day watch | His word |
| 7 Six languages | 10 to 15 | German first (replaces old /de/ at the same addresses), then PL, FR, IT, ES, CS; news last | His word per wave |
| 8 Growth | 10 onward | Listings, LinkedIn, newsletter, event pages, articles, ads after tracking is proven, monthly AI re-run | Irina on budget |

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Mixed hosting for a few weeks: new static English pages next to the old PHP German pages | His choice: English first. The four German addresses must never go missing | Launching all seven languages at once was offered and he chose English first; deleting /de/ would drop indexed pages |
| A PHP endpoint on an otherwise static site | Leads must reach the inbox, the dashboard and the newsletter tool without a third party holding the data | JotForm or Formspree forms: data leaves our host, design control is weaker, and the kit gate and Brevo double opt-in need server logic anyway |
