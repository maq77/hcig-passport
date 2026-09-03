<?php
/* Source switch added 2026-09-03. Our own tracking and Google answer different
   questions, so neither side is trimmed to match the other. Ours is composed in
   lib/ownpanels.php; everything below the else is the original Google view,
   unchanged. */
ui_source_toggle('local', $R, 'Business Profile');
if (mp_source() === 'own') { own_page_local($R); } else {
?>
<?php
/* Maps and local. For a hospital serving tourists this is often the largest
   single source of contact, and it is currently reported nowhere. */
$hasGBP = mp_has_data('gbp');
$f = $R['from']; $t = $R['to']; $pf = $R['prev_from']; $pt = $R['prev_to'];

$views = mp_sum('gbp','impressions_maps_mobile',$f,$t) + mp_sum('gbp','impressions_maps_desktop',$f,$t)
       + mp_sum('gbp','impressions_search_mobile',$f,$t) + mp_sum('gbp','impressions_search_desktop',$f,$t);
$pviews= mp_sum('gbp','impressions_maps_mobile',$pf,$pt) + mp_sum('gbp','impressions_maps_desktop',$pf,$pt)
       + mp_sum('gbp','impressions_search_mobile',$pf,$pt) + mp_sum('gbp','impressions_search_desktop',$pf,$pt);
$calls = mp_sum('gbp','call_clicks',$f,$t);
$dirs  = mp_sum('gbp','direction_requests',$f,$t);
$site  = mp_sum('gbp','website_clicks',$f,$t);
?>

<?php if (!$hasGBP): ?>
  <div class="card">
    <?php ui_not_connected($conn,'gbp'); ?>
    <div style="max-width:620px;margin:0 auto;padding:0 18px 8px;color:var(--ink-2);font-size:13px">
      <p><b>Why this page matters more than it looks.</b> A tourist with a medical problem searches
      Maps, not a website. They see the listing, read the rating, and call. That contact never appears
      in website analytics, so without this connector a large part of real demand is simply invisible
      in the monthly report.</p>
      <p>Two locations to connect: MedPark Health Hub in Hurghada, and MedPark Hospital in El Quseir.</p>
    </div>
  </div>
<?php else: ?>

<div class="grid g4" style="margin-bottom:16px">
  <?php
    ui_kpi('Listing views', mp_num($views), mp_delta($views,$pviews), '', true);
    ui_kpi('Calls from listing', mp_num($calls), mp_delta($calls, mp_sum('gbp','call_clicks',$pf,$pt)));
    ui_kpi('Direction requests', mp_num($dirs), mp_delta($dirs, mp_sum('gbp','direction_requests',$pf,$pt)));
    ui_kpi('Clicks to website', mp_num($site), mp_delta($site, mp_sum('gbp','website_clicks',$pf,$pt)));
  ?>
</div>

<div class="card" style="margin-bottom:16px">
  <h3>Listing views per day</h3>
  <?php
    $st = mp_db()->prepare("SELECT day, SUM(value) v FROM metrics WHERE source='gbp'
                            AND metric LIKE 'impressions_%' AND day BETWEEN :a AND :b
                            GROUP BY day ORDER BY day");
    $st->execute(array(':a'=>$f, ':b'=>$t)); ui_spark($st->fetchAll());
  ?>
</div>

<div class="grid g2" style="margin-bottom:16px">
  <?php
    $st = mp_db()->prepare("SELECT DISTINCT dim FROM metrics WHERE source='gbp' AND dim <> ''");
    $st->execute();
    foreach ($st->fetchAll() as $b):
      $loc = $b['dim'];
      $bv = mp_sum('gbp','impressions_maps_mobile',$f,$t,$loc) + mp_sum('gbp','impressions_maps_desktop',$f,$t,$loc)
          + mp_sum('gbp','impressions_search_mobile',$f,$t,$loc) + mp_sum('gbp','impressions_search_desktop',$f,$t,$loc);
  ?>
  <div class="card">
    <h3><?php echo e(ui_branch_name($loc)); ?></h3>
    <div class="grid g2">
      <?php
        ui_kpi('Views', mp_num($bv));
        ui_kpi('Calls', mp_num(mp_sum('gbp','call_clicks',$f,$t,$loc)));
        ui_kpi('Directions', mp_num(mp_sum('gbp','direction_requests',$f,$t,$loc)));
        ui_kpi('Website clicks', mp_num(mp_sum('gbp','website_clicks',$f,$t,$loc)));
      ?>
    </div>
  </div>
  <?php endforeach; ?>
</div>

<div class="card">
  <h3>Where people found the listing</h3>
  <table>
    <thead><tr><th>Surface</th><th class="n">Views</th></tr></thead>
    <tbody>
      <tr><td>Google Search, mobile</td><td class="n"><?php echo mp_num(mp_sum('gbp','impressions_search_mobile',$f,$t)); ?></td></tr>
      <tr><td>Google Search, desktop</td><td class="n"><?php echo mp_num(mp_sum('gbp','impressions_search_desktop',$f,$t)); ?></td></tr>
      <tr><td>Google Maps, mobile</td><td class="n"><?php echo mp_num(mp_sum('gbp','impressions_maps_mobile',$f,$t)); ?></td></tr>
      <tr><td>Google Maps, desktop</td><td class="n"><?php echo mp_num(mp_sum('gbp','impressions_maps_desktop',$f,$t)); ?></td></tr>
    </tbody>
  </table>
  <p style="margin:14px 0 0;color:var(--ink-3);font-size:13px">
    Mobile Maps is usually the largest number for a hospital serving tourists. If it is not, the
    listing categories or the opening hours are probably wrong.</p>
</div>

<?php endif; ?>

<?php } /* end of the Google branch */ ?>
