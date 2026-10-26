# Feature Specification: HCIG v6, the new healthcareig.com

**Feature Branch**: `013-hcig-v6` (no git branch; work lands on main, agy work in `v6/<task>` worktrees)

**Created**: 2026-10-26

**Status**: approved

**Approved**: 2026-10-26 by Mohamed, by approving the plan `C:\Users\maqmo\.claude\plans\pasted-content-id-99bb-lets-begin-warm-wand.md`
after five question rounds. Later the same day: "only add important pages to canvas,, and rest you can impl dircetly
afftet i approve important pages".

**Supersedes**: `specs/012-hcig-website/` (the v3 attempt). Its research and contracts remain reference.

**Input**: His words, 2026-10-26: "now i want it to be hcig v6, this is complete and full and best version in all
aspects, design and looking and animation and visual and canvas and design system and seo and geo and full website and
ai visibility and everything. forget v3, only take hero B and group section only from claude canvas, and begin v6 on
new folder called hcig v6". The business, in his words: "Healthcare + International + Group = HCIG", "We build
healthcare ecosystem for tourists, For b2b only", "we are one complete group for patients without need to
fragmentation, we take the patient from end to end". His manager added a Maritime & Cruise vertical (ChatGPT share).
His reference image shows "the traveller at the centre" with every service around them.

## Why

healthcareig.com is the group's front door for insurers, assistance companies, hotels, cruise lines, tour operators,
embassies, corporates and healthcare providers. Today it runs on PHP 7.1 with broken basics (empty canonical, every page
`lang="en"`, no hreflang, 19 broken images, duplicate `.php` pages, Yandex session recording without consent), carries
long text, and does not show what HCIG is: one connected group that takes the international patient from first contact
to case closure. v6 must make a B2B buyer feel that in seconds, rank for the terms they search, be named by AI tools,
and turn visits into partner conversations Irina can count.

## Decisions (2026-10-26, five question rounds)

Full table with his words: `hcig-v6/DECISIONS.md`. In short:

| Topic | Decision |
|---|---|
| Carry over | Hero B only (no HC watermark, no film loop), day default with the dawn switch to night; the group section as approved under the live H2 "Our Premises and Facilities" with "Integrated healthcare group all over the world" under it |
| Words | Every live sentence kept exactly; the manager's maritime copy word for word; new sentences from verified facts only, marked, approved by him |
| Maritime & Cruise | Menu item, home block, full page with its own form and brochure request |
| Pages | Full B2B site, about 52 pages per language |
| Languages | EN, DE, PL, FR, IT, ES, CS, all at launch; existing German words kept; translated slugs |
| Hotel-name SEO | Stays with 247clinic.net; HCIG links to it |
| Live site | Untouched until go-live; then replaced; only `old_hcig_backup_website.zip` stays on the host |
| Tracking | GA4 + Google Ads + Yandex + the HCIG first-party tracker, behind consent, live build only |
| Contact | JotForm AI agent the only float; "Talk to our team" sheet with WhatsApp +20 100 182 8828, call, email, form |
| Trust | Testimonial videos + live MedPark Google reviews + one TMASI-style photo row, a curated few of each |
| Articles | None unless Irina writes them; we deliver keywords and ideas |
| Canvas | Only the important pages; the rest built in code on the approved templates |
| Review | Him, then Irina (finished preview only), then live on his word |

## Word sources

- **Live words:** every visible sentence on the 25 live pages (10 pages + 15 posts), captured fresh in P2 and diffed
  against the 2026-10-18 mirror (`src/hcig-live/`). Kept exactly; punctuation fixes logged.
- **Manager's words:** `brand guideline/chatgpt_longest_messages.txt` lines 1139 to 1402 (page) and 1423 to 1434
  (home block), plus the SEO table (menu label, H1, URL, SEO title, meta description, CTAs, form fields).
- **Guideline words:** brand essence, promise, tone, key messages, elevator pitch, slogans from `HCIG brandguideline.pdf`,
  transcribed word for word in P2.
- **CEO quote:** "Success isn't measured only by the number of visitors a destination attracts. It's measured by how well
  those visitors are cared for when they need help the most." Dr. Amr Abbass, CEO (`hcig material/qoute ceo.jpg`).
- **New words:** labels, intros, FAQs, new page copy, legal pages: written by Claude from the fact sheet, marked new,
  approved by him on the canvas or in review.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - An insurer's case manager decides HCIG is a serious partner (Priority: P1)

An assistance company's network manager lands on the home or the insurers page, sees in seconds that HCIG is one group
that owns the case from first contact to closure, checks proof (GHA and DMWV partnership, insurer logos, numbers,
testimonials) and starts a conversation.

**Acceptance Scenarios**:
1. **Given** a phone visitor on the home page, **When** the first screen loads, **Then** the hero states the live hero
   words and both actions ("Talk to our team", "Become a Partner") are visible without scrolling.
2. **Given** the insurers page, **When** the visitor scrolls, **Then** they see the live words for insurers, the
   insurer logos in their own colours, the partnership line and a partner form, with no invented claim.
3. **Given** the form is sent on the live site, **When** it succeeds, **Then** partner@healthcareig.com receives it and
   a `partner_enquiry` conversion is counted (after consent).

### User Story 2 - A cruise or maritime operator finds the maritime offer (Priority: P1)

A cruise line's medical operations lead searches "cruise ship medical services", lands on the maritime page, reads the
six capabilities and the partnership models in the manager's words, and sends the maritime form or requests the brochure.

**Acceptance Scenarios**:
1. **Given** the maritime page, **Then** every sentence matches the manager's copy, the H1 is "Maritime & Cruise
   Healthcare Solutions", and the SEO title is "Cruise Ship Medical Services & Staffing | HCIG".
2. **Given** the maritime form, **Then** it asks Company, Fleet/Vessel Type, Required Services, Operating Region and
   Contact Details, and a sent form counts as `maritime_enquiry`.
3. **Given** the home page, **Then** the maritime block sits after "Our Healthcare" and links to the page; the menu has
   "Maritime & Cruise".

### User Story 3 - Every visitor feels one connected group (Priority: P1)

Any visitor, on any device, understands within one or two screens that HCIG is the whole journey in one group: the
traveller at the centre and every service around them.

**Acceptance Scenarios**:
1. **Given** the home page, **Then** Hero B, the group section (film, 8 brands, hover logos) and the signature
   ecosystem visual (option A or B, his pick) appear in that order of discovery.
2. **Given** reduced motion, **Then** every animated section shows a designed still state with all content visible.

### User Story 4 - The owner approves the important pages on the canvas before they are built (Priority: P1)

**Acceptance Scenarios**:
1. **Given** the design system and the important pages on the Claude Design canvas (desktop and phone, day and night,
   real motion), **When** he picks and edits, **Then** his hand edits are read from the live canvas and carried into the
   source before the next publish.
2. **Given** his approval, **Then** the built pages match the canvas, and the other pages follow the approved templates.

### User Story 5 - Old addresses keep their value (Priority: P1)

**Acceptance Scenarios**:
1. **Given** go-live, **Then** the ten live page paths still answer 200 and every old address (duplicates, `.php` posts,
   `?lang=` variants, `/about.php`, `/partners.php`) answers one 301 to its new page.
2. **Given** any page, **Then** its rendered head has a canonical on https://healthcareig.com, hreflang for the seven
   languages plus x-default, and no noindex.

### User Story 6 - A visitor reads in their own language (Priority: P1)

**Acceptance Scenarios**:
1. **Given** any page, **Then** it exists in EN, DE, PL, FR, IT, ES and CS with a translated slug, the right `lang`
   attribute and a language menu that keeps the same page.
2. **Given** the four existing German pages, **Then** their live German words are kept.

### User Story 7 - Search engines and AI tools name HCIG for B2B questions (Priority: P2)

**Acceptance Scenarios**:
1. **Given** each page, **Then** it targets one main keyword per language from the keyword map, with one H1, a JSON-LD
   graph and descriptive internal links.
2. **Given** `/llms.txt` and the facts block, **Then** the facts match the fact sheet exactly.

### User Story 8 - A partner checks proof before signing (Priority: P2)

**Acceptance Scenarios**:
1. **Given** the trust page and the home testimonials section, **Then** the visitor sees the testimonial videos, live
   MedPark Google reviews with Google attribution (after consent) and a real photo row, each credited.
2. **Given** the leadership page, **Then** only real people with real photos and the titles from the company profile appear.

### User Story 9 - Leads are counted and followed up (Priority: P2)

**Acceptance Scenarios**:
1. **Given** any lead form or the newsletter field, **Then** the entry is stored outside the web root, mailed to
   partner@healthcareig.com and exportable as CSV; spam is held back by a honeypot, a time trap and a rate limit.

### User Story 10 - The site is fast and accessible everywhere (Priority: P2)

**Acceptance Scenarios**:
1. **Given** a mid-range phone on 4G, **Then** LCP is under 2.5 s, CLS under 0.05, INP under 200 ms on key templates.
2. **Given** a keyboard or screen reader, **Then** every control is reachable, labelled and visibly focused.

### Edge Cases

- A visitor declines consent: no tracking, no Google reviews call, no JotForm load; the reviews card links to Google.
- A live sentence contains a typo: kept, flagged once to him, fixed only if the fix keeps the same words and meaning.
- Figures disagree across sources (company profile 25+ years and 100+ facilities): the live site wins.
- A brand has no official vector logo: the best official raster is used at a size it can hold; the gap is listed.
- The Google Places API fails or quota runs out: the widget falls back to the rating link card.
- Helma licence not confirmed by go-live: decision for him; the preview uses it as the live site does.

## Requirements *(mandatory)*

### Functional Requirements

**Words and content**
- **FR-001**: Every visible sentence MUST come from a listed word source; a build gate MUST fail otherwise.
- **FR-002**: No em or en dashes; no "accredited by" about HCIG; no invented numbers, partners, prices or outcomes.
- **FR-003**: New sentences MUST be marked new in the content model and approved by him before the preview.

**Pages and structure**
- **FR-004**: The site MUST have the pages in section "Pages" of `hcig-v6/BRAIN.md` (about 52 per language).
- **FR-005**: The home MUST follow the approved order (BRAIN.md section 6), with Hero B, the group section, the maritime
  block, the testimonials bento, the CEO quote and the closing band with the newsletter field.
- **FR-006**: The maritime page MUST carry the manager's copy, SEO title, meta description, CTAs and form fields.

**Design**
- **FR-007**: One design system built from Hero B and the group section, on the brand palette and tints, Helma and
  Inter, documented in `hcig-v6/DESIGN.md` and shared by canvas and code (`src/styles/tokens.css`).
- **FR-008**: Day is the default theme; a switch turns the whole site to night with the dawn transition on Hero B.
- **FR-009**: The important pages MUST be approved on the canvas (desktop 1440 and phone 390, day and night) before they
  are built; other pages follow the approved templates.
- **FR-010**: Every motion MUST have a reduced-motion still; native scrolling only; no frame from a video anywhere.

**Contact, leads, trust**
- **FR-011**: JotForm AI agent is the only floating button; "Talk to our team" opens a sheet with WhatsApp
  (+20 100 182 8828), call, email and the partner form.
- **FR-012**: One lead endpoint on the HCIG host for partner, maritime, kit, brochure and newsletter entries.
- **FR-013**: Google reviews MUST come live from the Places API with attribution, only after consent; no review markup.

**Languages, SEO, AEO**
- **FR-014**: Seven languages at launch with translated slugs, `lang` per page, hreflang and x-default.
- **FR-015**: Canonical, per-language sitemaps with an index, robots, `llms.txt`, one JSON-LD graph per page, one H1.
- **FR-016**: One-hop 301s for every old address; the ten live paths kept.

**Tracking and privacy**
- **FR-017**: GA4, Google Ads, Yandex and the HCIG tracker load only on the live build and only after matching consent
  (Consent Mode v2); privacy, cookies and imprint pages describe exactly these tags.

**Preview, go-live, collaboration**
- **FR-018**: The preview lives at https://hcig-passport.vercel.app/hcig/v6 with noindex and passes root `npm test`.
- **FR-019**: Go-live only on his word after Irina approves: backup verified, stage, swap, rollback ready, verify script,
  full browser scan; old files removed except `old_hcig_backup_website.zip` outside `public_html`.
- **FR-020**: Claude and both Antigravity accounts work from `hcig-v6/BRAIN.md`, `AGENTS.md`, `TASKS.md`; agy work only
  in worktrees, reviewed and merged by Claude.

### Key Entities

- **Page**: path per language, template, main keyword, title, description, sections, schema type, word sources.
- **String**: text, language, source (`live`, `manager`, `guideline`, `new-approved`, `translation`), page.
- **Brand**: name, live line, logo set, website, page.
- **Lead**: type, fields, consent, time, language, page, stored copy, mailed copy.
- **Media item**: file, type, source, licence, credit, sizes, used on.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of visible sentences pass the words gate; zero dashes; zero unsourced facts.
- **SC-002**: All important pages approved on the canvas before build; the built pages match the canvas at 1440 and 390.
- **SC-003**: Lighthouse mobile on each key template: performance 90+, SEO 100, accessibility 95+.
- **SC-004**: Every old address answers one 301 or 200 on go-live day; zero 404s from the old sitemap.
- **SC-005**: Seven languages live at launch, hreflang reciprocal on every page, zero missing translations.
- **SC-006**: Every lead form delivers to partner@healthcareig.com and is counted in GA4 after consent.
- **SC-007**: Search Console shows the new pages indexed within four weeks of go-live; AI baseline re-run after four
  weeks with the results compared to the before-baseline.

## Assumptions

- The live site is the single source of truth for business facts.
- Hosting stays on the GoDaddy cPanel account; the account has SFTP but no shell, so deploys are file uploads.
- Helma's web licence is confirmed by Pulse before go-live.
- Translations are by Claude, cross-checked by Gemini, without a native reviewer.

## Inputs needed from him

Listed in the plan and in `hcig-v6/BRAIN.md`: move the key files out of the project folder; Helma licence; leadership
names and photos; imprint details; GA4, Search Console, Places API key, Yandex access; later DNS access; tell Pulse.
