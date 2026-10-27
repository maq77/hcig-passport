"use client";
// Hairline silk between Our Healthcare and Maritime (his pick S1, 2026-10-27): seven fine lines crossing slowly, the
// Mission & Vision lines grown up. Brand tints only (Turquoise 100 to 40, Dim Gray 60 and 40). Each line morphs between
// two calm states (SVG animate, no script per frame); under reduced motion the lines lie still.
import { useReducedMotion } from "motion/react";

const W = 1440;
const H = 120;
type Wave = { y: number; a: number; f: number; p: number; a2: number; f2: number; p2: number };
const at = (w: Wave, x: number) => w.y + w.a * Math.sin((x / W) * Math.PI * 2 * w.f + w.p) + w.a2 * Math.sin((x / W) * Math.PI * 2 * w.f2 + w.p2);

// a smooth cubic through the points (Catmull-Rom to Bezier)
function path(w: Wave) {
  const pts: [number, number][] = [];
  for (let i = 0; i <= 28; i++) {
    const x = (i / 28) * (W + 80) - 40;
    pts.push([x, at(w, x)]);
  }
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    d += ` C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)} ${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)} ${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}

const COLORS = ["#12C0C6", "#42CDD1", "#71D9DD", "#A0E6E8", "#9A9A9C", "#BBBCBE", "#71D9DD"];
const LINES = COLORS.map((c, i) => ({
  c,
  a: path({ y: H / 2 + (i - 3) * 6, a: H * 0.26, f: 0.9 + i * 0.05, p: i * 0.5, a2: H * 0.06, f2: 2.3, p2: i }),
  b: path({ y: H / 2 + (3 - i) * 5, a: H * 0.24, f: 0.95 + i * 0.04, p: i * 0.5 + 1.2, a2: H * 0.07, f2: 2.1, p2: i + 1 }),
}));

export function SilkDivider() {
  const reduce = useReducedMotion();
  return (
    <div className="silk" aria-hidden="true">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" focusable="false">
        {LINES.map((l, i) => (
          <path key={i} d={l.a} fill="none" stroke={l.c} strokeWidth={i === 0 ? 1.6 : 1} strokeOpacity={i === 0 ? 0.9 : 0.6} vectorEffect="non-scaling-stroke" strokeLinecap="round">
            {reduce ? null : (
              <animate attributeName="d" values={`${l.a};${l.b};${l.a}`} dur={`${18 + i}s`} begin={`${-(i * 1.3).toFixed(1)}s`} repeatCount="indefinite" calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1" />
            )}
          </path>
        ))}
      </svg>
    </div>
  );
}
