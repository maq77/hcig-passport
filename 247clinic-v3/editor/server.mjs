/* Save server for the dev-only home editor (npm run edit). Listens on 127.0.0.1:3100
   and writes only these files:
     - the home's content sources, a whole quoted string at a time (text edits)
     - src/content/home-layout.json (order, hidden, spacing, added blocks)
     - src/app/theme-overrides.css and src/app/editor-overrides.css
     - public/slots/<name>.webp (dropped images)
   Every text change is logged in content/247clinic/approved-edits.json so the
   word-for-word checker accepts the user's own wording, and in editor/changes.log.
   Requests must come from a localhost page: any other origin is refused, so a
   website open in another tab cannot write files through this server. */
import { createServer } from "node:http";
import { readFileSync, writeFileSync, appendFileSync, mkdirSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const V3 = join(HERE, "..");
const ROOT = join(V3, "..");
const CONTENT = join(ROOT, "content", "247clinic");
const EDITS = join(CONTENT, "approved-edits.json");
const LAYOUT = join(V3, "src", "content", "home-layout.json");
const CSS_FILES = { theme: join(V3, "src", "app", "theme-overrides.css"), rules: join(V3, "src", "app", "editor-overrides.css") };
const PORT = 3100;

/* Where the home's words come from, in the order a match is looked for. */
const SOURCES = [
  join(CONTENT, "en", "home.json"),
  join(CONTENT, "en", "global.json"),
  join(CONTENT, "en", "contact.json"),
  join(V3, "src", "content", "ui-labels.json"),
  join(V3, "src", "content", "brief.ts"),
  join(CONTENT, "reviews.json"),
];

const rel = (f) => relative(ROOT, f).replace(/\\/g, "/");
const LOCAL = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
const HOSTS = new Set([`127.0.0.1:${PORT}`, `localhost:${PORT}`]);

function log(what) {
  appendFileSync(join(HERE, "changes.log"), `${new Date().toISOString()}  ${what}\n`);
}

function approve(entry) {
  const edits = JSON.parse(readFileSync(EDITS, "utf8"));
  edits.edits.push({ date: new Date().toISOString().slice(0, 10), by: "the user, in the home editor", ...entry });
  writeFileSync(EDITS, JSON.stringify(edits, null, 2) + "\n");
}

/* A string exactly as it sits in a JSON or TS source, quotes included. */
const quoted = (s) => JSON.stringify(s);
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function replaceText(from, to) {
  const whole = new RegExp(`${escapeRe(quoted(from))}(?!\\s*:)`, "g");
  const changed = [];
  for (const f of SOURCES) {
    const src = readFileSync(f, "utf8");
    const n = (src.match(whole) || []).length;
    if (n) {
      writeFileSync(f, src.replace(whole, () => quoted(to)));
      changed.push(`${rel(f)} (${n})`);
    }
  }
  if (changed.length) return changed;
  /* Part of a longer string (a tag split out of a subheading, say): change it only
     when it occurs exactly once across every source, so nothing else moves. */
  const inner = quoted(from).slice(1, -1);
  const hits = SOURCES.map((f) => [f, readFileSync(f, "utf8").split(inner).length - 1]).filter(([, n]) => n);
  const total = hits.reduce((a, [, n]) => a + n, 0);
  if (total === 1) {
    const [f] = hits[0];
    writeFileSync(f, readFileSync(f, "utf8").replace(inner, () => quoted(to).slice(1, -1)));
    return [`${rel(f)} (part of a longer line)`];
  }
  const err = new Error(total > 1
    ? `"${from}" is part of ${total} different lines. Tell Claude which one to change.`
    : `"${from}" was not found in the home's content files. It may be built from two lines, or come from the hotel list. Tell Claude.`);
  err.status = 409;
  throw err;
}

/* An element rule from the editor: one selector, declarations only, no imports or URLs. */
function safeRule(r) {
  return typeof r === "string" && /^[^{}@<]+\{[^{}<>]+\}$/.test(r.trim()) && !/url\(|expression|javascript:/i.test(r);
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

  "POST /save/text": async (req) => {
    const { from, to } = await json(req);
    if (typeof from !== "string" || typeof to !== "string" || !from.trim() || !to.trim()) {
      throw Object.assign(new Error("Empty text"), { status: 400 });
    }
    const files = replaceText(from, to);
    approve({ kind: "edit", where: files.join(", "), from, to });
    log(`Text: "${from}" -> "${to}" in ${files.join(", ")}`);
    return { files };
  },

  "POST /save/layout": async (req) => {
    const { layout, added = [] } = await json(req);
    if (!layout || !Array.isArray(layout.order) || !Array.isArray(layout.hidden)) {
      throw Object.assign(new Error("Bad layout"), { status: 400 });
    }
    writeFileSync(LAYOUT, JSON.stringify(layout, null, 2) + "\n");
    const texts = added.filter((t) => typeof t === "string" && t.trim());
    if (texts.length) approve({ kind: "add", where: "home, added section", text: texts });
    log(`Layout: ${layout.order.filter((n) => !layout.hidden.includes(n)).join(", ")}${layout.hidden.length ? ` (hidden: ${layout.hidden.join(", ")})` : ""}`);
    return { ok: true };
  },

  "POST /save/theme": async (req) => {
    const { vars = {}, reset } = await json(req);
    const head = "/* Written by the home editor. Empty means the brand tokens in globals.css apply. */\n";
    if (reset) {
      writeFileSync(CSS_FILES.theme, head);
      log("Theme: reset to brand");
      return { ok: true };
    }
    const decl = Object.entries(vars)
      .filter(([k, v]) => /^--[a-z0-9-]+$|^font-size$/.test(k) && /^[#a-z0-9.%() ,-]+$/i.test(String(v)))
      .map(([k, v]) => `  ${k}: ${v};`).join("\n");
    writeFileSync(CSS_FILES.theme, `${head}:root {\n${decl}\n}\n`);
    log(`Theme: ${Object.entries(vars).map(([k, v]) => `${k} ${v}`).join(", ")}`);
    return { ok: true };
  },

  "POST /save/rules": async (req) => {
    const { rules = [] } = await json(req);
    const ok = rules.filter(safeRule);
    if (ok.length) appendFileSync(CSS_FILES.rules, `\n/* ${new Date().toISOString()} */\n${ok.join("\n")}\n`);
    log(`Element rules: ${ok.length}${ok.length < rules.length ? ` (${rules.length - ok.length} refused)` : ""}`);
    return { saved: ok.length };
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
