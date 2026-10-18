# Contract: metadata, language links, structured data, sitemaps

## Every page

- One `<h1>`. `<html lang>` equals the route's language.
- `<title>` and meta description unique per language (live ones kept where the page exists, new ones approved first).
- Canonical: absolute self URL on `https://healthcareig.com`, trailing slash, no query string.
- hreflang: one `<link rel="alternate">` per language the page exists in, plus `x-default` to English. Reciprocal:
  the checker fails if A lists B and B does not list A.
- Open Graph and Twitter: `og:title`, `og:description`, `og:url` (the canonical), `og:image` absolute, 1200 x 630, one
  per page and language; `og:locale` plus `og:locale:alternate`; `twitter:card` `summary_large_image`.
- Navigation in semantic `<nav>` with real `<a href>` links and descriptive anchors (the six HCIG build standards).
- Preview build only: `robots` noindex, nofollow on every page, `Disallow: /`, no analytics tags.

## Structured data: one graph per page

| Node | `@id` | Notes |
|---|---|---|
| Organization (`MedicalOrganization`) | `https://healthcareig.com/#organization` | name "Healthcare International Group", alternateName "HCIG", logo, both addresses, partner-desk `contactPoint`, `sameAs` (LinkedIn, Instagram, Facebook), `subOrganization` = the eight brands |
| Brand (`MedicalOrganization` or `Organization`) | `https://healthcareig.com/group/<brand>/#organization` | `url` = the brand's own site where one exists, `parentOrganization` = HCIG |
| WebSite | `https://healthcareig.com/#website` | `publisher` HCIG, `inLanguage` per language |
| Person | `https://healthcareig.com/about/leadership/#<person>` | `jobTitle` from the confirmed board list, `worksFor` HCIG |
| WebPage subtype | page URL + `#webpage` | `AboutPage`, `ContactPage`, `CollectionPage` as fits; `breadcrumb` |
| BreadcrumbList | page URL + `#breadcrumb` | Every page except home |
| SiteNavigationElement | `https://healthcareig.com/#navigation` | Main menu items |
| Service | page URL + `#service` | Service pages; `provider` HCIG or the brand that delivers it |
| NewsArticle | post URL + `#article` | `datePublished` only when the post states a date |
| Event | event URL + `#event` | Only for events HCIG takes part in, with the role it states |
| FAQPage | page URL + `#faq` | Only where approved FAQs exist on the page |

Not used on the group site: `Offer`, `EducationalOrganization`, `MedicalClinic` (clinics belong to the brand sites).
GHA and DMWV partnerships stay in page text, not in schema, so no structured claim goes beyond the exact wording.

## Sitemaps and machine files

- `/sitemap.xml` is an index of `/sitemap-<lang>.xml`; each lists only indexable pages of that language with `lastmod`.
- `/robots.txt` on live: allow all, the sitemap line.
- `/llms.txt`: what HCIG is in two sentences, the eight brands, the partner desk, links to key pages per language.
  `/llms-full.txt`: the fact sheet.
- IndexNow key file at the root; after each deploy the changed URLs are sent to IndexNow (Bing, Yandex).

## Engines

Search Console (HTML-file verification in Phase 0, domain property when DNS is open), Bing Webmaster Tools (imported
from Search Console). Sitemap submitted in both after every launch.
