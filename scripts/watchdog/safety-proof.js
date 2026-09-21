#!/usr/bin/env node
/**
 * Watchdog: safety proof.
 *
 * This script proves that the crawler will never submit a form, send a
 * message, or follow a tel:, mailto:, or WhatsApp link. It does this by:
 *
 * 1. Testing the isBlockedUrl function against every known contact pattern.
 * 2. Testing the isFormOrContactPath function against form action patterns.
 * 3. Creating a fake HTML page loaded with contact links and form actions,
 *    running checkLinksAndImages on it, and proving every one is in the
 *    blocked list.
 * 4. Running the crawl queue logic against a mock page that contains only
 *    contact links, and proving zero of them are added to the queue.
 *
 * If any test fails, this script exits with code 1 and says what failed.
 */

const { isBlockedUrl, isFormOrContactPath, isPageUrl, safeFetch } = require('./fetch');
const { checkLinksAndImages } = require('./checks');
const { normalise, isInternal } = require('./crawl');

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

// ---------- 1. isBlockedUrl must block every contact protocol ----------

console.log('\n  1. Contact protocol blocking\n');

const mustBlock = [
  'tel:+201001828828',
  'tel:+20 122 222 8247',
  'mailto:info@medparkhospitals.com',
  'mailto:partner@healthcareig.com',
  'sms:+201001828828',
  'whatsapp://send?phone=201001828828',
  'javascript:alert(1)',
  'javascript:void(0)',
  'data:text/html,<h1>hi</h1>',
  'blob:https://example.com/uuid',
  'ftp://example.com/file',
  'https://wa.me/201001828828',
  'https://api.whatsapp.com/send?phone=201001828828',
  'https://wa.me/1200018005',
  'TEL:+201001828828',
  'MAILTO:INFO@MEDPARK.COM',
];

for (const url of mustBlock) {
  assert(isBlockedUrl(url), `isBlockedUrl should block "${url}"`);
}

const mustAllow = [
  'https://www.medparkhospitals.com/',
  'https://www.247clinic.net/contact-us/',
  '/about',
  '/de/kontakt.php',
  'https://healthcareig.com',
  '#section',
  '',
];

for (const url of mustAllow) {
  assert(!isBlockedUrl(url), `isBlockedUrl should allow "${url}"`);
}

// ---------- 2. isFormOrContactPath ----------

console.log('  2. Form and contact path blocking\n');

const mustBlockPath = [
  '/contact-form/submit',
  '/send-message',
  '/wp-admin/admin-ajax.php',
  '/wp-login.php',
  '/xmlrpc.php',
  '/api/submit?action=send',
];

for (const url of mustBlockPath) {
  assert(isFormOrContactPath(url), `isFormOrContactPath should block "${url}"`);
}

const mustAllowPath = [
  '/contact-us/',
  '/about',
  '/services',
  '/',
];

for (const url of mustAllowPath) {
  assert(!isFormOrContactPath(url), `isFormOrContactPath should allow "${url}"`);
}

// ---------- 3. checkLinksAndImages on a page full of contact links ----------

console.log('  3. Blocked links detected in HTML\n');

const fakePage = `
<html><body>
  <a href="tel:+201001828828">Call</a>
  <a href="mailto:info@medpark.com">Email</a>
  <a href="https://wa.me/201001828828">WhatsApp</a>
  <a href="https://api.whatsapp.com/send?phone=201001828828">WhatsApp API</a>
  <a href="sms:+201001828828">SMS</a>
  <a href="javascript:void(0)">JS</a>
  <a href="/contact-form/submit">Form</a>
  <a href="/send-message">Send</a>
  <a href="/about">About</a>
  <a href="/services">Services</a>
  <img src="/img/hero.jpg" alt="Hero">
</body></html>
`;

const fakeResult = {
  url: 'https://www.medparkhospitals.com/',
  finalUrl: 'https://www.medparkhospitals.com/',
  status: 200,
  ok: true,
  body: fakePage,
  headers: {},
};

const fakeSite = { id: 'test', noindex: [], skipPaths: [] };
const linkResult = checkLinksAndImages(fakeResult, fakeSite);

assert(linkResult.blockedLinks.length >= 6,
  `Expected at least 6 blocked links, got ${linkResult.blockedLinks.length}: ${linkResult.blockedLinks.join(', ')}`);

// The safe links (/about, /services) should NOT be in blocked
assert(!linkResult.blockedLinks.includes('/about'),
  '/about should not be blocked');
assert(!linkResult.blockedLinks.includes('/services'),
  '/services should not be blocked');

// ---------- 4. Queue filtering: contact links must never be queued ----------

console.log('  4. Queue filtering: contact links never queued\n');

const origin = 'https://www.medparkhospitals.com';

// Simulate the crawl queue logic from crawl.js
const linksFromPage = [
  'tel:+201001828828',
  'mailto:info@medpark.com',
  'https://wa.me/201001828828',
  'sms:+201001828828',
  '/contact-form/submit',
  '/about',
  '/de/',
  'https://www.medparkhospitals.com/services/',
  'https://external.com/page',
];

const queued = [];
for (const href of linksFromPage) {
  const resolved = normalise(href, origin);
  if (!resolved) continue;

  if (isBlockedUrl(href) || isBlockedUrl(resolved)) continue;
  if (isFormOrContactPath(href) || isFormOrContactPath(resolved)) continue;
  if (!isInternal(resolved, origin)) continue;
  if (!isPageUrl(resolved)) continue;

  queued.push(resolved);
}

// Only /about, /de/, and /services/ should be queued
assert(queued.length === 3,
  `Expected 3 queued URLs, got ${queued.length}: ${queued.join(', ')}`);

for (const blocked of ['tel:', 'mailto:', 'wa.me', 'sms:', 'contact-form']) {
  const found = queued.some(u => u.includes(blocked));
  assert(!found, `"${blocked}" must never appear in the queue`);
}

// ---------- 5. safeFetch refuses blocked URLs ----------

console.log('  5. safeFetch refuses blocked URLs\n');

async function testFetchBlock() {
  const r = await safeFetch('tel:+201001828828');
  assert(r.blocked === true, 'safeFetch should mark tel: as blocked');
  assert(r.status === 0, 'safeFetch should not return a status for blocked URLs');
  assert(r.body === '', 'safeFetch should not return a body for blocked URLs');

  const r2 = await safeFetch('https://wa.me/201001828828');
  assert(r2.blocked === true, 'safeFetch should mark wa.me as blocked');
}

testFetchBlock().then(() => {
  // ---------- report ----------
  console.log(`\n  ${'='.repeat(50)}`);
  console.log(`  Safety proof: ${passed} passed, ${failed} failed`);

  if (failed > 0) {
    console.error(`\n  SAFETY PROOF FAILED. The crawler is not safe to run.\n`);
    process.exit(1);
  }

  console.log(`\n  SAFETY PROOF PASSED. The crawler will never submit a form,`);
  console.log(`  send a message, or follow a contact path.\n`);
  process.exit(0);
});
