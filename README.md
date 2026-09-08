# HCIG Studio

Internal staging and review for every Healthcare International Group design,
landing page and website.

Every design, UI kit, landing page and site is built here and deployed here
**first**. The reviewer opens it on a real URL, gives edits, and the same URL
updates. Only once it is **Approved** does it get deployed to the company's own
hosting. Nothing skips that gate.

> **Internal.** Served `noindex, nofollow`, disallowed in `robots.txt`. It is
> still a public URL to anyone holding the link, so it carries no patient data,
> no credentials and no real patient names or photographs.

---

## The shape of the site

```
/                            overview: the group, what is moving, where to go
/workflow                    the review process, written down
/:company                    one brand and its projects
/:company/:project           one project, its stages and deliverables
/:company/:project/:item     the deliverable itself
```

A deliverable keeps its URL for its whole life. Edits update the page behind the
link. A link sent three weeks ago still opens the current work.

## Adding something

1. Put the file in the repo. A page under `src/`, an HTML design anywhere, or a
   Markdown brief anywhere.
2. Add it to `content/registry.js` under the right company, project and stage.
3. `npm run build`.
4. Push. Vercel deploys.

The navigation, breadcrumbs, counts, search index and every page are generated
from that one file. **Never hand-write a page.** That is how a status quietly
goes stale and a rename ends up half-applied.

### Item kinds

| `kind` | Means | `src` is relative to |
|---|---|---|
| `page` | A source under `src/` that uses `%%TOKEN%%` media placeholders | `src/` |
| `html` | A self-contained HTML design anywhere in the repo | repo root |
| `md` | A Markdown brief, rendered into the portal | repo root |
| `link` | Something that already lives elsewhere. Set `href` | n/a |

`page` and `html` are served exactly as authored, with one fixed chip back to
their project. `md` is rendered into the portal's own chrome.

### Status vocabulary

`planned` · `draft` · `review` · `changes` · `approved` · `live` · `blocked`

A status is a statement of fact, not a hope. **Approved** means the reviewer
said so. **Live** means it is on the company's hosting and was checked in the
rendered page, not in the template and not from an exit code.

## Layout

```
content/
  registry.js       THE SOURCE OF TRUTH: companies, projects, deliverables
  theme.css         design system: tokens, components, light and dark
  layout.js         icons, the page shell, breadcrumbs, status pills
  pages.js          the five page types
  markdown.js       small dependency-free Markdown renderer
  studio.js         client script: theme toggle and search (Ctrl K or /)
src/
  business-case.html  bmc.html  ui-kit.html   HCIG Passport sources
  assets/                                     37 real assets
build.js            content/ + src/ -> dist/ (web) or artifacts/ (self-contained)
serve.js            local preview with Vercel's cleanUrls and index behaviour
vercel.json         build command, clean URLs, redirects, headers, caching
```

## Build

```bash
npm run build            # -> dist/        the portal, for Vercel
npm run build:artifacts  # -> artifacts/   self-contained single files
npm run dev              # build + preview on http://localhost:4173
```

### Why two build modes

Sources under `src/` reference media through a `%%TOKEN%%` placeholder, resolved
at build time in one of two ways:

- **`dist/`** tokens become `/assets/<file>`. The HTML stays small and the
  browser caches the 2.1 MB of media separately. This is what Vercel serves.
- **`artifacts/`** tokens become base64 `data:` URIs, producing self-contained
  single files. The Claude artifact sandbox blocks external hosts, so everything
  has to be inline there.

### The build fails rather than shipping something wrong

A missing asset, an unknown token, an unknown status, a duplicate slug, a
non-kebab slug, a relative date, a link with no `href`, or a deliverable
pointing at a file that is not there will all stop the build.

### Screen numbering

Screen captions in the Passport interface library are numbered `01..74` in
document order at build time. Insert a screen anywhere and the rest renumber
themselves. Never edit the numbers by hand.

## Deploy

Vercel builds from this repo on every push to `main`. No dependencies to
install. To deploy manually:

```bash
npx vercel --prod
```

## Sources

Photography, brand marks, accreditations and partner logos are HCIG's own, taken
from the company profile and from healthcareig.com, 247clinic.net and
medparkhospitals.com. Written patient reviews are verbatim from 247clinic.net;
the star values are placeholders, as the source publishes no ratings. Video
testimonials are HCIG's own, re-encoded for the web. Map tiles © Esri, HERE,
Garmin, Maxar, Earthstar Geographics and the OpenStreetMap contributors.

Financial figures in the Passport business case are illustrative placeholders
pending HCIG actuals, and the patient shown throughout the interface library is
fictional.
