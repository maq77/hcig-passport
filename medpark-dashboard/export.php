<?php
/* Export. CSV for anyone who wants the raw numbers, and a printable monthly
   report laid out for a CEO. The report prints to PDF straight from the
   browser, so no PDF library has to be installed on the server. */
declare(strict_types=1);
require __DIR__ . '/lib/bootstrap.php';
require __DIR__ . '/lib/connectors.php';
require __DIR__ . '/lib/insights.php';
require __DIR__ . '/lib/ui.php';

mp_require_login();
$R = mp_range(isset($_GET['r']) ? (string)$_GET['r'] : '28d');
$format = isset($_GET['f']) ? (string)$_GET['f'] : 'csv';

/* ---------- CSV ----------------------------------------------------------- */
if ($format === 'csv') {
    $name = 'medpark-metrics-' . $R['from'] . '-to-' . $R['to'] . '.csv';
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="' . $name . '"');
    $out = fopen('php://output', 'w');
    fputcsv($out, array('date', 'source', 'metric', 'dimension', 'value'));
    /* Runs to today, not to the end of the range. Health and speed checks are
       stamped with the day they ran, so ending at yesterday would silently drop
       the most recent snapshot from the export. */
    $st = mp_db()->prepare("SELECT day, source, metric, dim, value FROM metrics
                            WHERE day BETWEEN :a AND :b ORDER BY day, source, metric, dim");
    $st->execute(array(':a'=>$R['prev_from'], ':b'=>gmdate('Y-m-d')));
    while ($row = $st->fetch()) {
        fputcsv($out, array($row['day'], $row['source'], $row['metric'], $row['dim'], $row['value']));
    }
    fclose($out);
    exit;
}

/* ---------- printable report ---------------------------------------------- */
$f = $R['from']; $t = $R['to']; $pf = $R['prev_from']; $pt = $R['prev_to'];
$calls = mp_sum('ga4','events',$f,$t,'call_click');
$whats = mp_sum('ga4','events',$f,$t,'whatsapp_click');
$enq = $calls + $whats;
$penq = mp_sum('ga4','events',$pf,$pt,'call_click') + mp_sum('ga4','events',$pf,$pt,'whatsapp_click');
$sessions = mp_sum('ga4','sessions',$f,$t);
$psessions= mp_sum('ga4','sessions',$pf,$pt);
$clicks = mp_sum('gsc','clicks',$f,$t);
$pclicks= mp_sum('gsc','clicks',$pf,$pt);
$impr = mp_sum('gsc','impressions',$f,$t);
$pos = mp_avg('gsc','position',$f,$t);
$gbpCalls = mp_sum('gbp','call_clicks',$f,$t);
$gbpDir = mp_sum('gbp','direction_requests',$f,$t);
$findings = mp_insights($R);
$conn = mp_connectors_status();

function rp($now, $prev) {
    $d = mp_delta((float)$now, (float)$prev);
    if ($d['pct'] === null) return '<span style="color:#7A8FA4">no prior period</span>';
    $c = $d['dir'] === 'up' ? '#128C4A' : ($d['dir'] === 'down' ? '#C0392B' : '#7A8FA4');
    $a = $d['dir'] === 'up' ? '&#9650;' : ($d['dir'] === 'down' ? '&#9660;' : '&#9679;');
    return '<span style="color:' . $c . ';font-weight:700">' . $a . ' ' . number_format(abs($d['pct']), 1) . '%</span>';
}
?>
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>MedPark performance report, <?php echo e($f); ?> to <?php echo e($t); ?></title>
<style>
  body{font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#0A2A4A;max-width:820px;
       margin:0 auto;padding:38px 30px 60px;line-height:1.55;font-size:14px}
  h1{font-size:25px;margin:0 0 4px;letter-spacing:-.02em}
  h2{font-size:15px;text-transform:uppercase;letter-spacing:.07em;color:#12C0C6;
     margin:34px 0 12px;padding-bottom:7px;border-bottom:2px solid #E2EAF1}
  .sub{color:#7A8FA4;margin:0 0 6px;font-size:13.5px}
  table{width:100%;border-collapse:collapse;font-size:13.5px;margin-bottom:6px}
  th{text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#7A8FA4;
     padding:0 0 8px;border-bottom:1px solid #E2EAF1}
  td{padding:9px 0;border-bottom:1px solid #F0F4F8}
  td.n,th.n{text-align:right;font-variant-numeric:tabular-nums}
  .big{font-size:31px;font-weight:700;letter-spacing:-.03em}
  .hero{background:#0A2A4A;color:#fff;border-radius:14px;padding:22px 26px;margin:22px 0 6px;
        display:flex;gap:36px;flex-wrap:wrap}
  .hero div{min-width:120px}
  .hero small{display:block;color:#8FB3C9;text-transform:uppercase;letter-spacing:.07em;font-size:11px}
  .find{padding:13px 0;border-bottom:1px solid #F0F4F8}
  .find b{display:block}
  .find i{display:block;font-style:normal;color:#3B546E;font-size:13px;margin-top:3px}
  .find em{display:block;font-style:normal;background:#E6F9FA;border-left:3px solid #12C0C6;
           padding:9px 12px;margin-top:8px;border-radius:0 8px 8px 0;font-size:13px}
  .note{background:#E6F9FA;border-radius:10px;padding:13px 16px;font-size:13px;color:#0B5F62;margin:14px 0}
  .noprint{margin-bottom:20px}
  @media print{.noprint{display:none}body{padding:0}}
</style>
</head>
<body>

<div class="noprint">
  <button onclick="window.print()" style="padding:9px 18px;border-radius:9px;border:0;background:#12C0C6;
    color:#fff;font-weight:700;font-size:13px;cursor:pointer">Print or save as PDF</button>
  <a href="index.php" style="margin-left:10px;color:#0E9AA0;font-size:13px">Back to the dashboard</a>
</div>

<h1><?php echo e(mp_get('brand_name')); ?> performance report</h1>
<p class="sub"><?php echo e($R['label']); ?>: <?php echo e($f); ?> to <?php echo e($t); ?>.
   Compared against <?php echo e($pf); ?> to <?php echo e($pt); ?>.</p>
<p class="sub">Prepared <?php echo e(gmdate('j F Y')); ?>.</p>

<div class="hero">
  <div><small>Enquiries</small><span class="big"><?php echo mp_num($enq); ?></span></div>
  <div><small>Calls</small><span class="big"><?php echo mp_num($calls); ?></span></div>
  <div><small>WhatsApp</small><span class="big"><?php echo mp_num($whats); ?></span></div>
  <div><small>Sessions</small><span class="big"><?php echo mp_num($sessions); ?></span></div>
</div>

<?php if (!mp_has_data('ga4')): ?>
<div class="note">
  Analytics is not connected yet, so the figures above are blank. The tracking script is live on the
  site and recording, the dashboard just needs read access to the GA4 property to display it.
</div>
<?php endif; ?>

<h2>The numbers</h2>
<table>
  <thead><tr><th>Metric</th><th class="n">This period</th><th class="n">Previous</th><th class="n">Change</th></tr></thead>
  <tbody>
    <tr><td><b>Total enquiries</b></td><td class="n"><b><?php echo mp_num($enq); ?></b></td><td class="n"><?php echo mp_num($penq); ?></td><td class="n"><?php echo rp($enq,$penq); ?></td></tr>
    <tr><td>Calls</td><td class="n"><?php echo mp_num($calls); ?></td><td class="n"><?php echo mp_num(mp_sum('ga4','events',$pf,$pt,'call_click')); ?></td><td class="n"><?php echo rp($calls, mp_sum('ga4','events',$pf,$pt,'call_click')); ?></td></tr>
    <tr><td>WhatsApp</td><td class="n"><?php echo mp_num($whats); ?></td><td class="n"><?php echo mp_num(mp_sum('ga4','events',$pf,$pt,'whatsapp_click')); ?></td><td class="n"><?php echo rp($whats, mp_sum('ga4','events',$pf,$pt,'whatsapp_click')); ?></td></tr>
    <tr><td>Sessions</td><td class="n"><?php echo mp_num($sessions); ?></td><td class="n"><?php echo mp_num($psessions); ?></td><td class="n"><?php echo rp($sessions,$psessions); ?></td></tr>
    <tr><td>Enquiry rate</td><td class="n"><?php echo $sessions > 0 ? number_format(($enq/$sessions)*100,2).'%' : '0%'; ?></td><td class="n"><?php echo $psessions > 0 ? number_format(($penq/$psessions)*100,2).'%' : '0%'; ?></td><td class="n"></td></tr>
    <tr><td>Clicks from Google</td><td class="n"><?php echo mp_num($clicks); ?></td><td class="n"><?php echo mp_num($pclicks); ?></td><td class="n"><?php echo rp($clicks,$pclicks); ?></td></tr>
    <tr><td>Impressions in Google</td><td class="n"><?php echo mp_num($impr); ?></td><td class="n"><?php echo mp_num(mp_sum('gsc','impressions',$pf,$pt)); ?></td><td class="n"><?php echo rp($impr, mp_sum('gsc','impressions',$pf,$pt)); ?></td></tr>
    <tr><td>Average position</td><td class="n"><?php echo $pos > 0 ? number_format($pos,1) : '-'; ?></td><td class="n"><?php echo mp_avg('gsc','position',$pf,$pt) > 0 ? number_format(mp_avg('gsc','position',$pf,$pt),1) : '-'; ?></td><td class="n"></td></tr>
    <tr><td>Calls from map listings</td><td class="n"><?php echo mp_num($gbpCalls); ?></td><td class="n"><?php echo mp_num(mp_sum('gbp','call_clicks',$pf,$pt)); ?></td><td class="n"><?php echo rp($gbpCalls, mp_sum('gbp','call_clicks',$pf,$pt)); ?></td></tr>
    <tr><td>Direction requests</td><td class="n"><?php echo mp_num($gbpDir); ?></td><td class="n"><?php echo mp_num(mp_sum('gbp','direction_requests',$pf,$pt)); ?></td><td class="n"><?php echo rp($gbpDir, mp_sum('gbp','direction_requests',$pf,$pt)); ?></td></tr>
  </tbody>
</table>

<?php if (mp_has_data('ga4')): ?>
<h2>Where visitors came from</h2>
<table>
  <thead><tr><th>Country</th><th class="n">Sessions</th></tr></thead>
  <tbody>
  <?php foreach (mp_top('ga4','sessions_country',$f,$t,6) as $r)
    echo '<tr><td>' . e($r['dim']) . '</td><td class="n">' . mp_num($r['v']) . '</td></tr>'; ?>
  </tbody>
</table>
<?php endif; ?>

<?php if (mp_has_data('gsc')): ?>
<h2>Top search queries</h2>
<table>
  <thead><tr><th>Query</th><th class="n">Clicks</th></tr></thead>
  <tbody>
  <?php foreach (mp_top('gsc','clicks_query',$f,$t,8) as $r)
    echo '<tr><td>' . e($r['dim']) . '</td><td class="n">' . mp_num($r['v']) . '</td></tr>'; ?>
  </tbody>
</table>
<?php endif; ?>

<h2>What needs attention</h2>
<?php if (!$findings): ?>
  <p style="color:#7A8FA4">Nothing was flagged for this period.</p>
<?php else: foreach (array_slice($findings, 0, 8) as $x): ?>
  <div class="find">
    <b><?php echo e($x['title']); ?></b>
    <i><?php echo e($x['detail']); ?></i>
    <em><b>What to do.</b> <?php echo e($x['advice']); ?></em>
  </div>
<?php endforeach; endif; ?>

<h2>Where the data comes from</h2>
<table>
  <thead><tr><th>Source</th><th>Status</th></tr></thead>
  <tbody>
  <?php foreach ($conn as $c)
    echo '<tr><td>' . e($c['name']) . '</td><td>' . ($c['ready'] ? 'Connected' : 'Waiting for access') . '</td></tr>'; ?>
  </tbody>
</table>

<p class="sub" style="margin-top:26px;font-size:12px">
  Conversion tracking went live on 2 September 2026. Call and WhatsApp figures have no history before
  that date, so the first full month is the baseline.
</p>

</body>
</html>
