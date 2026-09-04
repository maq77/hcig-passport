<?php
/* ==========================================================================
   Panels built from our own tracking.

   Added 2026-09-03, to answer a specific instruction: every page that was
   built around Google should offer a switch between "our tracking" and "GA4",
   and **each side must show its own full feature set** rather than the subset
   the two have in common.

   That rule is why this file exists instead of a source-swapping accessor.
   A shared accessor would have produced the lowest common denominator on both
   sides: no demographics on ours, no per-visit record on Google's. Instead
   each side keeps what only it can do.

   What only Google can answer          What only we can answer
   ---------------------------          -----------------------
   search queries and impressions       every individual visit, in order
   Ads cost and attribution             section-level read time
   cross-device identity                rage clicks, dead clicks, script errors
   age and gender estimates             uncapped history, no sampling
                                        traffic an ad blocker hides from GA4

   Each function here renders one card, so a page composes the ones that
   answer its question and nothing more.
   ========================================================================== */
declare(strict_types=1);

/* Shared formatting, so every panel says a duration the same way. */
function own_mins(float $seconds): string {
    if ($seconds <= 0) return '--';
    if ($seconds < 60) return round($seconds) . 's';
    return floor($seconds / 60) . 'm ' . str_pad((string)round(fmod($seconds, 60)), 2, '0', STR_PAD_LEFT) . 's';
}

function own_path(string $p): string {
    return $p === '' ? '-' : ($p === '/' ? '/ (home)' : $p);
}

/* Is there anything to draw? Every page checks this once and shows the same
   honest empty state rather than a screen of zeroes. */
function own_guard(string $from, string $to): bool {
    if (!mpa_has_data($from, $to)) {
        $today = mpa_today();
        echo '<div class="card"><h3>Nothing collected for these dates yet</h3>';
        if ($today['sessions'] > 0) {
            echo '<p class="muted" style="max-width:70ch">There '
               . ($today['sessions'] === 1 ? 'is ' : 'are ')
               . '<strong>' . e(mp_num($today['sessions'])) . '</strong> '
               . ($today['sessions'] === 1 ? 'visit' : 'visits')
               . ' today. Date ranges end yesterday, so today appears here tomorrow.</p>';
        }
        echo '<p class="muted" style="max-width:70ch">This page fills itself in from tracking that '
           . 'runs on our own server. Nothing here depends on a Google account, and nothing here '
           . 'can be hidden by an ad blocker.</p></div>';
        return false;
    }
    return true;
}

/* ---------- headline ------------------------------------------------------ */
function own_headline(string $f, string $t, string $pf, string $pt, bool $withTrend = true): void {
    $K = mpa_kpis($f, $t);
    $P = mpa_kpis($pf, $pt);

    echo '<div class="grid g4">';
    ui_stat('sessions', mp_num($K['sessions']), mp_delta($K['sessions'], $P['sessions']),
            mpa_series('sessions', $f, $t), true);
    ui_stat('own_visitors', mp_num($K['visitors']), mp_delta($K['visitors'], $P['visitors']),
            mpa_series('visitors', $f, $t));
    ui_stat('own_conversions', mp_num($K['conversions']), mp_delta($K['conversions'], $P['conversions']),
            mpa_series('conversions', $f, $t), true, '', 'var(--c2)');
    ui_stat('own_conv_rate', $K['conversion_rate'] . '%',
            mp_delta($K['conversion_rate'], $P['conversion_rate']), array(), false, '', 'var(--c2)');
    echo '</div>';

    echo '<div class="grid g4">';
    ui_stat('own_pageviews', mp_num($K['pageviews']), mp_delta($K['pageviews'], $P['pageviews']),
            mpa_series('pageviews', $f, $t));
    ui_stat('own_engaged', own_mins($K['avg_engaged']), mp_delta($K['avg_engaged'], $P['avg_engaged']));
    ui_stat('own_pages_per', (string)$K['pages_per_session'],
            mp_delta($K['pages_per_session'], $P['pages_per_session']));
    ui_stat('own_bounce', $K['bounce_rate'] . '%', mp_delta($P['bounce_rate'], $K['bounce_rate']));
    echo '</div>';

    if ($withTrend) {
        echo '<div class="card"><h3>Visits and enquiries <span class="hint">same scale, so the gap is visible</span></h3>';
        $sS = mpa_series('sessions', $f, $t);
        $sC = mpa_series('conversions', $f, $t);
        if (count($sS) > 1) {
            ui_line(array(array('name' => 'Visits', 'rows' => $sS),
                          array('name' => 'Enquiries', 'rows' => $sC)));
        } else {
            ui_empty('Not enough days yet', 'A trend needs two days of collection.', 'pulse');
        }
        echo '</div>';
    }
}

/* ---------- where visits come from ---------------------------------------- */
function own_channels(string $f, string $t): void {
    echo '<div class="grid g3">';
    echo '<div class="card card--pad0"><h3>How they arrived</h3>';
    $ch = mpa_top('by_ref_type', $f, $t, 7);
    foreach ($ch as &$r) { $r['dim'] = mpa_channel_label((string)$r['dim']); }
    unset($r);
    ui_hbars($ch, 7);
    echo '</div>';

    echo '<div class="card card--pad0"><h3>Which source</h3>';
    ui_hbars(mpa_top('by_source', $f, $t, 7), 7, 'var(--c2)');
    echo '</div>';

    echo '<div class="card card--pad0"><h3>Campaign <span class="hint">utm_campaign</span></h3>';
    $c = mpa_top('by_campaign', $f, $t, 7);
    if ($c) ui_hbars($c, 7, 'var(--c3)');
    else ui_empty('No campaigns tagged', 'Add utm_campaign to an advert or a newsletter link and it appears here.', 'target');
    echo '</div>';
    echo '</div>';
}

/* Which channel is worth having, rather than which is biggest. */
function own_channel_quality(string $f, string $t): void {
    $K = mpa_kpis($f, $t);
    echo '<div class="card card--pad0"><h3>Which channels turn into enquiries '
       . '<span class="hint">the rate matters more than the count</span></h3>';
    $rows = mpa_segment('ref_type', $f, $t, 8);
    if (!$rows) {
        ui_empty('Not enough visits yet', 'Fills in as traffic arrives.', 'pulse');
    } else {
        $best = 0.0;
        foreach ($rows as $r) $best = max($best, (float)$r['rate']);
        echo '<div class="tw"><table><thead><tr><th>Channel</th><th class="n">Visits</th>'
           . '<th class="n">Enquiries</th><th style="width:110px"></th><th class="n">Rate</th>'
           . '<th class="n">Time on site</th></tr></thead><tbody>';
        foreach ($rows as $r) {
            $w = $best > 0 ? ((float)$r['rate'] / $best) * 100 : 0;
            $poor = $K['conversion_rate'] > 0 && (float)$r['rate'] < $K['conversion_rate'] * 0.5 && (float)$r['n'] >= 30;
            echo '<tr><td><strong>' . e(mpa_channel_label((string)$r['dim'])) . '</strong></td>'
               . '<td class="n">' . e(mp_num($r['n'])) . '</td>'
               . '<td class="n">' . e(mp_num($r['conv'])) . '</td>'
               . '<td><span class="bar"><i style="width:' . round($w) . '%"></i></span></td>'
               . '<td class="n"><strong' . ($poor ? ' class="down"' : '') . '>' . e(number_format((float)$r['rate'], 1)) . '%</strong></td>'
               . '<td class="n muted nw">' . e(own_mins((float)$r['avg_time'])) . '</td></tr>';
        }
        echo '</tbody></table></div>';
    }
    echo '</div>';
}

/* ---------- who they are -------------------------------------------------- */
function own_geo(string $f, string $t, bool $withCities = true): void {
    $geoOn = function_exists('mpa_geo_ready') && mpa_geo_ready();

    echo '<div class="grid g3">';
    echo '<div class="card card--pad0"><h3>Country</h3>';
    if (!$geoOn) {
        ui_empty('Geography not installed yet',
                 'Add the MaxMind licence key in Settings and run tools/geoip-update.sh once.', 'globe');
    } else {
        $rows = mpa_top('by_country', $f, $t, 8);
        foreach ($rows as &$r) { $r['dim'] = mpa_country_name((string)$r['dim']); }
        unset($r);
        ui_hbars($rows, 8, 'var(--c3)');
    }
    echo '</div>';

    echo '<div class="card card--pad0"><h3>' . ($withCities ? 'City' : 'Region') . '</h3>';
    $rows = mpa_top($withCities ? 'by_city' : 'by_country', $f, $t, 8);
    if ($rows) ui_hbars($rows, 8, 'var(--c5)');
    else ui_empty('No city recorded yet', 'Cities come from the same database as countries.', 'map');
    echo '</div>';

    echo '<div class="card card--pad0"><h3>Language they read in</h3>';
    $rows = array();
    foreach (mpa_visits_by_lang($f, $t, 8) as $r) {
        $rows[] = array('dim' => mpa_lang_label((string)$r['dim']), 'v' => (float)$r['n']);
    }
    ui_hbars($rows, 8, 'var(--c4)');
    echo '</div>';
    echo '</div>';
}

function own_devices(string $f, string $t): void {
    echo '<div class="grid g3">';
    echo '<div class="card card--pad0"><h3>Device</h3>';
    ui_hbars(mpa_top('by_device', $f, $t, 4), 4, 'var(--c4)');
    echo '</div>';
    echo '<div class="card card--pad0"><h3>Browser</h3>';
    ui_hbars(mpa_top('by_browser', $f, $t, 6), 6, 'var(--c5)');
    echo '</div>';
    echo '<div class="card card--pad0"><h3>Operating system</h3>';
    ui_hbars(mpa_top('by_os', $f, $t, 6), 6, 'var(--c6)');
    echo '</div>';
    echo '</div>';
}

/* ---------- pages --------------------------------------------------------- */
function own_pages(string $f, string $t, string $rangePreset = '28d', int $limit = 15): void {
    echo '<div class="card card--pad0"><h3>Pages '
       . '<span class="hint">views are vanity, the last column is not</span></h3>';
    $rows = mpa_pages($f, $t, $limit);
    if (!$rows) {
        ui_empty('No pages recorded yet', 'Fills in on the next import.', 'pulse');
    } else {
        echo '<div class="tw"><table><thead><tr><th>Page</th><th class="n">Views</th>'
           . '<th class="n">Time on page</th><th class="n">Read to</th>'
           . '<th class="n">Left from here</th><th class="n">Enquiries</th></tr></thead><tbody>';
        foreach ($rows as $p) {
            $exitPct = (float)$p['views'] > 0 ? round((float)$p['exits'] / (float)$p['views'] * 100) : 0;
            $dead = (int)$p['enquiries'] === 0 && (float)$p['views'] >= 40;
            echo '<tr><td class="trunc" title="' . e($p['path']) . '">'
               . '<a href="?p=visits&amp;r=' . e($rangePreset) . '&amp;path=' . e(rawurlencode((string)$p['path'])) . '">'
               . e(own_path((string)$p['path'])) . '</a></td>'
               . '<td class="n">' . e(mp_num($p['views'])) . '</td>'
               . '<td class="n muted nw">' . e(own_mins((float)$p['avg_time'])) . '</td>'
               . '<td class="n muted">' . e(round((float)$p['avg_scroll'])) . '%</td>'
               . '<td class="n muted">' . $exitPct . '%</td>'
               . '<td class="n"><strong' . ($dead ? ' class="down"' : '') . '>'
               . e(mp_num($p['enquiries'])) . '</strong></td></tr>';
        }
        echo '</tbody></table></div>';
    }
    echo '</div>';
}

/* ---------- getting in touch ---------------------------------------------- */
function own_contacts(string $f, string $t): void {
    $mix = array();
    foreach (array('whatsapp_click' => 'WhatsApp', 'call_click' => 'Phone',
                   'enquiry_submit' => 'Form', 'email_click' => 'Email',
                   'chat_lead' => 'Assistant') as $ev => $lab) {
        $mix[] = array('dim' => $lab, 'v' => (float)mpa_ev_count($ev, $f, $t));
    }

    echo '<div class="grid g-2-1">';
    echo '<div class="card card--pad0"><h3>How they got in touch '
       . '<span class="hint">counted as actions, not visits</span></h3>';
    ui_stack($mix);
    echo '<h3 style="margin-top:18px">Which control they pressed</h3>';
    $pl = array();
    foreach (array('whatsapp_click', 'call_click') as $ev) {
        foreach (mpa_ev_by($ev, 'placement', $f, $t, 8) as $r) {
            $k = ucfirst(mpa_placement_label((string)$r['dim']));
            $pl[$k] = (isset($pl[$k]) ? $pl[$k] : 0) + (float)$r['v'];
        }
    }
    arsort($pl);
    $rows = array();
    foreach ($pl as $k => $v) $rows[] = array('dim' => $k, 'v' => $v);
    if ($rows) ui_hbars($rows, 7, 'var(--c2)');
    else ui_empty('Nothing pressed yet', 'Fills in on the first call or message.', 'phone');
    echo '</div>';

    echo '<div class="card card--pad0"><h3>Arriving to enquiring '
       . '<span class="hint">real visits at each step</span></h3>';
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
           . '<span class="hb__t"><i style="width:' . round($pct) . '%;background:var(--c' . ($i + 1) . ')"></i></span>'
           . '<b class="hb__v">' . e(mp_num($s['n'])) . '</b></div>';
    }
    echo '</div></div>';
    echo '</div>';
}

/* The enquiries themselves, each one openable. This is the panel GA4 cannot
   produce at all: a list of the actual visits that got in touch. */
function own_recent_enquiries(string $f, string $t, string $rangePreset = '28d', int $limit = 12): void {
    echo '<div class="card card--pad0"><h3>The enquiries themselves '
       . '<span class="hint">open one to see the whole visit that led to it</span></h3>';
    $rows = mpa_sessions_list($f, $t, array('converted' => 1, 'limit' => $limit));
    if (!$rows) {
        ui_empty('No enquiries in this period', 'Every call, message, email and form appears here.', 'phone');
    } else {
        echo '<div class="tw"><table><thead><tr><th>When</th><th>Where</th><th>Device</th>'
           . '<th>Came from</th><th>Landed on</th><th class="n">Pages</th><th class="n">Read</th>'
           . '<th></th></tr></thead><tbody>';
        foreach ($rows as $r) {
            $ago = max(0, time() - (int)$r['started_ts']);
            $when = $ago < 5400 ? round($ago / 60) . 'm ago'
                  : ($ago < 172800 ? round($ago / 3600) . 'h ago' : round($ago / 86400) . 'd ago');
            $where = (string)$r['country'] !== '' ? mpa_country_name((string)$r['country']) : '-';
            echo '<tr><td class="muted nw">' . e($when) . '</td>'
               . '<td class="trunc">' . e($where) . '</td>'
               . '<td class="muted">' . e((string)$r['device']) . '</td>'
               . '<td class="trunc muted">' . e((string)$r['source'] !== '' ? (string)$r['source'] : mpa_channel_label((string)$r['ref_type'])) . '</td>'
               . '<td class="trunc">' . e(own_path((string)$r['entry_path'])) . '</td>'
               . '<td class="n">' . e(mp_num($r['pageviews'])) . '</td>'
               . '<td class="n muted nw">' . e(own_mins((float)$r['engaged'])) . '</td>'
               . '<td class="n"><a class="btn btn--sm" href="?p=visits&amp;r=' . e($rangePreset)
               . '&amp;sid=' . e((string)$r['sid']) . '">Open</a></td></tr>';
        }
        echo '</tbody></table></div>';
    }
    echo '</div>';
}

/* ---------- search, from our side ----------------------------------------- */
function own_search(string $f, string $t): void {
    $visits = mpa_channel_visits('search', $f, $t);
    $ai     = mpa_channel_visits('ai', $f, $t);

    echo '<div class="grid g4">';
    ui_kpi('Visits from search', mp_num($visits), null, 'Arrived from a search engine', true);
    ui_kpi('Visits from AI assistants', mp_num($ai), null, 'ChatGPT, Perplexity, Gemini, Claude, Copilot');
    ui_kpi('Enquiries from search', mp_num(array_sum(array_map(
        function ($r) { return (float)$r['conv']; }, mpa_segment_in('source', 'ref_type', 'search', $f, $t, 20)))),
        null, 'Calls and messages from search visits');
    ui_kpi('Enquiries from AI', mp_num(array_sum(array_map(
        function ($r) { return (float)$r['conv']; }, mpa_segment_in('source', 'ref_type', 'ai', $f, $t, 20)))),
        null, 'The channel that did not exist last year');
    echo '</div>';

    echo '<div class="grid g2">';
    echo '<div class="card card--pad0"><h3>Which search engine</h3>';
    $rows = array();
    foreach (mpa_segment_in('source', 'ref_type', 'search', $f, $t, 8) as $r) {
        $rows[] = array('dim' => (string)$r['dim'], 'v' => (float)$r['v']);
    }
    if ($rows) ui_hbars($rows, 8);
    else ui_empty('No search visits recorded yet', 'Fills in as people arrive from a search engine.', 'search');
    echo '</div>';

    echo '<div class="card card--pad0"><h3>Which AI assistant</h3>';
    $rows = array();
    foreach (mpa_segment_in('source', 'ref_type', 'ai', $f, $t, 8) as $r) {
        $rows[] = array('dim' => (string)$r['dim'], 'v' => (float)$r['v']);
    }
    if ($rows) ui_hbars($rows, 8, 'var(--c4)');
    else ui_empty('No visits from an AI assistant yet',
                  'A visit arriving from ChatGPT or Perplexity is counted separately here rather than '
                . 'buried inside referrals.', 'sparkles');
    echo '</div>';
    echo '</div>';

    echo '<div class="card card--pad0"><h3>Pages people land on from search '
       . '<span class="hint">with the enquiry rate of each</span></h3>';
    $rows = mpa_segment_in('entry_path', 'ref_type', 'search', $f, $t, 12);
    if (!$rows) {
        ui_empty('Nothing yet', 'Fills in as search visits arrive.', 'search');
    } else {
        echo '<div class="tw"><table><thead><tr><th>Landing page</th><th class="n">Visits</th>'
           . '<th class="n">Enquiries</th><th class="n">Rate</th></tr></thead><tbody>';
        foreach ($rows as $r) {
            echo '<tr><td class="trunc" title="' . e($r['dim']) . '">' . e(own_path((string)$r['dim'])) . '</td>'
               . '<td class="n">' . e(mp_num($r['v'])) . '</td>'
               . '<td class="n">' . e(mp_num($r['conv'])) . '</td>'
               . '<td class="n"><strong>' . e(number_format((float)$r['rate'], 1)) . '%</strong></td></tr>';
        }
        echo '</tbody></table></div>';
    }
    echo '</div>';

    own_boundary('Search queries, impressions and average position come from Google Search Console '
               . 'and cannot be measured from our own server: a search happens on Google, not on this '
               . 'website. Switch to GA4 and Search Console above for those. What is here instead is '
               . 'what happened after the click, which Search Console cannot see.');
}

/* ---------- maps and directions ------------------------------------------- */
function own_local(string $f, string $t): void {
    $maps = mpa_channel_visits('maps', $f, $t);
    $dir  = mpa_ev_count('directions_click', $f, $t);

    echo '<div class="grid g4">';
    ui_kpi('Visits from Google Maps', mp_num($maps), null, 'Arrived from a maps listing', true);
    ui_kpi('Directions pressed', mp_num($dir), null, 'On the website, not on the listing');
    ui_kpi('Calls from the website', mp_num(mpa_ev_count('call_click', $f, $t)), null, 'Every language');
    ui_kpi('WhatsApp taps', mp_num(mpa_ev_count('whatsapp_click', $f, $t)), null, 'Every language');
    echo '</div>';

    echo '<div class="grid g2">';
    echo '<div class="card card--pad0"><h3>Where the directions were pressed</h3>';
    $rows = mpa_ev_by('directions_click', 'path', $f, $t, 8);
    foreach ($rows as &$r) { $r['dim'] = own_path((string)$r['dim']); }
    unset($r);
    if ($rows) ui_hbars($rows, 8, 'var(--c5)');
    else ui_empty('Nobody has pressed directions yet',
                  'The link on the location pages is tracked. This fills in on the first press.', 'map');
    echo '</div>';
    echo '<div class="card card--pad0"><h3>Country of the people pressing directions</h3>';
    $rows = mpa_ev_by('directions_click', 'country', $f, $t, 8);
    foreach ($rows as &$r) { $r['dim'] = mpa_country_name((string)$r['dim']); }
    unset($r);
    if ($rows) ui_hbars($rows, 8, 'var(--c3)');
    else ui_empty('Nothing yet', 'Fills in with the first press.', 'globe');
    echo '</div>';
    echo '</div>';

    own_boundary('Views, searches and calls recorded on the Business Profile itself belong to Google '
               . 'and need the Business Profile connected. Switch to GA4 above for those. What is here '
               . 'is what people did once they reached the website, which the Business Profile cannot see.');
}

/* ---------- when ---------------------------------------------------------- */
function own_hours(string $f, string $t): void {
    echo '<div class="card"><h3>When people visit <span class="hint">hour of the day, UTC</span></h3>';
    $rows = mpa_top('by_hour', $f, $t, 24);
    if (!$rows) {
        ui_empty('Nothing to plot yet', 'Fills in as visits arrive.', 'pulse');
    } else {
        $byHour = array();
        foreach ($rows as $r) $byHour[str_pad((string)(int)$r['dim'], 2, '0', STR_PAD_LEFT)] = (float)$r['v'];
        ksort($byHour);
        $cells = array('Visits' => $byHour);
        $cols = array();
        for ($h = 0; $h < 24; $h++) $cols[] = str_pad((string)$h, 2, '0', STR_PAD_LEFT);
        ui_heat($cells, $cols, 'visits');
        echo '<p class="muted" style="font-size:12.5px;margin:10px 0 0">Egypt runs two hours ahead of UTC.</p>';
    }
    echo '</div>';
}

/* ---------- the things only we have --------------------------------------- */
function own_frustration(string $f, string $t): void {
    echo '<div class="card card--pad0"><h3>Signs of trouble '
       . '<span class="hint">recorded in real browsers, and reported by nobody</span></h3>';
    $trouble = array(
        array('dim' => 'Rage clicks',     'v' => mpa_ev_count('rage_click', $f, $t)),
        array('dim' => 'Dead clicks',     'v' => mpa_ev_count('dead_click', $f, $t)),
        array('dim' => 'Forms abandoned', 'v' => mpa_ev_count('form_abandon', $f, $t)),
        array('dim' => 'Script errors',   'v' => mpa_ev_count('js_error', $f, $t)),
    );
    $any = false;
    foreach ($trouble as $x) if ($x['v'] > 0) $any = true;
    if ($any) ui_hbars($trouble, 4, 'var(--c6)');
    else ui_empty('Nothing recorded', 'No rage clicks, dead clicks, abandoned forms or script errors.', 'pulse');
    echo '</div>';
}

/* The note that keeps the two sides honest about each other. */
function own_boundary(string $text): void {
    echo '<p class="muted" style="font-size:12.5px;margin-top:14px;max-width:85ch">'
       . e($text) . '</p>';
}

function own_footnote(): void {
    own_boundary('Collected on this server. No address is stored, and by default nothing at all is '
               . 'written to a visitor\'s device. These numbers read higher than Google Analytics '
               . 'because a first-party script is not blocked the way a Google tag is.');
}

/* A breakdown with the enquiry rate beside it, which is the only column that
   decides anything. Used by the geography and audience pages. */
function own_segment_table(string $column, string $head, string $f, string $t,
                           int $limit = 12, ?callable $label = null): void {
    $K = mpa_kpis($f, $t);
    $rows = mpa_segment($column, $f, $t, $limit);
    echo '<div class="card card--pad0"><h3>' . e($head)
       . ' <span class="hint">visits, and how many of them got in touch</span></h3>';
    if (!$rows) {
        ui_empty('Nothing recorded yet', 'Fills in as visits arrive.', 'globe');
    } else {
        $best = 0.0;
        foreach ($rows as $r) $best = max($best, (float)$r['rate']);
        echo '<div class="tw"><table><thead><tr><th>' . e($head) . '</th><th class="n">Visits</th>'
           . '<th class="n">Enquiries</th><th style="width:110px"></th><th class="n">Rate</th>'
           . '<th class="n">Time on site</th></tr></thead><tbody>';
        foreach ($rows as $r) {
            $name = $label ? $label((string)$r['dim']) : (string)$r['dim'];
            $w = $best > 0 ? ((float)$r['rate'] / $best) * 100 : 0;
            $poor = $K['conversion_rate'] > 0 && (float)$r['rate'] < $K['conversion_rate'] * 0.5 && (float)$r['n'] >= 30;
            echo '<tr><td class="trunc" title="' . e($name) . '"><strong>' . e($name) . '</strong></td>'
               . '<td class="n">' . e(mp_num($r['n'])) . '</td>'
               . '<td class="n">' . e(mp_num($r['conv'])) . '</td>'
               . '<td><span class="bar"><i style="width:' . round($w) . '%"></i></span></td>'
               . '<td class="n"><strong' . ($poor ? ' class="down"' : '') . '>'
               . e(number_format((float)$r['rate'], 1)) . '%</strong></td>'
               . '<td class="n muted nw">' . e(own_mins((float)$r['avg_time'])) . '</td></tr>';
        }
        echo '</tbody></table></div>';
    }
    echo '</div>';
}

/* ==========================================================================
   Whole pages, composed from the panels above.

   One function per page that carries a source switch, so the view file itself
   stays two lines longer and nothing else changes.
   ========================================================================== */

function own_page_overview(array $R): void {
    $f = $R['from']; $t = $R['to'];
    /* Requests come before the guard: they are stored by the website, not by
       the tracker, so they exist even on a date range the tracker never saw. */
    own_requests($f, $t, $R['preset']);
    if (!own_guard($f, $t)) return;
    own_headline($f, $t, $R['prev_from'], $R['prev_to']);
    own_channels($f, $t);
    own_contacts($f, $t);
    own_pages($f, $t, $R['preset'], 12);
    own_geo($f, $t);
    own_footnote();
}

function own_page_traffic(array $R): void {
    $f = $R['from']; $t = $R['to'];
    if (!own_guard($f, $t)) return;
    own_headline($f, $t, $R['prev_from'], $R['prev_to']);
    own_channels($f, $t);
    own_channel_quality($f, $t);
    own_geo($f, $t);
    own_devices($f, $t);
    own_segment_table('lang', 'Language', $f, $t, 8, function ($v) { return mpa_lang_label($v); });
    own_hours($f, $t);
    own_boundary('Age, gender and interest estimates come from Google\'s own profile of the visitor '
               . 'and cannot be measured from a website. Switch to GA4 above for those, and treat '
               . 'them as estimates rather than facts.');
    own_footnote();
}

function own_page_conversions(array $R): void {
    $f = $R['from']; $t = $R['to'];
    own_requests($f, $t, $R['preset']);
    if (!own_guard($f, $t)) return;
    $K = mpa_kpis($f, $t);
    $P = mpa_kpis($R['prev_from'], $R['prev_to']);

    echo '<div class="grid g4">';
    ui_stat('own_conversions', mp_num($K['conversions']), mp_delta($K['conversions'], $P['conversions']),
            mpa_series('conversions', $f, $t), true, '', 'var(--c2)');
    ui_stat('own_conv_rate', $K['conversion_rate'] . '%',
            mp_delta($K['conversion_rate'], $P['conversion_rate']), array(), true, '', 'var(--c2)');
    ui_kpi('WhatsApp taps', mp_num(mpa_ev_count('whatsapp_click', $f, $t)),
           mp_delta(mpa_ev_count('whatsapp_click', $f, $t), mpa_ev_count('whatsapp_click', $R['prev_from'], $R['prev_to'])),
           'Every language');
    ui_kpi('Calls', mp_num(mpa_ev_count('call_click', $f, $t)),
           mp_delta(mpa_ev_count('call_click', $f, $t), mpa_ev_count('call_click', $R['prev_from'], $R['prev_to'])),
           'Taps on a phone number');
    echo '</div>';

    own_contacts($f, $t);
    own_channel_quality($f, $t);
    own_recent_enquiries($f, $t, $R['preset'], 15);
    own_pages($f, $t, $R['preset'], 12);
    own_frustration($f, $t);
    own_boundary('Advertising cost, cost per enquiry and cross-device journeys need Google Ads and '
               . 'GA4 connected. What is here instead is every enquiry as an individual visit, which '
               . 'GA4 cannot show at all.');
    own_footnote();
}

function own_page_geo(array $R): void {
    $f = $R['from']; $t = $R['to'];
    if (!own_guard($f, $t)) return;
    own_geo($f, $t);
    own_segment_table('country', 'Country', $f, $t, 15, function ($v) { return mpa_country_name($v); });
    own_segment_table('city', 'City', $f, $t, 15);
    own_segment_table('lang', 'Language', $f, $t, 8, function ($v) { return mpa_lang_label($v); });
    own_boundary('Country and city come from a MaxMind database held on this server. No address is '
               . 'ever sent anywhere, and no address is stored. City accuracy is good in Europe and '
               . 'weaker on mobile networks, so read cities as a strong hint rather than a fact.');
    own_footnote();
}

function own_page_seo(array $R): void {
    $f = $R['from']; $t = $R['to'];
    if (!own_guard($f, $t)) return;
    own_search($f, $t);
    own_footnote();
}

function own_page_local(array $R): void {
    $f = $R['from']; $t = $R['to'];
    if (!own_guard($f, $t)) return;
    own_local($f, $t);
    own_footnote();
}

/* ---------------------------------------------------------------------------
   Appointment requests.

   Added 2026-09-04, when the booking form started capturing real requests.
   Deliberately not source-dependent: a request is stored by the website's own
   form handler whichever analytics anybody prefers to read, so this panel says
   the same thing on both sides of the source switch. The note explains why,
   because a number that does not move when the toggle moves looks broken.
   ------------------------------------------------------------------------ */
function own_requests(string $f, string $t, string $rangePreset = '28d'): void {
    $req = mp_requests($f, $t);

    echo '<div class="grid g4">';
    ui_stat('requests', mp_num($req['total']), null, mp_requests_series($f, $t), true,
            'name and number left', 'var(--c2)');
    ui_stat('requests_form', mp_num($req['form']), null, array(), false, 'the booking form');
    ui_stat('requests_assistant', mp_num($req['assistant']), null, array(), false, 'the assistant');
    ui_stat('requests_waiting', mp_num($req['waiting_all']), null, array(), $req['waiting_all'] > 0,
            $req['waiting_all'] > 0 ? 'nobody has answered these' : 'all dealt with',
            $req['waiting_all'] > 0 ? 'var(--c6)' : 'var(--c5)');
    echo '</div>';

    echo '<div class="card card--pad0"><h3>The requests themselves '
       . '<span class="hint">the closest thing this website produces to a patient</span></h3>';

    try {
        $st = mp_db()->prepare(
            "SELECT created_at, kind, name, phone, branch, service, status
             FROM chat_leads WHERE site = :site AND date(created_at) BETWEEN :a AND :b
             ORDER BY id DESC LIMIT 12");
        $st->execute(array(':site' => mp_current_site(), ':a' => $f, ':b' => $t));
        $rows = $st->fetchAll();
    } catch (Throwable $e) { $rows = array(); }

    if (!$rows) {
        ui_empty('No requests in this period',
                 $req['ever'] > 0
                   ? 'There are requests, just not between these dates. Widen the range above.'
                   : 'The booking form writes here the moment somebody sends it, and so does the '
                   . 'assistant when a visitor leaves their details.', 'inbox');
    } else {
        echo '<div class="tw"><table><thead><tr><th>Arrived</th><th>From</th><th>Name</th>'
           . '<th>Hospital</th><th>Wants</th><th>Status</th><th></th></tr></thead><tbody>';
        foreach ($rows as $r) {
            $ts  = strtotime((string)$r['created_at']);
            $ago = $ts ? time() - $ts : 0;
            $when = !$ts ? '-'
                  : ($ago < 5400 ? max(1, (int)round($ago / 60)) . 'm ago'
                  : ($ago < 172800 ? (int)round($ago / 3600) . 'h ago' : gmdate('j M', $ts)));
            $st2 = (string)$r['status'];
            $cls = $st2 === 'new' ? 'wait' : ($st2 === 'closed' ? 'idle' : 'ok');
            echo '<tr><td class="muted nw">' . e($when) . '</td>'
               . '<td>' . e($r['kind'] === 'appointment_form' ? 'Booking form' : 'Assistant') . '</td>'
               . '<td><strong>' . e((string)$r['name']) . '</strong></td>'
               . '<td class="trunc muted">' . e((string)$r['branch'] !== '' ? (string)$r['branch'] : '-') . '</td>'
               . '<td class="trunc">' . e((string)$r['service'] !== '' ? (string)$r['service'] : '-') . '</td>'
               . '<td><span class="pill pill--' . $cls . '">' . e($st2) . '</span></td>'
               . '<td class="n"><a class="btn btn--sm" href="?p=leads&amp;r=' . e($rangePreset) . '">Open</a></td>'
               . '</tr>';
        }
        echo '</tbody></table></div>';
    }
    echo '<p class="card__note">Counted the same way whichever data source is selected above, '
       . 'because these are stored by the website itself rather than by any analytics. '
       . 'Names and numbers live only here and on the Appointment requests page.</p>';
    echo '</div>';
}
