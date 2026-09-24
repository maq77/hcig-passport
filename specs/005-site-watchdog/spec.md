# Feature Specification: Site watchdog

**Feature Branch**: `005-site-watchdog`

**Created**: 2026-09-21

**Status**: approved

**Approved**: 2026-09-21 by Mohamed Amin. Implementation assigned to agy to save Claude tokens. Review and merge stay with the head.

**Input**: A nightly crawl of the live sites that files Hive tickets for anything broken, plus visual regression screenshots on merge.

## Why

Today a broken live site is found when Mohamed happens to open it. That is the wrong person
doing the wrong job at the wrong time.

`check.js` already checks the built output well: broken links, missing assets, leaked
template tokens, missing h1, missing main, missing alt text, unsafe external links. All of
that runs before a deploy, on files, in this repo.

Nothing watches the live sites after they are deployed, and nothing watches the sites that
are not built from this repo at all, which includes MedPark.

The fleet already has a scheduler and a ticket system. This connects the two.

## User Scenarios & Testing

### User Story 1 - The site tells us it is broken (Priority: P1)

Every night the live sites are crawled. Anything broken becomes a Hive ticket by morning,
with enough detail to act on without investigating first.

**Why this priority**: It moves the cost of finding problems from Mohamed to the machine,
every single night, forever.

**Independent Test**: Break something on a staging copy, run the crawl, and confirm a ticket
appears naming the page and the problem.

**Acceptance Scenarios**:

1. **Given** a page returns an error or stops resolving, **When** the nightly crawl runs, **Then** a ticket exists by morning naming the URL, what is wrong, and when it was last seen working.
2. **Given** a page quietly becomes noindex, **When** the crawl runs, **Then** that is raised as critical, because it removes the page from search.
3. **Given** nothing is wrong, **When** the crawl runs, **Then** no ticket is created and no notification is sent. Silence means healthy.
4. **Given** the same fault is found on twenty pages, **When** tickets are created, **Then** it is one ticket listing twenty pages, not twenty tickets.

---

### User Story 2 - A design change cannot break a page unseen (Priority: P2)

When a worker's branch is merged, the pages it touched are shown before and after, so a
visual break is caught by looking rather than by hoping.

**Why this priority**: The review gate already reads diffs. A diff does not show that a hero
collapsed on a phone.

**Independent Test**: Merge a change that breaks a layout on purpose and confirm the
difference is visible in the comparison.

**Acceptance Scenarios**:

1. **Given** a branch changes a page, **When** it reaches review, **Then** a before and after image of that page exists at desktop and phone width.
2. **Given** a page moved by more than a trivial amount, **When** the reviewer looks, **Then** the changed area is marked rather than left to be spotted.
3. **Given** a page did not change, **When** the comparison runs, **Then** it is reported as unchanged and no image needs looking at.

---

### User Story 3 - Speed is watched, not assumed (Priority: P3)

The pages that matter are measured for loading speed on a schedule, and a real drop becomes
a ticket.

**Why this priority**: Speed decays quietly as images and scripts are added. P3 because a
broken page costs more than a slow one.

**Acceptance Scenarios**:

1. **Given** a weekly speed measurement, **When** a key page gets materially slower than its own baseline, **Then** a ticket is created naming the page and what grew.
2. **Given** the measurement tool fails or is rate limited, **When** the run finishes, **Then** it records a failure and creates no ticket, because a failed measurement is not a slow page.

### Edge Cases

- The site is briefly down for an unrelated reason. One failed crawl is not proof, so a fault must be confirmed before it wakes anyone.
- A page is deliberately noindex, like the HCIG Work portal, which is noindex by design in `build.js`. Deliberate must never be reported as broken.
- The crawler is blocked or rate limited by the host and mistakes that for the site being down.
- A ticket is filed every night for a fault already known and already ticketed.
- The crawl hits a form or a contact link and triggers a real message to the clinic. It must never do that.

## Requirements

### Functional Requirements

- **FR-001**: The live sites MUST be crawled on a schedule, without anyone starting it.
- **FR-002**: The crawl MUST check at least: response status, whether the page is indexable, canonical, hreflang pairs, broken links, missing images, and valid structured data.
- **FR-003**: A fault MUST be confirmed by a second attempt before a ticket is created.
- **FR-004**: Faults of the same kind MUST be grouped into one ticket listing the affected pages.
- **FR-005**: A fault already ticketed and still open MUST NOT create a second ticket.
- **FR-006**: Anything that removes a page from search MUST be raised as critical.
- **FR-007**: Pages that are deliberately not indexed MUST be listed as expected and never reported as faults.
- **FR-008**: The crawl MUST NOT submit any form, send any message, or trigger any contact path.
- **FR-009**: A clean crawl MUST produce no ticket and no notification.
- **FR-010**: Every page changed on a branch MUST have a before and after image at desktop and phone width before it is merged.
- **FR-011**: A failed measurement MUST be recorded as a failure and MUST NOT be reported as a result.

### Key Entities

- **Crawl**: One scheduled pass over one site, with its date and result.
- **Finding**: One fault on one page, with its kind, its severity and when it was first seen.
- **Baseline**: What a page looked like, and how fast it was, the last time it was known good.
- **Comparison**: A before and after pair for one page at one width.

## Success Criteria

- **SC-001**: A broken live page is ticketed before Mohamed sees it, for three months running.
- **SC-002**: Zero tickets for faults that are deliberate. A single false alarm of this kind means the watchdog gets ignored.
- **SC-003**: No duplicate ticket is ever created for a fault already open.
- **SC-004**: Every merged branch that changed a page has a before and after image attached to its review.
- **SC-005**: No message, form or contact path is ever triggered by the crawl. Verified by checking with the clinic that no test messages arrived.
- **SC-006**: A clean night produces no notification of any kind.

## Assumptions

- The Hive scheduler in `hive/lib/schedule.js` is the right place for the schedule, since it already runs jobs and already creates tickets.
- `check.js` stays responsible for the built output before deploy. This watches what is live after deploy. The two do not merge.
- The watchdog reports and tickets. It never fixes anything by itself on a live site.
- Deploying remains the head's job, per the standing rule.

## Open questions, for the user

- **Q1**: Which domains should be watched, in order? 247clinic.net, medparkhospitals.com, medcierge.com, anything else.
- **Q2**: How should a critical fault reach you at 3am: a ticket waiting in the morning, a notification on the dashboard, or something louder?
- **Q3**: Is there a staging copy of any live site where breakage can be tested safely, or must testing avoid the live sites entirely?
