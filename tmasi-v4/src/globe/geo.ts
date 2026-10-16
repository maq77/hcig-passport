// Geography helpers for the globe (spec 009, research R2 and R3).
// Convention matches three.js SphereGeometry UVs, so an equirectangular Earth image lines up with the pins:
//   x = cos(lat) cos(lng),  y = sin(lat),  z = -cos(lat) sin(lng)
const D2R = Math.PI / 180;

export type Vec3 = { x: number; y: number; z: number };

export function latLngToVec3(lat: number, lng: number, r = 1): Vec3 {
  const la = lat * D2R, lo = lng * D2R;
  return { x: r * Math.cos(la) * Math.cos(lo), y: r * Math.sin(la), z: -r * Math.cos(la) * Math.sin(lo) };
}

/** Globe rotation (Euler XYZ) that brings lat, lng to the centre of the view (camera on +z). */
export function rotationFacing(lat: number, lng: number): { x: number; y: number } {
  return { x: lat * D2R, y: -Math.PI / 2 - lng * D2R };
}

/** Great-circle angle between two places, in radians. */
export function angleBetween(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const p = latLngToVec3(a.lat, a.lng), q = latLngToVec3(b.lat, b.lng);
  return Math.acos(Math.min(1, Math.max(-1, p.x * q.x + p.y * q.y + p.z * q.z)));
}

// Must match latticeLatLng() in scripts/build-land.mjs exactly.
const GOLDEN = Math.PI * (3 - Math.sqrt(5));
export function latticeLatLng(i: number, n: number): [number, number] {
  const y = 1 - ((i + 0.5) * 2) / n;
  const theta = GOLDEN * i;
  const r = Math.sqrt(1 - y * y);
  return [Math.asin(y) / D2R, Math.atan2(Math.sin(theta) * r, Math.cos(theta) * r) / D2R];
}

/** Shortest-path interpolation of an angle (radians). */
export function lerpAngle(a: number, b: number, t: number): number {
  let d = (b - a) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return a + d * t;
}
