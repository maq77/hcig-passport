/**
 * HCIG Studio: rendering.
 *
 * Every page on the portal comes out of this file. Pages are never hand-written;
 * they are a function of `content/registry.js`. That is the whole point: one
 * place to edit, no page can drift out of date, and nothing can be half-renamed.
 */

const { STATUS, PIPELINE, REVIEWER, OWNER } = require('./registry');

/* ------------------------------------------------------------------- icons */
/* Lucide-style, 24x24 grid, 1.75 stroke. SVG, never emoji: emoji render
   differently on every OS and cannot be themed. */

const PATHS = {
  'chevron-right': '<path d="m9 18 6-6-6-6"/>',
  'arrow-right': '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  'arrow-up-right': '<path d="M7 17 17 7"/><path d="M7 7h10v10"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z"/>',
  folder: '<path d="M3 7.5A1.5 1.5 0 0 1 4.5 6h4L11 8.5h8.5A1.5 1.5 0 0 1 21 10v7.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5Z"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 13 9 5 9-5"/>',
  'file-text': '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h4"/>',
  monitor: '<rect x="2.5" y="4" width="19" height="12.5" rx="2"/><path d="M9 20.5h6M12 16.5v4"/>',
  'external-link': '<path d="M13.5 4.5H19a.5.5 0 0 1 .5.5v5.5"/><path d="m19 5-8 8"/><path d="M18.5 14v4.5a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1H11"/>',
  'circle-dashed': '<path d="M10.1 2.2a10 10 0 0 0-3.6 1.5M3.7 6.5a10 10 0 0 0-1.5 3.6M2.2 13.9a10 10 0 0 0 1.5 3.6M6.5 20.3a10 10 0 0 0 3.6 1.5M13.9 21.8a10 10 0 0 0 3.6-1.5M20.3 17.5a10 10 0 0 0 1.5-3.6M21.8 10.1a10 10 0 0 0-1.5-3.6M17.5 3.7a10 10 0 0 0-3.6-1.5"/>',
  pencil: '<path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z"/><path d="m14.5 6.5 3 3"/>',
  eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/>',
  rotate: '<path d="M3 12a9 9 0 0 1 15.3-6.4L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15.3 6.4L3 16"/><path d="M3 21v-5h5"/>',
  check: '<path d="M20 6 9.5 17 4 11.5"/>',
  globe: '<circle cx="12" cy="12" r="9.5"/><path d="M2.5 12h19"/><path d="M12 2.5a15 15 0 0 1 0 19 15 15 0 0 1 0-19Z"/>',
  lock: '<rect x="4.5" y="10.5" width="15" height="10" rx="2"/><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"/>',
  'alert-triangle': '<path d="M10.3 3.9 2.5 17.5A2 2 0 0 0 4.2 20.5h15.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9.5v4.5M12 17.5h.01"/>',
  inbox: '<path d="M21 12.5H16l-1.5 3h-5l-1.5-3H3"/><path d="M5.4 5.3 3 12.5v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5l-2.4-7.2a2 2 0 0 0-1.9-1.3H7.3a2 2 0 0 0-1.9 1.3Z"/>',
  'corner-down-right': '<path d="M5 4v7a3 3 0 0 0 3 3h11"/><path d="m15 10 4 4-4 4"/>',
  building: '<path d="M4 21V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v16"/><path d="M15 9h3a2 2 0 0 1 2 2v10"/><path d="M2.5 21h19"/><path d="M8 7h3M8 11h3M8 15h3"/>',
  route: '<circle cx="6" cy="19" r="2.5"/><circle cx="18" cy="5" r="2.5"/><path d="M15.5 5H9a3.5 3.5 0 0 0 0 7h6a3.5 3.5 0 0 1 0 7H8.5"/>',
};

function icon(name, size = 18, cls = '') {
  const d = PATHS[name];
  if (!d) throw new Error(`unknown icon "${name}"`);
  return (
    `<svg${cls ? ` class="${cls}"` : ''} width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" ` +
    `stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`
  );
}

/* ----------------------------------------------------------------- helpers */

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function niceDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

function pill(status, size = 13) {
  const s = STATUS[status];
  if (!s) throw new Error(`unknown status "${status}"`);
  return `<span class="pill ${s.tone}">${icon(s.icon, size)}${esc(s.label)}</span>`;
}

const KIND_ICON = { page: 'monitor', html: 'monitor', md: 'file-text', link: 'external-link' };
const KIND_WORD = { page: 'Hosted page', html: 'Hosted page', md: 'Document', link: 'External link' };

/** Where an item can be opened. Hosted things live under the portal; links leave. */
function itemHref(company, project, item) {
  return item.kind === 'link' ? item.href : `/${company.slug}/${project.slug}/${item.slug}`;
}

/** Roll a project's items up into counts, for the company page. */
function projectCounts(project) {
  let items = 0;
  for (const st of project.stages || []) items += (st.items || []).length;
  return items;
}

/* ------------------------------------------------------------------- shell */

function railHtml(companies, active) {
  const withWork = companies.filter((c) => c.projects.length);
  const empty = companies.filter((c) => !c.projects.length);

  const link = (c) =>
    `<a class="rail-link" href="/${c.slug}" style="--chip:${c.accent}"${
      active.company === c.slug ? ' aria-current="page"' : ''
    }><span class="chip"></span>${esc(c.short)}${
      c.projects.length ? `<span class="count">${c.projects.length}</span>` : ''
    }</a>`;

  const subs =
    active.company && active.project === undefined
      ? ''
      : '';

  // when a company is open, list its projects underneath it
  const expanded = (c) => {
    if (active.company !== c.slug || !c.projects.length) return '';
    return (
      `<div class="rail-group rail-sub">` +
      c.projects
        .map(
          (p) =>
            `<a class="rail-link" href="/${c.slug}/${p.slug}"${
              active.project === p.slug ? ' aria-current="page"' : ''
            }>${esc(p.name)}</a>`
        )
        .join('') +
      `</div>`
    );
  };

  return `<nav class="rail" aria-label="Estate">
<p class="rail-h">Studio</p>
<div class="rail-group">
  <a class="rail-link" href="/"${active.home ? ' aria-current="page"' : ''}>${icon('layers', 16)}Overview</a>
  <a class="rail-link" href="/programmes"${active.programmes ? ' aria-current="page"' : ''}>${icon('building', 16)}Programmes</a>
  <a class="rail-link" href="/workflow"${active.workflow ? ' aria-current="page"' : ''}>${icon('route', 16)}How review works</a>
</div>
<p class="rail-h">Companies</p>
<div class="rail-group">${withWork.map((c) => link(c) + expanded(c)).join('')}</div>
<p class="rail-h">No work yet</p>
<div class="rail-group">${empty.map((c) => link(c) + expanded(c)).join('')}</div>
${subs}</nav>`;
}

function stripHtml(companies, active) {
  return (
    `<nav class="strip" aria-label="Companies">` +
    `<a href="/"${active.home ? ' aria-current="page"' : ''}>Overview</a>` +
    companies
      .map(
        (c) =>
          `<a href="/${c.slug}" style="--brand:${c.accent}"${
            active.company === c.slug ? ' aria-current="page"' : ''
          }><span class="chip" style="--chip:${c.accent}"></span>${esc(c.short)}</a>`
      )
      .join('') +
    `</nav>`
  );
}

function crumbsHtml(trail) {
  return (
    `<nav class="crumbs" aria-label="Breadcrumb">` +
    trail
      .map((c, i) => {
        const last = i === trail.length - 1;
        const sep = i ? icon('chevron-right', 14) : '';
        return (
          sep +
          (last
            ? `<span aria-current="page">${esc(c.name)}</span>`
            : `<a href="${c.href}">${esc(c.name)}</a>`)
        );
      })
      .join('') +
    `</nav>`
  );
}

/**
 * The one page wrapper. Everything the portal serves goes through it, so the
 * chrome, the theme toggle, the search and the skip link can never disagree
 * between pages.
 */
function shell({ title, desc, body, companies, active = {}, index, brand, wide, head = '' }) {
  const bar = `<header class="topbar">
<a class="brandmark" href="/"><span class="dot">HC</span>HCIG&nbsp;<span class="sub">Studio</span></a>
<span class="spacer"></span>
<button class="searchbtn" id="sopen" type="button" aria-label="Search the estate">
  ${icon('search', 16)}<span class="lbl">Search</span><span class="spacer"></span><span class="kbd">Ctrl K</span>
</button>
<button class="iconbtn" id="theme" type="button" aria-label="Switch between light and dark">${icon('sun', 17, 'i-sun')}${icon('moon', 17, 'i-moon')}</button>
</header>`;

  const search = `<div class="sdim" id="sdim" role="dialog" aria-modal="true" aria-label="Search">
  <div class="sbox">
    <div class="field">${icon('search', 18)}<input id="sq" type="search" placeholder="Search companies, projects and deliverables" autocomplete="off" spellcheck="false" aria-controls="sres"></div>
    <div class="sres" id="sres" role="listbox" aria-label="Results"></div>
    <div class="sfoot"><span><span class="kbd">&uarr;&darr;</span> move</span><span><span class="kbd">Enter</span> open</span><span><span class="kbd">Esc</span> close</span></div>
  </div>
</div>`;

  const style = brand ? ` style="--brand:${brand.accent};--brand-ink:${brand.ink}"` : '';

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc || '')}">
<link rel="icon" href="/favicon.svg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap">
<link rel="stylesheet" href="/studio.css">
<script>/* set the theme before first paint so there is no flash */
(function(){try{var t=localStorage.getItem('hcig-theme');if(t)document.documentElement.setAttribute('data-theme',t);}catch(e){}})();</script>
<style>.i-sun{display:none}.i-moon{display:block}:root[data-theme="dark"] .i-sun{display:block}:root[data-theme="dark"] .i-moon{display:none}</style>
${head}
</head>
<body${style}>
<a class="skip" href="#main">Skip to content</a>
${bar}
<div class="shell">
${railHtml(companies, active)}
<main id="main" tabindex="-1">
<div class="wrap"${wide ? ' style="max-width:none"' : ''}>
${stripHtml(companies, active)}
${body}
</div>
<footer class="foot-bar">
  <span>HCIG Studio &middot; internal staging and review</span>
  <span>Served <b>noindex</b>. Nothing here is public.</span>
  <a href="/workflow">How review works</a>
</footer>
</main>
</div>
${search}
<script id="sindex" type="application/json">${JSON.stringify(index).replace(/</g, '\\u003c')}</script>
<script src="/studio.js" defer></script>
</body>
</html>
`;
}

module.exports = { icon, esc, niceDate, pill, shell, crumbsHtml, itemHref, projectCounts, KIND_ICON, KIND_WORD, STATUS, PIPELINE, REVIEWER, OWNER };
