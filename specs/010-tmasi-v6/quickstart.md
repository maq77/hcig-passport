# Quickstart: prove v6 works

## Run

```bash
cd tmasi-v6
npm install
npm run build && npm run check:words && npm run check:weight
npm run sync
cd .. && npm test
```

Expected: build passes; "0 foreign, 0 missing" in EN, DE, PL, ES; root test passes.

## Scenarios

| # | Scenario | How | Pass when |
|---|---|---|---|
| 1 | Words (SC-001) | `npm run check:words` | 0 foreign, 0 missing in every language |
| 2 | First sight (US1, SC-002) | Five-second look by him and two people new to TMASI | Each says: medical care, travel and a holiday together |
| 3 | Hero film (US1, FR-003, FR-004) | Load at 1440 and 390 px; then reduced motion; then a blocked video | Film plays muted with no black flash; poster shows in the other cases; no frame-taken image anywhere |
| 4 | Watch film (FR-003) | Press Watch film, then Esc | Kling commercial plays with sound; focus returns to the button |
| 5 | Services (US2, SC-003) | Compare against the live service words; press each View Details | Six groups, every item exact, Medical Tourism first, right pages open |
| 6 | Actions (US3, SC-004) | From every section, desktop and phone | Quote form or WhatsApp one tap away; form payload correct against a local mock |
| 7 | Journey (US4) | Read the section | Site words only, site order, unnumbered, one photo per part |
| 8 | Proof (US5) | Open News | Real event photos large; each logo opens its post |
| 9 | Hubs map (FR-009) | Scroll to the map, wait, scroll away and back | Planes fly once, then rest; never restart; reduced motion shows rest |
| 10 | Speed (SC-005) | Lighthouse mobile and desktop | Headline readable within 2.5 s mobile, 1 s desktop; film never the LCP blocker |
| 11 | Widths and contrast (SC-007) | Playwright at 360, 390, 768, 1024, 1440, 1920; axe | No sideways scroll; no AA failures |
| 12 | Preview (FR-015) | Read the rendered head; `git status tmasi-next src/tmasi-v3` | noindex, nofollow; v3 unchanged |
