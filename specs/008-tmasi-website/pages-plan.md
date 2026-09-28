# TMASI v3: every page, every language

Plan for the pages after the approved home. Written 2026-09-28. Decisions made the same day; waiting for the go to start step 1.

## What pages will v3 have?

Seventeen pages per language, all built on the approved home's design system.

| Page | Count | Words come from |
|---|---|---|
| Home | 1 | Done |
| About Us | 1 | Live /about/: board members, "How We Work in Critical Situations" (6 steps), partner line |
| Services overview | 1 | Live /services/ |
| Service group pages | 5 | Live service texts: Medical Assistance, Elite Medical Concierge, Travel Assistance, Medical Tourism, Insurance Assistance |
| Office pages | 5 | Live contacts page: Egypt, Germany, UAE, Spain, USA |
| Contact | 1 | Live /contacts/: "Leave Your Message" form, offices, map |
| News index | 1 | Live /blog/ |
| Leadership | 2 | Live dr-amba.php and dr-ahmed.php |

Plus the news posts: 6 in English, 4 in Spanish, and the 2 newest in German, Polish and Spanish once a native speaker checks them.

## Which languages, and when?

- **Wave 1: English, German, Polish, Spanish.** Every translation already on the live site is kept word for word. About 80 pages.
- **Wave 2: French, Italian, Czech.** New translations, drafted by Gemini and Claude and cross-checked by the other model. About 55 pages, plus the news posts. After wave 1 is live.
- Gaps in wave 1 today: no German or Polish blog, and a few pages missing in some languages. Each gap is listed in the content inventory before any page is built.

## What happens to today's URLs?

**Clean URLs with redirects** (decided by Mohamed, 2026-09-28).

- **Already clean, so they stay:** `/`, `/about/`, `/services/`, `/contacts/`, `/blog/` and every language version (`/de/uber-uns/`, `/pl/o-nas/`, `/es/servicios/` and the rest). These pages rank today and do not move.
- **`.php` pages move to clean addresses**, each with one permanent redirect (301), old to new in one hop:

| Today | v3 |
|---|---|
| `/blog/news1.php` | `/blog/egypt-healthcare-authority-agreement-africa-health-excon-2025/` |
| `/blog/news2.php` | `/blog/uniglobal-global-insurance-conference-barcelona/` |
| `/blog/news3.php` | `/blog/itic-global-venice-2025-exhibitor/` |
| `/blog/news4.php` | `/blog/itic-global-venice-2025-on-stage/` |
| `/blog/news5.php` | `/blog/hansa-medica-group-partnership-grand-egyptian-museum/` |
| `/blog/news6.php` | `/blog/itic-global-2026-istanbul-official-sponsor/` |
| `/es/blog/newsN.php` | `/es/blog/<Spanish slug from the Spanish title>/` |
| `/dr-amba.php`, `/dr-ahmed.php` (and `/de/`, `/pl/`, `/es/` copies) | `/about/<leader name>/` in each language, names exactly as on the pages |

- **New pages** get clean addresses in their own language: `/services/medical-assistance/`, `/de/leistungen/medizinische-assistenz/`, `/contacts/egypt/`, `/de/kontakt/aegypten/`. Slugs come from each language's live page names.
- **Old unlinked pages** (`medassist.php`, `funeral.php`, `vipser.php`, `custcare.php`, `contedu.php`, `service.php`, `servises.php`, `about.php`, `blog.php`, `contact.php`) redirect to their nearest page. Their text is not used.
- **Rules:** one hop per redirect (no chains, www included), the sitemap lists only the new addresses, language tags and canonicals point to the new addresses, the full redirect list is kept in the repo.
- **Cost, stated plainly:** the moved pages (news posts and leaders) may dip for a few weeks while Google follows the redirects. Search Console access (asked from Pulse) is needed before go-live to watch it.
- The URL contract written earlier (`contracts/urls.md`) is replaced by this. It renamed live URLs, gave German pages English addresses and invented news addresses.

## How is each page built?

1. **Words first.** Every live page, in every language, is copied into content files word for word. A check fails the build if any sentence is not on the live site, except labels Mohamed approved.
2. **Design on the canvas first.** One template per page type, desktop and phone, with ui-ux-pro-max and the home's design system. Nothing is built before Mohamed approves the template.
3. **Build.** One template serves every language. Same spacing, headings, hairlines and motion rules as the home.
4. **Images.** Real TMASI photos where the live site has them. Where a page has none, a labelled design slot for Reham, with size and format.
5. **Checked** on desktop and phone before it reaches HCIG Work.

## In what order?

1. Content inventory: all live pages in four languages, into content files, with the word check.
2. Templates on the canvas: About, Services, Service group, Office, Contact, News index, News post, Leader.
3. English pages: Services and the five groups, then About and the leaders, then Contact and the offices, then News.
4. German, Polish and Spanish, from the live translations.
5. SEO and AEO: titles kept, language tags, schema, sitemap, answers for AI tools.
6. French, Italian, Czech.
7. Go live on tmasi.net: backup, same URLs, redirects for the orphans, check every rendered page head.

## What did Mohamed decide? (2026-09-28)

- **URLs:** clean URLs with redirects (above).
- **Languages:** French, Italian and Czech after the first four go live.
- **Old unlinked pages:** their text is left out.
- **Translation check:** Gemini and Claude cross-check for now; a human check can come later.
