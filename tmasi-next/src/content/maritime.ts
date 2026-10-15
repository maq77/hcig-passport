// Words of the maritime map layer (spec 011), from his "TMASI Global Maritime Footprint" image, kept exactly.
// English on every language for now (his choice, 2026-10-11); the markup marks them lang="en".
// Adriatic / Balkans is in his image but left out on purpose ("dont mention adriatic so far").

export type HubKey = "EGYPT" | "GERMANY" | "UAE" | "SPAIN" | "USA";

/** One card per office, in the live footer's office order. */
export const MARITIME_CARDS: { key: HubKey; name: string; sub?: string; text: string }[] = [
  { key: "EGYPT", name: "Egypt", text: "Major TMASI operational healthcare infrastructure." },
  { key: "GERMANY", name: "Germany", text: "European network and medical coordination." },
  { key: "UAE", name: "UAE", text: "International travel, maritime and healthcare hub." },
  { key: "SPAIN", name: "Spain", text: "Healthcare network and maritime support capability." },
  { key: "USA", name: "USA", sub: "Florida", text: "Maritime / port support and international operations." },
];


export const MAP_THEME_WORDS = { group: "Map colours", dark: "Dark", light: "Light" };
