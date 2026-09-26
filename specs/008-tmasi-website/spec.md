# Feature Specification: TMASI Global website (urgent edits, then v3)

**Feature Branch**: `008-tmasi-website`

**Created**: 2026-09-26

**Status**: draft (every decision answered by Mohamed on 2026-09-26, waiting for his approval)

**Input**: User description: "ssh for tmasi, add it to tmasi, it is one of the group of healthcare international group. We will make many edits and updates and redesigning and refactoring and optimization and ui and ux pro max and seo and AEO. First we will make few urgent edits, like text centering and adding new news. Then we will make full refactoring and designing of tmasi and optimization of performance and seo and aeo, a complete remaking like we did in medcierge and 247 v3." Later the same day: "it will need complete v3, new design, re making and refactoring and re styling, ui and ux and keywords planning and semrush, and complete new design from ui and ux pro max and 21st and claude design, and complete seo and aeo, and i just noticed now that it still lacks favicon, and og."

## Why

TMASI stands for Travel Medical Assistance Services International (the logo says so).
Its site has the right words but presents them poorly: mixed alignment, a soft world map
with two pins on the wrong countries, a broken favicon and share image, and language
signals that confuse Google across its four languages.

TMASI's own news is about partnerships (Egypt Healthcare Authority, Hansa Medica Group,
ITIC Global, Uniglobal), so the site's first job is to win partners: insurers, assistance
companies, hotels and tour operators. Travellers still find the 24/7 line at once.

## Decisions taken with Mohamed (2026-09-26)

| Topic | Decision |
|---|---|
| **Content** | **Every word stays exactly as written**, in every language. **The website is the single source of truth** for TMASI facts. Content changes only when Mohamed brings new ideas. Clear typos are fixed, each one logged |
| Approver | Mohamed alone |
| Ownership | We edit the site freely. "Powered by Pulse Marketing" stays, better styled |
| Live workflow | Straight to live after a server backup, with before and after screenshots. Every change logged in `docs/tmasi-worklog.md` |
| Live UI and UX | Fix every UI and UX issue found, words untouched. Centre the About Us lines |
| Live technical fixes | www redirect, canonical, hreflang, language tag per page, sitemap, Google tag once, one H1 per page, favicon, share image. **Titles untouched** |
| Sofia chat | Stays as it is on the live site. Kept in v3 on the right; whether it opens by itself on phones is settled in the v3 design review. **No floating WhatsApp button**: Sofia already sits on the right |
| World map | Stays dark. Rebuilt sharp, same five labels, each pin on its real country |
| Favicon | The original logo mark |
| Share image | The best we can make now (Gemini, Nano Banana). Reham makes the final one |
| Logo | The original file from the server if it is there, otherwise from the brand guideline PDF, until the original comes from Mohamed's manager |
| Images | Live site: finished images only, never a placeholder. v3: labelled design slots with size and format for **Reham**, the graphic designer |
| News | From Mohamed's folder `tmasi sponsor/` (text and photos per post). Published in EN, DE, PL and ES: we translate, a native speaker checks. German and Polish blogs are built. Card dates as written in each post ("October 2026", "June 2026"). Photos come from the folder (arrived 2026-09-26: four for Hansa Medica, one ITIC banner) |
| Analytics | Mohamed asks Pulse for access to the current Analytics, Tag Manager and Search Console. No tag changes until then |
| Domain and DNS | Held by someone at TMASI. DNS changes go through them; Search Console is verified by file upload |
| Keyword research | Free tools (Keyword Planner, autocomplete, live results, Search Console, AI prompts) plus Mohamed's **Semrush free account** through Claude in Chrome |
| v3 audience | **Partners first**: insurers, assistance companies, hotels, tour operators. The 24/7 line stays visible for travellers |
| v3 hero | The world map, as on the original site, made sharp. Reham may redesign it later |
| v3 colours | Light pages; the world map hero and the footer stay dark |
| v3 buttons | All teal, like the original site |
| v3 headline font | **Big Noodle Titling**; Mohamed has permission for web use (stated). Body in Montserrat. Raw font files stay out of git; the build ships a web subset |
| v3 pages | Home; a page per service group (Medical Assistance, Elite Medical Concierge, Travel Assistance, Medical Tourism, Insurance Assistance); a page per office (Egypt, Germany, Spain, UAE, USA); about; contact; news; the two leader pages. Every URL live today is kept or redirected |
| v3 titles | Today's titles and descriptions kept. Only wrong-language ones are replaced, from each page's own heading |
| v3 languages | EN, DE, PL, ES (existing translations kept word for word) plus FR, IT, CS (we translate, a native speaker checks) |
| HCIG link | One footer line: "Part of Healthcare International Group", with the group logo and a link |
| Logo row | Only organisations the site names (Egypt Healthcare Authority, Hansa Medica Group, ITIC Global, Uniglobal), each shown for what it is |
| Articles | News only for now. Keyword articles come later |

## Two phases

| Phase | What | Where it ships | Spec gate |
|---|---|---|---|
| **A. Urgent edits** | UI and UX fixes, news posts, technical fixes, favicon, share image, sharp map and logo, on the current site | Live site, file by file, backed up first | None. Starts once SSH logs in |
| **B. TMASI v3** | A from-scratch rebuild: design, structure, SEO, AEO, same words | HCIG Work preview first, then their hosting after Mohamed approves | This spec, once approved |

## The current site, verified 2026-09-26

**Stack.** Hand-written PHP pages on GoDaddy cPanel (Apache, PHP 8.1). Built by Pulse
Marketing. A JotForm AI chat ("Sofia"). Google tag, Tag Manager and Yandex Metrica.

**Pages.** 25 URLs in the sitemap: home, about, services, contact, blog, two leadership
pages (CEO Dr. Amr Abbass, CSO Dr. Ahmed Nouh), in EN, DE, PL and ES. Four news posts,
English and Spanish only, newest 11 Nov 2025. Two new posts arrived on 2026-09-26.

**Defects found, all checked on the live site:**

| # | Defect | Effect |
|---|---|---|
| 1 | Favicon and share image both point to `/img/logo.jpg`, which returns 404. Five pages have no icon tag | No tab icon, no picture on shared links |
| 2 | `www.tmasi.net` answers 200 instead of redirecting | Two copies of every page compete |
| 3 | No canonical and no hreflang on any page | Google cannot tell the four languages apart |
| 4 | Every page says `lang="en"`, German, Polish and Spanish included | Wrong language signal |
| 5 | Polish home, Polish about and Spanish about carry German titles | Wrong title in Polish and Spanish results (left as is on the live site, by decision) |
| 6 | `/pl/uslugi/` is in the sitemap and returns 404 | Crawl error |
| 7 | Sitemap uses the wrong namespace (`https://www.sitemaps.org`) | Google may reject the file |
| 8 | News posts and the Spanish blog are missing from the sitemap | Slower discovery |
| 9 | Most pages have no H1 | Weaker page topic signal |
| 10 | The Google tag loads twice | Double page views, slower load |
| 11 | German and Polish blogs return 404 | News reaches half the languages |
| 12 | Text alignment is mixed: hero left, headings centred, lists left | Looks unfinished |
| 13 | World map is 800 x 421 px stretched full width; Germany pin over Central Asia, UAE pin over South East Asia | Soft picture, wrong geography for a global company |
| 14 | Logo is a blurry raster picture | Looks cheap next to partners' logos |

## User Scenarios & Testing

### User Story 1 - An insurer's case manager finds a partner in Egypt (Priority: P1)

A case manager at a European travel insurer needs a medical assistance partner for a
policyholder abroad. They land on tmasi.net from a search or a conference contact. In
seconds they see what TMASI handles, where its offices are, and how to reach the team.

**Why this priority**: Partners send the cases, and TMASI's own news is about partnerships.

**Independent Test**: Open the home on a laptop. Within the first screen, name what TMASI
does and find the quote request and the call button. Reach either in one click.

**Acceptance Scenarios**:

1. **Given** the home on a 1440 px screen, **When** it loads, **Then** the headline, the quote request and the call button are visible without scrolling.
2. **Given** any page, **Then** the call button is one tap away in the header.
3. **Given** a service page, **Then** it carries that service group's own words, laid out to scan.

---

### User Story 2 - A traveller in trouble gets help now (Priority: P1)

A tourist, or their family at home, needs help abroad. They open the site on a phone and
find the call button and the assistant at once.

**Independent Test**: Open the home at 375 x 667. Find the call button without scrolling.

**Acceptance Scenarios**:

1. **Given** a phone at 375 x 667, **When** the home loads, **Then** the call button is reachable in one tap.
2. **Given** JavaScript is off or reduced motion is on, **Then** every word and every action still works.

---

### User Story 3 - A news post goes live in four languages (Priority: P1, Phase A)

TMASI announces a partnership or a conference. Mohamed puts the text and photos in the
news folder. The post appears first on the blog in EN, DE, PL and ES, with the date as
written, and is listed in the sitemap.

**Independent Test**: Publish one post. Check the blog order, the post page in each
language, its date, and its sitemap entry.

**Acceptance Scenarios**:

1. **Given** a new post, **Then** its words match the folder text exactly, and it sits first on the blog.
2. **Given** the post page, **Then** it has one H1, a canonical and hreflang to its three translations.
3. **Given** the sitemap, **Then** the post is listed in the same deploy.

---

### User Story 4 - Mohamed reviews v3 before anyone else sees it (Priority: P1, Phase B)

Mohamed opens the v3 preview on HCIG Work on desktop and phone. It reads as a live site,
with labelled design slots where Reham's graphics will go. He sends notes in rounds.

**Acceptance Scenarios**:

1. **Given** the preview URL, **Then** it sends noindex and is listed in HCIG Work under TMASI.
2. **Given** each design slot, **Then** it names its purpose, pixel size and format, and appears in `docs/tmasi-v3-design-slots.md`.
3. **Given** a content check against the live site's text, **Then** no sentence on v3 differs from the live site.

---

### User Story 5 - Search engines and AI tools name TMASI (Priority: P2, Phase B)

Someone asks ChatGPT, Gemini or Google for a medical assistance company in Egypt, or for
repatriation from Egypt, in any of the seven languages. TMASI appears and is described
correctly.

**Independent Test**: A fixed set of prompts and searches, run before launch and monthly
after, records whether TMASI is named and which page is cited.

---

### User Story 6 - A hotel or tour operator asks for a quote (Priority: P2)

A hotel manager or tour operator finds the partner offer, sees the organisations TMASI
works with, and sends a quote request in under a minute on a phone.

---

### Edge Cases

- A visitor lands on a German page: the header, form and news around them are German, or clearly marked as English where no translation exists yet.
- A claim on the live site (30,000+ cases, 570+ repatriations) stays exactly as written; the website is the source of truth.
- A news post arrives without photos: it waits in the folder until they arrive.
- A server edit fails half-way: the backup restores the page in one step.
- The Sofia chat covers the phone screen on first load: left as it is on the live site, by decision; revisited in the v3 design review.

## Requirements

### Phase A: urgent edits on the current site

- **FR-A01**: Every edited file MUST be backed up on the server before it changes, and every change MUST be logged in `docs/tmasi-worklog.md` with page, before, after and check.
- **FR-A02**: Every UI and UX issue found MUST be fixed without changing a word, starting with the About Us lines (centred).
- **FR-A03**: New news posts MUST keep the folder text word for word, show the date as written, sit newest first, exist in EN, DE, PL and ES (German and Polish blogs built), and be listed in the sitemap.
- **FR-A04**: Technical fixes MUST ship: www redirect, canonical, hreflang, language tag per page, clean sitemap, Google tag once, one H1 per page. Titles MUST stay untouched.
- **FR-A05**: The favicon (original logo mark, all sizes) and a share image MUST work on every page.
- **FR-A06**: The world map MUST be sharp at every screen width, with its five labels and each pin on the right country. The logo MUST be sharp.
- **FR-A07**: Clear typos MAY be fixed, each logged with before and after. Nothing is reworded.
- **FR-A08**: Each fix MUST be checked on the rendered live page, not only in the file.

### Phase B: TMASI v3

- **FR-B01**: The rebuild MUST start from understanding, in this order: business, audience, keywords, competitors and AI baseline, system analysis, fact sheet, sitemap and content plan, partners. The live website is the only source for business facts.
- **FR-B02**: Every sentence on v3 MUST match the live site's text. A build check MUST fail on any sentence that is not theirs, outside approved interface labels.
- **FR-B03**: The home MUST put partners first and keep the 24/7 call visible.
- **FR-B04**: Pages MUST present the existing words in a short, visual, scannable way (hierarchy, cards, reveal on tap, compact sections) without cutting or rewording them.
- **FR-B05**: The design MUST follow the TMASI brand guideline: teal leads, Big Noodle Titling headlines, Montserrat body, light pages, the dark world map hero and footer, all-teal buttons, no floating WhatsApp button, the Sofia assistant kept.
- **FR-B06**: The site MUST exist in EN, DE, PL, ES, FR, IT and CS with per-language URLs, `lang`, hreflang and canonical.
- **FR-B07**: Every page MUST carry structured data for the organisation, its offices and its services. An `llms.txt` and per-language sitemaps MUST ship at launch.
- **FR-B08**: The logo row MUST show only organisations the site names, each for what it is.
- **FR-B09**: The preview MUST live on HCIG Work, noindex, until Mohamed approves. Only then does it replace tmasi.net, with every old URL kept or redirected.
- **FR-B10**: Performance MUST be measured before and after; the live site's numbers are the baseline.
- **FR-B11**: Design slots MUST mark every graphic Reham will make, with purpose, pixel size, format and safe area, and MUST be listed in `docs/tmasi-v3-design-slots.md`.
- **FR-B12**: Page titles and descriptions MUST stay as today, except wrong-language ones, which take each page's own heading.

### Key Entities

- **Office**: country, city, address, phone, email. Five: Egypt, Germany, UAE, Spain, USA.
- **Service group**: Medical Assistance, Elite Medical Concierge, Travel Assistance, Medical Tourism, Insurance Assistance, and Additional Services.
- **News post**: title, dateline as written, language, body, photos, source file.
- **Named organisation**: name, relation as the site states it (agreement, partnership, conference), official logo.
- **Leader**: name, role, biography as written, photo.
- **Design slot**: purpose, page, pixel size, format, safe area, status (waiting for Reham, delivered).

## Success Criteria

### Phase A

- **SC-A1**: All 14 verified defects are fixed or carry a recorded decision within one week of SSH access.
- **SC-A2**: A news post goes from the folder to live in four languages within one working day of its photos arriving.
- **SC-A3**: Zero pages lost from Google's index during Phase A.

### Phase B

- **SC-B1**: A first-time visitor can say what TMASI does within 5 seconds of the home loading, on phone and desktop.
- **SC-B2**: Call or quote is reachable in one tap from every page.
- **SC-B3**: Mobile performance of 85 or more on the home, measured the same way as the baseline.
- **SC-B4**: Every page has the right language signals, and the sitemap has zero errors in Search Console.
- **SC-B5**: TMASI is named for at least 3 of the baseline AI prompts within 3 months of launch.
- **SC-B6**: Calls and quote requests are counted from launch, per language.

## Assumptions

- SSH is live once the local key's passphrase is removed. The server already accepts the key [verified 2026-09-26].
- tmasi.net stays on its current GoDaddy hosting. v3 is uploaded there as plain files, as with 24/7 v3.
- Pulse Marketing may still hold the analytics accounts; tags change only after access arrives.
- The four existing news posts stay, with their real dates.
- Mohamed has permission to use Big Noodle Titling on the web [stated 2026-09-26]. Raw font files stay out of the public repo.
