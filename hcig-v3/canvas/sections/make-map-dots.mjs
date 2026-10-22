// Land dots for the section 7 map: an even grid over the window, kept where it falls on land.
// Source: world-atlas@2.0.2 land-110m.json (Natural Earth, public domain). Run: node make-map-dots.mjs <land-110m.json>
import { readFileSync, writeFileSync } from "node:fs";
const t = JSON.parse(readFileSync(process.argv[2], "utf8"));
const { scale: [sx, sy], translate: [tx, ty] } = t.transform;
const arcs = t.arcs.map((a) => { let x = 0, y = 0; return a.map(([dx, dy]) => { x += dx; y += dy; return [x * sx + tx, y * sy + ty]; }); });
const ring = (ids) => ids.flatMap((i, k) => { const a = i < 0 ? arcs[~i].slice().reverse() : arcs[i]; return k ? a.slice(1) : a; });
const rings = [];
for (const g of t.objects.land.geometries) { const polys = g.type === "Polygon" ? [g.arcs] : g.arcs; for (const p of polys) for (const r of p) rings.push(ring(r)); }
const inside = (lon, lat) => { let c = false; for (const r of rings) for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const [xi, yi] = r[i], [xj, yj] = r[j]; if ((yi > lat) !== (yj > lat) && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) c = !c; } return c; };
const STEP = 2.2, out = [];
for (let lat = 70; lat >= 4; lat -= STEP) for (let lon = -110; lon <= 72; lon += STEP) if (inside(lon, lat)) out.push([+lon.toFixed(2), +lat.toFixed(2)]);
writeFileSync(new URL("./map-dots.json", import.meta.url), JSON.stringify(out));
console.log("dots", out.length);
