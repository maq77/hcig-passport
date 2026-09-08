#!/usr/bin/env node
/**
 * HCIG Work: build
 *
 *   node build.js            -> dist/       the portal, for Vercel
 *   node build.js --inline   -> artifacts/  self-contained single files
 *
 * Everything the portal serves is generated from `content/registry.js`. No page
 * is hand-written, so navigation, counts, breadcrumbs and the search index can
 * never drift out of step with the work they describe.
 *
 * The build fails loudly rather than shipping something broken: a missing
 * asset, an unknown token, an unknown status, a duplicate slug or a deliverable
 * pointing at a file that is not there all stop the build.
 *
 * Sources under src/ use %%TOKEN%% placeholders for media. The Claude artifact
 * sandbox blocks external hosts, so the --inline build turns those into base64
 * data URIs; the Vercel build points them at real files instead.
 */

const fs = require('fs');
const path = require('path');

const { COMPANIES, STATUS } = require('./content/registry');
const md = require('./content/markdown');
const pages = require('./content/pages');

const ROOT = __dirname;
const SRC = path.join(ROOT, 'src');
const SRC_ASSETS = path.join(SRC, 'assets');
const CONTENT = path.join(ROOT, 'content');
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

  /* 24/7 Clinic. Stills pulled from the clinic's own films in
     `247 material/`, chiefly `Le reve 247.mp4`, which was shot at the
     Premier Le Reve clinic in Sahl Hasheesh. Real places, real staff. */
  C7RESORT: 'c7-lereve-resort.webp',
  C7SIGN: 'c7-lereve-sign.webp',
  C7CLINIC: 'c7-lereve-clinic.webp',
  C7RECEPTION: 'c7-reception.webp',
  C7DOCTOR: 'c7-doctor.webp',
  C7CONSULT: 'c7-consult.webp',
  C7WARD: 'c7-ward.webp',
  C7OBS: 'c7-observation.webp',
  C7DENTAL: 'c7-dental.webp',
  C7XRAY: 'c7-xray.webp',
  C7REPORT: 'c7-report.webp',
  C7MEDS: 'c7-medication.webp',
  C7WELCOME: 'c7-welcome.webp',
  C7TEAM: 'c7-team.webp',
  C7RESPONSE: 'c7-response.webp',

  /* Their own vector logo and their own campaign creatives, taken from
     247clinic.net and from the films they publish. */
  C7LOGO: 'c7-logo.svg',
  C7LOGOW: 'c7-logo-white.svg',
  C7FILM: 'c7-film.mp4',
  C7FILMPOSTER: 'c7-film-poster.jpg',
  C7WALK: 'c7-walk.mp4',
  C7WALKPOSTER: 'c7-walk-poster.jpg',
  C7POSHEALTH: 'c7-pos-health.webp',
  C7POSSMILE: 'c7-pos-smile.webp',
  C7POSDENTALSAHL: 'c7-pos-dental-sahl.webp',
  C7POSTEAM: 'c7-pos-team.webp',
  C7POSFIND: 'c7-pos-find.webp',
  C7POSDENTALHUR: 'c7-pos-dental-hur.webp',
  C7STORYDENTAL: 'c7-story-dental.mp4',
  C7STORYDENTALP: 'c7-story-dental-poster.jpg',
  C7STORYIV: 'c7-story-iv.mp4',
  C7STORYIVP: 'c7-story-iv-poster.jpg',

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

/* -------------------------------------------------------------- helpers */

function fail(msg) {
  console.error(`\n  ERROR  ${msg}\n`);
  process.exit(1);
}

function write(rel, body) {
  const abs = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, body);
  return Buffer.byteLength(body);
}

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

function wrapDocument(src, { title, favicon, chip }) {
  const { head, body } = splitHead(src);
  const headNoTitle = head.replace(/<title>[\s\S]*?<\/title>\s*/, '');
  const icon = favicon
    ? `<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>${favicon}</text></svg>">`
    : '<link rel="icon" href="/favicon.svg">';
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
${chip || ''}
</body>
</html>
`;
}

/**
 * A self-contained document written elsewhere (a Claude artifact, a hand-built
 * design) arrives with its own <head> and may be missing things Studio
 * guarantees on every page it serves. This adds only what is absent and never
 * touches what the author wrote.
 */
function harden(html) {
  if (!/<html[^>]*\slang=/i.test(html)) {
    html = html.replace(/<html\b/i, '<html lang="en"');
  }
  const head = /<head[^>]*>/i;
  if (!/<meta[^>]+name=["']?robots["']?[^>]*noindex/i.test(html)) {
    html = html.replace(head, (m) => `${m}\n<meta name="robots" content="noindex, nofollow">`);
  }
  if (!/<meta[^>]+name=["']?viewport["']?/i.test(html)) {
    html = html.replace(head, (m) => `${m}\n<meta name="viewport" content="width=device-width, initial-scale=1">`);
  }
  return html;
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

const dataUriCache = new Map();
function replacement(token) {
  const file = ASSETS[token];
  if (!INLINE) return `/assets/${file}`;
  if (!dataUriCache.has(token)) {
    const abs = path.join(SRC_ASSETS, file);
    const mime = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
    dataUriCache.set(token, `data:${mime};base64,${fs.readFileSync(abs).toString('base64')}`);
  }
  return dataUriCache.get(token);
}

function resolveTokens(html, where) {
  html = html.replace(/%%([A-Z0-9_]+)%%/g, (m, token) => {
    if (!(token in ASSETS)) fail(`unknown token %%${token}%% in ${where}`);
    return replacement(token);
  });
  const stray = html.match(/%%[A-Z0-9_]+%%/g);
  if (stray) fail(`unresolved tokens in ${where}: ${[...new Set(stray)].join(', ')}`);
  return html;
}

/* ------------------------------------------------------------- validate */

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function validate() {
  const seenCompany = new Set();
  const flagshipRanks = new Map();
  for (const c of COMPANIES) {
    if (!SLUG.test(c.slug)) fail(`company slug "${c.slug}" is not lowercase-kebab`);
    if (seenCompany.has(c.slug)) fail(`duplicate company slug "${c.slug}"`);
    seenCompany.add(c.slug);
    if (!(c.logo in ASSETS)) fail(`company "${c.slug}" points at unknown logo token ${c.logo}`);
    c.logoFile = ASSETS[c.logo];

    const seenProject = new Set();
    for (const p of c.projects) {
      if (!SLUG.test(p.slug)) fail(`project slug "${c.slug}/${p.slug}" is not lowercase-kebab`);
      if (seenProject.has(p.slug)) fail(`duplicate project slug "${c.slug}/${p.slug}"`);
      seenProject.add(p.slug);
      if (!(p.status in STATUS)) fail(`unknown status "${p.status}" on ${c.slug}/${p.slug}`);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(p.updated)) fail(`${c.slug}/${p.slug} needs an absolute updated date, got "${p.updated}"`);

      if (p.due !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(p.due)) {
        fail(`${c.slug}/${p.slug} due must be YYYY-MM-DD, got "${p.due}"`);
      }
      for (const [i, item] of (p.checklist || []).entries()) {
        if (typeof item.text !== 'string' || !item.text.trim()) {
          fail(`${c.slug}/${p.slug} checklist item ${i} has no text`);
        }
        if (typeof item.done !== 'boolean') {
          fail(`${c.slug}/${p.slug} checklist item ${i} needs done: true or false`);
        }
      }

      if (p.flagship) {
        const { rank, line } = p.flagship;
        if (!Number.isInteger(rank) || rank < 1) fail(`${c.slug}/${p.slug} flagship needs an integer rank from 1`);
        if (flagshipRanks.has(rank)) fail(`flagship rank ${rank} used twice: ${flagshipRanks.get(rank)} and ${c.slug}/${p.slug}`);
        flagshipRanks.set(rank, `${c.slug}/${p.slug}`);
        if (!line || line.length > 160) fail(`${c.slug}/${p.slug} flagship needs a line of 160 characters or fewer`);
        // three at most; the moment everything is a flagship, nothing is
        if (flagshipRanks.size > 3) fail('more than three flagships. Demote one before adding another.');
      }

      const seenItem = new Set();
      for (const st of p.stages || []) {
        for (const it of st.items || []) {
          const id = `${c.slug}/${p.slug}/${it.slug}`;
          if (!SLUG.test(it.slug)) fail(`item slug "${id}" is not lowercase-kebab`);
          if (seenItem.has(it.slug)) fail(`duplicate item slug "${id}"`);
          seenItem.add(it.slug);
          if (!(it.status in STATUS)) fail(`unknown status "${it.status}" on ${id}`);

          if (it.kind === 'link') {
            if (!/^https?:\/\//.test(it.href || '')) fail(`${id} is a link but has no absolute href`);
          } else if (it.kind === 'page' || it.kind === 'html' || it.kind === 'md') {
            const abs = it.kind === 'page' ? path.join(SRC, it.src) : path.join(ROOT, it.src);
            if (!fs.existsSync(abs)) fail(`${id} points at a file that does not exist: ${it.src}`);
            it.absPath = abs;
          } else {
            fail(`${id} has unknown kind "${it.kind}"`);
          }
        }
      }
    }
  }
}

/* --------------------------------------------------------------- hiding */

/**
 * The registry keeps every project. Every listing gets only the ones not
 * marked `hidden`.
 *
 * A hidden project keeps its pages and its URLs, so anyone holding a link can
 * still open it, but it appears in no listing, no count, no navigation and no
 * search index. Nothing on the site points at it, so nobody finds it by
 * looking. That is what he asked for on 2026-09-08, having accepted that the
 * URL stays reachable to anyone who has it.
 *
 * Validation still runs over the full registry, so a hidden project cannot
 * quietly rot while it is out of sight.
 */
function publicView(companies) {
  return companies.map((c) => ({ ...c, projects: c.projects.filter((p) => !p.hidden) }));
}

const HIDDEN = COMPANIES.flatMap((c) => c.projects.filter((p) => p.hidden).map((p) => `${c.slug}/${p.slug}`));

/* ---------------------------------------------------------------- index */

/** The search index, inlined into every page. Kept to four short keys because
 *  it ships on every request. */
function buildIndex(COMPANIES) {
  const out = [];
  out.push({ n: 'Overview', p: 'This site', u: '/', t: 'page' });
  out.push({ n: 'Big projects', p: 'This site', u: '/big-projects', t: 'page' });
  out.push({ n: 'Everything', p: 'This site', u: '/everything', t: 'page' });
  out.push({ n: 'Report', p: 'This site', u: '/report', t: 'page' });
  out.push({ n: 'Activity', p: 'This site', u: '/activity', t: 'page' });
  out.push({ n: 'How this works', p: 'This site', u: '/how-it-works', t: 'page' });
  for (const c of COMPANIES) {
    out.push({ n: c.name, p: 'Company', u: `/${c.slug}`, t: 'company' });
    for (const p of c.projects) {
      out.push({
        n: p.name,
        p: p.flagship ? `Big project · ${c.short}` : c.name,
        u: `/${c.slug}/${p.slug}`,
        t: 'project',
      });
      for (const st of p.stages || []) {
        for (const it of st.items || []) {
          const entry = {
            n: it.name,
            p: `${c.short} / ${p.name} / ${st.name}`,
            u: it.kind === 'link' ? it.href : `/${c.slug}/${p.slug}/${it.slug}`,
            t: 'item',
          };
          if (it.kind === 'link') entry.x = 1;
          out.push(entry);
        }
      }
    }
  }
  return out;
}

/* ---------------------------------------------------------------- build */

for (const [token, file] of Object.entries(ASSETS)) {
  if (!fs.existsSync(path.join(SRC_ASSETS, file))) fail(`missing asset src/assets/${file} (token ${token})`);
}

validate();

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

console.log(`\nBuilding ${INLINE ? 'artifacts/ (self-contained)' : 'dist/ (Vercel)'}\n`);

/* ---- inline mode: only the self-contained documents, as before ---------- */

if (INLINE) {
  let n = 0;
  for (const c of COMPANIES) {
    for (const p of c.projects) {
      for (const st of p.stages || []) {
        for (const it of st.items || []) {
          if (it.kind !== 'page' || !it.build || !it.build.artifact) continue;
          let html = resolveTokens(fs.readFileSync(it.absPath, 'utf8'), `src/${it.src}`);
          let note = '';
          if (it.build.renumber) {
            const r = renumber(html);
            html = r.out;
            note = `, ${r.count} screens renumbered`;
          }
          const bytes = write(it.build.artifact, html);
          console.log(`  ${it.build.artifact.padEnd(26)}${(bytes / 1024).toFixed(0).padStart(6)} KB${note}`);
          n++;
        }
      }
    }
  }
  console.log(`\n  ${n} self-contained file${n === 1 ? '' : 's'}\n`);
  process.exit(0);
}

/* ---- assets ------------------------------------------------------------ */

let assetBytes = 0;
fs.mkdirSync(path.join(OUT, 'assets'), { recursive: true });
for (const file of Object.values(ASSETS)) {
  fs.copyFileSync(path.join(SRC_ASSETS, file), path.join(OUT, 'assets', file));
  assetBytes += fs.statSync(path.join(SRC_ASSETS, file)).size;
}

/* ---- shared shell files ------------------------------------------------ */

write('studio.css', fs.readFileSync(path.join(CONTENT, 'theme.css'), 'utf8'));
write('studio.js', fs.readFileSync(path.join(CONTENT, 'studio.js'), 'utf8'));
write('robots.txt', 'User-agent: *\nDisallow: /\n');
write(
  'favicon.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">` +
    `<rect width="64" height="64" rx="16" fill="#12C0C6"/>` +
    `<text x="32" y="43" text-anchor="middle" font-family="Inter,Helvetica,Arial,sans-serif" ` +
    `font-size="28" font-weight="800" fill="#04292b">HC</text></svg>`
);

/* ---- portal pages ------------------------------------------------------ */

/* Written by `npm run publish` from git log, never by this build: Vercel
   shallow-clones, so git history inside a Vercel build is unreliable. */
const ACTIVITY_FILE = path.join(CONTENT, 'activity.json');
let ACTIVITY = [];
if (fs.existsSync(ACTIVITY_FILE)) {
  try {
    ACTIVITY = JSON.parse(fs.readFileSync(ACTIVITY_FILE, 'utf8'));
  } catch (e) {
    fail(`content/activity.json is not valid JSON: ${e.message}`);
  }
}

const SITE = publicView(COMPANIES);
const index = buildIndex(SITE);
const ctx = { companies: SITE, index };

let pageCount = 0;
const log = [];

function emit(rel, html, label) {
  const bytes = write(rel, html);
  pageCount++;
  log.push([label, bytes]);
}

emit('index.html', pages.homePage(ctx), '/');
emit('big-projects.html', pages.programmesPage(ctx), '/big-projects');
emit('everything.html', pages.allWorkPage(ctx), '/everything');
emit('report.html', pages.reportPage(ctx, ACTIVITY), '/report');
emit('activity.html', pages.activityPage(ctx, ACTIVITY), '/activity');
emit('how-it-works.html', pages.workflowPage(ctx), '/how-it-works');

// company pages list only what is visible
for (const company of SITE) {
  emit(`${company.slug}/index.html`, pages.companyPage(ctx, company), `/${company.slug}`);
}

// project and deliverable pages come from the full registry, so a held-back
// project keeps its URL working even though nothing on the site links to it
for (const company of COMPANIES) {
  for (const project of company.projects) {
    emit(
      `${company.slug}/${project.slug}/index.html`,
      pages.projectPage(ctx, company, project),
      `/${company.slug}/${project.slug}`
    );

    for (const st of project.stages || []) {
      for (const it of st.items || []) {
        if (it.kind === 'link') continue;
        const rel = `${company.slug}/${project.slug}/${it.slug}.html`;
        const label = `/${company.slug}/${project.slug}/${it.slug}`;

        if (it.kind === 'md') {
          const rendered = md.render(fs.readFileSync(it.absPath, 'utf8'));
          emit(rel, pages.docPage(ctx, company, project, it, rendered), label);
          continue;
        }

        // a self-contained design document: served as authored, plus one chip home
        let html = fs.readFileSync(it.absPath, 'utf8');
        if (it.kind === 'page') html = resolveTokens(html, `src/${it.src}`);
        if (it.build && it.build.renumber) html = renumber(html).out;

        const chip = pages.reviewChip(company, project, it);
        const isDoc = /^\s*<!doctype/i.test(html);
        html = isDoc
          ? harden(html).replace(/<\/body>/i, `${chip}\n</body>`)
          : wrapDocument(html, {
              title: `${it.name} · ${project.name} · HCIG Studio`,
              favicon: it.build && it.build.favicon,
              chip,
            });

        emit(rel, html, label);
      }
    }
  }
}

/* ---- report ------------------------------------------------------------ */

const width = Math.max(...log.map(([l]) => l.length)) + 2;
for (const [label, bytes] of log) {
  console.log(`  ${label.padEnd(width)}${(bytes / 1024).toFixed(0).padStart(6)} KB`);
}
console.log(
  `\n  ${pageCount} pages` +
    `\n  assets/  ${(assetBytes / 1048576).toFixed(2)} MB (${Object.keys(ASSETS).length} files)` +
    `\n  ${index.length} entries in the search index` +
    `
  ${ACTIVITY.length} activity entries` +
    `\n  robots.txt  Disallow: /`
);

// say it every build, so nothing stays hidden by accident
if (HIDDEN.length) {
  console.log(`\n  HELD BACK, off every listing but the URL still works (${HIDDEN.length}):`);
  for (const h of HIDDEN) console.log(`    /${h}`);
  console.log(`  Remove "hidden: true" in content/registry.js to list them again.`);
}
console.log('');
