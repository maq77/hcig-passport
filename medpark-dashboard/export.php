<?php
/* ==========================================================================
   Export.

   CSV for anyone who wants the raw rows, and a full performance report written
   from a chief executive's point of view.

   The report answers, in order: how did we do, where did the customers come
   from, how visible are we, what did we find, what is it costing us, what
   should we do, and what should we expect if we do it. Every claim carries the
   number it came from, because a recommendation without evidence is an opinion.

   HCIG identity throughout: turquoise #12C0C6, dim gray #565759, Inter.
   Prints to PDF straight from the browser, so no PDF library is needed.
   ========================================================================== */
declare(strict_types=1);
require __DIR__ . '/lib/bootstrap.php';
require __DIR__ . '/lib/connectors.php';
require __DIR__ . '/lib/insights.php';
require __DIR__ . '/lib/ui.php';
require __DIR__ . '/lib/definitions.php';
require __DIR__ . '/lib/narrative.php';
require __DIR__ . '/lib/recommend.php';
/* The same headline numbers the Summary screen shows, so the report and the
   screen can never disagree, and so the report follows the source the reader
   chose rather than always speaking for Google. */
require __DIR__ . '/lib/headline.php';

mp_require_login();
$R = mp_range(isset($_GET['r']) ? (string)$_GET['r'] : '28d');
$format = isset($_GET['f']) ? (string)$_GET['f'] : 'csv';

/* ---------- CSV ----------------------------------------------------------- */
if ($format === 'csv') {
    $name = 'medpark-metrics-' . $R['from'] . '-to-' . $R['to'] . '.csv';
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="' . $name . '"');
    $out = fopen('php://output', 'w');
    fputcsv($out, array('date', 'source', 'metric', 'dimension', 'dimension2', 'value'));
    /* Scoped to the selected property. Without this the export would hand one
       brand every other brand's numbers the moment a second site is added. */
    $st = mp_db()->prepare("SELECT day, source, metric, dim, dim2, value FROM metrics
                            WHERE site = :site AND day BETWEEN :a AND :b
                            ORDER BY day, source, metric, dim");
    $st->execute(array(':site'=>mp_current_site(), ':a'=>$R['prev_from'], ':b'=>gmdate('Y-m-d')));
    while ($row = $st->fetch()) {
        fputcsv($out, array($row['day'], $row['source'], $row['metric'], $row['dim'], $row['dim2'], $row['value']));
    }
    fclose($out);
    exit;
}

/* ---------- gather -------------------------------------------------------- */
$f = $R['from']; $t = $R['to']; $pf = $R['prev_from']; $pt = $R['prev_to'];
$today = gmdate('Y-m-d');

/* Whichever source the reader selected, named on the cover so a number in this
   report can always be traced to who counted it. mp_source() reads ?src=, which
   the Summary page's toggle passes straight through to this link. */
$SRC = mp_source();
$H   = mp_headline($f, $t, $SRC);
$PH  = mp_headline($pf, $pt, $SRC);
$req = mp_requests($f, $t);

$calls  = $H['calls'];    $pcalls = $PH['calls'];
$whats  = $H['whatsapp']; $pwhats = $PH['whatsapp'];
$forms  = $H['forms'];    $pforms = $PH['forms'];
$chat   = $H['requests']; $pchat  = $PH['requests'];
/* Contact attempts, which is what this report has always called "enquiries". */
$enq    = $H['contacts'];
$penq   = $PH['contacts'];

$sessions  = $H['sessions'];
$psessions = $PH['sessions'];
$users     = $H['visitors'];
$clicks    = mp_sum('gsc','clicks',$f,$t);
$pclicks   = mp_sum('gsc','clicks',$pf,$pt);
$impr      = mp_sum('gsc','impressions',$f,$t);
$pimpr     = mp_sum('gsc','impressions',$pf,$pt);
$pos       = mp_avg('gsc','position',$f,$t);
$ppos      = mp_avg('gsc','position',$pf,$pt);
$mapCalls  = mp_sum('gbp','call_clicks',$f,$t);
$pmapCalls = mp_sum('gbp','call_clicks',$pf,$pt);
$dirs      = mp_sum('gbp','direction_requests',$f,$t);
$pdirs     = mp_sum('gbp','direction_requests',$pf,$pt);

$rate  = $sessions > 0 ? ($enq / $sessions) * 100 : 0;
$prate = $psessions > 0 ? ($penq / $psessions) * 100 : 0;

$aiRow = mp_q("SELECT COUNT(*) c, SUM(mentioned) m FROM ai_checks WHERE site = :site AND checked_at >= date('now','-45 day')")->fetch();
$aiC = $aiRow ? (int)$aiRow['c'] : 0;
$aiM = $aiRow ? (int)$aiRow['m'] : 0;

$N    = mp_narrative($R);
$recs = mp_recommendations($R);
$conn = mp_connectors_status();
$connected = 0; $waiting = array();
foreach ($conn as $c) { $c['ready'] ? $connected++ : $waiting[] = $c['name']; }

$topCountry = mp_top('ga4','sessions_country',$f,$t,6);
$topChannel = mp_top('ga4','sessions_channel',$f,$t,5);
/* Overwritten below when the reader has selected our own tracking. */
$topQuery   = mp_top('gsc','clicks_query',$f,$t,6);

/* Where they came from and what they read, from whichever source is selected.
   Our own tracking answers these itself; it is only search queries that
   genuinely require Search Console, because a search happens on Google. */
if ($SRC === 'own') {
    $topCountry = array();
    foreach (mpa_top('by_country', $f, $t, 6) as $r) {
        $topCountry[] = array('dim' => mpa_country_name((string)$r['dim']), 'v' => (float)$r['v']);
    }
    $topChannel = array();
    foreach (mpa_top('by_ref_type', $f, $t, 5) as $r) {
        $topChannel[] = array('dim' => mpa_channel_label((string)$r['dim']), 'v' => (float)$r['v']);
    }
    $topPage = array();
    foreach (mpa_pages($f, $t, 5) as $r) {
        $topPage[] = array('dim' => (string)$r['path'], 'v' => (float)$r['views']);
    }
} else {
    $topPage = mp_top('ga4','views_page',$f,$t,5);
}

function rp($now, $prev, bool $higherBetter = true): string {
    /* Both sides empty means the measure is not being collected yet. A change
       figure against two dashes reads as though something was measured. */
    if ((float)$now <= 0 && (float)$prev <= 0) return '<span class="flat">&ndash;</span>';
    $d = $higherBetter ? mp_delta((float)$now, (float)$prev) : mp_delta((float)$prev, (float)$now);
    if ($d['pct'] === null) return '<span class="flat">first period</span>';
    $cls = $d['dir'] === 'up' ? 'up' : ($d['dir'] === 'down' ? 'down' : 'flat');
    $arrow = $d['dir'] === 'up' ? '&#9650;' : ($d['dir'] === 'down' ? '&#9660;' : '&#9679;');
    return '<span class="' . $cls . '">' . $arrow . ' ' . number_format(abs($d['pct']), 1) . '%</span>';
}
function sev_label(string $s): string {
    return array('high'=>'Priority', 'medium'=>'Important', 'low'=>'Opportunity', 'good'=>'Working')[$s] ?? 'Note';
}
$logo   = is_file(__DIR__ . '/assets/hcig-logo.png')    ? 'assets/hcig-logo.png'    : '';
$logoMp = is_file(__DIR__ . '/assets/medpark-logo.png') ? 'assets/medpark-logo.png' : '';
?>
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>MedPark Performance Report</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap">
<style>
/* HCIG identity: turquoise #12C0C6, dim gray #565759, black, white, Inter. */
:root{
  --a:#12C0C6; --a-d:#0A7276; --a-w:#EDFBFB;
  --ink:#0B0C0D; --ink-2:#565759; --ink-3:#8A8C8E; --ink-4:#BFC1C3;
  --line:#E2E4E5; --line-2:#F1F2F2; --paper:#FFFFFF;
  --ok:#0E7247; --ok-w:#E9F5EF;
  --hi:#AE2A1E;  --hi-w:#FBEDEA;
  --md:#8A5B00;  --md-w:#FCF4E5;
  /* Chart series. ui_stack() and ui_line() are shared with the dashboard and
     reference these; without them here the bars render transparent. */
  --c1:#12C0C6; --c2:#0A2A4A; --c3:#D98324; --c4:#6B4E9E; --c5:#2E8B57; --c6:#AE2A1E;
  --ink-4:#BFC1C3; --line-2:#F1F2F2; --surface:#FFFFFF; --surface-2:#FAFBFB;
  --r-sm:7px;
}
*{box-sizing:border-box}
body{
  font-family:Inter,'Helvetica Neue',Helvetica,Arial,sans-serif;
  color:var(--ink); background:#F4F5F5; margin:0;
  font-size:14px; line-height:1.6; -webkit-font-smoothing:antialiased;
}
.sheet{max-width:840px; margin:0 auto; background:var(--paper); padding:0 54px 60px}
h1,h2,h3{margin:0; letter-spacing:-.02em; text-wrap:balance}
p{margin:0 0 13px; max-width:74ch}
p:last-child{margin-bottom:0}
strong{font-weight:650}
.n,td,th,.big{font-variant-numeric:tabular-nums}
.up{color:var(--ok); font-weight:700}
.down{color:var(--hi); font-weight:700}
.flat{color:var(--ink-3); font-weight:600}

/* ---- cover ---- */
.cover{padding:52px 0 30px; border-bottom:3px solid var(--a)}
.cover__brand{display:flex; align-items:center; gap:22px; margin-bottom:34px; flex-wrap:wrap}
.cover__brand .lg-mp{width:184px; height:auto; display:block}
.cover__brand .lg-hc{width:52px; height:auto; display:block}
.cover__div{width:1px; align-self:stretch; background:var(--line); min-height:46px}
.cover__grp{display:flex; align-items:center; gap:11px}
.cover__grp span{font-size:9.5px; font-weight:700; letter-spacing:.15em; text-transform:uppercase; color:var(--ink-3); max-width:74px; line-height:1.5}
.cover h1{font-size:39px; font-weight:900; line-height:1.05}
.cover .sub{margin:13px 0 0; font-size:17px; color:var(--ink-2); max-width:56ch}
/* A grid rather than a wrapping flex row, so four items never break as
   three-plus-one and leave a ragged second line. */
.cover dl{display:grid; grid-template-columns:repeat(4,1fr); gap:16px 28px; margin:30px 0 0}
@media (max-width:700px){.cover dl{grid-template-columns:repeat(2,1fr)}}
.cover dt{font-size:10px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:var(--ink-3)}
.cover dd{margin:3px 0 0; font-size:14px; font-weight:600}

h2{
  font-size:11.5px; font-weight:800; letter-spacing:.15em; text-transform:uppercase;
  color:var(--a-d); margin:42px 0 15px; padding-bottom:9px; border-bottom:1px solid var(--line);
}
h3{font-size:16px; font-weight:700; margin:22px 0 7px}

/* ---- summary ---- */
.say{background:var(--a-w); border-left:3px solid var(--a); padding:18px 22px; border-radius:0 10px 10px 0; margin-bottom:20px}
.say p:first-child{font-size:17px; font-weight:700; color:var(--ink); line-height:1.45; margin-bottom:8px}
.say p{font-size:14px; color:var(--ink-2); margin-bottom:5px}

.head{display:grid; grid-template-columns:repeat(auto-fit,minmax(135px,1fr)); gap:1px; background:var(--line);
      border:1px solid var(--line); border-radius:10px; overflow:hidden; margin-bottom:8px}
.head div{background:var(--paper); padding:15px 16px}
.head small{display:block; font-size:9.5px; text-transform:uppercase; letter-spacing:.1em; color:var(--ink-3); font-weight:700}
.head .big{display:block; font-size:27px; font-weight:800; letter-spacing:-.035em; margin:5px 0 2px; line-height:1}
.head em{font-style:normal; font-size:11.5px}
.head u{display:block; text-decoration:none; font-size:10.5px; color:var(--ink-4); margin-top:5px; line-height:1.35}
.src-note{font-size:11px; color:var(--ink-3); line-height:1.5; margin:8px 0 18px;
          border-left:2px solid var(--a); padding-left:10px; max-width:none}

/* ---- tables ---- */
.tw{overflow-x:auto}
table{width:100%; border-collapse:collapse; font-size:13.5px; margin-bottom:6px}
th{text-align:left; font-size:10px; font-weight:700; letter-spacing:.1em; text-transform:uppercase;
   color:var(--ink-3); padding:0 12px 9px 0; border-bottom:1px solid var(--line)}
td{padding:10px 12px 10px 0; border-bottom:1px solid var(--line-2); color:var(--ink-2); vertical-align:top}
tr:last-child td{border-bottom:0}
td:first-child{color:var(--ink); font-weight:550}
td.n,th.n{text-align:right}
th:last-child,td:last-child{padding-right:0}

/* ---- recommendation blocks ---- */
.rec{border:1px solid var(--line); border-radius:11px; overflow:hidden; margin-bottom:14px; break-inside:avoid}
.rec__h{display:flex; align-items:center; gap:10px; padding:12px 18px; border-bottom:1px solid var(--line-2); flex-wrap:wrap}
.rec__h b{font-size:15.5px; font-weight:700; color:var(--ink)}
.rec__b{padding:15px 18px}
.rec__row{display:grid; grid-template-columns:118px 1fr; gap:5px 16px; padding:9px 0; border-top:1px solid var(--line-2)}
.rec__row:first-child{border-top:0; padding-top:0}
.rec__k{font-size:9.5px; font-weight:800; letter-spacing:.11em; text-transform:uppercase; color:var(--ink-3); padding-top:3px}
.rec__v{font-size:14px; color:var(--ink-2)}
.rec--high{border-left:3px solid var(--hi)}
.rec--medium{border-left:3px solid var(--md)}
.rec--good{border-left:3px solid var(--ok)}
.rec--high .rec__h{background:var(--hi-w)}
.rec--medium .rec__h{background:var(--md-w)}
.rec--good .rec__h{background:var(--ok-w)}
.badge{display:inline-block; padding:2px 9px; border-radius:20px; font-size:9.5px; font-weight:800;
       letter-spacing:.06em; text-transform:uppercase; white-space:nowrap}
.b-high{background:var(--hi); color:#fff}
.b-medium{background:var(--md); color:#fff}
.b-good{background:var(--ok); color:#fff}
.b-area{background:var(--line-2); color:var(--ink-2); margin-left:auto}
.expect{background:var(--a-w); border-radius:8px; padding:11px 14px; margin-top:4px}

/* ---- glossary ---- */
.cols{display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px}
.chartbox{border:1px solid var(--line); border-radius:10px; overflow:hidden; break-inside:avoid}
.chartbox h3{margin:0; padding:11px 15px; font-size:11px; font-weight:800; letter-spacing:.1em;
  text-transform:uppercase; color:var(--ink-3); border-bottom:1px solid var(--line-2)}
.hb{display:flex; flex-direction:column; gap:9px; padding:14px 15px}
.hb__r{display:grid; grid-template-columns:minmax(66px,34%) 1fr auto; gap:10px; align-items:center; font-size:12.5px}
.hb__l{color:var(--ink); font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap}
.hb__t{height:9px; background:var(--line-2); border-radius:5px; overflow:hidden; position:relative}
.hb__t i{position:absolute; inset:0 auto 0 0; border-radius:5px}
.hb__v{font-variant-numeric:tabular-nums; color:var(--ink); font-weight:700; min-width:36px; text-align:right}
.stk{display:flex; height:16px; border-radius:8px; overflow:hidden; margin:14px 15px 10px; background:var(--line-2)}
.stk i{display:block; height:100%}
.stk__k{display:flex; flex-wrap:wrap; gap:6px 14px; padding:0 15px 14px; font-size:11.5px; color:var(--ink-2)}
.stk__k span{display:inline-flex; align-items:center; gap:5px}
.stk__k i{width:9px; height:9px; border-radius:2px; flex:0 0 9px}
.stk__k b{color:var(--ink); font-variant-numeric:tabular-nums}
.chart{display:block; width:100%; height:150px}
.chart--sm{height:132px}
.axis{font-size:9px; fill:var(--ink-4)}
.gridline{stroke:var(--line-2); stroke-width:1}
.who{display:block; margin-top:4px; font-size:11.5px; color:var(--ink-3)}
.empty{padding:18px 15px; text-align:center; color:var(--ink-3); font-size:12.5px}
.empty svg{display:none}
.empty b{display:block; color:var(--ink-2); font-size:13px; margin-bottom:3px}
.empty p{margin:0 auto; max-width:44ch}
@media (max-width:700px){.cols{grid-template-columns:1fr}}
.gl{border-top:1px solid var(--line-2); padding:12px 0}
.gl b{display:block; font-size:14px; color:var(--ink)}
.gl p{font-size:13px; color:var(--ink-2); margin:4px 0 0}
.gl span{display:block; font-size:12.5px; color:var(--ink-3); margin-top:3px}

.note{background:var(--a-w); border-left:3px solid var(--a); padding:13px 17px; border-radius:0 9px 9px 0; margin:16px 0; font-size:13.5px; color:var(--ink-2)}
.foot{margin-top:44px; padding-top:18px; border-top:1px solid var(--line); font-size:11.5px; color:var(--ink-3); line-height:1.65}
.noprint{background:#F4F5F5; padding:16px 54px; max-width:840px; margin:0 auto; display:flex; gap:10px; align-items:center}
.pbtn{padding:9px 18px; border-radius:8px; border:0; background:var(--a); color:#04282A; font:inherit; font-size:13px; font-weight:700; cursor:pointer}
.pbtn:hover{background:var(--a-d); color:#fff}

@media print{
  body{background:#fff}
  .noprint{display:none}
  .sheet{max-width:none; padding:0}
  h2{margin-top:24pt}
  .rec,.head,table,.gl{break-inside:avoid}
  .cover{page-break-after:avoid}
}
@media (max-width:700px){
  .sheet{padding:0 20px 40px} .noprint{padding:14px 20px}
  .cover h1{font-size:28px}
  .head{grid-template-columns:repeat(2,1fr)}
  .rec__row{grid-template-columns:1fr; gap:2px}
}
</style>
</head>
<body>

<div class="noprint">
  <button class="pbtn" onclick="window.print()">Print or save as PDF</button>
  <a href="index.php" style="color:var(--a-d); font-size:13px; text-decoration:none">Back to the dashboard</a>
</div>

<div class="sheet">

<!-- ================= COVER ================= -->
<header class="cover">
<?php /* The logo already carries the "Healthcare International Group" wordmark,
     so printing it again beside the image says the same thing twice. Only the
     operating company name goes next to it. */ ?>
<?php /* Both marks. HCIG is the group, MedPark is the operating company this
     report is about, and showing only one loses that relationship. Neither
     wordmark is repeated in text beside them. */ ?>
  <div class="cover__brand">
    <?php if ($logoMp): ?><img class="lg-mp" src="<?php echo e($logoMp); ?>" alt="<?php echo e(mp_get('brand_name')); ?>"><?php endif; ?>
    <?php if ($logo && $logoMp): ?><span class="cover__div" aria-hidden="true"></span><?php endif; ?>
    <?php if ($logo): ?>
      <span class="cover__grp">
        <img class="lg-hc" src="<?php echo e($logo); ?>" alt="Healthcare International Group">
        <span>part of the group</span>
      </span>
    <?php endif; ?>
  </div>
  <h1>Website performance report</h1>
  <p class="sub">Visibility, reach, and the enquiries they produced.</p>
  <dl>
    <div><dt>Prepared for</dt><dd>Chief Executive Officer</dd></div>
    <div><dt>Period</dt><dd><?php echo e($R['from']); ?> to <?php echo e($R['to']); ?></dd></div>
    <div><dt>Compared with</dt><dd><?php echo e($pf); ?> to <?php echo e($pt); ?></dd></div>
    <div><dt>Issued</dt><dd><?php echo e(gmdate('j F Y')); ?></dd></div>
    <div><dt>Data source</dt><dd><?php echo e(mp_source_short($SRC)); ?></dd></div>
  </dl>
</header>

<!-- ================= EXECUTIVE SUMMARY ================= -->
<h2>Executive summary</h2>
<div class="say">
  <p><?php echo e($N['headline']); ?></p>
  <?php foreach ($N['lines'] as $l): ?><p><?php echo e($l); ?></p><?php endforeach; ?>
</div>

<div class="head">
  <div>
    <small>Appointment requests</small>
    <span class="big"><?php echo mp_num($H['requests']); ?></span>
    <em><?php echo rp($H['requests'], $PH['requests']); ?></em>
    <u>People who left a name and a number, through the booking form or the assistant</u>
  </div>
  <div>
    <small>Contact attempts</small>
    <span class="big"><?php echo mp_num($enq); ?></span>
    <em><?php echo rp($enq, $penq); ?></em>
    <u>Calls, WhatsApp taps, emails and forms. An attempt, not necessarily a conversation</u>
  </div>
  <div>
    <small>Visits</small>
    <span class="big"><?php echo $sessions > 0 ? mp_num($sessions) : '&ndash;'; ?></span>
    <em><?php echo $sessions > 0 ? rp($sessions, $psessions) : '<span class="flat">awaiting access</span>'; ?></em>
    <u>Times the website was opened</u>
  </div>
  <div>
    <small>Found on Google</small>
    <span class="big"><?php echo $impr > 0 ? mp_num($impr) : '&ndash;'; ?></span>
    <em><?php echo $impr > 0 ? rp($impr, $pimpr) : '<span class="flat">awaiting access</span>'; ?></em>
    <u>Times we appeared in search results</u>
  </div>
  <div>
    <small>AI mentions</small>
    <span class="big"><?php echo $aiC > 0 ? $aiM . ' / ' . $aiC : '&ndash;'; ?></span>
    <em><?php echo $aiC > 0 ? '<span class="flat">of questions checked</span>' : '<span class="flat">not yet measured</span>'; ?></em>
    <u>Questions where an AI assistant named MedPark</u>
  </div>
</div>

<p class="src-note">
  <strong>Where these numbers come from.</strong>
  Visits and contact attempts above are measured with
  <strong><?php echo e(mp_source_label($SRC)); ?></strong>.
  <?php echo e(mp_source_note($SRC)); ?>
  Appointment requests are counted the same way whichever source is selected, because they are
  stored by the website's own booking form and assistant rather than by any analytics.
  A contact attempt means somebody pressed a way of reaching us; whether they then spoke to
  anyone happens off the website and cannot be measured from here.
</p>

<?php if ($waiting): ?>
<div class="note">
  <strong>Coverage.</strong> <?php echo (int)$connected; ?> of <?php echo count($conn); ?> data sources
  are connected. Still waiting on <?php echo e(implode(', ', array_slice($waiting, 0, 4))); ?>.
  Figures shown as a dash are not zero; they are not yet measurable. Where a source holds history,
  connecting it backdates the baseline rather than starting from today.
</div>
<?php endif; ?>

<!-- ================= THE NUMBERS ================= -->
<h2>Performance</h2>
<div class="tw">
<table>
  <thead><tr><th>Measure</th><th class="n">This period</th><th class="n">Previous</th><th class="n">Change</th></tr></thead>
  <tbody>
    <tr><td><strong>Total enquiries</strong></td><td class="n"><strong><?php echo mp_num($enq); ?></strong></td><td class="n"><?php echo mp_num($penq); ?></td><td class="n"><?php echo rp($enq,$penq); ?></td></tr>
    <tr><td>Telephone calls</td><td class="n"><?php echo mp_num($calls); ?></td><td class="n"><?php echo mp_num($pcalls); ?></td><td class="n"><?php echo rp($calls,$pcalls); ?></td></tr>
    <tr><td>WhatsApp messages</td><td class="n"><?php echo mp_num($whats); ?></td><td class="n"><?php echo mp_num($pwhats); ?></td><td class="n"><?php echo rp($whats,$pwhats); ?></td></tr>
    <tr><td>Website assistant requests</td><td class="n"><?php echo mp_num($chat); ?></td><td class="n"><?php echo mp_num($pchat); ?></td><td class="n"><?php echo rp($chat,$pchat); ?></td></tr>
    <tr><td>Calls from map listings</td><td class="n"><?php echo $mapCalls > 0 ? mp_num($mapCalls) : '&ndash;'; ?></td><td class="n"><?php echo $pmapCalls > 0 ? mp_num($pmapCalls) : '&ndash;'; ?></td><td class="n"><?php echo rp($mapCalls,$pmapCalls); ?></td></tr>
    <tr><td>Direction requests</td><td class="n"><?php echo $dirs > 0 ? mp_num($dirs) : '&ndash;'; ?></td><td class="n"><?php echo $pdirs > 0 ? mp_num($pdirs) : '&ndash;'; ?></td><td class="n"><?php echo rp($dirs,$pdirs); ?></td></tr>
    <tr><td>Enquiry rate</td><td class="n"><?php echo $sessions > 0 ? number_format($rate,2).'%' : '&ndash;'; ?></td><td class="n"><?php echo $psessions > 0 ? number_format($prate,2).'%' : '&ndash;'; ?></td><td class="n"><?php echo rp($rate,$prate); ?></td></tr>
    <tr><td>Visits</td><td class="n"><?php echo $sessions > 0 ? mp_num($sessions) : '&ndash;'; ?></td><td class="n"><?php echo $psessions > 0 ? mp_num($psessions) : '&ndash;'; ?></td><td class="n"><?php echo rp($sessions,$psessions); ?></td></tr>
    <tr><td>Clicks from Google</td><td class="n"><?php echo $clicks > 0 ? mp_num($clicks) : '&ndash;'; ?></td><td class="n"><?php echo $pclicks > 0 ? mp_num($pclicks) : '&ndash;'; ?></td><td class="n"><?php echo rp($clicks,$pclicks); ?></td></tr>
    <tr><td>Times found on Google</td><td class="n"><?php echo $impr > 0 ? mp_num($impr) : '&ndash;'; ?></td><td class="n"><?php echo $pimpr > 0 ? mp_num($pimpr) : '&ndash;'; ?></td><td class="n"><?php echo rp($impr,$pimpr); ?></td></tr>
    <tr><td>Average search position <span style="color:var(--ink-3);font-size:11px">lower is better</span></td><td class="n"><?php echo $pos > 0 ? number_format($pos,1) : '&ndash;'; ?></td><td class="n"><?php echo $ppos > 0 ? number_format($ppos,1) : '&ndash;'; ?></td><td class="n"><?php echo rp($pos,$ppos,false); ?></td></tr>
  </tbody>
</table>
</div>

<!-- ================= WHERE CUSTOMERS CAME FROM ================= -->
<h2>Where the customers came from</h2>
<div class="cols">
  <div class="chartbox">
    <h3>Country</h3>
    <?php ui_hbars($topCountry, 6); ?>
  </div>
  <div class="chartbox">
    <h3>How they arrived</h3>
    <?php ui_hbars($topChannel, 6, 'var(--a)'); ?>
  </div>
</div>
<div class="cols">
  <div class="chartbox">
    <h3>What they searched for</h3>
    <?php ui_hbars($topQuery, 6, 'var(--md)'); ?>
  </div>
  <div class="chartbox">
    <h3>What they used to contact us</h3>
    <?php ui_stack(array(
      array('dim'=>'Calls','v'=>$calls),
      array('dim'=>'WhatsApp','v'=>$whats),
      array('dim'=>'Assistant','v'=>$chat),
      array('dim'=>'Forms','v'=>$forms),
    )); ?>
  </div>
</div>

<!-- ================= VISIBILITY ================= -->
<h2>Visibility and brand reach</h2>
<?php
  $mv = mp_sum('gbp','impressions_maps_mobile',$f,$t) + mp_sum('gbp','impressions_maps_desktop',$f,$t)
      + mp_sum('gbp','impressions_search_mobile',$f,$t) + mp_sum('gbp','impressions_search_desktop',$f,$t);
  $direct = mp_sum('ga4','sessions_channel',$f,$t,'Direct');
?>
<div class="cols">
  <div class="chartbox">
    <h3>Where we were seen</h3>
    <?php ui_hbars(array(
      array('dim'=>'Google search', 'v'=>$impr),
      array('dim'=>'Google Maps',   'v'=>$mv),
      array('dim'=>'Knew us already','v'=>$direct),
      array('dim'=>'AI assistants', 'v'=>$aiM),
    ), 4, 'var(--a)'); ?>
  </div>
  <div class="chartbox">
    <h3>Search position over time <span style="font-weight:500;color:var(--ink-3)">falling is better</span></h3>
    <?php
      $ps = mp_series('gsc','position',$f,$t);
      if (count($ps) >= 5) { ui_line(array(array('name'=>'Position','rows'=>$ps)), 'chart chart--sm'); }
      else { echo '<p style="padding:14px 15px;margin:0;font-size:12.5px;color:var(--ink-3)">Awaiting Search Console. It carries up to 16 months, so this chart fills in backwards rather than starting today.</p>'; }
    ?>
  </div>
</div>

<?php /* ---------------------------------------------------------------
   Findings, the glossary and the source table are switched off for now.

   They are not deleted: the recommendation engine, the definitions and the
   source status are all still built and still used on the dashboard, and this
   is the section a chief executive will want most once there is real data
   behind it rather than mostly "awaiting access".

   Turn back on with report_sections = 1 in Settings.
   --------------------------------------------------------------- */ ?>
<?php if (mp_get('report_sections', '0') === '1'): ?>
<!-- ================= FINDINGS AND ACTIONS ================= -->
<h2>Findings, recommended action, and what to expect</h2>

<?php foreach ($recs as $i => $r): ?>
<div class="rec rec--<?php echo e($r['severity']); ?>">
  <div class="rec__h">
    <span class="badge b-<?php echo e($r['severity']); ?>"><?php echo e(sev_label($r['severity'])); ?></span>
    <b><?php echo e($r['finding']); ?></b>
    <span class="badge b-area"><?php echo e($r['area']); ?></span>
  </div>
  <div class="rec__b">
<?php /* Evidence and impact are kept short. A reader who wants the full
     reasoning has the dashboard; a report that argues its case at length does
     not get read. */ ?>
    <?php if ($r['evidence'] !== ''): ?>
    <div class="rec__row"><div class="rec__k">Because</div><div class="rec__v"><?php echo e($r['evidence']); ?></div></div>
    <?php endif; ?>
    <?php if ($r['solution'] !== ''): ?>
    <div class="rec__row"><div class="rec__k">Do</div><div class="rec__v"><?php echo e($r['solution']); ?>
      <?php if ($r['owner'] !== '' && $r['effort'] !== 'none'): ?>
        <span class="who"><?php echo e(ucfirst($r['effort'])); ?> &middot; <?php echo e($r['owner']); ?></span>
      <?php endif; ?>
    </div></div>
    <?php endif; ?>
    <?php if ($r['expect'] !== ''): ?>
    <div class="rec__row"><div class="rec__k">Expect</div><div class="rec__v">
      <div class="expect"><?php echo e($r['expect']); ?>
        <?php if ($r['timeframe'] !== ''): ?>
          <div style="margin-top:6px;font-size:12.5px;color:var(--ink-3)"><strong>Timeframe:</strong> <?php echo e($r['timeframe']); ?></div>
        <?php endif; ?>
      </div>
    </div></div>
    <?php endif; ?>
  </div>
</div>
<?php endforeach; ?>

<?php if (!$recs): ?>
<p style="color:var(--ink-3)">No findings this period.</p>
<?php endif; ?>

<!-- ================= GLOSSARY ================= -->
<h2>What the measures mean</h2>
<?php foreach (array('enquiries','enquiry_rate','impressions','position','directions','ai_mentions') as $k):
        $d = mp_def($k); if (!$d) continue; ?>
  <div class="gl">
    <b><?php echo e($d['label']); ?></b>
    <p><?php echo e($d['what']); ?></p>
    <span><strong>Why it matters:</strong> <?php echo e($d['why']); ?></span>
    <span><strong>What good looks like:</strong> <?php echo e($d['good']); ?></span>
  </div>
<?php endforeach; ?>

<!-- ================= METHOD ================= -->
<h2>How this was measured</h2>
<div class="tw">
<table>
  <thead><tr><th>Source</th><th>Provides</th><th>Status</th></tr></thead>
  <tbody>
  <?php foreach ($conn as $c): ?>
    <tr>
      <td><?php echo e($c['name']); ?></td>
      <td><?php echo e($c['ready'] ? 'Collecting' : $c['needs']); ?></td>
      <td><?php echo $c['ready'] ? '<span class="up">Connected</span>' : '<span class="flat">Awaiting access</span>'; ?></td>
    </tr>
  <?php endforeach; ?>
  </tbody>
</table>
</div>

<?php endif; ?>

<div class="foot">
  <p>Figures are measured, not estimated, and traceable to the dashboard. A dash means not yet
     measurable, not zero. Conversion tracking began 2 September 2026, so telephone and WhatsApp have
     no earlier history. Expected outcomes are ranges calculated from our own figures, not promises.</p>
  <p style="margin-top:12px">Healthcare International Group &middot; <?php echo e(mp_get('brand_name')); ?>
     &middot; <?php echo e(gmdate('j F Y')); ?></p>
</div>

</div>
</body>
</html>
