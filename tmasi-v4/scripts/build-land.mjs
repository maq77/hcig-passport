// T011 (research R2): land dots for the globe, computed once at build time.
// Points are spread evenly over the sphere (Fibonacci lattice of N points); only those that fall on land
// (Natural Earth 110m via world-atlas, public domain) are kept. Each kept point is stored as its lattice
// index (2 bytes), so the browser rebuilds its position from the same formula in src/globe/land.ts.
// File layout: uint32 N (lattice size, little-endian), then uint16 indices.
import { mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { feature } from "topojson-client";

const require = createRequire(import.meta.url);
const topo = require("world-atlas/land-110m.json");
const land = feature(topo, topo.objects.land);
const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, "..", "public", "globe");
mkdirSync(outDir, { recursive: true });

// Polygons as rings of [lon, lat] with bounding boxes for a quick reject.
const polys = [];
for (const f of land.features) {
  const g = f.geometry;
  const list = g.type === "Polygon" ? [g.coordinates] : g.coordinates;
  for (const rings of list) {
    let minX = 180, maxX = -180, minY = 90, maxY = -90;
    for (const [x, y] of rings[0]) { minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y); }
    polys.push({ rings, minX, maxX, minY, maxY });
  }
}

function inRing(x, y, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
function onLand(lon, lat) {
  for (const p of polys) {
    if (lon < p.minX || lon > p.maxX || lat < p.minY || lat > p.maxY) continue;
    if (inRing(lon, lat, p.rings[0]) && !p.rings.slice(1).some((h) => inRing(lon, lat, h))) return true;
  }
  return false;
}

// Must match latticePoint() in src/globe/land.ts exactly.
const GOLDEN = Math.PI * (3 - Math.sqrt(5));
function latticeLatLng(i, n) {
  const y = 1 - ((i + 0.5) * 2) / n;
  const theta = GOLDEN * i;
  const r = Math.sqrt(1 - y * y);
  const lat = (Math.asin(y) * 180) / Math.PI;
  const lng = (Math.atan2(Math.sin(theta) * r, Math.cos(theta) * r) * 180) / Math.PI;
  return [lat, lng];
}

function build(name, n) {
  if (n > 65535) throw new Error("lattice too large for uint16 indices");
  const kept = [];
  for (let i = 0; i < n; i++) {
    const [lat, lng] = latticeLatLng(i, n);
    if (onLand(lng, lat)) kept.push(i);
  }
  const buf = Buffer.alloc(4 + kept.length * 2);
  buf.writeUInt32LE(n, 0);
  kept.forEach((idx, k) => buf.writeUInt16LE(idx, 4 + k * 2));
  writeFileSync(join(outDir, `land-${name}.bin`), buf);
  console.log(`build-land: ${name}: lattice ${n}, ${kept.length} land dots, ${(buf.length / 1024).toFixed(1)} KB`);
}

// About 29% of the sphere is land: these lattices give about 12,000 and 6,000 land dots.
build("desktop", 42000);
build("phone", 21000);
