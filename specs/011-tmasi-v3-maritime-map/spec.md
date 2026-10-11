# Feature Specification: TMASI v3 hubs map, the maritime layer and a light theme

**Feature Branch**: `011-tmasi-v3-maritime-map` (no git branch; work lands on main like every v3 change)

**Created**: 2026-10-11

**Status**: approved
**Approved**: 2026-10-11 by Mohamed ("i like all ,, impl all . but do these edits and show me first"). Code starts after he sees round 2 on the canvas.

**Input**: His words, 2026-10-11: "in map at the end of the page , where we have the planes , we also have cruises ...
i will provide the map of the cruises ... dont mention adriatic so far , we dont want to add it now ,,, but for now add
everything this image have like cruises and everything , like oprtaional presence and all other things like pins and
icons and the box that is on the left bottom on the image ... i want one light version with these colors too , i want
to see both canvas dark as we have , and light colors as in the image , and can we add a button beside the map for map
theme colors , like light or dark". His image: "TMASI Global Maritime Footprint" (WhatsApp image, 2026-10-07 16.14.49).

## Why

TMASI's guests reach care and a holiday by air and by sea. The current map (Global Operational Hubs, his pick B of
2026-10-07) shows guests flying in from every continent, but not the maritime side: cruise routes, port support, the
medical network that cruise and yacht guests rely on. His image shows that side. The map gets it, plus a light version
in the image's colours that a visitor can switch to.

## Decisions taken with Mohamed (2026-10-11)

| Topic | His answer |
|---|---|
| Medical Network pins | Same places as his image; he confirms or corrects them on the canvas |
| Title | Keep "Global Operational Hubs" and his two lines; the image title and tagline are not used |
| Planes | Keep the 15 flights (9 on phone) and add the ships; air routes solid, sea routes dotted |
| Theme switch | Dark first, switch at the map's top right, each visitor's pick remembered on their device |
| Country shading | Light theme only; the dark map stays as approved |
| New words | English only for now, on all four languages |
| Adriatic / Balkans | Left out completely: no card, no shading, no pin, no route |

## User Scenarios & Testing *(mandatory)*

### User Story 1: See TMASI's reach by sea as well as by air (Priority: P1)

A visitor (a partner, insurer, cruise line or guest) scrolls to the map and sees, at a glance, the five offices, the
role of each office in one line, cruise ships moving on sea routes, planes flying in, the medical network, and a key
that explains every mark.

**Why this priority**: it is the whole point of the change: the maritime side of the business becomes visible.

**Independent Test**: open the home page on phone and desktop, scroll to the map, and name every mark using only the key.

**Acceptance Scenarios**:

1. **Given** the home page on desktop, **When** the map is on screen, **Then** each office shows a gold pin and a card
   with its words from his image, ships sail dotted sea routes, planes fly their routes, cross pins mark the medical
   network, the three ocean names show, and the key sits at the bottom left.
2. **Given** a phone, **When** the map is on screen, **Then** the same marks show inside the phone frame, the office
   roles and the key are readable under or on the map (layout picked on the canvas), and nothing scrolls sideways.
3. **Given** any page language, **When** the map shows, **Then** nothing about Adriatic or the Balkans appears.

### User Story 2: Switch the map between dark and light (Priority: P1)

A visitor who prefers a light look presses Light beside the map; the map turns to the colours of his image, with the
office countries shaded blue. The next visit opens in the colours they chose.

**Why this priority**: he asked for both looks and the switch by name.

**Independent Test**: press the switch, reload, and check the map opens in the chosen colours.

**Acceptance Scenarios**:

1. **Given** a first visit, **When** the map shows, **Then** it is dark, as today.
2. **Given** the dark map, **When** the visitor presses Light (mouse, tap or keyboard), **Then** the map, pins, cards,
   routes and key all change to the light colours, and the switch shows Light as chosen.
3. **Given** a visitor chose Light, **When** they come back, **Then** the map opens light.
4. **Given** a browser that blocks site storage, **When** the visitor switches, **Then** the switch still works for
   that visit and the next visit opens dark.

### User Story 3: Calm motion for everyone (Priority: P2)

Ships and planes move gently while the map is on screen and stop when it is not. A visitor who asked their device for
less motion sees the ships and planes resting on their routes.

**Independent Test**: turn on reduced motion and check that nothing moves; scroll the map off screen and check the
motion pauses.

**Acceptance Scenarios**:

1. **Given** reduced motion, **When** the map shows, **Then** ships and planes hold still on their routes and pins do not pulse.
2. **Given** a mid-range phone, **When** the map is on screen, **Then** scrolling and motion stay smooth (see SC-004).

### Edge Cases

- Places outside the phone frame (Japan, the Pacific ship, Sydney) are simply not shown on phone; no half-cut cards.
- Cards must never cover a pin, another card or the key, on any screen width from 320 px up.
- The light image loads only when a visitor chooses Light, so first visits pay nothing extra.
- A sea route must never cross land; a ship never sails over a continent.
- Long words in the cards wrap inside the card; no text runs out of its box.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The map MUST show a gold Operational Presence pin on each office: USA (Florida), Spain, Germany, Egypt, UAE.
- **FR-002**: Each office MUST carry its card text exactly as in his image:
  - USA, Florida: "Maritime / port support and international operations."
  - Spain: "Healthcare network and maritime support capability."
  - Germany: "European network and medical coordination."
  - Egypt: "Major TMASI operational healthcare infrastructure."
  - UAE: "International travel, maritime and healthcare hub."
- **FR-003**: The map MUST show the key (legend) box with the four rows of his image, words exact:
  Operational Presence, "TMASI offices / key hubs"; Medical Network, "Partner facilities and providers";
  Regional Capability, "Where applicable"; Maritime Routes, "Cruise, ports, yachts".
- **FR-004**: The map MUST show cruise ships moving along dotted sea routes (his list, 2026-10-11): Florida (North
  America) past the Bahamas across the Atlantic to West Africa (two ships); South America (Santos) across the South
  Atlantic to Cape Town; UAE (Fujairah) east through Malacca and the Pacific to South America (the map wraps: the ship
  leaves the right edge and comes back in from the left edge to Guayaquil; two ships); and East Asia out to the Pacific,
  as in his image.
- **FR-005**: The map MUST show blue cross Medical Network pins where his image has them (approximate, to be confirmed
  by him on the canvas): Ecuador coast, Sao Paulo, Buenos Aires, East Africa (Tanzania), South Africa, North India, Sydney.
- **FR-006**: The map MUST show a dashed Regional Capability line from UAE to India. (Egypt to East Africa was dropped:
  in his image that line is the UAE plane route.)
- **FR-006a**: Two flights join the approved 15: UAE to South Africa (his ask) and Florida to Spain (his image).
- **FR-007**: The map MUST show the ocean names Atlantic Ocean, Pacific Ocean, Indian Ocean.
- **FR-008**: The approved 15 flights (9 on phone) and his two lines MUST stay as they are today.
- **FR-009**: A Light / Dark switch MUST sit at the map's top right, work by mouse, touch and keyboard, show which theme
  is chosen, and remember the choice on the visitor's device.
- **FR-010**: The light theme MUST use his image's colours (pale land, white coasts, pale to deep blue sea) and shade
  the five office countries blue. The dark theme MUST keep today's approved look, without country shading.
- **FR-011**: Nothing about Adriatic or the Balkans may appear.
- **FR-012**: All new words show in English on every language version, marked as English for screen readers.
- **FR-012a**: Cards and the key float over the map's edge as raised layers (layered shadow, gold top hairline, a gentle
  lift on hover with a fine pointer, none with reduced motion). On phone the office card rides over the map's bottom edge.
- **FR-013**: Office pins MUST keep linking to their office pages, and pin and office card below the map MUST still
  light up together.
- **FR-014**: Mission & Vision shows without images on home and About (done 2026-10-11, commit fc3af49d).

### Key Entities

- **Office**: name, place, role line (FR-002), link to its office page.
- **Medical Network point**: place, shown as a cross pin.
- **Sea route**: a line of places over water, with one ship moving along it.
- **Theme choice**: dark or light, remembered per visitor device.

## Success Criteria *(mandatory)*

- **SC-001**: A first-time viewer can name all four kinds of mark using only the key, on phone and desktop.
- **SC-002**: Every text on the map reads at a contrast of at least 4.5 to 1 in both themes.
- **SC-003**: The theme choice survives a reload in 100% of tries where the browser allows site storage.
- **SC-004**: On a phone slowed to a quarter of its speed, the map scrolls and moves at no less than 59 frames a second
  (today's map: 59 flying, 61 still).
- **SC-005**: No sideways scroll at 320, 390, 768, 1280 and 1440 px wide.
- **SC-006**: First visit downloads no more for the map than today (the light picture loads only on demand).

## Assumptions

- The card and key words are his image's words; he wrote them, so they are client words and are kept exact.
- The pin and route places in his image are approximate (it is a picture, not a survey); he confirms them on the canvas.
- "Partner facilities and providers" is his claim from his own image; no partner is named on the map.
- Push gate holds: nothing goes to the preview without his yes for that change.
- 21st.dev, Figma and Playwright MCPs were offline on 2026-10-11; the canvas is Claude Design.
