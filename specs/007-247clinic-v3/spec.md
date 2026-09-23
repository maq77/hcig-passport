# Feature Specification: 24/7 Clinic v3

**Feature Branch**: `007-247clinic-v3`

**Created**: 2026-09-23

**Status**: approved
**Approved**: 2026-09-23 by the user ("spec approved"), with four changes folded in below

**Input**: User description: "build 247 v3, make full plan in everything." A from-scratch, fully bespoke, premium website for 247clinic.net, previewed at /247clinic/v3 on HCIG Work, later uploaded to their own server. Content word for word from WEBSITE.docx. Home first, then everything else on the home's approved patterns.

## Why

247clinic.net does not say what 24/7 Clinic is. A guest who feels ill in a Red Sea
resort should understand in five seconds that there is a clinic inside their hotel,
that it works with their travel insurance, and that WhatsApp reaches a doctor now.

v2 (`/247clinic/website-preview`) answers the brief inside the operator's old layout
and stays as the fallback. v3 is the user's deliberate step beyond it: the same words,
in a design that feels like a premium resort and converts like a medical service.

The client brief (section 2) asked for no complete redesign. v3 is one, by the user's
choice. It is shown next to v2, not instead of it, so both answers reach the review.

## Decisions taken with the user (2026-09-23)

| Topic | Decision |
|---|---|
| Content | Strict. WEBSITE.docx word for word. Design, structure, motion and imagery are ours. No sentence added, cut or reworded until the user says so. |
| Order of work | **Home first**, most effort. The user reviews it and lists what lacks. Then the patterns learned on the home carry every other page. |
| Hotel pages | **All 30 hotels** from their own clinic data, each with its own data. Built after the home is approved, on the home's patterns. |
| URLs | Keep every live URL that already ranks. New pages use the brief's URLs. Hotels at `/clinics/{destination}/{hotel}` (brief section 20). |
| Hosting | Built here, uploaded as plain files over FTP to their current server. Nothing runs on the server. Verified: their host serves static files. |
| Hero | Full-bleed cinematic film, headline on a white frosted panel. The best components from 21st.dev. "Most important it feels good." |
| Phone and WhatsApp | **+20 122 222 8247** for every call and WhatsApp button. |
| Numbers | **20 years, 30 clinics, 300 staff.** Shown. |
| Insurers | The clinic bills all travel insurers. Show insurer logos: the Medcierge set first, then any other insurer and assistance company, sourced online. Cashless wording stays conditional, as the brief itself requires. |
| Patient films | Used freely. |
| Headline font | Calisto MT, licensed files supplied by the user. |
| Photos | Pexels and Gemini for supporting images. **Visible design slots** wherever a dedicated design is needed (service cards first). The user supplies those designs and clinic photos later. |
| Languages | English first. The structure for German, Polish and Czech is built in; translations follow English approval. |
| Design system | `brand guideline/design-md/clinic247/DESIGN.md`, rewritten for v3 on 2026-09-23. |
| Button colours (at approval) | **All WhatsApp buttons green, all call and emergency buttons red.** |
| Floating WhatsApp (at approval) | Copied from the Medcierge float: green pill on desktop, green circle with a speech bubble on phones, cycling the brief's own phrases. It is also the mobile sticky CTA. |
| Hero film (at approval) | The first 14 seconds of the Le Rêve commercial. |
| Calisto MT (at approval) | Supplied as TTF in `247 material/`. The raw files stay out of git; the build ships a Latin web subset. |

## User Scenarios & Testing

### User Story 1 - An unwell guest reaches a doctor in one tap (Priority: P1)

A tourist feels ill in their resort at night. They open the site on a phone. The
first screen tells them there is urgent care inside hotels like theirs, and a green
WhatsApp button opens a chat with a message already written.

**Why this priority**: It is the brief's one conversion goal: visitor, WhatsApp,
coordination, clinic visit. Everything else supports it.

**Independent Test**: Open the home at 375 x 667 on a phone, with and without
JavaScript. Read the first screen. Tap WhatsApp.

**Acceptance Scenarios**:

1. **Given** a phone at 375 x 667, **When** the home loads, **Then** the h1, the brief's supporting line and the WhatsApp button are visible without scrolling.
2. **Given** any page and any scroll position, **When** the guest wants help, **Then** a WhatsApp action is on screen (header and floating button on desktop, floating button on phone).
3. **Given** the guest taps WhatsApp on the home, **Then** WhatsApp opens to +20 122 222 8247 with the brief's homepage message pre-filled.
4. **Given** JavaScript is off or reduced motion is on, **Then** every word and every action is still present and usable.

---

### User Story 2 - A guest with travel insurance checks cashless care (Priority: P1)

A guest worries about paying. The insurance section says, in the brief's words,
that the clinic works with international insurers and can arrange cashless
treatment where the insurer approves. They see the logos of insurers they know
and send their details on WhatsApp.

**Why this priority**: The brief calls it one of the strongest conversion blocks.

**Independent Test**: Scroll to the insurance section, read it, tap "Check Your
Insurance on WhatsApp".

**Acceptance Scenarios**:

1. **Given** the insurance section, **Then** cashless care is only ever described with the brief's conditional wording.
2. **When** the guest taps the insurance WhatsApp button, **Then** the brief's insurance message is pre-filled.
3. **Given** the insurer logo row, **Then** it moves slowly, pauses on hover and focus, and becomes a still grid under reduced motion.

---

### User Story 3 - The user reviews the home and marks what to change (Priority: P1)

The user opens the preview on HCIG Work, on desktop and phone. The page reads as
live. Wherever a dedicated design belongs, a neat labelled slot tells him what to
make and at what size. He sends back what lacks and what to improve.

**Why this priority**: His approval of the home is the gate for every other page.

**Independent Test**: Open the preview link, check both widths, count the design
slots against the slots document.

**Acceptance Scenarios**:

1. **Given** the preview URL, **Then** it loads, is not indexable, and is listed in HCIG Work under 24/7 Clinic.
2. **Given** each design slot on the page, **Then** it names its purpose and size, and appears in the slots document.
3. **Given** his change list, **Then** each item is applied or answered before inner pages start.

---

### User Story 4 - A guest finds the clinic in their hotel or town (Priority: P2)

A guest searches "doctor Hurghada" or their hotel name, lands on the destination or
hotel page, sees whether their hotel has a clinic, where it is, and taps WhatsApp
with their hotel already named in the message.

**Why this priority**: The brief's phase 3 SEO expansion. It depends on the home's
patterns being approved first.

**Independent Test**: Open one destination page and one hotel page. Check map,
directions, services, insurance and the pre-filled message.

**Acceptance Scenarios**:

1. **Given** a hotel page, **Then** the h1 is "Medical Clinic at [Hotel Name]" and the WhatsApp message names that hotel.
2. **Given** Find a Clinic, **When** the guest filters by destination or hotel, **Then** only active clinics appear.
3. **Given** a destination with no clinic (Makadi Bay today), **Then** it is not listed.

---

### User Story 5 - A hotel or insurer asks about a partnership (Priority: P3)

A hotel manager or an insurer's case handler reaches For Hotels or For Insurance
and Assistance Companies from the nav or footer and starts a conversation.

**Why this priority**: B2B matters, but the brief says it must not dominate the
guest-facing home.

**Independent Test**: From the home, reach each B2B page in two clicks and use
its contact action.

**Acceptance Scenarios**:

1. **Given** a B2B page, **Then** its call to action is the brief's own ("Discuss a Hotel Medical Partnership", "Partner With 24/7 Clinic").

---

### User Story 6 - Search engines and AI tools understand and cite the site (Priority: P3)

Google, ChatGPT, Gemini and Perplexity can read every page as plain text and
describe 24/7 Clinic correctly.

**Acceptance Scenarios**:

1. **Given** any page with scripts disabled, **Then** all content is in the delivered page.
2. **Given** a page's structured data, **Then** it matches the visible content and carries no ratings.

### Edge Cases

- A guest on a slow connection: words and actions appear before any film.
- A guest with reduced motion: no autoplay, no marquee, no reveals.
- WhatsApp not installed: the link opens WhatsApp Web; the call button stays next to it.
- A design slot whose design never arrives: the page still reads as finished around it.
- Their hotel is not in the clinic list: the brief's own answer applies ("What if my hotel does not have a 24/7 Clinic?").
- A German or Polish heading 30% longer: no overflow at 375px.
- A brief line that a layout seems to need is missing: the gap is reported, never written.

## Requirements

### Functional Requirements

**Content**
- **FR-001**: Every visible sentence MUST come word for word from WEBSITE.docx. Our own words are limited to a registered list of interface labels (eyebrows, "Watch", "Close", menu, language names) that make no claim.
- **FR-002**: Any text not in the brief and not in the label list MUST fail the build.
- **FR-003**: Gaps (a page needing a line the brief lacks) MUST be listed in a gaps document, never filled.

**Conversion**
- **FR-004**: WhatsApp MUST appear in the header, as the floating action copied from Medcierge (all widths; on phones it is the sticky CTA), after each major section, on every clinic page, and on the insurance and contact pages (brief section 5).
- **FR-005**: Each WhatsApp link MUST carry the brief's pre-filled message for its page (home, insurance, hotel, destination, general).
- **FR-006**: Call buttons MUST dial +20 122 222 8247.
- **FR-006a**: Every WhatsApp button MUST be green; every call and emergency button MUST be red.

**Home (phase A)**
- **FR-007**: The home MUST carry, in this order: hero, accreditation, what is 24/7 Clinic, why a hotel clinic, what we can treat on-site, insurance and cashless (with insurer logos), how it works, what our patients say (films and reviews), hotel logos, find a clinic with the numbers and a map, final call to action.
- **FR-008**: The hero MUST be a full-bleed silent film loop with the headline on a white frosted panel, a pause control, and a still (design slot) for reduced motion and before the film plays. No still may be taken from any film. The panel MUST carry all of brief section 6: the h1, the paragraph, the supporting line, "WhatsApp Us 24/7", "Find Your Clinic", and the trust statement "Internationally Accredited Urgent Care Network".
- **FR-008a**: The "what is 24/7 Clinic" section MUST show the brief's optional highlighted line "Hospital care when necessary - not automatically." as a pull line.
- **FR-009**: The numbers MUST read 20 years, 30 clinics, 300 staff, and be present without JavaScript. Years and clinics use the brief's own category names ("Years of Healthcare Experience", "Hotel & Resort Clinics"); the staff label comes from the user's stated fact. "International Patients Assisted" and "Insurance & Assistance Partners" stay off until a confirmed number exists (listed in gaps).
- **FR-010**: Accreditation MUST use the brief's UCA sentence. GHA and the German Medical Wellness Association MUST be labelled "Official Partner of", never "accredited".
- **FR-011**: Insurer logos MUST include the Medcierge insurer set plus other insurers and assistance companies, each from an official source, with the source recorded.
- **FR-012**: Hotel logos MUST show only hotel brands where a clinic operates in their clinic data.

**Design and motion**
- **FR-013**: The site MUST follow the v3 DESIGN.md: light only, red for actions, Calisto MT headings, Poppins body.
- **FR-014**: Design slots MUST be visible, labelled with purpose and size, and listed in a slots document.
- **FR-015**: All content MUST be visible with JavaScript off. Motion only enhances.
- **FR-016**: Reduced motion MUST switch off autoplay, marquees, reveals and count-ups.

**Pages after the home (phases B and C)**
- **FR-017**: Inner pages MUST cover the brief's sections 17 to 29: medical services, insurance and cashless care, find a clinic, hotel clinics, accreditation, for hotels, for insurers, about, contact, FAQ, beauty and wellness.
- **FR-018**: Destination pages MUST exist for each active destination only.
- **FR-019**: A hotel page MUST exist for each of the 30 hotels in their clinic data, with its own name, destination, map, directions and pre-filled message. Facts not held (hours, per-clinic services) go to the gaps document.
- **FR-020**: Existing live URLs that rank MUST be kept. New pages MUST use the brief's URLs. The URL structure MUST allow `/de/`, `/pl/`, `/cs/` later without moving English pages.

**Search, measurement, hosting**
- **FR-021**: The preview MUST be noindex. The live build MUST carry canonical, unique titles and descriptions, a sitemap, robots rules and llms.txt.
- **FR-022**: Structured data MUST cover MedicalClinic, Organization, BreadcrumbList and FAQPage (matching the visible FAQ), with no ratings or review scores.
- **FR-023**: The brief's conversion events MUST fire (whatsapp_medical_click, whatsapp_insurance_click, clinic_view, clinic_directions_click, phone_click, b2b_form_submit) into our first-party tracker now, and GA4 once a property exists.
- **FR-024**: The whole site MUST run as plain files on their current server, with no program running on it, uploadable over FTP, with clean URLs, a real 404 page and a redirect map.
- **FR-025**: The contact page MUST keep a general and business enquiry form below the urgent WhatsApp block (brief section 27). In the preview it hands the enquiry to WhatsApp or email. Before go-live it MUST deliver each enquiry to the clinic's inbox; the delivery route is chosen in phase 8 (a hosted form service needs no program on their server).

### Key Entities

- **Clinic**: a hotel with a 24/7 Clinic. Hotel name, destination, coordinates, hours (where known), services, pre-filled message. 30 today, from their own clinic data.
- **Destination**: a coastal area with at least one active clinic. Hurghada, Sahl Hasheesh, Soma Bay (with Abu Soma), Marsa Alam, El Quseir, North Coast.
- **Service**: one of the brief's six on-site services, plus dental and beauty and wellness as secondary.
- **Logo**: an insurer, assistance company, hotel brand or accreditation body, with its source and its exact wording.
- **Film**: a clinic, staff or patient film, used as video only.
- **Design slot**: a place where the user's dedicated design goes, with purpose and size.

## Success Criteria

### Measurable Outcomes

- **SC-001**: On a 375 x 667 phone, the h1, the supporting line and the WhatsApp button are all visible in the first screen of the home.
- **SC-002**: From any scroll position on any page, WhatsApp is one tap away.
- **SC-003**: 0 visible sentences fail the word-for-word check against the brief.
- **SC-004**: Mobile home: largest content shown in under 2.5 s on a mid-range phone on 4G, layout shift under 0.1, first-screen weight under 1.5 MB before the film starts.
- **SC-005**: 0 serious or critical accessibility issues in an automated scan; all text meets AA contrast; every tap target is at least 44 px.
- **SC-006**: 100% of content readable with JavaScript off and with reduced motion on.
- **SC-007**: The user approves the home, with every item of his change list closed, before inner pages start.
- **SC-008**: After phase C: 0 broken links, 0 duplicate titles, every page answers 200 and a wrong URL answers 404.
- **SC-009**: Uploaded to their server as files, the site works with nothing installed on the server.

## Assumptions

- Meta titles and descriptions are not in the brief. Default: the page's own h1 plus "| 24/7 Clinic" as the title, and the page's own opening sentence from the brief as the description. Words stay his.
- The Le Rêve commercial is the hero film. The loop is its first 14 seconds (the user, at approval).
- The B2B form in the preview hands the enquiry to WhatsApp or email. A real form endpoint is decided at go-live (no program runs on their server).
- Calisto MT arrived at approval (TTF). Headings fall back to Book Antiqua, Palatino, Georgia only while the font loads.
- Written reviews come from their current site, quoted exactly, names as published.
- The destination for each of the 30 clinics is derived from their own coordinates (their data leaves it empty).
- Premier Le Rêve's stored coordinates are wrong by 7 km; the checked position is used.
- Going live on 247clinic.net needs a separate yes, and replaces their current app, which the user decides after approval.

## Out of scope for this spec

- Translations into German, Polish and Czech (structure only).
- The blog (brief section 30 says not a priority).
- Google Business Profile work and off-site SEO.
- The live cutover on 247clinic.net.

## What the user still sends (not blocking the build)

1. ~~Calisto MT web font files~~ received 2026-09-23.
2. Dedicated designs for each design slot, starting with the six service cards and the hero still.
3. Clinic photos when available.
4. ~~The hero stretch~~ settled: first 14 seconds.
5. When it exists: the GA4 measurement ID for 247clinic.net.
6. From Irina, before go-live: the CAUCQ mark and permitted accreditation logos.
