<?php
/* ==========================================================================
   WhatsApp.

   Added 2026-09-03. This is the channel the business actually runs on, and
   until now it was one row in a table on the Analysis page.

   Nothing new is collected for it. Every number here comes from event rows
   that were already arriving, which is why the page could be built in an
   afternoon: the tracker has been recording the page, the placement, the
   country, the device and the language of every tap since it went live.

   The one thing this page is careful about: a tap is a tap. Whether WhatsApp
   opened, whether a message was written, and whether anybody replied all
   happen off the website, where no analytics can follow. That is said on the
   page rather than quietly implied to be a conversation.
   ========================================================================== */

$f = $R['from']; $t = $R['to']; $pf = $R['prev_from']; $pt = $R['prev_to'];

$EV  = 'whatsapp_click';
$LAB = 'WhatsApp';

$K = mpa_kpis($f, $t);
$P = mpa_kpis($pf, $pt);

$taps       = mpa_ev_count($EV, $f, $t);
$tapsPrev   = mpa_ev_count($EV, $pf, $pt);
$tapVisits  = mpa_ev_visits($EV, $f, $t);
$tapVisPrev = mpa_ev_visits($EV, $pf, $pt);

/* Every way of getting in touch, counted the same way as the taps, so the
   share below is a like for like number rather than two systems compared. */
$mix = array();
foreach (array('whatsapp_click' => 'WhatsApp', 'call_click' => 'Phone',
               'enquiry_submit' => 'Form', 'email_click' => 'Email',
               'chat_lead' => 'Assistant') as $ev => $lab) {
    $mix[] = array('dim' => $lab, 'v' => (float)mpa_ev_count($ev, $f, $t));
}
$allContacts = 0.0;
foreach ($mix as $m) $allContacts += $m['v'];

$rate      = $K['sessions'] > 0 ? round($tapVisits / $K['sessions'] * 100, 2) : 0.0;
$ratePrev  = $P['sessions'] > 0 ? round($tapVisPrev / $P['sessions'] * 100, 2) : 0.0;
$share     = $allContacts > 0 ? round($taps / $allContacts * 100, 1) : 0.0;

$mins = function (float $seconds): string {
    if ($seconds <= 0) return '--';
    if ($seconds < 60) return round($seconds) . 's';
    return floor($seconds / 60) . 'm ' . str_pad((string)round(fmod($seconds, 60)), 2, '0', STR_PAD_LEFT) . 's';
};
$pathLabel = function (string $p): string { return $p === '/' ? '/ (home)' : $p; };
$langLabel = function (string $l): string { return mpa_lang_label($l); };
/* One translation of the tracker's placement words, shared with the findings,
   so a table and the sentence underneath it can never disagree. */
$placeLabel = function (string $p): string { return ucfirst(mpa_placement_label($p)); };
?>

<div class="qa" role="group" aria-label="What this page counts">
  <span class="qa__btn" title="Every tap on a WhatsApp link anywhere on the website, in any language. Counted on our own server, so an ad blocker cannot hide one.">
    <?php echo ui_icon('bubble', 15); ?>
    <?php echo mp_num($taps); ?> taps counted
  </span>
  <span class="qa__btn" title="A tap opens WhatsApp on the visitor's own device. What happens after that is outside the website and cannot be measured from here. This page never calls a tap a conversation.">
    <?php echo ui_icon('alert', 15); ?> A tap is not yet a reply
  </span>
  <a class="qa__btn" href="#wa-findings" title="Written from the numbers on this page.">
    <?php echo ui_icon('alert', 15); ?> What to fix
  </a>
</div>

<?php if ($taps === 0): ?>

  <div class="card">
    <h3>No <?php echo e($LAB); ?> taps in this period</h3>
    <?php if (!mpa_has_data($f, $t)): ?>
      <p class="muted" style="max-width:70ch">
        Nothing at all has been collected for these dates yet. This page fills itself in from the
        same tracking as every other page here. If the site is live and this is still empty after
        ten minutes, check that <code>js/mp-analytics.js</code> loads on the page and that the five
        minute cron for <code>import.php</code> is installed.
      </p>
    <?php else: ?>
      <p class="muted" style="max-width:70ch">
        There were <?php echo e(mp_num($K['sessions'])); ?> visits in this period and none of them
        tapped a WhatsApp link. That is worth checking on a phone before believing it: the floating
        button is the control most taps come from, and if it is hidden behind something else on
        mobile this page is the only place that would ever show it.
      </p>
    <?php endif; ?>
  </div>

<?php else: ?>

<div class="grid g4">
  <?php
    ui_stat('wa_taps', mp_num($taps), mp_delta($taps, $tapsPrev),
            mpa_ev_daily($EV, $f, $t), true, '', 'var(--c2)');
    ui_stat('wa_visits', mp_num($tapVisits), mp_delta($tapVisits, $tapVisPrev),
            array(), false, $taps > $tapVisits ? 'some tapped more than once' : '');
    ui_stat('wa_rate', $rate . '%', mp_delta($rate, $ratePrev), array(), true,
            'of ' . mp_num($K['sessions']) . ' visits', 'var(--c2)');
    ui_stat('wa_share', $share . '%', null, array(), false,
            'of ' . mp_num($allContacts) . ' enquiries');
  ?>
</div>

<div class="grid g-2-1">
  <div class="card">
    <h3><?php echo e($LAB); ?> taps by day
        <span class="hint">against every other way of getting in touch</span></h3>
    <?php
      $sWa  = mpa_ev_daily($EV, $f, $t);
      $sAll = mpa_ev_daily('call_click', $f, $t);
      if (count($sWa) > 1) {
          ui_line(array(array('name' => 'WhatsApp', 'rows' => $sWa),
                        array('name' => 'Phone calls', 'rows' => $sAll)));
      } else {
          ui_empty('Not enough days yet', 'A trend needs taps on more than one day.', 'pulse');
      }
    ?>
  </div>
  <div class="card card--pad0">
    <h3>Share of all enquiries</h3>
    <?php ui_stack($mix); ?>
    <h3 style="margin-top:18px">Device</h3>
    <?php ui_hbars(mpa_ev_by($EV, 'device', $f, $t, 3), 3, 'var(--c2)'); ?>
  </div>
</div>

<!-- ---------- which control, which country, which language ---------------- -->
<div class="grid g3">
  <div class="card card--pad0">
    <h3>Which button they tap
        <span class="hint">the header one and the floating one are different questions</span></h3>
    <?php
      $pl = mpa_ev_by($EV, 'placement', $f, $t, 7);
      foreach ($pl as &$r) { $r['dim'] = $placeLabel((string)$r['dim']); }
      unset($r);
      ui_hbars($pl, 7);
    ?>
  </div>
  <div class="card card--pad0">
    <h3>Country</h3>
    <?php
      $ct = mpa_ev_by($EV, 'country', $f, $t, 7);
      foreach ($ct as &$r) { $r['dim'] = mpa_country_name((string)$r['dim']); }
      unset($r);
      if ($ct) ui_hbars($ct, 7, 'var(--c3)');
      else ui_empty('No country recorded', 'Geography needs the MaxMind database installed.', 'globe');
    ?>
  </div>
  <div class="card card--pad0">
    <h3>Language of the page</h3>
    <?php
      $lg = mpa_ev_by($EV, 'lang', $f, $t, 7);
      foreach ($lg as &$r) { $r['dim'] = $langLabel((string)$r['dim']); }
      unset($r);
      ui_hbars($lg, 7, 'var(--c4)');
    ?>
  </div>
</div>

<!-- ---------- the page the tap came from ---------------------------------- -->
<div class="card card--pad0">
  <h3>Which page they were on
      <span class="hint">taps per hundred views says which page works, not which is busiest</span></h3>
  <?php
    $rows = mpa_ev_pages($EV, $f, $t, 14, 'taps');
    $hasTaps = false;
    foreach ($rows as $r) if ((int)$r['taps'] > 0) $hasTaps = true;
    if (!$hasTaps) {
        ui_empty('No page recorded yet', 'Fills in on the next import.', 'pulse');
    } else {
        $best = 0.0;
        foreach ($rows as $r) {
            if ((float)$r['views'] > 0) $best = max($best, (float)$r['taps'] / (float)$r['views'] * 100);
        }
        echo '<div class="tw"><table><thead><tr><th>Page</th><th class="n">Views</th>'
           . '<th class="n">Taps</th><th style="width:110px"></th>'
           . '<th class="n">Per 100 views</th></tr></thead><tbody>';
        foreach ($rows as $r) {
            $per  = (float)$r['views'] > 0 ? (float)$r['taps'] / (float)$r['views'] * 100 : 0.0;
            $w    = $best > 0 ? $per / $best * 100 : 0;
            /* A busy page with nothing is the finding the whole page exists for,
               so it is marked here in the same colour the findings use. */
            $dead = (int)$r['taps'] === 0 && (float)$r['views'] >= 40;
            echo '<tr><td class="trunc" title="' . e($r['path']) . '">'
               . e($pathLabel((string)$r['path'])) . '</td>'
               . '<td class="n muted">' . e(mp_num($r['views'])) . '</td>'
               . '<td class="n"><strong' . ($dead ? ' class="down"' : '') . '>'
               . e(mp_num($r['taps'])) . '</strong></td>'
               . '<td><span class="bar"><i style="width:' . round($w) . '%"></i></span></td>'
               . '<td class="n">' . e(number_format($per, 1)) . '</td></tr>';
        }
        echo '</tbody></table></div>';
    }
  ?>
</div>

<!-- ---------- what brought them, and what they did first ------------------ -->
<div class="grid g-2-1">
  <div class="card card--pad0">
    <h3>What brought the people who tapped
        <span class="hint">counted in visits, since a channel brings a person once</span></h3>
    <?php
      $ch = mpa_ev_by_session($EV, 'ref_type', $f, $t, 7);
      foreach ($ch as &$r) { $r['dim'] = mpa_channel_label((string)$r['dim']); }
      unset($r);
      if ($ch) ui_hbars($ch, 7, 'var(--c5)');
      else ui_empty('No channel recorded yet', 'Fills in on the next import.', 'pulse');
    ?>
    <h3 style="margin-top:18px">The page they landed on first</h3>
    <?php
      $en = mpa_ev_by_session($EV, 'entry_path', $f, $t, 6);
      foreach ($en as &$r) { $r['dim'] = $pathLabel((string)$r['dim']); }
      unset($r);
      ui_hbars($en, 6, 'var(--c6)');
    ?>
  </div>
  <div class="card card--pad0">
    <h3>Before the tap <span class="hint">how much convincing it took</span></h3>
    <?php
      $tm = mpa_ev_timing($EV, $f, $t);
      echo '<div class="hb">';
      foreach (array(
        array('Time into the visit', $mins($tm['seconds']),
              'Seconds between the visit starting and the tap. A small number means they arrived ready.'),
        array('Pages in that visit', number_format($tm['pages'], 1),
              'How many pages those visits opened. One page means the answer was found straight away.'),
        array('First time here', $tm['new_pct'] . '%',
              'The share of taps that came from somebody on their first visit.'),
      ) as $row) {
          /* No bar track on these three. There is no scale a time, a page count
             and a percentage could honestly share, and an empty track reads as
             a bar sitting at zero. */
          echo '<div class="hb__r" title="' . e($row[2]) . '">'
             . '<span class="hb__l">' . e($row[0]) . '</span>'
             . '<span></span>'
             . '<b class="hb__v">' . e($row[1]) . '</b></div>';
      }
      echo '</div>';
    ?>
  </div>
</div>

<!-- ---------- when the line gets used ------------------------------------- -->
<div class="card">
  <h3>When they message <span class="hint">day of the week against hour, UTC</span></h3>
  <?php
    $when = mpa_ev_when($EV, $f, $t);
    if (!$when) {
        ui_empty('Nothing to plot yet', 'Fills in as taps arrive.', 'heat');
    } else {
        $days  = array(1 => 'Monday', 2 => 'Tuesday', 3 => 'Wednesday', 4 => 'Thursday',
                       5 => 'Friday', 6 => 'Saturday', 0 => 'Sunday');
        $cols  = array();
        for ($h = 0; $h < 24; $h++) $cols[] = str_pad((string)$h, 2, '0', STR_PAD_LEFT);
        $cells = array();
        foreach ($days as $i => $label) {
            $cells[$label] = array();
            foreach ($cols as $c) $cells[$label][$c] = 0;
        }
        foreach ($when as $w) {
            $d = $days[(int)$w['dow']] ?? null;
            if ($d === null) continue;
            $cells[$d][str_pad((string)(int)$w['hour'], 2, '0', STR_PAD_LEFT)] = (float)$w['n'];
        }
        ui_heat($cells, $cols, 'taps');
        echo '<p class="muted" style="font-size:12.5px;margin:10px 0 0;max-width:80ch">'
           . 'Hours are UTC. Egypt runs two hours ahead of that, so a message at 22:00 here '
           . 'was sent at midnight local time.</p>';
    }
  ?>
</div>

<!-- ---------- the last few ------------------------------------------------ -->
<div class="card card--pad0">
  <h3>The last taps <span class="hint">newest first</span></h3>
  <?php
    $recent = mpa_ev_recent($EV, 12);
    if (!$recent) {
        ui_empty('Nothing recorded yet', 'Fills in on the next import.', 'pulse');
    } else {
        echo '<div class="tw"><table><thead><tr><th>When</th><th>Button</th><th>Page</th>'
           . '<th>Where</th><th>Device</th><th></th></tr></thead><tbody>';
        foreach ($recent as $r) {
            $ago  = max(0, time() - (int)$r['ts']);
            $when = $ago < 90 ? $ago . 's ago'
                  : ($ago < 5400 ? round($ago / 60) . 'm ago'
                  : ($ago < 172800 ? round($ago / 3600) . 'h ago' : round($ago / 86400) . 'd ago'));
            echo '<tr><td class="muted">' . e($when) . '</td>'
               . '<td><strong>' . e($placeLabel((string)$r['placement'])) . '</strong></td>'
               . '<td class="trunc muted" title="' . e($r['path']) . '">'
               . e($pathLabel((string)$r['path'])) . '</td>'
               . '<td class="muted">'
               . e((string)$r['country'] !== '' ? mpa_country_name((string)$r['country']) : '-') . '</td>'
               . '<td class="muted">' . e((string)$r['device'] !== '' ? (string)$r['device'] : '-') . '</td>'
               /* The whole visit this tap belongs to, which is usually the
                  question the number raises. */
               . '<td class="n"><a class="btn btn--sm" href="?p=visits&amp;r=' . e($R['preset'])
               . '&amp;sid=' . e((string)$r['sid']) . '">Visit</a></td></tr>';
        }
        echo '</tbody></table></div>';
    }
  ?>
</div>

<!-- ---------- findings ---------------------------------------------------- -->
<div class="card card--pad0" id="wa-findings">
  <h3>What to fix <span class="hint">written from the numbers above</span></h3>
  <?php
    $found = mpa_ev_findings($EV, $LAB, $f, $t);
    if (!$found) {
        ui_empty('Nothing worth flagging yet',
                 'Findings need about fifteen taps before they mean anything. '
               . 'A rule that fires on three trains people to ignore the page.', 'pulse');
    } else {
        echo '<div class="tw"><table><thead><tr><th></th><th>Finding</th>'
           . '<th>Do</th><th>Expect</th></tr></thead><tbody>';
        foreach ($found as $r) {
            $badge = $r['severity'] === 'high' ? 'Priority'
                   : ($r['severity'] === 'medium' ? 'Important' : 'Working');
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
  Every number on this page is a tap on a WhatsApp link, counted on this server. Whether the
  message was then sent, and whether it was answered, happens inside WhatsApp and cannot be seen
  from the website. To measure replies and response time the WhatsApp Business account itself has
  to be connected, which is a separate piece of work.
</p>

<?php endif; ?>
