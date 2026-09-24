# HCIG report templates

**The reader is in a hurry.** Tables over prose. Headline plus one note. A page
can be long; a paragraph cannot. Client reports are one page.

---

## 1. One-page client report (his standard)

For anything he delivers to MedPark, HCIG management or a partner.

- **Headings are his own questions, word for word.**
- Structure: **Problem → Solution → Expectation → Notes**.
- Draft the table first, then cut every sentence that is not a fact, decision
  or date.

```
# [his question, verbatim]

[date] · Mohamed Amin · for [reader]

## Problem
| Issue | Evidence |
|---|---|
| The site opens on four addresses. | Checked 1 Sep 2026: 4 variants return 200. |

## Solution
| Fix | Effort |
|---|---|
| Redirect three addresses to one. | 1 hour |

## Expectation
| After | Measure |
|---|---|
| One address in Google. | Search Console, 4 weeks |

## Notes
- [fact, decision or date only]
```

## 2. Status report ("Where the work stands")

**Generated, not written.** Update `content/registry.js`, run `npm run report`.
Output groups: Waiting on you · Stuck on someone · Being built · Approved, ready
to go live · Live. Each line: **name** (brand) link, then one line.

## 3. Audit report

```
# [Site] audit

[date] · [n] findings · [n] P0

| # | Finding | Evidence | Impact | Fix | Priority |
|---|---|---|---|---|---|
| 1 | Mobile home loads in 13.6 s | PageSpeed, 7 Sep 2026 | Visitors leave | Stop preloading hero video | P0 |
```

- P0 blocks revenue or safety. P1 hurts. P2 is polish.
- Evidence is a measurement with a date. No evidence, no finding.
- Method at the foot, in two lines.

## 4. Review pack (what to approve)

```
# [Project] · for your review

[date] · Mohamed Amin · for Irina Rise

**Look at:** [link]
**Decide:** [the one decision]
**By:** [date]

| Page or item | Link | What changed |
|---|---|---|

## Questions only you can answer
1. [question] Why: [one line]
```

## 5. Open items document

Pattern: `docs/247clinic-open-items.md`. Pages under review carry no notes;
every open question lives here.

```
# [Project]. What is still open.

Date: [date]

## 1. [the problem as a statement]
| Where | Value |
|---|---|
**Needed:** [what, from whom]
```

## 6. Weekly 3P update (team)

Progress, Plans, Problems, from `internal-comms`, in this voice.

```
# Week of [date]

**Progress**
- [shipped thing] ([number])

**Plans**
- [thing] by [date]

**Problems**
- [blocker] · needs [person]
```

Three to five lines per section, maximum.

## 7. Meeting notes

```
# [Meeting] · [date]

**Decided**
- [decision] · owner · date

**Actions**
| Action | Owner | Due |
|---|---|---|

**Open**
- [question] · who answers
```

No transcript, no discussion summary.

## 8. Proposal summary

One page in front of any long proposal: the problem in one line, the proposal
in three lines, the cost or effort, the decision needed, the date. The long
version follows, using `doc-coauthoring` for structure.

---

## Layout for .docx and .pdf

- A4, 16mm margins, logo top left on white.
- Title, then the meta line with middle dots: `date · author · for reader`.
- Brand accent only on rules and heading marks. Body text black or navy.
- Tables full width, hairline rows, header row bold, numbers right aligned with
  tabular figures.
- Callouts carry a word: **Critical**, **Note**, **Done**. Never colour alone.
- Page numbers bottom right on documents over one page.
- Links written out in full in PDFs that may be printed.
