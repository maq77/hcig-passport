/**
 * Watchdog: per-page checks.
 *
 * Each check function receives a FetchResult and the site config, and returns
 * an array of findings. A finding is:
 *
 *   { kind, severity, message, detail }
 *
 * kind:      a machine-readable category (e.g. 'broken-link', 'noindex', 'no-canonical')
 * severity:  'critical' | 'warning' | 'info'
 * message:   a short human-readable description
 * detail:    optional extra data (the broken URL, the bad tag, etc.)
 *
 * IMPORTANT: A check that fails to run (e.g. the page did not load, the
 * regex did not match) records a FAILURE, never a fault. A failure means
 * "we could not check this", not "the page is broken". This distinction
 * is enforced by the crawl loop, not by these functions.
 */

const { URL } = require('node:url');
const { isBlockedUrl, isFormOrContactPath } = require('./fetch');

// ---------- helpers ----------

/** Extract all matches of a regex from a string as an array. */
function allMatches(str, re) {
  const out = [];
  for (const m of str.matchAll(re)) out.push(m);
  return out;
}

/** Strip script and style blocks so we parse visible content and meta tags only. */
function stripScripts(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '');
}

// ---------- check: response status ----------

function checkStatus(result) {
  const findings = [];
  if (result.error) {
    findings.push({
      kind: 'fetch-error',
      severity: 'critical',
      message: `Failed to fetch: ${result.error}`,
    });
    return findings;
  }
  if (result.status >= 500) {
    findings.push({
      kind: 'server-error',
      severity: 'critical',
      message: `Server error ${result.status}`,
    });
  } else if (result.status >= 400) {
    findings.push({
      kind: 'client-error',
      severity: 'critical',
      message: `HTTP ${result.status}`,
    });
  } else if (result.status >= 300 && result.status < 400) {
    // Redirects are not faults, but worth recording
    findings.push({
      kind: 'redirect',
      severity: 'info',
      message: `Redirects to ${result.finalUrl}`,
    });
  }
  return findings;
}

// ---------- check: indexability ----------

function checkIndexability(result, site) {
  const findings = [];
  if (!result.body) return findings;

  const html = result.body;

  // Check meta robots
  const robotsMatch = html.match(/<meta[^>]+name=["']?robots["']?[^>]+content=["']([^"']+)["']/i);
  const robotsContent = robotsMatch ? robotsMatch[1].toLowerCase() : '';
  const isNoindex = robotsContent.includes('noindex');

  // Check X-Robots-Tag header
  const xRobots = (result.headers['x-robots-tag'] || '').toLowerCase();
  const headerNoindex = xRobots.includes('noindex');

  const pageIsNoindex = isNoindex || headerNoindex;

  // Determine if this page is deliberately noindex
  const path = new URL(result.url).pathname;
  const isDeliberate = site.noindex.includes('*') ||
    site.noindex.some(p => path.startsWith(p));

  if (pageIsNoindex && !isDeliberate) {
    findings.push({
      kind: 'noindex',
      severity: 'critical',
      message: 'Page is noindex but should be indexable',
      detail: isNoindex ? `meta robots: ${robotsContent}` : `X-Robots-Tag: ${xRobots}`,
    });
  }

  if (!pageIsNoindex && isDeliberate) {
    findings.push({
      kind: 'missing-noindex',
      severity: 'warning',
      message: 'Page should be noindex but is not',
    });
  }

  return findings;
}

// ---------- check: canonical ----------

function checkCanonical(result) {
  const findings = [];
  if (!result.body || !result.ok) return findings;

  const html = result.body;
  const canonicals = allMatches(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/gi);

  if (canonicals.length === 0) {
    findings.push({
      kind: 'no-canonical',
      severity: 'warning',
      message: 'No canonical link',
    });
  } else if (canonicals.length > 1) {
    findings.push({
      kind: 'multiple-canonicals',
      severity: 'warning',
      message: `${canonicals.length} canonical links found`,
      detail: canonicals.map(m => m[1]).join(', '),
    });
  } else {
    const canonical = canonicals[0][1];
    // Check if canonical points to a different page (potential issue)
    try {
      const cu = new URL(canonical, result.url);
      const pu = new URL(result.url);
      // Compare paths, ignoring trailing slashes and query strings
      const cPath = cu.pathname.replace(/\/+$/, '') || '/';
      const pPath = pu.pathname.replace(/\/+$/, '') || '/';
      if (cu.origin !== pu.origin) {
        findings.push({
          kind: 'cross-origin-canonical',
          severity: 'info',
          message: `Canonical points to different origin: ${canonical}`,
        });
      } else if (cPath !== pPath) {
        findings.push({
          kind: 'mismatched-canonical',
          severity: 'warning',
          message: `Canonical points to a different path`,
          detail: `Page: ${pPath}, Canonical: ${cPath}`,
        });
      }
    } catch {
      findings.push({
        kind: 'bad-canonical',
        severity: 'warning',
        message: `Canonical URL is not parseable: ${canonical}`,
      });
    }
  }

  return findings;
}

// ---------- check: hreflang ----------

function checkHreflang(result) {
  const findings = [];
  if (!result.body || !result.ok) return findings;

  const html = result.body;
  const tags = allMatches(html, /<link[^>]+rel=["']alternate["'][^>]+hreflang=["']([^"']+)["'][^>]+href=["']([^"']+)["']/gi);
  // Also match reverse attribute order
  const tags2 = allMatches(html, /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']alternate["'][^>]+hreflang=["']([^"']+)["']/gi);

  const pairs = [];
  for (const m of tags) pairs.push({ lang: m[1], href: m[2] });
  for (const m of tags2) pairs.push({ lang: m[2], href: m[1] });

  if (pairs.length === 0) {
    // Not having hreflang is not always a problem, but worth noting
    // Only flag if the site has multiple languages (check for /de/ or /pl/ in the path)
    return findings;
  }

  // Check for self-referencing hreflang.
  //
  // Paths are compared with the trailing slash removed, and against the URL
  // after redirects as well as the one we asked for. Without that this reports
  // a false fault on every page: the crawler strips the trailing slash when it
  // normalises a URL for deduplication, so it would compare "/about" against
  // the page's own "/about/" and conclude there is no self reference. That
  // false positive was reported as real on 9 MedPark pages on 2026-09-22.
  const samePath = (a, b) => {
    const strip = s => (s.length > 1 ? s.replace(/\/+$/, '') : s);
    return strip(a) === strip(b);
  };
  const self = pairs.find(p => {
    for (const against of [result.url, result.finalUrl]) {
      if (!against) continue;
      try {
        const u = new URL(p.href, against);
        const pu = new URL(against);
        if (u.origin === pu.origin && samePath(u.pathname, pu.pathname)) return true;
      } catch { /* a malformed href is caught by the bad-canonical style checks */ }
    }
    return false;
  });
  if (!self) {
    findings.push({
      kind: 'hreflang-no-self',
      severity: 'warning',
      message: 'Hreflang tags present but no self-referencing tag',
    });
  }

  // Check for x-default
  const hasXDefault = pairs.some(p => p.lang === 'x-default');
  if (!hasXDefault && pairs.length > 1) {
    findings.push({
      kind: 'hreflang-no-x-default',
      severity: 'info',
      message: 'No x-default hreflang tag',
    });
  }

  // Check for duplicate languages
  const langs = pairs.map(p => p.lang);
  const dupes = langs.filter((l, i) => langs.indexOf(l) !== i);
  if (dupes.length > 0) {
    findings.push({
      kind: 'hreflang-duplicate-lang',
      severity: 'warning',
      message: `Duplicate hreflang languages: ${[...new Set(dupes)].join(', ')}`,
    });
  }

  return findings;
}

// ---------- check: broken links and images ----------

function checkLinksAndImages(result, site) {
  const findings = [];
  if (!result.body || !result.ok) return { findings, links: [], images: [], blockedLinks: [] };

  const html = result.body;

  // Collect all href and src values
  const links = [];
  const images = [];

  for (const m of html.matchAll(/\bhref=["']([^"']+)["']/gi)) {
    links.push(m[1]);
  }
  for (const m of html.matchAll(/\bsrc=["']([^"']+)["']/gi)) {
    const src = m[1];
    // Classify images vs scripts
    const lower = src.toLowerCase();
    if (lower.match(/\.(jpg|jpeg|png|gif|svg|webp|avif|ico)(\?|$)/)) {
      images.push(src);
    }
  }

  // Record blocked links (these are safe; we just note them)
  const blockedLinks = [];
  for (const href of links) {
    if (isBlockedUrl(href)) {
      blockedLinks.push(href);
    }
    if (isFormOrContactPath(href)) {
      blockedLinks.push(href);
    }
  }

  // We do not resolve links here. The crawl loop checks linked pages.
  // What we do here is flag obviously bad patterns.

  // Check for images with no alt
  for (const tag of html.matchAll(/<img\b[^>]*>/gi)) {
    if (!/\balt=/.test(tag[0])) {
      const src = (tag[0].match(/src=["']([^"']+)["']/) || [])[1] || '(unknown)';
      findings.push({
        kind: 'img-no-alt',
        severity: 'warning',
        message: `Image with no alt attribute`,
        detail: src.slice(0, 120),
      });
    }
  }

  // Check for empty links
  for (const m of html.matchAll(/<a\b[^>]*href=["']([^"']*)["'][^>]*>/gi)) {
    const href = m[1].trim();
    if (href === '' || href === '#') continue; // Fragment links are fine
    // Links to blocked protocols are fine (tel:, mailto:, etc.)
    // They are contact links, which we note but do not flag as broken
  }

  return { findings, links, images, blockedLinks };
}

// ---------- check: structured data ----------

function checkStructuredData(result) {
  const findings = [];
  if (!result.body || !result.ok) return findings;

  const html = result.body;

  // Find JSON-LD blocks
  const ldBlocks = allMatches(html, /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);

  for (const m of ldBlocks) {
    const raw = m[1].trim();
    if (!raw) {
      findings.push({
        kind: 'empty-jsonld',
        severity: 'warning',
        message: 'Empty JSON-LD block',
      });
      continue;
    }
    try {
      const data = JSON.parse(raw);
      // Basic validation: must have @type or @graph
      if (!data['@type'] && !data['@graph'] && !Array.isArray(data)) {
        findings.push({
          kind: 'jsonld-no-type',
          severity: 'warning',
          message: 'JSON-LD has no @type',
          detail: raw.slice(0, 200),
        });
      }
    } catch (err) {
      findings.push({
        kind: 'jsonld-parse-error',
        severity: 'critical',
        message: 'JSON-LD is not valid JSON',
        detail: `${err.message}: ${raw.slice(0, 200)}`,
      });
    }
  }

  return findings;
}

// ---------- check: general page quality ----------

function checkPageQuality(result) {
  const findings = [];
  if (!result.body || !result.ok) return findings;

  const html = result.body;
  const visible = stripScripts(html);

  // Missing title
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!title || !title[1].trim()) {
    findings.push({
      kind: 'no-title',
      severity: 'warning',
      message: 'Page has no title or the title is empty',
    });
  }

  // Missing h1
  const h1s = visible.match(/<h1[\s>]/gi) || [];
  if (h1s.length === 0) {
    findings.push({
      kind: 'no-h1',
      severity: 'warning',
      message: 'No h1 on the page',
    });
  }

  // Leaked template tokens
  const tokens = visible.match(/%%[A-Z0-9_]+%%/g);
  if (tokens) {
    findings.push({
      kind: 'leaked-token',
      severity: 'critical',
      message: `Leaked template tokens: ${[...new Set(tokens)].join(', ')}`,
    });
  }

  // Leaked undefined/NaN
  for (const leak of ['undefined', 'NaN', '[object Object]']) {
    if (visible.includes(leak)) {
      findings.push({
        kind: 'leaked-value',
        severity: 'warning',
        message: `Leaked "${leak}" in the page`,
      });
    }
  }

  // Missing viewport
  if (!/<meta[^>]+name=["']?viewport["']?/i.test(html)) {
    findings.push({
      kind: 'no-viewport',
      severity: 'warning',
      message: 'No viewport meta tag',
    });
  }

  // Missing lang attribute
  if (!/<html[^>]*\slang=/i.test(html)) {
    findings.push({
      kind: 'no-lang',
      severity: 'warning',
      message: 'No lang attribute on html element',
    });
  }

  return findings;
}

// ---------- run all checks ----------

/**
 * Run all checks on a single page result.
 *
 * Returns:
 *   { url, status, findings[], links[], images[], blockedLinks[], checksFailed }
 *
 * If a check throws, it is recorded as a failure (checksFailed), not as a fault.
 */
function checkPage(result, site) {
  const allFindings = [];
  const checksFailed = [];
  let pageLinks = [];
  let pageImages = [];
  let blockedLinks = [];

  const checks = [
    { name: 'status', fn: () => checkStatus(result) },
    { name: 'indexability', fn: () => checkIndexability(result, site) },
    { name: 'canonical', fn: () => checkCanonical(result) },
    { name: 'hreflang', fn: () => checkHreflang(result) },
    { name: 'structured-data', fn: () => checkStructuredData(result) },
    { name: 'page-quality', fn: () => checkPageQuality(result) },
    {
      name: 'links-and-images',
      fn: () => {
        const r = checkLinksAndImages(result, site);
        pageLinks = r.links;
        pageImages = r.images;
        blockedLinks = r.blockedLinks;
        return r.findings;
      },
    },
  ];

  for (const check of checks) {
    try {
      const findings = check.fn();
      allFindings.push(...findings);
    } catch (err) {
      // A failed check is recorded as failed, NEVER as a fault.
      checksFailed.push({
        check: check.name,
        error: err.message,
      });
    }
  }

  return {
    url: result.url,
    finalUrl: result.finalUrl,
    status: result.status,
    durationMs: result.durationMs,
    findings: allFindings,
    links: pageLinks,
    images: pageImages,
    blockedLinks,
    checksFailed,
  };
}

module.exports = {
  checkPage,
  checkStatus,
  checkIndexability,
  checkCanonical,
  checkHreflang,
  checkLinksAndImages,
  checkStructuredData,
  checkPageQuality,
};
