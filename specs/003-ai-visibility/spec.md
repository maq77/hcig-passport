# Feature Specification: AI visibility

**Feature Branch**: `003-ai-visibility`

**Created**: 2026-09-21

**Status**: approved
**Approved**: 2026-09-22 by the user ("you do 004 and 003").

**Input**: Get cited by ChatGPT, Gemini and Perplexity. A weekly citation tracker, answer-first blocks with FAQ schema, entity markup and llms.txt.

## Why

A tourist in Hurghada with a sick child now asks an assistant before a search engine. The
assistant names two or three places. If HCIG is not one of them, the search ranking below
it never gets read.

Part of the groundwork exists. `scripts/gen-247-seo.js` already writes an `llms.txt` and a
sitemap that declares the clinic films, into `docs/247clinic-deploy/`. What is missing is
three things: knowing whether we are cited at all, pages written in the shape an assistant
can quote, and an entity an assistant can resolve with confidence.

Automating the citation check has been waiting since 3 September. This closes it.

## User Scenarios & Testing

### User Story 1 - Know whether we are cited (Priority: P1)

Once a week, a fixed set of questions a real tourist would ask is put to the major
assistants, in each target language, and the answer is recorded: were we named, were we
linked, who was named instead.

**Why this priority**: Everything else in this spec is a guess until this exists. It is also
the only way to prove the rest of the work did anything.

**Independent Test**: Run the check once by hand and read the results for a single language.

**Acceptance Scenarios**:

1. **Given** the fixed question set, **When** the weekly check runs, **Then** each question and each assistant produces a recorded result saying whether HCIG was named, whether it was linked, and which competitors were named.
2. **Given** four weeks of results, **When** Mohamed looks, **Then** he can see whether being named is going up or down per language.
3. **Given** an assistant is unreachable or rate limited, **When** the check runs, **Then** that is recorded as a failed check, never as "not cited".

---

### User Story 2 - Pages written so they can be quoted (Priority: P2)

Every service page opens with a short, direct answer to the question the page is about,
followed by the detail. The same questions and answers are marked up so a machine reads them
the same way a person does.

**Why this priority**: This is what assistants actually quote. It is also cheap, and it
improves the page for human readers, which is the test of whether it is worth doing.

**Independent Test**: Take one page, add the block, and confirm both that a person reading
it gets the answer faster and that the markup validates.

**Acceptance Scenarios**:

1. **Given** a service page, **When** it renders, **Then** the first thing under the heading answers the page's question in plain language, in roughly 40 to 60 words.
2. **Given** a page with questions and answers, **When** a machine reads it, **Then** the markup is valid and matches the text on the page exactly.
3. **Given** a page in German, **When** it renders, **Then** the answer block is in German and says the same thing as the English one.

---

### User Story 3 - The entity resolves to one organisation (Priority: P3)

An assistant asked about MedPark, 24/7 Clinic or HCIG gets one consistent answer about who
they are, where they are, and what they do, because every page says the same thing in a
form machines agree on.

**Why this priority**: It is the difference between being quoted and being trusted. P3
because it pays off after the first two, not before.

**Acceptance Scenarios**:

1. **Given** any page of a site, **When** a machine reads its markup, **Then** the organisation, its locations and its links to official profiles are stated and identical across pages.
2. **Given** the naming rule that Sahl Hasheesh Road is MedPark Health Hub and El Quseir is MedPark Hospital, **When** any page or file names a building, **Then** it uses that name and that spelling.

### Edge Cases

- An assistant changes its answer between two runs for no reason. One run is noise, so a trend needs several.
- An assistant invents a fact about HCIG. That is a finding that needs a person, and must be flagged loudly rather than logged quietly.
- A question set that is too easy will always say we are cited and teach nothing. It must include questions we currently lose.
- A competitor's name appears in our own recorded results. That is data, and it must never leak into page copy.
- llms.txt exists for 247clinic only. The others must not be assumed to have one.

## Requirements

### Functional Requirements

- **FR-001**: A fixed set of questions MUST be checked weekly against the major assistants, in each target language.
- **FR-002**: Each result MUST record: the question, the assistant, the language, whether HCIG was named, whether it was linked, which competitors were named, and the date.
- **FR-003**: A failed check MUST be recorded as failed. It may never be recorded as "not cited".
- **FR-004**: The question set MUST include questions HCIG currently loses, not only ones it wins.
- **FR-005**: Every service page MUST open with a direct answer of roughly 40 to 60 words to the question the page is about.
- **FR-006**: Question and answer markup MUST match the visible text word for word. Markup that says something the page does not say is forbidden.
- **FR-007**: Organisation and location markup MUST be identical across every page of a site, and MUST use the agreed building names.
- **FR-008**: Every site MUST have a plain text summary for assistants that read one, kept in step with the site.
- **FR-009**: No answer block may contain a medical claim, a price, an outcome, a statistic or an accreditation that is not already approved. Missing facts are marked as placeholders, never invented.
- **FR-010**: Results MUST be readable as a trend over time, not only as a snapshot.

### Key Entities

- **Question**: One thing a tourist would ask, in one language, with the intent behind it.
- **Check**: One question put to one assistant on one date, with its result.
- **Answer block**: The short answer at the top of a page, in one language, with the question it answers.
- **Entity**: The organisation, its buildings, its locations and its official profiles.

## Success Criteria

- **SC-001**: Every week produces a complete record for every question, every assistant and every language, with failures marked as failures.
- **SC-002**: The share of questions where HCIG is named rises over three months, measured against the first week as the baseline.
- **SC-003**: Every service page has an answer block, and every answer block matches its markup exactly. Counted over the built output.
- **SC-004**: An invented fact about HCIG in any assistant's answer is surfaced to a person within a week of appearing.
- **SC-005**: Zero medical claims, prices or accreditations appear in any answer block without prior approval.

## Assumptions

- Target languages follow the market: English, German, Polish and Czech for 24/7 Clinic, matching `docs/247clinic-keywords.md`. Russian is named in the wider strategy and is confirmed per site rather than assumed.
- Answer blocks are visitor-facing copy, so they go to review before publication. The tracker and the markup are technical and do not.
- Assistants are consulted as a normal user would, within their terms.
- `scripts/gen-247-seo.js` is the right place for anything 247clinic publishes for machines.

## Open questions, for the user

- **Q1**: Which assistants matter to you, in order? ChatGPT, Gemini, Perplexity, Google AI Overviews, Copilot.
- **Q2**: Do we hold paid API access to any of them, or should the check use the normal interface?
- **Q3**: Is Russian a target language for 24/7 Clinic, or only for MedPark?
- **Q4**: Who are the three competitors you most want measured against by name?
