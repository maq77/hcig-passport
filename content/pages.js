/**
 * HCIG Studio: the page set.
 *
 * Five page types, all generated from `content/registry.js`:
 *
 *   /                       overview     the group, what is moving, where to go
 *   /workflow               process      how a thing gets from draft to live
 *   /:company               company      one brand and its projects
 *   /:company/:project      project      one project, its stages and deliverables
 *   /:company/:project/:id  deliverable  the thing itself
 */

const {
  icon, esc, niceDate, pill, shell, crumbsHtml, itemHref,
  KIND_ICON, KIND_WORD, STATUS, PIPELINE, REVIEWER, OWNER,
} = require('./layout');

/* Browser-tab title separator. A middle dot, never a dash: this project does
   not use em dashes or en dashes anywhere. */
const SEP = ' · ';

/* -------------------------------------------------------------- ordering */

/** Work that needs attention sorts above work that is finished or not started. */
const ATTENTION = { changes: 0, review: 1, draft: 2, blocked: 3, approved: 4, live: 5, planned: 6 };
const byAttention = (a, b) =>
  ATTENTION[a.status] - ATTENTION[b.status] || String(b.updated).localeCompare(String(a.updated));

const IS_MOVING = (s) => s === 'draft' || s === 'review' || s === 'changes' || s === 'blocked';

/* ---------------------------------------------------------------- pieces */

function projectCard(company, project) {
  const items = (project.stages || []).reduce((n, s) => n + (s.items || []).length, 0);
  return `<article class="card link">
  <div style="display:flex;align-items:flex-start;gap:12px;justify-content:space-between">
    <h3><a class="stretch" href="/${company.slug}/${project.slug}">${esc(project.name)}<span class="stretch"></span></a></h3>
    ${pill(project.status, 12)}
  </div>
  <p class="desc">${esc(project.summary)}</p>
  <div class="foot">
    <span>${items ? `${items} deliverable${items === 1 ? '' : 's'}` : 'No deliverables yet'}</span>
    <span class="dotsep"></span>
    <span class="num">Updated ${esc(niceDate(project.updated))}</span>
  </div>
</article>`;
}

function companyCard(company) {
  const n = company.projects.length;
  const moving = company.projects.filter((p) => IS_MOVING(p.status)).length;
  const live = company.projects.filter((p) => p.status === 'live').length;

  const facts = n
    ? [`<span class="num">${n} project${n === 1 ? '' : 's'}</span>`]
        .concat(moving ? [`<span class="dotsep"></span><span class="num">${moving} in motion</span>`] : [])
        .concat(live ? [`<span class="dotsep"></span><span class="num">${live} live</span>`] : [])
        .join('')
    : '<span>No work yet</span>';

  return `<article class="card link" style="--brand:${company.accent}">
  <div class="card-head">
    <span class="logo-chip"><img src="/assets/${company.logoFile}" alt=""></span>
    <div class="t">
      <h3><a class="stretch" href="/${company.slug}">${esc(company.name)}<span class="stretch"></span></a></h3>
      <p class="where">${esc(company.where)}</p>
    </div>
  </div>
  <p class="desc">${esc(company.what)}</p>
  <div class="foot">${facts}</div>
</article>`;
}

function itemRow(company, project, item) {
  const href = itemHref(company, project, item);
  const ext = item.kind === 'link';
  return `<a class="row" href="${esc(href)}"${ext ? ' target="_blank" rel="noopener noreferrer"' : ''}>
  <span class="kind" aria-hidden="true">${icon(KIND_ICON[item.kind], 17)}</span>
  <span class="t">
    <span class="name">${esc(item.name)}${ext ? icon('arrow-up-right', 13) : ''}</span>
    <span class="sub">${esc(KIND_WORD[item.kind])}${item.note ? ' &middot; ' + esc(item.note) : ''}</span>
  </span>
  ${pill(item.status, 12)}
  <span class="go" aria-hidden="true">${icon('chevron-right', 18)}</span>
</a>`;
}

/**
 * A live preview of a hosted deliverable.
 *
 * The iframe is the real page, not a screenshot, so it can never go stale and
 * nothing has to be re-rendered when a document changes. Sizing it 400% wide
 * and scaling it to a quarter makes the thumbnail resolution-independent: the
 * frame always gets a desktop-width viewport whatever the card width happens
 * to be. It is lazy, inert and pointer-transparent, so it costs nothing until
 * it scrolls into view and never steals a click or a tab stop from the link.
 */
function previewCard(company, project, item) {
  const href = itemHref(company, project, item);
  return `<a class="pv" href="${esc(href)}">
  <span class="pv-frame">
    <iframe src="${esc(href)}" loading="lazy" inert tabindex="-1" aria-hidden="true" title=""></iframe>
  </span>
  <span class="pv-body">
    <span class="pv-t">
      <span class="pv-name">${esc(item.name)}</span>
      <span class="pv-sub">${esc(KIND_WORD[item.kind])}${item.note ? ' &middot; ' + esc(item.note) : ''}</span>
    </span>
    ${pill(item.status, 12)}
  </span>
</a>`;
}

function emptyState(title, body, ico = 'inbox') {
  return `<div class="empty">
  <span class="ico">${icon(ico, 22)}</span>
  <h3>${esc(title)}</h3>
  <p>${esc(body)}</p>
</div>`;
}

/* ----------------------------------------------------------- review steps */

const STEPS = [
  ['Build here', 'Never straight onto a company server.'],
  ['Send the link', 'A real URL, not a screenshot.'],
  ['Take the edits', 'Same link. The page updates behind it.'],
  ['Sign off', 'Approved is the gate.'],
  ['Deploy', 'Only then does it reach their hosting.'],
];

function stepsHtml() {
  return `<ol class="steps">${STEPS.map(
    ([h, p]) => `<li><h3>${esc(h)}</h3><p>${esc(p)}</p></li>`
  ).join('')}</ol>`;
}

/* -------------------------------------------------------------- overview */

/** A company folder on the stage. The tab takes the company's own accent, and
 *  the brand mark sits on white so it is never placed on a low-contrast ground. */
function folderTile(company) {
  const n = company.projects.length;
  const live = company.projects.filter((p) => p.status === 'live').length;
  const moving = company.projects.filter((p) => IS_MOVING(p.status)).length;

  // an empty folder says where the company is rather than repeating the heading
  const meta = n
    ? (live ? '<span class="live-dot"></span>' : '') +
      `<span>${n} project${n === 1 ? '' : 's'}${moving ? `, ${moving} in motion` : ''}</span>`
    : `<span>${esc(company.where)}</span>`;

  return `<a class="folder${n ? '' : ' quiet'}" href="/${company.slug}" style="--brand:${company.accent}">
  <span class="folder-face">
    <span class="folder-logo"><img src="/assets/${company.logoFile}" alt=""></span>
    <span class="folder-body">
      <span class="folder-name">${esc(company.short)}</span>
      <span class="folder-meta">${meta}</span>
    </span>
  </span>
</a>`;
}

/** Every flagship, in rank order, each carrying the company it is built under. */
function flagships(companies) {
  return companies
    .flatMap((c) => c.projects.filter((p) => p.flagship).map((p) => ({ c, p })))
    .sort((a, b) => a.p.flagship.rank - b.p.flagship.rank);
}

/** A programme card. Larger than a folder tile because these are the three
 *  things a reviewer should look at before anything else. */
function programmeCard({ c, p }, rank) {
  const items = (p.stages || []).reduce((n, s) => n + (s.items || []).length, 0);
  return `<article class="prog" style="--brand:${c.accent}">
  <p class="prog-rank"><span>${String(rank).padStart(2, '0')}</span>${esc(c.name)}</p>
  <h3><a class="stretch" href="/${c.slug}/${p.slug}">${esc(p.name)}</a></h3>
  <p class="prog-line">${esc(p.flagship.line)}</p>
  <div class="prog-foot">
    ${pill(p.status, 12)}
    <span>${items ? `${items} deliverable${items === 1 ? '' : 's'}` : 'No deliverables yet'}</span>
    <span class="dotsep"></span>
    <span class="num">${esc(niceDate(p.updated))}</span>
  </div>
  <span class="logo-chip prog-logo"><img src="/assets/${c.logoFile}" alt=""></span>
</article>`;
}

function programmesPage(ctx) {
  const list = flagships(ctx.companies);

  const body = `
${crumbsHtml([{ name: 'Studio', href: '/' }, { name: 'Programmes' }])}
<header class="masthead">
  <p class="eyebrow">Group programmes</p>
  <h1>The three that change how the group works</h1>
  <p class="lede">Not one company's website. Work that every property ends up using.</p>
</header>

<div class="progs">${list.map((f, i) => programmeCard(f, i + 1)).join('')}</div>

<section class="section" aria-labelledby="h-why">
  <div class="section-head"><h2 id="h-why">Why these three</h2></div>
  <div class="grid three">
    <article class="card"><h3>${icon('layers', 17)}Built once, used everywhere</h3><p class="desc">Each one is designed for the group, not for a single site.</p></article>
    <article class="card"><h3>${icon('building', 17)}HCIG is the parent</h3><p class="desc">They live under Healthcare International Group and reach every brand under it.</p></article>
    <article class="card"><h3>${icon('check', 17)}Same gate as everything else</h3><p class="desc">Scale changes nothing. They still go through review before they go live.</p></article>
  </div>
</section>
`;

  return shell({
    title: 'Programmes' + SEP + 'HCIG Studio',
    desc: 'Group-wide work: HCIG Passport, the tracking platform and the AI assistant.',
    body,
    companies: ctx.companies,
    active: { programmes: true },
    index: ctx.index,
  });
}

/**
 * Every deliverable in the group, in one sortable table. The view for someone
 * who wants to see the whole estate at once rather than open nine folders.
 */
function allWorkPage(ctx) {
  const rows = [];
  for (const c of ctx.companies) {
    for (const p of c.projects) {
      for (const st of p.stages || []) {
        for (const it of st.items || []) {
          rows.push({ c, p, st, it });
        }
      }
    }
  }
  rows.sort((a, b) => String(b.p.updated).localeCompare(String(a.p.updated)));

  const body = rows
    .map(({ c, p, st, it }) => {
      const href = itemHref(c, p, it);
      const ext = it.kind === 'link';
      // data-label carries the column name so the table can stack into cards
      // on a phone without losing what each value means. data-status tints the
      // whole row: a second, redundant cue on top of the pill, never the only
      // one, so the meaning survives for anyone who cannot see the colour.
      return `<tr data-status="${it.status}">
  <td data-label="Deliverable"><a href="${esc(href)}"${ext ? ' target="_blank" rel="noopener noreferrer"' : ''}>${esc(it.name)}${
        ext ? ' ' + icon('arrow-up-right', 12) : ''
      }</a></td>
  <td data-label="Company"><span class="chip" style="--chip:${c.accent}"></span> <a href="/${c.slug}">${esc(c.short)}</a></td>
  <td data-label="Project"><a href="/${c.slug}/${p.slug}">${esc(p.name)}</a></td>
  <td data-label="Stage">${esc(st.name)}</td>
  <td data-label="Status">${pill(it.status, 12)}</td>
  <td data-label="Updated" class="num" data-sort="${esc(p.updated)}">${esc(niceDate(p.updated))}</td>
</tr>`;
    })
    .join('');

  const page = `
${crumbsHtml([{ name: 'Studio', href: '/' }, { name: 'All work' }])}
<header class="masthead">
  <p class="eyebrow">Everything, in one place</p>
  <h1>All work</h1>
  <p class="lede">Every deliverable across the group. Click a column heading to sort.</p>
</header>

<div class="table-scroll" style="margin-top:28px">
  <table class="data" id="allwork">
    <thead><tr>
      <th aria-sort="none">Deliverable</th>
      <th aria-sort="none">Company</th>
      <th aria-sort="none">Project</th>
      <th aria-sort="none">Stage</th>
      <th aria-sort="none">Status</th>
      <th aria-sort="descending">Updated</th>
    </tr></thead>
    <tbody>${body}</tbody>
  </table>
</div>
<p class="note" style="margin-top:16px"><span class="num">${rows.length}</span> deliverables across ${
    ctx.companies.filter((c) => c.projects.length).length
  } companies.</p>
`;

  return shell({
    title: 'All work' + SEP + 'HCIG Studio',
    desc: 'Every deliverable across the group, in one sortable table.',
    body: page,
    companies: ctx.companies,
    active: { all: true },
    index: ctx.index,
  });
}

function homePage(ctx) {
  const { companies } = ctx;
  const withWork = companies.filter((c) => c.projects.length);
  const noWork = companies.filter((c) => !c.projects.length);

  const allProjects = companies.flatMap((c) => c.projects.map((p) => ({ c, p })));
  const deliverables = allProjects.reduce(
    (n, { p }) => n + (p.stages || []).reduce((m, s) => m + (s.items || []).length, 0), 0
  );
  const moving = allProjects.filter(({ p }) => IS_MOVING(p.status)).sort((a, b) => byAttention(a.p, b.p));
  const live = allProjects.filter(({ p }) => p.status === 'live').length;

  const progs = flagships(companies);

  const body = `
<header class="landing">
  <p class="eyebrow">Healthcare International Group</p>
  <h1>Every design, page and site the group is building</h1>
  <p class="lede">Built here. Reviewed here. Deployed to the company <mark>only once it is approved</mark>.</p>
  <div class="stats">
    <span class="stat"><b class="num">${companies.length}</b> companies</span>
    <span class="stat"><b class="num">${allProjects.length}</b> projects</span>
    <span class="stat"><b class="num">${deliverables}</b> deliverables</span>
    <span class="stat"><b class="num">${moving.length}</b> in motion</span>
    <span class="stat"><b class="num">${live}</b> live</span>
  </div>
  <p class="byline">
    <span>Developer <b>${esc(OWNER)}</b></span>
    <span class="dotsep"></span>
    <span>Company <b>Healthcare International Group</b></span>
  </p>
</header>

<section class="section" style="margin-top:var(--s6)" aria-labelledby="h-prog">
  <div class="section-head">
    <h2 id="h-prog">Group programmes</h2>
    <p class="note">Built once, used by every company. <a href="/programmes">All three</a></p>
  </div>
  <div class="progs">${progs.map((f, i) => programmeCard(f, i + 1)).join('')}</div>
</section>

<section class="section" aria-labelledby="h-open">
  <div class="section-head">
    <h2 id="h-open">Open a company</h2>
    <p class="note">${withWork.length} with work under way, ${noWork.length} waiting.</p>
  </div>
  <nav class="folders" aria-labelledby="h-open">${withWork.map(folderTile).join('')}</nav>
  <nav class="folders" aria-label="Companies with nothing built yet" style="margin-top:var(--s3)">${noWork.map(folderTile).join('')}</nav>
</section>

<section class="section" aria-labelledby="h-flow">
  <div class="section-head">
    <h2 id="h-flow">How work reaches a live site</h2>
    <p class="note"><a href="/workflow">The full process</a></p>
  </div>
  ${stepsHtml()}
</section>

<section class="section" aria-labelledby="h-moving">
  <div class="section-head">
    <h2 id="h-moving">In motion</h2>
    <p class="note">Being built, waiting on review, or blocked.</p>
  </div>
  ${
    moving.length
      ? `<div class="rows">${moving
          .map(
            ({ c, p }) => `<a class="row" href="/${c.slug}/${p.slug}" style="--brand:${c.accent}">
  <span class="kind" aria-hidden="true" style="background:${c.accent}1a;border-color:${c.accent}55;color:${c.accentInk}">${icon('folder', 17)}</span>
  <span class="t">
    <span class="name">${esc(p.name)}</span>
    <span class="sub">${esc(c.name)} &middot; updated ${esc(niceDate(p.updated))}</span>
  </span>
  ${pill(p.status, 12)}
  <span class="go" aria-hidden="true">${icon('chevron-right', 18)}</span>
</a>`
          )
          .join('')}</div>`
      : emptyState('Nothing is waiting', 'Everything is finished or not yet started. 🎉', 'check')
  }
</section>

<section class="section" aria-labelledby="h-companies">
  <div class="section-head">
    <h2 id="h-companies">Companies with work under way</h2>
    <p class="note">The other ${noWork.length} are in the folders above.</p>
  </div>
  <div class="grid three">${withWork.map(companyCard).join('')}</div>
</section>
`;

  return shell({
    title: 'HCIG Studio',
    desc: 'Internal staging and review for every Healthcare International Group design, page and website.',
    body,
    companies,
    active: { home: true },
    index: ctx.index,
  });
}

/* -------------------------------------------------------------- workflow */

function workflowPage(ctx) {
  const { companies } = ctx;

  const statusRows = Object.entries(STATUS)
    .map(
      ([k, s]) =>
        `<tr><td>${pill(k, 12)}</td><td>${esc(s.blurb)}</td><td>${esc(
          k === 'approved' ? 'The reviewer' : k === 'live' ? 'Whoever deploys' : k === 'blocked' ? 'Someone outside the team' : 'Us'
        )}</td></tr>`
    )
    .join('');

  const body = `
<header class="masthead">
  <p class="eyebrow">Process</p>
  <h1>How review works</h1>
  <p class="lede">No page reaches a live hospital website without <mark>a named person seeing it and saying yes</mark>.</p>
</header>

<section class="section" style="margin-top:32px" aria-labelledby="h-steps">
  <div class="section-head"><h2 id="h-steps">The five steps</h2></div>
  ${stepsHtml()}
</section>

<section class="section" aria-labelledby="h-status">
  <div class="section-head">
    <h2 id="h-status">What each status means</h2>
    <p class="note">A statement of fact, <mark>not a hope</mark>.</p>
  </div>
  <div class="prose" style="max-width:none">
    <div class="table-scroll"><table>
      <thead><tr><th style="width:190px">Status</th><th>Means</th><th style="width:190px">Whose move</th></tr></thead>
      <tbody>${statusRows}</tbody>
    </table></div>
  </div>
</section>

<section class="section" aria-labelledby="h-rules">
  <div class="section-head"><h2 id="h-rules">The rules</h2></div>
  <div class="grid two">
    <article class="card"><h3>${icon('route', 17)}Staging first</h3><p class="desc">Nothing is built directly on a company server. That removes the review step for good.</p></article>
    <article class="card"><h3>${icon('external-link', 17)}One link, forever</h3><p class="desc">A deliverable keeps its URL. A link sent weeks ago still opens the current work.</p></article>
    <article class="card"><h3>${icon('check', 17)}Approved is a word someone says</h3><p class="desc">${esc(REVIEWER)} approves design, content and strategy. Not "it looks done to us".</p></article>
    <article class="card"><h3>${icon('globe', 17)}Live means deployed</h3><p class="desc">Checked in the rendered page. Not the template, not an exit code.</p></article>
    <article class="card"><h3>${icon('lock', 17)}Blocked stays visible</h3><p class="desc">Waiting on someone outside the team, with the reason written down.</p></article>
    <article class="card"><h3>${icon('file-text', 17)}One source of truth</h3><p class="desc">Every page is generated from <code style="font-family:var(--mono);font-size:.9em">content/registry.js</code>. None are hand-written.</p></article>
  </div>
</section>

<section class="section" aria-labelledby="h-privacy">
  <div class="section-head"><h2 id="h-privacy">What this is not</h2></div>
  <div class="callout">${icon('alert-triangle', 18)}<div>
    <strong>Internal, but not secret.</strong> Served <code style="font-family:var(--mono);font-size:.9em">noindex</code> and disallowed in robots.txt, yet open to anyone holding the link. No patient data, no credentials, no real patient names or photographs.
  </div></div>
</section>

<section class="section" aria-labelledby="h-add">
  <div class="section-head">
    <h2 id="h-add">Adding something</h2>
    <p class="note">Owner ${esc(OWNER)} &middot; reviewer ${esc(REVIEWER)}</p>
  </div>
  <div class="prose">
    <ol>
      <li>Put the file in the repo.</li>
      <li>Add it to <code>content/registry.js</code>.</li>
      <li><code>npm run build</code>. Pages, navigation, counts and search update themselves.</li>
      <li>Push. Vercel deploys.</li>
    </ol>
  </div>
</section>
`;

  return shell({
    title: 'How review works' + SEP + 'HCIG Studio',
    desc: 'The review gate between a draft and a live hospital website.',
    body,
    companies,
    active: { workflow: true },
    index: ctx.index,
  });
}

/* --------------------------------------------------------------- company */

function companyPage(ctx, company) {
  const projects = [...company.projects].sort(byAttention);

  const body = `
${crumbsHtml([{ name: 'Studio', href: '/' }, { name: company.name }])}
<header class="masthead">
  <div class="hero">
    <span class="logo-chip"><img src="/assets/${company.logoFile}" alt="${esc(company.name)} logo"></span>
    <div>
      <p class="eyebrow">Company</p>
      <h1>${esc(company.name)}</h1>
      <p class="lede">${esc(company.what)}</p>
      <div class="meta">
        <span>${icon('building', 14)} ${esc(company.where)}</span>
        ${
          company.site
            ? `<span>${icon('globe', 14)} <a href="${esc(company.site)}" target="_blank" rel="noopener noreferrer">${esc(
                company.site.replace(/^https?:\/\//, '')
              )}</a></span>`
            : ''
        }
        <span><b class="num">${projects.length}</b> project${projects.length === 1 ? '' : 's'}</span>
      </div>
    </div>
  </div>
</header>

<section class="section" style="margin-top:36px" aria-labelledby="h-p">
  <div class="section-head">
    <h2 id="h-p">Projects</h2>
    <p class="note">What needs attention first.</p>
  </div>
  ${
    projects.length
      ? `<div class="grid two">${projects.map((p) => projectCard(company, p)).join('')}</div>`
      : emptyState('No work yet', 'The folder is ready when it starts.', 'folder')
  }
</section>
`;

  return shell({
    title: `${company.name}${SEP}HCIG Studio`,
    desc: company.what,
    body,
    companies: ctx.companies,
    active: { company: company.slug },
    index: ctx.index,
    brand: { accent: company.accent, ink: company.accentInk },
  });
}

/* --------------------------------------------------------------- project */

function projectPage(ctx, company, project) {
  const at = PIPELINE.indexOf(project.status);
  const pipeline =
    at === -1
      ? ''
      : `<ol class="pipe" aria-label="Progress">${PIPELINE.map((s, i) => {
          const cls = i < at ? 'done' : i === at ? 'now' : '';
          return `<li class="${cls}">${i <= at ? icon(i < at ? 'check' : STATUS[s].icon, 13) : ''}${esc(STATUS[s].label)}</li>`;
        }).join('')}</ol>`;

  const detail = (project.detail || []).length
    ? `<div class="panel" style="margin-top:28px"><div class="prose" style="max-width:74ch">${project.detail
        .map((d) => `<p>${esc(d)}</p>`)
        .join('')}</div></div>`
    : '';

  const blocked =
    project.status === 'blocked'
      ? `<div class="callout" style="margin-top:24px">${icon('alert-triangle', 18)}<div><strong>Blocked.</strong> Waiting on someone outside the team. No amount of build effort moves it.</div></div>`
      : '';

  const stages = (project.stages || []).length
    ? project.stages
        .map((st) => {
          const items = st.items || [];
          // hosted things can be previewed; a link to somewhere else cannot
          const hosted = items.filter((it) => it.kind !== 'link');
          const links = items.filter((it) => it.kind === 'link');

          const inner = items.length
            ? (hosted.length ? `<div class="pvs">${hosted.map((it) => previewCard(company, project, it)).join('')}</div>` : '') +
              (links.length
                ? `<div class="rows"${hosted.length ? ' style="margin-top:var(--s4)"' : ''}>${links
                    .map((it) => itemRow(company, project, it))
                    .join('')}</div>`
                : '')
            : emptyState('Nothing here yet', st.note || 'No deliverables in this stage.', 'folder');

          return `<section class="section" aria-label="${esc(st.name)}">
  <div class="section-head">
    <h2>${esc(st.name)}</h2>
    ${st.note ? `<p class="note">${esc(st.note)}</p>` : ''}
  </div>
  ${inner}
</section>`;
        })
        .join('')
    : `<section class="section">${emptyState(
        'No deliverables yet',
        'Tracked here. Nothing produced for review.',
        'folder'
      )}</section>`;

  const body = `
${crumbsHtml([
  { name: 'Studio', href: '/' },
  { name: company.name, href: `/${company.slug}` },
  { name: project.name },
])}
<header class="masthead">
  <p class="eyebrow">${esc(company.name)}</p>
  <div style="display:flex;flex-wrap:wrap;align-items:center;gap:14px">
    <h1>${esc(project.name)}</h1>
    ${pill(project.status, 14)}
  </div>
  <p class="lede">${esc(project.summary)}</p>
  <div class="meta">
    <span>Owner <b>${esc(OWNER)}</b></span>
    <span>Reviewer <b>${esc(REVIEWER)}</b></span>
    <span class="num">Updated <b>${esc(niceDate(project.updated))}</b></span>
  </div>
  ${pipeline}
</header>
${blocked}
${detail}
${stages}
`;

  return shell({
    title: `${project.name}${SEP}${company.short}${SEP}HCIG Studio`,
    desc: project.summary,
    body,
    companies: ctx.companies,
    active: { company: company.slug, project: project.slug },
    index: ctx.index,
    brand: { accent: company.accent, ink: company.accentInk },
  });
}

/* ------------------------------------------------------------ deliverable */

/** A Markdown brief, rendered into the portal chrome. */
function docPage(ctx, company, project, item, rendered) {
  const body = `
${crumbsHtml([
  { name: 'Studio', href: '/' },
  { name: company.name, href: `/${company.slug}` },
  { name: project.name, href: `/${company.slug}/${project.slug}` },
  { name: item.name },
])}
<header class="masthead">
  <div style="display:flex;flex-wrap:wrap;align-items:center;gap:14px">
    <h1>${esc(rendered.title || item.name)}</h1>
    ${pill(item.status, 14)}
  </div>
  ${item.note ? `<p class="lede">${esc(item.note)}</p>` : ''}
</header>
<article class="prose" style="margin-top:32px">${rendered.html}</article>
`;

  return shell({
    title: `${item.name}${SEP}${project.name}${SEP}HCIG Studio`,
    desc: item.note || project.summary,
    body,
    companies: ctx.companies,
    active: { company: company.slug, project: project.slug },
    index: ctx.index,
    brand: { accent: company.accent, ink: company.accentInk },
  });
}

/**
 * A self-contained design document that ships its own stylesheet. It is served
 * exactly as authored, with one fixed chip back to its project. Every style on
 * that chip is inline so it cannot collide with the document's own CSS.
 */
function reviewChip(company, project, item) {
  const S = {
    wrap:
      'position:fixed;left:16px;bottom:16px;z-index:2147483000;display:flex;align-items:center;gap:8px;' +
      'padding:8px 14px 8px 10px;border-radius:999px;text-decoration:none;' +
      'background:#14181b;color:#e9edef;border:1px solid #333a41;' +
      'box-shadow:0 8px 28px rgba(0,0,0,.35);' +
      'font:600 13px/1 Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;',
    dot: `width:8px;height:8px;border-radius:3px;background:${company.accent};flex:none;`,
    sub: 'opacity:.6;font-weight:500;',
  };
  return (
    `<a href="/${company.slug}/${project.slug}" style="${S.wrap}" aria-label="Back to ${esc(project.name)} in HCIG Studio">` +
    `<span style="${S.dot}"></span>` +
    `<span>${esc(project.name)}</span>` +
    `<span style="${S.sub}">HCIG Studio</span>` +
    `</a>`
  );
}

module.exports = { homePage, programmesPage, allWorkPage, workflowPage, companyPage, projectPage, docPage, reviewChip, byAttention };
