// T010 (spec 009 FR-005, data-model.md "Office"). Exactly five offices; no other pin may be drawn.
// Words (name, address, phone, email) come from home.en.json (the live footer, as on the live home and v3;
// Germany keeps the footer version; USA adds usa@tmasi.net from the contact page, his yes 2026-10-01).
// Positions come from the live contact page's full addresses, checked on OpenStreetMap (Nominatim) 2026-10-04:
//   eg  Hurghada International Airport area (the "Airport Road" query matched a different airport,
//       Gebel El Zeit, 75 km north, so the airport itself was used)          27.180, 33.788
//   de  Leopoldstraße 244, 80807 Munich: house number not in OSM; city level, Schwabing-Freimann  48.170, 11.586
//   ae  Dubai Silicon Oasis                                                     25.122, 55.386
//   es  Carrer de Pujades 358-362, 08019 Barcelona                              41.408, 2.209
//   us  401 E Jackson St, Tampa, FL 33602                                       27.948, -82.459
import home from "./home.en.json";

export type OfficeId = "eg" | "de" | "ae" | "es" | "us";

export type Office = {
  id: OfficeId;
  city: string; // the place word from the site's own address, used for labels
  lat: number;
  lng: number;
  name: string;
  address: string;
  phone: string;
  tel: string;
  email: string;
};

const POSITIONS: Record<OfficeId, { lat: number; lng: number; city: string; footerName: string }> = {
  eg: { lat: 27.18, lng: 33.788, city: "Hurghada", footerName: "Egypt Office" },
  de: { lat: 48.17, lng: 11.586, city: "Munich", footerName: "Germany Office" },
  ae: { lat: 25.122, lng: 55.386, city: "Dubai", footerName: "United Arab Emirates Office" },
  es: { lat: 41.408, lng: 2.209, city: "Barcelona", footerName: "Spain Office" },
  us: { lat: 27.948, lng: -82.459, city: "Florida", footerName: "USA Office" },
};

export const OFFICES: Office[] = (Object.keys(POSITIONS) as OfficeId[]).map((id) => {
  const p = POSITIONS[id];
  const words = home.hubs.offices.find((o) => o.name === p.footerName);
  if (!words) throw new Error(`offices.ts: no footer words for ${p.footerName}`);
  return { id, city: p.city, lat: p.lat, lng: p.lng, ...words };
});

if (OFFICES.length !== 5) throw new Error("offices.ts: exactly five offices");

/** Story order by default: Egypt first, then nearest to farthest (research R3). He may pick another on board 1. */
export const STORY_ORDER: OfficeId[] = ["eg", "ae", "de", "es", "us"];
