<?php
/* ===========================================================================
   Analytics import, run by cron every five minutes.

   Drains the spool the public collector writes to, builds sessions, and
   refreshes the rollups for the days it touched. Deliberately separate from
   collect.php: that one calls out to Google and takes seconds, this one only
   reads a local file and must stay quick enough to run twelve times an hour.

   Install as a cron job, every five minutes. The schedule is written as an
   explicit minute list rather than the usual shorthand, because that shorthand
   contains the two characters that end this comment:

     0,5,10,15,20,25,30,35,40,45,50,55 * * * * \
       /opt/cpanel/ea-php81/root/usr/bin/php \
       /home/USER/public_html/dashboard/import.php --key=XXX >/dev/null 2>&1

   The key is derived from the admin password hash, exactly as collect.php
   does, so the URL is useless to anyone who does not already have the hash.
   =========================================================================== */
declare(strict_types=1);

require __DIR__ . '/lib/bootstrap.php';

$cli = PHP_SAPI === 'cli';
$expected = substr(hash('sha256', mp_get('admin_hash') . 'cron'), 0, 24);

$given = '';
if ($cli) {
    foreach ($argv as $a) { if (strpos($a, '--key=') === 0) $given = substr($a, 6); }
} else {
    $given = isset($_GET['key']) ? (string)$_GET['key'] : '';
    header('Content-Type: text/plain; charset=utf-8');
}

if (!mp_is_configured()) { echo "Dashboard not set up yet.\n"; exit(1); }
if ($expected === '' || !hash_equals($expected, $given)) {
    if (!$cli) http_response_code(403);
    echo "Refused.\n";
    exit(1);
}

if (mp_get('analytics_on') !== '1') { echo "Analytics is switched off in Settings.\n"; exit(0); }

/* Two importers, one run. The behaviour spool feeds the heatmap and the
   analytics spool feeds everything else; both are cheap file reads. */
$out = array();

/* Require first, then check. Testing function_exists() before loading the file
   that defines the function is always false, which is how this silently did
   nothing at all on its first deploy. */
require_once __DIR__ . '/lib/connectors.php';
if (function_exists('mp_pull_behaviour')) {
    $b = mp_pull_behaviour(gmdate('Y-m-d', strtotime('-2 day')), gmdate('Y-m-d'));
    $out[] = sprintf('%-10s %-5s %s', 'behaviour', $b['ok'] ? 'ok' : 'fail', $b['msg']);
}

$a = mpa_import();
$out[] = sprintf('%-10s %-5s %s', 'analytics', $a['ok'] ? 'ok' : 'fail', $a['msg']);

echo implode("\n", $out), "\n";
exit($a['ok'] ? 0 : 1);
