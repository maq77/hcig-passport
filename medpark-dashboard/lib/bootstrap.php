<?php
/* ==========================================================================
   MedPark performance dashboard, bootstrap.
   Config, storage, auth and shared helpers.

   Secrets live OUTSIDE the web root in ~/dashboard-data/secrets.php and are
   never sent to the browser. Storage is SQLite in the same directory, so
   nothing has to be created by hand in cPanel.
   ========================================================================== */
declare(strict_types=1);

/* lib -> dashboard -> public_html -> home. Works from the web and from cron. */
define('MP_DATA_DIR', dirname(__DIR__, 3) . '/dashboard-data');
define('MP_SECRETS',  MP_DATA_DIR . '/secrets.php');
define('MP_DB',       MP_DATA_DIR . '/metrics.sqlite');
define('MP_VERSION',  '1.0');

if (!is_dir(MP_DATA_DIR)) { @mkdir(MP_DATA_DIR, 0700, true); }

/* ---------- settings ------------------------------------------------------
   Every credential the dashboard can use. Blank means "not connected yet".
   The interface says so plainly rather than showing an empty panel. */
function mp_default_settings(): array {
    return array(
        'admin_user'         => 'admin',
        'admin_hash'         => '',
        'site_url'           => 'https://www.medparkhospitals.com',
        'brand_name'         => 'MedPark Health Group',

        'ga4_property_id'    => '',
        'ga4_measurement_id' => 'G-QSK7TQV4S0',
        'google_sa_json'     => '',
        'gsc_site_url'       => 'https://www.medparkhospitals.com/',
        'gbp_account_id'     => '',
        'gbp_location_ids'   => '',
        'psi_api_key'        => '',

        'semrush_api_key'    => '',
        'semrush_database'   => 'eg',
        'yandex_counter_id'  => '110789001',
        'yandex_oauth_token' => '',

        'ai_prompts'         => "Which hospitals are in Hurghada?\nBest hospital in Hurghada for tourists\nEmergency doctor Hurghada at night\nKrankenhaus Hurghada Notfall\nSzpital Hurghada dla turystow\nWhere to see a doctor in Sahl Hasheesh\nDental clinic Hurghada for travellers\nDoes travel insurance work in Hurghada hospitals",
        'ai_brand_terms'     => 'MedPark, Med Park, MedPark Hospitals, MedPark Health Hub',
        'ai_competitors'     => 'Royal Hospital, Nile Hospital, Aseel Medical, Hurghada Medical Center',
    );
}

function mp_settings(bool $reload = false): array {
    static $cache = null;
    if ($cache !== null && !$reload) return $cache;
    $saved = is_file(MP_SECRETS) ? (include MP_SECRETS) : array();
    if (!is_array($saved)) $saved = array();
    $cache = array_merge(mp_default_settings(), $saved);
    return $cache;
}

function mp_get(string $key, string $default = ''): string {
    $s = mp_settings();
    return isset($s[$key]) ? (string)$s[$key] : $default;
}

function mp_save_settings(array $patch): bool {
    $next = array_merge(mp_settings(), $patch);
    $body = "<?php\n/* Written by the dashboard. Contains credentials.\n"
          . "   Never move this inside public_html and never commit it. */\n"
          . "return " . var_export($next, true) . ";\n";
    $ok = @file_put_contents(MP_SECRETS, $body, LOCK_EX) !== false;
    if ($ok) { @chmod(MP_SECRETS, 0600); mp_settings(true); }
    return $ok;
}

/* ---------- storage ------------------------------------------------------- */
function mp_db(): PDO {
    static $pdo = null;
    if ($pdo instanceof PDO) return $pdo;
    $fresh = !is_file(MP_DB);
    $pdo = new PDO('sqlite:' . MP_DB, null, null, array(
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ));
    $pdo->exec('PRAGMA journal_mode = WAL');
    mp_install($pdo);
    if ($fresh) @chmod(MP_DB, 0600);
    return $pdo;
}

function mp_install(PDO $db): void {
    /* One long table for every number, from every source. Keeping the shape
       generic means a new connector needs no schema change, and the group
       version can reuse this table with a site column added. */
    $db->exec("CREATE TABLE IF NOT EXISTS metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        day TEXT NOT NULL,
        source TEXT NOT NULL,
        metric TEXT NOT NULL,
        dim TEXT NOT NULL DEFAULT '',
        dim2 TEXT NOT NULL DEFAULT '',
        value REAL NOT NULL DEFAULT 0,
        UNIQUE(day, source, metric, dim, dim2)
    )");
    $db->exec("CREATE INDEX IF NOT EXISTS idx_metrics_day ON metrics(day)");
    $db->exec("CREATE INDEX IF NOT EXISTS idx_metrics_lookup ON metrics(source, metric, day)");

    $db->exec("CREATE TABLE IF NOT EXISTS ai_checks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        checked_at TEXT NOT NULL,
        engine TEXT NOT NULL,
        prompt TEXT NOT NULL,
        mentioned INTEGER NOT NULL DEFAULT 0,
        rank_position INTEGER,
        cited_url TEXT DEFAULT '',
        competitors TEXT DEFAULT '',
        notes TEXT DEFAULT ''
    )");

    $db->exec("CREATE TABLE IF NOT EXISTS issues (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        found_at TEXT NOT NULL,
        severity TEXT NOT NULL,
        area TEXT NOT NULL,
        title TEXT NOT NULL,
        detail TEXT NOT NULL DEFAULT '',
        advice TEXT NOT NULL DEFAULT '',
        fingerprint TEXT NOT NULL DEFAULT '',
        resolved INTEGER NOT NULL DEFAULT 0
    )");
    $db->exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_issue_fp ON issues(fingerprint)");

    $db->exec("CREATE TABLE IF NOT EXISTS runs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ran_at TEXT NOT NULL,
        source TEXT NOT NULL,
        status TEXT NOT NULL,
        message TEXT NOT NULL DEFAULT ''
    )");
}

function mp_metric_put(string $day, string $source, string $metric, float $value, string $dim = '', string $dim2 = ''): void {
    $st = mp_db()->prepare(
        "INSERT INTO metrics (day, source, metric, dim, dim2, value)
         VALUES (:d,:s,:m,:x,:y,:v)
         ON CONFLICT(day, source, metric, dim, dim2) DO UPDATE SET value = excluded.value"
    );
    $st->execute(array(':d'=>$day, ':s'=>$source, ':m'=>$metric, ':x'=>$dim, ':y'=>$dim2, ':v'=>$value));
}

function mp_sum(string $source, string $metric, string $from, string $to, ?string $dim = null): float {
    $sql = "SELECT COALESCE(SUM(value),0) v FROM metrics
            WHERE source=:s AND metric=:m AND day BETWEEN :a AND :b";
    $args = array(':s'=>$source, ':m'=>$metric, ':a'=>$from, ':b'=>$to);
    if ($dim !== null) { $sql .= " AND dim=:x"; $args[':x'] = $dim; }
    $st = mp_db()->prepare($sql); $st->execute($args);
    return (float)$st->fetchColumn();
}

/* Averages, for rates and durations that must not be added up. */
function mp_avg(string $source, string $metric, string $from, string $to): float {
    $st = mp_db()->prepare(
        "SELECT COALESCE(AVG(value),0) v FROM metrics
         WHERE source=:s AND metric=:m AND day BETWEEN :a AND :b"
    );
    $st->execute(array(':s'=>$source, ':m'=>$metric, ':a'=>$from, ':b'=>$to));
    return (float)$st->fetchColumn();
}

function mp_top(string $source, string $metric, string $from, string $to, int $limit = 5): array {
    $st = mp_db()->prepare(
        "SELECT dim, dim2, SUM(value) v FROM metrics
         WHERE source=:s AND metric=:m AND day BETWEEN :a AND :b AND dim <> ''
         GROUP BY dim ORDER BY v DESC LIMIT :l"
    );
    $st->bindValue(':s', $source); $st->bindValue(':m', $metric);
    $st->bindValue(':a', $from);   $st->bindValue(':b', $to);
    $st->bindValue(':l', $limit, PDO::PARAM_INT);
    $st->execute();
    return $st->fetchAll();
}

function mp_series(string $source, string $metric, string $from, string $to): array {
    $st = mp_db()->prepare(
        "SELECT day, SUM(value) v FROM metrics
         WHERE source=:s AND metric=:m AND day BETWEEN :a AND :b
         GROUP BY day ORDER BY day"
    );
    $st->execute(array(':s'=>$source, ':m'=>$metric, ':a'=>$from, ':b'=>$to));
    return $st->fetchAll();
}

function mp_has_data(string $source): bool {
    $st = mp_db()->prepare("SELECT 1 FROM metrics WHERE source=:s LIMIT 1");
    $st->execute(array(':s'=>$source));
    return (bool)$st->fetchColumn();
}

function mp_log_run(string $source, string $status, string $message = ''): void {
    $st = mp_db()->prepare("INSERT INTO runs (ran_at, source, status, message) VALUES (:t,:s,:st,:m)");
    $st->execute(array(':t'=>gmdate('c'), ':s'=>$source, ':st'=>$status, ':m'=>mb_substr($message, 0, 500)));
}

function mp_last_run(string $source): ?array {
    $st = mp_db()->prepare("SELECT * FROM runs WHERE source=:s ORDER BY id DESC LIMIT 1");
    $st->execute(array(':s'=>$source));
    $r = $st->fetch();
    return $r ?: null;
}

/* ---------- auth ---------------------------------------------------------- */
function mp_is_https(): bool {
    if (!empty($_SERVER['HTTPS']) && strtolower((string)$_SERVER['HTTPS']) !== 'off') return true;
    /* TLS is terminated upstream here, so the only reliable signal is the
       header the proxy adds. */
    if (!empty($_SERVER['HTTP_X_FORWARDED_PROTO'])
        && strtolower((string)$_SERVER['HTTP_X_FORWARDED_PROTO']) === 'https') return true;
    return (int)($_SERVER['SERVER_PORT'] ?? 0) === 443;
}

function mp_session_start(): void {
    if (session_status() !== PHP_SESSION_NONE) return;
    if (PHP_SAPI === 'cli') return;
    session_set_cookie_params(array(
        'lifetime' => 0, 'path' => '/', 'secure' => mp_is_https(),
        'httponly' => true, 'samesite' => 'Lax',
    ));
    session_name('MPDASH');
    session_start();
}

function mp_is_configured(): bool { return mp_get('admin_hash') !== ''; }
function mp_is_logged_in(): bool { mp_session_start(); return !empty($_SESSION['mp_ok']); }

function mp_require_login(): void {
    if (mp_is_logged_in()) return;
    header('Location: login.php');
    exit;
}

function mp_login(string $user, string $pass): bool {
    /* Constant work whether or not the user matches, so timing says nothing. */
    $hash = mp_get('admin_hash');
    $userOk = hash_equals(mp_get('admin_user'), $user);
    $passOk = $hash !== '' && password_verify($pass, $hash);
    if (!$userOk || !$passOk) return false;
    mp_session_start();
    session_regenerate_id(true);
    $_SESSION['mp_ok'] = true;
    $_SESSION['mp_user'] = $user;
    return true;
}

function mp_csrf(): string {
    mp_session_start();
    if (empty($_SESSION['mp_csrf'])) $_SESSION['mp_csrf'] = bin2hex(random_bytes(16));
    return $_SESSION['mp_csrf'];
}

function mp_csrf_ok($t): bool {
    mp_session_start();
    return is_string($t) && !empty($_SESSION['mp_csrf']) && hash_equals($_SESSION['mp_csrf'], $t);
}

/* ---------- helpers ------------------------------------------------------- */
function e($v): string { return htmlspecialchars((string)$v, ENT_QUOTES, 'UTF-8'); }
function mp_num($n, int $dp = 0): string { return number_format((float)$n, $dp); }

function mp_secs(float $s): string {
    if ($s <= 0) return '0s';
    $m = (int)floor($s / 60); $r = (int)round($s - $m * 60);
    return $m > 0 ? $m . 'm ' . $r . 's' : $r . 's';
}

function mp_delta(float $now, float $prev): array {
    if ($prev <= 0) return array('pct'=>null, 'dir'=>'flat');
    $pct = (($now - $prev) / $prev) * 100;
    return array('pct'=>$pct, 'dir'=>$pct > 1 ? 'up' : ($pct < -1 ? 'down' : 'flat'));
}

function mp_range(string $preset): array {
    $end = new DateTimeImmutable('yesterday');
    $map = array('7d'=>7, '28d'=>28, '90d'=>90, '365d'=>365);
    $days = isset($map[$preset]) ? $map[$preset] : 28;
    $start    = $end->sub(new DateInterval('P' . ($days - 1) . 'D'));
    $prevEnd  = $start->sub(new DateInterval('P1D'));
    $prevFrom = $prevEnd->sub(new DateInterval('P' . ($days - 1) . 'D'));
    return array(
        'from' => $start->format('Y-m-d'),    'to' => $end->format('Y-m-d'),
        'prev_from' => $prevFrom->format('Y-m-d'), 'prev_to' => $prevEnd->format('Y-m-d'),
        'days' => $days, 'preset' => $preset, 'label' => 'Last ' . $days . ' days',
    );
}

/* Which connectors can run. This drives every "not connected yet" state, so a
   panel with no credentials explains itself instead of looking broken. */
function mp_connectors_status(): array {
    $sa = mp_get('google_sa_json') !== '';
    return array(
        'ga4'     => array('name'=>'Google Analytics 4', 'ready'=>$sa && mp_get('ga4_property_id') !== '',   'needs'=>'GA4 property ID and the Google service account'),
        'gsc'     => array('name'=>'Search Console',     'ready'=>$sa && mp_get('gsc_site_url') !== '',      'needs'=>'Verified site URL and the Google service account'),
        'gbp'     => array('name'=>'Business Profile',   'ready'=>$sa && mp_get('gbp_location_ids') !== '',  'needs'=>'Location IDs for both branches'),
        'psi'     => array('name'=>'PageSpeed Insights', 'ready'=>true,  'needs'=>'Runs without a key, an API key just raises the rate limit'),
        'semrush' => array('name'=>'SEMrush',            'ready'=>mp_get('semrush_api_key') !== '',         'needs'=>'API key from an account with API units'),
        'yandex'  => array('name'=>'Yandex Metrica',     'ready'=>mp_get('yandex_oauth_token') !== '',      'needs'=>'OAuth token for counter ' . mp_get('yandex_counter_id')),
        'ai'      => array('name'=>'AI visibility',      'ready'=>true,  'needs'=>'Prompt results are recorded in the AI page each month'),
    );
}
