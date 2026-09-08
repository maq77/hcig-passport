# 24/7 Clinic. In-hotel landing pages. Plan and proposal.

Prepared for review before development. Nothing is built yet.
Property: 247clinic.net. Date: 2026-09-07.

First stage, three clinics:

1. Steigenberger Resort, Ras Soma
2. Amwaj Beach Club, Abu Soma
3. Premier Le Rêve Hotel & Spa, Sahl Hasheesh

---

## 0. One thing found before planning, and one better idea

**All three hotels already exist as clinic records in the live database.** Each
carries GPS coordinates and a service list. This changes the job: we are not
inventing these clinics, we are giving three existing clinics a search-optimised
front door. It also means the map, the address and the schema can be generated
from data you already own, once three data problems are fixed:

- Premier Le Rêve has the **wrong coordinates** (copied from Long Beach Resort).
  Its pin would land in the wrong place.
- Every clinic shares one **placeholder WhatsApp number** (`1200018005`).
- The database name "Steigenberger soma bay" may or may not be the same property
  as the brief's "Steigenberger Resort Ras Soma". Needs one word from you.

**The better idea (item you invited).** Do not hand-build three pages that we
then copy 27 more times by hand. Build **one data-driven landing template** that
renders from a clinic record plus a small per-clinic content table. Launch the
three now. Then any of your 30 clinics becomes a new landing page by filling in
content, not by writing code. This is the difference between a one-off task and
a local-SEO asset that scales across the whole resort coast. It also guarantees
every future page inherits the same correct schema, canonical and tracking, so
the quality never drifts.

The rest of this document assumes that template approach, but every SEO and
content decision below applies equally if you prefer three standalone pages.

---

## 1. Recommended URL structure

Your instinct (location then hotel) is correct for SEO. Refined recommendation:

| Page | URL |
|---|---|
| Steigenberger, Ras Soma | `/soma-bay/steigenberger-clinic` |
| Amwaj Beach Club, Abu Soma | `/abu-soma/amwaj-beach-club-clinic` |
| Premier Le Rêve, Sahl Hasheesh | `/sahl-hasheesh/premier-le-reve-clinic` |

Why location first:

- It builds an **area folder** for each destination. A future `/sahl-hasheesh/`
  hub page can then target the pure area searches in your own examples ("clinic
  sahl hasheesh", "doctor sahl hasheesh", "medical assistance sahl hasheesh")
  without competing with the hotel pages.
- It is **scalable**. Thirty clinics fall naturally into six or seven area
  folders, which search engines read as a clean topical cluster under one
  authoritative domain. That is exactly the "keep the authority on the main
  site" goal in the brief.
- The slugs stay short, readable and keyword-rich. No stop words, no dates, all
  lower case, hyphenated, which matches how the existing app already routes.

Two open points for your call:

- **"Ras Soma" versus "Soma Bay".** "Soma Bay" is the recognised search term and
  the wider area; "Ras Soma" is the specific spot. I recommend the slug
  `soma-bay` for reach and using "Steigenberger Ras Soma" in the visible title
  and H1 for exact-match relevance. Confirm the two are the same property.
- Whether to also reserve `/hurghada/` as the parent, since all three sit in the
  Hurghada governorate. I recommend not nesting that deep now. Area-level is the
  right granularity for how guests search.

The final slugs are subject to the routing check in section 5, because these
become new culture-aware routes in the ASP.NET application.

---

## 2. Keyword research, per hotel

### Method and an honest note on volume

These are hyper-local, high-intent, near-zero-volume searches. Keyword tools
will report little or no monthly volume for "doctor Steigenberger Ras Soma",
and that is expected and not a problem. A guest who types that is in distress,
in the hotel, right now, ready to call. The strategy is therefore not chasing
volume. It is: **be the single most exactly-relevant result for every phrasing a
guest might use, in every language they use, so we win the click the moment the
need exists.** Once the pages are live we mine Search Console for the real
queries and fold them back in. That is where the true keyword data will come
from for terms this specific.

Search intents to cover on every page: emergency ("need a doctor now"),
proximity ("doctor near [hotel]"), service ("clinic", "medical", "pharmacy",
"dentist"), and reassurance ("English speaking doctor", "tourist clinic",
"insurance").

Guests at these three resorts are heavily German, and also Russian, Polish,
Czech and Italian. Steigenberger in particular is a German brand with a large
German guest base. Language targeting is a real lever here and is covered in
section 5. The keyword lists below are English; the same matrix is produced per
active language.

### 2.1 Steigenberger Resort, Ras Soma / Soma Bay

- Primary: doctor Steigenberger Ras Soma, clinic Steigenberger Soma Bay, doctor
  at Steigenberger Ras Soma, medical clinic Steigenberger Soma Bay
- Proximity: doctor near Steigenberger Soma Bay, clinic near Steigenberger,
  nearest doctor Soma Bay
- Area: doctor Soma Bay, clinic Soma Bay, medical assistance Soma Bay, pharmacy
  Soma Bay, hospital near Soma Bay, English speaking doctor Soma Bay
- Service and reassurance: tourist doctor Soma Bay, 24 hour doctor Soma Bay,
  doctor hotel Soma Bay, fit to fly certificate Soma Bay, diving fitness
  certificate Soma Bay
- German seed set (illustrative): arzt Steigenberger Soma Bay, arzt Soma Bay,
  klinik Soma Bay, arzt in der nähe Soma Bay, deutscher arzt Soma Bay

### 2.2 Amwaj Beach Club, Abu Soma

- Primary: doctor Amwaj Beach Club, clinic Amwaj Abu Soma, doctor at Amwaj,
  medical clinic Amwaj Beach Club
- Proximity: doctor near Amwaj Beach Club, clinic near Amwaj, nearest doctor
  Abu Soma
- Area: doctor Abu Soma, clinic Abu Soma, medical assistance Abu Soma, pharmacy
  Abu Soma, English speaking doctor Abu Soma
- Service and reassurance: tourist doctor Abu Soma, 24 hour doctor Abu Soma,
  hotel doctor Amwaj, fit to fly Abu Soma, diving fitness certificate Abu Soma
- German seed set: arzt Amwaj Abu Soma, arzt Abu Soma, klinik Abu Soma

### 2.3 Premier Le Rêve Hotel & Spa, Sahl Hasheesh

- Primary: doctor Premier Le Rêve, clinic Premier Le Rêve Sahl Hasheesh, doctor
  in Premier Le Rêve, medical clinic Premier Le Rêve
- Proximity: doctor near Premier Le Rêve, clinic near Premier Le Rêve, nearest
  doctor Sahl Hasheesh
- Area: doctor Sahl Hasheesh, clinic Sahl Hasheesh, medical assistance Sahl
  Hasheesh, pharmacy Sahl Hasheesh, English speaking doctor Sahl Hasheesh,
  hospital Sahl Hasheesh
- Service and reassurance: tourist doctor Sahl Hasheesh, 24 hour doctor Sahl
  Hasheesh, hotel doctor Premier Le Rêve, fit to fly Sahl Hasheesh, diving
  fitness certificate Sahl Hasheesh
- Accent note: index both "Le Rêve" and "Le Reve". Most guests type without the
  circumflex, so the slug and alt keywords use "le-reve" / "le reve", and the
  visible copy keeps the correct "Le Rêve".
- German seed set: arzt Premier Le Reve, arzt Sahl Hasheesh, klinik Sahl Hasheesh

I recommend running live Search Console and Google autocomplete validation on
these as the first step after approval, so we tune the exact H1 and title
wording to real phrasings before the copy goes to the reviewer.

---

## 3. Page structure and wireframe (mobile first)

One template, conversion-first, no corporate preamble. Order top to bottom on a
phone:

1. **Sticky top bar**: 24/7 Clinic logo, and a permanently visible CALL button.
2. **Hero, above the fold**
   - H1: "Need a Doctor at [Hotel Name]?"
   - One line: "24/7 Clinic serving [Hotel Name], [Area]. English speaking
     doctors, open 24 hours."
   - Three thumb-sized buttons, in this order and colour:
     - **CALL NOW** (primary, high contrast)
     - **WHATSAPP** (green, per brand rule)
     - **FIND THE CLINIC** (scrolls to map / opens directions)
   - A trust strip under the buttons: "Inside the resort. Response in minutes.
     Insurance assistance." No image carousel above the fold, nothing that
     delays the buttons.
3. **Where to find us**: plain-language location inside the hotel (for example
   "next to the main reception"), the map, and a Directions button.
4. **What we treat**: the service list, drawn from your 11 real services, phrased
   for a worried guest, not a brochure. Doctor consultation, medical
   examination, minor illness and injury, medication, laboratory coordination,
   ambulance, hospital referral, insurance assistance, medical reports, fit to
   fly and diving certificates.
5. **For international guests**: languages spoken, insurance help, medical
   reports for claims. This is the reassurance block.
6. **Photographs**: real clinic photos with descriptive alt text.
7. **Opening hours and contact**: 24/7 stated plainly, phone, WhatsApp, address.
8. **FAQ**: 6 to 8 questions written from real guest searches (see below).
9. **Footer**: link back to the main site and to the other clinic pages, for
   internal linking.
10. **Sticky bottom bar on mobile**: CALL and WHATSAPP always in reach while
    scrolling. This single element usually moves conversion the most.

FAQ seed questions (tuned per hotel): Is there a doctor at [hotel]? How fast can
a doctor come to my room? Do you speak English and German? Do you take my travel
insurance? How much does a visit cost? Where exactly is the clinic? Can you give
me a medical report for my insurance? Can you do a fit to fly certificate?

---

## 4. SEO title and H1, per page

Draft, for tuning against live query data and then reviewer sign-off.

**Steigenberger, Ras Soma**
- Title: `Doctor at Steigenberger Ras Soma | 24/7 Clinic Soma Bay`
- Meta description: `Need a doctor at Steigenberger Ras Soma? 24/7 Clinic serves
  the resort with English speaking doctors, open 24 hours. Call or WhatsApp now.`
- H1: `Need a Doctor at Steigenberger Ras Soma?`

**Amwaj Beach Club, Abu Soma**
- Title: `Doctor at Amwaj Beach Club | 24/7 Clinic Abu Soma`
- Meta description: `Need a doctor at Amwaj Beach Club, Abu Soma? 24/7 Clinic
  with English speaking doctors, open around the clock. Call or WhatsApp now.`
- H1: `Need a Doctor at Amwaj Beach Club?`

**Premier Le Rêve, Sahl Hasheesh**
- Title: `Doctor at Premier Le Rêve | 24/7 Clinic Sahl Hasheesh`
- Meta description: `Need a doctor at Premier Le Rêve, Sahl Hasheesh? 24/7 Clinic
  with English speaking doctors, open 24 hours. Call or WhatsApp now.`
- H1: `Need a Doctor at Premier Le Rêve?`

H2 structure is common across pages but the text under each is unique per hotel:
Where to find us, What we treat, For international guests, Opening hours, FAQ.

Titles stay within about 60 characters, descriptions within about 155.

---

## 5. Technical SEO setup

- **Unique everything.** Title, description, H1, body, FAQ and alt text are
  written per hotel. No cloned pages with a swapped name. The template holds the
  layout; the content table holds the words.
- **Canonical** self-referencing on each page, absolute URL, lower case.
- **Schema, per page**:
  - `MedicalClinic` (a LocalBusiness subtype) with name, the parent 24/7 Clinic
    / HCIG organisation, full address, geo coordinates, telephone, WhatsApp,
    `openingHoursSpecification` for 24/7, `areaServed` the hotel and area,
    `availableService` from the service list, and `medicalSpecialty`.
  - `FAQPage` for the FAQ block.
  - `BreadcrumbList` for area then hotel.
  - This directly answers the brief's "review whether LocalBusiness /
    MedicalClinic schema can be implemented". Answer: yes, and the geo and
    address are already in your data once the Premier Le Rêve coordinates are
    fixed.
- **The four site-wide bugs that would sabotage these pages, fixed first.** These
  are pre-existing and documented separately, but they matter here:
  1. The sitemap currently returns a 500 and lists nothing. It must be rebuilt so
     the three new URLs are actually discoverable.
  2. Every missing URL currently 302s to a page that returns 200, so the site has
     no real 404. This has to be corrected or Google keeps indexing junk.
  3. Four existing pages render a blank title from missing database rows. Same
     mechanism these pages rely on, so it gets fixed as part of the work.
  4. `noindex` and canonical handling must be verified on the rendered page, not
     the template, before launch.
- **hreflang**, if German or Polish versions are built, reciprocal tags across
  language variants plus `x-default`.
- **Internal links**: the main navigation or the clinics page links to each new
  page; each new page links back to the main site and across to its siblings.
  New pages must not be orphans.
- **Sitemap inclusion**: the three URLs (and their language variants) added to
  the rebuilt dynamic sitemap automatically.
- **Indexing**: submit each URL in Search Console and request indexing at launch;
  confirm the rendered head shows index, correct canonical and the schema
  validates in the Rich Results test.
- **Routing note**: the site is ASP.NET Core Razor Pages. These become new
  culture-aware routes. The existing route config covers some pages and not
  others, so the routes for these pages are added explicitly and tested locally
  before anything ships.

---

## 6. Tracking setup

Assumes GA4, Search Console and the HCIG own-tracking tag are in place, per your
note. Confirm the 247clinic GA4 property and measurement ID; the live site
currently shows no GA4, so this may still need creating.

- **GA4 events**, each fired on interaction and marked as a key event
  (conversion):
  - `call_click` on every tel: link (hero, contact block, sticky bar)
  - `whatsapp_click` on every WhatsApp link
  - `directions_click` on the map and Find the Clinic buttons
  - `contact_action` for any other contact tap
  - page views are automatic; each page keeps a distinct path so it reports
    separately
  - each event carries the hotel and area as parameters, so one report compares
    all clinics side by side
- **Separate reporting per page**: because each landing page is a distinct URL
  with distinct event parameters, GA4 and Search Console both segment them
  cleanly. In Search Console you monitor impressions, clicks and the actual
  search queries per URL, which is also our keyword-validation feedback loop.
- **Own tracking tag**: added to the template. Because Cloudflare sits in front
  of this site, we verify the tag is not cached or blocked at the edge, which is
  a known trap on this property.
- **Consent**: the app already has a cookie consent mechanism; tracking respects
  it.

---

## 7. What we need from you

Per hotel (the template is blocked on these):

1. Confirm the hotel identity, especially Steigenberger: is the database's
   "Steigenberger soma bay" the same property as "Steigenberger Resort Ras
   Soma"? If they are two different Steigenberger properties, tell us which one.
2. Is the clinic physically **inside** the hotel, or serving it from nearby? The
   H1 and copy depend on this being accurate. It is a medical claim, so it has
   to be exact.
3. The exact location description inside each hotel (building, floor, near which
   landmark).
4. **Real WhatsApp number** per clinic. The database value is a placeholder.
5. **Real phone number** per clinic, and whether one central number serves all.
6. Opening hours. Confirm genuinely 24/7 at each, or the real hours.
7. **Verified GPS coordinates**, especially Premier Le Rêve, whose stored
   coordinates are wrong. A pin in the wrong place on a medical page is a safety
   problem.
8. **Clinic photographs** per hotel: exterior or signage, interior, staff or
   doctor, equipment. Real photos, not stock.
9. Whether to show doctor names and credentials. If yes, we need them, and this
   touches medical compliance.
10. Which languages each page should exist in. German is a strong candidate for
    all three, given the guest mix. This ties into the open question of which
    languages the brand supports.
11. Insurance partners accepted at each clinic, if we name them.
12. **Affiliation and trademark**: are these clinics officially inside or endorsed
    by each hotel, or independent clinics that serve the hotel's guests? Using a
    hotel's name in a URL and title is fine when it is factually accurate and we
    do not imply an endorsement that does not exist. If there is an official
    arrangement, we can say so and it strengthens the page. If not, we phrase it
    as "serving guests of" rather than "inside". This needs to be right before
    launch, both legally and for trust.

Platform, once:

13. Confirm or create the 247clinic GA4 property and share the measurement ID.
14. Confirm Search Console access for 247clinic.net.

---

## 8. Sequence

1. You approve URL structure, approach and this plan.
2. Fix the four site-wide SEO bugs (sitemap, 404, blank titles, canonical),
   because the pages depend on them. Local first, then a separate publish
   decision.
3. Live keyword and query validation, tune titles and H1s.
4. Build the data-driven landing template locally, on the recovered source.
5. Write the three pages' unique content; copy goes to the reviewer.
6. Fix the three data problems (Premier Le Rêve coordinates, real WhatsApp
   numbers, Steigenberger identity).
7. Wire schema and tracking, validate locally.
8. You review on a private preview. You approve.
9. Publish, submit to Search Console, request indexing.
10. Watch Search Console for real queries, iterate.

Development does not start on the final pages until you approve steps 1 to 3.

---

## Appendix: related requests in the same message

**Admin access for you.** Handled directly and separately from this plan. Short
version: there is a fast route to get you into the admin panel now, and a proper
named account for you as the clean long-term answer. Details and a question in
the chat, because it involves credentials that do not belong in a document.

**Modernising the admin dashboard.** A real opportunity and a genuine project in
its own right. One correction first: we recovered the source of the main public
website, but the admin panel is a **separate, older application** whose source we
have not pulled yet. The strong recommendation is not to renovate the old admin
in place, but to build a modern admin into the main application when we move it
to a current .NET version, so there is one codebase, one login and one modern
interface. That admin would let you edit every page's title and content (killing
the blank-title problem for good), manage clinics with correct coordinates and
WhatsApp numbers, manage these landing pages, export the 72 captured newsletter
emails that were never synced, edit German and Polish content, and show GA4,
Search Console and own-tracking figures in one place. This is scoped and
estimated separately once you tell us how far you want to take it.
