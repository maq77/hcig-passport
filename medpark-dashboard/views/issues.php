<?php
/* Issues and advice. Every finding, grouped by how urgent it is, each with a
   plain statement of what to do. This is the page that turns numbers into work. */
$findings = mp_insights($R);
$counts = array('high'=>0, 'medium'=>0, 'low'=>0);
foreach ($findings as $x) { $counts[$x['severity']]++; }

$byArea = array();
foreach ($findings as $x) { $byArea[$x['area']] = (isset($byArea[$x['area']]) ? $byArea[$x['area']] : 0) + 1; }
arsort($byArea);
?>

<div class="grid g4" style="margin-bottom:16px">
  <?php
    ui_kpi('Total findings', (string)count($findings), null, 'For ' . strtolower($R['label']), true);
    ui_kpi('Urgent', (string)$counts['high'], null, 'Costing patients or rankings now');
    ui_kpi('Worth fixing', (string)$counts['medium'], null, 'Meaningful, not on fire');
    ui_kpi('Opportunities', (string)$counts['low'], null, 'Gains available, nothing broken');
  ?>
</div>

<?php if ($byArea): ?>
<div class="card" style="margin-bottom:16px">
  <h3>By area</h3>
  <div style="display:flex;gap:8px;flex-wrap:wrap">
    <?php foreach ($byArea as $area => $n): ?>
      <span class="tag" style="font-size:12px;padding:5px 10px"><?php echo e($area); ?> <b><?php echo (int)$n; ?></b></span>
    <?php endforeach; ?>
  </div>
</div>
<?php endif; ?>

<?php
  $groups = array(
    'high'   => array('Urgent', 'These are costing patients or search position right now.'),
    'medium' => array('Worth fixing', 'Real problems that are not emergencies.'),
    'low'    => array('Opportunities', 'Nothing is broken. There is a gain available.'),
  );
  foreach ($groups as $sev => $meta):
    $items = array_values(array_filter($findings, function ($x) use ($sev) { return $x['severity'] === $sev; }));
    if (!$items) continue;
?>
<div class="card card--pad0" style="margin-bottom:16px">
  <h3><?php echo e($meta[0]); ?> <span class="tag"><?php echo count($items); ?></span></h3>
  <p style="padding:0 18px;margin:-4px 0 10px;color:var(--ink-3);font-size:13px"><?php echo e($meta[1]); ?></p>
  <?php foreach ($items as $x): ?>
    <div class="find s-<?php echo e($x['severity']); ?>">
      <div class="find__dot"></div>
      <div class="find__b">
        <div class="find__t"><?php echo e($x['title']); ?><span class="tag"><?php echo e($x['area']); ?></span></div>
        <div class="find__d"><?php echo e($x['detail']); ?></div>
        <div class="find__a"><b>What to do.</b> <?php echo e($x['advice']); ?></div>
      </div>
    </div>
  <?php endforeach; ?>
</div>
<?php endforeach; ?>

<?php if (!$findings): ?>
<div class="card"><?php ui_empty('Nothing flagged',
  'No issues were detected in the connected sources for this period. If most sources are still unconnected, that is why. Connect them in Settings and this page becomes useful.'); ?></div>
<?php endif; ?>

<div class="card card--pad0">
  <h3>Data collection log</h3>
  <table>
    <thead><tr><th>When</th><th>Source</th><th>Result</th><th>Detail</th></tr></thead>
    <tbody>
    <?php
      $runs = mp_q("SELECT * FROM runs WHERE site = :site ORDER BY id DESC LIMIT 25")->fetchAll();
      if (!$runs) { echo '<tr><td colspan="4" style="color:var(--ink-3)">No collection has run yet. Press Refresh data.</td></tr>'; }
      foreach ($runs as $r) {
        echo '<tr><td>' . e(str_replace('T', ' ', substr((string)$r['ran_at'], 0, 16))) . '</td>'
           . '<td>' . e(strtoupper($r['source'])) . '</td>'
           . '<td>' . ui_pill($r['status'] === 'ok', 'OK', 'Failed') . '</td>'
           . '<td class="trunc" title="' . e($r['message']) . '">' . e($r['message']) . '</td></tr>';
      }
    ?>
    </tbody>
  </table>
</div>
