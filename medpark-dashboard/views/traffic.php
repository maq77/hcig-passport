<?php
/* Source switch added 2026-09-03. Our own tracking and Google answer different
   questions, so neither side is trimmed to match the other. Ours is composed in
   lib/ownpanels.php; everything below the else is the original Google view,
   unchanged. */
ui_source_toggle('traffic', $R, 'GA4');
if (mp_source() === 'own') { own_page_traffic($R); } else {
?>
<?php
/* Audience.

   Two things this page does that a stock analytics view does not.

   First, real cross-filtering. Country, language and device are stored as
   paired rows, so "German speakers on mobile" is a query rather than a guess.

   Second, nationality. GA4 tells you where a device is sitting, which for a
   tourist hospital is the wrong question on its own. Someone in Egypt reading
   German is a German tourist who is already here and may need you today.
   Someone in Germany reading German is planning a holiday. Same language,
   completely different value, and only the pairing separates them. */

$hasGA = mp_has_data('ga4');
$f = $R['from']; $t = $R['to']; $pf = $R['prev_from']; $pt = $R['prev_to'];
$F = ui_filter_state();
$filtered = ($F['country'] !== '' || $F['language'] !== '' || $F['device'] !== '');

/* Language codes arrive as en-gb, de-at and so on. Group to the language. */
function tr_lang_group(string $from, string $to, ?string $country = null): array {
    $rows = mp_pair_top('x_country_lang', $from, $to, 'dim2', $country, 200);
    $out = array();
    foreach ($rows as $r) {
        $code = strtolower(substr((string)$r['dim'], 0, 2));
        if ($code === '') continue;
        $out[$code] = (isset($out[$code]) ? $out[$code] : 0) + (float)$r['v'];
    }
    arsort($out);
    return $out;
}

/* Nationality signal: what language they read, wherever they are sitting. */
$langAll = tr_lang_group($f, $t);
$langPrev = tr_lang_group($pf, $pt);
$deAll = isset($langAll['de']) ? $langAll['de'] : 0.0;
$plAll = isset($langAll['pl']) ? $langAll['pl'] : 0.0;
$dePrev = isset($langPrev['de']) ? $langPrev['de'] : 0.0;
$plPrev = isset($langPrev['pl']) ? $langPrev['pl'] : 0.0;

/* Already in Egypt, reading German or Polish. The most valuable single
   segment this business has: a tourist on the ground who needs care now. */
$deHere = mp_pair_sum('x_country_lang', $f, $t, 'Egypt', null);
$deInEgypt = 0.0; $plInEgypt = 0.0;
foreach (mp_pair_top('x_country_lang', $f, $t, 'dim2', 'Egypt', 200) as $r) {
    $c = strtolower(substr((string)$r['dim'], 0, 2));
    if ($c === 'de') $deInEgypt += (float)$r['v'];
    if ($c === 'pl') $plInEgypt += (float)$r['v'];
}
?>

<?php if (!$hasGA): ?>
  <div class="card"><?php ui_not_connected($conn,'ga4'); ?></div>
  <div class="card">
    <h3>What this page will show once GA4 is connected</h3>
    <p>Nationality rather than just location, which for a tourist hospital is the difference between
       a German planning a holiday and a German already in Hurghada with a problem. Plus real
       cross-filters: country, language and device combined, not one at a time.</p>
  </div>
<?php else: ?>

<?php ui_filters('traffic', $R, $f, $t); ?>

<?php
  $sessions  = $filtered ? ui_filtered_sessions($f, $t) : mp_sum('ga4','sessions',$f,$t);
  $psessions = $filtered
      ? (($F['country'] !== '' || $F['language'] !== '')
          ? mp_pair_sum('x_country_lang', $pf, $pt, $F['country'] ?: null, $F['language'] ?: null)
          : mp_pair_sum('x_device_lang', $pf, $pt, $F['device'], null))
      : mp_sum('ga4','sessions',$pf,$pt);
  $allSessions = mp_sum('ga4','sessions',$f,$t);
?>

<?php if ($filtered): ?>
<div class="note note--info">
  <b>Filtered view.</b>
  <?php
    $bits = array();
    if ($F['country'] !== '')  $bits[] = 'country ' . e($F['country']);
    if ($F['language'] !== '') $bits[] = 'language ' . e($F['language']);
    if ($F['device'] !== '')   $bits[] = 'device ' . e($F['device']);
    echo 'Showing ' . implode(', ', $bits) . '. That is ';
    echo '<b>' . mp_num($sessions) . '</b> of ' . mp_num($allSessions) . ' sessions, ';
    echo $allSessions > 0 ? number_format(($sessions / $allSessions) * 100, 1) . '% of all traffic.' : '';
  ?>
</div>
<?php endif; ?>

<div class="grid g4">
  <?php
    ui_kpi($filtered ? 'Sessions, filtered' : 'Sessions', mp_num($sessions),
           mp_delta($sessions, $psessions), '', true,
           $filtered ? array() : mp_series('ga4','sessions',$f,$t));
    ui_kpi('German speakers', mp_num($deAll), mp_delta($deAll, $dePrev), 'Target market');
    ui_kpi('Polish speakers', mp_num($plAll), mp_delta($plAll, $plPrev), 'Target market');
    ui_kpi('Already in Egypt', mp_num($deInEgypt + $plInEgypt), null,
           'German or Polish, on the ground');
  ?>
</div>

<div class="grid g4">
  <?php
    $users  = mp_sum('ga4','users',$f,$t);
    $newU   = mp_sum('ga4','new_users',$f,$t);
    $ret    = mp_sum('ga4','sessions_visitor',$f,$t,'returning');
    $avgDur = mp_avg('ga4','avg_session_duration',$f,$t);
    ui_kpi('Visitors', mp_num($users), mp_delta($users, mp_sum('ga4','users',$pf,$pt)));
    ui_kpi('New visitors', mp_num($newU), mp_delta($newU, mp_sum('ga4','new_users',$pf,$pt)));
    ui_kpi('Repeat visits', mp_num($ret), mp_delta($ret, mp_sum('ga4','sessions_visitor',$pf,$pt,'returning')));
    ui_kpi('Average session', mp_secs($avgDur), mp_delta($avgDur, mp_avg('ga4','avg_session_duration',$pf,$pt)));
  ?>
</div>

<div class="card">
  <h3>Nationality, not just location <span class="hint">Language read, cross-referenced with where they are</span></h3>
  <?php
    $names = array('de'=>'German', 'pl'=>'Polish', 'en'=>'English', 'ru'=>'Russian',
                   'ar'=>'Arabic', 'fr'=>'French', 'it'=>'Italian', 'cs'=>'Czech', 'nl'=>'Dutch');
    $rows = array();
    foreach (array_slice($langAll, 0, 8, true) as $code => $v) {
        $rows[] = array('dim' => (isset($names[$code]) ? $names[$code] : strtoupper($code)), 'v' => $v);
    }
    if (!$rows) { ui_empty('No language data yet', 'This fills in on the first GA4 pull.', 'globe'); }
    else {
      echo '<div class="tw"><table style="min-width:640px"><thead><tr>'
         . '<th>Reads</th><th style="width:110px"></th><th class="n">Sessions</th>'
         . '<th class="n">Share</th><th class="n">In Egypt now</th><th>Read as</th></tr></thead><tbody>';
      $totalL = array_sum($langAll);
      $maxL = $rows ? (float)$rows[0]['v'] : 1;
      foreach (array_slice($langAll, 0, 8, true) as $code => $v) {
        $inEgypt = 0.0;
        foreach (mp_pair_top('x_country_lang', $f, $t, 'dim2', 'Egypt', 200) as $r) {
          if (strtolower(substr((string)$r['dim'], 0, 2)) === $code) $inEgypt += (float)$r['v'];
        }
        $label = isset($names[$code]) ? $names[$code] : strtoupper($code);
        $reading = $inEgypt > 0 && $v > 0 ? ($inEgypt / $v) : 0;
        $verdict = $code === 'ar'
          ? 'likely local'
          : ($reading > 0.5 ? 'mostly here already' : ($reading > 0.15 ? 'mixed' : 'mostly planning ahead'));
        echo '<tr><td><strong>' . e($label) . '</strong></td>'
           . '<td><span class="bar"><i style="width:' . round(($v / max($maxL, 1)) * 100) . '%"></i></span></td>'
           . '<td class="n"><strong>' . mp_num($v) . '</strong></td>'
           . '<td class="n">' . ($totalL > 0 ? number_format(($v / $totalL) * 100, 1) . '%' : '-') . '</td>'
           . '<td class="n">' . mp_num($inEgypt) . '</td>'
           . '<td style="font-size:12px;color:var(--ink-3)">' . e($verdict) . '</td></tr>';
      }
      echo '</tbody></table></div>';
    }
  ?>
  <p class="card__note">
    <b>Why this column matters.</b> A German reading from Germany in February is planning a holiday and
    wants reassurance. A German reading from inside Egypt has a problem right now and wants a phone
    number above the fold. Same language, opposite need. Serve the second one first, they convert today.
  </p>
</div>

<div class="grid g-2-1">
  <div class="card card--pad0">
    <h3>Countries<?php echo $F['language'] !== '' ? ' <span class="hint">reading ' . e($F['language']) . '</span>' : ''; ?></h3>
    <?php ui_top_table(mp_pair_top('x_country_lang', $f, $t, 'dim', $F['language'] ?: null, 12), 'Country', 'Sessions', null, 12); ?>
  </div>
  <div class="card">
    <h3>Devices<?php echo $F['language'] !== '' ? ' <span class="hint">' . e($F['language']) . '</span>' : ''; ?></h3>
    <?php ui_donut(mp_pair_top('x_device_lang', $f, $t, 'dim', $F['language'] ?: null, 5)); ?>
  </div>
</div>

<div class="card">
  <h3>Sessions per day</h3>
  <?php ui_line(array(array('name'=>'Sessions', 'rows'=>mp_series('ga4','sessions',$f,$t)))); ?>
</div>

<div class="grid g3">
  <div class="card card--pad0">
    <h3>Channels</h3>
    <?php ui_top_table(mp_top('ga4','sessions_channel',$f,$t,8), 'Channel', 'Sessions', null, 8); ?>
  </div>
  <div class="card card--pad0">
    <h3>Sources</h3>
    <?php ui_top_table(mp_top('ga4','sessions_source',$f,$t,8), 'Source and medium', 'Sessions', null, 8); ?>
  </div>
  <div class="card card--pad0">
    <h3>Cities</h3>
    <?php ui_top_table(mp_top('ga4','sessions_city',$f,$t,8), 'City', 'Sessions', null, 8); ?>
  </div>
</div>

<div class="grid g2">
  <div class="card card--pad0">
    <h3>Top pages</h3>
    <?php ui_top_table(mp_top('ga4','views_page',$f,$t,12), 'Page', 'Views', null, 12); ?>
  </div>
  <div class="card card--pad0">
    <h3>Where visitors spend the most time</h3>
    <?php
      $st = mp_db()->prepare(
        "SELECT e.dim dim,
                CASE WHEN SUM(v.value) > 0 THEN SUM(e.value)/SUM(v.value) ELSE 0 END v
         FROM metrics e
         JOIN metrics v ON v.day=e.day AND v.dim=e.dim AND v.source='ga4' AND v.metric='views_page'
         WHERE e.source='ga4' AND e.metric='engagement_page' AND e.day BETWEEN :a AND :b
         GROUP BY e.dim HAVING SUM(v.value) >= 20 ORDER BY v DESC LIMIT 12");
      $st->execute(array(':a'=>$f, ':b'=>$t));
      ui_top_table($st->fetchAll(), 'Page', 'Avg time', function ($s) { return mp_secs($s); }, 12);
    ?>
  </div>
</div>

<div class="card card--pad0">
  <h3>Yandex Metrica <span class="hint">Second opinion, counts visitors who block Google</span></h3>
  <?php if (mp_has_data('yandex')): ?>
    <div class="grid g4" style="padding:14px 15px;margin-bottom:0">
      <?php
        ui_kpi('Visits', mp_num(mp_sum('yandex','visits',$f,$t)));
        ui_kpi('Users', mp_num(mp_sum('yandex','users',$f,$t)));
        ui_kpi('Page views', mp_num(mp_sum('yandex','pageviews',$f,$t)));
        ui_kpi('Average visit', mp_secs(mp_avg('yandex','avg_visit_seconds',$f,$t)));
      ?>
    </div>
    <p class="card__note">Usually slightly higher than GA4. A large gap is worth investigating,
       a small one is normal and simply means some visitors block Google scripts.</p>
  <?php else: ui_not_connected($conn,'yandex'); endif; ?>
</div>

<?php endif; ?>

<?php } /* end of the Google branch */ ?>
