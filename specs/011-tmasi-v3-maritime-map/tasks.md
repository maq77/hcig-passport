# Tasks: 011-tmasi-v3-maritime-map

All tasks @claude (one delicate component; no worker dispatch).

- [x] T001 Light pictures to `tmasi-next/public/img/hubs-world-light.webp` and `hubs-world-phone-light.webp`
- [x] T002 `.work/tmasi-assets/write_maritime_ts.py` -> `tmasi-next/src/lib/maritime-data.ts` (sea routes with ship counts, regional line, crosses, oceans, Johannesburg, per view)
- [x] T003 `tmasi-next/src/content/maritime.ts`: card, key, ocean and switch words (English, his image's words exactly)
- [x] T004 `HubsMap.tsx`: two new flights; theme state + switch + saved pick; light picture on demand
- [x] T005 `HubsMap.tsx`: sea routes (dots), ships (Web Animations), regional dashes, crosses, ocean names, gold pins
- [x] T006 `HubsMap.tsx`: cards + leaders + key + his two lines floating over the map edge at >=1280px
- [x] T007 `HubsMap.tsx`: below 1280px a swipe row of cards over the map's bottom edge, key grid under it
- [x] T008 Gates: build, sync, root `npm test`; Chrome 390/768/1280/1440 both themes; no sideways scroll; reduced motion; CDP at 4x CPU
- [x] T009 Show him; push on his yes; verify online; memory note

Done 2026-10-11: built 47023cf5, pushed on his yes, checked online (switch, 5 floating cards, ships live; dark first).
Open, not in this spec: DE/PL/ES words for the cards and key (English for now, his choice); route edits from the canvas Route maker when he sends points.
