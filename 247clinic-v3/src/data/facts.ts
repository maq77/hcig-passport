/* Facts the page may show that are not in the brief. Each was stated by the user.
   Nothing else may be added here without his word. */

export const PHONE = {
  display: "+20 122 222 8247",
  tel: "+201222228247",
  wa: "201222228247",
  source: "the user, 2026-09-23 (one number for call and WhatsApp)",
};

export const NUMBERS = [
  { value: 20, label: "Years of Healthcare Experience", source: "their own counter; the user 2026-09-23" },
  { value: 30, label: "Hotel & Resort Clinics", source: "the user 2026-09-23; matches the 30 clinics in their map data" },
  { value: 300, label: "Staff", source: "their own counter; the user 2026-09-23" },
] as const;

export const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const IS_PREVIEW = process.env.NEXT_PUBLIC_TARGET !== "live";

/* Prefix a public file path with the basePath (next/image is unoptimized, and plain
   <video>/<img> do not get the basePath added for them). */
export const asset = (p: string) => `${BASE}${p.startsWith("/") ? p : `/${p}`}`;
