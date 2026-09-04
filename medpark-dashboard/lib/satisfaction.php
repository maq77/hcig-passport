<?php
/* ==========================================================================
   Satisfaction and trust.

   Added 2026-09-04.

   MedPark's two listings carry 4.8 stars from 271 reviews and 4.7 from 187.
   That is strong, real social proof, and it is currently observed rather than
   managed: nobody records whether it moved, nobody asks for reviews on purpose,
   and nothing notices when a patient is left waiting.

   FOUR THINGS, NONE OF WHICH NEED AN EXTERNAL ACCOUNT

     response time   how long somebody who left their number waits before
                     anybody marks them contacted. The most honest trust
                     measure a hospital website has, and it was not recorded.
     ratings         a monthly record per listing, so the number has a history
                     and a direction rather than being a screenshot.
     what they ask   the questions people actually put to the assistant, and
                     the ones it could not answer. Both are direct instructions
                     for what the site should say.
     friction        rage clicks, dead clicks, abandoned forms and script
                     errors. Someone struggling is someone losing trust, and
                     none of them will ever tell us.

   Response time needs the moment a status changed, which was never stored, so
   this adds one column. Everything else reads data already collected.
   ========================================================================== */
declare(strict_types=1);

function mp_satisfaction_install(PDO $db): void {
    /* When a request stopped being new. Without it, "how long did somebody
       wait" is unanswerable, which is why it is the one column added here. */
    try {
        $has = false;
        foreach ($db->query("PRAGMA table_info(chat_leads)") as $c) {
            if (strcasecmp((string)$c['name'], 'status_at') === 0) { $has = true; break; }
        }
        if (!$has) $db->exec("ALTER TABLE chat_leads ADD COLUMN status_at TEXT NOT NULL DEFAULT ''");
    } catch (Throwable $e) { /* the table appears on first install */ }

    /* A record of each listing's public rating over time. Entered by hand
       monthly, exactly like the AI visibility checks, because the Business
       Profile API needs the Google service account that is still outstanding.
       Recording it by hand is not a workaround: it is what makes a rating a
       trend instead of a screenshot. */
    $db->exec("CREATE TABLE IF NOT EXISTS ratings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        site TEXT NOT NULL DEFAULT '',
        recorded_at TEXT NOT NULL,
        listing TEXT NOT NULL,
        rating REAL NOT NULL DEFAULT 0,
        reviews INTEGER NOT NULL DEFAULT 0,
        note TEXT NOT NULL DEFAULT ''
    )");
    $db->exec("CREATE INDEX IF NOT EXISTS idx_ratings ON ratings(site, listing, recorded_at)");
}

/* ---------------------------------------------------------------------------
   How long people wait.
   ------------------------------------------------------------------------ */
function mp_response_times(string $from, string $to): array {
    $out = array('answered' => 0, 'median_hours' => 0.0, 'worst_hours' => 0.0,
                 'within_hour' => 0, 'within_day' => 0, 'waiting' => 0,
                 'oldest_waiting_hours' => 0.0);
    try {
        $st = mp_db()->prepare(
            "SELECT created_at, status_at FROM chat_leads
             WHERE site = :s AND status <> 'new' AND status_at <> ''
               AND date(created_at) BETWEEN :a AND :b");
        $st->execute(array(':s' => mp_current_site(), ':a' => $from, ':b' => $to));

        $hours = array();
        foreach ($st as $r) {
            $c = strtotime((string)$r['created_at']);
            $u = strtotime((string)$r['status_at']);
            if (!$c || !$u || $u < $c) continue;
            $h = ($u - $c) / 3600;
            $hours[] = $h;
            if ($h <= 1)  $out['within_hour']++;
            if ($h <= 24) $out['within_day']++;
        }
        sort($hours);
        $out['answered'] = count($hours);
        if ($hours) {
            $mid = (int)floor(count($hours) / 2);
            $out['median_hours'] = count($hours) % 2
                ? $hours[$mid]
                : ($hours[$mid - 1] + $hours[$mid]) / 2;
            $out['worst_hours'] = end($hours);
        }

        $w = mp_q("SELECT COUNT(*) n, MIN(created_at) oldest FROM chat_leads
                   WHERE site = :site AND status = 'new'")->fetch();
        if ($w) {
            $out['waiting'] = (int)$w['n'];
            if ((string)$w['oldest'] !== '') {
                $out['oldest_waiting_hours'] =
                    max(0, (time() - (int)strtotime((string)$w['oldest'])) / 3600);
            }
        }
    } catch (Throwable $e) { /* leave the zeroes */ }
    return $out;
}

/* ---------------------------------------------------------------------------
   Ratings.
   ------------------------------------------------------------------------ */
function mp_rating_save(string $listing, float $rating, int $reviews, string $note = '',
                        string $when = ''): bool {
    $listing = mb_substr(trim($listing), 0, 80);
    if ($listing === '' || $rating <= 0 || $rating > 5) return false;
    try {
        return mp_db()->prepare(
            "INSERT INTO ratings (site, recorded_at, listing, rating, reviews, note)
             VALUES (:s,:d,:l,:r,:n,:o)")
            ->execute(array(
                ':s' => mp_current_site(),
                ':d' => $when !== '' ? $when : gmdate('Y-m-d'),
                ':l' => $listing, ':r' => $rating, ':n' => max(0, $reviews),
                ':o' => mb_substr(trim($note), 0, 200),
            ));
    } catch (Throwable $e) { return false; }
}

/* The latest figure per listing, with the change since the record before it. */
function mp_ratings_latest(): array {
    $out = array();
    try {
        $st = mp_q("SELECT listing, recorded_at, rating, reviews FROM ratings
                    WHERE site = :site ORDER BY listing, recorded_at DESC, id DESC");
        foreach ($st as $r) {
            $l = (string)$r['listing'];
            if (!isset($out[$l])) {
                $out[$l] = array('listing' => $l, 'recorded_at' => (string)$r['recorded_at'],
                                 'rating' => (float)$r['rating'], 'reviews' => (int)$r['reviews'],
                                 'prev_rating' => null, 'prev_reviews' => null);
            } elseif ($out[$l]['prev_rating'] === null) {
                $out[$l]['prev_rating']  = (float)$r['rating'];
                $out[$l]['prev_reviews'] = (int)$r['reviews'];
            }
        }
    } catch (Throwable $e) { /* none recorded yet */ }
    return $out;
}

function mp_ratings_series(string $listing): array {
    try {
        $st = mp_db()->prepare(
            "SELECT recorded_at day, AVG(rating) v FROM ratings
             WHERE site = :s AND listing = :l GROUP BY recorded_at ORDER BY recorded_at");
        $st->execute(array(':s' => mp_current_site(), ':l' => $listing));
        return $st->fetchAll();
    } catch (Throwable $e) { return array(); }
}

/* ---------------------------------------------------------------------------
   What people actually ask, and what could not be answered.
   ------------------------------------------------------------------------ */
/* The assistant's own booking flow, step by step. These are mechanics, not
   questions: "ask_phone" means it asked for a number, which says nothing about
   what the visitor wanted to know. Showing them as topics was misleading. */
function mp_intent_flow_steps(): array {
    return array('greeting', 'menu', 'free', 'lead_saved',
                 'ask_branch', 'ask_service', 'ask_name', 'ask_phone', 'ask_time', 'ask_note',
                 'branch', 'service', 'name', 'phone', 'time', 'note');
}

function mp_intent_is_flow(string $i): bool {
    return in_array($i, mp_intent_flow_steps(), true);
}

/* Readable names, so an internal identifier never reaches a reader. Fourth
   time this has been needed here, after placement, language and channel:
   anything stored as a code gets one of these before it is displayed. */
function mp_intent_label(string $i): string {
    $m = array(
        'address'     => 'Where the hospital is',
        'branches'    => 'Which branch to go to',
        'appointment' => 'Booking an appointment',
        'booking'     => 'Booking an appointment',
        'ambulance'   => 'Ambulance',
        'cashless'    => 'Paying and cashless cover',
        'insurance'   => 'Insurance',
        'prices'      => 'What it costs',
        'hours'       => 'Opening hours',
        'services'    => 'What treatments are offered',
        'emergency'   => 'An emergency',
        'call_now'    => 'Asking to call',
        'languages'   => 'Which languages are spoken',
        'fallback'    => 'Not understood',
    );
    if (isset($m[$i])) return $m[$i];
    return ucfirst(str_replace('_', ' ', $i));
}

/* How far booking conversations get. Where people stop is where the flow asks
   for something they did not want to give. */
function mp_assistant_flow(string $from, string $to): array {
    $steps = array('ask_service' => 'Asked what they need',
                   'ask_branch'  => 'Asked which hospital',
                   'ask_name'    => 'Asked their name',
                   'ask_phone'   => 'Asked their number',
                   'ask_time'    => 'Asked when',
                   'lead_saved'  => 'Request captured');
    $out = array();
    foreach ($steps as $key => $label) {
        try {
            $st = mp_db()->prepare(
                "SELECT COUNT(DISTINCT sid) FROM chat_messages
                 WHERE site = :s AND intent = :i AND date(at) BETWEEN :a AND :b");
            $st->execute(array(':s' => mp_current_site(), ':i' => $key, ':a' => $from, ':b' => $to));
            $out[] = array('step' => $label, 'n' => (int)$st->fetchColumn());
        } catch (Throwable $e) { $out[] = array('step' => $label, 'n' => 0); }
    }
    return $out;
}

function mp_assistant_topics(string $from, string $to, int $limit = 12): array {
    try {
        $st = mp_db()->prepare(
            "SELECT intent dim, COUNT(*) v FROM chat_messages
             WHERE site = :s AND role = 'assistant' AND intent <> ''
               AND date(at) BETWEEN :a AND :b
             GROUP BY intent ORDER BY v DESC");
        $st->execute(array(':s' => mp_current_site(), ':a' => $from, ':b' => $to));

        /* Drop the booking mechanics and the not-understood marker, then name
           what is left. Those belong to the flow panel and the unanswered
           panel respectively, not to "what they ask about". */
        $out = array();
        foreach ($st as $r) {
            $i = (string)$r['dim'];
            if (mp_intent_is_flow($i) || $i === 'fallback' || $i === 'unknown') continue;
            $out[] = array('dim' => mp_intent_label($i), 'v' => (float)$r['v']);
            if (count($out) >= $limit) break;
        }
        return $out;
    } catch (Throwable $e) { return array(); }
}

/* Questions the assistant had no intent for. Each one is a thing the website
   does not say clearly enough, which makes this the most useful list here. */
function mp_assistant_unanswered(string $from, string $to, int $limit = 15): array {
    try {
        $st = mp_db()->prepare(
            "SELECT v.text, v.at FROM chat_messages v
             WHERE v.site = :s AND v.role = 'visitor' AND date(v.at) BETWEEN :a AND :b
               AND EXISTS (
                 SELECT 1 FROM chat_messages r
                 WHERE r.site = v.site AND r.sid = v.sid AND r.id = v.id + 1
                   AND r.role = 'assistant'
                   AND r.intent IN ('', 'unknown', 'fallback'))
             ORDER BY v.id DESC LIMIT " . (int)$limit);
        $st->execute(array(':s' => mp_current_site(), ':a' => $from, ':b' => $to));
        return $st->fetchAll();
    } catch (Throwable $e) { return array(); }
}

/* ---------------------------------------------------------------------------
   Friction: people struggling, who will never tell us.
   ------------------------------------------------------------------------ */
function mp_friction(string $from, string $to): array {
    return array(
        'rage'    => (float)mpa_ev_count('rage_click', $from, $to),
        'dead'    => (float)mpa_ev_count('dead_click', $from, $to),
        'abandon' => (float)mpa_ev_count('form_abandon', $from, $to),
        'errors'  => (float)mpa_ev_count('js_error', $from, $to),
    );
}

/* Where the friction is worst, so it can be fixed rather than counted. */
function mp_friction_pages(string $from, string $to, int $limit = 6): array {
    try {
        $st = mp_db()->prepare(
            "SELECT path dim, COUNT(*) v FROM a_events
             WHERE site = :s AND day BETWEEN :a AND :b
               AND name IN ('rage_click','dead_click','form_abandon','js_error')
             GROUP BY path ORDER BY v DESC LIMIT " . (int)$limit);
        $st->execute(array(':s' => mp_current_site(), ':a' => $from, ':b' => $to));
        return $st->fetchAll();
    } catch (Throwable $e) { return array(); }
}

/* The links staff hand a happy patient. Kept as a setting rather than guessed:
   a review URL needs the listing's Google place id, and inventing one would
   send patients to the wrong hospital. */
function mp_review_links(): array {
    $out = array();
    foreach (preg_split('~[\r\n]+~', mp_get('review_links')) as $line) {
        $line = trim($line);
        if ($line === '') continue;
        $parts = array_map('trim', explode('|', $line, 2));
        if (count($parts) === 2 && $parts[1] !== '') $out[$parts[0]] = $parts[1];
    }
    return $out;
}
