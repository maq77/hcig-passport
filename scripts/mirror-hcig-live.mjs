// Builds /hcig-live/ on HCIG Work: a faithful copy of healthcareig.com as it is today, so changes to the
// live site (spec 012, Phase 0) are previewed here before they reach the real host.
//
// What it does to each page, and nothing else:
// - page links stay inside the copy (/hcig-live/...), images and scripts load from healthcareig.com itself
// - the site's own stylesheet and the Helma font are copied in, because fonts do not load across domains
// - Google Ads and Yandex tags are removed, so preview visits never count as real visits
// - every page is noindex, nofollow, and forms do not send (no test enquiries reach partner@)
//
// Run: node scripts/mirror-hcig-live.mjs            (fetches the live pages now)
// Then: npm test, commit src/hcig-live/, push. build.js serves src/hcig-live at /hcig-live.
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "src", "hcig-live");
const LIVE = "https://healthcareig.com";
const MOUNT = "/hcig-live";
const UA = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130 Safari/537.36" };

// The pages in today's site and sitemap, plus the 15 news posts. Key = live path, value = path inside the copy.
const PAGES = new Map([
  ["/", "/"],
  ["/about/", "/about/"],
  ["/services/", "/services/"],
  ["/partner/", "/partner/"],
  ["/contacts/", "/contacts/"],
  ["/blog/", "/blog/"],
  ["/de/", "/de/"],
  ["/de/ueber-uns/", "/de/ueber-uns/"],
  ["/de/leistungen/", "/de/leistungen/"],
  ["/de/kontakt/", "/de/kontakt/"],
]);
for (let i = 1; i <= 15; i++) PAGES.set(`/blog/news${i}.php`, `/blog/news${i}/`);
// Old addresses that answer the same pages today: links to them stay inside the copy too.
const ALIASES = new Map([
  ["/index.php", "/"],
  ["/services.php", "/services/"],
  ["/blog.php", "/blog/"],
  ["/kontakty.php", "/contacts/"],
  ["/de/index.php", "/de/"],
]);
for (let i = 1; i <= 15; i++) ALIASES.set(`/news${i}.php`, `/blog/news${i}/`);

const copied = new Map(); // live asset path -> path inside the copy (stylesheets and fonts)

async function get(url, binary = false) {
  const r = await fetch(url, { headers: UA });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return binary ? Buffer.from(await r.arrayBuffer()) : await r.text();
}

function insideCopy(abs) {
  const u = new URL(abs);
  if (u.host !== "healthcareig.com" && u.host !== "www.healthcareig.com") return null;
  const target = PAGES.get(u.pathname) ?? ALIASES.get(u.pathname);
  return target ? MOUNT + target + u.search + u.hash : null;
}

function rewriteUrl(raw, base, kind) {
  const v = raw.trim();
  if (!v || /^(#|mailto:|tel:|javascript:|data:|whatsapp:)/i.test(v)) return raw;
  let abs;
  try { abs = new URL(v, base).href; } catch { return raw; }
  if (kind === "link") return insideCopy(abs) ?? abs;
  if (kind === "style" && copied.has(new URL(abs).pathname)) return MOUNT + copied.get(new URL(abs).pathname);
  return abs;
}

async function copyStylesheet(abs) {
  const path = new URL(abs).pathname;
  if (copied.has(path)) return;
  copied.set(path, path);
  let css = await get(abs);
  const fontJobs = [];
  css = css.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g, (m, q, ref) => {
    if (/^data:/i.test(ref)) return m;
    const target = new URL(ref, abs);
    if (/\.(woff2?|ttf|otf|eot)$/i.test(target.pathname) && target.host === "healthcareig.com") {
      fontJobs.push(target.href);
      return `url('${MOUNT}${target.pathname}')`;
    }
    return `url('${target.href}')`;
  });
  write(path, css);
  for (const f of fontJobs) write(new URL(f).pathname, await get(f, true));
}

function write(livePath, data) {
  const file = join(OUT, ...livePath.split("/").filter(Boolean));
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, data);
}

function transform(html, pageUrl) {
  let h = html;
  // Tracking tags out: Google tag loader, its inline config, the Yandex counter block and its noscript pixel.
  h = h.replace(/<!--\s*Google tag \(gtag\.js\)\s*-->/gi, "");
  h = h.replace(/<script[^>]*googletagmanager\.com\/gtag\/js[^>]*>\s*<\/script>/gi, "");
  h = h.replace(/<script>(?:(?!<\/script>)[\s\S])*?gtag\((?:(?!<\/script>)[\s\S])*?<\/script>/gi, "");
  h = h.replace(/<!--\s*Yandex\.Metrika counter\s*-->[\s\S]*?<!--\s*\/Yandex\.Metrika counter\s*-->/gi, "");
  // Never indexed, never followed: this is a copy on another domain.
  h = h.replace(/<meta\s+name=["']robots["'][^>]*>/gi, "");
  h = h.replace(/<head([^>]*)>/i, `<head$1>\n<meta name="robots" content="noindex, nofollow">`);
  // Links and assets.
  h = h.replace(/(<a\b[^>]*?\bhref=)(["'])(.*?)\2/gi, (m, pre, q, v) => pre + q + rewriteUrl(v, pageUrl, "link") + q);
  h = h.replace(/(<link\b[^>]*?\bhref=)(["'])(.*?)\2/gi, (m, pre, q, v) => pre + q + rewriteUrl(v, pageUrl, "style") + q);
  h = h.replace(/(\b(?:src|data-src|poster)=)(["'])(.*?)\2/gi, (m, pre, q, v) => pre + q + rewriteUrl(v, pageUrl, "asset") + q);
  h = h.replace(/(\bsrcset=)(["'])(.*?)\2/gi, (m, pre, q, v) =>
    pre + q + v.split(",").map((part) => {
      const [u, ...rest] = part.trim().split(/\s+/);
      return [rewriteUrl(u, pageUrl, "asset"), ...rest].join(" ");
    }).join(", ") + q);
  h = h.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g, (m, q, v) => `url('${rewriteUrl(v, pageUrl, "asset")}')`);
  // Forms stay visible but do not send from the preview.
  h = h.replace(/<form\b([^>]*?)\baction=(["'])(.*?)\2/gi, (m, pre) => `<form${pre}action="#" onsubmit="return false"`);
  return h;
}

rmSync(OUT, { recursive: true, force: true });
let pages = 0;
for (const [livePath, copyPath] of PAGES) {
  const pageUrl = LIVE + livePath;
  const html = await get(pageUrl);
  for (const m of html.matchAll(/<link\b[^>]*rel=["']stylesheet["'][^>]*>/gi)) {
    const href = /href=["']([^"']+)["']/i.exec(m[0])?.[1];
    if (!href) continue;
    const abs = new URL(href, pageUrl);
    if (abs.host === "healthcareig.com") await copyStylesheet(abs.href);
  }
  const target = copyPath === "/" ? "/index.html" : copyPath + "index.html";
  write(target, transform(html, pageUrl));
  pages++;
}
// robots.txt lives at the HCIG Work root (Disallow: /); every copied page also carries noindex, nofollow.
console.log(`Copied ${pages} pages and ${copied.size} stylesheet(s) into ${OUT}`);
