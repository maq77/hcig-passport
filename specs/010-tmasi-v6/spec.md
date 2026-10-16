# Feature Specification: TMASI v6, the final tmasi.net website

**Feature Branch**: `010-tmasi-v6`

**Created**: 2026-10-07

**Status**: approved
**Approved**: 2026-10-07 by Mohamed ("Approved, go"). Same day he chose to cut the hero film himself and send the finished file.

**Supersedes**: `specs/009-tmasi-v4` (the 3D globe home). On approval, 009 is marked "closed, replaced by v6".

**Decision doc**: "TMASI v6: The Final Website", https://claude.ai/code/artifact/5797a7b6-f47e-4510-b955-5f1845fbf463

**Input**: His words, 2026-10-07: "what do you recommend doing , v4 or v5, to just focus on one ... we want professonal
website not chilidish ... the whole idea of website to show our busness and services and show us , and be real , not
animated". Then: "make v6 final , should be the best professional and have our business needs. and showing what we offer
and our services correctly." And: "remeber , Medical + tourism + vacation , equal medical tourism ." His v5 vision of
2026-10-04 (kept word for word in memory): the site shows one business, guests and patients who want a holiday and
medical care at the same time, in luxurious hotels, with world-class healthcare.

## Why

TMASI's business is medical tourism: medical + tourism + vacation, handled by one team. v3 rebuilt the whole site
cleanly (84 pages, four languages, every word from the live site), but its home still reads as a list of assistance
services: the one business does not show at first sight, there is no film, and the real photos of TMASI at
international events sit inside news posts. v4 (a 3D globe) and v5 (generated film plus three.js) each answered part of
this and both drifted toward animation. v6 is the final site: v3's pages, v5's message, real photos and photoreal film,
professional and calm, every service named correctly.

## Decisions taken with Mohamed (2026-10-07)

| Topic | Decision |
|---|---|
| One site | v6 is the one final site. v4 is closed; v5's message lives on in v6 without its three.js layer |
| Base | v6 starts from v3's pages, words, languages, SEO and approved sections |
| Address | **Its own new preview URL, `/tmasi/v6`** ("make new url"). v3 stays online, untouched, at `/tmasi/v3` as the fallback until v6 goes live |
| Message | **Medical + tourism + vacation = medical tourism.** Shown through the site's own headline: "Your Trusted Partner in Global Medical, Travel, and Tourism Assistance." No new slogan |
| Look | Professional and real: real photos and photoreal film. No 3D globe, no three.js, no cartoon graphics, no motion for show |
| Hero | **One film, full width**, muted, 20 to 30 seconds, cut from his three films. **He cuts it himself** and sends the finished file. "Watch film" opens the Kling commercial with sound |
| Numbers | A strip right under the hero: 30,000+ Cases Handled, 570+ Medical Repatriations, 24/7 Operational Desk, 5 Global Hubs |
| Journey | The Relax words, then the five Medical Tourism Services items in the site's order, each with a real photo; the 10 s Red Sea hotel clip as a quiet loop |
| Services | All six groups, every item, named exactly as the site names them. Medical Tourism first, the five assistance groups right after |
| Proof | His real event photos (ITIC Global, Uniglobal, the Egypt Healthcare Authority signing, Hansa Medica) shown large in News, with the partner logos |
| Hubs map | The whole-world map he picked. **Planes fly in once when the map is seen, then the routes rest** |
| Group mention | **Not yet.** No Healthcare International Group line beyond what v3 already has |
| Claims | No "accredited". AI-made people are never presented as real TMASI staff, doctors, patients or testimonials |
| Order of work | Spec, then the design canvas (desktop and phone, films playing), then the home, then inner pages, then go-live |
| Standing rules | Canvas before code. Words kept exactly. Nothing pushed without his yes (push gate of 2026-09-29). Never a still taken from a video. No em dashes |

## Word sources

Every visible sentence comes from v3's words, unchanged: the live tmasi.net text per language plus the labels he approved
in v3 ("Global Operational Hubs", "Quick Links", "View Details", "View All News", the stat labels, "Ready to partner with
TMASI Global?" and its band, "Guests from anywhere", "Medical care and a holiday, anywhere in the world"). Order and look
are free. Any new heading, label, caption or alt text that says something needs his yes on the canvas first.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A visitor sees the one business at first sight (Priority: P1)

A guest in Germany or a buyer at an insurer opens the home. Before scrolling they read the headline, see a calm real
film of the journey (the flight, the Red Sea, a doctor with a patient), see the four numbers, and can press Request A
Quote or CALL THE TEAM.

**Why this priority**: This is the whole point of v6: medical + tourism + vacation, understood in seconds.

**Independent Test**: Load the home on desktop and phone; the headline, both buttons and the film are visible without
scrolling; the numbers sit directly below.

**Acceptance Scenarios**:

1. **Given** a desktop or phone visitor, **When** the page loads, **Then** the headline and both buttons are readable
   before the film starts, and the film plays muted without a black flash or a play icon.
2. **Given** the hero, **When** the visitor presses Watch film, **Then** the Kling commercial opens full screen with
   sound and closes back to the same place.
3. **Given** reduced motion, Data Saver, or a film that cannot play, **Then** a designed poster image shows in the same
   frame, never a frame taken from the film.

---

### User Story 2 - A visitor finds every service, named correctly (Priority: P1)

The visitor scrolls to Our Services and finds all six groups with every item the site lists, Medical Tourism first,
each opening its own page.

**Why this priority**: "showing what we offer and our services correctly" is his explicit ask.

**Independent Test**: Compare the services section and the six service pages against the live site's service words;
every group and item is present, spelled exactly, and each View Details opens the right page.

**Acceptance Scenarios**:

1. **Given** the home, **When** the visitor reaches Our Services, **Then** six groups and every item appear, Medical
   Tourism Services first.
2. **Given** a service card, **When** View Details is pressed, **Then** that group's page opens in the same language.

---

### User Story 3 - A visitor reaches TMASI in one step (Priority: P1)

From the header, the hero, the quote section and the partner band, Request A Quote opens the quote form and CALL THE
TEAM opens WhatsApp (+20 120 678 8566), as in v3.

**Why this priority**: Enquiries are the business result.

**Independent Test**: From each section on desktop and phone, reach the form or WhatsApp in one tap.

**Acceptance Scenarios**:

1. **Given** any section, **When** the visitor wants to act, **Then** one tap reaches the form or WhatsApp.
2. **Given** a sent form, **Then** the same fields go to the same destination as v3, and the site's own success words show.

---

### User Story 4 - A visitor sees how a medical tourism trip works (Priority: P2)

Under the numbers, the journey section shows "TMASI Global: Where RELAX & ENJOY Is All You Need to Do." and its
paragraph, then the five Medical Tourism parts (Comprehensive Healthcare Packages, Top Medical Destinations,
Personalized Travel Arrangements, Dedicated Coordinators, Luxury and Comfort Options), each with a real photo, and the
Red Sea hotel clip as a quiet loop.

**Why this priority**: It turns the equation into something a guest can picture.

**Independent Test**: The section shows the site's words only, in the site's order, with one photo per part.

**Acceptance Scenarios**:

1. **Given** the journey section, **Then** its words match the live site exactly and no part is numbered as a step.
2. **Given** a phone, **Then** the five parts read as a swipe row with the same photos.

---

### User Story 5 - A partner trusts TMASI (Priority: P2)

An insurer or assistance company sees the numbers, the real photos of TMASI at ITIC Global, Uniglobal, the Egypt
Healthcare Authority signing and Hansa Medica, the partner logos in full colour, the five offices with phone and email,
and the hubs map.

**Why this priority**: B2B buyers decide on proof, and these are real.

**Independent Test**: Every photo in News and proof is a real event photo from the site's own posts; every logo links to
the post that names it; no claim appears that the site does not make.

**Acceptance Scenarios**:

1. **Given** News, **Then** the real event photos show large and each opens its post.
2. **Given** the hubs map comes on screen, **Then** the planes fly in once and the routes rest; with reduced motion the
   routes show at rest from the start.

---

### User Story 6 - The phone gets its own design (Priority: P2)

On a phone the same story is told for a small vertical screen: film on top, numbers, the journey as a swipe row,
services as cards, every action reachable with a thumb.

**Why this priority**: Most guests arrive on phones; he wants one idea, two designs.

**Independent Test**: At 360 to 430 px wide, no sideways scroll, every word present, the film fits without cutting the
headline.

**Acceptance Scenarios**:

1. **Given** a phone, **Then** the hero fits one screen with the headline, both buttons and the film.

---

### User Story 7 - Inner pages and languages follow the approved home (Priority: P3)

After he approves the home, the same design carries to every v3 page (services, the six service pages, about, contact,
offices, news) in English, German, Polish and Spanish.

**Why this priority**: The site goes live whole, never half.

**Independent Test**: Every v3 page exists in v6 in four languages with the same words and the new design.

**Acceptance Scenarios**:

1. **Given** any v3 page, **Then** its v6 version holds the same words in the same language.

### Edge Cases

- A film is slow, blocked (iPhone low power mode) or fails: the designed poster stays, no black flash, no play icon.
- The Watch film has speech: it gets captions.
- All three films are 720p: sharp on phones, soft full width on large screens. A 1080p export replaces them when he has
  one; until then he judges the full-width film on the canvas at a real desktop size.
- German and Polish words run longer: no headline or button breaks mid-phrase, nothing overflows.
- A real photo is missing for a journey part: a labelled design slot on the preview, never an invented picture.
- Sofia (the chat agent) is present: it never opens by itself and never covers the hero.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Every visible sentence MUST come from v3's words or a label he approved. A new label needs his yes first.
- **FR-002**: The home MUST present medical + tourism + vacation as one business through the site's own headline, the
  film, the numbers and the journey, in that order at the top of the page.
- **FR-003**: The hero MUST show one muted, full-width film of 20 to 30 seconds cut from his three films, and a Watch
  film control that opens the Kling commercial full screen with sound.
- **FR-004**: No still image taken from any video MAY appear anywhere; posters MUST be designed images.
- **FR-005**: A numbers strip MUST sit directly under the hero with the four figures exactly as the site states them.
- **FR-006**: The journey MUST use the Relax words and the five Medical Tourism items in the site's order, unnumbered,
  each with a real photo.
- **FR-007**: Our Services MUST show all six groups and every item, spelled exactly, Medical Tourism first, each linked
  to its group page.
- **FR-008**: News MUST show his real event photos large, and the partner logos (Egypt Healthcare Authority, Hansa
  Medica, ITIC Global, Uniglobal) MUST appear in full colour, each linked to the post that names it.
- **FR-009**: The hubs map MUST show the five offices with phone and email; its planes MUST fly in once when the map is
  seen and then rest; with reduced motion the routes MUST show at rest.
- **FR-010**: Request A Quote and CALL THE TEAM MUST appear with equal weight in the header, hero and partner band, and
  MUST behave as in v3 (form to the same destination; WhatsApp +20 120 678 8566).
- **FR-011**: The site MUST NOT use a 3D globe, a 3D scene, cartoon graphics or motion that runs without purpose.
- **FR-012**: The word "accredited" MUST NOT appear unless TMASI supplies a certificate in its own name.
- **FR-013**: People generated with AI MUST NOT be presented as real TMASI staff, doctors, patients or testimonials, and
  the film MUST carry a short "made with AI" credit in wording he approves.
- **FR-014**: No Healthcare International Group mention MAY be added beyond what v3 already shows, until he says so.
- **FR-015**: v6 MUST live at its own preview URL `/tmasi/v6`, out of search (noindex), and MUST leave v3 at `/tmasi/v3`
  unchanged.
- **FR-016**: The phone MUST get its own composition of the same order, with no sideways scroll from 360 px up.
- **FR-017**: Inner pages MUST follow the approved home, in English, German, Polish and Spanish, keeping every v3 page.
- **FR-018**: Every design MUST be approved on the design canvas before it is built.
- **FR-019**: Going live on tmasi.net MUST wait for his explicit yes and Irina's approval; every change MUST be logged in
  `docs/tmasi-worklog.md`.

### Key Entities

- **Film**: a video file with its purpose (hero cut or Watch film), length, resolution, sound or muted, its designed
  poster, and its "made with AI" credit.
- **Service group**: name, items, its page, its photo.
- **Journey part**: one Medical Tourism item, its photo.
- **Proof item**: a real event photo, the post it belongs to, the partner it names.
- **Office**: name, city, address, phone, email (from the site's footer).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of sentences on v6 match v3's words or an approved label (the word check passes in every language).
- **SC-002**: In a five-second look at the home, he and two people unfamiliar with TMASI can say it offers medical care,
  travel and a holiday together.
- **SC-003**: All six service groups and every item are present and spelled exactly on the home and their pages.
- **SC-004**: From any section, the quote form or WhatsApp is one tap away, on desktop and phone.
- **SC-005**: The headline and buttons are readable within 2.5 seconds on a mid-range phone on 4G and within 1 second on
  desktop broadband; the film never delays them.
- **SC-006**: Zero invented facts, logos, people presented as real, or claims; zero stills taken from video.
- **SC-007**: No sideways scroll at 360, 390, 768, 1024, 1440 and 1920 px; text contrast meets WCAG AA.
- **SC-008**: He approves the home on the preview at desktop and phone width, then Irina approves the site.

## Assumptions

- The three films he sent are the film material for now: the Kling commercial (2 min 22 s), the Veo clip of the jet
  around the globe ending with a doctor and a patient (30 s), and the Veo clip of a guest by the Red Sea (10 s). More shots
  come only if he makes them, from the prompt library in the v5 plan doc.
- He cuts the hero film himself and sends the finished file. Until it arrives, the canvas shows the 10 s Red Sea clip
  in the hero frame, labelled as a stand-in.
- The journey and News photos come from what the site and v3 already hold (the bento set, the service photos, the real
  event photos); gaps get labelled design slots for Reham.
- v3 keeps receiving fixes while v6 is built; approved v3 changes are carried into v6 before go-live.
- The film credit and the AI-people rule follow the EU AI Act transparency rules for AI-generated video (Article 50,
  due to apply from August 2026); legal confirms the wording.

## Out of scope

- A 3D globe, three.js, 3D icons, and the v4 canvas looks (archived).
- Any Healthcare International Group content beyond v3's current line (until he says so).
- New articles, keyword research and new languages beyond EN, DE, PL, ES (later specs).
- Changes to v3 itself and to the live tmasi.net before go-live.
