#!/usr/bin/env node
/**
 * Watchdog: CLI entry point.
 *
 * Usage:
 *   node scripts/watchdog/index.js                    crawl all sites
 *   node scripts/watchdog/index.js --site medpark     crawl one site
 *   node scripts/watchdog/index.js --max-pages 10     limit page count (for testing)
 *   node scripts/watchdog/index.js --json             output raw JSON instead of summary
 *   node scripts/watchdog/index.js --out results.json save JSON to file
 *
 * The crawler reports only. It never fixes anything and never touches a live file.
 */

const fs = require('node:fs');
const path = require('node:path');
const { SITES } = require('./sites');
const { crawlSite, crawlAll } = require('./crawl');

// ---------- parse args ----------

const args = process.argv.slice(2);

function flag(name) {
  const i = args.indexOf(name);
  if (i === -1) return null;
  return args[i + 1] || true;
}

const siteFilter = flag('--site');
const maxPages = parseInt(flag('--max-pages') || '500', 10);
const jsonMode = args.includes('--json');
const outFile = flag('--out');

// ---------- select sites ----------

let sites = SITES;
if (siteFilter) {
  sites = SITES.filter(s => s.id === siteFilter);
  if (sites.length === 0) {
    console.error(`Unknown site "${siteFilter}". Available: ${SITES.map(s => s.id).join(', ')}`);
    process.exit(1);
  }
}

// ---------- progress ----------

function logProgress(siteId, pageResult) {
  if (jsonMode) return;

  const status = pageResult.status || '???';
  const findings = pageResult.findings.length;
  const failed = pageResult.checksFailed.length;

  let marker = ' ';
  if (pageResult.findings.some(f => f.severity === 'critical')) marker = '!';
  else if (pageResult.findings.some(f => f.severity === 'warning')) marker = '~';

  const url = pageResult.url.replace(/^https?:\/\/[^/]+/, '');
  const line = `  ${marker} ${String(status).padEnd(3)} ${url}`;
  const suffix = [];
  if (findings > 0) suffix.push(`${findings} finding${findings > 1 ? 's' : ''}`);
  if (failed > 0) suffix.push(`${failed} check${failed > 1 ? 's' : ''} failed`);

  console.log(suffix.length ? `${line}  (${suffix.join(', ')})` : line);
}

function logSiteDone(result) {
  if (jsonMode) return;
  console.log(`\n  ${result.siteName}: ${result.pagesChecked} pages, ${result.criticalCount} critical, ${result.warningCount} warnings, ${result.failedChecks} checks failed\n`);
}

// ---------- summary ----------

function printSummary(group) {
  console.log('\n  WATCHDOG SUMMARY');
  console.log(`  ${'='.repeat(60)}`);
  console.log(`  Sites checked:    ${group.sitesChecked}`);
  console.log(`  Pages checked:    ${group.totalPages}`);
  console.log(`  Total findings:   ${group.totalFindings}`);
  console.log(`  Critical:         ${group.totalCritical}`);
  console.log(`  Warnings:         ${group.totalWarning}`);
  console.log(`  Checks failed:    ${group.totalFailed}`);
  console.log(`  Started:          ${group.startedAt}`);
  console.log(`  Finished:         ${group.finishedAt}`);

  if (group.totalCritical === 0 && group.totalWarning === 0 && group.totalFailed === 0) {
    console.log('\n  All clear. No problems found.\n');
    return;
  }

  // Per-site breakdown
  for (const site of group.sites) {
    console.log(`\n  ${site.siteName} (${site.origin})`);
    console.log(`  ${'-'.repeat(50)}`);

    // Group findings by kind
    const byKind = {};
    for (const page of site.pages) {
      for (const f of page.findings) {
        if (!byKind[f.kind]) byKind[f.kind] = [];
        byKind[f.kind].push({ url: page.url, ...f });
      }
    }

    // Print critical first, then warnings, then info
    const sorted = Object.entries(byKind).sort((a, b) => {
      const sevOrder = { critical: 0, warning: 1, info: 2 };
      const aSev = a[1][0].severity;
      const bSev = b[1][0].severity;
      return (sevOrder[aSev] || 3) - (sevOrder[bSev] || 3);
    });

    for (const [kind, items] of sorted) {
      const sev = items[0].severity.toUpperCase();
      console.log(`\n    [${sev}] ${kind} (${items.length} page${items.length > 1 ? 's' : ''})`);
      // Show up to 5 URLs per kind, then summarise
      const show = items.slice(0, 5);
      for (const item of show) {
        const u = item.url.replace(/^https?:\/\/[^/]+/, '');
        console.log(`      ${u}`);
        if (item.detail) console.log(`        ${item.detail.slice(0, 120)}`);
      }
      if (items.length > 5) {
        console.log(`      ... and ${items.length - 5} more`);
      }
    }

    // Blocked URLs (proof the crawler never followed them)
    if (site.blockedUrls.length > 0) {
      console.log(`\n    BLOCKED (contact paths the crawler refused to follow): ${site.blockedUrls.length}`);
      for (const u of site.blockedUrls.slice(0, 10)) {
        console.log(`      ${u}`);
      }
      if (site.blockedUrls.length > 10) {
        console.log(`      ... and ${site.blockedUrls.length - 10} more`);
      }
    }

    // Failed checks
    const allFailed = site.pages.flatMap(p => p.checksFailed.map(c => ({ url: p.url, ...c })));
    if (allFailed.length > 0) {
      console.log(`\n    FAILED CHECKS (could not run, not a fault): ${allFailed.length}`);
      for (const f of allFailed.slice(0, 5)) {
        console.log(`      ${f.check} on ${f.url.replace(/^https?:\/\/[^/]+/, '')}: ${f.error}`);
      }
    }
  }

  console.log('');
}

// ---------- main ----------

async function main() {
  if (!jsonMode) {
    console.log(`\n  HCIG Watchdog`);
    console.log(`  Crawling ${sites.length} site${sites.length > 1 ? 's' : ''}, max ${maxPages} pages each\n`);
  }

  const group = await crawlAll(
    sites,
    { maxPages },
    logSiteDone,
    logProgress,
  );

  if (outFile) {
    const outPath = path.resolve(outFile);
    fs.writeFileSync(outPath, JSON.stringify(group, null, 2));
    if (!jsonMode) console.log(`  Results saved to ${outPath}\n`);
  }

  if (jsonMode) {
    console.log(JSON.stringify(group, null, 2));
  } else {
    printSummary(group);
  }

  // Exit code: 1 if critical findings, 0 otherwise.
  // Failed checks are not a fault, so they do not affect the exit code.
  process.exit(group.totalCritical > 0 ? 1 : 0);
}

main().catch(err => {
  console.error(`\n  Watchdog crashed: ${err.message}\n`);
  process.exit(2);
});
