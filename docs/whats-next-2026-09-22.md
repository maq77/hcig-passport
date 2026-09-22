# What is next

22 Sep 2026 · Mohamed Amin · after closing MedPark

## MedPark is closed, except one thing

| Done today | Result |
|---|---|
| Speed | 68 to **88**. Hero video 2,895 KB to 766 KB. Critical path 527 KB to 190 KB. Page weight 4,090 KB to about 1,024 KB. |
| Sitemap | 15 entries to **52**. German and Polish are now pages in their own right, not annotations. x-default on every one. All 52 verified 200 before deploying. |
| German homepage | Carried the English description word for word. Now German, leading with "Krankenhaus". |
| Tracking | Confirmed on our own property, and confirmed still firing after the speed work. |

**The one open item is yours to answer.**

`/hospitals-in-hurghada/` is live and says "Allianz, AXA, Cigna, Bupa direct
billing". The review on 19 Sep removed exactly that claim and it came back.

Does MedPark hold direct billing agreements with those four named insurers?
Yes and it stays. No and it comes down today. I have not reworded it, because
guessing at an insurance claim is worse than asking.

## Next, in the order I would do it

| # | Job | Why now | Needs |
|---|---|---|---|
| 1 | **24/7 website** | Your call, and the real work. | You and me together |
| 2 | Rewrite `healthhub.php` and `emergency-urgent-care` titles and descriptions | 1,266 impressions producing 7 clicks. Biggest single visibility loss left on MedPark. | Your review, it is copy |
| 3 | Google Business Profile and reviews | "hospital hurghada" clicks go to the map, not the site. 270 impressions, zero clicks. | Who owns the profile |
| 4 | Google Ads search campaigns | You said later. Plan exists. | Your word |

## What we will retry, and why it failed

Every one of these failed for the same reason: **the internet here drops**.
None of them are broken. They just need running again on a good connection.

| Ticket | What it is | What happened |
|---|---|---|
| T-013 | 24/7 DE, PL, CS translations | The worker reported launching three translators, then never committed. Branch is empty. Starts from zero. |
| T-015 | 24/7 inner pages | Worker lost when the hub stopped. |
| T-019 | Prove every 24/7 event fires | Blocked for a different and better reason. See below. |
| T-011-CR to T-021-CR | Four second opinions | All died on `dial tcp: lookup ... no such host`. Closed rather than retried: three are moot now. |

I have written the internet fact into HCIG memory, so no future session wastes
time blaming a server, a site or a worker for it.

**T-019 is the exception.** It did not fail on the connection. A critic caught
that the worker tested on `localhost`, and our own new rule makes tracking
abort on localhost by design. So no event could fire and the evidence proved
nothing. That is the rule working correctly. The qa-tester role has been taught
it so it cannot happen again.

Its real answer stands: 24/7 has no GA4 property configured at all. `id` is an
empty string. Nothing can fire anywhere until you say which property
247clinic.net reports into.

## Features still to add

**Built and running, needs nothing from you**

- Watchdog: crawls the live sites nightly at 03:30, confirms every fault twice,
  groups by kind, never files a duplicate, and stays silent when clean.
- Before and after screenshots on any branch, desktop and phone.
- Our own traffic excluded from the numbers, with the method written down.

**Ready to build, waiting on a decision**

| Feature | Waiting on |
|---|---|
| 24/7 inner pages and hotel pages | Which landing page design won |
| 24/7 translations, DE, PL, CS | Same, plus your review of the copy |
| 24/7 measurement switched on | Which GA4 property |
| MedPark `srcset` images | Nothing. Small win, I held it because Lighthouse's advice would have made them blurry on phones. |
| Numbers page, AI visibility, internal links, local and partners | Four specs written, all still draft. They cannot start until you approve each spec. |

**Deliberately not done on MedPark**

Contrast fix and removing unused CSS. Both can change what you see, and you
said you like the site. They need showing to you first, not shipping.

## The six-initiative plan, where each one stands

The watchdog was one of six specs written on 21 Sep. Here is the whole plan.

| # | Initiative | Spec | Built | What it is |
|---|---|---|---|---|
| 001 | Measurement foundation | approved | **most of it** | One tracking module, consent first, our own traffic excluded. |
| 005 | Site watchdog | approved | **all 11 requirements** | Nightly crawl, confirm twice, group, never duplicate, silent when clean. |
| 002 | The numbers page | draft | nothing | One page: visits, calls, WhatsApp presses, per site and per language. |
| 003 | AI visibility | draft | nothing | Get cited by ChatGPT, Gemini and Perplexity. Weekly citation tracker. |
| 004 | Internal links | draft | nothing | One keyword-to-page map, contextual links generated at build. |
| 006 | Local and partners | draft | nothing | Hotel pages with per-hotel QR codes, Business Profile posting. |

**Four of the six cannot start.** The spec gate refuses any ticket whose spec
is still draft. That is working as designed. You approve a spec, then work
begins.

### 005, the watchdog: one piece left

All 11 requirements are built and running. One is built but not enforced.

FR-010 and SC-004 say a changed page must have a before and after image
**attached to its review, before the branch is merged**. The tool does that.
It is not wired into the merge step, so a reviewer has to remember to run it.
That is the last honest gap in the watchdog, and it is small.

### 001, measurement: one thing blocks it

FR-001 says every site we control loads a GA4 tag on every page, in every
language. MedPark does. **24/7 does not.** Its measurement ID is an empty
string, so nothing fires anywhere on it.

That is not a code fix. You have to say which GA4 property 247clinic.net
reports into. Until then 001 cannot close, and 002 cannot start, because a
numbers page with no numbers from 24/7 is a page that lies.

### The order these have to happen in

    001 measurement  ->  002 numbers page
                     ->  006 local and partners (needs per-hotel counting)
    004 internal links  ->  003 AI visibility (answers need somewhere to link)

002 depends on 001. 006 depends on 001 for per-hotel attribution. 003 is
stronger after 004. Only 004 could start on its own today.

## Then 24/7

Nothing on 24/7 has been touched. Four tickets are held on purpose, not stuck.
When you are ready, the first question is the one that unblocks everything
else: which of the four landing page designs won.
