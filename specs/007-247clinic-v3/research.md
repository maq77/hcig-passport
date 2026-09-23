# Research: 24/7 Clinic v3

Every decision with its reason and what was rejected. Evidence dated 2026-09-23 unless
marked otherwise.

## R1. Stack

- **Decision**: Next.js 16 static export (`output: "export"`), TypeScript, Tailwind v4, in `247clinic-v3/`.
- **Rationale**: The user asked for the best stack that uploads as plain files. A static export is exactly that. It reuses the Medcierge setup that reached the quality bar (config, `flatten-rsc.mjs`, marquee, count-up and reveal patterns), and 21st.dev components are React and Tailwind, so they drop in without porting.
- **Alternatives**: a node HTML generator like v2 (lightest, but every 21st.dev part hand-ported, and v2 is the look being replaced); Astro (fastest pages, but a third stack to maintain); a server-rendered Next app (needs Node on the server, which their host does not run).

## R2. Their server, verified

- **Evidence**: `247clinic-src/app/web.config` and `App.UI.runtimeconfig.json`: ASP.NET Core net7.0, IIS in-process (`AspNetCoreModuleV2`), SolidCP 1.5.0, Cloudflare in front. FTP access and the web root are recorded in private HCIG memory (stack-access), not in this public repo.
- **Decision**: go-live replaces the app with the static build. IIS serves files itself once the `aspNetCore` handler is removed from `web.config`. No runtime, no hosting bundle, no database needed.
- **Consequences**: their admin CMS no longer drives the public pages; the clinic map data is frozen into the build (it is already a copy in `content/247clinic/clinics.json`); the two live blog articles keep their URLs as static pages or 301s.

## R3. Clean URLs without a trailing slash on IIS

- **Evidence**: the live sitemap (fetched 2026-09-23) lists `/about-us`, `/services`, `/our-clinics`, `/insurance`, `/beauty-wellness`, `/blog`, `/faqs`, `/contact-us` and two `/article/2023/11/...` pages. No trailing slash.
- **Decision**: export with `trailingSlash: false` (files like `about-us.html`) and an IIS URL Rewrite rule that serves `/about-us` from `about-us.html`. Keeps every ranking URL byte for byte.
- **Unknown**: whether the URL Rewrite module is installed. Settled by the phase 0.5 probe: a test folder with a rewrite rule, removed after.
- **Fallback A**: `trailingSlash: true`; IIS 301s `/about-us` to `/about-us/` on its own; canonicals point to the slash form. Small, temporary ranking wobble.
- **Fallback B** (last resort, needs the user's yes, because it does run a program on the server): a thin ASP.NET Core host (a few lines, uses the .NET 7 already installed) that serves the static files with clean URLs, the 404, the 301 map and the B2B form endpoint. Built here, uploaded over FTP like any file.

## R4. Films

- **Decision**: hero = the Le Rêve commercial (only landscape clinic film, 1276x720, 68 s), cut to a 14 s silent loop, H.264 MP4 plus VP9 WebM at 1280x720 (under 2.5 MB) and a 960x540 phone cut (under 1.2 MB). Portrait films at 540x960 for cards, full size in the viewer.
- **Rules**: `muted playsinline loop`, no `poster` from any film, play only while on screen, pause control, no autoplay under reduced motion. The still shown before play is a design slot.
- **Stretch to loop**: the first 14 s, set by the user at approval. Chosen by timestamp, never by looking at frames.
- **Alternatives**: portrait split hero (sharper, rejected by the user in favour of full-bleed); a new montage (would need frames reviewed to cut well; not allowed to inspect frames).

## R5. Fonts, and a licensed file in a public repo

- **Decision**: Poppins through `next/font/google` (downloaded at build, served from our own files, no Google request at runtime). Calisto MT through `next/font/local` once the user supplies it, with `size-adjust` on the fallback to keep layout still.
- **Licence handling**: the user supplied `Calisto MT Regular.ttf` and `Calisto MT Bold.ttf` in `247 material/`. The raw TTFs are gitignored. The build subsets them to Latin woff2, which ships inside the export like any website's web font. Still open with the user: making the repo private, which would keep even the subset out of public git history.

## R6. Images

- **Decision**: stills pre-optimised by `sharp` into AVIF and WebP at 3 widths, served with `<picture>` and explicit sizes; `next/image` stays `unoptimized` (static export). Never `.jpg` in the repo (the root `.gitignore` drops `*.jpg`; v2 lost its photos to that).
- **Sources**: Pexels first, Gemini (`/imagine`) only for a scene Pexels lacks, never an image of "the clinic" pretending to be real. Credits in `docs/247clinic-v3-media-credits.md`.

## R7. Motion

- **Decision**: CSS and IntersectionObserver for reveals, count-up, marquee and the step line; `motion` only for the hero panel entrance and the film viewer. No smooth-scroll library (feels like scroll-jacking on phones).
- **No-JS safety**: reveal styles only apply under `html.js`, set by a tiny inline script; without it everything is simply visible. This is the fix for the v2 bug where a missing library hid the page.

## R8. Map

- **Decision**: Leaflet with OpenStreetMap tiles, loaded only when the section is near the screen. Directions open Google Maps with the clinic's coordinates (a plain link, no key).
- **Alternatives**: Google Maps embed (their key is locked to their domain, and every load is billed); a static image (no key available).

## R9. The word-for-word checker

- **Decision**: after export, `check-brief.mjs` extracts visible text and `alt`, `aria-label` and `title` values from every page and requires each sentence to be in the brief (normalised for whitespace, quotes, bullets and dashes) or in `ui-labels.json`.
- **Dashes**: the brief uses em dashes in a few content lines (sections 21 and 26). The user's rule bans em dashes. Output replaces a dash with a comma or a full stop; the checker treats that as equal. Words never change. Already the approach in `content/247clinic/GAPS.md`.
- **Also fails on**: em or en dashes in output, "guarantee" near "cashless", "accredited by" next to GHA or DMWV, "Lorem".

## R10. Logos

- **Decision**: official files only (brand press pages, Wikimedia Commons originals, the insurer's own site), SVG where possible, else PNG at 2x. Shown grey at rest, colour on hover. Each file listed with its source URL in `public/logos/SOURCES.md`.
- **Scope**: insurers and assistance companies (the user: the clinic bills all insurers); hotel brands only where their clinic data has a clinic; accreditation marks with the exact wording (UCA accreditation; GHA and DMWV "Official Partner of"). Russian insurers and operators left out.

## R11. Tracking

- **Decision**: the brief's event names (`whatsapp_medical_click`, `whatsapp_insurance_click`, `clinic_view`, `clinic_directions_click`, `phone_click`, `b2b_form_submit`) sent to the HCIG first-party tracker already used on v2, plus GA4 through Consent Mode once a measurement ID exists (none today). UTM parameters kept on WhatsApp links where the brief asks for source tracking.

## R12. B2B form

- **Preview**: the form validates and hands the enquiry to WhatsApp or email with the fields filled in. Nothing is stored.
- **Live**: decided at go-live. Options: fallback B's thin host with SMTP; a form service; WhatsApp and email only.

## R13. Languages

- **Decision**: English at the root. German, Polish and Czech later under `/de/`, `/pl/`, `/cs/` with translated slugs, on the Medcierge dictionary recipe (`medcierge-next/HANDOVER.md`, 2026-09-17 section). Strings live in dictionaries from day one so nothing is hard-coded.

## R14. Verification tooling

- **Decision**: Playwright MCP at 375x667 and 1440x900, with reduced motion emulated and with JavaScript off. `<video>` hidden with CSS before every screenshot (standing rule). Lighthouse mobile and axe per template. Rendered-head check (robots, canonical, schema) on the published preview, not the source.
