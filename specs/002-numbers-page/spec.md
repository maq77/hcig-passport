# Feature Specification: The numbers page

**Feature Branch**: `002-numbers-page`

**Created**: 2026-09-21

**Status**: draft

**Input**: One page showing traffic, leads, WhatsApp clicks and calls per site and per language.

## Why

Once 001 is recording, the numbers exist but live in Google's interface, which asks a
question at a time and answers in a layout nobody chose. Decisions get made from memory
instead.

This is one page that answers the standing questions without being asked: what happened
last week, where did it come from, and what changed. It replaces opening four tools.

It depends on 001. With no events recorded there is nothing to show, and a dashboard of
zeroes is worse than none because it looks like an answer.

## User Scenarios & Testing

### User Story 1 - The weekly answer in one screen (Priority: P1)

Mohamed opens one page and sees, for the last 7 days and the 7 before that: visits, contact
presses, and the split by site, by language and by hotel. Every number is next to what it
was, so a change is visible without arithmetic.

**Why this priority**: It is the whole point. A number without its previous value is trivia.

**Independent Test**: Open the page after a week of recorded traffic and answer, without
opening anything else: which site grew, which language converts best, which hotel is dead.

**Acceptance Scenarios**:

1. **Given** a week of recorded events, **When** the page opens, **Then** it shows visits and contact presses for each site, each with the previous period beside it.
2. **Given** a language performs worse than the others, **When** Mohamed looks at the page, **Then** that is visible without filtering or clicking.
3. **Given** a day with no data at all, **When** the page opens, **Then** it says the data is missing rather than drawing a zero.

---

### User Story 2 - Trust the number (Priority: P2)

Every number on the page can be traced to where it came from and when it was last refreshed.

**Why this priority**: A dashboard nobody trusts gets ignored within a month. This is also a
standing HCIG rule: evidence or nothing.

**Independent Test**: Pick any number on the page and find, from the page itself, its source
and its timestamp.

**Acceptance Scenarios**:

1. **Given** any figure on the page, **When** Mohamed looks at it, **Then** the page states where it came from and when it was last pulled.
2. **Given** the data pull failed this morning, **When** the page opens, **Then** it says so plainly and shows the age of what it is displaying, instead of quietly showing stale numbers as current.

---

### User Story 3 - See the whole funnel, not just the top (Priority: P3)

The page shows the path: people who arrived, people who pressed a contact path, and, where
it can be known, people who became a real conversation.

**Why this priority**: Visits are vanity. The drop between arriving and pressing is where
the money is. P3 because the last step depends on data we may not have yet.

**Acceptance Scenarios**:

1. **Given** a week of data, **When** the page opens, **Then** it shows arrivals, contact presses, and the rate between them, per site.
2. **Given** conversations are not recorded anywhere we can read, **When** the page renders, **Then** that step is shown as unknown rather than estimated.

### Edge Cases

- The data source is rate limited, down, or quota exhausted. The page must say so, not invent a number or show the last one as if it were fresh.
- A new site or language appears. It should appear on the page without the page being rebuilt by hand.
- A week with almost no traffic. Small numbers must not be presented as trends.
- Two sites use different languages. The page must not imply a comparison that does not exist.

## Requirements

### Functional Requirements

- **FR-001**: The page MUST show, per site: visits, contact presses by type, and the rate between them, for a chosen period against the period before it.
- **FR-002**: The page MUST break the same numbers down by language, and by hotel where the page is a hotel page.
- **FR-003**: Every number MUST carry its source and the time it was last refreshed.
- **FR-004**: A failed or stale data pull MUST be stated on the page. Silence is not allowed.
- **FR-005**: Missing data MUST be shown as missing, never as zero.
- **FR-006**: The page MUST refresh on a schedule without anyone pressing anything.
- **FR-007**: The page MUST NOT contain any personal data about any visitor or patient.
- **FR-008**: The page MUST work on a phone, because it will be read on one.
- **FR-009**: A new site, language or hotel MUST appear automatically once it starts producing events.
- **FR-010**: The page MUST load in under 3 seconds on a normal connection.
- **FR-011**: The page MUST show the group as a whole and each site on its own, and moving between the two MUST NOT mean opening a different page.
- **FR-012**: The group total MUST equal the sum of the sites. If it cannot, the page says why rather than showing a number that does not add up.
- **FR-013**: A new site MUST appear in both the group view and its own view without the page being rebuilt by hand.

### Key Entities

- **Period**: A date range and the range before it, so every figure has a comparison.
- **Metric**: One measured thing, with a value, a previous value, a source and a refresh time.
- **Breakdown**: A metric split by site, language or hotel.
- **Pull**: One attempt to fetch data, with its result: fresh, stale, or failed with a reason.

## Success Criteria

- **SC-001**: Mohamed can answer "what happened last week and what changed" in under two minutes, from this page alone.
- **SC-002**: Every number on the page can be traced to its source by reading the page, with no outside knowledge.
- **SC-003**: When the data source fails, the page says so within one refresh cycle, and never shows a stale number as current.
- **SC-004**: The page is opened at least weekly for a month after launch. If it is not, it failed, whatever it looks like.
- **SC-005**: No figure on the page is ever produced by estimation or interpolation.

## Assumptions

- 001 is live and recording. This initiative reads data, it does not create it.
- The audience is Mohamed and the HCIG team, not the public, and not clients.
- Search Console data is wanted alongside analytics, subject to access existing.
- This page carries no marketing copy, so it does not need a copy review.

## Open questions, for the user

- **Q1**: Who should be able to open this page? Only you, the HCIG team, or a client too? The answer decides whether it needs a login.
- **Q2**: Is there Search Console access for all of the domains, and under which account?
- **Q3**: Are WhatsApp conversations recorded anywhere that can be read back, for example a business account with an export? Without that, the funnel stops at the click.
- **Q4**: Should this live inside the existing Hive dashboard, which already exists and is already private, or stand on its own?
