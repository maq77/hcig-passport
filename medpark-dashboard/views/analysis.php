<?php
/* ==========================================================================
   Analysis.

   Added 2026-09-03, over our own first-party data rather than Google's.

   The organising idea is that visits are not the point. Every table on this
   page puts enquiries next to whatever it is counting, because "which
   visitors turn into patients" is the only question worth a page of charts.

   Numbers to the point, charts rather than paragraphs, and every explanation
   in a tooltip so it is available without being in the way.
   ========================================================================== */

$f = $R['from']; $t = $R['to']; $pf = $R['prev_from']; $pt = $R['prev_to'];

$K = mpa_kpis($f, $t);
$P = mpa_kpis($pf, $pt);
$has = mpa_has_data($f, $t);

$geoOn  = function_exists('mpa_geo_ready') && mpa_geo_ready();
$geoAge = $geoOn ? mpa_geo_age() : null;

$lastRun = mp_db()->query("SELECT ran_at, pageviews, events, bots FROM a_runs ORDER BY id DESC LIMIT 1")->fetch();

$mins = function (float $seconds): string {
    if ($seconds <= 0) return '--';
    if ($seconds < 60) return round($seconds) . 's';
    return floor($seconds / 60) . 'm ' . str_pad((string)round(fmod($seconds, 60)), 2, '0', STR_PAD_LEFT) . 's';
};
$pathLabel = function (string $p): string { return $p === '/' ? '/ (home)' : $p; };
?>

<!-- ---------- state of collection ---------------------------------------- -->
<div class="qa" role="group" aria-label="Collection status">
  <span class="qa__btn" title="Our own tracking, on our own server. Nothing here comes from Google.">
    <?php echo ui_icon('pulse', 15); ?>
    <?php /* Period-scoped wording on purpose. A date range ends yesterday, so
             on a site that only started collecting today this said "no visits
             recorded yet" directly beside a tile reading nine visits today. */
          echo $has ? 'Collecting' : 'No visits in the selected period'; ?>
  </span>
  <span class="qa__btn" title="Country and city come from a MaxMind database held on this server. No address is ever sent anywhere.">
    <?php echo ui_icon('globe', 15); ?>
    <?php
      if (!$geoOn) echo 'Geography not installed';
      elseif ($geoAge !== null && $geoAge > 40) echo 'Geography ' . (int)$geoAge . ' days old';
      else echo 'Geography ready';
    ?>
  </span>
  <span class="qa__btn" title="The collector writes to a file and the dashboard imports it every five minutes. The website itself never waits for the database.">
    <?php echo ui_icon('inbox', 15); ?>
    <?php
      if (!$lastRun) echo 'Import has not run yet';
      else echo 'Imported ' . e(str_replace('T', ' ', substr((string)$lastRun['ran_at'], 0, 16))) . ' UTC';
    ?>
  </span>
  <a class="qa__btn" href="#findings" title="Written from the numbers on this page.">
    <?php echo ui_icon('alert', 15); ?> What to fix
  </a>
</div>

<?php
/* ---------- right now ---------------------------------------------------
   Deliberately above the "no data yet" branch, so it shows from the first
   visit rather than waiting for a complete day. Read from the raw tables by
   timestamp, and the dashboard drains the spool when it loads, so these are
   seconds behind rather than minutes.

   "Active" is visitors seen in the last five minutes. No analytics can
   honestly say who is on the site now, because a browser never announces
   that somebody left. This is the nearest honest version. */
$L = mpa_today();
$waiting = mpa_spool_waiting();
?>
<div class="grid g4">
  <?php
    ui_stat('live_active', (string)$L['active_5'],
            null, array(), true, 'last 5 minutes', 'var(--c2)');
    ui_stat('live_today_visits', mp_num($L['sessions']),
            null, array(), false, 'since midnight UTC');
    ui_stat('live_today_visitors', mp_num($L['visitors']),
            null, array(), false, $L['new_visitors'] . ' new today');
    ui_stat('live_today_enquiries', mp_num($L['conversions']),
            null, array(), true,
            $L['sessions'] > 0 ? $L['conversion_rate'] . '% of visits' : 'none yet',
            'var(--c2)');
  ?>
</div>

<div class="grid g-2-1">
  <div class="card card--pad0">
    <h3>Today, hour by hour <span class="hint">UTC</span></h3>
    <?php
      if (count($L['by_hour']) > 1) {
          $rows = array();
          foreach ($L['by_hour'] as $h) {
              $rows[] = array('day' => str_pad((string)$h['hour'], 2, '0', STR_PAD_LEFT) . ':00',
                              'v' => (float)$h['n']);
          }
          ui_line(array(array('name' => 'Visits', 'rows' => $rows)), 'chart chart--sm');
      } else {
          ui_empty('Too early in the day',
                   'A shape needs visits in more than one hour. Fills in on its own.', 'pulse');
      }
    ?>
  </div>
  <div class="card card--pad0">
    <h3>Being read now <span class="hint">last 30 minutes</span></h3>
    <?php
      $ap = mpa_active_pages(30, 6);
      if ($ap) ui_hbars($ap, 6, 'var(--c2)');
      else ui_empty('Nobody on the site', 'In the last thirty minutes.', 'pulse');
    ?>
  </div>
</div>

<div class="card card--pad0">
  <h3>Last thing that happened
      <span class="hint">newest first, the quickest way to see the tracker is alive</span></h3>
  <?php
    $rec = mpa_recent_events(12);
    if (!$rec) {
        ui_empty('No events recorded yet',
                 $waiting > 0
                   ? number_format($waiting) . ' bytes are waiting in the spool and will import within five minutes.'
                   : 'Open the website in another tab, click the phone or WhatsApp button, then close the tab. It appears here within seconds.',
                 'pulse');
    } else {
        echo '<div class="tw"><table><thead><tr><th>When</th><th>What</th><th>Detail</th>'
           . '<th>Page</th><th>Where</th><th></th></tr></thead><tbody>';
        foreach ($rec as $r) {
            $ago = max(0, time() - (int)$r['ts']);
            $when = $ago < 90 ? $ago . 's ago'
                  : ($ago < 5400 ? round($ago / 60) . 'm ago' : round($ago / 3600) . 'h ago');
            $where = trim(($r['country'] !== '' ? mpa_country_name((string)$r['country']) : '') . ' '
                        . ($r['device'] !== '' ? '(' . $r['device'] . ')' : ''));
            echo '<tr><td class="muted">' . e($when) . '</td>'
               . '<td><strong>' . e(str_replace('_', ' ', (string)$r['name'])) . '</strong></td>'
               . '<td class="trunc">' . e($r['label'] !== '' ? $r['label'] : '-') . '</td>'
               . '<td class="trunc muted">' . e($pathLabel((string)$r['path'])) . '</td>'
               . '<td class="muted">' . e($where !== '' ? $where : '-') . '</td>'
               /* Straight into the whole visit this line came from. */
               . '<td class="n"><a class="btn btn--sm" href="?p=visits&amp;r=' . e($R['preset'])
               . '&amp;sid=' . e((string)$r['sid']) . '">Visit</a></td></tr>';
        }
        echo '</tbody></table></div>';
    }
  ?>
</div>

<?php if (!$has): ?>
  <div class="card">
    <h3>Nothing collected for this period yet</h3>
    <?php if ($L['sessions'] > 0): ?>
      <p class="muted" style="max-width:70ch">
        There <?php echo $L['sessions'] === 1 ? 'is' : 'are'; ?>
        <strong><?php echo e(mp_num($L['sessions'])); ?></strong>
        <?php echo $L['sessions'] === 1 ? 'visit' : 'visits'; ?> today, shown in the panels above.
        The date ranges end yesterday, so today's visits appear here tomorrow.
      </p>
    <?php endif; ?>
    <p class="muted" style="max-width:70ch">
      This page fills itself in. The collector runs on every page of the website and writes to a
      file; the dashboard imports that file every five minutes and builds everything below from it.
      Nothing here depends on Google, and nothing here can be blocked by an ad blocker.
    </p>
    <p class="muted" style="max-width:70ch">
      If the site is live and this is still empty after ten minutes, check that
      <code>js/mp-analytics.js</code> is loading on the page and that the five minute cron for
      <code>import.php</code> is installed.
    </p>
  </div>
<?php else: ?>

<!-- ---------- the headline set ------------------------------------------- -->
<div class="grid g4">
  <?php
    ui_stat('sessions', mp_num($K['sessions']), mp_delta($K['sessions'], $P['sessions']),
            mpa_series('sessions', $f, $t), true);
    ui_stat('own_visitors', mp_num($K['visitors']), mp_delta($K['visitors'], $P['visitors']),
            mpa_series('visitors', $f, $t));
    ui_stat('own_conversions', mp_num($K['conversions']), mp_delta($K['conversions'], $P['conversions']),
            mpa_series('conversions', $f, $t), true, '', 'var(--c2)');
    ui_stat('own_conv_rate', $K['conversion_rate'] . '%',
            mp_delta($K['conversion_rate'], $P['conversion_rate']), array(), false, '', 'var(--c2)');
  ?>
</div>

<div class="grid g4">
  <?php
    ui_stat('own_pageviews', mp_num($K['pageviews']), mp_delta($K['pageviews'], $P['pageviews']),
            mpa_series('pageviews', $f, $t));
    ui_stat('own_engaged', $mins($K['avg_engaged']), mp_delta($K['avg_engaged'], $P['avg_engaged']));
    ui_stat('own_pages_per', (string)$K['pages_per_session'],
            mp_delta($K['pages_per_session'], $P['pages_per_session']));
    ui_stat('own_bounce', $K['bounce_rate'] . '%', mp_delta($P['bounce_rate'], $K['bounce_rate']));
  ?>
</div>

<!-- ---------- arriving to enquiring --------------------------------------- -->
<div class="grid g-2-1">
  <div class="card">
    <h3>Visits and enquiries <span class="hint">same scale, so the gap is visible</span></h3>
    <?php
      $sS = mpa_series('sessions', $f, $t);
      $sC = mpa_series('conversions', $f, $t);
      if (count($sS) > 1) {
          ui_line(array(array('name' => 'Visits', 'rows' => $sS),
                        array('name' => 'Enquiries', 'rows' => $sC)));
      } else {
          ui_empty('Not enough days yet', 'A trend needs two days of collection.', 'pulse');
      }
    ?>
  </div>
  <div class="card card--pad0">
    <h3>Arriving to enquiring <span class="hint">real visits at each step</span></h3>
    <?php
      $fun = mpa_funnel($f, $t);
      $top = max(1, (int)$fun[0]['n']);
      echo '<div class="hb">';
      foreach ($fun as $i => $s) {
          $pct  = ((int)$s['n'] / $top) * 100;
          $drop = $i > 0 && (int)$fun[$i - 1]['n'] > 0
                ? round((1 - (int)$s['n'] / (int)$fun[$i - 1]['n']) * 100) : 0;
          echo '<div class="hb__r" title="' . e($s['step'] . ': ' . mp_num($s['n']) . ' visits'
             . ($i > 0 ? ', ' . $drop . '% lost at this step' : '')) . '">'
             . '<span class="hb__l">' . e($s['step']) . '</span>'
             . '<span class="hb__t"><i style="width:' . round($pct) . '%;background:var(--c'
             . ($i + 1) . ')"></i></span>'
             . '<b class="hb__v">' . e(mp_num($s['n'])) . '</b></div>';
      }
      echo '</div>';
    ?>
  </div>
</div>

<!-- ---------- where they come from ---------------------------------------- -->
<div class="grid g3">
  <div class="card card--pad0">
    <h3>How they arrived</h3>
    <?php ui_hbars(mpa_top('by_ref_type', $f, $t, 7), 7); ?>
  </div>
  <div class="card card--pad0">
    <h3>Which source</h3>
    <?php ui_hbars(mpa_top('by_source', $f, $t, 7), 7, 'var(--c2)'); ?>
  </div>
  <div class="card card--pad0">
    <h3>Country</h3>
    <?php
      if (!$geoOn) {
          ui_empty('Geography not installed yet',
                   'Add the MaxMind licence key in Settings and run tools/geoip-update.sh once.', 'globe');
      } else {
          $rows = mpa_top('by_country', $f, $t, 7);
          foreach ($rows as &$r) { $r['dim'] = mpa_country_name((string)$r['dim']); }
          unset($r);
          ui_hbars($rows, 7, 'var(--c3)');
      }
    ?>
  </div>
</div>

<!-- ---------- which visitors are worth having ----------------------------- -->
<div class="card card--pad0">
  <h3>Which visitors turn into enquiries
      <span class="hint">the rate matters more than the count</span></h3>
  <?php
    $segs = array('ref_type' => 'Channel', 'country' => 'Country', 'device' => 'Device', 'lang' => 'Language');
    $rows = array();
    foreach ($segs as $col => $head) {
        foreach (mpa_segment($col, $f, $t, 5) as $s) {
            if ((int)$s['n'] < 5) continue;
            $label = ($col === 'country') ? mpa_country_name((string)$s['dim']) : (string)$s['dim'];
            $rows[] = array('group' => $head, 'label' => $label, 'n' => (int)$s['n'],
                            'conv' => (int)$s['conv'], 'rate' => (float)$s['rate'],
                            'time' => (float)$s['avg_time']);
        }
    }
    if (!$rows) {
        ui_empty('Not enough visits yet', 'Fills in once there are a few days of traffic.', 'users');
    } else {
        $best = 0.0;
        foreach ($rows as $r) $best = max($best, $r['rate']);
        echo '<div class="tw"><table><thead><tr><th>Group</th><th>Segment</th>'
           . '<th class="n">Visits</th><th class="n">Enquiries</th>'
           . '<th style="width:110px"></th><th class="n">Rate</th>'
           . '<th class="n">Time on site</th></tr></thead><tbody>';
        foreach ($rows as $r) {
            $w = $best > 0 ? ($r['rate'] / $best) * 100 : 0;
            /* Below half the site average is the line the findings use, so the
               table marks the same thing rather than a different one. */
            $poor = $K['conversion_rate'] > 0 && $r['rate'] < $K['conversion_rate'] * 0.5 && $r['n'] >= 30;
            echo '<tr><td class="muted">' . e($r['group']) . '</td>'
               . '<td class="trunc" title="' . e($r['label']) . '"><strong>' . e($r['label']) . '</strong></td>'
               . '<td class="n">' . e(mp_num($r['n'])) . '</td>'
               . '<td class="n">' . e(mp_num($r['conv'])) . '</td>'
               . '<td><span class="bar"><i style="width:' . round($w) . '%"></i></span></td>'
               . '<td class="n"><strong' . ($poor ? ' class="down"' : '') . '>'
               . e(number_format($r['rate'], 1)) . '%</strong></td>'
               . '<td class="n muted">' . e($mins($r['time'])) . '</td></tr>';
        }
        echo '</tbody></table></div>';
    }
  ?>
</div>

<!-- ---------- pages, judged by what they produce -------------------------- -->
<div class="card card--pad0">
  <h3>Pages <span class="hint">views are vanity, the last column is not</span></h3>
  <?php
    $pageRows = mpa_pages($f, $t, 15);
    if (!$pageRows) {
        ui_empty('No pages recorded yet', 'Fills in on the next import.', 'pulse');
    } else {
        echo '<div class="tw"><table><thead><tr><th>Page</th><th class="n">Views</th>'
           . '<th class="n">Time on page</th><th class="n">Read to</th>'
           . '<th class="n">Left from here</th><th class="n">Enquiries</th></tr></thead><tbody>';
        foreach ($pageRows as $p) {
            $exitPct = (float)$p['views'] > 0 ? round((float)$p['exits'] / (float)$p['views'] * 100) : 0;
            $dead = (int)$p['enquiries'] === 0 && (float)$p['views'] >= 40;
            /* The page name opens every visit that touched it. A number in a
               table raises a question; this is where the answer is. */
            echo '<tr><td class="trunc" title="' . e($p['path']) . '">'
               . '<a href="?p=visits&amp;r=' . e($R['preset']) . '&amp;path=' . e(rawurlencode((string)$p['path'])) . '">'
               . e($pathLabel((string)$p['path'])) . '</a></td>'
               . '<td class="n">' . e(mp_num($p['views'])) . '</td>'
               . '<td class="n">' . e($mins((float)$p['avg_time'])) . '</td>'
               . '<td class="n">' . e(round((float)$p['avg_scroll'])) . '%</td>'
               . '<td class="n muted">' . $exitPct . '%</td>'
               . '<td class="n"><strong' . ($dead ? ' class="down"' : '') . '>'
               . e(mp_num($p['enquiries'])) . '</strong></td></tr>';
        }
        echo '</tbody></table></div>';
    }
  ?>
</div>

<!-- ---------- what they did ----------------------------------------------- -->
<div class="grid g-2-1">
  <div class="card card--pad0">
    <h3>Where they went next <span class="hint">the second page tells you what they came for</span></h3>
    <?php
      $j = mpa_journeys($f, $t, 8);
      if (!$j) {
          ui_empty('No journeys yet', 'Needs visits that open more than one page.', 'pulse');
      } else {
          echo '<div class="tw"><table><thead><tr><th>From</th><th>To</th>'
             . '<th class="n">Visits</th></tr></thead><tbody>';
          foreach ($j as $r) {
              echo '<tr><td class="trunc muted" title="' . e($r['came_from']) . '">'
                 . e($pathLabel((string)$r['came_from'])) . '</td>'
                 . '<td class="trunc" title="' . e($r['went_to']) . '"><strong>'
                 . e($pathLabel((string)$r['went_to'])) . '</strong></td>'
                 . '<td class="n">' . e(mp_num($r['n'])) . '</td></tr>';
          }
          echo '</tbody></table></div>';
      }
    ?>
  </div>
  <div class="card card--pad0">
    <h3>How they got in touch</h3>
    <?php
      ui_stack(array(
        array('dim' => 'Phone',     'v' => mpa_val('by_event', $f, $t, 'call_click')),
        array('dim' => 'WhatsApp',  'v' => mpa_val('by_event', $f, $t, 'whatsapp_click')),
        array('dim' => 'Form',      'v' => mpa_val('by_event', $f, $t, 'enquiry_submit')),
        array('dim' => 'Email',     'v' => mpa_val('by_event', $f, $t, 'email_click')),
        array('dim' => 'Assistant', 'v' => mpa_val('by_event', $f, $t, 'chat_lead')),
      ));
    ?>
    <h3 style="margin-top:18px">Device</h3>
    <?php ui_hbars(mpa_top('by_device', $f, $t, 3), 3, 'var(--c4)'); ?>
  </div>
</div>

<!-- ---------- sections, and the things nobody reports --------------------- -->
<div class="grid g-2-1">
  <div class="card card--pad0">
    <h3>Which parts of the pages get read
        <span class="hint">seconds visible, not merely scrolled past</span></h3>
    <?php
      $sec = mpa_sections($f, $t, '', 10);
      if (!$sec) {
          ui_empty('No sections recorded yet',
                   'Sections are detected automatically. Fills in on the next import.', 'pulse');
      } else {
          $rows = array();
          foreach ($sec as $s) {
              $rows[] = array('dim' => $s['dim'] . '  (' . round((float)$s['avg_seconds']) . 's)',
                              'v' => (float)$s['seen']);
          }
          ui_hbars($rows, 10, 'var(--c5)');
      }
    ?>
  </div>
  <div class="card card--pad0">
    <h3>Signs of trouble <span class="hint">nobody reports these</span></h3>
    <?php
      $trouble = array(
        array('dim' => 'Rage clicks',      'v' => mpa_val('by_event', $f, $t, 'rage_click')),
        array('dim' => 'Dead clicks',      'v' => mpa_val('by_event', $f, $t, 'dead_click')),
        array('dim' => 'Forms abandoned',  'v' => mpa_val('by_event', $f, $t, 'form_abandon')),
        array('dim' => 'Script errors',    'v' => mpa_val('by_event', $f, $t, 'js_error')),
      );
      $any = false;
      foreach ($trouble as $x) if ($x['v'] > 0) $any = true;
      if ($any) ui_hbars($trouble, 4, 'var(--c6)');
      else ui_empty('Nothing recorded', 'No rage clicks, dead clicks, abandoned forms or script errors.', 'pulse');
    ?>
  </div>
</div>

<!-- ---------- every event, grouped ---------------------------------------- -->
<div class="card card--pad0">
  <h3>Everything measured <span class="hint">every event this period</span></h3>
  <?php
    $byCat = mpa_events_by_category($f, $t);
    if (!$byCat) {
        ui_empty('No events yet', 'Fills in on the next import.', 'pulse');
    } else {
        echo '<div class="tw"><table><thead><tr><th>Group</th><th>Event</th>'
           . '<th style="width:140px"></th><th class="n">Count</th></tr></thead><tbody>';
        $max = 0.0;
        foreach ($byCat as $rows) foreach ($rows as $r) $max = max($max, (float)$r['n']);
        if ($max <= 0) $max = 1;
        foreach ($byCat as $cat => $rows) {
            foreach ($rows as $i => $r) {
                echo '<tr><td class="muted">' . ($i === 0 ? e(ucfirst((string)$cat)) : '') . '</td>'
                   . '<td>' . e(str_replace('_', ' ', (string)$r['name'])) . '</td>'
                   . '<td><span class="bar"><i style="width:' . round((float)$r['n'] / $max * 100) . '%"></i></span></td>'
                   . '<td class="n"><strong>' . e(mp_num($r['n'])) . '</strong></td></tr>';
            }
        }
        echo '</tbody></table></div>';
    }
  ?>
</div>

<!-- ---------- findings ----------------------------------------------------- -->
<div class="card card--pad0" id="findings">
  <h3>What to fix <span class="hint">written from the numbers above</span></h3>
  <?php
    $found = mpa_findings($f, $t);
    if (!$found) {
        ui_empty('Nothing worth flagging yet',
                 'Findings need about forty visits before they mean anything. '
               . 'A rule that fires on fifteen visits trains people to ignore the page.', 'pulse');
    } else {
        echo '<div class="tw"><table><thead><tr><th></th><th>Finding</th>'
           . '<th>Do</th><th>Expect</th></tr></thead><tbody>';
        foreach ($found as $r) {
            $badge = $r['severity'] === 'high' ? 'Priority'
                   : ($r['severity'] === 'medium' ? 'Important' : 'Working');
            /* The stylesheet defines ok, off, wait, info and idle. Mapping here
               rather than inventing new class names keeps one source of colour. */
            $cls = $r['severity'] === 'high' ? 'off' : ($r['severity'] === 'medium' ? 'wait' : 'ok');
            echo '<tr><td><span class="pill pill--' . $cls . '">' . e($badge) . '</span></td>'
               . '<td><strong>' . e($r['finding']) . '</strong>'
               . '<div class="muted" style="font-size:12.5px;margin-top:3px">' . e($r['evidence']) . '</div></td>'
               . '<td>' . e($r['do']) . '</td>'
               . '<td class="muted">' . e($r['expect']) . '</td></tr>';
        }
        echo '</tbody></table></div>';
    }
  ?>
</div>

<p class="muted" style="font-size:12.5px;margin-top:14px;max-width:80ch">
  Collected on this server, not by Google. No address is stored, and by default nothing at all is
  written to a visitor's device. Numbers here will read higher than Google Analytics, because a
  first-party script is not blocked the way a Google tag is.
</p>

<?php endif; ?>
