#!/usr/bin/env node
/**
 * HCIG Passport — build
 *
 *   node build.js            → dist/       static site for Vercel (assets as files)
 *   node build.js --inline   → artifacts/  self-contained single files for Claude artifacts
 *
 * Sources in src/ use %%TOKEN%% placeholders for every image, video and map.
 * The Claude artifact sandbox blocks external hosts, so the artifact build
 * inlines everything as base64 data URIs. Vercel has no such restriction, so
 * the dist build points at real files instead — the HTML drops from ~10 MB to
 * a few hundred KB and the browser caches assets separately.
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SRC = path.join(ROOT, 'src');
const SRC_ASSETS = path.join(SRC, 'assets');
const INLINE = process.argv.includes('--inline');
const OUT = path.join(ROOT, INLINE ? 'artifacts' : 'dist');

/* ---------------------------------------------------------------- assets */

const ASSETS = {
  HUB: 'hub.webp',
  HOSPITAL: 'hospital.webp',
  CORRIDOR: 'corridor.jpg',
  PASSPORT: 'passport.webp',
  SCAN: 'scan.webp',
  CONSULT: 'consult.webp',
  DENTAL: 'dental.webp',
  TELE: 'tele.webp',
  AESTH: 'aesthetics.webp',
  PHYSIO: 'physio.webp',
  DRIP: 'drip.webp',
  SMILE: 'smile.webp',
  FAMILY: 'family.webp',

  LOGOHCIG: 'logo-hcig.jpg',
  LOGO247: 'logo-247.png',
  LOGOMP: 'logo-medpark.webp',
  LGHA: 'logo-gha.png',
  LDMWV: 'logo-dmwv.png',
  LUCA: 'logo-uca.jpg',
  LTMASI: 'logo-tmasi.png',
  LMEDONE: 'logo-medone.png',
  LMAVIE: 'logo-mavie.png',
  LSCMG: 'logo-scmg.png',
  LONEC: 'logo-onecenter.png',
  LONESPA: 'logo-onespa.png',
  LHOTELS: 'partners-hotels.jpg',
  LINSURERS: 'partners-insurers.jpg',

  VIDPORT: 'video-review-portrait.mp4',
  VIDLAND: 'video-review-landscape.mp4',
  POSTPORT: 'poster-portrait.jpg',
  POSTLAND: 'poster-landscape.jpg',

  MAPLIGHT: 'map-street.jpg',
  MAPDARK: 'map-dark.jpg',
  MAPSAT: 'map-satellite.jpg',

  QRA: 'qr-hcig.png',
  QRB: 'qr-247.png',
  QRC: 'qr-medpark.png',
};

const MIME = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
};

/* ----------------------------------------------------------------- pages */

const PAGES = [
  { src: 'index.html', dist: 'index.html', artifact: null },
  {
    src: 'business-case.html',
    dist: 'business-case.html',
    artifact: 'hcig-passport.html',
    title: 'HCIG Passport — Business Case',
    favicon: '🩺',
  },
  {
    src: 'ui-kit.html',
    dist: 'ui-kit.html',
    artifact: 'hcig-ui-kit.html',
    title: 'HCIG Passport — Interface Library',
    favicon: '📱',
    renumber: true,
  },
];

/* -------------------------------------------------------------- helpers */

/** Artifact sources are fragments: a leading run of <title>/<link>/<style>
 *  followed by body content. For the web we need a real document, so split
 *  that run off and put it in a proper <head>. */
function splitHead(src) {
  const lead = /^\s*(?:<title>[\s\S]*?<\/title>|<link\b[^>]*>|<meta\b[^>]*>|<style>[\s\S]*?<\/style>|<!--[\s\S]*?-->)\s*/;
  let head = '';
  let rest = src;
  let m;
  while ((m = rest.match(lead))) {
    head += m[0];
    rest = rest.slice(m[0].length);
  }
  return { head: head.trim(), body: rest };
}

function wrapDocument(src, page) {
  const { head, body } = splitHead(src);
  const title = page.title || 'HCIG Passport';
  // the source ships its own <title>; the site wants a page-specific one
  const headNoTitle = head.replace(/<title>[\s\S]*?<\/title>\s*/, '');
  const icon = page.favicon
    ? `<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>${page.favicon}</text></svg>">`
    : '';
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${title}</title>
${icon}
${headNoTitle}
</head>
<body>
${body}
</body>
</html>
`;
}

/** Screen captions are numbered 01..N in document order, so inserting a screen
 *  anywhere never means renumbering by hand. */
function renumber(html) {
  let i = 0;
  const out = html.replace(/<span class="sn">\d+<\/span>/g, () => {
    i += 1;
    return `<span class="sn">${String(i).padStart(2, '0')}</span>`;
  });
  return { out, count: i };
}

function fail(msg) {
  console.error(`\n  ERROR  ${msg}\n`);
  process.exit(1);
}

/* ----------------------------------------------------------------- build */

for (const [token, file] of Object.entries(ASSETS)) {
  if (!fs.existsSync(path.join(SRC_ASSETS, file))) fail(`missing asset src/assets/${file} (token ${token})`);
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

let assetBytes = 0;
if (!INLINE) {
  fs.mkdirSync(path.join(OUT, 'assets'), { recursive: true });
  for (const file of Object.values(ASSETS)) {
    fs.copyFileSync(path.join(SRC_ASSETS, file), path.join(OUT, 'assets', file));
    assetBytes += fs.statSync(path.join(SRC_ASSETS, file)).size;
  }
}

const dataUriCache = new Map();
function replacement(token) {
  const file = ASSETS[token];
  if (!INLINE) return `assets/${file}`;
  if (!dataUriCache.has(token)) {
    const abs = path.join(SRC_ASSETS, file);
    const mime = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
    dataUriCache.set(token, `data:${mime};base64,${fs.readFileSync(abs).toString('base64')}`);
  }
  return dataUriCache.get(token);
}

console.log(`\nBuilding ${INLINE ? 'artifacts/ (self-contained)' : 'dist/ (Vercel)'}\n`);

for (const page of PAGES) {
  const dest = INLINE ? page.artifact : page.dist;
  if (!dest) continue;

  const srcPath = path.join(SRC, page.src);
  if (!fs.existsSync(srcPath)) fail(`missing src/${page.src}`);
  let html = fs.readFileSync(srcPath, 'utf8');

  html = html.replace(/%%([A-Z0-9_]+)%%/g, (m, token) => {
    if (!(token in ASSETS)) fail(`unknown token %%${token}%% in src/${page.src}`);
    return replacement(token);
  });

  const stray = html.match(/%%[A-Z0-9_]+%%/g);
  if (stray) fail(`unresolved tokens in ${page.src}: ${[...new Set(stray)].join(', ')}`);

  let screens = '';
  if (page.renumber) {
    const r = renumber(html);
    html = r.out;
    screens = `, ${r.count} screens renumbered`;
  }

  const isDoc = /^\s*<!doctype/i.test(html);
  if (!INLINE && !isDoc) html = wrapDocument(html, page);

  fs.writeFileSync(path.join(OUT, dest), html);
  console.log(`  ${dest.padEnd(22)}${(Buffer.byteLength(html) / 1024).toFixed(0).padStart(6)} KB${screens}`);
}

if (!INLINE) {
  // Routing, headers and caching live in the repo-root vercel.json — Vercel only
  // reads config from the project root, never from the output directory.
  fs.writeFileSync(path.join(OUT, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
  console.log(
    `  assets/               ${(assetBytes / 1048576).toFixed(2)} MB (${Object.keys(ASSETS).length} files)\n` +
      `  robots.txt            Disallow: /`
  );
}

console.log('');
