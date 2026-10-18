# Research and decisions: healthcareig.com rebuild (spec 012)

Each entry: decision, why, what else was considered. Technical choices are ours by his standing word ("use your
best, you decide"). Facts marked [verified 2026-10-18] were checked on the live site or DNS that day.

## R1. Stack

- **Decision**: Next.js 16.3 static export, React 19.2, TypeScript, Tailwind v4, `motion`. Folder `hcig-v3/`.
- **Why**: the house pattern (247clinic-v3, medcierge-next, tmasi-next), proven on HCIG Work previews and on a GoDaddy
  cPanel go-live (tmasi.net, 2026-10-16). Static files are the fastest and safest thing to put on PHP 7.1 hosting.
- **Considered**: keep and repair the PHP site (end of life runtime, no build-time checks, client-side i18n); Astro
  (not the house stack, tooling would be rebuilt); WordPress (attack surface and upkeep for a 45-page site).

## R2. Reuse from TMASI v3 [verified 2026-10-18]

- **Decision**: adapt, do not reinvent: `extract-live-content.py` (word-for-word extraction), the slug and news maps in
  `lib/site.ts`, `build-live.mjs`, `sync-preview.mjs`, `flatten-prefetch.mjs`, the go-live `.htaccess` and the SFTP
  batch scripts in `tmasi-live/golive-2026-10-16/`.
- **Why**: healthcareig.com is the same Pulse template as tmasi.net: same section folders, `blog/newsN.php` posts, the
  client-side `i18n.js`, `.section-do`/`.section-do1` desktop and phone copies, the same Yandex setup.
- **Considered**: a fresh scaffold (slower, loses fixes already paid for, such as the host traps in R5).

## R3. Languages and routing

- **Decision**: one root layout per language in route groups (`(en)`, `(de)/de`, `(pl)/pl`, `(fr)/fr`, `(it)/it`,
  `(es)/es`, `(cs)/cs`), each with `[[...slug]]`; one route table `lib/routes.ts` maps every page id to its slug in each
  language; `lang` written per page; trailing slashes like the live site.
- **Words**: English and German source words come from the live site, frozen in `content/source/`. The five new
  languages are translated from the English source through dictionaries (`content/dict/<lang>.json`, Medcierge
  pattern: `i18n-todo` lists missing strings, Claude translates, Gemini cross-checks, `i18n-fill` writes them).
- **Slugs**: translated and folded to ASCII (ä to ae, ł to l, accents dropped). Existing German slugs stay
  (`/de/ueber-uns/`, `/de/leistungen/`, `/de/kontakt/`).
- **Considered**: `next-intl` with middleware (needs a server; static export cannot run middleware); one folder per
  language written by hand (drifts; Medcierge proved dictionaries scale to 527 pages).

## R4. The German gap

- **Decision**: at the English go-live, only the English PHP files move out. `/de/` keeps its PHP pages, `i18n.js`,
  `css/styless.css` and `de/img/` until wave two writes the new German pages to the same addresses.
  `DirectoryIndex index.html index.php` lets both live side by side. Phase 0 already gives the old German pages a
  canonical, a title and hreflang to the English addresses, which do not change at go-live.
- **Why**: his "English first" plus his rule never to lose an indexed address.
- **Considered**: redirecting `/de/` to English during the gap (loses German rankings); delaying English until German is
  ready (against his choice).

## R5. Host: GoDaddy cPanel Apache [verified on tmasi.net 2026-10-16, same host type]

- **Decision**: upload over SFTP, one connection at a time, changed files only (hash diff of two builds), staged in a
  private folder, then swapped. `.htaccess` carries the TMASI fixes:
  1. `.pl.` in a file name runs as Perl: `RemoveHandler .pl` and `SetHandler default-handler` for `.txt` (Polish
     prefetch files would 500 otherwise).
  2. HEAD answers gzip-encoded break Next's prefetch check: `SetEnvIf Request_Method HEAD no-gzip`.
  3. The firewall resets parallel SFTP sessions: one connection per job.
  4. `put -r src dst` into an existing `dst` nests it: give the parent as the target.
  5. About 25 files a minute: a full upload of 7 languages takes hours, so upload diffs.
- **Considered**: FTP from the cPanel file manager (slow, no scripting); moving to Vercel or Cloudflare Pages (he has
  cPanel and the domain's mail and DNS live at GoDaddy; a host move is a separate decision).

## R6. Server software

- **Decision**: in Phase 0, read cPanel's MultiPHP manager. If PHP 8.1 or newer is offered, switch the domain after a
  backup and a test of `send.php` on the old site. The new site is static; only `api/lead.php` needs PHP.
- **Why**: PHP 7.1.33 has had no security fixes since 2019 [verified].
- **Considered**: leave it (rejected: the form endpoint would run on it).

## R7. Leads: one endpoint

- **Decision**: `public_html/api/lead.php` (PHP 8) takes three kinds: `enquiry`, `kit`, `newsletter`. It validates,
  checks a honeypot, a minimum fill time and a per-address rate limit, then:
  1. emails partner@healthcareig.com with Reply-To set to the visitor, envelope sender `website@healthcareig.com`;
  2. appends the lead to a CSV outside `public_html` (24-month retention, purge script);
  3. sends a no-personal-data `lead` event to the HCIG tracking hub;
  4. for `kit`, returns the PDF address and emails the link; for `newsletter`, calls Brevo's double opt-in.
  Secrets (Brevo key, hub token) sit in `~/hcig-private/lead-config.php`, never in git.
- **Why**: data stays on our host, the design stays ours, Irina's counts come from one place.
- **Considered**: keep the old `send.php` (unknown code, PHP 7.1; reviewed in Phase 0 anyway); JotForm forms (data on a
  third party); Cloudflare Turnstile (adds a script; added only if spam appears).

## R8. Newsletter tool

- **Decision**: Brevo free plan (EU company, double opt-in, API). He opens the account; the API key goes only into the
  private config on the host.
- **Considered**: MailerLite (also fine; Brevo's transactional email also sends the kit link if PHP mail proves weak).

## R9. Email authentication [DNS verified 2026-10-18]

- **Finding**: MX on Microsoft 365; SPF `v=spf1 include:secureserver.net -all`; no DKIM selectors; no DMARC.
- **Decision**: first a test send from partner@ to Gmail and to a header checker. Then, with DNS and Microsoft 365
  admin access: SPF `v=spf1 include:spf.protection.outlook.com include:secureserver.net -all` (stays under 10 lookups),
  DKIM enabled in Microsoft 365 (two CNAMEs), DMARC `p=none` with reports for 2 to 4 weeks, then `quarantine`. Old
  records saved before any change.
- **Considered**: changing only SPF (DKIM is what Gmail and Yahoo now expect for reliable delivery).

## R10. Consent and tags

- **Decision**: our own small consent banner in the site's design: Accept all, Reject, Settings (Analytics, Marketing).
  Google Consent Mode v2 defaults to denied; GA4 = analytics; Google Ads and LinkedIn Insight = marketing; Yandex
  Metrika (both counters kept) = analytics and loads only after a yes. Choice kept 6 months in a first-party cookie.
  The banner shows to every visitor; the site works fully on a no.
- **Trap** [verified on tmasi.net]: a `next/script` id of `ym` or `gtag` overwrites `window.ym` or `window.gtag`; use
  `hcig-*-init` ids.
- **Phase 0**: the same banner as a standalone script and stylesheet in the PHP header, wording shown to him first.
- **Considered**: a paid consent platform (cost, heavy script); no banner (not lawful for EU visitors with these tags).

## R11. Analytics stack

- **Decision**: new GA4 property for healthcareig.com through gtag (no GTM, one script less); Google Ads
  AW-17729597588 conversions through the same gtag; Search Console (HTML file verification in Phase 0, domain property
  when DNS is open); Bing Webmaster Tools imported from Search Console; IndexNow key at the root; the HCIG tracking hub
  tag in anonymous mode before consent.
- **Considered**: GTM (useful when marketing edits tags without us; can be added later without page changes).

## R12. Fonts

- **Finding** [verified 2026-10-18]: the live site already serves Helma: `/fonts/Helma.woff2` (25 KB) and
  `/fonts/Helma.woff` (34 KB), one weight, uploaded 2025-10-10, declared in `css/styless.css`. He asks Pulse who bought it
  and whether the licence covers the web (and a second domain for the preview).
- **Decision**: Inter self-hosted through `next/font`. Helma through `next/font/local` from those same files, with
  `size-adjust` on the fallback so nothing jumps. On healthcareig.com it loads from `/fonts/`; the preview ships the
  same woff2 in the export (the `/hcig-live` copy already does). If the licence does not cover the web, a close Google
  serif picked on the canvas replaces it. The open question from 24/7 (making the repo private) applies here too.
- **Considered**: Inter Black only (the guideline's second headline face; less editorial).

## R13. Images, film, generated visuals

- **Decision**: stills to AVIF and WebP at three widths with explicit sizes; logos as SVG where an official file exists,
  else trimmed PNG; films H.264 MP4 with faststart (plus WebM where smaller), a desktop cut and a lighter phone cut,
  `preload="none"`, attached after load (MedPark lesson: never call `load()` during page load); posters designed, never
  frames. Generated images (Nano Banana) and video (Veo) through the `imagine` skill, art-directed and reviewed by Opus.
- **Rule kept**: AI-made people never presented as named leaders, staff, patients or testimonials.
- **Testimonials**: re-encoded for the web at 720p or 1080p with no visible loss (112 MB today).

## R14. Icons

- **Decision**: our own hairline set (stroke 1 to 1.25 at 24 px) from the `world-class-aura` vector registry, drawn per
  meaning (assistance, repatriation, hotel, insurer, embassy, provider, corporate, network, accreditation). Lucide at
  stroke 1.25 only where the set has no glyph yet.
- **Considered**: Font Awesome as on the old site (heavy, not luxury); emoji (banned).

## R15. Maps

- **Decision**: a hand-drawn SVG map (TMASI `WorldMap` and `HubsMap` as the base) for the network page and any home map:
  no tiles, no key, fast, on-brand. Places only from the fact sheet.
- **Considered**: Leaflet with CARTO tiles (heavier, generic look); Google Maps (billed per load).

## R16. The 3D concept

- **Decision**: built on the canvas only, as one option ("the ecosystem"). If he picks it, `three` loads after the main
  content on desktop, a lighter real 3D scene on phones (his rule: phones get real 3D), a designed still for reduced
  motion and old devices, inside the speed budget.

## R17. Partner kit

- **Decision**: one HTML template per partner type in the brand, printed to PDF with Playwright; English first, other
  languages with their wave; served from `/kit/` with `X-Robots-Tag: noindex`; the address is given after the form.
- **Considered**: a designer-made PDF (Reham can still supply covers; the content stays generated from the fact sheet).

## R18. SEO implementation

- **Decision**: `lib/seo.ts` builds title, description, canonical (absolute), hreflang (only languages that exist for
  that page, plus x-default to English); `lib/schema.ts` builds one JSON-LD graph per page with stable ids
  (`https://healthcareig.com/#organization`, `#website`, brand ids, person ids); per-language sitemaps plus an index;
  `llms.txt` and `llms-full.txt`; robots per build. Detail: `contracts/seo-schema.md`.

## R19. Redirects

- **Decision**: one-hop 301s in `.htaccess` for every old address (list in `contracts/urls.md`); a redirect checker runs
  against the list before and after go-live. Phase 0 adds the duplicate redirects that are safe today
  (`/services.php`, `/blog.php`, `/kontakty.php`, `/index.php`, `/de/index.php`, `/news1.php`, `/about.php`,
  `/partners.php`). News addresses move at go-live, not before.

## R20. Performance

- **Decision**: static HTML; self-hosted, subset fonts with one preload; images sized; the JotForm agent loaded on idle
  after the first interaction or 4 s; no smooth-scroll library (he rejected Lenis); `motion` only in the components that
  need it; a weight budget enforced by a script that reads the export. Lighthouse mobile run locally per template.

## R21. Quality gates

- **Decision**: `npm run check` in `hcig-v3/` runs the word checker, banned patterns, hreflang reciprocity, internal
  links and the export weight budget. Playwright and axe run before each review round; Lighthouse before Phase 5.

## R22. Delegation

- **Decision**: Hive tickets with `epic: "012-hcig-website"`. Opus: everything in Phases 0, 1, 2, the home, templates,
  partner and trust pages, SEO, redirects, consent, tracking, `lead.php`, go-live. Gemini through `agy-delegate` in a
  clean worktree: brand pages, news migration, legal and event pages on approved templates, alt and meta first drafts,
  translation cross-check, image and video generation, screenshot sweeps, second-opinion reviews. Opus reads every
  diff and runs the checks before anything lands.

## R23. Monitoring

- **Decision**: add healthcareig.com to the site watchdog (spec 005): status of key pages, the lead endpoint health
  check, presence of the tags after consent, certificate expiry. Search Console and Bing watched daily for 14 days
  after each launch.

## R24. AI visibility measurement

- **Decision**: 30 fixed prompts (10 brand, 20 B2B category) in ChatGPT, Perplexity, Gemini and Copilot plus Google AI
  Overviews checks; baseline in Phase 0 into `docs/hcig-ai-baseline.md`; re-run monthly, results logged with dates.
