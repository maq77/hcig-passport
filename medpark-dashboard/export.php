<?php
/* ==========================================================================
   Export.

   CSV for anyone who wants the raw numbers, and a printable report laid out in
   HCIG identity: turquoise #12C0C6 as the single accent, dim gray #565759 for
   secondary, Inter throughout, per the HCIG brand guideline.

   The report is deliberately short. One page of numbers, one page of what to do.
   A CEO report that runs to six pages does not get read, and everything longer
   is already in the dashboard.

   It prints to PDF straight from the browser, so no PDF library is needed on
   the server.
   ========================================================================== */
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

/* ---------- gather -------------------------------------------------------- */
$f = $R['from']; $t = $R['to']; $pf = $R['prev_from']; $pt = $R['prev_to'];
$today = gmdate('Y-m-d');

function ex_count(string $sql, array $a): float {
    try { $st = mp_db()->prepare($sql); $st->execute($a); return (float)$st->fetchColumn(); }
    catch (Throwable $e) { return 0.0; }
}

$calls  = mp_sum('ga4','events',$f,$t,'call_click');
$whats  = mp_sum('ga4','events',$f,$t,'whatsapp_click');
$forms  = mp_sum('ga4','events',$f,$t,'enquiry_submit');
$chat   = ex_count("SELECT COUNT(*) FROM chat_leads WHERE date(created_at) BETWEEN :a AND :b", array(':a'=>$f, ':b'=>$today));
$pcalls = mp_sum('ga4','events',$pf,$pt,'call_click');
$pwhats = mp_sum('ga4','events',$pf,$pt,'whatsapp_click');
$pforms = mp_sum('ga4','events',$pf,$pt,'enquiry_submit');
$pchat  = ex_count("SELECT COUNT(*) FROM chat_leads WHERE date(created_at) BETWEEN :a AND :b", array(':a'=>$pf, ':b'=>$pt));

$enq  = $calls + $whats + $forms + $chat;
$penq = $pcalls + $pwhats + $pforms + $pchat;

$sessions  = mp_sum('ga4','sessions',$f,$t);
$psessions = mp_sum('ga4','sessions',$pf,$pt);
$clicks    = mp_sum('gsc','clicks',$f,$t);
$pclicks   = mp_sum('gsc','clicks',$pf,$pt);
$impr      = mp_sum('gsc','impressions',$f,$t);
$pimpr     = mp_sum('gsc','impressions',$pf,$pt);
$pos       = mp_avg('gsc','position',$f,$t);
$ppos      = mp_avg('gsc','position',$pf,$pt);
$gbpCalls  = mp_sum('gbp','call_clicks',$f,$t);
$pgbpCalls = mp_sum('gbp','call_clicks',$pf,$pt);
$gbpDir    = mp_sum('gbp','direction_requests',$f,$t);
$pgbpDir   = mp_sum('gbp','direction_requests',$pf,$pt);

$rate  = $sessions > 0 ? ($enq / $sessions) * 100 : 0;
$prate = $psessions > 0 ? ($penq / $psessions) * 100 : 0;

$findings = mp_insights($R);
$conn = mp_connectors_status();
$connected = 0; $waiting = array();
foreach ($conn as $c) { $c['ready'] ? $connected++ : $waiting[] = $c['name']; }

function ex_delta($now, $prev, bool $higherBetter = true): string {
    $d = $higherBetter ? mp_delta((float)$now, (float)$prev) : mp_delta((float)$prev, (float)$now);
    if ($d['pct'] === null) return '<span class="flat">no prior period</span>';
    $cls = $d['dir'] === 'up' ? 'up' : ($d['dir'] === 'down' ? 'down' : 'flat');
    $arrow = $d['dir'] === 'up' ? '&#9650;' : ($d['dir'] === 'down' ? '&#9660;' : '&#9679;');
    return '<span class="' . $cls . '">' . $arrow . ' ' . number_format(abs($d['pct']), 1) . '%</span>';
}
?>
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>MedPark performance, <?php echo e($f); ?> to <?php echo e($t); ?></title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap">
<style>
/* HCIG identity: turquoise #12C0C6, dim gray #565759, black, white.
   Inter throughout, which is the guideline's specified paragraph face. */
:root{
  --t:#12C0C6; --t-d:#0B8B90;
  --gray:#565759; --ink:#0B0C0D; --ink-2:#565759; --ink-3:#8B8D8F;
  --line:#E4E6E7; --line-2:#F1F2F3; --paper:#FFFFFF;
  --ok:#0E7C4A; --bad:#B4291D;
}
*{box-sizing:border-box}
body{
  font-family:Inter,'Helvetica Neue',Helvetica,Arial,sans-serif;
  color:var(--ink); background:var(--paper);
  max-width:760px; margin:0 auto; padding:34px 30px 60px;
  line-height:1.55; font-size:14px; -webkit-font-smoothing:antialiased;
}
.n,td,th,.big{font-variant-numeric:tabular-nums}

/* masthead */
.mast{display:flex; align-items:flex-start; justify-content:space-between; gap:20px; padding-bottom:16px; border-bottom:3px solid var(--t)}
.mast h1{margin:0; font-size:25px; font-weight:800; letter-spacing:-.025em; line-height:1.1}
.mast .who{font-size:11px; text-transform:uppercase; letter-spacing:.15em; color:var(--t-d); font-weight:700; margin-bottom:7px}
.mast .when{text-align:right; font-size:12px; color:var(--ink-3); white-space:nowrap; line-height:1.6}
.mast .when b{display:block; color:var(--ink-2); font-weight:600}
.mark{width:34px;height:34px;border-radius:9px;background:var(--t);display:inline-grid;place-items:center;color:#04282A;font-weight:900;font-size:14px;margin-bottom:10px}

h2{
  font-size:11.5px; text-transform:uppercase; letter-spacing:.13em; color:var(--t-d);
  margin:30px 0 11px; font-weight:800;
}

/* headline numbers */
.head{display:grid; grid-template-columns:repeat(4,1fr); gap:1px; background:var(--line); border:1px solid var(--line); border-radius:9px; overflow:hidden; margin-top:20px}
.head div{background:var(--paper); padding:15px 16px}
.head small{display:block; font-size:10px; text-transform:uppercase; letter-spacing:.09em; color:var(--ink-3); font-weight:700}
.head .big{display:block; font-size:29px; font-weight:800; letter-spacing:-.035em; margin:5px 0 2px; line-height:1}
.head em{font-style:normal; font-size:11.5px; font-weight:700}

table{width:100%; border-collapse:collapse; font-size:13px}
th{text-align:left; font-size:10px; text-transform:uppercase; letter-spacing:.09em; color:var(--ink-3); padding:0 0 8px; border-bottom:1px solid var(--line); font-weight:700}
td{padding:8px 0; border-bottom:1px solid var(--line-2); color:var(--ink-2)}
tr:last-child td{border-bottom:0}
td.n,th.n{text-align:right}
td:first-child{color:var(--ink); font-weight:500}
.up{color:var(--ok); font-weight:700}
.down{color:var(--bad); font-weight:700}
.flat{color:var(--ink-3); font-weight:600}

.act{padding:11px 0; border-bottom:1px solid var(--line-2); display:flex; gap:11px}
.act:last-child{border-bottom:0}
.act__i{flex:0 0 3px; background:var(--ink-3); border-radius:2px}
.act--high .act__i{background:var(--bad)}
.act--medium .act__i{background:#B8860B}
.act--low .act__i{background:var(--t)}
.act b{display:block; font-size:13.5px; color:var(--ink); font-weight:650}
.act span{display:block; font-size:12.5px; color:var(--ink-2); margin-top:2px}
.act i{display:block; font-style:normal; font-size:12.5px; color:var(--ink); margin-top:5px}
.act i::before{content:"Do this. "; font-weight:700; color:var(--t-d)}

.note{background:#F0FCFC; border-left:3px solid var(--t); padding:11px 14px; font-size:12.5px; color:var(--ink-2); margin:14px 0; border-radius:0 7px 7px 0}
.note b{color:var(--ink)}
.foot{margin-top:26px; padding-top:14px; border-top:1px solid var(--line); font-size:11px; color:var(--ink-3); line-height:1.65}
.noprint{margin-bottom:22px; display:flex; gap:9px; align-items:center}
.pbtn{padding:8px 16px; border-radius:7px; border:0; background:var(--t); color:#04282A; font:inherit; font-size:12.5px; font-weight:700; cursor:pointer}
.pbtn:hover{background:var(--t-d); color:#fff}

@media print{
  .noprint{display:none}
  body{padding:0; max-width:none; font-size:11pt}
  h2{margin-top:20pt}
  .head,.act,table{break-inside:avoid}
  a{color:inherit; text-decoration:none}
}
@media (max-width:560px){
  .head{grid-template-columns:repeat(2,1fr)}
  body{padding:20px 16px 40px}
  .mast{flex-direction:column}
  .mast .when{text-align:left}
}
</style>
</head>
<body>

<div class="noprint">
  <button class="pbtn" onclick="window.print()">Print or save as PDF</button>
  <a href="index.php" style="color:var(--t-d);font-size:12.5px;text-decoration:none">Back to the dashboard</a>
</div>

<header class="mast">
  <div>
    <span class="mark">M</span>
    <div class="who">Healthcare International Group</div>
    <h1><?php echo e(mp_get('brand_name')); ?> performance</h1>
  </div>
  <div class="when">
    <b><?php echo e($R['label']); ?></b>
    <?php echo e($f); ?> to <?php echo e($t); ?><br>
    <span style="color:var(--ink-3)">vs <?php echo e($pf); ?> to <?php echo e($pt); ?></span><br>
    <span style="color:var(--ink-3)">Issued <?php echo e(gmdate('j M Y')); ?></span>
  </div>
</header>

<div class="head">
  <div>
    <small>Enquiries</small>
    <span class="big"><?php echo mp_num($enq); ?></span>
    <em><?php echo ex_delta($enq, $penq); ?></em>
  </div>
  <div>
    <small>Calls</small>
    <span class="big"><?php echo mp_num($calls); ?></span>
    <em><?php echo ex_delta($calls, $pcalls); ?></em>
  </div>
  <div>
    <small>WhatsApp</small>
    <span class="big"><?php echo mp_num($whats); ?></span>
    <em><?php echo ex_delta($whats, $pwhats); ?></em>
  </div>
  <div>
    <small>Enquiry rate</small>
    <span class="big"><?php echo $sessions > 0 ? number_format($rate, 2) . '%' : '0%'; ?></span>
    <em><?php echo ex_delta($rate, $prate); ?></em>
  </div>
</div>

<?php if (!mp_has_data('ga4')): ?>
<div class="note">
  <b>Analytics is not connected yet, so the figures above are incomplete.</b>
  Conversion tracking is live on the site and recording. The dashboard needs read access to the
  GA4 property to display it. Assistant requests are already counted here because they are stored
  on your own server and need no external access.
</div>
<?php endif; ?>

<h2>The numbers</h2>
<table>
  <thead><tr><th>Metric</th><th class="n">This period</th><th class="n">Previous</th><th class="n">Change</th></tr></thead>
  <tbody>
    <tr><td><strong>Total enquiries</strong></td><td class="n"><strong><?php echo mp_num($enq); ?></strong></td><td class="n"><?php echo mp_num($penq); ?></td><td class="n"><?php echo ex_delta($enq, $penq); ?></td></tr>
    <tr><td>Calls</td><td class="n"><?php echo mp_num($calls); ?></td><td class="n"><?php echo mp_num($pcalls); ?></td><td class="n"><?php echo ex_delta($calls, $pcalls); ?></td></tr>
    <tr><td>WhatsApp</td><td class="n"><?php echo mp_num($whats); ?></td><td class="n"><?php echo mp_num($pwhats); ?></td><td class="n"><?php echo ex_delta($whats, $pwhats); ?></td></tr>
    <tr><td>Website assistant requests</td><td class="n"><?php echo mp_num($chat); ?></td><td class="n"><?php echo mp_num($pchat); ?></td><td class="n"><?php echo ex_delta($chat, $pchat); ?></td></tr>
    <tr><td>Calls from map listings</td><td class="n"><?php echo mp_num($gbpCalls); ?></td><td class="n"><?php echo mp_num($pgbpCalls); ?></td><td class="n"><?php echo ex_delta($gbpCalls, $pgbpCalls); ?></td></tr>
    <tr><td>Direction requests</td><td class="n"><?php echo mp_num($gbpDir); ?></td><td class="n"><?php echo mp_num($pgbpDir); ?></td><td class="n"><?php echo ex_delta($gbpDir, $pgbpDir); ?></td></tr>
    <tr><td>Sessions</td><td class="n"><?php echo mp_num($sessions); ?></td><td class="n"><?php echo mp_num($psessions); ?></td><td class="n"><?php echo ex_delta($sessions, $psessions); ?></td></tr>
    <tr><td>Clicks from Google</td><td class="n"><?php echo mp_num($clicks); ?></td><td class="n"><?php echo mp_num($pclicks); ?></td><td class="n"><?php echo ex_delta($clicks, $pclicks); ?></td></tr>
    <tr><td>Impressions in Google</td><td class="n"><?php echo mp_num($impr); ?></td><td class="n"><?php echo mp_num($pimpr); ?></td><td class="n"><?php echo ex_delta($impr, $pimpr); ?></td></tr>
    <tr><td>Average position <span style="color:var(--ink-3);font-size:11px">lower is better</span></td><td class="n"><?php echo $pos > 0 ? number_format($pos, 1) : '-'; ?></td><td class="n"><?php echo $ppos > 0 ? number_format($ppos, 1) : '-'; ?></td><td class="n"><?php echo ex_delta($pos, $ppos, false); ?></td></tr>
  </tbody>
</table>

<?php
  $topQ = mp_top('gsc','clicks_query',$f,$t,5);
  $topC = mp_top('ga4','sessions_country',$f,$t,5);
  if ($topQ || $topC):
?>
<h2>Where it came from</h2>
<table>
  <thead><tr><th>Top search queries</th><th class="n">Clicks</th><th>Top countries</th><th class="n">Sessions</th></tr></thead>
  <tbody>
  <?php for ($i = 0; $i < max(count($topQ), count($topC), 1); $i++): if ($i >= 5) break; ?>
    <tr>
      <td><?php echo isset($topQ[$i]) ? e((string)$topQ[$i]['dim']) : '<span style="color:var(--ink-3)">-</span>'; ?></td>
      <td class="n"><?php echo isset($topQ[$i]) ? mp_num($topQ[$i]['v']) : '-'; ?></td>
      <td><?php echo isset($topC[$i]) ? e((string)$topC[$i]['dim']) : '<span style="color:var(--ink-3)">-</span>'; ?></td>
      <td class="n"><?php echo isset($topC[$i]) ? mp_num($topC[$i]['v']) : '-'; ?></td>
    </tr>
  <?php endfor; ?>
  </tbody>
</table>
<?php endif; ?>

<h2>What to do next</h2>
<?php if (!$findings): ?>
  <p style="color:var(--ink-3);font-size:13px">Nothing was flagged for this period.</p>
<?php else: foreach (array_slice($findings, 0, 5) as $x): ?>
  <div class="act act--<?php echo e($x['severity']); ?>">
    <span class="act__i"></span>
    <span>
      <b><?php echo e($x['title']); ?></b>
      <span><?php echo e($x['detail']); ?></span>
      <i><?php echo e($x['advice']); ?></i>
    </span>
  </div>
<?php endforeach; endif; ?>
<?php if (count($findings) > 5): ?>
  <p style="font-size:12px;color:var(--ink-3);margin-top:10px">
    <?php echo count($findings) - 5; ?> further items are in the dashboard, ordered by severity.
  </p>
<?php endif; ?>

<div class="foot">
  <strong style="color:var(--ink-2)">About this report.</strong>
  Generated from the MedPark dashboard on <?php echo e(gmdate('j F Y')); ?>.
  <?php echo (int)$connected; ?> of <?php echo count($conn); ?> data sources connected<?php
    if ($waiting) echo '; waiting on ' . e(implode(', ', array_slice($waiting, 0, 4)));
  ?>.
  Conversion tracking went live on 2 September 2026, so call and WhatsApp figures have no history
  before that date and the first full month is the baseline.
  Every figure here can be traced to its source in the dashboard, and the underlying rows are
  available as a CSV export.
</div>

</body>
</html>
