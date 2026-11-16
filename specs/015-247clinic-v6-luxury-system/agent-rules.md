# Rules for every agent working on spec 015 (24/7 Clinic v6)

Read `specs/015-247clinic-v6-luxury-system/spec.md` first. It is the approved design. Follow it exactly.

## Where
- Source: `247clinic-v4/` (Next 16.3.5, static export). Read `247clinic-v4/node_modules/next/dist/docs/` for any Next API you use. No new npm dependencies.
- Branch `247clinic-v6` is checked out. Do NOT commit, push, stash, reset or checkout. The head session reviews and commits.
- Touch only `247clinic-v4/**` and, when the brief says so, `content/247clinic/**`. The repo has many unrelated dirty and untracked files. Leave them alone.
- Build and check the preview slot: from `247clinic-v4/`, run `node scripts/preview-slot.mjs v6`. That runs `next build`, `flatten-rsc`, `check-brief` and syncs to `../src/247clinic-v6`. It must end green.
- Look at it locally: serve `../src` statically, e.g. `npx --yes serve -l 4317 "D:/Healthcare international group/src"`, then open `http://localhost:4317/247clinic-v6/`. The basePath is `/247clinic/v6`, so serving `src` makes the paths mismatch. Instead copy or serve so `/247clinic/v6/` maps to `src/247clinic-v6/`. A tiny Node static server script in the scratchpad that maps `/247clinic/v6/*` to `src/247clinic-v6/*` (with `.html` fallback for extensionless routes) is the reliable way.
- Screenshots: the Playwright MCP tools, or playwright-core with the local Chrome (`C:/Program Files/Google/Chrome/Application/chrome.exe`). Hide every `<video>` with CSS before any screenshot. Never capture a video frame. Widths 360, 390 and 1440.

## Words (the content gate is strict)
- `scripts/check-brief.mjs` fails the build on any visible text, alt, aria-label, title or meta that is not in the corpus. The corpus is:
  - the brief
  - `content/247clinic/en/*.json`
  - `reviews.json`
  - `approved-edits.json`
  - `src/content/ui-labels.json` labels and patterns
  - `media.ts` names
  - `clinics.ts` names
- Reuse existing strings. A new interface word (button or aria label, not a claim) is APPENDED to `ui-labels.json` `labels`. Never insert or remove there, because the file is read by index in places.
- Never invent facts, numbers, ratings, prices, medical, insurance or accreditation claims.
  - UCA (Urgent Care Association) is the accreditation.
  - GHA and the German Medical Wellness Association are "Official Partner of", never "accredited by".
  - Cashless is never promised flat.
- Never the word "guide". No em or en dashes anywhere (code comments included). No emojis.
- Report every string you added or changed in your final message.

## Design system (from the spec)
**Colour**
- Ivory `#FBF8F4`, ink `#1A1414`, red `#C00000` as accent only.
- Every other tone is an ink opacity: rgba(26,20,20,.78 / .62 / .24 / .12 / .04).
- Red text on ink uses `#E8121C`.
- WhatsApp is the only green: white button, 2px `#25D366` frame, `#0B7A3A` text, `#1DA851` glyph.
- No gradients of colour, anywhere. A `mask-image` gradient used for a fade-out clamp is allowed.

**Fonts**
- Cormorant Garamond (`--font-lux`, 300/400) for h1 and h2 and large quotes.
- Calisto (`--font-display`) only for numbers, step numerals and the tagline.
- Poppins (`--font-sans`, 400/500/600) for everything else.
- No synthetic italics.

**Shape and surface**
- Radius tokens: 4, 10, 16, 24, 999.
- 1px hairlines. The 40px red rule is the signature.
- No resting shadows. `--shadow-float` is for the menu, modals and the float only.
- Lucide icons at strokeWidth 1.25.

**Motion**
- Easings: out (.16,1,.3,1), in-out (.65,0,.35,1), curtain (.76,0,.24,1).
- Durations: 180, 400, 900 and 1400ms. Transform and opacity (and clip-path) only.
- Respect `prefers-reduced-motion`.
- NEVER a smooth-scroll library, wheel or inertia hijack, custom cursor, grain, sound or giant wordmark. No hero zoom.

**Phone first, desktop second**
- Tap targets of at least 44px (52px standard buttons).
- Inputs of at least 16px.
- No horizontal scroll at 360px.

## Keep (his picks)
- WhatsApp button style.
- Side words desktop only.
- 7 services, with the phone grid at 2 x 3 (never a swipe row).
- Insurance words as they are.
- Trusted by Patients as one slim row.
- The opening curtain once per visit (class `.oc`, never `.intro`).
- The newsletter band words.
- The FAQ on the cream room photo.
- Desktop hero as an ink panel left with the photo right.
- All `data-e-section` and `data-e-block` attributes (his editor needs them).
- Never use a still from a video. Video stays video.
