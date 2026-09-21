/**
 * Watchdog: the crawler.
 *
 * Walks a live site starting from its seed URLs, following internal links,
 * and running every check on every page it visits.
 *
 * SAFETY: The crawler uses GET requests only, refuses all blocked protocols
 * and form paths, and verifies every URL before fetching it. It never submits
 * anything. It never changes anything on any site.
 *
 * Concurrency: requests are serialised within a site (one at a time) to
 * avoid hammering the server and to avoid mod_security blocks. Between
 * sites, crawls run one at a time for the same reason.
 *
 * Results: one structured object per site, containing per-page results.
 * The group view is built by reading all site results together.
 */

const { URL } = require('node:url');
const { safeFetch, isBlockedUrl, isFormOrContactPath, isPageUrl } = require('./fetch');
const { checkPage } = require('./checks');

/** Default limits to keep the crawl bounded. */
const DEFAULTS = {
  maxPages: 500,
  delayMs: 500,
  timeoutMs: 30000,
};

/**
 * Normalise a URL for deduplication.
 * Strips fragment, lowercases scheme and host, removes trailing slash on paths
 * (except for root "/").
 */
function normalise(href, base) {
  try {
    const u = new URL(href, base);
    u.hash = '';
    // Normalise path: remove trailing slash unless root
    if (u.pathname.length > 1 && u.pathname.endsWith('/')) {
      u.pathname = u.pathname.slice(0, -1);
    }
    return u.href;
  } catch {
    return null;
  }
}

/**
 * Determine if a URL is internal to the given site origin.
 */
function isInternal(href, origin) {
  try {
    const u = new URL(href);
    return u.origin === origin;
  } catch {
    return false;
  }
}

/**
 * Check if a URL path should be skipped for this site.
 */
function shouldSkip(href, site) {
  try {
    const u = new URL(href);
    return site.skipPaths.some(p => u.pathname.startsWith(p));
  } catch {
    return false;
  }
}

/**
 * Crawl a single site.
 *
 * @param {object} site - Site config from sites.js
 * @param {object} opts - Options (maxPages, delayMs, timeoutMs)
 * @param {function} onPage - Optional callback called after each page: (pageResult) => void
 * @returns {Promise<CrawlResult>}
 *
 * @typedef {object} CrawlResult
 * @property {string} siteId
 * @property {string} siteName
 * @property {string} origin
 * @property {string} startedAt
 * @property {string} finishedAt
 * @property {number} pagesChecked
 * @property {number} totalFindings
 * @property {number} criticalCount
 * @property {number} warningCount
 * @property {number} failedChecks
 * @property {string[]} blockedUrls - URLs that were blocked by safety rules
 * @property {PageResult[]} pages
 */
async function crawlSite(site, opts = {}, onPage = null) {
  const { maxPages, delayMs, timeoutMs } = { ...DEFAULTS, ...opts };

  const startedAt = new Date().toISOString();
  const visited = new Set();
  const queue = [];
  const pages = [];
  const allBlockedUrls = new Set();

  // Seed the queue
  for (const p of site.seedPaths) {
    const full = normalise(p, site.origin);
    if (full) queue.push(full);
  }

  while (queue.length > 0 && visited.size < maxPages) {
    const url = queue.shift();
    const norm = normalise(url, site.origin);
    if (!norm) continue;
    if (visited.has(norm)) continue;

    // Safety: never visit blocked URLs
    if (isBlockedUrl(norm)) {
      allBlockedUrls.add(norm);
      continue;
    }

    // Safety: never visit form or contact paths
    if (isFormOrContactPath(norm)) {
      allBlockedUrls.add(norm);
      continue;
    }

    // Skip paths excluded for this site
    if (shouldSkip(norm, site)) continue;

    // Only crawl internal pages
    if (!isInternal(norm, site.origin)) continue;

    // Only crawl page URLs (skip images, PDFs, etc.)
    if (!isPageUrl(norm)) continue;

    visited.add(norm);

    // Fetch and check
    const result = await safeFetch(norm, { timeoutMs });
    const pageResult = checkPage(result, site);

    // Extract links from the page to add to the queue
    if (result.ok && result.body) {
      for (const href of pageResult.links) {
        // Resolve relative to the page URL
        const resolved = normalise(href, norm);
        if (!resolved) continue;

        // Safety: never follow blocked URLs
        if (isBlockedUrl(href) || isBlockedUrl(resolved)) {
          allBlockedUrls.add(href);
          continue;
        }

        // Safety: never follow form or contact paths
        if (isFormOrContactPath(href) || isFormOrContactPath(resolved)) {
          allBlockedUrls.add(href);
          continue;
        }

        // Only add internal page links
        if (isInternal(resolved, site.origin) && isPageUrl(resolved) && !shouldSkip(resolved, site)) {
          const normalised = normalise(resolved, site.origin);
          if (normalised && !visited.has(normalised)) {
            queue.push(normalised);
          }
        }
      }
    }

    pages.push(pageResult);

    if (onPage) onPage(pageResult);

    // Polite delay between requests
    if (queue.length > 0) {
      await new Promise(r => setTimeout(r, delayMs));
    }
  }

  const finishedAt = new Date().toISOString();

  // Count findings by severity
  let criticalCount = 0;
  let warningCount = 0;
  let totalFindings = 0;
  let failedChecks = 0;

  for (const p of pages) {
    totalFindings += p.findings.length;
    failedChecks += p.checksFailed.length;
    for (const f of p.findings) {
      if (f.severity === 'critical') criticalCount++;
      if (f.severity === 'warning') warningCount++;
    }
  }

  return {
    siteId: site.id,
    siteName: site.name,
    origin: site.origin,
    startedAt,
    finishedAt,
    pagesChecked: pages.length,
    totalFindings,
    criticalCount,
    warningCount,
    failedChecks,
    blockedUrls: [...allBlockedUrls],
    pages,
  };
}

/**
 * Crawl all sites and return a group result.
 *
 * @param {object[]} sites - Array of site configs
 * @param {object} opts - Crawl options
 * @param {function} onSite - Called when a site crawl finishes: (siteResult) => void
 * @param {function} onPage - Called after each page: (siteId, pageResult) => void
 * @returns {Promise<GroupResult>}
 */
async function crawlAll(sites, opts = {}, onSite = null, onPage = null) {
  const startedAt = new Date().toISOString();
  const results = [];

  for (const site of sites) {
    const siteResult = await crawlSite(
      site,
      opts,
      onPage ? (pr) => onPage(site.id, pr) : null,
    );
    results.push(siteResult);
    if (onSite) onSite(siteResult);
  }

  const finishedAt = new Date().toISOString();

  // Group summary
  let totalPages = 0;
  let totalFindings = 0;
  let totalCritical = 0;
  let totalWarning = 0;
  let totalFailed = 0;

  for (const r of results) {
    totalPages += r.pagesChecked;
    totalFindings += r.totalFindings;
    totalCritical += r.criticalCount;
    totalWarning += r.warningCount;
    totalFailed += r.failedChecks;
  }

  return {
    startedAt,
    finishedAt,
    sitesChecked: results.length,
    totalPages,
    totalFindings,
    totalCritical,
    totalWarning,
    totalFailed,
    sites: results,
  };
}

module.exports = { crawlSite, crawlAll, normalise, isInternal };
