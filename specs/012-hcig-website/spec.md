# Feature Specification: healthcareig.com, the HCIG group website, rebuilt from zero

**Feature Branch**: `012-hcig-website`

**Created**: 2026-10-18

**Status**: draft

**Plan page**: "HCIG Website Plan", https://claude.ai/artifact/NzDdZTiMURNdjybx28CPVx (private), source `docs/hcig-website-plan.html`

**Input**: His words, 2026-10-18: "lets make full plan for our haelthcareig.com website our main website ,, now i want full
plan for all,, i will refactor all the website from zero to hero ,, like we did to tmasi and 247 and medpark ,,, we will
make full re make to hcig , redesigning , seo and geo and aeo analyisis and keyword planning and searching an targetting
b2b search terms and partnerships for hcig website , make full plan for everything , even things i didnt mention , and
things i dont know yet ,, for marketing and ads and google search and re designing and ui and ux and design canvas and
working on max effort for that website and spend as much time as needed to make this website a matserpeice in everything
in design and looking and ui and ux and marketing and b2b partnerships and seo and geo and pagespeed insights and all
aspects i dont know about it yet". During the questions: "and get all the matrials and logos and images ,, and feel free
to use gemini to make images and videos for the website." And: "and i want wbesite to feel luxury and premium and elite".

## Why

healthcareig.com is the group's front door. Insurers, assistance companies, hotels, cruise lines, tour operators,
embassies, corporates and healthcare providers judge HCIG by it, and it is the home of the eight group brands.

Today it does not do that job. Verified on 2026-10-18: it runs on PHP 7.1.33 (end of life since 2019), the home and the
German home carry an empty canonical, the German home has an empty title, there is no hreflang, no GA4, 19 images are
broken (all four share images among them), old `.php` addresses serve duplicate copies while the share tags point at
addresses that return 404, a session-recording counter runs with no consent banner, and the domain's email
authentication does not cover the mail system the domain actually uses. The design does not look like a group that is
an Official Partner of GHA and DMWV and shows 23 international insurers as its network.

B2B buyers search in English and in their own languages, read proof before they write, and increasingly ask AI tools
who to work with. The new site must look like an institution an insurer or a hotel chain would sign with, rank for the
B2B terms those buyers use, be named by AI tools, and turn visits into partner conversations that Irina can count.

## Decisions taken with Mohamed (2026-10-18, six question rounds)

| Topic | Decision |
|---|---|
| Audience | **B2B first, plus the group corporate hub** (brands, leadership, press). Patients get a clear route to MedPark, 24/7 Clinic, TMASI and Medcierge |
| Words | **Every existing sentence kept exactly.** New pages get new copy, reviewed by him, then Irina, before going live |
| Size | **Full B2B site**: home, about, leadership, a page per partner type, a page per service line, a page per group brand, network, trust and standards, press room and media kit, news at readable addresses, contact, partner kit |
| Languages | **EN, DE, PL, FR, IT, ES, CS.** English launches first; the other six follow. The current German pages stay live until the new German pages replace them, so no German address ever goes missing |
| Translation | Claude translates, Gemini cross-checks. No native review step |
| Feel | **Luxury, premium, elite.** No emojis anywhere on this site. Every icon is a hairline SVG |
| Brand | **The HCIG guideline wins**: colours, Helma and Inter, logo rules. He gets the licensed Helma web files; a close stand-in serves until they arrive |
| Canvas | **Three directions side by side**, desktop first then phone: Ivory editorial, Noir and turquoise, Hybrid. Built strictly on the guideline. He picks or mixes |
| Hero | **Every hero option on the canvas** (film, network map, editorial photo, system drawing) **plus one 3D concept**. Claude recommends the one that best suits B2B |
| Visuals | Every real material, logo and image from the live site and the group sites is collected. **Gemini images and video may be used anywhere, where they look best** |
| Proof | A **trust layer**: official partnerships (GHA, DMWV), 24/7 Clinic's UCA accreditation credited to 24/7 Clinic, the 23 insurer logos, the patient testimonial videos, the events HCIG took part in, named hotel partners. A Trust and Standards page plus a proof band on key pages (his idea, confirmed) |
| CEO quote | The quote card from his material folder, word for word, on home and leadership |
| End of home | A **"partner with us" band** to encourage B2B contact, and a **minimal, business-like newsletter field** (his idea) |
| Partner kit | One PDF per partner type, **behind a short form** (name, company, email). Every download is a counted lead |
| Chat | **The JotForm AI agent stays** |
| B2B focus | **All partner types in year one**: insurers and assistance; hotels, resorts and cruise lines; tour operators and agencies; corporates, embassies and providers |
| Brands | **Every group brand gets its own page.** Brands with their own website link out to it |
| Hub extras | **Leadership, press room and media kit.** Careers and case studies not now |
| Hosting | He has cPanel or FTP. Go-live is done by us after Irina approves and he gives the word |
| Accounts | Google Ads, Search Console, GA4 and LinkedIn page admin are all available |
| Live site now | **Invisible fixes plus tracking go live before the rebuild**, so the before numbers exist |
| Ads | **Google Search and LinkedIn after launch**, once tracking is proven. Budget proposed by Claude after research |
| Marketing | LinkedIn content plan, partner newsletter, event landing pages with QR, directories, PR and listings. All planned, switched on when needed |
| Deadline | **None. Quality first** |
| Approval | Him, then Irina, then live |
| Who works | Opus plans and builds what matters most. Gemini (`agy-delegate`) only in implementation: reviews and medium to low priority builds |

## Word sources

- **Existing words**: every visible sentence on today's 10 pages (`/`, `/about/`, `/services/`, `/partner/`,
  `/contacts/`, `/blog/`, `/de/`, `/de/ueber-uns/`, `/de/leistungen/`, `/de/kontakt/`) and the 15 news posts, saved on
  2026-10-18 in `hcig-v3/material/live-site/pages/`. Kept exactly. Grammar, punctuation, capitals and spacing fixes that
  keep the same words and meaning are allowed, each one logged.
- **The CEO quote**: "Success isn't measured only by the number of visitors a destination attracts. It's measured by how
  well those visitors are cared for when they need help the most." Dr. Amr Abbass, CEO, HCIG. From `material/qoute ceo.jpg`.
- **New copy** (new pages, labels, answer blocks, FAQs, brand page text, partner kit, newsletter and partner band): short,
  from the fact sheet only, shown on the canvas or in a review pack, approved by him then Irina before it goes live.
- **Keyword articles** may be AI-written (standing permission 2026-09-05). Facts are never invented.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - An insurer's assistance manager decides HCIG is a serious partner (Priority: P1)

A case manager at a European travel insurer lands on the home from search, LinkedIn or an event QR code. In under a
minute they understand that HCIG manages the whole case (hotel clinic, hospital, case management, evacuation and
repatriation, claims), see proof they recognise (Official Partner of GHA and DMWV, insurer logos, the group's numbers),
and reach the partner desk.

**Why this priority**: insurers and assistance companies are the buyers the group's own words address first.

**Independent Test**: five people who do not know HCIG each look at the home for 60 seconds on a phone or desktop, then
say what HCIG does, name one proof, and show how to contact the partner desk.

**Acceptance Scenarios**:

1. **Given** the home on desktop or phone, **When** it loads, **Then** the positioning line, the main action and at
   least one proof element are visible within the first screen or one scroll.
2. **Given** any page, **When** the visitor wants to contact HCIG, **Then** the partner desk (form, email, phone) is one
   tap away.
3. **Given** the insurance and assistance page, **Then** it shows how HCIG works with insurers in the site's own words
   plus approved new copy, carries proof, and offers the partner kit.

---

### User Story 2 - A hotel, cruise or tour operator buyer finds the page made for them (Priority: P1)

From the menu, or from a search for their own need in their own language, the buyer reaches the page for their partner
type, sees what HCIG enables for them, sees proof that fits them (135+ on-site clinics, named hotel partners), and
downloads the partner kit.

**Why this priority**: every partner type is a year-one target, and each buys for different reasons.

**Independent Test**: each of the six partner-type pages exists, says what HCIG does for that type, carries proof and a
kit download, and is reachable in two clicks from any page.

**Acceptance Scenarios**:

1. **Given** the partners hub, **Then** all six partner types from "Who We Work With" are listed and each opens its page.
2. **Given** a partner-type page, **When** the visitor asks for the kit, **Then** a three-field form delivers the right
   PDF and the lead is recorded.

---

### User Story 3 - Every visitor feels a world-class group (Priority: P1)

At first sight, on desktop and on a phone, the site feels luxury, premium and elite: calm space, editorial serif
headlines, hairline icons, slow and physical motion, visuals of the highest quality, the brand's exact colours.

**Why this priority**: it is his explicit ask, and B2B buyers read quality of presentation as quality of service.

**Independent Test**: the aura test (seven questions in the `world-class-aura` skill) passes on desktop and phone
screenshots of every page template, and he approves the canvas before any code.

**Acceptance Scenarios**:

1. **Given** any page, **Then** no emoji appears, every icon is a hairline SVG, and every colour comes from the guideline.
2. **Given** reduced motion, **Then** every reveal, tilt, parallax and loop is replaced by a still state and nothing is
   hidden.

---

### User Story 4 - A partner checks HCIG's proof before signing (Priority: P1)

On the Trust and Standards page, and in the proof band on key pages, the partner sees the official partnerships in
exact wording, the UCA accreditation credited to 24/7 Clinic with its source, the insurer logos in full colour, the
patient testimonial videos, the events HCIG took part in, and the hotels the group names as partners. Each item leads to
its source.

**Why this priority**: B2B buyers decide on proof, and these items are real.

**Independent Test**: every proof item on the site maps to a source line in the fact sheet; no "accredited by" or
"certified by" wording is used for HCIG itself.

**Acceptance Scenarios**:

1. **Given** the Trust and Standards page, **Then** each proof item names its source and links to it where one exists.
2. **Given** the insurer logos, **Then** all 23 appear in their own colours, pause on hover, and can be read by a screen
   reader as a list of names.

---

### User Story 5 - Old addresses keep their value (Priority: P1)

Every address that exists today (the 10 pages, the 15 news posts, and the old `.php` variants) answers either the same
page or one permanent redirect to its new address. Nothing that ranks is lost.

**Why this priority**: he has said many times he will not risk what Google already indexes.

**Independent Test**: after go-live, a crawl of the old address list returns 200, or one 301 to a 200, for every address;
Search Console shows no new 404 from an old address in the first 14 days.

**Acceptance Scenarios**:

1. **Given** `/blog/news1.php` to `/blog/news15.php`, `/news1.php`, `/services.php`, `/blog.php`, `/kontakty.php`,
   `/index.php`, **When** requested, **Then** each answers one 301 to the matching new page.
2. **Given** the English launch, **Then** `/de/`, `/de/ueber-uns/`, `/de/leistungen/` and `/de/kontakt/` keep answering
   200 until the new German pages replace them.

---

### User Story 6 - The live site improves now, before the rebuild (Priority: P1)

Before any redesign, invisible fixes and tracking go live on today's site after a server backup: canonical tags, the
German title, share tags and share images, language links between English and German, a clean structured-data block,
GA4, Search Console and conversion tracking. What visitors read does not change.

**Why this priority**: he chose it, it stops losses today, and it records the before numbers for Irina and the CEO.

**Independent Test**: the rendered head of all 10 pages shows the fixes; GA4 records visits; the visible text of every
page is unchanged.

**Acceptance Scenarios**:

1. **Given** the backup exists, **When** the fixes are uploaded, **Then** every page still answers 200 and its visible
   text matches the saved copy.
2. **Given** a consent banner is needed for EU visitors, **Then** its wording is shown to him first, because it is visible.

---

### User Story 7 - A visitor understands the group (Priority: P2)

The group hub shows the eight brands, each on its own page, inside its own block in its own colours: what it does, where,
and a link to its own website where one exists. The leadership page shows the board with real photos and the CEO quote.
The network page shows where the group operates.

**Why this priority**: the corporate hub was his choice next to B2B, and leaders and brands are what AI tools cite.

**Independent Test**: every brand page exists; every brand with a website links to it; the leadership page lists the
board with titles that match the list he confirms.

**Acceptance Scenarios**:

1. **Given** the group hub, **Then** eight brands appear, each opening its page.
2. **Given** the leadership page, **Then** names and titles match the confirmed list and each photo is a real photo.

---

### User Story 8 - A visitor reads in their own language (Priority: P2)

English first, then German, Polish, French, Italian, Spanish and Czech, each with translated addresses. The language
switch keeps the visitor on the same page.

**Why this priority**: his seven-language choice; the B2B buyers sit in those markets.

**Independent Test**: after wave two, every page exists in all seven languages and each one links to its siblings.

**Acceptance Scenarios**:

1. **Given** any page in any language, **When** the visitor switches language, **Then** the same page opens in the new
   language.
2. **Given** a German, Polish or Czech text that runs longer, **Then** no headline or button breaks mid-phrase or overflows.

---

### User Story 9 - Search engines and AI tools name HCIG for B2B questions (Priority: P2)

Each page targets one main B2B keyword in its language. The organisation, its brands, leaders, services and
partnerships are described in machine-readable form. Key pages open with a short answer block. A public fact sheet and an
`llms.txt` exist. The same facts appear across LinkedIn, directories and group sites.

**Why this priority**: rank and AI citation are his two standing goals.

**Independent Test**: every page has a unique title and description, valid structured data, a canonical and reciprocal
language links; the AI baseline prompts are re-run monthly and recorded.

**Acceptance Scenarios**:

1. **Given** any page, **Then** structured data validates with no errors and names the page's real subject.
2. **Given** the keyword map, **Then** no two pages target the same main keyword in the same language.

---

### User Story 10 - A lead becomes a counted, followed-up conversation (Priority: P2)

Partner enquiries, kit downloads, newsletter signups, calls and email clicks are recorded with page, language and
source, reach partner@healthcareig.com, and show on the dashboard. Newsletter signups confirm by email. Visitors choose
their cookie consent and the site works fully either way.

**Why this priority**: Irina's goal is proof that the work brings partners.

**Independent Test**: a test enquiry, a kit download and a newsletter signup each arrive in the inbox within 5 minutes
and appear on the dashboard with their source; declining cookies leaves every page and form working.

**Acceptance Scenarios**:

1. **Given** a sent enquiry, **Then** the visitor sees a confirmation and the partner desk receives every field.
2. **Given** a declined consent, **Then** no analytics, ads or session-recording cookie is set.

---

### User Story 11 - The site is fast everywhere (Priority: P2)

On a phone over 4G the first screen appears fast, nothing jumps, every tap responds at once, video never blocks the
page, and the chat agent never slows the first view.

**Why this priority**: PageSpeed is one of his named goals and Google ranks on mobile.

**Independent Test**: the mobile measurement of the home and of every page template meets SC-001.

**Acceptance Scenarios**:

1. **Given** the home on a mid-range phone, **Then** the main content is visible before any film or chat loads.

---

### User Story 12 - Marketing switches on a campaign without new code (Priority: P3)

An event page with a tracked QR code, a campaign landing page and a newsletter issue can each be made from a template.

**Why this priority**: all four marketing tracks are planned, to be switched on when needed.

**Independent Test**: one event page is made from the template in under an hour, and a scan of its QR code is counted.

**Acceptance Scenarios**:

1. **Given** the event template, **Then** a new event page is live with its own tracked QR code and partner form.

### Edge Cases

- The Helma files never arrive: the stand-in serif stays, and swapping it later changes one setting.
- An insurer or hotel asks for its logo to be removed: it comes off the site the same day.
- A patient in need of care lands on the B2B site: a quiet but clear route to 24/7 Clinic and MedPark, in wording he approves.
- A visitor declines cookies: everything works; first-party counting still records leads without personal data.
- The chat agent or a video fails to load: the page is complete without it; posters are designed images, never a frame.
- A news post's photo is missing on the live site today: the post keeps its words, and the photo slot gets a finished
  image (a real one found elsewhere, or a generated one), never an empty box.
- A board title differs between sources (the GHA news calls Dr. Amr Abbass "chairman and CEO"; the About page says Group
  Vice Chairman and Group CEO): the site uses the list he confirms.
- A partner type has no proof item yet: its page shows the group-wide proof, never an invented one.
- The old German pages stay during the gap: they carry the Phase 0 fixes and link to the new English pages.

## Requirements *(mandatory)*

### Functional Requirements

**Words and claims**

- **FR-001**: Every existing sentence MUST appear on the new site exactly as written (logged grammar and spacing fixes
  allowed). An automated check MUST fail the build if a migrated page holds a sentence that is in neither the source text
  nor the approved new-copy list.
- **FR-002**: New copy MUST be approved by him, then Irina, before it goes live.
- **FR-003**: No number, partner, accreditation, price or outcome MAY appear unless the fact sheet holds it with a source.
- **FR-004**: Partnership wording MUST stay exact ("Official Partner of Global Healthcare Accreditation", "Official
  Partner of the German Medical Wellness Association"). "Accredited by" or "certified by" MUST NOT be used for HCIG. The
  UCA accreditation is credited to 24/7 Clinic only, with its source.
- **FR-005**: Existing wording that looks risky (for example "100% Of All Recognized Insurance Companies") MUST stay as
  written and be listed once for Irina's decision.

**Look and feel**

- **FR-006**: Colours, fonts and logo use MUST follow the HCIG guideline. On group pages each brand MUST sit inside its own
  block in its own colours.
- **FR-007**: No emoji MAY appear anywhere. Every icon MUST be a hairline SVG.
- **FR-008**: Every new template, section and visual change MUST be shown on the design canvas (desktop first, then phone)
  and approved before code.
- **FR-009**: The phone MUST get its own designed layout: no sideways scroll from 360 to 430 px, touch targets at least
  44 px, actions within thumb reach.
- **FR-010**: Motion MUST be slow and physical, MUST NOT hijack scrolling, and MUST have a still version under reduced
  motion.
- **FR-011**: The site MUST meet WCAG 2.2 AA: contrast, keyboard, visible focus, labels, alt text, captions on any video
  with speech.

**Pages and journeys**

- **FR-012**: The site MUST hold, per language: home; about; leadership; services hub and a page per service line;
  partners hub, a page per partner type and the partner kit; group hub and a page per brand; network; trust and
  standards; press room and media kit; news; events; contact; privacy, cookie and legal notice pages; a 404 page.
- **FR-013**: The home MUST end with a "partner with us" band and a minimal newsletter field.
- **FR-014**: The partner desk (form, email, phone) MUST be one tap away from every page.
- **FR-015**: The partner kit MUST be one PDF per partner type, offered behind a three-field form.
- **FR-016**: Newsletter signups MUST be confirmed by email before any newsletter is sent, and every issue MUST carry an
  unsubscribe link.
- **FR-017**: Every enquiry, kit download and signup MUST reach partner@healthcareig.com and the dashboard with page,
  language and source. Spam MUST be filtered without a puzzle for people.
- **FR-018**: All 15 news posts MUST move word for word, with their photos, to readable addresses.
- **FR-019**: The JotForm AI agent MUST stay, loaded so it never delays the first view.
- **FR-020**: Brand pages MUST link to the brand's own website where one exists. Changes on the brand sites themselves
  (for example a link back to HCIG) need approval per site.

**Addresses and languages**

- **FR-021**: Every address in today's site, sitemap and share tags MUST answer 200 or one 301 to an equivalent page.
- **FR-022**: Old German addresses MUST keep answering 200 until the new German pages replace them.
- **FR-023**: Every page MUST exist in EN, DE, PL, FR, IT, ES and CS by the end of wave two, with translated addresses,
  a language switch to the same page, and the right language declared on the page.

**Search, AI and speed**

- **FR-024**: Every page MUST have one H1, a unique title and description, a canonical, reciprocal language links, a
  share image, descriptive link text, semantic navigation, breadcrumbs and structured data that names its real subject.
- **FR-025**: Each language MUST have its own sitemap; the site MUST publish `llms.txt` and a public fact sheet.
- **FR-026**: Each page MUST target one main keyword per language, recorded in the keyword map, with no two pages
  competing.
- **FR-027**: Key pages MUST open with a short answer block (new copy, so approved first).
- **FR-028**: Organisation facts (name spelling, leaders and titles, addresses, brands) MUST match across the site, the
  group sites, LinkedIn and every directory listing the plan creates.
- **FR-029**: Video MUST play as video, with designed posters (never a frame from the film) and full films opening with
  sound on request. The testimonial videos MUST be re-encoded for the web without visible quality loss.
- **FR-030**: Generated images and video MAY be used anywhere. AI-made people MUST NOT be presented as named HCIG leaders,
  staff, patients or testimonials.

**Measurement, consent and safety**

- **FR-031**: Analytics, ads and session-recording tags MUST load only after consent where consent is required; the site
  MUST work fully without it.
- **FR-032**: GA4, Search Console, Google Ads conversions, the LinkedIn tag and the group's first-party counting MUST
  record the leads and actions listed in the plan, and conversion tracking MUST be verified before any paid campaign.
- **FR-033**: Any server-side form handling MUST run on supported software, and the domain's email authentication MUST
  cover the systems that send its mail, so partner email reaches inboxes.

**Process**

- **FR-034**: Phase 0 MUST take a server backup first and MUST NOT change what visitors read (the consent banner, if
  needed, goes to him first).
- **FR-035**: Every build MUST be previewed on HCIG Work, blocked from search, before it reaches the live host.
- **FR-036**: Go-live MUST follow his word after Irina's approval: backup, upload, redirects, check of the rendered head on
  every template, sitemaps resubmitted, 14 days of monitoring, rollback possible within 15 minutes.
- **FR-037**: A work log MUST run from the first change (`docs/hcig-website-worklog.md`), and HCIG Work MUST be updated at
  every status change.

### Key Entities

- **Page**: one subject, one main keyword per language, one H1, one canonical, seven language versions.
- **Partner type**: insurers and assistance; embassies and government; hotels, resorts and cruise lines; tour operators
  and agencies; healthcare providers; corporate clients. Each has a page, a proof set and a kit.
- **Service line**: the group's service lines and the operational services in the site's own words, each with a page
  where a keyword exists for it.
- **Group brand**: name, what it does, where, own colours, logo, own website if any.
- **Proof item**: a partnership, accreditation, logo, testimonial, event or hotel, always with its source.
- **Lead**: an enquiry, kit download or newsletter signup, with page, language, source and consent state.
- **News post**: title, date, place, words, photos, old address, new address.
- **Asset**: a photo, film, logo or generated visual, with its source, licence and where it is used.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On a mobile test, the home and every page template score at least 90 for performance, 100 for SEO, and at
  least 95 for accessibility and best practices. Main content appears within 2.5 s, layout shift stays under 0.1 and
  taps respond within 200 ms. (Before numbers are measured in Phase 0.)
- **SC-002**: 0 broken images or links at launch (19 broken images today).
- **SC-003**: 100% of old addresses answer 200 or one 301 to a 200; 0 new 404s from old addresses in Search Console in
  the first 14 days.
- **SC-004**: 100% of existing sentences are present on the new site, and 100% of new sentences are on the approved list.
- **SC-005**: In a five-person test, at least 4 people can say what HCIG does and how to reach the partner desk after
  60 seconds on the home.
- **SC-006**: 10 of 10 test leads (enquiry, kit, newsletter) arrive in the inbox and on the dashboard within 5 minutes.
- **SC-007**: Within 90 days of the English launch, all four AI tools checked name HCIG for its own brand prompts, and HCIG
  is named in at least 5 of the 20 B2B category prompts (baseline recorded in Phase 0).
- **SC-008**: Within 6 months of launch, Search Console shows impressions for at least 50 keywords from the B2B keyword
  map across the seven languages.
- **SC-009**: Within 6 weeks of the English launch, every page is live in all seven languages with reciprocal language
  links.
- **SC-010**: Partner enquiries and kit downloads are reported every month from launch; the monthly target is set with
  Irina after the first 4 weeks of data.
- **SC-011**: He approves the canvas and Irina approves the site before go-live, both recorded in HCIG Work.

## Assumptions

- The live site and the group sites are the single source of truth for business facts. Facts missing there are asked
  for, never guessed.
- News posts are translated in wave two with the rest of the site, last in order.
- Keyword volumes come from free tools (Keyword Planner through the HCIG Google Ads account now available, autocomplete,
  live results, his free Semrush account), then from Search Console once data exists.
- The host serves static files and `.htaccess` rules; a supported PHP version can be chosen in cPanel for the form handler.
- The three testimonial videos on the site today were published with the patients' consent; he confirms this.
- The 23 insurer logos stay because the live site already shows them under "Trusted by Global Insurance & Assistance
  Networks". New logos need his confirmation.
- "Powered by Pulse Marketing" stays in the footer.
- Yandex Metrika (two counters, one per language) stays, behind consent.
- The partner portal, careers, case studies and a chat assistant of our own are later phases, not this one.

## Inputs needed from him

| # | What | Why |
|---|---|---|
| 1 | Helma web font files (woff2) and the licence | Brand headline face |
| 2 | HCIG logo as vector (SVG, AI or EPS) | Sharp logo at every size |
| 3 | cPanel, FTP or SSH access for healthcareig.com | Phase 0 and go-live |
| 4 | GA4, Search Console, Google Ads and LinkedIn access for our account or service account | Tracking, ads, LinkedIn tag |
| 5 | DNS access (GoDaddy) or the person who holds it | Email authentication fix |
| 6 | The current board list with real photos | Leadership page (sources disagree on titles) |
| 7 | A few facts per brand without a website: MedOne, One Medical Center, One Medical Spa, UCA MENA, Shakankiry | Their pages |
| 8 | Consent confirmation for the three testimonial videos | They stay on the site |
| 9 | A newsletter tool account he opens himself (free tier) | Newsletter and kit emails |
| 10 | Legal name, registration and privacy contact | Privacy, cookie and legal notice pages |
| 11 | The 2026 to 2027 event calendar | Event pages and QR codes |
| 12 | A word to Pulse Marketing that the site is being rebuilt | They built it; their footer credit stays |
