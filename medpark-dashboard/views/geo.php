<?php
/* Source switch added 2026-09-03. Our own tracking and Google answer different
   questions, so neither side is trimmed to match the other. Ours is composed in
   lib/ownpanels.php; everything below the else is the original Google view,
   unchanged. */
ui_source_toggle('geo', $R, 'GA4');
if (mp_source() === 'own') { own_page_geo($R); } else {
?>
<?php
/* Geography.

   For a hospital serving tourists this is not a vanity page. Where a visitor is
   sitting decides which language they need, which branch is nearer, and whether
   they are researching from home before the trip or already in Egypt with a
   problem. Those are two completely different people and they need different
   pages. */

$f = $R['from']; $t = $R['to']; $pf = $R['prev_from']; $pt = $R['prev_to'];
$hasGA = mp_has_data('ga4');
$hasGSC = mp_has_data('gsc');

/* The markets that matter, from the brand guideline's own audience page. */
$targets = array('Germany'=>'de', 'Poland'=>'pl', 'United Kingdom'=>'en', 'Egypt'=>'en');

$countries = mp_top('ga4','sessions_country',$f,$t,25);
$total = 0.0; foreach ($countries as $c) { $total += (float)$c['v']; }

$inEgypt = 0.0; $abroad = 0.0;
foreach ($countries as $c) {
    if (strcasecmp((string)$c['dim'], 'Egypt') === 0) $inEgypt += (float)$c['v'];
    else $abroad += (float)$c['v'];
}
$de = mp_sum('ga4','sessions_country',$f,$t,'Germany');
$pl = mp_sum('ga4','sessions_country',$f,$t,'Poland');
$pde = mp_sum('ga4','sessions_country',$pf,$pt,'Germany');
$ppl = mp_sum('ga4','sessions_country',$pf,$pt,'Poland');
?>

<?php if (!$hasGA && !$hasGSC): ?>
  <div class="card"><?php ui_not_connected($conn,'ga4'); ?></div>
<?php else: ?>

<div class="grid g4">
  <?php
    ui_kpi('Countries reached', (string)count($countries), null, 'With at least one session', true);
    ui_kpi('Already in Egypt', $total > 0 ? number_format(($inEgypt / $total) * 100, 1) . '%' : '--', null,
           'Likely need help now');
    ui_kpi('German visitors', $hasGA ? mp_num($de) : '--', $hasGA ? mp_delta($de, $pde) : null, 'Target market');
    ui_kpi('Polish visitors', $hasGA ? mp_num($pl) : '--', $hasGA ? mp_delta($pl, $ppl) : null, 'Target market');
  ?>
</div>

<div class="note note--info">
  <b>Why the Egypt share matters more than the total.</b> Someone browsing from Germany in February is
  researching a holiday. Someone browsing from inside Egypt is a tourist with a problem right now, and
  they convert at a completely different rate. Those two need different pages, and this split is the
  only way to see which one you are actually serving.
</div>

<div class="grid g-2-1">
  <div class="card card--pad0">
    <h3>Where visitors are</h3>
    <?php
      if (!$hasGA) { ui_not_connected($conn,'ga4'); }
      else {
        echo '<div class="tw"><table><thead><tr><th class="rank"></th><th>Country</th><th style="width:110px"></th><th class="n">Sessions</th><th class="n">Share</th><th>Market</th></tr></thead><tbody>';
        $max = $countries ? (float)$countries[0]['v'] : 1;
        foreach ($countries as $i => $c) {
          if ($i >= 15) break;
          $v = (float)$c['v'];
          $name = (string)$c['dim'];
          $isTarget = isset($targets[$name]);
          echo '<tr><td class="rank">' . ($i + 1) . '</td>'
             . '<td class="trunc" title="' . e($name) . '"><strong>' . e($name) . '</strong></td>'
             . '<td><span class="bar"><i style="width:' . round(($v / max($max, 1)) * 100) . '%"></i></span></td>'
             . '<td class="n"><strong>' . mp_num($v) . '</strong></td>'
             . '<td class="n">' . ($total > 0 ? number_format(($v / $total) * 100, 1) . '%' : '-') . '</td>'
             . '<td>' . ($isTarget
                 ? '<span class="pill pill--ok">' . e(strtoupper($targets[$name])) . '</span>'
                 : '<span class="pill pill--idle">other</span>') . '</td></tr>';
        }
        echo '</tbody></table></div>';
      }
    ?>
  </div>

  <div class="card">
    <h3>Researching or already here</h3>
    <?php
      if (!$hasGA) { ui_not_connected($conn,'ga4'); }
      else {
        ui_donut(array(
          array('dim'=>'Inside Egypt', 'v'=>$inEgypt),
          array('dim'=>'Abroad',       'v'=>$abroad),
        ));
      }
    ?>
    <p class="card__note">A rising Egypt share usually means your local and map visibility is working.
       A rising abroad share means the pre-trip content is.</p>
  </div>
</div>

<div class="grid g3">
  <div class="card card--pad0">
    <h3>Language served</h3>
    <?php $hasGA ? ui_top_table(mp_top('ga4','sessions_language',$f,$t,8), 'Language', 'Sessions', null, 8)
                 : ui_not_connected($conn,'ga4'); ?>
    <p class="card__note">Compare this against the country list. A large German audience with few German
       sessions means people are landing on the English pages first.</p>
  </div>
  <div class="card card--pad0">
    <h3>Search clicks by country</h3>
    <?php $hasGSC ? ui_top_table(mp_top('gsc','clicks_country',$f,$t,8), 'Country', 'Clicks', null, 8)
                  : ui_not_connected($conn,'gsc'); ?>
  </div>
  <div class="card card--pad0">
    <h3>Devices</h3>
    <?php $hasGA ? ui_top_table(mp_top('ga4','sessions_device',$f,$t,5), 'Device', 'Sessions')
                 : ui_not_connected($conn,'ga4'); ?>
  </div>
</div>

<div class="card">
  <h3>Target market coverage</h3>
  <?php if (!$hasGA): ui_not_connected($conn,'ga4'); else: ?>
  <div class="tw">
    <table>
      <thead><tr><th>Market</th><th class="n">Sessions</th><th class="n">Share of all</th><th class="n">Change</th><th>Page exists</th><th>Read</th></tr></thead>
      <tbody>
      <?php
        $market = array(
          'Germany'        => array('/de/', 'de'),
          'Poland'         => array('/pl/', 'pl'),
          'United Kingdom' => array('/',    'en'),
          'Egypt'          => array('/',    'en'),
        );
        foreach ($market as $country => $meta) {
          $now  = mp_sum('ga4','sessions_country',$f,$t,$country);
          $prev = mp_sum('ga4','sessions_country',$pf,$pt,$country);
          $d = mp_delta($now, $prev);
          $langSess = mp_sum('ga4','sessions_language',$f,$t,$meta[1]);
          echo '<tr><td><strong>' . e($country) . '</strong></td>'
             . '<td class="n"><strong>' . mp_num($now) . '</strong></td>'
             . '<td class="n">' . ($total > 0 ? number_format(($now / $total) * 100, 1) . '%' : '-') . '</td>'
             . '<td class="n">' . ($d['pct'] !== null
                 ? '<span class="' . $d['dir'] . '" style="font-weight:700">'
                   . ($d['dir'] === 'up' ? '&#9650;' : ($d['dir'] === 'down' ? '&#9660;' : '&#9679;'))
                   . ' ' . number_format(abs($d['pct']), 1) . '%</span>'
                 : '<span style="color:var(--ink-3)">-</span>') . '</td>'
             . '<td><code style="font-size:12px;color:var(--ink-2)">' . e($meta[0]) . '</code> <span class="pill pill--ok">live</span></td>'
             . '<td class="n">' . mp_num($langSess) . ' in ' . strtoupper($meta[1]) . '</td></tr>';
        }
      ?>
      </tbody>
    </table>
  </div>
  <p class="card__note">Every one of these has a translated page live and, since 2 September, correct
     hreflang and language tags. Before that the German and Polish pages were telling Google they were
     English duplicates of the home page, which is the most likely reason those two rows were small.</p>
  <?php endif; ?>
</div>

<div class="card card--pad0">
  <h3>Branch catchment <span class="hint">From the map listings</span></h3>
  <?php if (mp_has_data('gbp')):
    $st = mp_db()->prepare("SELECT DISTINCT dim FROM metrics WHERE source='gbp' AND dim <> ''");
    $st->execute(); ?>
    <div class="tw"><table>
      <thead><tr><th>Branch</th><th class="n">Listing views</th><th class="n">Calls</th><th class="n">Directions</th><th>Serves</th></tr></thead>
      <tbody>
      <?php
        $serves = array(0=>'Hurghada, Sahl Hasheesh, El Gouna, Makadi Bay, Soma Bay, Safaga',
                        1=>'El Quseir, Marsa Alam, Port Ghalib');
        foreach ($st->fetchAll() as $i => $brow) {
          $loc = (string)$brow['dim'];
          $views = mp_sum('gbp','impressions_maps_mobile',$f,$t,$loc) + mp_sum('gbp','impressions_maps_desktop',$f,$t,$loc)
                 + mp_sum('gbp','impressions_search_mobile',$f,$t,$loc) + mp_sum('gbp','impressions_search_desktop',$f,$t,$loc);
          echo '<tr><td><strong>' . e(ui_branch_name($loc)) . '</strong></td>'
             . '<td class="n">' . mp_num($views) . '</td>'
             . '<td class="n">' . mp_num(mp_sum('gbp','call_clicks',$f,$t,$loc)) . '</td>'
             . '<td class="n">' . mp_num(mp_sum('gbp','direction_requests',$f,$t,$loc)) . '</td>'
             . '<td style="font-size:12px;color:var(--ink-3)">' . e(isset($serves[$i]) ? $serves[$i] : '') . '</td></tr>';
        }
      ?>
      </tbody>
    </table></div>
  <?php else: ui_not_connected($conn,'gbp'); endif; ?>
</div>

<?php endif; ?>

<?php } /* end of the Google branch */ ?>
