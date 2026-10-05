"use client";

import Image from "next/image";
import Link from "next/link";
import { useInView, useReducedMotion } from "framer-motion";
import { useRef, useState } from "react";
import { asset } from "@/lib/asset";

// The map band of Global Operational Hubs (approved on the design canvas, 2026-09-30, design A). The map is
// the live site's dark world map, redrawn from Natural Earth data so every pin sits on its real city
// (.work/tmasi-assets/render_band.py writes the images and the pin positions below). Pins and labels are real
// links, not baked into the picture. Labels are the live map's own words (USA, SPAIN, GERMANY, EGYPT, UAE);
// the localized office names are in the cards under the map and in each pin's accessible name.

type Key = "EGYPT" | "GERMANY" | "UAE" | "SPAIN" | "USA";
type Side = "right" | "left" | "up" | "down-left";
type View = { src: string; w: number; h: number; pins: Record<Key, [number, number]>; side: Record<Key, Side> };

/** The live footer's office order: Egypt, Germany, UAE, Spain, USA. */
export const HUB_KEYS: Key[] = ["EGYPT", "GERMANY", "UAE", "SPAIN", "USA"];

const VIEWS: { desktop: View; phone: View } = {
  desktop: {
    src: "/img/hubs-map.webp", w: 2240, h: 760,
    pins: { USA: [18.83, 60.94], SPAIN: [54.24, 42.28], GERMANY: [58.16, 32.05], EGYPT: [67.42, 61.88], UAE: [76.36, 64.59] },
    side: { USA: "right", SPAIN: "left", GERMANY: "up", EGYPT: "down-left", UAE: "right" },
  },
  phone: {
    src: "/img/hubs-map-phone.webp", w: 780, h: 640,
    pins: { USA: [11.91, 53.78], SPAIN: [59.65, 43.38], GERMANY: [64.93, 37.67], EGYPT: [77.42, 54.31], UAE: [89.48, 55.82] },
    side: { USA: "right", SPAIN: "left", GERMANY: "up", EGYPT: "left", UAE: "down-left" },
  },
};

/** Curved links from the head office in Hurghada out to the other four hubs. */
function arcs(v: View) {
  const [ex, ey] = v.pins.EGYPT;
  const X = (p: number) => (p / 100) * v.w;
  const Y = (p: number) => (p / 100) * v.h;
  return (["USA", "SPAIN", "GERMANY", "UAE"] as Key[]).map((k) => {
    const [px, py] = v.pins[k];
    const x1 = X(ex), y1 = Y(ey), x2 = X(px), y2 = Y(py);
    const dist = Math.hypot(x2 - x1, y2 - y1);
    const cx = (x1 + x2) / 2, cy = Math.min(y1, y2) - dist * 0.32;
    return `M${x1.toFixed(1)} ${y1.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
  });
}

function Band({ view, kind, names, hrefs, active, setActive }: {
  view: View; kind: "desktop" | "phone"; names: string[]; hrefs: string[];
  active: number | null; setActive: (i: number | null) => void;
}) {
  // The map fades in once it has loaded, so a fast scroll never shows it popping in.
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={`hubs-map hubs-map--${kind}`} style={{ aspectRatio: `${view.w} / ${view.h}` }}>
      <Image src={asset(view.src)} alt="" fill sizes={kind === "desktop" ? "(max-width: 1200px) 100vw, 1120px" : "100vw"}
        className={`hubs-map-img${loaded ? " is-loaded" : ""}`} onLoad={() => setLoaded(true)} />
      <svg className="hubs-map-arcs" viewBox={`0 0 ${view.w} ${view.h}`} preserveAspectRatio="none" aria-hidden="true">
        {arcs(view).map((d, i) => (
          <g key={i}>
            <path d={d} className="hubs-arc" vectorEffect="non-scaling-stroke" />
            <path d={d} className="hubs-arc-pulse" pathLength={100} vectorEffect="non-scaling-stroke" style={{ animationDelay: `${i * 0.55}s` }} />
          </g>
        ))}
      </svg>
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
    </div>
  );
}

export default function HubsMap({ names, hrefs, active, setActive }: {
  names: string[]; hrefs: string[]; active: number | null; setActive: (i: number | null) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const live = useInView(ref, { amount: 0.35 });
  const reduce = useReducedMotion();
  return (
    <div ref={ref} className={`hubs-maps${live && !reduce ? " is-live" : ""}`}>
      <Band view={VIEWS.desktop} kind="desktop" names={names} hrefs={hrefs} active={active} setActive={setActive} />
      <Band view={VIEWS.phone} kind="phone" names={names} hrefs={hrefs} active={active} setActive={setActive} />
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
        .hubs-arc { fill: none; stroke: rgba(127,224,225,0.35); stroke-width: 1.5; }
        .hubs-arc-pulse {
          fill: none; stroke: #BFF6F7; stroke-width: 2.6; stroke-linecap: round; stroke-dasharray: 6 94; stroke-dashoffset: 100;
          filter: drop-shadow(0 0 4px rgba(127,224,225,0.9)); opacity: 0;
        }
        /* The links run only while the band is on screen. */
        .is-live .hubs-arc-pulse { animation: hubs-arc 3.2s cubic-bezier(0.45, 0, 0.2, 1) infinite; }
        @keyframes hubs-arc { 0% { stroke-dashoffset: 100; opacity: 0; } 8% { opacity: 1; } 85% { opacity: 1; } 100% { stroke-dashoffset: 0; opacity: 0; } }

        /* Each pin is a 44px tap area on its city. */
        .hubs-pin {
          position: absolute; width: 44px; height: 44px; transform: translate(-50%, -50%);
          display: block; text-decoration: none; color: #ffffff; z-index: 1;
        }
        .hubs-pin:focus-visible { outline: 2px solid #7FE0E1; outline-offset: 2px; border-radius: 50%; }
        .hubs-pin-dot {
          position: absolute; left: 50%; top: 50%; width: 12px; height: 12px; border-radius: 50%;
          transform: translate(-50%, -50%); transition: transform .25s cubic-bezier(0.22, 1, 0.36, 1);
          background: radial-gradient(circle, #ffffff 0 30%, #7FE0E1 34% 100%); box-shadow: 0 0 14px 4px rgba(127,224,225,0.65);
        }
        .hubs-pin-dot--hq { width: 16px; height: 16px; }
        .hubs-pin-ring {
          position: absolute; left: 50%; top: 50%; width: 14px; height: 14px; border-radius: 50%;
          border: 2px solid #7FE0E1; transform: translate(-50%, -50%); opacity: 0;
        }
        .is-live .hubs-pin-ring { animation: hubs-pulse 2.6s cubic-bezier(0.22, 1, 0.36, 1) infinite; }
        @keyframes hubs-pulse { 0% { transform: translate(-50%, -50%) scale(1); opacity: 0.7; } 100% { transform: translate(-50%, -50%) scale(3.2); opacity: 0; } }
        .hubs-pin-label {
          position: absolute; white-space: nowrap; padding: 6px 12px; border-radius: 999px;
          background: rgba(8,17,51,0.62); border: 1px solid rgba(127,224,225,0.4); color: #ffffff;
          font-family: var(--font-display); font-size: clamp(15px, 1.5vw, 20px); line-height: 1; letter-spacing: 0.05em;
          transition: background-color .25s ease, border-color .25s ease;
        }
        .hubs-pin-label--right { left: 34px; top: 50%; transform: translateY(-50%); }
        .hubs-pin-label--left { right: 34px; top: 50%; transform: translateY(-50%); }
        .hubs-pin-label--up { left: 50%; bottom: 34px; transform: translateX(-50%); }
        .hubs-pin-label--down-left { right: 28px; top: 30px; }
        .hubs-pin.is-active .hubs-pin-dot { transform: translate(-50%, -50%) scale(1.45); }
        .hubs-pin.is-active .hubs-pin-label { background: rgba(0,154,156,0.85); border-color: #7FE0E1; }
        @media (hover: hover) and (pointer: fine) {
          .hubs-pin:hover .hubs-pin-dot { transform: translate(-50%, -50%) scale(1.45); }
          .hubs-pin:hover .hubs-pin-label { background: rgba(0,154,156,0.85); border-color: #7FE0E1; }
        }
        @media (max-width: 700px) {
          .hubs-pin-label { font-size: 13px; padding: 4px 9px; }
          .hubs-pin-label--right { left: 28px; } .hubs-pin-label--left { right: 28px; }
          .hubs-pin-label--up { bottom: 26px; } .hubs-pin-label--down-left { right: 20px; top: 26px; }
          .hubs-pin-dot { width: 10px; height: 10px; } .hubs-pin-dot--hq { width: 13px; height: 13px; }
        }
        @media (prefers-reduced-motion: reduce) { .hubs-arc-pulse, .hubs-pin-ring { animation: none !important; } }
      `}} />
    </div>
  );
}
