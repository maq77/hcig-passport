#!/usr/bin/env node
/**
 * Watchdog: judgement proof.
 *
 * This script proves the judgement layer behaves the way a watchdog has to
 * behave to stay switched on. It tests, against fabricated crawl results so
 * that no live site is touched:
 *
 * 1. A fault is confirmed by a second attempt before any ticket is created.
 * 2. Faults of one kind become one ticket listing every affected page.
 * 3. Running twice in a row never creates a duplicate ticket.
 * 4. Anything that removes a page from search is raised as critical.
 * 5. Deliberate noindex pages are listed as expected and never reported.
 * 6. A clean crawl produces no ticket and no notification at all.
 * 7. A site we could not reach is reported as "could not check", never as down.
 * 8. One dead page on an otherwise healthy site is still reported as a fault.
 *
 * If any test fails, this script exits with code 1 and says what failed.
 */

const J = require('./judge');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
  } else {
    failed++;
    console.error(`  FAIL: ${message}`);
  }
}

// ---------- fixtures ----------

const SITE = {
  id: 'testsite',
  name: 'Test Site',
  origin: 'https://example.test',
  seedPaths: ['/'],
  noindex: ['/dashboard/'],
  skipPaths: [],
};

const SITE_ALL_NOINDEX = { ...SITE, id: 'portal', name: 'Portal', noindex: ['*'] };

function page(path, findings) {
  return {
    url: `https://example.test${path}`,
    finalUrl: `https://example.test${path}`,
    status: 200,
    durationMs: 12,
    findings,
    links: [],
    images: [],
    blockedLinks: [],
    checksFailed: [],
  };
}

function crawl(pages) {
  return { siteId: SITE.id, siteName: SITE.name, origin: SITE.origin, pages };
}

/**
 * Confirmation is the one step that touches the network, so the proof injects
 * a deterministic confirmer through opts.confirm and never makes a request.
 * `reproduces` true means the fault is still there on the second attempt.
 */
function stubConfirm(reproduces) {
  return async (groups) => {
    const confirmed = [];
    const cleared = [];
    for (const g of groups.values()) {
      if (reproduces) {
        confirmed.push({
          kind: g.kind,
          severity: g.severity,
          confirmedPages: Math.min(g.pages.length, 10),
          sampled: Math.min(g.pages.length, 10),
          pages: g.pages,
        });
      } else {
        cleared.push({ kind: g.kind, pages: g.pages.length });
      }
    }
    return { confirmed, cleared };
  };
}

/** Options for a test run: no delay, no network, a fixed confirmation answer. */
function opts(reproduces, extra = {}) {
  return { delayMs: 0, confirm: stubConfirm(reproduces), ...extra };
}

// ---------- 1. a fault must be confirmed before it becomes a ticket ----------

console.log('\n  1. Confirmation before filing\n');

async function testConfirmation() {
  const result = crawl([
    page('/a', [{ kind: 'no-h1', severity: 'warning', message: 'No H1' }]),
  ]);

  // the fault does not reproduce on the second attempt
  const blip = await J.judgeSite(result, SITE, opts(false));
  assert(blip.tickets.length === 0, 'A fault that clears on retry must not become a ticket');
  assert(blip.cleared.length === 1, 'A cleared fault must be recorded as cleared');
  assert(blip.notify === false, 'A cleared fault must not notify');

  // the fault reproduces on the second attempt
  const real = await J.judgeSite(result, SITE, opts(true));
  assert(real.tickets.length === 1, 'A fault that reproduces must become a ticket');
  assert(
    /Confirmed with a second request/.test(real.tickets[0].description),
    'The ticket must say the fault was confirmed with a second request',
  );
}

// ---------- 2. one kind becomes one ticket listing every page ----------

console.log('  2. Grouping\n');

async function testGrouping() {
  const pages = [];
  for (let i = 1; i <= 20; i++) {
    pages.push(page(`/p${i}`, [{ kind: 'img-no-alt', severity: 'warning', message: 'Image has no alt' }]));
  }
  const v = await J.judgeSite(crawl(pages), SITE, opts(true));

  assert(v.tickets.length === 1, 'Twenty pages with one kind of fault must be one ticket');
  assert(v.tickets[0].group.pages.length === 20, 'The ticket must carry all 20 affected pages');
  const listed = (v.tickets[0].description.match(/https:\/\/example\.test\/p\d+/g) || []).length;
  assert(listed === 20, `The ticket must list every affected page, listed ${listed} of 20`);

  // Two different kinds must stay two tickets.
  const mixed = crawl([
    page('/x', [{ kind: 'img-no-alt', severity: 'warning', message: 'no alt' }]),
    page('/y', [{ kind: 'no-title', severity: 'warning', message: 'no title' }]),
  ]);
  const v2 = await J.judgeSite(mixed, SITE, opts(true));
  assert(v2.tickets.length === 2, 'Two different kinds must produce two tickets');
}

// ---------- 3. running twice must not duplicate ----------

console.log('  3. Deduplication\n');

async function testDedupe() {
  const result = crawl([
    page('/a', [{ kind: 'no-h1', severity: 'warning', message: 'No H1' }]),
  ]);

  const first = await J.judgeSite(result, SITE, opts(true));
  assert(first.tickets.length === 1, 'First run must file the ticket');

  // Simulate the ticket now being open, exactly as the runner records it.
  const open = {};
  open[first.tickets[0].fingerprint] = 'T-999';

  const second = await J.judgeSite(result, SITE, opts(true, { openTickets: open }));
  assert(second.tickets.length === 0, 'Second run must not file a duplicate ticket');
  assert(second.duplicates.length === 1, 'Second run must record it as a duplicate');
  assert(second.duplicates[0].ticket === 'T-999', 'The duplicate must name the open ticket');
  assert(second.notify === false, 'A run that only finds duplicates must not notify');

  assert(
    J.fingerprint('a', 'b') === J.fingerprint('a', 'b'),
    'The fingerprint must be stable across runs',
  );
  assert(
    J.fingerprint('a', 'b') !== J.fingerprint('a', 'c'),
    'Different kinds must have different fingerprints',
  );
}

// ---------- 4. anything that removes a page from search is critical ----------

console.log('  4. Search-removing faults are critical\n');

async function testCritical() {
  for (const kind of J.SEARCH_REMOVING) {
    // Deliberately fed in at the lowest severity the checks could assign.
    // A healthy page sits alongside it so the site counts as reachable: a
    // crawl where the only page failed to fetch is an unreachable site, not
    // a fault, and that case is covered separately in test 7.
    const result = crawl([
      page('/healthy', []),
      page('/a', [{ kind, severity: 'warning', message: kind }]),
    ]);
    const v = await J.judgeSite(result, SITE, opts(true));
    assert(v.tickets.length === 1, `${kind} must produce a ticket`);
    assert(
      v.tickets[0].group.severity === 'critical',
      `${kind} removes a page from search and must be raised as critical`,
    );
    assert(
      v.tickets[0].priority === 'high',
      `${kind} must be filed at high priority`,
    );
    assert(
      /removes a page from search/.test(v.tickets[0].description),
      `${kind} ticket must explain why it is urgent`,
    );
  }
}

// ---------- 5. deliberate noindex is expected, never reported ----------

console.log('  5. Deliberate noindex\n');

async function testExpectedNoindex() {
  // A path listed as noindex for this site.
  const result = crawl([
    page('/dashboard/overview', [{ kind: 'noindex', severity: 'critical', message: 'noindex' }]),
  ]);
  const v = await J.judgeSite(result, SITE, opts(true));
  assert(v.tickets.length === 0, 'A deliberately noindex page must never be reported');
  assert(v.expectedNoindex.length === 1, 'A deliberately noindex page must be listed as expected');
  assert(
    v.expectedNoindex[0] === 'https://example.test/dashboard/overview',
    'The expected list must name the page',
  );

  // A site that is noindex everywhere.
  const all = {
    siteId: 'portal',
    pages: [
      page('/', [{ kind: 'noindex', severity: 'critical', message: 'noindex' }]),
      page('/anything', [{ kind: 'noindex', severity: 'critical', message: 'noindex' }]),
    ],
  };
  const v2 = await J.judgeSite(all, SITE_ALL_NOINDEX, opts(true));
  assert(v2.tickets.length === 0, 'A wholly noindex site must never report noindex');
  assert(v2.state === 'clean', 'A wholly noindex site with nothing else wrong is clean');

  // But a noindex on a page that is NOT meant to be noindex is still critical.
  const bad = crawl([page('/about', [{ kind: 'noindex', severity: 'critical', message: 'noindex' }])]);
  const v3 = await J.judgeSite(bad, SITE, opts(true));
  assert(v3.tickets.length === 1, 'An unexpected noindex must still be reported');
  assert(v3.tickets[0].group.severity === 'critical', 'An unexpected noindex is critical');
}

// ---------- 6. a clean crawl is silent ----------

console.log('  6. Silence on a clean crawl\n');

async function testClean() {
  const result = crawl([page('/a', []), page('/b', [])]);
  const v = await J.judgeSite(result, SITE, opts(true));
  assert(v.state === 'clean', 'A crawl with no findings must be clean');
  assert(v.tickets.length === 0, 'A clean crawl must produce no ticket');
  assert(v.notify === false, 'A clean crawl must produce no notification');

  // Info-level findings alone are still a clean crawl.
  const info = crawl([
    page('/a', [{ kind: 'redirect', severity: 'info', message: 'redirects' }]),
    page('/b', [{ kind: 'hreflang-no-x-default', severity: 'info', message: 'no x-default' }]),
  ]);
  const v2 = await J.judgeSite(info, SITE, opts(true));
  assert(v2.state === 'clean', 'Info findings alone must not make a crawl dirty');
  assert(v2.notify === false, 'Info findings alone must not notify');

  const group = await J.judgeAll({ sites: [result] }, [SITE], opts(true));
  assert(group.notify === false, 'A clean group crawl must not notify');
  assert(group.ticketCount === 0, 'A clean group crawl must file nothing');
}

// ---------- 7. unreachable is not the same as down ----------

console.log('  7. Could not check is not the same as down\n');

async function testUnreachable() {
  // Every page failed to fetch. This is the DNS case that broke the first run.
  const result = crawl([
    page('/', [{ kind: 'fetch-error', severity: 'critical', message: 'Fetch failed: getaddrinfo ENOTFOUND' }]),
    page('/a', [{ kind: 'fetch-error', severity: 'critical', message: 'Fetch failed: getaddrinfo ENOTFOUND' }]),
  ]);
  const v = await J.judgeSite(result, SITE, opts(true));

  assert(v.state === 'unreachable', 'A site we could not reach must be marked unreachable');
  assert(v.tickets.length === 0, 'Being unable to reach a site must never file a fault ticket');
  assert(v.notify === false, 'Being unable to reach a site must not notify as a fault');
  assert(
    /Could not check/.test(v.summary),
    'The summary must say we could not check, not that the site is down',
  );
  assert(
    !/down|broken|offline/i.test(v.summary.replace('Nothing is being reported as broken.', '')),
    'The summary must never claim the site is down',
  );

  // A site where only SOME pages failed is reachable, and the rest is judged.
  const partial = crawl([
    page('/', [{ kind: 'client-error', severity: 'critical', message: 'HTTP 404' }]),
    page('/a', []),
  ]);
  const v2 = await J.judgeSite(partial, SITE, opts(true));
  assert(v2.state === 'faults', 'A partially reachable site must still be judged');
  assert(v2.tickets.length === 1, 'A real 404 on a reachable site must be filed');

  const group = await J.judgeAll({ sites: [result] }, [SITE], opts(true));
  assert(group.unreachable.length === 1, 'The group result must name the unreachable site');
  assert(group.notify === false, 'An unreachable-only group crawl must not notify');
}

// ---------- 8. one dead page on a live site is still a fault ----------

console.log('  8. One dead page on an otherwise healthy site\n');

async function testSingleDeadPage() {
  // The rest of the site answers, so this page refusing to answer is real.
  // This is the /de case on MedPark: eleven pages fine, one that will not load.
  const result = crawl([
    page('/', []),
    page('/about', []),
    page('/de', [{ kind: 'fetch-error', severity: 'critical', message: 'Fetch failed: fetch failed' }]),
  ]);

  const v = await J.judgeSite(result, SITE, opts(true));
  assert(v.state === 'faults', 'A dead page on a reachable site must not be judged clean');
  assert(v.tickets.length === 1, 'A page that will not answer must be filed');
  assert(
    v.tickets[0].group.severity === 'critical',
    'A page that will not answer cannot be indexed, so it is critical',
  );
  assert(
    v.tickets[0].group.pages[0].url === 'https://example.test/de',
    'The ticket must name the dead page',
  );

  // The same failure when NOTHING answered is our network, not their site.
  const allDead = crawl([
    page('/', [{ kind: 'fetch-error', severity: 'critical', message: 'ENOTFOUND' }]),
    page('/de', [{ kind: 'fetch-error', severity: 'critical', message: 'ENOTFOUND' }]),
  ]);
  const v2 = await J.judgeSite(allDead, SITE, opts(true));
  assert(v2.state === 'unreachable', 'Every page failing is our network, not a fault');
  assert(v2.tickets.length === 0, 'Every page failing must never file a ticket');

  // And a dead page that comes back on the retry was a blip.
  const v3 = await J.judgeSite(result, SITE, opts(false));
  assert(v3.tickets.length === 0, 'A page that answers on the retry must not be filed');
}

// ---------- run ----------

async function main() {
  await testConfirmation();
  await testGrouping();
  await testDedupe();
  await testCritical();
  await testExpectedNoindex();
  await testClean();
  await testUnreachable();
  await testSingleDeadPage();

  console.log(`\n  ${'='.repeat(50)}`);
  console.log(`  Judgement proof: ${passed} passed, ${failed} failed`);

  if (failed > 0) {
    console.error('\n  JUDGEMENT PROOF FAILED. The watchdog would cry wolf.\n');
    process.exit(1);
  }

  console.log('\n  JUDGEMENT PROOF PASSED. Every fault is confirmed, grouped,');
  console.log('  deduplicated, and a clean or unreachable crawl stays silent.\n');
  process.exit(0);
}

main();
