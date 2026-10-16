# Implementation Plan: TMASI v6, the final tmasi.net website

**Branch**: `010-tmasi-v6` | **Date**: 2026-10-07 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/010-tmasi-v6/spec.md` (approved 2026-10-07)

## Summary

v6 is v3 with a new home. `tmasi-next/` (v3) is copied to a new app `tmasi-v6/` that builds to `/tmasi/v6`; v3 is never
edited. Six parts of the home change: a full-width muted film hero with a Watch film lightbox, a numbers strip, a
journey section, Medical Tourism first in services, real event photos large in News, and hubs-map planes that fly once.
Everything else (words, four languages, SEO, quote form, approved sections) carries over as it is. No 3D. The design
canvas comes first; code follows his picks.

## Technical Context

**Language/Version**: TypeScript 5, Node 18 or newer (same as v3)

**Primary Dependencies**: Next.js 16.3.6 static export, React 19.2.8, Tailwind 4, framer-motion (already in v3, used
only where v3 uses it). No three.js. Lenis stays out (he rejected it).

**Storage**: Static files. Words in `src/content/live/<lang>.json` and `src/content/ui.ts` (from v3). Films as MP4 files
in `public/video/`.

**Testing**: Word check (ported from `tmasi-v4/scripts/check-words.mjs`, run per language), weight check (ported from
`check-weight.mjs`), root `npm test`, Playwright screenshots at 360, 390, 768, 1024, 1440, 1920 px, Lighthouse.

**Target Platform**: Modern browsers on phones and desktops; static hosting on HCIG Work (Vercel) for the preview,
tmasi.net (cPanel) at go-live.

**Project Type**: Static website (Next.js export) inside the HCIG Work repo.

**Performance Goals**: Headline and buttons readable within 2.5 s on a mid-range phone on 4G and 1 s on desktop
(SC-005); the film never delays them. First-load JS no heavier than v3's home.

**Constraints**: Words exactly as v3 (FR-001). No still from any video (FR-004). Noindex preview (FR-015). Push gate:
nothing pushed without his yes. Canvas before code (FR-018). No em dashes.

**Scale/Scope**: Home first (11 sections). Then all v3 pages (about 84 across EN, DE, PL, ES).

## Constitution Check

The project constitution is still the empty template, so the gates are the HCIG rules that stand in for it:

| Gate | Status |
|---|---|
| Words kept exactly (Mohamed Memory section 0) | Pass: words come only from v3's content files; the word check fails the build on any foreign sentence |
| Canvas before code (2026-09-28, 2026-10-02) | Pass: step 2 below is the canvas; no component is changed before his picks |
| Never a still from a video (2026-09-09) | Pass: posters are designed images (bento or service photos), chosen by name |
| Push gate (2026-09-29) | Pass: local builds and screenshots only; push on his yes per change |
| No invented claims (compliance) | Pass: no "accredited", no group mention, AI people never presented as real |
| No decorative 3D (2026-09-08) | Pass: no 3D anywhere |

Re-checked after Phase 1 design: unchanged, all pass.

## Project Structure

### Documentation (this feature)

```text
specs/010-tmasi-v6/
├── spec.md
├── plan.md              # this file
├── research.md          # R1 to R8
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── content-contract.md
│   ├── media-contract.md
│   └── preview-contract.md
└── checklists/requirements.md
```

### Source Code (repository root)

```text
tmasi-v6/                      # copy of tmasi-next (v3), then changed; v3 untouched
├── next.config.ts             # basePath "/tmasi/v6"
├── scripts/
│   ├── check-words.mjs        # ported from tmasi-v4, all four languages
│   ├── check-weight.mjs       # ported from tmasi-v4
│   └── sync-preview.mjs       # out/ -> ../src/tmasi-v6
├── public/video/              # hero film (his cut), Red Sea loop, Watch film
└── src/components/
    ├── Hero.tsx               # changed: full-width muted film, designed poster, Watch film
    ├── FilmLightbox.tsx       # new: the Kling commercial with sound and captions
    ├── NumbersStrip.tsx       # new: the four figures from About
    ├── Journey.tsx            # new: Relax words + five Medical Tourism items + Red Sea loop
    ├── Services.tsx           # changed: Medical Tourism first
    ├── Blog.tsx               # changed: real event photos large, partner logos
    ├── HubsMap.tsx            # changed: planes fly once, then rest
    └── site/SitePage.tsx      # changed: the new home order
build.js                       # copy step src/tmasi-v6 -> out/tmasi/v6 (the uncommitted v4 step is removed)
```

**Structure Decision**: a sibling app `tmasi-v6/`, like v3 and v4 before it, because he wants v6 at its own URL with v3
untouched. At go-live v6 replaces v3 as the source for tmasi.net, and `tmasi-next/` is retired.

## The steps

1. **Canvas** (Claude Design, the existing hero board is not reused): the v6 home at 1440 and 390 px with the real
   photos and films playing. One option where the spec leaves a real choice: the journey (photo row vs. split with the
   Red Sea loop). The hero frame shows the 10 s Red Sea clip as a labelled stand-in until his cut arrives. He picks.
2. **Copy**: `tmasi-next/` to `tmasi-v6/` (without `node_modules`, `out/`, `.next/`), basePath `/tmasi/v6`, sync to
   `src/tmasi-v6`, build.js step. Build passes before any change.
3. **Checks first**: port the word check (all four languages against `src/content/live/*.json` and `ui.ts`) and the
   weight check.
4. **Home**, in the order he approved on the canvas: Hero + FilmLightbox, NumbersStrip, Journey, Services order, News,
   HubsMap planes. Phone composition for each.
5. **Screenshots and checks**: Playwright at six widths, Lighthouse, contrast, links, quote form against a local mock.
   He reviews locally or on his yes for a preview push.
6. **Inner pages** follow the approved home: Services and the six service pages first, then About, Contact, offices,
   News, in EN, DE, PL, ES.
7. **Go-live plan** (separate approval): basePath "", indexable, redirects checked, backup, then tmasi.net.

## Complexity Tracking

None. v6 adds three small components and changes five; no new dependency.
