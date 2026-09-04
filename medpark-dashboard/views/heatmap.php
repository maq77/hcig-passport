<?php
/* Heatmap and on-page behaviour.

   Built in-house rather than bought. Clicks arrive already binned into a 20x20
   grid by the browser and batched into one beacon per visit, so this costs the
   server roughly one extra request per session and stores no coordinates that
   could identify anyone.

   Needs no credentials, so it works from the moment it is deployed. */

$f = $R['from']; $b = gmdate('Y-m-d');
$args = array(':a'=>$f, ':b'=>$b);

/* Both helpers bind the current property, but only for statements that ask
   for it, so adding the filter to one query cannot break the others. */
function hm_all(string $sql, array $a = array()): array {
    try { $st = mp_db()->prepare($sql); $st->execute(mp_bind_site($a, $sql)); return $st->fetchAll(); }
    catch (Throwable $e) { return array(); }
}
function hm_one(string $sql, array $a = array()) {
    try { $st = mp_db()->prepare($sql); $st->execute(mp_bind_site($a, $sql)); return $st->fetchColumn(); }
    catch (Throwable $e) { return 0; }
}

$pages = hm_all("SELECT page dim, SUM(hits) v FROM heat_clicks WHERE site = :site AND day BETWEEN :a AND :b
                 GROUP BY page ORDER BY v DESC LIMIT 20", $args);
$sel = isset($_GET['pg']) ? (string)$_GET['pg'] : (isset($pages[0]) ? (string)$pages[0]['dim'] : '/');
$device = (isset($_GET['dev']) && $_GET['dev'] === 'mobile') ? 'mobile' : (isset($_GET['dev']) && $_GET['dev'] === 'desktop' ? 'desktop' : '');

$totalClicks = (float)hm_one("SELECT COALESCE(SUM(hits),0) FROM heat_clicks WHERE site = :site AND day BETWEEN :a AND :b", $args);
$anyData = $totalClicks > 0;
?>

<?php if (!$anyData): ?>
<div class="card">
  <?php ui_empty('No behaviour recorded yet',
    'The collector is live on every page. It batches clicks in the browser and sends one beacon when the visitor leaves, so nothing appears until real visits finish. Give it a day.', 'heat'); ?>
</div>
<div class="card">
  <h3>What this page will show you</h3>
  <p>Where people click on each page, how far down they actually read, which controls get used
     and which get ignored, and what time of day people need you. All of it measured on your own
     server, with no third party script and no cookie.</p>
</div>
<?php else: ?>

<?php
$devWhere = $device !== '' ? " AND device = :d" : "";
$pArgs = array(':a'=>$f, ':b'=>$b, ':p'=>$sel);
if ($device !== '') $pArgs[':d'] = $device;

$pageClicks = (float)hm_one("SELECT COALESCE(SUM(hits),0) FROM heat_clicks WHERE site = :site AND day BETWEEN :a AND :b AND page = :p$devWhere", $pArgs);
$scrollRows = hm_all("SELECT bucket, SUM(hits) v FROM heat_scroll WHERE site = :site AND day BETWEEN :a AND :b AND page = :p$devWhere GROUP BY bucket ORDER BY bucket", $pArgs);
$views = 0.0; foreach ($scrollRows as $r) { $views += (float)$r['v']; }

/* Median depth: the point half your visitors never get past. */
$median = 0; $acc = 0.0;
foreach ($scrollRows as $r) { $acc += (float)$r['v']; if ($acc >= $views / 2) { $median = (int)$r['bucket']; break; } }
$reached50 = 0.0; $reached90 = 0.0;
foreach ($scrollRows as $r) {
    if ((int)$r['bucket'] >= 50) $reached50 += (float)$r['v'];
    if ((int)$r['bucket'] >= 90) $reached90 += (float)$r['v'];
}
?>

<div class="grid g4">
  <?php
    ui_kpi('Clicks recorded', mp_num($totalClicks), null, 'Across all pages', true);
    ui_kpi('On this page', mp_num($pageClicks), null, $sel);
    ui_kpi('Median scroll depth', $views > 0 ? $median . '%' : '--', null,
           $views > 0 ? 'Half of visitors stop here' : 'No scroll data yet');
    ui_kpi('Reach the bottom', $views > 0 ? number_format(($reached90 / max($views, 1)) * 100, 0) . '%' : '--', null,
           'Got past 90 percent');
  ?>
</div>

<div class="card">
  <h3>Page and device</h3>
  <div style="display:flex;gap:7px;flex-wrap:wrap;align-items:center">
    <div class="seg">
      <?php foreach (array(''=>'All devices','desktop'=>'Desktop','mobile'=>'Mobile') as $dv=>$lab): ?>
        <a href="?p=heatmap&amp;r=<?php echo e($R['preset']); ?>&amp;pg=<?php echo e(rawurlencode($sel)); ?>&amp;dev=<?php echo e($dv); ?>"
           class="<?php echo $device === $dv ? 'on' : ''; ?>"><?php echo e($lab); ?></a>
      <?php endforeach; ?>
    </div>
    <?php foreach ($pages as $pg): ?>
      <a class="btn btn--sm<?php echo $sel === $pg['dim'] ? ' btn--pri' : ''; ?>"
         href="?p=heatmap&amp;r=<?php echo e($R['preset']); ?>&amp;pg=<?php echo e(rawurlencode((string)$pg['dim'])); ?>&amp;dev=<?php echo e($device); ?>">
        <?php echo e((string)$pg['dim']); ?> <span style="opacity:.6"><?php echo mp_num($pg['v']); ?></span>
      </a>
    <?php endforeach; ?>
  </div>
</div>

<div class="grid g-2-1">
  <div class="card">
    <h3>Click map <span class="hint"><?php echo e($sel); ?><?php echo $device ? ', ' . e($device) : ''; ?></span></h3>
    <?php
      $cells = hm_all("SELECT gx, gy, SUM(hits) v FROM heat_clicks
                       WHERE site = :site AND day BETWEEN :a AND :b AND page = :p$devWhere
                       GROUP BY gx, gy", $pArgs);
      if (!$cells) {
          ui_empty('No clicks on this page yet', 'Pick another page above, or wait for more visits.', 'heat');
      } else {
          $grid = array(); $max = 0.0;
          foreach ($cells as $c) {
              $grid[(int)$c['gy']][(int)$c['gx']] = (float)$c['v'];
              $max = max($max, (float)$c['v']);
          }
          /* width:100% is load-bearing. The card is a flex column, so this grid
             is a flex item; without an explicit width it shrinks to fit twenty
             1fr columns that have no content of their own, and the whole map
             rendered as a 68 pixel smudge in the middle of an empty card.
             Measured in the browser, not guessed. */
          echo '<div style="display:grid;grid-template-columns:repeat(20,1fr);gap:2px;'
             . 'aspect-ratio:1;width:100%;max-width:520px;margin:0 auto">';
          for ($y = 0; $y < 20; $y++) {
              for ($x = 0; $x < 20; $x++) {
                  $v = isset($grid[$y][$x]) ? $grid[$y][$x] : 0.0;
                  $pct = $max > 0 ? ($v / $max) : 0;
                  $bg = $v > 0
                      ? 'color-mix(in srgb, var(--c1) ' . round(14 + $pct * 86) . '%, var(--surface))'
                      : 'var(--line-2)';
                  echo '<div style="aspect-ratio:1;border-radius:2px;background:' . $bg . '"'
                     . ($v > 0 ? ' title="' . e(mp_num($v)) . ' clicks"' : '') . '></div>';
              }
          }
          echo '</div>';
          echo '<div class="heat__scale" style="max-width:520px;margin:10px auto 0">'
             . '<span>Top of page</span><span style="margin-left:auto">Bottom of page</span></div>';
          echo '<p style="color:var(--ink-3);font-size:12px;margin:8px auto 0;max-width:520px;text-align:center">'
             . 'Left to right is screen width, top to bottom is the full page length. '
             . 'Peak cell had ' . e(mp_num($max)) . ' clicks.</p>';
      }
    ?>
  </div>

  <div class="card">
    <h3>How far people read</h3>
    <?php if (!$scrollRows): ui_empty('No scroll data yet', 'Recorded when a visitor leaves the page.', 'pulse');
    else:
      $rows = array();
      $running = $views;
      foreach ($scrollRows as $r) { /* cumulative: how many got at least this far */ }
      for ($bk = 0; $bk <= 100; $bk += 10) {
          $reach = 0.0;
          foreach ($scrollRows as $r) { if ((int)$r['bucket'] >= $bk) $reach += (float)$r['v']; }
          $rows[] = array('dim' => $bk . '%', 'v' => $views > 0 ? ($reach / $views) * 100 : 0);
      }
      ui_bars($rows, function ($v) { return number_format($v, 0) . '%'; }, 11);
    endif; ?>
    <p class="card__note">A steep drop between two bands is where the page loses people.
       That is the place to move your phone number or your booking button.</p>
  </div>
</div>

<div class="grid g2">
  <div class="card card--pad0">
    <h3>What actually gets clicked</h3>
    <?php
      $t = hm_all("SELECT label dim, SUM(hits) v FROM heat_targets
                   WHERE site = :site AND day BETWEEN :a AND :b AND page = :p GROUP BY label ORDER BY v DESC LIMIT 15",
                  array(':a'=>$f, ':b'=>$b, ':p'=>$sel));
      ui_top_table($t, 'Control', 'Clicks', null, 15);
    ?>
    <p class="card__note">Named controls, not coordinates. If the phone number is not near the top
       of this list on the emergency page, something is wrong with the layout.</p>
  </div>

  <div class="card card--pad0">
    <h3>Most clicked, every page</h3>
    <?php
      $t2 = hm_all("SELECT label dim, SUM(hits) v FROM heat_targets
                    WHERE site = :site AND day BETWEEN :a AND :b GROUP BY label ORDER BY v DESC LIMIT 15", $args);
      ui_top_table($t2, 'Control', 'Clicks', null, 15);
    ?>
  </div>
</div>

<div class="card">
  <h3>When people need you <span class="hint">Visitor local time</span></h3>
  <?php
    $hours = hm_all("SELECT dow, hour, SUM(hits) v FROM heat_hours
                     WHERE site = :site AND day BETWEEN :a AND :b AND kind='visit' GROUP BY dow, hour", $args);
    if (!$hours) {
        ui_empty('Not enough activity yet', 'This fills in as visits accumulate across the week.', 'pulse');
    } else {
        $names = array(0=>'Sun',1=>'Mon',2=>'Tue',3=>'Wed',4=>'Thu',5=>'Fri',6=>'Sat');
        $cells = array();
        foreach ($names as $i => $nm) { $cells[$nm] = array(); }
        foreach ($hours as $h) {
            $nm = $names[(int)$h['dow']];
            $cells[$nm][str_pad((string)(int)$h['hour'], 2, '0', STR_PAD_LEFT)] = (float)$h['v'];
        }
        $cols = array();
        for ($i = 0; $i < 24; $i++) { $cols[] = str_pad((string)$i, 2, '0', STR_PAD_LEFT); }
        ui_heat($cells, $cols, 'visits');
    }
  ?>
  <p class="card__note">Recorded from the visitor's own clock, because "when do tourists need us"
     is a question about their day, not about UTC. Useful for deciding when the multilingual
     desk should be staffed.</p>
</div>

<?php endif; /* closes the !$anyData branch at the top of the page */ ?>
