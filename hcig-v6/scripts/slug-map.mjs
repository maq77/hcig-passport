// Shared by build-langs.mjs and seo-post.mjs.
/** The translated address of an English path: the deepest mapped ancestor (or itself) is swapped, the rest kept. */
export function localPath(map, en) {
  let best = "";
  for (const k of Object.keys(map)) if (en.startsWith(k) && k.length > best.length) best = k;
  return best ? map[best] + en.slice(best.length) : en;
}

