<?php
/* ===========================================================================
   The hub collector. One endpoint, every property.

   Added 2026-09-04. Replaces the per-site copy of track/a.php, which had the
   origin of one website compiled into it and therefore had to be installed
   separately on every property.

   THIS FILE STILL NEVER TOUCHES THE DATABASE.

   That rule is older than the multi-site work and it survives it. An earlier
   beacon opened a SQLite write transaction on every request, on a public URL
   present on every page. On shared hosting SQLite writes serialise, so a burst
   of traffic could hold PHP workers until the account hit its process limit.
   This appends one line to a file and returns.

   Validating which property a beacon belongs to would normally need the
   registry, and the registry lives in the database. So the dashboard writes the
   registry out to a small JSON file whenever it changes, and this reads that:
   one file read, no connection, no schema, no transaction. See
   mp_sites_export_cache() in lib/sites.php.

   CROSS-ORIGIN, ON PURPOSE
   The whole point is that other websites post here. The Origin header is
   checked against the domains registered for the token, exactly, never as a
   substring, so `medparkhospitals.com.attacker.example` cannot pass as MedPark.
   =========================================================================== */
declare(strict_types=1);

const A_DIR       = '/dashboard-data';
const A_SPOOL     = 'a-spool.ndjson';
const A_MAX_BYTES = 12582912;  /* 12 MB ceiling on the spool file */
const A_MAX_POST  = 30000;     /* 30 KB ceiling on one payload */
const A_WINDOW    = 120;       /* rate limit window, seconds */
const A_MAX_HITS  = 40;        /* pages per address per window, per property */

header('Content-Type: text/plain; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function done(string $msg = 'ok'): void { echo $msg; exit; }

/* The data directory sits beside the install, wherever the hub is put, so
   moving the hub is a copy and a DNS change.

   Resolved from this file's own location, exactly as lib/bootstrap.php does
   (dirname(__DIR__, 3) from lib/ is the same directory as dirname(__DIR__, 2)
   from here). Deriving it from DOCUMENT_ROOT instead looked equivalent and is
   not: it depends on how the request was routed, so the same file could find a
   different database depending on whether it was reached through a subdomain,
   a subdirectory or the command line. */
$dir = dirname(__DIR__, 2) . A_DIR;
if (!is_dir($dir)) {
    $alt = dirname((string)($_SERVER['DOCUMENT_ROOT'] ?? '')) . A_DIR;
    if (is_dir($alt)) { $dir = $alt; } else { done(); }
}

/* ---- which property is this? --------------------------------------------- */
$token = isset($_GET['s']) ? preg_replace('~[^A-Za-z0-9_.\-]~', '', (string)$_GET['s']) : '';
if ($token === '' || strlen($token) > 64) { http_response_code(400); done('no site'); }

$reg = array();
$cache = $dir . '/sites.json';
if (is_file($cache)) {
    $j = json_decode((string)@file_get_contents($cache), true);
    if (is_array($j)) $reg = $j;
}
if (!isset($reg[$token])) { http_response_code(404); done('unknown site'); }
$site    = (string)$reg[$token]['key'];
$domains = isset($reg[$token]['domains']) && is_array($reg[$token]['domains'])
         ? $reg[$token]['domains'] : array();

/* ---- cross-origin --------------------------------------------------------
   Answered for the registered origin only. A browser will not deliver the
   response to a page from anywhere else, and an unregistered origin is
   refused outright rather than quietly accepted. */
$origin = (string)($_SERVER['HTTP_ORIGIN'] ?? '');
if ($origin !== '') {
    $host = strtolower((string)parse_url($origin, PHP_URL_HOST));
    if ($host === '' || !in_array($host, $domains, true)) { http_response_code(403); done('bad origin'); }
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
}

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Max-Age: 86400');
    http_response_code(204);
    exit;
}
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') { http_response_code(405); done('post only'); }

/* ---- rate limit, per address and per property ---------------------------- */
$ip = (string)($_SERVER['HTTP_CF_CONNECTING_IP'] ?? $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? '');
$ip = trim(explode(',', $ip)[0]);

$rlDir = $dir . '/rl';
if (!is_dir($rlDir)) { @mkdir($rlDir, 0700, true); }
$rlFile = $rlDir . '/a' . substr(hash('sha256', $token . '|' . $ip), 0, 16);
$now = time();
$raw = @file_get_contents($rlFile);
if ($raw !== false) {
    $parts = explode(':', trim($raw));
    if (count($parts) === 2 && ($now - (int)$parts[0]) < A_WINDOW) {
        $hits = (int)$parts[1] + 1;
        if ($hits > A_MAX_HITS) { http_response_code(429); done('slow down'); }
        @file_put_contents($rlFile, $parts[0] . ':' . $hits, LOCK_EX);
    } else {
        @file_put_contents($rlFile, $now . ':1', LOCK_EX);
    }
} else {
    @file_put_contents($rlFile, $now . ':1', LOCK_EX);
}

/* ---- read and validate --------------------------------------------------- */
if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > A_MAX_POST) { done('too big'); }

$body = file_get_contents('php://input', false, null, 0, A_MAX_POST + 1);
if ($body === false || $body === '' || strlen($body) > A_MAX_POST) { done('too big'); }

$in = json_decode($body, true);
if (!is_array($in)) { done('bad json'); }

$page = '/' . ltrim(strtok((string)($in['p'] ?? ''), '?'), '/');
if (strlen($page) > 200 || !preg_match('~^/[A-Za-z0-9/_.\-]*$~', $page)) { done('bad page'); }

$q = array();
if (is_array($in['q'] ?? null)) {
    foreach (array('utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
                   'gclid', 'fbclid', 'msclkid') as $k) {
        if (isset($in['q'][$k]) && is_scalar($in['q'][$k])) {
            $q[$k] = substr((string)$in['q'][$k], 0, 100);
        }
    }
}

$ev = array();
foreach ((is_array($in['ev'] ?? null) ? $in['ev'] : array()) as $e) {
    if (count($ev) >= 120) break;
    if (is_array($e) && isset($e['n'])) $ev[] = $e;
}

$sec = array();
foreach ((is_array($in['sec'] ?? null) ? $in['sec'] : array()) as $k => $v) {
    if (count($sec) >= 40) break;
    if (is_scalar($v)) $sec[substr((string)$k, 0, 60)] = (int)$v;
}

$row = array(
    'site' => $site,           /* the one field this endpoint adds */
    'ts'  => $now,
    'ip'  => $ip,
    'ua'  => substr((string)($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 300),
    'p'   => $page,
    't'   => substr((string)($in['t'] ?? ''), 0, 200),
    'r'   => substr((string)($in['r'] ?? ''), 0, 300),
    'q'   => $q,
    'l'   => substr((string)($in['l'] ?? ''), 0, 8),
    'd'   => (string)($in['d'] ?? ''),
    'vw'  => (int)($in['vw'] ?? 0),
    'vh'  => (int)($in['vh'] ?? 0),
    's'   => (int)($in['s'] ?? 0),
    'e'   => (int)($in['e'] ?? 0),
    'lt'  => (int)($in['lt'] ?? 0),
    'h'   => (int)($in['h'] ?? -1),
    'w'   => (int)($in['w'] ?? -1),
    'cs'  => ((int)($in['cs'] ?? 0) === 1) ? 1 : 0,
    'cid' => substr(preg_replace('~[^A-Za-z0-9]~', '', (string)($in['cid'] ?? '')) ?? '', 0, 20),
    'ev'  => $ev,
    'sec' => $sec,
);

$spool = $dir . '/' . A_SPOOL;
if (is_file($spool) && filesize($spool) > A_MAX_BYTES) { done('spool full'); }

$line = json_encode($row, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
if ($line === false) { done('bad payload'); }

@file_put_contents($spool, $line . "\n", FILE_APPEND | LOCK_EX);
@chmod($spool, 0600);

done();
