<?php
/* ==========================================================================
   The headline numbers, defined once.

   Added 2026-09-04.

   Before this file, the Summary page, the KPI page, the Overview page and the
   exported report each worked out "how many enquiries" in their own way, from
   their own source, with their own idea of what counts. Four answers to one
   question is how a dashboard loses a reader's trust: the CEO reads one number
   on screen and a different one in the report, and after that neither is
   believed.

   So it is one function. Every screen and the report call it, pass the source
   the reader has selected, and display what comes back.

   WHAT COUNTS AS AN ENQUIRY
   Two different things, kept apart on purpose:

     contacts   somebody pressed a way of reaching us: a call, a WhatsApp tap,
                an email link, a submitted form. We know the attempt happened.
                We cannot know whether they then spoke to anyone.
     requests   somebody left their name and a number: the booking form, or the
                assistant capturing details. A real person the team can ring
                back. This is the closest thing on the website to a patient.

   A request is worth far more than a tap, and mixing them into one total hides
   that. The Summary shows both, and says which is which.
   ========================================================================== */
declare(strict_types=1);

/* What to call the selected source, on screen and in the report. */
function mp_source_label(?string $src = null): string {
    $s = $src ?? mp_source();
    return $s === 'own' ? 'our own tracking' : 'Google Analytics 4';
}

function mp_source_short(?string $src = null): string {
    $s = $src ?? mp_source();
    return $s === 'own' ? 'Our tracking' : 'GA4';
}

/* One sentence a reader needs about the source they are looking at. */
function mp_source_note(?string $src = null): string {
    $s = $src ?? mp_source();
    return $s === 'own'
        ? 'Measured on our own server. Not blocked by ad blockers, so these numbers read '
        . 'higher than Google Analytics on the same days.'
        : 'Measured by Google Analytics 4. Ad blockers hide some visits from it, so these '
        . 'numbers read lower than our own tracking on the same days.';
}

/* ---------------------------------------------------------------------------
   Requests: people who left a name and a number.

   Not source-dependent. A booking request is stored by our own form handler
   whichever analytics anybody prefers to read, so switching the source must
   not change it. Saying so on screen matters: a number that does not move when
   the toggle moves looks broken unless the page explains why.
   ------------------------------------------------------------------------ */
function mp_requests(string $from, string $to): array {
    $q = function (string $where, array $args) {
        try {
            $st = mp_db()->prepare(
                "SELECT COUNT(*) FROM chat_leads WHERE site = :site AND " . $where);
            $st->execute(array_merge($args, array(':site' => mp_current_site())));
            return (int)$st->fetchColumn();
        } catch (Throwable $e) { return 0; }
    };
    $range = "date(created_at) BETWEEN :a AND :b";
    $args  = array(':a' => $from, ':b' => $to);

    return array(
        'total'     => $q($range, $args),
        'form'      => $q("kind = 'appointment_form' AND " . $range, $args),
        'assistant' => $q("kind <> 'appointment_form' AND " . $range, $args),
        'waiting'   => $q("status = 'new' AND " . $range, $args),
        /* Unanswered whenever it arrived. A request from last week nobody has
           rung is more urgent than whatever the date filter says. */
        'waiting_all' => $q("status = 'new'", array()),
        'ever'        => $q("1=1", array()),
    );
}

/* Daily series of requests, for a trend line. */
function mp_requests_series(string $from, string $to): array {
    try {
        $st = mp_db()->prepare(
            "SELECT date(created_at) day, COUNT(*) v FROM chat_leads
             WHERE site = :site AND date(created_at) BETWEEN :a AND :b
             GROUP BY date(created_at) ORDER BY day");
        $st->execute(array(':site' => mp_current_site(), ':a' => $from, ':b' => $to));
        return $st->fetchAll();
    } catch (Throwable $e) { return array(); }
}

/* ---------------------------------------------------------------------------
   The headline set for one period, from one source.
   ------------------------------------------------------------------------ */
function mp_headline(string $from, string $to, ?string $src = null): array {
    $s = $src ?? mp_source();
    $own = ($s === 'own');

    if ($own) {
        $k        = mpa_kpis($from, $to);
        $sessions = (float)$k['sessions'];
        $visitors = (float)$k['visitors'];
        $calls    = (float)mpa_ev_count('call_click', $from, $to);
        $whatsapp = (float)mpa_ev_count('whatsapp_click', $from, $to);
        $forms    = (float)mpa_ev_count('enquiry_submit', $from, $to);
        $email    = (float)mpa_ev_count('email_click', $from, $to);
        $ready    = mpa_has_data($from, $to);
    } else {
        $sessions = mp_sum('ga4', 'sessions', $from, $to);
        $visitors = mp_sum('ga4', 'users', $from, $to);
        $calls    = mp_sum('ga4', 'events', $from, $to, 'call_click');
        $whatsapp = mp_sum('ga4', 'events', $from, $to, 'whatsapp_click');
        $forms    = mp_sum('ga4', 'events', $from, $to, 'enquiry_submit');
        $email    = mp_sum('ga4', 'events', $from, $to, 'email_click');
        $ready    = mp_has_data('ga4');
    }

    $req      = mp_requests($from, $to);
    $contacts = $calls + $whatsapp + $forms + $email;

    return array(
        'source'        => $s,
        'ready'         => $ready,
        'sessions'      => $sessions,
        'visitors'      => $visitors,
        'calls'         => $calls,
        'whatsapp'      => $whatsapp,
        'forms'         => $forms,
        'email'         => $email,
        'contacts'      => $contacts,
        'requests'      => (float)$req['total'],
        'requests_form' => (float)$req['form'],
        'requests_bot'  => (float)$req['assistant'],
        'waiting'       => (float)$req['waiting_all'],
        /* Share of visits that produced a contact attempt. */
        'contact_rate'  => $sessions > 0 ? round($contacts / $sessions * 100, 2) : 0.0,
        /* Share of visits that produced a real request with a name and number.
           The number a CEO should watch. */
        'request_rate'  => $sessions > 0 ? round((float)$req['total'] / $sessions * 100, 2) : 0.0,
    );
}

/* Daily visits and contacts, for the trend chart, from the selected source. */
function mp_headline_series(string $from, string $to, ?string $src = null): array {
    $s = $src ?? mp_source();
    if ($s === 'own') {
        return array(
            'visits'   => mpa_series('sessions', $from, $to),
            'contacts' => mpa_series('conversions', $from, $to),
        );
    }
    $ev = function (string $name) use ($from, $to) {
        try {
            $st = mp_db()->prepare(
                "SELECT day, SUM(value) v FROM metrics
                 WHERE site = :site AND source='ga4' AND metric='events' AND dim=:e
                   AND day BETWEEN :a AND :b GROUP BY day ORDER BY day");
            $st->execute(array(':site'=>mp_current_site(), ':e'=>$name, ':a'=>$from, ':b'=>$to));
            return $st->fetchAll();
        } catch (Throwable $e) { return array(); }
    };
    /* Add the contact events together day by day. */
    $sum = array();
    foreach (array('call_click','whatsapp_click','enquiry_submit','email_click') as $n) {
        foreach ($ev($n) as $r) {
            $d = (string)$r['day'];
            $sum[$d] = (isset($sum[$d]) ? $sum[$d] : 0) + (float)$r['v'];
        }
    }
    ksort($sum);
    $rows = array();
    foreach ($sum as $d => $v) $rows[] = array('day' => $d, 'v' => $v);

    return array(
        'visits'   => mp_series('ga4', 'sessions', $from, $to),
        'contacts' => $rows,
    );
}
