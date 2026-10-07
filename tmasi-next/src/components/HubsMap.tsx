"use client";

import Image from "next/image";
import Link from "next/link";
import { useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { asset } from "@/lib/asset";

// The map band of Global Operational Hubs, round 3 design B (approved on the design canvas, 2026-10-07).
// The whole world in the dark map style (desktop), and on phone the same map in a rounded frame centred on Europe
// and Africa (.work/tmasi-assets/render_whole.py writes the images and the positions below). White routes with
// small planes show guests flying in from every continent; everything outside our hubs only flies in (his rule).
// Pins and labels are real links, not baked into the picture. Labels are the live map's own words; the localized
// office names are in the cards under the map and in each pin's accessible name. His two lines sit on the map on
// desktop and right under it on phone.

type Key = "EGYPT" | "GERMANY" | "UAE" | "SPAIN" | "USA";
type Side = "right" | "left" | "up" | "down-left";
type Pt = [number, number];
type View = {
  src: string; w: number; h: number;
  /** Width of the drawing space for routes and planes, in px at the design size (height follows the image). */
  vw: number; speed: number; plane: number;
  pins: Record<Key, Pt>; side: Record<Key, Side>; cities: Record<string, Pt>; flows: [string, string][];
};

/** The live footer's office order: Egypt, Germany, UAE, Spain, USA. */
export const HUB_KEYS: Key[] = ["EGYPT", "GERMANY", "UAE", "SPAIN", "USA"];
const HUB_CITY: Record<string, Key> = { Hurghada: "EGYPT", Dubai: "UAE", Barcelona: "SPAIN", Munich: "GERMANY", Florida: "USA" };

// One or two flights per region of his list (2026-10-07): North America to Egypt; Europe to Egypt and UAE; UAE to
// Egypt and Spain; Europe to Spain; South America to Europe and Egypt; Asia to Egypt, Europe, Spain and America;
// Eastern Europe to Egypt; plus Sydney, so no continent is left out.
const FLIGHTS: [string, string][] = [
  ["New York", "Hurghada"], ["Los Angeles", "Hurghada"], ["London", "Hurghada"], ["Paris", "Dubai"],
  ["Dubai", "Hurghada"], ["Dubai", "Barcelona"], ["Stockholm", "Barcelona"], ["Sao Paulo", "Munich"],
  ["Bogota", "Hurghada"], ["Delhi", "Hurghada"], ["Beijing", "Munich"], ["Singapore", "Barcelona"],
  ["Tokyo", "Florida"], ["Warsaw", "Hurghada"], ["Sydney", "Hurghada"],
];
// Phone keeps nine of them, still one from every region.
const PHONE_FLIGHTS: [string, string][] = [
  ["New York", "Hurghada"], ["London", "Hurghada"], ["Paris", "Dubai"], ["Dubai", "Barcelona"], ["Sao Paulo", "Munich"],
  ["Delhi", "Hurghada"], ["Tokyo", "Florida"], ["Warsaw", "Hurghada"], ["Sydney", "Hurghada"],
];

const VIEWS: { desktop: View; phone: View } = {
  desktop: {
    src: "/img/hubs-world.webp", w: 2240, h: 1051, vw: 1120, speed: 70, plane: 0.95,
    pins: { USA: [24.48, 44.0], SPAIN: [48.9, 34.69], GERMANY: [51.6, 29.59], EGYPT: [57.99, 44.47], UAE: [64.16, 45.82] },
    side: { USA: "right", SPAIN: "left", GERMANY: "up", EGYPT: "down-left", UAE: "right" },
    cities: {
      "New York": [27.01, 35.19], "Los Angeles": [14.3, 39.89], London: [48.24, 26.9], Paris: [48.95, 29.02],
      Stockholm: [53.47, 20.19], "Sao Paulo": [34.88, 76.27], Bogota: [26.99, 58.7], Delhi: [70.46, 43.57],
      Beijing: [81.72, 35.77], Singapore: [78.11, 60.75], Tokyo: [88.42, 38.77], Warsaw: [54.31, 26.31], Sydney: [91.73, 83.14],
    },
    flows: FLIGHTS,
  },
  phone: {
    src: "/img/hubs-world-phone.webp", w: 1050, h: 868, vw: 350, speed: 34, plane: 0.78,
    pins: { USA: [2.0, 44.0], SPAIN: [45.02, 34.69], GERMANY: [49.79, 29.59], EGYPT: [61.04, 44.47], UAE: [71.91, 45.82] },
    side: { USA: "right", SPAIN: "left", GERMANY: "up", EGYPT: "down-left", UAE: "down-left" },
    cities: {
      "New York": [6.45, 35.19], London: [43.86, 26.9], Paris: [45.11, 29.03], "Sao Paulo": [20.31, 76.28],
      Delhi: [83.02, 43.58], Tokyo: [114.65, 38.77], Warsaw: [54.56, 26.31], Sydney: [120.49, 83.15],
    },
    flows: PHONE_FLIGHTS,
  },
};

const PLANE = "M7 0L3-1L-1-6L-3-6L-1-1L-5-1L-6.5-3L-7.5-3L-6.5 0L-7.5 3L-6.5 3L-5 1L-1 1L-3 6L-1 6L3 1Z";

/** Each flight bows upward like a flight path; planes keep one speed, so long flights take longer. The plane's
 *  motion is worked out once here as keyframes (even steps along the curve, nose along the route), so the browser
 *  can run it on the GPU without any work per frame. */
function routes(v: View) {
  const vh = (v.vw * v.h) / v.w;
  const at = (name: string): Pt => (name in HUB_CITY ? v.pins[HUB_CITY[name]] : v.cities[name]);
  return v.flows.map(([from, to], i) => {
    const [ax, ay] = at(from), [bx, by] = at(to);
    const x1 = (ax / 100) * v.vw, y1 = (ay / 100) * vh, x2 = (bx / 100) * v.vw, y2 = (by / 100) * vh;
    const d = Math.hypot(x2 - x1, y2 - y1);
    let nx = -(y2 - y1) / d, ny = (x2 - x1) / d;
    if (ny > 0) { nx = -nx; ny = -ny; }
    const cx = (x1 + x2) / 2 + nx * d * 0.24, cy = (y1 + y2) / 2 + ny * d * 0.24;
    const dur = Math.max(3, (d * 1.08) / v.speed);
    const pt = (t: number): Pt => [(1 - t) ** 2 * x1 + 2 * (1 - t) * t * cx + t * t * x2, (1 - t) ** 2 * y1 + 2 * (1 - t) * t * cy + t * t * y2];
    const N = 120, lens = [0];
    for (let k = 1; k <= N; k++) {
      const [ax2, ay2] = pt((k - 1) / N), [bx2, by2] = pt(k / N);
      lens.push(lens[k - 1] + Math.hypot(bx2 - ax2, by2 - ay2));
    }
    const tAt = (s: number) => {
      const target = s * lens[N];
      let j = 1;
      while (j < N && lens[j] < target) j++;
      return (j - 1 + (target - lens[j - 1]) / (lens[j] - lens[j - 1] || 1)) / N;
    };
    const frames: Keyframe[] = [];
    let last = 0;
    for (let k = 0; k <= 40; k++) {
      const s = k / 40, t = tAt(s), [x, y] = pt(t);
      let a = (Math.atan2(2 * (1 - t) * (cy - y1) + 2 * t * (y2 - cy), 2 * (1 - t) * (cx - x1) + 2 * t * (x2 - cx)) * 180) / Math.PI;
      if (k) { while (a - last > 180) a -= 360; while (a - last < -180) a += 360; }
      last = a;
      const op = s < 0.1 ? s / 0.1 : s > 0.86 ? (1 - s) / 0.14 : 1;
      frames.push({ offset: s, transform: `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${a.toFixed(1)}deg)`, opacity: +op.toFixed(3) });
    }
    return {
      path: `M${x1.toFixed(1)} ${y1.toFixed(1)}Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`,
      frames, durMs: dur * 1000, beginMs: -((i * 1.9) % dur) * 1000,
    };
  });
}
const ROUTES = { desktop: routes(VIEWS.desktop), phone: routes(VIEWS.phone) };

function Band({ view, kind, names, hrefs, active, setActive, fly, words }: {
  view: View; kind: "desktop" | "phone"; names: string[]; hrefs: string[];
  active: number | null; setActive: (i: number | null) => void; fly: boolean; words?: React.ReactNode;
}) {
  // The map fades in once it has loaded, so a fast scroll never shows it popping in.
  const [loaded, setLoaded] = useState(false);
  const rs = ROUTES[kind];
  const vh = (view.vw * view.h) / view.w;
  // The planes fly only while the band is on screen; off screen, or with reduced motion, they hold still on their
  // routes. The plane layer is drawn at the design size and scaled to the band, so a resize never restarts a flight.
  const layer = useRef<HTMLDivElement>(null);
  const anims = useRef<Animation[]>([]);
  useEffect(() => {
    const box = layer.current;
    const band = box?.parentElement;
    if (!box || !band) return;
    const fit = () => { box.style.transform = `scale(${band.clientWidth / view.vw})`; };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(band);
    if (typeof box.animate === "function") {
      anims.current = Array.from(box.children).map((el, i) =>
        el.animate(rs[i].frames, { duration: rs[i].durMs, delay: rs[i].beginMs, iterations: Infinity, easing: "linear" }));
    }
    return () => { ro.disconnect(); anims.current.forEach((a) => a.cancel()); anims.current = []; };
  }, [rs, view.vw]);
  useEffect(() => { anims.current.forEach((a) => (fly ? a.play() : a.pause())); }, [fly]);
  const sources = [...new Set(view.flows.map(([from]) => from).filter((c) => !(c in HUB_CITY)))]
    .map((c) => view.cities[c]).filter(([x, y]) => x >= 0 && x <= 100 && y >= 0 && y <= 100);

  return (
    <div className={`hubs-map hubs-map--${kind}`} style={{ aspectRatio: `${view.w} / ${view.h}` }}>
      <Image src={asset(view.src)} alt="" fill sizes={kind === "desktop" ? "(max-width: 1200px) 100vw, 1120px" : "100vw"}
        className={`hubs-map-img${loaded ? " is-loaded" : ""}`} onLoad={() => setLoaded(true)} />
      <svg className="hubs-map-arcs" viewBox={`0 0 ${view.vw} ${vh.toFixed(1)}`} preserveAspectRatio="none" aria-hidden="true">
        {rs.map((r, i) => (
          <g key={i}>
            <path d={r.path} className="hubs-route-halo" vectorEffect="non-scaling-stroke" />
            <path d={r.path} className="hubs-route" vectorEffect="non-scaling-stroke" />
          </g>
        ))}
      </svg>
      <div ref={layer} className="hubs-planes" style={{ width: view.vw, height: vh }} aria-hidden="true">
        {rs.map((_, i) => (
          <svg key={i} className="hubs-plane" viewBox="-9 -8 18 16" width={18 * view.plane} height={16 * view.plane}
            style={{ left: -9 * view.plane, top: -8 * view.plane }}>
            <path d={PLANE} />
          </svg>
        ))}
      </div>
      {sources.map(([x, y], i) => <span key={i} className="hubs-src" style={{ left: `${x}%`, top: `${y}%` }} />)}
      {HUB_KEYS.map((k, i) => {
        const [x, y] = view.pins[k];
        const label = <span className={`hubs-pin-label hubs-pin-label--${view.side[k]}`}>{k}</span>;
        const inner = (
          <>
            <span className="hubs-pin-ring" style={{ animationDelay: `${i * 0.4}s` }} />
            <span className={`hubs-pin-dot${k === "EGYPT" ? " hubs-pin-dot--hq" : ""}`} />
            {label}
          </>
        );
        const common = {
          className: `hubs-pin${active === i ? " is-active" : ""}`,
          style: { left: `${x}%`, top: `${y}%` },
          "aria-label": names[i],
          onMouseEnter: () => setActive(i), onMouseLeave: () => setActive(null),
          onFocus: () => setActive(i), onBlur: () => setActive(null),
        };
        return hrefs[i] ? <Link key={k} href={hrefs[i]} {...common}>{inner}</Link> : <span key={k} {...common}>{inner}</span>;
      })}
      {words}
    </div>
  );
}

export default function HubsMap({ names, hrefs, active, setActive, guests, care }: {
  names: string[]; hrefs: string[]; active: number | null; setActive: (i: number | null) => void;
  guests: string; care: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const live = useInView(ref, { amount: 0.35 });
  const reduce = useReducedMotion();
  const fly = live && !reduce;
  return (
    <div ref={ref} className={`hubs-maps${fly ? " is-live" : ""}`}>
      <Band view={VIEWS.desktop} kind="desktop" names={names} hrefs={hrefs} active={active} setActive={setActive} fly={fly}
        words={<p className="hubs-words"><strong>{guests}</strong><span>{care}</span></p>} />
      <Band view={VIEWS.phone} kind="phone" names={names} hrefs={hrefs} active={active} setActive={setActive} fly={fly} />
      <p className="hubs-words-phone"><strong>{guests}</strong><span>{care}</span></p>
      <style dangerouslySetInnerHTML={{__html: `
        .hubs-maps { margin: 0 0 clamp(28px, 3.4vw, 44px); }
        .hubs-map {
          position: relative; width: 100%; border-radius: var(--lx-radius-lg); overflow: hidden; background: #081133;
        }
        .hubs-map--phone { display: none; }
        @media (max-width: 700px) { .hubs-map--desktop { display: none; } .hubs-map--phone { display: block; } }
        .hubs-map-img { object-fit: cover; opacity: 0; transition: opacity .6s ease; }
        .hubs-map-img.is-loaded { opacity: 1; }
        .hubs-map-arcs { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
        /* White routes like the flowing lines in his "International Network" picture, a soft glow under each. */
        .hubs-route-halo { fill: none; stroke: rgba(191,246,247,0.14); stroke-width: 4; stroke-linecap: round; }
        .hubs-route { fill: none; stroke: rgba(255,255,255,0.62); stroke-width: 1.2; stroke-linecap: round; }
        .hubs-map--phone .hubs-route-halo { stroke-width: 3; }
        .hubs-map--phone .hubs-route { stroke: rgba(255,255,255,0.85); }
        /* Each plane is its own GPU layer moved by transform and opacity only, so flying costs no work per frame. */
        .hubs-planes { position: absolute; left: 0; top: 0; transform-origin: 0 0; pointer-events: none; }
        .hubs-plane { position: absolute; overflow: visible; opacity: 0; transform-origin: 50% 50%; will-change: transform, opacity; }
        .hubs-plane path { fill: #ffffff; filter: drop-shadow(0 0 3px rgba(191,246,247,0.95)); }
        /* Where the guests set off from. */
        .hubs-src {
          position: absolute; width: 6px; height: 6px; border-radius: 50%; background: #ffffff; transform: translate(-50%, -50%);
          box-shadow: 0 0 6px 2px rgba(191,246,247,0.9), 0 0 16px 5px rgba(127,224,225,0.35); pointer-events: none;
        }

        /* Each pin is a 44px tap area on its city. */
        .hubs-pin {
          position: absolute; width: 44px; height: 44px; transform: translate(-50%, -50%);
          display: block; text-decoration: none; color: #ffffff; z-index: 1;
        }
        .hubs-pin:focus-visible { outline: 2px solid #7FE0E1; outline-offset: 2px; border-radius: 50%; }
        .hubs-pin-dot {
          position: absolute; left: 50%; top: 50%; width: 11px; height: 11px; border-radius: 50%;
          transform: translate(-50%, -50%); transition: transform .25s cubic-bezier(0.22, 1, 0.36, 1);
          background: radial-gradient(circle, #ffffff 0 30%, #7FE0E1 34% 100%); box-shadow: 0 0 14px 4px rgba(127,224,225,0.65);
        }
        .hubs-pin-dot--hq { width: 14px; height: 14px; }
        .hubs-pin-ring {
          position: absolute; left: 50%; top: 50%; width: 13px; height: 13px; border-radius: 50%;
          border: 2px solid #7FE0E1; transform: translate(-50%, -50%); opacity: 0;
        }
        .is-live .hubs-pin-ring { animation: hubs-pulse 2.6s cubic-bezier(0.22, 1, 0.36, 1) infinite; }
        @keyframes hubs-pulse { 0% { transform: translate(-50%, -50%) scale(1); opacity: 0.7; } 100% { transform: translate(-50%, -50%) scale(3.2); opacity: 0; } }
        .hubs-pin-label {
          position: absolute; white-space: nowrap; padding: 5px 11px; border-radius: 999px;
          background: rgba(8,17,51,0.66); border: 1px solid rgba(127,224,225,0.4); color: #ffffff;
          font-family: var(--font-display); font-size: clamp(13px, 1.4vw, 16px); line-height: 1; letter-spacing: 0.05em;
          transition: background-color .25s ease, border-color .25s ease;
        }
        .hubs-pin-label--right { left: 34px; top: 50%; transform: translateY(-50%); }
        .hubs-pin-label--left { right: 34px; top: 50%; transform: translateY(-50%); }
        .hubs-pin-label--up { left: 50%; bottom: 34px; transform: translateX(-50%); }
        .hubs-pin-label--down-left { right: 30px; top: 30px; }
        .hubs-pin.is-active .hubs-pin-dot { transform: translate(-50%, -50%) scale(1.45); }
        .hubs-pin.is-active .hubs-pin-label { background: rgba(0,154,156,0.85); border-color: #7FE0E1; }
        @media (hover: hover) and (pointer: fine) {
          .hubs-pin:hover .hubs-pin-dot { transform: translate(-50%, -50%) scale(1.45); }
          .hubs-pin:hover .hubs-pin-label { background: rgba(0,154,156,0.85); border-color: #7FE0E1; }
        }

        /* His two lines: a glass card on the desktop map, right under the map on phone. */
        .hubs-words {
          position: absolute; left: clamp(14px, 2.1%, 24px); top: clamp(14px, 4.2%, 22px); z-index: 2; margin: 0; max-width: 46%;
          padding: 12px 22px 13px; border-radius: 14px; background: rgba(8,17,51,0.62); border: 1px solid rgba(127,224,225,0.42);
          -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px);
        }
        .hubs-words strong {
          display: block; font-family: var(--font-display); font-weight: 400; font-size: clamp(18px, 2.1vw, 24px);
          line-height: 1; letter-spacing: 0.06em; text-transform: uppercase; color: #ffffff;
        }
        .hubs-words span { display: block; margin-top: 6px; font-size: clamp(12px, 1.25vw, 14px); font-weight: 500; line-height: 1.35; color: rgba(255,255,255,0.86); }
        .hubs-words-phone { display: none; margin: 18px 0 0; text-align: center; }
        .hubs-words-phone strong {
          display: block; font-family: var(--font-display); font-weight: 400; font-size: 24px; line-height: 1.1;
          letter-spacing: 0.05em; text-transform: uppercase; color: var(--lx-ink);
        }
        .hubs-words-phone span { display: block; margin-top: 6px; font-size: 15px; line-height: 1.55; color: var(--lx-body); text-wrap: balance; }

        @media (max-width: 700px) {
          .hubs-words-phone { display: block; }
          .hubs-pin-label { font-size: 13px; padding: 4px 10px; }
          .hubs-pin-label--right { left: 32px; } .hubs-pin-label--left { right: 32px; }
          .hubs-pin-label--up { bottom: 34px; } .hubs-pin-label--down-left { right: 30px; top: 27px; }
          .hubs-pin-dot { width: 12px; height: 12px; } .hubs-pin-dot--hq { width: 16px; height: 16px; }
          .hubs-pin-ring { width: 14px; height: 14px; }
        }
        @media (prefers-reduced-motion: reduce) { .hubs-pin-ring { animation: none !important; } }
      `}} />
    </div>
  );
}
