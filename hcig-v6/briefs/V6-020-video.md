# V6-020: Web video encodes (ffmpeg only)

Read `hcig-v6/BRAIN.md` and `hcig-v6/AGENTS.md` first. ABSOLUTE RULE: never extract a frame, still, thumbnail or
poster from any video. Videos stay videos. Posters are designed by Claude separately.

Goal: make light web versions of the group film and the testimonial videos.

Work in: `D:/hcig-v6-wt-V6-020` (branch `v6/V6-020`). Write the videos to the LOCAL folder
`D:/Healthcare international group/hcig-v6/material/media/video/` (gitignored, outside your worktree; create it).
Commit only `hcig-v6/handbacks/V6-020.md` and `hcig-v6/scripts/encode-video.sh` in your branch.

Inputs (read-only):
- Group film, night (black background): `D:/Healthcare international group/hcig-v3/material/hero-assets/` files whose
  names start with `film-full-` (16:9 and phone 9:16, night black and day). List them with ffprobe first.
- Testimonials: `D:/Healthcare international group/hcig-v3/material/live-site/assets/testimonial/IMG_4627.mp4`,
  `IMG_2392.MOV--effiroom.ru.mp4`, `IMG_2393.MOV--effiroom.ru.mp4`.

Outputs (keep the sound track where the source has one):
- Each 16:9 film: `<name>-1280.mp4` (H.264 High, 1280x720, 30 fps, CRF 26, AAC 128k, `-movflags +faststart`) and
  `<name>-1280.webm` (VP9 CRF 34 with `-b:v 0`, Opus 96k).
- Each 9:16 film: `<name>-720.mp4` and `<name>-720.webm` at 720x1280 (never upscale; if the source is smaller, keep
  its size).
- Each testimonial: `<name>-720.mp4` and `<name>-720.webm`, the long side at 1280 at most, keeping orientation.
- Names: lowercase, no spaces (`testimonial-1`, `testimonial-2`, `testimonial-3` in the order above).

Done when: every output plays (ffprobe shows codec, size, duration equal to the source within 0.1 s), and the handback
lists each file with size in KB, resolution, duration and audio yes or no. Script: `hcig-v6/scripts/encode-video.sh`
(bash, the exact commands used). Commit the script and the handback. Do not push. No dashes or emojis.
