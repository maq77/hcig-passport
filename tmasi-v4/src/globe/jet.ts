// The aircraft that flies the TMASI routes. Two builds, both in code, no external model:
// - "logo": stylised low-poly, from the plane in the TMASI logo (img2threejs method). Teal fin, logo-blue
//   engines, about 400 triangles, flat shaded.
// - "real" (his call, 2026-10-07: "lets make it real"): after his own Gemini render of the TMASI jet, a white
//   narrow-body seen from above with TMASI along the roof. Smooth glossy paint that reflects a studio
//   environment, cabin windows, cockpit glass, rounded wings with winglets, nacelles with dark intakes, and a
//   teal fin as the one brand mark. About 6,000 triangles; one 512 x 1024 livery texture shared by all jets.
// Frame: nose along +Y, up along +Z, right wing along +X; length 2 units (y from -1 to 1).
import {
  BoxGeometry, CanvasTexture, CylinderGeometry, DoubleSide, ExtrudeGeometry, Group, LatheGeometry, Mesh, MeshPhysicalMaterial,
  MeshStandardMaterial, SRGBColorSpace, Shape, Vector2,
} from "three";

export type JetKind = "logo" | "real";
export type Jet = { kind: JetKind; group: Group; body: MeshStandardMaterial; parts: MeshStandardMaterial[] };

const thin = (s: Shape, depth: number) => new ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 1 });
const rounded = (s: Shape, depth: number, bevel: number) =>
  new ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 3, curveSegments: 6 });

export function buildJet(kind: JetKind = "logo"): Jet {
  return kind === "real" ? buildRealJet() : buildLogoJet();
}

function buildLogoJet(): Jet {
  const body = new MeshStandardMaterial({ color: 0xffffff, roughness: 0.45, metalness: 0.1, flatShading: true, transparent: true, side: DoubleSide });
  const fin = new MeshStandardMaterial({ color: 0x009a9c, roughness: 0.5, flatShading: true, transparent: true, side: DoubleSide });
  const engine = new MeshStandardMaterial({ color: 0x1f5fae, roughness: 0.5, flatShading: true, transparent: true, side: DoubleSide });
  const group = new Group();

  // Fuselage: a lathe around the Y axis (rounded nose, long tube, raised tapering tail cone).
  const profile = [[0, 1], [0.035, 0.97], [0.065, 0.9], [0.085, 0.78], [0.09, 0.6], [0.09, -0.5], [0.08, -0.72], [0.05, -0.9], [0.02, -1]]
    .map(([r, y]) => new Vector2(r, y));
  group.add(new Mesh(new LatheGeometry(profile, 10), body));

  // Wings: swept back, set slightly low, with a little dihedral (the logo's plan view).
  const wing = new Shape();
  wing.moveTo(0.06, 0.3); wing.lineTo(0.95, -0.2); wing.lineTo(0.93, -0.31); wing.lineTo(0.06, -0.1); wing.closePath();
  for (const side of [1, -1]) {
    const g = thin(wing, 0.024);
    g.translate(0, 0, -0.04);
    if (side < 0) g.scale(-1, 1, 1);
    const m = new Mesh(g, body);
    m.rotation.y = side * 0.07;
    group.add(m);
  }

  // Tailplane.
  const tail = new Shape();
  tail.moveTo(0.04, -0.66); tail.lineTo(0.36, -0.88); tail.lineTo(0.36, -0.96); tail.lineTo(0.04, -0.9); tail.closePath();
  for (const side of [1, -1]) {
    const g = thin(tail, 0.016);
    g.translate(0, 0, 0.01);
    if (side < 0) g.scale(-1, 1, 1);
    group.add(new Mesh(g, body));
  }

  // Vertical fin (inferred), teal like the lower half of the logo's arch.
  const finShape = new Shape(); // drawn as (height, y), then stood up
  finShape.moveTo(0.06, -0.6); finShape.lineTo(0.38, -0.9); finShape.lineTo(0.38, -0.99); finShape.lineTo(0.06, -0.98); finShape.closePath();
  const fg = thin(finShape, 0.018);
  fg.rotateY(-Math.PI / 2); // height -> +Z, thickness -> X
  fg.translate(0.009, 0, 0);
  group.add(new Mesh(fg, fin));

  // Engines under the wings (inferred), logo blue like the upper half of the arch.
  for (const side of [1, -1]) {
    const e = new Mesh(new CylinderGeometry(0.038, 0.034, 0.22, 8, 1), engine);
    e.position.set(side * 0.36, 0.06, -0.085);
    group.add(e);
  }

  return { kind: "logo", group, body, parts: [body, fin, engine] };
}

// ---------------------------------------------------------------- real
const R = 0.09; // fuselage radius

/** Fuselage radius along its length: elliptical nose, straight cabin, tapering tail cone. */
function fuselageRadius(y: number): number {
  if (y > 0.7) return R * Math.sqrt(Math.max(0, 1 - ((y - 0.7) / 0.3) ** 2));
  if (y < -0.5) return 0.016 + (R - 0.016) * (1 - ((-0.5 - y) / 0.5) ** 1.7);
  return R;
}

// The livery is painted on the fuselage lathe: u runs around it (0.5 = the roof, 0.25 and 0.75 = the sides),
// and at(u, v) takes v from the nose (0) to the tail (1). The lathe runs tail to nose and the texture is
// flipped, so the nose sits at the top of the canvas.
let livery: CanvasTexture | null = null;
function liveryTexture(): CanvasTexture {
  if (livery) return livery;
  const W = 512, H = 1024;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const g = c.getContext("2d")!;
  g.fillStyle = "#f5f7f9";
  g.fillRect(0, 0, W, H);
  const at = (u: number, v: number) => [u * W, v * H] as const;
  // Cabin windows: one row each side, a little above the side line.
  g.fillStyle = "#26303b";
  for (const u of [0.31, 0.69]) for (let v = 0.12; v < 0.74; v += 0.016) { const [x, y] = at(u, v); g.fillRect(x - 3, y - 4, 6, 8); }
  // Cockpit glass, wrapping the upper nose.
  g.fillStyle = "#1b232c";
  { const [x0, y0] = at(0.36, 0.075); const [x1, y1] = at(0.64, 0.055); g.fillRect(x0, y1, x1 - x0, y0 - y1); }
  // TMASI along the roof, twice, as on his render: one each side of the spine, reading outward.
  g.fillStyle = "#5c6672";
  g.font = "700 46px Montserrat, Arial, sans-serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  for (const [u, rot] of [[0.455, -Math.PI / 2], [0.545, Math.PI / 2]] as const) {
    const [x, y] = at(u, 0.3);
    g.save(); g.translate(x, y); g.rotate(rot); g.fillText("TMASI", 0, 0); g.restore();
  }
  livery = new CanvasTexture(c);
  livery.colorSpace = SRGBColorSpace;
  livery.anisotropy = 4;
  return livery;
}

function buildRealJet(): Jet {
  // Seen from above the paint mirrors the studio ceiling: keep reflections low or the roof burns out to white.
  const paint = { roughness: 0.36, metalness: 0.05, clearcoat: 0.45, clearcoatRoughness: 0.3, envMapIntensity: 0.3, transparent: true };
  const body = new MeshPhysicalMaterial({ ...paint, color: 0xffffff, map: liveryTexture() });
  const white = new MeshPhysicalMaterial({ ...paint, color: 0xf3f5f7 });
  const fin = new MeshPhysicalMaterial({ ...paint, color: 0x009a9c });
  const engine = new MeshPhysicalMaterial({ ...paint, color: 0xe6e9ec, metalness: 0.2 });
  const intake = new MeshStandardMaterial({ color: 0x20262d, roughness: 0.6, transparent: true });
  const group = new Group();

  // Lathe points must run upward (tail to nose) or the faces point inward and the outside is culled.
  const N = 48;
  const profile: Vector2[] = [new Vector2(0, -1)]; // closed tail
  for (let k = 0; k <= N; k++) { const y = -1 + (2 * k) / N; profile.push(new Vector2(fuselageRadius(y), y)); }
  profile[profile.length - 1].x = 0; // closed nose
  // phiStart = PI puts u = 0.5 on the roof (+Z).
  group.add(new Mesh(new LatheGeometry(profile, 28, Math.PI), body));

  // Wings: A320-like plan, rounded edges, slight dihedral, winglets.
  const wing = new Shape();
  wing.moveTo(0.07, 0.3); wing.lineTo(0.3, 0.12); wing.lineTo(0.94, -0.21); wing.lineTo(0.92, -0.29); wing.lineTo(0.42, -0.14); wing.lineTo(0.07, -0.12); wing.closePath();
  const winglet = new Shape();
  winglet.moveTo(0, 0); winglet.lineTo(0.09, -0.04); winglet.lineTo(0.09, -0.08); winglet.lineTo(0, -0.08); winglet.closePath();
  for (const side of [1, -1]) {
    const wg = rounded(wing, 0.008, 0.006);
    wg.translate(0, 0, -0.045);
    const tip = rounded(winglet, 0.004, 0.003);
    tip.rotateY(-Math.PI / 2);
    tip.translate(0.935, -0.2, -0.04);
    // Mirror by the mesh, not the geometry, so the renderer flips the face order and the paint stays lit.
    const w = new Mesh(wg, white), t = new Mesh(tip, white);
    for (const m of [w, t]) { m.scale.x = side; m.rotation.y = -side * 0.08; group.add(m); }

    // Engine: nacelle with an intake lip, hung on a pylon under the wing.
    const nacelle = new Mesh(new LatheGeometry([[0.03, -0.1], [0.042, -0.06], [0.045, 0.04], [0.042, 0.11], [0.03, 0.13]].map(([r, y]) => new Vector2(r, y)), 20), engine);
    nacelle.position.set(side * 0.33, 0.2, -0.1);
    const face = new Mesh(new CylinderGeometry(0.03, 0.03, 0.004, 20), intake);
    face.position.set(side * 0.33, 0.33, -0.1);
    const pylon = new Mesh(new BoxGeometry(0.008, 0.12, 0.024), white);
    pylon.position.set(side * 0.33, 0.14, -0.05);
    group.add(nacelle, face, pylon);
  }

  // Tailplane.
  const tail = new Shape();
  tail.moveTo(0.03, -0.68); tail.lineTo(0.34, -0.88); tail.lineTo(0.33, -0.95); tail.lineTo(0.03, -0.9); tail.closePath();
  for (const side of [1, -1]) {
    const g = rounded(tail, 0.005, 0.004);
    g.translate(0, 0, 0.012);
    const m = new Mesh(g, white);
    m.scale.x = side;
    group.add(m);
  }

  // Fin, teal.
  const finShape = new Shape(); // (height, y), then stood up
  finShape.moveTo(0.05, -0.56); finShape.lineTo(0.34, -0.86); finShape.lineTo(0.34, -0.96); finShape.lineTo(0.05, -0.98); finShape.closePath();
  const fg = rounded(finShape, 0.006, 0.005);
  fg.rotateY(-Math.PI / 2);
  fg.translate(0.003, 0, 0);
  group.add(new Mesh(fg, fin));

  return { kind: "real", group, body, parts: [body, white, fin, engine, intake] };
}
