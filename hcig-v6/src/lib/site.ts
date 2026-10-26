// Paths for the two builds: assets and internal links carry the base path (/hcig/v6 on the preview, empty live).
import manifest from "../../public/media/manifest.json";

export const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const IS_PREVIEW = process.env.NEXT_PUBLIC_TARGET !== "live";

type Entry = { file: string; w?: number; h?: number };
const M = manifest as Record<string, Entry>;

/** A built media file by its key in media.json (public/media/manifest.json). */
export function asset(key: string): string {
  const e = M[key];
  if (!e) throw new Error(`unknown asset key: ${key}`);
  return `${BASE}/media/${e.file}`;
}
/** Intrinsic size of a built image, for width and height attributes (no layout shift). */
export function size(key: string): { width?: number; height?: number } {
  const e = M[key];
  return e ? { width: e.w, height: e.h } : {};
}
/** A file under public/ by its path. */
export const file = (p: string) => `${BASE}/${p.replace(/^\//, "")}`;
/** An internal page link. */
export const href = (p: string) => `${BASE}${p}`;

export const slug = (s: string) =>
  s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
