# Implementation Plan: HCIG v6

**Spec**: `spec.md` (approved 2026-10-26). This is the approved plan, copied word for word from
`C:\Users\maqmo\.claude\plans\pasted-content-id-99bb-lets-begin-warm-wand.md` so every agent can read it in the repo.
The live task list is `hcig-v6/TASKS.md`.

## Changes after the Gemini reviews (2026-10-26)

Review 1: agy (Gemini 3.8 Flash, read-only), 15 findings. Review 2: Gemini Argon on his Pro account (added below when
it lands). Each finding was checked against the files and his decisions before it was taken.

**Taken (now part of this plan):**
1. **Deploy as one zip** (was: thousands of files over SFTP). Upload one release zip to a private folder, run a
   one-time, token-protected `deploy.php` (deleted right after) that unzips into `stage/` and swaps by renames;
   `rollback.php` restores the previous release the same way. SFTP file-by-file stays the fallback. Tested on a
   throwaway folder before go-live day (only with his OK, since it writes to the host).
2. **Lead mail must authenticate** before launch: the endpoint sends through Microsoft 365 SMTP (or a transactional
   relay) with credentials kept outside `public_html`, and stores every lead as a fallback. The DNS fix (SPF for
   Microsoft 365, DKIM, DMARC) moves to before go-live, with his OK, because it touches live email.
3. **No cruise cannibalisation:** the partner page becomes `/partner/hotels-and-resorts/`; the live line
   "Hotels, Resorts & Cruise Lines" stays as written in "Who We Work With", and its cruise intent links to
   `/maritime-cruise-healthcare/`, the only page for cruise, vessel and port terms.
4. **One link helper and one asset helper** in the section library: `href()` adds the preview basePath (or none on
   live, or a board link on the canvas); `asset()` maps one asset key to `/_blob/<id>` on the canvas and to the public
   path on the site.
5. **German length test on the canvas:** every template board gets a `lang` tweak that swaps in German (the live
   German words from `i18n.js` where they exist), so layouts are proven with long words before they are frozen.
6. **Schema:** HCIG stays `Organization` + `MedicalOrganization`, and each brand is a typed `subOrganization`
   (MedPark `Hospital`, 24/7 Clinic `MedicalClinic`, TMASI `MedicalBusiness`, and so on, from their own sites).
7. **Posts get an honest author:** `author` and `publisher` = Healthcare International Group (Organization). No person
   is named as author unless he confirms it.
8. **Host check early, read-only:** PHP versions, extensions (SQLite, ZipArchive, OpenSSL) and `open_basedir` read in
   cPanel (MultiPHP and PHP INI pages) during P2. Nothing is uploaded to the live site for it.
9. **AI crawlers welcome:** `robots.txt` allows GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot and Google-Extended;
   `sameAs` lists only verified profiles (LinkedIn, Facebook, Instagram, brand sites, GHA and DMWV listings if they
   exist).
10. **The dash gate is precise:** it blocks em dashes (U+2014), en dashes (U+2013) and spaced hyphens used as dashes,
    never compound words (On-Site, Shore-Side, Fit-to-Travel) or phone numbers. A live " - " separator becomes a full
    stop or comma, logged as a punctuation fix.
11. **Helma contingency:** `tokens.css` carries a fallback display serif, used only if Pulse cannot confirm the
    web licence before go-live (his decision then).
12. **B2B proof earlier on the home page:** offered on the canvas as the recommended option (insurer logos right
    after Hero B or after About); order is design, his pick decides.

**Not taken (his decisions stand):**
- "Drop the live Google reviews": he chose live MedPark reviews in the Elfsight look. Kept, clearly attributed, in the
  testimonials section, with the link card fallback.
- "Cut the launch to 14 pages": he chose the full B2B site and asked Claude to write the new copy. Kept, with every new
  page built from a fact brief and every new sentence marked and approved.

---

# HCIG v6: the new healthcareig.com

Plan written 2026-10-26 (Opus 5.5, max effort, plan mode). Approving this plan approves the spec content in it;
it is then written to `specs/013-hcig-v6/` with `Status: approved`.
Note: the internal architecture review agent was stopped by the usage limit before it reported; the P1 Gemini
review (your Pro account + agy read-only) is the second opinion, and its points are folded in before P2.

## Context

healthcareig.com is the group's front door for B2B buyers: insurers, assistance companies, hotels, cruise lines,
tour operators, embassies, corporates, healthcare providers. Today it is a PHP 7.1 site with broken SEO basics
(empty canonical, every page `lang="en"`, no hreflang, 19 broken images, duplicate `.php` pages, Yandex session
recording without consent), long text, and it does not show the one thing HCIG is: **one connected group that takes
the traveller from first contact to case closure, with no fragmentation.**

The v3 attempt was set aside on 2026-10-22. Only Hero B and the group section were approved. Your manager added a new
**Maritime & Cruise Healthcare** vertical (ChatGPT share, saved in `brand guideline/chatgpt_longest_messages.txt`).

**Outcome:** HCIG v6, a complete new site in seven languages, built on Hero B and the group section, keeping today's
words, adding the maritime vertical, ranking for B2B terms, cited by AI tools, turning visits into partner
conversations, and giving every visitor the feeling of your reference image: *the traveller at the centre, every
service around them, connected worldwide. "Wherever the journey leads, support is already around you."*

## What I understood

- Healthcare + International + Group = HCIG. B2B only. A full end-to-end ecosystem for international patients:
  one group, from first contact to closure. Contact: partner@healthcareig.com.
- v6 is built from scratch in a new folder `hcig-v6/` (hyphen like the other builds; spaces break build tools).
- Words are theirs, design is ours. Every page is designed first on the Claude Design canvas at full fidelity
  (phone and desktop, day and night, real motion, images, video, testimonials, trusted by patients, CEO quote).
  Code copies the canvas exactly. Then a preview on HCIG Work for Irina, then go-live on cPanel.
- Claude does all important work: design, frontend, motion, visual, SEO architecture. agy only low-priority jobs.
  Your second agy account works from one shared brain in `hcig-v6/`.

## Decisions locked (2026-10-26, four question rounds)

| Topic | Decision |
|---|---|
| Carry over from v3 | **Hero B only**: no HC watermark, no film loop. Day by default, dawn switch to night. **Group section** as approved: group film, 8 brands, hover logos. Heading: live **"Our Premises and Facilities"** as H2 with the approved line **"Integrated healthcare group all over the world"** under it. Everything else from v3 is reference only |
| Words | Every live sentence kept exactly (grammar and punctuation fixes logged). Manager's maritime copy word for word. Pages get shorter by design (cards, tabs, reveal), never by cutting words. Any new label or section comes to you first |
| Maritime & Cruise | All of it: menu item, home block, full page `/maritime-cruise-healthcare/` with its own form and brochure request, SEO title and meta as she wrote |
| Pages | Full B2B site, about 50 English pages (sitemap below) |
| Hotel-name SEO | Belongs to 247clinic.net. HCIG links to it and targets B2B buyer terms |
| Languages | **All seven at launch**: EN, DE, PL, FR, IT, ES, CS. Existing German words kept. Translated slugs |
| Live site now | **Touch nothing.** Full backup only. At go-live v6 replaces it; only `old_hcig_backup_website.zip` stays on the host, outside `public_html` |
| Tracking | GA4 + Google Ads + Yandex Metrika (with Webvisor) + our first-party tracker, all behind a consent banner (wording to you first). Live build only |
| Skills | All kept, used where they help. ui-ux-pro-max leads design; Claude Design is the canvas |
| Irina | Sees only the finished preview. Approval: you, then Irina, then live |
| Design base | One design system built from Hero B + group section. Options only where a section truly needs a choice |
| Floating contact | JotForm AI agent stays the one float. "Talk to our team" opens a sheet: WhatsApp, call, email, partner form |
| Newsletter | Our own lead store: endpoint on the HCIG host, mail to partner@healthcareig.com, CSV export |
| Trusted by patients | Testimonial videos + MedPark Google reviews + photo rows like the TMASI trust section, a curated few of each (see Home) |
| Google reviews | Live from Google: our own widget in the look of the Elfsight Google reviews widget on MedPark Health Hub (`medpark-live/v2/healthhub.php:201-208`), fed by the official Places API (MedPark Health Hub + MedPark Hospital), loaded after consent when scrolled near; before consent a rating link card. No review schema on HCIG (Google forbids self-serving review markup) |
| Articles | No new articles unless Irina approves and writes them herself. I deliver keywords and article ideas for her. Launch with the 15 existing posts |
| New page copy | I write all of it, from verified facts only, each new sentence marked as new; you approve on the canvas |
| Legal pages | I write privacy, cookies and imprint from the real tag list; already approved by you |
| WhatsApp | +20 100 182 8828 (in the "Talk to our team" sheet) |
| Theme | Day default, night switch, whole site |
| Carried from spec 012 | Luxury: no emojis, hairline SVG icons. Brand guideline wins. CEO quote on home and leadership. Partner band + newsletter closing the home. Partner kit behind a 3-field form. A page per brand. Leadership, press room, media kit. Gemini images and video allowed anywhere; AI-made people never shown as named staff, leaders, patients or testimonials. No deadline, quality first |

## Step 0: safety first (before any commit or publish)

The GitHub repo `maq77/hcig-passport` is **public** (verified today) and `npm run publish` / `npm run watch` run
`git add -A` and push. Untracked and not ignored right now:
`prompt hcig.txt` (cPanel password + SSH private key) and `hcig material/` (`id_rsa hcig`, `id_rsa hcig.ppk`, `.pub`).
Nothing has leaked yet (git history checked).

1. Add to the root `.gitignore`: `prompt hcig.txt`, `prompt*.txt` (except the tracked `prompt.txt`), `hcig material/`,
   `*.ppk`, `id_rsa*`, `*.pem`, `hcig-v6/material/`, `hcig-v6/.env*`, `hcig-v6/fonts-licensed/`. Verify with
   `git status --ignored`, not `git check-ignore` (it misreports on folder names with spaces).
2. You move `prompt hcig.txt` and the three key files out of the project folder (keys to `C:\Users\maqmo\.ssh\`).
   I never write a secret into the repo, memory, BRAIN.md or a brief for agy.
3. After go-live, change the cPanel password and the SSH key passphrase (both were pasted into chat).
4. No `npm run publish` or `watch` until steps 1 and 2 are done.

## Phases and gates

| # | Phase | Main output | Gate |
|---|---|---|---|
| 0 | Safety, access, backup, workspace | Step 0 done, `ssh hcig` working, `old_hcig_backup_website.zip` on the host (outside `public_html`) + local copy, `hcig-v6/` skeleton + brain files | none (touch nothing live) |
| 1 | Spec Kit + Gemini review | `specs/013-hcig-v6/` (spec approved by this plan, plan, research, data model, contracts, tasks) | Gemini notes folded in, changes shown to you in five lines |
| 2 | Research and fact base | live words captured fresh, content model, fact sheet, brand voice transcribed, keyword map in 7 languages, AI baseline, logo set + gap list, media manifest, URL and 301 map | you confirm fact sheet + sitemap |
| 3 | Design system + home canvas | tokens, DESIGN.md, icons, components; home at full fidelity (1440 + 390, day + night) | your picks, rounds |
| 4 | Canvas: important pages only (his order 2026-10-26: "only add important pages to canvas, and rest you can impl directly after i approve important pages") | proposed set: Home, About, Services + one service line, Maritime, For Partners + one partner type, Group + one brand page, Contact, Blog + one post. Every other page is built directly in code on these approved templates | your approval of the important pages |
| 5 | Build English | assembled site on the preview `/hcig/v6`, all gates green | your review rounds |
| 6 | Six languages | DE (live German words kept), PL, FR, IT, ES, CS, translated slugs | Gemini cross-check, gates |
| 7 | Quality pass | SEO, AEO, speed, accessibility, every page in a real browser | all checks green |
| 8 | Irina | finished preview + a one-page note (registry status `review`) | Irina approves |
| 9 | Go-live | cutover on cPanel with rollback ready | your word |
| 10 | After launch | Search Console, AI reruns, off-page, Irina's article brief, ads when tracking is proven, DNS email fix | ongoing |

### Phase notes
- **P0.** `Host hcig` in `~/.ssh/config` (healthcareig.com, port 22, user `healthcareig`, key outside the repo). Read-only
  look first (`pwd`, `ls`, PHP version, databases). Backup: `zip -r ~/old_hcig_backup_website.zip public_html` (plus a
  database dump if one exists), download, checksum. Nothing else on the server changes. Scaffold `hcig-v6/` with its own
  `.gitignore` (`/.next/`, `/out/`, `/live-build/`, `/material/`, `.env*`, licensed fonts).
- **P1.** `/speckit-specify` content comes from this plan; then `/speckit-plan`, `/speckit-tasks`, `/speckit-analyze`.
  Gemini review in your Gemini Pro through Claude in Chrome plus `agy-delegate --read-only`; I say what came from Gemini.
- **P2.** Re-pull all 25 live pages (Node fetch, browser user agent), diff against the 2026-10-18 capture. Maritime copy
  from the clean final block (`chatgpt_longest_messages.txt` 1139 to 1402 and 1423 to 1434), diffed against the other
  versions. Guideline voice (essence, promise, tone, key messages, elevator pitch, slogans) cropped from the guideline
  image with ffmpeg and transcribed word for word. Company profile (Downloads) for leadership and partner logo grids.
  agy-delegate hunts missing official logos; I verify every one.
- **P3 and P4.** Start with the Artifact quickstart (intent design) to load the Design type's current contract. A new
  canvas artifact "HCIG v6"; pages: Design system, Home, then one page per template, then all pages. Boards checked
  locally in a real browser at 1440, 390 and 360 before each publish.
- **P5 to P7.** Home first, then inner pages, then languages. Each review round: apply every note, screenshot both
  widths, push to the preview, list the changes in plain lines.

## Sitemap (English; every language gets the same pages with translated slugs)

Existing ranking URLs keep their path. Old blog `.php` addresses get one-hop 301s to readable slugs.
Final slugs are set in P2 from keyword research.

| Path | Page | Words come from |
|---|---|---|
| `/` | Home | live home + maritime block + approved new lines |
| `/about/` | About Us | live `/about/` |
| `/about/leadership/` | Leadership | company profile names and titles, real photos, CEO quote |
| `/services/` | Services (Our Healthcare) | live `/services/` |
| `/services/<7 lines>/` | Hospital & Specialty, Medical Tourism Facilitation, Emergency & Urgent Care, Wellness Longevity & Aesthetic, Corporate Healthcare, Elite Medical Concierge, Accreditation & Training | live service text + new copy |
| `/maritime-cruise-healthcare/` | Maritime & Cruise Healthcare Solutions | manager's copy, exact |
| `/partner/` | For Partners | live `/partner/` |
| `/partner/<6 types>/` | Insurance & Assistance, Embassies & Government, Hotels and Resorts (`/partner/hotels-and-resorts/`; cruise goes to the maritime page), Tour Operators & Travel Agencies, Healthcare Providers, Corporate & International Organisations | live "Who We Work With" lines + new copy |
| `/group/` | Our Premises and Facilities (group hub) | live brand lines |
| `/group/<8 brands>/` | 24/7 Clinic, MedOne, MedPark, TMASI Global, One Medical Center, One Medical Spa, UCA MENA, Shakankiry | live lines + verified facts from each brand's own site; links out |
| `/network/` | Where we operate | live addresses + verified locations (map) |
| `/trust/` | Trust and Standards | live GHA and DMWV lines, UCA accreditation credited to 24/7 Clinic, insurers, events |
| `/press/` | Press room + media kit | posts, logos, guideline boilerplate |
| `/blog/` + 15 posts | Blog | live posts, word for word |
| `/contacts/` | Contact | live `/contacts/` |
| `/partner-kit/` | Partner kit (PDF per partner type, 3-field form) | new copy |
| `/privacy/`, `/cookies/`, `/imprint/` | Legal | new, approved |

About 52 pages per language, 7 languages: about 364 pages.

## Home: section order (live order kept, additions marked NEW)

| # | Section | Notes |
|---|---|---|
| 1 | Header | logo, live nav + "Maritime & Cruise", 7-language menu, day/night switch, "Talk to our team" (opens the contact sheet) |
| 2 | **Hero B** | live hero words; plain Hero B (no HC mark, no film loop); dawn switch |
| 3 | About Us | live words; 40+, 600K+, 350+ counters |
| 4 | **Our Premises and Facilities** | approved group section: group film, 8 brands, hover logos; sub-line "Integrated healthcare group all over the world" |
| 5 | Our mission / Our vision | split pair |
| 6 | Why partners choose HCIG | 7 cards, two lines then open on an arrow, equal heights |
| 7 | Built for Global Healthcare Delivery | 6 cards + its closing line |
| 8 | How Our System Works | 6 steps. Candidate home for the signature visual (below) |
| 9 | Our Healthcare | 7 image cards (phone: 2 columns, lone last card centred) |
| 10 | NEW Maritime & Cruise block | manager's block, wide image, 5 service chips, link to the page |
| 11 | Testimonials | trusted by patients bento (below) |
| 12 | NEW CEO quote | Dr. Amr Abbass, his words from `qoute ceo.jpg`, real portrait |
| 13 | 100% Trusted by Global Insurance & Assistance Networks | insurer logos, two rows opposite, pause on hover |
| 14 | Who We Work With | 6 "I am a..." cards, each opens its partner page |
| 15 | Our Impact | 4 lines |
| 16 | Let's Build Healthcare Without Fragmentation | both buttons + NEW minimal newsletter field |
| 17 | Footer | live contact block, nav, social, "Powered by PULSE Marketing" |

**Signature visual from your reference image:** "the traveller at the centre", a ring of the services around one
traveller over a connected globe. Every node label is backed by existing words (live site or maritime copy), e.g.
Telemedicine and Ambulance come from the maritime copy, Pharmacy from "integrated pharmacy support". Two options on
the canvas: A) its own short section right after the group section, B) the visual of "How Our System Works" (no
extra section). You pick.

**Trusted by patients (my answer to your question):** yes, a few of each is the right call. One section, about one
screen high, a bento of three layers: 1) one featured testimonial video (largest tile, muted preview, "Watch" opens
it with sound) plus two smaller ones; 2) the Google reviews card (rating, count, Google mark) with 3 rotating real
reviews; 3) one slow photo row like TMASI's trust section (8 to 10 real photos, pause on hover, lightbox). Phone:
video first, then the reviews card with swipe, then the photo row. The canvas shows this plus one alternative.
Note: two of the three live testimonial videos are 24/7 Clinic footage (same as `247 material/patient 2` and
`patient 3`); fine inside the group, and more real 24/7 patient stories exist if you want to swap any.

**Making 17 sections feel short without cutting words:** compact rhythm, two-line descriptions that open on tap,
horizontal snap rows on phones, split pairs, one idea per screen, motion that reveals instead of text that piles up.

## Design system (one system, built from Hero B + the group section)

- **Sources:** HCIG guideline (palette + tints, Helma + Inter, logo rules), approved Hero B (Earth day and night,
  turquoise light pulses along the flows, dawn sweep), approved group section (film, hover cards), reference image
  (ring, connected globe). ui-ux-pro-max pattern: "Trust and Authority" style, "Enterprise Gateway" path selection.
- **Colour tokens:** palette and its tints only, mapped per theme (day: White ground, Black ink, Dim Gray secondary;
  night: Black ground, White ink, gray tints secondary; Turquoise is the light in both). Turquoise text only for
  accent words in headings (your rule; 2.24:1 on white, so never for body, links or button labels). Text on a
  Turquoise fill is always Black (9.4:1). WhatsApp green only on the WhatsApp action.
- **Type:** Helma at 600 (synthetic, like the live site) for display and H2, Inter 400 to 700 for everything else,
  self-hosted. Fluid scale from the approved boards (H2 54 px desktop, 34 px phone), 16 to 17 px body, 11 to 12 px
  tracked labels, `text-wrap: balance` on headings.
- **Space and layout:** 4 px base; compact sections (your rhythm, not the large luxury padding); container and
  12-column grid; breakpoints 360, 390, 768, 1024, 1440 plus the 370 px small-phone step.
- **Shape and depth:** pills for buttons, 18 px cards, 22 px media, hairlines before shadows, at most two soft shadows.
- **Motion tokens:** glass-door ease `cubic-bezier(.16,1,.3,1)`; 180 ms feedback, 400 ms state, 900 ms reveals,
  1400 ms hero entrance; the dawn sweep keeps its 2.4 s curve. Transform and opacity only. Every motion has a still
  version under reduced motion. Native scrolling only.
- **Icons:** one custom hairline SVG set (stroke 1.25 at 24 px), drawn on when they enter view. No emojis.
- **Imagery:** real group photos first; Gemini images where a real one is missing (maritime, onboard clinic);
  AI-made people never named or shown as staff, patients or testimonials; never a frame from a video; logos in
  their own colours. Video: muted in-view previews, a "Watch" lightbox with sound, captions on testimonials.
- **Components:** header with mega menu, contact sheet, language menu, theme switch, buttons, cards (service,
  partner, brand, news), counters, journey steps, ecosystem ring, map, logo marquee, video tile + lightbox,
  reviews widget, photo row, CEO quote, FAQ, forms (partner, maritime, kit, newsletter), consent banner, footer.
- **Output:** `hcig-v6/DESIGN.md` (tokens + rules), `src/styles/tokens.css` shared by canvas and code, and a
  design-system page on the canvas.

## Build architecture

**One section library feeds both the canvas and the site, so the code is the canvas.**
- Every section is a React server component in `hcig-v6/src/sections/` (markup only, no client state), styled by
  `src/styles/tokens.css` + component CSS, laid out with container queries (so a 390 px phone board and a real phone
  render the same way).
- All motion and interaction are small vanilla behaviours bound by data attributes (`data-reveal`, `data-count`,
  `data-marquee`, `data-dawn`, `data-video`, `data-sheet`, `data-tabs`) in `src/runtime/`. On the site one client
  component starts them; on the canvas the same script runs inside the boards. Tiny JavaScript, fast pages.
- `hcig-v6/canvas/` renders the sections to static HTML (`build-canvas.mjs`, using `react-dom/server`), wraps them as
  Claude Design boards (desktop 1440 and phone 390, day and night wrappers), maps local media to canvas asset ids
  (`blobs.json`), and publishes through the Artifact tool. Before every publish `pull-canvas.mjs` reads the live
  boards and lists your hand edits so they go back into the source first.
- He approves on the canvas before any page is assembled, routed, translated or previewed; after approval the
  build is assembly (routes, languages, SEO, forms), not a redraw.
- **Canvas contract (Design type, checked today):** each board is a `.dc.html` page with literal markup inside
  `<x-dc>` (no script-built UI, no iframes), a `DCLogic` script block, assets uploaded and referenced as `/_blob/<id>`
  (our shared CSS and runtime JS can be uploaded and linked in each board's head), page boards fluid at 1280 to 1440
  wide, at most 512 files, 256 MB and 40 pages per canvas. So: day and night are one board with the live sun/moon
  switch plus a `theme` tweak (not duplicate boards); phone boards via `dc-import` at 390; the site is split across
  canvases if needed ("HCIG v6: Home and system", "HCIG v6: Pages"); videos use web encodes only.
- **P3 starts with a one-board spike:** Hero B rendered by the section library into a board, theme switch, reveals
  and video tested on the live canvas. If the board runtime fights our behaviours, the `DCLogic` block calls the
  same runtime functions instead. Scale out only after the spike passes.

**Site:** Next.js 16.3 (App Router, `output: "export"`, `trailingSlash: true`), React 19.2, TypeScript 5.9 strict,
Tailwind 4.3 on the token variables, `motion` only where a spring is truly needed, no Lenis, no GSAP unless a pinned
scene is approved. Preview basePath `/hcig/v6`, live basePath empty. Root-absolute links only.
- **Languages:** one route table with translated slugs per language (`src/lib/site.ts`, pattern from
  `tmasi-next/src/lib/site.ts`), `generateStaticParams`, no next-intl and no middleware. UI strings through the
  dictionary workflow (`scripts/i18n-todo.mjs`, `i18n-fill.mjs`, `scripts/dict/*.json`, from medcierge-next);
  `html-lang.mjs` writes `lang` per page after export.
- **Content model:** typed files in `src/content/` where every string carries its source: `live`, `manager`,
  `guideline`, `new-approved`, `translation`. `scripts/check-words.mjs` (from 247clinic-v4 `check-brief.mjs` and
  tmasi-v4 `check-words.mjs`) fails the build on any visible sentence without a source, any dash, "accredited by"
  next to HCIG, lorem or TODO.
- **SEO module:** port `tmasi-next/src/lib/seo.ts`, `app/sitemap.ts`, `app/robots.ts`, `app/llms.txt/route.ts`; schema
  graph per page; per-language sitemaps.
- **Forms and leads:** one PHP 8 endpoint on the HCIG host (`/api/lead.php`): validation, honeypot, time trap, rate
  limit, storage outside `public_html` (SQLite + CSV export), mail to partner@healthcareig.com; partner, maritime
  (Company, Fleet/Vessel Type, Required Services, Operating Region, Contact Details), kit download, brochure request,
  newsletter. On the preview, forms show their states but send nothing.
- **Tracking:** consent banner with Google Consent Mode v2; GA4, Ads, Yandex (EN counter on non-German pages, DE
  counter on German pages, Webvisor only after consent) and our tracker load only on the live build, only after the
  matching consent. JotForm AI agent loads after consent too.
- **Media:** `scripts/media.mjs` (sharp) makes AVIF and WebP at 640/960/1440/2048/2880; ffmpeg makes the video
  encodes (H.264 + AV1/VP9, 720p and 1080p, the 9:16 cut at 720x1280 not upscaled); posters are designed tiles, never
  frames. Hero B needs 2x photos: the day Earth exists at 2752 px (`hcig-v3/material/generated/earth-day-gemini.jpg`);
  the night Earth (1376 px today) is regenerated at 2752 px in the same composition and its flow mask recut.
- **Budgets (gated by `check-weight.mjs`):** first-load JS 150 KB gzip or less, LCP under 2.5 s on 4G phone, CLS under
  0.05, INP under 200 ms, hero media under 400 KB before the first interaction.
- **Preview pipeline:** `npm run preview` = build with basePath, flatten payloads (`flatten-rsc.mjs`), gates, then
  `sync-preview.mjs` copies `out/` to `src/hcig-v6/`; a new block in root `build.js` serves it at `/hcig/v6`;
  root `npm test` (build.js + check.js) must pass before any push.
- **Live build:** `npm run build:live` (empty basePath, indexable, canonical `https://healthcareig.com`, live tags,
  live lead endpoint) into `hcig-v6/live-build/` (gitignored).

## SEO, GEO and AEO

**Keywords (P2, all 7 languages).** Free toolkit as before: Google autocomplete per language, People Also Ask, live
results, Keyword Planner through Claude in Chrome (World Trips Hurghada Ads account, ranges), Semrush free spot checks
on the main terms. Intent clusters, one main keyword per page per language, no two pages competing:

| Cluster | Example seeds (EN; each translated and researched natively) | Lands on |
|---|---|---|
| Insurers and assistance | medical provider network Egypt, direct billing hospital Egypt, cashless treatment Egypt travel insurance, guarantee of payment Egypt | `/partner/insurance-assistance-companies/` |
| Maritime and cruise | cruise ship medical services, cruise ship medical staffing, onboard medical clinic, port medical assistance Red Sea, yacht doctor Hurghada | `/maritime-cruise-healthcare/` |
| Hotels as buyers | hotel medical services provider Egypt, on-site clinic for hotels and resorts | `/partner/hotels-and-resorts/` (hotel-name terms stay with 247clinic.net; cruise terms only on the maritime page) |
| Evacuation and repatriation | medical evacuation Egypt, medical repatriation from Egypt | service and partner pages |
| Providers and accreditation | GHA accreditation Egypt, international patient referral Egypt | `/services/accreditation-training/`, `/trust/` |
| Tour operators, embassies, corporates | medical support for tour operators Egypt, embassy medical support Egypt, corporate healthcare Egypt | their partner pages |
| Entity | Healthcare International Group, HCIG, the 8 brand names | home, about, group pages |

**On-page and technical (built in, gated):** one H1, canonical, hreflang for 7 languages plus x-default, `lang` per
page, per-language sitemaps with an index, robots, `llms.txt` and `llms-full.txt`, designed OG image per page,
breadcrumbs, descriptive anchors, the six project build standards (memory `seo-build-standards`). One JSON-LD graph
per page: Organization + MedicalOrganization (with `subOrganization` for the 8 brands, `sameAs` for social and brand
sites), WebSite, WebPage, SiteNavigationElement, BreadcrumbList, Service + OfferCatalog (service lines, maritime),
FAQPage where a page has FAQs, NewsArticle for posts, Person for leadership. Live titles stay until you approve the
new ones on the canvas.

**AI visibility:** one fact sheet used everywhere (HCIG, the 8 brand sites, LinkedIn, directories); answer-first
intro blocks and FAQs on key pages (new words, your approval); an "HCIG at a glance" facts block on About and Press;
AI baseline before launch and monthly reruns with the existing `scripts/ai-visibility/` (ChatGPT, Perplexity,
Gemini). Figures follow the live site, the single source of truth (40+ years, 135+ clinics); the company profile's
25+ and 100+ and the "only sea ambulances" line are not used.

**Off-page:** links from GHA and DMWV partner listings, "Part of Healthcare International Group" on the brand sites we
run (24/7, MedPark, TMASI) and asked of the others, event pages (ITB Berlin, ITIC, Africa Health ExCon), LinkedIn,
directories and PR. For Irina: a keyword and article-ideas brief (she writes any articles).

**Redirects:** every old address to its new page in one hop: `/index.php`, `/de/index.php`, `/services.php`,
`/blog.php`, `/kontakty.php`, `/news1-15.php`, `/blog/news1-15.php`, `?lang=` variants, and the share-tag targets
`/about.php` and `/partners.php`. The ten live pages keep their paths.

**Measurement:** GA4 events (partner_enquiry, maritime_enquiry, kit_download, newsletter_signup, contact_sheet_open,
whatsapp_click, call_click, email_click, video_play, language_switch), Ads conversions, Yandex goals, our tracker,
Search Console. A before-baseline of the live site is taken in P2 (read-only).

## Team, shared memory and delegation

**Lanes (each task has exactly one owner, set by Claude when the task is written, so nobody races):**

| Lane | Does | Never |
|---|---|---|
| Claude (Opus) | spec, plan, design system, every canvas board, all frontend, animation, motion, visual, SEO architecture, content model, reviews, commits, deploys | |
| agy-delegate (Gemini 3.8 Flash High, dispatched by Claude) | low priority only: logo hunting from official sources, alt-text drafts, first-draft UI translations, keyword list expansion, link inventories, crawl and QA scan reports, image generation for gaps, read-only second opinions | design, components, canvas, tokens, content files, BRAIN.md, secrets, deploys |
| agy-2 (your second Antigravity account, driven by you) | the same low-priority kinds of task, only those assigned to `agy-2` in TASKS.md | same as above |

**Files in `hcig-v6/` (one shared brain for Claude and both agy accounts):**
- `BRAIN.md`: single source of truth: the business in your words, locked decisions, hard rules, current phase and
  next step, where everything lives (canvas, preview, assets, spec), the lane table. Only Claude edits it.
- `AGENTS.md`: the Antigravity entry: read BRAIN.md and TASKS.md first, lane rules, the worktree protocol, gates to
  run, how to hand back.
- `CLAUDE.md`: Claude entry, points to BRAIN.md, the spec and the hcig skill memory.
- `TASKS.md`: id + title, owner lane, status, branch, files it may touch, notes.
- `DELEGATION.md`: brief template, relay command, review checklist (diff read, gates, every fact checked).
- `DECISIONS.md` (dated, your words) and `WORKLOG.md` (everything done and fixed, one line each, for the final email).

**Protocol:** agy work happens only in its own git worktree and branch (`D:/hcig-v6-wt-<task>`, `v6/<task>`), never on
main, and only on the files its task lists. Claude reads every diff, runs the gates, checks every fact, then merges.
The hcig skill memory gets `tasks/hcig-v6.md` (and the old `tasks/hcig-website.md` is marked superseded); HCIG Work
gets a registry item `hcig/v6`.

## Go-live (P9, only after Irina approves and you give the word)

1. `npm run build:live`; check the rendered head of every template (no noindex, canonical on healthcareig.com,
   hreflang, schema, live tags only behind consent).
2. Fresh backup check: `old_hcig_backup_website.zip` present outside `public_html`, plus a local copy.
3. Upload one release zip to a private folder and run the one-time, token-protected `deploy.php` (unzip into
   `stage/`, deleted right after). Fallback: file-by-file over one SFTP connection with an md5 diff (GoDaddy resets
   parallel sessions).
4. New `.htaccess`: one-hop 301s for every old address, clean URLs, cache rules, security headers, gzip only on GET.
   PHP switched to 8.x in MultiPHP for the lead endpoint at this moment, not before.
5. Swap stage into place in seconds; delete the old site files, keeping only the backup zip (and system folders such
   as `.well-known` and `cgi-bin`). A one-step rollback script is written and tested before the swap.
6. `verify.sh` at once (every page 200, every old URL one hop, head tags, cache headers, real 404), then a browser scan
   of every page at phone and desktop width, console and network.
7. Submit the sitemaps in Search Console, watch it for a week, re-run the AI baseline after four weeks.

## Verification (every build, before any "done")

- **Gates in `hcig-v6`:** `tsc --noEmit`, lint, `check-words.mjs` (every visible sentence has a source), `check-weight.mjs`
  (JS and media budgets), link check, JSON-LD parse and required fields, hreflang reciprocity across 7 languages,
  sitemap validity, `lang` per page, no "undefined", no dashes.
- **Root gates:** `npm test` (build.js + check.js: noindex, alt, viewport, links) before any push to HCIG Work. Never
  `npm run publish` while unrelated work is uncommitted, and only after Step 0.
- **Real browser:** every page at 360, 390, 768 and 1440, day and night, reduced motion on and off: console errors,
  horizontal overflow, broken images, video playback, focus order. (Playwright MCP failed to connect this session;
  fallback is a local Playwright script or Claude in Chrome.)
- **Quality numbers:** Lighthouse mobile on each template (performance 90+, SEO 100, accessibility 95+), axe scan,
  keyboard pass.
- **Canvas:** boards rendered locally before every publish; the live canvas read before every publish.
- **Live:** `verify.sh`, rendered-head check, a full browser scan, then a hunt for real errors (500s, console, network)
  after "done".

## Risks and how they are handled

| Risk | Handling |
|---|---|
| Secrets pushed to the public repo | Step 0 before any commit; `git status --ignored` check in every publish |
| Canvas scale (about 52 pages x 2 widths x 2 themes) | one section library renders both canvas and site; templates first, then instances |
| Irina sees v6 only at the end | every page follows the approved spec and your canvas picks; tokens make late visual changes cheap |
| Turquoise accent words are 2.24:1 on white | your rule kept for heading accent words only; never body, links or button labels |
| Helma licence unconfirmed, repo public | Pulse confirms; it is already served publicly on the live site; no other font files committed |
| Seven languages without native review | Claude translates, Gemini cross-checks, back-translation spot checks; German keeps the live German words |
| Your second agy account colliding with Claude | one owner per task, worktrees and branches only, Claude merges |
| Losing rankings at cutover | live paths kept, one-hop 301s, canonical and hreflang verified in the rendered head, sitemap resubmitted |
| Video weight on phones | re-encodes, designed posters, in-view loading, hero media budget |
| Google reviews terms and cost | official Places API, attribution shown, after consent, only when scrolled near |
| Figures that disagree across sources | live site wins; conflicts listed in the fact sheet for you |

## Inputs needed from you

1. Step 0: move `prompt hcig.txt` and the three key files out of the project folder.
2. Helma web licence: confirm with Pulse (it is served publicly on the live site already).
3. Leadership: confirm the names and titles from the company profile; real photos of the CSO and COO if they
   should appear (we have the CEO, Chairman and one board member).
4. Imprint details: HCIG legal entity name and registration number (or allow me to read them from the files in
   `ملفات قانونية`).
5. Google: GA4 property (or access to create one), Search Console for healthcareig.com, a Places API key with
   billing, and Yandex Metrika access.
6. Before go-live: GoDaddy DNS access for the email fix (SPF does not cover Microsoft 365; DKIM and DMARC missing),
   and a Microsoft 365 mailbox login (or a relay) the lead endpoint can send through.
7. Tell Pulse Marketing (their footer credit stays).
