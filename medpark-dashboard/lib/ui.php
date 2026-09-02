<?php
/* ==========================================================================
   Small render helpers shared by every view.
   ========================================================================== */
declare(strict_types=1);

/* A single number with its change against the previous period. */
function ui_kpi(string $label, string $value, ?array $delta = null, string $foot = '', bool $hero = false): void {
    echo '<div class="kpi' . ($hero ? ' kpi--hero' : '') . '">';
    echo '<div class="kpi__l">' . e($label) . '</div>';
    echo '<div class="kpi__v">' . e($value) . '</div>';
    if ($delta && $delta['pct'] !== null) {
        $arrow = $delta['dir'] === 'up' ? '&#9650;' : ($delta['dir'] === 'down' ? '&#9660;' : '&#9679;');
        echo '<div class="kpi__d ' . e($delta['dir']) . '">' . $arrow . ' '
           . e(number_format(abs($delta['pct']), 1)) . '% vs previous</div>';
    } else {
        echo '<div class="kpi__d flat">' . e($foot !== '' ? $foot : 'No prior period to compare') . '</div>';
    }
    echo '</div>';
}

/* Explains a blank panel instead of leaving it looking broken. */
function ui_empty(string $head, string $why): void {
    echo '<div class="empty"><b>' . e($head) . '</b><p>' . e($why) . '</p></div>';
}

function ui_not_connected(array $conn, string $key): void {
    /* No lcfirst here. It would turn GA4 into gA4. */
    ui_empty($conn[$key]['name'] . ' is not connected yet',
        'Add the credentials in Settings and this panel fills in. Needs ' . $conn[$key]['needs'] . '.');
}

/* Top-N table with a proportion bar, used for every "top 5" on the site. */
function ui_top_table(array $rows, string $labelHead, string $valueHead, callable $fmt = null, int $limit = 5): void {
    if (!$rows) { ui_empty('Nothing recorded yet', 'This fills in after the first data pull covering the selected period.'); return; }
    $max = 0.0;
    foreach ($rows as $r) { $max = max($max, (float)$r['v']); }
    echo '<table><thead><tr><th>' . e($labelHead) . '</th><th style="width:130px"></th><th class="n">' . e($valueHead) . '</th></tr></thead><tbody>';
    $i = 0;
    foreach ($rows as $r) {
        if ($i++ >= $limit) break;
        $pct = $max > 0 ? ((float)$r['v'] / $max) * 100 : 0;
        $val = $fmt ? $fmt((float)$r['v']) : mp_num($r['v']);
        echo '<tr><td class="trunc" title="' . e($r['dim']) . '">' . e($r['dim']) . '</td>'
           . '<td><span class="bar"><i style="width:' . round($pct) . '%"></i></span></td>'
           . '<td class="n">' . e($val) . '</td></tr>';
    }
    echo '</tbody></table>';
}

/* Inline sparkline. No chart library, so nothing external has to load. */
function ui_spark(array $series, string $colour = '#12C0C6'): void {
    if (count($series) < 2) { echo '<div class="empty" style="padding:12px"><p>Not enough days yet for a trend.</p></div>'; return; }
    $vals = array_map(function ($r) { return (float)$r['v']; }, $series);
    $max = max($vals); $min = min($vals);
    $span = ($max - $min) > 0 ? ($max - $min) : 1;
    $n = count($vals);
    $pts = array(); $area = array();
    foreach ($vals as $i => $v) {
        $x = ($i / ($n - 1)) * 100;
        $y = 100 - (($v - $min) / $span) * 90 - 5;
        $pts[] = round($x, 2) . ',' . round($y, 2);
        $area[] = round($x, 2) . ',' . round($y, 2);
    }
    $areaPath = '0,100 ' . implode(' ', $area) . ' 100,100';
    echo '<svg class="spark" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">'
       . '<polygon points="' . $areaPath . '" fill="' . $colour . '" opacity=".12"></polygon>'
       . '<polyline points="' . implode(' ', $pts) . '" fill="none" stroke="' . $colour . '" '
       . 'stroke-width="2" vector-effect="non-scaling-stroke" stroke-linejoin="round" stroke-linecap="round"></polyline>'
       . '</svg>';
}

function ui_pill(bool $ok, string $onText = 'Connected', string $offText = 'Not connected'): string {
    return '<span class="pill ' . ($ok ? 'pill--ok' : 'pill--off') . '">' . e($ok ? $onText : $offText) . '</span>';
}

/* Both branches, by the location ID stored in settings. */
function ui_branch_name(string $locId): string {
    $map = array();
    foreach (array_filter(array_map('trim', explode(',', mp_get('gbp_location_ids')))) as $i => $id) {
        $map[preg_replace('~^locations/~', '', $id)] = $i === 0 ? 'MedPark Health Hub, Hurghada' : 'MedPark Hospital, El Quseir';
    }
    $k = preg_replace('~^locations/~', '', $locId);
    return isset($map[$k]) ? $map[$k] : $locId;
}
