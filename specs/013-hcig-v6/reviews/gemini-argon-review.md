# Gemini Argon review of the HCIG v6 plan (owner's Gemini Pro, 2026-10-26)

Source: gemini.google.com conversation 'HCIG v6 Implementation Plan Review', copied with Gemini's Copy button.

### Findings

1. **Severity: High | Angle 1 (Business Fit)**
* **What is wrong:** B2B buyers (international insurers, assistance networks, cruise lines, embassies) evaluate operational mechanics, not emotional slogans. On the home page, the actual operational proof ("How Our System Works" at Section 8 and "100% Trusted by Global Insurance & Assistance Networks" at Section 13) is buried beneath seven sections of corporate philosophy, mission/vision pairs, and premises lists. Furthermore, section 11 ("Trusted by patients" with consumer Google Reviews and patient videos) occupies prime B2B real estate. While patient satisfaction is nice, an assistance coordinator or hotel procurement director needs to see **GOP (Guarantee of Payment) acceptance workflows, 24/7 alarm center escalation protocols, direct billing mechanics, medical reporting standards, and geographical coverage maps** within seconds. These B2B proof points are missing from the top of the funnel.
* **The exact fix:** Move "100% Trusted by Global Insurance & Assistance Networks" (Section 13) to position 3 (immediately below Hero B) as a compact, high-authority trust bar. Elevate "How Our System Works" (Section 8) to position 5 (immediately after the Group section) and pair it directly with the "traveller at the centre" signature visual (Option B). Reframe Section 11 ("Trusted by patients") with a B2B header explaining *why* it matters to partners (e.g., protecting policyholder and guest satisfaction scores; exact wording needs a source or approval). Ensure `/partner/insurance-assistance-companies/` and `/partner-kit/` explicitly detail cashless billing, GOP turnaround, and clinical governance (facts need a source from existing documentation).


2. **Severity: High | Angle 2 (Content Rules)**
* **What is wrong:** The plan contains a contradiction in its content rules. It states "Every live sentence kept exactly" and "no facts may be invented", yet simultaneously commits to scaling a ~10-page live brochure site into ~52 English pages where Claude writes "all of it, from verified facts only", plus writing "answer-first intro blocks and FAQs on key pages" for AI visibility, and generating "3-field form Partner Kit PDFs per partner type". Stretching a small pool of live sentences across 25+ net-new deep B2B pages (6 partner pages, 7 service lines, 8 brand pages, Partner Kits) guarantees either massive verbatim repetition across URLs or LLM hallucination of operational SLAs, clinical capabilities, and billing protocols.
* **The exact fix:** Establish a strict "Fact-to-Page Threshold" gate in P2 before P4/P5. Every net-new sentence (`new-approved`) must map to a cited line ID in the P2 Fact Sheet (`src/content/facts.json`). If a proposed service line, partner page, or Partner Kit PDF has fewer than 5 unique verified facts in the P2 audit, do not pad it with LLM-invented B2B fluff. Either merge thin pages into consolidated hubs, or generate a "Missing Fact Questionnaire" for the client/Irina to supply real operational facts (needs a source) before writing copy.


3. **Severity: High | Angle 2 & 4 (Content Rules & International SEO)**
* **What is wrong:** Launching 7 languages (364 pages total) by having Claude translate and Gemini cross-check without native B2B medical/insurance review is high risk. In German (`DE`), Polish (`PL`), French (`FR`), Italian (`IT`), Spanish (`ES`), and Czech (`CS`), B2B travel medicine and insurance terminology is rigid (e.g., German *Kostenübernahmeerklärung* for Guarantee of Payment, *Rücktransport* for medical repatriation). Literal AI translation of English marketing terms will look amateurish to European assistance desks and will miss the exact B2B search queries in those markets. Additionally, delegating "first-draft UI translations" to `agy-delegate` violates the strict quality bar if those strings leak into production without a locked glossary.
* **The exact fix:** Add a mandatory step in P2/P6: build a locked **7-Language B2B Medical & Insurance Glossary** (20 to 30 core terms per language: GOP, direct billing, repatriation, shore-side clinic, fit-to-fly, cashless network) verified against actual European insurer portals and native SERPs before any page translation runs. Update `check-words.mjs` to enforce that translated pages use the exact locked glossary terms.


4. **Severity: High | Angle 5 (Architecture)**
* **What is wrong:** The plan states that `/api/lead.php` will run on a shared cPanel host using **SQLite stored outside `public_html**`, plus a **Google Places API proxy/fetcher** for live MedPark reviews. First, SQLite on shared cPanel hosting (which often uses network-mounted storage or strict file-locking rules) frequently throws `database is locked` errors under concurrent requests or fails entirely if a honeypot/bot wave hits the form. Second, the plan states the Google Reviews widget is "fed by the official Places API... loaded after consent when scrolled near". Calling the Google Places API directly from client-side JavaScript exposes the billing API key to public abuse and CORS issues; calling it uncached from PHP on every scroll will exhaust API quotas and rack up billing costs.
* **The exact fix:** For `/api/lead.php`, configure SQLite with `PRAGMA journal_mode=WAL;` and `PRAGMA busy_timeout=5000;`, and add an atomic append-only CSV/JSONL fallback (`flock()`) outside `public_html` so zero leads are lost even if SQLite locks. For the Google Places API, build a server-side PHP caching proxy (`/api/reviews.php`) that fetches the MedPark reviews from Google Places at most once every 24 hours, caches the sanitized JSON payload to disk outside `public_html`, and serves that static JSON to the frontend widget after consent.


5. **Severity: High | Angle 5 & 7 (Architecture & cPanel Go-Live)**
* **What is wrong:** Next.js 16 `output: "export"` with `trailingSlash: true` generates `out/<lang>/<translated-slug>/index.html`, but it **does not** generate localized 404 routing or server-side redirects. On Apache/cPanel, without a custom `.htaccess` routing rule, a broken link on `/de/maritime-...` will serve the English `/404.html` (or Apache's default 404). Furthermore, the plan mentions `flatten-rsc.mjs` for the preview pipeline (`npm run preview`), but omits it from `npm run build:live`. Next.js App Router static exports create deeply nested `__next.<segment>.txt` RSC payload files that trigger mod_security rules or 404s on shared Apache hosts when users navigate via client-side `<Link>` transitions.
* **The exact fix:** Run `flatten-rsc.mjs` (or equivalent RSC payload alignment) on `build:live` as well, and test client-side `<Link>` transitions on a real Apache staging folder in P5. In `.htaccess`, configure `ErrorDocument 404 /404/index.html` and add a lightweight client-side language detector on the 404 page (reading `window.location.pathname` prefix `/de/`, `/fr/`, etc.) to display the 404 message and navigation links in the visitor's language.


6. **Severity: High | Angle 6 (Sequencing and Gates)**
* **What is wrong:** The plan states: "Irina sees only the finished preview. Approval: you, then Irina, then live" (Phase 8), which occurs *after* P5 (Build English, 52 pages), P6 (Translate into 6 languages, 364 pages), and P7 (Full browser QA pass). Because the plan introduces massive structural changes to accommodate 17 sections without scrolling fatigue ("cards, tabs, reveal", "two-line descriptions that open on tap"), plus ~40 pages of net-new copy written by Claude, waiting until 364 pages are built and QA'd to show the Marketing Director creates a severe rework trap. If Irina rejects the progressive disclosure tabs or changes the framing of the new Partner/Brand pages in P8, you have to rebuild components and re-translate 300+ pages.
* **The exact fix:** Keep Irina out of the messy canvas phase if preferred, but insert a **Phase 5.5 Gate**: show Irina the live, polished English preview of the **10 core template pages** (Home, Maritime, 1 Service, 1 Partner, 1 Brand, etc.) *before* executing P6 (the 6-language translation of 300+ pages) and before building the remaining 40 English child pages. Lock her structural and copy sign-off on the core English templates first.


7. **Severity: Medium | Angle 3 (Information Architecture & Cannibalisation)**
* **What is wrong:** While the plan smartly separates `/partner/hotels-and-resorts/` from `/maritime-cruise-healthcare/` and leaves hotel-name searches to `247clinic.net`, there are three remaining IA collisions inside `healthcareig.com`:
1. `/group/<8 brands>/` vs `/services/<7 lines>/` (e.g., `/group/tmasi-global/` vs `/services/medical-tourism-facilitation/`, and `/group/uca-mena/` vs `/services/accreditation-training/`). Both pairs target the exact same entity and service intent.
2. `/services/corporate-healthcare/` vs `/partner/corporate-international-organisations/`. Both target "corporate healthcare Egypt".
3. `/group/24-7-clinic/` on HCIG vs `247clinic.net` for B2B resort clinic queries.


* **The exact fix:** Enforce strict intent separation in P2's keyword map:
* **Brand pages (`/group/<brand>/`)** must only target **navigational brand/entity queries** ("MedPark Hospital Hurghada", "What is TMASI Global", "UCA MENA") and act as corporate credential fact sheets linking out to the sister sites. They must not target generic non-brand service keywords.
* **Service pages (`/services/<line>/`)** target **what is delivered clinically/operationally** (capabilities, medical scope, clinical standards).
* **Partner pages (`/partner/<type>/`)** target **who buys and the commercial relationship** (procurement models, SLAs, GOP, contracting, co-branding). Specifically, differentiate `/services/corporate-healthcare/` (occupational health, executive checkups, workforce medical programs) from `/partner/corporate-international-organisations/` (B2B contracting for multinationals, NGOs, and remote site medical coverage).




8. **Severity: Medium | Angle 4 (SEO, GEO and AEO)**
* **What is wrong:** Generating 364 static pages across 7 languages with `x-default` and full reciprocal `hreflang` links in the `<head>` bloats every HTML document with 8 `<link rel="alternate">` tags, AND putting hreflang in both `<head>` and XML sitemaps risks desynchronization if a trailing slash or translated slug changes. Additionally, the plan puts "two-line descriptions that open on tap", tabs, and accordions across the site to make 17 sections feel short. If the hidden text is injected via JS on click rather than present in the initial SSR HTML, AI crawlers (`GPTBot`, `ClaudeBot`, `PerplexityBot` - which do not reliably execute interactive JS states) and Google's initial crawl wave will miss the core live wording. Finally, `llms.txt` is only routed at the root (`/llms.txt`), missing localized AI retrieval paths, and schema lacks `areaServed` and `availableLanguage` on `ContactPoint`.
* **The exact fix:** Ensure 100% of collapsed/tabbed/revealed text exists in the initial static HTML DOM (`output: "export"` server render) and is toggled strictly via CSS (`hidden` / `aria-expanded` / max-height or `<details>`), never conditional JS rendering. Enhance the `MedicalOrganization` and `Service` JSON-LD schemas with explicit `areaServed` (Egypt, Red Sea, Hurghada, Sharm El-Sheikh, Marsa Alam, Cairo, etc. - exact list needs a source from live site) and `ContactPoint` with `availableLanguage: ["en", "de", "pl", "fr", "it", "es", "cs"]`. Generate hreflang from a single canonical mapping function in `src/lib/site.ts` so `<head>` and `sitemap.xml` cannot drift.


9. **Severity: Medium | Angle 5 (Architecture)**
* **What is wrong:** The dual-target architecture ("one React section library renders both the design canvas boards and the Next.js static export") has a hidden trap: Next.js relies on `<Image>` (`next/image`) or custom `<picture>` components and `<Link>` (`next/link`), whereas `react-dom/server` (`build-canvas.mjs`) rendering outside the Next.js build pipeline will choke on Next.js internal router context or Next.js image optimization wrappers. Furthermore, the `pull-canvas.mjs` step ("reads the live boards and lists your hand edits so they go back into the source first") is brittle because hand edits made on the Claude Design canvas modify compiled static HTML (`<x-dc>`), not the underlying React JSX + `src/content/` TypeScript data structures.
* **The exact fix:** Ban all `next/*` imports (`next/link`, `next/image`, `next/navigation`) inside `src/sections/`. Sections must be pure, zero-dependency React components that only call the plain `href()` and `asset()` helpers and render standard `<a href>` and `<picture><source type="image/avif"><source type="image/webp"><img ...></picture>` markup. For `pull-canvas.mjs`, automate a DOM/text diff against the last published `.dc.html` snapshot so any canvas tweak outputs an exact JSON patch against `src/content/` and `tokens.css` rather than requiring manual HTML-to-JSX reverse engineering.


10. **Severity: Medium | Angle 6 & 7 (Sequencing & cPanel Go-Live)**
* **What is wrong:** Three operational sequencing flaws exist around the live server:
1. The plan switches cPanel MultiPHP from PHP 7.1 to PHP 8.x at **Step 4 of Go-Live (P9)**, *after* Step 3 (`deploy.php` runs to unzip the release). If `deploy.php` is written for PHP 8 or tested on PHP 8, running it while the domain is still on PHP 7.1 can fail mid-cutover. Conversely, switching PHP to 8.x while the old PHP 7.1 site is still live can break the old site if cutover takes a few minutes.
2. The DNS email authentication fix (SPF for Microsoft 365, DKIM, DMARC) is listed in two conflicting places: "Taken #2" says "moves to before go-live", while the Phase table (P10) still says "After launch: ... DNS email fix".
3. GoDaddy shared cPanel hosts frequently have `mod_security` rules or `open_basedir` restrictions that block PHP scripts from writing to or reading SQLite/config files located *outside* `public_html` (`../private/`), or block outbound SMTP connections on ports 587/465 to `smtp.office365.com` (forcing local relay). Reading PHP INI pages in P2 (Taken #8) will **not** reveal GoDaddy firewall outbound port blocks on port 587.


* **The exact fix:**
1. Reconcile the Phase 10 table immediately so SPF/DKIM/DMARC happens in **P7/P8 (at least 48 hours before P9 go-live)** to allow DNS TTL propagation.
2. During the P7/P8 staging test (when you give the OK to test `deploy.php` in a throwaway subfolder), also test a one-file `test-env.php` in that subfolder that verifies: (a) outbound socket connection to `smtp.office365.com:587`, (b) reading/writing an SQLite file outside `public_html`, and (c) `ZipArchive` extraction speed.
3. Write `deploy.php` and `rollback.php` to be strictly compatible with both PHP 7.1 and PHP 8.x, and switch MultiPHP to PHP 8.x immediately *after* the directory rename swap in P9 Step 5.




11. **Severity: Low | Angle 1 & 5 (UX, Accessibility & Performance)**
* **What is wrong:** Two frontend friction points:
1. Loading the JotForm AI agent *and* custom floating elements or sheets on mobile can collide visually and trap keyboard focus. Also, if the user rejects or ignores the cookie consent banner, and the JotForm AI agent only loads *after* consent, a user who declines tracking loses the floating AI assistant entirely without knowing why.
2. The plan specifies "Helma at 600 (synthetic, like the live site) for display and H2". Relying on browser-synthesized bold (`font-synthesis: weight`) for a 54px luxury serif heading produces blurry, uneven glyph strokes across Safari (iOS/macOS) vs Chrome (Windows) and undermines the "Luxury" design mandate.


* **The exact fix:** In the "Talk to our team" contact sheet (or floating trigger), if consent is not given and someone tries to open the AI chat, display a lightweight inline prompt ("Enable functional cookies to start live AI chat, or reach us directly via WhatsApp / Email below") so the user is never dead-ended. For Helma, inspect the font file in P2; if only a 400 weight exists and `font-weight: 600` is synthetic, test `font-synthesis: none` with proper optical sizing or controlled `-webkit-text-stroke` on Safari/Chrome during the P3 spike so headings stay razor-sharp across OS renderers.



---

### The Five Changes I Would Make First

1. **Insert a Phase 5.5 Approval Gate with Irina (Angle 6):** Before translating 52 pages into 6 additional languages (364 pages total) or building all 40+ inner English child pages, show Irina the finished live preview of the **10 core English template pages** (Home, Maritime, 1 Service, 1 Partner, 1 Brand, etc.). Lock executive approval on the interactive card/tab layout and B2B copy structure before multiplying the workload by 7x.
2. **Reorder the Home Page for Immediate B2B Conversion (Angle 1):** Do not make insurers, assistance directors, and hotel groups scroll past 7 sections of philosophy to see operational proof. Move the **Insurer & Assistance Logo Bar** directly below Hero B (or About), and move **"How Our System Works" + the "Traveller at the Centre" ecosystem diagram** directly below the Group section (position 5). Frame patient testimonials as B2B guest/member satisfaction proof.
3. **Lock the P2 Fact-to-Page Threshold & 7-Language B2B Glossary (Angle 2 & 4):** Enforce a hard rule in P2 that no net-new B2B page is built unless it has at least 5 unique verified facts in `facts.json` (requesting missing operational facts from the team rather than letting AI pad 52 pages), and lock a verified 7-language glossary of core B2B medical/insurance terms (GOP, repatriation, direct billing, shore-side clinic) before running any translations.
4. **Harden the Shared cPanel Backend Architecture (Angle 5 & 7):** Add a server-side 24-hour disk-cached PHP proxy for the Google Places API (never hit Places API directly per user scroll), add `WAL` mode + an atomic CSV/JSONL fallback to `/api/lead.php` so SQLite file locks on shared hosting never drop a B2B lead, and verify outbound port 587 SMTP + outside-`public_html` write permissions during the pre-launch throwaway folder test.
5. **Purge `next/*` Dependencies from `src/sections/` and Guarantee SSR DOM Visibility (Angle 4 & 5):** Keep `src/sections/` 100% free of `next/image` and `next/link` so `react-dom/server` canvas builds and Next.js static exports never diverge, and ensure all collapsed/tabbed text ("cards, tabs, reveal") is rendered in the static HTML DOM so `GPTBot`, `PerplexityBot`, and Google index 100% of the live wording.
