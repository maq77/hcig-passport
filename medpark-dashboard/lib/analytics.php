<?php
/* ===========================================================================
   First-party analytics: schema, import, sessionisation and rollups.

   Added 2026-09-03.

   WHY THIS EXISTS
   We measured what people did on the site (calls, WhatsApp, clicks, scroll)
   and nothing at all about who they were or where they came from. No
   pageviews, no sessions, no referrers, no country. That is the spine every
   other question hangs off, so it is built here.

   THE ONE RULE THAT SHAPES EVERYTHING
   The public endpoint never touches this database. It appends one JSON line
   to a spool file and returns. Everything in this file runs on the dashboard
   side, on a schedule, in one transaction, away from visitor traffic. The
   first behaviour beacon opened a write transaction per request on a public
   URL, and that was a genuine risk to a shared server. It is not repeated.

   IDENTITY, two tiers as agreed
     consent 0  a daily rotating hash of address, agent and language. The salt
                changes every day, so the same person is a different visitor
                tomorrow. No cookie, no device storage, nothing to consent to.
                This is the default and it runs everywhere from day one.
     consent 1  a first-party identifier, kept only after the visitor accepts.
                Adds returning visitors and the journey to an enquiry.
   The raw address is used to compute the hash at import time and is then
   discarded. It is never written to any table.

   SESSIONS WITHOUT CLIENT STORAGE
   The browser sends no session identifier at all. The importer groups a
   visitor's pageviews and starts a new session after 30 minutes of
   inactivity, which is the standard definition and needs nothing stored on
   the device.

   GROUP READY
   Every table carries `site`. The group rollout is a rollout, not a rewrite.
   =========================================================================== */
declare(strict_types=1);

/* The geo reader. Loaded here rather than on first use, so that
   function_exists() checks elsewhere give the right answer. It opens no
   file and reads nothing until a lookup actually asks it to. */
require_once __DIR__ . '/geoip.php';

const A_SPOOL     = 'a-spool.ndjson';
const A_GAP       = 1800;    /* seconds of inactivity that ends a session */
const A_MAX_LINES = 40000;   /* per run, so one import can never stall */

/* Which site these rows belong to. One value today, a list tomorrow. */
function mpa_site(): string {
    static $s = null;
    if ($s !== null) return $s;
    $u = strtolower(mp_get('site_url', 'medpark'));
    $u = (string)preg_replace('~^https?://(www\.)?~', '', $u);
    $u = trim($u, '/');
    $s = ($u === '') ? 'medpark' : substr($u, 0, 60);
    return $s;
}

/* ---------------------------------------------------------------------------
   Schema
   ------------------------------------------------------------------------ */
function mpa_install(PDO $db): void {

    /* One row per person, as far as we can honestly tell. */
    $db->exec("CREATE TABLE IF NOT EXISTS a_visitors (
        site TEXT NOT NULL DEFAULT '',
        vid TEXT NOT NULL,
        first_at TEXT NOT NULL,
        last_at TEXT NOT NULL,
        sessions INTEGER NOT NULL DEFAULT 0,
        pageviews INTEGER NOT NULL DEFAULT 0,
        events INTEGER NOT NULL DEFAULT 0,
        engaged INTEGER NOT NULL DEFAULT 0,
        consent INTEGER NOT NULL DEFAULT 0,
        first_source TEXT NOT NULL DEFAULT '',
        first_medium TEXT NOT NULL DEFAULT '',
        first_campaign TEXT NOT NULL DEFAULT '',
        country TEXT NOT NULL DEFAULT '',
        converted INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY (site, vid)
    )");
    $db->exec("CREATE INDEX IF NOT EXISTS idx_av_last ON a_visitors(site, last_at)");

    /* One row per visit. Most questions are answered from this table. */
    $db->exec("CREATE TABLE IF NOT EXISTS a_sessions (
        site TEXT NOT NULL DEFAULT '',
        sid TEXT NOT NULL,
        vid TEXT NOT NULL DEFAULT '',
        day TEXT NOT NULL,
        started_at TEXT NOT NULL,
        ended_at TEXT NOT NULL,
        started_ts INTEGER NOT NULL DEFAULT 0,
        entry_path TEXT NOT NULL DEFAULT '',
        exit_path TEXT NOT NULL DEFAULT '',
        referrer TEXT NOT NULL DEFAULT '',
        ref_domain TEXT NOT NULL DEFAULT '',
        ref_type TEXT NOT NULL DEFAULT 'direct',
        source TEXT NOT NULL DEFAULT '',
        medium TEXT NOT NULL DEFAULT '',
        campaign TEXT NOT NULL DEFAULT '',
        term TEXT NOT NULL DEFAULT '',
        content TEXT NOT NULL DEFAULT '',
        country TEXT NOT NULL DEFAULT '',
        region TEXT NOT NULL DEFAULT '',
        city TEXT NOT NULL DEFAULT '',
        lang TEXT NOT NULL DEFAULT '',
        device TEXT NOT NULL DEFAULT '',
        browser TEXT NOT NULL DEFAULT '',
        os TEXT NOT NULL DEFAULT '',
        vw INTEGER NOT NULL DEFAULT 0,
        vh INTEGER NOT NULL DEFAULT 0,
        pageviews INTEGER NOT NULL DEFAULT 0,
        events INTEGER NOT NULL DEFAULT 0,
        engaged INTEGER NOT NULL DEFAULT 0,
        max_scroll INTEGER NOT NULL DEFAULT 0,
        is_new INTEGER NOT NULL DEFAULT 1,
        bounced INTEGER NOT NULL DEFAULT 1,
        converted INTEGER NOT NULL DEFAULT 0,
        consent INTEGER NOT NULL DEFAULT 0,
        dow INTEGER NOT NULL DEFAULT 0,
        hour INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY (site, sid)
    )");
    $db->exec("CREATE INDEX IF NOT EXISTS idx_as_day ON a_sessions(site, day)");
    $db->exec("CREATE INDEX IF NOT EXISTS idx_as_vid ON a_sessions(site, vid, started_ts)");

    /* One row per page opened, keeping the order, so journeys reconstruct. */
    $db->exec("CREATE TABLE IF NOT EXISTS a_pageviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        site TEXT NOT NULL DEFAULT '',
        sid TEXT NOT NULL DEFAULT '',
        vid TEXT NOT NULL DEFAULT '',
        day TEXT NOT NULL,
        at TEXT NOT NULL,
        ts INTEGER NOT NULL DEFAULT 0,
        path TEXT NOT NULL DEFAULT '',
        title TEXT NOT NULL DEFAULT '',
        ptype TEXT NOT NULL DEFAULT '',
        seq INTEGER NOT NULL DEFAULT 1,
        engaged INTEGER NOT NULL DEFAULT 0,
        max_scroll INTEGER NOT NULL DEFAULT 0,
        load_ms INTEGER NOT NULL DEFAULT 0,
        is_entry INTEGER NOT NULL DEFAULT 0,
        is_exit INTEGER NOT NULL DEFAULT 0,
        lang TEXT NOT NULL DEFAULT '',
        device TEXT NOT NULL DEFAULT '',
        country TEXT NOT NULL DEFAULT ''
    )");
    $db->exec("CREATE INDEX IF NOT EXISTS idx_apv_day  ON a_pageviews(site, day)");
    $db->exec("CREATE INDEX IF NOT EXISTS idx_apv_sid  ON a_pageviews(site, sid, ts)");
    $db->exec("CREATE INDEX IF NOT EXISTS idx_apv_vid  ON a_pageviews(site, vid, ts)");
    $db->exec("CREATE INDEX IF NOT EXISTS idx_apv_path ON a_pageviews(site, path, day)");

    /* One row per action. Every button, every section, every frustration. */
    $db->exec("CREATE TABLE IF NOT EXISTS a_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        site TEXT NOT NULL DEFAULT '',
        sid TEXT NOT NULL DEFAULT '',
        vid TEXT NOT NULL DEFAULT '',
        day TEXT NOT NULL,
        at TEXT NOT NULL,
        ts INTEGER NOT NULL DEFAULT 0,
        name TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT '',
        label TEXT NOT NULL DEFAULT '',
        placement TEXT NOT NULL DEFAULT '',
        path TEXT NOT NULL DEFAULT '',
        value REAL NOT NULL DEFAULT 0,
        meta TEXT NOT NULL DEFAULT '',
        lang TEXT NOT NULL DEFAULT '',
        device TEXT NOT NULL DEFAULT '',
        country TEXT NOT NULL DEFAULT ''
    )");
    $db->exec("CREATE INDEX IF NOT EXISTS idx_aev_day  ON a_events(site, day, name)");
    $db->exec("CREATE INDEX IF NOT EXISTS idx_aev_sid  ON a_events(site, sid)");
    $db->exec("CREATE INDEX IF NOT EXISTS idx_aev_name ON a_events(site, name, day)");

    /* Pre-aggregated numbers for the headline charts, so a chart never scans
       raw rows. Anything filtered is read from the raw tables, which have real
       columns and can simply be queried. */
    $db->exec("CREATE TABLE IF NOT EXISTS a_daily (
        site TEXT NOT NULL DEFAULT '',
        day TEXT NOT NULL,
        metric TEXT NOT NULL,
        dim TEXT NOT NULL DEFAULT '',
        dim2 TEXT NOT NULL DEFAULT '',
        value REAL NOT NULL DEFAULT 0,
        PRIMARY KEY (site, day, metric, dim, dim2)
    )");
    $db->exec("CREATE INDEX IF NOT EXISTS idx_ad_lookup ON a_daily(site, metric, day)");

    /* Import bookkeeping, so a run can be inspected afterwards. */
    $db->exec("CREATE TABLE IF NOT EXISTS a_runs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ran_at TEXT NOT NULL,
        lines INTEGER NOT NULL DEFAULT 0,
        pageviews INTEGER NOT NULL DEFAULT 0,
        events INTEGER NOT NULL DEFAULT 0,
        bots INTEGER NOT NULL DEFAULT 0,
        bad INTEGER NOT NULL DEFAULT 0,
        ms INTEGER NOT NULL DEFAULT 0,
        message TEXT NOT NULL DEFAULT ''
    )");
}

/* ---------------------------------------------------------------------------
   Identity

   The salt changes every day and lives outside the web root. Yesterday's
   hashes cannot be linked to today's, which is what makes the default tier
   genuinely cookieless rather than a cookie by another name.
   ------------------------------------------------------------------------ */
function mpa_salt(string $day): string {
    static $seed = null;
    if ($seed === null) {
        $f = MP_DATA_DIR . '/.a-seed';
        $seed = is_file($f) ? trim((string)@file_get_contents($f)) : '';
        if (strlen($seed) < 32) {
            $seed = bin2hex(random_bytes(32));
            @file_put_contents($f, $seed, LOCK_EX);
            @chmod($f, 0600);
        }
    }
    return hash('sha256', $seed . '|' . $day);
}

function mpa_vid(string $ip, string $ua, string $lang, string $day): string {
    return substr(hash('sha256', mpa_salt($day) . '|' . $ip . '|' . $ua . '|' . $lang), 0, 20);
}

/* ---------------------------------------------------------------------------
   Agent parsing

   Deliberately small. Browser and operating system families are all any
   decision here depends on, and a longer list would be wrong within a year.
   ------------------------------------------------------------------------ */
function mpa_is_bot(string $ua): bool {
    if ($ua === '') return true;
    return (bool)preg_match(
        '~bot|crawl|spider|slurp|scrape|curl|wget|python-requests|okhttp|headless|'
      . 'lighthouse|pingdom|uptime|monitor|preview|facebookexternalhit|telegram|'
      . 'semrush|ahrefs|mj12|dotbot|petal|bytespider|gptbot|claudebot|applebot~i', $ua);
}

function mpa_browser(string $ua): string {
    if (preg_match('~Edg[eiA]?/~i', $ua))      return 'Edge';
    if (preg_match('~OPR/|Opera~i', $ua))      return 'Opera';
    if (preg_match('~SamsungBrowser~i', $ua))  return 'Samsung Internet';
    if (preg_match('~Firefox/|FxiOS~i', $ua))  return 'Firefox';
    if (preg_match('~Chrome/|CriOS~i', $ua))   return 'Chrome';
    if (preg_match('~Safari/~i', $ua))         return 'Safari';
    return 'Other';
}

function mpa_os(string $ua): string {
    if (preg_match('~Android~i', $ua))              return 'Android';
    if (preg_match('~iPhone|iPad|iPod|iOS~i', $ua)) return 'iOS';
    if (preg_match('~Windows~i', $ua))              return 'Windows';
    if (preg_match('~Mac OS X|Macintosh~i', $ua))   return 'macOS';
    if (preg_match('~Linux~i', $ua))                return 'Linux';
    return 'Other';
}

/* ---------------------------------------------------------------------------
   Where the visit came from

   AI assistants get their own type rather than being buried inside referral.
   Given that most of this year's work is about being cited by them, a visit
   arriving from ChatGPT or Perplexity is the most interesting row in the
   table and it should not take a filter to find.

   Returns array(type, readable name).
   ------------------------------------------------------------------------ */
function mpa_ref_type(string $domain, string $medium): array {
    $d = strtolower($domain);
    $m = strtolower($medium);
    if ($m === 'cpc' || $m === 'ppc' || $m === 'paid') return array('paid', $d !== '' ? $d : 'Paid');
    if ($d === '') return array('direct', 'Direct');

    $ai = array('chatgpt.com'=>'ChatGPT', 'chat.openai.com'=>'ChatGPT', 'openai.com'=>'ChatGPT',
                'perplexity.ai'=>'Perplexity', 'claude.ai'=>'Claude', 'gemini.google.com'=>'Gemini',
                'bard.google.com'=>'Gemini', 'copilot.microsoft.com'=>'Copilot',
                'you.com'=>'You.com', 'poe.com'=>'Poe', 'phind.com'=>'Phind');
    foreach ($ai as $host => $name) {
        if ($d === $host || substr($d, -(strlen($host) + 1)) === '.' . $host) return array('ai', $name);
    }

    if (strpos($d, 'google.') !== false && strpos($d, 'maps') !== false) return array('maps', 'Google Maps');

    $search = array('google.'=>'Google', 'bing.com'=>'Bing', 'yahoo.'=>'Yahoo',
                    'duckduckgo.com'=>'DuckDuckGo', 'yandex.'=>'Yandex', 'ecosia.org'=>'Ecosia',
                    'baidu.com'=>'Baidu', 'search.brave.com'=>'Brave', 'seznam.cz'=>'Seznam');
    foreach ($search as $frag => $name) if (strpos($d, $frag) !== false) return array('search', $name);

    $social = array('facebook.'=>'Facebook', 'fb.com'=>'Facebook', 'instagram.'=>'Instagram',
                    't.co'=>'X', 'twitter.'=>'X', 'x.com'=>'X', 'linkedin.'=>'LinkedIn',
                    'tiktok.'=>'TikTok', 'youtube.'=>'YouTube', 'youtu.be'=>'YouTube',
                    'pinterest.'=>'Pinterest', 'reddit.'=>'Reddit', 'wa.me'=>'WhatsApp',
                    'whatsapp.'=>'WhatsApp', 't.me'=>'Telegram', 'telegram.'=>'Telegram',
                    'vk.com'=>'VK', 'ok.ru'=>'Odnoklassniki', 'tripadvisor.'=>'Tripadvisor');
    foreach ($social as $frag => $name) if (strpos($d, $frag) !== false) return array('social', $name);

    return array('referral', $d);
}

/* Page family, matching the classification mp-track.js already uses, so the
   two data sets compare without a translation table. */
function mpa_ptype(string $p): string {
    $p = rtrim(strtolower($p), '/');
    if ($p === '' || $p === '/de' || $p === '/pl')        return 'home';
    if (preg_match('~emergency|notfall|pomoc~', $p))      return 'emergency';
    if (preg_match('~healthhub|medparkhospital~', $p))    return 'location';
    if (preg_match('~service|leistung|uslugi~', $p))      return 'services';
    if (preg_match('~diagnost~', $p))                     return 'diagnostics';
    if (preg_match('~icu|critical~', $p))                 return 'icu';
    if (preg_match('~package|paket~', $p))                return 'packages';
    if (preg_match('~contact|kontakt~', $p))              return 'contact';
    if (preg_match('~news|neuigkeiten|aktualnosci~', $p)) return 'news';
    if (preg_match('~about|uber|onas~', $p))              return 'about';
    return 'other';
}

/* Events that mean somebody tried to reach the hospital. The single most
   important definition in this file, so it lives in exactly one place. */
function mpa_conversion_events(): array {
    return array('call_click', 'whatsapp_click', 'email_click',
                 'enquiry_submit', 'enquiry_complete', 'chat_lead');
}

/* Geography. Delegates to the MaxMind reader when the database is installed,
   and returns blanks rather than failing when it is not, so every other part
   of the system works before the geo file is in place. */
function mpa_geo(string $ip): array {
    if (!function_exists('mpa_geo_lookup')) {
        return array('country' => '', 'region' => '', 'city' => '');
    }
    return mpa_geo_lookup($ip);
}

/* ---------------------------------------------------------------------------
   Import

   Drains the spool into the raw tables, rebuilds every session it touched,
   and refreshes the rollups for the affected days. Idempotent per run: the
   spool is renamed aside first, exactly as the behaviour importer does, so a
   beacon arriving mid-import is neither lost nor counted twice.
   ------------------------------------------------------------------------ */
function mpa_import(): array {
    $t0    = microtime(true);
    $site  = mpa_site();
    $spool = MP_DATA_DIR . '/' . A_SPOOL;

    if (!is_file($spool) || filesize($spool) === 0) {
        return array('ok' => true, 'msg' => 'nothing waiting', 'rows' => 0);
    }

    $work = $spool . '.' . gmdate('YmdHis') . '.work';
    if (!@rename($spool, $work)) {
        return array('ok' => false, 'msg' => 'could not claim the spool', 'rows' => 0);
    }

    $fh = @fopen($work, 'rb');
    if (!$fh) {
        return array('ok' => false, 'msg' => 'could not read the spool', 'rows' => 0);
    }

    /* Read and normalise first, write second. Parsing outside the transaction
       keeps the write lock held for as short a time as possible. */
    $rows = array();
    $lines = 0; $bots = 0; $bad = 0;
    while (($line = fgets($fh)) !== false) {
        if (++$lines > A_MAX_LINES) break;
        $line = trim($line);
        if ($line === '') continue;

        $in = json_decode($line, true);
        if (!is_array($in)) { $bad++; continue; }

        $ua = (string)($in['ua'] ?? '');
        if (mpa_is_bot($ua)) { $bots++; continue; }

        $r = mpa_normalise($in, $site);
        if ($r === null) { $bad++; continue; }
        $rows[] = $r;
    }
    fclose($fh);
    @unlink($work);

    if (!$rows) {
        mpa_log_run($lines, 0, 0, $bots, $bad, (int)round((microtime(true) - $t0) * 1000), 'no usable rows');
        return array('ok' => true, 'msg' => 'nothing usable (' . $bots . ' automated)', 'rows' => 0);
    }

    /* Oldest first, so session stitching sees time move forwards. */
    usort($rows, function ($a, $b) { return $a['ts'] <=> $b['ts']; });

    $db = mp_db();
    $db->beginTransaction();
    try {
        $pvIns = $db->prepare(
            "INSERT INTO a_pageviews
             (site, sid, vid, day, at, ts, path, title, ptype, seq, engaged, max_scroll,
              load_ms, is_entry, is_exit, lang, device, country)
             VALUES (:site,:sid,:vid,:day,:at,:ts,:path,:title,:ptype,:seq,:eng,:scroll,
                     :load,:entry,:exit,:lang,:dev,:cty)");
        $evIns = $db->prepare(
            "INSERT INTO a_events
             (site, sid, vid, day, at, ts, name, category, label, placement, path, value,
              meta, lang, device, country)
             VALUES (:site,:sid,:vid,:day,:at,:ts,:name,:cat,:label,:place,:path,:val,
                     :meta,:lang,:dev,:cty)");

        /* Last activity per visitor, so a session can span import runs. */
        $lastQ = $db->prepare(
            "SELECT sid, ts, seq FROM a_pageviews
             WHERE site = :site AND vid = :vid ORDER BY ts DESC LIMIT 1");

        /* Only the newest pageview in a session is the exit, so earlier ones
           are corrected as the visit grows. Prepared once, like the rest. */
        $unExit = $db->prepare(
            "UPDATE a_pageviews SET is_exit = 0
             WHERE site = :s AND sid = :sid AND seq < :seq");

        $seen  = array();   /* vid -> array(sid, ts, seq) within this batch */
        $sids  = array();   /* touched sessions */
        $days  = array();   /* touched days */
        $nPv = 0; $nEv = 0;

        foreach ($rows as $r) {
            $vid = $r['vid'];

            if (isset($seen[$vid])) {
                $prev = $seen[$vid];
            } else {
                $lastQ->execute(array(':site' => $site, ':vid' => $vid));
                $hit  = $lastQ->fetch();
                $prev = $hit ? array($hit['sid'], (int)$hit['ts'], (int)$hit['seq']) : null;
            }

            if ($prev !== null && ($r['ts'] - $prev[1]) <= A_GAP) {
                $sid = $prev[0];
                $seq = $prev[2] + 1;
            } else {
                $sid = substr(hash('sha256', $site . '|' . $vid . '|' . $r['ts']), 0, 16);
                $seq = 1;
            }
            $seen[$vid] = array($sid, $r['ts'], $seq);
            $sids[$sid] = true;
            $days[$r['day']] = true;

            $pvIns->execute(array(
                ':site' => $site, ':sid' => $sid, ':vid' => $vid, ':day' => $r['day'],
                ':at' => $r['at'], ':ts' => $r['ts'], ':path' => $r['path'],
                ':title' => $r['title'], ':ptype' => $r['ptype'], ':seq' => $seq,
                ':eng' => $r['engaged'], ':scroll' => $r['scroll'], ':load' => $r['load'],
                ':entry' => ($seq === 1 ? 1 : 0), ':exit' => 1,
                ':lang' => $r['lang'], ':dev' => $r['device'], ':cty' => $r['country'],
            ));
            $nPv++;

            if ($seq > 1) {
                $unExit->execute(array(':s' => $site, ':sid' => $sid, ':seq' => $seq));
            }

            foreach ($r['events'] as $e) {
                $evIns->execute(array(
                    ':site' => $site, ':sid' => $sid, ':vid' => $vid, ':day' => $r['day'],
                    ':at' => gmdate('c', $e['ts']), ':ts' => $e['ts'],
                    ':name' => $e['name'], ':cat' => $e['cat'], ':label' => $e['label'],
                    ':place' => $e['place'], ':path' => $r['path'], ':val' => $e['val'],
                    ':meta' => $e['meta'], ':lang' => $r['lang'],
                    ':dev' => $r['device'], ':cty' => $r['country'],
                ));
                $nEv++;
            }

            /* Session-level facts are carried on the first pageview of a visit
               and stashed for the rebuild that follows. */
            if ($seq === 1) mpa_stash_session($db, $site, $sid, $vid, $r);
        }

        foreach (array_keys($sids) as $sid) mpa_rebuild_session($db, $site, $sid);
        mpa_rebuild_visitors($db, $site, array_keys($seen));

        $db->commit();
    } catch (Throwable $ex) {
        $db->rollBack();
        mpa_log_run($lines, 0, 0, $bots, $bad, (int)round((microtime(true) - $t0) * 1000), $ex->getMessage());
        return array('ok' => false, 'msg' => 'import failed: ' . $ex->getMessage(), 'rows' => 0);
    }

    foreach (array_keys($days) as $d) mpa_rollup($d);

    $ms = (int)round((microtime(true) - $t0) * 1000);
    mpa_log_run($lines, $nPv, $nEv, $bots, $bad, $ms, 'ok');
    return array('ok' => true, 'rows' => $nPv,
                 'msg' => $nPv . ' pages, ' . $nEv . ' events, ' . $bots . ' automated ignored');
}

/* Turn one spool line into a clean row, or null if it cannot be trusted.
   Everything is clamped here so nothing downstream has to defend itself. */
function mpa_normalise(array $in, string $site): ?array {
    $ts = (int)($in['ts'] ?? 0);
    if ($ts < 1600000000 || $ts > time() + 86400) $ts = time();

    $path = '/' . ltrim(strtok((string)($in['p'] ?? '/'), '?'), '/');
    if (strlen($path) > 200 || !preg_match('~^/[A-Za-z0-9/_.\-]*$~', $path)) return null;

    $ip   = (string)($in['ip'] ?? '');
    $ua   = (string)($in['ua'] ?? '');
    $lang = substr(preg_replace('~[^a-z\-]~', '', strtolower((string)($in['l'] ?? ''))) ?? '', 0, 5);
    $day  = gmdate('Y-m-d', $ts);

    $geo = mpa_geo($ip);

    /* The address is used here and nowhere else. It is not returned. */
    $vid = (string)($in['cid'] ?? '') !== ''
         ? substr(preg_replace('~[^A-Za-z0-9]~', '', (string)$in['cid']) ?? '', 0, 20)
         : mpa_vid($ip, $ua, $lang, $day);
    if ($vid === '') return null;

    $ref    = (string)($in['r'] ?? '');
    $refDom = '';
    if ($ref !== '') {
        $h = parse_url($ref, PHP_URL_HOST);
        if (is_string($h)) $refDom = strtolower(preg_replace('~^www\.~', '', $h) ?? '');
        /* Our own pages are not a referrer. */
        if ($refDom !== '' && strpos($site, $refDom) !== false) { $refDom = ''; $ref = ''; }
    }

    $q = is_array($in['q'] ?? null) ? $in['q'] : array();
    $cut = function ($v) { return substr(trim(preg_replace('~[\x00-\x1f]~', '', (string)$v) ?? ''), 0, 80); };

    $medium = $cut($q['utm_medium'] ?? '');
    list($refType, $refName) = mpa_ref_type($refDom, $medium);

    $source = $cut($q['utm_source'] ?? '');
    if ($source === '') $source = $refName;

    $events = array();
    foreach ((is_array($in['ev'] ?? null) ? $in['ev'] : array()) as $e) {
        if (count($events) >= 120) break;
        if (!is_array($e)) continue;
        $name = substr(preg_replace('~[^a-z0-9_]~', '', strtolower((string)($e['n'] ?? ''))) ?? '', 0, 40);
        if ($name === '') continue;
        $ets = (int)($e['t'] ?? 0);
        $events[] = array(
            'name'  => $name,
            'cat'   => substr(preg_replace('~[^a-z0-9_]~', '', strtolower((string)($e['c'] ?? ''))) ?? '', 0, 30),
            'label' => $cut($e['l'] ?? ''),
            'place' => $cut($e['pl'] ?? ''),
            'val'   => (float)($e['v'] ?? 0),
            'meta'  => substr((string)($e['m'] ?? ''), 0, 300),
            'ts'    => ($ets >= 1600000000 && $ets <= time() + 86400) ? $ets : $ts,
        );
    }

    /* Sections seen become events, so "which parts of the page get read" is
       answered from the same table as everything else. */
    foreach ((is_array($in['sec'] ?? null) ? $in['sec'] : array()) as $name => $secs) {
        if (count($events) >= 160) break;
        $name = $cut($name);
        if ($name === '') continue;
        $events[] = array('name' => 'section_view', 'cat' => 'content', 'label' => $name,
                          'place' => '', 'val' => max(0, min(3600, (int)$secs)), 'meta' => '', 'ts' => $ts);
    }

    $dev = (string)($in['d'] ?? '');
    if ($dev !== 'mobile' && $dev !== 'tablet' && $dev !== 'desktop') {
        $dev = preg_match('~Mobi|Android|iPhone~i', $ua) ? 'mobile' : 'desktop';
    }

    return array(
        'ts' => $ts, 'day' => $day, 'at' => gmdate('c', $ts),
        'vid' => $vid, 'path' => $path,
        'title'   => substr(trim(preg_replace('~\s+~u', ' ', (string)($in['t'] ?? '')) ?? ''), 0, 160),
        'ptype'   => mpa_ptype($path),
        'engaged' => max(0, min(7200, (int)($in['e'] ?? 0))),
        'scroll'  => max(0, min(100, (int)($in['s'] ?? 0))),
        'load'    => max(0, min(120000, (int)($in['lt'] ?? 0))),
        'lang'    => $lang,
        'device'  => $dev,
        'browser' => mpa_browser($ua),
        'os'      => mpa_os($ua),
        'vw'      => max(0, min(10000, (int)($in['vw'] ?? 0))),
        'vh'      => max(0, min(10000, (int)($in['vh'] ?? 0))),
        'country' => $geo['country'], 'region' => $geo['region'], 'city' => $geo['city'],
        'ref' => substr($ref, 0, 300), 'ref_domain' => substr($refDom, 0, 100),
        'ref_type' => $refType,
        'source' => $source, 'medium' => $medium,
        'campaign' => $cut($q['utm_campaign'] ?? ''),
        'term' => $cut($q['utm_term'] ?? ''), 'content' => $cut($q['utm_content'] ?? ''),
        'consent' => ((int)($in['cs'] ?? 0) === 1) ? 1 : 0,
        'hour' => max(0, min(23, (int)($in['h'] ?? (int)gmdate('G', $ts)))),
        'dow'  => max(0, min(6,  (int)($in['w'] ?? (int)gmdate('w', $ts)))),
        'events' => $events,
    );
}

/* The acquisition facts belong to the visit, not the page, so they are written
   once from the first pageview and never overwritten by later pages. */
function mpa_stash_session(PDO $db, string $site, string $sid, string $vid, array $r): void {
    /* Both statements run once per new visit, so they are prepared once per
       process rather than once per call. */
    static $known = null, $ins = null;

    if ($known === null) {
        $known = $db->prepare("SELECT 1 FROM a_visitors WHERE site = :s AND vid = :v");
    }
    $known->execute(array(':s' => $site, ':v' => $vid));
    $isNew = $known->fetchColumn() ? 0 : 1;

    if ($ins === null) {
        $ins = $db->prepare(
        "INSERT INTO a_sessions
         (site, sid, vid, day, started_at, ended_at, started_ts, entry_path, exit_path,
          referrer, ref_domain, ref_type, source, medium, campaign, term, content,
          country, region, city, lang, device, browser, os, vw, vh, is_new, consent, dow, hour)
         VALUES (:site,:sid,:vid,:day,:at,:at,:ts,:path,:path,
                 :ref,:refd,:reft,:src,:med,:camp,:term,:cont,
                 :cty,:reg,:city,:lang,:dev,:br,:os,:vw,:vh,:new,:cs,:dow,:hour)
         ON CONFLICT(site, sid) DO NOTHING");
    }

    $ins->execute(array(
        ':site' => $site, ':sid' => $sid, ':vid' => $vid, ':day' => $r['day'],
        ':at' => $r['at'], ':ts' => $r['ts'], ':path' => $r['path'],
        ':ref' => $r['ref'], ':refd' => $r['ref_domain'], ':reft' => $r['ref_type'],
        ':src' => $r['source'], ':med' => $r['medium'], ':camp' => $r['campaign'],
        ':term' => $r['term'], ':cont' => $r['content'],
        ':cty' => $r['country'], ':reg' => $r['region'], ':city' => $r['city'],
        ':lang' => $r['lang'], ':dev' => $r['device'], ':br' => $r['browser'], ':os' => $r['os'],
        ':vw' => $r['vw'], ':vh' => $r['vh'], ':new' => $isNew, ':cs' => $r['consent'],
        ':dow' => $r['dow'], ':hour' => $r['hour'],
    ));
}

/* Recompute one session from its own pageviews and events. Cheap, and it means
   a re-import or a backfill produces exactly the same numbers. */
function mpa_rebuild_session(PDO $db, string $site, string $sid): void {
    $conv = mpa_conversion_events();
    $marks = implode(',', array_fill(0, count($conv), '?'));

    $st = $db->prepare(
        "SELECT COUNT(*) pv, COALESCE(SUM(engaged),0) eng, COALESCE(MAX(max_scroll),0) sc,
                MIN(ts) a, MAX(ts) b
         FROM a_pageviews WHERE site = ? AND sid = ?");
    $st->execute(array($site, $sid));
    $p = $st->fetch();
    if (!$p || (int)$p['pv'] === 0) return;

    $st = $db->prepare("SELECT COUNT(*) FROM a_events WHERE site = ? AND sid = ?");
    $st->execute(array($site, $sid));
    $events = (int)$st->fetchColumn();

    $st = $db->prepare("SELECT COUNT(*) FROM a_events WHERE site = ? AND sid = ? AND name IN ($marks)");
    $st->execute(array_merge(array($site, $sid), $conv));
    $converted = ((int)$st->fetchColumn() > 0) ? 1 : 0;

    $st = $db->prepare("SELECT path FROM a_pageviews WHERE site = ? AND sid = ? ORDER BY ts DESC, id DESC LIMIT 1");
    $st->execute(array($site, $sid));
    $exit = (string)$st->fetchColumn();

    /* A bounce is one page with nothing done on it. A visitor who read one page
       for two minutes and then called is not a bounce, whatever GA4 says. */
    $bounced = ((int)$p['pv'] === 1 && $events === 0 && (int)$p['eng'] < 15) ? 1 : 0;

    $db->prepare(
        "UPDATE a_sessions SET pageviews = :pv, events = :ev, engaged = :eng,
              max_scroll = :sc, converted = :cv, bounced = :bo,
              ended_at = :end, exit_path = :exit
         WHERE site = :s AND sid = :sid"
    )->execute(array(
        ':pv' => (int)$p['pv'], ':ev' => $events, ':eng' => (int)$p['eng'],
        ':sc' => (int)$p['sc'], ':cv' => $converted, ':bo' => $bounced,
        ':end' => gmdate('c', (int)$p['b']), ':exit' => $exit,
        ':s' => $site, ':sid' => $sid,
    ));
}

function mpa_rebuild_visitors(PDO $db, string $site, array $vids): void {
    if (!$vids) return;
    $up = $db->prepare(
        "INSERT INTO a_visitors
           (site, vid, first_at, last_at, sessions, pageviews, events, engaged, consent,
            first_source, first_medium, first_campaign, country, converted)
         SELECT :site, :vid, MIN(started_at), MAX(ended_at), COUNT(*),
                COALESCE(SUM(pageviews),0), COALESCE(SUM(events),0), COALESCE(SUM(engaged),0),
                COALESCE(MAX(consent),0),
                '', '', '', COALESCE(MAX(country),''), COALESCE(MAX(converted),0)
         FROM a_sessions WHERE site = :site AND vid = :vid
         ON CONFLICT(site, vid) DO UPDATE SET
            last_at = excluded.last_at, sessions = excluded.sessions,
            pageviews = excluded.pageviews, events = excluded.events,
            engaged = excluded.engaged, consent = excluded.consent,
            country = excluded.country,
            converted = MAX(a_visitors.converted, excluded.converted)");

    $first = $db->prepare(
        "UPDATE a_visitors SET first_source = COALESCE((
             SELECT source FROM a_sessions WHERE site = :site AND vid = :vid
             ORDER BY started_ts ASC LIMIT 1), ''),
           first_medium = COALESCE((
             SELECT medium FROM a_sessions WHERE site = :site AND vid = :vid
             ORDER BY started_ts ASC LIMIT 1), ''),
           first_campaign = COALESCE((
             SELECT campaign FROM a_sessions WHERE site = :site AND vid = :vid
             ORDER BY started_ts ASC LIMIT 1), '')
         WHERE site = :site AND vid = :vid");

    foreach ($vids as $vid) {
        $up->execute(array(':site' => $site, ':vid' => $vid));
        $first->execute(array(':site' => $site, ':vid' => $vid));
    }
}

function mpa_log_run(int $lines, int $pv, int $ev, int $bots, int $bad, int $ms, string $msg): void {
    try {
        mp_db()->prepare(
            "INSERT INTO a_runs (ran_at, lines, pageviews, events, bots, bad, ms, message)
             VALUES (?,?,?,?,?,?,?,?)"
        )->execute(array(gmdate('c'), $lines, $pv, $ev, $bots, $bad, $ms, substr($msg, 0, 300)));
    } catch (Throwable $e) { /* bookkeeping must never break an import */ }
}

/* ---------------------------------------------------------------------------
   Rollups

   Recomputed from the raw tables for one day at a time, so they are always
   correct after a backfill or a re-import rather than drifting.
   ------------------------------------------------------------------------ */
function mpa_put(string $day, string $metric, float $value, string $dim = '', string $dim2 = ''): void {
    static $st = null;
    if ($st === null) {
        $st = mp_db()->prepare(
            "INSERT INTO a_daily (site, day, metric, dim, dim2, value) VALUES (:s,:d,:m,:x,:y,:v)
             ON CONFLICT(site, day, metric, dim, dim2) DO UPDATE SET value = excluded.value");
    }
    $st->execute(array(':s' => mpa_site(), ':d' => $day, ':m' => $metric,
                       ':x' => $dim, ':y' => $dim2, ':v' => $value));
}

function mpa_rollup(string $day): void {
    $db   = mp_db();
    $site = mpa_site();

    $db->prepare("DELETE FROM a_daily WHERE site = ? AND day = ?")->execute(array($site, $day));

    $one = function (string $sql) use ($db, $site, $day) {
        $st = $db->prepare($sql);
        $st->execute(array(':s' => $site, ':d' => $day));
        return $st;
    };

    /* Headline numbers for the day. */
    $r = $one("SELECT COUNT(*) sessions,
                      COUNT(DISTINCT vid) visitors,
                      COALESCE(SUM(is_new),0) new_visitors,
                      COALESCE(SUM(pageviews),0) pageviews,
                      COALESCE(SUM(events),0) events,
                      COALESCE(SUM(engaged),0) engaged,
                      COALESCE(SUM(bounced),0) bounces,
                      COALESCE(SUM(converted),0) conversions
               FROM a_sessions WHERE site = :s AND day = :d")->fetch();
    if (!$r) return;
    foreach ($r as $metric => $value) mpa_put($day, (string)$metric, (float)$value);

    /* Breakdowns. Every one of these is a chart on the analysis page. */
    $by = array(
        'by_country'  => 'country',  'by_city'    => 'city',    'by_lang'    => 'lang',
        'by_device'   => 'device',   'by_browser' => 'browser', 'by_os'      => 'os',
        'by_ref_type' => 'ref_type', 'by_source'  => 'source',  'by_campaign'=> 'campaign',
        'by_entry'    => 'entry_path',
    );
    foreach ($by as $metric => $col) {
        $st = $one("SELECT $col k, COUNT(*) n, COALESCE(SUM(converted),0) c
                    FROM a_sessions WHERE site = :s AND day = :d AND $col <> ''
                    GROUP BY $col ORDER BY n DESC LIMIT 60");
        foreach ($st as $row) {
            mpa_put($day, $metric, (float)$row['n'], (string)$row['k']);
            if ((float)$row['c'] > 0) mpa_put($day, $metric . '_conv', (float)$row['c'], (string)$row['k']);
        }
    }

    /* Pages: views, readers, time, depth, exits. */
    $st = $one("SELECT path k, COUNT(*) n, COALESCE(SUM(engaged),0) e,
                       COALESCE(SUM(is_exit),0) x, COALESCE(AVG(max_scroll),0) sc
                FROM a_pageviews WHERE site = :s AND day = :d
                GROUP BY path ORDER BY n DESC LIMIT 120");
    foreach ($st as $row) {
        $k = (string)$row['k'];
        mpa_put($day, 'by_page', (float)$row['n'], $k);
        mpa_put($day, 'page_engaged', (float)$row['e'], $k);
        mpa_put($day, 'page_exits', (float)$row['x'], $k);
        mpa_put($day, 'page_scroll', round((float)$row['sc'], 1), $k);
    }

    /* Events by name, and the labels underneath them. */
    $st = $one("SELECT name k, COUNT(*) n FROM a_events
                WHERE site = :s AND day = :d GROUP BY name ORDER BY n DESC LIMIT 80");
    foreach ($st as $row) mpa_put($day, 'by_event', (float)$row['n'], (string)$row['k']);

    $st = $one("SELECT name k, label l, COUNT(*) n FROM a_events
                WHERE site = :s AND day = :d AND label <> ''
                GROUP BY name, label ORDER BY n DESC LIMIT 150");
    foreach ($st as $row) mpa_put($day, 'by_event_label', (float)$row['n'], (string)$row['k'], (string)$row['l']);

    /* When people need us. */
    $st = $one("SELECT hour k, COUNT(*) n FROM a_sessions
                WHERE site = :s AND day = :d GROUP BY hour");
    foreach ($st as $row) mpa_put($day, 'by_hour', (float)$row['n'], (string)$row['k']);

    /* Cross dimensions, so the CEO page can filter without touching raw rows. */
    $st = $one("SELECT country a, device b, COUNT(*) n FROM a_sessions
                WHERE site = :s AND day = :d AND country <> ''
                GROUP BY country, device ORDER BY n DESC LIMIT 80");
    foreach ($st as $row) mpa_put($day, 'x_country_device', (float)$row['n'], (string)$row['a'], (string)$row['b']);

    $st = $one("SELECT ref_type a, lang b, COUNT(*) n FROM a_sessions
                WHERE site = :s AND day = :d GROUP BY ref_type, lang ORDER BY n DESC LIMIT 80");
    foreach ($st as $row) mpa_put($day, 'x_ref_lang', (float)$row['n'], (string)$row['a'], (string)$row['b']);

    mpa_mirror_metrics($day);
}

/* ---------------------------------------------------------------------------
   Mirror the headline numbers into the existing metrics table under the source
   `own`.

   Deliberate duplication, about twenty rows a day. It means the CEO page, the
   KPI page and the exported report read our own traffic with no changes at
   all, and it gives a like-for-like column next to Google Analytics rather
   than a second system nobody reconciles.
   ------------------------------------------------------------------------ */
function mpa_mirror_metrics(string $day): void {
    $db   = mp_db();
    $site = mpa_site();

    $st = $db->prepare(
        "SELECT COUNT(*) sessions, COUNT(DISTINCT vid) users,
                COALESCE(SUM(pageviews),0) pageviews,
                COALESCE(SUM(engaged),0) engaged,
                COALESCE(SUM(bounced),0) bounces,
                COALESCE(SUM(converted),0) conversions
         FROM a_sessions WHERE site = :s AND day = :d");
    $st->execute(array(':s' => $site, ':d' => $day));
    $r = $st->fetch();
    if (!$r || (int)$r['sessions'] === 0) return;

    $sessions = (int)$r['sessions'];
    mp_metric_put($day, 'own', 'sessions',        (float)$sessions);
    mp_metric_put($day, 'own', 'users',           (float)$r['users']);
    mp_metric_put($day, 'own', 'pageviews',       (float)$r['pageviews']);
    mp_metric_put($day, 'own', 'conversions',     (float)$r['conversions']);
    mp_metric_put($day, 'own', 'avg_engaged',     round((float)$r['engaged'] / $sessions, 1));
    mp_metric_put($day, 'own', 'bounce_rate',     round((float)$r['bounces'] / $sessions * 100, 2));
    mp_metric_put($day, 'own', 'conversion_rate', round((float)$r['conversions'] / $sessions * 100, 2));

    foreach (array('by_country' => 'sessions_country', 'by_lang' => 'sessions_lang',
                   'by_device' => 'sessions_device', 'by_ref_type' => 'sessions_channel') as $from => $to) {
        $q = $db->prepare("SELECT dim, value FROM a_daily
                           WHERE site = :s AND day = :d AND metric = :m ORDER BY value DESC LIMIT 25");
        $q->execute(array(':s' => $site, ':d' => $day, ':m' => $from));
        foreach ($q as $row) mp_metric_put($day, 'own', $to, (float)$row['value'], (string)$row['dim']);
    }
}

/* Rebuild rollups across a range, for a backfill or after a definition change. */
function mpa_rollup_range(string $from, string $to): int {
    $n = 0;
    for ($d = $from; $d <= $to; $d = gmdate('Y-m-d', strtotime($d . ' +1 day'))) {
        mpa_rollup($d);
        if (++$n > 400) break;
    }
    return $n;
}

/* ---------------------------------------------------------------------------
   Retention

   Raw rows are kept for two years, rollups forever. Rollups are small and are
   what any long comparison is drawn from, so nothing of value is lost.
   ------------------------------------------------------------------------ */
function mpa_prune(int $days = 730): array {
    $cut  = gmdate('Y-m-d', time() - $days * 86400);
    $site = mpa_site();
    $db   = mp_db();
    $out  = array();
    foreach (array('a_events', 'a_pageviews', 'a_sessions') as $t) {
        $st = $db->prepare("DELETE FROM $t WHERE site = ? AND day < ?");
        $st->execute(array($site, $cut));
        $out[$t] = $st->rowCount();
    }
    return $out;
}

/* ===========================================================================
   Queries for the analysis page.

   Headline numbers and the big charts read the rollup table, which is small.
   Anything filtered or crossed reads the raw tables, which have real columns
   and can simply be queried. That is the whole advantage of holding our own
   rows rather than an aggregated API: no paired-metric tricks are needed.
   =========================================================================== */

function mpa_val(string $metric, string $from, string $to, string $dim = ''): float {
    $sql = "SELECT COALESCE(SUM(value),0) FROM a_daily
            WHERE site = :s AND metric = :m AND day BETWEEN :a AND :b";
    $args = array(':s' => mpa_site(), ':m' => $metric, ':a' => $from, ':b' => $to);
    if ($dim !== '') { $sql .= " AND dim = :x"; $args[':x'] = $dim; }
    $st = mp_db()->prepare($sql);
    $st->execute($args);
    return (float)$st->fetchColumn();
}

/* Daily series in the shape ui_line() and ui_spark() already expect. */
function mpa_series(string $metric, string $from, string $to, string $dim = ''): array {
    $sql = "SELECT day, SUM(value) v FROM a_daily
            WHERE site = :s AND metric = :m AND day BETWEEN :a AND :b";
    $args = array(':s' => mpa_site(), ':m' => $metric, ':a' => $from, ':b' => $to);
    if ($dim !== '') { $sql .= " AND dim = :x"; $args[':x'] = $dim; }
    $sql .= " GROUP BY day ORDER BY day";
    $st = mp_db()->prepare($sql);
    $st->execute($args);
    return $st->fetchAll();
}

/* Top values of one breakdown, in the shape ui_hbars() and ui_top_table() want. */
function mpa_top(string $metric, string $from, string $to, int $limit = 8): array {
    $st = mp_db()->prepare(
        "SELECT dim, SUM(value) v FROM a_daily
         WHERE site = :s AND metric = :m AND day BETWEEN :a AND :b AND dim <> ''
         GROUP BY dim ORDER BY v DESC LIMIT :l");
    $st->bindValue(':s', mpa_site());
    $st->bindValue(':m', $metric);
    $st->bindValue(':a', $from);
    $st->bindValue(':b', $to);
    $st->bindValue(':l', $limit, PDO::PARAM_INT);
    $st->execute();
    return $st->fetchAll();
}

/* Is there anything at all yet? Every panel checks this before explaining
   itself, so an empty dashboard says "collecting" rather than looking broken. */
function mpa_has_data(string $from, string $to): bool {
    $st = mp_db()->prepare("SELECT 1 FROM a_sessions WHERE site = :s AND day BETWEEN :a AND :b LIMIT 1");
    $st->execute(array(':s' => mpa_site(), ':a' => $from, ':b' => $to));
    return (bool)$st->fetchColumn();
}

/* The headline set for one period, computed once and reused across the page. */
function mpa_kpis(string $from, string $to): array {
    $st = mp_db()->prepare(
        "SELECT COUNT(*) sessions,
                COUNT(DISTINCT vid) visitors,
                COALESCE(SUM(is_new),0) new_visitors,
                COALESCE(SUM(pageviews),0) pageviews,
                COALESCE(SUM(events),0) events,
                COALESCE(SUM(engaged),0) engaged,
                COALESCE(SUM(bounced),0) bounces,
                COALESCE(SUM(converted),0) conversions
         FROM a_sessions WHERE site = :s AND day BETWEEN :a AND :b");
    $st->execute(array(':s' => mpa_site(), ':a' => $from, ':b' => $to));
    $r = $st->fetch();
    if (!$r) $r = array();

    $k = array();
    foreach (array('sessions','visitors','new_visitors','pageviews','events','engaged','bounces','conversions') as $f) {
        $k[$f] = (float)($r[$f] ?? 0);
    }
    $s = $k['sessions'] > 0 ? $k['sessions'] : 1;
    $k['pages_per_session'] = round($k['pageviews'] / $s, 2);
    $k['avg_engaged']       = round($k['engaged'] / $s, 1);
    $k['bounce_rate']       = round($k['bounces'] / $s * 100, 1);
    $k['conversion_rate']   = round($k['conversions'] / $s * 100, 2);
    $k['returning']         = max(0, $k['sessions'] - $k['new_visitors']);
    return $k;
}

/* Pages, with the only column that matters next to the vanity ones: how many
   enquiries happened on each. A page with a lot of views and no enquiries is
   a different problem from one with few views and several. */
function mpa_pages(string $from, string $to, int $limit = 15): array {
    $conv  = mpa_conversion_events();
    $marks = implode(',', array_fill(0, count($conv), '?'));
    $st = mp_db()->prepare(
        "SELECT p.path,
                COUNT(*) views,
                COALESCE(AVG(p.engaged),0) avg_time,
                COALESCE(AVG(p.max_scroll),0) avg_scroll,
                COALESCE(SUM(p.is_exit),0) exits,
                (SELECT COUNT(*) FROM a_events e
                  WHERE e.site = p.site AND e.path = p.path
                    AND e.day BETWEEN ? AND ? AND e.name IN ($marks)) enquiries
         FROM a_pageviews p
         WHERE p.site = ? AND p.day BETWEEN ? AND ?
         GROUP BY p.path ORDER BY views DESC LIMIT $limit");
    $args = array_merge(array($from, $to), $conv, array(mpa_site(), $from, $to));
    $st->execute($args);
    return $st->fetchAll();
}

/* The four steps between arriving and getting in touch. Each is a real count
   of sessions, so the drop between any two is a real number of people. */
function mpa_funnel(string $from, string $to): array {
    $site = mpa_site();
    $one = function (string $where) use ($site, $from, $to) {
        $st = mp_db()->prepare("SELECT COUNT(*) FROM a_sessions
                                WHERE site = :s AND day BETWEEN :a AND :b" . $where);
        $st->execute(array(':s' => $site, ':a' => $from, ':b' => $to));
        return (int)$st->fetchColumn();
    };
    return array(
        array('step' => 'Arrived',            'n' => $one('')),
        array('step' => 'Read something',     'n' => $one(' AND (engaged >= 15 OR pageviews > 1)')),
        array('step' => 'Reached the bottom', 'n' => $one(' AND max_scroll >= 75')),
        array('step' => 'Got in touch',       'n' => $one(' AND converted = 1')),
    );
}

/* The most common second page. Where people go after landing says more about
   what they came for than any survey would. */
function mpa_journeys(string $from, string $to, int $limit = 10): array {
    $st = mp_db()->prepare(
        "SELECT a.path AS came_from, b.path AS went_to, COUNT(*) n
         FROM a_pageviews a
         JOIN a_pageviews b ON b.site = a.site AND b.sid = a.sid AND b.seq = a.seq + 1
         WHERE a.site = :s AND a.day BETWEEN :f AND :t
         GROUP BY a.path, b.path ORDER BY n DESC LIMIT $limit");
    $st->execute(array(':s' => mpa_site(), ':f' => $from, ':t' => $to));
    return $st->fetchAll();
}

/* Any breakdown of sessions with the conversion rate beside it. This is the
   query the whole page is really built around: not who visits, but which
   visitors turn into enquiries. */
function mpa_segment(string $column, string $from, string $to, int $limit = 10): array {
    $allowed = array('country','city','lang','device','browser','os','ref_type',
                     'source','campaign','entry_path','hour','region');
    if (!in_array($column, $allowed, true)) return array();
    $st = mp_db()->prepare(
        "SELECT $column AS dim, COUNT(*) n,
                COALESCE(SUM(converted),0) conv,
                COALESCE(AVG(engaged),0) avg_time,
                COALESCE(AVG(pageviews),0) avg_pages
         FROM a_sessions
         WHERE site = :s AND day BETWEEN :a AND :b AND $column <> ''
         GROUP BY $column ORDER BY n DESC LIMIT $limit");
    $st->execute(array(':s' => mpa_site(), ':a' => $from, ':b' => $to));
    $rows = $st->fetchAll();
    foreach ($rows as &$r) {
        $r['rate'] = (int)$r['n'] > 0 ? round((float)$r['conv'] / (float)$r['n'] * 100, 1) : 0.0;
    }
    return $rows;
}

/* Which parts of a page are actually read, from the section timings. */
function mpa_sections(string $from, string $to, string $path = '', int $limit = 12): array {
    $sql = "SELECT label AS dim, COUNT(*) seen, COALESCE(AVG(value),0) avg_seconds
            FROM a_events
            WHERE site = :s AND day BETWEEN :a AND :b AND name = 'section_view'";
    $args = array(':s' => mpa_site(), ':a' => $from, ':b' => $to);
    if ($path !== '') { $sql .= " AND path = :p"; $args[':p'] = $path; }
    $sql .= " GROUP BY label ORDER BY seen DESC LIMIT $limit";
    $st = mp_db()->prepare($sql);
    $st->execute($args);
    return $st->fetchAll();
}

/* Events grouped for reading, rather than as one long list. */
function mpa_events_by_category(string $from, string $to): array {
    $st = mp_db()->prepare(
        "SELECT category, name, COUNT(*) n FROM a_events
         WHERE site = :s AND day BETWEEN :a AND :b AND name <> 'section_view'
         GROUP BY category, name ORDER BY category, n DESC");
    $st->execute(array(':s' => mpa_site(), ':a' => $from, ':b' => $to));
    $out = array();
    foreach ($st as $r) { $out[(string)$r['category'] ?: 'other'][] = $r; }
    return $out;
}

/* ===========================================================================
   Findings

   Rules for now, as agreed, and shaped exactly like lib/recommend.php so that
   swapping in a model later is a change of source and not a rewrite. Every
   finding carries the number it came from, because a conclusion without its
   evidence is only an opinion.

   Nothing here fires on a handful of visits. A rule that shouts at fifteen
   sessions trains people to ignore the page.
   =========================================================================== */
function mpa_findings(string $from, string $to): array {
    $out = array();
    $k = mpa_kpis($from, $to);
    if ($k['sessions'] < 40) return $out;

    $n = function ($v) { return number_format((float)$v); };

    /* Where the money is being left. A segment that converts far below the
       site average, with enough visits to be real. */
    foreach (array('ref_type' => 'channel', 'country' => 'country',
                   'device' => 'device', 'lang' => 'language') as $col => $word) {
        foreach (mpa_segment($col, $from, $to, 6) as $seg) {
            if ((float)$seg['n'] < max(30, $k['sessions'] * 0.10)) continue;
            if ($k['conversion_rate'] <= 0) continue;
            if ((float)$seg['rate'] >= $k['conversion_rate'] * 0.5) continue;
            $lost = ((float)$seg['n'] * $k['conversion_rate'] / 100) - (float)$seg['conv'];
            if ($lost < 3) continue;
            $out[] = array(
                'severity' => 'high', 'area' => 'Conversion',
                'finding' => ucfirst($word) . ' "' . $seg['dim'] . '" converts at half the site average',
                'evidence' => $n($seg['n']) . ' visits produced ' . $n($seg['conv']) . ' enquiries, a rate of '
                            . $seg['rate'] . '% against ' . $k['conversion_rate'] . '% overall.',
                'do' => 'Open the site the way this group does and look for what is missing: '
                      . 'a language, a phone format, a payment or insurance question.',
                'expect' => 'Bringing this group to the site average would be about '
                          . $n(round($lost)) . ' more enquiries over the same period.',
            );
            break 2;
        }
    }

    /* Popular pages that produce nothing. The clearest single signal that a
       page is read but does not ask for anything. */
    foreach (mpa_pages($from, $to, 12) as $p) {
        if ((float)$p['views'] < max(40, $k['pageviews'] * 0.05)) continue;
        if ((float)$p['enquiries'] > 0) continue;
        if ((float)$p['avg_time'] < 20) continue;
        $out[] = array(
            'severity' => 'high', 'area' => 'Website',
            'finding' => $p['path'] . ' is read but never produces an enquiry',
            'evidence' => $n($p['views']) . ' views, ' . round((float)$p['avg_time']) . ' seconds read on average, '
                        . 'no calls, messages or forms started on it.',
            'do' => 'Put the phone number and WhatsApp button inside this page, at the point '
                  . 'where people stop reading.',
            'expect' => 'At the site rate of ' . $k['conversion_rate'] . '%, this page should be '
                      . 'producing roughly ' . $n(round((float)$p['views'] * $k['conversion_rate'] / 100))
                      . ' enquiries.',
        );
        break;
    }

    /* Nobody reaches the bottom. Usually means the page is too long or the
       thing people came for is below where they stop. */
    $f = mpa_funnel($from, $to);
    if ($f[0]['n'] > 0) {
        $reached = $f[2]['n'] / $f[0]['n'] * 100;
        if ($reached < 25) {
            $out[] = array(
                'severity' => 'medium', 'area' => 'Website',
                'finding' => 'Only ' . round($reached) . '% of visits reach the bottom of a page',
                'evidence' => $n($f[2]['n']) . ' of ' . $n($f[0]['n']) . ' visits scrolled past three quarters.',
                'do' => 'Move the contact details above the fold rather than into the footer.',
                'expect' => 'Contact options that are seen get used. This is the cheapest change on the list.',
            );
        }
    }

    /* Frustration. Rage and dead clicks are people trying to use something
       that is not working, and nobody would ever report it. */
    $st = mp_db()->prepare(
        "SELECT path, name, COUNT(*) n FROM a_events
         WHERE site = :s AND day BETWEEN :a AND :b AND name IN ('rage_click','dead_click')
         GROUP BY path, name ORDER BY n DESC LIMIT 1");
    $st->execute(array(':s' => mpa_site(), ':a' => $from, ':b' => $to));
    $rage = $st->fetch();
    if ($rage && (int)$rage['n'] >= 15) {
        $out[] = array(
            'severity' => 'medium', 'area' => 'Website',
            'finding' => 'People are clicking something on ' . $rage['path'] . ' that does not respond',
            'evidence' => $n($rage['n']) . ' ' . str_replace('_', ' ', (string)$rage['name']) . 's recorded.',
            'do' => 'Open that page and click what looks clickable. Either make it work or stop it looking active.',
            'expect' => 'Removes a visible dead end on a page people already reach.',
        );
    }

    /* Forms started and abandoned, with the field named. */
    $st = mp_db()->prepare(
        "SELECT label, COUNT(*) n FROM a_events
         WHERE site = :s AND day BETWEEN :a AND :b AND name = 'form_abandon'
         GROUP BY label ORDER BY n DESC LIMIT 1");
    $st->execute(array(':s' => mpa_site(), ':a' => $from, ':b' => $to));
    $ab = $st->fetch();
    $starts = mpa_val('by_event', $from, $to, 'form_start');
    if ($ab && (int)$ab['n'] >= 10 && $starts > 0) {
        $rate = round((float)$ab['n'] / $starts * 100);
        $out[] = array(
            'severity' => 'medium', 'area' => 'Website',
            'finding' => $rate . '% of people who start the enquiry form never send it',
            'evidence' => $n($ab['n']) . ' abandonments, most often at ' . $ab['label'] . '.',
            'do' => 'Remove or make optional the field they stop at.',
            'expect' => 'Every field removed from a form typically recovers part of the drop-off.',
        );
    }

    /* Script errors. A broken page nobody has told us about. */
    $errs = mpa_val('by_event', $from, $to, 'js_error');
    if ($errs >= 25) {
        $out[] = array(
            'severity' => 'medium', 'area' => 'Technical',
            'finding' => $n($errs) . ' script errors happened on real visits',
            'evidence' => 'Recorded in visitors\' own browsers, not in a test.',
            'do' => 'Open the events table, filter to js_error, and fix the page named most often.',
            'expect' => 'A script error on a contact page can stop a form submitting entirely.',
        );
    }

    /* Being cited by an assistant is the year's objective, so it is reported
       whether it is happening or not. */
    $ai = mpa_val('by_ref_type', $from, $to, 'ai');
    if ($ai > 0) {
        $out[] = array(
            'severity' => 'good', 'area' => 'AI visibility',
            'finding' => $n($ai) . ' visits arrived from an AI assistant',
            'evidence' => 'Referrals from ChatGPT, Perplexity, Gemini, Claude and Copilot, counted separately.',
            'do' => 'No action. Keep llms.txt and the question pages current.',
            'expect' => 'This is the channel that did not exist last year. It is now measured.',
        );
    }

    /* Speed, from real visits rather than a laboratory score. */
    $st = mp_db()->prepare(
        "SELECT COALESCE(AVG(load_ms),0) a, COUNT(*) n FROM a_pageviews
         WHERE site = :s AND day BETWEEN :f AND :t AND load_ms > 0 AND device = 'mobile'");
    $st->execute(array(':s' => mpa_site(), ':f' => $from, ':t' => $to));
    $sp = $st->fetch();
    if ($sp && (int)$sp['n'] >= 50 && (float)$sp['a'] > 4000) {
        $out[] = array(
            'severity' => 'medium', 'area' => 'Technical',
            'finding' => 'Pages take ' . round((float)$sp['a'] / 1000, 1) . ' seconds to load on a phone',
            'evidence' => 'Measured on ' . $n($sp['n']) . ' real visits, not a test score.',
            'do' => 'Compress the hero images and drop the icon font that loads on every page.',
            'expect' => 'Visitors leave before a slow page finishes. This is measured in lost visits, not points.',
        );
    }

    usort($out, function ($a, $b) {
        $w = array('high' => 0, 'medium' => 1, 'low' => 2, 'good' => 3);
        return ($w[$a['severity']] ?? 9) <=> ($w[$b['severity']] ?? 9);
    });
    return $out;
}

/* ===========================================================================
   Live

   Read straight from the raw tables by timestamp rather than by day, so these
   answer "right now" instead of "as of the last complete day". Combined with
   the import that runs when the dashboard is opened, the numbers are seconds
   behind rather than minutes.
   =========================================================================== */

/* Distinct visitors seen in the last N minutes. The closest thing to "people
   on the site now" that any analytics can honestly claim, because a browser
   never announces that somebody has left. */
function mpa_active(int $minutes = 5): int {
    $st = mp_db()->prepare(
        "SELECT COUNT(DISTINCT vid) FROM a_pageviews WHERE site = :s AND ts >= :t");
    $st->execute(array(':s' => mpa_site(), ':t' => time() - $minutes * 60));
    return (int)$st->fetchColumn();
}

/* What those people are reading, right now. */
function mpa_active_pages(int $minutes = 30, int $limit = 8): array {
    $st = mp_db()->prepare(
        "SELECT path AS dim, COUNT(*) v FROM a_pageviews
         WHERE site = :s AND ts >= :t GROUP BY path ORDER BY v DESC LIMIT $limit");
    $st->execute(array(':s' => mpa_site(), ':t' => time() - $minutes * 60));
    return $st->fetchAll();
}

/* Today so far, straight from the raw tables. Deliberately not read from the
   rollups: a rollup is only as fresh as the last import of that day, and the
   whole point of this panel is that it is not waiting for anything. */
function mpa_today(): array {
    $day  = gmdate('Y-m-d');
    $site = mpa_site();
    $db   = mp_db();

    $st = $db->prepare(
        "SELECT COUNT(*) sessions, COUNT(DISTINCT vid) visitors,
                COALESCE(SUM(pageviews),0) pageviews,
                COALESCE(SUM(converted),0) conversions,
                COALESCE(SUM(engaged),0) engaged,
                COALESCE(SUM(is_new),0) new_visitors
         FROM a_sessions WHERE site = :s AND day = :d");
    $st->execute(array(':s' => $site, ':d' => $day));
    $r = $st->fetch() ?: array();

    $out = array();
    foreach (array('sessions','visitors','pageviews','conversions','engaged','new_visitors') as $f) {
        $out[$f] = (int)($r[$f] ?? 0);
    }
    $out['active_5']  = mpa_active(5);
    $out['active_30'] = mpa_active(30);
    $out['avg_engaged'] = $out['sessions'] > 0 ? round($out['engaged'] / $out['sessions'], 1) : 0.0;
    $out['conversion_rate'] = $out['sessions'] > 0
        ? round($out['conversions'] / $out['sessions'] * 100, 2) : 0.0;

    /* Hour by hour, so the shape of the day is visible rather than one total. */
    $st = $db->prepare(
        "SELECT hour, COUNT(*) n FROM a_sessions
         WHERE site = :s AND day = :d GROUP BY hour ORDER BY hour");
    $st->execute(array(':s' => $site, ':d' => $day));
    $out['by_hour'] = $st->fetchAll();

    return $out;
}

/* The last few things that happened, newest first. Useful on its own and the
   fastest way to confirm the tracker is alive after a deploy. */
function mpa_recent_events(int $limit = 14): array {
    $st = mp_db()->prepare(
        "SELECT at, ts, sid, name, label, path, country, device FROM a_events
         WHERE site = :s ORDER BY id DESC LIMIT $limit");
    $st->execute(array(':s' => mpa_site()));
    return $st->fetchAll();
}

/* Anything sitting in the spool that no import has picked up yet. Shown on the
   page so "why is this zero" always has an answer on screen. */
function mpa_spool_waiting(): int {
    $f = MP_DATA_DIR . '/' . A_SPOOL;
    return (is_file($f) && filesize($f) > 0) ? (int)filesize($f) : 0;
}

/* ===========================================================================
   One contact channel, in depth.

   Written for the WhatsApp page and deliberately generic over the event name,
   because a calls page is this same page with one word changed. Every function
   reads the raw event rows, which already carry the page, the placement, the
   country, the device and the language, so this needed no new tracking.

   WHAT CAN HONESTLY BE MEASURED
   The tap. Whether WhatsApp then opened, whether a message was typed, and
   whether anybody answered, all happen off the website where no analytics can
   follow. The page says that in plain words rather than implying a tap is a
   conversation.
   =========================================================================== */

/* Columns of a_events that may be grouped on. A whitelist rather than trust,
   because the column name is interpolated into the statement. */
function mpa_ev_cols(): array {
    return array('placement', 'device', 'country', 'lang', 'path', 'label', 'category');
}

/* The tracker records where on the page a control sits as one of seven words.
   They are readable enough in code and not readable enough on a screen, so the
   translation lives here, in one place, and both the page and the findings use
   it. The first draft had the table saying "Floating button" and the finding
   underneath it saying "sticky" about the same number. */
function mpa_placement_label(string $p): string {
    $m = array('sticky' => 'floating button', 'header' => 'header', 'footer' => 'footer',
               'hero'   => 'hero', 'body' => 'in-page', 'form' => 'form', 'modal' => 'popup');
    return isset($m[$p]) ? $m[$p] : $p;
}

/* The browser sends a language as a code with an optional region: en, en-gb and
   en-us are all English readers and must not be three rows. Everything about
   language on this page groups on the first two letters. */
function mpa_lang_label(string $l): string {
    $m = array('en' => 'English', 'de' => 'German', 'pl' => 'Polish', 'ar' => 'Arabic',
               'ru' => 'Russian', 'cs' => 'Czech', 'it' => 'Italian', 'fr' => 'French',
               'es' => 'Spanish', 'nl' => 'Dutch', 'uk' => 'Ukrainian');
    $two = strtolower(substr($l, 0, 2));
    return isset($m[$two]) ? $m[$two] : strtoupper($l);
}

/* Visits by language, grouped the same way the taps are, so the two can be
   divided by each other honestly. */
function mpa_visits_by_lang(string $from, string $to, int $limit = 8): array {
    $st = mp_db()->prepare(
        "SELECT substr(lang, 1, 2) AS dim, COUNT(*) n, COALESCE(SUM(converted),0) conv
         FROM a_sessions
         WHERE site = :s AND day BETWEEN :a AND :b AND lang <> ''
         GROUP BY substr(lang, 1, 2) ORDER BY n DESC LIMIT $limit");
    $st->execute(array(':s' => mpa_site(), ':a' => $from, ':b' => $to));
    return $st->fetchAll();
}

/* Columns of a_sessions that may be grouped on, for the visit a tap sits in. */
function mpa_ev_session_cols(): array {
    return array('ref_type', 'source', 'medium', 'campaign', 'entry_path',
                 'country', 'city', 'region', 'device', 'lang', 'browser', 'os');
}

/* How many times it happened. */
function mpa_ev_count(string $name, string $from, string $to): int {
    $st = mp_db()->prepare(
        "SELECT COUNT(*) FROM a_events
         WHERE site = :s AND name = :n AND day BETWEEN :a AND :b");
    $st->execute(array(':s' => mpa_site(), ':n' => $name, ':a' => $from, ':b' => $to));
    return (int)$st->fetchColumn();
}

/* How many visits it happened in. Lower than the count, because one visitor
   often taps twice. This is the number to divide by visits, not the count. */
function mpa_ev_visits(string $name, string $from, string $to): int {
    $st = mp_db()->prepare(
        "SELECT COUNT(DISTINCT sid) FROM a_events
         WHERE site = :s AND name = :n AND day BETWEEN :a AND :b");
    $st->execute(array(':s' => mpa_site(), ':n' => $name, ':a' => $from, ':b' => $to));
    return (int)$st->fetchColumn();
}

/* Daily counts, in the shape ui_line() and ui_spark() want. Read from the raw
   rows rather than the rollup so every number on the page comes from one
   place and the page can never disagree with itself. */
function mpa_ev_daily(string $name, string $from, string $to): array {
    $st = mp_db()->prepare(
        "SELECT day, COUNT(*) v FROM a_events
         WHERE site = :s AND name = :n AND day BETWEEN :a AND :b
         GROUP BY day ORDER BY day");
    $st->execute(array(':s' => mpa_site(), ':n' => $name, ':a' => $from, ':b' => $to));
    return $st->fetchAll();
}

/* Break the taps down by one of the event's own columns. */
function mpa_ev_by(string $name, string $column, string $from, string $to, int $limit = 8): array {
    if (!in_array($column, mpa_ev_cols(), true)) return array();
    /* Language is the one column that is not grouped as it is stored. See
       mpa_lang_label(): en, en-gb and en-us are one audience. */
    $group = ($column === 'lang') ? 'substr(lang, 1, 2)' : $column;
    $st = mp_db()->prepare(
        "SELECT $group AS dim, COUNT(*) v FROM a_events
         WHERE site = :s AND name = :n AND day BETWEEN :a AND :b AND $column <> ''
         GROUP BY $group ORDER BY v DESC LIMIT $limit");
    $st->execute(array(':s' => mpa_site(), ':n' => $name, ':a' => $from, ':b' => $to));
    return $st->fetchAll();
}

/* Break the same taps down by something the visit knows and the event does
   not: which channel brought them, which campaign, which page they landed on
   first. Counted in visits rather than taps, since a channel brings a person
   once however many times they tap. */
function mpa_ev_by_session(string $name, string $column, string $from, string $to, int $limit = 8): array {
    if (!in_array($column, mpa_ev_session_cols(), true)) return array();
    $st = mp_db()->prepare(
        "SELECT s.$column AS dim, COUNT(DISTINCT s.sid) v
         FROM a_sessions s
         JOIN a_events e ON e.site = s.site AND e.sid = s.sid
         WHERE s.site = :s AND e.name = :n AND e.day BETWEEN :a AND :b AND s.$column <> ''
         GROUP BY s.$column ORDER BY v DESC LIMIT $limit");
    $st->execute(array(':s' => mpa_site(), ':n' => $name, ':a' => $from, ':b' => $to));
    return $st->fetchAll();
}

/* Pages, with views beside taps, so a page can be read two ways: how many taps
   it produced, and how hard it had to work for them. A page with 900 views and
   two taps is a different problem from one with 20 views and two.
   $order 'taps' answers "where do they come from", 'views' answers "which busy
   page produces nothing". */
function mpa_ev_pages(string $name, string $from, string $to,
                      int $limit = 12, string $order = 'taps'): array {
    $sort = ($order === 'views') ? 'views DESC, taps DESC' : 'taps DESC, views DESC';
    $st = mp_db()->prepare(
        "SELECT p.path,
                COUNT(*) views,
                (SELECT COUNT(*) FROM a_events e
                  WHERE e.site = p.site AND e.path = p.path
                    AND e.day BETWEEN ? AND ? AND e.name = ?) taps
         FROM a_pageviews p
         WHERE p.site = ? AND p.day BETWEEN ? AND ?
         GROUP BY p.path ORDER BY $sort LIMIT $limit");
    $st->execute(array($from, $to, $name, mpa_site(), $from, $to));
    return $st->fetchAll();
}

/* When they reach for it, by day of the week and hour of the day. A hospital
   that answers this line has to know which hours it is actually being asked
   for, and that is a staffing question rather than a marketing one. Computed
   from the timestamp so it does not depend on any column the importer sets. */
function mpa_ev_when(string $name, string $from, string $to): array {
    $st = mp_db()->prepare(
        "SELECT CAST(strftime('%w', ts, 'unixepoch') AS INTEGER) dow,
                CAST(strftime('%H', ts, 'unixepoch') AS INTEGER) hour,
                COUNT(*) n
         FROM a_events
         WHERE site = :s AND name = :n AND day BETWEEN :a AND :b
         GROUP BY dow, hour");
    $st->execute(array(':s' => mpa_site(), ':n' => $name, ':a' => $from, ':b' => $to));
    return $st->fetchAll();
}

/* How much of a visit happens before the tap. Answers whether people arrive
   ready to message or have to be convinced first, which decides whether the
   button belongs at the top of a page or at the end of one. */
function mpa_ev_timing(string $name, string $from, string $to): array {
    $st = mp_db()->prepare(
        "SELECT COUNT(*) n,
                COALESCE(AVG(MAX(0, e.ts - s.started_ts)), 0) secs,
                COALESCE(AVG(s.pageviews), 0) pages,
                COALESCE(AVG(s.is_new), 0) newshare
         FROM a_events e
         JOIN a_sessions s ON s.site = e.site AND s.sid = e.sid
         WHERE e.site = :s AND e.name = :n AND e.day BETWEEN :a AND :b");
    $st->execute(array(':s' => mpa_site(), ':n' => $name, ':a' => $from, ':b' => $to));
    $r = $st->fetch() ?: array();
    return array(
        'n'        => (int)($r['n'] ?? 0),
        'seconds'  => max(0.0, round((float)($r['secs'] ?? 0), 1)),
        'pages'    => round((float)($r['pages'] ?? 0), 2),
        'new_pct'  => round((float)($r['newshare'] ?? 0) * 100, 1),
    );
}

/* The last few, newest first. The quickest way to see the channel is alive. */
function mpa_ev_recent(string $name, int $limit = 12): array {
    $st = mp_db()->prepare(
        "SELECT ts, sid, path, placement, country, device, lang FROM a_events
         WHERE site = :s AND name = :n ORDER BY id DESC LIMIT $limit");
    $st->execute(array(':s' => mpa_site(), ':n' => $name));
    return $st->fetchAll();
}

/* ---------------------------------------------------------------------------
   Findings for one channel.

   Same shape as mpa_findings(), same restraint: nothing fires on a handful of
   taps. Each one names the number it came from.
   ------------------------------------------------------------------------ */
function mpa_ev_findings(string $name, string $label, string $from, string $to): array {
    $out = array();
    $taps = mpa_ev_count($name, $from, $to);
    if ($taps < 15) return $out;

    $n = function ($v) { return number_format((float)$v); };
    $K = mpa_kpis($from, $to);

    /* Where the taps actually come from. Worth stating plainly, because the
       answer decides which control gets copied onto the pages that lack it. */
    $places = mpa_ev_by($name, 'placement', $from, $to, 8);
    if ($places && (float)$places[0]['v'] / $taps >= 0.5) {
        $share = round((float)$places[0]['v'] / $taps * 100);
        $out[] = array(
            'severity' => 'good', 'area' => $label,
            'finding' => $share . '% of taps come from the '
                       . mpa_placement_label((string)$places[0]['dim']),
            'evidence' => $n($places[0]['v']) . ' of ' . $n($taps) . ' taps in this period.',
            'do' => 'Leave that button alone, and put the same one on the pages that do not carry it.',
            'expect' => 'The control that already works, working on more pages.',
        );
    }

    /* A busy page with nothing on it to tap. The clearest, cheapest fix on
       this page and the one he asked the dashboard to surface. */
    foreach (mpa_ev_pages($name, $from, $to, 12, 'views') as $p) {
        if ((int)$p['taps'] > 0) continue;
        if ((float)$p['views'] < max(40, $K['pageviews'] * 0.05)) continue;
        /* What the page would produce at the rate the rest of the site manages.
           Below three it is noise, and the same three is the bar every rule in
           mpa_findings() holds itself to. */
        $missing = round((float)$p['views'] * $taps / max(1, $K['pageviews']));
        if ($missing < 3) continue;
        $out[] = array(
            'severity' => 'high', 'area' => $label,
            'finding' => $p['path'] . ' had ' . $n($p['views']) . ' views and produced no '
                       . $label . ' taps',
            /* Only what the rule actually counted. The first draft said "every
               other page of that size produced some", which the rule never
               checked and could not have known. */
            'evidence' => 'The rest of the site produces one tap per '
                        . $n(round($K['pageviews'] / max(1, $taps))) . ' views. This page produced none.',
            'do' => 'Put the same floating button this site already uses onto that page.',
            'expect' => 'At the rate the rest of the site taps, about ' . $n($missing)
                      . ' more enquiries over the same period.',
        );
        break;
    }

    /* Phones reach for WhatsApp and desktops do not, so a mobile share of taps
       well below the mobile share of visits means the button is hard to hit. */
    $devVisits = array();
    foreach (mpa_segment('device', $from, $to, 5) as $d) $devVisits[(string)$d['dim']] = (float)$d['n'];
    $devTaps = array();
    foreach (mpa_ev_by($name, 'device', $from, $to, 5) as $d) $devTaps[(string)$d['dim']] = (float)$d['v'];
    $allVisits = array_sum($devVisits);
    if ($allVisits >= 100 && isset($devVisits['mobile']) && $devVisits['mobile'] >= 50) {
        $visShare = $devVisits['mobile'] / $allVisits * 100;
        $tapShare = (isset($devTaps['mobile']) ? $devTaps['mobile'] : 0) / $taps * 100;
        if ($tapShare < $visShare * 0.6) {
            $out[] = array(
                'severity' => 'high', 'area' => $label,
                'finding' => 'Phones are ' . round($visShare) . '% of visits but only '
                           . round($tapShare) . '% of ' . $label . ' taps',
                'evidence' => $n($devVisits['mobile']) . ' visits from phones produced '
                            . $n(isset($devTaps['mobile']) ? $devTaps['mobile'] : 0) . ' taps.',
                'do' => 'Open the site on a phone and try to tap the button. Check it is not '
                      . 'behind the cookie bar, under the address bar, or smaller than a thumb.',
                'expect' => 'Phones are where this channel belongs. Bringing them to their share '
                          . 'of visits is the largest single number on this page.',
            );
        }
    }

    /* A language with the visits but not the taps. Usually a number that does
       not dial from that country, or a button that only exists in English. */
    foreach (mpa_visits_by_lang($from, $to, 6) as $seg) {
        $lg = (string)$seg['dim'];
        if ((float)$seg['n'] < max(40, $K['sessions'] * 0.10)) continue;
        $tapsLang = 0.0;
        foreach (mpa_ev_by($name, 'lang', $from, $to, 12) as $r) {
            if ((string)$r['dim'] === $lg) $tapsLang = (float)$r['v'];
        }
        $expected = $taps * ((float)$seg['n'] / max(1, $K['sessions']));
        if ($expected >= 5 && $tapsLang < $expected * 0.4) {
            $named = mpa_lang_label($lg);
            $out[] = array(
                'severity' => 'medium', 'area' => $label,
                'finding' => 'Visitors reading in ' . $named . ' barely use ' . $label,
                'evidence' => $n($seg['n']) . ' visits produced ' . $n($tapsLang) . ' taps, against '
                            . $n(round($expected)) . ' at the rate of the rest of the site.',
                'do' => 'Open the ' . $named . ' pages and check the button is there, in that '
                      . 'language, and that the number is written in international format.',
                'expect' => 'About ' . $n(round($expected - $tapsLang)) . ' more enquiries over the same period.',
            );
            break;
        }
    }

    /* Half the taps outside office hours is not a problem, it is a rota. */
    $when = mpa_ev_when($name, $from, $to);
    if ($when) {
        $night = 0.0; $all = 0.0;
        foreach ($when as $w) {
            $all += (float)$w['n'];
            if ((int)$w['hour'] < 6 || (int)$w['hour'] >= 18) $night += (float)$w['n'];
        }
        if ($all >= 25 && $night / $all >= 0.4) {
            $out[] = array(
                'severity' => 'medium', 'area' => $label,
                'finding' => round($night / $all * 100) . '% of taps arrive outside 06:00 to 18:00 UTC',
                'evidence' => $n($night) . ' of ' . $n($all) . ' taps, counted from the tap itself.',
                'do' => 'Check who is holding the WhatsApp line in those hours, and what the '
                      . 'reply time is. An unanswered message at midnight is a lost patient.',
                'expect' => 'Nothing here needs building. It is a rota question the numbers can answer.',
            );
        }
    }

    usort($out, function ($a, $b) {
        $w = array('high' => 0, 'medium' => 1, 'low' => 2, 'good' => 3);
        return ($w[$a['severity']] ?? 9) <=> ($w[$b['severity']] ?? 9);
    });
    return $out;
}

/* ===========================================================================
   One visit, in full.

   Added 2026-09-03. Everything below reads rows that are already linked by
   `sid`, so this is a view over data we hold rather than anything new being
   collected.

   WHY THIS IS WORTH HAVING
   Aggregates say a page loses people. A single visit says why: the order the
   pages were opened, how long each was read, where the scroll stopped, which
   control was pressed, and what the person did immediately before leaving or
   getting in touch. It is the difference between "the German pages convert
   badly" and watching a German visitor open three pages and leave from the
   one with no phone number on it.

   WHAT IS NOT HERE, ON PURPOSE
   No address, no name, no device identifier. The visitor id is a salted hash
   that is regenerated daily, so a visit cannot be joined to the same person
   tomorrow, and there is nothing here that could identify a patient.
   =========================================================================== */

/* The filters the visits list accepts. Whitelisted, because each becomes a
   column name in a statement. */
function mpa_visit_filter_cols(): array {
    return array('country', 'device', 'lang', 'ref_type', 'source', 'browser', 'os', 'city');
}

/* A page of visits, newest first, with everything the list needs to be read
   without opening each one. */
function mpa_sessions_list(string $from, string $to, array $opts = array()): array {
    $where = array('site = :s', 'day BETWEEN :a AND :b');
    $args  = array(':s' => mpa_site(), ':a' => $from, ':b' => $to);

    foreach (mpa_visit_filter_cols() as $col) {
        if (!empty($opts[$col])) { $where[] = "$col = :f_$col"; $args[":f_$col"] = (string)$opts[$col]; }
    }
    if (!empty($opts['converted'])) $where[] = 'converted = 1';
    if (!empty($opts['engaged']))   $where[] = 'engaged >= 30';
    if (!empty($opts['path'])) {
        /* Any visit that touched this page, not only those that started on it. */
        $where[] = 'sid IN (SELECT sid FROM a_pageviews WHERE site = :s AND day BETWEEN :a AND :b AND path = :f_path)';
        $args[':f_path'] = (string)$opts['path'];
    }

    $order = 'started_ts DESC';
    if (($opts['sort'] ?? '') === 'longest') $order = 'engaged DESC, started_ts DESC';
    if (($opts['sort'] ?? '') === 'deepest') $order = 'pageviews DESC, started_ts DESC';

    $limit  = max(1, min(200, (int)($opts['limit'] ?? 40)));
    $offset = max(0, (int)($opts['offset'] ?? 0));

    $st = mp_db()->prepare(
        "SELECT sid, vid, day, started_at, started_ts, entry_path, exit_path, ref_type, source,
                campaign, country, region, city, lang, device, browser, os, pageviews, events,
                engaged, max_scroll, is_new, bounced, converted
         FROM a_sessions WHERE " . implode(' AND ', $where) . "
         ORDER BY $order LIMIT $limit OFFSET $offset");
    $st->execute($args);
    return $st->fetchAll();
}

/* How many visits match, so the list can say what it is a page of. */
function mpa_sessions_count(string $from, string $to, array $opts = array()): int {
    $where = array('site = :s', 'day BETWEEN :a AND :b');
    $args  = array(':s' => mpa_site(), ':a' => $from, ':b' => $to);
    foreach (mpa_visit_filter_cols() as $col) {
        if (!empty($opts[$col])) { $where[] = "$col = :f_$col"; $args[":f_$col"] = (string)$opts[$col]; }
    }
    if (!empty($opts['converted'])) $where[] = 'converted = 1';
    if (!empty($opts['engaged']))   $where[] = 'engaged >= 30';
    if (!empty($opts['path'])) {
        $where[] = 'sid IN (SELECT sid FROM a_pageviews WHERE site = :s AND day BETWEEN :a AND :b AND path = :f_path)';
        $args[':f_path'] = (string)$opts['path'];
    }
    $st = mp_db()->prepare("SELECT COUNT(*) FROM a_sessions WHERE " . implode(' AND ', $where));
    $st->execute($args);
    return (int)$st->fetchColumn();
}

/* One visit. */
function mpa_session(string $sid): ?array {
    $st = mp_db()->prepare("SELECT * FROM a_sessions WHERE site = :s AND sid = :i");
    $st->execute(array(':s' => mpa_site(), ':i' => $sid));
    $r = $st->fetch();
    return $r ? $r : null;
}

/* Pages and actions in one list, in the order they happened.

   Pageviews and events are separate tables with the same timestamp column, so
   they are merged here rather than in the view. A page carries its own read
   time and scroll depth; an event carries what was pressed and where it sat. */
function mpa_session_timeline(string $sid): array {
    $site = mpa_site();
    $db   = mp_db();

    $st = $db->prepare(
        "SELECT ts, 'page' kind, path, title AS label, '' AS placement, seq,
                engaged, max_scroll, load_ms, '' AS category
         FROM a_pageviews WHERE site = :s AND sid = :i");
    $st->execute(array(':s' => $site, ':i' => $sid));
    $rows = $st->fetchAll();

    $st = $db->prepare(
        "SELECT ts, 'event' kind, path, label, placement, 0 AS seq,
                0 AS engaged, 0 AS max_scroll, 0 AS load_ms, category, name
         FROM a_events WHERE site = :s AND sid = :i");
    $st->execute(array(':s' => $site, ':i' => $sid));
    foreach ($st->fetchAll() as $r) $rows[] = $r;

    usort($rows, function ($a, $b) {
        if ((int)$a['ts'] === (int)$b['ts']) {
            /* A page opens before anything can be pressed on it. */
            return ($a['kind'] === 'page' ? 0 : 1) <=> ($b['kind'] === 'page' ? 0 : 1);
        }
        return (int)$a['ts'] <=> (int)$b['ts'];
    });
    return $rows;
}

/* Other visits by the same visitor.

   Honest limit, stated on the page: by default the visitor id is a salted hash
   that changes every day, so this only ever finds visits from the same day.
   After consent it becomes a stable identifier and this reaches further back. */
function mpa_visitor_sessions(string $vid, string $notSid = '', int $limit = 10): array {
    $st = mp_db()->prepare(
        "SELECT sid, day, started_at, started_ts, entry_path, pageviews, engaged, converted
         FROM a_sessions
         WHERE site = :s AND vid = :v AND sid <> :x
         ORDER BY started_ts DESC LIMIT $limit");
    $st->execute(array(':s' => mpa_site(), ':v' => $vid, ':x' => $notSid));
    return $st->fetchAll();
}

/* Values present in the period, for building the filter controls. Only what
   actually occurred is offered, so a filter can never return nothing. */
function mpa_visit_filter_values(string $column, string $from, string $to, int $limit = 12): array {
    if (!in_array($column, mpa_visit_filter_cols(), true)) return array();
    $st = mp_db()->prepare(
        "SELECT $column AS dim, COUNT(*) v FROM a_sessions
         WHERE site = :s AND day BETWEEN :a AND :b AND $column <> ''
         GROUP BY $column ORDER BY v DESC LIMIT $limit");
    $st->execute(array(':s' => mpa_site(), ':a' => $from, ':b' => $to));
    return $st->fetchAll();
}

/* Any breakdown, restricted to visits matching one other column. "Which search
   engines" is `source` within `ref_type = search`; "which cities in Germany" is
   `city` within `country = DE`. Both columns are whitelisted. */
function mpa_segment_in(string $column, string $filterCol, string $filterVal,
                        string $from, string $to, int $limit = 10): array {
    $allowed = array('country','city','lang','device','browser','os','ref_type',
                     'source','campaign','entry_path','hour','region','medium');
    if (!in_array($column, $allowed, true) || !in_array($filterCol, $allowed, true)) return array();
    $st = mp_db()->prepare(
        "SELECT $column AS dim, COUNT(*) v, COALESCE(SUM(converted),0) conv,
                COALESCE(AVG(engaged),0) avg_time
         FROM a_sessions
         WHERE site = :s AND day BETWEEN :a AND :b AND $filterCol = :fv AND $column <> ''
         GROUP BY $column ORDER BY v DESC LIMIT $limit");
    $st->execute(array(':s' => mpa_site(), ':a' => $from, ':b' => $to, ':fv' => $filterVal));
    $rows = $st->fetchAll();
    foreach ($rows as &$r) {
        $r['rate'] = (int)$r['v'] > 0 ? round((float)$r['conv'] / (float)$r['v'] * 100, 1) : 0.0;
    }
    return $rows;
}

/* Channel names as a person would write them. ucfirst() turns "ai" into "Ai",
   which is the third time a raw stored value has leaked into something a reader
   sees, so this joins mpa_placement_label() and mpa_lang_label() as the one
   place a channel is named. */
function mpa_channel_label(string $t): string {
    $m = array('search' => 'Search', 'direct' => 'Direct', 'social' => 'Social',
               'referral' => 'Referral', 'paid' => 'Paid advertising',
               'ai' => 'AI assistants', 'maps' => 'Google Maps', 'email' => 'Email');
    return isset($m[$t]) ? $m[$t] : ucfirst($t);
}

/* Visits in one channel, counted. */
function mpa_channel_visits(string $refType, string $from, string $to): int {
    $st = mp_db()->prepare(
        "SELECT COUNT(*) FROM a_sessions
         WHERE site = :s AND day BETWEEN :a AND :b AND ref_type = :r");
    $st->execute(array(':s' => mpa_site(), ':a' => $from, ':b' => $to, ':r' => $refType));
    return (int)$st->fetchColumn();
}
