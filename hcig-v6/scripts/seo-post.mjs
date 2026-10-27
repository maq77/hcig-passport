// After every build (English in out/, the others in out-langs/<lang>/): gives each page its head tags and writes the
// crawl files. Knowing every language's addresses is what lets one step do this for all of them.
//   canonical (live URL), hreflang for all seven languages plus x-default, Open Graph and Twitter card tags
//   sitemap.xml (index) + sitemap-<lang>.xml with hreflang alternates, robots.txt, llms.txt
// Preview: robots.txt disallows everything (the pages also carry noindex). Live: allow, with the sitemap line.
//   node scripts/seo-post.mjs
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { localPath } from "./slug-map.mjs";

const V6 = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://healthcareig.com";
const target = process.env.HCIG_TARGET === "live" ? "live" : "preview";
const ROOT = target === "preview" ? "/hcig/v6" : "";
const LANGS = ["en", "de", "pl", "fr", "it", "es", "cs"];
const LOCALE = { en: "en_GB", de: "de_DE", pl: "pl_PL", fr: "fr_FR", it: "it_IT", es: "es_ES", cs: "cs_CZ" };
const SLUGS = existsSync(join(V6, "i18n/slugs.json")) ? JSON.parse(readFileSync(join(V6, "i18n/slugs.json"), "utf8")) : {};
const dirOf = (l) => (l === "en" ? join(V6, "out") : join(V6, "out-langs", l));
const built = LANGS.filter((l) => existsSync(join(dirOf(l), "index.html")));

function enPages(dir, rel = "/") {
  const out = existsSync(join(dir, "index.html")) ? [rel] : [];
  for (const e of readdirSync(dir, { withFileTypes: true }))
    if (e.isDirectory() && !e.name.startsWith("_") && !e.name.startsWith("__") && e.name !== "media" && !(rel === "/" && LANGS.includes(e.name))) out.push(...enPages(join(dir, e.name), `${rel}${e.name}/`));
  return out;
}
const EN = enPages(dirOf("en")).filter((p) => !p.startsWith("/404") && !p.startsWith("/_not-found"));
const prefix = (l) => (l === "en" ? "" : `/${l}`);
const local = (l, en) => (l === "en" ? en : localPath(SLUGS[l] || {}, en));
const live = (l, en) => `${SITE}${prefix(l)}${local(l, en)}`;
const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

let tagged = 0;
for (const l of built) {
  for (const en of EN) {
    const f = join(dirOf(l), local(l, en), "index.html");
    if (!existsSync(f)) { console.log(`seo: missing ${l} ${en}`); continue; }
    let h = readFileSync(f, "utf8");
    h = h.replace(/<link rel="(canonical|alternate)"[^>]*>|<meta (property|name)="(og|twitter):[^"]*"[^>]*>/g, "");
    let title = (h.match(/<title>([^<]*)<\/title>/) || [])[1] || "Healthcare International Group (HCIG)";
    // a long title keeps its words and drops the brand suffix
    if (title.length > 65 && / \| [^|]*HCIG[^|]*$/.test(title)) {
      const short = title.replace(/ \| [^|]+$/, "");
      h = h.replace(`<title>${title}</title>`, `<title>${short}</title>`);
      title = short;
    }
    let desc = (h.match(/<meta name="description" content="([^"]*)"/) || [])[1] || "";
    // a long description ends at a full sentence within 160 characters, or at a word with an ellipsis
    if (desc.length > 160) {
      const cut = desc.slice(0, 160);
      const end = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("! "), cut.lastIndexOf("? "));
      const short = end > 70 ? cut.slice(0, end + 1) : cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:]$/, "") + "…";
      h = h.replace(`<meta name="description" content="${desc}"`, `<meta name="description" content="${short}"`);
      desc = short;
    }
    const hero = (h.match(/<img[^>]*fetchPriority="high"[^>]*src="([^"]+)"/i) || h.match(/<img[^>]*src="([^"]+)"[^>]*fetchPriority="high"/i) || [])[1];
    const img = hero && hero.startsWith(ROOT + "/media/") ? SITE + hero.slice(ROOT.length) : `${SITE}/media/cta-bg.webp`;
    const tags = [
      `<link rel="canonical" href="${live(l, en)}"/>`,
      ...built.map((x) => `<link rel="alternate" hreflang="${x}" href="${live(x, en)}"/>`),
      `<link rel="alternate" hreflang="x-default" href="${live("en", en)}"/>`,
      `<meta property="og:type" content="${en.startsWith("/blog/") && en !== "/blog/" ? "article" : "website"}"/>`,
      `<meta property="og:site_name" content="Healthcare International Group"/>`,
      `<meta property="og:locale" content="${LOCALE[l]}"/>`,
      `<meta property="og:url" content="${live(l, en)}"/>`,
      `<meta property="og:title" content="${title}"/>`,
      desc ? `<meta property="og:description" content="${desc}"/>` : "",
      `<meta property="og:image" content="${esc(img)}"/>`,
      `<meta name="twitter:card" content="summary_large_image"/>`,
    ].filter(Boolean).join("");
    h = h.replace("</head>", `${tags}</head>`);
    writeFileSync(f, h);
    tagged++;
  }
}

// crawl files, written at the root of the English export (the site root)
const today = new Date().toISOString().slice(0, 10);
const files = [];
for (const l of built) {
  const urls = EN.map((en) => `<url><loc>${live(l, en)}</loc><lastmod>${today}</lastmod>${built.map((x) => `<xhtml:link rel="alternate" hreflang="${x}" href="${live(x, en)}"/>`).join("")}<xhtml:link rel="alternate" hreflang="x-default" href="${live("en", en)}"/></url>`);
  const name = `sitemap-${l}.xml`;
  writeFileSync(join(dirOf("en"), name), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join("\n")}\n</urlset>\n`);
  files.push(name);
}
writeFileSync(join(dirOf("en"), "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${files.map((f) => `<sitemap><loc>${SITE}/${f}</loc><lastmod>${today}</lastmod></sitemap>`).join("\n")}\n</sitemapindex>\n`);
writeFileSync(join(dirOf("en"), "robots.txt"), target === "live" ? `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n` : "User-agent: *\nDisallow: /\n");

// llms.txt: what HCIG is and where the main answers live (English)
const titleOf = (en) => {
  const f = join(dirOf("en"), en, "index.html");
  return existsSync(f) ? ((readFileSync(f, "utf8").match(/<title>([^<]*)<\/title>/) || [])[1] || en).replace(/&amp;/g, "&") : en;
};
const KEY = ["/", "/about/", "/services/", "/maritime-cruise-healthcare/", "/partner/", "/group/", "/network/", "/trust/", "/about/leadership/", "/press/", "/contacts/", "/blog/"];
const home = readFileSync(join(dirOf("en"), "index.html"), "utf8");
const lead = ((home.match(/<meta name="description" content="([^"]*)"/) || [])[1] || "").replace(/&amp;/g, "&");
writeFileSync(join(dirOf("en"), "llms.txt"), `# Healthcare International Group (HCIG)\n\n> ${lead}\n\nHCIG is the Official Partner of Global Healthcare Accreditation (GHA) and the German Medical Wellness Association (DMWV) in Egypt. 40+ Years of Experience. 600K+ Patients Served. 350+ Medical Professionals. 135+ On-Site Clinics Across Egypt. Contact: partner@healthcareig.com\n\n## Main pages\n\n${KEY.map((en) => `- [${titleOf(en)}](${live("en", en)})`).join("\n")}\n\n## Services\n\n${EN.filter((p) => /^\/services\/.+/.test(p)).map((en) => `- [${titleOf(en)}](${live("en", en)})`).join("\n")}\n\n## Group brands\n\n${EN.filter((p) => /^\/group\/.+/.test(p)).map((en) => `- [${titleOf(en)}](${live("en", en)})`).join("\n")}\n\n## Languages\n\n${built.map((l) => `- ${l}: ${SITE}${prefix(l)}/`).join("\n")}\n`);
console.log(`seo: ${tagged} pages tagged in ${built.join(", ")}; ${files.length} sitemaps, robots.txt (${target}), llms.txt`);
