<?php
/* ==========================================================================
   All properties, side by side.

   Added 2026-09-04. This is the view that does not exist anywhere else in the
   group and the reason a single system beats eight of them: every website on
   one screen, ranked by what they produce rather than by how much traffic they
   get, with a way into any one of them.

   HOW IT READS ANOTHER PROPERTY'S NUMBERS
   Every accessor in this system is scoped to the current property, so the loop
   below switches the current property, gathers, and switches back. That is the
   whole trick, and it works precisely because nothing anywhere reaches around
   the scoping. The original selection is restored before the page renders, so
   the sidebar and every link still point where the reader left them.
   ========================================================================== */

$f = $R['from']; $t = $R['to']; $pf = $R['prev_from']; $pt = $R['prev_to'];

$sites   = mp_sites();
$wasSite = mp_current_site();

$rows  = array();
$total = array('visits' => 0.0, 'contacts' => 0.0, 'requests' => 0.0, 'waiting' => 0.0,
               'pvisits' => 0.0, 'pcontacts' => 0.0, 'prequests' => 0.0);

foreach ($sites as $key => $s) {
    mp_current_site($key);
    $H = mp_headline($f, $t);
    $P = mp_headline($pf, $pt);
    $rows[$key] = array(
        'site' => $s, 'now' => $H, 'prev' => $P,
        'series' => mpa_series('conversions', $f, $t),
    );
    $total['visits']    += $H['sessions'];
    $total['contacts']  += $H['contacts'];
    $total['requests']  += $H['requests'];
    $total['waiting']   += $H['waiting'];
    $total['pvisits']   += $P['sessions'];
    $total['pcontacts'] += $P['contacts'];
    $total['prequests'] += $P['requests'];
}
mp_current_site($wasSite);

/* Ranked by what they produce. A property with more traffic and fewer
   enquiries belongs below one with the opposite. */
uasort($rows, function ($a, $b) {
    if ($a['now']['requests'] === $b['now']['requests']) {
        return $b['now']['contacts'] <=> $a['now']['contacts'];
    }
    return $b['now']['requests'] <=> $a['now']['requests'];
});

/* Which one moved most, in either direction, with enough behind it to mean
   something. This is the sentence a chief executive actually wants. */
$mover = null;
foreach ($rows as $key => $r) {
    $before = (float)$r['prev']['contacts'];
    $after  = (float)$r['now']['contacts'];
    if ($before < 5 && $after < 5) continue;
    $delta = $before > 0 ? (($after - $before) / $before) * 100 : ($after > 0 ? 100 : 0);
    if ($mover === null || abs($delta) > abs($mover['delta'])) {
        $mover = array('key' => $key, 'label' => (string)$r['site']['label'],
                       'delta' => $delta, 'before' => $before, 'after' => $after);
    }
}

$rate = function (array $h) {
    return $h['sessions'] > 0 ? round($h['contacts'] / $h['sessions'] * 100, 2) : 0.0;
};
?>

<div class="qa" role="group" aria-label="Group">
  <span class="qa__btn" title="Every website registered in this system. Adding one is a row here and one line on that site.">
    <?php echo ui_icon('globe', 15); ?>
    <?php echo count($sites); ?> <?php echo count($sites) === 1 ? 'property' : 'properties'; ?>
  </span>
  <?php if ($total['waiting'] > 0): ?>
    <span class="qa__btn" style="color:var(--bad)" title="Appointment requests nobody has answered, across every property.">
      <?php echo ui_icon('alert', 15); ?> <?php echo (int)$total['waiting']; ?> waiting for a reply
    </span>
  <?php endif; ?>
  <a class="qa__btn" href="?p=alerts" title="What is currently wrong, on any property.">
    <?php echo ui_icon('alert', 15); ?> Alerts
  </a>
  <a class="qa__btn" href="?p=partners&amp;r=<?php echo e($R['preset']); ?>"
     title="Who sends the patients."><?php echo ui_icon('users', 15); ?> Partners</a>
</div>

<div class="grid g4">
  <?php
    ui_kpi('Appointment requests', mp_num($total['requests']),
           mp_delta($total['requests'], $total['prequests']),
           'Across every property', true);
    ui_kpi('Contact attempts', mp_num($total['contacts']),
           mp_delta($total['contacts'], $total['pcontacts']), 'Calls, WhatsApp, email, forms');
    ui_kpi('Visits', mp_num($total['visits']),
           mp_delta($total['visits'], $total['pvisits']), 'Every website together');
    ui_kpi('Group enquiry rate',
           $total['visits'] > 0 ? round($total['contacts'] / $total['visits'] * 100, 2) . '%' : '--',
           null, 'Contact attempts as a share of visits');
  ?>
</div>

<?php if ($mover !== null && abs($mover['delta']) >= 15): ?>
  <div class="note note--<?php echo $mover['delta'] >= 0 ? 'ok' : 'bad'; ?>" role="status">
    <strong><?php echo e($mover['label']); ?></strong> moved most:
    contact attempts went from <?php echo e(mp_num($mover['before'])); ?>
    to <?php echo e(mp_num($mover['after'])); ?>,
    <?php echo $mover['delta'] >= 0 ? 'up' : 'down'; ?>
    <?php echo e(number_format(abs($mover['delta']), 0)); ?>% against the previous period.
  </div>
<?php endif; ?>

<div class="card card--pad0">
  <h3>Every property <span class="hint">ranked by what they produce, not by traffic</span></h3>
  <?php
    if (!$rows) {
        ui_empty('No properties registered', 'This fills in as websites are added.', 'globe');
    } else {
        echo '<div class="tw"><table><thead><tr><th>Property</th><th class="n">Requests</th>'
           . '<th class="n">Contacts</th><th class="n">Visits</th><th style="width:100px"></th>'
           . '<th class="n">Rate</th><th class="n">Waiting</th><th></th></tr></thead><tbody>';

        $bestRate = 0.0;
        foreach ($rows as $r) $bestRate = max($bestRate, $rate($r['now']));

        foreach ($rows as $key => $r) {
            $h = $r['now'];
            $rt = $rate($h);
            $w  = $bestRate > 0 ? ($rt / $bestRate) * 100 : 0;
            $d  = mp_delta($h['contacts'], $r['prev']['contacts']);
            $arrow = ($d && $d['pct'] !== null)
                ? '<span class="' . e($d['dir']) . '" style="font-size:11.5px;margin-left:6px">'
                  . ($d['dir'] === 'up' ? '+' : ($d['dir'] === 'down' ? '-' : ''))
                  . e(number_format(abs($d['pct']), 0)) . '%</span>'
                : '';
            echo '<tr>'
               . '<td><strong>' . e((string)$r['site']['label']) . '</strong>'
               . '<div class="muted" style="font-size:11.5px">' . e((string)$r['site']['site_url']) . '</div></td>'
               . '<td class="n"><strong>' . e(mp_num($h['requests'])) . '</strong></td>'
               . '<td class="n">' . e(mp_num($h['contacts'])) . $arrow . '</td>'
               . '<td class="n muted">' . e(mp_num($h['sessions'])) . '</td>'
               . '<td><span class="bar"><i style="width:' . round($w) . '%"></i></span></td>'
               . '<td class="n"><strong>' . e(number_format($rt, 2)) . '%</strong></td>'
               . '<td class="n">' . ($h['waiting'] > 0
                   ? '<span class="pill pill--wait">' . (int)$h['waiting'] . '</span>'
                   : '<span class="muted">0</span>') . '</td>'
               . '<td class="n"><a class="btn btn--sm" href="?p=ceo&amp;r=' . e($R['preset'])
               . '&amp;site=' . e($key) . '">Open</a></td>'
               . '</tr>';
        }

        if (count($rows) > 1) {
            echo '<tr style="background:var(--surface-2)">'
               . '<td><strong>Group</strong></td>'
               . '<td class="n"><strong>' . e(mp_num($total['requests'])) . '</strong></td>'
               . '<td class="n"><strong>' . e(mp_num($total['contacts'])) . '</strong></td>'
               . '<td class="n">' . e(mp_num($total['visits'])) . '</td><td></td>'
               . '<td class="n"><strong>'
               . e($total['visits'] > 0 ? number_format($total['contacts'] / $total['visits'] * 100, 2) : '0.00')
               . '%</strong></td>'
               . '<td class="n">' . (int)$total['waiting'] . '</td><td></td></tr>';
        }
        echo '</tbody></table></div>';
    }
  ?>
</div>

<?php if (count($rows) > 1): ?>
<div class="card">
  <h3>Contact attempts per property
      <span class="hint">the same scale, so the properties are comparable</span></h3>
  <?php
    $series = array();
    foreach ($rows as $key => $r) {
        if (count($r['series']) > 1) {
            $series[] = array('name' => (string)$r['site']['label'], 'rows' => $r['series']);
        }
    }
    if ($series) ui_line($series);
    else ui_empty('Not enough days yet', 'A trend needs two days of collection per property.', 'pulse');
  ?>
</div>
<?php endif; ?>

<?php if (count($sites) <= 1): ?>
  <div class="card">
    <h3>This is the group view, with one property in it</h3>
    <p class="muted" style="max-width:75ch">
      Every website added to this system appears here as another row, with the same numbers,
      measured the same way, and a way into its own dashboard. Adding one is a row in the registry
      and a single line on that website: no second install, no second deploy, and no second set of
      numbers that disagree with these.
    </p>
    <p class="muted" style="max-width:75ch">
      The next two are healthcareig.com and 247clinic.net. Neither needs anything installed on it.
    </p>
  </div>
<?php endif; ?>

<p class="muted" style="font-size:12.5px;margin-top:14px;max-width:85ch">
  Appointment requests are counted the same way for every property, because each website stores
  them itself. Visits and contact attempts follow whichever source each property is set to read.
</p>
