# 24/7 Clinic: interactive story samples (2026-10-13)

Canvas (private): https://claude.ai/artifact/8w7XLUtc5kXUdnWpshTB9u
One story ("One Night on the Red Sea", 5 chapters: Arrival, The Stay, 2:14 am, The Hero of the Moment,
The Holiday Continues) built three ways so Mohamed can pick a realism route before any production spend:
A. Cinematic film: 12 photoreal frames (Nano Banana) steered by scroll or drag, film grain, letterbox.
B. Real photographs in 3D: the same frames given depth (Depth Anything V2 on the local RTX 3070) and a moving camera.
C. Live 3D world: a procedural three.js Red Sea resort, golden hour to night to dawn, the doctor as a light,
   the Invisible Service glass reveal, bloom. Reads as an architect's model; real assets would be needed for realism.
Plus the home invite band (desktop and phone) that links to the film sample.

Files: canvas/ (artboards), frames/ (webp + depth maps, 1.1 MB total), src/story.js (engine) and story.bundle.js
(three.js bundled, 159 KB gzip), tools/ (board builder, image prompts, depth script).
Rebuild: esbuild from tmasi-v4/node_modules; boards: `python build_boards.py canvas` with blobs.json.
Story words are new copy (need his yes). AI people are a story sample, never shown as real staff or patients.

## Update 2026-10-13: he chose route A, the film. Polished into the full piece
- 18 shots (6 new: n1 resort at night with one lit window, n2 doctor takes the bag, n3 the knock, n4 dawn,
  n5 father and daughter on the beach, n6 blue-hour aerial behind the final card), 110 s.
- Opening title on black ("24/7 Clinic presents / One Night on the Red Sea"), dip to black into 2:14 am and into dawn,
  a soft warm flash at sunset and at the seaplane, the picture dims behind chapter titles.
- Sound: off until the viewer turns it on. Made live with Web Audio, no files: sea, crickets at night, birds at
  dawn, a slow piano and pad that change chord with each chapter, the message tones, the knock, the seaplane.
  Tested with tools/snd.mjs: present in every chapter, peak 0.29, silent when turned off.
- Space plays or pauses, arrow keys change chapter; captions are read to screen readers.
- Find Your Clinic opens https://www.247clinic.net/our-clinics; Skip jumps to the final card.
- Canvas trap: the design canvas marks boards as hidden, so requestAnimationFrame nearly stops. The engine asks
  for a frame and a 20 ms timer each time and takes whichever comes first.
