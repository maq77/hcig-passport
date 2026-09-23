# 24/7 Clinic v3. Full plan (from scratch, premium)

Written 2026-09-23 to start a dedicated new session for the v3 build. Modelled
on the Medcierge plan (`~/.claude/plans/tingly-wobbling-metcalfe.md`), same
objectives and phases, adapted to 24/7 Clinic. **The new session should read
this first, enter plan mode, ask the open questions below, then build.**

## Context

247clinic.net runs a network of **on-site urgent care clinics inside hotels and
resorts** across Egypt's tourist destinations, for international travellers.
Unlike Medcierge (doctors visit the guest's room), 24/7 Clinic is a network of
**physical clinics** guests walk into, plus hotel room visits where needed.

The current site was rebuilt on the operator's own layout (their blocks, our
content). It is fixed and now works (v2, at `/247clinic/website-preview`, the
layout regressions were repaired 2026-09-23). **v3 is a separate, from-scratch,
fully bespoke premium design**, built at `/247clinic/v3`, so the working v2
stays untouched for comparison until v3 is approved.

Goals, same as Medcierge:
- New structure, layout, motion and visuals. Short and visual, not text-heavy.
- Ranks for service, destination and hotel-clinic keywords in EN, DE, PL, CS.
- Gets cited by ChatGPT, Gemini, Perplexity and Google AI Overviews.
- Turns visitors into calls, WhatsApp messages and clinic visits.
- First stop is a preview on the user's Vercel (HCIG Work). Going live on
  247clinic.net (we have full access: SolidCP, FTP, decompiled source, DB) is
  decided after approval.

**The one hard rule that differs from Medcierge:** the content is **strict**.
`WEBSITE.docx` (in the repo as `docs/247clinic-website-brief.md`, extracted to
`content/247clinic/en/*.json`) is the copy, word for word. v3 changes the
design, layout, motion and imagery only. No sentence is added, cut or reworded
until the user says so. Structure is ours, the words are his.

## What the business is (confirmed)

- **On-site urgent care clinics inside hotels and resorts.** Three live hotel
  clinics: Premier Le Rêve (Sahl Hasheesh), Steigenberger Ras Soma (Soma Bay),
  Amwaj Beach Club (Abu Soma). Destinations: Hurghada, Sahl Hasheesh, Soma Bay,
  Marsa Alam, El Quseir, North Coast and more.
- **Services:** urgent care, minor injuries and procedures, diagnostics and lab,
  IV therapy and medication, specialist consultation, hotel room doctor visit,
  dental, beauty and wellness. All from the brief, word for word.
- **Money:** cashless coordination with international travel insurers where the
  policy allows. Never promised flat: "where insurance approval and policy
  conditions allow". Compliance rule below.
- **Audience:** ill or injured tourists (German, Polish, Czech, English), often
  at night on a phone; worried companions; and B2B referrers (hotel reception,
  tour operators, insurers).
- **Trust, exact wording:** confirm against `docs/247clinic-website-brief.md`
  and the material logos. Accreditation marks in `material/`: UCA, GHA, GMWA.
  Use the brief's exact wording (Official Partner of / Member of). Never
  "accredited by" unless the brief says so.
- **Brand:** `brand guideline/247 Brand Guideline.pdf`. Red `#C00000`, Poppins +
  Calisto MT. Logo is the 24/7 Clinic mark.

## The three HCIG sites must not compete

24/7 Clinic owns clinic and hotel-doctor terms. MedPark owns hospital terms.
Medcierge owns concierge / room-visit terms. Keep the keyword split (it is in
`docs/247clinic-keywords.md`, the MedPark cannibalisation section).

## Decisions taken (carry into the new session)

| Topic | Decision |
|---|---|
| Where | `/247clinic/v3` in this repo (HCIG Work), deployed to Vercel, noindex. Separate from the working v2. |
| Direction | Fully bespoke, premium. Not the operator's layout. Big cinematic video hero, scroll motion, bespoke cards and hover, real imagery. |
| Content | **Strict.** WEBSITE.docx / content JSON, word for word. Design only. |
| Languages | EN first. DE, PL, CS structure ready (translations are a separate held ticket). |
| Stack | Static build in this repo's pipeline (like v2 / the landing pages), unless the new session proposes Next.js. Keep it buildable by `node build.js`. |
| Design tools | ui-ux-pro-max + 21st.dev MCP. Learn from the Medcierge home for the quality bar. |
| Colour mode | Light. No dark backgrounds (brand rule). Red is the accent, used with restraint. |
| Motion | Real animations: video hero, scroll reveals, counters, hover, auto-scrolling partner/insurer marquee (like Medcierge and the operator's original). |
| Images | Local first: `247 material/` (videos), `material/` (logos). Partner/insurer/hotel logos: reuse the Medcierge material set (same partners) from `material/` and the Medcierge folders, or scrape official logos. Pexels + Gemini (`/imagine` via agy) for supporting photos. **Placeholders where a dedicated design image is needed (e.g. service card art) — flag each to the user, he makes the final design image.** |
| Compliance | No invented facts, prices, outcomes, accreditations. Cashless is always conditional. Named insurers only if the user confirms direct-billing agreements. |

## Phase 0. Setup

1. Create the v3 route and build wiring: `src/247-v3/` (or a generator
   `scripts/build-247-v3.*`), served at `/247clinic/v3`, noindex, registered in
   `content/registry.js` under the 24/7 project for CEO review.
2. Copy the local materials in: pick the best videos from `247 material/` and
   the logos from `material/` (+ Medcierge partner set). Compress video/images
   for web (the landing-page pipeline already has patterns).
3. Confirm the design tools are on: ui-ux-pro-max, 21st.dev MCP, imagine (agy).

## Phase 1. Analysis (reuse what exists, fill the gaps)

Most of this already exists for 24/7. The new session should read and extend,
not redo:
- **Business + audience:** from `docs/247clinic-website-brief.md` and the
  content JSON. Write `01-business.md` / `02-audience.md` only if a gap shows.
- **Keywords:** `docs/247clinic-keywords.md` (evidence-based, EN/DE/PL/CS,
  autocomplete-sourced, with the MedPark split). Extend with Keyword Planner
  volumes when an Ads account exists. Do not re-collect from zero.
- **Competitors + AI baseline:** run ~30 prompts across ChatGPT, Gemini,
  Perplexity in EN/DE/PL/CS ("doctor in Hurghada", "arzt hurghada", "clinic in
  my hotel Egypt"...) and record whether 24/7 is named. This feeds the answer
  blocks. (Spec 003 tooling already exists: `scripts/ai-visibility/`.)
- **Fact sheet:** one file of every hard fact (clinics, towns, hours, languages,
  accreditation wording, numbers) so nothing on the page is invented.
- **Sitemap + content plan:** the pages v3 needs — home, medical services,
  insurance & cashless, find a clinic, hotel clinic pages, destination SEO
  pages, for hotels, for insurers, about, contact, FAQ, beauty & wellness,
  blog. URLs match the operator's live ones where they already rank.

## Phase 2. Design system and canvas

1. **ui-ux-pro-max design system** for a premium medical-tourism site, persisted
   under `design-system/247clinic/`. Brand red `#C00000`, Poppins + Calisto MT.
   Reference the Medcierge home for the quality bar (navy/gold there; red/white
   here). No dark backgrounds.
2. **21st.dev** for the bespoke components: hero, service cards with hover,
   step timeline, stat counters, partner marquee, testimonial slider, FAQ,
   clinic finder, CTA.
3. **Motion language:** video hero with a light headline panel; scroll reveals;
   counters; an auto-scrolling partner/insurer logo marquee; card hover lifts;
   reduced-motion respected. Content must be visible without JS (the v2 bug was
   content hidden behind a missing animation library — never repeat that).
4. Optionally a design-canvas pass for the home before coding.

## Phase 3. Build (home first, then inner pages)

**Give the most effort to the home page.** Build it section by section, verify
each in a real browser (Playwright, desktop + phone + reduced-motion), then the
inner pages on the same system. Home sections, following the brief's story:
hero (video, headline panel, CTAs) → trust strip (accreditation) → what we
treat (service cards) → why a hotel clinic → cashless insurance → how it works
→ clinics / destinations → patient stories (the real films) → partners marquee
→ FAQ → final CTA. Every word from the brief.

## Phase 4. Images, video, motion

- Real patient films and clinic films from `247 material/` (they are the
  strongest asset). Poster images, compressed, lazy below the fold.
- Partner/insurer/hotel logos as a marquee.
- Pexels/Gemini for supporting photography that matches the palette. If a shot
  does not fit, leave it out. Where a dedicated design image is needed (service
  card art, section art), drop a labelled placeholder and list it for the user.

## Phase 5. SEO, AEO, performance

- Semantic markup, schema (MedicalClinic / MedicalWebPage, FAQPage matching the
  visible FAQ word for word), canonical, hreflang, sitemap, llms.txt.
- Answer-first blocks for AI citation (Spec 003 tooling).
- Fast: compressed video and images, lazy loading, critical CSS, ≥90 mobile.
- Internal links from the keyword map (Spec 004 tooling).

## Open questions for the user (ask at the start of the new session)

1. **Stack:** keep the static `node build.js` pipeline (fastest, matches the
   landing pages), or a Next.js app like Medcierge? (Recommend static for v3.)
2. **Hotel/partner logos:** confirm the same hotel partners as Medcierge apply
   to 24/7, and whether to scrape official logos or reuse the Medcierge set.
3. **Numbers to show** (clinics, patients, rating, satisfaction): which are
   confirmed true for 24/7, and shown quietly.
4. **Insurers:** may we name example insurers, and is cashless direct-billing
   confirmed, or kept fully conditional?
5. **GA4:** which property does 247clinic.net report into (still blank; blocks
   measurement).
6. **Video hero:** which film leads the home hero (Le Rêve commercial, clinic
   intro, or a montage)?

## Status of the current v2 (context for the new session)

- v2 (`/247clinic/website-preview`) is the operator's layout with the brief's
  content. The layout regressions (invisible content, broken buttons) were
  fixed and pushed 2026-09-23. It works and is the fallback.
- Inner pages, first-party tracking, breadcrumbs and related cards are built.
- 24/7 has **no GA4 property** yet. Measurement is blocked on that.
