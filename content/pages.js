/**
 * HCIG Work: the page set.
 *
 * Five page types, all generated from `content/registry.js`:
 *
 *   /                       overview      companies, big projects, what is moving
 *   /big-projects           big projects  work every company ends up using
 *   /everything             table         every item, sortable
 *   /report                 report        the one he hands his supervisor
 *   /activity               activity      a dated feed of what actually changed
 *   /how-it-works           process       how a thing gets from built to live
 *   /:company               company       one brand and its projects
 *   /:company/:project      project       one project, its sections and items
 *   /:company/:project/:id  item          the thing itself
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
    ${duePill(project)}
    <span>${items ? `${items} item${items === 1 ? '' : 's'}` : 'Nothing to show yet'}</span>${checklistLine(project)}
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
        .concat(moving ? [`<span class="dotsep"></span><span class="num">${moving} being worked on</span>`] : [])
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
 * A live preview of a hosted item.
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
      `<span>${n} project${n === 1 ? '' : 's'}${moving ? `, ${moving} being worked on` : ''}</span>`
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
    <span>${items ? `${items} item${items === 1 ? '' : 's'}` : 'Nothing to show yet'}</span>
    <span class="dotsep"></span>
    <span class="num">${esc(niceDate(p.updated))}</span>
  </div>
  <span class="logo-chip prog-logo"><img src="/assets/${c.logoFile}" alt=""></span>
</article>`;
}

const COUNT_WORD = ['none', 'one', 'two', 'three', 'four', 'five'];

function programmesPage(ctx) {
  const list = flagships(ctx.companies);
  // the heading counts what is actually shown, so it stays true when a
  // programme is held back
  const heading =
    list.length === 1
      ? 'The one project that changes how the group works'
      : `The ${COUNT_WORD[list.length] || list.length} projects that change how the group works`;

  const body = `
${crumbsHtml([{ name: 'Studio', href: '/' }, { name: 'Big projects' }])}
<header class="masthead">
  <p class="eyebrow">Big projects</p>
  <h1>${esc(heading)}</h1>
  <p class="lede">Not one company's website. Work every company ends up using.</p>
</header>

${
  list.length
    ? `<div class="progs">${list.map((f, i) => programmeCard(f, i + 1)).join('')}</div>`
    : emptyState('Nothing listed', 'No big project is on the site right now.', 'building')
}

<section class="section" aria-labelledby="h-why">
  <div class="section-head"><h2 id="h-why">Why these ones</h2></div>
  <div class="grid three">
    <article class="card"><h3>${icon('layers', 17)}Built once, used everywhere</h3><p class="desc">Designed for the whole group, not one site.</p></article>
    <article class="card"><h3>${icon('building', 17)}HCIG is the parent</h3><p class="desc">They sit under Healthcare International Group and reach every brand.</p></article>
    <article class="card"><h3>${icon('check', 17)}Same gate as everything else</h3><p class="desc">Scale changes nothing. They still go through review before they go live.</p></article>
  </div>
</section>
`;

  return shell({
    title: 'Big projects' + SEP + 'HCIG Work',
    // generated from what is actually listed, never a hardcoded list, or a
    // held-back programme leaks into the page source
    desc: list.length
      ? `Group-wide work: ${list.map(({ p }) => p.name).join(', ')}.`
      : 'Group-wide work used by every company.',
    body,
    companies: ctx.companies,
    active: { programmes: true },
    index: ctx.index,
  });
}

/**
 * Every item in the group, in one sortable table. The view for someone
 * who wants the whole estate at once rather than opening nine folders.
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
  <td data-label="Item"><a href="${esc(href)}"${ext ? ' target="_blank" rel="noopener noreferrer"' : ''}>${esc(it.name)}${
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
${crumbsHtml([{ name: 'Studio', href: '/' }, { name: 'Everything' }])}
<header class="masthead">
  <p class="eyebrow">Every company, every project</p>
  <h1>Everything</h1>
  <p class="lede">Every item we have made, newest first. Click a heading to sort.</p>
</header>

<div class="table-scroll" style="margin-top:28px">
  <table class="data" id="allwork">
    <thead><tr>
      <th aria-sort="none">What it is</th>
      <th aria-sort="none">Company</th>
      <th aria-sort="none">Project</th>
      <th aria-sort="none">Stage</th>
      <th aria-sort="none">Status</th>
      <th aria-sort="descending">Updated</th>
    </tr></thead>
    <tbody>${body}</tbody>
  </table>
</div>
<p class="note" style="margin-top:16px"><span class="num">${rows.length}</span> items across ${
    ctx.companies.filter((c) => c.projects.length).length
  } companies.</p>
`;

  return shell({
    title: 'Everything' + SEP + 'HCIG Work',
    desc: 'Every item across the group, in one sortable table.',
    body: page,
    companies: ctx.companies,
    active: { all: true },
    index: ctx.index,
  });
}

/* ---------------------------------------------------------------- report */

const byAttentionPair = (a, b) => byAttention(a.p, b.p);

/**
 * The page he hands his supervisor.
 *
 * Every figure is read off the registry, so it can never disagree with the rest
 * of the site. The period selector filters rows already in the page, which is
 * why this needs no server.
 *
 * Print is the deliverable, not an afterthought: `.report` carries its own
 * print rules so "save as PDF" produces something you would put in front of a
 * director.
 */
function reportPage(ctx, activity) {
  const all = ctx.companies.flatMap((c) => c.projects.map((p) => ({ c, p })));

  const shipped = all.filter(({ p }) => p.status === 'live').sort((a, b) => b.p.updated.localeCompare(a.p.updated));
  const waiting = all.filter(({ p }) => p.status === 'review').sort(byAttentionPair);
  const stuck = all.filter(({ p }) => p.status === 'blocked').sort(byAttentionPair);
  const building = all.filter(({ p }) => p.status === 'draft' || p.status === 'changes').sort(byAttentionPair);
  const approved = all.filter(({ p }) => p.status === 'approved');

  const row = ({ c, p }, extra) => `<li data-updated="${esc(p.updated)}">
  <span class="chip" style="--chip:${c.accent}"></span>
  <span class="rp-t">
    <a href="/${c.slug}/${p.slug}">${esc(p.name)}</a>
    <span class="rp-sub">${esc(c.short)}${extra ? ' &middot; ' + extra : ''}</span>
  </span>
  <span class="rp-date num">${esc(niceDate(p.updated))}</span>
</li>`;

  const block = (id, title, note, list, extra) => `
<section class="rp-block" aria-labelledby="${id}">
  <h2 id="${id}">${esc(title)} <span class="rp-n num">${list.length}</span></h2>
  ${note ? `<p class="rp-note">${esc(note)}</p>` : ''}
  ${
    list.length
      ? `<ul class="rp-list">${list.map((x) => row(x, extra ? extra(x) : '')).join('')}</ul>`
      : `<p class="rp-none">Nothing.</p>`
  }
</section>`;

  const today = new Date().toISOString().slice(0, 10);
  const firstDetail = ({ p }) => esc(((p.detail || [])[0] || 'Waiting on someone outside the team').slice(0, 110));
  const dueNote = ({ p }) => (p.due ? 'due ' + esc(niceDate(p.due)) : '');

  const body = `
${crumbsHtml([{ name: 'HCIG Work', href: '/' }, { name: 'Report' }])}
<div class="report">
  <header class="rp-head">
    <div>
      <p class="eyebrow">Progress report</p>
      <h1>Where the work stands</h1>
      <p class="lede">Generated from the live site. Nothing here is typed by hand.</p>
    </div>
    <div class="rp-meta">
      <p><b>${esc(OWNER)}</b><span>Developer</span></p>
      <p><b>${esc(REVIEWER.split(',')[0])}</b><span>Reviewer</span></p>
      <p><b class="num">${esc(niceDate(today))}</b><span>Report date</span></p>
    </div>
  </header>

  <div class="rp-controls no-print">
    <label for="rp-period">Show</label>
    <select id="rp-period">
      <option value="all">everything</option>
      <option value="30">changed in the last 30 days</option>
      <option value="7">changed in the last 7 days</option>
    </select>
    <button class="iconbtn" type="button" id="rp-print" aria-label="Print this report">${icon('printer', 17)}</button>
  </div>

  <div class="rp-totals">
    <span class="stat"><b class="num">${waiting.length}</b> waiting on you</span>
    <span class="stat"><b class="num">${stuck.length}</b> stuck</span>
    <span class="stat"><b class="num">${building.length}</b> being built</span>
    <span class="stat"><b class="num">${approved.length}</b> ready to deploy</span>
    <span class="stat"><b class="num">${shipped.length}</b> live</span>
  </div>

  ${block('rp-wait', 'Waiting on you', 'Sent for review. Nothing moves until you look.', waiting)}
  ${block('rp-stuck', 'Stuck on someone', 'Blocked outside the team. Each one names why.', stuck, firstDetail)}
  ${block('rp-build', 'Being built now', '', building, dueNote)}
  ${block('rp-approved', 'Approved, ready to go live', '', approved)}
  ${block('rp-live', 'Live on their site', '', shipped)}
  ${
    activity.length
      ? `<section class="rp-block" aria-labelledby="rp-act">
  <h2 id="rp-act">What changed</h2>
  <ul class="rp-list rp-act">${activity
    .slice(0, 40)
    .map(
      (a) =>
        `<li data-updated="${esc(a.date)}"><span class="rp-t"><span>${esc(a.subject)}</span></span>` +
        `<span class="rp-date num">${esc(niceDate(a.date))}</span></li>`
    )
    .join('')}</ul>
</section>`
      : ''
  }

  <p class="rp-foot">HCIG Work &middot; every item above links to the thing itself.</p>
</div>
`;

  return shell({
    title: 'Report' + SEP + 'HCIG Work',
    desc: 'Where the work stands, generated from the live site.',
    body,
    companies: ctx.companies,
    active: { report: true },
    index: ctx.index,
  });
}

/* -------------------------------------------------------------- activity */

/**
 * A dated feed of what actually changed, read from `content/activity.json`.
 *
 * That file is written by `npm run publish` from git log, NOT by the build.
 * Vercel shallow-clones the repo, so running `git log` inside a Vercel build
 * would silently produce a short or empty history.
 */
function activityPage(ctx, activity) {
  const byDay = new Map();
  for (const a of activity) {
    if (!byDay.has(a.date)) byDay.set(a.date, []);
    byDay.get(a.date).push(a);
  }

  const body = `
${crumbsHtml([{ name: 'HCIG Work', href: '/' }, { name: 'Activity' }])}
<header class="masthead">
  <p class="eyebrow">History</p>
  <h1>What changed, and when</h1>
  <p class="lede">Read straight from the commit history. Nothing here is written by hand.</p>
</header>

${
  byDay.size
    ? `<div class="feed">${[...byDay.entries()]
        .map(
          ([day, items]) => `<section class="feed-day">
  <h2 class="num">${esc(niceDate(day))}</h2>
  <ul>${items
    .map(
      (a) =>
        `<li><span class="feed-dot" aria-hidden="true"></span><div><p class="feed-s">${esc(a.subject)}</p>${
          (a.projects || []).length ? `<p class="feed-p">${a.projects.map((x) => esc(x)).join(' &middot; ')}</p>` : ''
        }</div></li>`
    )
    .join('')}</ul>
</section>`
        )
        .join('')}</div>`
    : emptyState('No history yet', 'Run npm run publish once and the commit history appears here.', 'file-text')
}
`;

  return shell({
    title: 'Activity' + SEP + 'HCIG Work',
    desc: 'A dated feed of what changed, from the commit history.',
    body,
    companies: ctx.companies,
    active: { activity: true },
    index: ctx.index,
  });
}

/* ------------------------------------------------------------ due dates */

/** Everything about a due date except whether it has passed. That is decided in
 *  the browser: a build-time comparison is wrong the moment the day turns. */
function duePill(project) {
  if (!project.due) return '';
  const done = project.status === 'live' || project.status === 'approved';
  return (
    `<span class="due" data-due="${esc(project.due)}"${done ? ' data-done' : ''}>` +
    `${icon('clock', 12)}Due ${esc(niceDate(project.due))}</span>`
  );
}

/* ------------------------------------------------------------- checklist */

function checklistHtml(project) {
  const list = project.checklist || [];
  if (!list.length) return '';
  const done = list.filter((i) => i.done).length;
  const pct = Math.round((done / list.length) * 100);

  return `<section class="section" aria-labelledby="h-check">
  <div class="section-head">
    <h2 id="h-check">What is left</h2>
    <p class="note"><span class="num">${done} of ${list.length}</span> done</p>
  </div>
  <div class="bar" role="img" aria-label="${done} of ${list.length} done"><span style="width:${pct}%"></span></div>
  <ul class="checks">${list
    .map(
      (i) =>
        `<li class="${i.done ? 'done' : ''}">` +
        `<span class="box" aria-hidden="true">${i.done ? icon('check', 13) : ''}</span>` +
        `<span class="ck-t">${esc(i.text)}</span>` +
        (i.who ? `<span class="who">${esc(i.who)}</span>` : '') +
        `</li>`
    )
    .join('')}</ul>
</section>`;
}

function checklistLine(project) {
  const list = project.checklist || [];
  if (!list.length) return '';
  const done = list.filter((i) => i.done).length;
  return `<span class="dotsep"></span><span class="num">${done}/${list.length} done</span>`;
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
    <span class="stat"><b class="num">${deliverables}</b> items</span>
    <span class="stat"><b class="num">${moving.length}</b> being worked on</span>
    <span class="stat"><b class="num">${live}</b> live</span>
  </div>
  <p class="byline">
    <span>Developer <b>${esc(OWNER)}</b></span>
    <span class="dotsep"></span>
    <span>Company <b>Healthcare International Group</b></span>
  </p>
</header>

${
  progs.length
    ? `<section class="section" style="margin-top:var(--s6)" aria-labelledby="h-prog">
  <div class="section-head">
    <h2 id="h-prog">Big projects</h2>
    <p class="note">Built once, used by every company. <a href="/big-projects">See ${progs.length === 1 ? 'it' : 'all ' + progs.length}</a></p>
  </div>
  <div class="progs">${progs.map((f, i) => programmeCard(f, i + 1)).join('')}</div>
</section>`
    : ''
}

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
    <p class="note"><a href="/how-it-works">The full process</a></p>
  </div>
  ${stepsHtml()}
</section>

<section class="section" aria-labelledby="h-moving">
  <div class="section-head">
    <h2 id="h-moving">Being worked on now</h2>
    <p class="note">Anything not finished and not idle.</p>
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
    title: 'HCIG Work',
    desc: 'Where every HCIG design and page is reviewed before it goes live.',
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
  <h1>How this works</h1>
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
    <article class="card"><h3>${icon('external-link', 17)}One link, forever</h3><p class="desc">An item keeps its URL. A link sent weeks ago still opens the current work.</p></article>
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
    title: 'How this works' + SEP + 'HCIG Work',
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
    <p class="note">Sorted by what needs attention first.</p>
  </div>
  ${
    projects.length
      ? `<div class="grid two">${projects.map((p) => projectCard(company, p)).join('')}</div>`
      : emptyState('No work yet', 'The folder is ready when it starts.', 'folder')
  }
</section>
`;

  return shell({
    title: `${company.name}${SEP}HCIG Work`,
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
            : emptyState('Nothing here yet', st.note || 'Nothing in this section yet.', 'folder');

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
        'Nothing to show yet',
        'Tracked here. Nothing made for review yet.',
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
    ${duePill(project)}
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
${checklistHtml(project)}
${stages}
`;

  return shell({
    title: `${project.name}${SEP}${company.short}${SEP}HCIG Work`,
    desc: project.summary,
    body,
    companies: ctx.companies,
    active: { company: company.slug, project: project.slug },
    index: ctx.index,
    brand: { accent: company.accent, ink: company.accentInk },
  });
}

/* ------------------------------------------------------------------ item */

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
    title: `${item.name}${SEP}${project.name}${SEP}HCIG Work`,
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
    `<a href="/${company.slug}/${project.slug}" style="${S.wrap}" aria-label="Back to ${esc(project.name)} in HCIG Work">` +
    `<span style="${S.dot}"></span>` +
    `<span>${esc(project.name)}</span>` +
    `<span style="${S.sub}">HCIG Work</span>` +
    `</a>`
  );
}

module.exports = { homePage, programmesPage, allWorkPage, reportPage, activityPage, workflowPage, companyPage, projectPage, docPage, reviewChip, byAttention };
