/* Films (encoded by scripts/media.mjs from `247 material/`), photos and logos.
   Films are used as films only. No poster is ever taken from a frame. */

export type Film = {
  id: string;
  shape: "portrait" | "landscape";
  preview: string; // short silent loop for the card
  full: string; // the whole film with sound (stream copy, his original quality)
  flag?: string; // only where his file name names the country
};

/* The first 14 s of the Le Reve commercial, stream-copied: his file's own quality. */
export const HERO = { mp4: "/media/hero.mp4" };

export const INTRO: Film = { id: "intro", shape: "portrait", preview: "/media/intro-prev.mp4", full: "/media/intro.mp4" };

export const STORIES: Film[] = [
  { id: "scotland", shape: "portrait", preview: "/media/story-scotland-prev.mp4", full: "/media/story-scotland.mp4", flag: "gb" },
  { id: "poland", shape: "landscape", preview: "/media/story-poland-prev.mp4", full: "/media/story-poland.mp4", flag: "pl" },
  { id: "italy", shape: "portrait", preview: "/media/story-italy-prev.mp4", full: "/media/story-italy.mp4", flag: "it" },
  { id: "romania", shape: "landscape", preview: "/media/story-romania-prev.mp4", full: "/media/story-romania.mp4", flag: "ro" },
  { id: "scooter", shape: "portrait", preview: "/media/story-scooter-prev.mp4", full: "/media/story-scooter.mp4" },
  { id: "3", shape: "portrait", preview: "/media/story-3-prev.mp4", full: "/media/story-3.mp4" },
];

/* Pexels photographs (credits in docs/247clinic-v3-media-credits.md). */
export const PHOTOS = {
  why: { src: "/img/why-roomvisit.webp", w: 1600, h: 1068 },
  resort: { src: "/img/resort-aerial-2400.webp", small: "/img/resort-aerial-1200.webp", w: 2400, h: 1600 },
};

export type Logo = { name: string; src: string; w: number; h: number };

/* Official files in their own colours (the user, 2026-09-23: "colorful with their
   colors"). Sources in docs/247clinic-v3-media-credits.md. */
export const INSURERS: Logo[] = [
  { name: "Allianz", src: "/logos/insurers/allianz.svg", w: 533, h: 132 },
  { name: "AXA", src: "/logos/insurers/axa.svg", w: 100, h: 100 },
  { name: "Europ Assistance", src: "/logos/insurers/europ-assistance.webp", w: 600, h: 498 },
  { name: "International SOS", src: "/logos/insurers/international-sos.webp", w: 600, h: 352 },
  { name: "ADAC", src: "/logos/insurers/adac.svg", w: 609, h: 610 },
  { name: "Generali", src: "/logos/insurers/generali.svg", w: 323, h: 59 },
  { name: "ERGO", src: "/logos/insurers/ergo.svg", w: 361, h: 153 },
  { name: "HanseMerkur", src: "/logos/insurers/hansemerkur.svg", w: 512, h: 243 },
  { name: "Signal Iduna", src: "/logos/insurers/signal-iduna.svg", w: 1024, h: 191 },
  { name: "Bupa", src: "/logos/insurers/bupa.svg", w: 194, h: 194 },
  { name: "MetLife", src: "/logos/insurers/metlife.svg", w: 164, h: 36 },
  { name: "PZU", src: "/logos/insurers/pzu.svg", w: 472, h: 472 },
  { name: "Warta", src: "/logos/insurers/warta.svg", w: 1063, h: 192 },
  { name: "UNIQA", src: "/logos/insurers/uniqa.svg", w: 383, h: 69 },
  { name: "Mondial", src: "/logos/insurers/mondial.webp", w: 320, h: 130 },
  { name: "Connecx", src: "/logos/insurers/connecx.webp", w: 320, h: 172 },
];

/* Hotel brands where a 24/7 Clinic operates, with an official file that reads on white. */
export const HOTELS: Logo[] = [
  { name: "Jaz Hotels", src: "/logos/hotels/jaz.png", w: 96, h: 96 },
  { name: "Long Beach Resort", src: "/logos/hotels/longbeach.png", w: 122, h: 110 },
  { name: "Hilton", src: "/logos/hotels/hilton.svg", w: 500, h: 259 },
  { name: "Radisson Blu", src: "/logos/hotels/radisson-blu.svg", w: 162, h: 49 },
];

/* Their two published posts (www.247clinic.net), quoted exactly. Excerpts are left
   out: one is still Lorem ipsum on their site (brief section 30: remove it). */
export const POSTS = [
  { title: "Fast & Reliable Medical Services in the Red Sea", day: "22", month: "Nov 2023", img: "/img/post-red-sea.webp", href: "https://www.247clinic.net/article/2023/11/fast-reliable-medical-services-in-the-red-sea" },
  { title: "Unveiling the Best 24/7 Clinics for Travelers", day: "15", month: "Nov 2023", img: "/img/post-best-clinics.webp", href: "https://www.247clinic.net/article/2023/11/unveiling-the-best-urgent-clinics-for-travelers" },
];
