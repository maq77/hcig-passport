# 24/7 Clinic landing pages. What is still open.

Kept separate on purpose. **The three landing pages carry no notes, no markers
and no placeholders.** They read as they will read on 247clinic.net. Everything
still needing an answer lives here.

Date: 2026-09-08. Pages: Premier Le Rêve, Steigenberger Ras Soma, Amwaj Beach Club.

---

## 1. Two phone numbers are in circulation

| Where | Number |
|---|---|
| 247clinic.net footer | +20 122 112 2246 |
| Their own films, Instagram bio, LinkedIn and company listings | **+20 122 222 8247** |

The pages use **+20 122 222 8247**, because that is the number guests are
already given on every piece of marketing the clinic publishes.

**Needed:** one word confirming which number a guest should press, and the real
WhatsApp number. The clinic database still shares the placeholder `1200018005`
across every clinic.

## 2. The Premier Le Rêve pin in their own data is 7.0 km wrong

Their live map data serves these coordinates:

| Clinic | Their data | Checked position | Gap |
|---|---|---|---|
| Premier Le Rêve, Sahl Hasheesh | 27.082139, 33.858906 | **27.024343, 33.887027** | **7.0 km** |
| Steigenberger Ras Soma, Soma Bay | 26.864616, 33.959997 | 26.863468, 33.961233 | 160 m, agrees |
| Amwaj Beach Club, Abu Soma | 26.813892, 33.945503 | 26.813385, 33.945688 | 60 m, agrees |

Premier Le Rêve carries **Long Beach Resort's coordinates**, digit for digit.
The landing pages use the checked position, so their maps are right. The clinic
database is still wrong and every other product reading it is still wrong.

Checked against OpenStreetMap on 2026-09-08.

**Needed:** fix the record in the clinic database.

## 3. "Steigenberger soma bay" is Steigenberger Resort Ras Soma

Their stored pin sits **160 m** from Steigenberger Resort Ras Soma, KM 55 on the
Hurghada to Safaga road. That is the same property.

**Needed:** a nod from Irina, not research. The evidence is already conclusive.

## 4. Photographs for Steigenberger and Amwaj

Every photograph and every second of film on these pages was shot at the Sahl
Hasheesh clinic. The Premier Le Rêve page is therefore fully its own. The other
two use network photography.

**Needed:** photographs of each clinic. Exterior or signage, reception,
treatment room, and the team.

## 5. The walk into the clinic, for the other two hotels

Premier Le Rêve has a filmed walkthrough, so its page has three real steps, a
drawn plan and the film. Steigenberger and Amwaj have generic arrival steps
instead.

**Needed:** where the clinic sits at each hotel, building and floor, and the walk
from the main entrance. A phone video walking it is enough, exactly as was done
for Sahl Hasheesh.

## 6. Languages

The pages claim English, plus German, Italian and French. That is evidenced by
the clinic's own published guest reviews, which are written in those languages.

**Needed:** the formal list per clinic, so the schema and any future translated
pages are right rather than inferred.

## 7. Guest reviews

The reviews on the pages are published by 24/7 Clinic on 247clinic.net, quoted
exactly, with the names as published. The English line under each is a
translation and says so.

**Needed:** confirmation that reusing them on the landing pages is fine.

## 7b. A Google Maps listing already exists, and it confirms the position

The live map on the Premier Le Rêve page shows **"24/7 Clinic" as a listed place
on Google Maps**, carrying the clinic icon, immediately beside Premier Le Rêve
Hotel & Spa. It sits within metres of the position this page uses, which is
independent confirmation that 27.024343, 33.887027 is right and their stored
27.082139, 33.858906 is wrong.

**Needed:** who owns and manages that Google Business Profile, and whether the
other clinics have one. For a guest typing "doctor near me" the Maps listing is
the single biggest lever there is. Getting the profile claimed, categorised,
photographed and linked to these landing pages is worth a project of its own.

## 8. Accreditation wording

Their Instagram bio says UCA accredited urgent care. Accreditation lines have to
be exact, so nothing about accreditation appears on the pages.

**Needed:** the permitted wording, in writing.

## 9. Tracking

Every contact element already fires `call_click`, `whatsapp_click` or
`directions_click` with the hotel and the area attached. Nothing receives them
yet: 247clinic.net shows no GA4.

**Needed:** create or confirm the GA4 property and share the measurement ID.
Cloudflare sits in front of this domain, so the tag has to be checked at the
edge as well.

## 10. Four site bugs the pages depend on

Pre-existing, and they will sabotage the launch if they are still there:

1. The sitemap returns a 500 and lists nothing, so new URLs are undiscoverable.
2. Missing URLs 302 to a page that returns 200, so the site has no real 404.
3. Four pages render a blank title from missing database rows. The About page
   still literally reads "About Us Title".
4. `noindex` and canonical have to be verified on the rendered page, not the
   template.

**Re-checked on the live site 2026-09-10.** Two of these are already fixed: the
sitemap returns 200 with 11 URLs, and every main page now has a title and a
description. Still broken: there is no 404 page, so every wrong URL returns 200
with the homepage, and no page carries a canonical tag. The homepage also has no
H1 at all. Measured in `247clinic-site-audit.md`.

---

## Added 2026-09-10, and what it needs

### Photographs of each clinic from the street

Every page now ends with the other clinics, each on a card with a photograph, a
Directions link and a link through to that clinic's page. The photographs are
Pexels stock of the Red Sea coast, standing in until real ones exist. One
photograph of each clinic entrance would replace all three and would be the
single biggest improvement to that section.

### The clinic photographs already in the repository

There are fifteen images in `src/assets` named for clinic scenes: reception,
ward, consultation, x-ray, and three of Premier Le Rêve. They were added in the
first build with no record of where they came from. They are 1200 by 774, which
is a website crop rather than a video frame, so they were almost certainly taken
from 247clinic.net. Almost certainly is not certain, and the rule against using
a frame from a film is absolute, so nothing uses them until someone confirms the
source. If they are from the website, they can go back in immediately and are
better than any stock.

### Films of the walk at Steigenberger and Amwaj

Design 3's "The walk from your hotel" is now his own film of the Premier Le Rêve
walk, with the scroll wheel driving the playhead: the guest walks to the door as
they scroll. It only exists for Le Rêve, because that is the only walk that has
been filmed. The other two clinics fall back to the written steps.

Two phone videos, taken slowly from the hotel reception to the clinic door,
would give them the same thing. Held steady, walking pace, twenty to thirty
seconds, portrait.

### A Google Maps Static API key

The maps on the pages are the live Google embed, as asked. The network cards use
a photograph instead. If we want a real Google map image on those cards, or a
map that appears before the embed loads, that needs a Static Maps API key on the
24/7 Clinic Google account.

### Google Business Profiles

Three verified profiles, with photographs, hours and the phone number, would do
more for reach than everything on the pages combined. A "24/7 Clinic" listing
already exists beside Premier Le Rêve. Soma Bay and Abu Soma have none.

### The three share cards have to be uploaded

Each page has a 1200 by 630 Open Graph card in `src/assets`. They need to go up
with the pages, and the `og:image` path needs the live origin in front of it.
Written up in `247clinic-seo-handover.md`.

---

## What is finished

- URL structure, page plan and the one template approach, approved 2026-09-08.
- The design system and three working pages, generated from one template.
- Their own logo, their own films, their own campaign posters, their own guest
  reviews, their own title language.
- Titles and descriptions written for what guests actually search: doctor,
  clinic, dentist, emergency, hospital, plus the area name.
- `MedicalClinic`, `FAQPage`, `BreadcrumbList`, `ItemList`, `WebSite`,
  `Organization` and a speakable `WebPage` on every page, with real coordinates.
- Open Graph and Twitter cards, a sitemap with the films declared, and llms.txt.
- Every page links to the other two clinics, with the hotel and the town in the
  anchor text.
- A live Google map on every page, and a Directions link straight to the checked
  coordinates.
- The clinic film, two guest story films, a carousel of their own campaign
  posters, and the network of 28 hotels grouped by area.
- Canonical, meta description, Google map, walking directions, and GA4 events.
