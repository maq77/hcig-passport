# HCIG Passport

Business case and interface library for **HCIG Passport** — a group-wide patient
identity and care app for Healthcare International Group.

Two deliverables, one static site:

| Page | What it is |
|---|---|
| `/business-case` | Why the group needs a Master Patient Index, how the money is made and recovered, architecture, phasing, GDPR, and prepared answers to every question IT will ask. Includes a live revenue model. |
| `/ui-kit` | Design system plus 74 screens of the guest app, clinician client and dispatch board — iPhone 16 Pro Max, light and dark. |

> **Internal.** Financial figures in the business case are illustrative
> placeholders pending HCIG actuals, and the patient shown throughout the
> interface library is fictional. The site is served `noindex`.

---

## Layout

```
src/
  index.html          landing page
  business-case.html  source (uses %%TOKEN%% placeholders for media)
  ui-kit.html         source
  assets/             37 real assets — photos, brand marks, video, maps, QR
build.js              src/ -> dist/ (web) or artifacts/ (self-contained)
serve.js              local preview with Vercel's cleanUrls behaviour
vercel.json           build command, clean URLs, headers, asset caching
```

## Build

```bash
npm run build            # -> dist/        static site for Vercel
npm run build:artifacts  # -> artifacts/   self-contained single files
npm run dev              # build + preview on http://localhost:4173
```

### Why two build modes

The sources reference every image, video and map through a `%%TOKEN%%`
placeholder, resolved at build time in one of two ways:

- **`dist/`** — tokens become `assets/<file>` paths. The HTML stays small
  (~360 KB total) and the browser caches the 2.1 MB of media separately.
  This is what Vercel serves.
- **`artifacts/`** — tokens become base64 `data:` URIs, producing two
  self-contained files (3.1 MB and 6.9 MB). The Claude artifact sandbox blocks
  external hosts, so everything has to be inline there.

`build.js` fails loudly on a missing asset or an unknown token, so a broken
image can't reach production silently.

### Screen numbering

Screen captions in the UI kit are numbered `01..74` by `build.js` in document
order. Insert a screen anywhere and the rest renumber themselves — never edit
the numbers by hand.

## Deploy

Vercel builds from this repo on every push to `main`. No configuration beyond
`vercel.json`; there are no dependencies to install.

To deploy manually instead:

```bash
npx vercel --prod
```

## Sources

Photography, brand marks, accreditations and partner logos are HCIG's own,
taken from the company profile and from healthcareig.com, 247clinic.net and
medparkhospitals.com. Written patient reviews are verbatim from 247clinic.net —
the star values are placeholders, as the source publishes no ratings. Video
testimonials are HCIG's own, re-encoded for the web. Map tiles © Esri, HERE,
Garmin, Maxar, Earthstar Geographics and the OpenStreetMap contributors.
