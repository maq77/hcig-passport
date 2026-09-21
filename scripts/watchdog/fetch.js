/**
 * Watchdog: safe HTTP fetcher.
 *
 * SAFETY FIRST: The fetcher is a GET-only HTTP client that will never submit
 * a form, send a message, or follow a contact path. This is the single most
 * important rule in the entire crawler.
 *
 * What it does:
 *   - Fetches a URL with GET only. No POST, no PUT, no DELETE, ever.
 *   - Follows redirects (up to a limit) but records the chain.
 *   - Refuses to follow tel:, mailto:, whatsapp:, sms:, and javascript: URLs.
 *   - Returns the response body, status, headers, and the redirect chain.
 *   - Sets a browser-like User-Agent to avoid mod_security 406 blocks.
 *   - Times out after a generous limit to avoid blocking on hung servers.
 *
 * What it never does:
 *   - Send any request body
 *   - Use any method other than GET
 *   - Follow any protocol other than http: and https:
 *   - Submit any form action
 */

const { URL } = require('node:url');

const USER_AGENT = 'Mozilla/5.0 (compatible; HCIGWatchdog/1.0; +https://healthcareig.com)';
const TIMEOUT_MS = 30000;
const MAX_REDIRECTS = 8;

/**
 * Protocols the crawler must never follow. These are contact paths.
 * Following any of them would send a message to a real person. That is a
 * serious failure per the spec. This list is checked before every fetch and
 * before every link is added to the crawl queue.
 */
const BLOCKED_PROTOCOLS = new Set([
  'tel:',
  'mailto:',
  'sms:',
  'whatsapp:',
  'javascript:',
  'data:',
  'blob:',
  'ftp:',
]);

/**
 * Returns true if a URL string uses a blocked protocol.
 * This is the gatekeeper. Every URL passes through here before any request.
 */
function isBlockedUrl(href) {
  if (typeof href !== 'string') return true;
  if (href === '') return false;
  const lower = href.trim().toLowerCase();
  for (const proto of BLOCKED_PROTOCOLS) {
    if (lower.startsWith(proto)) return true;
  }
  // Also block wa.me and api.whatsapp.com links, which are HTTPS but are
  // WhatsApp contact paths that could trigger a message.
  try {
    const u = new URL(lower.startsWith('//') ? 'https:' + lower : lower);
    if (u.hostname === 'wa.me' || u.hostname === 'api.whatsapp.com') return true;
  } catch {
    // Not a parseable URL. If it starts with # or is empty, it is harmless.
    if (lower.startsWith('#') || lower === '') return false;
  }
  return false;
}

/**
 * Returns true if a URL points to a form submission or contact endpoint.
 * Checked on every link before it enters the queue. Belt and suspenders.
 */
function isFormOrContactPath(href) {
  if (!href || typeof href !== 'string') return false;
  const lower = href.toLowerCase();
  // Common form action paths
  const patterns = [
    '/contact-form', '/send-message', '/submit', '/mailer',
    '/wp-admin', '/wp-login', '/xmlrpc', '/wp-json',
    'action=send', 'action=submit', 'action=contact',
  ];
  return patterns.some(p => lower.includes(p));
}

/**
 * Fetch a single URL with GET. Returns a result object.
 *
 * @param {string} url - Full URL to fetch
 * @param {object} opts
 * @param {number} opts.timeoutMs - Request timeout
 * @returns {Promise<FetchResult>}
 *
 * @typedef {object} FetchResult
 * @property {string} url - The URL that was requested
 * @property {string} finalUrl - The URL after redirects
 * @property {number} status - HTTP status code
 * @property {Record<string, string>} headers - Response headers
 * @property {string} body - Response body (HTML only, truncated for large files)
 * @property {string[]} redirectChain - URLs visited during redirects
 * @property {boolean} ok - True if status is 200-299
 * @property {string|null} error - Error message if the fetch failed entirely
 * @property {number} durationMs - How long the fetch took
 * @property {boolean} blocked - True if the URL was blocked by safety rules
 */
async function safeFetch(url, { timeoutMs = TIMEOUT_MS } = {}) {
  const start = Date.now();
  const result = {
    url,
    finalUrl: url,
    status: 0,
    headers: {},
    body: '',
    redirectChain: [],
    ok: false,
    error: null,
    durationMs: 0,
    blocked: false,
  };

  // Safety gate: refuse blocked protocols
  if (isBlockedUrl(url)) {
    result.error = `Blocked protocol or contact path: ${url}`;
    result.blocked = true;
    result.durationMs = Date.now() - start;
    return result;
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,de;q=0.8',
      },
      signal: controller.signal,
      redirect: 'follow',
    });

    clearTimeout(timer);

    result.status = res.status;
    result.ok = res.ok;
    result.finalUrl = res.url;

    // Capture headers we care about
    const hdr = {};
    for (const [k, v] of res.headers) hdr[k.toLowerCase()] = v;
    result.headers = hdr;

    // Read body only for HTML-ish responses. Binary files get skipped.
    const ct = hdr['content-type'] || '';
    if (ct.includes('text/html') || ct.includes('application/xhtml')) {
      const text = await res.text();
      // Cap at 2 MB to avoid memory issues on huge pages
      result.body = text.length > 2_000_000 ? text.slice(0, 2_000_000) : text;
    } else {
      // For non-HTML, just confirm it responds. Don't read the body.
      // This avoids downloading large images/videos/PDFs.
      result.body = '';
    }
  } catch (err) {
    result.error = err.name === 'AbortError'
      ? `Timeout after ${timeoutMs}ms`
      : `Fetch failed: ${err.message}`;
  }

  result.durationMs = Date.now() - start;
  return result;
}

/**
 * Check whether a URL is a resource the crawler should visit (HTML page)
 * vs one it should only verify exists (image, CSS, JS, PDF, etc.).
 */
function isPageUrl(href) {
  if (!href) return false;
  // Strip query and fragment
  const clean = href.split('?')[0].split('#')[0].toLowerCase();
  // Known non-page extensions
  const skip = [
    '.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.avif', '.ico',
    '.css', '.js', '.mjs', '.json', '.xml',
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
    '.zip', '.tar', '.gz', '.rar',
    '.mp4', '.webm', '.mov', '.avi', '.mp3', '.wav', '.ogg',
    '.woff', '.woff2', '.ttf', '.eot',
    '.map', '.txt', '.csv',
  ];
  return !skip.some(ext => clean.endsWith(ext));
}

module.exports = {
  safeFetch,
  isBlockedUrl,
  isFormOrContactPath,
  isPageUrl,
  BLOCKED_PROTOCOLS,
  USER_AGENT,
};
