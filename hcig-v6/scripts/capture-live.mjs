// Captures the 25 live healthcareig.com pages as visitors get them today, read-only, and compares their visible
// text with an earlier capture. The live site is the source of truth for every word on v6 (BRAIN.md rule 1).
//
// Run:  node hcig-v6/scripts/capture-live.mjs [compareDir]
// Out:  hcig-v6/material/live-capture/<date>/<page>.html (raw HTML, local only)
//       hcig-v6/material/live-capture/<date>/<page>.txt  (visible text, one block per line)
//       hcig-v6/material/live-capture/<date>/DIFF.md     (pages whose visible text changed, with the changed lines)
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const V6 = join(dirname(fileURLToPath(import.meta.url)), "..");
const LIVE = "https://healthcareig.com";
const UA = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130 Safari/537.36" };
const DATE = new Date().toISOString().slice(0, 10);
const OUT = join(V6, "material", "live-capture", DATE);
const COMPARE = process.argv[2] ?? join(V6, "..", "hcig-v3", "material", "live-site", "pages");

// Live path -> file name (same names as the 2026-10-18 capture so the two can be compared).
const PAGES = new Map([
  ["/", "home"],
  ["/about/", "about_"],
  ["/services/", "services_"],
  ["/partner/", "partner_"],
  ["/contacts/", "contacts_"],
  ["/blog/", "blog_"],
  ["/de/", "de_"],
  ["/de/ueber-uns/", "de_ueber-uns_"],
  ["/de/leistungen/", "de_leistungen_"],
  ["/de/kontakt/", "de_kontakt_"],
]);
for (let i = 1; i <= 15; i++) PAGES.set(`/blog/news${i}.php`, `blog_news${i}.php`);

const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", rsquo: "’", lsquo: "‘",
  rdquo: "”", ldquo: "“", trade: "™", copy: "©", reg: "®", hellip: "…" };

function decode(s) {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, n) => ENTITIES[n.toLowerCase()] ?? m);
}

// Visible text, one block per line: scripts, styles and comments dropped, block tags become line breaks.
export function visibleText(html) {
  const body = html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|noscript|template|svg)\b[\s\S]*?<\/\1>/gi, "")
    .replace(/<(br|hr)\b[^>]*>/gi, "\n")
    .replace(/<\/?(p|div|section|article|header|footer|nav|main|aside|h[1-6]|li|ul|ol|tr|td|th|table|figure|figcaption|blockquote|form|label|button|a|span|strong|em|b|i)\b[^>]*>/gi,
      (m) => (/^<\/?(a|span|strong|em|b|i)\b/i.test(m) ? " " : "\n"))
    .replace(/<[^>]+>/g, " ");
  return decode(body)
    .split("\n")
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n");
}

function lineDiff(a, b) {
  const A = new Set(a.split("\n"));
  const B = new Set(b.split("\n"));
  return {
    removed: [...A].filter((l) => !B.has(l)),
    added: [...B].filter((l) => !A.has(l)),
  };
}

mkdirSync(OUT, { recursive: true });
const report = [`# Live capture ${DATE} compared with ${COMPARE}`, ""];
let changed = 0;
for (const [path, name] of PAGES) {
  const r = await fetch(LIVE + path, { headers: UA, redirect: "manual" });
  const html = await r.text();
  writeFileSync(join(OUT, `${name}.html`), html);
  const text = visibleText(html);
  writeFileSync(join(OUT, `${name}.txt`), text + "\n");
  const old = join(COMPARE, `${name}.html`);
  if (!existsSync(old)) {
    report.push(`- ${path}: status ${r.status}, no earlier copy to compare`);
    continue;
  }
  const { removed, added } = lineDiff(visibleText(readFileSync(old, "utf8")), text);
  if (!removed.length && !added.length) {
    report.push(`- ${path}: status ${r.status}, visible text unchanged`);
    continue;
  }
  changed++;
  report.push(`- ${path}: status ${r.status}, **changed** (${removed.length} lines gone, ${added.length} new)`);
  for (const l of removed) report.push(`  - was: ${l}`);
  for (const l of added) report.push(`  - now: ${l}`);
  await new Promise((res) => setTimeout(res, 400)); // gentle on the host
}
report.splice(1, 0, `Pages with changed visible text: ${changed} of ${PAGES.size}`);
writeFileSync(join(OUT, "DIFF.md"), report.join("\n") + "\n");
console.log(report.slice(0, 2).join("\n"));
console.log(`Saved to ${OUT}`);
