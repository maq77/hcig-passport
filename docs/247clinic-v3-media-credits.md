# 24/7 Clinic v3. Where every file came from

## Films (their own, `247 material/`)

Encoded by `247clinic-v3/scripts/media.mjs`. Used as films only; no still or
poster is ever taken from a frame.

| Use | Source file | Web files |
|---|---|---|
| Hero loop (first 14 s, silent) | Le reve 247 full commercial.mp4 | hero.mp4 2.3 MB, hero.webm 1.8 MB, hero-m.mp4 1.2 MB, hero-m.webm 1.1 MB |
| Intro film | 247 clinic video intro - where you are in your hotel.mp4 | intro-prev.mp4 (10 s loop), intro.mp4 (full, sound) |
| Story, Scotland | patinet 5 - Our patient, Debbie from Scotland ... .mp4 | story-scotland-prev / story-scotland |
| Story, Poland | patient 2 -Smiles know no borders! ... Poland .mp4 | story-poland-prev / story-poland |
| Story, Italy | patinet 4 - Our patient from Italy ... .mp4 | story-italy-prev / story-italy |
| Story, Romania | patinet 2 - but diff montage ... Romania ... .mp4 | story-romania-prev / story-romania |
| Story | patient 1 - ... riding a scooter ... .mp4 | story-scooter-prev / story-scooter |
| Story | patient 3.mp4 | story-3-prev / story-3 |

## Logos

| File | Source |
|---|---|
| marks/247-logo.svg | Their logo, `src/assets/c7-logo.svg` |
| marks/uca.png | Urgent Care Association Egypt & MENA mark, `src/assets/c7acc-uca.png` |
| marks/hcig.png | HCIG group mark, `medcierge-next/public/logos/group-hcig.png` |
| marks/flag-*.svg | `src/assets/c7flag-*.svg` |
| insurers/adac, connecx, international-sos, mondial | From their current site, `src/assets/c7ins-*.webp` |
| insurers/allianz, axa, bupa, cigna, generali, metlife, intl | Medcierge set, `medcierge-next/public/logos/` (small icons; official wordmarks being sourced by Hive ticket T-041) |
| hotels/hilton, jaz, longbeach, steigenberger | Medcierge set, `medcierge-next/public/logos/` |
| extra/* | Hive ticket T-041 (24/7 v3: source insurer, assistance and hotel brand logos), official sources listed in `extra/SOURCES.md`, reviewed before use |

## Fonts

| Font | Source |
|---|---|
| Calisto MT Regular and Bold | Licensed files supplied by the user 2026-09-23 (`247 material/*.ttf`, kept out of git). Latin subsets built by `scripts/fonts.mjs`. |
| Poppins | Google Fonts, self-hosted by the build. |

## Map

OpenStreetMap tiles (German style, Latin labels), © OpenStreetMap contributors.
