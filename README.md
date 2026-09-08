# HCIG Work

Where every Healthcare International Group design, landing page and website is
built and reviewed before it reaches a company's own hosting.

**https://hcig-passport.vercel.app/**

It is a record as much as a review queue: what has been built, what is waiting
on whom, and what is live. If it is out of date, the work looks out of date.

> **Internal.** Served `noindex, nofollow`, disallowed in `robots.txt`. It is
> still a public URL to anyone holding the link, so it carries no patient data,
> no credentials and no real patient names or photographs.

---

## The gate

Built here. Reviewed here on a real URL. Deployed to the company **only once it
is approved**. Nothing skips that.

```
/                            overview: big projects, companies, what is moving
/big-projects                work every company ends up using
/everything                  every item, one sortable table
/report                      the progress report. Prints to a clean PDF
/activity                    a dated feed from the commit history
/how-it-works                the process, written down
/:company                    one brand and its projects
/:company/:project           one project, its sections and items
/:company/:project/:item     the item itself
```

An item keeps its URL for life. Edits update the page behind the link, so a
link sent three weeks ago still opens the current work.

## Commands

```bash
npm run publish     # activity, build, check, commit, push. One step.
npm run watch       # the same, 5s after you stop saving
npm run report      # writes report.md, for pasting into an email
npm test            # build then check, no commit
npm run dev         # build then preview on http://localhost:4173
```

**`npm run publish` refuses to push if the check fails.** That guard is the
reason it exists rather than a shell alias: Vercel deploys whatever reaches
`main`, and a broken page is worse than an unpublished one.

`npm run watch` is opt-in and runs in the foreground only. Nothing auto-pushes
behind your back.

## Adding or changing something

1. Put the file in `docs/` (or `src/` if it uses `%%TOKEN%%` media).
2. Add it to `content/registry.js`.
3. `npm run publish`.

Navigation, breadcrumbs, counts, search and every page are generated from that
one file. **Never hand-write a page.** That is how a status quietly goes stale
and a rename ends up half-applied.

### Project fields

| Field | Means |
|---|---|
| `status` | see below. Required |
| `updated` | `YYYY-MM-DD`. Required |
| `due` | optional target date. Overdue is worked out in the browser |
| `checklist` | optional `[{ text, done, who }]`, with a progress bar |
| `flagship` | `{ rank, line }` lifts it onto `/big-projects`. Capped at three |
| `hidden` | keeps its URL, takes it off every listing, count and search |

### Item kinds

| `kind` | Means | `src` relative to |
|---|---|---|
| `page` | A source under `src/` using `%%TOKEN%%` media placeholders | `src/` |
| `html` | A self-contained HTML design anywhere in the repo | repo root |
| `md` | A Markdown brief, rendered into the site | repo root |
| `link` | Something that already lives elsewhere. Set `href` | n/a |

`page` and `html` are served exactly as authored, with one fixed chip back to
their project. A document written elsewhere is hardened on the way through:
`lang`, `viewport` and `noindex` are added if absent, nothing else is touched.

### Status, and each says whose move it is

| Slug | Shows as |
|---|---|
| `planned` | Not started |
| `draft` | Being built |
| `review` | Waiting for Irina |
| `changes` | Needs changes |
| `approved` | Approved |
| `live` | Live on their site |
| `blocked` | Stuck on someone |

A status is a statement of fact, not a hope. **Approved** means the reviewer
said so. **Live** means it is on the company's hosting and was checked in the
rendered page, not in the template and not from an exit code.

## Layout

```
content/
  registry.js       THE SOURCE OF TRUTH: companies, projects, items
  activity.json     written by npm run publish from git log. Not by the build
  theme.css         design system: tokens, components, light and dark, print
  layout.js         icons, the page shell, breadcrumbs, status pills
  pages.js          every page type
  markdown.js       small dependency-free Markdown renderer
  studio.js         theme, search, overdue dates, the report filter
docs/               documents the site publishes
src/                Passport sources and 37 real assets
build.js            content/ + src/ -> dist/ (web) or artifacts/ (self-contained)
check.js            post-build checker. npm test runs build then check
watch.js            the file watcher
scripts/            activity.js, report.js, publish.js
serve.js            local preview with Vercel's cleanUrls and index behaviour
vercel.json         build command, clean URLs, redirects, headers, caching
```

## Two things that are easy to get wrong

**`content/activity.json` is written by `npm run publish`, never by the build.**
Vercel shallow-clones the repo, so `git log` inside a Vercel build would
silently produce a short or empty history. It also redacts held-back project
names from commit subjects, because a subject like "Hold back X" would put X
straight onto the activity feed.

**Overdue is computed in the browser, not at build time.** A build-time
comparison is wrong the moment the day turns, and this site is not rebuilt
daily.

## The build fails rather than shipping something wrong

A missing asset, an unknown token, an unknown status, a duplicate or non-kebab
slug, a relative date, a bad `due`, a malformed checklist item, a link with no
`href`, or an item pointing at a file that is not there will all stop it.

`check.js` then catches what a build cannot: dead internal links, missing `alt`,
a page that lost its `noindex`, a viewport that disables pinch zoom,
`target="_blank"` without `noopener`, and **any page that names a held-back
project outside that project's own pages**.

## Deploy

Vercel builds from this repo on every push to `main`. No dependencies to
install.

## Sources

Photography, brand marks, accreditations and partner logos are HCIG's own,
taken from the company profile and from healthcareig.com, 247clinic.net and
medparkhospitals.com. Written patient reviews are verbatim from 247clinic.net;
the star values are placeholders, as the source publishes no ratings. Video
testimonials are HCIG's own, re-encoded for the web. Map tiles are copyright
Esri, HERE, Garmin, Maxar, Earthstar Geographics and the OpenStreetMap
contributors.

Financial figures in the Passport business case are illustrative placeholders
pending HCIG actuals, and the patient shown throughout the interface library is
fictional.
