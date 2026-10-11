# Implementation Plan: TMASI v3 hubs map, maritime layer and light theme

**Spec**: [spec.md](spec.md) (approved 2026-10-11) · **Canvas**: https://claude.ai/artifact/72VuGty9MBcoJXLxf6oiVP (round 2,
phone pick B) · **Build**: `tmasi-next/` (Next.js static export) -> `npm run sync` -> `src/tmasi-v3` -> preview /tmasi/v3

## Approach

One component grows: `tmasi-next/src/components/HubsMap.tsx`. The dark map stays as approved. Everything new is drawn
over the same two pictures with the same projection, so pins, routes and labels line up in both themes.

| Piece | How |
|---|---|
| Light map pictures | `.work/tmasi-assets/render_light.py` -> `public/img/hubs-world-light.webp`, `hubs-world-phone-light.webp`. Loaded only after a visitor picks Light. |
| Sea routes, crosses, oceans, regional line | `render_light.py` writes `maritime.json`; `write_maritime_ts.py` turns it into `src/lib/maritime-data.ts` (% of each picture). Waypoints are checked against the land mask. |
| Ships | Same method as the planes: keyframes worked out once (even steps along the route), Web Animations on transform and opacity only, paused off screen, still with reduced motion. Ships do not rotate. |
| Two new flights | UAE to Johannesburg (his ask), Florida to Barcelona (his image), desktop and phone. |
| Theme switch | `useState('dark')`, read and write `localStorage['tmasi-map-theme']` in try/catch after mount. The map sits far below the fold, so there is no visible flash. `aria-pressed` buttons. |
| Cards, key, his two lines | `src/content/maritime.ts` (English, `lang="en"` on every language). At >=1280px: on the map, floating over its edge, each card anchored by the edge its leader line meets. Below 1280px: a swipe row of cards that rides over the map's bottom edge, the key as a grid under it. |
| Pins | Gold office pins, still links to the office pages, still light up the office panel. Desktop shows no pin chips (the cards name the offices); phone keeps its chips. |

## Risks and answers (Gemini review 2026-10-11, checked by Claude)

- Hydration: theme only changes after mount; the server HTML is the dark map (approved look). Accepted.
- Phone CPU: 11 planes + 6 ships; transform/opacity only, no backdrop blur on phone cards. Measure with CDP at 4x.
- Overlap at 320-390px: cards are not on the phone map at all (swipe row under it).
- Spain and Germany pins are 22px apart on phone (as today); the card row gives every office a full-size target.
- "Major TMASI operational healthcare infrastructure": flagged by Gemini; Mohamed keeps his words (2026-10-11).

## Gates

`npm run build` (tmasi-next), `npm run sync`, root `npm test`; Chrome at 390, 768, 1280, 1440 in both themes; no
sideways scroll; CDP metrics at 4x CPU vs today; DE page renders; push only on his yes.
