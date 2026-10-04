# Research: TMASI v4 home

Every decision with the reason and the options weighed. Numbers marked [measured] were taken
on 2026-10-01 on this machine. Gemini (agy) did a first sweep; only what Claude checked is used,
and each Gemini-only item is marked [unverified].

## R1. 3D engine

**Decision**: three.js 0.186, scene written by hand, loaded with a dynamic import after first paint.

**Rationale**: it can draw all four looks he wants to compare (dotted network, realistic Earth,
glass, hologram) and the full story (arcs drawing out from Egypt, pulses, focus on an office), at a
fraction of the weight of the wrappers. The canvas prototypes use the same code, so what he picks
is what ships: cdnjs serves three.js 0.186.1, the same version as npm [verified 2026-10-01 via the
cdnjs API].

**Alternatives** (bundle sizes [measured], esbuild minified, gzip -9):

| Option | Gzip | Why not |
|---|---|---|
| cobe 2.0.1 (MIT, 2026-03) | 5 KB | dotted look only; arcs are static (no draw-in story); labels rely on CSS anchor positioning. Kept as the fallback if the dotted look wins and weight matters more than the story |
| three.js core, hand-built scene | 133 KB | **chosen** |
| three.js full namespace | 186 KB | tree-shaking keeps only what the scene imports |
| @react-three/fiber 9.8 + three (with React) | 311 KB | React is already on the page, but the wrapper adds weight and a second render loop to manage |
| three-globe 2.45 | 518 KB | heavy; brings d3 and data layers we do not need |
| globe.gl 2.46 / react-globe.gl 2.38 | 550 KB | heaviest; built for data exploration |
| Spline runtime | not measured | heavy runtime, no data control, licence of scenes to check |

## R2. Land drawing

**Decision**: land dots computed at build time (`scripts/build-land.mjs`) from Natural Earth
110m land (public domain, via the `world-atlas` package, ISC): points on a Fibonacci sphere kept only
where they fall on land, written as quantised binary (two 16-bit values per point). Desktop about
12,000 points, phone about 6,000. Target at or under 40 KB per file.

**Rationale**: no texture decode or point-in-polygon work in the browser; identical land on every
device; tiny.

**Alternatives**: a land mask texture sampled in the shader (fine, but a decode on the main thread
and a softer coastline); topojson parsed in the browser (heavier, slower start).

The realistic-Earth look on the canvas uses a NASA Blue Marble texture (public domain), at most
2048 x 1024 desktop and 1024 x 512 phone, only if he picks that look.

## R3. Arcs and the story

**Decision**: each arc is a curve lifted by distance; a shader progress value draws it in, and a
second value sends a light pulse along it. Story: Egypt lights, then arcs leave Egypt one by one,
then idle. The order is shown on the canvas: nearest to farthest (UAE about 2,160 km, Germany about
3,020 km, Spain about 3,280 km, USA about 10,860 km), so the camera's last move crosses the Atlantic.
[measured 2026-10-01: great-circle distances from the positions in data-model.md]

**Alternatives**: all arcs at once (loses the "network grows from home" meaning); a fixed order of
the site's office list (Egypt, Germany, UAE, Spain, USA; meaningful only to insiders).

## R4. Office labels

**Decision**: desktop labels are HTML elements moved each frame from the projected pin position
with `transform: translate3d()` only (no layout properties, `will-change: transform`), faded when
the pin turns away. Pins under the pointer glow and the canvas cursor turns to a pointer. The phone shows no floating labels: an office card row under the
globe changes with the tour.

**Rationale**: works in every browser (no dependency on CSS anchor positioning), selectable text,
crisp at any zoom, readable by screen readers through the separate office list.

## R5. Phone profile ("one idea, two designs")

**Decision**: the same scene with a phone profile: pixel ratio starts at the device's own up to 2
and the probe steps it down, about 6,000 dots, no post
effects, no drag. The guided tour turns to each office in story order; the card row below
(scroll-snap) follows it, and tapping a pin or swiping a card jumps there. Tap targets at least
44 x 44 px. `touch-action: pan-y` keeps the page scrolling.

## R6. Capability gate and fallbacks

**Decision**: before loading 3D, check: WebGL available, `prefers-reduced-motion`, Save-Data,
`deviceMemory` at or under 2. Any of these gives the designed still. Shaders are compiled with
`renderer.compile(scene, camera)` behind the still before the fade-in, so the first visible frame
does not stutter. The frame-time probe starts only after `arriving` ends, skips 20 warm-up frames,
then averages 60 frames: slower than 22 ms (under about 45 fps, the target) steps down one level
(pixel ratio 2 to 1.5 to 1.25, then desktop to phone profile, then the still). WebGL context loss
shows the still and never throws; `webglcontextrestored` rebuilds the scene (iOS drops contexts when
a tab goes to the background). Leaving the page or unmounting disposes geometries, materials,
textures and the renderer.

## R7. Sofia (Jotform agent)

**Finding**: v3 loads `https://cdn.jotfor.ms/agent/embedjs/0199f6528e8c7651bd7eaff1d0a4518f2b08/embed.js`
with `lazyOnload`; auto-open is a setting in TMASI's Jotform account.

**Decision**, tried in order at Stage E and verified on a phone width: (1) load the script only
after the first scroll or tap; (2) use any open-on-load switch the embed exposes [unverified, to check
in its script]; (3) ask Mohamed to switch auto-open off in the Jotform account (it is their account,
so we change nothing there ourselves).

## R8. Video

**Decision**: loops are H.264 MP4 (plus WebM VP9 where smaller), muted, `playsinline`, `preload="none"`,
started by an IntersectionObserver near the screen and paused off screen; every `play()` promise is
caught, and a refused play (iOS Low Power Mode) leaves the designed poster in place; phone gets a 720p cut,
desktop 1080p. The film opens in a full-screen viewer with sound, 1080p and 720p sources, loaded on
Watch only. Cutting and encoding with ffmpeg 8.1.1 [measured: installed]. Posters are designed
images, never a frame from the video.

**Veo source**: he makes the clips in his own Google account. Whether the Gemini app or Flow gives
him Veo, the clip length (Gemini says 8 s base) and whether outputs carry a visible watermark are
[unverified]; he confirms when making the first clip. A visible watermark is shown to him, never
cropped away silently.

## R9. Images

**Decision**: Claude drives his Gemini (Nano Banana Pro) in Chrome with one prompt per image; he
downloads (the 2026-09-30 workflow; the API route failed with 402 "prepayment credits are
depleted"). Free stock from Pexels (free for commercial use, no credit required) where a real scene
reads truer. Each image is judged at 100% for: natural light, real-world imperfection, no garbled
text, no invented logos, no faces presented as TMASI staff, brand colours present but not a colour
cast. Upload trick that worked in Gemini: open the "+" menu, then tag `input[accept="image/*"]` with
an aria-label so `file_upload` can find it.

## R10. 3D icons: a three-way shoot-out

**Decision**: on canvas board 2, the same three meanings (for example emergency medical assistance,
air and ground evacuation, hospital coordination) are shown from three sources side by side:
(a) generated in one locked style in his Gemini; (b) a free CC0 set (3dicons.co, CC0 per Gemini,
[unverified], licence checked before use) recoloured to TMASI teal; (c) built in our own three.js
scene and rendered to transparent images. He judges what feels most human-made, real-world and
meaningful to the business; the winner makes the full set so the page has one coherent look.

## R11. Partner logos

**Decision**: official files from each organisation's own website (SVG preferred), full colour,
each linked to the v3 news post that names it: Egypt Healthcare Authority (Africa Health ExCon 2025
agreement), Hansa Medica Group (Grand Egyptian Museum partnership), ITIC Global (the logo links to the 2026 sponsor post; Venice 2025 posts also name it), Uniglobal (post `uniglobal-global-insurance-conference-barcelona`) [names verified 2026-10-01
in v3 `en.json`, post paths verified in `src/tmasi-v3/blog/`]. Shown as organisations TMASI works with, as the posts state, never as
"accredited by".

## R12. Fonts

**Decision**: the v3 setup: Big Noodle Titling for headlines (web use permission stated by him),
Bebas Neue as the latin-ext fallback, Montserrat for text, all self-hosted via `next/font/local`
with `adjustFontFallback: false` (v3 trap). Board 1 shows one alternative headline face beside it,
because he allowed "any font that feels good".

## R13. Content source

**Decision**: `scripts/pull-content.mjs` writes `src/content/home.en.json` from
`tmasi-next/src/content/live/en.json` (home, shell, posts) and the English labels in
`tmasi-next/src/content/ui.ts`, plus one approved addition: usa@tmasi.net from the contact page
(his yes, 2026-10-01). Components read only that file. The word check reads the same file.

## R14. Links beyond the home

**Decision**: menu, footer, service, office and news links point to the matching v3 page under
`/tmasi/v3/`; the language switch opens `/tmasi/v3/de/`, `/tmasi/v3/pl/`, `/tmasi/v3/es/` (v3 home
paths [verified in `tmasi-next/src/components/Header.tsx` HOME_OF and `next.config.ts` basePath]).

## R15. Preview hosting

**Decision**: `tmasi-v4/` exports with basePath `/tmasi/v4`; `npm run sync` copies `out/` to
`src/tmasi-v4/`; `build.js` gains a copy step to `out/tmasi/v4` next to the v3 one
(`TMASI_V3_SRC` pattern); every page carries noindex; the registry gets the project. Pushed only on
his yes.

## R16. Testing tools

**Decision**: Playwright (MCP and scripted) with `page.route` serving `out/` (the local server dies
at the 10-minute background limit); reduced motion via `emulateMedia`; no-WebGL via a launch flag
(`--disable-webgl`); local Lighthouse CLI against the static export for LCP, CLS and weight;
Chrome performance trace at 4x CPU slowdown for frame times; the form posts to a local mock that
records the payload, never to TMASI's inbox.

## R17. DOM motion

**Decision**: framer-motion (already the v3 choice) for reveals and the film viewer; scene motion
lives in the three.js loop; native scroll with IntersectionObserver. No GSAP or Lenis (weight, and
he rejected scroll hijacking).

## R18. References for the canvas

**Decision**: candidates from the Gemini sweep, each opened and judged by eye before it reaches the
canvas (memory: Gemini invented design details on Dribbble before): GitHub home globe (and its
engineering write-up), Cloudflare network, Stripe, Vercel, Shopify, Linear; competitors International
SOS, Europ Assistance, AXA Partners, Healix, CEGA, Allianz Partners [all unverified until opened].
Gemini's note to confirm by eye: the assistance companies show their network as flat maps and
statistics, which would make a live globe a clear difference for TMASI.
