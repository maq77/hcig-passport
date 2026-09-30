// A file under public/, with the preview's base path in front. Safe to import from client components
// (it pulls in no content).
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";
export const asset = (p: string) => (!p || p.startsWith("http") ? p : `${BASE_PATH}${p}`);

/** The six service photos in the order of the services, remade on 2026-09-30 from the live originals. */
export const SERVICE_IMAGES = ["msa", "emc", "tas", "mtss", "ia", "as"].map((k) => `/img/services/service-${k}.webp`);
