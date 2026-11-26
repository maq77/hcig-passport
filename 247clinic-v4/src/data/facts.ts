/* Facts the page may show that are not in the brief. Each was stated by the user.
   Nothing else may be added here without his word. */

export const PHONE = {
  display: "+20 122 222 8247",
  tel: "+201222228247",
  wa: "201222228247",
  source: "the user, 2026-09-23 (one number for call and WhatsApp)",
};

export const NUMBERS = [
  { value: 40, label: "Years of Healthcare Experience", source: "their own counter; the user 2026-09-28" },
  { value: 150, suffix: "+", label: "Hotel & Resort Clinics", source: "the user 2026-11-12: \"130 ... to be 150+\"" },
  { value: 700, label: "Staff", source: "their own counter; the user 2026-09-28" },
] as const;

export const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const IS_PREVIEW = process.env.NEXT_PUBLIC_TARGET !== "live";
/* The live domain, and the preview host (moved to hcig-passport-psi on 2026-11-26, new Vercel account). */
export const SITE = "https://www.247clinic.net";
export const PREVIEW_HOST = "https://hcig-passport-psi.vercel.app";
/* Filled at live build time by go_live.ps1 from deploy/live-settings.json; empty means not used. */
export const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID ?? "";
export const GSC_TOKEN = process.env.NEXT_PUBLIC_GSC_TOKEN ?? "";

/* Prefix a public file path with the basePath (next/image is unoptimized, and plain
   <video>/<img> do not get the basePath added for them). */
export const asset = (p: string) => `${BASE}${p.startsWith("/") ? p : `/${p}`}`;

/* Their social pages, sent by the owner 2026-11-18. Order everywhere: Instagram, Facebook, YouTube, LinkedIn. */
export const SOCIAL = [
  { id: "instagram", label: "Instagram", href: "https://www.instagram.com/247clinics/" },
  { id: "facebook", label: "Facebook", href: "https://www.facebook.com/247clinictravelmedicalservices/" },
  { id: "youtube", label: "YouTube", href: "https://www.youtube.com/@24_7clincis" },
  { id: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/showcase/247travelmedical/" },
] as const;
