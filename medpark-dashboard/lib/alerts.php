<?php
/* ==========================================================================
   Alerts: the failures nobody reports.

   Added 2026-09-04.

   THE FAILURE THIS EXISTS FOR
   A contact form stops submitting. A WhatsApp button breaks after a deploy.
   The tracker stops sending. None of these announce themselves: the site looks
   perfectly normal, nobody complains, and the first sign is a quiet month.
   Every rule here watches for something going to zero that was not zero
   before, which is the shape almost all of them take.

   RULES, NOT CLEVERNESS
   Each rule compares now against this site's own recent behaviour rather than
   against a number somebody typed in a settings page. A hospital that gets
   three enquiries a day and one that gets thirty need different thresholds,
   and neither should have to configure one.

   TWO THINGS THAT KEEP ALERTS TRUSTED
     1. Nothing fires without enough history to know what normal looks like.
        An alert on the second day of collection is noise.
     2. Nothing repeats inside its cooldown. An alert that arrives hourly
        becomes a filter rule in somebody's mail client, and then the system
        has no way left to reach anyone.
   ========================================================================== */
declare(strict_types=1);

function mp_alerts_install(PDO $db): void {
    $db->exec("CREATE TABLE IF NOT EXISTS alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        site TEXT NOT NULL DEFAULT '',
        rule TEXT NOT NULL,
        severity TEXT NOT NULL DEFAULT 'medium',
        title TEXT NOT NULL,
        evidence TEXT NOT NULL DEFAULT '',
        action TEXT NOT NULL DEFAULT '',
        fired_at TEXT NOT NULL,
        notified INTEGER NOT NULL DEFAULT 0,
        cleared_at TEXT NOT NULL DEFAULT ''
    )");
    $db->exec("CREATE INDEX IF NOT EXISTS idx_alerts_rule ON alerts(site, rule, fired_at)");
}

/* How long a rule stays quiet after firing, in hours. Long enough that nobody
   learns to ignore the sender. */
function mp_alert_cooldown(): int { return 12; }

function mp_alert_recent(string $rule): ?array {
    try {
        $st = mp_db()->prepare(
            "SELECT * FROM alerts WHERE site = :s AND rule = :r
             ORDER BY id DESC LIMIT 1");
        $st->execute(array(':s' => mp_current_site(), ':r' => $rule));
        $r = $st->fetch();
        return $r ? $r : null;
    } catch (Throwable $e) { return null; }
}

function mp_alert_in_cooldown(string $rule): bool {
    $last = mp_alert_recent($rule);
    if (!$last) return false;
    $age = time() - (int)strtotime((string)$last['fired_at']);
    return $age < mp_alert_cooldown() * 3600;
}

/* ---------------------------------------------------------------------------
   The rules.

   Each returns null when everything is fine, or an array describing what is
   wrong, what proves it, and what to do about it. None of them look at
   anything Google holds, so they keep working with no connected accounts.
   ------------------------------------------------------------------------ */
function mp_alert_rules(): array {
    return array(

        /* The single most important one. If collection stops, every other
           number on every page quietly reads zero and looks like a bad week. */
        'tracking_stopped' => function () {
            $last = mp_q("SELECT MAX(ts) FROM a_pageviews WHERE site = :site")->fetchColumn();
            if (!$last) return null;
            $hours = (time() - (int)$last) / 3600;

            /* What a normal quiet spell looks like here, from the last month of
               real traffic rather than from a guess. */
            $days = (int)mp_q("SELECT COUNT(DISTINCT day) FROM a_pageviews
                               WHERE site = :site AND day >= date('now','-30 day')")->fetchColumn();
            if ($days < 3) return null;

            $perDay = (float)mp_q("SELECT COUNT(*) * 1.0 / MAX(1, COUNT(DISTINCT day))
                                   FROM a_pageviews WHERE site = :site
                                     AND day >= date('now','-30 day')")->fetchColumn();
            if ($perDay < 3) return null;

            /* A site seeing a few pages an hour on average should not be silent
               for twelve. Deliberately generous: a false alarm here costs more
               trust than a late alarm costs money. */
            if ($hours < 12) return null;

            return array(
                'severity' => 'high',
                'title'    => 'No visits have been recorded for ' . round($hours) . ' hours',
                'evidence' => 'This site normally records about ' . round($perDay)
                            . ' page views a day. The last one arrived '
                            . gmdate('j M H:i', (int)$last) . ' UTC.',
                'action'   => 'Open the website and check the tracker still loads: view source and '
                            . 'look for t.js. If it is there, check the five minute import cron is '
                            . 'still installed. Every number in this dashboard depends on this.',
            );
        },

        /* Enquiries stopping is the failure that costs money directly. */
        'no_enquiries' => function () {
            $days = (int)mp_q("SELECT COUNT(DISTINCT day) FROM a_events
                               WHERE site = :site AND day >= date('now','-30 day')")->fetchColumn();
            if ($days < 7) return null;

            $conv  = mpa_conversion_events();
            $marks = implode(',', array_fill(0, count($conv), '?'));

            $st = mp_db()->prepare(
                "SELECT MAX(ts) FROM a_events WHERE site = ? AND name IN ($marks)");
            $st->execute(array_merge(array(mp_current_site()), $conv));
            $last = $st->fetchColumn();
            if (!$last) return null;

            $st = mp_db()->prepare(
                "SELECT COUNT(*) * 1.0 / 30 FROM a_events
                 WHERE site = ? AND name IN ($marks) AND day >= date('now','-30 day')");
            $st->execute(array_merge(array(mp_current_site()), $conv));
            $perDay = (float)$st->fetchColumn();
            if ($perDay < 0.5) return null;   /* too few to have a normal */

            $hours   = (time() - (int)$last) / 3600;
            $typical = 24 / max(0.1, $perDay);      /* hours between enquiries */
            if ($hours < max(24, $typical * 4)) return null;

            return array(
                'severity' => 'high',
                'title'    => 'No enquiries for ' . round($hours) . ' hours',
                'evidence' => 'This site normally produces one about every '
                            . round($typical) . ' hours. The last was '
                            . gmdate('j M H:i', (int)$last) . ' UTC.',
                'action'   => 'Open the site on a phone and try to call and to message. A button '
                            . 'that stopped working looks completely normal from the outside, and '
                            . 'this is the only thing that would notice.',
            );
        },

        /* A page throwing errors in real browsers, which nobody will report. */
        'script_errors' => function () {
            $today = (float)mpa_ev_count('js_error', gmdate('Y-m-d', time() - 86400), gmdate('Y-m-d'));
            if ($today < 20) return null;

            $before = (float)mpa_ev_count('js_error', gmdate('Y-m-d', time() - 15 * 86400),
                                                      gmdate('Y-m-d', time() - 2 * 86400));
            $avg = $before / 14;
            if ($today < max(20, $avg * 3)) return null;

            $row = mp_q("SELECT path, COUNT(*) n FROM a_events
                         WHERE site = :site AND name = 'js_error' AND day >= date('now','-1 day')
                         GROUP BY path ORDER BY n DESC LIMIT 1")->fetch();

            return array(
                'severity' => 'high',
                'title'    => round($today) . ' script errors in real visits since yesterday',
                'evidence' => 'The daily average over the previous fortnight was ' . round($avg, 1)
                            . '. Most are on ' . ($row ? (string)$row['path'] : 'several pages') . '.',
                'action'   => 'Open that page and look at the browser console. A script error on a '
                            . 'page with a form can stop the form submitting entirely.',
            );
        },

        /* A way of getting in touch that used to be used and now is not. This
           is the deploy-broke-the-button case. */
        'contact_control_gone' => function () {
            $prevFrom = gmdate('Y-m-d', time() - 21 * 86400);
            $prevTo   = gmdate('Y-m-d', time() - 8 * 86400);
            $nowFrom  = gmdate('Y-m-d', time() - 7 * 86400);
            $nowTo    = gmdate('Y-m-d');

            foreach (array('whatsapp_click' => 'WhatsApp button',
                           'call_click'     => 'phone number',
                           'enquiry_submit' => 'enquiry form') as $ev => $what) {
                $before = mpa_ev_count($ev, $prevFrom, $prevTo);
                $after  = mpa_ev_count($ev, $nowFrom, $nowTo);
                if ($before < 10 || $after > 0) continue;

                return array(
                    'severity' => 'high',
                    'title'    => 'The ' . $what . ' has not been used for a week',
                    'evidence' => 'It was used ' . $before . ' times in the fortnight before that, '
                                . 'and not once since ' . $nowFrom . '.',
                    'action'   => 'Open the site and press it yourself. Either it is broken, or it '
                                . 'has moved somewhere nobody finds. Both are worth an hour today.',
                );
            }
            return null;
        },

        /* Somebody left their number and nobody has rung them. */
        'requests_unanswered' => function () {
            $row = mp_q("SELECT COUNT(*) n, MIN(created_at) oldest FROM chat_leads
                         WHERE site = :site AND status = 'new'
                           AND created_at <= datetime('now','-24 hour')")->fetch();
            if (!$row || (int)$row['n'] === 0) return null;

            $hours = (time() - (int)strtotime((string)$row['oldest'])) / 3600;
            return array(
                'severity' => 'high',
                'title'    => (int)$row['n'] . ' appointment '
                            . ((int)$row['n'] === 1 ? 'request has' : 'requests have')
                            . ' been waiting more than a day',
                'evidence' => 'The oldest arrived ' . round($hours / 24, 1)
                            . ' days ago and is still marked new.',
                'action'   => 'Open Appointment requests and call them. Every one of these is a '
                            . 'person who asked to be contacted and is still waiting.',
            );
        },

        /* The certificate, because an expired one takes the whole site down and
           it is entirely preventable. */
        'ssl_expiring' => function () {
            $days = (float)mp_sum('health', 'ssl_days_left',
                                  gmdate('Y-m-d', time() - 7 * 86400), gmdate('Y-m-d'));
            $row = mp_q("SELECT value FROM metrics WHERE site = :site AND source = 'health'
                          AND metric = 'ssl_days_left' ORDER BY day DESC LIMIT 1")->fetch();
            if (!$row) return null;
            $left = (float)$row['value'];
            if ($left <= 0 || $left > 14) return null;

            return array(
                'severity' => $left <= 5 ? 'high' : 'medium',
                'title'    => 'The security certificate expires in ' . round($left) . ' days',
                'evidence' => 'Measured by the site health check.',
                'action'   => 'Most hosts renew automatically. Confirm it has, because an expired '
                            . 'certificate makes every browser refuse the site outright.',
            );
        },
    );
}

/* ---------------------------------------------------------------------------
   Run every rule. Records what fired, respects the cooldown, and returns what
   is currently wrong so a page can show it whether or not an email went out.
   ------------------------------------------------------------------------ */
function mp_alerts_run(bool $record = true): array {
    $out = array();
    foreach (mp_alert_rules() as $rule => $fn) {
        try {
            $hit = $fn();
        } catch (Throwable $e) {
            continue;   /* a rule that cannot run must never break the others */
        }
        if (!$hit) continue;

        $hit['rule']     = $rule;
        $hit['new']      = !mp_alert_in_cooldown($rule);
        $out[$rule]      = $hit;

        if ($record && $hit['new']) {
            try {
                mp_db()->prepare(
                    "INSERT INTO alerts (site, rule, severity, title, evidence, action, fired_at)
                     VALUES (:s,:r,:v,:t,:e,:a,:f)")
                    ->execute(array(
                        ':s' => mp_current_site(), ':r' => $rule,
                        ':v' => (string)$hit['severity'], ':t' => (string)$hit['title'],
                        ':e' => (string)$hit['evidence'], ':a' => (string)$hit['action'],
                        ':f' => gmdate('c'),
                    ));
            } catch (Throwable $e) { /* recording must not stop the alert */ }
        }
    }
    return $out;
}

/* Email whatever fired and is not inside its cooldown. Returns how many were
   sent, so the caller can say so rather than hoping. */
function mp_alerts_notify(array $fired): int {
    if (!$fired) return 0;
    if (mp_get('alerts_on') !== '1') return 0;

    $new = array_filter($fired, function ($a) { return !empty($a['new']); });
    if (!$new) return 0;

    $to = array_values(array_unique(array_filter(array_map('trim', array_merge(
        explode(',', mp_get('staff_alert_email')),
        explode(',', mp_get('staff_email'))
    )))));
    if (!$to) return 0;

    $brand = mp_get('brand_name', 'the website');
    $lines = array('Something on ' . $brand . ' needs a look.', '');
    foreach ($new as $a) {
        $lines[] = strtoupper((string)$a['severity']) . ': ' . (string)$a['title'];
        $lines[] = '  ' . (string)$a['evidence'];
        $lines[] = '  What to do: ' . (string)$a['action'];
        $lines[] = '';
    }
    $lines[] = 'These are checked automatically. Nothing here comes from Google;';
    $lines[] = 'it is measured on your own server.';
    $lines[] = '';
    $lines[] = rtrim(mp_get('site_url'), '/') . '/dashboard/?p=alerts';

    $subject = count($new) === 1
        ? array_values($new)[0]['title']
        : count($new) . ' things need a look on ' . $brand;

    $headers = "From: " . $brand . " dashboard <no-reply@" .
               preg_replace('~^https?://(www\.)?~', '', rtrim(mp_get('site_url'), '/')) . ">\r\n"
             . "Content-Type: text/plain; charset=utf-8\r\n";

    $sent = 0;
    foreach ($to as $addr) {
        if (!filter_var($addr, FILTER_VALIDATE_EMAIL)) continue;
        if (@mail($addr, $subject, implode("\n", $lines), $headers)) $sent++;
    }

    if ($sent > 0) {
        try {
            $keys = array_keys($new);
            $marks = implode(',', array_fill(0, count($keys), '?'));
            $st = mp_db()->prepare(
                "UPDATE alerts SET notified = 1
                 WHERE site = ? AND rule IN ($marks) AND notified = 0");
            $st->execute(array_merge(array(mp_current_site()), $keys));
        } catch (Throwable $e) { /* the email is already out */ }
    }
    return $sent;
}

/* What has fired lately, for the page. */
function mp_alerts_history(int $limit = 40): array {
    try {
        $st = mp_db()->prepare(
            "SELECT * FROM alerts WHERE site = :s ORDER BY id DESC LIMIT " . (int)$limit);
        $st->execute(array(':s' => mp_current_site()));
        return $st->fetchAll();
    } catch (Throwable $e) { return array(); }
}
