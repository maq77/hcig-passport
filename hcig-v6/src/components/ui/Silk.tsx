"use client";
// Silk divider between Our Healthcare and Maritime (his note 2026-10-27): a band of fine threads that ripple slowly like
// silk in a light current, a soft turquoise body, a white sheen gliding across, and one light travelling along the
// centre thread. Brand tints only (Turquoise 20 to 100, Dim Gray 20 to 60). The threads morph between two calm states
// (SVG animate, no script work per frame); under reduced motion the silk lies still.
import { useReducedMotion } from "motion/react";
import { useId } from "react";

const W = 1440;
const H = 240;
const N = 18; // threads

// one silk edge: a soft wave across the width
type Wave = { y: number; a: number; f: number; p: number; a2: number; f2: number; p2: number };
const at = (w: Wave, x: number) => w.y + w.a * Math.sin((x / W) * Math.PI * 2 * w.f + w.p) + w.a2 * Math.sin((x / W) * Math.PI * 2 * w.f2 + w.p2);

function points(top: Wave, bot: Wave, k: number): [number, number][] {
  const pts: [number, number][] = [];
  for (let i = 0; i <= 24; i++) {
    const x = (i / 24) * (W + 80) - 40;
    pts.push([x, at(top, x) * (1 - k) + at(bot, x) * k]);
  }
  return pts;
}
// a smooth cubic through the points (Catmull-Rom to Bezier)
function smooth(pts: [number, number][], move = "M") {
  let d = `${move}${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}
const path = (top: Wave, bot: Wave, k: number) => smooth(points(top, bot, k));
// the silk body: along the top edge, then back along the bottom edge, both smooth
const ribbon = (top: Wave, bot: Wave) => `${smooth(points(top, bot, 0))} ${smooth(points(top, bot, 1).reverse(), "L")} Z`;

// two calm states the silk breathes between
const A = {
  top: { y: 74, a: 34, f: 1.1, p: 0.4, a2: 10, f2: 2.6, p2: 1.2 },
  bot: { y: 168, a: 26, f: 0.9, p: 1.4, a2: 12, f2: 2.2, p2: 0.2 },
};
const B = {
  top: { y: 84, a: 28, f: 1.0, p: 1.3, a2: 14, f2: 2.4, p2: 2.4 },
  bot: { y: 160, a: 34, f: 1.05, p: 0.5, a2: 9, f2: 2.8, p2: 1.6 },
};

// the deeper ribbon behind, crossing the first in Dim Gray tints
const C = {
  top: { y: 70, a: 38, f: 0.8, p: 2.6, a2: 8, f2: 2.0, p2: 0.8 },
  bot: { y: 176, a: 30, f: 0.75, p: 3.4, a2: 10, f2: 1.8, p2: 2.2 },
};
const D = {
  top: { y: 84, a: 30, f: 0.85, p: 3.3, a2: 12, f2: 2.1, p2: 1.9 },
  bot: { y: 164, a: 38, f: 0.7, p: 2.4, a2: 8, f2: 1.9, p2: 0.6 },
};
const BACK = 12;

export function SilkDivider() {
  const reduce = useReducedMotion();
  const id = useId().replace(/:/g, "");
  const threads = Array.from({ length: N }, (_, i) => {
    const k = i / (N - 1);
    const da = path(A.top, A.bot, k);
    const db = path(B.top, B.bot, k);
    // the centre threads are brighter and finer at the edges of the band
    const mid = 1 - Math.abs(k - 0.5) * 2;
    return { da, db, k, mid };
  });
  const bodyA = ribbon(A.top, A.bot);
  const bodyB = ribbon(B.top, B.bot);
  const centreA = path(A.top, A.bot, 0.5);
  const centreB = path(B.top, B.bot, 0.5);
  const dur = 16;
  const back = Array.from({ length: BACK }, (_, i) => {
    const k = i / (BACK - 1);
    return { da: path(C.top, C.bot, k), db: path(D.top, D.bot, k), mid: 1 - Math.abs(k - 0.5) * 2 };
  });

  return (
    <div className="silk" aria-hidden="true">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" focusable="false">
        <defs>
          <linearGradient id={`silk-body-${id}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#D0F2F4" stopOpacity="0" />
            <stop offset=".18" stopColor="#A0E6E8" stopOpacity=".55" />
            <stop offset=".5" stopColor="#12C0C6" stopOpacity=".38" />
            <stop offset=".82" stopColor="#71D9DD" stopOpacity=".5" />
            <stop offset="1" stopColor="#D0F2F4" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`silk-thread-${id}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#BBBCBE" stopOpacity="0" />
            <stop offset=".12" stopColor="#9A9A9C" stopOpacity=".55" />
            <stop offset=".38" stopColor="#42CDD1" />
            <stop offset=".62" stopColor="#12C0C6" />
            <stop offset=".88" stopColor="#9A9A9C" stopOpacity=".55" />
            <stop offset="1" stopColor="#BBBCBE" stopOpacity="0" />
          </linearGradient>
          {/* the sheen: a white glint sliding across the silk */}
          <linearGradient id={`silk-sheen-${id}`} x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
            <stop offset=".45" stopColor="#FFFFFF" stopOpacity="0" />
            <stop offset=".5" stopColor="#FFFFFF" stopOpacity=".9" />
            <stop offset=".55" stopColor="#FFFFFF" stopOpacity="0" />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
            {reduce ? null : <animate attributeName="x1" values="-1;1" dur="9s" repeatCount="indefinite" />}
            {reduce ? null : <animate attributeName="x2" values="0;2" dur="9s" repeatCount="indefinite" />}
          </linearGradient>
          <linearGradient id={`silk-back-${id}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#DDDDDF" stopOpacity="0" />
            <stop offset=".2" stopColor="#BBBCBE" stopOpacity=".7" />
            <stop offset=".5" stopColor="#78797B" />
            <stop offset=".8" stopColor="#BBBCBE" stopOpacity=".7" />
            <stop offset="1" stopColor="#DDDDDF" stopOpacity="0" />
          </linearGradient>
          <filter id={`silk-glow-${id}`} x="-10%" y="-50%" width="120%" height="200%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        {/* the deeper ribbon behind */}
        {back.map((t, i) => (
          <path key={`b${i}`} d={t.da} fill="none" stroke={`url(#silk-back-${id})`} strokeWidth={0.5 + t.mid * 0.5} strokeOpacity={0.14 + t.mid * 0.28} vectorEffect="non-scaling-stroke" strokeLinecap="round">
            {reduce ? null : (
              <animate attributeName="d" values={`${t.da};${t.db};${t.da}`} dur="21s" begin={`${-(i * 0.25).toFixed(2)}s`} repeatCount="indefinite" calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1" />
            )}
          </path>
        ))}

        {/* the soft body of the silk */}
        <path d={bodyA} fill={`url(#silk-body-${id})`} opacity=".55">
          {reduce ? null : <animate attributeName="d" values={`${bodyA};${bodyB};${bodyA}`} dur={`${dur}s`} repeatCount="indefinite" calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1" />}
        </path>
        <path d={bodyA} fill={`url(#silk-sheen-${id})`} opacity=".55">
          {reduce ? null : <animate attributeName="d" values={`${bodyA};${bodyB};${bodyA}`} dur={`${dur}s`} repeatCount="indefinite" calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1" />}
        </path>

        {/* the threads */}
        {threads.map((t, i) => (
          <path key={i} d={t.da} fill="none" stroke={`url(#silk-thread-${id})`} strokeWidth={0.6 + t.mid * 0.9} strokeOpacity={0.28 + t.mid * 0.6} vectorEffect="non-scaling-stroke" strokeLinecap="round">
            {reduce ? null : (
              <animate attributeName="d" values={`${t.da};${t.db};${t.da}`} dur={`${dur}s`} begin={`${-(i * 0.18).toFixed(2)}s`} repeatCount="indefinite" calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1" />
            )}
          </path>
        ))}

        {/* one light travelling along the centre thread */}
        {reduce ? null : (
          <>
            <path d={centreA} fill="none" stroke="#12C0C6" strokeWidth="6" strokeLinecap="round" strokeDasharray="70 2400" filter={`url(#silk-glow-${id})`} opacity=".9" vectorEffect="non-scaling-stroke" pathLength="2470">
              <animate attributeName="d" values={`${centreA};${centreB};${centreA}`} dur={`${dur}s`} begin="-1.6s" repeatCount="indefinite" calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1" />
              <animate attributeName="stroke-dashoffset" values="70;-2400" dur="7s" repeatCount="indefinite" />
            </path>
            <path d={centreA} fill="none" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="40 2430" vectorEffect="non-scaling-stroke" pathLength="2470">
              <animate attributeName="d" values={`${centreA};${centreB};${centreA}`} dur={`${dur}s`} begin="-1.6s" repeatCount="indefinite" calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1" />
              <animate attributeName="stroke-dashoffset" values="55;-2415" dur="7s" repeatCount="indefinite" />
            </path>
          </>
        )}
      </svg>
    </div>
  );
}
