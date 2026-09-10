# Both briefs, checked line by line against the built pages

Last checked 2026-09-10. Re-run it with `python scripts/check-247-brief.py`.

This is a machine check, not an opinion. It opens the three built pages and looks
for each item Irina's brief asks for. Forty-four checks per page.

## Result

| Page | Passed |
|---|---|
| Premier Le Rêve | 43 of 44 |
| Steigenberger Ras Soma | 43 of 44 |
| Amwaj Beach Club | 43 of 44 |

Everything on her page structure list is present except one, and one further
requirement fails that the checklist does not cover. Both are below.

## What passes

Her above-the-fold spec, exactly as written. The H1 is "Need a Doctor at
[Hotel Name]?". The line under it is "24/7 Clinic located inside / serving
[Hotel Name]", using inside for Premier Le Rêve and serving for the other two.
The three buttons are Call now, WhatsApp and Find the clinic. Nothing corporate
sits above them.

Her page contents list, all of it bar photographs: hotel name, branding, the
exact position, where the clinic is in the hotel, the Google map, directions,
opening hours, phone, WhatsApp, doctor consultation, medical examination, minor
illnesses and injuries, medication, laboratory and diagnostics, ambulance
coordination, hospital referral, insurance assistance, medical reports, support
for international guests, an emergency call to action, and an FAQ.

Her SEO list: a unique title and description per page, exactly one H1, a real H2
structure, an alt on every single image, internal links between the three pages,
canonical, MedicalClinic and BreadcrumbList schema, and sitemap inclusion. On
LocalBusiness, MedicalClinic is a subtype of it, so it is already satisfied and
adding both would be duplication.

Her tracking list, using the event names from the other brief:
`whatsapp_medical_click`, `phone_click`, `clinic_directions_click`,
`clinic_view`.

Her mobile list: viewport, a sticky WhatsApp button, lazy loading on everything
below the fold.

## The two failures

### 1. No clinic photographs

Her list asks for them and there are none. The fifteen clinic images already in
the repository have no recorded origin, and the rule against using a frame from
a film is absolute, so none of them is used. One photograph of each clinic
entrance fixes this.

### 2. The three pages are too alike, which she explicitly forbids

Her words: "Do NOT create three identical pages and simply replace the hotel
name. Every page should contain unique hotel-specific and location-specific
content."

Measured:

| Pair | Identical |
|---|---|
| Premier Le Rêve vs Steigenberger | 90.8% |
| Premier Le Rêve vs Amwaj | 89.7% |
| Steigenberger vs Amwaj | 94.6% |

| Page | Words appearing on no other page |
|---|---|
| Premier Le Rêve | 14 |
| Steigenberger Ras Soma | 0 |
| Amwaj Beach Club | 0 |

Steigenberger and Amwaj share no unique words at all. They differ only in the
hotel name, the town and the map position. Premier Le Rêve is slightly better
only because their own directions film gave it a real description of the walk.

This is the one thing on either brief that is genuinely not done, and it is the
one that decides whether these pages rank. Three near-identical pages compete
with each other rather than with anyone else.

**It cannot be fixed by writing more.** Inventing clinic detail on a medical
page is not an option. It is fixed by collecting facts, and the list is below.

## What is needed, per clinic, to fix the uniqueness problem

For Steigenberger Ras Soma and Amwaj Beach Club especially:

1. **Where exactly the clinic is.** Which building, which floor, which entrance,
   what the sign says, what is next door. Premier Le Rêve has this because it
   was filmed. The other two have a generic "ask reception".
2. **A photograph of the entrance**, and one of the inside if possible.
3. **Opening hours**, if any of the three differs from 24 hours.
4. **What is on site at each one.** Does this clinic have its own laboratory,
   x-ray, dental chair, observation beds, an ambulance on standby? The three
   almost certainly differ and every difference is a page's worth of unique,
   true content.
5. **How many doctors and nurses**, and which languages each site covers.
6. **The nearest hospital to each**, by name, and roughly how far.
7. **A walking video** from reception to the clinic door for the two that lack
   one, in the same style as the Premier Le Rêve film.
8. **Anything specific to the resort.** Soma Bay and Abu Soma are kitesurfing and
   diving destinations. If these clinics see diving injuries, ear barotrauma or
   decompression cases, that is exactly what guests there search for and it
   belongs on those two pages and not on the Sahl Hasheesh one.

Item 8 is the highest value of the eight. It turns three pages that compete with
each other into three pages that each own a different search.

## Still open from the other brief

- The CAUCQ mark, which the accreditation sentence names but which was not
  supplied.
- Confirmation of the years in operation and the number of clinics. Section 14
  says the site's counters are broken and show 00, so the figures taken from
  their home page may not be reliable.
- The real WhatsApp number for each clinic, rather than one shared number.
- Which phone number is correct: the site says 122 112 2246, the films say
  122 222 8247.
- The URL structure decision, since the two briefs disagree. Details in
  `247clinic-brief-alignment.md`.
