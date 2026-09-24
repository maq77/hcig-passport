# Feature Specification: Measurement foundation

**Feature Branch**: `001-measurement-foundation`

**Created**: 2026-09-21

**Status**: approved

**Approved**: 2026-09-21 by Mohamed Amin. Implementation assigned to agy to save Claude tokens. Review and merge stay with the head.

**Input**: Make the contact events that already exist actually record, and put a tracked WhatsApp and phone path on every page of every site.

## Why this is first

The hotel landing pages already fire `clinic_view` on load, and `phone_click`,
`whatsapp_medical_click` and `clinic_directions_click` on every contact button. The code is
in `scripts/lp/data.js`, and it opens with `if (!window.gtag) return;`.

No GA4 tag is loaded anywhere in this repo. Every one of those events returns silently and
records nothing. The instrument exists. The receiver is missing.

Until that is fixed nobody can say which hotel sends patients, whether WhatsApp beats the
phone, or whether any page is worth the work. Every other initiative in this programme is
guesswork without it, which is why it is numbered first.

## User Scenarios & Testing

### User Story 1 - See which hotel sends patients (Priority: P1)

Mohamed opens one report and sees, for last week, how many people saw each hotel page and
how many of them pressed WhatsApp, called, or asked for directions, split by hotel.

**Why this priority**: It answers the question the whole programme rests on, which is where
patients actually come from. It needs no new pages and no new copy, only a tag and
verification.

**Independent Test**: Open a hotel page, press each contact button, confirm each press
arrives in GA4 DebugView within seconds carrying the right hotel name.

**Acceptance Scenarios**:

1. **Given** a visitor opens the Amwaj hotel page, **When** the page finishes loading, **Then** one `clinic_view` event is recorded carrying hotel "Amwaj Beach Club" and the area.
2. **Given** a visitor on the Steigenberger page, **When** they press the WhatsApp button, **Then** exactly one `whatsapp_medical_click` event is recorded with that hotel, and nothing is recorded twice.
3. **Given** a week of traffic, **When** Mohamed opens the report, **Then** each of the three hotels shows views and contact presses as separate numbers.

---

### User Story 2 - Every page can be contacted, and every contact is counted (Priority: P2)

A visitor on any page of any site we control, in any language, can reach the clinic by
WhatsApp or phone without hunting for it, and that press is counted the same way everywhere.

**Why this priority**: The tracked path exists only on the hotel landing pages today. The
rest of the estate has contact links that count nothing, so the picture stays partial.

**Independent Test**: Walk every page of one site in every language, press the contact path,
confirm one event per press with the page and language attached.

**Acceptance Scenarios**:

1. **Given** any page on a site we control, **When** it renders, **Then** it carries at least one WhatsApp path and one phone path, both tracked.
2. **Given** a German page, **When** the visitor opens WhatsApp, **Then** the prefilled message is in German and names the page they came from.
3. **Given** the same button on two different sites, **When** it is pressed, **Then** both record the same event name, so the numbers can be added together.

---

### User Story 3 - Reception knows where the message came from (Priority: P3)

Whoever answers WhatsApp sees, in the first line of the incoming message, which hotel or
page the guest was reading.

**Why this priority**: It turns a tracked click into a qualified conversation and costs only
a prefilled string. P3 because it improves handling rather than measurement.

**Independent Test**: Press WhatsApp on each hotel page and read the text that arrives.

**Acceptance Scenarios**:

1. **Given** a guest at Premier Le Reve presses WhatsApp, **When** the chat opens, **Then** the prefilled message names Premier Le Reve and stays editable.
2. **Given** a guest deletes the prefilled text, **When** they send their own message, **Then** nothing breaks and the click is still counted.

### Edge Cases

- The visitor blocks analytics or refuses consent. The contact path must still work perfectly. Measurement may lose data. Contact may not.
- WhatsApp is not installed, or the visitor is on a desktop. The link must still open a working chat.
- The same button is pressed twice in two seconds. That is one intent. It must not be counted as two unless it truly was two presses.
- Bot and preview traffic, including our own screenshot runs, must not inflate the numbers.
- The tag fails to load, or the visitor is offline. The page must not show an error.

## Requirements

### Functional Requirements

- **FR-001**: Every site we control MUST load a GA4 tag on every page, in every language.
- **FR-002**: The four existing event names MUST be kept exactly: `clinic_view`, `phone_click`, `whatsapp_medical_click`, `clinic_directions_click`. Renaming them throws away the work already in `scripts/lp/data.js`.
- **FR-003**: Every contact event MUST carry which page it came from, which language that page was in, and, on a hotel page, which hotel.
- **FR-004**: No event may carry anything identifying a person: no name, no phone number, no message text, no email.
- **FR-005**: Consent MUST be requested before any analytics cookie is set for an EU visitor, and analytics MUST default to denied until they agree. German, Polish and Czech tourists are the target market, so this is not optional.
- **FR-006**: Refusing consent MUST NOT disable or hide any contact path.
- **FR-007**: Every page MUST offer a WhatsApp path and a phone path, both tracked.
- **FR-008**: The WhatsApp link MUST open with a prefilled message in the language of the page, naming the page or hotel, and the visitor MUST be able to edit or delete it.
- **FR-009**: Our own automated traffic MUST be excluded from the reported numbers.
- **FR-010**: Each site MUST be verifiable on its own, so one site can go live with measurement before the others are ready.
- **FR-011**: HCIG is one group of separate businesses, and the measurement MUST carry that shape. Every site keeps its own numbers, readable on their own, and every site MUST also roll up into one group view.
- **FR-012**: Every event MUST carry which site it came from, so a group total is a sum and never a reconciliation.
- **FR-013**: Event names and parameters MUST be identical across every site. A site that names the same action differently breaks the group view and is a defect.
- **FR-014**: Adding a new site to the group MUST NOT require the group view to be rebuilt.

### Key Entities

- **Group**: HCIG, the whole. Owns every site. Its numbers are the sum of theirs, never a separate count.
- **Site**: One domain we control. Belongs to the group. Has its own measurement stream, languages and contact numbers, and its own readable numbers.
- **Contact path**: A WhatsApp, phone or directions link. Has a language, a page, and a destination.
- **Event**: One recorded visitor action. Has a name from the fixed list, a page, a language, and an optional hotel.
- **Hotel**: A partner property with its own landing page. Today: Premier Le Reve, Steigenberger Ras Soma, Amwaj Beach Club.

## Success Criteria

- **SC-001**: Pressing any contact path on any page of any site we control produces exactly one event. Confirmed on every hotel page and in every language, zero misses, zero duplicates.
- **SC-002**: Every page of every site we control carries at least one tracked contact path. Counted over the built output, not sampled.
- **SC-003**: No event recorded in a full week contains personal data. Checked by reading the parameters actually collected, not by intention.
- **SC-004**: No analytics cookie is set for an EU visitor before consent. Verified in a browser with an empty profile.
- **SC-005**: Mohamed can answer "which hotel produced the most WhatsApp messages last week" in under a minute without asking anyone.
- **SC-006**: Contact paths still work with analytics fully blocked. Verified with a blocker switched on.
- **SC-007**: Every site can be read on its own, and the group total equals the sum of the sites exactly. Any gap between the two is a defect, not a rounding difference.

## Assumptions

- Elite Medical Concierge (medcierge.com) is a finished project and is out of scope. No measurement, no contact paths, no changes of any kind are made to it. Confirmed by the user 2026-09-21.
- The event names already in the code are the right ones and worth preserving.
- Contact numbers stay as they are in `scripts/lp/data.js`. This work does not change who answers.
- This adds no visitor-facing copy beyond the prefilled WhatsApp message and whatever a consent notice needs. Both go through the usual copy review before going live.
- MedPark is a live site outside this repo, so whatever is done for it is applied wherever that site is actually edited.

## Open questions, for the user

- **Q1**: Does a Google Analytics property already exist for any of these domains, and who owns the account? If one exists we attach to it. If not it is created owned by HCIG, not by an agency.
- **Q2**: Is there already a cookie consent tool on any live site, or is this the first one?
- **Q3**: Is the WhatsApp number in `scripts/lp/data.js` the number that should receive every message, for every site and every language, or does MedPark use a different one?
- **Q4**: Where is medparkhospitals.com actually edited, so a tag can be added to it?
