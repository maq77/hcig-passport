<?php
/* ==========================================================================
   The site registry: what turns one dashboard into a platform.

   Added 2026-09-04.

   WHY A REGISTRY RATHER THAN A SETTING
   Until now the property being measured was derived from one settings value,
   `site_url`, so one install could only ever mean one website. Adding a brand
   meant a second install, a second deploy for every change, and a second thing
   to forget. The registry makes the property a row, so a new brand is a row
   plus one script tag on that site, and an improvement to the system reaches
   every property at once because there is only ever one system.

   TWO IDENTIFIERS, ON PURPOSE
     site_key   what every data table stores in its `site` column. It never
                changes once data exists under it, because changing it would
                orphan every row. MedPark's is `medparkhospitals.com`, which is
                what the existing live rows already carry.
     token      what appears publicly in the script tag. It can be changed or
                rotated without touching a single stored row.

   PER-SITE SETTINGS
   Some settings belong to a property (its GA4 id, its competitors, its target
   keywords, its KPI targets). Some belong to the installation (the login, the
   API keys we pay for, the geo database). Only the first kind is overridable
   per site; the list is `mp_site_scoped_keys()` and nothing outside it can be
   accidentally split in two.
   ========================================================================== */
declare(strict_types=1);

/* Settings that mean something different for each property. Everything not on
   this list stays global, which is what keeps one Anthropic key from turning
   into eight. */
function mp_site_scoped_keys(): array {
    return array(
        'site_url', 'brand_name',
        'ga4_property_id', 'ga4_measurement_id', 'gsc_site_url',
        'gbp_account_id', 'gbp_location_ids',
        'yandex_counter_id',
        'competitors', 'competitor_sites', 'primary_market',
        'ai_prompts', 'ai_brand_terms', 'ai_competitors',
        'kpi_targets', 'heat_pages',
        'staff_email', 'staff_alert_email',
        'chat_enabled', 'chat_whatsapp', 'chat_phone',
        'analytics_on', 'analytics_retain', 'consent_banner_on',
        'alerts_on', 'alert_threshold', 'report_email_on',
    );
}

function mp_sites_install(PDO $db): void {
    $db->exec("CREATE TABLE IF NOT EXISTS sites (
        site_key TEXT PRIMARY KEY,
        token TEXT NOT NULL,
        label TEXT NOT NULL,
        brand TEXT NOT NULL DEFAULT '',
        site_url TEXT NOT NULL DEFAULT '',
        domains TEXT NOT NULL DEFAULT '',
        timezone TEXT NOT NULL DEFAULT 'UTC',
        active INTEGER NOT NULL DEFAULT 1,
        sort INTEGER NOT NULL DEFAULT 0,
        settings TEXT NOT NULL DEFAULT '{}',
        created_at TEXT NOT NULL
    )");
    $db->exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_sites_token ON sites(token)");
}

/* Every registered property, keyed by site_key, ordered for display. */
function mp_sites(bool $reload = false): array {
    static $cache = null;
    if ($cache !== null && !$reload) return $cache;
    $cache = array();
    try {
        foreach (mp_db()->query("SELECT * FROM sites ORDER BY sort, label") as $r) {
            $r['settings_parsed'] = json_decode((string)$r['settings'], true);
            if (!is_array($r['settings_parsed'])) $r['settings_parsed'] = array();
            $cache[(string)$r['site_key']] = $r;
        }
    } catch (Throwable $e) { /* before the table exists, there are no sites */ }
    return $cache;
}

function mp_site(string $key): ?array {
    $all = mp_sites();
    return isset($all[$key]) ? $all[$key] : null;
}

function mp_site_by_token(string $token): ?array {
    foreach (mp_sites() as $s) {
        if ((string)$s['token'] === $token) return $s;
    }
    return null;
}

/* Which property a request came from, matched on the browser's own host.
   Several hosts per property is normal: apex and www, and sometimes a locale
   host. Matching is exact against the registered list, never a substring, so
   `medparkhospitals.com.attacker.example` cannot pass as MedPark. */
function mp_site_by_domain(string $host): ?array {
    $host = strtolower(preg_replace('~^https?://~', '', trim($host)));
    $host = (string)strtok($host, '/');
    $host = (string)preg_replace('~:\d+$~', '', $host);
    if ($host === '') return null;
    foreach (mp_sites() as $s) {
        foreach (mp_site_domains($s) as $d) {
            if ($d === $host) return $s;
        }
    }
    return null;
}

function mp_site_domains(array $s): array {
    $out = array();
    foreach (preg_split('~[\s,]+~', (string)$s['domains']) as $d) {
        $d = strtolower(trim($d));
        if ($d !== '') $out[] = $d;
    }
    if (!$out && (string)$s['site_url'] !== '') {
        $h = parse_url((string)$s['site_url'], PHP_URL_HOST);
        if (is_string($h)) {
            $bare = strtolower(preg_replace('~^www\.~', '', $h) ?? '');
            $out = array(strtolower($h), $bare, 'www.' . $bare);
        }
    }
    return array_values(array_unique($out));
}

/* ---------------------------------------------------------------------------
   The current property.

   The dashboard sets it from the request; the importer sets it per batch of
   beacons. It is deliberately explicit rather than derived, because deriving
   it from a global setting is exactly what made the old system single-site.
   ------------------------------------------------------------------------ */
function mp_current_site(?string $set = null): string {
    static $cur = null;

    if ($set !== null) { $cur = $set; return $cur; }
    if ($cur !== null) return $cur;

    $sites = mp_sites();
    if (!$sites) { $cur = mp_site_default_key(); return $cur; }

    $want = isset($_GET['site']) ? (string)$_GET['site'] : '';
    if ($want !== '' && isset($sites[$want])) {
        $cur = $want;
        if (session_status() === PHP_SESSION_ACTIVE) $_SESSION['mp_site'] = $cur;
        return $cur;
    }
    if (session_status() === PHP_SESSION_ACTIVE
        && isset($_SESSION['mp_site']) && isset($sites[$_SESSION['mp_site']])) {
        $cur = (string)$_SESSION['mp_site'];
        return $cur;
    }
    $cur = (string)array_key_first($sites);
    return $cur;
}

/* Which property a public request belongs to.

   For anything running on a tracked website (the booking form, the assistant)
   rather than in the dashboard: resolve from the host the browser asked for,
   so a lead submitted on one brand's site is stored against that brand. Falls
   back to the current property, which on a single-property install is the only
   one there is.

   This exists because the migration that added the `site` column gave it a
   default of '', and a public writer that does not name the column stores rows
   no site-scoped query will ever find. That is a silent loss of enquiries,
   which is the worst thing this system could do. */
function mp_site_for_request(): string {
    $host = (string)($_SERVER['HTTP_HOST'] ?? '');
    if ($host !== '') {
        $s = mp_site_by_domain($host);
        if ($s) return (string)$s['site_key'];
    }
    return mp_current_site();
}

/* The key the very first property gets: whatever the existing rows already
   carry, so nothing has to be rewritten when the registry appears. */
function mp_site_default_key(): string {
    $u = strtolower(mp_get('site_url', 'medpark'));
    $u = (string)preg_replace('~^https?://(www\.)?~', '', $u);
    $u = trim($u, '/');
    return ($u === '') ? 'medpark' : substr($u, 0, 60);
}

/* The per-property value of a setting, or null to mean "use the global".

   Called from mp_get(), so it must never call anything that calls mp_get()
   again. Loading the registry opens the database, and opening the database
   reads settings, so the guard below is not decoration: without it the first
   query of the session would recurse. While the guard is up every key reads
   its global value, which is exactly right during bootstrap. */
function mp_site_override(string $key): ?string {
    static $busy = false;
    if ($busy) return null;
    if (!in_array($key, mp_site_scoped_keys(), true)) return null;

    $busy = true;
    try {
        $s = mp_site(mp_current_site());
        if ($s && array_key_exists($key, $s['settings_parsed'])
               && (string)$s['settings_parsed'][$key] !== '') {
            return (string)$s['settings_parsed'][$key];
        }
        return null;
    } catch (Throwable $e) {
        return null;
    } finally {
        $busy = false;
    }
}

/* Kept as a readable alias. mp_get() already consults the property. */
function mp_site_get(string $key, string $default = ''): string {
    return mp_get($key, $default);
}

function mp_site_put(string $siteKey, array $patch): bool {
    $s = mp_site($siteKey);
    if (!$s) return false;
    $next = array_merge($s['settings_parsed'], $patch);
    foreach ($next as $k => $v) {
        if (!in_array($k, mp_site_scoped_keys(), true)) unset($next[$k]);
    }
    $ok = mp_db()->prepare("UPDATE sites SET settings = :s WHERE site_key = :k")
        ->execute(array(':s' => json_encode($next), ':k' => $siteKey));
    if ($ok) { mp_sites(true); mp_sites_export_cache(); }
    return (bool)$ok;
}

/* ---------------------------------------------------------------------------
   The registry, as a small file the public endpoints can read.

   The collector's one rule is that it never touches the database, because it
   runs on every page of every site and a database write on a public hot path
   was already a real risk on this shared host once. But it must still refuse a
   beacon carrying an unknown site token, and validating that needs the
   registry. So the dashboard writes the registry out as a tiny JSON file
   whenever it changes, and the collector reads that instead: one file read, no
   connection, no schema, no transaction.
   ------------------------------------------------------------------------ */
function mp_sites_cache_path(): string { return MP_DATA_DIR . '/sites.json'; }

function mp_sites_export_cache(): bool {
    $out = array();
    foreach (mp_sites(true) as $key => $s) {
        if ((int)$s['active'] !== 1) continue;
        $out[(string)$s['token']] = array(
            'key'     => $key,
            'label'   => (string)$s['label'],
            'domains' => mp_site_domains($s),
        );
    }
    $ok = @file_put_contents(mp_sites_cache_path(),
              json_encode($out, JSON_UNESCAPED_SLASHES), LOCK_EX) !== false;
    if ($ok) @chmod(mp_sites_cache_path(), 0600);
    return $ok;
}

function mp_site_save(array $row): bool {
    $key = trim((string)($row['site_key'] ?? ''));
    if ($key === '') return false;
    $token = trim((string)($row['token'] ?? '')) !== ''
        ? preg_replace('~[^A-Za-z0-9_.\-]~', '', (string)$row['token'])
        : preg_replace('~[^A-Za-z0-9_.\-]~', '', $key);

    $st = mp_db()->prepare(
        "INSERT INTO sites (site_key, token, label, brand, site_url, domains, timezone,
                            active, sort, settings, created_at)
         VALUES (:k,:t,:l,:b,:u,:d,:z,:a,:o,'{}',:c)
         ON CONFLICT(site_key) DO UPDATE SET
            token = :t, label = :l, brand = :b, site_url = :u,
            domains = :d, timezone = :z, active = :a, sort = :o");
    $ok = $st->execute(array(
        ':k' => $key, ':t' => $token,
        ':l' => trim((string)($row['label'] ?? $key)),
        ':b' => trim((string)($row['brand'] ?? '')),
        ':u' => trim((string)($row['site_url'] ?? '')),
        ':d' => trim((string)($row['domains'] ?? '')),
        ':z' => trim((string)($row['timezone'] ?? 'UTC')),
        ':a' => !empty($row['active']) ? 1 : 0,
        ':o' => (int)($row['sort'] ?? 0),
        ':c' => gmdate('c'),
    ));
    if ($ok) { mp_sites(true); mp_sites_export_cache(); }
    return (bool)$ok;
}

/* Register the property this install has been measuring all along, using the
   settings it already holds, so the registry appearing changes nothing that a
   reader can see. Runs once: after that the table is the source of truth. */
function mp_sites_bootstrap(): void {
    if (mp_sites(true)) return;
    $key = mp_site_default_key();
    $url = mp_get('site_url');
    $host = '';
    if ($url !== '') {
        $h = parse_url($url, PHP_URL_HOST);
        if (is_string($h)) $host = strtolower($h);
    }
    $bare = preg_replace('~^www\.~', '', $host) ?? '';
    $domains = array_values(array_unique(array_filter(array($host, $bare, $bare !== '' ? 'www.' . $bare : ''))));

    mp_site_save(array(
        'site_key' => $key,
        'token'    => $bare !== '' ? explode('.', $bare)[0] : $key,
        'label'    => mp_get('brand_name', $key),
        'brand'    => mp_get('brand_name', ''),
        'site_url' => $url,
        'domains'  => implode("\n", $domains),
        'timezone' => 'UTC',
        'active'   => 1,
        'sort'     => 0,
    ));
}
