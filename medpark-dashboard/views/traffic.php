<?php
/* Audience and traffic. Who arrives, where from, on what, and how long
   they stay. Yandex sits alongside GA4 as a second opinion. */
$hasGA = mp_has_data('ga4');
$f = $R['from']; $t = $R['to']; $pf = $R['prev_from']; $pt = $R['prev_to'];

$sessions = mp_sum('ga4','sessions',$f,$t);
$users    = mp_sum('ga4','users',$f,$t);
$newU     = mp_sum('ga4','new_users',$f,$t);
$views    = mp_sum('ga4','pageviews',$f,$t);
$avgDur   = mp_avg('ga4','avg_session_duration',$f,$t);
$bounce   = mp_avg('ga4','bounce_rate',$f,$t);
$engage   = mp_avg('ga4','engagement_rate',$f,$t);
$returning = mp_sum('ga4','sessions_visitor',$f,$t,'returning');
?>

<?php if (!$hasGA): ?>
  <div class="card"><?php ui_not_connected($conn,'ga4'); ?></div>
<?php else: ?>

<div class="grid g4" style="margin-bottom:16px">
  <?php
    ui_kpi('Sessions', mp_num($sessions), mp_delta($sessions, mp_sum('ga4','sessions',$pf,$pt)));
    ui_kpi('Visitors', mp_num($users), mp_delta($users, mp_sum('ga4','users',$pf,$pt)));
    ui_kpi('New visitors', mp_num($newU), mp_delta($newU, mp_sum('ga4','new_users',$pf,$pt)));
    ui_kpi('Repeat visits', mp_num($returning), mp_delta($returning, mp_sum('ga4','sessions_visitor',$pf,$pt,'returning')));
  ?>
</div>

<div class="grid g4" style="margin-bottom:16px">
  <?php
    ui_kpi('Page views', mp_num($views), mp_delta($views, mp_sum('ga4','pageviews',$pf,$pt)));
    ui_kpi('Average session', mp_secs($avgDur), mp_delta($avgDur, mp_avg('ga4','avg_session_duration',$pf,$pt)));
    ui_kpi('Engagement rate', number_format($engage,1).'%', mp_delta($engage, mp_avg('ga4','engagement_rate',$pf,$pt)));
    /* Bounce falling is good, so the comparison is inverted. */
    ui_kpi('Bounce rate', number_format($bounce,1).'%', mp_delta(mp_avg('ga4','bounce_rate',$pf,$pt), $bounce));
  ?>
</div>

<div class="card" style="margin-bottom:16px">
  <h3>Sessions per day</h3>
  <?php ui_spark(mp_series('ga4','sessions',$f,$t)); ?>
</div>

<div class="grid g2" style="margin-bottom:16px">
  <div class="card card--pad0">
    <h3>Top 10 countries</h3>
    <?php ui_top_table(mp_top('ga4','sessions_country',$f,$t,10), 'Country', 'Sessions', null, 10); ?>
  </div>
  <div class="card card--pad0">
    <h3>Top 10 sources</h3>
    <?php ui_top_table(mp_top('ga4','sessions_source',$f,$t,10), 'Source and medium', 'Sessions', null, 10); ?>
  </div>
</div>

<div class="grid g3" style="margin-bottom:16px">
  <div class="card card--pad0">
    <h3>Channels</h3>
    <?php ui_top_table(mp_top('ga4','sessions_channel',$f,$t,8), 'Channel', 'Sessions', null, 8); ?>
  </div>
  <div class="card card--pad0">
    <h3>Devices</h3>
    <?php ui_top_table(mp_top('ga4','sessions_device',$f,$t,5), 'Device', 'Sessions'); ?>
  </div>
  <div class="card card--pad0">
    <h3>Languages</h3>
    <?php ui_top_table(mp_top('ga4','sessions_language',$f,$t,8), 'Language', 'Sessions', null, 8); ?>
  </div>
</div>

<div class="grid g2" style="margin-bottom:16px">
  <div class="card card--pad0">
    <h3>Top 10 pages by views</h3>
    <?php ui_top_table(mp_top('ga4','views_page',$f,$t,10), 'Page', 'Views', null, 10); ?>
  </div>
  <div class="card card--pad0">
    <h3>Where visitors spend the most time</h3>
    <?php
      /* Total engaged seconds per page, divided by views, gives the average
         time actually spent reading rather than the page being open. */
      $st = mp_db()->prepare(
        "SELECT e.dim dim,
                CASE WHEN SUM(v.value) > 0 THEN SUM(e.value)/SUM(v.value) ELSE 0 END v
         FROM metrics e
         JOIN metrics v ON v.day=e.day AND v.dim=e.dim AND v.source='ga4' AND v.metric='views_page'
         WHERE e.source='ga4' AND e.metric='engagement_page' AND e.day BETWEEN :a AND :b
         GROUP BY e.dim HAVING SUM(v.value) >= 20 ORDER BY v DESC LIMIT 10");
      $st->execute(array(':a'=>$f, ':b'=>$t));
      ui_top_table($st->fetchAll(), 'Page', 'Avg time', function ($s) { return mp_secs($s); }, 10);
    ?>
  </div>
</div>

<div class="card card--pad0">
  <h3>Yandex Metrica, second opinion</h3>
  <?php if (mp_has_data('yandex')): ?>
    <div class="grid g4" style="padding:0 18px 18px">
      <?php
        ui_kpi('Visits', mp_num(mp_sum('yandex','visits',$f,$t)));
        ui_kpi('Users', mp_num(mp_sum('yandex','users',$f,$t)));
        ui_kpi('Page views', mp_num(mp_sum('yandex','pageviews',$f,$t)));
        ui_kpi('Average visit', mp_secs(mp_avg('yandex','avg_visit_seconds',$f,$t)));
      ?>
    </div>
    <p style="padding:0 18px 18px;margin:0;color:var(--ink-3);font-size:13px">
      Yandex counts visitors who block Google scripts, so its numbers usually run slightly higher.
      A large gap between the two is worth investigating, a small one is normal.</p>
  <?php else: ui_not_connected($conn,'yandex'); endif; ?>
</div>

<?php endif; ?>
