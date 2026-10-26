// Builds the site's media from media.json: WebP at the width the site needs (never upscaled), logos and fonts copied
// as they are, videos copied as V6-020 encoded them. Writes public/media/manifest.json with each file's size.
// Uses ffmpeg/ffprobe only. Never takes a frame from a video.
// Run: node hcig-v6/scripts/media.mjs   (re-run any time; unchanged outputs are skipped)
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const V6 = join(dirname(fileURLToPath(import.meta.url)), "..");
const ROOT = join(V6, "..");
const OUT = join(V6, "public", "media");
const media = JSON.parse(readFileSync(join(V6, "media.json"), "utf8"));
mkdirSync(OUT, { recursive: true });

const probe = (file) => {
  try {
    const out = execFileSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0", file]).toString().trim();
    const [w, h] = out.split(",").map(Number);
    return { w, h };
  } catch { return { w: 0, h: 0 }; }
};
const fresh = (src, out) => existsSync(out) && statSync(out).mtimeMs >= statSync(src).mtimeMs;

const manifest = {};
const missing = [];
for (const [key, m] of Object.entries(media)) {
  if (key.startsWith("_")) continue;
  const src = join(ROOT, m.src);
  if (!existsSync(src)) { missing.push(`${key}: ${m.src}`); continue; }
  const ext = extname(src).toLowerCase();
  let file;
  if (m.video || m.keep || ext === ".svg" || ext === ".woff2") {
    file = `${key}${ext}`;
    const out = join(OUT, file);
    if (!fresh(src, out)) copyFileSync(src, out);
  } else {
    file = `${key}.webp`;
    const out = join(OUT, file);
    if (!fresh(src, out)) {
      const { w } = probe(src);
      const width = Math.min(m.width || w, w || m.width);
      execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", src, "-vf", `scale=${width}:-2:flags=lanczos`, "-c:v", "libwebp", "-quality", "82", "-compression_level", "6", out]);
    }
  }
  const out = join(OUT, file);
  const dims = ext === ".svg" || ext === ".woff2" ? { w: 0, h: 0 } : probe(out);
  manifest[key] = { file, w: dims.w, h: dims.h, kb: Math.round(statSync(out).size / 1024), ...(m.alt ? { alt: m.alt } : {}), ...(m.video ? { video: true } : {}) };
}
writeFileSync(join(OUT, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
const total = Object.values(manifest).reduce((a, b) => a + b.kb, 0);
console.log(`media: ${Object.keys(manifest).length} files, ${total} KB total`);
if (missing.length) console.log(`waiting for ${missing.length}:\n  ` + missing.join("\n  "));
