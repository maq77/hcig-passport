# Contract: URLs

Rule (the user, 2026-09-23): keep every live URL that ranks; new pages use the brief's
URLs; hotels at `/clinics/{destination}/{hotel}-clinic`. No trailing slash (research R3).

Preview: every path below is served under `https://hcig-passport.vercel.app/247clinic/v3`.

## Pages

| Path | Page | Source | Phase |
|---|---|---|---|
| `/` | Home | live | A |
| `/services` | Medical Services | live (brief 17) | B |
| `/insurance` | Insurance & Cashless Care | live; brief suggests `/insurance-cashless-care`, kept live by the user's rule (brief 18) | B |
| `/our-clinics` | Find a Clinic | live (brief 19) | B |
| `/about-us` | About Us | live (brief 26) | B |
| `/contact-us` | Contact | live (brief 27) | B |
| `/faqs` | FAQ | live, note the `s` (brief 28) | B |
| `/beauty-wellness` | Beauty & Wellness | live (brief 29) | B |
| `/hotel-clinics` | Hotel Clinic Concept | new (brief 22) | B |
| `/international-accreditation` | Accreditation | new (brief 23) | B |
| `/for-hotels` | For Hotels & Resorts | new (brief 24) | B |
| `/insurance-assistance-partners` | For Insurance & Assistance Companies | new (brief 25) | B |
| `/hurghada`, `/sahl-hasheesh`, `/soma-bay`, `/marsa-alam`, `/el-quseir`, `/north-coast` | Destination pages | new (brief 21), active only | C |
| `/clinics/{destination}/{hotel}-clinic` | 30 hotel clinic pages | new (brief 20) | C |
| `/404` | Not found | new, served with status 404 | A |

Not rebuilt in v3 (brief 30 says the blog is not a priority): `/blog`,
`/article/2023/11/fast-reliable-medical-services-in-the-red-sea`,
`/article/2023/11/unveiling-the-best-urgent-clinics-for-travelers`. At go-live each is
either carried over as a static page or 301s to its closest page. Decided in phase 8.

## Redirects (production only, 301)

| From | To | Why |
|---|---|---|
| `/clinics` | `/our-clinics` | parent of the hotel URLs |
| `/clinics/{destination}` | `/{destination}` | parent of the hotel URLs |
| `/insurance-cashless-care` | `/insurance` | the brief's suggested URL, in case it is linked |
| `/accreditation` | `/international-accreditation` | short form |
| `/for-insurance` | `/insurance-assistance-partners` | short form |
| any `/path/` | `/path` | one form only |

Before go-live, crawl their live site and read the Search Console pages report, and add
every other indexed URL to this table. Nothing indexed may end on a 404.

## Language structure (later)

`/de/...`, `/pl/...`, `/cs/...` with translated slugs, reciprocal hreflang with
`x-default` on English. English stays at the root and never moves.
