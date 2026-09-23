# 24/7 Clinic v3. Where every file came from

## Films (their own, `247 material/`)

Encoded by `247clinic-v3/scripts/media.mjs`. Used as films only; no still or
poster is ever taken from a frame.

| Use | Source file | Web files |
|---|---|---|
| Facilities film loop (first 14 s, silent, stream copy) and the whole film with sound | Le reve 247 full commercial.mp4 | hero.mp4 2.5 MB, commercial.mp4 9.2 MB, both his exact quality |
| Intro film | 247 clinic video intro - where you are in your hotel.mp4 | intro-prev.mp4 (10 s loop), intro.mp4 (full, sound) |
| Story, Scotland | patinet 5 - Our patient, Debbie from Scotland ... .mp4 | story-scotland-prev / story-scotland |
| Story, Poland | patient 2 -Smiles know no borders! ... Poland .mp4 | story-poland-prev / story-poland |
| Story, Italy | patinet 4 - Our patient from Italy ... .mp4 | story-italy-prev / story-italy |
| Story, Romania | patinet 2 - but diff montage ... Romania ... .mp4 | story-romania-prev / story-romania |
| Story | patient 1 - ... riding a scooter ... .mp4 | story-scooter-prev / story-scooter |
| Story | patient 3.mp4 | story-3-prev / story-3 |

## Logos (official files, own colours, 2026-09-23)

| File | Source |
|---|---|
| marks/247-logo.svg | Their logo, `src/assets/c7-logo.svg` |
| marks/247-mark.svg | The same logo with only the 21 tagline letters removed, for sizes under 120px (brand guideline, Minimum Size) |
| marks/uca.png | Urgent Care Association Egypt & MENA mark, `src/assets/c7acc-uca.png` |
| marks/hcig.png | HCIG group mark, `medcierge-next/public/logos/group-hcig.png` |
| insurers/allianz, axa, adac, generali, hansemerkur, signal-iduna, metlife .svg; europ-assistance, international-sos .webp | Wikimedia Commons originals of the official marks (File:Allianz.svg, AXA Logo.svg, ADAC-Logo.svg, Generali wordmark logo.svg, HanseMerkur Logo 2018.svg, Signal Iduna logo.svg, MetLife logo.svg, Europ Assistance Logo .png, International SOS logo.png) |
| insurers/bupa, ergo, uniqa, pzu, warta .svg | The companies' own websites (header logo files), fetched 2026-09-23 |
| insurers/mondial, connecx .webp | Their own site (`src/assets/c7ins-*`) |
| hotels/hilton.svg | hilton.com logo file |
| hotels/radisson-blu.svg | Wikimedia Commons, File:Radisson Blu logo.svg |
| hotels/jaz.png, longbeach.png | Medcierge set, `medcierge-next/public/logos/` |
| Not used | Steigenberger (the official file is white, for dark headers), Allianz Partners (download blocked), Cigna |

## Photographs

| File | Source |
|---|---|
| img/why-roomvisit.webp | Pavel Danilyuk on Pexels, https://www.pexels.com/photo/people-looking-at-a-sick-woman-by-the-door-6753336/ |
| img/resort-aerial-*.webp | Mo Ismail on Pexels, https://www.pexels.com/photo/aerial-view-of-a-hotel-by-a-sea-22643802/ |
| img/post-*.webp | Their own blog images, www.247clinic.net/photos/news/ |
| slots/hero-desktop.webp | Generated with Gemini (Nano Banana) 2026-09-23, original kept locally in `generated/247-hero-v1.jpg` (jpg files are not committed). A mood image: no real staff, patient or clinic room is shown or implied. |

## Fonts

| Font | Source |
|---|---|
| Calisto MT Regular and Bold | Licensed files supplied by the user 2026-09-23 (`247 material/*.ttf`, kept out of git). Latin subsets built by `scripts/fonts.mjs`. |
| Poppins | Google Fonts, self-hosted by the build. |

## Map

OpenStreetMap tiles (German style, Latin labels), © OpenStreetMap contributors.
