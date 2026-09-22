# Feature Specification: Internal links

**Feature Branch**: `004-internal-links`

**Created**: 2026-09-21

**Status**: approved
**Approved**: 2026-09-22 by the head, on the user's instruction "work with any best, you choose."
Chosen over 002 and 003 for three reasons. It is the only one of the four with no
dependency, so it can start today. It attacks the finding that actually caps growth:
MedPark is shown 5,398 times and clicked 139, and its pages barely link to each other.
And 003 is much stronger after it, because an answer block needs somewhere to link.
The user can reverse this and I will stop.

**Input**: A build step that maps keywords to pages and inserts contextual internal links across the estate.

## Why

MedPark has 50 URLs in its sitemap. The wider estate runs to hundreds of pages. Almost none
of them point at each other on purpose.

Internal links are the one ranking factor entirely inside our control. No outreach, no
budget, no waiting on anyone. They also help a real reader find the next thing, which is the
only test that matters.

There is no internal linking helper anywhere in the repo today, and no keyword to page map
in code. The keyword evidence exists as a document, `docs/247clinic-keywords.md`, which is a
start but not something a build can read.

## User Scenarios & Testing

### User Story 1 - Every page points somewhere useful (Priority: P1)

A reader finishing any page is offered the two or three pages that genuinely follow from it,
described in words that say where they lead.

**Why this priority**: It is the whole feature, and it works for readers and for search at
the same time.

**Independent Test**: Open any page, read the links offered at the end, and judge whether a
real person would want them.

**Acceptance Scenarios**:

1. **Given** any page, **When** it renders, **Then** it links to at least two other pages, each with anchor text that describes the destination rather than saying "click here" or "read more".
2. **Given** a page with no sensible relations, **When** it renders, **Then** it shows no links rather than filler.
3. **Given** two pages that both cover the same topic, **When** links are generated, **Then** they do not point at each other in a loop with no other way out.

---

### User Story 2 - Orphan pages are found and fixed (Priority: P2)

No page sits with nothing pointing at it.

**Why this priority**: An orphan page is invisible to search and to readers, however good it
is. Finding them is cheap and the fix is immediate.

**Independent Test**: Run the report and confirm the list of orphans matches what a crawl
finds.

**Acceptance Scenarios**:

1. **Given** the built estate, **When** the report runs, **Then** it lists every page that nothing links to.
2. **Given** an orphan is found, **When** it is reviewed, **Then** the report names at least one page it should be linked from and why.

---

### User Story 3 - Links stay right as the estate changes (Priority: P3)

A page that is renamed, moved or removed does not leave broken or misleading links behind.

**Why this priority**: An automated linker that rots is worse than no linker. P3 because the
existing checks already catch broken links, so this extends something that works.

**Acceptance Scenarios**:

1. **Given** a page is removed, **When** the site is built, **Then** no generated link points at it and the build says what changed.
2. **Given** a page is renamed, **When** the site is built, **Then** links follow the new name.

### Edge Cases

- A language page linking to a page in another language. That is a bad experience and must not happen by accident.
- The same anchor text used for many different destinations, which teaches search engines nothing.
- Too many links on one page, which dilutes every one of them and looks like spam.
- A link inserted into the middle of approved copy, changing how a sentence reads. Copy is reviewed, so generated links must not rewrite it.
- MedPark is not built from this repo, so whatever is generated for it has to be applied where that site is actually edited.

## Requirements

### Functional Requirements

- **FR-001**: There MUST be one map, readable by the build, from keyword and intent to the single page that should own it.
- **FR-002**: Every page MUST offer at least two contextual links to other pages, unless no sensible relation exists.
- **FR-003**: Anchor text MUST describe the destination. Generic anchors are forbidden.
- **FR-004**: A generated link MUST NOT alter, rewrite or reflow any approved sentence of copy.
- **FR-005**: Links MUST stay inside the same language. Cross-language links are only allowed where they are explicitly intended.
- **FR-006**: The number of generated links per page MUST be capped.
- **FR-007**: The build MUST report every orphan page, and every page that links out to nothing.
- **FR-008**: A removed or renamed page MUST NOT leave a broken generated link. The existing broken link check in `check.js` MUST still pass.
- **FR-009**: Two pages MUST NOT be allowed to own the same keyword, since that makes them compete with each other.
- **FR-010**: The map MUST be editable by a person without touching code.

### Key Entities

- **Keyword**: A phrase with a language and an intent behind it.
- **Page**: One URL on one site in one language. Owns zero or more keywords.
- **Link**: A generated pointer from one page to another, with its anchor text and why it exists.
- **Orphan**: A page nothing points at.

## Success Criteria

- **SC-001**: Zero orphan pages across the estate, measured by a crawl of the built output.
- **SC-002**: Every page has at least two inbound internal links, except pages deliberately excluded.
- **SC-003**: No keyword is owned by two pages on the same site in the same language.
- **SC-004**: `npm run check` passes with zero broken links after generation.
- **SC-005**: No approved sentence of copy is changed by this work. Verified by diffing the copy before and after.
- **SC-006**: A reader shown the generated links on ten sample pages agrees that they are useful. Judged by a person, not a score.

## Assumptions

- Anchor text is visitor-facing copy. New anchor wording goes to review before it publishes.
- `docs/247clinic-keywords.md` is real evidence and is the starting point for the map, not a finished map.
- This covers the sites built from this repo first. MedPark follows once its editing path is settled.
- The existing checks in `check.js` stay the safety net and are not weakened to make this pass.

## Open questions, for the user

- **Q1**: Should the generated links appear as a block at the end of a page, inside the text, or both? A block is safer for approved copy. Inside the text is stronger for search.
- **Q2**: Are there pages that must never be linked to automatically, for example anything under review or any preview URL?
- **Q3**: For MedPark, is there a way to apply generated links to the live site, or does that wait until the editing path is settled?
