// A file under public/, with the preview's base path in front. Safe to import from client components
// (it pulls in no content).
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";
export const asset = (p: string) => (!p || p.startsWith("http") ? p : `${BASE_PATH}${p}`);

/** The six service photos in the order of the services, remade on 2026-09-30 from the live originals. */
export const SERVICE_IMAGES = ["msa", "emc", "tas", "mtss", "ia", "as"].map((k) => `/img/services/service-${k}.webp`);

/** Where each service photo's subject sits, as an object-position, so no head or face is cut (2026-10-06).
 *  card: the cards (about 5:3 to 16:10, about 80% of the photo's height shows).
 *  wide: the thin crops (the service window, each service page's banner, the wide tiles), about 35 to 50% shows. */
export const SERVICE_FOCUS = {
  card: ["50% 25%", "50% 15%", "50% 10%", "50% 0%", "50% 50%", "50% 50%"],
  wide: ["50% 12%", "50% 8%", "50% 5%", "50% 6%", "50% 25%", "50% 50%"],
};
