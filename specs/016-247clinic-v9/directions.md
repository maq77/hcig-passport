# 24/7 Clinic v9: three directions (Fable plan, 2026-11-16)

Status: draft. Canvas boards first, his pick, then a spec. Built only after v3 and v6 edits ship (his order 2026-11-16).
His ask: "new design and system design for the website for v9 , new ui and new ux and etc".

Recommendation (Fable): Direction 1 Maison Rouge, with Direction 2's "Tell us" composer as its closing contact band.

## 1. Maison Rouge (the original house look, re-cut at couture level)
- UX: story-led stack of full-width bands (blush, cream, black), one idea per band, each with one "open" that reveals in place; centred resort header; menu = full black sheet; sticky phone bar Call + WhatsApp.
- Tokens: blush #F4E3DD, cream #FBF6F1, black #0D0A0A, red #C00000 (#E8121C on black); Playfair Display 400/400i + Jost 300/400/500; radius 0, square 52px buttons; red diagonal corner cuts; one contour-line SVG at 8%.
- Signature: cut hero, resort header, service ledger (7 numbered serif rows opening in place: needs his yes, replaces 2x3 grid), black accreditation band with film, guest book (one italic quote at a time + films), destination index (serif rows swap the photo), insurance band, black footer with contours.
- Motion: line rise 900ms/70ms, cut wipe 1100ms, contour draw 1600ms; signature "The Seam": black bands enter with a diagonal top edge that straightens via view() timeline.
- Why: the CEO said the original look carries the luxury. Risk: round-1 "B original" board was rejected; Calisto dropped from text (logo keeps it).

## 2. The Concierge (the site asks where you stay and what happened)
- UX: hero = WhatsApp composer (hotel type-ahead from clinics data, need chips from service titles, live message preview), three doors (Guests, Insurance, Hotels); composer condenses into a phone dock on scroll (FLIP 500ms).
- Tokens: paper #FFFDFA, sand #F1EADF, deep sea #0F2B33, sea glass #DCE8E6, red #C00000 for logo/call/active; Manrope 300 + EB Garamond italic accent + IBM Plex Mono details; radius 20/28, pills.
- Signature: composer hero, key-card services, UCA certificate plate, insurer check (tap logo to add to message, no coverage claim), guest notes, hotels by destination, dock.
- Risk: highest (new colour, sans-led against the CEO's serif signal, rounded cards like v4, new microcopy, needs "My hotel is not listed").

## 3. Red Sea Atlas (the coast is the menu)
- UX: dark cinematic, destination-led; hero = film + serif sentence + destination rows; choosing a place re-themes the page and carries into WhatsApp links; coastline rail as page progress.
- Tokens: night #120C0D, wine #3A0A10, sand #EADFD0, ivory #F7F2EC for insurance/FAQ, red #E8121C/#C00000; Noto Serif Display 300/300i + Golos Text; radius 2; Roman numerals in hairline squares; Pulso label column.
- Signature motion "Sailing the Coast": coastline path draws with scroll, each point lights and opens its photo.
- Risk: his "C resort cinema" board was rejected; dark-first in sunlight; live clock was in rejected Full v2; film LCP.

## Canvas boards (per direction)
Home Desktop 1440 (fluid, working: menu, service open, FAQ, review rotation, film lightbox, destination swap, real wa.me and tel links, signature motion + reduced motion), Home Phone 390x844, one System sheet (palette with contrast, type specimens incl. DE/PL/RU lines, grid, radius, buttons in all states incl. white-green WhatsApp, icons, photo treatment, motion table, logo rules, new words to confirm).
Facts to respect: reviews.json has 9 quotes (originals only, no stars); 6 destination photos (Makadi Bay none); numbers from facts.ts; only 4 hotel logos; CEO quote from v6 section; check font subsets (Poppins lacks Cyrillic).
Canvas traps: inline fill on logo SVGs; rAF + 20ms setTimeout fallback; view() behind @supports.
