<?php
/* ==========================================================================
   CEO summary.

   Rebuilt 2026-09-03. The previous version explained itself in paragraphs;
   the feedback was that it read as too much text and not enough picture.

   Now: one sentence, eight numbers each carrying its own trend line, six
   charts, and findings cut to a line each. Every explanation moved into the
   tooltip, so it is available on demand and never in the way.
   ========================================================================== */

$f = $R['from']; $t = $R['to']; $pf = $R['prev_from']; $pt = $R['prev_to'];
$today = gmdate('Y-m-d');

$N = mp_narrative($R);

$chat  = mp_count_leads($f, $today);   $pchat = mp_count_leads($pf, $pt);
$calls = mp_sum('ga4','events',$f,$t,'call_click');       $pcalls = mp_sum('ga4','events',$pf,$pt,'call_click');
$wa    = mp_sum('ga4','events',$f,$t,'whatsapp_click');   $pwa    = mp_sum('ga4','events',$pf,$pt,'whatsapp_click');
$forms = mp_sum('ga4','events',$f,$t,'enquiry_submit');   $pforms = mp_sum('ga4','events',$pf,$pt,'enquiry_submit');
$enq   = $calls + $wa + $forms + $chat;
$penq  = $pcalls + $pwa + $pforms + $pchat;

$impr  = mp_sum('gsc','impressions',$f,$t);  $pimpr = mp_sum('gsc','impressions',$pf,$pt);
$clicks= mp_sum('gsc','clicks',$f,$t);       $pclicks = mp_sum('gsc','clicks',$pf,$pt);
$pos   = mp_avg('gsc','position',$f,$t);     $ppos  = mp_avg('gsc','position',$pf,$pt);
$dirs  = mp_sum('gbp','direction_requests',$f,$t); $pdirs = mp_sum('gbp','direction_requests',$pf,$pt);
$mapCalls = mp_sum('gbp','call_clicks',$f,$t);     $pmapCalls = mp_sum('gbp','call_clicks',$pf,$pt);

$aiRow = mp_db()->query("SELECT COUNT(*) c, SUM(mentioned) m FROM ai_checks WHERE checked_at >= date('now','-45 day')")->fetch();
$aiC = $aiRow ? (int)$aiRow['c'] : 0;  $aiM = $aiRow ? (int)$aiRow['m'] : 0;

$recs   = mp_recommendations($R);
$urgent = array_values(array_filter($recs, function ($x) { return $x['severity'] === 'high'; }));

/* daily series for the tile sparklines */
function ceo_ev(string $ev, string $a, string $b): array {
    $st = mp_db()->prepare("SELECT day, SUM(value) v FROM metrics WHERE source='ga4' AND metric='events'
                            AND dim=:e AND day BETWEEN :a AND :b GROUP BY day ORDER BY day");
    $st->execute(array(':e'=>$ev, ':a'=>$a, ':b'=>$b));
    return $st->fetchAll();
}
$sEnq = mp_db()->prepare("SELECT day, SUM(value) v FROM metrics WHERE source='ga4' AND metric='events'
                          AND dim IN ('call_click','whatsapp_click','enquiry_submit')
                          AND day BETWEEN :a AND :b GROUP BY day ORDER BY day");
$sEnq->execute(array(':a'=>$f, ':b'=>$t));
$sEnq = $sEnq->fetchAll();
?>

<div class="qa" role="group" aria-label="Quick actions">
  <form method="post" style="display:contents">
    <input type="hidden" name="csrf" value="<?php echo e(mp_csrf()); ?>">
    <input type="hidden" name="act" value="schedule_report">
    <button class="qa__btn qa__btn--pri" type="submit" title="Report arrives by email on the first of every month. Set once.">
      <?php echo ui_icon('inbox', 15); ?> Email me monthly
    </button>
  </form>
  <a class="qa__btn" href="#fix" title="Ranked by likely effect on enquiries."><?php echo ui_icon('alert', 15); ?> Fix first</a>
  <form method="post" style="display:contents">
    <input type="hidden" name="csrf" value="<?php echo e(mp_csrf()); ?>">
    <input type="hidden" name="act" value="toggle_alerts">
    <button class="qa__btn" type="submit" title="Emails you if a headline number falls sharply week on week.">
      <?php echo ui_icon('target', 15); ?> <?php echo mp_get('alerts_on') === '1' ? 'Alerts on' : 'Alert me'; ?>
    </button>
  </form>
  <a class="qa__btn" href="export.php?r=<?php echo e($R['preset']); ?>&amp;f=report" target="_blank"
     title="Printable report with the same numbers."><?php echo ui_icon('download', 15); ?> Report</a>
</div>

<div class="say say--<?php echo e($N['tone']); ?>">
  <p class="say__head"><?php echo e($N['headline']); ?></p>
</div>

<!-- eight numbers, each with its own trend -->
<div class="grid g4">
  <?php
    ui_stat('enquiries', mp_num($enq), mp_delta($enq,$penq), $sEnq, true);
    ui_stat('calls', mp_has_data('ga4') ? mp_num($calls) : '--', mp_has_data('ga4') ? mp_delta($calls,$pcalls) : null,
            ceo_ev('call_click',$f,$t), false, 'awaiting access');
    ui_stat('whatsapp', mp_has_data('ga4') ? mp_num($wa) : '--', mp_has_data('ga4') ? mp_delta($wa,$pwa) : null,
            ceo_ev('whatsapp_click',$f,$t), false, 'awaiting access', 'var(--c5)');
    ui_stat('assistant', mp_num($chat), mp_delta($chat,$pchat), array(), false, 'live now');
  ?>
</div>
<div class="grid g4">
  <?php
    ui_stat('impressions', $impr > 0 ? ui_short($impr) : '--', $impr > 0 ? mp_delta($impr,$pimpr) : null,
            mp_series('gsc','impressions',$f,$t), false, 'awaiting access', 'var(--c2)');
    ui_stat('clicks', $clicks > 0 ? mp_num($clicks) : '--', $clicks > 0 ? mp_delta($clicks,$pclicks) : null,
            mp_series('gsc','clicks',$f,$t), false, 'awaiting access', 'var(--c2)');
    ui_stat('position', $pos > 0 ? number_format($pos,1) : '--', $pos > 0 ? mp_delta($ppos,$pos) : null,
            mp_series('gsc','position',$f,$t), false, 'awaiting access', 'var(--c4)');
    ui_stat('ai_mentions', $aiC > 0 ? $aiM . '/' . $aiC : '--', null, array(), false,
            $aiC > 0 ? 'last 45 days' : 'not measured yet');
  ?>
</div>

<!-- charts -->
<div class="grid g-2-1">
  <div class="card">
    <h3>Enquiries per day</h3>
    <?php
      if (count($sEnq) > 1) ui_line(array(array('name'=>'Enquiries','rows'=>$sEnq)));
      else ui_empty('Not enough days yet', 'A trend needs two days. Fills in on its own.', 'pulse');
    ?>
  </div>
  <div class="card card--pad0">
    <h3>What they used</h3>
    <?php ui_stack(array(
      array('dim'=>'Calls','v'=>$calls),
      array('dim'=>'WhatsApp','v'=>$wa),
      array('dim'=>'Assistant','v'=>$chat),
      array('dim'=>'Forms','v'=>$forms),
    )); ?>
  </div>
</div>

<div class="grid g3">
  <div class="card card--pad0">
    <h3>Where they are</h3>
    <?php ui_hbars(mp_top('ga4','sessions_country',$f,$t,6), 6); ?>
  </div>
  <div class="card card--pad0">
    <h3>How they arrived</h3>
    <?php ui_hbars(mp_top('ga4','sessions_channel',$f,$t,6), 6, 'var(--c2)'); ?>
  </div>
  <div class="card card--pad0">
    <h3>What they searched</h3>
    <?php ui_hbars(mp_top('gsc','clicks_query',$f,$t,6), 6, 'var(--c3)'); ?>
  </div>
</div>

<div class="grid g-2-1">
  <div class="card">
    <h3>Search position <span class="hint">falling is better</span></h3>
    <?php
      $ps = mp_series('gsc','position',$f,$t);
      if (count($ps) >= 5) ui_line(array(array('name'=>'Position','rows'=>$ps)), 'chart chart--sm');
      else ui_empty('Awaiting Search Console', 'Carries up to 16 months, so this fills in backwards.', 'search');
    ?>
  </div>
  <div class="card card--pad0">
    <h3>Brand reach</h3>
    <?php
      $direct = mp_sum('ga4','sessions_channel',$f,$t,'Direct');
      $mapViews = mp_sum('gbp','impressions_maps_mobile',$f,$t) + mp_sum('gbp','impressions_maps_desktop',$f,$t)
                + mp_sum('gbp','impressions_search_mobile',$f,$t) + mp_sum('gbp','impressions_search_desktop',$f,$t);
      ui_hbars(array(
        array('dim'=>'Google search','v'=>$impr),
        array('dim'=>'Google Maps','v'=>$mapViews),
        array('dim'=>'Knew us already','v'=>$direct),
      ), 3, 'var(--c4)');
    ?>
  </div>
</div>

<div class="grid g3">
  <?php
    ui_stat('map_calls', $mapCalls > 0 ? mp_num($mapCalls) : '--', $mapCalls > 0 ? mp_delta($mapCalls,$pmapCalls) : null,
            array(), false, 'awaiting access');
    ui_stat('directions', $dirs > 0 ? mp_num($dirs) : '--', $dirs > 0 ? mp_delta($dirs,$pdirs) : null,
            array(), false, 'awaiting access');
    $sessions = mp_sum('ga4','sessions',$f,$t);
    $psessions = mp_sum('ga4','sessions',$pf,$pt);
    ui_stat('enquiry_rate', $sessions > 0 ? number_format(($enq/$sessions)*100, 2) . '%' : '--',
            $sessions > 0 && $psessions > 0 ? mp_delta(($enq/$sessions)*100, ($penq/$psessions)*100) : null,
            array(), false, 'awaiting access');
  ?>
</div>

<!-- findings, one line each -->
<div class="card card--pad0" id="fix">
  <h3>Fix first <span class="hint">ranked by effect on enquiries</span></h3>
  <?php if (!$urgent): ?>
    <?php ui_empty('Nothing urgent', 'No connected source shows an issue likely to be costing enquiries.', 'target'); ?>
  <?php else: foreach (array_slice($urgent, 0, 3) as $i => $x): ?>
    <div class="find s-high">
      <div class="find__sev"></div>
      <div class="find__b">
        <div class="find__t"><?php echo ($i+1) . '. ' . e($x['finding']); ?><span class="tag"><?php echo e($x['area']); ?></span></div>
        <div class="find__a"><b>Do.</b> <?php echo e($x['solution']); ?></div>
        <?php if ($x['expect'] !== ''): ?>
        <div class="find__x"><b>Expect.</b> <?php echo e($x['expect']); ?><span class="find__t2"><?php echo e($x['timeframe']); ?></span></div>
        <?php endif; ?>
      </div>
    </div>
  <?php endforeach; endif; ?>
  <?php if (count($recs) > 3): ?>
    <div style="padding:11px 15px;border-top:1px solid var(--line-2)">
      <a class="btn btn--sm" href="?p=issues&amp;r=<?php echo e($R['preset']); ?>">All <?php echo count($recs); ?></a>
    </div>
  <?php endif; ?>
</div>
