// After `next build`: the static export writes route-group prefetch data as nested folders
// (out/de/__next.!KGRlKQ/de/$oc$slug/__PAGE__.txt) while the browser asks for one flat file name
// (out/de/__next.!KGRlKQ.de.$oc$slug.__PAGE__.txt). A plain static host (Vercel, Apache) serves only
// what exists, so each nested file also gets its flat copy. Without this, links still work but every
// prefetch 404s and in-page navigation falls back to full reloads.
import { copyFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "out");
let made = 0;

function files(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? files(p) : [p];
  });
}

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (!statSync(p).isDirectory()) continue;
    if (name.startsWith("__next.")) {
      for (const f of files(p)) {
        const flat = join(dir, [name, ...relative(p, f).split(sep)].join("."));
        copyFileSync(f, flat);
        made++;
      }
    } else {
      walk(p);
    }
  }
}

walk(OUT);
console.log(`flatten-prefetch: ${made} flat prefetch files written`);
