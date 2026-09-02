<?php
/* ==========================================================================
   Render helpers.

   Charts are hand-built inline SVG rather than a charting library. Three
   reasons: nothing external has to load on a page behind a login, the colours
   come straight from the CSS custom properties so light and dark themes are
   handled for free, and the whole dashboard stays a single directory with no
   build step.

   Every chart also emits a text summary for screen readers, because a chart
   alone is not accessible.
   ========================================================================== */
declare(strict_types=1);

/* ---------- icons, one consistent stroke family --------------------------- */
function ui_icon(string $name, int $size = 16): string {
    $p = array(
        'gauge'    => '<path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M13.4 10.6 19 5"/><path d="M20.7 17A9 9 0 1 0 3.3 17"/>',
        'target'   => '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
        'phone'    => '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z"/>',
        'users'    => '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9"/><path d="M16 3.1a4 4 0 0 1 0 7.8"/>',
        'chat'     => '<path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.8-.8L3 21l1.9-4.9A8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5Z"/>',
        'search'   => '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
        'map'      => '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
        'globe'    => '<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20Z"/>',
        'sparkles' => '<path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z"/><path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z"/>',
        'heat'     => '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
        'pulse'    => '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
        'alert'    => '<path d="M12 9v4"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 17h.01"/>',
        'settings' => '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 7 19.4a1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0-1.2-2.9H1a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 2.6 7a1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H7a1.7 1.7 0 0 0 1-1.5V1a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V7a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>',
        'logout'   => '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
        'download' => '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
        'refresh'  => '<path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/>',
        'inbox'    => '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5.1 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.7 1.1Z"/>',
        'up'       => '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
        'down'     => '<path d="m19 12-7 7-7-7"/><path d="M12 5v14"/>',
        'dot'      => '<circle cx="12" cy="12" r="4"/>',
    );
    $d = isset($p[$name]) ? $p[$name] : $p['dot'];
    return '<svg width="' . $size . '" height="' . $size . '" viewBox="0 0 24 24" fill="none" '
         . 'stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" '
         . 'aria-hidden="true" focusable="false">' . $d . '</svg>';
}

/* ---------- KPI tile ------------------------------------------------------ */
function ui_kpi(string $label, string $value, ?array $delta = null, string $foot = '',
                bool $hero = false, array $spark = array()): void {
    echo '<div class="kpi' . ($hero ? ' kpi--hero' : '') . '">';
    echo '<div class="kpi__l">' . e($label) . '</div>';
    echo '<div class="kpi__v">' . e($value) . '</div>';
    if ($delta && $delta['pct'] !== null) {
        $icon = $delta['dir'] === 'up' ? ui_icon('up', 11) : ($delta['dir'] === 'down' ? ui_icon('down', 11) : ui_icon('dot', 11));
        echo '<div class="kpi__d ' . e($delta['dir']) . '">' . $icon
           . '<span>' . e(number_format(abs($delta['pct']), 1)) . '% vs previous</span></div>';
    } else {
        echo '<div class="kpi__d flat">' . e($foot !== '' ? $foot : 'No prior period to compare') . '</div>';
    }
    if ($spark) { echo '<div class="kpi__spark">'; ui_spark($spark); echo '</div>'; }
    echo '</div>';
}

/* ---------- empty and status ---------------------------------------------- */
function ui_empty(string $head, string $why, string $icon = 'inbox'): void {
    echo '<div class="empty">' . ui_icon($icon, 26)
       . '<b>' . e($head) . '</b><p>' . e($why) . '</p></div>';
}

function ui_not_connected(array $conn, string $key): void {
    /* No lcfirst here. It would turn GA4 into gA4. */
    ui_empty($conn[$key]['name'] . ' is not connected yet',
        'Add the credentials in Settings and this panel fills in. Needs ' . $conn[$key]['needs'] . '.',
        'settings');
}

function ui_pill(bool $ok, string $onText = 'Connected', string $offText = 'Not connected'): string {
    return '<span class="pill ' . ($ok ? 'pill--ok' : 'pill--off') . '">' . e($ok ? $onText : $offText) . '</span>';
}

/* ---------- top-N table --------------------------------------------------- */
function ui_top_table(array $rows, string $labelHead, string $valueHead,
                      ?callable $fmt = null, int $limit = 5, bool $rank = true): void {
    if (!$rows) {
        ui_empty('Nothing recorded yet', 'This fills in after the first data pull covering the selected period.');
        return;
    }
    $max = 0.0;
    foreach ($rows as $r) { $max = max($max, (float)$r['v']); }
    echo '<div class="tw"><table><thead><tr>';
    if ($rank) echo '<th class="rank"></th>';
    echo '<th>' . e($labelHead) . '</th><th style="width:110px"></th>'
       . '<th class="n">' . e($valueHead) . '</th></tr></thead><tbody>';
    $i = 0;
    foreach ($rows as $r) {
        if ($i >= $limit) break;
        $i++;
        $pct = $max > 0 ? ((float)$r['v'] / $max) * 100 : 0;
        $val = $fmt ? $fmt((float)$r['v']) : mp_num($r['v']);
        echo '<tr>';
        if ($rank) echo '<td class="rank">' . $i . '</td>';
        echo '<td class="trunc" title="' . e($r['dim']) . '">' . e($r['dim']) . '</td>'
           . '<td><span class="bar"><i style="width:' . round($pct) . '%"></i></span></td>'
           . '<td class="n"><strong>' . e($val) . '</strong></td></tr>';
    }
    echo '</tbody></table></div>';
}

/* ---------- sparkline ----------------------------------------------------- */
function ui_spark(array $series, string $colour = 'var(--c1)'): void {
    if (count($series) < 2) {
        echo '<div class="empty" style="padding:8px"><p>Not enough days yet for a trend.</p></div>';
        return;
    }
    $vals = array_map(function ($r) { return (float)$r['v']; }, $series);
    $max = max($vals); $min = min($vals);
    $span = ($max - $min) > 0 ? ($max - $min) : 1;
    $n = count($vals);
    $pts = array();
    foreach ($vals as $i => $v) {
        $x = ($i / ($n - 1)) * 100;
        $y = 100 - (($v - $min) / $span) * 88 - 6;
        $pts[] = round($x, 2) . ',' . round($y, 2);
    }
    $last = end($pts); list($lx, $ly) = explode(',', $last);
    echo '<svg class="spark" viewBox="0 0 100 100" preserveAspectRatio="none" role="img" '
       . 'aria-label="Trend from ' . e(mp_num($vals[0])) . ' to ' . e(mp_num(end($vals))) . '">'
       . '<polygon points="0,100 ' . implode(' ', $pts) . ' 100,100" fill="' . $colour . '" opacity=".13"></polygon>'
       . '<polyline points="' . implode(' ', $pts) . '" fill="none" stroke="' . $colour . '" stroke-width="2" '
       . 'vector-effect="non-scaling-stroke" stroke-linejoin="round" stroke-linecap="round"></polyline>'
       . '<circle cx="' . $lx . '" cy="' . $ly . '" r="2.5" fill="' . $colour . '" vector-effect="non-scaling-stroke"></circle>'
       . '</svg>';
}

/* ---------- line chart with axes ------------------------------------------
   $series is a list of ['name'=>..., 'rows'=>[['day'=>..,'v'=>..], ...]]. */
function ui_line(array $series, string $class = 'chart'): void {
    $series = array_values(array_filter($series, function ($s) { return count($s['rows']) > 1; }));
    if (!$series) {
        ui_empty('Not enough data for a chart', 'A trend needs at least two days. This fills in as collection runs.', 'pulse');
        return;
    }
    $W = 600; $H = 200; $L = 42; $R = 8; $T = 10; $B = 24;
    $iw = $W - $L - $R; $ih = $H - $T - $B;

    $days = array();
    foreach ($series as $s) { foreach ($s['rows'] as $r) { $days[(string)$r['day']] = true; } }
    $days = array_keys($days); sort($days);
    $n = count($days);
    if ($n < 2) { ui_empty('Not enough data for a chart', 'A trend needs at least two days.', 'pulse'); return; }
    $idx = array_flip($days);

    $max = 0.0;
    foreach ($series as $s) { foreach ($s['rows'] as $r) { $max = max($max, (float)$r['v']); } }
    if ($max <= 0) $max = 1;
    /* Round the top of the axis up to something a person would choose. */
    $mag = pow(10, max(0, floor(log10($max))));
    $top = ceil($max / $mag) * $mag;
    if ($top == $max) $top = $max + $mag * 0.25;

    $x = function ($d) use ($idx, $n, $L, $iw) { return $L + ($idx[$d] / max(1, $n - 1)) * $iw; };
    $y = function ($v) use ($top, $T, $ih) { return $T + $ih - ((float)$v / $top) * $ih; };

    $colours = array('var(--c1)','var(--c2)','var(--c3)','var(--c4)','var(--c5)','var(--c6)');

    echo '<svg class="' . e($class) . '" viewBox="0 0 ' . $W . ' ' . $H . '" preserveAspectRatio="none" role="img" aria-label="Line chart">';
    /* horizontal gridlines and value labels */
    for ($g = 0; $g <= 4; $g++) {
        $v = $top * $g / 4;
        $yy = $y($v);
        echo '<line class="gridline" x1="' . $L . '" y1="' . round($yy, 1) . '" x2="' . ($W - $R) . '" y2="' . round($yy, 1) . '"></line>';
        echo '<text class="axis" x="' . ($L - 7) . '" y="' . round($yy + 3, 1) . '" text-anchor="end">' . e(ui_short((float)$v)) . '</text>';
    }
    /* date labels, first, middle, last only, so they never crowd */
    foreach (array(0, intdiv($n - 1, 2), $n - 1) as $k) {
        $d = $days[$k];
        $anchor = $k === 0 ? 'start' : ($k === $n - 1 ? 'end' : 'middle');
        echo '<text class="axis" x="' . round($x($d), 1) . '" y="' . ($H - 7) . '" text-anchor="' . $anchor . '">'
           . e(date('j M', strtotime($d))) . '</text>';
    }
    foreach ($series as $i => $s) {
        $c = $colours[$i % count($colours)];
        $pts = array();
        $byDay = array();
        foreach ($s['rows'] as $r) { $byDay[(string)$r['day']] = (float)$r['v']; }
        foreach ($days as $d) {
            if (!isset($byDay[$d])) continue;
            $pts[] = round($x($d), 1) . ',' . round($y($byDay[$d]), 1);
        }
        if (count($pts) < 2) continue;
        if (count($series) === 1) {
            echo '<polygon points="' . $L . ',' . ($T + $ih) . ' ' . implode(' ', $pts) . ' ' . ($L + $iw) . ',' . ($T + $ih) . '" fill="' . $c . '" opacity=".1"></polygon>';
        }
        echo '<polyline points="' . implode(' ', $pts) . '" fill="none" stroke="' . $c . '" stroke-width="2" '
           . 'stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"></polyline>';
    }
    echo '</svg>';

    if (count($series) > 1) {
        echo '<div class="chart-legend">';
        foreach ($series as $i => $s) {
            echo '<span><i style="background:' . $colours[$i % count($colours)] . '"></i>' . e($s['name']) . '</span>';
        }
        echo '</div>';
    }
}

/* ---------- horizontal bar chart ------------------------------------------ */
function ui_bars(array $rows, ?callable $fmt = null, int $limit = 8): void {
    if (!$rows) { ui_empty('Nothing recorded yet', 'This fills in after the first data pull.', 'pulse'); return; }
    $max = 0.0;
    foreach ($rows as $r) { $max = max($max, (float)$r['v']); }
    if ($max <= 0) $max = 1;
    echo '<div class="pagemap">';
    $i = 0;
    foreach ($rows as $r) {
        if ($i++ >= $limit) break;
        $pct = ((float)$r['v'] / $max) * 100;
        $val = $fmt ? $fmt((float)$r['v']) : mp_num($r['v']);
        echo '<div class="pagemap__row">'
           . '<span class="trunc" style="flex:0 0 34%" title="' . e($r['dim']) . '">' . e($r['dim']) . '</span>'
           . '<span class="pagemap__bar"><i style="width:' . round($pct) . '%;background:var(--c1)"></i></span>'
           . '<span class="pagemap__pct">' . e($val) . '</span></div>';
    }
    echo '</div>';
}

/* ---------- donut --------------------------------------------------------- */
function ui_donut(array $rows, int $limit = 5): void {
    if (!$rows) { ui_empty('Nothing recorded yet', 'This fills in after the first data pull.', 'pulse'); return; }
    $rows = array_slice($rows, 0, $limit);
    $total = 0.0;
    foreach ($rows as $r) { $total += (float)$r['v']; }
    if ($total <= 0) { ui_empty('No values yet', 'Everything in this period is zero.', 'pulse'); return; }

    $colours = array('var(--c1)','var(--c2)','var(--c3)','var(--c4)','var(--c5)','var(--c6)');
    $C = 2 * M_PI * 40;
    $offset = 0.0;
    echo '<div style="display:flex;align-items:center;gap:18px;flex-wrap:wrap;padding:4px 0">';
    echo '<svg width="118" height="118" viewBox="0 0 100 100" role="img" aria-label="Share by category">';
    foreach ($rows as $i => $r) {
        $frac = (float)$r['v'] / $total;
        $len = $frac * $C;
        echo '<circle cx="50" cy="50" r="40" fill="none" stroke="' . $colours[$i % count($colours)] . '" '
           . 'stroke-width="16" stroke-dasharray="' . round($len, 2) . ' ' . round($C - $len, 2) . '" '
           . 'stroke-dashoffset="' . round(-$offset, 2) . '" transform="rotate(-90 50 50)"></circle>';
        $offset += $len;
    }
    echo '<circle cx="50" cy="50" r="30" fill="var(--surface)"></circle>';
    echo '<text x="50" y="48" text-anchor="middle" style="font-size:15px;font-weight:700;fill:var(--ink)">' . e(ui_short($total)) . '</text>';
    echo '<text x="50" y="60" text-anchor="middle" style="font-size:7px;fill:var(--ink-3);text-transform:uppercase;letter-spacing:.08em">total</text>';
    echo '</svg>';
    echo '<div style="flex:1;min-width:150px;display:flex;flex-direction:column;gap:6px">';
    foreach ($rows as $i => $r) {
        $pct = ((float)$r['v'] / $total) * 100;
        echo '<div style="display:flex;align-items:center;gap:8px;font-size:12.5px">'
           . '<i style="width:9px;height:9px;border-radius:2px;flex:0 0 9px;background:' . $colours[$i % count($colours)] . '"></i>'
           . '<span class="trunc" style="flex:1" title="' . e($r['dim']) . '">' . e($r['dim']) . '</span>'
           . '<strong style="color:var(--ink);font-variant-numeric:tabular-nums">' . e(number_format($pct, 1)) . '%</strong></div>';
    }
    echo '</div></div>';
}

/* ---------- heatmap grid --------------------------------------------------
   $cells is [rowLabel => [colLabel => value]]. Used for hour-by-day activity
   and for the click map. */
function ui_heat(array $cells, array $colLabels, string $unit = ''): void {
    if (!$cells) { ui_empty('Nothing recorded yet', 'This fills in once there is activity to plot.', 'heat'); return; }
    $max = 0.0;
    foreach ($cells as $row) { foreach ($row as $v) { $max = max($max, (float)$v); } }
    if ($max <= 0) $max = 1;

    $cols = count($colLabels);
    echo '<div style="overflow-x:auto"><div style="min-width:' . max(320, $cols * 22) . 'px">';
    echo '<div class="heat" style="grid-template-columns:56px repeat(' . $cols . ',minmax(0,1fr))">';
    echo '<div></div>';
    foreach ($colLabels as $cl) {
        echo '<div style="font-size:9.5px;color:var(--ink-4);text-align:center;padding-bottom:3px">' . e($cl) . '</div>';
    }
    foreach ($cells as $rowLabel => $row) {
        echo '<div style="font-size:11px;color:var(--ink-3);display:flex;align-items:center;padding-right:7px">' . e((string)$rowLabel) . '</div>';
        foreach ($colLabels as $cl) {
            $v = isset($row[$cl]) ? (float)$row[$cl] : 0.0;
            $intensity = $v / $max;
            $bg = $v > 0
                ? 'color-mix(in srgb, var(--c1) ' . round(12 + $intensity * 88) . '%, var(--surface))'
                : 'var(--line-2)';
            echo '<div class="heat__cell" style="background:' . $bg . '" '
               . 'title="' . e((string)$rowLabel . ' ' . $cl . ': ' . mp_num($v) . ' ' . $unit) . '"></div>';
        }
    }
    echo '</div>';
    echo '<div class="heat__scale"><span>Less</span><span class="heat__swatch">';
    foreach (array(12, 34, 56, 78, 100) as $s) {
        echo '<i style="background:color-mix(in srgb, var(--c1) ' . $s . '%, var(--surface))"></i>';
    }
    echo '</span><span>More</span><span style="margin-left:auto">Peak ' . e(mp_num($max)) . ' ' . e($unit) . '</span></div>';
    echo '</div></div>';
}

/* ---------- small helpers ------------------------------------------------- */
function ui_short(float $n): string {
    if (abs($n) >= 1000000) return rtrim(rtrim(number_format($n / 1000000, 1), '0'), '.') . 'M';
    if (abs($n) >= 1000)    return rtrim(rtrim(number_format($n / 1000, 1), '0'), '.') . 'k';
    if ($n != floor($n))    return number_format($n, 1);
    return number_format($n);
}

function ui_branch_name(string $locId): string {
    $map = array();
    foreach (array_filter(array_map('trim', explode(',', mp_get('gbp_location_ids')))) as $i => $id) {
        $map[preg_replace('~^locations/~', '', $id)] = $i === 0 ? 'MedPark Health Hub, Hurghada' : 'MedPark Hospital, El Quseir';
    }
    $k = preg_replace('~^locations/~', '', $locId);
    return isset($map[$k]) ? $map[$k] : $locId;
}

/* ==========================================================================
   Filters.

   Real cross-filtering, not decoration. It works because the GA4 connector
   stores country, language and device as paired rows in dim and dim2, so
   "German speakers on mobile in Egypt" is a query rather than a guess.
   ========================================================================== */
function ui_filter_state(): array {
    return array(
        'country'  => isset($_GET['fc']) ? (string)$_GET['fc'] : '',
        'language' => isset($_GET['fl']) ? (string)$_GET['fl'] : '',
        'device'   => isset($_GET['fd']) ? (string)$_GET['fd'] : '',
    );
}

function ui_filter_url(string $page, array $R, array $over = array()): string {
    $F = array_merge(ui_filter_state(), $over);
    $q = array('p' => $page, 'r' => $R['preset']);
    if ($F['country']  !== '') $q['fc'] = $F['country'];
    if ($F['language'] !== '') $q['fl'] = $F['language'];
    if ($F['device']   !== '') $q['fd'] = $F['device'];
    return '?' . http_build_query($q);
}

function ui_filters(string $page, array $R, string $from, string $to): void {
    $F = ui_filter_state();
    $active = ($F['country'] !== '') + ($F['language'] !== '') + ($F['device'] !== '');

    $countries = mp_pair_top('x_country_lang', $from, $to, 'dim', $F['language'] ?: null, 12);
    $languages = mp_pair_top('x_country_lang', $from, $to, 'dim2', $F['country'] ?: null, 12);
    $devices   = mp_pair_top('x_device_lang',  $from, $to, 'dim',  $F['language'] ?: null, 5);

    echo '<div class="card"><h3>Filters';
    if ($active) {
        echo ' <span class="tag" style="color:var(--a-d);border-color:var(--a)">' . $active . ' active</span>';
    }
    echo '</h3><div style="display:flex;gap:16px;flex-wrap:wrap;align-items:flex-start;padding:0 0 4px">';

    $group = function (string $label, string $key, array $rows, string $current) use ($page, $R) {
        echo '<div style="min-width:180px"><div style="font-size:10.5px;text-transform:uppercase;'
           . 'letter-spacing:.08em;color:var(--ink-3);font-weight:700;margin-bottom:6px">' . e($label) . '</div>'
           . '<div style="display:flex;flex-wrap:wrap;gap:5px">';
        echo '<a class="pill ' . ($current === '' ? 'pill--info' : 'pill--idle') . '" style="text-decoration:none"'
           . ' href="' . e(ui_filter_url($page, $R, array($key => ''))) . '">Any</a>';
        foreach ($rows as $r) {
            $v = (string)$r['dim'];
            if ($v === '') continue;
            $on = $current === $v;
            echo '<a class="pill ' . ($on ? 'pill--info' : 'pill--idle') . '" style="text-decoration:none"'
               . ' href="' . e(ui_filter_url($page, $R, array($key => $on ? '' : $v))) . '"'
               . ' title="' . e(mp_num($r['v']) . ' sessions') . '">' . e($v) . '</a>';
        }
        echo '</div></div>';
    };

    $group('Country',  'fc', $countries, $F['country']);
    $group('Language', 'fl', $languages, $F['language']);
    $group('Device',   'fd', $devices,   $F['device']);

    echo '</div>';
    if ($active) {
        echo '<p style="margin:10px 0 0"><a class="btn btn--sm" href="' . e(ui_filter_url($page, $R, array('country'=>'','language'=>'','device'=>''))) . '">Clear all filters</a></p>';
    }
    if (!$countries && !$languages) {
        echo '<p style="margin:8px 0 0;color:var(--ink-3);font-size:12.5px">Filters fill in once GA4 is connected and the first pull has run.</p>';
    }
    echo '</div>';
}

/* Sessions matching the current filter, which is what every filtered KPI
   on a page should be measured against. */
function ui_filtered_sessions(string $from, string $to): float {
    $F = ui_filter_state();
    if ($F['country'] !== '' || $F['language'] !== '') {
        return mp_pair_sum('x_country_lang', $from, $to, $F['country'] ?: null, $F['language'] ?: null);
    }
    if ($F['device'] !== '') {
        return mp_pair_sum('x_device_lang', $from, $to, $F['device'], null);
    }
    return mp_sum('ga4', 'sessions', $from, $to);
}
