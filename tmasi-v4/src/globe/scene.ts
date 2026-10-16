// T014 (spec 009 FR-005 to FR-011, FR-021; globe contract). The TMASI network globe, framework-free so the
// design canvas and the site run the same code. Five offices, arcs from Egypt, four looks on a dark or light
// hero, three motions, a phone tour, and every guard of the globe contract.
import {
  AdditiveBlending, BackSide, NormalBlending, BufferAttribute, BufferGeometry, CatmullRomCurve3, Color, DirectionalLight, Group,
  HemisphereLight, LineSegments, Matrix4, Mesh, MeshBasicMaterial, PMREMGenerator, PerspectiveCamera, PlaneGeometry, Points,
  Raycaster, SRGBColorSpace, Scene, ShaderMaterial, SphereGeometry, Texture, TextureLoader, Vector2, Vector3, WebGLRenderer,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { makeArc } from "./arcs";
import { buildJet, type Jet, type JetKind } from "./jet";
import { REAL_SUN, buildRealEarth, type RealEarth, type RealTextures } from "./real";
import { angleBetween, latLngToVec3, latticeLatLng, lerpAngle, rotationFacing } from "./geo";
import { LOOKS, type Look, type Palette, type Theme } from "./looks";
import { frameProbe, pixelRatioSteps } from "./profile";
import { TIMING, finalFrame, storyFrame, type Frame, type GlobeState, type Motion } from "./story";

export type GlobeOffice = { id: string; lat: number; lng: number };
export type PinScreen = { id: string; x: number; y: number; visible: number };

export type GlobeOptions = {
  canvas: HTMLCanvasElement;
  offices: GlobeOffice[];       // offices[0] is home (Egypt)
  order: string[];              // story order of the other offices
  look: Look;
  theme: Theme;
  motion: Motion;
  profile: "desktop" | "phone";
  landData: ArrayBuffer;        // public/globe/land-*.bin
  earthTexture?: string;        // URL of the NASA night Earth (realistic look only)
  realTextures?: RealTextures;  // NASA day, night lights, clouds and water mask (real look only)
  interactive?: boolean;        // drag and hover (desktop)
  planes?: boolean;             // aircraft flying the routes, after the logo's plane (default on)
  reducedMotion?: boolean;
  onState?: (s: GlobeState) => void;
  onFocus?: (id: string | null) => void;
  onHover?: (id: string | null) => void;
  onPins?: (pins: PinScreen[]) => void;  // each frame, for HTML labels
  onFallback?: () => void;               // probe ran out of steps: show the still
};

export type GlobeController = {
  setLook(look: Look, theme: Theme): void;
  setMotion(m: Motion): void;
  setScrollProgress(p: number): void;
  focus(id: string | null): void;
  replay(): void;
  startTour(): void;
  stopTour(): void;
  pause(): void;
  resume(): void;
  destroy(): void;
};

const CAMERA_Z = 3.9;
const LOGO_SUN = new Vector3(-2, 3, 4).normalize();

// ---------------------------------------------------------------- shaders
const dotsVert = /* glsl */ `
  uniform float uSize; uniform float uPixelRatio;
  varying float vFacing;
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vec3 n = normalize(mat3(modelMatrix) * position);
    vFacing = dot(n, normalize(cameraPosition - wp.xyz));
    vec4 mv = viewMatrix * wp;
    gl_PointSize = uSize * uPixelRatio * (${CAMERA_Z.toFixed(1)} / -mv.z);
    gl_Position = projectionMatrix * mv;
  }`;
const dotsFrag = /* glsl */ `
  uniform vec3 uColor; uniform float uAlpha; uniform float uBack;
  varying float vFacing;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float edge = smoothstep(0.5, 0.32, d);
    float front = mix(0.38, 1.0, smoothstep(0.0, 0.55, vFacing));
    float vis = vFacing > 0.0 ? front : uBack;
    gl_FragColor = vec4(uColor, uAlpha * edge * vis);
  }`;
const bodyVert = /* glsl */ `
  varying vec3 vN; varying vec3 vView; varying vec2 vUv;
  void main() {
    vUv = uv;
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vN = normalize(mat3(modelMatrix) * normal);
    vView = normalize(cameraPosition - wp.xyz);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }`;
const bodyFrag = /* glsl */ `
  uniform vec3 uBase; uniform vec3 uRim; uniform float uRimStrength; uniform float uOpacity;
  uniform float uSpec; uniform sampler2D uMap; uniform float uUseMap;
  varying vec3 vN; varying vec3 vView; varying vec2 vUv;
  void main() {
    vec3 n = normalize(vN);
    float f = 1.0 - max(dot(n, normalize(vView)), 0.0);
    float rim = pow(f, 3.0) * uRimStrength;
    vec3 base = uBase;
    if (uUseMap > 0.5) {
      vec3 tex = texture2D(uMap, vUv).rgb;
      base = pow(tex, vec3(0.8)) * 2.4 + vec3(0.012, 0.025, 0.05);
    }
    float spec = pow(max(dot(n, normalize(vec3(-0.45, 0.55, 0.7))), 0.0), 48.0) * uSpec;
    vec3 col = base + uRim * rim + vec3(spec);
    gl_FragColor = vec4(col, clamp(uOpacity + rim * (1.0 - uOpacity) * 0.6 + spec, 0.0, 1.0));
  }`;
const haloVert = /* glsl */ `
  varying float vD;
  void main() {
    vec3 n = normalize(normalMatrix * normal);
    vD = n.z;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }`;
const haloFrag = /* glsl */ `
  uniform vec3 uColor; uniform float uStrength;
  varying float vD;
  void main() {
    float rise = smoothstep(0.0, -0.42, vD);
    float fall = 1.0 - smoothstep(-0.5, -0.8, vD);
    float i = pow(rise, 1.7) * fall * uStrength;
    gl_FragColor = vec4(uColor, i);
  }`;
const ringVert = /* glsl */ `
  varying vec2 vUv; varying float vFacing;
  void main() {
    vUv = uv;
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vec3 n = normalize(wp.xyz - (modelMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz);
    vec3 c = (modelMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
    vFacing = dot(normalize(c), normalize(cameraPosition - c));
    gl_Position = projectionMatrix * viewMatrix * wp;
  }`;
const ringFrag = /* glsl */ `
  uniform vec3 uColor; uniform float uTime; uniform float uHover; uniform float uFocus; uniform float uOn; uniform float uBack;
  varying vec2 vUv; varying float vFacing;
  void main() {
    float r = length(vUv - 0.5) * 2.0;
    float t = fract(uTime * 0.55);
    float ringR = 0.22 + t * 0.78;
    float ring = smoothstep(0.07, 0.0, abs(r - ringR)) * (1.0 - t) * 0.9;
    float glow = smoothstep(0.42, 0.0, r) * (0.28 + 0.72 * max(uHover, uFocus));
    float vis = mix(uBack, 1.0, smoothstep(-0.05, 0.2, vFacing));
    float a = (ring + glow) * uOn * vis;
    if (a < 0.01) discard;
    gl_FragColor = vec4(uColor, a);
  }`;
const gridVert = /* glsl */ `
  varying float vFacing;
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vec3 n = normalize(mat3(modelMatrix) * position);
    vFacing = dot(n, normalize(cameraPosition - wp.xyz));
    gl_Position = projectionMatrix * viewMatrix * wp;
  }`;
const gridFrag = /* glsl */ `
  uniform vec3 uColor; uniform float uAlpha; uniform float uBack;
  varying float vFacing;
  void main() { gl_FragColor = vec4(uColor, uAlpha * mix(uBack, 1.0, smoothstep(-0.05, 0.25, vFacing))); }`;

// ---------------------------------------------------------------- helpers
function landPositions(buf: ArrayBuffer): Float32Array {
  const view = new DataView(buf);
  const n = view.getUint32(0, true);
  const count = (buf.byteLength - 4) / 2;
  const out = new Float32Array(count * 3);
  for (let k = 0; k < count; k++) {
    const [lat, lng] = latticeLatLng(view.getUint16(4 + k * 2, true), n);
    const p = latLngToVec3(lat, lng, 1.003);
    out[k * 3] = p.x; out[k * 3 + 1] = p.y; out[k * 3 + 2] = p.z;
  }
  return out;
}

function graticule(stepDeg = 15, r = 1.002): BufferGeometry {
  const pts: number[] = [];
  const push = (a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }) => pts.push(a.x, a.y, a.z, b.x, b.y, b.z);
  for (let lat = -75; lat <= 75; lat += stepDeg) for (let lng = -180; lng < 180; lng += 3) push(latLngToVec3(lat, lng, r), latLngToVec3(lat, lng + 3, r));
  for (let lng = -180; lng < 180; lng += stepDeg) for (let lat = -84; lat < 84; lat += 3) push(latLngToVec3(lat, lng, r), latLngToVec3(lat + 3, lng, r));
  const g = new BufferGeometry();
  g.setAttribute("position", new BufferAttribute(new Float32Array(pts), 3));
  return g;
}

/** Centre of the whole network (mean direction of the offices), nudged north so Europe sits well. */
function networkCentre(offices: GlobeOffice[]) {
  const v = offices.reduce((a, o) => { const p = latLngToVec3(o.lat, o.lng); return { x: a.x + p.x, y: a.y + p.y, z: a.z + p.z }; }, { x: 0, y: 0, z: 0 });
  const len = Math.hypot(v.x, v.y, v.z) || 1;
  const lat = (Math.asin(v.y / len) * 180) / Math.PI;
  const lng = (Math.atan2(-v.z / len, v.x / len) * 180) / Math.PI;
  return { lat: lat + 6, lng };
}

// ---------------------------------------------------------------- the globe
export function createGlobe(opts: GlobeOptions): GlobeController {
  const { canvas } = opts;
  const phone = opts.profile === "phone";
  let look = opts.look, theme = opts.theme, motion = opts.motion;
  let state: GlobeState = "still";
  const setState = (s: GlobeState) => { if (s !== state) { state = s; opts.onState?.(s); } };

  const home = opts.offices[0];
  const targets = opts.order.map((id) => opts.offices.find((o) => o.id === id)!).filter(Boolean);
  const longArcs = targets.map((t) => angleBetween(home, t) > Math.PI / 2);
  const centre = networkCentre(opts.offices);

  let renderer: WebGLRenderer, scene: Scene, camera: PerspectiveCamera, earth: Group;
  let body: Mesh, halo: Mesh, dots: Points | null = null, grid: LineSegments | null = null;
  let planes: Jet[] = [];
  let real: RealEarth | null = null, sunLight: DirectionalLight, envMap: Texture | null = null;
  let arcs: Mesh[] = [], pins: { id: string; group: Group; core: Mesh; ring: Mesh; hit: Mesh; normal: Vector3 }[] = [];
  let texture: Texture | null = null;
  const ratios = pixelRatioSteps(window.devicePixelRatio);
  let ratioIdx = 0;

  // motion state
  let startedAt = performance.now();
  let rot = { ...rotationFacing(home.lat, home.lng) };
  let scrollP = 0;
  let focusId: string | null = null, hoverId: string | null = null;
  let drag: { x: number; y: number } | null = null;
  const dragOffset = { x: 0, y: 0 };
  let lastInteraction = 0;
  let tourOn = false, tourIdx = 0, tourNext = 0, tourHoldUntil = 0;
  let running = false, visible = true, raf = 0, last = performance.now();
  let probe = frameProbe(stepDown);

  function palette(): Palette { return LOOKS[look][theme]; }

  function build() {
    renderer = new WebGLRenderer({ canvas, antialias: !phone, alpha: true, powerPreference: "high-performance" });
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = SRGBColorSpace;
    renderer.setPixelRatio(ratios[ratioIdx]);
    scene = new Scene();
    camera = new PerspectiveCamera(35, 1, 0.1, 50);
    camera.position.set(0, 0, CAMERA_Z);
    earth = new Group();
    scene.add(earth);

    body = new Mesh(new SphereGeometry(1, phone ? 64 : 96, phone ? 48 : 64), new ShaderMaterial({
      vertexShader: bodyVert, fragmentShader: bodyFrag, transparent: true,
      uniforms: { uBase: { value: new Color() }, uRim: { value: new Color() }, uRimStrength: { value: 0 }, uOpacity: { value: 1 }, uSpec: { value: 0 }, uMap: { value: null }, uUseMap: { value: 0 } },
    }));
    earth.add(body);

    halo = new Mesh(new SphereGeometry(1.2, 64, 48), new ShaderMaterial({
      vertexShader: haloVert, fragmentShader: haloFrag, side: BackSide, transparent: true, depthWrite: false,
      uniforms: { uColor: { value: new Color() }, uStrength: { value: 0 } },
    }));
    scene.add(halo);

    const geo = new BufferGeometry();
    geo.setAttribute("position", new BufferAttribute(landPositions(opts.landData), 3));
    dots = new Points(geo, new ShaderMaterial({
      vertexShader: dotsVert, fragmentShader: dotsFrag, transparent: true, depthWrite: false,
      uniforms: { uSize: { value: 2 }, uPixelRatio: { value: ratios[ratioIdx] }, uColor: { value: new Color() }, uAlpha: { value: 1 }, uBack: { value: 0 } },
    }));
    earth.add(dots);

    grid = new LineSegments(graticule(), new ShaderMaterial({
      vertexShader: gridVert, fragmentShader: gridFrag, transparent: true, depthWrite: false, blending: AdditiveBlending,
      uniforms: { uColor: { value: new Color() }, uAlpha: { value: 0 }, uBack: { value: 0 } },
    }));
    earth.add(grid);

    pins = opts.offices.map((o) => {
      const p = latLngToVec3(o.lat, o.lng, 1.004);
      const normal = new Vector3(p.x, p.y, p.z).normalize();
      const group = new Group();
      group.position.set(p.x, p.y, p.z);
      group.lookAt(normal.clone().multiplyScalar(3));
      const core = new Mesh(new SphereGeometry(phone ? 0.02 : 0.016, 16, 12), new MeshBasicMaterial({ color: 0xffffff, transparent: true }));
      const ring = new Mesh(new PlaneGeometry(1, 1), new ShaderMaterial({
        vertexShader: ringVert, fragmentShader: ringFrag, transparent: true, depthWrite: false, blending: AdditiveBlending,
        uniforms: { uColor: { value: new Color() }, uTime: { value: 0 }, uHover: { value: 0 }, uFocus: { value: 0 }, uOn: { value: 0 }, uBack: { value: 0 } },
      }));
      ring.scale.setScalar(phone ? 0.16 : 0.12);
      const hit = new Mesh(new SphereGeometry(phone ? 0.11 : 0.07, 8, 6), new MeshBasicMaterial({ visible: false }));
      hit.userData.id = o.id;
      group.add(core, ring, hit);
      earth.add(group);
      return { id: o.id, group, core, ring, hit, normal };
    });

    arcs = targets.map((t) => {
      const pal = palette();
      const m = makeArc(home, t, phone ? 0.0078 : 0.0058, pal.arc, pal.pulse, pal.arcAlpha, pal.backAlpha);
      earth.add(m);
      return m;
    });

    // Soft light for the aircraft only (everything else draws its own shading).
    scene.add(new HemisphereLight(0xffffff, 0x0b3a40, 1.2));
    sunLight = new DirectionalLight(0xffffff, 1.8);
    scene.add(sunLight);

    applyLook();
    resize();
    // Compile every shader now, behind the still, so the first visible frame does not stutter.
    renderer.compile(scene, camera);
  }

  function makePlanes(kind: JetKind) {
    if (planes.length && planes[0].kind === kind) return;
    for (const p of planes) {
      earth.remove(p.group);
      p.group.traverse((o) => (o as Mesh).geometry?.dispose?.());
      p.parts.forEach((m) => m.dispose());
    }
    planes = targets.map(() => {
      const jet = buildJet(kind);
      jet.group.visible = false;
      jet.group.matrixAutoUpdate = false;
      earth.add(jet.group);
      return jet;
    });
  }

  function applyLook() {
    const pal = palette();
    const isReal = look === "real" && !!opts.realTextures;
    if (isReal && !real) {
      real = buildRealEarth(opts.realTextures!, phone, () => { if (!running) draw(); });
      earth.add(real.surface);
      scene.add(real.air);
      // A soft studio room for the glossy paint of the real jets to reflect.
      const pmrem = new PMREMGenerator(renderer);
      envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      pmrem.dispose();
    }
    if (real) { real.surface.visible = isReal; real.air.visible = isReal; real.setTheme(theme); }
    scene.environment = isReal ? envMap : null;
    body.visible = !isReal;
    halo.visible = !isReal;
    sunLight.position.copy(isReal ? REAL_SUN : LOGO_SUN).multiplyScalar(5);
    makePlanes(isReal ? "real" : "logo");
    const bm = body.material as ShaderMaterial;
    bm.uniforms.uBase.value.set(pal.base);
    bm.uniforms.uRim.value.set(pal.rim);
    bm.uniforms.uRimStrength.value = pal.rimStrength;
    bm.uniforms.uOpacity.value = pal.baseOpacity;
    bm.uniforms.uSpec.value = look === "glass" ? 0.9 : look === "realistic" ? 0.1 : 0.05;
    bm.depthWrite = pal.baseOpacity >= 1;
    bm.uniforms.uUseMap.value = 0;
    if (pal.texture && opts.earthTexture) {
      if (!texture) {
        texture = new TextureLoader().load(opts.earthTexture, () => draw());
        texture.colorSpace = SRGBColorSpace;
        texture.anisotropy = phone ? 2 : 4;
      }
      bm.uniforms.uMap.value = texture;
      bm.uniforms.uUseMap.value = 1;
    }
    const hm = halo.material as ShaderMaterial;
    hm.uniforms.uColor.value.set(pal.halo);
    hm.uniforms.uStrength.value = pal.haloStrength;
    if (dots) {
      const dm = dots.material as ShaderMaterial;
      dm.uniforms.uColor.value.set(pal.dots);
      dm.uniforms.uSize.value = pal.dotSize * (phone ? 1.15 : 1);
      dm.uniforms.uAlpha.value = pal.dotAlpha;
      dm.uniforms.uBack.value = pal.backAlpha;
      dots.visible = pal.dotSize > 0;
    }
    if (grid) {
      const gm = grid.material as ShaderMaterial;
      gm.uniforms.uColor.value.set(pal.grid ?? "#000000");
      gm.uniforms.uAlpha.value = pal.gridAlpha;
      gm.uniforms.uBack.value = pal.backAlpha;
      grid.visible = !!pal.grid;
    }
    for (const p of pins) {
      (p.core.material as MeshBasicMaterial).color.set(pal.pinCore);
      const rm = p.ring.material as ShaderMaterial;
      // Glow adds light on a dark hero; on a light hero additive light vanishes, so blend normally.
      rm.blending = theme === "dark" ? AdditiveBlending : NormalBlending;
      rm.needsUpdate = true;
      rm.uniforms.uColor.value.set(pal.pinRing);
      rm.uniforms.uBack.value = pal.backAlpha;
    }
    for (const pl of planes) if (pl.kind === "logo") pl.body.color.set(theme === "dark" ? "#ffffff" : "#e9eef1");
    for (const a of arcs) {
      const am = a.material as ShaderMaterial;
      am.uniforms.uColor.value.set(pal.arc);
      am.uniforms.uPulseColor.value.set(pal.pulse);
      am.uniforms.uAlpha.value = pal.arcAlpha;
      am.uniforms.uBack.value = pal.backAlpha;
    }
  }

  function resize() {
    const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Keep the whole globe and its halo in frame on tall phone canvases.
    camera.fov = w / h < 0.9 ? 35 / Math.max(w / h, 0.55) * 0.9 : 35;
    camera.updateProjectionMatrix();
  }

  // ---------------------------------------------------------------- frame
  function currentFrame(t: number): Frame {
    if (opts.reducedMotion) return finalFrame(targets.length);
    if (motion === "story") return storyFrame(t, longArcs);
    const f = finalFrame(targets.length);
    // scroll and idle: everything drawn, pulses keep travelling
    f.pulses = f.pulses.map((_, i) => ((t / 2.6 + i * 0.23) % 1) * 1.3 - 0.15);
    return f;
  }

  function targetRotation(f: Frame, t: number): { x: number; y: number } {
    const homeRot = rotationFacing(home.lat, home.lng);
    const fin = rotationFacing(centre.lat, centre.lng);
    let r: { x: number; y: number };
    if (focusId) {
      const o = opts.offices.find((x) => x.id === focusId)!;
      r = rotationFacing(Math.min(o.lat, 40), o.lng);
    } else if (motion === "scroll") {
      const stops = [home, ...targets];
      const s = Math.min(stops.length - 1.0001, scrollP * (stops.length - 1));
      const i = Math.floor(s), k = s - i;
      const a = rotationFacing(Math.min(stops[i].lat, 40), stops[i].lng), b = rotationFacing(Math.min(stops[i + 1].lat, 40), stops[i + 1].lng);
      r = { x: a.x + (b.x - a.x) * k, y: lerpAngle(a.y, b.y, k) };
    } else if (motion === "idle" && !opts.reducedMotion) {
      r = { x: fin.x, y: fin.y + t * ((Math.PI * 2) / 60) };
    } else {
      r = { x: homeRot.x + (fin.x - homeRot.x) * f.framing, y: lerpAngle(homeRot.y, fin.y, f.framing) + f.sway };
    }
    return { x: r.x + dragOffset.x, y: r.y + dragOffset.y };
  }

  // Each office has its own aircraft. In the story it flies out from Egypt and draws its arc behind it;
  // afterwards it flies out and back on its route, its arc lighting up behind it like a contrail.
  const planeSize = phone ? 0.07 : 0.055;
  const flyTime = targets.map((tg) => 2.4 + 2.4 * (angleBetween(home, tg) / Math.PI));
  const HOLD = 1.3;
  const basis = new Matrix4(), tmpUp = new Vector3(), tmpFwd = new Vector3(), tmpRight = new Vector3(), tmpPos = new Vector3();
  const easeFlight = (s: number) => 0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, Math.max(0, s)));
  function flyPlanes(f: Frame, t: number): number[] | null {
    const on = (opts.planes ?? true) && !opts.reducedMotion;
    if (!on) { planes.forEach((p) => (p.group.visible = false)); return null; }
    const storyEnd = motion === "story" ? storyEndTime() : 0;
    const pal = palette();
    return planes.map((pl, i) => {
      const curve = arcs[i].userData.curve as CatmullRomCurve3;
      let u = -1, back = false;
      if (motion === "story" && !f.done) {
        if (f.arcs[i] > 0 && f.arcs[i] < 1) u = f.arcs[i];
      } else {
        const cycle = 2 * (flyTime[i] + HOLD);
        const tau = (((t - storyEnd) + i * 1.9) % cycle + cycle) % cycle;
        if (tau < flyTime[i]) u = easeFlight(tau / flyTime[i]);
        else if (tau >= flyTime[i] + HOLD && tau < 2 * flyTime[i] + HOLD) { u = 1 - easeFlight((tau - flyTime[i] - HOLD) / flyTime[i]); back = true; }
      }
      if (u <= 0 || u >= 1) { pl.group.visible = false; return -1; }
      curve.getPointAt(u, tmpPos);
      curve.getTangentAt(u, tmpFwd);
      if (back) tmpFwd.negate();
      tmpUp.copy(tmpPos).normalize();
      tmpFwd.addScaledVector(tmpUp, -tmpFwd.dot(tmpUp)).normalize();
      tmpRight.crossVectors(tmpFwd, tmpUp);
      basis.makeBasis(tmpRight, tmpFwd, tmpUp);
      const env = Math.min(1, u / 0.06, (1 - u) / 0.06);
      const size = planeSize * (0.4 + 0.6 * env);
      basis.scale(new Vector3(size, size, size));
      basis.setPosition(tmpPos.x, tmpPos.y, tmpPos.z);
      pl.group.matrix.copy(basis);
      pl.group.matrixWorldNeedsUpdate = true;
      const facing = tmpUp.clone().applyQuaternion(earth.quaternion).z;
      const op = env * (facing > 0.02 ? 1 : pal.backAlpha);
      for (const m of pl.parts) m.opacity = op;
      pl.group.visible = op > 0.01;
      return u;
    });
  }
  function storyEndTime(): number {
    let end = 0;
    targets.forEach((_, i) => { end = Math.max(end, TIMING.firstArc + i * TIMING.arcGap + (longArcs[i] ? TIMING.longArcDur : TIMING.arcDur)); });
    return end;
  }

  function draw(now = performance.now(), dt = 16) {
    if (!renderer) return;
    const t = (now - startedAt) / 1000;
    const f = currentFrame(t);

    // phone tour: one office after another, card row follows through onFocus
    if (tourOn && f.done && now > tourHoldUntil && now > tourNext) {
      const id = opts.offices[tourIdx % opts.offices.length].id;
      tourIdx++;
      focusId = id;
      opts.onFocus?.(id);
      tourNext = now + 2800;
    }

    // drag offsets ease home after 3 s without touching
    if (!drag && now - lastInteraction > 3000) {
      dragOffset.x *= 0.96; dragOffset.y *= 0.96;
    }

    const target = targetRotation(f, t);
    const k = opts.reducedMotion ? 1 : 1 - Math.exp(-dt / 1000 * (focusId ? 3.2 : 2.4));
    rot = { x: rot.x + (target.x - rot.x) * k, y: lerpAngle(rot.y, target.y, k) };
    earth.rotation.set(rot.x, rot.y, 0);
    const s = 0.94 + 0.06 * f.arrive;
    earth.scale.setScalar(s);
    halo.scale.setScalar(s);
    if (real) { real.air.scale.setScalar(s); real.update(t); }

    const flights = flyPlanes(f, t);
    arcs.forEach((a, i) => {
      const u = (a.material as ShaderMaterial).uniforms;
      u.uProgress.value = f.arcs[i];
      u.uPulse.value = flights ? flights[i] : f.pulses[i];
    });
    const pal = palette();
    const camDir = new Vector3(0, 0, 1);
    const screen: PinScreen[] = [];
    pins.forEach((p, i) => {
      const u = (p.ring.material as ShaderMaterial).uniforms;
      const isHome = i === 0;
      const arcIdx = targets.findIndex((x) => x.id === p.id);
      const on = isHome ? f.home : arcIdx >= 0 ? Math.min(1, f.arcs[arcIdx] * 1.4 - 0.4) : 1;
      u.uOn.value = Math.max(0, on);
      u.uTime.value = t + i * 0.37;
      u.uHover.value += ((hoverId === p.id ? 1 : 0) - u.uHover.value) * 0.18;
      u.uFocus.value += ((focusId === p.id ? 1 : 0) - u.uFocus.value) * 0.12;
      const worldN = p.normal.clone().applyQuaternion(earth.quaternion);
      const facing = worldN.dot(camDir);
      const cm = p.core.material as MeshBasicMaterial;
      cm.opacity = Math.max(0, on) * (facing > 0 ? 1 : pal.backAlpha);
      if (opts.onPins) {
        const wp = p.group.getWorldPosition(new Vector3()).project(camera);
        screen.push({ id: p.id, x: (wp.x * 0.5 + 0.5) * canvas.clientWidth, y: (-wp.y * 0.5 + 0.5) * canvas.clientHeight, visible: Math.max(0, Math.min(1, (facing - 0.08) / 0.25)) * Math.max(0, on) });
      }
    });
    opts.onPins?.(screen);
    renderer.render(scene, camera);

    if (state === "still" || state === "arriving") setState(f.arrive >= 1 ? (f.done ? "idle" : "story") : "arriving");
    else if (state === "story" && f.done) setState(focusId ? "focus" : "idle");
  }

  function loop(now: number) {
    if (!running) return;
    const dt = Math.min(100, now - last);
    last = now;
    draw(now, dt);
    if (state !== "arriving") probe(dt);
    raf = requestAnimationFrame(loop);
  }

  function start() {
    if (running || !visible || state === "lost" || state === "fallback") return;
    if (opts.reducedMotion) { draw(); return; }
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(loop);
  }
  function stop() { running = false; cancelAnimationFrame(raf); }

  function stepDown(): boolean {
    if (ratioIdx < ratios.length - 1) {
      ratioIdx++;
      renderer.setPixelRatio(ratios[ratioIdx]);
      if (dots) (dots.material as ShaderMaterial).uniforms.uPixelRatio.value = ratios[ratioIdx];
      resize();
      return true;
    }
    stop();
    setState("fallback");
    opts.onFallback?.();
    return false;
  }

  // ---------------------------------------------------------------- input
  const ray = new Raycaster();
  const ndc = new Vector2();
  function pick(ev: PointerEvent): string | null {
    const r = canvas.getBoundingClientRect();
    ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hits = ray.intersectObjects([body, ...pins.map((p) => p.hit)], false);
    const first = hits[0];
    return first && first.object.userData.id ? (first.object.userData.id as string) : null;
  }
  function onDown(ev: PointerEvent) {
    lastInteraction = performance.now();
    const id = pick(ev);
    if (id) { focus(id); return; }
    if (opts.interactive && !phone) { drag = { x: ev.clientX, y: ev.clientY }; canvas.setPointerCapture(ev.pointerId); }
  }
  function onMove(ev: PointerEvent) {
    if (drag) {
      dragOffset.y += (ev.clientX - drag.x) * 0.006;
      dragOffset.x = Math.max(-0.6, Math.min(0.6, dragOffset.x + (ev.clientY - drag.y) * 0.004));
      drag = { x: ev.clientX, y: ev.clientY };
      lastInteraction = performance.now();
      return;
    }
    if (phone || !opts.interactive) return;
    const id = pick(ev);
    if (id !== hoverId) { hoverId = id; canvas.style.cursor = id ? "pointer" : "grab"; opts.onHover?.(id); }
  }
  function onUp() { drag = null; lastInteraction = performance.now(); }
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onUp);
  canvas.style.touchAction = "pan-y";
  if (opts.interactive && !phone) canvas.style.cursor = "grab";

  // ---------------------------------------------------------------- guards
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && document.visibilityState === "visible") start(); else { stop(); if (state !== "lost" && state !== "fallback") opts.onState?.("paused"); } }, { threshold: 0.01 });
  io.observe(canvas);
  const onVis = () => (document.visibilityState === "visible" && visible ? start() : stop());
  document.addEventListener("visibilitychange", onVis);
  const ro = new ResizeObserver(() => { if (renderer) { resize(); if (!running) draw(); } });
  ro.observe(canvas);
  const onLost = (e: Event) => { e.preventDefault(); stop(); setState("lost"); };
  const onRestored = () => { disposeScene(); build(); state = "still"; startedAt = performance.now() - 60_000; start(); };
  canvas.addEventListener("webglcontextlost", onLost);
  canvas.addEventListener("webglcontextrestored", onRestored);

  function disposeScene() {
    scene?.traverse((o) => {
      const m = o as Mesh;
      m.geometry?.dispose?.();
      const mat = m.material as ShaderMaterial | ShaderMaterial[] | undefined;
      (Array.isArray(mat) ? mat : mat ? [mat] : []).forEach((x) => x.dispose());
    });
    texture?.dispose();
    texture = null;
    real?.dispose();
    real = null;
    envMap?.dispose();
    envMap = null;
    planes = [];
    renderer?.dispose();
  }

  // ---------------------------------------------------------------- controller
  function focus(id: string | null) {
    focusId = id;
    lastInteraction = performance.now();
    if (tourOn) tourHoldUntil = performance.now() + 6000;
    opts.onFocus?.(id);
    if (state === "idle" || state === "focus") setState(id ? "focus" : "idle");
    if (!running) draw();
  }

  build();
  draw();
  start();

  return {
    setLook(l, th) { look = l; theme = th; applyLook(); if (!running) draw(); },
    setMotion(m) { motion = m; focusId = null; startedAt = performance.now(); state = "still"; if (!running) draw(); },
    setScrollProgress(p) { scrollP = Math.max(0, Math.min(1, p)); if (!running) draw(); },
    focus,
    replay() { startedAt = performance.now(); state = "still"; focusId = null; rot = { ...rotationFacing(home.lat, home.lng) }; probe = frameProbe(stepDown); start(); },
    startTour() { tourOn = true; tourNext = 0; },
    stopTour() { tourOn = false; },
    pause() { stop(); },
    resume() { start(); },
    destroy() {
      stop();
      io.disconnect(); ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      disposeScene();
    },
  };
}
