# Media contract: v6 films and photos

## Films

| Role | File | Source | Rule |
|---|---|---|---|
| Hero | `public/video/hero.mp4` (+ `hero-phone.mp4` if lighter) | his finished cut | H.264, no audio track, faststart, under 6 MB desktop and 3 MB phone, 20 to 30 s, loops cleanly |
| Hero stand-in (canvas only) | `loop-red-sea-hotel-10s.mp4` | Veo 10 s (`gemini_generated_video_6661c3ea.mp4`) | labelled as a stand-in, never shipped as the final hero without his yes |
| Journey loop | `public/video/red-sea.mp4` | Veo 10 s | muted, plays only while on screen |
| Watch film | `public/video/tmasi-film.mp4` | Kling commercial (`IMG_9982.MOV`, HEVC) | re-encoded to H.264 with sound, faststart; captions if it has speech; opens only on press |

Web copies already made 2026-10-07 in `tmasi-v4/.work/v5/media/`: `film-jet-globe-care-30s.mp4` (5.9 MB, sound) and
`loop-red-sea-hotel-10s.mp4` (2.3 MB, silent). The Kling web copy is made at build time of step 4.

## Rules

- Never a still taken from any video, for any purpose. Posters are designed images chosen by file name.
- Films play muted unless the visitor presses Watch film. No black flash, no play icon before the first frame.
- Every film pauses off screen and in a hidden tab; reduced motion shows the poster.
- 720p sources are judged at real desktop size on the canvas before shipping; 1080p replaces them when he has it.

## Photos

| Use | Files |
|---|---|
| News and proof (real) | `IMG_1996.jpg` ITIC booth, `IMG_2039.jpg` ITIC Venice stage, `IMG_5841.JPG` Egypt Healthcare Authority signing, `IMG_0069.PNG` Uniglobal, `IMG_0070.PNG`, the booth photos `29215F6D...`, `3AB08D0C...`, `70E12935...`, the panel `D917A331...`; and each post's own first picture |
| Journey and bento | `public/img/bento/*.webp` (one art direction) |
| Services | `public/img/services/service-*.webp` |
| Poster (until his cut) | `public/img/bento/w5-comprehensive.webp` |
