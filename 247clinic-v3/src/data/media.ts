/* Films (encoded by scripts/media.mjs from `247 material/`) and logos.
   Films are used as films only. No poster is ever taken from a frame. */

export type Film = {
  id: string;
  shape: "portrait" | "landscape";
  preview: string; // short silent loop for the card
  full: string; // the whole film with sound, for the viewer
  flag?: string; // only where his file name names the country
};

export const HERO = { mp4: "/media/hero.mp4", webm: "/media/hero.webm", mp4m: "/media/hero-m.mp4", webmm: "/media/hero-m.webm" };

export const INTRO: Film = { id: "intro", shape: "portrait", preview: "/media/intro-prev.mp4", full: "/media/intro.mp4" };

export const STORIES: Film[] = [
  { id: "scotland", shape: "portrait", preview: "/media/story-scotland-prev.mp4", full: "/media/story-scotland.mp4", flag: "gb" },
  { id: "poland", shape: "landscape", preview: "/media/story-poland-prev.mp4", full: "/media/story-poland.mp4", flag: "pl" },
  { id: "italy", shape: "portrait", preview: "/media/story-italy-prev.mp4", full: "/media/story-italy.mp4", flag: "it" },
  { id: "romania", shape: "landscape", preview: "/media/story-romania-prev.mp4", full: "/media/story-romania.mp4", flag: "ro" },
  { id: "scooter", shape: "portrait", preview: "/media/story-scooter-prev.mp4", full: "/media/story-scooter.mp4" },
  { id: "3", shape: "portrait", preview: "/media/story-3-prev.mp4", full: "/media/story-3.mp4" },
];

export type Logo = { name: string; src: string; w: number; h: number };

/* Held today. The agy ticket T-041 adds official wordmarks; they replace these. */
export const INSURERS: Logo[] = [
  { name: "ADAC", src: "/logos/insurers/adac.webp", w: 320, h: 200 },
  { name: "International SOS", src: "/logos/insurers/international-sos.webp", w: 320, h: 178 },
  { name: "Allianz", src: "/logos/insurers/allianz.png", w: 96, h: 96 },
  { name: "Mondial", src: "/logos/insurers/mondial.webp", w: 320, h: 130 },
  { name: "AXA", src: "/logos/insurers/axa.png", w: 96, h: 96 },
  { name: "Connecx", src: "/logos/insurers/connecx.webp", w: 320, h: 172 },
  { name: "Generali", src: "/logos/insurers/generali.png", w: 96, h: 96 },
  { name: "Bupa", src: "/logos/insurers/bupa.png", w: 96, h: 96 },
  { name: "Cigna", src: "/logos/insurers/cigna.png", w: 96, h: 96 },
  { name: "MetLife", src: "/logos/insurers/metlife.png", w: 76, h: 96 },
];

export const HOTELS: Logo[] = [
  { name: "Steigenberger", src: "/logos/hotels/steigenberger.png", w: 86, h: 96 },
  { name: "Jaz Hotels", src: "/logos/hotels/jaz.png", w: 96, h: 96 },
  { name: "Hilton", src: "/logos/hotels/hilton.png", w: 102, h: 38 },
  { name: "Long Beach Resort", src: "/logos/hotels/longbeach.png", w: 122, h: 110 },
];
