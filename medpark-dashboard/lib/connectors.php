<?php
/* ==========================================================================
   Data connectors.

   Every connector follows the same contract:
     mp_pull_<source>(string $from, string $to): array   ->  ['ok'=>bool, 'msg'=>string, 'rows'=>int]

   None of them throw. A missing credential is a normal state, reported as
   ok=false with a message the settings page can show, not an error page.
   ========================================================================== */
declare(strict_types=1);

/* ---------- HTTP ---------------------------------------------------------- */
function mp_http(string $method, string $url, array $opt = array()): array {
    $ch = curl_init();
    $headers = isset($opt['headers']) ? $opt['headers'] : array();
    curl_setopt_array($ch, array(
        CURLOPT_URL => $url,
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => isset($opt['timeout']) ? $opt['timeout'] : 45,
        CURLOPT_CONNECTTIMEOUT => 15,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_MAXREDIRS => 3,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_USERAGENT => 'MedPark-Dashboard/' . MP_VERSION,
    ));
    if (isset($opt['body'])) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, $opt['body']);
    }
    if ($headers) curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

    $body = curl_exec($ch);
    $code = (int)curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    $err  = curl_error($ch);
    curl_close($ch);

    return array('code'=>$code, 'body'=>(string)$body, 'error'=>$err);
}

function mp_http_json(string $method, string $url, array $opt = array()): array {
    $r = mp_http($method, $url, $opt);
    $r['json'] = json_decode($r['body'], true);
    return $r;
}

/* ---------- Google service account -> access token ------------------------
   One service account covers GA4, Search Console and Business Profile. The
   token is cached for its lifetime so a dashboard refresh does not mint a new
   one on every panel. */
function mp_b64url(string $s): string {
    return rtrim(strtr(base64_encode($s), '+/', '-_'), '=');
}

function mp_google_token(string $scope): array {
    static $cache = array();
    if (isset($cache[$scope]) && $cache[$scope]['exp'] > time() + 60) {
        return array('ok'=>true, 'token'=>$cache[$scope]['token']);
    }

    $raw = mp_get('google_sa_json');
    if ($raw === '') {
        return array('ok'=>false, 'msg'=>'No Google service account saved yet.');
    }
    $sa = json_decode($raw, true);
    if (!is_array($sa) || empty($sa['client_email']) || empty($sa['private_key'])) {
        return array('ok'=>false, 'msg'=>'The service account JSON is not valid. Paste the whole file, including client_email and private_key.');
    }

    $now = time();
    $header = mp_b64url(json_encode(array('alg'=>'RS256', 'typ'=>'JWT')));
    $claim  = mp_b64url(json_encode(array(
        'iss'   => $sa['client_email'],
        'scope' => $scope,
        'aud'   => 'https://oauth2.googleapis.com/token',
        'exp'   => $now + 3600,
        'iat'   => $now,
    )));

    $sig = '';
    $key = openssl_pkey_get_private($sa['private_key']);
    if ($key === false) {
        return array('ok'=>false, 'msg'=>'The private key in the service account could not be read.');
    }
    openssl_sign($header . '.' . $claim, $sig, $key, OPENSSL_ALGO_SHA256);
    $jwt = $header . '.' . $claim . '.' . mp_b64url($sig);

    $r = mp_http_json('POST', 'https://oauth2.googleapis.com/token', array(
        'headers' => array('Content-Type: application/x-www-form-urlencoded'),
        'body' => http_build_query(array(
            'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            'assertion'  => $jwt,
        )),
    ));

    if ($r['code'] !== 200 || empty($r['json']['access_token'])) {
        $detail = isset($r['json']['error_description']) ? $r['json']['error_description'] : substr($r['body'], 0, 200);
        return array('ok'=>false, 'msg'=>'Google refused the service account: ' . $detail);
    }

    $cache[$scope] = array('token'=>$r['json']['access_token'], 'exp'=>$now + 3500);
    return array('ok'=>true, 'token'=>$r['json']['access_token']);
}

/* ==========================================================================
   GA4
   ========================================================================== */
function mp_ga4_report(string $token, string $property, array $body): array {
    $url = 'https://analyticsdata.googleapis.com/v1beta/properties/' . rawurlencode($property) . ':runReport';
    return mp_http_json('POST', $url, array(
        'headers' => array('Authorization: Bearer ' . $token, 'Content-Type: application/json'),
        'body' => json_encode($body),
    ));
}

function mp_pull_ga4(string $from, string $to): array {
    $prop = mp_get('ga4_property_id');
    if ($prop === '') return array('ok'=>false, 'msg'=>'GA4 property ID not set.', 'rows'=>0);

    $t = mp_google_token('https://www.googleapis.com/auth/analytics.readonly');
    if (!$t['ok']) return array('ok'=>false, 'msg'=>$t['msg'], 'rows'=>0);

    $range = array(array('startDate'=>$from, 'endDate'=>$to));
    $rows  = 0;

    /* Each query is (metric key, GA4 dimensions, GA4 metrics, how to store).
       Daily totals first, then every breakdown the CEO report needs. */
    $plan = array(
        array('dims'=>array('date'),
              'mets'=>array('sessions','totalUsers','newUsers','screenPageViews','averageSessionDuration','bounceRate','engagementRate','userEngagementDuration'),
              'store'=>'daily'),
        array('dims'=>array('date','country'),                    'mets'=>array('sessions'), 'store'=>'sessions_country'),
        array('dims'=>array('date','sessionDefaultChannelGroup'), 'mets'=>array('sessions'), 'store'=>'sessions_channel'),
        array('dims'=>array('date','sessionSourceMedium'),        'mets'=>array('sessions'), 'store'=>'sessions_source'),
        array('dims'=>array('date','deviceCategory'),             'mets'=>array('sessions'), 'store'=>'sessions_device'),
        array('dims'=>array('date','language'),                   'mets'=>array('sessions'), 'store'=>'sessions_language'),
        array('dims'=>array('date','newVsReturning'),             'mets'=>array('sessions'), 'store'=>'sessions_visitor'),
        array('dims'=>array('date','pagePath'),                   'mets'=>array('screenPageViews'), 'store'=>'views_page'),
        array('dims'=>array('date','pagePath'),                   'mets'=>array('userEngagementDuration'), 'store'=>'engagement_page'),
        array('dims'=>array('date','eventName'),                  'mets'=>array('eventCount'), 'store'=>'events'),
        /* Cross-dimension rows. Storing country and language together in dim
           and dim2 is what makes real filtering possible: without it the
           dashboard can show German visitors OR mobile visitors, but never
           German visitors on mobile. */
        array('dims'=>array('date','country','language'),         'mets'=>array('sessions'), 'store'=>'x_country_lang', 'pair'=>true),
        array('dims'=>array('date','deviceCategory','language'),  'mets'=>array('sessions'), 'store'=>'x_device_lang',  'pair'=>true),
        array('dims'=>array('date','country','deviceCategory'),   'mets'=>array('sessions'), 'store'=>'x_country_dev',  'pair'=>true),
        array('dims'=>array('date','city'),                       'mets'=>array('sessions'), 'store'=>'sessions_city'),
    );

    $errors = array();
    foreach ($plan as $q) {
        $body = array(
            'dateRanges' => $range,
            'dimensions' => array_map(function ($d) { return array('name'=>$d); }, $q['dims']),
            'metrics'    => array_map(function ($m) { return array('name'=>$m); }, $q['mets']),
            'limit'      => 5000,
        );
        $r = mp_ga4_report($t['token'], $prop, $body);
        if ($r['code'] !== 200) {
            $msg = isset($r['json']['error']['message']) ? $r['json']['error']['message'] : ('HTTP ' . $r['code']);
            $errors[] = $q['store'] . ': ' . $msg;
            continue;
        }
        foreach ((isset($r['json']['rows']) ? $r['json']['rows'] : array()) as $row) {
            $dv = array_map(function ($x) { return isset($x['value']) ? $x['value'] : ''; }, $row['dimensionValues']);
            $mv = array_map(function ($x) { return isset($x['value']) ? (float)$x['value'] : 0.0; }, $row['metricValues']);
            $day = substr($dv[0], 0, 4) . '-' . substr($dv[0], 4, 2) . '-' . substr($dv[0], 6, 2);

            if ($q['store'] === 'daily') {
                $names = array('sessions','users','new_users','pageviews','avg_session_duration','bounce_rate','engagement_rate','engagement_seconds');
                foreach ($names as $i => $n) {
                    if (isset($mv[$i])) { mp_metric_put($day, 'ga4', $n, $mv[$i]); $rows++; }
                }
            } elseif (!empty($q['pair'])) {
                $dim  = isset($dv[1]) ? $dv[1] : '';
                $dim2 = isset($dv[2]) ? $dv[2] : '';
                if ($dim === '' || $dim === '(not set)') continue;
                mp_metric_put($day, 'ga4', $q['store'], $mv[0], $dim, $dim2);
                $rows++;
            } else {
                $dim = isset($dv[1]) ? $dv[1] : '';
                if ($dim === '' || $dim === '(not set)') continue;
                mp_metric_put($day, 'ga4', $q['store'], $mv[0], $dim);
                $rows++;
            }
        }
    }

    if ($errors && $rows === 0) {
        mp_log_run('ga4', 'error', implode(' | ', $errors));
        return array('ok'=>false, 'msg'=>$errors[0], 'rows'=>0);
    }
    mp_log_run('ga4', 'ok', $rows . ' rows' . ($errors ? ' (' . count($errors) . ' partial)' : ''));
    return array('ok'=>true, 'msg'=>$rows . ' rows stored.', 'rows'=>$rows);
}

/* ==========================================================================
   Search Console
   ========================================================================== */
function mp_pull_gsc(string $from, string $to): array {
    $site = mp_get('gsc_site_url');
    if ($site === '') return array('ok'=>false, 'msg'=>'Search Console site URL not set.', 'rows'=>0);

    $t = mp_google_token('https://www.googleapis.com/auth/webmasters.readonly');
    if (!$t['ok']) return array('ok'=>false, 'msg'=>$t['msg'], 'rows'=>0);

    $url = 'https://www.googleapis.com/webmasters/v3/sites/' . rawurlencode($site) . '/searchAnalytics/query';
    $rows = 0; $errors = array();

    $plan = array(
        array('dims'=>array('date'),            'store'=>'daily'),
        array('dims'=>array('date','query'),    'store'=>'clicks_query'),
        array('dims'=>array('date','page'),     'store'=>'clicks_page'),
        array('dims'=>array('date','country'),  'store'=>'clicks_country'),
        array('dims'=>array('date','device'),   'store'=>'clicks_device'),
    );

    foreach ($plan as $q) {
        $r = mp_http_json('POST', $url, array(
            'headers' => array('Authorization: Bearer ' . $t['token'], 'Content-Type: application/json'),
            'body' => json_encode(array(
                'startDate' => $from, 'endDate' => $to,
                'dimensions' => $q['dims'], 'rowLimit' => 5000, 'type' => 'web',
            )),
        ));
        if ($r['code'] !== 200) {
            $msg = isset($r['json']['error']['message']) ? $r['json']['error']['message'] : ('HTTP ' . $r['code']);
            $errors[] = $q['store'] . ': ' . $msg;
            continue;
        }
        foreach ((isset($r['json']['rows']) ? $r['json']['rows'] : array()) as $row) {
            $k = $row['keys'];
            $day = $k[0];
            if ($q['store'] === 'daily') {
                mp_metric_put($day, 'gsc', 'clicks',      (float)$row['clicks']);
                mp_metric_put($day, 'gsc', 'impressions', (float)$row['impressions']);
                mp_metric_put($day, 'gsc', 'ctr',         (float)$row['ctr'] * 100);
                mp_metric_put($day, 'gsc', 'position',    (float)$row['position']);
                $rows += 4;
            } else {
                $dim = isset($k[1]) ? $k[1] : '';
                if ($dim === '') continue;
                mp_metric_put($day, 'gsc', $q['store'], (float)$row['clicks'], $dim);
                /* Impressions and position are stored alongside, so a keyword
                   with no clicks still shows how close it is to page one. */
                mp_metric_put($day, 'gsc', $q['store'] . '_impr', (float)$row['impressions'], $dim);
                mp_metric_put($day, 'gsc', $q['store'] . '_pos',  (float)$row['position'], $dim);
                $rows += 3;
            }
        }
    }

    if ($errors && $rows === 0) {
        mp_log_run('gsc', 'error', implode(' | ', $errors));
        return array('ok'=>false, 'msg'=>$errors[0], 'rows'=>0);
    }
    mp_log_run('gsc', 'ok', $rows . ' rows');
    return array('ok'=>true, 'msg'=>$rows . ' rows stored.', 'rows'=>$rows);
}

/* ==========================================================================
   Google Business Profile, both branches.
   This is where map views, direction requests and calls from the listing live.
   None of it is currently reported anywhere.
   ========================================================================== */
function mp_pull_gbp(string $from, string $to): array {
    $locs = array_filter(array_map('trim', explode(',', mp_get('gbp_location_ids'))));
    if (!$locs) return array('ok'=>false, 'msg'=>'No Business Profile location IDs set.', 'rows'=>0);

    $t = mp_google_token('https://www.googleapis.com/auth/business.manage');
    if (!$t['ok']) return array('ok'=>false, 'msg'=>$t['msg'], 'rows'=>0);

    $metrics = array(
        'BUSINESS_IMPRESSIONS_DESKTOP_MAPS'   => 'impressions_maps_desktop',
        'BUSINESS_IMPRESSIONS_MOBILE_MAPS'    => 'impressions_maps_mobile',
        'BUSINESS_IMPRESSIONS_DESKTOP_SEARCH' => 'impressions_search_desktop',
        'BUSINESS_IMPRESSIONS_MOBILE_SEARCH'  => 'impressions_search_mobile',
        'BUSINESS_DIRECTION_REQUESTS'         => 'direction_requests',
        'CALL_CLICKS'                         => 'call_clicks',
        'WEBSITE_CLICKS'                      => 'website_clicks',
        'BUSINESS_CONVERSATIONS'              => 'conversations',
    );

    list($fy, $fm, $fd) = array_map('intval', explode('-', $from));
    list($ty, $tm, $td) = array_map('intval', explode('-', $to));

    $rows = 0; $errors = array();
    foreach ($locs as $loc) {
        $loc = preg_replace('~^locations/~', '', $loc);
        $qs = array(
            'dailyRange.start_date.year'  => $fy, 'dailyRange.start_date.month' => $fm, 'dailyRange.start_date.day' => $fd,
            'dailyRange.end_date.year'    => $ty, 'dailyRange.end_date.month'   => $tm, 'dailyRange.end_date.day'   => $td,
        );
        $q = http_build_query($qs);
        foreach (array_keys($metrics) as $m) { $q .= '&dailyMetrics=' . $m; }

        $url = 'https://businessprofileperformance.googleapis.com/v1/locations/' . rawurlencode($loc)
             . ':fetchMultiDailyMetricsTimeSeries?' . $q;
        $r = mp_http_json('GET', $url, array('headers'=>array('Authorization: Bearer ' . $t['token'])));

        if ($r['code'] !== 200) {
            $msg = isset($r['json']['error']['message']) ? $r['json']['error']['message'] : ('HTTP ' . $r['code']);
            $errors[] = $loc . ': ' . $msg;
            continue;
        }

        $series = isset($r['json']['multiDailyMetricTimeSeries']) ? $r['json']['multiDailyMetricTimeSeries'] : array();
        foreach ($series as $block) {
            foreach ((isset($block['dailyMetricTimeSeries']) ? $block['dailyMetricTimeSeries'] : array()) as $ts) {
                $name = isset($ts['dailyMetric']) ? $ts['dailyMetric'] : '';
                if (!isset($metrics[$name])) continue;
                $key = $metrics[$name];
                foreach ((isset($ts['timeSeries']['datedValues']) ? $ts['timeSeries']['datedValues'] : array()) as $dv) {
                    $d = $dv['date'];
                    $day = sprintf('%04d-%02d-%02d', $d['year'], $d['month'], isset($d['day']) ? $d['day'] : 1);
                    $val = isset($dv['value']) ? (float)$dv['value'] : 0.0;
                    mp_metric_put($day, 'gbp', $key, $val, $loc);
                    $rows++;
                }
            }
        }
    }

    if ($errors && $rows === 0) {
        mp_log_run('gbp', 'error', implode(' | ', $errors));
        return array('ok'=>false, 'msg'=>$errors[0], 'rows'=>0);
    }
    mp_log_run('gbp', 'ok', $rows . ' rows');
    return array('ok'=>true, 'msg'=>$rows . ' rows stored.', 'rows'=>$rows);
}

/* ==========================================================================
   PageSpeed Insights. Works with no key, a key only raises the rate limit.
   ========================================================================== */
function mp_pull_psi(string $from, string $to): array {
    $base = rtrim(mp_get('site_url'), '/');
    $pages = array('/' => 'home', '/emergency-urgent-care' => 'emergency', '/services/' => 'services', '/de/' => 'german', '/pl/' => 'polish');
    $key = mp_get('psi_api_key');
    $day = gmdate('Y-m-d');
    $rows = 0; $errors = array(); $rateLimited = false;

    foreach ($pages as $path => $label) {
        foreach (array('mobile', 'desktop') as $strategy) {
            $url = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=' . rawurlencode($base . $path)
                 . '&strategy=' . $strategy . '&category=performance&category=seo&category=accessibility&category=best-practices';
            if ($key !== '') $url .= '&key=' . rawurlencode($key);

            /* Without a key the quota is shared across the whole server IP, so
               429 is common. Back off and try once more before giving up on
               this page, and keep going with the rest either way. */
            $r = mp_http_json('GET', $url, array('timeout'=>90));
            if ($r['code'] === 429) {
                $rateLimited = true;
                sleep(6);
                $r = mp_http_json('GET', $url, array('timeout'=>90));
            }
            if ($r['code'] !== 200 || empty($r['json']['lighthouseResult'])) {
                $errors[] = $label . '/' . $strategy . ': HTTP ' . $r['code'];
                continue;
            }
            $rateLimited = false;
            $lh = $r['json']['lighthouseResult'];
            $dim = $label . '|' . $strategy;

            foreach (array('performance','seo','accessibility','best-practices') as $cat) {
                if (isset($lh['categories'][$cat]['score'])) {
                    mp_metric_put($day, 'psi', 'score_' . str_replace('-', '_', $cat), (float)$lh['categories'][$cat]['score'] * 100, $dim);
                    $rows++;
                }
            }
            /* The three Core Web Vitals, in the units Google reports them. */
            $audits = array('largest-contentful-paint'=>'lcp', 'cumulative-layout-shift'=>'cls', 'total-blocking-time'=>'tbt', 'speed-index'=>'si');
            foreach ($audits as $a => $short) {
                if (isset($lh['audits'][$a]['numericValue'])) {
                    mp_metric_put($day, 'psi', $short, (float)$lh['audits'][$a]['numericValue'], $dim);
                    $rows++;
                }
            }
            if ($key === '') sleep(2);
        }
    }

    if ($rows === 0) {
        mp_log_run('psi', 'error', implode(' | ', $errors));
        $msg = $rateLimited || strpos(implode(' ', $errors), '429') !== false
            ? 'PageSpeed refused the requests as rate limited. This shared server has no quota left today. A free PageSpeed Insights API key in Settings fixes it permanently.'
            : ($errors ? $errors[0] : 'No results.');
        return array('ok'=>false, 'msg'=>$msg, 'rows'=>0);
    }
    mp_log_run('psi', 'ok', $rows . ' rows');
    return array('ok'=>true, 'msg'=>$rows . ' measurements stored.', 'rows'=>$rows);
}

/* ==========================================================================
   SEMrush. Optional. Only runs if a key is present, and every call costs
   API units, so this is deliberately a small, fixed set of requests.
   ========================================================================== */
function mp_pull_semrush(string $from, string $to): array {
    $key = mp_get('semrush_api_key');
    if ($key === '') return array('ok'=>false, 'msg'=>'No SEMrush API key set.', 'rows'=>0);

    $db = mp_get('semrush_database', 'eg');
    $domain = preg_replace('~^https?://(www\.)?~', '', rtrim(mp_get('site_url'), '/'));
    $day = gmdate('Y-m-d');
    $rows = 0;

    /* Domain overview: organic keywords, organic traffic, authority. */
    $r = mp_http('GET', 'https://api.semrush.com/?type=domain_ranks&key=' . rawurlencode($key)
        . '&domain=' . rawurlencode($domain) . '&database=' . rawurlencode($db)
        . '&export_columns=Dn,Rk,Or,Ot,Oc,Ad,At,Ac');
    if ($r['code'] !== 200 || stripos($r['body'], 'ERROR') === 0) {
        mp_log_run('semrush', 'error', substr($r['body'], 0, 200));
        return array('ok'=>false, 'msg'=>'SEMrush refused the request: ' . substr(trim($r['body']), 0, 120), 'rows'=>0);
    }
    $lines = array_values(array_filter(explode("\n", trim($r['body']))));
    if (count($lines) >= 2) {
        $head = explode(';', $lines[0]);
        $vals = explode(';', $lines[1]);
        $map = array('Rk'=>'rank', 'Or'=>'organic_keywords', 'Ot'=>'organic_traffic', 'Oc'=>'organic_cost', 'Ad'=>'adwords_keywords', 'At'=>'adwords_traffic');
        foreach ($head as $i => $h) {
            $h = trim($h);
            if (isset($map[$h]) && isset($vals[$i])) {
                mp_metric_put($day, 'semrush', $map[$h], (float)$vals[$i]);
                $rows++;
            }
        }
    }

    /* Top organic keywords, so ranked pages can be shown next to GSC. */
    $r2 = mp_http('GET', 'https://api.semrush.com/?type=domain_organic&key=' . rawurlencode($key)
        . '&domain=' . rawurlencode($domain) . '&database=' . rawurlencode($db)
        . '&display_limit=50&export_columns=Ph,Po,Nq,Ur');
    if ($r2['code'] === 200 && stripos($r2['body'], 'ERROR') !== 0) {
        $l = array_values(array_filter(explode("\n", trim($r2['body']))));
        for ($i = 1; $i < count($l); $i++) {
            $c = explode(';', $l[$i]);
            if (count($c) < 3) continue;
            mp_metric_put($day, 'semrush', 'keyword_position', (float)$c[1], trim($c[0]));
            mp_metric_put($day, 'semrush', 'keyword_volume',   (float)$c[2], trim($c[0]));
            $rows += 2;
        }
    }

    mp_log_run('semrush', 'ok', $rows . ' rows');
    return array('ok'=>true, 'msg'=>$rows . ' rows stored.', 'rows'=>$rows);
}

/* ==========================================================================
   Yandex Metrica. Already installed on the site and currently unused.
   Useful as a second opinion on traffic, and it is the only source that
   still works when a visitor blocks Google scripts.
   ========================================================================== */
function mp_pull_yandex(string $from, string $to): array {
    $token = mp_get('yandex_oauth_token');
    $counter = mp_get('yandex_counter_id');
    if ($token === '' || $counter === '') {
        return array('ok'=>false, 'msg'=>'No Yandex OAuth token set.', 'rows'=>0);
    }

    $rows = 0; $errors = array();
    $plan = array(
        array('metrics'=>'ym:s:visits,ym:s:users,ym:s:pageviews,ym:s:bounceRate,ym:s:avgVisitDurationSeconds',
              'dims'=>'ym:s:date', 'store'=>'daily'),
        array('metrics'=>'ym:s:visits', 'dims'=>'ym:s:date,ym:s:regionCountry', 'store'=>'visits_country'),
        array('metrics'=>'ym:s:visits', 'dims'=>'ym:s:date,ym:s:lastTrafficSource', 'store'=>'visits_source'),
    );

    foreach ($plan as $q) {
        $url = 'https://api-metrika.yandex.net/stat/v1/data?' . http_build_query(array(
            'ids' => $counter, 'metrics' => $q['metrics'], 'dimensions' => $q['dims'],
            'date1' => $from, 'date2' => $to, 'limit' => 5000, 'group' => 'day',
        ));
        $r = mp_http_json('GET', $url, array('headers'=>array('Authorization: OAuth ' . $token)));
        if ($r['code'] !== 200) {
            $errors[] = $q['store'] . ': ' . (isset($r['json']['message']) ? $r['json']['message'] : 'HTTP ' . $r['code']);
            continue;
        }
        foreach ((isset($r['json']['data']) ? $r['json']['data'] : array()) as $row) {
            $dims = array_map(function ($d) { return isset($d['name']) ? $d['name'] : (isset($d['id']) ? $d['id'] : ''); }, $row['dimensions']);
            $m = $row['metrics'];
            $day = $dims[0];
            if ($q['store'] === 'daily') {
                $names = array('visits','users','pageviews','bounce_rate','avg_visit_seconds');
                foreach ($names as $i => $n) {
                    if (isset($m[$i])) { mp_metric_put($day, 'yandex', $n, (float)$m[$i]); $rows++; }
                }
            } else {
                $dim = isset($dims[1]) ? (string)$dims[1] : '';
                if ($dim === '') continue;
                mp_metric_put($day, 'yandex', $q['store'], (float)$m[0], $dim);
                $rows++;
            }
        }
    }

    if ($errors && $rows === 0) {
        mp_log_run('yandex', 'error', implode(' | ', $errors));
        return array('ok'=>false, 'msg'=>$errors[0], 'rows'=>0);
    }
    mp_log_run('yandex', 'ok', $rows . ' rows');
    return array('ok'=>true, 'msg'=>$rows . ' rows stored.', 'rows'=>$rows);
}

/* ==========================================================================
   Keyword discovery.

   This is the SEMrush replacement, and it is worth being clear about what it
   is and is not. Google's own suggest endpoint returns the queries people
   actually type, for free, with no key. That gives real demand signals and
   long-tail phrasing in all three languages.

   What it does NOT give is search volume or difficulty. Those are modelled
   numbers that only a paid tool sells, and rather than invent them the
   keywords page says so plainly. Search Console supplies the real impressions
   and positions for anything the site already ranks for, which for your own
   site is better data than any third party estimate.
   ========================================================================== */
function mp_suggest(string $term, string $lang, string $country): array {
    $url = 'https://suggestqueries.google.com/complete/search?'
         . http_build_query(array('client' => 'firefox', 'q' => $term, 'hl' => $lang, 'gl' => $country));
    $r = mp_http('GET', $url, array('timeout' => 15));
    if ($r['code'] !== 200) return array();
    $j = json_decode($r['body'], true);
    /* Response is [query, [suggestions], ...]. */
    return (is_array($j) && isset($j[1]) && is_array($j[1])) ? $j[1] : array();
}

function mp_keyword_seeds(): array {
    return array(
        'en' => array(
            'hospital in hurghada', 'doctor in hurghada', 'emergency hurghada',
            'clinic sahl hasheesh', 'hospital el gouna', 'dentist hurghada',
            'travel insurance egypt hospital', 'diving accident hurghada',
        ),
        'de' => array(
            'krankenhaus hurghada', 'arzt hurghada', 'notfall hurghada',
            'zahnarzt hurghada', 'klinik sahl hasheesh', 'reiseversicherung aegypten arzt',
        ),
        'pl' => array(
            'szpital hurghada', 'lekarz hurghada', 'pogotowie hurghada',
            'dentysta hurghada', 'klinika sahl hasheesh', 'ubezpieczenie egipt lekarz',
        ),
    );
}

function mp_pull_keywords(string $from, string $to): array {
    $seeds = mp_keyword_seeds();
    $rows = 0; $errors = array();
    $now = gmdate('c');

    $st = mp_db()->prepare(
        "INSERT INTO keywords (site, seen_at, term, seed, lang, source) VALUES (:site,:t,:k,:s,:l,'suggest')
         ON CONFLICT(term, lang) DO UPDATE SET seen_at = :t"
    );

    foreach ($seeds as $lang => $terms) {
        $country = 'eg';
        foreach ($terms as $seed) {
            $out = mp_suggest($seed, $lang, $country);
            if (!$out) { $errors[] = $seed; continue; }
            foreach ($out as $sug) {
                $sug = trim((string)$sug);
                if ($sug === '' || mb_strlen($sug) > 90) continue;
                $st->execute(array(':site' => mp_current_site(), ':t' => $now, ':k' => $sug,
                                   ':s' => $seed, ':l' => $lang));
                $rows++;
            }
            /* Google is being generous here. Do not abuse it. */
            usleep(400000);
        }
    }

    if ($rows === 0) {
        mp_log_run('keywords', 'error', 'no suggestions returned for ' . count($errors) . ' seeds');
        return array('ok' => false, 'msg' => 'Google returned no suggestions. This usually clears on its own.', 'rows' => 0);
    }
    mp_log_run('keywords', 'ok', $rows . ' suggestions');
    return array('ok' => true, 'msg' => $rows . ' keyword ideas stored.', 'rows' => $rows);
}

/* ==========================================================================
   Competitors. No paid API, so this compares what can be measured honestly:
   whether their site is fast, whether it is technically sound, and whether it
   is reachable. That is a real competitive picture for a local market, and it
   costs nothing.
   ========================================================================== */
function mp_pull_competitors(string $from, string $to): array {
    $list = array_values(array_filter(array_map('trim', explode("\n", mp_get('competitor_sites', '')))));
    if (!$list) return array('ok' => false, 'msg' => 'No competitor sites listed in Settings.', 'rows' => 0);

    $day = gmdate('Y-m-d');
    $rows = 0;
    foreach (array_slice($list, 0, 6) as $site) {
        $site = preg_replace('~^https?://~', '', $site);
        $site = rtrim(strtok($site, '/'), '/');
        if ($site === '') continue;
        $url = 'https://' . $site . '/';

        $ch = curl_init();
        curl_setopt_array($ch, array(
            CURLOPT_URL => $url, CURLOPT_RETURNTRANSFER => true, CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_TIMEOUT => 25, CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_USERAGENT => 'Mozilla/5.0 (compatible; MedPark-Dashboard/' . MP_VERSION . ')',
        ));
        $body = curl_exec($ch);
        $code = (int)curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
        $ttfb = (float)curl_getinfo($ch, CURLINFO_STARTTRANSFER_TIME) * 1000;
        curl_close($ch);

        mp_metric_put($day, 'competitor', 'status', (float)$code, $site);
        mp_metric_put($day, 'competitor', 'ttfb_ms', $ttfb, $site);
        mp_metric_put($day, 'competitor', 'bytes', (float)strlen((string)$body), $site);
        $rows += 3;

        if ($code === 200 && $body) {
            $b = (string)$body;
            mp_metric_put($day, 'competitor', 'has_schema',   strpos($b, 'application/ld+json') !== false ? 1 : 0, $site);
            mp_metric_put($day, 'competitor', 'has_hreflang', stripos($b, 'hreflang') !== false ? 1 : 0, $site);
            mp_metric_put($day, 'competitor', 'has_german',   preg_match('~hreflang=["\']de~i', $b) ? 1 : 0, $site);
            mp_metric_put($day, 'competitor', 'has_whatsapp', stripos($b, 'wa.me') !== false ? 1 : 0, $site);
            preg_match('~<title[^>]*>(.*?)</title>~is', $b, $m);
            mp_metric_put($day, 'competitor', 'title_len', isset($m[1]) ? (float)mb_strlen(trim($m[1])) : 0, $site);
            $rows += 5;
        }
    }

    mp_log_run('competitor', 'ok', $rows . ' checks');
    return array('ok' => true, 'msg' => $rows . ' competitor checks stored.', 'rows' => $rows);
}

/* ==========================================================================
   Site health. No credentials needed, so this one works from day one.
   Checks every address variant, the key pages, and the files that decide
   whether Google and the AI crawlers can read the site at all.
   ========================================================================== */
function mp_pull_health(string $from, string $to): array {
    $base = rtrim(mp_get('site_url'), '/');
    $host = preg_replace('~^https?://~', '', $base);
    $bare = preg_replace('~^www\.~', '', $host);
    $day = gmdate('Y-m-d');
    $rows = 0;

    /* Do the four address variants all answer? They should not. One canonical
       address should answer and the other three should redirect to it. */
    $variants = array(
        'http://'  . $bare, 'http://www.'  . $bare,
        'https://' . $bare, 'https://www.' . $bare,
    );
    $answering = 0;
    foreach ($variants as $v) {
        $ch = curl_init();
        curl_setopt_array($ch, array(
            CURLOPT_URL => $v, CURLOPT_NOBODY => true, CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => false, CURLOPT_TIMEOUT => 20, CURLOPT_SSL_VERIFYPEER => false,
            /* A real browser user agent is required. The server's security module
               answers 406 to any request without one, which would make every
               variant look broken when it is fine. */
            CURLOPT_USERAGENT => 'Mozilla/5.0 (compatible; MedPark-Dashboard/' . MP_VERSION . ')',
            CURLOPT_HTTPHEADER => array('Accept: text/html,application/xhtml+xml,*/*'),
        ));
        curl_exec($ch);
        $code = (int)curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
        curl_close($ch);
        mp_metric_put($day, 'health', 'variant_status', (float)$code, $v);
        if ($code === 200) $answering++;
        $rows++;
    }
    mp_metric_put($day, 'health', 'variants_answering_200', (float)$answering);

    /* Key pages: status and how long the server took to first byte. */
    $pages = array('/', '/emergency-urgent-care', '/services/', '/contact-us/', '/de/', '/pl/', '/sitemap.xml', '/robots.txt', '/llms.txt');
    foreach ($pages as $p) {
        $ch = curl_init();
        curl_setopt_array($ch, array(
            CURLOPT_URL => $base . $p, CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true, CURLOPT_TIMEOUT => 25, CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_USERAGENT => 'Mozilla/5.0 (compatible; MedPark-Dashboard/' . MP_VERSION . ')',
        ));
        $body = curl_exec($ch);
        $code = (int)curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
        $ttfb = (float)curl_getinfo($ch, CURLINFO_STARTTRANSFER_TIME) * 1000;
        $size = strlen((string)$body);
        curl_close($ch);
        mp_metric_put($day, 'health', 'page_status', (float)$code, $p);
        mp_metric_put($day, 'health', 'page_ttfb_ms', $ttfb, $p);
        mp_metric_put($day, 'health', 'page_bytes', (float)$size, $p);
        $rows += 3;

        /* On the home page, confirm the things that quietly break reporting. */
        if ($p === '/' && $code === 200) {
            mp_metric_put($day, 'health', 'has_tracking',  strpos((string)$body, 'mp-track.js') !== false ? 1 : 0);
            mp_metric_put($day, 'health', 'has_ga4',       strpos((string)$body, 'gtag/js') !== false ? 1 : 0);
            mp_metric_put($day, 'health', 'has_schema',    strpos((string)$body, 'application/ld+json') !== false ? 1 : 0);
            mp_metric_put($day, 'health', 'has_canonical', strpos((string)$body, 'rel="canonical"') !== false ? 1 : 0);
            mp_metric_put($day, 'health', 'has_hreflang',  strpos((string)$body, 'hreflang') !== false ? 1 : 0);
            $rows += 5;
        }
    }

    /* SSL expiry, because a lapsed certificate takes the whole site down. */
    $ctx = stream_context_create(array('ssl'=>array('capture_peer_cert'=>true, 'verify_peer'=>false, 'verify_peer_name'=>false)));
    $sock = @stream_socket_client('ssl://' . $host . ':443', $errno, $errstr, 15, STREAM_CLIENT_CONNECT, $ctx);
    if ($sock) {
        $params = stream_context_get_params($sock);
        if (!empty($params['options']['ssl']['peer_certificate'])) {
            $cert = openssl_x509_parse($params['options']['ssl']['peer_certificate']);
            if (!empty($cert['validTo_time_t'])) {
                $days = (int)floor(($cert['validTo_time_t'] - time()) / 86400);
                mp_metric_put($day, 'health', 'ssl_days_left', (float)$days);
                $rows++;
            }
        }
        fclose($sock);
    }

    mp_log_run('health', 'ok', $rows . ' checks');
    return array('ok'=>true, 'msg'=>$rows . ' checks stored.', 'rows'=>$rows);
}

/* ==========================================================================
   Behaviour spool importer.

   The public beacon at /track/heat.php deliberately never touches the
   database. It appends one JSON line per visit to a spool file, which costs
   microseconds and cannot block. This drains that spool into SQLite in a
   single transaction, on the dashboard's schedule rather than the visitor's.

   That split is the whole point: visitor requests stay off the database, and
   all the write contention happens once, here, where nobody is waiting.
   ========================================================================== */
function mp_pull_behaviour(string $from, string $to): array {
    $spool = MP_DATA_DIR . '/heat-spool.ndjson';
    if (!is_file($spool) || filesize($spool) === 0) {
        return array('ok'=>true, 'msg'=>'Nothing new in the spool.', 'rows'=>0);
    }

    /* Move the spool aside first. A beacon arriving mid-import then writes to
       a fresh file and is picked up next time, rather than being lost or
       double counted. */
    $work = $spool . '.' . gmdate('YmdHis');
    if (!@rename($spool, $work)) {
        return array('ok'=>false, 'msg'=>'Could not claim the spool file.', 'rows'=>0);
    }

    $fh = @fopen($work, 'r');
    if (!$fh) { return array('ok'=>false, 'msg'=>'Could not read the spool.', 'rows'=>0); }

    $db = mp_db();
    $db->beginTransaction();
    /* Every behaviour row now carries the property it belongs to, and the
       conflict key includes it, so two sites recording a click on the same grid
       cell of the same path on the same day are two rows rather than one. */
    $qClick  = $db->prepare("INSERT INTO heat_clicks (site,day,page,device,gx,gy,hits) VALUES (:site,:d,:p,:v,:x,:y,:h)
                             ON CONFLICT(site,day,page,device,gx,gy) DO UPDATE SET hits = hits + :h");
    $qScroll = $db->prepare("INSERT INTO heat_scroll (site,day,page,device,bucket,hits) VALUES (:site,:d,:p,:v,:b,1)
                             ON CONFLICT(site,day,page,device,bucket) DO UPDATE SET hits = hits + 1");
    $qTarget = $db->prepare("INSERT INTO heat_targets (site,day,page,label,hits) VALUES (:site,:d,:p,:l,:h)
                             ON CONFLICT(site,day,page,label) DO UPDATE SET hits = hits + :h");
    $qHour   = $db->prepare("INSERT INTO heat_hours (site,day,dow,hour,kind,hits) VALUES (:site,:d,:w,:h,'visit',1)
                             ON CONFLICT(site,day,dow,hour,kind) DO UPDATE SET hits = hits + 1");

    $rows = 0; $lines = 0; $bad = 0;
    try {
        while (($line = fgets($fh)) !== false) {
            $lines++;
            if ($lines > 200000) break;           /* hard ceiling, never spin */
            $r = json_decode(trim($line), true);
            if (!is_array($r) || empty($r['t']) || empty($r['p'])) { $bad++; continue; }

            $day = (string)$r['t']; $page = (string)$r['p'];
            $dev = ($r['v'] ?? '') === 'mobile' ? 'mobile' : 'desktop';

            foreach ((is_array($r['c'] ?? null) ? $r['c'] : array()) as $c) {
                if (!is_array($c) || count($c) < 3) continue;
                $qClick->execute(array(':site'=>mp_current_site(), ':d'=>$day, ':p'=>$page, ':v'=>$dev,
                                       ':x'=>(int)$c[0], ':y'=>(int)$c[1], ':h'=>(int)$c[2]));
                $rows++;
            }
            foreach ((is_array($r['g'] ?? null) ? $r['g'] : array()) as $label => $n) {
                $qTarget->execute(array(':site'=>mp_current_site(), ':d'=>$day, ':p'=>$page,
                                        ':l'=>(string)$label, ':h'=>(int)$n));
                $rows++;
            }
            if (isset($r['d']) && $r['d'] !== null) {
                $qScroll->execute(array(':site'=>mp_current_site(), ':d'=>$day, ':p'=>$page, ':v'=>$dev,
                                        ':b'=>(int)(floor((int)$r['d'] / 10) * 10)));
                $rows++;
            }
            if (isset($r['w'], $r['h']) && $r['w'] !== null && $r['h'] !== null) {
                $qHour->execute(array(':site'=>mp_current_site(), ':d'=>$day,
                                      ':w'=>(int)$r['w'], ':h'=>(int)$r['h']));
                $rows++;
            }
        }
        $db->commit();
    } catch (Throwable $ex) {
        if ($db->inTransaction()) $db->rollBack();
        fclose($fh);
        /* Put it back so nothing is lost, and try again next run. */
        @rename($work, $spool);
        mp_log_run('behaviour', 'error', $ex->getMessage());
        return array('ok'=>false, 'msg'=>'Import failed, spool kept: ' . $ex->getMessage(), 'rows'=>0);
    }
    fclose($fh);
    @unlink($work);

    /* Tidy the rate-limit files while we are here, so they cannot accumulate. */
    $rl = MP_DATA_DIR . '/rl';
    if (is_dir($rl)) {
        $cut = time() - 3600;
        foreach ((glob($rl . '/*') ?: array()) as $f) {
            if (@filemtime($f) < $cut) @unlink($f);
        }
    }

    mp_log_run('behaviour', 'ok', $lines . ' beacons, ' . $rows . ' rows' . ($bad ? ", $bad malformed" : ''));
    return array('ok'=>true, 'msg'=>$lines . ' beacons imported, ' . $rows . ' rows.', 'rows'=>$rows);
}

/* ---------- one entry point ---------------------------------------------- */
function mp_pull_all(string $from, string $to, array $only = array()): array {
    $all = array('ga4'=>'mp_pull_ga4', 'gsc'=>'mp_pull_gsc', 'gbp'=>'mp_pull_gbp',
                 'psi'=>'mp_pull_psi', 'semrush'=>'mp_pull_semrush',
                 'yandex'=>'mp_pull_yandex', 'health'=>'mp_pull_health',
                 'keywords'=>'mp_pull_keywords', 'competitor'=>'mp_pull_competitors',
                 'behaviour'=>'mp_pull_behaviour');
    $out = array();
    foreach ($all as $k => $fn) {
        if ($only && !in_array($k, $only, true)) continue;
        try {
            $out[$k] = $fn($from, $to);
        } catch (Throwable $ex) {
            $out[$k] = array('ok'=>false, 'msg'=>$ex->getMessage(), 'rows'=>0);
            mp_log_run($k, 'error', $ex->getMessage());
        }
    }
    return $out;
}
