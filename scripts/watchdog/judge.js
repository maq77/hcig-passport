/**
 * Watchdog: the judgement layer.
 *
 * The crawler reports what it saw. This decides what is worth waking someone for.
 * A watchdog that cries wolf gets switched off, so everything here exists to
 * suppress noise:
 *
 *   1. Reachability first. If we could not reach a site at all, that is reported
 *      as "could not check", never as the site being down. Being blocked is not
 *      the same as being broken.
 *   2. Confirmation. Every fault is re-fetched once before it can become a
 *      ticket. A fault that clears on the second attempt was a blip.
 *   3. Grouping. Faults of one kind become one ticket listing every affected
 *      page. Twenty broken images is one ticket, not twenty.
 *   4. Deduplication. A fingerprint per site and kind is held in state, so
 *      running twice in a row never opens a second ticket for the same thing.
 *   5. Expected noindex. Pages that are deliberately noindex are listed as
 *      expected and never reported.
 *   6. Silence. A clean crawl produces no ticket and no notification at all.
 *
 * This module decides only. Creating the ticket is the caller's job.
 */

const { safeFetch } = require('./fetch');
const { checkPage } = require('./checks');

/**
 * Kinds that remove a page from search, or keep it out. These are always
 * critical no matter what severity the check assigned, because the cost of
 * missing one is a page quietly disappearing from Google.
 */
const SEARCH_REMOVING = new Set([
  'noindex',
  'fetch-error',
  'robots-blocked',
  'client-error',
  'server-error',
  'mismatched-canonical',
  'cross-origin-canonical',
  'redirect-to-error',
]);

/**
 * Kinds that describe not being able to reach a page, rather than the page
 * being wrong. These never become faults on their own. They are counted and
 * reported as "could not check".
 */
const UNREACHABLE = new Set(['fetch-error']);

/** Kinds that are recorded but never raise a ticket on their own. */
const NEVER_TICKET = new Set(['redirect']);

/**
 * Decide whether a site was reachable at all.
 *
 * A site counts as unreachable when every page we attempted failed to fetch.
 * That is DNS, a network block or the host refusing us, not the site being
 * broken. Reporting it as downtime is the single fastest way to lose trust in
 * the watchdog, so it gets its own state.
 *
 * @returns {{reachable: boolean, attempted: number, failed: number, reason: string|null}}
 */
function reachability(siteResult) {
  const pages = siteResult.pages || [];
  const attempted = pages.length;
  if (attempted === 0) {
    return { reachable: false, attempted: 0, failed: 0, reason: 'No page was attempted.' };
  }

  const failed = pages.filter(p =>
    p.findings.some(f => UNREACHABLE.has(f.kind)),
  ).length;

  if (failed === attempted) {
    const first = pages[0].findings.find(f => UNREACHABLE.has(f.kind));
    return {
      reachable: false,
      attempted,
      failed,
      reason: first ? first.message : 'Every request failed.',
    };
  }

  return { reachable: true, attempted, failed, reason: null };
}

/**
 * Is this page deliberately noindex for this site?
 * "*" means the whole site is noindex by design.
 */
function isExpectedNoindex(url, site) {
  const list = site.noindex || [];
  if (list.includes('*')) return true;
  try {
    const p = new URL(url).pathname;
    return list.some(n => p.startsWith(n));
  } catch {
    return false;
  }
}

/**
 * Collect the faults from a crawl, dropping everything that is expected,
 * unreachable, or never worth a ticket.
 *
 * `reachable` decides how a page that failed to fetch is treated:
 *   - site unreachable: every failure is our network, so none of them count.
 *   - site reachable:   the rest of the site answered, so a page that will not
 *                       answer is a real fault. It still has to survive
 *                       confirmation before it becomes a ticket.
 *
 * @returns {{groups: Map<string, object>, expectedNoindex: string[]}}
 */
function collect(siteResult, site, reachable = true) {
  const groups = new Map();
  const expectedNoindex = [];

  for (const page of siteResult.pages || []) {
    for (const f of page.findings) {
      if (f.severity === 'info') continue;
      if (NEVER_TICKET.has(f.kind)) continue;
      // A fetch failure counts only when the site as a whole answered us.
      if (UNREACHABLE.has(f.kind) && !reachable) continue;

      // A page that is deliberately noindex is expected, not a fault.
      if (f.kind === 'noindex' && isExpectedNoindex(page.url, site)) {
        expectedNoindex.push(page.url);
        continue;
      }

      const severity = SEARCH_REMOVING.has(f.kind) ? 'critical' : f.severity;
      if (!groups.has(f.kind)) {
        groups.set(f.kind, { kind: f.kind, severity, pages: [] });
      }
      const g = groups.get(f.kind);
      if (severity === 'critical') g.severity = 'critical';
      g.pages.push({ url: page.url, message: f.message });
    }
  }

  return { groups, expectedNoindex: [...new Set(expectedNoindex)] };
}

/**
 * Re-fetch one page and report whether the given kind is still present.
 * A fault that does not reproduce was a blip and must never become a ticket.
 */
async function stillThere(url, kind, site, opts = {}) {
  const result = await safeFetch(url, { timeoutMs: opts.timeoutMs || 30000 });

  // For a fetch failure, the retry failing IS the confirmation: the page
  // would not answer twice. Confirmed, not dismissed.
  if (UNREACHABLE.has(kind)) return !!result.error;

  // For every other kind, a retry we cannot reach proves nothing either way.
  // Unconfirmed is not the same as confirmed, so this returns false.
  if (result.error) return false;

  const page = checkPage(result, site);
  return page.findings.some(f => f.kind === kind);
}

/**
 * Confirm a group of faults with a second attempt.
 *
 * Only the affected pages are re-fetched, one at a time, with the same polite
 * delay the crawler uses. A group survives only if at least one of its pages
 * still shows the fault.
 */
async function confirmGroups(groups, site, opts = {}) {
  const delayMs = opts.delayMs == null ? 500 : opts.delayMs;
  const maxConfirm = opts.maxConfirm || 10;
  const confirmed = [];
  const cleared = [];

  for (const g of groups.values()) {
    const sample = g.pages.slice(0, maxConfirm);
    const survivors = [];

    for (const p of sample) {
      const still = await stillThere(p.url, g.kind, site, opts);
      if (still) survivors.push(p);
      if (delayMs) await new Promise(r => setTimeout(r, delayMs));
    }

    if (survivors.length === 0) {
      cleared.push({ kind: g.kind, pages: g.pages.length });
      continue;
    }

    // Pages beyond the confirmation sample are kept: the kind is proven real,
    // and the ticket should list every page it affects.
    confirmed.push({
      kind: g.kind,
      severity: g.severity,
      confirmedPages: survivors.length,
      sampled: sample.length,
      pages: g.pages,
    });
  }

  return { confirmed, cleared };
}

/** A stable identity for "this problem, on this site". */
function fingerprint(siteId, kind) {
  return `${siteId}:${kind}`;
}

/**
 * Turn one confirmed group into the ticket text.
 * One ticket per kind, listing every affected page.
 */
function ticketFor(group, site) {
  const n = group.pages.length;
  const label = group.severity === 'critical' ? 'CRITICAL' : 'Warning';
  const title = `Watchdog ${label}: ${group.kind} on ${site.name} (${n} page${n === 1 ? '' : 's'})`;

  const lines = [
    `The watchdog crawl of ${site.name} (${site.origin}) found "${group.kind}" on ${n} page${n === 1 ? '' : 's'}.`,
    '',
    `Confirmed with a second request on ${group.confirmedPages} of ${group.sampled} page${group.sampled === 1 ? '' : 's'} checked.`,
    '',
    'Affected pages:',
  ];
  for (const p of group.pages) {
    lines.push(`  ${p.url}`);
    if (p.message) lines.push(`      ${p.message}`);
  }
  if (SEARCH_REMOVING.has(group.kind)) {
    lines.push('');
    lines.push('This kind removes a page from search, or keeps it out. Treat it as urgent.');
  }

  return {
    title,
    description: lines.join('\n'),
    priority: group.severity === 'critical' ? 'high' : 'normal',
    kind: 'bug',
    acceptance: [
      `Every listed page no longer reports "${group.kind}".`,
      'The cause is named, not only the symptom.',
      'A re-run of the watchdog on this site is clean for this kind.',
    ],
  };
}

/**
 * Judge one site's crawl result.
 *
 * @param {object} siteResult - one entry from crawlAll, or a crawlSite result
 * @param {object} site - the site config
 * @param {object} opts - { openTickets, delayMs, timeoutMs, maxConfirm, confirm }
 *   `confirm` replaces the confirmation step. It exists so the proof can run
 *   without touching the network, and so a caller can supply a cheaper check.
 * @returns {Promise<object>} the verdict
 */
async function judgeSite(siteResult, site, opts = {}) {
  const open = opts.openTickets || {};
  const confirm = opts.confirm || confirmGroups;
  const reach = reachability(siteResult);

  if (!reach.reachable) {
    // Could not check. This is our problem, not the site's. No fault, no ticket.
    return {
      siteId: site.id,
      siteName: site.name,
      state: 'unreachable',
      notify: false,
      tickets: [],
      duplicates: [],
      cleared: [],
      expectedNoindex: [],
      reach,
      summary: `Could not check ${site.name}: ${reach.reason} Nothing is being reported as broken.`,
    };
  }

  const { groups, expectedNoindex } = collect(siteResult, site, reach.reachable);

  if (groups.size === 0) {
    return {
      siteId: site.id,
      siteName: site.name,
      state: 'clean',
      notify: false,
      tickets: [],
      duplicates: [],
      cleared: [],
      expectedNoindex,
      reach,
      summary: `${site.name} is clean. ${reach.attempted} pages checked, nothing to report.`,
    };
  }

  const { confirmed, cleared } = await confirm(groups, site, opts);

  const tickets = [];
  const duplicates = [];
  for (const g of confirmed) {
    const fp = fingerprint(site.id, g.kind);
    if (open[fp]) {
      duplicates.push({ kind: g.kind, fingerprint: fp, ticket: open[fp], pages: g.pages.length });
      continue;
    }
    tickets.push({ fingerprint: fp, group: g, ...ticketFor(g, site) });
  }

  const state = tickets.length > 0 ? 'faults' : 'clean';
  const summary = tickets.length
    ? `${site.name}: ${tickets.length} confirmed problem${tickets.length === 1 ? '' : 's'} to file.`
    : `${site.name}: nothing new. ${cleared.length} cleared on retry, ${duplicates.length} already open.`;

  return {
    siteId: site.id,
    siteName: site.name,
    state,
    notify: tickets.length > 0,
    tickets,
    duplicates,
    cleared,
    expectedNoindex,
    reach,
    summary,
  };
}

/**
 * Judge a whole group crawl. Sites are judged independently.
 * notify is true only if at least one site has something new to file.
 */
async function judgeAll(groupResult, sites, opts = {}) {
  const byId = new Map(sites.map(s => [s.id, s]));
  const verdicts = [];

  for (const sr of groupResult.sites || []) {
    const site = byId.get(sr.siteId);
    if (!site) continue;
    verdicts.push(await judgeSite(sr, site, opts));
  }

  const ticketCount = verdicts.reduce((n, v) => n + v.tickets.length, 0);
  const unreachable = verdicts.filter(v => v.state === 'unreachable');

  return {
    verdicts,
    ticketCount,
    unreachable: unreachable.map(v => ({ siteId: v.siteId, reason: v.reach.reason })),
    notify: ticketCount > 0,
  };
}

module.exports = {
  judgeSite,
  judgeAll,
  reachability,
  collect,
  confirmGroups,
  fingerprint,
  ticketFor,
  isExpectedNoindex,
  SEARCH_REMOVING,
  UNREACHABLE,
};
