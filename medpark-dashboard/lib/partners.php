<?php
/* ==========================================================================
   Partners: who actually sends patients.

   Added 2026-09-04.

   HCIG's commercial engine is not search traffic. It is hotels, resorts,
   cruise lines, insurers, assistance networks and tour operators sending
   guests who need care. Nothing in the group measures that today, so nobody
   can say which partner is worth renewing and which link has been quietly
   broken since the season started.

   NO NEW TRACKING IS NEEDED
   A partner link is an ordinary tagged URL:

       https://www.medparkhospitals.com/?utm_source=<code>&utm_medium=partner

   The tracker has recorded utm_source and utm_medium since the day it went
   live, and a_sessions already stores both per visit. So this is a registry
   plus a view over data that has been arriving all along. That is deliberate:
   a measurement that needs the tracker changed cannot be switched on for a
   partner in the middle of a conversation with them.

   WHAT THIS CAN AND CANNOT ATTRIBUTE
   Visits and contact attempts, yes: both belong to the visit, and the visit
   carries the partner tag. Appointment requests, not yet: the booking form
   posts to lead.php without saying which visit it came from, so a request
   cannot be traced back to a partner. The column is here and lead.php reads
   it, so it starts working the moment the form sends one hidden field. The
   page says so rather than showing a zero that looks like failure.
   ========================================================================== */
declare(strict_types=1);

const MP_PARTNER_MEDIUM = 'partner';

function mp_partners_install(PDO $db): void {
    $db->exec("CREATE TABLE IF NOT EXISTS partners (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        site TEXT NOT NULL DEFAULT '',
        code TEXT NOT NULL,
        label TEXT NOT NULL,
        kind TEXT NOT NULL DEFAULT 'hotel',
        contact TEXT NOT NULL DEFAULT '',
        note TEXT NOT NULL DEFAULT '',
        landing TEXT NOT NULL DEFAULT '/',
        active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL
    )");
    $db->exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_partner_code ON partners(site, code)");

    /* Which partner a request came from, once the form sends it. Added here
       rather than in the migration because it is a new column on an existing
       table with a safe default, and ALTER TABLE ADD COLUMN is the one schema
       change SQLite does cheaply and without a rebuild. */
    $has = false;
    try {
        foreach ($db->query("PRAGMA table_info(chat_leads)") as $c) {
            if (strcasecmp((string)$c['name'], 'partner') === 0) { $has = true; break; }
        }
        if (!$has) $db->exec("ALTER TABLE chat_leads ADD COLUMN partner TEXT NOT NULL DEFAULT ''");
    } catch (Throwable $e) { /* the table appears on first install */ }
}

/* The kinds worth telling apart, because they behave differently: a hotel
   sends a guest who is already in town, an insurer sends one who has already
   been told we are covered. */
function mp_partner_kinds(): array {
    return array(
        'hotel'     => 'Hotel or resort',
        'operator'  => 'Tour operator',
        'insurer'   => 'Insurer or assistance network',
        'cruise'    => 'Cruise line',
        'clinic'    => 'Clinic or doctor',
        'other'     => 'Other',
    );
}

function mp_partners(bool $activeOnly = false): array {
    try {
        $sql = "SELECT * FROM partners WHERE site = :site"
             . ($activeOnly ? " AND active = 1" : "")
             . " ORDER BY label";
        $st = mp_db()->prepare($sql);
        $st->execute(array(':site' => mp_current_site()));
        return $st->fetchAll();
    } catch (Throwable $e) { return array(); }
}

function mp_partner_save(array $r): bool {
    $code = strtolower(trim((string)($r['code'] ?? '')));
    $code = (string)preg_replace('~[^a-z0-9_\-]~', '', $code);
    $label = trim((string)($r['label'] ?? ''));
    if ($code === '' || $label === '') return false;

    $kinds = mp_partner_kinds();
    $kind  = isset($r['kind']) && isset($kinds[$r['kind']]) ? (string)$r['kind'] : 'other';

    try {
        $st = mp_db()->prepare(
            "INSERT INTO partners (site, code, label, kind, contact, note, landing, active, created_at)
             VALUES (:s,:c,:l,:k,:x,:n,:g,1,:t)
             ON CONFLICT(site, code) DO UPDATE SET
                label = :l, kind = :k, contact = :x, note = :n, landing = :g");
        return $st->execute(array(
            ':s' => mp_current_site(), ':c' => substr($code, 0, 40),
            ':l' => mb_substr($label, 0, 80),
            ':k' => $kind,
            ':x' => mb_substr(trim((string)($r['contact'] ?? '')), 0, 120),
            ':n' => mb_substr(trim((string)($r['note'] ?? '')), 0, 300),
            ':g' => '/' . ltrim(trim((string)($r['landing'] ?? '/')), '/'),
            ':t' => gmdate('c'),
        ));
    } catch (Throwable $e) { return false; }
}

function mp_partner_set_active(int $id, bool $on): bool {
    try {
        return mp_db()->prepare("UPDATE partners SET active = :a WHERE id = :i AND site = :s")
            ->execute(array(':a' => $on ? 1 : 0, ':i' => $id, ':s' => mp_current_site()));
    } catch (Throwable $e) { return false; }
}

function mp_partner_delete(int $id): bool {
    try {
        return mp_db()->prepare("DELETE FROM partners WHERE id = :i AND site = :s")
            ->execute(array(':i' => $id, ':s' => mp_current_site()));
    } catch (Throwable $e) { return false; }
}

/* The link to hand the partner. */
function mp_partner_link(array $p): string {
    $base = rtrim(mp_get('site_url', 'https://www.medparkhospitals.com'), '/');
    $path = (string)($p['landing'] !== '' ? $p['landing'] : '/');
    return $base . $path
         . (strpos($path, '?') === false ? '?' : '&')
         . 'utm_source=' . rawurlencode((string)$p['code'])
         . '&utm_medium=' . MP_PARTNER_MEDIUM;
}

/* ---------------------------------------------------------------------------
   How each partner actually performed.

   Visits and contact attempts come from the visit, which carries the tag.
   Requests come from chat_leads.partner, which is populated only once the
   booking form sends it, so the caller can tell the reader which is which.
   ------------------------------------------------------------------------ */
function mp_partner_performance(string $from, string $to): array {
    $out = array();
    foreach (mp_partners() as $p) $out[(string)$p['code']] = array(
        'partner' => $p, 'visits' => 0.0, 'contacts' => 0.0, 'requests' => 0.0,
        'engaged' => 0.0, 'first_seen' => '', 'last_seen' => '',
    );

    try {
        $st = mp_db()->prepare(
            "SELECT source, COUNT(*) visits, COALESCE(SUM(converted),0) contacts,
                    COALESCE(AVG(engaged),0) engaged,
                    MIN(day) first_seen, MAX(day) last_seen
             FROM a_sessions
             WHERE site = :site AND day BETWEEN :a AND :b AND medium = :m AND source <> ''
             GROUP BY source");
        $st->execute(array(':site' => mp_current_site(), ':a' => $from, ':b' => $to,
                           ':m' => MP_PARTNER_MEDIUM));
        foreach ($st as $r) {
            $code = (string)$r['source'];
            if (!isset($out[$code])) {
                /* A tag arriving from a partner nobody registered. Worth
                   showing rather than dropping: it is usually a link somebody
                   sent without telling us. */
                $out[$code] = array(
                    'partner' => array('id' => 0, 'code' => $code, 'label' => $code,
                                       'kind' => 'other', 'contact' => '', 'note' => '',
                                       'landing' => '/', 'active' => 1, 'unregistered' => true),
                    'visits' => 0.0, 'contacts' => 0.0, 'requests' => 0.0,
                    'engaged' => 0.0, 'first_seen' => '', 'last_seen' => '',
                );
            }
            $out[$code]['visits']     = (float)$r['visits'];
            $out[$code]['contacts']   = (float)$r['contacts'];
            $out[$code]['engaged']    = (float)$r['engaged'];
            $out[$code]['first_seen'] = (string)$r['first_seen'];
            $out[$code]['last_seen']  = (string)$r['last_seen'];
        }
    } catch (Throwable $e) { /* leave the registry rows at zero */ }

    try {
        $st = mp_db()->prepare(
            "SELECT partner, COUNT(*) n FROM chat_leads
             WHERE site = :site AND partner <> '' AND date(created_at) BETWEEN :a AND :b
             GROUP BY partner");
        $st->execute(array(':site' => mp_current_site(), ':a' => $from, ':b' => $to));
        foreach ($st as $r) {
            $code = (string)$r['partner'];
            if (isset($out[$code])) $out[$code]['requests'] = (float)$r['n'];
        }
    } catch (Throwable $e) { /* the column arrives with this feature */ }

    foreach ($out as $code => $row) {
        $out[$code]['rate'] = $row['visits'] > 0
            ? round($row['contacts'] / $row['visits'] * 100, 1) : 0.0;
    }

    uasort($out, function ($a, $b) {
        if ($a['contacts'] === $b['contacts']) return $b['visits'] <=> $a['visits'];
        return $b['contacts'] <=> $a['contacts'];
    });
    return $out;
}

/* Everything the partner links produced together, for the headline tiles. */
function mp_partner_totals(string $from, string $to): array {
    $rows = mp_partner_performance($from, $to);
    $t = array('partners' => 0, 'active' => 0, 'visits' => 0.0, 'contacts' => 0.0,
               'requests' => 0.0, 'silent' => 0);
    foreach ($rows as $r) {
        $t['partners']++;
        if ((int)($r['partner']['active'] ?? 1) === 1) $t['active']++;
        $t['visits']   += $r['visits'];
        $t['contacts'] += $r['contacts'];
        $t['requests'] += $r['requests'];
        /* A registered, active partner that sent nobody at all this period.
           Usually a link that has stopped working on their side. */
        if ($r['visits'] <= 0 && (int)($r['partner']['active'] ?? 1) === 1
            && empty($r['partner']['unregistered'])) $t['silent']++;
    }
    $t['rate'] = $t['visits'] > 0 ? round($t['contacts'] / $t['visits'] * 100, 1) : 0.0;
    return $t;
}
