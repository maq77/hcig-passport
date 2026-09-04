<?php
/* ==========================================================================
   The written summary.

   An executive reads a sentence faster than a chart. This turns the period's
   numbers into two or three plain sentences: what moved, by how much, what
   most likely caused it, and what needs a decision.

   It is deliberately conservative. It only claims a cause when the supporting
   segment actually moved, and when there is not enough data it says so rather
   than producing a confident sentence about nothing. A dashboard that invents
   a narrative is worse than one that stays quiet.
   ========================================================================== */
declare(strict_types=1);

function mp_pct_change(float $now, float $prev): ?float {
    if ($prev <= 0) return null;
    return (($now - $prev) / $prev) * 100;
}

function mp_word_for(float $pct): string {
    $a = abs($pct);
    if ($a < 3)  return 'broadly flat';
    if ($a < 10) return ($pct > 0 ? 'slightly up' : 'slightly down');
    if ($a < 25) return ($pct > 0 ? 'up' : 'down');
    if ($a < 60) return ($pct > 0 ? 'up sharply' : 'down sharply');
    return ($pct > 0 ? 'up steeply' : 'down steeply');
}

/* Returns ['headline'=>..., 'lines'=>[...], 'tone'=>'good|bad|flat|none'] */
function mp_narrative(array $R): array {
    $f = $R['from']; $t = $R['to']; $pf = $R['prev_from']; $pt = $R['prev_to'];
    $today = gmdate('Y-m-d');

    $chat  = mp_count_leads($f, $today);
    $pchat = mp_count_leads($pf, $pt);
    $calls = mp_sum('ga4','events',$f,$t,'call_click');
    $pcalls= mp_sum('ga4','events',$pf,$pt,'call_click');
    $wa    = mp_sum('ga4','events',$f,$t,'whatsapp_click');
    $pwa   = mp_sum('ga4','events',$pf,$pt,'whatsapp_click');
    $forms = mp_sum('ga4','events',$f,$t,'enquiry_submit');
    $pforms= mp_sum('ga4','events',$pf,$pt,'enquiry_submit');

    $enq  = $calls + $wa + $forms + $chat;
    $penq = $pcalls + $pwa + $pforms + $pchat;

    $hasGA  = mp_has_data('ga4');
    $hasGSC = mp_has_data('gsc');
    $lines  = array();

    /* Nothing connected yet. Say that plainly rather than narrating zeros. */
    if (!$hasGA && !$hasGSC && $enq <= 0) {
        return array(
            'headline' => 'Not enough is connected yet to say how the month went.',
            'lines' => array(
                'The website assistant and the on-page tracking are collecting on our own server and need nothing further.',
                'Traffic, search and map data are waiting on access to three Google accounts. That is the only thing blocking a complete picture.',
            ),
            'tone' => 'none',
        );
    }

    /* ---- headline: enquiries ------------------------------------------- */
    $pct = mp_pct_change($enq, $penq);
    if ($pct === null) {
        $headline = 'This is the first period on record, so there is nothing to compare against yet.';
        $tone = 'none';
        $lines[] = 'From next month every figure shows the change against both the previous month and this starting point.';
    } else {
        $word = mp_word_for($pct);
        $headline = 'Enquiries are ' . $word;
        if (abs($pct) >= 3) {
            $headline .= ' on the previous period, ' . mp_num($enq) . ' against ' . mp_num($penq);
        } else {
            $headline .= ' at ' . mp_num($enq);
        }
        $tone = $pct >= 3 ? 'good' : ($pct <= -3 ? 'bad' : 'flat');

        /* ---- driver: which source moved most, in absolute terms -------- */
        $moves = array(
            'calls'    => array($calls - $pcalls, 'phone calls'),
            'whatsapp' => array($wa - $pwa,       'WhatsApp messages'),
            'forms'    => array($forms - $pforms, 'form submissions'),
            'chat'     => array($chat - $pchat,   'assistant requests'),
        );
        uasort($moves, function ($a, $b) { return abs($b[0]) <=> abs($a[0]); });
        $top = reset($moves);
        if (abs($top[0]) >= 3 && abs($pct) >= 3) {
            $dir = $top[0] > 0 ? 'more' : 'fewer';
            $headline .= ', mostly ' . mp_num(abs($top[0])) . ' ' . $dir . ' ' . $top[1];
        }
        $headline .= '.';

        /* ---- which language, if the pairing data exists ----------------- */
        if ($hasGA) {
            $best = null; $bestDelta = 0;
            foreach (array('de'=>'German', 'pl'=>'Polish', 'en'=>'English') as $code => $name) {
                $n = mp_pair_sum('x_country_lang', $f, $t, null, $code);
                $p = mp_pair_sum('x_country_lang', $pf, $pt, null, $code);
                if ($n - $p > $bestDelta) { $bestDelta = $n - $p; $best = $name; }
            }
            if ($best !== null && $bestDelta >= 20) {
                $lines[] = $best . ' speaking visitors grew the most this period, by ' . mp_num($bestDelta) . ' visits.';
            }
        }
    }

    /* ---- search -------------------------------------------------------- */
    if ($hasGSC) {
        $cl = mp_sum('gsc','clicks',$f,$t); $pcl = mp_sum('gsc','clicks',$pf,$pt);
        $sp = mp_pct_change($cl, $pcl);
        if ($sp !== null) {
            $lines[] = 'Search traffic is ' . mp_word_for($sp) . ', ' . mp_num($cl) . ' clicks from Google.';
        }
    } else {
        $lines[] = 'Search figures are not included: Search Console access is still outstanding.';
    }

    /* ---- what needs a decision ----------------------------------------- */
    $findings = mp_insights($R);
    $high = 0;
    foreach ($findings as $x) { if ($x['severity'] === 'high') $high++; }
    if ($high === 1) {
        $lines[] = 'One thing needs a decision from you, below.';
    } elseif ($high > 1) {
        $lines[] = $high . ' things need a decision from you, below.';
    }

    return array('headline' => $headline, 'lines' => $lines, 'tone' => $tone);
}

/* Assistant leads, guarded so a missing table never breaks the summary. */
function mp_count_leads(string $from, string $to): float {
    try {
        $st = mp_db()->prepare("SELECT COUNT(*) FROM chat_leads WHERE site = :site AND date(created_at) BETWEEN :a AND :b");
        $st->execute(array(':a'=>$from, ':b'=>$to));
        return (float)$st->fetchColumn();
    } catch (Throwable $e) { return 0.0; }
}
