# Feature Specification: TMASI v4 home, a 3D global-network remake

**Feature Branch**: `009-tmasi-v4`

**Created**: 2026-10-01

**Status**: approved
**Approved**: 2026-10-01 by Mohamed. **Amended** the same day after a Gemini review checked by Claude: six service groups (not five), USA office address and pin, partner band buttons, reachability, screen readers, words-first loading, weight budget, cookie consent noted for go-live. His approval: he answered the spec draft with "Yes, but wait i will continue later", then "continue", and asked for the plan to be made as complete as possible.

**Input**: User description (2026-10-01, close to his words): TMASI v4 "refactored and re made", "from scratch", "professionally". Hero: "a global and internation network earth that has our network germany and egypt and usa and spain and uae on it", 3D, with "good meaningful animations". "complete new materials images and videos and 3d designs". Inspiration from themes, real 3D components and 3D websites. Audience "mainly b2b"; show "we are international and global and one of the sharks". Texts stay exactly as the content writer wrote them, word for word, section by section. Everything else may be remade. Later the same day: "desktop gets a design and phone gets compatible design, same idea but diffrent representation ... i mean 3d support on phone".

## Why

TMASI sells to insurers, assistance companies, hotels, tour operators and corporations.
The home must show at first sight that TMASI is an international player with a real network,
using only what the site already states: offices in Egypt, Germany, Spain, UAE and USA;
30,000+ cases and 570+ repatriations in the past three years; 24/7 operations; decades of
experience; and the partners its news names. v3 rebuilt the site cleanly. v4 makes the home
spectacular and memorable for a B2B buyer while every word stays theirs.

## Decisions taken with Mohamed (2026-10-01, six question rounds)

| Topic | Decision |
|---|---|
| Words | The v3 English words as they are now: the live tmasi.net text plus the labels he approved in v3. Word for word, section by section |
| v3 and v4 | v4 is a new build with its own preview at `/tmasi/v4` on HCIG Work. v3 stays online, untouched, as the fallback |
| Scope | **The home only.** Inner pages get their own spec later |
| Language | **English only** for now |
| Theme | Hybrid: the TMASI brand guideline is the base, with a few creative moments that make the page spectacular. Claude proposes them; he picks |
| Globe look, globe motion, hero layout | He picks from **live, moving options on the design canvas**. His lead pick for the desktop hero: words left, globe right. All layouts are shown |
| Desktop and phone | **One idea, two designs.** Desktop gets its own design; the phone gets its own design of the same idea, built for a small vertical screen and touch. **Phones get real 3D**, lighter, never a video or a still in its place. The phone hero shown first: **"Globe on top, guided tour"** |
| Images | New generated images plus free stock. News cards keep each post's own picture |
| Video | A mix: one or two silent loops in bands, plus one film of 30 to 45 seconds behind a Watch button, cut from Veo clips he makes from Claude's shot prompts |
| 3D beyond the hero | A matching 3D icon set. Nothing decorative |
| Main actions | "Request A Quote" and "CALL THE TEAM" carry **equal weight**. CALL THE TEAM opens WhatsApp +20 120 678 8566, as in v3 |
| Partner logos | Official logos in full colour for the four organisations the site names, each linked to the news post that names it. He approves them on the canvas |
| Sofia chat | Kept on the right; it never opens by itself |
| Long text | Every word kept. Long paragraphs show their first lines and open in place |
| USA office card | Adds usa@tmasi.net from the site's contact page; the pin sits on Tampa (the contact page's address) |
| Language switch | Shown; German, Polish and Spanish open the v3 home in that language |
| Links beyond the home | Menu, footer, service, office and news links open the matching v3 page until the inner pages are rebuilt |
| Making media | Claude drives his Gemini in Chrome for the images (he downloads); he makes the Veo clips himself from Claude's prompts |
| 3D icons | A shoot-out on the canvas between three sources (generated in one style, a free CC0 library recoloured, built in our own 3D scene). The winner is what feels most human-made, real-world and meaningful to TMASI's business; one coherent look on the page |
| References | Claude gathers the best 3D globe sites, B2B network sites and real 3D components and shows the top six on the canvas. He can add links at any time |
| After the home | The approved home becomes the pattern. A new spec covers inner pages and DE, PL, ES. Go-live on tmasi.net only when the whole v4 site is ready and Irina approves |
| Standing rules | Design canvas before any build. Nothing pushed to HCIG Work without his yes (push gate of 2026-09-29). No invented facts. Native scrolling only. No em dashes |

## Word sources, section by section

Every visible sentence on the v4 home comes from one of these, unchanged. Order and look are free.

| v3 home section | Words |
|---|---|
| Header | Navigation labels, "CALL THE TEAM", "Request A Quote" (live site) |
| Hero | Title "Your Trusted Partner in Global Medical, Travel, and Tourism Assistance." and its paragraph (live site) |
| About | "ABOUT US", "Your Care. One Call Away.", three lead lines, the paragraph with 30,000 cases and 570 repatriations (live site); stat labels "Cases Handled", "Medical Repatriations", "Operational Desk", "Global Hubs" (approved in v3) |
| Relax band | "TMASI Global: Where RELAX & ENJOY Is All You Need to Do." and its paragraph (live site) |
| Core Values | Title and four values with their lines (live site) |
| Mission and Vision | Title and both full paragraphs (live site) |
| Why Choose | Title and five items (live site) |
| Our Services | Title, sub line, six groups (Medical Assistance, Elite Medical Concierge, Travel Assistance, Medical Tourism, Insurance Assistance, Additional Services) and every item with its line (live site) |
| Quote | "Request My Free Quote", its paragraph, field labels, button, success words (live site and v3) |
| Global Operational Hubs | "Global Operational Hubs" (approved in v3); five offices with address, phone, email (live footer, as on the live home and v3) |
| News | "Latest News & Updates", "View All News", "Read more" (approved in v3); post titles, dates and pictures (live site and his news folder) |
| Partner band | "Ready to partner with TMASI Global?", its line, "Get in Touch" and "Request a Quote" (approved in v3) |
| Footer | Quick Links, offices, social links, copyright line, "Powered by Pulse Marketing" (live site and v3) |

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A partner sees the global network at first sight (Priority: P1)

A buyer at an insurer opens the home. Before scrolling, they read the headline and see a 3D
Earth where TMASI's five offices light up in their real places and connect, starting from Egypt.

**Why this priority**: This is the one idea v4 exists for: "international, global, one of the sharks".

**Independent Test**: Open the preview on a desktop and on a phone; the headline, both buttons and the globe story are visible in the first screen, and every office can be reached.

**Acceptance Scenarios**:

1. **Given** a desktop visitor, **When** the page loads, **Then** the headline and both buttons are readable at once and the globe arrives without delaying the words.
2. **Given** the globe has arrived, **When** its opening story plays, **Then** Egypt lights first and the connections travel out to Germany, Spain, UAE and USA.
3. **Given** a desktop visitor, **When** they point at or select an office, **Then** that office's name, address, phone and email (the site's own) appear.
4. **Given** a phone visitor, **When** the hero loads, **Then** the phone's own composition shows (the globe on top, a guided tour office by office, an office card below that changes with it) and tapping a pin or swiping the cards jumps to that office.
5. **Given** a keyboard or screen-reader visitor, **When** they reach the globe, **Then** the five offices are available as a plain list with the same details.

---

### User Story 2 - A partner reaches TMASI in one step (Priority: P1)

From the hero, the partner band and the header, "Request A Quote" opens the quote form and
"CALL THE TEAM" opens WhatsApp. Both look equally important.

**Why this priority**: The home exists to start conversations with partners.

**Independent Test**: From any section on desktop and phone, reach the quote form or WhatsApp in one tap or click; send a test quote and see the success words.

**Acceptance Scenarios**:

1. **Given** any scroll position, **When** the visitor looks for a way to contact TMASI, **Then** both actions are one tap or click away.
2. **Given** a filled quote form, **When** it is sent, **Then** the visitor sees the success words and the request reaches the same place as on v3.

---

### User Story 3 - A partner reads what TMASI does, in its own words (Priority: P2)

Every section of the v3 home appears with all of its words. The long paragraphs open in place.

**Why this priority**: The words are the client's most important asset and his most important rule.

**Independent Test**: An automatic check compares every sentence on the page with the word sources above and finds no sentence that is not theirs, and no sentence missing.

**Acceptance Scenarios**:

1. **Given** the built page, **When** the check runs, **Then** it reports zero foreign sentences and zero missing sentences.
2. **Given** a long paragraph, **When** the visitor opens it, **Then** the full text shows in place, nothing cut.

---

### User Story 4 - A partner trusts what they see (Priority: P2)

The partners the site names appear with their official logos in full colour, each linked to the
news post that names it. Numbers appear only as the site states them.

**Why this priority**: B2B buyers judge credibility by named partners and real numbers.

**Independent Test**: Each logo is the organisation's official mark, opens the right news post, and every number on the page traces to a word source.

**Acceptance Scenarios**:

1. **Given** the partner logos, **When** a visitor selects one, **Then** the news post naming that organisation opens.
2. **Given** any number on the page, **When** it is traced, **Then** it matches the live site's words.

---

### User Story 5 - It feels premium on a phone, with real 3D (Priority: P2)

The phone gets its own design of every section, not a squeezed desktop. The hero fits one
screen with the words first and real 3D in the phone's own composition.

**Why this priority**: Partners open links from email and messages on their phones.

**Independent Test**: On a mid-range phone, the hero fits one screen, the globe tour runs smoothly, nothing scrolls sideways, and every section reads well at 390 px wide.

**Acceptance Scenarios**:

1. **Given** a mid-range phone, **When** the hero runs, **Then** the 3D globe turns smoothly with no visible stutter.
2. **Given** a very old phone, low-power mode or reduced motion, **When** the hero loads, **Then** a sharp designed still of the same composition shows instead.

---

### User Story 6 - Motion and media that mean something (Priority: P3)

A 3D icon set in the globe's light and colour, one or two silent video loops in bands, and one
film that opens full screen with sound from a Watch button.

**Why this priority**: It lifts the page from clean to memorable, after the essentials work.

**Independent Test**: Every motion has a reason, stops when off screen, and has a still state for reduced motion; the film opens with sound and closes cleanly.

**Acceptance Scenarios**:

1. **Given** reduced motion, **When** the page loads, **Then** every moving part shows a composed still.
2. **Given** the Watch button, **When** it is pressed, **Then** the film opens full screen with sound and closes back to the same place.

---

### Edge Cases

- No 3D support, low power or reduced motion: a designed still of the same composition, same layout.
- A video loop or the film fails or is slow: a designed still in the same frame, never a black flash or a play icon.
- A still is never taken from inside a video (absolute rule). Posters are made separately.
- Slow connection: words and buttons arrive first; 3D and video follow.
- The footer data the home uses gives the USA office no email and no city; the contact page gives 401 E Jackson St, Tampa and usa@tmasi.net. The pin sits on Tampa (the site's own address). The home card adds usa@tmasi.net from the contact page (his yes, 2026-10-01).
- Footer and contact page disagree for Germany (phone and email). The home keeps the footer version, as the live home and v3 do.
- Sofia loads late and never covers the hero or the buttons.
- A wanted image is not ready: a labelled design slot on the preview, never a fake picture.
- A text in the source looks wrong: it stays, and is flagged once in chat.

## Requirements *(mandatory)*

### Functional Requirements

**Content**
- **FR-001**: The home MUST show only sentences from the word sources above. Any new label needs his yes on the design canvas first.
- **FR-002**: Every v3 home section MUST appear with all of its words. Order and look are free.
- **FR-003**: Long paragraphs MUST show their first lines and open in place. No word removed.
- **FR-004**: Grammar, punctuation, spacing and capital fixes that keep the same words and meaning MAY be made, each one logged.

**Hero and globe**
- **FR-005**: The hero MUST show a 3D Earth with exactly the five offices in their real places, and no other place marked as a TMASI location.
- **FR-006**: The globe MUST tell a story: Egypt first, connections travelling out to the other four, then an idle state, as picked on the canvas.
- **FR-007**: Each office MUST be reachable on the globe and MUST show the site's own name, address, phone and email.
- **FR-008**: The offices MUST also be available as a plain, keyboard-reachable list for visitors who cannot use the globe. The 3D drawing itself is hidden from screen readers; the list carries the meaning.

**Desktop and phone**
- **FR-009**: Desktop and phone MUST each have their own composition of every section: the same idea, a different form.
- **FR-010**: Phones MUST get real 3D in the hero, in the phone composition he picks (first shown: globe on top, guided tour). Touch replaces hover and drag.
- **FR-011**: Very old phones, low-power mode and reduced motion MUST get a designed still of the same composition.

**Actions**
- **FR-012**: "Request A Quote" and "CALL THE TEAM" MUST carry equal weight in the header and the hero. The partner band keeps its own v3 buttons ("Get in Touch", "Request a Quote") at equal weight.
- **FR-012a**: Both actions MUST stay one tap or click away from any scroll position, on desktop and phone.
- **FR-013**: The quote form MUST keep the live field names and send to the same place as v3. CALL THE TEAM MUST open WhatsApp +20 120 678 8566.

**Media and 3D**
- **FR-014**: A 3D icon set MUST share the globe's light and colour and replace the flat icons and pictures where the canvas places them (Why Choose, Mission and Vision, Our Services, Core Values).
- **FR-015**: Video MUST be one or two silent loops in bands plus one film behind a Watch button that opens full screen with sound.
- **FR-016**: New images MUST be generated or free stock, in the brand colours, never showing invented text, logos or people presented as TMASI staff. News cards keep each post's own picture.

**Trust**
- **FR-017**: Partner logos MUST be official, in full colour, and link to the news post that names each one.
- **FR-018**: Numbers MUST appear only as the site states them.

**Brand, access and speed**
- **FR-019**: Colours, fonts and logo MUST follow the TMASI guideline as the base (teal dominant, white, black; medium blue and indigo sparingly). Creative moments MAY sit on top.
- **FR-020**: Text MUST meet WCAG AA contrast everywhere, including words over the globe, photos and video.
- **FR-021**: Every moving part MUST pause when off screen or when the tab is hidden, and MUST have a reduced-motion state.
- **FR-022**: Scrolling MUST stay native; no scroll hijacking. On phones a vertical swipe over the globe MUST scroll the page.
- **FR-022a**: Words and buttons MUST appear without waiting for any 3D, image or video to load.
- **FR-022b**: The page MUST keep to a weight budget per asset type (set in the plan) so SC-002 holds.

**Preview and process**
- **FR-023**: The preview MUST stay out of search engines and MUST leave v3 untouched.
- **FR-023a**: Every link to a page beyond the home, and the language switch, MUST open the matching v3 page.
- **FR-024**: Sofia MUST stay on the right and MUST NOT open by itself.
- **FR-025**: Every change MUST be logged in `docs/tmasi-worklog.md`.

### Key Entities

- **Office**: name, city, country, real position, address, phone, email (from the site's footer).
- **Partner**: name, official logo, the news post that names it.
- **Section text**: the v3 English words per section; the source for the word check.
- **Media asset**: an image, loop, film, icon or 3D still, with its source (generated, stock, client), licence and the section it serves.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of the sentences on the home match a word source, and 0 word-source sentences are missing (word check passes).
- **SC-002**: The headline and both buttons are readable in under 2.5 seconds on a mid-range phone on a 4G connection, and in under 1 second on desktop broadband.
- **SC-003**: The page holds steady while loading: no visible jump of text or buttons.
- **SC-004**: The globe and every animation run without visible stutter on a mid-range phone and a standard laptop.
- **SC-005**: A visitor reaches the quote form or WhatsApp in one tap or click from any section.
- **SC-006**: All five offices sit on their real countries; 0 invented places, numbers, logos or claims.
- **SC-007**: Every text meets WCAG AA contrast; every office and action can be reached by keyboard.
- **SC-008**: Nothing scrolls sideways at any width from 360 to 1920 px.
- **SC-009**: Mohamed approves the home on the preview at desktop and phone width.

## Assumptions

- Office positions come from the site's own addresses (contact page): Hurghada, Munich, Barcelona, Dubai (Silicon Oasis), Tampa (Florida).
- Egypt (Airport Road, Hurghada) is the base the network grows from; the site lists it first.
- Generated images and Veo clips are made by Mohamed in his own Gemini account (the API credit is depleted); Claude writes every prompt.
- The four partners are the organisations the site's news names: Egypt Healthcare Authority, Hansa Medica Group, ITIC Global and Uniglobal [verified 2026-10-01 in the v3 English posts].
- The v3 English words are final for v4. If the content writer sends new text later, it replaces them through the same word check.
- Free stock means licences that allow commercial use without a credit, or with a credit placed in the footer.

## Dependencies

- Mohamed: picks on the design canvas; makes the Nano Banana images and Veo clips from Claude's prompts in his Gemini; says yes before any push.
- The official logo files are taken from each organisation's own website.
- HCIG Work serves the preview.

## Out of Scope

Inner pages; German, Polish and Spanish; keyword research; analytics tags; cookie consent and a privacy page (needed at go-live, not on a preview without tracking); go-live on tmasi.net; any change to v3.
