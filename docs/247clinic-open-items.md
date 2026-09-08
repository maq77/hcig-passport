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

---

## What is finished

- URL structure, page plan and the one template approach, approved 2026-09-08.
- The design system and three working pages, generated from one template.
- Their own logo, their own films, their own campaign posters, their own guest
  reviews, their own title language.
- Titles and descriptions written for what guests actually search: doctor,
  clinic, dentist, emergency, hospital, plus the area name.
- `MedicalClinic`, `FAQPage` and `BreadcrumbList` schema on every page, with
  real coordinates.
- A live Google map on every page, with a real static map behind it so the box
  is never empty, and a Directions link straight to the checked coordinates.
- The clinic film, two guest story films, a carousel of their own campaign
  posters, and the network of 28 hotels grouped by area.
- Canonical, meta description, Google map, walking directions, and GA4 events.
