# Contract: TMASI Global URL Architecture & Redirects

Defines the complete URL structure for TMASI Global v3, mapping all legacy endpoints to clean, modern routes.

## 1. Clean Route Mapping

All legacy `.php` endpoints transition to clean semantic paths with automatic 301 redirects.

| Legacy Live Route | New v3 Route | Canonical URL | HTTP Status |
|---|---|---|---|
| `/index.php` | `/` | `https://tmasi.net/` | 301 |
| `/about.php` | `/about` | `https://tmasi.net/about` | 301 |
| `/service.php` | `/services` | `https://tmasi.net/services` | 301 |
| `/servises.php` | `/services` | `https://tmasi.net/services` | 301 |
| `/medassist.php` | `/services/medical-assistance` | `https://tmasi.net/services/medical-assistance` | 301 |
| `/vipser.php` | `/services/elite-concierge` | `https://tmasi.net/services/elite-concierge` | 301 |
| `/travelassist.php` | `/services/travel-assistance` | `https://tmasi.net/services/travel-assistance` | 301 |
| `/medtourism.php` | `/services/medical-tourism` | `https://tmasi.net/services/medical-tourism` | 301 |
| `/funeral.php` | `/services/additional-services` | `https://tmasi.net/services/additional-services` | 301 |
| `/dr-amba.php` | `/leaders/dr-amr-abbass` | `https://tmasi.net/leaders/dr-amr-abbass` | 301 |
| `/dr-ahmed.php` | `/leaders/dr-ahmed-nouh` | `https://tmasi.net/leaders/dr-ahmed-nouh` | 301 |
| `/contact.php` | `/contact` | `https://tmasi.net/contact` | 301 |
| `/blog.php` | `/news` | `https://tmasi.net/news` | 301 |
| `/news1.php` | `/news/eha-strategic-cooperation` | `https://tmasi.net/news/eha-strategic-cooperation` | 301 |
| `/news2.php` | `/news/uniglobal-annual-meeting` | `https://tmasi.net/news/uniglobal-annual-meeting` | 301 |
| `/news3.php` | `/news/iti-general-assembly` | `https://tmasi.net/news/iti-general-assembly` | 301 |
| `/news4.php` | `/news/arab-health-2024` | `https://tmasi.net/news/arab-health-2024` | 301 |
| `/blog/news5.php` | `/news/hansa-medica-gem` | `https://tmasi.net/news/hansa-medica-gem` | 301 |
| `/blog/news6.php` | `/news/itic-global-2026-istanbul` | `https://tmasi.net/news/itic-global-2026-istanbul` | 301 |

## 2. Multilingual Path Schema

Each language sits in its own dedicated path with exact corresponding structure.

| Language | Root Path | Services Path | News Path | Contact Path |
|---|---|---|---|---|
| English (Default) | `/` | `/services` | `/news` | `/contact` |
| German | `/de/` | `/de/services` | `/de/news` | `/de/contact` |
| Polish | `/pl/` | `/pl/uslugi` | `/pl/news` | `/pl/kontakt` |
| Spanish | `/es/` | `/es/servicios` | `/es/noticias` | `/es/contacto` |
| French | `/fr/` | `/fr/services` | `/fr/actualites` | `/fr/contact` |
| Italian | `/it/` | `/it/servizi` | `/it/notizie` | `/it/contatti` |
| Czech | `/cs/` | `/cs/sluzby` | `/cs/novinky` | `/cs/kontakt` |

## 3. Host and Protocol Normalization

1. HTTPS Enforcement: All `http://` traffic redirects to `https://` with status 301.
2. Canonical Host: `www.tmasi.net` redirects to `https://tmasi.net` with status 301.
3. Trailing Slash Handling: Directory indices require standard trailing slash. Extensionless files serve directly without trailing slash.
4. Legacy Query Cleaning: Unrecognized legacy query parameters are stripped during 301 redirection unless whitelisted for analytics.
