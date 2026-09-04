<?php
/* ==========================================================================
   The alert cron.

   Runs every rule for every registered property and emails anything new. Kept
   out of the dashboard's own request path so a slow mail server can never
   delay a page load.

   Install, hourly. Often enough to catch a broken form the same morning, rare
   enough that nothing here is expensive:

     0 * * * * /opt/cpanel/ea-php81/root/usr/bin/php \
       /home/medpar6/public_html/dashboard/tools/alerts.php --key=XXX >/dev/null 2>&1

   The key is derived from the admin password hash, exactly as collect.php and
   import.php do it, so a stolen URL stops working the moment the password
   changes. This file sits under the web root, so without the key it does
   nothing at all.
   ========================================================================== */
declare(strict_types=1);

require __DIR__ . '/../lib/bootstrap.php';

$expected = substr(hash('sha256', mp_get('admin_hash') . 'cron'), 0, 24);

$cli   = (PHP_SAPI === 'cli');
$given = '';
if ($cli) {
    foreach ($argv as $a) { if (strpos($a, '--key=') === 0) $given = substr($a, 6); }
} else {
    header('Content-Type: text/plain; charset=utf-8');
    header('X-Robots-Tag: noindex');
    $given = isset($_GET['key']) ? (string)$_GET['key'] : '';
}

if (!mp_is_configured()) { echo "Dashboard not set up yet." . PHP_EOL; exit(1); }
if ($expected === '' || !hash_equals($expected, $given)) {
    if (!$cli) http_response_code(403);
    echo "Refused." . PHP_EOL;
    exit(1);
}

/* Every property, not just the current one: the whole point of the platform is
   that one system watches all of them. */
$sites = mp_sites();
if (!$sites) $sites = array(mp_current_site() => array('label' => mp_current_site()));

$totalFired = 0;
$totalSent  = 0;
foreach (array_keys($sites) as $key) {
    mp_current_site($key);
    $fired = mp_alerts_run(true);
    $sent  = mp_alerts_notify($fired);
    $totalFired += count($fired);
    $totalSent  += $sent;
    echo $key . ': ' . count($fired) . ' firing, ' . $sent . ' emailed' . PHP_EOL;
}

mp_log_run('alerts', 'ok', $totalFired . ' firing, ' . $totalSent . ' emailed');
echo 'done' . PHP_EOL;
