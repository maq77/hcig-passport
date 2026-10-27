// Paths for the two builds: assets and internal links carry the base path (/hcig/v6 on the preview, empty live).
import manifest from "../../public/media/manifest.json";

export const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
/** The site root without the language (media and other languages live here). */
export const ROOT = process.env.NEXT_PUBLIC_ROOT ?? "";
/** This build's language (one static build per language, see scripts/build-langs.mjs). */
export const LANG = process.env.NEXT_PUBLIC_LANG ?? "en";
export const IS_PREVIEW = process.env.NEXT_PUBLIC_TARGET !== "live";

type Entry = { file: string; w?: number; h?: number };
const M = manifest as Record<string, Entry>;

/** A built media file by its key in media.json (public/media/manifest.json). */
export function asset(key: string): string {
  const e = M[key];
  if (!e) throw new Error(`unknown asset key: ${key}`);
  return `${ROOT}/media/${e.file}`;
}
/** Intrinsic size of a built image, for width and height attributes (no layout shift). */
export function size(key: string): { width?: number; height?: number } {
  const e = M[key];
  return e ? { width: e.w, height: e.h } : {};
}
/** A file under public/ by its path. */
export const file = (p: string) => `${ROOT}/${p.replace(/^\//, "")}`;
/** The live site; every absolute URL (canonical, schema, sitemap) is built on it. */
export const SITE = "https://healthcareig.com";
/** The absolute live URL of a page of this build's language (translated addresses are applied after the build). */
export const abs = (p: string) => `${SITE}${LANG === "en" ? "" : "/" + LANG}${p}`;
/** The absolute live URL of a media file. */
export const absAsset = (key: string) => `${SITE}${asset(key).slice(ROOT.length)}`;
/** An internal page link. */
export const href = (p: string) => `${BASE}${p}`;

export const slug = (s: string) =>
  s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** The home of another language (English sits at the root). */
export const langHome = (code: string) => `${ROOT}/${code === "en" ? "" : code + "/"}`;
