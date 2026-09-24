/* Save server for the dev-only home editor (npm run edit). Listens on 127.0.0.1:3100
   and writes only these files:
     - the home's content sources (text edits), matched inside the section clicked first
     - src/content/home-layout.json (order, hidden, section spacing, added blocks)
     - src/content/home-edits.json (element changes: size, spacing, alignment, colour...)
     - src/app/editor-overrides.css, generated from the two files above (editor/css.mjs)
     - src/app/theme-overrides.css (brand colours, base text, page-wide section gap)
     - public/slots/<name>.webp (dropped images)
   Every text change is logged in content/247clinic/approved-edits.json so the word check
   accepts the user's own wording, and in editor/changes.log.
   Requests must come from a localhost page: any other origin is refused, so a website
   open in another tab cannot write files through this server. */
import { createServer } from "node:http";
import { readFileSync, writeFileSync, appendFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { editsCss, mergeRules, FILE_HEAD } from "./css.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const V3 = join(HERE, "..");
const ROOT = join(V3, "..");
const CONTENT = join(ROOT, "content", "247clinic");
const APPROVED = join(CONTENT, "approved-edits.json");
const HOME = join(CONTENT, "en", "home.json");
const LAYOUT = join(V3, "src", "content", "home-layout.json");
const ELEMENTS = join(V3, "src", "content", "home-edits.json");
const CSS_OUT = join(V3, "src", "app", "editor-overrides.css");
const THEME = join(V3, "src", "app", "theme-overrides.css");
const PORT = 3100;

/* Where the home's words come from, in the order a match is looked for. */
const SOURCES = [
  HOME,
  join(CONTENT, "en", "global.json"),
  join(CONTENT, "en", "contact.json"),
  join(V3, "src", "content", "ui-labels.json"),
  join(V3, "src", "content", "brief.ts"),
  join(CONTENT, "reviews.json"),
];
/* Which home.json sections each page section draws its words from. */
const SECTION_IDS = {
  Hero: ["hero"], HotelBand: ["trust-numbers"], Facilities: ["accreditation-block"], Services: ["medical-services"],
  Intro: ["what-is-247-clinic"], HowItWorks: ["how-it-works"], Insurance: ["insurance-cashless-care"],
  Stories: ["reviews-testimonials"], Finder: ["find-a-clinic"], FinalCta: ["faq-home", "final-cta"],
};

const rel = (f) => relative(ROOT, f).replace(/\\/g, "/");
const LOCAL = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
const HOSTS = new Set([`127.0.0.1:${PORT}`, `localhost:${PORT}`]);
const readJson = (f, fallback) => (existsSync(f) ? JSON.parse(readFileSync(f, "utf8")) : fallback);
const writeJson = (f, v) => writeFileSync(f, JSON.stringify(v, null, 2) + "\n");

function log(what) {
  appendFileSync(join(HERE, "changes.log"), `${new Date().toISOString()}  ${what}\n`);
}
function approve(entry) {
  const a = readJson(APPROVED, null);
  if (!a) throw Object.assign(new Error("approved-edits.json is missing"), { status: 500 });
  a.edits.push({ date: new Date().toISOString().slice(0, 10), by: "the user, in the home editor", ...entry });
  writeJson(APPROVED, a);
}

/* Regenerate the editor stylesheet from the layout and element files. */
export function regenerate() {
  const css = editsCss(readJson(LAYOUT, {}), readJson(ELEMENTS, { rules: [] }), "html:not(.e-live)");
  writeFileSync(CSS_OUT, `${FILE_HEAD}${css ? `\n${css}\n` : ""}`);
}

/* Text: first inside the home.json sections of the section that was clicked, so the same
   words used elsewhere (a hero line that is also a service title) stay as they are. */
function replaceInSections(ids, from, to) {
  const home = readJson(HOME, null);
  const targets = home.sections.filter((s) => ids.includes(s.id));
  if (!targets.length) return null;
  let whole = 0;
  const walk = (o) => {
    for (const k of Object.keys(o)) {
      if (k === "devNotes") continue;
      if (typeof o[k] === "string" && o[k] === from) { o[k] = to; whole++; }
      else if (o[k] && typeof o[k] === "object") walk(o[k]);
    }
  };
  targets.forEach(walk);
  if (!whole) {
    /* Part of a longer line (one line of a two-line heading): only when it occurs once. */
    const hits = [];
    const find = (o) => {
      for (const k of Object.keys(o)) {
        if (k === "devNotes") continue;
        if (typeof o[k] === "string" && o[k].includes(from)) hits.push([o, k]);
        else if (o[k] && typeof o[k] === "object") find(o[k]);
      }
    };
    targets.forEach(find);
    const count = hits.reduce((n, [o, k]) => n + o[k].split(from).length - 1, 0);
    if (count !== 1) return null;
    const [o, k] = hits[0];
    o[k] = o[k].replace(from, () => to);
  }
  writeJson(HOME, home);
  return [`content/247clinic/en/home.json (${targets.map((t) => t.id).join(", ")})`];
}

const quoted = (s) => JSON.stringify(s);
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
function replaceAnywhere(from, to) {
  const whole = new RegExp(`${escapeRe(quoted(from))}(?!\\s*:)`, "g");
  const changed = [];
  for (const f of SOURCES) {
    const src = readFileSync(f, "utf8");
    const n = (src.match(whole) || []).length;
    if (n) { writeFileSync(f, src.replace(whole, () => quoted(to))); changed.push(`${rel(f)} (${n})`); }
  }
  if (changed.length) return changed;
  const inner = quoted(from).slice(1, -1);
  const hits = SOURCES.map((f) => [f, readFileSync(f, "utf8").split(inner).length - 1]).filter(([, n]) => n);
  const total = hits.reduce((a, [, n]) => a + n, 0);
  if (total === 1) {
    const [f] = hits[0];
    writeFileSync(f, readFileSync(f, "utf8").replace(inner, () => quoted(to).slice(1, -1)));
    return [`${rel(f)} (part of a longer line)`];
  }
  throw Object.assign(new Error(total > 1
    ? `"${from}" is part of ${total} different lines. Tell Claude which one to change.`
    : `"${from}" was not found in the home's content files. It may be built from two lines, or come from the hotel list. Tell Claude.`), { status: 409 });
}

function body(req, limit = 30e6) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (c) => {
      size += c.length;
      if (size > limit) { reject(Object.assign(new Error("Too large"), { status: 413 })); req.destroy(); }
      else chunks.push(c);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}
const json = async (req) => {
  try { return JSON.parse((await body(req, 2e6)).toString("utf8")); }
  catch { throw Object.assign(new Error("Bad request"), { status: 400 }); }
};

const routes = {
  "GET /changes": async () => {
    try { return readFileSync(join(HERE, "changes.log"), "utf8"); } catch { return ""; }
  },

  "GET /edits": async () => ({ layout: readJson(LAYOUT, {}), elements: readJson(ELEMENTS, { rules: [] }) }),

  "POST /save/text": async (req) => {
    const { from, to, section } = await json(req);
    if (typeof from !== "string" || typeof to !== "string" || !from.trim() || !to.trim()) {
      throw Object.assign(new Error("Empty text"), { status: 400 });
    }
    const files = (SECTION_IDS[section] && replaceInSections(SECTION_IDS[section], from, to)) || replaceAnywhere(from, to);
    approve({ kind: "edit", where: files.join(", "), from, to });
    log(`Text: "${from}" -> "${to}" in ${files.join(", ")}`);
    return { files };
  },

  "POST /save/layout": async (req) => {
    const { layout, added = [] } = await json(req);
    if (!layout || !Array.isArray(layout.order) || !Array.isArray(layout.hidden)) {
      throw Object.assign(new Error("Bad layout"), { status: 400 });
    }
    writeJson(LAYOUT, layout);
    regenerate();
    const texts = added.filter((t) => typeof t === "string" && t.trim());
    if (texts.length) approve({ kind: "add", where: "home, added section", text: texts });
    log(`Layout: ${layout.order.filter((n) => !layout.hidden.includes(n)).join(", ")}${layout.hidden.length ? ` (hidden: ${layout.hidden.join(", ")})` : ""}`);
    return { ok: true };
  },

  "POST /save/elements": async (req) => {
    const { changes = [] } = await json(req);
    const cur = readJson(ELEMENTS, { rules: [] });
    const next = { ...cur, rules: mergeRules(cur.rules ?? [], changes) };
    writeJson(ELEMENTS, next);
    regenerate();
    log(`Element changes: ${changes.length}`);
    return next;
  },

  "POST /save/theme": async (req) => {
    const { vars = {}, reset } = await json(req);
    const head = "/* Written by the home editor. Empty means the brand tokens in globals.css apply. */\n";
    if (reset) {
      writeFileSync(THEME, head);
      log("Theme: reset to brand");
      return { ok: true };
    }
    const ok = Object.entries(vars).filter(([k, v]) => /^--[a-z0-9-]+$|^font-size$/.test(k) && /^[#a-z0-9.%() ,-]+$/i.test(String(v)));
    /* --section-m is the space between sections on phones: written as --section for them. */
    const decl = ok.filter(([k]) => k !== "--section-m").map(([k, v]) => `  ${k}: ${v};`).join("\n");
    const phone = ok.find(([k]) => k === "--section-m");
    writeFileSync(THEME, `${head}:root {\n${decl}\n}\n${phone ? `@media (max-width: 767px) {\n  :root { --section: ${phone[1]}; }\n}\n` : ""}`);
    log(`Theme: ${ok.map(([k, v]) => `${k} ${v}`).join(", ")}`);
    return { ok: true };
  },

  "POST /save/image": async (req) => {
    const raw = String(req.headers["x-slot-name"] || "");
    const name = raw.replace(/\.[a-z0-9]+$/i, "").toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (!name) throw Object.assign(new Error("No slot name"), { status: 400 });
    const buf = await body(req);
    const sharp = (await import("sharp")).default;
    const out = join(V3, "public", "slots", `${name}.webp`);
    mkdirSync(dirname(out), { recursive: true });
    const info = await sharp(buf).rotate().resize({ width: 2400, withoutEnlargement: true }).webp({ quality: 82 }).toFile(out);
    log(`Image: public/slots/${name}.webp (${info.width} x ${info.height})`);
    return { file: `${name}.webp`, width: info.width, height: info.height };
  },
};

/* Only when run as the server (npm run edit), not when imported for regenerate(). */
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  regenerate();
  createServer(async (req, res) => {
    const origin = req.headers.origin || "";
    const allowed = HOSTS.has(req.headers.host || "") && LOCAL.test(origin);
    if (!allowed) { res.writeHead(403); return res.end("Only the local editor may use this server."); }
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Slot-Name");
    res.setHeader("Vary", "Origin");
    if (req.method === "OPTIONS") { res.writeHead(204); return res.end(); }

    const route = routes[`${req.method} ${req.url.split("?")[0]}`];
    if (!route) { res.writeHead(404); return res.end(); }
    try {
      const out = await route(req);
      res.writeHead(200, { "Content-Type": typeof out === "string" ? "text/plain; charset=utf-8" : "application/json" });
      res.end(typeof out === "string" ? out : JSON.stringify(out));
    } catch (e) {
      res.writeHead(e.status || 500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: e.message }));
    }
  }).listen(PORT, "127.0.0.1", () => {
    console.log(`Editor save server on http://127.0.0.1:${PORT}`);
  });
}
