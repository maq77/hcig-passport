// T015 (research R3): an arc from Egypt to each office. It rises with distance, draws itself in (uProgress)
// and carries a travelling light (uPulse). Far-side parts fade on see-through looks (uBack).
import { CatmullRomCurve3, Color, ShaderMaterial, TubeGeometry, Vector3, Mesh } from "three";
import { angleBetween, latLngToVec3 } from "./geo";

type Place = { lat: number; lng: number };

export function arcCurve(a: Place, b: Place, samples = 48): CatmullRomCurve3 {
  const pa = latLngToVec3(a.lat, a.lng), pb = latLngToVec3(b.lat, b.lng);
  const va = new Vector3(pa.x, pa.y, pa.z), vb = new Vector3(pb.x, pb.y, pb.z);
  const ang = angleBetween(a, b);
  const lift = 0.05 + 0.32 * (ang / Math.PI);
  const pts: Vector3[] = [];
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    // spherical interpolation along the great circle, then lifted
    const s = Math.sin(ang);
    const p = s < 1e-6 ? va.clone() : va.clone().multiplyScalar(Math.sin((1 - t) * ang) / s).add(vb.clone().multiplyScalar(Math.sin(t * ang) / s));
    pts.push(p.normalize().multiplyScalar(1.004 + lift * Math.sin(Math.PI * t)));
  }
  return new CatmullRomCurve3(pts);
}

const vertex = /* glsl */ `
  varying float vU;
  varying float vFacing;
  void main() {
    vU = uv.x;
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vec3 n = normalize(mat3(modelMatrix) * normalize(position));
    vFacing = dot(n, normalize(cameraPosition - wp.xyz));
    gl_Position = projectionMatrix * viewMatrix * wp;
  }`;

const fragment = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uPulseColor;
  uniform float uProgress;
  uniform float uPulse;
  uniform float uAlpha;
  uniform float uBack;
  varying float vU;
  varying float vFacing;
  void main() {
    if (vU > uProgress) discard;
    float head = smoothstep(uProgress - 0.07, uProgress, vU) * (1.0 - step(0.999, uProgress));
    float pulse = uPulse < -0.5 ? 0.0 : smoothstep(0.09, 0.0, abs(vU - uPulse));
    float glow = max(pulse, head);
    float ends = smoothstep(0.0, 0.03, vU) * smoothstep(1.0, 0.97, vU);
    float vis = mix(uBack, 1.0, smoothstep(-0.2, 0.15, vFacing));
    vec3 col = mix(uColor, uPulseColor, glow * 0.85);
    gl_FragColor = vec4(col, uAlpha * (0.72 + 0.28 * glow) * ends * vis);
  }`;

export function makeArc(a: Place, b: Place, radius: number, color: string, pulse: string, alpha: number, back: number): Mesh {
  const curve = arcCurve(a, b);
  const geo = new TubeGeometry(curve, 96, radius, 6, false);
  const mat = new ShaderMaterial({
    vertexShader: vertex,
    fragmentShader: fragment,
    transparent: true,
    depthWrite: false,
    uniforms: {
      uColor: { value: new Color(color) },
      uPulseColor: { value: new Color(pulse) },
      uProgress: { value: 0 },
      uPulse: { value: -1 },
      uAlpha: { value: alpha },
      uBack: { value: back },
    },
  });
  const mesh = new Mesh(geo, mat);
  mesh.userData.curve = curve;
  return mesh;
}
