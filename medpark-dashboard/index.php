<?php
/* ==========================================================================
   MedPark dashboard, front controller.
   ========================================================================== */
declare(strict_types=1);

require __DIR__ . '/lib/bootstrap.php';
require __DIR__ . '/lib/connectors.php';
require __DIR__ . '/lib/insights.php';
require __DIR__ . '/lib/ui.php';
require __DIR__ . '/lib/definitions.php';
require __DIR__ . '/lib/narrative.php';
/* views/ceo.php calls mp_recommendations() unconditionally and only
   export.php ever required the file that defines it, so the Summary page,
   which is also the dashboard's default page, died with an undefined
   function. Found 2026-09-03 while rendering every page through the same
   include chain index.php uses. */
require __DIR__ . '/lib/recommend.php';
require __DIR__ . '/lib/aicheck.php';
/* One definition of the headline numbers, shared by the Summary, the KPI
   page and the exported report, so they can never disagree. */
require __DIR__ . '/lib/headline.php';
require __DIR__ . '/lib/ownpanels.php';

if (!mp_is_configured()) { header('Location: login.php'); exit; }
mp_require_login();

/* ---------- near real time -----------------------------------------------
   Opening the dashboard is the moment somebody wants current numbers, so the
   spool is drained here as well as on the five minute cron. Two guards: only
   when a beacon is actually waiting, and at most once every fifteen seconds.
   When the spool is empty this is a single filesize() call. */
if (mp_get('analytics_on') === '1' && function_exists('mpa_import')) {
    $spoolFile = MP_DATA_DIR . '/' . A_SPOOL;
    $lockFile  = MP_DATA_DIR . '/.a-live';
    if (is_file($spoolFile) && filesize($spoolFile) > 0
        && (!is_file($lockFile) || (time() - (int)@filemtime($lockFile)) > 15)) {
        @touch($lockFile);
        @chmod($lockFile, 0600);
        try { mpa_import(); } catch (Throwable $e) { /* never block the page */ }
    }
}

$page  = isset($_GET['p']) ? preg_replace('~[^a-z_]~', '', (string)$_GET['p']) : 'ceo';
$rangeKey = isset($_GET['r']) ? (string)$_GET['r'] : '28d';
$R = mp_range($rangeKey);

/* label, icon, group */
$PAGES = array(
    'ceo'         => array('Summary',             'gauge',    'Report'),
    'overview'    => array('All numbers',         'pulse',    'Report'),
    'kpi'         => array('KPIs and targets',    'target',   'Report'),
    'conversions' => array('Enquiries',           'phone',    'Report'),
    'leads'       => array('Appointment requests','inbox',    'Report'),
    'traffic'     => array('Audience',            'users',    'Report'),
    'whatsapp'    => array('WhatsApp',            'bubble',   'Channels'),
    'chat'        => array('Assistant',           'chat',     'Channels'),
    'seo'         => array('Search',              'search',   'Channels'),
    'keywords'    => array('Keywords',            'sparkles', 'Channels'),
    'local'       => array('Maps and local',      'map',      'Channels'),
    'geo'         => array('Geography',           'globe',    'Channels'),
    'ai'          => array('AI visibility',       'pulse',    'Channels'),
    'analysis'    => array('Analysis',            'pulse',    'Behaviour'),
    'visits'      => array('Visits, one by one',  'list',     'Behaviour'),
    'heatmap'     => array('Heatmap',             'heat',     'Behaviour'),
    'health'      => array('Site health',         'alert',    'Technical'),
    'issues'      => array('Issues and advice',   'alert',    'Technical'),
    'settings'    => array('Settings and access', 'settings', 'Technical'),
);
if (!isset($PAGES[$page])) $page = 'ceo';

/* ---------- actions ------------------------------------------------------- */
$flash = null;
if ($_SERVER['REQUEST_METHOD'] === 'POST' && mp_csrf_ok($_POST['csrf'] ?? null)) {
    $act = (string)($_POST['act'] ?? '');

    if ($act === 'refresh') {
        $only = isset($_POST['source']) && $_POST['source'] !== '' ? array((string)$_POST['source']) : array();
        $res = mp_pull_all($R['prev_from'], $R['to'], $only);
        $ok = array(); $bad = array();
        foreach ($res as $k => $v) { $v['ok'] ? $ok[] = $k . ' (' . $v['rows'] . ')' : $bad[] = $k . ': ' . $v['msg']; }
        $flash = array('t' => $bad ? 'bad' : 'ok',
            'm' => ($ok ? 'Updated ' . implode(', ', $ok) . '. ' : '') . ($bad ? implode(' ', $bad) : ''));
    }

    if ($act === 'save_settings') {
        $keys = array('site_url','brand_name','ga4_property_id','ga4_measurement_id','google_sa_json',
                      'gsc_site_url','gbp_account_id','gbp_location_ids','psi_api_key','semrush_api_key',
                      'semrush_database','yandex_counter_id','yandex_oauth_token','ai_prompts',
                      'ai_brand_terms','ai_competitors','anthropic_api_key','perplexity_api_key','gemini_api_key','chat_model',
                      'staff_email','staff_alert_email','chat_enabled','competitors',
                      'competitor_sites','primary_market',
                      'maxmind_account','maxmind_key','analytics_on',
                      'analytics_retain','consent_banner_on');
        $patch = array();
        foreach ($keys as $k) { if (isset($_POST[$k])) $patch[$k] = trim((string)$_POST[$k]); }
        if (!empty($_POST['new_password'])) {
            $patch['admin_hash'] = password_hash((string)$_POST['new_password'], PASSWORD_DEFAULT);
        }
        $flash = mp_save_settings($patch)
            ? array('t'=>'ok', 'm'=>'Saved. Use Refresh to pull with the new credentials.')
            : array('t'=>'bad', 'm'=>'Could not write the settings file. Check permissions on ' . MP_DATA_DIR . '.');
    }

    /* ---- rank targets ---------------------------------------------------
       The keywords we are deliberately going after, as opposed to the ones we
       happen to appear for. Position comes from Search Console; this only
       records the intent. */
    if ($act === 'kw_add') {
        $term = mb_strtolower(trim((string)($_POST['term'] ?? '')));
        $lang = in_array($_POST['lang'] ?? '', array('en','de','pl'), true) ? (string)$_POST['lang'] : 'en';
        if ($term !== '') {
            $st = mp_db()->prepare("INSERT INTO kw_targets (site,term,lang,target_pos,landing,note,added_at)
                                    VALUES (:site,:t,:l,:p,:u,:n,:a)
                                    ON CONFLICT(site,term,lang) DO UPDATE SET target_pos=:p, landing=:u, note=:n");
            $st->execute(array(
                ':site'=>mp_current_site(),
                ':t'=>mb_substr($term, 0, 90), ':l'=>$lang,
                ':p'=>max(1, min(20, (int)($_POST['target_pos'] ?? 1))),
                ':u'=>mb_substr(trim((string)($_POST['landing'] ?? '')), 0, 160),
                ':n'=>mb_substr(trim((string)($_POST['note'] ?? '')), 0, 200),
                ':a'=>gmdate('c'),
            ));
            $flash = array('t'=>'ok', 'm'=>'Target added. Position is read from Search Console on the next refresh.');
        }
    }

    if ($act === 'kw_del') {
        mp_db()->prepare("DELETE FROM kw_targets WHERE id=:i AND site=:site")
               ->execute(array(':i'=>(int)($_POST['id'] ?? 0), ':site'=>mp_current_site()));
        $flash = array('t'=>'ok', 'm'=>'Target removed.');
    }

    if ($act === 'kw_seed') {
        /* The market this business actually competes in, in all three
           languages. Seeded rather than typed, so nothing is missed. */
        $seed = array(
            'en' => array('hospitals in hurghada', 'hurghada hospitals', 'hospital in hurghada',
                          'hospitals in sahl hasheesh', 'emergency hospital hurghada',
                          'doctor in hurghada', 'private hospital hurghada',
                          'hospital el gouna', 'hospital marsa alam', '24 hour hospital hurghada'),
            'de' => array('krankenhaus hurghada', 'krankenhaeuser hurghada', 'arzt hurghada',
                          'notfall hurghada', 'klinik hurghada', 'krankenhaus sahl hasheesh',
                          'deutscher arzt hurghada', 'zahnarzt hurghada'),
            'pl' => array('szpital hurghada', 'szpitale hurghada', 'lekarz hurghada',
                          'pogotowie hurghada', 'klinika hurghada', 'szpital sahl hasheesh',
                          'polski lekarz hurghada', 'dentysta hurghada'),
        );
        $landing = array('en'=>'/', 'de'=>'/de/', 'pl'=>'/pl/');
        $st = mp_db()->prepare("INSERT INTO kw_targets (site,term,lang,target_pos,landing,note,added_at)
                                VALUES (:site,:t,:l,1,:u,'seeded',:a)
                                ON CONFLICT(site,term,lang) DO NOTHING");
        $n = 0;
        foreach ($seed as $lg => $terms) {
            foreach ($terms as $term) {
                $st->execute(array(':site'=>mp_current_site(), ':t'=>$term, ':l'=>$lg,
                                   ':u'=>$landing[$lg], ':a'=>gmdate('c')));
                $n++;
            }
        }
        $flash = array('t'=>'ok', 'm'=>$n . ' target keywords loaded across English, German and Polish.');
    }

    /* ---- quick actions ---------------------------------------------------
       Each one is a thing a chief executive would actually press. Refresh is
       deliberately absent from their screen: the data collects itself, and if
       a chief executive ever has to fetch it the system is broken. */
    if ($act === 'schedule_report') {
        $on = mp_get('report_email_on') === '1' ? '0' : '1';
        mp_save_settings(array('report_email_on' => $on));
        $flash = $on === '1'
            ? array('t'=>'ok', 'm'=>'Scheduled. The report will arrive on the first of each month at ' . mp_get('staff_email') . '. Nobody needs to remember to send it.')
            : array('t'=>'ok', 'm'=>'Monthly report turned off.');
    }

    if ($act === 'toggle_alerts') {
        $on = mp_get('alerts_on') === '1' ? '0' : '1';
        mp_save_settings(array('alerts_on' => $on));
        $flash = $on === '1'
            ? array('t'=>'ok', 'm'=>'Alerts on. You will be emailed if a headline number falls more than ' . mp_get('alert_threshold', '25') . '% week on week.')
            : array('t'=>'ok', 'm'=>'Alerts turned off.');
    }

    /* ---- run the AI visibility checks -----------------------------------
       Only the engines with an API that searches the web can be driven this
       way. The rest stay a monthly human check and the page says which. */
    if ($act === 'ai_run') {
        $res = mp_ai_run_all(100);
        $flash = array('t' => $res['ok'] ? 'ok' : 'bad', 'm' => $res['msg']);
    }

    if ($act === 'ai_add') {
        $st = mp_db()->prepare("INSERT INTO ai_checks (site,checked_at,engine,prompt,mentioned,rank_position,cited_url,competitors,notes)
                                VALUES (:site,:t,:e,:p,:m,:r,:u,:c,:n)");
        $st->execute(array(
            ':site' => mp_current_site(),
            ':t' => (string)($_POST['checked_at'] ?: gmdate('Y-m-d')),
            ':e' => (string)($_POST['engine'] ?? 'ChatGPT'),
            ':p' => (string)($_POST['prompt'] ?? ''),
            ':m' => !empty($_POST['mentioned']) ? 1 : 0,
            ':r' => ($_POST['rank_position'] ?? '') !== '' ? (int)$_POST['rank_position'] : null,
            ':u' => (string)($_POST['cited_url'] ?? ''),
            ':c' => (string)($_POST['competitors'] ?? ''),
            ':n' => (string)($_POST['notes'] ?? ''),
        ));
        $flash = array('t'=>'ok', 'm'=>'Result recorded.');
    }
}
/* ---------- a POST that failed its token check ---------------------------
   Every form above sits behind `POST && mp_csrf_ok(...)` with, until now, no
   else. When the token had expired the whole block was skipped and the page
   reloaded looking identical: no save, no error, no clue. Clicking Save
   appeared to do nothing at all, on every form in the dashboard.

   A session expires if the tab is left open for a while, or the browser drops
   the cookie. That is normal, and it must say so. */
elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $flash = array('t' => 'bad',
        'm' => 'Nothing was saved: that form had been open long enough for its security token to expire. '
             . 'Reload this page and submit it again. Your entry was not recorded.');
}

$conn = mp_connectors_status();
$title = $PAGES[$page][0];
?>
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<meta name="color-scheme" content="light dark">
<title><?php echo e($title); ?> · MedPark Dashboard</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap">
<link rel="stylesheet" href="assets/dash.css?v=<?php echo e((string)@filemtime(__DIR__ . '/assets/dash.css')); ?>">
</head>
<body>
<div class="shell">

  <nav class="side" aria-label="Dashboard sections">
    <div class="side__brand">
      <span class="side__mark" aria-hidden="true">M</span>
      <span>
        <b><?php echo e(mp_get('brand_name')); ?></b>
        <span>Performance</span>
      </span>
    </div>
    <?php
      /* The property switcher. Hidden while there is only one, so a single-site
         install looks exactly as it did. The choice is kept in the session, so
         every link on the page keeps working without carrying the site in its
         query string. */
      $allSites = mp_sites();
      if (count($allSites) > 1):
        $curSite = mp_current_site();
    ?>
      <div class="side__sep">Property</div>
      <?php foreach ($allSites as $sk => $sv): ?>
        <a href="?p=<?php echo e($page); ?>&amp;r=<?php echo e($R['preset']); ?>&amp;site=<?php echo e($sk); ?>"
           class="<?php echo $sk === $curSite ? 'on' : ''; ?>"
           title="<?php echo e((string)$sv['site_url']); ?>">
          <?php echo ui_icon($sk === $curSite ? 'dot' : 'globe'); ?>
          <span><?php echo e((string)$sv['label']); ?></span>
        </a>
      <?php endforeach; ?>
    <?php endif; ?>

    <?php
      $groups = array();
      foreach ($PAGES as $key => $meta) { $groups[$meta[2]][$key] = $meta; }
      foreach ($groups as $groupName => $items): ?>
        <div class="side__sep"><?php echo e($groupName); ?></div>
        <?php foreach ($items as $k => $meta): ?>
          <a href="?p=<?php echo e($k); ?>&amp;r=<?php echo e($R['preset']); ?>"
             class="<?php echo $page === $k ? 'on' : ''; ?>"
             <?php echo $page === $k ? 'aria-current="page"' : ''; ?>>
            <?php echo ui_icon($meta[1]); ?><span><?php echo e($meta[0]); ?></span>
          </a>
        <?php endforeach; ?>
    <?php endforeach; ?>
    <div class="side__spacer"></div>
    <div class="side__sep">Session</div>
    <a href="logout.php"><?php echo ui_icon('logout'); ?><span>Sign out</span></a>
    <div class="side__foot">Last collection <?php
      $last = mp_q("SELECT MAX(ran_at) FROM runs WHERE site = :site")->fetchColumn();
      echo $last ? e(str_replace('T', ' ', substr((string)$last, 0, 16))) . ' UTC' : 'never';
    ?></div>
  </nav>

  <main class="main">
    <div class="top">
      <div>
        <h1><?php echo e($title); ?></h1>
        <p class="sub"><?php echo e($R['label']); ?>, <?php echo e($R['from']); ?> to <?php echo e($R['to']); ?>,
           against <?php echo e($R['prev_from']); ?> to <?php echo e($R['prev_to']); ?>.</p>
      </div>
      <div class="tools">
        <div class="seg" role="group" aria-label="Date range">
          <?php foreach (array('today'=>'Today','7d'=>'7d','28d'=>'28d','90d'=>'90d','365d'=>'12m') as $k=>$lab): ?>
            <a href="?p=<?php echo e($page); ?>&amp;r=<?php echo $k; ?>"
               class="<?php echo $R['preset'] === $k ? 'on' : ''; ?>"><?php echo e($lab); ?></a>
          <?php endforeach; ?>
        </div>
<?php /* CSV is an analyst's tool. It stays, but not on the executive screen. */ ?>
<?php if ($page !== 'ceo'): ?>
        <a class="btn" href="export.php?r=<?php echo e($R['preset']); ?>&amp;f=csv"><?php echo ui_icon('download', 14); ?>CSV</a>
        <a class="btn" href="export.php?r=<?php echo e($R['preset']); ?>&amp;f=report" target="_blank">Report</a>
<?php endif; ?>
<?php /* Refresh is hidden on the CEO summary. Data collects itself on a
           schedule, and asking a chief executive to fetch their own numbers is
           the clearest sign a dashboard was built for the wrong reader. It
           stays available on the working pages. */ ?>
<?php if ($page !== 'ceo'): ?>
        <form method="post" style="display:inline">
          <input type="hidden" name="csrf" value="<?php echo e(mp_csrf()); ?>">
          <input type="hidden" name="act" value="refresh">
          <button class="btn btn--pri" type="submit"><?php echo ui_icon('refresh', 14); ?>Refresh</button>
        </form>
<?php endif; ?>
      </div>
    </div>

    <?php if ($flash): ?>
      <div class="note note--<?php echo e($flash['t']); ?>" role="status"><?php echo e($flash['m']); ?></div>
    <?php endif; ?>

    <?php require __DIR__ . '/views/' . $page . '.php'; ?>
  </main>
</div>
</body>
</html>
