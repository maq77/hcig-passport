<?php
/* ===========================================================================
   The tracker, served by the hub.

   Added 2026-09-04. This one file is what makes the whole platform worth
   building: every property loads its tracker from here, so improving the
   tracker improves every property at once, with no deploy to any of them.

   A property's page carries exactly this, and nothing else:

     <script src="https://<hub>/t.js?s=<token>" defer></script>

   No PHP on the tracked site, which matters: healthcareig.com runs PHP 7.1.33,
   247clinic.net sits behind Cloudflare, and Passport is static on Vercel. A
   script tag works on all three.

   Like the collector, this never opens the database. It reads the small
   registry cache the dashboard writes, so it can refuse an unknown token
   without a connection, a schema or a transaction.

   CACHING
   Five minutes. Long enough that a busy site is not refetching this all day,
   short enough that a fix reaches every property within five minutes without
   anybody being asked to clear anything. The ETag means most of those refetches
   cost a 304 and no body.
   =========================================================================== */
declare(strict_types=1);

/* MPT_, not T_. `T_DIR` is already defined by PHP's tokenizer extension as the
   token id for __DIR__, so `const T_DIR` silently kept the existing integer
   345 and every path built from it pointed at nowhere. The tracker answered
   "not installed" on a correct install. Prefix anything global. */
const MPT_DIR = '/dashboard-data';
const MPT_TTL = 300;

header('Content-Type: application/javascript; charset=utf-8');
header('X-Content-Type-Options: nosniff');
/* Served to other origins by <script src>, which needs no CORS header, but the
   header costs nothing and makes a fetch() of this file work too. */
header('Access-Control-Allow-Origin: *');

function t_stop(string $why): void {
    /* Always valid JavaScript. A broken tracker must never be a broken page. */
    header('Cache-Control: no-store');
    echo "/* mp tracker: " . preg_replace('~[^A-Za-z0-9 .,\-]~', '', $why) . " */\n";
    exit;
}

/* Same rule as the collector and as lib/bootstrap.php: from this file's own
   location, not from DOCUMENT_ROOT, so routing cannot change which install
   this is. */
$dir = dirname(__DIR__, 2) . MPT_DIR;
if (!is_dir($dir)) {
    $alt = dirname((string)($_SERVER['DOCUMENT_ROOT'] ?? '')) . MPT_DIR;
    if (is_dir($alt)) { $dir = $alt; } else { t_stop('not installed'); }
}

$token = isset($_GET['s']) ? preg_replace('~[^A-Za-z0-9_.\-]~', '', (string)$_GET['s']) : '';
if ($token === '' || strlen($token) > 64) { t_stop('no site token'); }

$reg = array();
if (is_file($dir . '/sites.json')) {
    $j = json_decode((string)@file_get_contents($dir . '/sites.json'), true);
    if (is_array($j)) $reg = $j;
}
if (!isset($reg[$token])) { t_stop('unknown site token'); }

$src = __DIR__ . '/assets/track.js';
if (!is_file($src)) { t_stop('tracker missing'); }

/* The collector sits beside this file, wherever the hub is installed, so a move
   to another host or another directory needs no edit anywhere. */
$scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host   = (string)($_SERVER['HTTP_HOST'] ?? '');
$base   = rtrim(str_replace('\\', '/', dirname((string)($_SERVER['SCRIPT_NAME'] ?? '/'))), '/');
$endpoint = $scheme . '://' . $host . $base . '/c.php?s=' . rawurlencode($token);

$cfg = 'window.__MP_CFG={e:' . json_encode($endpoint, JSON_UNESCAPED_SLASHES)
     . ',s:' . json_encode($token) . '};' . "\n";
$body = $cfg . (string)file_get_contents($src);

$etag = '"' . substr(sha1($body), 0, 20) . '"';
header('ETag: ' . $etag);
header('Cache-Control: public, max-age=' . MPT_TTL);
if (trim((string)($_SERVER['HTTP_IF_NONE_MATCH'] ?? '')) === $etag) {
    http_response_code(304);
    exit;
}
echo $body;
