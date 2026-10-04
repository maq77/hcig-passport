# Globe contract: the hero's 3D Earth

## Inputs

| Input | From |
|---|---|
| offices | `src/content/offices.ts` (data-model Office) |
| arcs, story order, timings | the motion he picks on board 1 |
| look preset | the look he picks on board 1 (dotted, realistic, glass or hologram), as material and colour values |
| device profile | `desktop`, `phone` or `still`, from the capability gate (research R6) |

## Output events

- `focus(officeId)`: an office was chosen (hover or click on desktop, tap or card swipe on phone).
  The office card or label shows that office's words from `home.en.json`.
- `state(name)`: for tests and analytics later; no tracking on the preview.

## States

`still` (HTML, in the first paint) → `arriving` (3D fades in over the still, under 1.2 s) → `story`
→ `idle` ⇄ `focus` ; `paused` when off screen or hidden; `fallback` for no WebGL, reduced motion,
Save-Data, low memory, slow frames or context loss.

## Device profiles

| | Desktop | Phone |
|---|---|---|
| Composition | as picked (lead: words left, globe right) | globe on top, guided tour, office cards below |
| Dots | about 12,000 | about 6,000 |
| Pixel ratio | device ratio up to 2; the probe steps down to 1.5 then 1.25 | same rule |
| Interaction | hover labels and a pin glow, pointer cursor over pins, drag to turn (eased, limited tilt), click to focus | no drag; tap a pin (44 px targets) or swipe the cards |
| Labels | HTML, projected per frame, faded when behind the Earth | none on the globe; the card row |
| Effects | soft glow allowed if it stays in budget | none |

## Guards (every profile)

- 3D code is loaded only after first paint; the words and buttons never wait for it.
- Render loop stops when the hero is off screen and when the tab is hidden.
- Idle may render on demand (only while something moves).
- Shaders compile behind the still before the fade-in (`renderer.compile`).
- Frame-time probe: after `arriving`, skip 20 frames, average 60; slower than 22 ms steps down
  (pixel ratio, then profile, then the still).
- WebGL context loss: show the still, never throw; on `webglcontextrestored` rebuild and resume.
- On unmount: dispose geometries, materials, textures and the renderer.
- `touch-action: pan-y` on the canvas so a vertical swipe scrolls the page.

## Access

- The canvas is `aria-hidden`; the five offices are a real list (name, address, phone, email,
  links) reachable by keyboard, which also drives `focus` on desktop.
- Every motion has a reduced-motion state: the still shows the whole network at once.
- Any words on or over the globe meet WCAG AA contrast.
