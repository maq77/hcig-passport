# Spec 015: 24/7 Clinic v6, luxury system redesign of v3

Status: approved (his plan approval, 2026-11-16). Supersedes spec 014 where he changed his mind: white WhatsApp button with green frame, rewriting allowed, live preview at /247clinic/v6 instead of a canvas round (he asked for no questions).

His ask (2026-11-16, kept exactly): "all i care now about is the ui and ux and design and motions and premium feel and luxurious feel ... keep our current v3 design into account but also look for more improvements and re desigining ... even if you want to re write or remove or add or edit or use content or designs ... dont ask me any questions".


## Context
He wants v3 to feel like elite, luxurious care. That means better UI/UX, motion, premium images and real guest reviews, a full website, and as little feedback from him as possible. He said "dont ask me any questions". He gave permission to cut, rewrite, add or remove content. Facts are still never invented.

v3 source is `247clinic-v4/` (Next 16 static export), served at /247clinic/v3. His recent picks are kept. The design system underneath is rebuilt because today it is a pile of fighting CSS:
- 993-line globals with 39 `!important`
- an `@layer utilities` "vault" block that beats every later rule
- 23 gradients and about 42 hex colours
- radius values hard-coded, never tokenised
- editor zoom hacks

Plan by Fable from two code maps. Reviewed by Opus against his history. One correction: phone services stay a 2 x 3 photo grid (his 2026-09-24 correction), not a swipe row.

**Review surface instead of canvas.** He asked for no questions and minimal feedback. So the work is built on a branch into the separate slot **/247clinic/v6**. v3 stays untouched for a side-by-side look, as with v5 and his "publish directly to v3 preview" precedent. Promotion to /v3 and any 247clinic.net go-live are separate yes moments.

## 1. Design direction (the aura)
A private resort concierge that happens to be a clinic. v3's structure and his picks stay; the system underneath is rebuilt.

**Colour**
- Ivory `#FBF8F4` ground and ink `#1A1414`.
- Red `#C00000` is an accent only: hairlines, numerals, the call button.
- All other tones are ink opacities: text at 100, 78 and 62%; lines at 12 and 24%.
- Dark areas are solid ink panels. No gradients.
- Exceptions:
  - `#E8121C` for red text on ink, for contrast.
  - The WhatsApp trio stays his pick: white button, `#25D366` frame, `#0B7A3A` text.

**Type (3 families)**

| Role | Family | Size |
|---|---|---|
| h1 | Cormorant Garamond 300 (400 under 40px) | `clamp(44px,6.4vw,92px)`, leading 1.04; second line 0.86em, keeping his 0.9 / 0.8 hero edit |
| h2 | Cormorant Garamond 300 | `clamp(34px,4.4vw,60px)` |
| Numbers, step numerals, tagline | Calisto | as set |
| Body | Poppins | 16/1.7 phone, 17/1.7 desktop |
| Label | Poppins | 12px phone, 15px desktop, caps, 0.2em tracking |

**Rhythm**
- `--section: clamp(64px,8vw,120px)`, measure 60ch.
- Calm comes from fewer elements, not extra air. He rejected the spacing-only v5.

**Radius**
- 4px on inputs and tags, 10px on cards, 16px on photos and panels, 24px on sheets.
- Buttons stay pills.

**Lines and icons**
- 1px hairlines, with a 40px red rule as the signature mark.
- Lucide icons at stroke 1.25.
- No resting shadows. One `--shadow-float`, used only for modal, menu and float.

**Motion**

| Element | Movement |
|---|---|
| Text | Rises 16px with a fade, 900ms, 70ms stagger |
| Headings | Rise word by word from a clip mask (replaces the blur) |
| Photos | Open with a clip-path wipe over 1100ms, scale 1.05 to 1 |
| Hairlines | Draw in |
| Hover | Image 1.04 over 1.2s; press 0.98 over 180ms |

- Easings: out `(.16,1,.3,1)`, in-out `(.65,0,.35,1)`, curtain `(.76,0,.24,1)`.
- Durations: 180, 400, 900 and 1400ms.
- **No wheel or inertia hijack, no cursor, grain, sound or giant wordmark.** These are his past rejections.
- Drift uses CSS `view()` behind `@supports`, at most 4%, on fine pointers only.
- Reduced motion is respected everywhere.

**References used (already verified)**
- Maravilla: red serif on cream, numbered photo cards.
- Rosewood and Chedi: the calm header.
- Bvlgari: destinations as navigation.
- Pulso: label column and hairlines.
- Château Margaux: one proof line at the hero foot.
- Marassi: contact rail and offset photos.
- Sister sites hcig-v6 and tmasi-next: header shrink, circle menu, word mask.

## 2. Phase 0: record and slot (Opus)
1. Tag HEAD `247clinic-v3-2026-11-16`. The old tag is 5 commits stale.
2. Create branch `247clinic-v6`. Commit the pending `build.js` v6 block on its own.
3. Write `specs/015-247clinic-v6-luxury-system/spec.md` from this plan, Status approved. It supersedes 014 where he changed his mind: the white WhatsApp button, rewriting allowed, live preview instead of canvas.
4. Short inspiration top-up (Haiku plus Playwright). Three 21st.dev references: a single-quote testimonial, a numbered full-screen menu and a split hero. Mechanics only, saved to `docs/247clinic-design/2026-11-16-v6/refs.md`.
5. Sonnet inventories, run in parallel. They find dead components to delete:
   - `HeroDepth`, `Grow`, `Watermark`
   - `LiquidServiceCard`, `MouseHoverGlassWrapper`
   - the `voices-*` CSS

   They also list unused `ui-labels.json` entries and each image's file size against its rendered size.

## 3. Phase 1: foundation (Opus)
- **Next docs first.** Read `node_modules/next/dist/docs` on fonts and images (Next 16 has breaking changes).

**Fonts** (`src/app/layout.tsx`)
- Add Cormorant Garamond through `next/font/google`: weights 300 and 400; latin, latin-ext and cyrillic; variable `--font-lux`.
- Poppins drops weight 700.
- Calisto (`--font-display`) is used only through the `.num` role class.

**CSS restructure.** `src/app/globals.css` becomes an import index for `src/app/styles/`:

| File | Holds |
|---|---|
| `tokens.css` | `:root` plus `@theme inline` |
| `base.css` | Element defaults; the only `@layer base` |
| `system.css` | Buttons, cards, heads, marquee, forms, DetailCard |
| `motion.css` | Reveal, word mask, curtain, the one reduced-motion block |
| `chrome.css` | Header, menu, footer, float |
| `home.css`, `pages.css` | Section and inner-page rules |

- Delete the vault block (globals.css ~758-905).
- `home-calm.css` and `detail.css` are folded in, then deleted.
- Migration goes section by section. Each section's old rules are removed in the same commit, with a grep showing no stray rules are left.

**Design audit.** New `scripts/audit-design.mjs`, wired into `npm run build`, fails the build on:
- any colour `gradient(` (masks are allowed)
- `!important` outside the reduced-motion block and the editor file
- more than 3 font families
- hex colours that are not tokens

**Editor overrides.** His zoom edits target positional selectors and break as soon as the DOM changes. They are retired by baking each intent into the system:

| His edit | Becomes |
|---|---|
| Eyebrow zoom | 15px desktop label |
| Edge labels | A side-word size token |
| 0.8 container zooms | Compact max-widths |
| Header 1.1 | Larger logo and nav |
| Hero 0.9 / 0.8 | Two-tier h1 |
| Phone hero text white | Ink panel |

- Then `home-edits.json` gets empty rules, and the CSS is regenerated with `editor/server.mjs` `regenerate()`.
- Every `data-e-section` and `data-e-block` hook stays, so his editor still works.
- v3 keeps his original edits untouched.

**Labels.** Replace `UI.labels[52..58]` index reads in `Sections.tsx` with named constants before pruning anything. `ui-labels.json` becomes append-only.

**Primitives**
- New: `ui/Ico.tsx` (lucide at 1.25), `ui/Pic.tsx` (`<picture>` from an image manifest), `ui/Rule.tsx`.
- Retuned: `Head`, `Words`, `RevealObserver`, `CountUp`, `InViewVideo`, `Marquee`, `MediaShimmer`, `SnapRow`, `More`, `DetailCard`, `Viewer`.
- Deleted: `Parallax.tsx` and the JS `Drift`.

## 4. Phase 2: home, his order kept (Opus; phone first in every section)
| Section | Redesign |
|---|---|
| Curtain `.oc` | Keep. 1.2s, ivory, logo and red rule draw, clip-path lift. The hero image is preloaded under it |
| Header | Ink top bar 36px. Main bar shrinks from 88 to 68px on scroll: ivory at 92% with blur, a hairline appears on scroll. Nav underline draws in. Phone bar 60px, hides on scroll down and returns on scroll up (transform only) |
| Phone menu | Full-screen ivory sheet with a 700ms circle clip-path reveal. Numbered Cormorant links 01 to 07 with hairlines, a destinations row, WhatsApp, call and email at the foot. A plain fade under reduced motion |
| Hero | Desktop: ink panel left 44%, photo right 56%, max 820px tall. Phone: photo 56svh on top, ink panel below, stacked 52px buttons. Foot row: the approved line "Accredited by the Urgent Care Association" (already in approved-edits.json), the UCA mark, and the slide counter with caption. 6.5s slides, slide-over kept, no zoom |
| HotelBand | Three open columns of Calisto numerals with a red "+" and hairline dividers. One logo row at 28px |
| Facilities | Film capped at 1040px. UCA as a hairline plate. Standards as one hairline row (2 x 2 on phone). Flat ivory ground |
| Services | Photo cards with a numeral on the corner, title, one line and an Open mark. **Phone keeps the 2 x 3 grid** (his correction). 07 is a solid ink panel. DetailCard behaviour unchanged |
| Intro (On-site) | Pulso layout: label column, two overlapping offset photos with a clip reveal, three numbered hairline rows |
| HowItWorks | Four steps on one hairline with Calisto numerals; the rail draws on view. Phone: a vertical line, text opens in place |
| Insurance | His rewritten words untouched. Hairline step rows, the red rule on the cashless line, one logo row |
| Stories + **GuestWords** (new) | The films carousel stays first. New `home/GuestWords.tsx`, details below |
| Finder | Destination names become the navigation above the map. The list as hairline rows. Map radius 16, Leaflet lazy |
| FAQ | His cream room photo kept. Flat ivory panel, hairline accordion with a rotating plus, 400ms open |
| Footer | The help band becomes the closing line from `final-cta` in Cormorant on ivory. Then a solid ink footer: newsletter as one hairline input row, four labelled columns, UCA and group lines |
| WhatsAppFloat | Same white and green look. Prompts cycle slower. Collapses to the icon on scroll down; hidden while the menu or a modal is open |

**GuestWords.** Uses the 9 real quotes in `reviews.json`.
- One quote at a time in Cormorant 300, kept in its own language with a `lang` attribute.
- Flag, name and country, a counter and hairline arrows.
- 7s crossfade; pauses on hover, focus and off screen; swipe on phone.
- No stars, ratings or counts: none exist in the data.

**Trusted by Patients and side words.** Trusted by Patients stays one slim row. Side words stay desktop only.

## 5. Phase 3: inner pages (Opus builds the system on Services, Sonnet applies it page by page)
**Shared components (Opus)**

| Component | Redesign |
|---|---|
| `PageHero` (`components/page/Page.tsx`) | The home split hero at 540px. Ink panel with crumbs, eyebrow, Cormorant h1, one line and buttons. Phone: photo 40svh on top. A `quiet` variant without a photo for faqs, contact and blog. No veil, no orb |
| `Band` | Desktop label column (sticky eyebrow and h2 in 4 of 12 columns). `tint` is a flat ink 4%; `dark` is solid ink |
| `Tiles` | Hairline rows with 1.25-stroke icons and `More`; a numbered variant. No boxes |
| `Checks`, `Split`, `CtaPanel` | Hairline list, offset photos, solid ink panel with the red rule |
| `DetailCard` | Ivory panel, 400ms scale-in. The phone sheet gets swipe-down to close |
| `ClinicCards` (`Common.tsx`) | Hairline rows, hotel name in Cormorant 24px |

**Templates**
- Destination: hero, clinics with map, services, one guest quote, insurance line, FAQ, other destinations.
- Hotel: a type-led hero on the destination photo (never a generated image of a named hotel). A sticky desktop contact rail (WhatsApp This Clinic, call, Directions); the same actions inline on phone.

**Page pass order (Sonnet, one brief per page, after Services is approved as the pattern)**
1. for-hotels (bands 5 → 4, the 12-item lists merged)
2. insurance
3. insurance-assistance-partners
4. international-accreditation
5. about-us
6. beauty-wellness
7. our-clinics
8. destination template
9. hotel template
10. contact-us and EnquiryForm (16px inputs)
11. faqs
12. blog
13. not-found

## 6. Phase 4: images and media (agy + Sonnet)
**Generate** with agy and `imagine`. Rules: no protected emblems, no AI people presented as staff, the real logo composited.
- Upgrade the three 1376px hero stills to 2400px, with 1080x1350 phone crops.
- Six destination atmosphere stills (sea, architecture, light, empty `alt`), so the six destination pages stop sharing three photos.
- Then grade all of them with `scripts/grade-photos.mjs`. Originals are kept in `docs/247clinic-design/`.

**Convert**
- `trusted-2.png` and `trusted-3.png` (3.2 to 3.4MB) and the trusted JPEGs go to WebP at 1200px. They stay real photos, never regenerated.
- Delete the unused hero JPEGs.

**Responsive images.** New `scripts/images.mjs` (sharp) writes AVIF and WebP at 640, 1080, 1600 and 2400px, plus `src/data/images.json` for `Pic.tsx`.

**Video**
- Full films load only on tap (`preload="none"`).
- Previews are re-encoded with `scripts/media.mjs` to 720p, silent, under 1.2MB each.
- Posters are the shimmer block, never a frame from a video.

## 7. Phase 5: verification (gates before "done")
1. `node scripts/preview-slot.mjs v6`. This runs the build, `check-brief` (every string sourced) and `audit-design`.
2. New `scripts/qa.mjs` (playwright-core, local Chrome) runs all ~49 routes at 360, 390 and 1440. It checks:
   - no sideways scroll
   - no console or request errors
   - every image decodes
   - tap targets of at least 44px
   - inputs of at least 16px
   - menu, DetailCard, FAQ and quote carousel all work
   - a reduced-motion run
3. Lighthouse mobile on home, services and one hotel page. Budgets: LCP under 2.5s, CLS under 0.05, TBT under 200ms, first load under 1.6MB, accessibility 95 or more.
4. The world-class-aura section 7 aura test on screenshots, done by Opus. Then one agy read-only review against his rejection list. Screenshots hide `<video>`.
5. Merge to main and push. Check https://hcig-passport.vercel.app/247clinic/v6 beside /v3 in a real browser.
6. Hand him one message: both URLs, what was cut, and every new or changed string.
7. Update the record: the `clinic247-website.md` task memory, the spec and the HCIG Work registry. Commit only task files, staging and committing in one command.

## 8. Work split and checkpoints
| Work | Who |
|---|---|
| Phase 0 and 1; hero, header, menu, GuestWords; PageHero, Band, DetailCard; every review, gate and commit | Opus, inline |
| Inventories; `images.mjs`, conversions and re-encodes; inner page passes (brief: page file, allowed system classes, "no new strings, colours or `!important`", 360 and 1440 screenshots back); QA runs that report failures only | Sonnet subagents |
| Image generation (prompt sheet with the grade and bans); bulk read-only review | agy |

**Checkpoints, each with a green build and a commit**
- A: foundation, hero and header
- B: home at three widths
- C: the inner system on Services
- D: all pages
- E: gates and the live URL

## 9. Risks
- **check-brief failures.** Reuse existing strings and build after each section. New interface words go into `ui-labels.json` and rewrites are logged in `approved-edits.json`, all listed for him.
- **Editor edits lost.** They are retired on purpose, each intent baked in and tabled in the spec. The editor hooks are kept, and v3 is untouched.
- **His past rejections.** No scroll library, cursor, grain, sound, giant wordmark or hero zoom. The hero composition, pills, WhatsApp style and all section content stay. Spacing stays moderate.
- **Cormorant thin on phones.** Use weight 400 under 40px and never go below 26px.
- **Next 16 API changes.** Read the bundled docs first. No new dependencies.
- **Heavy media.** Budgets are enforced, films load on tap, and the LCP image is preloaded with `fetchPriority`.
- **Generated images.** Atmosphere only, never named staff, patients or a specific hotel.

## Amendment 1 (his question 2026-11-16, my decisions)
He asked whether crowded sections can go and whether a CEO quote with a round portrait is good; he left the decision to me.

**Home order, 9 sections (was 10 visible):** Hero, Proof (numbers + hotels), Accreditation, Services, On-site care, CEO quote, Insurance, Guests, Destinations, FAQ + closing line.
- **How it works is merged, not lost.** Its 4 steps become one slim numbered hairline row at the foot of On-site care: titles only, text opens in place. Reason: the Insurance section already has 3 steps right after, and two step sections read as a manual.
- **Finder map leaves the home.** It becomes Destinations: 6 photo tiles from the new graded destination photos (`public/img/dest-<slug>-1200.webp`), the destination name and its clinic count from clinics.ts, each linking to its destination page, plus one link to /our-clinics where the full map stays. Lighter page (no Leaflet on home), calmer, and more luxurious (Bvlgari pattern).
- **Guests = films + GuestWords + the slim Trusted row**, in one section. Desktop: films rail left, one quote right.
- **Every block shows one line.** Longer text opens on demand (More, DetailCard). Trims are logged in approved-edits.json.

**CEO quote (new section "ceo"):**
- Words, exact, approved for the group sites 2026-10-18 (hcig memory org.md): "Success isn't measured only by the number of visitors a destination attracts. It's measured by how well those visitors are cared for when they need help the most." Dr. Amr Abbass, CEO, Healthcare International Group. Log the quote, name and title in content/247clinic/approved-edits.json so check-brief passes.
- Portrait: his real black and white studio portrait, `public/img/ceo-amr.webp` (from hcig-v6 lead-amr.webp). Never generated.
- Design: an ivory band, centered. A round portrait (112px phone, 144px desktop) inside a 1px red ring that draws as a circle on view (SVG stroke-dashoffset, 1400ms in-out). Below it, the quote in Cormorant 300 at clamp(26px, 3.2vw, 44px), max 24ch per line, rising word by word through the clip mask. Then a 40px red rule draws, then name in Poppins 600 and title in label type. No quote-mark clip art; one large hairline quotation mark in Cormorant at 10% ink behind the first line. Reduced motion: everything static and visible.
