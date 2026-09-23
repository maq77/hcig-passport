/* The 30 clinics in 24/7 Clinic's own map data (content/247clinic/clinics.json),
   with what their data lacks: a destination per clinic (read from coordinates),
   and a status on each position. See specs/007-247clinic-v3/data-model.md.
   - Premier Le Reve: their pin is Long Beach's point, 7 km off. Checked position used
     (docs/247clinic-open-items.md, checked against OpenStreetMap 2026-09-08).
   - Three Hurghada clinics share one generic point: no map pin until checked. */

export type DestinationId = "hurghada" | "sahl-hasheesh" | "soma-bay" | "marsa-alam" | "el-quseir" | "north-coast";
export type CoordStatus = "checked" | "theirs" | "placeholder";

export type Clinic = {
  hotel: string;
  sourceName: string;
  destination: DestinationId;
  lat: number;
  lng: number;
  coord: CoordStatus;
};

const c = (sourceName: string, destination: DestinationId, lat: number, lng: number, coord: CoordStatus = "theirs", hotel = sourceName.trim()): Clinic =>
  ({ hotel, sourceName, destination, lat, lng, coord });

export const CLINICS: Clinic[] = [
  c("Radisson Blu El Quseir", "el-quseir", 26.1468503029977, 34.2573821672988),
  c("Long Beach Resort", "hurghada", 27.082139131958826, 33.85890642461731),
  c("Jaz Almaza Beach", "north-coast", 31.19829458375813, 27.554607323620534),
  c("Jaz Crystal Resort", "hurghada", 27.2578957, 33.8116067, "placeholder"),
  c("Steigenberger soma bay", "soma-bay", 26.863468, 33.961233, "checked", "Steigenberger Resort Ras Soma"),
  c("Jaz Oriental Resort", "north-coast", 31.20180424892072, 27.551803242227866),
  c("Jaz Oriental Club", "north-coast", 31.046319927190773, 28.474947745525828),
  c("Jaz Almazino", "north-coast", 31.20063007068815, 27.556023551365428),
  c("Jaz Tamerina", "north-coast", 31.19996532076208, 27.551564466944622),
  c("Jaz Lamaya Resort", "marsa-alam", 25.6015285471117, 34.6092515151671),
  c("Pyramisa Beach Resort Sahl Hasheesh", "sahl-hasheesh", 27.048222362737494, 33.900717177910764),
  c("True Beach Resort", "marsa-alam", 24.92108856753648, 34.96469010674647),
  c("Jaz Elite Riviera", "marsa-alam", 25.511503738169804, 34.647978006746456),
  c("Jaz Samaya Resort", "hurghada", 27.2578957, 33.8116067, "placeholder"),
  c("Iberotel Costa Mares", "marsa-alam", 25.5131826301929, 34.6476319249502),
  c("Amwaj Beach Club", "soma-bay", 26.813385, 33.945688, "checked"),
  c("JAZ Amara Resort", "marsa-alam", 25.51318509274786, 34.64786711819718, "theirs", "Jaz Amara Resort"),
  c("Jaz Solaya Resort", "marsa-alam", 25.5992717965789, 34.6055304672805),
  c("Jaz Dar El Madina Resort", "hurghada", 27.2578957, 33.8116067, "placeholder"),
  c("Jaz Maraya Resort", "marsa-alam", 25.6017607586378, 34.6091013114622),
  c("Steigenberger Alaya Marsa Alam", "marsa-alam", 25.6049784146475, 34.601351484158),
  c("Premier Le Reve Sahl Hasheesh", "sahl-hasheesh", 27.024343, 33.887027, "checked", "Premier Le Rêve Hotel & Spa"),
  c("Baron Palace Sahl Hasheesh", "sahl-hasheesh", 27.0298199817486, 33.88419450674646),
  c("Hilton Hurghada Plaza ", "hurghada", 27.2569067506983, 33.83056549325354),
  c("Caribbean World Resort", "soma-bay", 26.8324744462425, 33.9407369868867),
  c("Old Palace Resort Sahl Hasheesh", "sahl-hasheesh", 27.048307273326813, 33.8872744355822),
  c("Palm Royale Resort Soma Bay", "soma-bay", 26.838073518541, 33.9487611779092),
  c("Reef Oasis Resort", "marsa-alam", 24.877508432816242, 34.984063191403706),
  c("Steigenberger Coraya Beach", "marsa-alam", 25.6048555572487, 34.6036681961171),
  c("Casa Mare Resort", "marsa-alam", 25.4375580745955, 34.6873595672752),
];

/* In the brief's own order (section 13). Makadi Bay has no clinic, so it is not listed. */
export const DESTINATIONS: { id: DestinationId; name: string }[] = [
  { id: "hurghada", name: "Hurghada" },
  { id: "sahl-hasheesh", name: "Sahl Hasheesh" },
  { id: "soma-bay", name: "Soma Bay" },
  { id: "marsa-alam", name: "Marsa Alam" },
  { id: "el-quseir", name: "El Quseir" },
  { id: "north-coast", name: "North Coast" },
];

export const clinicsIn = (id: DestinationId) => CLINICS.filter((x) => x.destination === id);
export const mappable = () => CLINICS.filter((x) => x.coord !== "placeholder");
