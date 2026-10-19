# HCIG website motion: prompts for Veo, Gemini and Omni (2026-10-19)

His ask: "give me prompt to test on veo/gemini/omni gemini too, make realistic video that will be used on website as
animation". Rules for every prompt below: no text, no logos, no faces (video models warp logos; the real HCIG and brand
logos are laid on top by us), seamless loop, slow and calm (it sits behind words), pure black background so on the
site it can blend with `mix-blend-mode: screen` and the black disappears (a white-background version uses `multiply`).

Settings: 16:9, 1080p (or 4K), 8 seconds, 24 or 30 fps, no audio needed. For phone, run the same prompt at 9:16.

## 1. One world, one group (the hero background, night)

Cinematic macro shot of planet Earth at night seen from low orbit, Europe, the Mediterranean, Egypt and the Red Sea in
view, city lights glowing warm white. Fine luminous turquoise (#12C0C6) threads of light rise from cities across Europe,
the United States east coast and the Gulf, travel in smooth arcs over the curve of the planet and converge on the Red
Sea coast of Egypt near Hurghada, where a soft turquoise point of light gently pulses. The camera drifts very slowly
forward and slightly right, one continuous move, no cuts. Real photographic look, deep black space with faint stars,
thin pale blue atmosphere rim. Calm, premium, cinematic, like a luxury airline or private bank film. No text, no logos,
no people. Seamless loop: the last frame matches the first.

## 2. The network converges (abstract, for the group section)

Photoreal macro of glass and light: thin turquoise (#12C0C6) light threads, like fibre optics, flow through deep black
space from many directions and converge into a single bright point at the centre of the frame; around the point, eight
small polished glass discs slowly orbit on a tilted ring, each catching the light. Shallow depth of field, soft
cinematic bokeh, slow and precise motion, camera slowly orbiting 20 degrees. Pure black background, no smoke, no lens
flares, no text, no logos. Elegant, calm, world-class product-film quality. Seamless 8-second loop.

## 3. Night to day over the Red Sea (for the night and day switch)

Real cinematic time-lapse from low orbit over the Red Sea and Egypt: the terminator line of sunrise sweeps slowly from
east to west across the planet, the night city lights fade as the sea turns a clear turquoise and the desert pale sand,
thin white clouds catch the first light. One continuous slow camera drift, no cuts. Photographic, calm, premium. No
text, no logos, no people. 8 seconds.

## 4. Light journey (horizontal band, for a section divider)

Ultra wide cinematic shot, black background: a single fine turquoise (#12C0C6) ribbon of light flows from left to right
in a calm S-curve, gently undulating like silk in slow motion, a brighter pulse travelling along it; the ribbon leaves
eight faint glowing points along its path. Photoreal light, shallow depth of field, no particles, no flares, no text, no
logos. Seamless 8-second loop. Aspect 21:9 if available, else 16:9.

## 5. Image to video, with our mark as the first frame (test only)

Start frame: the white HC mark on pure black (hcig-v3/material/canvas-assets/img/mark-white.png placed centred on a
1920x1080 black image). Prompt: "The white HC monogram stays perfectly still and sharp at the centre. From its curved
swoosh a fine turquoise (#12C0C6) line of light unfurls and travels outwards in a smooth arc, splitting into eight thin
threads that drift out to a slow tilted orbit around the monogram. Pure black background, photoreal light, calm, no text,
no other logos. 8 seconds." Note: if the model changes the monogram's shape at all, that take cannot be used (the brand
guideline forbids altering the logo); keep the take only if the mark stays exact, or use it as a background and lay the
real mark on top.

## Day versions

Add to any prompt: "Bright daylight version: soft white and very pale turquoise background instead of black, the light
threads in deep turquoise (#0A7F84), airy and clean". On the site a white background blends with `mix-blend-mode:
multiply`.

## How we use the result

- Hero: the video as a muted, looping, `playsinline` background layer, poster frame from our own still (never a frame
  grab shown as an image), WebM + MP4, under 4 MB, paused when off screen and for reduced motion.
- The real logos (HCIG mark and the eight brands, transparent cuts in hcig-v3/motion/logos/) are animated on top by us,
  so they stay exact.
