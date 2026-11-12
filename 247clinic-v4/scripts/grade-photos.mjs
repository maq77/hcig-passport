/* One colour grade for every 24/7 photo (the user, 2026-11-12: "match photos to be like our brand colors",
   voice note: "they use like preset even for photos to make match website").
   The preset he saw on the canvas: warmer white balance with sand in the highlights, calmer colour, lifted blacks.
   Originals are kept once in docs/247clinic-design/2026-11-12-originals/ and every run grades FROM the original,
   so running it twice never grades a photo twice. Logos, flags and films are not touched.
   Usage: node scripts/grade-photos.mjs            (all photos in public/img and public/slots)
          node scripts/grade-photos.mjs file ...   (only these, paths relative to public/) */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const PUB = path.join(ROOT, "public");
const KEEP = path.resolve(ROOT, "..", "docs", "247clinic-design", "2026-11-12-originals");
const PHOTO = /\.(jpe?g|png|webp)$/i;

export const grade = (img) => img
  .recomb([[1.035, 0.02, 0], [0.01, 1.0, 0], [0, 0.02, 0.93]])
  .modulate({ saturation: 0.88, brightness: 1.0 })
  .linear(0.93, 11);

const list = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ["img", "slots"].flatMap((d) => fs.readdirSync(path.join(PUB, d)).filter((f) => PHOTO.test(f)).map((f) => `${d}/${f}`));

for (const rel of list) {
  const file = path.join(PUB, rel);
  const orig = path.join(KEEP, rel);
  if (!fs.existsSync(orig)) { fs.mkdirSync(path.dirname(orig), { recursive: true }); fs.copyFileSync(file, orig); }
  const ext = path.extname(file).toLowerCase();
  let out = grade(sharp(orig).rotate());
  out = ext === ".webp" ? out.webp({ quality: 82 }) : ext === ".png" ? out.png({ compressionLevel: 9 }) : out.jpeg({ quality: 84, mozjpeg: true });
  await out.toFile(file + ".tmp");
  fs.renameSync(file + ".tmp", file);
  console.log("graded", rel);
}
