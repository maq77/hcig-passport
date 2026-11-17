// kb:build. Reads the TMASI sources (read only), writes normalised markdown with [src:<slug>#<n>] tags
// per paragraph plus data/kb/manifest.json. Deterministic: no timestamps, stable sort and slugs.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export type KbKind = "site" | "data" | "news" | "core_facts" | "staff_faq" | "owner_upload";
export type KbUsage = "prompt" | "rag";

export interface ManifestEntry {
  slug: string;
  lang: string;
  kind: KbKind;
  usage_mode: KbUsage;
  title: string;
  /** Path of the built markdown, relative to the data folder (kb/<lang>/<slug>.md). */
  path: string;
  source_path: string;
  content_hash: string;
}

export interface Manifest {
  docs: ManifestEntry[];
}

export interface BuildResult {
  manifest: Manifest;
  excluded: { source: string; sentence: string }[];
  perLang: Record<string, number>;
}

const HERE = dirname(fileURLToPath(import.meta.url));
export const MONOREPO = resolve(HERE, "..", "..", "..");
export const REPO_ROOT = resolve(MONOREPO, "..");

function dataFolder(): string {
  return process.env.DATA_DIR ? resolve(process.env.DATA_DIR) : join(MONOREPO, "data");
}
export function kbDir(): string {
  return join(dataFolder(), "kb");
}

// ---------------------------------------------------------------------------
// text helpers
// ---------------------------------------------------------------------------
const ACCRED = /accredited|accreditation|akkreditiert|akkreditierung|acreditad|akredytowan|akreditovan/i;
const ABBREV = /\b(?:Dr|Mr|Mrs|Ms|Prof|St|No|Inc|Ltd|vs|etc)\.$/i;

export function splitSentences(text: string): string[] {
  const parts: string[] = [];
  let start = 0;
  const re = /[.!?]+["')”’]*\s+(?=\S)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const end = m.index + m[0].length;
    const head = text.slice(start, m.index + m[0].trimEnd().length);
    if (ABBREV.test(head)) continue;
    parts.push(text.slice(start, end).trim());
    start = end;
  }
  const tail = text.slice(start).trim();
  if (tail) parts.push(tail);
  return parts;
}

/** Removes every sentence that mentions accreditation. Returns the kept text and the removed sentences. */
export function stripAccreditation(text: string): { kept: string; removed: string[] } {
  if (!ACCRED.test(text)) return { kept: text, removed: [] };
  const removed: string[] = [];
  const kept: string[] = [];
  for (const s of splitSentences(text)) {
    if (ACCRED.test(s)) removed.push(s);
    else kept.push(s);
  }
  return { kept: kept.join(" "), removed };
}

const sha = (s: string) => createHash("sha256").update(s, "utf8").digest("hex");
const norm = (s: string) => s.replace(/\r\n?/g, "\n").replace(/ /g, " ");
const words = (s: string) => s.trim().split(/\s+/).filter(Boolean);
const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
const read = (f: string) => norm(readFileSync(f, "utf8").replace(/^﻿/, ""));

// ---------------------------------------------------------------------------
// intermediate doc model: a list of headings and paragraphs
// ---------------------------------------------------------------------------
type Line = { t: "h"; level: number; text: string } | { t: "p"; text: string; exempt?: boolean };
interface RawDoc {
  base: string; // slug without the language suffix
  lang: string;
  kind: KbKind;
  usage: KbUsage;
  title: string;
  sourcePath: string;
  lines: Line[];
}

const h = (level: number, text: string): Line => ({ t: "h", level, text });
const p = (text: string): Line => ({ t: "p", text });

function readJson(rel: string): any {
  return JSON.parse(read(join(REPO_ROOT, rel)));
}

// ---------------------------------------------------------------------------
// renderers
// ---------------------------------------------------------------------------
function renderOffices(): RawDoc {
  const data = readJson("content/tmasi/offices.json") as any[];
  const lines: Line[] = [h(1, "TMASI offices")];
  for (const o of data) {
    const bits = [`${o.country}${o.isHQ ? " (headquarters)" : ""}`, `city: ${o.city}`, `address: ${o.address}`, `phone: ${o.phone}`, `email: ${o.email}`];
    lines.push(p(`- ${bits.join("; ")}`));
  }
  return { base: "offices", lang: "en", kind: "data", usage: "rag", title: "TMASI offices", sourcePath: "content/tmasi/offices.json", lines };
}

function renderServices(): RawDoc {
  const data = readJson("content/tmasi/services.json") as any[];
  const lines: Line[] = [h(1, "TMASI services")];
  for (const g of data) {
    lines.push(h(2, g.title));
    if (g.summary) lines.push(p(g.summary));
    for (const it of g.items ?? []) lines.push(p(`- ${it.title}: ${it.description}`));
  }
  return { base: "services", lang: "en", kind: "data", usage: "rag", title: "TMASI services", sourcePath: "content/tmasi/services.json", lines };
}

function renderSite(): RawDoc {
  const s = readJson("content/tmasi/site.json");
  const lines: Line[] = [h(1, `${s.brandName} (${s.fullName})`)];
  const heads: Record<string, string> = { taglines: "Taglines", mission: "Mission", vision: "Vision", stats: "Published figures", coreValues: "Core values", emergencyContact: "Emergency contact" };
  for (const [k, v] of Object.entries(s)) {
    if (k === "brandName" || k === "fullName") continue;
    lines.push(h(2, heads[k] ?? k));
    if (typeof v === "string") lines.push(p(v));
    else if (Array.isArray(v)) {
      for (const x of v) {
        if (typeof x === "string") lines.push(p(`- ${x}`));
        else if (x && typeof x === "object") lines.push(p(`- ${Object.entries(x).filter(([, y]) => typeof y === "string" || typeof y === "number").map(([a, y]) => `${a}: ${y}`).join("; ")}`));
      }
    } else if (v && typeof v === "object") lines.push(p(Object.entries(v).map(([a, y]) => `${a}: ${y}`).join("; ")));
  }
  return { base: "site", lang: "en", kind: "data", usage: "rag", title: "TMASI company profile", sourcePath: "content/tmasi/site.json", lines };
}

function renderLeadership(): RawDoc {
  const data = readJson("content/tmasi/leadership.json") as any[];
  const lines: Line[] = [h(1, "TMASI leadership")];
  for (const l of data) {
    lines.push(h(2, `${l.name}, ${l.role}`));
    for (const b of l.bio ?? []) lines.push(p(b));
  }
  return { base: "leadership", lang: "en", kind: "data", usage: "rag", title: "TMASI leadership", sourcePath: "content/tmasi/leadership.json", lines };
}

function renderNews(): RawDoc {
  const data = readJson("content/tmasi/news.json") as any[];
  const lines: Line[] = [h(1, "TMASI news")];
  for (const n of data) {
    lines.push(h(2, n.title));
    lines.push(p(`${n.date}${n.location ? `, ${n.location}` : ""}`));
    if (n.summary) lines.push(p(n.summary));
    for (const para of n.paragraphs ?? []) lines.push(p(para));
  }
  return { base: "news", lang: "en", kind: "data", usage: "rag", title: "TMASI news", sourcePath: "content/tmasi/news.json", lines };
}

// live site JSON ------------------------------------------------------------
const SKIP_KEYS = new Set(["src", "href", "img", "image", "images", "slug", "id", "url", "alt", "class", "className", "icon", "lang", "color", "poster", "video", "srcset", "designSlot", "path", "file"]);

const looksTechnical = (s: string) =>
  /^(https?:|mailto:|tel:|\/|#|\.{1,2}\/)/i.test(s) ||
  /^#[0-9a-f]{3,8}$/i.test(s) ||
  /\.(png|jpe?g|webp|avif|svg|gif|mp4|webm|json|css|js|pdf)$/i.test(s) ||
  (/^[a-z0-9_-]+(\s+[a-z0-9_-]+)*$/.test(s) && /[-_]/.test(s) && words(s).length < 3);

const isHumanString = (s: string) => {
  const t = s.trim();
  if (!t || looksTechnical(t)) return false;
  const n = words(t).length;
  return n >= 3 || (n >= 2 && /^[A-ZÀ-Ý]/.test(t) && t.length <= 80 && !/[{}<>=]/.test(t));
};

function collectStrings(v: unknown, out: string[], key = ""): void {
  if (typeof v === "string") {
    if (!SKIP_KEYS.has(key) && isHumanString(v)) out.push(v.trim());
  } else if (Array.isArray(v)) {
    for (const x of v) collectStrings(x, out, key);
  } else if (v && typeof v === "object") {
    for (const [k, x] of Object.entries(v)) collectStrings(x, out, k);
  }
}

function renderLive(lang: string): RawDoc {
  const rel = `tmasi-next/src/content/live/${lang}.json`;
  const data = readJson(rel);
  const lines: Line[] = [h(1, `TMASI website (${lang.toUpperCase()})`)];
  for (const [k, v] of Object.entries(data)) {
    const strs: string[] = [];
    collectStrings(v, strs, k);
    const uniq = [...new Set(strs)];
    if (!uniq.length) continue;
    lines.push(h(2, k));
    for (const s of uniq) lines.push(p(s));
  }
  return { base: "site-live", lang, kind: "site", usage: "rag", title: `TMASI website text (${lang.toUpperCase()})`, sourcePath: rel, lines };
}

// ts string literals ----------------------------------------------------------
export function extractTsStrings(src: string): string[] {
  const out: string[] = [];
  let i = 0;
  const n = src.length;
  while (i < n) {
    const c = src[i]!;
    if (c === "/" && src[i + 1] === "/") {
      while (i < n && src[i] !== "\n") i++;
      continue;
    }
    if (c === "/" && src[i + 1] === "*") {
      const e = src.indexOf("*/", i + 2);
      i = e < 0 ? n : e + 2;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      let j = i + 1;
      let buf = "";
      let hasExpr = false;
      while (j < n && src[j] !== c) {
        if (src[j] === "\\") {
          const nx = src[j + 1] ?? "";
          buf += nx === "n" || nx === "t" ? " " : nx;
          j += 2;
          continue;
        }
        if (c === "`" && src[j] === "$" && src[j + 1] === "{") hasExpr = true;
        if (c !== "`" && src[j] === "\n") break;
        buf += src[j];
        j++;
      }
      i = j + 1;
      if (!hasExpr) out.push(buf.replace(/\s+/g, " ").trim());
      continue;
    }
    i++;
  }
  return out.filter((s) => s.includes(" ") && words(s).length >= 4 && !looksTechnical(s) && !/[{}]|=>|\bfunction\b|\bimport\b/.test(s));
}

function renderTs(name: string): RawDoc {
  if (name === "reviews") throw new Error("reviews.ts must never be read");
  const rel = `tmasi-next/src/content/${name}.ts`;
  const strs = [...new Set(extractTsStrings(read(join(REPO_ROOT, rel))))];
  const lines: Line[] = [h(1, `TMASI website copy: ${name}`)];
  for (const s of strs) lines.push(p(s));
  return { base: `site-${name}`, lang: "en", kind: "site", usage: "rag", title: `TMASI website copy: ${name}`, sourcePath: rel, lines };
}

// sponsor news -----------------------------------------------------------------
function paragraphsOf(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((x) => x.replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean);
}

function renderSponsor(): RawDoc[] {
  const docs: RawDoc[] = [];
  const dir = join(REPO_ROOT, "tmasi sponsor");
  const add = (file: string, rel: string, lang: string, base: string) => {
    const paras = paragraphsOf(read(file));
    if (!paras.length) return;
    const title = `TMASI ${base.replace("-", " ")} (${lang.toUpperCase()})`;
    const lines: Line[] = [h(1, title)];
    for (const x of paras) lines.push(p(x));
    docs.push({ base, lang, kind: "news", usage: "rag", title, sourcePath: rel, lines });
  };
  for (const n of ["1", "2"]) {
    const f = join(dir, `news ${n} content.txt`);
    if (existsSync(f)) add(f, `tmasi sponsor/news ${n} content.txt`, "en", `news-${n}`);
  }
  const tdir = join(dir, "translations");
  if (existsSync(tdir)) {
    for (const f of readdirSync(tdir).sort()) {
      if (!f.toLowerCase().endsWith(".txt") || /notes/i.test(f)) continue; // translator notes are not knowledge
      const stem = f.replace(/\.txt$/i, "");
      const m = /(?:^|[\s_-])(de|es|pl)$/i.exec(stem);
      const num = /news\s*(\d+)/i.exec(stem)?.[1];
      const lang = m ? m[1]!.toLowerCase() : "en";
      add(join(tdir, f), `tmasi sponsor/translations/${f}`, lang, `news-${num ?? slugify(stem)}`);
    }
  }
  return docs;
}

// core facts --------------------------------------------------------------------
function renderCoreFacts(): RawDoc[] {
  const dir = join(MONOREPO, "agent", "core-facts");
  if (!existsSync(dir)) return [];
  const docs: RawDoc[] = [];
  for (const f of readdirSync(dir).sort()) {
    if (!f.endsWith(".md")) continue;
    const lang = f.replace(/\.md$/, "");
    let body = read(join(dir, f));
    let title = "TMASI Core Facts";
    const fm = /^---\n([\s\S]*?)\n---\n/.exec(body);
    if (fm) {
      const t = /^title:\s*(.+)$/m.exec(fm[1]!);
      if (t) title = t[1]!.trim();
      body = body.slice(fm[0].length);
    }
    const lines: Line[] = [];
    let never = false;
    for (const raw of body.split("\n")) {
      const line = raw.trimEnd();
      if (!line.trim()) continue;
      const hm = /^(#{1,6})\s+(.*)$/.exec(line);
      if (hm) {
        never = /^never say\b/i.test(hm[2]!.trim());
        lines.push(h(hm[1]!.length, hm[2]!.trim()));
      } else {
        lines.push({ t: "p", text: line.trim(), exempt: never });
      }
    }
    docs.push({ base: "core-facts", lang, kind: "core_facts", usage: "prompt", title, sourcePath: `tmasi-callcenter/agent/core-facts/${f}`, lines });
  }
  return docs;
}

// ---------------------------------------------------------------------------
// build
// ---------------------------------------------------------------------------
export function buildKb(): BuildResult {
  const raw: RawDoc[] = [
    renderOffices(),
    renderServices(),
    renderSite(),
    renderLeadership(),
    renderNews(),
    ...["en", "de", "es", "pl"].map(renderLive),
    ...["assist", "trust", "ui", "maritime"].map(renderTs),
    ...renderSponsor(),
    ...renderCoreFacts(),
  ];
  raw.sort((a, b) => a.lang.localeCompare(b.lang) || a.base.localeCompare(b.base));

  const root = kbDir();
  rmSync(root, { recursive: true, force: true });
  mkdirSync(root, { recursive: true });
  const manifest: ManifestEntry[] = [];
  const excluded: { source: string; sentence: string }[] = [];
  const perLang: Record<string, number> = {};

  for (const d of raw) {
    const slug = `${d.base}-${d.lang}`;
    let n = 0;
    const out: string[] = [];
    for (const l of d.lines) {
      if (l.t === "h") {
        out.push(`${"#".repeat(Math.min(l.level, 6))} ${l.text}`);
        continue;
      }
      let text = l.text;
      if (!l.exempt) {
        const r = stripAccreditation(text);
        for (const s of r.removed) excluded.push({ source: `${d.sourcePath} (${d.lang})`, sentence: s });
        text = r.kept;
      }
      if (!text.trim() || /^[-*]\s*$/.test(text.trim())) continue;
      n++;
      out.push(`[src:${slug}#${n}] ${text}`);
    }
    if (n === 0) continue;
    const bodyMd = out.join("\n\n") + "\n";
    const contentHash = sha(bodyMd);
    const rel = `kb/${d.lang}/${slug}.md`;
    const front = [
      "---",
      `source_path: ${d.sourcePath}`,
      `kind: ${d.kind}`,
      `lang: ${d.lang}`,
      `title: ${JSON.stringify(d.title)}`,
      `usage_mode: ${d.usage}`,
      `content_hash: ${contentHash}`,
      "---",
      "",
    ].join("\n");
    const file = join(dataFolder(), rel);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, front + "\n" + bodyMd, "utf8");
    manifest.push({ slug, lang: d.lang, kind: d.kind, usage_mode: d.usage, title: d.title, path: rel, source_path: d.sourcePath, content_hash: contentHash });
    perLang[d.lang] = (perLang[d.lang] ?? 0) + 1;
  }

  manifest.sort((a, b) => a.lang.localeCompare(b.lang) || a.kind.localeCompare(b.kind) || a.slug.localeCompare(b.slug));
  const m: Manifest = { docs: manifest };
  writeFileSync(join(root, "manifest.json"), JSON.stringify(m, null, 2) + "\n", "utf8");
  const ex = excluded.map((e) => `${e.source}\n  ${e.sentence}`).join("\n");
  writeFileSync(join(root, "excluded.txt"), ex ? ex + "\n" : "", "utf8");
  return { manifest: m, excluded, perLang };
}

/** Parsed data/kb/manifest.json. Throws a clear error when kb:build has not run. */
export function readManifest(): Manifest {
  const f = join(kbDir(), "manifest.json");
  if (!existsSync(f)) throw new Error(`No manifest at ${f}. Run "npm run kb:build" first.`);
  return JSON.parse(readFileSync(f, "utf8")) as Manifest;
}

/** The body of a built doc (front matter removed). */
export function readDocBody(entry: ManifestEntry): string {
  const raw = readFileSync(join(dataFolder(), entry.path), "utf8");
  const m = /^---\n[\s\S]*?\n---\n\n?/.exec(raw);
  return m ? raw.slice(m[0].length) : raw;
}
