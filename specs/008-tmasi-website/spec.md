# Feature Specification: TMASI Global website (urgent edits, then v3)

**Feature Branch**: `008-tmasi-website`

**Created**: 2026-09-26

**Status**: draft

**Input**: User description: "ssh for tmasi, add it to tmasi, it is one of the group of healthcare international group. We will make many edits and updates and redesigning and refactoring and optimization and ui and ux pro max and seo and AEO. First we will make few urgent edits, like text centering and adding new news. Then we will make full refactoring and designing of tmasi and optimization of performance and seo and aeo, a complete remaking like we did in medcierge and 247 v3." The Medcierge rebuild prompt of 2026-09-15 is the planning brief for Phase B.

## Why

tmasi.net does not say, in five seconds, what TMASI Global does or who should call.
It mixes insurers, hotels, travellers and medical tourists on one long page of
paragraphs. An insurer's case manager, a hotel manager and a traveller in trouble
all have to read too much to find their one action.

TMASI is the group's global-facing brand ("Care Without Borders"), with offices in
Egypt, Germany, Spain, the UAE and the USA. Its site should win partner trust in
seconds and turn visits into calls, WhatsApp chats and quote requests.

## Two phases

| Phase | What | Where it ships | Spec gate |
|---|---|---|---|
| **A. Urgent edits** | Text alignment, new news posts, invisible technical fixes on the current site | Live site, file by file, backed up first | None. A few tickets, no spec needed |
| **B. TMASI v3** | A from-scratch rebuild: content, structure, design, SEO, AI visibility | HCIG Work preview first, then their hosting after approval | This spec, once approved |

Phase A never waits on Phase B. Phase B never ships until the user approves the preview.

## The current site, verified 2026-09-26

**Stack.** Hand-written PHP pages on GoDaddy cPanel (Apache, PHP 8.1). Built by Pulse
Marketing. A JotForm AI chat ("Sofia"). Google tag, Tag Manager and Yandex Metrica.

**Pages.** 25 URLs in the sitemap: home, about, services, contact, blog, two leadership
pages (CEO Dr. Amr Abbass, CSO Dr. Ahmed Nouh), in EN, DE, PL and ES. Four news posts,
English and Spanish only, newest 11 Nov 2025.

**Defects found, all checked on the live site:**

| # | Defect | Effect |
|---|---|---|
| 1 | `www.tmasi.net` answers 200 instead of redirecting | Two copies of every page compete |
| 2 | No canonical and no hreflang on any page | Google cannot tell the four languages apart |
| 3 | Every page says `lang="en"`, German, Polish and Spanish included | Wrong language signal |
| 4 | Polish home, Polish about and Spanish about carry German titles | Wrong title in Polish and Spanish results |
| 5 | `/pl/uslugi/` is in the sitemap and returns 404 | Crawl error |
| 6 | Sitemap uses the wrong namespace (`https://www.sitemaps.org`) | Google may reject the whole file |
| 7 | News posts and the Spanish blog are missing from the sitemap | Slower discovery |
| 8 | Most pages have no H1 | Weaker page topic signal |
| 9 | The Google tag loads twice | Double page views, slower load |
| 10 | On a phone the JotForm chat opens by itself and covers the whole screen | The visitor sees a chat, not TMASI |
| 11 | Text alignment is mixed: hero left, headings centred, lists left | Looks unfinished |
| 12 | German and Polish blogs 404; leadership pages are English in every language | Half-translated site |

**Content on the live site that v3 must treat carefully:**
- "30,000+ cases in the past three years" and "570+ repatriations". Shown today, never confirmed with us.
- TMASI lists "Elite Medical Concierge Services" (doctor on call to hotels). That is also Medcierge's whole offer, and both use +20 120 678 8566.

## User Scenarios & Testing

### User Story 1 - An insurer's case manager finds a partner in Egypt (Priority: P1)

A case manager at a European travel insurer needs a medical assistance partner for
a policyholder in Hurghada. They land on tmasi.net from a search or a conference
contact. In seconds they see what TMASI handles (emergency assistance, evacuation,
case management, direct billing), where it operates, and how to reach the 24/7 team.

**Why this priority**: Insurers and assistance companies send the cases. The news
posts (ITIC Venice, Uniglobal Barcelona, the Egypt Healthcare Authority agreement)
show this is the audience TMASI courts.

**Independent Test**: Open the home on a laptop. Within the first screen, name what
TMASI does and find the partner contact. Reach it in one click.

**Acceptance Scenarios**:

1. **Given** the home on a 1440 px screen, **When** it loads, **Then** the headline, one supporting line and the partner action are visible without scrolling.
2. **Given** any page, **When** the case manager wants the operations line, **Then** a call action and a WhatsApp action are one tap away.
3. **Given** a partner page, **Then** services read as a short scannable list, never paragraphs.

---

### User Story 2 - A traveller in trouble gets help now (Priority: P1)

A tourist, or their family at home, needs help after an accident abroad. They open
the site on a phone. The first screen says TMASI helps travellers 24/7 and offers
one tap to call or WhatsApp.

**Why this priority**: It is the moment of highest intent, and today the chat
covers the phone screen at exactly that moment.

**Independent Test**: Open the home at 375 x 667. Find call and WhatsApp without
scrolling or closing anything.

**Acceptance Scenarios**:

1. **Given** a phone at 375 x 667, **When** the home loads, **Then** nothing covers the first screen.
2. **Given** any scroll position, **Then** a WhatsApp action is on screen.
3. **Given** JavaScript is off or reduced motion is on, **Then** every word and every action still works.

---

### User Story 3 - A news post goes live the same day (Priority: P1, Phase A)

TMASI attends a conference or signs an agreement. The user sends the text and photos.
The post appears on the blog, in the right languages, dated correctly, newest first,
and listed in the sitemap.

**Why this priority**: The user named it as one of the two urgent edits.

**Independent Test**: Add one post. Check the blog list order, the post page, its
date, its title in search results, and its sitemap entry.

**Acceptance Scenarios**:

1. **Given** a new post, **Then** it sits first on the blog list with its real date.
2. **Given** the post page, **Then** it has one H1, a unique title and description, and a canonical.
3. **Given** the sitemap, **Then** the post is listed within the same deploy.

---

### User Story 4 - The user reviews v3 before anyone else sees it (Priority: P1, Phase B)

The user opens the v3 preview on HCIG Work on desktop and phone. It reads as a live
site. They send notes in rounds. Only after their approval does it go to Irina and
then to tmasi.net.

**Independent Test**: Open the preview link. It loads, is not indexable, and is listed
in HCIG Work under TMASI.

**Acceptance Scenarios**:

1. **Given** the preview URL, **Then** it sends noindex and is listed in HCIG Work.
2. **Given** a round of notes, **Then** each note is applied or answered before the next round.

---

### User Story 5 - Search engines and AI tools name TMASI (Priority: P2, Phase B)

Someone asks ChatGPT, Gemini or Google for "medical assistance company Egypt" or
"repatriation from Egypt", in English or German. TMASI appears and is described
correctly.

**Independent Test**: A fixed set of prompts and searches, run before launch and
monthly after, records whether TMASI is named and which page is cited.

**Acceptance Scenarios**:

1. **Given** the baseline run, **Then** the result is recorded before v3 launches.
2. **Given** each v3 page, **Then** it carries structured data for the organisation, its offices and its services, and an answer a machine can quote.

---

### User Story 6 - A hotel or tour operator asks for a quote (Priority: P2)

A hotel manager or tour operator wants TMASI to cover their guests. They find the
partner offer, see who TMASI already works with, and send a short quote request.

**Independent Test**: Fill the quote form on a phone in under a minute. The team
receives it.

---

### Edge Cases

- A visitor lands on a German page from Google: everything around them, including the header, form and news, is German or clearly marked English.
- A claim (cases served, repatriations, partner names) has no source: it is left out, not softened.
- The JotForm chat must stay (a client decision): it may never open by itself over the first screen.
- The server edit fails half-way: the backup restores the page in one step.
- A news post arrives in English only: it is published in English and linked from the other blogs, never machine-translated without review.

## Requirements

### Phase A: urgent edits on the current site

- **FR-A01**: Every edited file MUST be backed up on the server before it changes.
- **FR-A02**: Text alignment MUST be consistent section by section, as the user specifies. [Which texts: waiting on the user]
- **FR-A03**: New news posts MUST use the existing post layout, real dates, newest first, and be added to the sitemap.
- **FR-A04**: Invisible fixes MAY ship without a review pack: www to apex redirect, canonical, hreflang, `lang` per language, sitemap namespace, the 404 removed from the sitemap, the Google tag loaded once, one H1 per page.
- **FR-A05**: Visible changes (titles, wording, the chat behaviour, colours) MUST go to the user first.
- **FR-A06**: Each fix MUST be checked on the rendered live page, not only in the file.

### Phase B: TMASI v3

- **FR-B01**: The rebuild MUST start from understanding, in this order: business, audience, keywords, competitors and AI baseline, system analysis, fact sheet, sitemap and content plan, partners. Each is a short document the user can read.
- **FR-B02**: Every fact on the site MUST come from the live site, the brand guideline, or the user. Nothing invented. Unconfirmed claims stay off until confirmed.
- **FR-B03**: The site MUST separate the partner voice (insurers, assistance companies, hotels, tour operators) from the traveller voice, as the brand guideline requires.
- **FR-B04**: Pages MUST be short and visual: a headline and one short note per block, only meaningful sections, no repeated message.
- **FR-B05**: The design MUST follow the TMASI brand guideline (teal leads, white ground, Montserrat), light surfaces only, the group rules for red call and green WhatsApp buttons, and the floating WhatsApp button used on Medcierge.
- **FR-B06**: The site MUST exist in the chosen languages with real per-language URLs, `lang`, hreflang and canonical. [NEEDS CLARIFICATION: languages for v3. Keep EN, DE, PL, ES as today, or change the set?]
- **FR-B07**: Every page MUST carry structured data and an answer a search engine or AI tool can quote. An `llms.txt` and per-language sitemaps MUST ship at launch.
- **FR-B08**: Partner and insurer logos MUST be official files, shown only for relationships the user confirms.
- **FR-B09**: The preview MUST live on HCIG Work, noindex, until the user and then Irina approve. Only then does it replace tmasi.net, with every old URL that ranks kept or redirected.
- **FR-B10**: Performance MUST be measured before and after: the live site's numbers are the baseline.
- **FR-B11**: The primary audience of the home page is [NEEDS CLARIFICATION: partners first (insurers, assistance companies, hotels), travellers first, or both side by side with a split at the top?]
- **FR-B12**: The wording mode is [NEEDS CLARIFICATION: rewrite freely from facts, like Medcierge, or keep the live site's wording and only cut, like 24/7 v3?]

### Key Entities

- **Office**: country, city, address, phone, email. Five today: Egypt, Germany, UAE, Spain, USA.
- **Service group**: medical assistance, medical concierge, travel assistance, medical tourism, insurance assistance.
- **News post**: title, date, language, body, photos, source event.
- **Partner**: name, type (insurer, assistance company, hotel, tour operator, authority), logo, confirmed or not.
- **Leader**: name, role, short biography, photo.

## Success Criteria

### Phase A

- **SC-A1**: All 12 verified defects are fixed or have a user decision recorded, within one week of SSH access.
- **SC-A2**: A new news post goes from the user's text to live in the same working day.
- **SC-A3**: Zero pages lost from Google's index during Phase A.

### Phase B

- **SC-B1**: A first-time visitor can say what TMASI does within 5 seconds of the home loading, on phone and desktop.
- **SC-B2**: Call, WhatsApp or quote is reachable in one tap from every page.
- **SC-B3**: Mobile performance of 85 or more on the home, measured the same way as the baseline.
- **SC-B4**: Every page has the right language signals, and the sitemap has zero errors in Search Console.
- **SC-B5**: TMASI is named for at least 3 of the baseline AI prompts within 3 months of launch.
- **SC-B6**: Calls, WhatsApp chats and quote requests are counted from launch, per language.

## Assumptions

- SSH is live once the local key's passphrase is removed. The server already accepts the key [verified 2026-09-26].
- tmasi.net stays on its current GoDaddy hosting. v3 is uploaded there as plain files, as with 24/7 v3.
- Pulse Marketing built the current site. We coordinate before changing anything they may still manage.
- BigNoodleTitling needs a licensed web file. Until one is supplied, headlines use Montserrat.
- The four existing news posts are kept, with their real dates.
- Real TMASI photos are preferred. Stock or generated images only fill a real gap and never stand in for a real person or office.
