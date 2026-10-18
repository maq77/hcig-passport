# Contract: Phase 0, fixes on the live PHP site

Rule: nothing a visitor reads changes. Items marked "his yes" are shown to him first because something becomes visible
(a banner, a title in search results, a share image). Each change is previewed on https://hcig-passport.vercel.app/hcig-live/
before upload, backed up, uploaded, checked on the live host, and logged in `docs/hcig-website-worklog.md`.

| # | Change | Where | Visible? | Needs | Check |
|---|---|---|---|---|---|
| 1 | Full backup of `public_html`, local mirror | Server, `hcig-live/` | No | Access | Archive opens, file count matches |
| 2 | Read `send.php`, `.htaccess`, page templates; list PHP versions offered | Server | No | Access | Notes in the work log |
| 3 | Self-canonical, absolute, server-side on all 10 pages | Page heads | No | | Rendered head on live |
| 4 | `<html lang="de">` on the 4 German pages | Page heads | No | | Rendered head on live |
| 5 | hreflang: `/` and `/de/`, `/about/` and `/de/ueber-uns/`, `/services/` and `/de/leistungen/`, `/contacts/` and `/de/kontakt/`; x-default English | Page heads | No | | Reciprocity check |
| 6 | Stop the `i18n.js` crash: guard the SEO block so it never overrides the server canonical; guard the home language switcher | `i18n.js`, home | No | | Console clean on all pages |
| 7 | `og:url` set to the real addresses on 5 pages | Page heads | No | | Rendered head |
| 8 | Four share images (1200 x 630) replacing the 404 ones | `assets/images/` | In shared links | His yes | Share preview check |
| 9 | One consistent structured-data graph; remove `Offer`, `EducationalOrganization`, stray `MedicalClinic` | Page heads | No | | Validator, no errors |
| 10 | One-hop 301s for the duplicates and dead share addresses (urls.md, Phase 0 rows) | `.htaccess` | No | Indexing note to him | Redirect checker |
| 11 | Sitemap lists the 15 news posts, with `lastmod` | `sitemap.xml` | No | | Fetch and validate |
| 12 | Favicon and touch icons from the brand mark | Root | Browser tab only | | 200 on each icon |
| 13 | Testimonial films re-encoded at the same paths, same look | `testimonial/` | No | | Size before and after, side-by-side view |
| 14 | Remove the second Google Ads tag load on the home | Home | No | | One gtag request |
| 15 | German About title in German, built from the page's own German words | `/de/ueber-uns/` | In search results | His yes | Rendered title |
| 16 | GA4, Consent Mode v2, the consent banner, Ads conversions; Yandex moved behind consent | All pages | Banner | His yes on wording | DebugView, consent states |
| 17 | Search Console (HTML file), sitemap submitted; Bing imported | Root | No | Google access | Verified in both |
| 18 | Email: test send, then SPF, DKIM (Microsoft 365), DMARC `p=none` | DNS | No | DNS and Microsoft 365 admin | Headers show pass |
| 19 | PHP 8.1+ for the domain if offered, after a `send.php` check | cPanel | No | Access | Form still sends |
| 20 | `send.php` hardened if the review finds header injection or similar | Server | No | | Test send |
| 21 | Baselines: speed (10 pages, mobile and desktop), Search Console export, AI prompts, backlinks | Docs | No | | `docs/hcig-website-baseline.md` |
| 22 | Mirror refreshed from the live site after upload | HCIG Work | No | | `/hcig-live` matches live |

Before item 10 he gets the two-column note: what can affect indexing (addresses, redirects, canonical, hreflang,
schema, titles) and what cannot (file size, load order), and the cost of waiting.
