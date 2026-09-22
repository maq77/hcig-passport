# MedPark T-010 redesign, deployed live

22 Sep 2026 · Mohamed Amin · /hospitals-in-hurghada/

**Live:** https://www.medparkhospitals.com/hospitals-in-hurghada/
**Rollback:** `~/backups/t010-redesign-20260922/index.php.bak` on the server (the
previous version, 27 KB). The page lives in `medpark-live/`, which is gitignored,
so that backup is the way back.

## What it is

A full premium rebuild of the tourist emergency hospital landing page, using the
ui-ux-pro-max design skill and MedPark's own brand.

| Part | Detail |
|---|---|
| Brand | Teal #12C0C6, ink #0A7F84, navy #0A2A4A, urgent red #E63946. No dark page. |
| Type | Figtree display, Helvetica World body |
| Sections | Hero with a glass "care at a glance" card, navy stats strip, 4-step cashless timeline, hospital-vs-hotel-clinic comparison, 10 emergency capabilities, resort proximity panel, GHA and DMWV accreditation, FAQ accordion, final CTA, mobile sticky Call and WhatsApp bar |
| Motion | Scroll reveal with a hard failsafe, so content is never hidden if the script fails. Respects reduced motion. |

## Done right

- **Wraps the site chrome.** Includes `_head`, `_header`, `_footer`, so GA4
  (G-LE2B44N7SF), the Ads tag (AW-17729597588), canonical, hreflang and the
  FAQPage schema are all inherited. Nothing lost.
- **Scoped `hh-` classes**, so nothing collides with the site's `v2.css`.
- **AA contrast.** Muted text darkened to `#5A6C7E` (5.4:1 on white).
- **Header readable.** The shared header is transparent white-on-dark; a subtle
  navy scrim behind it, scoped to this page, keeps the nav legible over the
  light hero.
- Real contact details: ER +20 122 271 0888, WhatsApp coordinator, Google Maps.

## The compliance decision

The previous version named **Allianz, AXA, Cigna and Bupa** with "direct
cashless billing", in the visible copy, the meta description **and** the FAQ
schema. That is the claim the 19 Sep review removed, and it is unconfirmed.

This redesign removed it from all three places. It now says "leading
international travel insurers" and makes cover conditional on the visitor's
policy and insurer approval. The visible FAQ and the schema match word for word.

**Open for you:** does MedPark hold direct billing agreements with those four
insurers? If yes, I can name them back. If no, it stays as it is.

## Verified live

HTTP 200. GA4, Ads, FAQPage schema and canonical all present. Site nav present.
Named insurers gone. Rendered and checked at desktop (1440) and phone (390).
