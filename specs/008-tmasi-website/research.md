# Research: TMASI Global Website (v2 & v3)

Every decision with its rationale and rejected alternatives. Grounded in live site audits from 2026-09-26 and 2026-09-27.

## R1. Architecture and Stack

- Decision: Static HTML and CSS build integrated into the HCIG Work pipeline (`build.js`), previewed on HCIG Work (`/tmasi/v3`), with production deployable as clean static assets or PHP wrappers on GoDaddy cPanel (Apache, PHP 8.1).
- Rationale: GoDaddy shared hosting runs Apache and PHP 8.1 without a Node runtime. Producing static assets with PHP entry points guarantees instant compatibility. Zero server runtime complexity. Preserves existing Sofia JotForm chat integration and form handlers.
- Alternatives: Full Next.js server app (rejected: GoDaddy cPanel does not support continuous Node processes without containerization); WordPress (rejected: bloated, security risk, breaks custom styling and requires database management).

## R2. Clean URLs on Apache

- Decision: Use `.htaccess` rewrite rules to serve clean extensionless paths (such as `/services` and `/about`) mapping to `.php` or `.html` files. Enforce HTTPS, remove `www`, and eliminate duplicate query strings.
- Rationale: The live site had duplicate copies on `www` and root, plus duplicate uppercase/lowercase routes (`servises.php` vs `service.php`). Standardizing on clean lowercase routes preserves SEO equity and eliminates crawl duplication.
- Redirect Table: 301 redirects from old paths (`about.php` to `/about`, `dr-amba.php` to `/leaders/dr-amr-abbass`, `dr-ahmed.php` to `/leaders/dr-ahmed-nouh`).

## R3. Typography System

- Decision: Headlines in Big Noodle Titling. Body copy in Montserrat.
- Rationale: Brand guideline specifies Big Noodle Titling for primary impactful headlines and Montserrat for high-legibility interface copy. Mohamed confirmed permission for web use on 2026-09-26.
- Implementation: Font files subset to Latin character sets in WOFF2 format. Served locally to avoid external render-blocking requests.

## R4. Color Palette and Tone

- Decision: TMASI Teal (`#009A9C`) as primary brand accent. Deep Navy (`#0F205C`) for dark surfaces. Crisp white and light grey (`#F8FAFC`) for body cards and content areas.
- Rationale: Aligns with approved spec decisions. The hero world map and footer stay dark to create authority and depth. Inner content sections use light grounds to ensure readability for international case managers.
- Contrast Ratio: Teal `#009A9C` on white passes WCAG AA for large text (3:1+). Dark navy `#0F205C` on white passes AAA (11:1+). White on teal or dark navy passes AA.

## R5. World Map Reconstruction

- Decision: High-resolution vector SVG map with accurate coordinates for the five global operational hubs: Egypt (Cairo), Germany, Spain, UAE (Dubai), and USA.
- Rationale: The live map is an 800x421 raster image with pins misaligned (Germany pin was over Central Asia, UAE pin was over Southeast Asia). Rebuilding as a responsive SVG ensures crisp rendering at 4K down to mobile, with exact geographical pinpoints.
- Design Slot: Base map provided as a design slot for graphic designer Reham to supply bespoke stylistic finishes.

## R6. Content Preservation Protocol

- Decision: 100% strict verbatim content retention. Every sentence, heading, phone number, and statistic from `tmasi.net` is preserved without rewording.
- Rationale: Mohamed established this as the highest priority rule on 2026-09-26. Grammar and punctuation fixes are allowed only where meaning is unaltered, with every change logged in `docs/tmasi-worklog.md`.
- Automated Verification: Build pipeline asserts all extracted content blocks against live site text strings.

## R7. Partner and Insurer B2B Positioning

- Decision: Layout prioritizes B2B case managers, insurers, assistance companies, hotels, and tour operators. Immediate visibility for 24/7 emergency dispatch.
- Rationale: TMASI's business model relies on institutional contracts and insurance authorizations. Institutional visitors require instant confirmation of capabilities, global footprint, and emergency access.

## R8. AI Visibility and AEO Strategy

- Decision: Structured data (`MedicalOrganization`, `EmergencyService`, `LocalBusiness`), answer-first semantic HTML sections, and `llms.txt` index.
- Target Queries:
  - "Medical assistance company in Egypt"
  - "International patient repatriation Egypt"
  - "Air ambulance evacuation Hurghada Cairo"
  - "Cashless medical assistance Red Sea Egypt"
- Rationale: Establishes TMASI as the cited primary authority across ChatGPT, Gemini, Perplexity, and Google AI Overviews.

## R9. Competitor Benchmark

- Benchmark Entities: Euro-Center, Gulf Assist, MarmAssist, SOS International, Falck Global Assistance.
- Key Differentiators: Direct on-ground hospital and clinic network in Egypt through HCIG, owned medical hubs, multi-language operational desk (EN, DE, PL, ES, AR).
