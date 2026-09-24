/* The home editor's stylesheet, generated from two files the editor writes:
     src/content/home-layout.json  per-section spacing and heading size
     src/content/home-edits.json   per-element changes (size, spacing, alignment, colour...)
   Used twice with the same code, so the saved file and the live preview never disagree:
   - the save server writes editsCss(..., "html:not(.e-live)") to src/app/editor-overrides.css
   - the editor preview injects editsCss(..., "html.e-live") with the pending changes merged
   The preview adds the class e-live to <html>, which switches the saved rules off, so a
   later change always shows (the bug of 2026-09-24: saved rules outranked new ones). */

export const MEDIA = {
  all: "",
  wide: "(min-width: 768px)", // section spacing set in the Desktop or Tablet view
  phone: "(max-width: 767px)",
  tablet: "(min-width: 768px) and (max-width: 1023px)",
  desktop: "(min-width: 1024px)",
};
export const DEVICE_OF_WIDTH = (w) => (w < 768 ? "phone" : w < 1024 ? "tablet" : "desktop");

/* What an element change may set. Anything else is refused. */
export const PROPS = ["zoom", "text-align", "color", "display", "margin-top", "margin-bottom", "line-height", "letter-spacing", "max-width"];
const SAFE_SEL = /^[^{}@<;]+$/;
const SAFE_VAL = /^(?:[#a-z0-9.%() ,-]+|var\(--[a-z0-9-]+\))$/i;
export const safeRule = (r) =>
  r && typeof r.selector === "string" && SAFE_SEL.test(r.selector) && r.media in MEDIA && r.props && typeof r.props === "object";

export function editsCss(layout, edits, scope) {
  const blocks = {};
  const add = (media, line) => { (blocks[media] ??= []).push(line); };

  for (const [name, st] of Object.entries(layout?.styles ?? {})) {
    const sec = `${scope} [data-e-section="${name}"] > *`;
    const wide = [], phone = [];
    if (st["--pad-top"]) wide.push(`padding-top: ${st["--pad-top"]} !important`);
    if (st["--pad-bottom"]) wide.push(`padding-bottom: ${st["--pad-bottom"]} !important`);
    if (st["--pad-top-m"]) phone.push(`padding-top: ${st["--pad-top-m"]} !important`);
    if (st["--pad-bottom-m"]) phone.push(`padding-bottom: ${st["--pad-bottom-m"]} !important`);
    if (wide.length) add("wide", `${sec} { ${wide.join("; ")}; }`);
    if (phone.length) add("phone", `${sec} { ${phone.join("; ")}; }`);
    if (st["--heading-scale"]) add("all", `${sec} :is(h1, h2, h3) { zoom: ${st["--heading-scale"]}; }`);
  }

  for (const r of edits?.rules ?? []) {
    if (!safeRule(r)) continue;
    const decl = Object.entries(r.props)
      .filter(([k, v]) => PROPS.includes(k) && v !== null && SAFE_VAL.test(String(v)))
      .map(([k, v]) => `${k}: ${v} !important`);
    if (decl.length) add(r.media, `${scope} ${r.selector} { ${decl.join("; ")}; }`);
  }

  return Object.entries(MEDIA)
    .filter(([m]) => blocks[m])
    .map(([m, q]) => (q ? `@media ${q} {\n  ${blocks[m].join("\n  ")}\n}` : blocks[m].join("\n")))
    .join("\n");
}

/* Merge element changes: {media, selector, props: {prop: value | null}}; null removes. */
export function mergeRules(rules, changes) {
  const out = rules.map((r) => ({ ...r, props: { ...r.props } }));
  for (const c of changes) {
    if (!safeRule(c)) continue;
    let r = out.find((x) => x.media === c.media && x.selector === c.selector);
    if (!r) { r = { media: c.media, selector: c.selector, props: {} }; out.push(r); }
    for (const [k, v] of Object.entries(c.props)) {
      if (!PROPS.includes(k)) continue;
      if (v === null) delete r.props[k]; else r.props[k] = String(v);
    }
  }
  return out.filter((r) => Object.keys(r.props).length);
}

export const FILE_HEAD = `/* Written by the home editor (npm run edit). Do not edit by hand: it is generated from
   src/content/home-layout.json and src/content/home-edits.json (editor/css.mjs). */
`;
