/**
 * Watchdog: the runner.
 *
 * Crawl, judge, then file what survived judgement. This is the piece the
 * scheduler calls nightly and the piece a human calls by hand for one domain.
 *
 * What it guarantees:
 *   - A clean run files nothing, notifies nothing, and says so quietly.
 *   - A site we could not reach is recorded as "could not check", never as down.
 *   - A fault already covered by an open ticket is never filed twice. The
 *     open-ticket fingerprints live in .hive/state/watchdog.json and are
 *     released as soon as the ticket is done, so a fault that comes back
 *     can be filed again.
 *   - A failed run is recorded and visible in the event log, never silent.
 *
 * Ticket creation is injected. That keeps this module testable and keeps the
 * crawler usable without the hive running.
 */

const fs = require('node:fs');
const path = require('node:path');

const { activeSites } = require('./sites');
const { crawlAll } = require('./crawl');
const { judgeAll } = require('./judge');

const STATE_DIR = path.join(__dirname, '..', '..', '.hive', 'state');
const STATE_FILE = path.join(STATE_DIR, 'watchdog.json');

// ---------- open-ticket state ----------

function loadState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch {
    return { open: {}, lastRun: null, runs: [] };
  }
}

function saveState(state) {
  fs.mkdirSync(STATE_DIR, { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

/**
 * Drop fingerprints whose ticket is no longer open.
 *
 * Without this the watchdog would go quiet forever after the first report:
 * the fingerprint would stay held even after the ticket was fixed and closed,
 * so the fault coming back would never be filed again.
 *
 * @param {object} open - fingerprint to ticket id
 * @param {function} isStillOpen - (ticketId) => boolean
 */
function releaseClosed(open, isStillOpen) {
  if (typeof isStillOpen !== 'function') return { open, released: [] };
  const kept = {};
  const released = [];
  for (const [fp, id] of Object.entries(open)) {
    if (isStillOpen(id)) kept[fp] = id;
    else released.push({ fingerprint: fp, ticket: id });
  }
  return { open: kept, released };
}

// ---------- the run ----------

/**
 * Run the watchdog.
 *
 * @param {object} o
 * @param {string}   [o.site]        crawl one site by id instead of all
 * @param {number}   [o.maxPages]    page cap per site
 * @param {number}   [o.delayMs]     polite delay between requests
 * @param {boolean}  [o.dryRun]      judge but never create a ticket
 * @param {function} [o.createTask]  (ticket) => {id}, injected by the caller
 * @param {function} [o.isStillOpen] (ticketId) => boolean, to release closed ones
 * @param {function} [o.emit]        (type, msg, data) => void, for the event log
 * @param {function} [o.onPage]      progress callback
 * @returns {Promise<object>} the run report
 */
async function run(o = {}) {
  const emit = o.emit || (() => {});
  const startedAt = new Date().toISOString();

  let sites = activeSites();
  if (o.site) {
    sites = sites.filter(s => s.id === o.site);
    if (sites.length === 0) {
      const known = activeSites().map(s => s.id).join(', ');
      throw new Error(`Unknown or disabled site "${o.site}". Active sites: ${known || 'none'}`);
    }
  }
  if (sites.length === 0) {
    throw new Error('No sites are enabled in watchdog.sites.');
  }

  const state = loadState();
  const rel = releaseClosed(state.open || {}, o.isStillOpen);
  state.open = rel.open;

  let crawlResult;
  try {
    crawlResult = await crawlAll(
      sites,
      { maxPages: o.maxPages || 500, delayMs: o.delayMs == null ? 500 : o.delayMs },
      null,
      o.onPage || null,
    );
  } catch (err) {
    // A run that dies must never look like a clean run.
    const report = {
      startedAt,
      finishedAt: new Date().toISOString(),
      ok: false,
      error: `Crawl failed: ${err.message}`,
      sites: sites.map(s => s.id),
      filed: [],
      verdicts: [],
    };
    state.lastRun = report;
    state.runs = [...(state.runs || []), { ts: report.finishedAt, ok: false, error: report.error }].slice(-30);
    saveState(state);
    emit('watchdog.error', `Watchdog run failed: ${err.message}`, { sites: report.sites });
    return report;
  }

  const judgement = await judgeAll(crawlResult, sites, {
    openTickets: state.open,
    delayMs: o.delayMs == null ? 500 : o.delayMs,
  });

  // ---------- file what survived ----------

  const filed = [];
  for (const v of judgement.verdicts) {
    for (const t of v.tickets) {
      if (o.dryRun || typeof o.createTask !== 'function') {
        filed.push({ fingerprint: t.fingerprint, title: t.title, id: null, dryRun: true });
        continue;
      }
      try {
        const created = o.createTask({
          title: t.title,
          description: t.description,
          acceptance: t.acceptance,
          priority: t.priority,
          kind: t.kind,
          assignee: '@agy-cli',
        });
        state.open[t.fingerprint] = created.id;
        filed.push({ fingerprint: t.fingerprint, title: t.title, id: created.id });
      } catch (err) {
        emit('watchdog.error', `Watchdog could not file "${t.title}": ${err.message}`, {
          fingerprint: t.fingerprint,
        });
        filed.push({ fingerprint: t.fingerprint, title: t.title, id: null, error: err.message });
      }
    }
  }

  const finishedAt = new Date().toISOString();
  const unreachable = judgement.unreachable;

  const report = {
    startedAt,
    finishedAt,
    ok: true,
    sites: sites.map(s => s.id),
    pagesChecked: crawlResult.totalPages,
    filed,
    released: rel.released,
    unreachable,
    verdicts: judgement.verdicts.map(v => ({
      siteId: v.siteId,
      siteName: v.siteName,
      state: v.state,
      summary: v.summary,
      tickets: v.tickets.length,
      duplicates: v.duplicates.length,
      cleared: v.cleared.length,
      expectedNoindex: v.expectedNoindex.length,
      pagesChecked: v.reach.attempted,
    })),
  };

  state.lastRun = report;
  state.runs = [...(state.runs || []), {
    ts: finishedAt,
    ok: true,
    filed: filed.length,
    unreachable: unreachable.length,
  }].slice(-30);
  saveState(state);

  // ---------- say something only when there is something to say ----------

  if (filed.length > 0) {
    emit(
      'watchdog.found',
      `Watchdog filed ${filed.length} ticket${filed.length === 1 ? '' : 's'}: ${filed.map(f => f.id || f.title).join(', ')}`,
      { filed },
    );
  }
  if (unreachable.length > 0) {
    // Not a fault. Worth seeing, because it means we did not actually check.
    emit(
      'watchdog.unreachable',
      `Watchdog could not check ${unreachable.length} site${unreachable.length === 1 ? '' : 's'}: ${unreachable.map(u => u.siteId).join(', ')}. Not reported as downtime.`,
      { unreachable },
    );
  }
  if (filed.length === 0 && unreachable.length === 0) {
    // A clean run is recorded in the log, never announced to anyone.
    emit('watchdog.clean', `Watchdog clean: ${crawlResult.totalPages} pages, nothing to report.`, {
      pages: crawlResult.totalPages,
    });
  }

  return report;
}

/** One-line summary of a report, for a human or a log. */
function summarise(report) {
  if (!report.ok) return `Watchdog FAILED: ${report.error}`;
  const bits = [`${report.pagesChecked} pages`];
  if (report.filed.length) bits.push(`${report.filed.length} filed`);
  if (report.unreachable.length) bits.push(`${report.unreachable.length} could not be checked`);
  if (!report.filed.length && !report.unreachable.length) bits.push('clean');
  return `Watchdog: ${bits.join(', ')}.`;
}

module.exports = { run, summarise, loadState, saveState, releaseClosed, STATE_FILE };
