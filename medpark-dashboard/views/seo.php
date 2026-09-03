<?php
/* Source switch added 2026-09-03. Our own tracking and Google answer different
   questions, so neither side is trimmed to match the other. Ours is composed in
   lib/ownpanels.php; everything below the else is the original Google view,
   unchanged. */
ui_source_toggle('seo', $R, 'Search Console');
if (mp_source() === 'own') { own_page_seo($R); } else {
?>
<?php
/* Search. Search Console for what is really happening, SEMrush for the
   competitive picture if a key is present. */
$hasGSC = mp_has_data('gsc');
$f = $R['from']; $t = $R['to']; $pf = $R['prev_from']; $pt = $R['prev_to'];

$clicks = mp_sum('gsc','clicks',$f,$t);
$impr   = mp_sum('gsc','impressions',$f,$t);
$ctr    = $impr > 0 ? ($clicks / $impr) * 100 : 0;
$pos    = mp_avg('gsc','position',$f,$t);
$pclicks= mp_sum('gsc','clicks',$pf,$pt);
$pimpr  = mp_sum('gsc','impressions',$pf,$pt);
$pctr   = $pimpr > 0 ? ($pclicks / $pimpr) * 100 : 0;
$ppos   = mp_avg('gsc','position',$pf,$pt);
?>

<?php if (!$hasGSC): ?>
  <div class="card"><?php ui_not_connected($conn,'gsc'); ?></div>
<?php else: ?>

<div class="grid g4" style="margin-bottom:16px">
  <?php
    ui_kpi('Clicks', mp_num($clicks), mp_delta($clicks,$pclicks), '', true);
    ui_kpi('Impressions', mp_num($impr), mp_delta($impr,$pimpr));
    ui_kpi('Click through rate', number_format($ctr,2).'%', mp_delta($ctr,$pctr));
    ui_kpi('Average position', $pos > 0 ? number_format($pos,1) : '--',
           $ppos > 0 ? mp_delta($ppos,$pos) : null, 'Lower is better');
  ?>
</div>

<div class="grid g2" style="margin-bottom:16px">
  <div class="card"><h3>Clicks per day</h3><?php ui_spark(mp_series('gsc','clicks',$f,$t)); ?></div>
  <div class="card"><h3>Impressions per day</h3><?php ui_spark(mp_series('gsc','impressions',$f,$t), '#0A2A4A'); ?></div>
</div>

<div class="grid g2" style="margin-bottom:16px">
  <div class="card card--pad0">
    <h3>Top 20 queries by clicks</h3>
    <?php ui_top_table(mp_top('gsc','clicks_query',$f,$t,20), 'Query', 'Clicks', null, 20); ?>
  </div>
  <div class="card card--pad0">
    <h3>Top 20 ranked pages</h3>
    <?php ui_top_table(mp_top('gsc','clicks_page',$f,$t,20), 'Page', 'Clicks', null, 20); ?>
  </div>
</div>

<div class="card card--pad0" style="margin-bottom:16px">
  <h3>Closest to page one, keywords at position 4 to 20</h3>
  <p style="padding:0 18px;margin:-4px 0 12px;color:var(--ink-3);font-size:13px">
    These are the cheapest gains available. The page already ranks, so strengthening it beats writing a new one.</p>
  <?php
    $st = mp_db()->prepare(
      "SELECT q.dim dim, AVG(p.value) pos, SUM(i.value) impr, SUM(q.value) clicks
       FROM metrics q
       JOIN metrics p ON p.day=q.day AND p.dim=q.dim AND p.source='gsc' AND p.metric='clicks_query_pos'
       JOIN metrics i ON i.day=q.day AND i.dim=q.dim AND i.source='gsc' AND i.metric='clicks_query_impr'
       WHERE q.source='gsc' AND q.metric='clicks_query' AND q.day BETWEEN :a AND :b
       GROUP BY q.dim HAVING pos BETWEEN 4 AND 20 AND impr >= 20
       ORDER BY impr DESC LIMIT 15");
    $st->execute(array(':a'=>$f, ':b'=>$t));
    $near = $st->fetchAll();
    if (!$near) { ui_empty('Nothing in this band yet', 'Either there is not enough data, or every keyword is already on page one or well beyond it.'); }
    else {
      echo '<table><thead><tr><th>Query</th><th class="n">Position</th><th class="n">Impressions</th><th class="n">Clicks</th></tr></thead><tbody>';
      foreach ($near as $n) {
        echo '<tr><td class="trunc" title="'.e($n['dim']).'">'.e($n['dim']).'</td>'
           . '<td class="n"><b>'.number_format((float)$n['pos'],1).'</b></td>'
           . '<td class="n">'.mp_num($n['impr']).'</td>'
           . '<td class="n">'.mp_num($n['clicks']).'</td></tr>';
      }
      echo '</tbody></table>';
    }
  ?>
</div>

<div class="grid g2" style="margin-bottom:16px">
  <div class="card card--pad0">
    <h3>Clicks by country</h3>
    <?php ui_top_table(mp_top('gsc','clicks_country',$f,$t,10), 'Country', 'Clicks', null, 10); ?>
  </div>
  <div class="card card--pad0">
    <h3>Clicks by device</h3>
    <?php ui_top_table(mp_top('gsc','clicks_device',$f,$t,5), 'Device', 'Clicks'); ?>
  </div>
</div>

<?php endif; ?>

<div class="card card--pad0">
  <h3>SEMrush <?php echo ui_pill($conn['semrush']['ready']); ?></h3>
  <?php if (mp_has_data('semrush')):
    $day = mp_db()->query("SELECT MAX(day) FROM metrics WHERE source='semrush'")->fetchColumn(); ?>
    <div class="grid g4" style="padding:0 18px 18px">
      <?php
        ui_kpi('Organic keywords', mp_num(mp_sum('semrush','organic_keywords',$day,$day)));
        ui_kpi('Estimated traffic', mp_num(mp_sum('semrush','organic_traffic',$day,$day)));
        ui_kpi('Paid keywords', mp_num(mp_sum('semrush','adwords_keywords',$day,$day)));
        ui_kpi('Domain rank', mp_num(mp_sum('semrush','rank',$day,$day)));
      ?>
    </div>
    <h3 style="padding:0 18px">Tracked keyword positions</h3>
    <?php ui_top_table(mp_top('semrush','keyword_volume',$day,$day,15), 'Keyword', 'Monthly volume', null, 15); ?>
  <?php else: ?>
    <?php ui_empty('SEMrush is optional and not connected',
      'Search Console already covers what is actually happening on this site. SEMrush adds competitor positions, keyword volumes and backlinks, which Search Console cannot see. If a subscription is bought, paste the API key in Settings and this fills in. Nothing else breaks without it.'); ?>
  <?php endif; ?>
</div>

<?php } /* end of the Google branch */ ?>
