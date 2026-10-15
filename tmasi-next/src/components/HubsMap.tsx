"use client";

import Image from "next/image";
import Link from "next/link";
import { useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { asset } from "@/lib/asset";
import { MARITIME, type MaritimeView } from "@/lib/maritime-data";
import { MARITIME_CARDS, MAP_THEME_WORDS } from "@/content/maritime";

// The map band of Global Operational Hubs, round 3 design B (approved on the design canvas, 2026-10-07).
// The whole world in the dark map style (desktop), and on phone the same map in a rounded frame centred on Europe
// and Africa (.work/tmasi-assets/render_whole.py writes the images and the positions below). White routes with
// small planes show guests flying in from every continent; everything outside our hubs only flies in (his rule).
// Pins and labels are real links, not baked into the picture. Labels are the live map's own words; the localized
// office names are in the cards under the map and in each pin's accessible name. His two lines sit on the map on
// desktop and right under it on phone.
//
// Maritime layer and light theme (spec 011, approved on the design canvas 2026-10-11, round 2, phone pick B), from his
// "TMASI Global Maritime Footprint" image without Adriatic/Balkans: cruise ships on dotted sea routes, gold office
// pins, a card per office, blue cross Medical Network pins, ocean names, the key, and a Light/Dark switch (dark first,
// the pick remembered). From 1280px the cards and the key float over the map's edge; below that the cards sit in a
// swipe row riding over the map's bottom edge. Sea routes come from .work/tmasi-assets/render_light.py.

type Key = "EGYPT" | "GERMANY" | "UAE" | "SPAIN" | "USA";
type Side = "right" | "left" | "up" | "down-left";
type Theme = "dark" | "light";
type Pt = [number, number];
type View = {
  src: string; light: string; w: number; h: number;
  /** Width of the drawing space for routes and planes, in px at the design size (height follows the image). */
  vw: number; speed: number; plane: number; ship: number; shipSize: number; mar: MaritimeView;
  pins: Record<Key, Pt>; side: Record<Key, Side>; cities: Record<string, Pt>; flows: [string, string][];
};

/** The live footer's office order: Egypt, Germany, UAE, Spain, USA. */
export const HUB_KEYS: Key[] = ["EGYPT", "GERMANY", "UAE", "SPAIN", "USA"];
const HUB_CITY: Record<string, Key> = { Hurghada: "EGYPT", Dubai: "UAE", Barcelona: "SPAIN", Munich: "GERMANY", Florida: "USA" };
const THEME_KEY = "tmasi-map-theme";

// One or two flights per region of his list (2026-10-07): North America to Egypt; Europe to Egypt and UAE; UAE to
// Egypt and Spain; Europe to Spain; South America to Europe and Egypt; Asia to Egypt, Europe, Spain and America;
// Eastern Europe to Egypt; plus Sydney, so no continent is left out. 2026-10-11: UAE to South Africa (his ask) and
// Florida to Spain (his image).
const FLIGHTS: [string, string][] = [
  ["New York", "Hurghada"], ["Los Angeles", "Hurghada"], ["London", "Hurghada"], ["Paris", "Dubai"],
  ["Dubai", "Hurghada"], ["Dubai", "Barcelona"], ["Stockholm", "Barcelona"], ["Sao Paulo", "Munich"],
  ["Bogota", "Hurghada"], ["Delhi", "Hurghada"], ["Beijing", "Munich"], ["Singapore", "Barcelona"],
  ["Tokyo", "Florida"], ["Warsaw", "Hurghada"], ["Sydney", "Hurghada"], ["Dubai", "Johannesburg"], ["Florida", "Barcelona"],
];
// Phone keeps eleven of them, still one from every region.
const PHONE_FLIGHTS: [string, string][] = [
  ["New York", "Hurghada"], ["London", "Hurghada"], ["Paris", "Dubai"], ["Dubai", "Barcelona"], ["Sao Paulo", "Munich"],
  ["Delhi", "Hurghada"], ["Tokyo", "Florida"], ["Warsaw", "Hurghada"], ["Sydney", "Hurghada"],
  ["Dubai", "Johannesburg"], ["Florida", "Barcelona"],
];

const VIEWS: { desktop: View; phone: View } = {
  desktop: {
    src: "/img/hubs-world.webp", light: "/img/hubs-world-light.webp", w: 2240, h: 1051, vw: 1120, speed: 70, plane: 0.95,
    ship: 8.4, shipSize: 1, mar: MARITIME.desktop,
    pins: { USA: [24.48, 44.0], SPAIN: [48.9, 34.69], GERMANY: [51.6, 29.59], EGYPT: [57.99, 44.47], UAE: [64.16, 45.82] },
    side: { USA: "right", SPAIN: "left", GERMANY: "up", EGYPT: "down-left", UAE: "right" },
    cities: {
      "New York": [27.01, 35.19], "Los Angeles": [14.3, 39.89], London: [48.24, 26.9], Paris: [48.95, 29.02],
      Stockholm: [53.47, 20.19], "Sao Paulo": [34.88, 76.27], Bogota: [26.99, 58.7], Delhi: [70.46, 43.57],
      Beijing: [81.72, 35.77], Singapore: [78.11, 60.75], Tokyo: [88.42, 38.77], Warsaw: [54.31, 26.31], Sydney: [91.73, 83.14],
      Johannesburg: MARITIME.desktop.johannesburg,
    },
    flows: FLIGHTS,
  },
  phone: {
    src: "/img/hubs-world-phone.webp", light: "/img/hubs-world-phone-light.webp", w: 1050, h: 868, vw: 350, speed: 34, plane: 0.78,
    ship: 4, shipSize: 0.72, mar: MARITIME.phone,
    pins: { USA: [2.0, 44.0], SPAIN: [45.02, 34.69], GERMANY: [49.79, 29.59], EGYPT: [61.04, 44.47], UAE: [71.91, 45.82] },
    side: { USA: "right", SPAIN: "left", GERMANY: "up", EGYPT: "down-left", UAE: "down-left" },
    cities: {
      "New York": [6.45, 35.19], London: [43.86, 26.9], Paris: [45.11, 29.03], "Sao Paulo": [20.31, 76.28],
      Delhi: [83.02, 43.58], Tokyo: [114.65, 38.77], Warsaw: [54.56, 26.31], Sydney: [120.49, 83.15],
      Johannesburg: MARITIME.phone.johannesburg,
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

/** Cruise routes: dotted lines through his sea waypoints, and ships sailing them slower than the planes. Ships stay
 *  upright (no turning), move in even steps along the line, and fade in and out at the ports. Same GPU-only method. */
function seaRoutes(v: View) {
  const vh = (v.vw * v.h) / v.w;
  const toPx = ([x, y]: Pt): Pt => [(x / 100) * v.vw, (y / 100) * vh];
  const lines: string[] = [];
  const ships: { frames: Keyframe[]; durMs: number; beginMs: number }[] = [];
  v.mar.sea.forEach((r, i) => {
    const pts = r.pts.map(toPx);
    lines.push("M" + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join("L"));
    const lens = [0];
    for (let k = 1; k < pts.length; k++) lens.push(lens[k - 1] + Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]));
    const L = lens[lens.length - 1];
    const at = (s: number): Pt => {
      const target = s * L;
      let j = 1;
      while (j < pts.length - 1 && lens[j] < target) j++;
      const f = (target - lens[j - 1]) / (lens[j] - lens[j - 1] || 1);
      return [pts[j - 1][0] + (pts[j][0] - pts[j - 1][0]) * f, pts[j - 1][1] + (pts[j][1] - pts[j - 1][1]) * f];
    };
    const frames: Keyframe[] = [];
    for (let k = 0; k <= 60; k++) {
      const s = k / 60, [x, y] = at(s);
      const op = s < 0.07 ? s / 0.07 : s > 0.92 ? (1 - s) / 0.08 : 1;
      frames.push({ offset: s, transform: `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`, opacity: +op.toFixed(3) });
    }
    const dur = Math.max(14, L / v.ship);
    for (let s = 0; s < r.ships; s++) {
      ships.push({ frames, durMs: dur * 1000, beginMs: -dur * 1000 * (((0.2 + 0.31 * i) + s / r.ships) % 1) });
    }
  });
  const regional = v.mar.regional.map((pts) => "M" + pts.map(toPx).map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join("L"));
  return { lines, ships, regional };
}

const ROUTES = { desktop: routes(VIEWS.desktop), phone: routes(VIEWS.phone) };
const SEA = { desktop: seaRoutes(VIEWS.desktop), phone: seaRoutes(VIEWS.phone) };

// Hairline icons, one family: the gold office pin, the medical cross, the cruise ship, the regional dash.
function PinIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size * 1.3} viewBox="0 0 20 26" aria-hidden="true" className="mm-pin-icon">
      <path d="M10 1C5 1 1.5 4.7 1.5 9.3c0 6 8.5 15.2 8.5 15.2s8.5-9.2 8.5-15.2C18.5 4.7 15 1 10 1z" fill="#C9973A" stroke="#8A611F" strokeWidth="0.8" />
      <circle cx="10" cy="9.4" r="3.4" fill="#ffffff" />
    </svg>
  );
}
function CrossIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true">
      <circle cx="10" cy="10" r="9" fill="#1F5FAE" stroke="#ffffff" strokeWidth="1.6" />
      <path d="M10 5.6v8.8M5.6 10h8.8" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}
function ShipIcon({ w = 26 }: { w?: number }) {
  return (
    <svg width={w} height={(w * 18) / 26} viewBox="0 0 26 18" aria-hidden="true">
      <path d="M2 11h22l-3.2 5H5.4z" fill="#ffffff" stroke="#0F205C" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M5 11V8h13l3 3" fill="#ffffff" stroke="#0F205C" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M8 8V5.6h7V8" fill="#ffffff" stroke="#0F205C" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M11.5 5.6V3.2" fill="none" stroke="#0F205C" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="9" cy="13.4" r="0.8" fill="#007AB5" /><circle cx="13" cy="13.4" r="0.8" fill="#007AB5" /><circle cx="17" cy="13.4" r="0.8" fill="#007AB5" />
    </svg>
  );
}

/** One office card, his image's words. */
function OfficeCard({ i, active, setActive, className, style }: {
  i: number; active: number | null; setActive: (i: number | null) => void; className: string; style?: React.CSSProperties;
}) {
  const c = MARITIME_CARDS[i];
  return (
    <article className={`${className}${active === i ? " is-active" : ""}`} style={style} lang="en"
      onMouseEnter={() => setActive(i)} onMouseLeave={() => setActive(null)}>
      <p className="mm-card-name"><PinIcon size={15} />{c.name}</p>
      {c.sub && <p className="mm-card-sub">{c.sub}</p>}
      <p className="mm-card-text">{c.text}</p>
    </article>
  );
}

// From 1280px each card floats over the map's edge, anchored by the edge its leader line meets (design canvas,
// round 2): the line from the pin ends on the card wherever the band's width lands. Leader ends in % of the band.
const CARD_SPOT: Record<Key, { style: React.CSSProperties; lead: [Pt, Pt] }> = {
  EGYPT: { style: { left: "40.8%", top: "51.9%", width: 212 }, lead: [[57.5, 45.1], [54.33, 51.86]] },
  GERMANY: { style: { left: "51%", bottom: "91.5%", width: 204 }, lead: [[51.58, 25.2], [54.33, 8.53]] },
  UAE: { style: { left: "62.3%", top: "53.3%", width: 196 }, lead: [[64.42, 46.5], [66.67, 53.29]] },
  SPAIN: { style: { right: "52.33%", top: "15.6%", width: 204 }, lead: [[48.5, 33.75], [47.67, 28.42]] },
  USA: { style: { right: "85%", top: "34.8%", width: 228 }, lead: [[23.83, 44.4], [15, 44.4]] },
};

function Band({ view, kind, names, hrefs, active, setActive, fly, words, lightOn, theme }: {
  view: View; kind: "desktop" | "phone"; names: string[]; hrefs: string[];
  active: number | null; setActive: (i: number | null) => void; fly: boolean; words?: React.ReactNode;
  lightOn: boolean; theme: Theme;
}) {
  // The map fades in once it has loaded, so a fast scroll never shows it popping in. The light picture is only
  // fetched once a visitor picks Light, and fades in over the dark one.
  const [loaded, setLoaded] = useState(false);
  const [lightLoaded, setLightLoaded] = useState(false);
  const rs = ROUTES[kind];
  const sea = SEA[kind];
  const vh = (view.vw * view.h) / view.w;
  // Planes and ships move only while the band is on screen; off screen, or with reduced motion, they hold still on
  // their routes. The layer is drawn at the design size and scaled to the band, so a resize never restarts a trip.
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
      const planes = Array.from(box.querySelectorAll<HTMLElement | SVGElement>("[data-plane]")).map((el, i) =>
        el.animate(rs[i].frames, { duration: rs[i].durMs, delay: rs[i].beginMs, iterations: Infinity, easing: "linear" }));
      const ships = Array.from(box.querySelectorAll<HTMLElement>("[data-ship]")).map((el, i) =>
        el.animate(sea.ships[i].frames, { duration: sea.ships[i].durMs, delay: sea.ships[i].beginMs, iterations: Infinity, easing: "linear" }));
      anims.current = [...planes, ...ships];
    }
    return () => { ro.disconnect(); anims.current.forEach((a) => a.cancel()); anims.current = []; };
  }, [rs, sea, view.vw]);
  useEffect(() => { anims.current.forEach((a) => (fly ? a.play() : a.pause())); }, [fly]);
  const sources = [...new Set(view.flows.map(([from]) => from).filter((c) => !(c in HUB_CITY)))]
    .map((c) => view.cities[c]).filter(([x, y]) => x >= 0 && x <= 100 && y >= 0 && y <= 100);
  const ship = 26 * view.shipSize;

  return (
    <div className={`hubs-map hubs-map--${kind}`} style={{ aspectRatio: `${view.w} / ${view.h}` }}>
      <div className="hubs-clip">
        <Image src={asset(view.src)} alt="" fill sizes={kind === "desktop" ? "(max-width: 1200px) 100vw, 1120px" : "100vw"}
          className={`hubs-map-img${loaded ? " is-loaded" : ""}`} onLoad={() => setLoaded(true)} />
        {lightOn && (
          <Image src={asset(view.light)} alt="" fill sizes={kind === "desktop" ? "(max-width: 1200px) 100vw, 1120px" : "100vw"}
            className={`hubs-map-img hubs-map-img--light${lightLoaded && theme === "light" ? " is-loaded" : ""}`} onLoad={() => setLightLoaded(true)} />
        )}
        <svg className="hubs-map-arcs" viewBox={`0 0 ${view.vw} ${vh.toFixed(1)}`} preserveAspectRatio="none" aria-hidden="true">
          {sea.regional.map((d, i) => <path key={`r${i}`} d={d} className="hubs-reg" vectorEffect="non-scaling-stroke" />)}
          {rs.map((r, i) => (
            <g key={i}>
              <path d={r.path} className="hubs-route-halo" vectorEffect="non-scaling-stroke" />
              <path d={r.path} className="hubs-route" vectorEffect="non-scaling-stroke" />
            </g>
          ))}
          {sea.lines.map((d, i) => (
            <g key={`s${i}`}>
              <path d={d} className="hubs-sea-under" vectorEffect="non-scaling-stroke" />
              <path d={d} className="hubs-sea" vectorEffect="non-scaling-stroke" />
            </g>
          ))}
        </svg>
        <div ref={layer} className="hubs-planes" style={{ width: view.vw, height: vh }} aria-hidden="true">
          {rs.map((_, i) => (
            <svg key={i} data-plane="" className="hubs-plane" viewBox="-9 -8 18 16" width={18 * view.plane} height={16 * view.plane}
              style={{ left: -9 * view.plane, top: -8 * view.plane }}>
              <path d={PLANE} />
            </svg>
          ))}
          {sea.ships.map((_, i) => (
            <div key={`ship${i}`} data-ship="" className="hubs-ship" style={{ left: -ship / 2, top: (-ship * 18) / 26 / 2 }}>
              <ShipIcon w={ship} />
            </div>
          ))}
        </div>
        {sources.map(([x, y], i) => <span key={i} className="hubs-src" style={{ left: `${x}%`, top: `${y}%` }} />)}
        {view.mar.oceans.map((o) => (
          <span key={o.name} className={`hubs-ocean hubs-ocean--${o.tone}`} style={{ left: `${o.x}%`, top: `${o.y}%` }} aria-hidden="true" lang="en">
            {o.name.split(" ")[0]}<br />{o.name.split(" ")[1]}
          </span>
        ))}
        {view.mar.medical.map(([x, y], i) => (
          <span key={`m${i}`} className="hubs-cross" style={{ left: `${x}%`, top: `${y}%` }} aria-hidden="true"><CrossIcon size={kind === "desktop" ? 18 : 13} /></span>
        ))}
        {HUB_KEYS.map((k, i) => {
          const [x, y] = view.pins[k];
          const label = <span className={`hubs-pin-label hubs-pin-label--${view.side[k]}`}>{k}</span>;
          const inner = (
            <>
              <span className="hubs-pin-ring" style={{ animationDelay: `${i * 0.4}s` }} />
              <span className="hubs-pin-mark"><PinIcon size={kind === "desktop" ? 18 : 15} /></span>
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
      {words}
      {kind === "desktop" && (
        <>
          <svg className="mm-leads" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {HUB_KEYS.map((k) => {
              const [[x1, y1], [x2, y2]] = CARD_SPOT[k].lead;
              return <path key={k} d={`M${x1} ${y1}L${x2} ${y2}`} className="mm-lead" vectorEffect="non-scaling-stroke" />;
            })}
          </svg>
          {HUB_KEYS.map((k) => {
            const [, [x, y]] = CARD_SPOT[k].lead;
            return <span key={k} className="mm-lead-dot" style={{ left: `${x}%`, top: `${y}%` }} aria-hidden="true" />;
          })}
          {HUB_KEYS.map((k, i) => (
            <OfficeCard key={k} i={i} active={active} setActive={setActive} className="mm-card mm-card--float" style={CARD_SPOT[k].style} />
          ))}
        </>
      )}
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
  // Dark first (the approved look); a visitor's pick is remembered on their device. Storage can be blocked, so the
  // switch still works for the visit when it is.
  const [theme, setTheme] = useState<Theme>("dark");
  const [lightOn, setLightOn] = useState(false);
  useEffect(() => {
    try {
      if (window.localStorage.getItem(THEME_KEY) === "light") { setTheme("light"); setLightOn(true); }
    } catch { /* storage blocked: stay dark */ }
  }, []);
  const choose = (t: Theme) => {
    setTheme(t);
    if (t === "light") setLightOn(true);
    try { window.localStorage.setItem(THEME_KEY, t); } catch { /* storage blocked: this visit only */ }
  };
  // The card row under the map (below 1280px): the dots follow the swipe.
  const row = useRef<HTMLDivElement>(null);
  const [slide, setSlide] = useState(0);
  const onRowScroll = () => {
    const el = row.current;
    const first = el?.firstElementChild as HTMLElement | null;
    if (!el || !first) return;
    setSlide(Math.max(0, Math.min(MARITIME_CARDS.length - 1, Math.round(el.scrollLeft / (first.offsetWidth + 12)))));
  };

  return (
    <div ref={ref} className={`hubs-maps${fly ? " is-live" : ""}`} data-theme={theme}>
      <div className="mm-switch-row">
        <div className="mm-switch" role="group" aria-label={MAP_THEME_WORDS.group} lang="en">
          <button type="button" className={`mm-sw${theme === "dark" ? " is-on" : ""}`} aria-pressed={theme === "dark"} onClick={() => choose("dark")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z" /></svg>
            {MAP_THEME_WORDS.dark}
          </button>
          <button type="button" className={`mm-sw${theme === "light" ? " is-on" : ""}`} aria-pressed={theme === "light"} onClick={() => choose("light")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" /></svg>
            {MAP_THEME_WORDS.light}
          </button>
        </div>
      </div>
      <Band view={VIEWS.desktop} kind="desktop" names={names} hrefs={hrefs} active={active} setActive={setActive} fly={fly}
        lightOn={lightOn} theme={theme} words={<p className="hubs-words"><strong>{guests}</strong><span>{care}</span></p>} />
      <Band view={VIEWS.phone} kind="phone" names={names} hrefs={hrefs} active={active} setActive={setActive} fly={fly}
        lightOn={lightOn} theme={theme} />

      {/* Below 1280px: the office cards in a swipe row riding over the map's bottom edge. */}
      <div className="mm-under">
        <div ref={row} className="mm-row" onScroll={onRowScroll}>
          {HUB_KEYS.map((k, i) => <OfficeCard key={k} i={i} active={active} setActive={setActive} className="mm-card mm-card--row" />)}
        </div>
        <div className="mm-dots" aria-hidden="true">
          {HUB_KEYS.map((k, i) => <span key={k} className={i === slide ? "is-on" : ""} />)}
        </div>
        <p className="hubs-words-phone"><strong>{guests}</strong><span>{care}</span></p>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .hubs-maps { position: relative; margin: 0 0 clamp(28px, 3.4vw, 44px); }
        .hubs-map { position: relative; width: 100%; }
        .hubs-clip { position: absolute; inset: 0; border-radius: var(--lx-radius-lg); overflow: hidden; background: #081133; }
        [data-theme="light"] .hubs-clip { background: #dfeaf4; }
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
        /* Cruise routes: round dots. Regional capability: short dashes. */
        .hubs-sea-under { fill: none; stroke: rgba(127,224,225,0.22); stroke-width: 3.4; stroke-linecap: round; stroke-dasharray: 0 7; }
        .hubs-sea { fill: none; stroke: #ffffff; stroke-width: 2; stroke-linecap: round; stroke-dasharray: 0 7; }
        .hubs-map--phone .hubs-sea-under, .hubs-map--phone .hubs-sea { stroke-dasharray: 0 5.5; }
        .hubs-map--phone .hubs-sea { stroke-width: 1.7; }
        .hubs-reg { fill: none; stroke: rgba(255,255,255,0.55); stroke-width: 1.3; stroke-dasharray: 4 5; }
        [data-theme="light"] .hubs-route-halo { stroke: rgba(255,255,255,0.35); }
        [data-theme="light"] .hubs-route, [data-theme="light"] .hubs-map--phone .hubs-route { stroke: rgba(15,32,92,0.34); }
        [data-theme="light"] .hubs-sea-under { stroke: rgba(15,32,92,0.5); }
        [data-theme="light"] .hubs-reg { stroke: rgba(15,32,92,0.5); }
        /* Each plane and ship is its own GPU layer moved by transform and opacity only, so it costs no work per frame. */
        .hubs-planes { position: absolute; left: 0; top: 0; transform-origin: 0 0; pointer-events: none; }
        .hubs-plane, .hubs-ship { position: absolute; overflow: visible; opacity: 0; transform-origin: 50% 50%; will-change: transform, opacity; }
        .hubs-plane path { fill: #ffffff; filter: drop-shadow(0 0 3px rgba(191,246,247,0.95)); }
        [data-theme="light"] .hubs-plane path { fill: #0F205C; filter: drop-shadow(0 0 2px rgba(255,255,255,0.9)); }
        .hubs-ship svg { display: block; filter: drop-shadow(0 0 4px rgba(127,224,225,0.55)); }
        [data-theme="light"] .hubs-ship svg { filter: drop-shadow(0 2px 3px rgba(15,32,92,0.35)); }
        /* Where the guests set off from. */
        .hubs-src {
          position: absolute; width: 6px; height: 6px; border-radius: 50%; background: #ffffff; transform: translate(-50%, -50%);
          box-shadow: 0 0 6px 2px rgba(191,246,247,0.9), 0 0 16px 5px rgba(127,224,225,0.35); pointer-events: none;
        }
        [data-theme="light"] .hubs-src { background: #0F205C; box-shadow: 0 0 0 2px rgba(255,255,255,0.9); }
        .hubs-map--phone .hubs-src { width: 5px; height: 5px; }
        /* Ocean names, spaced capitals like his image. */
        .hubs-ocean {
          position: absolute; transform: translate(-50%, -50%); text-align: center; white-space: nowrap; pointer-events: none;
          font-size: 11px; font-weight: 600; letter-spacing: 0.42em; padding-left: 0.42em; line-height: 1.7; text-transform: uppercase;
          color: rgba(191,246,247,0.62);
        }
        .hubs-map--phone .hubs-ocean { font-size: 7.5px; letter-spacing: 0.32em; padding-left: 0.32em; }
        [data-theme="light"] .hubs-ocean--ink { color: #1B4A86; }
        [data-theme="light"] .hubs-ocean--white { color: #ffffff; text-shadow: 0 1px 2px rgba(15,32,92,0.4); }
        /* Medical network: a blue circle with a white cross. */
        .hubs-cross { position: absolute; transform: translate(-50%, -50%); line-height: 0; pointer-events: none; }
        .hubs-cross svg { filter: drop-shadow(0 1px 3px rgba(8,17,51,0.45)); }

        /* Each pin is a 44px tap area on its city, a gold pin like his image. */
        .hubs-pin {
          position: absolute; width: 44px; height: 44px; transform: translate(-50%, -50%);
          display: block; text-decoration: none; color: #ffffff; z-index: 1;
        }
        .hubs-pin:focus-visible { outline: 2px solid #7FE0E1; outline-offset: 2px; border-radius: 50%; }
        .hubs-pin-mark {
          position: absolute; left: 50%; bottom: 50%; line-height: 0; transform: translateX(-50%); transform-origin: 50% 100%;
          transition: transform .25s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .hubs-pin-mark svg { filter: drop-shadow(0 2px 3px rgba(8,17,51,0.45)); }
        .hubs-pin-ring {
          position: absolute; left: 50%; top: 50%; width: 12px; height: 12px; border-radius: 50%;
          border: 2px solid #E2B867; transform: translate(-50%, -50%); opacity: 0;
        }
        .is-live .hubs-pin-ring { animation: hubs-pulse 2.6s cubic-bezier(0.22, 1, 0.36, 1) infinite; }
        @keyframes hubs-pulse { 0% { transform: translate(-50%, -50%) scale(1); opacity: 0.75; } 100% { transform: translate(-50%, -50%) scale(3); opacity: 0; } }
        .hubs-pin-label {
          position: absolute; white-space: nowrap; padding: 5px 11px; border-radius: 999px;
          background: rgba(8,17,51,0.66); border: 1px solid rgba(127,224,225,0.4); color: #ffffff;
          font-family: var(--font-display); font-size: clamp(13px, 1.4vw, 16px); line-height: 1; letter-spacing: 0.05em;
          transition: background-color .25s ease, border-color .25s ease;
        }
        [data-theme="light"] .hubs-pin-label { background: rgba(255,255,255,0.94); border-color: rgba(15,32,92,0.14); color: #0F205C; box-shadow: 0 2px 6px rgba(15,32,92,0.18); }
        .hubs-pin-label--right { left: 34px; top: 50%; transform: translateY(-50%); }
        .hubs-pin-label--left { right: 34px; top: 50%; transform: translateY(-50%); }
        .hubs-pin-label--up { left: 50%; bottom: 40px; transform: translateX(-50%); }
        .hubs-pin-label--down-left { right: 30px; top: 30px; }
        .hubs-pin.is-active .hubs-pin-mark { transform: translateX(-50%) scale(1.25); }
        .hubs-pin.is-active .hubs-pin-label { background: rgba(0,154,156,0.85); border-color: #7FE0E1; color: #ffffff; }
        @media (hover: hover) and (pointer: fine) {
          .hubs-pin:hover .hubs-pin-mark { transform: translateX(-50%) scale(1.25); }
          .hubs-pin:hover .hubs-pin-label { background: rgba(0,154,156,0.85); border-color: #7FE0E1; color: #ffffff; }
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
        [data-theme="light"] .hubs-words { background: rgba(255,255,255,0.96); border-color: rgba(15,32,92,0.1); box-shadow: 0 12px 28px -14px rgba(15,32,92,0.45); }
        [data-theme="light"] .hubs-words strong { color: #0F205C; }
        [data-theme="light"] .hubs-words span { color: #334155; }
        .hubs-words-phone { display: none; margin: 18px 0 0; text-align: center; }
        .hubs-words-phone strong {
          display: block; font-family: var(--font-display); font-weight: 400; font-size: 24px; line-height: 1.1;
          letter-spacing: 0.05em; text-transform: uppercase; color: var(--lx-ink);
        }
        .hubs-words-phone span { display: block; margin-top: 6px; font-size: 15px; line-height: 1.55; color: var(--lx-body); text-wrap: balance; }

        /* The Light / Dark switch: on the map's top right; on phone just above the map (on it, it covered GERMANY). */
        .mm-switch-row { position: absolute; top: 18px; right: 18px; z-index: 5; }
        .mm-switch {
          display: flex; padding: 3px; gap: 2px; border-radius: 999px;
          background: rgba(8,17,51,0.7); border: 1px solid rgba(127,224,225,0.4); -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px);
        }
        [data-theme="light"] .mm-switch { background: rgba(255,255,255,0.96); border-color: rgba(15,32,92,0.14); box-shadow: 0 6px 16px -8px rgba(15,32,92,0.45); }
        .mm-sw {
          display: flex; align-items: center; gap: 7px; min-height: 38px; padding: 0 14px; border: 0; border-radius: 999px; cursor: pointer;
          font: 600 13px/1 var(--font-sans, Montserrat), sans-serif; color: rgba(255,255,255,0.86); background: transparent;
          transition: background-color .25s ease, color .25s ease;
        }
        [data-theme="light"] .mm-sw { color: #334155; }
        .mm-sw.is-on { background: #7FE0E1; color: #081133; }
        [data-theme="light"] .mm-sw.is-on { background: #0F205C; color: #ffffff; }
        .mm-sw:focus-visible { outline: 2px solid #009A9C; outline-offset: 2px; }
        @media (max-width: 700px) {
          .mm-switch-row { position: static; display: flex; justify-content: flex-end; margin-bottom: 12px; }
          .mm-switch-row .mm-switch { background: #ffffff; border-color: rgba(15,32,92,0.14); box-shadow: 0 6px 16px -8px rgba(15,32,92,0.35); }
          .mm-switch-row .mm-sw { color: #334155; }
          .mm-switch-row .mm-sw.is-on { background: #0F205C; color: #ffffff; }
        }

        /* Office cards: raised layers, a gold hairline on top like the pins. */
        .mm-card {
          margin: 0; border-radius: 14px; background-color: rgba(10,22,58,0.92);
          background-image: linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0) 48%);
          border: 1px solid rgba(127,224,225,0.34); color: #ffffff;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.16), 0 1px 2px rgba(2,6,23,0.4), 0 10px 20px -6px rgba(2,6,23,0.55), 0 30px 56px -18px rgba(2,6,23,0.75);
          transition: transform .45s cubic-bezier(0.22, 1, 0.36, 1), box-shadow .45s cubic-bezier(0.22, 1, 0.36, 1), border-color .25s ease;
        }
        [data-theme="light"] .mm-card, .mm-card--row {
          background-color: #ffffff; background-image: linear-gradient(180deg, #ffffff, #F6F9FC); border: 1px solid rgba(15,32,92,0.08); color: #0F205C;
          box-shadow: inset 0 1px 0 #ffffff, 0 1px 2px rgba(15,32,92,0.1), 0 10px 22px -8px rgba(15,32,92,0.3), 0 34px 60px -20px rgba(15,32,92,0.48);
        }
        .mm-card { position: relative; padding: 14px 16px 15px; }
        .mm-card::before { content: ""; position: absolute; top: -1px; left: 16px; width: 28px; height: 2px; border-radius: 2px; background: #C9973A; }
        .mm-card.is-active { border-color: #7FE0E1; transform: translateY(-4px); }
        [data-theme="light"] .mm-card.is-active, .mm-card--row.is-active { border-color: #009A9C; }
        .mm-card-name { display: flex; align-items: center; gap: 8px; margin: 0; font-size: 16px; font-weight: 700; line-height: 1.2; }
        .mm-card-sub { margin: 2px 0 0 23px; font-size: 13px; font-weight: 700; }
        .mm-card-text { margin: 4px 0 0 23px; font-size: 13px; font-weight: 500; line-height: 1.45; color: rgba(255,255,255,0.86); }
        [data-theme="light"] .mm-card-text, .mm-card--row .mm-card-text { color: #334155; }
        @media (hover: hover) and (pointer: fine) {
          .mm-card--float:hover { transform: perspective(900px) translateY(-6px) rotateX(4deg); }
        }

        /* Leader lines from each pin to its card, and the floating cards: only from 1280px. */
        .mm-leads { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; pointer-events: none; z-index: 2; display: none; }
        .mm-lead { stroke: rgba(255,255,255,0.55); stroke-width: 1; fill: none; }
        [data-theme="light"] .mm-lead { stroke: rgba(15,32,92,0.4); }
        .mm-lead-dot { position: absolute; width: 5px; height: 5px; margin: -2.5px 0 0 -2.5px; border-radius: 50%; background: rgba(255,255,255,0.85); z-index: 2; display: none; }
        [data-theme="light"] .mm-lead-dot { background: #0F205C; }
        .mm-card--float { position: absolute; z-index: 4; display: none; }
        @media (min-width: 1280px) {
          .hubs-maps { padding: 48px 0 40px; }
          .mm-switch-row { top: 66px; }
          .mm-leads, .mm-lead-dot { display: block; }
          .mm-card--float { display: block; }
          .hubs-map--desktop .hubs-pin-label { display: none; }
          .hubs-words { left: -44px; top: -30px; max-width: none; background: rgba(10,22,58,0.92); border-color: rgba(127,224,225,0.34);
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.16), 0 10px 20px -6px rgba(2,6,23,0.55), 0 30px 56px -18px rgba(2,6,23,0.75); }
          [data-theme="light"] .hubs-words { background: #ffffff; box-shadow: inset 0 1px 0 #ffffff, 0 10px 22px -8px rgba(15,32,92,0.3), 0 34px 60px -20px rgba(15,32,92,0.48); }
          .mm-under { display: none; }
        }

        /* Below 1280px: the cards in a swipe row riding over the map's bottom edge, then the key. */
        .mm-under { position: relative; z-index: 2; }
        .mm-row {
          display: flex; gap: 12px; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none;
          margin: -40px calc(-1 * var(--lx-gutter)) 0; padding: 0 var(--lx-gutter) 10px; scroll-padding-inline: var(--lx-gutter);
        }
        .mm-row::-webkit-scrollbar { display: none; }
        .mm-card--row { flex: 0 0 min(272px, 78vw); scroll-snap-align: start; }
        .mm-card--row .mm-card-name { font-size: 17px; }
        .mm-card--row .mm-card-sub, .mm-card--row .mm-card-text { font-size: 14px; margin-left: 23px; }
        .mm-card--row .mm-card-text { line-height: 1.55; }
        .mm-dots { display: flex; justify-content: center; gap: 6px; margin-top: 4px; }
        .mm-dots span { width: 6px; height: 6px; border-radius: 3px; background: #CBD5E1; transition: width .3s ease, background-color .3s ease; }
        .mm-dots span.is-on { width: 18px; background: var(--tmasi-teal); }

        @media (max-width: 700px) {
          .hubs-words-phone { display: block; }
          .hubs-pin-label { font-size: 13px; padding: 4px 10px; }
          .hubs-pin-label--right { left: 32px; } .hubs-pin-label--left { right: 32px; }
          .hubs-pin-label--up { bottom: 38px; } .hubs-pin-label--down-left { right: 30px; top: 27px; }
          .hubs-cross svg { filter: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          .hubs-pin-ring { animation: none !important; }
          .mm-card, .mm-card:hover, .mm-card.is-active { transform: none !important; }
        }
      `}} />
    </div>
  );
}
