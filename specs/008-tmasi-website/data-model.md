# Data Model: TMASI Global Website (v2 & v3)

All data stored as structured files compiled at build time. No runtime database required.

## 1. Office Hub

Operational centres across the globe providing 24/7 assistance dispatch.

| Field | Type | Description |
|---|---|---|
| id | string | Stable key: `egypt`, `germany`, `spain`, `uae`, `usa` |
| country | string | Official country name as displayed on site |
| city | string | Primary city location |
| address | string | Physical street address verbatim from live site |
| phone | string | Direct telephone number |
| emergencyPhone | string | 24/7 dispatch hotline number |
| email | string | Dedicated operational email address |
| lat | number | Verified geographic latitude |
| lng | number | Verified geographic longitude |
| isHQ | boolean | True for primary headquarters (Egypt) |

### Office Directory

1. Egypt (HQ): Cairo and Red Sea operations. 24/7 coordination desk.
2. Germany: European operational and partner liaison hub.
3. Spain: Southern Europe and Mediterranean coordination.
4. UAE: Middle East and Gulf regional office (Dubai).
5. USA: North America liaison office.

## 2. Service Group

Core assistance capabilities offered to insurers, corporations, and travellers.

| Field | Type | Description |
|---|---|---|
| id | string | Stable key: `medical-assistance`, `elite-concierge`, `travel-assistance`, `medical-tourism`, `insurance-assistance`, `additional-services` |
| title | string | Headline title verbatim from live site |
| summary | string | Overview paragraph verbatim from live site |
| items | string[] | Array of itemized services verbatim from live site |
| iconSlot | string | Design slot id for Reham's iconography |
| bannerSlot | string | Design slot id for section header visual |

### Service Groups

- Medical Assistance: Emergency evacuations, medical escorts, ground and air ambulance, hospital admissions.
- Elite Medical Concierge: VIP healthcare coordination, private specialist appointments, executive medical transport.
- Travel Assistance: Hotel doctor calls, lost passport assistance, translation, travel disruption support.
- Medical Tourism: Treatment planning, facility selection, medical records translation, post-operative care.
- Insurance Assistance: Direct billing coordination, medical claims management, cost containment.
- Additional Services: Repatriation of mortal remains, legal assistance coordination, medical equipment provisioning.

## 3. News Post

Corporate announcements, international partnerships, and conference sponsorships.

| Field | Type | Description |
|---|---|---|
| id | string | Stable key: `news-1` through `news-6` |
| title | string | Headline verbatim from folder or live site |
| dateString | string | Dateline string exactly as provided (for example "June 2026", "October 2026") |
| summary | string | First paragraph or excerpt |
| body | string | Full body text verbatim from source documents |
| quote | string \| null | Closing quote or highlighted callout |
| images | string[] | Relative paths to web-optimized photos |
| sourceFolder | string | Originating folder under `tmasi sponsor/` or live site |
| languages | string[] | Available translations: `["en", "de", "pl", "es"]` |

## 4. Partner Organisation

Affiliated institutions, authorities, and international industry bodies explicitly referenced on the website.

| Field | Type | Description |
|---|---|---|
| id | string | Stable key: `eha`, `hansa-medica`, `itic-global`, `uniglobal` |
| name | string | Full formal organisation name |
| relationship | string | Nature of association: "Strategic Partner", "Official Sponsor", "Cooperation Agreement" |
| logoFile | string | Vector SVG or high-resolution PNG logo |
| citationUrl | string | Official website reference URL |

## 5. Leadership Profile

Executive leaders featured on dedicated executive profile pages.

| Field | Type | Description |
|---|---|---|
| id | string | Stable key: `dr-amr-abbass`, `dr-ahmed-nouh` |
| name | string | Full title and name verbatim |
| role | string | Executive title: Chief Executive Officer, Chief Strategy Officer |
| bio | string | Complete biography text verbatim from `dr-amba.php` and `dr-ahmed.php` |
| photoFile | string | High-resolution executive portrait |
| pageSlug | string | Clean route: `/leaders/dr-amr-abbass`, `/leaders/dr-ahmed-nouh` |

## 6. Design Slot

Asset placeholders allocated for graphic designer Reham.

| Field | Type | Description |
|---|---|---|
| id | string | Unique slot code (for example `SLOT-MAP-01`) |
| page | string | Destination page or component |
| section | string | Visual section within page |
| purpose | string | Functional and artistic objective |
| dimensions | string | Width by height in pixels (for example `1920x1080`) |
| aspectRatio | string | Standard ratio (for example `16:9`, `4:3`, `1:1`) |
| format | string | Preferred export format: `webp`, `svg`, `png` |
| status | string | Status: `waiting_reham`, `draft`, `delivered`, `live` |

## 7. Multilingual Route Schema

Base routing structure for clean language expansion.

| Language | Code | Root Path | Subpath Pattern |
|---|---|---|---|
| English | en | `/` | `/{page}` |
| German | de | `/de/` | `/de/{page}` |
| Polish | pl | `/pl/` | `/pl/{page}` |
| Spanish | es | `/es/` | `/es/{page}` |
| French | fr | `/fr/` | `/fr/{page}` |
| Italian | it | `/it/` | `/it/{page}` |
| Czech | cs | `/cs/` | `/cs/{page}` |
