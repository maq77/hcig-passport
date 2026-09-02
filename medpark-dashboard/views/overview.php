<?php
/* Overview. The page a CEO should be able to read in under a minute:
   what came in, what it produced, and what needs attention. */
$hasGA  = mp_has_data('ga4');
$hasGSC = mp_has_data('gsc');

$sessions  = mp_sum('ga4','sessions',$R['from'],$R['to']);
$psessions = mp_sum('ga4','sessions',$R['prev_from'],$R['prev_to']);
$users     = mp_sum('ga4','users',$R['from'],$R['to']);
$pusers    = mp_sum('ga4','users',$R['prev_from'],$R['prev_to']);

$calls   = mp_sum('ga4','events',$R['from'],$R['to'],'call_click');
$whats   = mp_sum('ga4','events',$R['from'],$R['to'],'whatsapp_click');
$pcalls  = mp_sum('ga4','events',$R['prev_from'],$R['prev_to'],'call_click');
$pwhats  = mp_sum('ga4','events',$R['prev_from'],$R['prev_to'],'whatsapp_click');
$enq     = $calls + $whats;
$penq    = $pcalls + $pwhats;

$clicks  = mp_sum('gsc','clicks',$R['from'],$R['to']);
$pclicks = mp_sum('gsc','clicks',$R['prev_from'],$R['prev_to']);
$impr    = mp_sum('gsc','impressions',$R['from'],$R['to']);
$pos     = mp_avg('gsc','position',$R['from'],$R['to']);
$ppos    = mp_avg('gsc','position',$R['prev_from'],$R['prev_to']);

$gbpCalls = mp_sum('gbp','call_clicks',$R['from'],$R['to']);
$gbpDir   = mp_sum('gbp','direction_requests',$R['from'],$R['to']);

/* The assistant is a third source of enquiries alongside calls and WhatsApp,
   so it belongs in the headline number rather than in a separate silo. */
try {
    $st = mp_db()->prepare("SELECT COUNT(*) FROM chat_leads WHERE date(created_at) BETWEEN :a AND :b");
    $st->execute(array(':a'=>$R['from'], ':b'=>gmdate('Y-m-d')));
    $chatLeads = (float)$st->fetchColumn();
    $st->execute(array(':a'=>$R['prev_from'], ':b'=>$R['prev_to']));
    $pChatLeads = (float)$st->fetchColumn();
} catch (Throwable $ex) { $chatLeads = 0.0; $pChatLeads = 0.0; }
$enq  += $chatLeads;
$penq += $pChatLeads;

$rate  = $sessions > 0 ? ($enq / $sessions) * 100 : 0;
$prate = $psessions > 0 ? ($penq / $psessions) * 100 : 0;
$findings = mp_insights($R);
$high = 0; foreach ($findings as $x) { if ($x['severity'] === 'high') $high++; }
?>

<div class="grid g4" style="margin-bottom:16px">
  <?php
    ui_kpi('Total enquiries', $hasGA ? mp_num($enq) : '--', $hasGA ? mp_delta($enq,$penq) : null,
           $hasGA ? 'First period on record' : 'Connect GA4', true);
    ui_kpi('Calls', $hasGA ? mp_num($calls) : '--', $hasGA ? mp_delta($calls,$pcalls) : null, 'Connect GA4');
    ui_kpi('WhatsApp', $hasGA ? mp_num($whats) : '--', $hasGA ? mp_delta($whats,$pwhats) : null, 'Connect GA4');
    /* Needs no credentials, so this one shows a real number from day one. */
    ui_kpi('Assistant requests', mp_num($chatLeads), mp_delta($chatLeads, $pChatLeads), 'Live now, no setup needed');
  ?>
</div>

<div class="grid g4" style="margin-bottom:16px">
  <?php
    ui_kpi('Enquiry rate', $hasGA ? number_format($rate,2).'%' : '--', $hasGA ? mp_delta($rate,$prate) : null, 'Connect GA4');
    ui_kpi('Sessions', $hasGA ? mp_num($sessions) : '--', $hasGA ? mp_delta($sessions,$psessions) : null, 'Connect GA4');
    ui_kpi('Clicks from Google', $hasGSC ? mp_num($clicks) : '--', $hasGSC ? mp_delta($clicks,$pclicks) : null, 'Connect Search Console');
    /* Position improves as the number falls, so the arrow is inverted. */
    $posDelta = $hasGSC && $ppos > 0 ? mp_delta($ppos,$pos) : null;
    ui_kpi('Average position', $hasGSC && $pos > 0 ? number_format($pos,1) : '--', $posDelta, 'Connect Search Console');
  ?>
</div>

<div class="grid g2" style="margin-bottom:16px">
  <div class="card">
    <h3>Enquiries per day</h3>
    <?php if ($hasGA):
      $sc = mp_series('ga4','events',$R['from'],$R['to']);
      $st = mp_db()->prepare("SELECT day, SUM(value) v FROM metrics WHERE source='ga4' AND metric='events'
                              AND dim IN ('call_click','whatsapp_click') AND day BETWEEN :a AND :b
                              GROUP BY day ORDER BY day");
      $st->execute(array(':a'=>$R['from'], ':b'=>$R['to']));
      ui_spark($st->fetchAll());
    else: ui_not_connected($conn,'ga4'); endif; ?>
  </div>
  <div class="card">
    <h3>Sessions per day</h3>
    <?php if ($hasGA): ui_spark(mp_series('ga4','sessions',$R['from'],$R['to']), '#0A2A4A');
    else: ui_not_connected($conn,'ga4'); endif; ?>
  </div>
</div>

<div class="grid g3" style="margin-bottom:16px">
  <div class="card card--pad0">
    <h3>Top 5 countries</h3>
    <?php $hasGA ? ui_top_table(mp_top('ga4','sessions_country',$R['from'],$R['to']), 'Country', 'Sessions')
                 : ui_not_connected($conn,'ga4'); ?>
  </div>
  <div class="card card--pad0">
    <h3>Top 5 traffic sources</h3>
    <?php $hasGA ? ui_top_table(mp_top('ga4','sessions_channel',$R['from'],$R['to']), 'Channel', 'Sessions')
                 : ui_not_connected($conn,'ga4'); ?>
  </div>
  <div class="card card--pad0">
    <h3>Top 5 pages</h3>
    <?php $hasGA ? ui_top_table(mp_top('ga4','views_page',$R['from'],$R['to']), 'Page', 'Views')
                 : ui_not_connected($conn,'ga4'); ?>
  </div>
</div>

<div class="grid g2" style="margin-bottom:16px">
  <div class="card card--pad0">
    <h3>Top 5 search queries</h3>
    <?php $hasGSC ? ui_top_table(mp_top('gsc','clicks_query',$R['from'],$R['to']), 'Query', 'Clicks')
                  : ui_not_connected($conn,'gsc'); ?>
  </div>
  <div class="card">
    <h3>From the map listings</h3>
    <?php if (mp_has_data('gbp')): ?>
      <div class="grid g2">
        <?php ui_kpi('Calls from listing', mp_num($gbpCalls));
              ui_kpi('Direction requests', mp_num($gbpDir)); ?>
      </div>
      <p style="margin:14px 0 0;color:var(--ink-3);font-size:13px">
        These never touch the website. Many tourists find the branch on Maps and call straight from there,
        so this is real demand the site analytics cannot see.</p>
    <?php else: ui_not_connected($conn,'gbp'); endif; ?>
  </div>
</div>

<div class="card card--pad0">
  <h3>What needs attention<?php if ($high): ?> <span class="tag" style="color:var(--bad);border-color:var(--bad)"><?php echo $high; ?> urgent</span><?php endif; ?></h3>
  <?php if (!$findings): ?>
    <?php ui_empty('Nothing flagged', 'No issues were detected in the connected sources for this period.'); ?>
  <?php else: foreach (array_slice($findings, 0, 5) as $x): ?>
    <div class="find s-<?php echo e($x['severity']); ?>">
      <div class="find__dot"></div>
      <div class="find__b">
        <div class="find__t"><?php echo e($x['title']); ?><span class="tag"><?php echo e($x['area']); ?></span></div>
        <div class="find__d"><?php echo e($x['detail']); ?></div>
        <div class="find__a"><b>What to do.</b> <?php echo e($x['advice']); ?></div>
      </div>
    </div>
  <?php endforeach; endif; ?>
  <?php if (count($findings) > 5): ?>
    <div style="padding:14px 18px;border-top:1px solid #F0F4F8">
      <a class="btn btn--sm" href="?p=issues&amp;r=<?php echo e($R['preset']); ?>">See all <?php echo count($findings); ?> findings</a>
    </div>
  <?php endif; ?>
</div>
