# HCIG Group Motion: brief, ideas, polish, prompts (2026-10-19)

His ask (2026-10-19): "make hcig logo make motion graphics and be animated to show: hcig logo motioned and keyframed
into its group logos like tmasi and medone and medpark and 247 clinic, the idea is to show that we have integrated
healthcare group all over the world, international + group ... transparent background so it doesnt intercept on
background and feels part of the background". Then: "give me each on canvas first, and please make it with full and
best, with everything" (all three concepts), placement "Both" (short version in the hero, full version in its own group
section), brands "All eight". Process he set: "first have ideas and then polish idea and optimize, then make perfect
prompt, then begin".

## 1. The message, in one line

One mark becomes a whole group: HCIG is the centre that the eight brands grow out of, connect back to, and that reaches
across countries.

## 2. Truth we may show (nothing else)

- The eight group brands, by their own logos (live healthcareig.com, "Our Premises and Facilities"): 24/7 Clinic,
  MedOne Group, MedPark Health Group, TMASI GLOBAL, One Medical Center (Florida - USA), One Medical Spa (Florida - USA),
  UCA MENA, Shakankiry Clinics Medical Group (SCMG).
- Places, as the brands' own sites state them: HCIG and its Egyptian brands in Egypt (Hurghada); One Medical Center and
  One Medical Spa in Florida, USA (Clearwater); TMASI offices in the USA (Florida), Spain (Barcelona), Germany (Munich),
  Egypt (Hurghada) and the UAE (Dubai); UCA MENA covers Egypt and MENA.
- No numbers, no claims, no words beyond the logos themselves. The animation speaks with marks, light and movement.

## 3. Logo files (real, never redrawn, never stretched or recoloured)

| Brand | Best source | Size |
|---|---|---|
| HCIG mark + lockup | hcig-v3/material/canvas-assets/img/mark-*.png, logo-h-*.png (cut from the guideline) | 319 / 703 px |
| 24/7 Clinic | docs/247clinic-design/2026-10-12-luxury-home/logos/247-logo.svg | vector |
| TMASI | tmasi-next/public/img/logo.PNG | 1185 px |
| MedOne Group | hcig-v3/material/live-site/assets/img/mo.jpeg | 1600 px |
| MedPark Health Group | medpark-dashboard/assets/medpark-logo.png | 560 px |
| One Medical Center | live-site/assets/img/one.png | 1080 px |
| One Medical Spa | live-site/assets/img/onespa.png | 1080 px |
| UCA MENA | live-site/assets/img/uca.jpg | 391 px (ask for a sharper file) |
| SCMG | live-site/assets/img/scmg.png | check (ask for a sharper file) |

Each brand logo sits on a white plate (rounded, hairline border, soft shadow), the same language as the DMWV and GHA
seal plates. Plates keep every logo legible on night and day, and hide the white backgrounds of the JPG logos.

## 4. Ideas round (raw, before choosing)

1. Constellation: the HC mark bursts into points that fly out and open into the brands on an orbit.
2. Unfold ribbon: the HC swoosh unfurls into one line that travels, unveiling each brand, and returns home.
3. Globe of the group: the mark becomes a dotted globe; brands light up where they really are.
4. Petals: brands open around the mark like petals of a flower, then close. (Too soft for B2B.)
5. Cards deck: the mark deals the brands like cards. (Feels like a template.)
6. Building blocks: brands stack into the HC letters. (Distorts the mark: not allowed.)
7. Light threads: threads from each brand weave into the HC mark. (Close to 1; kept as an inner detail of 1.)
8. Map lines: a flat map with lines. (We already have flows in hero B; repeats it.)

He chose 1, 2 and 3. Ideas 7 (threads that pulse inward) and the loop logic of 2 are folded into the final three.

## 5. Polish and optimise (what makes them world class)

Shared language for all three:
- Palette: black, white, turquoise #12C0C6 (night); deep turquoise #0A7F84 lines on day; the plates are white in both.
- Motion: entries ease-out-expo, plates land with a soft spring (no bounce), the loop is slow and linear, nothing faster
  than it needs to be. Light travels inward to HC (integration), never outward only.
- Depth: real perspective (3D orbit, 3D globe), a faint depth haze on far objects, sharp near ones.
- Transparency: no background at all; only the mark, plates, lines and light. Glows are additive, so they sit on any
  photo. Night and day colours switch with the hero's sun and moon.
- Rhythm: an intro (about 6 s) that plays once, then a calm loop that never draws attention away from the words.
- Sizes: the hero version is smaller and sits in the calm side of each hero; the section version is large and centred;
  the phone version is arranged vertically (orbit becomes a tall ellipse, ribbon a vertical S, globe stays round).
- Performance: CSS transforms and opacity only on the page, about 1 MB of logos at most, nothing on the main thread
  per frame; reduced motion shows the finished frame.
- Order of brands (a patient's path, left to right or around the clock): 24/7 Clinic (first response in hotels),
  MedPark (hospital), MedOne (coordination), TMASI (international assistance), One Medical Center and One Medical Spa
  (USA), SCMG, UCA MENA (the association). Taken from each brand's own line on the live site.

### Concept 1 · Constellation (beat sheet, 12 s cycle, intro then loop)
- 0.0 to 1.0 s: the HC mark draws in at the centre (mask sweep along its swoosh), a turquoise halo breathes once.
- 1.0 to 1.6 s: eight points of light leave the mark on curved paths, each leaving a hairline trail.
- 1.6 to 3.2 s: each point lands on a tilted 3D orbit ring and opens into its brand plate (stagger 120 ms); a spoke
  draws from the plate back to the mark.
- 3.2 s on: the ring turns slowly (60 s per turn), plates always face the viewer; near plates sharp, far plates dimmer;
  a pulse of light runs along each spoke into HC in turn (one every 0.8 s), the mark answers with a soft glow.

### Concept 2 · Unfold ribbon (beat sheet, 12 s)
- 0.0 to 1.0 s: the HC mark appears; its swoosh lights up turquoise.
- 1.0 to 7.0 s: from the swoosh, one continuous line unfurls across the frame in a calm S path; a bright head leads it;
  as the head passes each of eight waypoints, that brand plate rises from the line (spring, 0.5 s).
- 7.0 to 8.5 s: the line curves back and closes into the HC mark: one unbroken loop.
- 8.5 s on: light pulses travel along the whole loop, through every brand, back into HC; plates float a few pixels.

### Concept 3 · Globe of the group (beat sheet, 12 s)
- 0.0 to 1.2 s: the HC mark at centre, then it dissolves into dots that become a 3D dotted globe (land dots only).
- 1.2 to 3.6 s: the globe turns from the Pacific to its resting view (the Atlantic between Florida and Egypt).
- 3.6 to 5.5 s: pins light up at the true places (Hurghada, Clearwater, Barcelona, Munich, Dubai); arcs draw from
  Hurghada to each; the HC mark settles on Hurghada.
- 5.5 to 7.5 s: brand plates fly out to two clusters with leader lines to their pins: Egypt (24/7 Clinic, MedPark,
  MedOne, SCMG, UCA MENA, TMASI) and Florida (One Medical Center, One Medical Spa); TMASI also links to its offices.
- 7.5 s on: the globe sways a few degrees, arcs pulse from Florida and Europe into Hurghada.

## 6. The prompts (the perfect prompts, Prompt Motion structure, written for Opus 5.5 at max effort)

### Shared preamble (goes on top of each)
<identity>You are a world-class motion designer building a brand motion for Healthcare International Group (HCIG), a
healthcare group of eight brands. Real logo files only: never redraw, distort, recolour or stretch a logo. No words
other than those inside the logos. Palette: black, white, turquoise #12C0C6; on light backgrounds lines use #0A7F84.
Logos sit on white plates (radius 14 px, 1 px hairline rgba(0,0,0,.06), soft shadow). Transparent background.</identity>
<quality>Entries ease-out-expo; landings a soft critically damped spring, no bounce; loops linear and slow. Light moves
inward to HC. Real perspective where depth is used. Banned: particle bursts, lens flares, camera shake, RGB split,
crossfades as transitions, generic gradients, bouncy easing, emoji, any text not in a logo.</quality>
<build>One HTML file, 1920 x 1080 (and a 1080 x 1920 phone cut). Every property is a pure function of time inside
window.seek(t) for the video render; the same scene also runs on the page with CSS keyframes (transform and opacity
only). Theme variable switches night and day colours. Render with Playwright at 60 fps, 3 subframes per frame blended
(motion blur), transparent PNG frames, then ffmpeg: WebM VP9 with alpha (web), ProRes 4444 (editors), MP4 on black and
on white (social). Before the full render, render one frame per second and check: logos sharp, nothing overlaps,
nothing clipped, legible at 390 px wide.</build>

### Concept prompts
- Constellation: "<direction>One mark becomes a group. The HC mark draws itself at the centre, eight points of light
  leave it on curved paths and land on a tilted 3D orbit, each opening into a brand plate in this order: 24/7 Clinic,
  MedPark, MedOne, TMASI, One Medical Center, One Medical Spa, SCMG, UCA MENA. Spokes draw back to HC. Then the ring
  turns slowly, plates face the viewer, and pulses of light run along the spokes into HC one by one.</direction>
  <structure>12 s: 0 to 1 s mark, 1 to 1.6 s points fly, 1.6 to 3.2 s plates open (120 ms stagger), then the loop;
  the last frame of the cycle matches the first loop frame.</structure>"
- Unfold ribbon: "<direction>One integrated journey. From the swoosh of the HC mark one continuous turquoise line
  unfurls in a calm S across the frame, a bright head leading it; at eight waypoints the brand plates rise from the line
  in the same order; the line returns and closes into HC as one unbroken loop; then light pulses travel the loop through
  every brand back into HC.</direction><structure>12 s: 0 to 1 s mark, 1 to 7 s unfurl with plates, 7 to 8.5 s close,
  then the loop.</structure>"
- Globe of the group: "<direction>One group, across countries. The HC mark dissolves into the land dots of a 3D globe,
  which turns to rest on the Atlantic between Florida and Egypt. Pins light at Hurghada, Clearwater, Barcelona, Munich
  and Dubai only; arcs draw from Hurghada to each. Brand plates fly to two clusters with leader lines: Egypt (24/7
  Clinic, MedPark, MedOne, SCMG, UCA MENA, TMASI) and Florida (One Medical Center, One Medical Spa); TMASI also links to
  its offices. Then the globe sways gently and arcs pulse into Hurghada.</direction><structure>12 s: 0 to 1.2 s mark to
  globe, 1.2 to 3.6 s turn, 3.6 to 5.5 s pins and arcs, 5.5 to 7.5 s plates, then the loop.</structure>"

## 7. What gets built, in order

1. Canvas "HCIG Group Motion": for each concept, the section version on night and on day, the phone version, and the
   hero version over hero B (to show it sits in the background). Live, looping, transparent.
2. After his pick: the video renders (WebM with alpha, ProRes 4444, MP4) from the same scene via window.seek(t).
3. Then the hero watermark on B is removed (his idea, agreed), and the animation takes its place.
