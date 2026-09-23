"use client";

/* Find a Clinic, in the Medcierge explorer pattern (the user, 2026-09-23: "make it like
   in medcierge and get their google maps key too, it is shared").
   Chips choose a destination, the map flies there, the list shows its clinics with
   "WhatsApp This Clinic" (the hotel pre-filled) and Directions. Google Maps loads only
   when the section nears the screen; without the key it falls back to OpenStreetMap.
   A footer link like /#clinics-marsa-alam opens with that destination chosen. */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { MapPin, Navigation } from "lucide-react";
import { WhatsAppGlyph } from "@/components/ui/Icon";
import { DESTINATIONS, type DestinationId } from "@/data/clinics";
import { waHref } from "@/lib/wa";
import "leaflet/dist/leaflet.css";

export type FinderClinic = { hotel: string; destination: DestinationId; lat: number; lng: number; mappable: boolean };
type Labels = { all: string; waClinic: string; directions: string; clinics: string; mapLabel: string };

const KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? "";

/* ---------- Google Maps loader and look (from medcierge-next/src/components/GoogleMap.tsx) ---------- */
let loading: Promise<typeof google.maps> | null = null;
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

/* Light, warm, quiet: the map sits inside the 24/7 palette. */
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

const dirHref = (c: FinderClinic) => `https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lng}`;

/* The zoom that shows a destination's clinics with room around them. */
function viewFor(list: FinderClinic[]) {
  const pts = list.filter((c) => c.mappable);
  if (!pts.length) return null;
  const lats = pts.map((c) => c.lat), lngs = pts.map((c) => c.lng);
  const span = Math.max(Math.max(...lats) - Math.min(...lats), Math.max(...lngs) - Math.min(...lngs), 0.02);
  const zoom = Math.max(6, Math.min(13, Math.log2(615 / span)));
  return { lat: (Math.max(...lats) + Math.min(...lats)) / 2, lng: (Math.max(...lngs) + Math.min(...lngs)) / 2, zoom };
}

export function ClinicFinder({ clinics, labels }: { clinics: FinderClinic[]; labels: Labels }) {
  const [sel, setSel] = useState<DestinationId | null>(null);
  const reduce = useReducedMotion();
  const box = useRef<HTMLDivElement>(null);
  const api = useRef<{ map: google.maps.Map; home: google.maps.LatLngBounds; info: google.maps.InfoWindow; markers: google.maps.Marker[] } | null>(null);
  const [mapState, setMapState] = useState<"idle" | "google" | "failed">("idle");

  const list = useMemo(() => (sel ? clinics.filter((c) => c.destination === sel) : clinics), [sel, clinics]);
  const dest = DESTINATIONS.find((d) => d.id === sel);

  /* load Google Maps when the section nears the screen */
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
        const info = new maps.InfoWindow({ maxWidth: 260 });
        const bounds = new maps.LatLngBounds();
        const markers = clinics.filter((c) => c.mappable).map((c) => {
          const m = new maps.Marker({ map, position: { lat: c.lat, lng: c.lng }, title: c.hotel, icon: { url: PIN(false), scaledSize: new maps.Size(28, 35), anchor: new maps.Point(14, 33) } });
          m.addListener("click", () => {
            const div = document.createElement("div");
            div.className = "gm-pop";
            const b = document.createElement("b"); b.textContent = c.hotel;
            const wa = document.createElement("a"); wa.href = waHref("hotel", { hotel: c.hotel }); wa.target = "_blank"; wa.rel = "noopener"; wa.textContent = labels.waClinic;
            wa.dataset.ev = "whatsapp_medical_click"; wa.dataset.placement = "map";
            const dir = document.createElement("a"); dir.href = dirHref(c); dir.target = "_blank"; dir.rel = "noopener"; dir.textContent = labels.directions;
            dir.dataset.ev = "clinic_directions_click"; dir.dataset.placement = "map";
            div.append(b, wa, dir);
            info.setContent(div);
            info.open({ map, anchor: m });
          });
          bounds.extend(m.getPosition()!);
          return m;
        });
        map.fitBounds(bounds, 48);
        api.current = { map, home: bounds, info, markers };
        setMapState("google");
      } catch {
        setMapState("failed");
      }
    }, { rootMargin: "300px" });
    io.observe(el);
    return () => io.disconnect();
  }, [clinics, labels.waClinic, labels.directions]);

  const pick = useCallback((id: DestinationId | null) => {
    setSel(id);
    const a = api.current;
    if (!a) return;
    a.info.close();
    if (!id) { a.map.fitBounds(a.home, 48); return; }
    const v = viewFor(clinics.filter((c) => c.destination === id));
    if (!v) return;
    if (reduce) a.map.moveCamera({ center: { lat: v.lat, lng: v.lng }, zoom: v.zoom });
    else { a.map.panTo({ lat: v.lat, lng: v.lng }); window.setTimeout(() => a.map.setZoom(Math.round(v.zoom)), 420); }
  }, [clinics, reduce]);

  /* deep link from the footer: /#clinics-<destination> */
  useEffect(() => {
    const fromHash = () => {
      const m = location.hash.match(/^#clinics-([a-z-]+)$/);
      if (m && DESTINATIONS.some((d) => d.id === m[1])) { pick(m[1] as DestinationId); document.getElementById("clinics")?.scrollIntoView({ behavior: "smooth", block: "start" }); }
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
              <motion.li key={c.hotel} layout={!reduce}
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
                    <a className="cl-dir" href={dirHref(c)} target="_blank" rel="noopener" data-ev="clinic_directions_click" data-placement="finder" aria-label={`${labels.directions}: ${c.hotel}`}>
                      <Navigation size={16} aria-hidden="true" /><span>{labels.directions}</span>
                    </a>
                  )}
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
              <motion.b key={dest?.id ?? "all"} initial={reduce ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}>
                {dest?.name ?? labels.all}
              </motion.b>
            </AnimatePresence>
            <span>{list.length} {labels.clinics}</span>
          </div>
          {dest && (
            <a className="btn btn-wa btn-sm" href={waHref("destination", { destination: dest.name })} target="_blank" rel="noopener" data-ev="whatsapp_medical_click" data-placement="map-card" aria-label={`${labels.waClinic}: ${dest.name}`}>
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
    (async () => {
      const L = (await import("leaflet")).default;
      if (!ref.current) return;
      map = L.map(ref.current, { scrollWheelZoom: false, attributionControl: false });
      L.control.attribution({ position: "bottomleft", prefix: false }).addTo(map);
      L.tileLayer("https://tile.openstreetmap.de/{z}/{x}/{y}.png", { maxZoom: 18, attribution: "&copy; OpenStreetMap" }).addTo(map);
      const g = L.featureGroup(clinics.filter((c) => c.mappable).map((c) =>
        L.circleMarker([c.lat, c.lng], { radius: 7, color: "#fff", weight: 2, fillColor: "#C00000", fillOpacity: 1 }).bindTooltip(c.hotel))).addTo(map);
      map.fitBounds(g.getBounds(), { padding: [36, 36] });
    })();
    return () => { map?.remove(); };
  }, [clinics]);
  return <div ref={ref} className="map-canvas" />;
}
