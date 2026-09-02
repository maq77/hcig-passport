<?php
/* KPIs. The difference between this page and Overview is the target.
   Overview says what happened. This says whether that is good enough.

   Targets are editable here and stored with the settings, so they survive and
   can be argued about openly rather than living in someone's head. */

$saved = json_decode(mp_get('kpi_targets', '{}'), true);
if (!is_array($saved)) $saved = array();

if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['act'] ?? '') === 'save_kpi' && mp_csrf_ok($_POST['csrf'] ?? null)) {
    $next = array();
    foreach (($_POST['target'] ?? array()) as $k => $v) {
        $k = preg_replace('~[^a-z_]~', '', (string)$k);
        if ($k !== '' && $v !== '') $next[$k] = (float)$v;
    }
    mp_save_settings(array('kpi_targets' => json_encode($next)));
    $saved = $next;
    echo '<div class="note note--ok">Targets saved. They apply from this period onward.</div>';
}

$f = $R['from']; $t = $R['to']; $pf = $R['prev_from']; $pt = $R['prev_to'];
$today = gmdate('Y-m-d');

function kpi_chat(string $sql, array $args): float {
    try { $st = mp_db()->prepare($sql); $st->execute($args); return (float)$st->fetchColumn(); }
    catch (Throwable $e) { return 0.0; }
}
$chatArgs = array(':a'=>$f, ':b'=>$today);
$chatLeads = kpi_chat("SELECT COUNT(*) FROM chat_leads WHERE date(created_at) BETWEEN :a AND :b", $chatArgs);
$pChatLeads = kpi_chat("SELECT COUNT(*) FROM chat_leads WHERE date(created_at) BETWEEN :a AND :b", array(':a'=>$pf, ':b'=>$pt));

$calls = mp_sum('ga4','events',$f,$t,'call_click');
$whats = mp_sum('ga4','events',$f,$t,'whatsapp_click');
$forms = mp_sum('ga4','events',$f,$t,'enquiry_submit');
$sessions = mp_sum('ga4','sessions',$f,$t);
$enq = $calls + $whats + $forms + $chatLeads;

$pcalls = mp_sum('ga4','events',$pf,$pt,'call_click');
$pwhats = mp_sum('ga4','events',$pf,$pt,'whatsapp_click');
$pforms = mp_sum('ga4','events',$pf,$pt,'enquiry_submit');
$psessions = mp_sum('ga4','sessions',$pf,$pt);
$penq = $pcalls + $pwhats + $pforms + $pChatLeads;

$psiDay = mp_db()->query("SELECT MAX(day) FROM metrics WHERE source='psi'")->fetchColumn();
$mobileSpeed = 0.0;
if ($psiDay) {
    $st = mp_db()->prepare("SELECT AVG(value) FROM metrics WHERE source='psi' AND metric='score_performance' AND day=:d AND dim LIKE '%mobile'");
    $st->execute(array(':d'=>$psiDay));
    $mobileSpeed = (float)$st->fetchColumn();
}
$aiRow = mp_db()->query("SELECT COUNT(*) c, SUM(mentioned) m FROM ai_checks WHERE checked_at >= date('now','-45 day')")->fetch();
$aiRate = ($aiRow && (int)$aiRow['c'] > 0) ? ((float)$aiRow['m'] / (float)$aiRow['c']) * 100 : 0.0;

/* Each KPI: label, current, previous, target, unit, direction, source, why it matters. */
$K = array(
  array('k'=>'enquiries', 'g'=>'Demand', 'label'=>'Total enquiries', 'now'=>$enq, 'prev'=>$penq, 'unit'=>'', 'higher'=>true,
        'src'=>'ga4', 'why'=>'Calls, WhatsApp, forms and assistant requests together. The one number the CEO should read first.'),
  array('k'=>'calls', 'g'=>'Demand', 'label'=>'Calls', 'now'=>$calls, 'prev'=>$pcalls, 'unit'=>'', 'higher'=>true,
        'src'=>'ga4', 'why'=>'Taps on the phone number. For urgent care this is the strongest intent there is.'),
  array('k'=>'whatsapp', 'g'=>'Demand', 'label'=>'WhatsApp', 'now'=>$whats, 'prev'=>$pwhats, 'unit'=>'', 'higher'=>true,
        'src'=>'ga4', 'why'=>'Preferred by tourists who do not want to pay for an international call.'),
  array('k'=>'chat_leads', 'g'=>'Demand', 'label'=>'Assistant requests', 'now'=>$chatLeads, 'prev'=>$pChatLeads, 'unit'=>'', 'higher'=>true,
        'src'=>'chat', 'why'=>'Appointment requests captured by the website assistant, with a name and a number.'),
  array('k'=>'enquiry_rate', 'g'=>'Efficiency', 'label'=>'Enquiry rate',
        'now'=>$sessions > 0 ? ($enq / $sessions) * 100 : 0,
        'prev'=>$psessions > 0 ? ($penq / $psessions) * 100 : 0, 'unit'=>'%', 'higher'=>true, 'dp'=>2,
        'src'=>'ga4', 'why'=>'What share of visitors make contact. Rising traffic with a flat rate means the site is not converting.'),
  array('k'=>'sessions', 'g'=>'Reach', 'label'=>'Sessions', 'now'=>$sessions, 'prev'=>$psessions, 'unit'=>'', 'higher'=>true,
        'src'=>'ga4', 'why'=>'Total visits. Useful only alongside the enquiry rate.'),
  array('k'=>'organic_clicks', 'g'=>'Reach', 'label'=>'Clicks from Google', 'now'=>mp_sum('gsc','clicks',$f,$t), 'prev'=>mp_sum('gsc','clicks',$pf,$pt), 'unit'=>'', 'higher'=>true,
        'src'=>'gsc', 'why'=>'Traffic you do not pay for. The compounding one.'),
  array('k'=>'position', 'g'=>'Reach', 'label'=>'Average position', 'now'=>mp_avg('gsc','position',$f,$t), 'prev'=>mp_avg('gsc','position',$pf,$pt), 'unit'=>'', 'higher'=>false, 'dp'=>1,
        'src'=>'gsc', 'why'=>'Lower is better. Position 1 to 3 is where nearly all the clicks are.'),
  array('k'=>'map_calls', 'g'=>'Local', 'label'=>'Calls from map listings', 'now'=>mp_sum('gbp','call_clicks',$f,$t), 'prev'=>mp_sum('gbp','call_clicks',$pf,$pt), 'unit'=>'', 'higher'=>true,
        'src'=>'gbp', 'why'=>'Patients who never reach the website. Invisible without this connector.'),
  array('k'=>'directions', 'g'=>'Local', 'label'=>'Direction requests', 'now'=>mp_sum('gbp','direction_requests',$f,$t), 'prev'=>mp_sum('gbp','direction_requests',$pf,$pt), 'unit'=>'', 'higher'=>true,
        'src'=>'gbp', 'why'=>'Someone is physically coming in. The closest thing to a booking Google can show you.'),
  array('k'=>'mobile_speed', 'g'=>'Technical', 'label'=>'Mobile speed score', 'now'=>$mobileSpeed, 'prev'=>0, 'unit'=>'/100', 'higher'=>true,
        'src'=>'psi', 'why'=>'Most visitors are on a phone on hotel wifi. Under 50 loses them before the page draws.'),
  array('k'=>'ai_mentions', 'g'=>'Technical', 'label'=>'AI mention rate', 'now'=>$aiRate, 'prev'=>0, 'unit'=>'%', 'higher'=>true,
        'src'=>'ai', 'why'=>'How often AI assistants name MedPark when asked about hospitals here.'),
);

$conn = mp_connectors_status();
function kpi_ready(array $conn, string $src): bool {
    if ($src === 'chat') return true;
    return isset($conn[$src]) ? (bool)$conn[$src]['ready'] : true;
}

$met = 0; $missing = 0; $tracked = 0;
foreach ($K as $x) {
    if (!kpi_ready($conn, $x['src'])) { $missing++; continue; }
    if (!isset($saved[$x['k']])) continue;
    $tracked++;
    $ok = $x['higher'] ? $x['now'] >= $saved[$x['k']] : ($x['now'] > 0 && $x['now'] <= $saved[$x['k']]);
    if ($ok) $met++;
}
?>

<div class="grid g4" style="margin-bottom:16px">
  <?php
    ui_kpi('KPIs with a target', (string)count($saved), null, 'Of ' . count($K) . ' available', true);
    ui_kpi('Targets met', $tracked > 0 ? $met . ' of ' . $tracked : '--', null, $tracked > 0 ? 'In this period' : 'Set targets below');
    ui_kpi('Waiting on access', (string)$missing, null, 'Cannot be measured yet');
    ui_kpi('Period', $R['days'] . ' days', null, $R['from'] . ' to ' . $R['to']);
  ?>
</div>

<form method="post">
<input type="hidden" name="csrf" value="<?php echo e(mp_csrf()); ?>">
<input type="hidden" name="act" value="save_kpi">

<?php
$groups = array();
foreach ($K as $x) { $groups[$x['g']][] = $x; }
foreach ($groups as $gname => $items): ?>
<div class="card card--pad0" style="margin-bottom:16px">
  <h3><?php echo e($gname); ?></h3>
  <div style="overflow-x:auto">
  <table style="min-width:780px">
    <thead>
      <tr><th>KPI</th><th class="n">This period</th><th class="n">Previous</th><th class="n">Change</th><th class="n" style="width:120px">Target</th><th>Status</th></tr>
    </thead>
    <tbody>
    <?php foreach ($items as $x):
      $ready = kpi_ready($conn, $x['src']);
      $dp = isset($x['dp']) ? $x['dp'] : 0;
      $target = isset($saved[$x['k']]) ? $saved[$x['k']] : '';
      $d = $x['higher'] ? mp_delta((float)$x['now'], (float)$x['prev']) : mp_delta((float)$x['prev'], (float)$x['now']);
      $status = '';
      if (!$ready) $status = '<span class="pill pill--wait">Needs access</span>';
      elseif ($target === '') $status = '<span class="pill pill--idle" style="background:var(--line);color:var(--ink-3)">No target</span>';
      else {
        $hit = $x['higher'] ? $x['now'] >= $target : ($x['now'] > 0 && $x['now'] <= $target);
        $near = !$hit && $target > 0 && ($x['higher'] ? $x['now'] >= $target * 0.8 : $x['now'] <= $target * 1.2);
        $status = $hit ? '<span class="pill pill--ok">On target</span>'
                : ($near ? '<span class="pill pill--wait">Close</span>' : '<span class="pill pill--off">Behind</span>');
      }
    ?>
      <tr>
        <td style="white-space:normal">
          <b><?php echo e($x['label']); ?></b>
          <div style="font-weight:400;color:var(--ink-3);font-size:12.5px;margin-top:3px;max-width:52ch"><?php echo e($x['why']); ?></div>
        </td>
        <td class="n"><b><?php echo $ready ? e(number_format((float)$x['now'], $dp) . $x['unit']) : '--'; ?></b></td>
        <td class="n" style="color:var(--ink-3)"><?php echo $ready && $x['prev'] > 0 ? e(number_format((float)$x['prev'], $dp)) : '-'; ?></td>
        <td class="n">
          <?php if ($ready && $d['pct'] !== null): ?>
            <span class="<?php echo e($d['dir']); ?>" style="font-weight:700">
              <?php echo $d['dir'] === 'up' ? '&#9650;' : ($d['dir'] === 'down' ? '&#9660;' : '&#9679;'); ?>
              <?php echo e(number_format(abs($d['pct']), 1)); ?>%
            </span>
          <?php else: ?><span style="color:var(--ink-3)">-</span><?php endif; ?>
        </td>
        <td class="n">
          <input type="text" name="target[<?php echo e($x['k']); ?>]" value="<?php echo e($target === '' ? '' : (string)(0 + $target)); ?>"
                 style="text-align:right;padding:6px 9px;font-size:13px" placeholder="none">
        </td>
        <td><?php echo $status; ?></td>
      </tr>
    <?php endforeach; ?>
    </tbody>
  </table>
  </div>
</div>
<?php endforeach; ?>

<button class="btn btn--pri" type="submit" style="padding:11px 22px">Save targets</button>
</form>

<div class="note note--info" style="margin-top:18px">
  <b>A note on setting these.</b> Do not invent targets now. Let the first full month run, take those
  numbers as the baseline, then set each target as a deliberate improvement on it. A target pulled out
  of the air is worse than no target, because it makes every later report an argument about the target
  rather than about the work.
</div>
