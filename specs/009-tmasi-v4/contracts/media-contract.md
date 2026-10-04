# Media contract: images, loops, film, icons, logos

## Formats and budgets

| Kind | Format | Desktop | Phone | Loading |
|---|---|---|---|---|
| Globe still | AVIF + WebP | at or under 120 KB | at or under 80 KB | in the first paint |
| Section image | AVIF + WebP, `srcset` | at or under 200 KB | at or under 120 KB | lazy, below the fold |
| 3D icon | WebP or AVIF with alpha, 2x | at or under 25 KB | same file | lazy |
| Partner logo | SVG (else PNG 2x) | at or under 30 KB | same | lazy |
| Silent loop | MP4 H.264 (+ WebM VP9 if smaller), no audio track | 1080p, at or under 1.5 MB, 6 to 12 s | 720p, at or under 1.0 MB | `preload="none"`, starts near the screen, pauses off screen |
| Film | MP4 H.264 with AAC audio | 1080p, at or under 14 MB, 30 to 45 s | 720p, at or under 7 MB | only after Watch is pressed |
| Poster | AVIF + WebP | at or under 80 KB | at or under 60 KB | with its video |

## Sources and licences

| Source | Rule |
|---|---|
| Generated (Nano Banana Pro in his Gemini, driven by Claude in Chrome) | prompt saved next to the file; checked at 100% for garbled text, fake logos, faces presented as staff |
| Veo clips (he makes them) | shot prompt saved; checked for watermark and artefacts before cutting |
| Stock | Pexels (free commercial use); page URL saved in the register |
| CC0 icon library | licence page saved in the register before use |
| Built in our scene | source code in `tmasi-v4/src/globe/` or the canvas folder |
| Official logos | file URL on the organisation's own site saved in the register |

## Hard rules

- **Never a still taken from inside a video.** Posters are made as images in their own right.
- No video starts with a black frame or a play icon; the poster shows until the first frame plays.
- No invented text, numbers or logos inside any image.
- Only assets with `status: approved` in `media.json` ship.

## Naming

`public/<kind>/<section>-<subject>[-phone].<ext>`, lowercase, hyphens, no spaces
(v3 lesson: the live folder had names like `finaaaaaal.jpg.jpeg`).
