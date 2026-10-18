# healthcareig.com rebuild: work log

Every step from day one, one line each: what, where, before and after, how it was checked.
The final report and the email are written from this file.

## 2026-10-18 · Planning

| What | Where | Result | Checked by |
|---|---|---|---|
| Live site pulled | 10 pages, 15 news posts | Saved to `hcig-v3/material/live-site/pages/` (kept local, not in git) | All 25 answered 200 |
| Assets pulled | Every image, video and PDF the pages reference | 207 files saved, 3 videos, 192 MB. 19 references are broken on the live site | Download report `pull-report.txt` |
| Status codes checked | `/`, www, http, old `.php` addresses | http and www 301 to https. services.php, blog.php, kontakty.php, index.php, /news1.php answer 200 (duplicates). about.php, partners.php answer 404 but sit in share tags | curl with a browser user agent |
| Head of each page read | All 7 main pages | Empty canonical on / and /de/, none on the other pages. No hreflang. og:url wrong on 5 pages. Meta keywords present | Saved HTML |
| Tags found | All pages | Google Ads AW-17729597588 (twice on the home), Yandex Metrika 110788507 (EN) and 110788548 (DE) with Webvisor, JotForm AI agent. No GA4. No consent banner | Page source |
| Structured data read | All 7 main pages | MedicalOrganization plus MedicalClinic on home; 5 Offer items on partner; EducationalOrganization on services | JSON-LD types counted |
| Duplicate section checked | Home "Our Healthcare" | One section written twice: `.section-do` for desktop, `.section-do1` for phones. Visitors see it once. Earlier chat claim corrected | Live CSS `css/styless.css` |
| Email DNS checked | healthcareig.com | MX on Microsoft 365. SPF `v=spf1 include:secureserver.net -all` (GoDaddy only). No DKIM selectors for Microsoft 365. No DMARC. DNS at GoDaddy (domaincontrol.com) | nslookup |
| Testimonial videos measured | 3 files | 1080x1920, 1918x1080, 1080x1920. 17 MB, 9.8 MB, 85 MB | ffprobe metadata only, no frames |
| Partner logos read | `partner/img/logos1.jpeg` | 23 insurer logos shown under "Trusted by Global Insurance & Assistance Networks" | Opened the image |
| Board found | About page | Dr. Mostafa Elshakankery, Group Chairman. Dr. Amr Abbass, Group Vice Chairman, Group CEO. Mr. Mohsen Mohamed, HCIG Board Member. A hidden block on services lists Dr. Ahmed Safwat, Group COO | Saved HTML |
| Competitor scan | Web search | CONNEX Assistance, Egypt In-Touch Assistance, The Integrated Clinic Company, Egypt Global Assistance, Egypt Assistance (Remed). GHA's own site announced the HCIG partnership | Search results, sources in the plan |
| PageSpeed baseline | Home | Not measured: the free API quota was used up. Moved to Phase 0 | API error message |
| Six question rounds | Chat | 24 decisions recorded in the spec | His answers |
| Spec written | `specs/012-hcig-website/spec.md` | Status draft, 12 user stories, 37 requirements, 11 success criteria | Quality checklist, all pass |
| Plan published | https://claude.ai/artifact/NzDdZTiMURNdjybx28CPVx | Private page, source `docs/hcig-website-plan.html` | Rendered at 400 px (no overflow) and 1280 px |
| Plan contrast fixed | Plan page chips and labels | Turquoise on tint 4.4:1 to 6.8:1. Green chip 4.45:1 to 5.9:1 | Computed ratios |
| Spec approved | `specs/012-hcig-website/spec.md` | Status approved, by Mohamed ("Approved, go") | His answer |
| HCIG Work updated | Registry `hcig/group-website` | Spec and plan marked approved, pushed with his yes | `npm run publish` checks |
| Font found | `css/styless.css` on the live site | Helma is already served: `/fonts/Helma.woff2` (25 KB) and `.woff` (34 KB), uploaded 2025-10-10. Only the licence needs confirming | Live requests |
| Brand websites checked | Home page brand links | 7 of 8 brands have live sites: 247clinic.net, medparkhospitals.com, tmasi.net, onemedicalcenters.com, onemedspa.net, ucamena.org, scmg-egypt.com. MedOne Group has Facebook and LinkedIn only. Corrects the question round, which listed five brands as having no site | All answered 200 |
| Correction: German title | /de/ | Not empty. The title sits on its own line in the source; the first check read one line only | Raw HTML and the live browser title |
| Correction: canonical | All pages | Empty on / and /de/, absent on the other 8. The language script that would set it crashes first (`seoData is not defined`), so it stays empty for everyone | Live site in a real browser |
| New finding: page language | All pages | Every page declares `lang="en"`, German pages included. The German About page has an English title | Raw HTML |
| New finding: script errors | All pages, plus home | `i18n.js` throws `seoData is not defined` on every page; the home's language switcher throws a second error | Browser console |
| Live copy on HCIG Work | https://hcig-passport.vercel.app/hcig-live/ | 25 pages copied by `scripts/mirror-hcig-live.mjs`: tracking removed, noindex on every page, forms do not send, Helma and the stylesheet copied in. `check.js` treats it as a mirror, like the 24/7 one | Helma loads, 41 of 41 images load, no gtag or ym, root `npm test` passes |
