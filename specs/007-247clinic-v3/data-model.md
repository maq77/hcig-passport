# Data Model: 24/7 Clinic v3

All data is files, read at build time. Nothing is stored at runtime.

## Clinic

Source: `content/247clinic/clinics.json` (their own map data, 30 entries) plus a v3
overlay in `247clinic-v3/src/data/clinics.ts` that adds what their data lacks.

| Field | Type | Rule |
|---|---|---|
| id | string | stable, from the hotel name |
| hotel | string | their name, spelling cleaned only where plainly wrong (trailing spaces, "soma bay" casing); original kept in `sourceName` |
| slug | string | `{hotel}` kebab case, used in `/clinics/{destination}/{slug}` |
| destination | Destination id | derived from coordinates, reviewed by hand |
| lat, lng | number | their value, or the checked value where theirs is wrong |
| coordStatus | `checked` \| `theirs` \| `placeholder` | `placeholder` for the three that share 27.2578957, 33.8116067: no map pin until checked |
| hours | string \| null | null until known; the page then shows the brief's 24/7 coordination line only |
| services | Service id[] \| null | null means the page lists the network's services, marked as such by structure, not by new words |
| hasMedia | boolean | true for Premier Le Rêve (films shot there) |
| brand | Logo id \| null | hotel brand for the marquee |
| prefill | string | the brief's hotel message with the hotel name filled in |

**Known corrections** (from `docs/247clinic-open-items.md`, checked 2026-09-08):
Premier Le Rêve 27.024343, 33.887027 (theirs is Long Beach's point, 7 km off).
"Steigenberger soma bay" is Steigenberger Resort Ras Soma.

## Destination

| Field | Type | Rule |
|---|---|---|
| id, slug | string | `hurghada`, `sahl-hasheesh`, `soma-bay`, `marsa-alam`, `el-quseir`, `north-coast` |
| name | string | as the brief spells it |
| active | boolean | true only with at least one clinic. Makadi Bay is false (no clinic) and gets no page |
| clinics | Clinic id[] | computed |
| prefill | string | brief section 38 pattern: "Hello, I am in [Destination] and need medical assistance." |

Counts from their data: Marsa Alam 11, Hurghada 5, North Coast 5, Sahl Hasheesh 4,
Soma Bay 3 plus Abu Soma 1 (shown under Soma Bay), El Quseir 1. Total 30.

## Service

| Field | Type | Rule |
|---|---|---|
| id | string | `urgent`, `injuries`, `diagnostics`, `iv`, `specialist`, `room-visit`, `dental`, `beauty` |
| title, text | string | brief section 10 (home cards) and 17 (services page), word for word |
| slot | DesignSlot id | the dedicated card design |
| tier | `primary` \| `secondary` | dental and beauty are secondary (brief sections 17, 29) |

## Logo

| Field | Type | Rule |
|---|---|---|
| id, name | string | |
| kind | `insurer` \| `assistance` \| `hotel` \| `accreditation` \| `partner` \| `group` | |
| file | path | `public/logos/{id}.svg` or `.png` |
| source | URL | where the official file came from |
| wording | string \| null | accreditation and partner marks only: the exact line ("Official Partner of Global Healthcare Accreditation") |

## Film

| Field | Type | Rule |
|---|---|---|
| id | string | |
| master | path | file in `247 material/` |
| orientation | `landscape` \| `portrait` | from ffprobe |
| use | `hero` \| `story` \| `staff` \| `clinic` \| `dental` | |
| renditions | path[] | web encodes with size in KB |
| label | string | from the file name the user wrote (he names films with headlines) |
| captions | path \| null | later, for films with speech |

## DesignSlot

| Field | Type | Rule |
|---|---|---|
| id | string | e.g. `home-service-urgent` |
| page, section | string | |
| purpose | string | shown on the slot and in the slots document |
| ratio, px | string | e.g. `4:3`, `1200 x 900` |
| status | `waiting` \| `delivered` | a delivered slot renders the file, the label disappears |

## Review

| Field | Type | Rule |
|---|---|---|
| author | string | as published on their site |
| text | string | quoted exactly; a translation is marked as one |
| film | Film id \| null | patient film if one exists |

## WhatsAppContext

| key | message (brief sections 5 and 38, exact) |
|---|---|
| homepage | Hello, I need medical assistance through the 24/7 Clinic website. |
| general | Hello, I need medical assistance. I am currently staying at [Hotel Name / Location]. |
| insurance | Hello, I need medical assistance and would like to check whether my travel insurance can be used for cashless treatment. |
| hotel | Hello, I am staying at [Hotel Name] and need medical assistance. |
| destination | Hello, I am in [Destination] and need medical assistance. |

Section 38 also gives a shorter insurance line ("Hello, I have travel insurance and
would like to check cashless medical treatment."). Section 5's longer one is used; the
brief says the choice is for the marketing team, so it is listed in the gaps file.
