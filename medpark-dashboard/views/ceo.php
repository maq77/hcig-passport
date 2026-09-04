<?php
/* ==========================================================================
   Summary. The chief executive's screen.

   Rebuilt 2026-09-04. The previous version read Google Analytics, Search
   Console and Business Profile only, and none of those are connected, so the
   most important page in the dashboard showed a wall of dashes while our own
   tracking sat underneath it holding real numbers.

   Now it reads whichever source is selected, says on the page which one that
   is, and leads with the thing a hospital actually cares about.

   THE ORDER IS THE ARGUMENT
   Requests first, because a person who left their name and number is the
   closest thing a website produces to a patient. Contact attempts second,
   because a tap is real but unfinished. Traffic last, because visits are the
   input, not the result. Most dashboards put that order the wrong way round
   and train the reader to celebrate the wrong number.
   ========================================================================== */

$f = $R['from']; $t = $R['to']; $pf = $R['prev_from']; $pt = $R['prev_to'];

$H  = mp_headline($f, $t);
$P  = mp_headline($pf, $pt);
$S  = mp_headline_series($f, $t);
$req = mp_requests($f, $t);
$src = mp_source();

/* Things that belong to no source: they are ours whichever analytics is read. */
$aiRow = mp_q("SELECT COUNT(*) c, SUM(mentioned) m FROM ai_checks
               WHERE site = :site AND checked_at >= date('now','-45 day')")->fetch();
$aiC = $aiRow ? (int)$aiRow['c'] : 0;
$aiM = $aiRow ? (int)$aiRow['m'] : 0;

$recs   = mp_recommendations($R);
$urgent = array_values(array_filter($recs, function ($x) { return $x['severity'] === 'high'; }));

$num = function ($v) { return mp_num($v); };
?>

<!-- ---------- which numbers are these ------------------------------------ -->
<div class="card">
  <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">
    <div class="seg" role="group" aria-label="Data source">
      <a href="?p=ceo&amp;r=<?php echo e($R['preset']); ?>&amp;src=own"
         class="<?php echo $src === 'own' ? 'on' : ''; ?>">Our tracking</a>
      <a href="?p=ceo&amp;r=<?php echo e($R['preset']); ?>&amp;src=ga4"
         class="<?php echo $src === 'ga4' ? 'on' : ''; ?>">GA4</a>
    </div>
    <span class="muted" style="font-size:12.5px;flex:1;min-width:240px">
      <strong>Source: <?php echo e(mp_source_short()); ?>.</strong>
      <?php echo e(mp_source_note()); ?>
    </span>
    <?php if ($src === 'ga4' && !$H['ready']): ?>
      <span class="pill pill--wait">GA4 is not connected yet</span>
    <?php endif; ?>
  </div>
</div>

<!-- ---------- the things worth pressing ---------------------------------- -->
<div class="qa" role="group" aria-label="Quick actions">
  <a class="qa__btn qa__btn--pri" href="?p=leads&amp;r=<?php echo e($R['preset']); ?>"
     title="Every person who left a name and a number, and whether anyone has called them back.">
    <?php echo ui_icon('inbox', 15); ?>
    Appointment requests<?php if ($req['waiting_all'] > 0): ?>
      <span class="pill pill--wait" style="margin-left:6px"><?php echo (int)$req['waiting_all']; ?> waiting</span>
    <?php endif; ?>
  </a>
  <a class="qa__btn" href="#fix" title="Ranked by likely effect on enquiries.">
    <?php echo ui_icon('alert', 15); ?> What to fix<?php if ($urgent): ?>
      <span class="pill pill--off" style="margin-left:6px"><?php echo count($urgent); ?></span>
    <?php endif; ?>
  </a>
  <a class="qa__btn" href="export.php?r=<?php echo e($R['preset']); ?>&amp;f=report&amp;src=<?php echo e($src); ?>"
     target="_blank" title="The same numbers as this page, from the same source, as a page you can print or send.">
    <?php echo ui_icon('download', 15); ?> Monthly report
  </a>
  <form method="post" style="display:inline">
    <input type="hidden" name="csrf" value="<?php echo e(mp_csrf()); ?>">
    <input type="hidden" name="act" value="schedule_report">
    <button class="qa__btn" type="submit"
            title="Report arrives by email on the first of every month. Set once.">
      <?php echo ui_icon('refresh', 15); ?>
      <?php echo mp_get('report_email_on') === '1' ? 'Monthly email is on' : 'Email it monthly'; ?>
    </button>
  </form>
  <form method="post" style="display:inline">
    <input type="hidden" name="csrf" value="<?php echo e(mp_csrf()); ?>">
    <input type="hidden" name="act" value="toggle_alerts">
    <button class="qa__btn" type="submit"
            title="Emails you if a headline number falls sharply week on week.">
      <?php echo ui_icon('alert', 15); ?>
      <?php echo mp_get('alerts_on') === '1' ? 'Alerts are on' : 'Turn on alerts'; ?>
    </button>
  </form>
</div>

<!-- ---------- 1. requests: real people who left their details ------------- -->
<div class="grid g4">
  <?php
    ui_stat('requests', $num($H['requests']), mp_delta($H['requests'], $P['requests']),
            mp_requests_series($f, $t), true, 'name and number left', 'var(--c2)');
    ui_stat('requests_form', $num($H['requests_form']), mp_delta($H['requests_form'], $P['requests_form']),
            array(), false, 'the booking form');
    ui_stat('requests_assistant', $num($H['requests_bot']), mp_delta($H['requests_bot'], $P['requests_bot']),
            array(), false, 'the website assistant');
    ui_stat('requests_waiting', $num($req['waiting_all']), null, array(), $req['waiting_all'] > 0,
            $req['waiting_all'] > 0 ? 'nobody has marked these done' : 'all dealt with',
            $req['waiting_all'] > 0 ? 'var(--c6)' : 'var(--c5)');
  ?>
</div>

<!-- ---------- 2. contact attempts ---------------------------------------- -->
<div class="grid g4">
  <?php
    ui_stat('contacts', $num($H['contacts']), mp_delta($H['contacts'], $P['contacts']),
            $S['contacts'], true);
    ui_stat('whatsapp', $num($H['whatsapp']), mp_delta($H['whatsapp'], $P['whatsapp']), array(), false,
            $H['contacts'] > 0 ? round($H['whatsapp'] / max(1, $H['contacts']) * 100) . '% of contacts' : '');
    ui_stat('calls', $num($H['calls']), mp_delta($H['calls'], $P['calls']), array(), false,
            $H['contacts'] > 0 ? round($H['calls'] / max(1, $H['contacts']) * 100) . '% of contacts' : '');
    ui_stat('request_rate', $H['request_rate'] . '%', mp_delta($H['request_rate'], $P['request_rate']),
            array(), false, 'of visits leave details');
  ?>
</div>

<!-- ---------- 3. the audience -------------------------------------------- -->
<div class="grid g4">
  <?php
    ui_stat('sessions', $num($H['sessions']), mp_delta($H['sessions'], $P['sessions']), $S['visits']);
    ui_stat('own_visitors', $num($H['visitors']), mp_delta($H['visitors'], $P['visitors']));
    ui_stat('contact_rate', $H['contact_rate'] . '%', mp_delta($H['contact_rate'], $P['contact_rate']),
            array(), false, 'of visits try to make contact');
    ui_stat('ai_mentions', $aiC > 0 ? $aiM . '/' . $aiC : '--', null, array(), false,
            $aiC > 0 ? 'prompts naming us, last 45 days' : 'run a check on the AI page');
  ?>
</div>

<!-- ---------- the shape of the period ------------------------------------ -->
<div class="grid g-2-1">
  <div class="card">
    <h3>Visits and contact attempts
        <span class="hint">same scale, so the gap is the story</span></h3>
    <?php
      if (count($S['visits']) > 1 || count($S['contacts']) > 1) {
          ui_line(array(array('name' => 'Visits', 'rows' => $S['visits']),
                        array('name' => 'Contact attempts', 'rows' => $S['contacts'])));
      } else {
          ui_empty('Not enough days yet',
                   'A trend needs two days of collection. This fills in on its own.', 'pulse');
      }
    ?>
  </div>
  <div class="card card--pad0">
    <h3>How they reached out</h3>
    <?php
      ui_stack(array(
        array('dim' => 'WhatsApp', 'v' => $H['whatsapp']),
        array('dim' => 'Phone',    'v' => $H['calls']),
        array('dim' => 'Form',     'v' => $H['forms']),
        array('dim' => 'Email',    'v' => $H['email']),
      ));
    ?>
    <h3 style="margin-top:18px">Requests by source</h3>
    <?php
      ui_hbars(array(
        array('dim' => 'Booking form', 'v' => $H['requests_form']),
        array('dim' => 'Assistant',    'v' => $H['requests_bot']),
      ), 2, 'var(--c2)');
    ?>
  </div>
</div>

<!-- ---------- who they are ------------------------------------------------ -->
<div class="grid g3">
  <div class="card card--pad0">
    <h3>Where they are</h3>
    <?php
      if ($src === 'own') {
          $rows = mpa_top('by_country', $f, $t, 6);
          foreach ($rows as &$r) { $r['dim'] = mpa_country_name((string)$r['dim']); }
          unset($r);
          if ($rows) ui_hbars($rows, 6, 'var(--c3)');
          else ui_empty('Nothing yet', 'Fills in as visits arrive.', 'globe');
      } else {
          ui_hbars(mp_top('ga4', 'sessions_country', $f, $t, 6), 6, 'var(--c3)');
      }
    ?>
  </div>
  <div class="card card--pad0">
    <h3>How they arrived</h3>
    <?php
      if ($src === 'own') {
          $rows = mpa_top('by_ref_type', $f, $t, 6);
          foreach ($rows as &$r) { $r['dim'] = mpa_channel_label((string)$r['dim']); }
          unset($r);
          if ($rows) ui_hbars($rows, 6, 'var(--c2)');
          else ui_empty('Nothing yet', 'Fills in as visits arrive.', 'pulse');
      } else {
          ui_hbars(mp_top('ga4', 'sessions_channel', $f, $t, 6), 6, 'var(--c2)');
      }
    ?>
  </div>
  <div class="card card--pad0">
    <h3>Language they read in</h3>
    <?php
      if ($src === 'own') {
          $rows = array();
          foreach (mpa_visits_by_lang($f, $t, 6) as $r) {
              $rows[] = array('dim' => mpa_lang_label((string)$r['dim']), 'v' => (float)$r['n']);
          }
          if ($rows) ui_hbars($rows, 6, 'var(--c4)');
          else ui_empty('Nothing yet', 'Fills in as visits arrive.', 'users');
      } else {
          ui_hbars(mp_top('ga4', 'sessions_lang', $f, $t, 6), 6, 'var(--c4)');
      }
    ?>
  </div>
</div>

<!-- ---------- search and being found -------------------------------------- -->
<?php
$impr   = mp_sum('gsc', 'impressions', $f, $t);
$clicks = mp_sum('gsc', 'clicks', $f, $t);
$hasGsc = $impr > 0 || $clicks > 0;
?>
<div class="grid g-2-1">
  <div class="card card--pad0">
    <h3>Being found
        <span class="hint"><?php echo $hasGsc ? 'Search Console' : 'from our own tracking, until Search Console is connected'; ?></span></h3>
    <?php
      if ($hasGsc) {
          $pos = mp_avg('gsc', 'position', $f, $t);
          echo '<div class="hb">';
          foreach (array(
            array('Impressions in Google', ui_short($impr)),
            array('Clicks from Google',    mp_num($clicks)),
            array('Average position',      $pos > 0 ? number_format($pos, 1) : '--'),
          ) as $row) {
              echo '<div class="hb__r"><span class="hb__l">' . e($row[0]) . '</span>'
                 . '<span></span><b class="hb__v">' . e($row[1]) . '</b></div>';
          }
          echo '</div>';
      } else {
          /* Search Console is the only place impressions exist. What we can
             answer without it is what happened after the click, which Search
             Console cannot see. Say that rather than showing dashes. */
          $sv = mpa_channel_visits('search', $f, $t);
          $av = mpa_channel_visits('ai', $f, $t);
          $mv = mpa_channel_visits('maps', $f, $t);
          echo '<div class="hb">';
          foreach (array(
            array('Visits from a search engine', mp_num($sv)),
            array('Visits from an AI assistant', mp_num($av)),
            array('Visits from Google Maps',     mp_num($mv)),
          ) as $row) {
              echo '<div class="hb__r"><span class="hb__l">' . e($row[0]) . '</span>'
                 . '<span></span><b class="hb__v">' . e($row[1]) . '</b></div>';
          }
          echo '</div>';
          echo '<p class="card__note">How often we appeared in Google and at what position can only '
             . 'come from Search Console, because a search happens on Google rather than on the '
             . 'website. Connecting the Google service account fills that in.</p>';
      }
    ?>
  </div>
  <div class="card card--pad0">
    <h3>Named by AI assistants <span class="hint">last 45 days</span></h3>
    <?php
      if ($aiC === 0) {
          ui_empty('No checks recorded yet',
                   'The AI visibility page can run these itself once a key is set, or record one by hand.', 'sparkles');
      } else {
          $rows = mp_q("SELECT engine dim, ROUND(100.0*SUM(mentioned)/COUNT(*),0) v FROM ai_checks
                        WHERE site = :site AND checked_at >= date('now','-45 day')
                        GROUP BY engine ORDER BY v DESC")->fetchAll();
          /* A share, so it carries its unit. A bare "100" beside an engine name
             reads as a count of something. */
          ui_top_table($rows, 'Engine', 'Named us',
                       function ($v) { return round($v) . '%'; }, 6, false);
          echo '<p class="card__note">The share of asked questions where the answer named us. '
             . 'This is the channel that did not exist last year.</p>';
      }
    ?>
  </div>
</div>

<!-- ---------- what to fix -------------------------------------------------- -->
<div class="card card--pad0" id="fix">
  <h3>What to fix <span class="hint">ranked by likely effect on enquiries</span></h3>
  <?php
    if (!$recs) {
        ui_empty('Nothing to flag',
                 'Findings appear once there is enough traffic behind them. A rule that fires on '
               . 'a handful of visits trains people to ignore the page.', 'pulse');
    } else {
        echo '<div class="tw"><table><thead><tr><th></th><th>Finding</th><th>What to do</th>'
           . '<th>Expect</th></tr></thead><tbody>';
        foreach (array_slice($recs, 0, 8) as $r) {
            $badge = $r['severity'] === 'high' ? 'Priority'
                   : ($r['severity'] === 'medium' ? 'Important' : 'Working');
            $cls = $r['severity'] === 'high' ? 'off' : ($r['severity'] === 'medium' ? 'wait' : 'ok');
            echo '<tr><td><span class="pill pill--' . $cls . '">' . e($badge) . '</span></td>'
               . '<td><strong>' . e((string)$r['finding']) . '</strong>'
               . (isset($r['evidence']) && $r['evidence'] !== ''
                   ? '<div class="muted" style="font-size:12.5px;margin-top:3px">' . e((string)$r['evidence']) . '</div>' : '')
               . '</td>'
               /* mp_rec() calls this field `solution`. Reading `do` gave an
                  empty column on every row. */
               . '<td>' . e((string)($r['solution'] ?? '')) . '</td>'
               . '<td class="muted">' . e((string)($r['expect'] ?? '')) . '</td></tr>';
        }
        echo '</tbody></table></div>';
    }
  ?>
</div>

<p class="muted" style="font-size:12.5px;margin-top:14px;max-width:85ch">
  Everything above is measured with <strong><?php echo e(mp_source_label()); ?></strong> for the
  period <?php echo e($R['from']); ?> to <?php echo e($R['to']); ?>, compared against
  <?php echo e($R['prev_from']); ?> to <?php echo e($R['prev_to']); ?>.
  Appointment requests are counted the same way whichever source is selected, because they are
  stored by the website's own booking form rather than by any analytics.
  A contact attempt means somebody pressed a way of reaching us; whether they then spoke to anyone
  happens off the website and cannot be measured from here.
</p>
