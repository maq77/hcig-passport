# 24/7 Clinic landing pages: what makes them rank, and what to do at deploy

Last updated 2026-09-10.

This is the technical half of the landing pages. Nothing here is visible on the
page. It is what a search engine and a voice or chat assistant read.

## What is already built into every page

**Titles and descriptions** target what a tourist actually types. Not the
clinic's name, which nobody searches, but the town plus the need: "Doctor in
Sahl Hasheesh", "Doctor in Soma Bay", "Doctor in Abu Soma". The hotel name is
in the title too, so the page can also catch someone searching the hotel.

**One canonical per page**, pointing at the live 247clinic.net URL.

**Open Graph and Twitter cards.** Every page has a 1200 by 630 share card
drawn from the brand, so a link pasted into WhatsApp, Facebook or a hotel's own
page shows a proper preview instead of a stray logo. Hotel reception desks share
links on WhatsApp constantly, so this matters more here than on most sites.

**Geo meta**, with the checked coordinates and the Red Sea governorate code.

**Structured data**, one graph per page:

| Type | What it does |
|---|---|
| MedicalClinic | The clinic as a real place: phone, hours, position, languages, services |
| FAQPage | The questions guests ask, eligible for the expandable results |
| BreadcrumbList | The path back to the town and to all clinics |
| ItemList | The other clinics, so the three pages read as one network |
| WebSite and Organization | One company behind all three, with the Instagram account |
| WebPage with speakable | The two lines a voice assistant reads aloud when asked for a doctor |

**Internal links.** Every page ends with the other clinics, linked with the
hotel and the town in the anchor text. Three pages that link to each other rank
better than three pages that do not, and a guest who moved hotels gets to the
right clinic.

## The files to deploy alongside the pages

Generate them with `node scripts/gen-247-seo.js`. They land in
`docs/247clinic-deploy/`.

**sitemap-clinics.xml** lists the three pages with their films declared as
video entries. The films are the one thing on these pages a competitor cannot
copy, and a declared film is eligible for the video results as well as the blue
links. Reference this from the main sitemap index.

**llms.txt** is a plain summary of the clinics, for the chat tools that read it.
Put it at the site root.

## The three edits to make at deploy

1. **Robots.** The pages carry no robots tag, because HCIG Work stamps noindex
   on everything it serves, which is right for a demo. On 247clinic.net each
   page needs:
   `<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">`
   The max-snippet and max-video-preview values are what let Google show a long
   answer and a video preview. Without them the pages are eligible for far less.

2. **Absolute og:image.** The share card path is relative so it resolves on the
   demo host. Open Graph wants an absolute URL. Prefix the three with
   `https://www.247clinic.net`, and upload the cards from `src/assets/`.

3. **The four site bugs.** These block everything above. They are in
   `247clinic-open-items.md`: the sitemap returns 500, there is no real 404,
   several pages have blank titles, and canonical tags are missing.

## What I would expect, honestly

Ranking first for **"doctor Sahl Hasheesh"**, **"clinic Soma Bay"**,
**"hospital near Abu Soma"** and the long tail around them is realistic. There
is very little competition on those terms and no one else has films, a real
position and structured data.

Ranking first for the **hotel's own name** is not. Searching "Premier Le Rêve"
returns the hotel, Booking.com, TripAdvisor and Expedia, all of them older and
far stronger. What these pages can win is the hotel name plus a need:
"Premier Le Rêve doctor", "Steigenberger Ras Soma medical". Those are the
searches a guest actually makes when something is wrong, and they convert.

For the chat tools, the speakable markup, the FAQ and llms.txt are what get
the clinic quoted. The single strongest signal is something not in this
document: a Google Business Profile for each clinic, verified, with photographs
and reviews. There is already a "24/7 Clinic" listing beside Premier Le Rêve.
Claiming it and adding the other two would do more than everything above.

## Still needed

- Photographs of each clinic from the street. The network cards currently use
  Pexels stock of the Red Sea coast as a stand-in.
- A Google Maps Static API key, if we want a real map image on the cards rather
  than only the live embed.
- The clinic photographs already in this repo have no recorded origin, so they
  are not used anywhere until that is confirmed.
