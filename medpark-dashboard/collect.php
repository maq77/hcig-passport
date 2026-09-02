<?php
/* Daily collection, run by cron. Pulls every connected source for the last 30
   days, which also backfills anything a failed run missed.

   Usage from cron:
     /opt/cpanel/ea-php81/root/usr/bin/php /home/USER/public_html/dashboard/collect.php --key=XXX

   The key is derived from the admin password hash, so a stolen URL is useless
   and the endpoint cannot be triggered by a browser without it. */
declare(strict_types=1);

require __DIR__ . '/lib/bootstrap.php';
require __DIR__ . '/lib/connectors.php';

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

$to   = gmdate('Y-m-d', strtotime('yesterday'));
$from = gmdate('Y-m-d', strtotime('-30 day'));

$results = mp_pull_all($from, $to);
foreach ($results as $k => $r) {
    printf("%-8s %-5s %s\n", $k, $r['ok'] ? 'ok' : 'fail', $r['msg']);
}

/* Keep the file small. Two years of daily rows is plenty of history and stops
   the database growing without limit on shared hosting. */
$cut = gmdate('Y-m-d', strtotime('-730 day'));
$st = mp_db()->prepare("DELETE FROM metrics WHERE day < :c");
$st->execute(array(':c'=>$cut));
mp_db()->exec("DELETE FROM runs WHERE id NOT IN (SELECT id FROM runs ORDER BY id DESC LIMIT 200)");

echo "done\n";
