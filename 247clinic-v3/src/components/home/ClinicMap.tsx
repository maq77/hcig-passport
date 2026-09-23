"use client";

/* Leaflet + OpenStreetMap, loaded only when the map nears the screen (no key,
   no billing). Pins in brand red. Clinics whose position is a shared placeholder
   are left off until checked. */
import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

export type Pin = { hotel: string; lat: number; lng: number };

export function ClinicMap({ pins, label }: { pins: Pin[]; label: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let map: import("leaflet").Map | undefined;
    const io = new IntersectionObserver(async ([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const L = (await import("leaflet")).default;
      map = L.map(el, { scrollWheelZoom: false, zoomControl: true, attributionControl: false });
      L.control.attribution({ position: "bottomleft", prefix: false }).addTo(map);
      L.tileLayer("https://tile.openstreetmap.de/{z}/{x}/{y}.png", {
        maxZoom: 18, attribution: "&copy; OpenStreetMap",
      }).addTo(map);
      const group = L.featureGroup(pins.map((p) =>
        L.circleMarker([p.lat, p.lng], { radius: 7, color: "#fff", weight: 2, fillColor: "#C00000", fillOpacity: 1 })
          .bindTooltip(p.hotel, { direction: "top", offset: [0, -6] }),
      )).addTo(map);
      map.fitBounds(group.getBounds(), { padding: [36, 36] });
    }, { rootMargin: "240px" });
    io.observe(el);
    return () => { io.disconnect(); map?.remove(); };
  }, [pins]);

  return <div className="map" ref={ref} role="region" aria-label={label} />;
}
