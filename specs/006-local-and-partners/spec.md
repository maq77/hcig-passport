# Feature Specification: Local and partners

**Feature Branch**: `006-local-and-partners`

**Created**: 2026-09-21

**Status**: not needed
**Closed**: 2026-09-22. The user: "no need for 006, so keep it as not important or remove."
Kept rather than deleted, because the per-hotel QR codes and the Business Profile
posting engine are worth revisiting once 001 measurement closes. Nothing is built
from it, and the spec gate will keep refusing any ticket that names this epic.

**Input**: Hotel partner landing pages with per-hotel QR codes, and a Google Business Profile posting engine.

## Why

A tourist who feels ill in Hurghada does one of two things. They ask the hotel reception, or
they open Maps. Neither of those is a web search, and neither is an assistant.

This is the only initiative in the programme that reaches a guest at the moment they decide,
in the place they decide.

Most of the groundwork exists. `scripts/lp/` builds hotel landing pages for Premier Le Reve,
Steigenberger Ras Soma and Amwaj Beach Club, in four designs each, with contact events
already wired. A MedPark QR image already sits in the built output. What is missing is the
route from a hotel room to those pages, a way to tell which hotel worked, and any presence
in Maps that is maintained rather than abandoned.

## User Scenarios & Testing

### User Story 1 - A guest in a room reaches the right page in one move (Priority: P1)

A guest sees a card in the room or at reception, scans it, and lands on the page for that
hotel, in their own language, with one obvious way to get help.

**Why this priority**: It is the shortest path from a guest feeling ill to a conversation,
and the pages it needs already exist.

**Independent Test**: Print one card, scan it with a phone, and see where it lands and what
gets recorded.

**Acceptance Scenarios**:

1. **Given** a guest scans the card in a given hotel, **When** the page opens, **Then** it is the page for that hotel and it records which hotel and which card the scan came from.
2. **Given** the guest's phone is set to German, **When** the page opens, **Then** it opens in German if that language exists, and in English if it does not.
3. **Given** the guest presses the contact path, **When** the event is recorded, **Then** it carries the hotel and the fact that it came from a scan rather than a search.

---

### User Story 2 - Know which hotel is worth the relationship (Priority: P2)

Each hotel's scans, page views and contact presses are countable on their own, so a
partnership can be judged rather than guessed.

**Why this priority**: It decides where to spend time. It also gives the hotel a reason to
keep the cards out, because their own numbers can be shown to them.

**Independent Test**: Compare two hotels over a month and say which produced more contacts.

**Acceptance Scenarios**:

1. **Given** a month of traffic, **When** the numbers are read, **Then** scans, views and contacts are shown for each hotel separately.
2. **Given** one hotel produces nothing for a month, **When** that is reviewed, **Then** it is visible without digging.

---

### User Story 3 - The Maps listing is alive (Priority: P3)

The Google Business Profile carries current photos, current hours, posts in the languages
guests speak, and replies to every review.

**Why this priority**: In a tourist town, "clinic near me" is answered by Maps, not by the
website. P3 because it is ongoing work rather than a thing that gets built once.

**Acceptance Scenarios**:

1. **Given** a review arrives in any language, **When** it is seen, **Then** it is answered in that language within a set time.
2. **Given** the profile has not been posted to recently, **When** the schedule runs, **Then** that is raised as work to do.
3. **Given** hours change for a holiday, **When** the change is made, **Then** it is made before the holiday, not after it.

### Edge Cases

- A card stays in a room for a year. The URL on it can never be allowed to break, whatever happens to the site.
- A hotel asks to be removed. Everything pointing at them must be removable quickly and cleanly.
- A guest scans in an area with no signal, or with very slow hotel wifi.
- A review is defamatory or names a medical outcome. That needs a person and a compliance check, never a fast reply.
- A hotel partnership is commercial. Anything printed or published about it may need their approval first.

## Requirements

### Functional Requirements

- **FR-001**: Each partner hotel MUST have its own page and its own scannable code leading to it.
- **FR-002**: A scanned URL MUST keep working even if the site is restructured. It may never 404.
- **FR-003**: A scan MUST be distinguishable from other traffic, and attributable to the hotel and the placement it came from.
- **FR-004**: The page MUST open in the guest's language where that language exists, and fall back to English where it does not.
- **FR-005**: Every hotel's scans, views and contacts MUST be countable separately.
- **FR-006**: Removing a hotel MUST be one action that takes down its page and disables its code.
- **FR-007**: The page MUST be usable on a slow connection, because hotel wifi is slow.
- **FR-008**: The Business Profile MUST be posted to on a schedule, in the languages guests speak.
- **FR-009**: Every review MUST be answered within an agreed time, and a review touching a medical outcome MUST be routed to a person before any reply.
- **FR-010**: Nothing printed or published naming a hotel may go out without that hotel's agreement on record.
- **FR-011**: No claim about the clinic on any of these pages may be invented. Missing facts stay placeholders.

### Key Entities

- **Hotel**: A partner property. Has a name, an area, a page, a code, and a status.
- **Placement**: Where a code physically sits, for example a room card or a reception desk. Belongs to a hotel.
- **Scan**: One visit that came from a code, carrying its hotel and placement.
- **Profile**: A Google Business Profile for one location, with its posts, photos, hours and reviews.

## Success Criteria

- **SC-001**: Every partner hotel has a working page and code, and every code resolves correctly when tested on a real phone.
- **SC-002**: Scans, views and contacts are reportable per hotel, per month, with no manual counting.
- **SC-003**: No scanned URL breaks for twelve months after printing.
- **SC-004**: Every review is answered within the agreed time, in the language it was written in.
- **SC-005**: Every hotel named in anything printed has their agreement on record before it is printed.
- **SC-006**: A hotel can be removed completely within one working day of asking.

## Assumptions

- The three hotels already in `scripts/lp/data.js` are real relationships, or intended ones, and are the starting set.
- 001 is live, so scans and contacts can actually be counted. Without it this initiative cannot prove anything.
- Printed cards and any page copy go through the usual copy review, and through compliance where a claim is involved.
- The clinic answers WhatsApp and the phone during the hours stated on the page.

## Open questions, for the user

- **Q1**: Which of the three hotels is an agreed partnership today, and which is a proposal? That decides what may be printed.
- **Q2**: Who controls the Google Business Profile for each location, and do we have access?
- **Q3**: Who answers reviews today, and in which languages can they answer?
- **Q4**: Is there a budget and a supplier for printing the cards, and who places them in the rooms?
- **Q5**: Should the card carry the clinic's brand, the hotel's, or both? That is usually the hotel's decision, not ours.
