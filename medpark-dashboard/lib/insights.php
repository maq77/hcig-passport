<?php
/* ==========================================================================
   Insights.

   Reads what the connectors stored and says what it means. A number on its own
   is not a report. Every finding here carries a severity, what was measured,
   and what to do about it.

   Rules kept deliberately conservative: a finding only fires when the data
   supporting it actually exists, so an unconnected source stays silent instead
   of inventing a problem.
   ========================================================================== */
declare(strict_types=1);

function mp_finding(array &$out, string $sev, string $area, string $title, string $detail, string $advice): void {
    $out[] = array('severity'=>$sev, 'area'=>$area, 'title'=>$title, 'detail'=>$detail, 'advice'=>$advice);
}

function mp_insights(array $r): array {
    $f = array();
    $from = $r['from']; $to = $r['to'];
    $pf = $r['prev_from']; $pt = $r['prev_to'];
    $today = gmdate('Y-m-d');

    /* ---------- site health, works with no credentials at all ------------- */
    if (mp_has_data('health')) {
        $answering = (float)mp_sum('health', 'variants_answering_200', $from, $today);
        $st = mp_db()->prepare("SELECT dim, value FROM metrics WHERE source='health' AND metric='variant_status' AND day=(SELECT MAX(day) FROM metrics WHERE source='health')");
        $st->execute();
        $variants = $st->fetchAll();
        $live = array();
        foreach ($variants as $v) { if ((int)$v['value'] === 200) $live[] = $v['dim']; }
        if (count($live) > 1) {
            mp_finding($f, 'high', 'SEO',
                count($live) . ' address variants all answer directly',
                implode(', ', $live) . ' each return 200 instead of redirecting to one canonical address.',
                'Pick one address, https with www, and 301 everything else to it. Google is currently free to treat these as separate sites, which splits ranking signals between them.');
        }

        $sslLeft = (float)mp_sum('health', 'ssl_days_left', $today, $today);
        if ($sslLeft > 0 && $sslLeft < 21) {
            mp_finding($f, $sslLeft < 7 ? 'high' : 'medium', 'Health',
                'SSL certificate expires in ' . (int)$sslLeft . ' days',
                'The certificate for the site is close to expiry.',
                'Confirm auto renewal in cPanel. If it lapses, every browser blocks the site outright.');
        }

        $st = mp_db()->prepare("SELECT dim, value FROM metrics WHERE source='health' AND metric='page_status' AND day=(SELECT MAX(day) FROM metrics WHERE source='health')");
        $st->execute();
        foreach ($st->fetchAll() as $p) {
            $code = (int)$p['value'];
            if ($code >= 400 || $code === 0) {
                $sev = in_array($p['dim'], array('/', '/emergency-urgent-care'), true) ? 'high' : 'medium';
                mp_finding($f, $sev, 'Health',
                    $p['dim'] . ' returns ' . ($code ?: 'no response'),
                    'A page the dashboard checks daily is not serving correctly.',
                    $p['dim'] === '/llms.txt'
                        ? 'llms.txt is the file AI crawlers read to understand the site. Publishing it is a small job with direct effect on AI visibility.'
                        : 'Check this page before the next reporting cycle. A broken emergency page costs patients, not just rankings.');
            }
        }

        $st = mp_db()->prepare("SELECT dim, value FROM metrics WHERE source='health' AND metric='page_ttfb_ms' AND day=(SELECT MAX(day) FROM metrics WHERE source='health') AND value > 1200 ORDER BY value DESC LIMIT 3");
        $st->execute();
        foreach ($st->fetchAll() as $p) {
            mp_finding($f, 'medium', 'Speed',
                'Slow server response on ' . $p['dim'],
                'Time to first byte was ' . round((float)$p['value']) . ' ms. Anything over 800 ms is felt by the visitor before a single pixel is drawn.',
                'This is server side, not design. Check PHP version, caching and any slow database calls on that page.');
        }

        foreach (array('has_tracking'=>'Conversion tracking', 'has_ga4'=>'GA4', 'has_schema'=>'Structured data', 'has_canonical'=>'Canonical tag', 'has_hreflang'=>'Hreflang tags') as $k => $label) {
            $v = mp_sum('health', $k, $today, $today);
            $any = mp_db()->prepare("SELECT 1 FROM metrics WHERE source='health' AND metric=:m LIMIT 1");
            $any->execute(array(':m'=>$k));
            if ($any->fetchColumn() && $v < 1) {
                mp_finding($f, $k === 'has_tracking' ? 'high' : 'medium', 'SEO',
                    $label . ' is missing from the home page',
                    'The daily check did not find it in the served HTML.',
                    $k === 'has_tracking'
                        ? 'Without this, calls and WhatsApp taps are not counted and the monthly report has no conversion number.'
                        : 'This affects how search engines and AI assistants read the page.');
            }
        }
    }

    /* ---------- speed ------------------------------------------------------ */
    if (mp_has_data('psi')) {
        $st = mp_db()->prepare("SELECT dim, value FROM metrics WHERE source='psi' AND metric='score_performance' AND day=(SELECT MAX(day) FROM metrics WHERE source='psi') ORDER BY value ASC");
        $st->execute();
        foreach ($st->fetchAll() as $row) {
            $score = (float)$row['value'];
            if ($score < 50) {
                mp_finding($f, 'high', 'Speed',
                    'Performance score ' . round($score) . ' on ' . str_replace('|', ', ', $row['dim']),
                    'Google treats anything under 50 as poor.',
                    'Most tourist traffic here is mobile on hotel wifi. A slow first load loses the visit before the page is read.');
                break;
            }
        }
        $st = mp_db()->prepare("SELECT dim, value FROM metrics WHERE source='psi' AND metric='lcp' AND day=(SELECT MAX(day) FROM metrics WHERE source='psi') AND value > 2500 ORDER BY value DESC LIMIT 2");
        $st->execute();
        foreach ($st->fetchAll() as $row) {
            mp_finding($f, 'medium', 'Speed',
                'Largest contentful paint ' . round((float)$row['value'] / 1000, 1) . 's on ' . str_replace('|', ', ', $row['dim']),
                'Google wants this under 2.5 seconds. It is a confirmed ranking factor.',
                'Usually the hero image or video. Compress it, size it correctly, and preload only the one asset that matters.');
        }
    }

    /* ---------- conversions, the number the CEO actually asked for -------- */
    if (mp_has_data('ga4')) {
        $calls  = mp_sum('ga4', 'events', $from, $to, 'call_click');
        $whats  = mp_sum('ga4', 'events', $from, $to, 'whatsapp_click');
        $pcalls = mp_sum('ga4', 'events', $pf, $pt, 'call_click');
        $pwhats = mp_sum('ga4', 'events', $pf, $pt, 'whatsapp_click');
        $sessions = mp_sum('ga4', 'sessions', $from, $to);

        if ($sessions > 100 && ($calls + $whats) === 0.0) {
            mp_finding($f, 'high', 'Conversions',
                'No calls or WhatsApp taps recorded against ' . mp_num($sessions) . ' sessions',
                'Traffic is arriving and nothing is being counted as an enquiry.',
                'Either the events are not marked as key events in GA4, or the tracking script is not running on the pages people land on. Check the GA4 realtime report first, it answers this in a minute.');
        }

        if ($sessions > 0 && ($calls + $whats) > 0) {
            $rate = (($calls + $whats) / $sessions) * 100;
            if ($rate < 1.0) {
                mp_finding($f, 'medium', 'Conversions',
                    'Enquiry rate is ' . number_format($rate, 2) . ' percent',
                    mp_num($calls + $whats) . ' enquiries from ' . mp_num($sessions) . ' sessions.',
                    'For an urgent care site this is low. The usual cause is the phone number not being visible without scrolling on mobile.');
            }
        }

        $d = mp_delta($calls + $whats, $pcalls + $pwhats);
        if ($d['pct'] !== null && $d['pct'] < -20) {
            mp_finding($f, 'high', 'Conversions',
                'Enquiries fell ' . round(abs($d['pct'])) . ' percent against the previous period',
                mp_num($calls + $whats) . ' this period against ' . mp_num($pcalls + $pwhats) . ' before.',
                'Check whether traffic fell too. If traffic held and enquiries dropped, something on the page broke.');
        }

        /* Language mix against the markets being targeted. */
        $de = mp_sum('ga4', 'sessions_language', $from, $to, 'de');
        $pl = mp_sum('ga4', 'sessions_language', $from, $to, 'pl');
        if ($sessions > 200 && ($de + $pl) / max($sessions, 1) < 0.05) {
            mp_finding($f, 'medium', 'Marketing',
                'German and Polish visitors are under 5 percent of traffic',
                mp_num($de + $pl) . ' of ' . mp_num($sessions) . ' sessions.',
                'Those are the two target markets and both have translated sites. The pages exist but are not being found. This is a search visibility problem, not a content one.');
        }

        $mobile = mp_sum('ga4', 'sessions_device', $from, $to, 'mobile');
        if ($sessions > 100 && $mobile / max($sessions, 1) > 0.6) {
            $bounce = mp_avg('ga4', 'bounce_rate', $from, $to);
            if ($bounce > 60) {
                mp_finding($f, 'medium', 'UX',
                    'Mobile is ' . round(($mobile / $sessions) * 100) . ' percent of traffic and bounce rate is ' . round($bounce) . ' percent',
                    'Most visitors are on a phone and most of them leave without a second page.',
                    'Fix mobile first. Every design decision should be judged on a phone screen before a desktop one.');
            }
        }
    }

    /* ---------- search ----------------------------------------------------- */
    if (mp_has_data('gsc')) {
        $clicks = mp_sum('gsc', 'clicks', $from, $to);
        $impr   = mp_sum('gsc', 'impressions', $from, $to);
        if ($impr > 500 && $clicks / max($impr, 1) < 0.02) {
            mp_finding($f, 'medium', 'SEO',
                'Click through rate is ' . number_format(($clicks / $impr) * 100, 2) . ' percent',
                mp_num($clicks) . ' clicks from ' . mp_num($impr) . ' impressions.',
                'The site is being shown and not chosen. That is a titles and descriptions problem, and it is the cheapest fix in search.');
        }

        /* Keywords ranking 4 to 20: closest to a real gain for least work. */
        $st = mp_db()->prepare(
            "SELECT dim, AVG(value) pos FROM metrics
             WHERE source='gsc' AND metric='clicks_query_pos' AND day BETWEEN :a AND :b
             GROUP BY dim HAVING pos BETWEEN 4 AND 20 ORDER BY pos ASC LIMIT 5"
        );
        $st->execute(array(':a'=>$from, ':b'=>$to));
        $near = $st->fetchAll();
        if ($near) {
            $names = array();
            foreach ($near as $n) { $names[] = $n['dim'] . ' (' . round((float)$n['pos'], 1) . ')'; }
            mp_finding($f, 'low', 'SEO',
                count($near) . ' keywords sit just off page one',
                implode(', ', array_slice($names, 0, 5)),
                'These are the fastest wins available. A keyword at position 6 moving to 3 roughly doubles its clicks. Strengthen the page that already ranks rather than writing a new one.');
        }
    }

    /* ---------- business profile ------------------------------------------ */
    if (mp_has_data('gbp')) {
        $views = mp_sum('gbp', 'impressions_maps_mobile', $from, $to) + mp_sum('gbp', 'impressions_search_mobile', $from, $to)
               + mp_sum('gbp', 'impressions_maps_desktop', $from, $to) + mp_sum('gbp', 'impressions_search_desktop', $from, $to);
        $site  = mp_sum('gbp', 'website_clicks', $from, $to);
        if ($views > 1000 && $site / max($views, 1) < 0.02) {
            mp_finding($f, 'medium', 'Local',
                'Map listings were seen ' . mp_num($views) . ' times and sent ' . mp_num($site) . ' clicks to the site',
                'People are finding the listing and not visiting the site from it.',
                'That is usually fine, they called instead. Worth confirming the listing has current photos, hours and the emergency number, since many visitors never reach the site at all.');
        }
    }

    /* ---------- AI visibility ---------------------------------------------- */
    $st = mp_db()->query("SELECT COUNT(*) c, SUM(mentioned) m FROM ai_checks WHERE checked_at >= date('now','-45 day')");
    $ai = $st->fetch();
    if ($ai && (int)$ai['c'] > 0) {
        $rate = ((float)$ai['m'] / (float)$ai['c']) * 100;
        if ($rate < 30) {
            mp_finding($f, 'medium', 'AI',
                'MedPark appears in ' . round($rate) . ' percent of AI answers checked',
                (int)$ai['m'] . ' of ' . (int)$ai['c'] . ' prompts mentioned the brand.',
                'AI assistants quote sources they can read cleanly. Clear structured data, an llms.txt file, and pages that answer the question directly are what move this.');
        }
    } elseif (!$ai || (int)$ai['c'] === 0) {
        mp_finding($f, 'low', 'AI',
            'No AI visibility check recorded in the last 45 days',
            'The prompt set has not been run.',
            'Run the prompt list on the AI page once a month. It takes about ten minutes and it is the only way to show movement on this in the report.');
    }

    /* ---------- what is not connected yet ---------------------------------- */
    foreach (mp_connectors_status() as $key => $c) {
        if (!$c['ready'] && in_array($key, array('ga4','gsc','gbp'), true)) {
            mp_finding($f, 'high', 'Setup',
                $c['name'] . ' is not connected',
                'This source has no credentials, so its metrics are blank.',
                'Needs ' . $c['needs'] . '. Until this is connected the report cannot cover this area.');
        }
    }

    $order = array('high'=>0, 'medium'=>1, 'low'=>2);
    usort($f, function ($a, $b) use ($order) { return $order[$a['severity']] <=> $order[$b['severity']]; });
    return $f;
}
