<?php
/* ==========================================================================
   Recommendations.

   Where insights.php answers "what is wrong", this answers the four questions
   a chief executive actually asks next:

     What did you find, and how do you know       ->  finding + evidence
     What is it costing us                        ->  problem
     What do we do                                ->  solution, effort, owner
     What happens if we do it                     ->  expect + timeframe

   Rule based today. The structure is deliberately the same shape a model
   would produce later, so swapping in generated recommendations is a change
   of source rather than a rewrite of the report.

   Every expectation here is either arithmetic from our own data or a
   published, defensible rule of thumb. Where a number cannot be justified it
   says so rather than inventing one. A report that promises a figure it
   cannot support is worse than one that promises nothing.
   ========================================================================== */
declare(strict_types=1);

function mp_rec(array $r): array {
    return array_merge(array(
        'area' => 'General', 'severity' => 'medium', 'finding' => '', 'evidence' => '',
        'problem' => '', 'solution' => '', 'effort' => 'medium', 'owner' => 'Marketing',
        'expect' => '', 'timeframe' => '', 'confidence' => 'medium',
    ), $r);
}

function mp_recommendations(array $R): array {
    $f = $R['from']; $t = $R['to']; $pf = $R['prev_from']; $pt = $R['prev_to'];
    $today = gmdate('Y-m-d');
    $out = array();

    $hasGA  = mp_has_data('ga4');
    $hasGSC = mp_has_data('gsc');
    $hasGBP = mp_has_data('gbp');

    $sessions = mp_sum('ga4','sessions',$f,$t);
    $calls    = mp_sum('ga4','events',$f,$t,'call_click');
    $whats    = mp_sum('ga4','events',$f,$t,'whatsapp_click');
    $chat     = mp_count_leads($f, $today);
    $enq      = $calls + $whats + $chat;

    /* ---------------------------------------------------------------------
       1. Access. Nothing else can be measured properly until this is done, so
          it leads whenever it is outstanding.
       --------------------------------------------------------------------- */
    $missing = array();
    foreach (mp_connectors_status() as $k => $c) {
        if (in_array($k, array('ga4','gsc','gbp'), true) && !$c['ready']) $missing[] = $c['name'];
    }
    if ($missing) {
        $out[] = mp_rec(array(
            'area' => 'Measurement', 'severity' => 'high', 'confidence' => 'certain',
            'finding'  => count($missing) . ' of the three Google accounts are not connected',
            'evidence' => 'Missing: ' . implode(', ', $missing) . '. The connections are built and tested; they need permission granted, nothing more.',
            'problem'  => 'Five of the ten measures the board asked for cannot be reported. We are also blind to which search terms bring patients, so the search work is being done without feedback.',
            'solution' => 'Grant read access to one Google service account across Analytics, Search Console and Business Profile. One account covers all three.',
            'effort'   => 'low', 'owner' => 'Whoever administers the Google accounts',
            'expect'   => 'The five missing measures appear on the next refresh, with their history backdated where the source holds it. Search Console alone carries up to 16 months, so the baseline can be pushed back rather than starting today.',
            'timeframe'=> 'Same day as access is granted',
        ));
    }

    /* ---------------------------------------------------------------------
       2. Local search. For "hospitals in Hurghada" the map pack sits above
          every ordinary result, so this outranks on-page work.
       --------------------------------------------------------------------- */
    if (!$hasGBP) {
        $out[] = mp_rec(array(
            'area' => 'Local search', 'severity' => 'high', 'confidence' => 'high',
            'finding'  => 'Map listing performance is not being measured at all',
            'evidence' => 'Business Profile is not connected, so calls and direction requests from the two listings are invisible.',
            'problem'  => 'A tourist with a medical problem searches Maps, not a website. For local searches the map results appear above the website, so this is very likely the single largest source of patients and none of it is reported.',
            'solution' => 'Connect both Business Profiles, then work the listings themselves: correct categories, full opening hours, current photographs, and a reply to every review.',
            'effort'   => 'low', 'owner' => 'Marketing, no developer needed',
            'expect'   => 'Listing performance becomes visible immediately. Profile work typically moves map ranking within two to four weeks, and it needs no change to the website.',
            'timeframe'=> 'Visible immediately, ranking effect in 2 to 4 weeks',
        ));
    } else {
        $views = mp_sum('gbp','impressions_maps_mobile',$f,$t) + mp_sum('gbp','impressions_maps_desktop',$f,$t)
               + mp_sum('gbp','impressions_search_mobile',$f,$t) + mp_sum('gbp','impressions_search_desktop',$f,$t);
        $mapCalls = mp_sum('gbp','call_clicks',$f,$t);
        if ($views > 500 && $mapCalls / max($views, 1) < 0.03) {
            $out[] = mp_rec(array(
                'area' => 'Local search', 'severity' => 'medium', 'confidence' => 'medium',
                'finding'  => 'The listings are seen often but produce few calls',
                'evidence' => mp_num($views) . ' listing views produced ' . mp_num($mapCalls) . ' calls, a rate of ' . number_format(($mapCalls / max($views,1)) * 100, 1) . '%.',
                'problem'  => 'People are finding us and not acting. Usually the listing is missing hours, photographs or a visible call button, so it fails to reassure.',
                'solution' => 'Complete both profiles: opening hours including the 24 hour emergency note, at least ten current photographs each, services listed, and replies on every review.',
                'effort'   => 'low', 'owner' => 'Marketing',
                'expect'   => 'A complete listing typically converts better than a sparse one. On ' . mp_num($views) . ' views, moving from ' . number_format(($mapCalls/max($views,1))*100,1) . '% to 4% would be about ' . mp_num(round($views * 0.04) - $mapCalls) . ' additional calls per period.',
                'timeframe'=> '2 to 4 weeks',
            ));
        }
    }

    /* ---------------------------------------------------------------------
       3. Rank targets sitting just off page one. The cheapest real gains.
       --------------------------------------------------------------------- */
    if ($hasGSC) {
        $st = mp_db()->prepare(
            "SELECT q.dim dim, AVG(p.value) pos, SUM(i.value) impr, SUM(q.value) clicks
             FROM metrics q
             JOIN metrics p ON p.day=q.day AND p.dim=q.dim AND p.source='gsc' AND p.metric='clicks_query_pos'
             JOIN metrics i ON i.day=q.day AND i.dim=q.dim AND i.source='gsc' AND i.metric='clicks_query_impr'
             WHERE q.source='gsc' AND q.metric='clicks_query' AND q.day BETWEEN :a AND :b
             GROUP BY q.dim HAVING pos BETWEEN 4 AND 15 AND impr >= 30
             ORDER BY impr DESC LIMIT 8");
        $st->execute(array(':a'=>$f, ':b'=>$t));
        $near = $st->fetchAll();
        if ($near) {
            $totalImpr = 0.0; $totalClicks = 0.0; $names = array();
            foreach ($near as $n) {
                $totalImpr += (float)$n['impr']; $totalClicks += (float)$n['clicks'];
                $names[] = $n['dim'] . ' (' . number_format((float)$n['pos'], 1) . ')';
            }
            /* Published click-through curves put position 3 at roughly 10% and
               position 8 at roughly 3%. Using the conservative end of that. */
            $projected = $totalImpr * 0.08;
            $gain = max(0, $projected - $totalClicks);
            $out[] = mp_rec(array(
                'area' => 'Search', 'severity' => 'high', 'confidence' => 'medium',
                'finding'  => count($near) . ' search terms are sitting just off page one',
                'evidence' => implode(', ', array_slice($names, 0, 5)) . '. Together they were shown ' . mp_num($totalImpr) . ' times and produced ' . mp_num($totalClicks) . ' clicks.',
                'problem'  => 'These pages already rank. They are close enough that a modest improvement moves them into the range where people actually click, and we are currently paying the cost of ranking without collecting the benefit.',
                'solution' => 'Strengthen the page that already ranks for each term rather than writing a new one: put the term in the title, answer the question in the first paragraph, and link to it from the home page.',
                'effort'   => 'medium', 'owner' => 'Marketing with content approval',
                'expect'   => 'Moving these into the top three would be roughly ' . mp_num(round($gain)) . ' additional clicks per period at current impression levels. A term at position 6 moving to 3 typically about doubles its clicks.',
                'timeframe'=> '4 to 12 weeks after the changes are indexed',
            ));
        }

        /* Titles problem: shown a lot, chosen rarely. */
        $impr = mp_sum('gsc','impressions',$f,$t);
        $clicks = mp_sum('gsc','clicks',$f,$t);
        if ($impr > 500 && ($clicks / max($impr, 1)) < 0.02) {
            $target = $impr * 0.03;
            $out[] = mp_rec(array(
                'area' => 'Search', 'severity' => 'medium', 'confidence' => 'high',
                'finding'  => 'We appear in search often but are rarely chosen',
                'evidence' => mp_num($impr) . ' appearances produced ' . mp_num($clicks) . ' clicks, a rate of ' . number_format(($clicks/max($impr,1))*100, 2) . '%.',
                'problem'  => 'Ranking is not the constraint. The titles and descriptions Google shows are not persuading people to choose us over the result above or below.',
                'solution' => 'Rewrite the titles on the highest-impression pages so the search term leads and the benefit is explicit. This is the cheapest change in search and needs no new content.',
                'effort'   => 'low', 'owner' => 'Marketing, with approval on wording',
                'expect'   => 'Lifting the rate to a still-modest 3% would be about ' . mp_num(round($target - $clicks)) . ' additional visits per period from the same ranking.',
                'timeframe'=> 'Visible within days of Google recrawling',
            ));
        }
    }

    /* ---------------------------------------------------------------------
       4. AI visibility.
       --------------------------------------------------------------------- */
    $ai = mp_db()->query("SELECT COUNT(*) c, SUM(mentioned) m FROM ai_checks WHERE checked_at >= date('now','-45 day')")->fetch();
    $aiC = $ai ? (int)$ai['c'] : 0; $aiM = $ai ? (int)$ai['m'] : 0;
    if ($aiC === 0) {
        $out[] = mp_rec(array(
            'area' => 'AI visibility', 'severity' => 'medium', 'confidence' => 'certain',
            'finding'  => 'AI visibility has not been measured yet this period',
            'evidence' => 'No result recorded against the fixed prompt set in the last 45 days.',
            'problem'  => 'A growing share of travellers ask an assistant before they search. If we are not named there we are invisible to them, and we currently have no way of knowing either way.',
            'solution' => 'Run the eight-question prompt set once a month in a fresh session on each engine and record the results in the dashboard. It takes about ten minutes.',
            'effort'   => 'low', 'owner' => 'Marketing',
            'expect'   => 'A trend line rather than a guess. Two or three months establishes whether the technical work is moving it.',
            'timeframe'=> 'First reading immediately, trend within 3 months',
        ));
    } elseif ($aiC > 0 && ($aiM / $aiC) < 0.4) {
        $out[] = mp_rec(array(
            'area' => 'AI visibility', 'severity' => 'medium', 'confidence' => 'medium',
            'finding'  => 'AI assistants name us in a minority of relevant answers',
            'evidence' => 'Named in ' . $aiM . ' of ' . $aiC . ' questions checked, ' . round(($aiM / $aiC) * 100) . '%.',
            'problem'  => 'Assistants quote sources they can read cleanly and attribute confidently. Being absent means a traveller asking "which hospitals are in Hurghada" is given a competitor.',
            'solution' => 'The technical groundwork is done: llms.txt published, sixteen AI crawlers explicitly welcomed, service catalogue and both map profiles in the structured data. What remains is publishing question-shaped content that answers those prompts directly on the page.',
            'effort'   => 'medium', 'owner' => 'Marketing with content approval',
            'expect'   => 'Assistants re-crawl on their own schedule, so this moves in months rather than weeks. The measure to watch is the share of the eight questions where we are named.',
            'timeframe'=> '2 to 4 months',
        ));
    }

    /* ---------------------------------------------------------------------
       5. Conversion.
       --------------------------------------------------------------------- */
    if ($hasGA && $sessions > 100) {
        $rate = ($enq / $sessions) * 100;
        if ($rate < 2.0) {
            $target = $sessions * 0.02;
            $out[] = mp_rec(array(
                'area' => 'Website', 'severity' => 'high', 'confidence' => 'medium',
                'finding'  => 'Visitors arrive but few of them make contact',
                'evidence' => mp_num($enq) . ' enquiries from ' . mp_num($sessions) . ' visits, a rate of ' . number_format($rate, 2) . '%.',
                'problem'  => 'We are paying the full cost of attracting these visitors and collecting a fraction of the return. For urgent care the usual cause is that the phone number is not visible without scrolling on a phone.',
                'solution' => 'Make the emergency number and WhatsApp button visible the moment the page opens on a phone, before any scrolling. Confirm with the click map which controls people are actually reaching for.',
                'effort'   => 'low', 'owner' => 'Development',
                'expect'   => 'Reaching a 2% rate on current traffic would be about ' . mp_num(round($target - $enq)) . ' additional enquiries per period, without a single extra visitor.',
                'timeframe'=> 'Measurable within 2 weeks of the change',
            ));
        }
    }

    /* ---------------------------------------------------------------------
       6. Target markets.
       --------------------------------------------------------------------- */
    if ($hasGA && $sessions > 200) {
        $de = mp_pair_sum('x_country_lang', $f, $t, null, 'de');
        $pl = mp_pair_sum('x_country_lang', $f, $t, null, 'pl');
        if (($de + $pl) / max($sessions, 1) < 0.10) {
            $out[] = mp_rec(array(
                'area' => 'Markets', 'severity' => 'medium', 'confidence' => 'high',
                'finding'  => 'German and Polish visitors are a small share of traffic',
                'evidence' => mp_num($de + $pl) . ' of ' . mp_num($sessions) . ' visits, ' . number_format((($de + $pl) / max($sessions,1)) * 100, 1) . '%, despite both languages having a full translated site.',
                'problem'  => 'These are the two target markets and the pages exist. They are not being found, which is a visibility problem rather than a content one.',
                'solution' => 'The structural causes were fixed on 2 September: both translations were declaring themselves English and pointing their canonical at the English home page. The remaining item is the German title, which is still in English and is awaiting approval.',
                'effort'   => 'low', 'owner' => 'Marketing approval, then development',
                'expect'   => 'The German page cannot compete for German search terms while its title is in English. Correcting it is the single highest-value change available for that market.',
                'timeframe'=> 'Days after approval, once Google recrawls',
            ));
        }
    }

    /* ---------------------------------------------------------------------
       7. Speed.
       --------------------------------------------------------------------- */
    $psiDay = mp_db()->query("SELECT MAX(day) FROM metrics WHERE source='psi'")->fetchColumn();
    if ($psiDay) {
        $st = mp_db()->prepare("SELECT AVG(value) FROM metrics WHERE source='psi' AND metric='score_performance' AND day=:d AND dim LIKE '%mobile'");
        $st->execute(array(':d'=>$psiDay));
        $perf = (float)$st->fetchColumn();
        if ($perf > 0 && $perf < 70) {
            $out[] = mp_rec(array(
                'area' => 'Website', 'severity' => $perf < 50 ? 'high' : 'medium', 'confidence' => 'high',
                'finding'  => 'The site is slow on a mobile connection',
                'evidence' => 'Google scores mobile performance at ' . round($perf) . ' out of 100.',
                'problem'  => 'Most visitors are on a phone on hotel wifi. A slow first load loses them before they read anything, and Google ranks slow pages lower, so it costs twice.',
                'solution' => 'Continue the work already started: blocking resources removed, compression completed, and image dimensions declared so the page stops shifting as it loads.',
                'effort'   => 'medium', 'owner' => 'Development',
                'expect'   => 'Reaching 80 or above removes speed as a ranking factor and measurably reduces the share of visitors who leave before the page appears.',
                'timeframe'=> '1 to 2 weeks of development',
            ));
        }
    }

    /* ---------------------------------------------------------------------
       8. Something going right. A report of nothing but problems does not
          get acted on, and there is genuine progress worth recording.
       --------------------------------------------------------------------- */
    $goodNews = array();
    $st = mp_db()->query("SELECT COUNT(*) FROM metrics WHERE source='health' AND metric='variants_answering_200' AND value = 1");
    if ((int)$st->fetchColumn() > 0) {
        $goodNews[] = 'The site now answers on one address instead of four. Google had been free to treat them as separate sites and split our ranking between them.';
    }
    $st = mp_db()->query("SELECT value FROM metrics WHERE source='health' AND metric='has_hreflang' ORDER BY day DESC LIMIT 1");
    if ((float)$st->fetchColumn() >= 1) {
        $goodNews[] = 'Every page now tells Google which language it is in, and which pages are its translations. Before this the German and Polish pages were declaring themselves English duplicates of the home page.';
    }
    if ($chat > 0) {
        $goodNews[] = 'The website assistant captured ' . mp_num($chat) . ' appointment requests this period, each with a name and a telephone number. That channel did not exist before.';
    }
    if ($goodNews) {
        $out[] = mp_rec(array(
            'area' => 'Progress', 'severity' => 'good', 'confidence' => 'certain',
            'finding'  => 'Foundations that were blocking growth have been fixed',
            'evidence' => implode(' ', $goodNews),
            'problem'  => '',
            'solution' => 'No action needed. These are recorded so the effect can be traced when rankings move.',
            'effort'   => 'none', 'owner' => '',
            'expect'   => 'These changes do not produce visitors on their own. They remove the obstacles that were preventing the rest of the work from having any effect, which is why they were done first.',
            'timeframe'=> 'Effect compounds over 1 to 3 months',
        ));
    }

    $order = array('high'=>0, 'medium'=>1, 'low'=>2, 'good'=>3);
    usort($out, function ($a, $b) use ($order) {
        return ($order[$a['severity']] ?? 9) <=> ($order[$b['severity']] ?? 9);
    });
    return $out;
}
