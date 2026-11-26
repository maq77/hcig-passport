/* Live-build SEO files and audit (go-live prep 2026-11-26, his ask: "make sure seo and aeo and og and everything is
   right ... dont affect google or rankings but even make it better").
   Run after `V3_TARGET=live npm run build`. Reads every exported page in out/, then:
   - fails if an indexable page lacks a title, a meta description, a canonical on https://www.247clinic.net/<path>,
     og:title, og:description, og:url or an absolute og:image, or if any page still says noindex by mistake;
   - writes out/sitemap.xml (indexable pages only, lastmod from the article dates, else today),
     out/robots.txt (everything open, AI answer engines named and allowed, the sitemap line),
     out/llms.txt (the site in plain words for AI answer engines: every page with its own title and description).
   Usage: node scripts/seo-files.mjs [--preview]   (--preview audits the preview build without the live checks) */
import fs from "node:fs";
import path from "node:path";

const SITE = "https://www.247clinic.net";
const OUT = path.resolve("out");
const PREVIEW = process.argv.includes("--preview");
const today = new Date().toISOString().slice(0, 10);
const articles = JSON.parse(fs.readFileSync(path.resolve("..", "content", "247clinic", "en", "blog-articles.json"), "utf8")).articles;
const articleDate = Object.fromEntries(articles.map((a) => [`/blog/${a.slug}`, a.date]));

const pages = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== "_next" && e.name !== "_not-found") walk(p); continue; }
    if (!e.name.endsWith(".html")) continue;
    const rel = path.relative(OUT, p).replace(/\\/g, "/").replace(/\.html$/, "");
    if (rel === "404" || rel === "_not-found") continue;
    const route = rel === "index" ? "/" : `/${rel.replace(/\/index$/, "")}`;
    pages.push({ route, file: p });
  }
})(OUT);

const attr = (html, re) => { const m = html.match(re); return m ? m[1].replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"') : ""; };
const problems = [];
const index = [];
for (const pg of pages.sort((a, b) => a.route.localeCompare(b.route))) {
  const html = fs.readFileSync(pg.file, "utf8");
  const head = html.slice(0, html.indexOf("</head>") + 7);
  const robots = attr(head, /<meta name="robots" content="([^"]*)"/);
  const title = attr(head, /<title>([^<]*)<\/title>/);
  const desc = attr(head, /<meta name="description" content="([^"]*)"/);
  const canon = attr(head, /<link rel="canonical" href="([^"]*)"/);
  const ogTitle = attr(head, /<meta property="og:title" content="([^"]*)"/);
  const ogDesc = attr(head, /<meta property="og:description" content="([^"]*)"/);
  const ogUrl = attr(head, /<meta property="og:url" content="([^"]*)"/);
  const ogImg = attr(head, /<meta property="og:image" content="([^"]*)"/);
  const noindex = /noindex/i.test(robots);
  const want = `${SITE}${pg.route === "/" ? "/" : pg.route}`;
  if (!PREVIEW && !noindex) {
    if (!title) problems.push(`${pg.route}: no <title>`);
    if (!desc) problems.push(`${pg.route}: no meta description`);
    const same = (u) => u === want || (pg.route === "/" && u === SITE);
    if (!same(canon)) problems.push(`${pg.route}: canonical "${canon}" should be "${want}"`);
    if (!ogTitle || !ogDesc) problems.push(`${pg.route}: og:title or og:description missing`);
    if (!same(ogUrl)) problems.push(`${pg.route}: og:url "${ogUrl}" should be "${want}"`);
    if (!/^https:\/\//.test(ogImg)) problems.push(`${pg.route}: og:image not absolute ("${ogImg}")`);
    if (!/application\/ld\+json/.test(html)) problems.push(`${pg.route}: no structured data`);
  }
  if (!PREVIEW && noindex && pg.route !== "/hotel-clinics") problems.push(`${pg.route}: noindex on a live page`);
  if (!noindex) index.push({ route: pg.route, title, desc, lastmod: articleDate[pg.route] ?? today });
}

if (problems.length) {
  console.error(`seo-files: ${problems.length} problem(s):\n  ${problems.join("\n  ")}`);
  process.exit(1);
}

const prio = (r) => (r === "/" ? "1.0" : /^\/(services|insurance|our-clinics|for-hotels|contact-us)$/.test(r) ? "0.9" : r.startsWith("/clinics/") ? "0.6" : "0.8");
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${index
  .map((p) => `  <url><loc>${SITE}${p.route === "/" ? "/" : p.route}</loc><lastmod>${p.lastmod}</lastmod><priority>${prio(p.route)}</priority></url>`)
  .join("\n")}\n</urlset>\n`;
fs.writeFileSync(path.join(OUT, "sitemap.xml"), xml);

const robots = `# 24/7 Clinic, www.247clinic.net
User-agent: *
Allow: /

# AI answer engines are welcome to read and cite the site
User-agent: GPTBot
Allow: /
User-agent: OAI-SearchBot
Allow: /
User-agent: ChatGPT-User
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: Google-Extended
Allow: /

Sitemap: ${SITE}/sitemap.xml
`;
fs.writeFileSync(path.join(OUT, "robots.txt"), robots);

const group = (re) => index.filter((p) => re.test(p.route));
const line = (p) => `- [${p.title.replace(/ \| 24\/7 Clinics?$/, "")}](${SITE}${p.route === "/" ? "/" : p.route})${p.desc ? `: ${p.desc}` : ""}`;
const home = index.find((p) => p.route === "/");
const llms = `# 24/7 Clinic

> ${home?.desc ?? ""}

Phone and WhatsApp: +20 122 222 8247. Email: info@247clinic.net. Website: ${SITE}/

## Main pages
${group(/^\/[^/]*$/).filter((p) => !/^\/(hurghada|sahl-hasheesh|soma-bay|marsa-alam|el-quseir|north-coast)$/.test(p.route)).map(line).join("\n")}

## Destinations
${group(/^\/(hurghada|sahl-hasheesh|soma-bay|marsa-alam|el-quseir|north-coast)$/).map(line).join("\n")}

## Articles
${group(/^\/blog\/.+/).map(line).join("\n")}

## Hotel and resort clinics
${group(/^\/clinics\//).map(line).join("\n")}
`;
fs.writeFileSync(path.join(OUT, "llms.txt"), llms);

console.log(`seo-files: ${pages.length} pages audited, ${index.length} in sitemap.xml; robots.txt and llms.txt written${PREVIEW ? " (preview mode, live checks skipped)" : ""}.`);
