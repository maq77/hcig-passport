"use client";

/* Find a Clinic: Medcierge's explorer (medcierge-next/src/components/GoogleMap.tsx),
   ported with its smooth camera flight (the user, 2026-09-23: "get that whole section
   from medcierge ... I want smooth transition"). Chips fly the map to a destination;
   each clinic has WhatsApp This Clinic, Directions, Show on map (flies to the clinic and
   opens it) and More details (its dedicated clinic page). Google Maps loads only when the
   section nears the screen; without the key it falls back to OpenStreetMap.
   A footer link like /#clinics-marsa-alam opens with that destination chosen. */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, Crosshair, MapPin, Navigation } from "lucide-react";
import { WhatsAppGlyph } from "@/components/ui/Icon";
import { DESTINATIONS, type DestinationId } from "@/data/clinics";
import { waHref } from "@/lib/wa";
import "leaflet/dist/leaflet.css";

export type FinderClinic = { hotel: string; destination: DestinationId; lat: number; lng: number; mappable: boolean; href: string };
type Labels = { all: string; waClinic: string; directions: string; clinics: string; mapLabel: string; showOnMap: string; moreDetails: string };

const KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? "";
type MapsApi = typeof google.maps;
type Cam = { lat: number; lng: number; zoom: number };

let loading: Promise<MapsApi> | null = null;
function loadMaps() {
  if (window.google?.maps) return Promise.resolve(window.google.maps);
  if (loading) return loading;
  loading = new Promise((resolve, reject) => {
    const ready = "__c7MapsReady";
    (window as unknown as Record<string, () => void>)[ready] = () => resolve(window.google.maps);
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${KEY}&v=weekly&loading=async&callback=${ready}&language=en&region=EG`;
    s.async = true;
    s.onerror = () => reject(new Error("maps failed"));
    document.head.append(s);
  });
  return loading;
}

const STYLES: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#f7f3ef" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#6e6461" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#ddd3cc" }] },
  { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#f1e4dc" }] },
  { featureType: "road", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#bfe3ea" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#6fa3b1" }] },
];

const PIN = (active: boolean) =>
  `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 30"><path d="M12 29s9-8.2 9-17A9 9 0 1 0 3 12c0 8.8 9 17 9 17Z" fill="${active ? "#9a0000" : "#c00000"}" stroke="#ffffff" stroke-width="1.4"/><circle cx="12" cy="11.6" r="3.4" fill="#ffffff"/></svg>`,
  )}`;

/* Medcierge's camera path (van Wijk and Nuij, the one Leaflet flies): one move that zooms
   out, travels and zooms back in, so the eye follows the map instead of a jump cut. */
const RHO = 1.42;
const sinh = (n: number) => (Math.exp(n) - Math.exp(-n)) / 2;
const cosh = (n: number) => (Math.exp(n) + Math.exp(-n)) / 2;
const tanh = (n: number) => sinh(n) / cosh(n);
let flight = 0;

function flyTo(maps: MapsApi, map: google.maps.Map, to: Cam, still: boolean, done?: () => void) {
  flight++;
  const id = flight;
  const projection = map.getProjection();
  const from = map.getCenter();
  const z0 = map.getZoom();
  const el = map.getDiv() as HTMLElement;
  const land = () => { map.moveCamera({ center: { lat: to.lat, lng: to.lng }, zoom: to.zoom }); done?.(); };
  if (!projection || !from || z0 === undefined || still) return land();
  const scale = 2 ** z0;
  const a = projection.fromLatLngToPoint(from);
  const b = projection.fromLatLngToPoint(new maps.LatLng(to.lat, to.lng));
  if (!a || !b) return land();
  const p0 = { x: a.x * scale, y: a.y * scale };
  const p1 = { x: b.x * scale, y: b.y * scale };
  const w0 = Math.max(el.clientWidth, el.clientHeight) || 640;
  const w1 = w0 * 2 ** (z0 - to.zoom);
  const u1 = Math.hypot(p1.x - p0.x, p1.y - p0.y) || 1;
  const r = (i: 0 | 1) => {
    const s1 = i ? -1 : 1;
    const s2 = i ? w1 : w0;
    const t1 = w1 * w1 - w0 * w0 + s1 * RHO ** 4 * u1 * u1;
    const b1 = 2 * s2 * RHO * RHO * u1;
    const sq = Math.sqrt((t1 / b1) ** 2 + 1) - t1 / b1;
    return sq < 1e-9 ? -18 : Math.log(sq);
  };
  const r0 = r(0);
  const S = (r(1) - r0) / RHO;
  if (!Number.isFinite(S) || S <= 0) return land();
  const w = (s: number) => w0 * (cosh(r0) / cosh(r0 + RHO * s));
  const u = (s: number) => (w0 * (cosh(r0) * tanh(r0 + RHO * s) - sinh(r0))) / (RHO * RHO);
  const ms = Math.min(1700, Math.max(750, S * 820));
  const t0 = performance.now();
  const frame = (now: number) => {
    if (id !== flight) return;
    const t = Math.min(1, (now - t0) / ms);
    if (t >= 1) return land();
    const s = (1 - (1 - t) ** 1.5) * S;
    const k = u(s) / u1;
    const at = projection.fromPointToLatLng(new maps.Point((p0.x + (p1.x - p0.x) * k) / scale, (p0.y + (p1.y - p0.y) * k) / scale));
    if (at) map.moveCamera({ center: at, zoom: z0 + Math.log2(w0 / w(s)) });
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

/* The camera that frames a set of clinics with room around them. */
function viewFor(list: FinderClinic[]): Cam | null {
  const pts = list.filter((c) => c.mappable);
  if (!pts.length) return null;
  const lats = pts.map((c) => c.lat), lngs = pts.map((c) => c.lng);
  const span = Math.max(Math.max(...lats) - Math.min(...lats), Math.max(...lngs) - Math.min(...lngs), 0.02);
  return { lat: (Math.max(...lats) + Math.min(...lats)) / 2, lng: (Math.max(...lngs) + Math.min(...lngs)) / 2, zoom: Math.max(6, Math.min(13, Math.log2(615 / span))) };
}

const dirHref = (c: FinderClinic) => `https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lng}`;

export function ClinicFinder({ clinics, labels, base }: { clinics: FinderClinic[]; labels: Labels; base: string }) {
  const [sel, setSel] = useState<DestinationId | null>(null);
  const [focus, setFocus] = useState<string | null>(null);
  const reduce = useReducedMotion();
  const box = useRef<HTMLDivElement>(null);
  const api = useRef<{ maps: MapsApi; map: google.maps.Map; home: Cam; info: google.maps.InfoWindow; markers: Record<string, google.maps.Marker> } | null>(null);
  const [mapState, setMapState] = useState<"idle" | "google" | "failed">("idle");

  const list = useMemo(() => (sel ? clinics.filter((c) => c.destination === sel) : clinics), [sel, clinics]);
  const dest = DESTINATIONS.find((d) => d.id === sel);
  const focused = clinics.find((c) => c.hotel === focus);

  const popup = useCallback((c: FinderClinic) => {
    const div = document.createElement("div");
    div.className = "gm-pop";
    const b = document.createElement("b"); b.textContent = c.hotel;
    const wa = document.createElement("a"); wa.href = waHref("hotel", { hotel: c.hotel }); wa.target = "_blank"; wa.rel = "noopener"; wa.textContent = labels.waClinic;
    wa.dataset.ev = "whatsapp_medical_click"; wa.dataset.placement = "map";
    const dir = document.createElement("a"); dir.href = dirHref(c); dir.target = "_blank"; dir.rel = "noopener"; dir.textContent = labels.directions;
    dir.dataset.ev = "clinic_directions_click"; dir.dataset.placement = "map";
    const more = document.createElement("a"); more.href = `${base}${c.href}`; more.textContent = labels.moreDetails;
    div.append(b, wa, dir, more);
    return div;
  }, [labels, base]);

  useEffect(() => {
    const el = box.current;
    if (!el || !KEY) { setMapState("failed"); return; }
    const io = new IntersectionObserver(async ([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      try {
        const maps = await loadMaps();
        const map = new maps.Map(el, {
          center: { lat: 27, lng: 31.5 }, zoom: 6, styles: STYLES, mapTypeControl: false, streetViewControl: false,
          fullscreenControl: false, gestureHandling: "cooperative", clickableIcons: false, isFractionalZoomEnabled: true,
        });
        const info = new maps.InfoWindow({ disableAutoPan: true, maxWidth: 260 });
        const bounds = new maps.LatLngBounds();
        const markers: Record<string, google.maps.Marker> = {};
        for (const c of clinics.filter((x) => x.mappable)) {
          const m = new maps.Marker({ map, position: { lat: c.lat, lng: c.lng }, title: c.hotel, icon: { url: PIN(false), scaledSize: new maps.Size(28, 35), anchor: new maps.Point(14, 33) } });
          m.addListener("click", () => { info.setContent(popup(c)); info.open({ map, anchor: m }); setFocus(c.hotel); });
          markers[c.hotel] = m;
          bounds.extend(m.getPosition()!);
        }
        map.fitBounds(bounds, 48);
        api.current = { maps, map, markers, info, home: { lat: 26.6, lng: 31.2, zoom: 6 } };
        maps.event.addListenerOnce(map, "idle", () => {
          const c = map.getCenter(); const z = map.getZoom();
          if (api.current && c && z !== undefined) api.current.home = { lat: c.lat(), lng: c.lng(), zoom: z };
        });
        setMapState("google");
      } catch {
        setMapState("failed");
      }
    }, { rootMargin: "300px" });
    io.observe(el);
    return () => io.disconnect();
  }, [clinics, popup]);

  const pick = useCallback((id: DestinationId | null) => {
    setSel(id);
    setFocus(null);
    const a = api.current;
    if (!a) return;
    a.info.close();
    const cam = id ? viewFor(clinics.filter((c) => c.destination === id)) : a.home;
    if (cam) flyTo(a.maps, a.map, cam, !!reduce);
  }, [clinics, reduce]);

  const showOnMap = useCallback((c: FinderClinic) => {
    setFocus(c.hotel);
    const a = api.current;
    box.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    if (!a) return;
    a.info.close();
    flyTo(a.maps, a.map, { lat: c.lat, lng: c.lng, zoom: 15 }, !!reduce, () => {
      const m = a.markers[c.hotel];
      if (m) { a.info.setContent(popup(c)); a.info.open({ map: a.map, anchor: m }); }
    });
  }, [popup, reduce]);

  useEffect(() => {
    const fromHash = () => {
      const m = location.hash.match(/^#clinics-([a-z-]+)$/);
      if (m && DESTINATIONS.some((d) => d.id === m[1])) {
        pick(m[1] as DestinationId);
        document.getElementById("clinics")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [pick, mapState]);

  return (
    <div className="finder-grid">
      <div className="finder-side">
        <div className="chips" role="group" aria-label={labels.mapLabel}>
          <button type="button" className="chip-btn" aria-pressed={!sel} onClick={() => pick(null)}>
            {labels.all}<span className="chip-n">{clinics.length}</span>
          </button>
          {DESTINATIONS.map((d) => (
            <button key={d.id} type="button" className="chip-btn" aria-pressed={sel === d.id} onClick={() => pick(d.id)}>
              <MapPin size={15} aria-hidden="true" />{d.name}
              <span className="chip-n">{clinics.filter((c) => c.destination === d.id).length}</span>
            </button>
          ))}
        </div>
        <ul className="clinic-list" aria-live="polite">
          <AnimatePresence initial={false} mode="popLayout">
            {list.map((c) => (
              <motion.li key={c.hotel} layout={!reduce} className={focus === c.hotel ? "on" : undefined}
                initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
                <div className="cl-name">
                  <b>{c.hotel}</b>
                  <span>{DESTINATIONS.find((d) => d.id === c.destination)?.name}</span>
                </div>
                <div className="cl-actions">
                  <a className="cl-wa" href={waHref("hotel", { hotel: c.hotel })} target="_blank" rel="noopener" data-ev="whatsapp_medical_click" data-placement="finder">
                    <WhatsAppGlyph size={16} /><span>{labels.waClinic}</span>
                  </a>
                  {c.mappable && (
                    <>
                      <a className="cl-sec" href={dirHref(c)} target="_blank" rel="noopener" data-ev="clinic_directions_click" data-placement="finder">
                        <Navigation size={15} aria-hidden="true" /><span>{labels.directions}</span>
                      </a>
                      <button type="button" className="cl-sec" onClick={() => showOnMap(c)}>
                        <Crosshair size={15} aria-hidden="true" /><span>{labels.showOnMap}</span>
                      </button>
                    </>
                  )}
                  <a className="cl-more" href={`${base}${c.href}`}>
                    <span>{labels.moreDetails}</span><ArrowUpRight size={15} aria-hidden="true" />
                  </a>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>

      <div className="map-frame">
        <div ref={box} className="map-canvas" role="application" aria-label={labels.mapLabel} />
        {mapState === "failed" && <LeafletFallback clinics={clinics} />}
        <div className="map-card">
          <span className="ring-ic"><MapPin size={18} aria-hidden="true" /></span>
          <div className="mc-text">
            <AnimatePresence mode="wait" initial={false}>
              <motion.b key={focus ?? dest?.id ?? "all"} initial={reduce ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}>
                {focus ?? dest?.name ?? labels.all}
              </motion.b>
            </AnimatePresence>
            <span>{focused ? DESTINATIONS.find((d) => d.id === focused.destination)?.name : <><em className="mc-n">{list.length}</em> {labels.clinics}</>}</span>
          </div>
          {(focused || dest) && (
            <a className="btn btn-wa btn-sm" href={focused ? waHref("hotel", { hotel: focused.hotel }) : waHref("destination", { destination: dest!.name })}
              target="_blank" rel="noopener" data-ev="whatsapp_medical_click" data-placement="map-card" aria-label={labels.waClinic}>
              <WhatsAppGlyph size={16} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

/* No key, or Google failed: OpenStreetMap with the same pins. */
function LeafletFallback({ clinics }: { clinics: FinderClinic[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let map: import("leaflet").Map | undefined;
    let gone = false; // the effect may be cleaned up before the import resolves
    (async () => {
      const L = (await import("leaflet")).default;
      if (gone || !ref.current) return;
      map = L.map(ref.current, { scrollWheelZoom: false, attributionControl: false });
      L.control.attribution({ position: "bottomleft", prefix: false }).addTo(map);
      L.tileLayer("https://tile.openstreetmap.de/{z}/{x}/{y}.png", { maxZoom: 18, attribution: "&copy; OpenStreetMap" }).addTo(map);
      const g = L.featureGroup(clinics.filter((c) => c.mappable).map((c) =>
        L.circleMarker([c.lat, c.lng], { radius: 7, color: "#fff", weight: 2, fillColor: "#C00000", fillOpacity: 1 }).bindTooltip(c.hotel))).addTo(map);
      map.fitBounds(g.getBounds(), { padding: [36, 36] });
    })();
    return () => { gone = true; map?.remove(); };
  }, [clinics]);
  return <div ref={ref} className="map-canvas" />;
}
