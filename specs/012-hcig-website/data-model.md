# Data model: healthcareig.com rebuild (spec 012)

Files, not a database. Every entity below lives in `hcig-v3/src/content/` or `hcig-v3/src/lib/` unless noted.

## Page

| Field | Type | Rule |
|---|---|---|
| `id` | string | Stable, language-free (`home`, `about`, `leadership`, `service.case-management`, `partner.insurers`, `brand.medpark`, `news.itic-global-venice-2025`) |
| `kind` | enum | `home`, `section`, `service`, `partner`, `brand`, `network`, `trust`, `press`, `news`, `article`, `event`, `contact`, `legal`, `kit` |
| `slug[lang]` | string per language | ASCII, lower case, hyphens; existing live slugs kept (R3) |
| `languages` | lang[] | Only languages where the page exists; drives hreflang |
| `keyword[lang]` | string | One main keyword per page per language, unique per language (FR-026) |
| `title[lang]`, `description[lang]` | string | Unique per language; kept from live where the page exists, else approved new copy |
| `h1[lang]` | string | One per page |
| `breadcrumb` | id[] | Parent chain for BreadcrumbList |
| `schemaType` | string | WebPage subtype plus the main entity type (see contracts/seo-schema.md) |
| `noindex` | boolean | True only for the kit thank-you page and the 404 |
| `oldAddresses` | string[] | Live addresses that redirect here (contracts/urls.md) |

## Word (source and approved)

| Field | Type | Rule |
|---|---|---|
| `key` | string | `page.section.item` |
| `text[lang]` | string | Exactly as written |
| `origin` | enum | `live` (extracted from the live site), `approved` (new copy), `translated` (from the English source) |
| `approvedBy`, `approvedOn` | string, date | Required when `origin` is `approved`: "Mohamed" then "Irina" |
| `fixes` | string[] | Logged grammar or spacing fixes on a live sentence |

## Fact

| Field | Type | Rule |
|---|---|---|
| `id` | string | `years`, `patients`, `professionals`, `clinics`, `partnership.gha`, `board.chairman` |
| `value` | string | As stated by the source |
| `source` | string | URL or "Mohamed, 2026-10-18" |
| `verifiedOn` | date | |

Seed values: 40+ years, 600K+ patients, 350+ medical professionals, 135+ on-site clinics (live site); Official Partner of
GHA and DMWV (live site); board from `/about/` with the title question open (spec, edge cases).

## PartnerType

`id` (insurers, embassies, hotels, tour-operators, providers, corporates), `name` (the site's own words from "Who We
Work With"), `enable` (the site's "What We Enable for Our Partners" line where one exists), `proof` (ProofItem ids),
`kit` (Kit id), `page` (Page id).

## ServiceLine

`id`, `name` (site words), `summary` (site words), `group` (`line` for the seven group service lines on the home,
`operational` for the eight on /services/), `page` (Page id or null), `linksOut` (for example medcierge.com for Elite
Medical Concierge).

## Brand

`id`, `name`, `what` (site words), `where`, `website` (verified URL or null: only MedOne has none), `social` (URLs),
`colours` (from the brand's guideline where one exists), `logo` (file), `page` (Page id).

## Person

`id`, `name`, `title[lang]`, `photo` (real only), `sameAs` (LinkedIn when public), `quote` (the CEO card words).

## ProofItem

`id`, `kind` (`partnership`, `accreditation`, `insurer-logo`, `testimonial`, `event`, `hotel`), `label`, `wording`
(exact; "Official Partner of ..."), `holder` (HCIG or a brand: UCA is held by 24/7 Clinic), `source` (URL or news id),
`asset` (logo or film). An item without a source is not shown.

## NewsPost

`id`, `oldAddress` (`/blog/newsN.php`), `slug[lang]`, `date` (as the post states it), `place`, `title`, `body` (live
words, paragraphs kept), `photos` (live files; missing ones listed for replacement), `languages`.

## Event

`id`, `name`, `dates`, `city`, `role` (exhibitor, sponsor, speaker, as stated), `page`, `qr` (UTM-tagged URL and the QR
image), `status` (upcoming, past).

## Lead

| Field | Rule |
|---|---|
| `type` | `enquiry`, `kit`, `newsletter` |
| `name`, `company`, `email` | Required for `kit`; `email` only for `newsletter`; `enquiry` also takes `phone`, `partnerType`, `message` |
| `page`, `lang`, `source` | From the page and UTM parameters |
| `consent` | Analytics and marketing states at submit time |
| `createdAt` | Server time |
| States | `received` then `emailed` and `logged`; `newsletter` adds `confirm-sent` then `confirmed` in Brevo |
| Retention | 24 months in the CSV outside the web root; Brevo keeps confirmed subscribers until unsubscribe |

## Asset

`file`, `kind` (photo, film, logo, icon, generated-image, generated-film, pdf), `source` (live path, brand site, Gemini
prompt id, Reham), `licence`, `alt[lang]`, `usedOn` (Page ids), `widths` (for responsive images), `poster` (designed
image, never a frame).

## Redirect

`from` (old address), `to` (new address), `code` (301), `phase` (0 for duplicates today, 6 for news at go-live, 7 for
German leaves if any), `verifiedOn`.
