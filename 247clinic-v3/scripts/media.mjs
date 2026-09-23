/* Films from `247 material/` -> web renditions in public/media (gitignored).
   Films are used as films only: no poster or still is ever taken from a frame.
   Hero: the first 14 s of the Le Reve commercial (the user, 2026-09-23). */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const SRC = path.resolve("..", "247 material");
const OUT = path.resolve("public", "media");
fs.mkdirSync(OUT, { recursive: true });
const only = process.argv[2];

const ff = (args) => execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args], { stdio: "inherit" });
const kb = (f) => Math.round(fs.statSync(path.join(OUT, f)).size / 1024);

const X264 = ["-c:v", "libx264", "-preset", "slow", "-profile:v", "high", "-pix_fmt", "yuv420p", "-movflags", "+faststart"];
const VP9 = ["-c:v", "libvpx-vp9", "-b:v", "0", "-row-mt", "1", "-deadline", "good", "-cpu-used", "2", "-pix_fmt", "yuv420p"];

/* A silent loop: no audio track at all. */
function loop(src, out, { from = 0, secs, w, crf, vp9crf }) {
  const input = ["-ss", String(from), ...(secs ? ["-t", String(secs)] : []), "-i", path.join(SRC, src)];
  const vf = ["-vf", `scale=${w}:-2:flags=lanczos`];
  ff([...input, "-an", ...vf, ...X264, "-crf", String(crf), path.join(OUT, `${out}.mp4`)]);
  if (vp9crf) ff([...input, "-an", ...vf, ...VP9, "-crf", String(vp9crf), path.join(OUT, `${out}.webm`)]);
  console.log(out, `${kb(`${out}.mp4`)} KB mp4`, vp9crf ? `${kb(`${out}.webm`)} KB webm` : "");
}

/* The full film with sound, for the viewer: a stream copy, so it keeps the exact
   quality of his file (the user, 2026-09-23: "video be high quality"). */
function full(src, out) {
  ff(["-i", path.join(SRC, src), "-c", "copy", "-movflags", "+faststart", path.join(OUT, `${out}.mp4`)]);
  console.log(out, `${kb(`${out}.mp4`)} KB (stream copy)`);
}

/* A silent loop cut from the source without re-encoding (no generational loss). */
function copyLoop(src, out, secs) {
  ff(["-i", path.join(SRC, src), "-t", String(secs), "-an", "-c:v", "copy", "-movflags", "+faststart", path.join(OUT, `${out}.mp4`)]);
  console.log(out, `${kb(`${out}.mp4`)} KB (stream copy)`);
}

const HERO = "Le reve 247 full commercial.mp4";
const STORIES = [
  ["story-scooter", "patient 1 - Every recovery starts with the right support.While riding a scooter in Egypt, our patient from T.mp4", 432],
  ["story-poland", "patient 2 -Smiles know no borders! We’re thrilled to share feedback from our wonderful patient from Poland .mp4", 768],
  ["story-romania", "patinet 2 - but diff montage -Real moments at our @247clinics at Premier Le Reve Hotel A lovely family from Romania found them.mp4", 768],
  ["story-3", "patient 3.mp4", 432],
  ["story-italy", "patinet 4 - Our patient from Italy, staying at Almaza Bay Resort, shares his experience and gratitude for th.mp4", 432],
  ["story-scotland", "patinet 5 - Our patient, Debbie from Scotland, shares her experience at 24-7 Clinic @247clinics We’re always.mp4", 432],
];
const INTRO = "247 clinic video intro - where you are in your hotel.mp4";

if (!only || only === "hero") {
  for (const old of ["hero.webm", "hero-m.mp4", "hero-m.webm"]) fs.rmSync(path.join(OUT, old), { force: true });
  copyLoop(HERO, "hero", 14);
  full(HERO, "commercial"); // the whole film with sound, for Watch in the facilities section
}
if (!only || only === "intro") {
  loop(INTRO, "intro-prev", { secs: 10, w: 540, crf: 23 });
  full(INTRO, "intro");
}
if (!only || only === "stories") {
  for (const [id, src, w] of STORIES) {
    loop(src, `${id}-prev`, { secs: 8, w, crf: 24 });
    full(src, id);
  }
}
