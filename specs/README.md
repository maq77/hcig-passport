# The programme, 2026-09-21

Ten ideas were approved. They are grouped into six initiatives, because several of them are
the same piece of work and some cannot start before others.

Every spec here is `Status: draft`. The Hive dispatcher refuses to start a worker on any
ticket carrying one of these epics until its spec says `Status: approved`. That is
deliberate. Approval is one decision per initiative, made after reading the spec, not a
blanket yes.

## The six

| # | Initiative | Covers | Depends on |
|---|---|---|---|
| 001 | Measurement foundation | idea 5 | nothing |
| 002 | The numbers page | idea 10 | 001 |
| 003 | AI visibility | ideas 1, 2, 4 | nothing |
| 004 | Internal links | idea 3 | nothing |
| 005 | Site watchdog | ideas 8, 9 | nothing |
| 006 | Local and partners | ideas 6, 7 | 001 |

## What the survey changed

Reading the repo before writing the specs changed two of the ten materially. Both are worth
knowing before approving anything.

**Idea 5 is smaller than it looked, and more urgent.** The hotel landing pages already fire
`clinic_view`, `phone_click`, `whatsapp_medical_click` and `clinic_directions_click`. The
code is in `scripts/lp/data.js` and it starts with `if (!window.gtag) return;`. No GA4 tag
is loaded anywhere in this repo. So the instrument is built and the receiver is missing, and
every one of those events has been silently discarding itself. This is mostly a fix, not a
build.

**Idea 6 is half built.** `scripts/lp/` already generates hotel landing pages for Premier Le
Reve, Steigenberger Ras Soma and Amwaj Beach Club, four designs each. What is missing is the
route from a hotel room to those pages and a way to tell which hotel worked.

Two smaller findings. There is no internal linking helper anywhere, so 004 starts from
nothing but real keyword evidence in `docs/247clinic-keywords.md`. And `scripts/gen-247-seo.js`
already writes an `llms.txt` and a film sitemap for 247clinic.net, so part of 003 has a
pattern to follow rather than invent.

## Suggested order

**Start now, in parallel:**

- **001** because everything about money depends on it, and because it is currently losing data every day.
- **005** because it is purely technical, touches no copy, and stops the site breaking quietly while the rest is built.
- **003, tracker half only** (the weekly citation check). It is independent, and it sets the baseline that proves the rest of 003 worked.

**Next, once 001 is recording:**

- **002**, which is only useful once there is something to show.
- **006**, which cannot prove anything about a hotel until scans and contacts are counted.

**Any time:**

- **004**, and the answer-block half of 003. Both produce copy, so both wait on review anyway.

## Roughly how many tickets

| Initiative | Tickets | Mostly |
|---|---|---|
| 001 | 7 | code, QA, one compliance |
| 002 | 4 | backend and frontend |
| 003 | 6 | research, backend, content |
| 004 | 4 | keyword work, backend |
| 005 | 6 | backend, QA |
| 006 | 6 | backend, design, Maps |

About 33 in total. They are not created yet. Tickets follow an approved spec, not the other
way round, otherwise the board fills with work that turns out to be wrong.

## What is blocked on you

Nothing can be finished without these. They are in the specs too, gathered here so they can
be answered in one sitting.

**Money and access**

1. Does a Google Analytics property already exist for any domain, and who owns the account? If an agency owns it, we want it moved.
2. Is there Search Console access for all domains, and under which account?
3. Who controls the Google Business Profile for each location, and do we have access?
4. Do we hold paid API access to ChatGPT, Gemini or Perplexity, or should the citation check use the normal interface?

**Facts only you know**

5. Is the WhatsApp number in `scripts/lp/data.js` the one that should receive every message, on every site, in every language? Does MedPark use a different one?
6. Where is medparkhospitals.com actually edited? It is not built from this repo, and three of these initiatives need to touch it.
7. Which of the three hotels is an agreed partnership today, and which is a proposal? That decides what may be printed.
8. Who answers reviews today, and in which languages?
9. Is Russian a target language for 24/7 Clinic, or only for MedPark?

**Decisions that are yours**

10. Who should be able to open the numbers page: you, the team, or a client? That decides whether it needs a login.
11. Should generated internal links sit in a block at the end of a page, or inside the text? A block is safer for approved copy. Inside the text is stronger for search.
12. How should a critical fault reach you at 3am: a ticket waiting in the morning, a red alert on the dashboard, or something louder?
13. Which three competitors do you most want measured against by name?

## How to approve

Read a spec. If it is right, say so and I will set `Status: approved` in it, create its
tickets, and start the workers. If something is wrong, say what, and it gets fixed in the
spec before any ticket exists.

Approving one does not approve the rest. 001 and 005 are the two worth reading first.
