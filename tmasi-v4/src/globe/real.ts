// The real Earth (his call, 2026-10-07: "lets make it real, and use web gl too"). NASA imagery, all public
// domain: Blue Marble Next Generation by day (July 2004, topography and bathymetry), Black Marble 2016 city
// lights by night, the NASA cloud composite, and a water mask cut from the day map for the sun's glint on the
// sea. The sun is fixed to the camera, upper left, so the office the globe turns to is always in daylight and
// the far east edge falls into night with its cities lit.
import {
  AdditiveBlending, BackSide, Group, Mesh, NormalBlending, RepeatWrapping, SRGBColorSpace, ShaderMaterial,
  SphereGeometry, Texture, TextureLoader, Vector3,
} from "three";

export type RealTextures = { day: string; night: string; clouds: string; water: string };

export const REAL_SUN = new Vector3(-0.78, 0.3, 0.55).normalize();

const surfaceVert = /* glsl */ `
  varying vec2 vUv; varying vec3 vN; varying vec3 vView;
  void main() {
    vUv = uv;
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vN = normalize(mat3(modelMatrix) * normal);
    vView = normalize(cameraPosition - wp.xyz);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }`;

const earthFrag = /* glsl */ `
  uniform sampler2D uDay; uniform sampler2D uNight; uniform sampler2D uClouds; uniform sampler2D uWater;
  uniform vec3 uSun; uniform float uCloudShift;
  varying vec2 vUv; varying vec3 vN; varying vec3 vView;
  void main() {
    vec3 n = normalize(vN), v = normalize(vView), l = normalize(uSun);
    float ndl = dot(n, l);
    float day = smoothstep(-0.1, 0.25, ndl);
    float diff = max(ndl, 0.0);
    vec3 col = texture2D(uDay, vUv).rgb * (0.03 + 1.6 * pow(diff, 0.8));
    // The sun on the sea: a tight glint plus a broad sheen, water only.
    float water = texture2D(uWater, vUv).r;
    float nh = max(dot(n, normalize(l + v)), 0.0);
    col += vec3(1.0, 0.93, 0.82) * (pow(nh, 260.0) * 0.55 + pow(nh, 28.0) * 0.06) * water * smoothstep(0.0, 0.25, ndl);
    // Cloud shadows, offset a touch away from the sun.
    float shade = texture2D(uClouds, vUv + vec2(uCloudShift - 0.0012, 0.0012)).r;
    col *= 1.0 - 0.32 * smoothstep(0.2, 0.9, shade) * diff;
    // City lights where it is night.
    col += vec3(1.0, 0.7, 0.36) * pow(texture2D(uNight, vUv).r, 1.4) * 1.25 * (1.0 - day);
    // Air seen edge-on: the limb turns blue on the day side.
    float f = pow(1.0 - max(dot(n, v), 0.0), 2.6);
    col = mix(col, vec3(0.35, 0.62, 1.0) * (0.15 + 0.9 * day), f * 0.75 * (0.25 + 0.75 * smoothstep(-0.3, 0.5, ndl)));
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }`;

const cloudFrag = /* glsl */ `
  uniform sampler2D uClouds; uniform vec3 uSun; uniform float uCloudShift; uniform float uOpacity;
  varying vec2 vUv; varying vec3 vN; varying vec3 vView;
  void main() {
    vec3 n = normalize(vN), l = normalize(uSun);
    float c = smoothstep(0.18, 0.95, texture2D(uClouds, vUv + vec2(uCloudShift, 0.0)).r);
    float ndl = dot(n, l);
    float day = smoothstep(-0.15, 0.3, ndl);
    float lit = 0.04 + 1.1 * pow(max(ndl, 0.0), 0.7);
    vec3 col = vec3(lit) * mix(vec3(1.0, 0.84, 0.66), vec3(1.0), smoothstep(0.0, 0.35, ndl));
    float limb = smoothstep(0.0, 0.25, dot(n, normalize(vView)));
    gl_FragColor = vec4(col, c * mix(0.22, 0.9, day) * mix(0.55, 1.0, limb) * uOpacity);
    #include <colorspace_fragment>
  }`;

const airVert = /* glsl */ `
  varying vec3 vNw; varying float vZ;
  void main() {
    vNw = normalize(mat3(modelMatrix) * normal);
    vZ = normalize(normalMatrix * normal).z;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }`;
const airFrag = /* glsl */ `
  uniform vec3 uSun; uniform float uStrength; uniform float uEdge;
  varying vec3 vNw; varying float vZ;
  void main() {
    float i = pow(smoothstep(0.0, -uEdge, vZ), 1.6);
    float sun = smoothstep(-0.45, 0.55, dot(normalize(vNw), normalize(uSun)));
    i *= (0.1 + 0.95 * sun) * uStrength;
    vec3 col = mix(vec3(0.18, 0.42, 1.0), vec3(0.5, 0.78, 1.0), sun);
    gl_FragColor = vec4(col, i);
  }`;

export type RealEarth = {
  surface: Group;          // rotates with the globe
  air: Mesh;               // the atmosphere shell, view-facing, in the scene
  setTheme(theme: "dark" | "light"): void;
  update(t: number): void;
  dispose(): void;
};

/** Builds the real Earth. `onLoad` fires once all four images are in, so the caller can redraw. */
export function buildRealEarth(tex: RealTextures, phone: boolean, onLoad: () => void): RealEarth {
  const loader = new TextureLoader();
  let pending = 4;
  const done = () => { if (--pending === 0) onLoad(); };
  const load = (url: string, srgb: boolean, repeat = false): Texture => {
    const t = loader.load(url, done, undefined, done);
    if (srgb) t.colorSpace = SRGBColorSpace;
    if (repeat) t.wrapS = RepeatWrapping;
    t.anisotropy = phone ? 2 : 8;
    return t;
  };
  const day = load(tex.day, true), night = load(tex.night, false), clouds = load(tex.clouds, false, true), water = load(tex.water, false);

  const seg = phone ? 72 : 128;
  const surface = new Group();
  const ground = new Mesh(new SphereGeometry(1, seg, seg * 0.75), new ShaderMaterial({
    vertexShader: surfaceVert, fragmentShader: earthFrag,
    uniforms: { uDay: { value: day }, uNight: { value: night }, uClouds: { value: clouds }, uWater: { value: water }, uSun: { value: REAL_SUN }, uCloudShift: { value: 0 } },
  }));
  const sky = new Mesh(new SphereGeometry(1.006, seg, seg * 0.75), new ShaderMaterial({
    vertexShader: surfaceVert, fragmentShader: cloudFrag, transparent: true, depthWrite: false,
    uniforms: { uClouds: { value: clouds }, uSun: { value: REAL_SUN }, uCloudShift: { value: 0 }, uOpacity: { value: 1 } },
  }));
  surface.add(ground, sky);

  // Thin shell: the halo reads as air, not as a glow. uEdge is where the Earth's rim falls on the shell.
  const R = 1.075;
  const air = new Mesh(new SphereGeometry(R, 96, 64), new ShaderMaterial({
    vertexShader: airVert, fragmentShader: airFrag, side: BackSide, transparent: true, depthWrite: false, blending: AdditiveBlending,
    uniforms: { uSun: { value: REAL_SUN }, uStrength: { value: 1.6 }, uEdge: { value: Math.sqrt(1 - 1 / (R * R)) } },
  }));

  return {
    surface,
    air,
    setTheme(theme) {
      const m = air.material as ShaderMaterial;
      // Added light vanishes on white: on a light hero the air is laid over the page instead.
      m.blending = theme === "dark" ? AdditiveBlending : NormalBlending;
      m.uniforms.uStrength.value = theme === "dark" ? 1.6 : 0.9;
      m.needsUpdate = true;
    },
    update(t) {
      const shift = (t * 0.0016) % 1;
      (ground.material as ShaderMaterial).uniforms.uCloudShift.value = shift;
      (sky.material as ShaderMaterial).uniforms.uCloudShift.value = shift;
    },
    dispose() {
      [ground, sky, air].forEach((m) => { m.geometry.dispose(); (m.material as ShaderMaterial).dispose(); });
      [day, night, clouds, water].forEach((t) => t.dispose());
    },
  };
}
