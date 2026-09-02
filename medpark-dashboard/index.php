<?php
/* ==========================================================================
   MedPark dashboard, front controller.
   ========================================================================== */
declare(strict_types=1);

require __DIR__ . '/lib/bootstrap.php';
require __DIR__ . '/lib/connectors.php';
require __DIR__ . '/lib/insights.php';
require __DIR__ . '/lib/ui.php';

if (!mp_is_configured()) { header('Location: login.php'); exit; }
mp_require_login();

$page  = isset($_GET['p']) ? preg_replace('~[^a-z_]~', '', (string)$_GET['p']) : 'overview';
$rangeKey = isset($_GET['r']) ? (string)$_GET['r'] : '28d';
$R = mp_range($rangeKey);

$PAGES = array(
    'overview'    => 'Overview',
    'traffic'     => 'Audience and traffic',
    'conversions' => 'Enquiries',
    'seo'         => 'Search',
    'local'       => 'Maps and local',
    'ai'          => 'AI visibility',
    'health'      => 'Site health and speed',
    'issues'      => 'Issues and advice',
    'settings'    => 'Settings and access',
);
if (!isset($PAGES[$page])) $page = 'overview';

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
                      'ai_brand_terms','ai_competitors');
        $patch = array();
        foreach ($keys as $k) { if (isset($_POST[$k])) $patch[$k] = trim((string)$_POST[$k]); }
        if (!empty($_POST['new_password'])) {
            $patch['admin_hash'] = password_hash((string)$_POST['new_password'], PASSWORD_DEFAULT);
        }
        $flash = mp_save_settings($patch)
            ? array('t'=>'ok', 'm'=>'Saved. Use Refresh data to pull with the new credentials.')
            : array('t'=>'bad', 'm'=>'Could not write the settings file. Check permissions on ' . MP_DATA_DIR . '.');
    }

    if ($act === 'ai_add') {
        $st = mp_db()->prepare("INSERT INTO ai_checks (checked_at,engine,prompt,mentioned,rank_position,cited_url,competitors,notes)
                                VALUES (:t,:e,:p,:m,:r,:u,:c,:n)");
        $st->execute(array(
            ':t' => (string)($_POST['checked_at'] ?: gmdate('Y-m-d')),
            ':e' => (string)($_POST['engine'] ?? 'ChatGPT'),
            ':p' => (string)($_POST['prompt'] ?? ''),
            ':m' => !empty($_POST['mentioned']) ? 1 : 0,
            ':r' => $_POST['rank_position'] !== '' ? (int)$_POST['rank_position'] : null,
            ':u' => (string)($_POST['cited_url'] ?? ''),
            ':c' => (string)($_POST['competitors'] ?? ''),
            ':n' => (string)($_POST['notes'] ?? ''),
        ));
        $flash = array('t'=>'ok', 'm'=>'Result recorded.');
    }
}

$conn = mp_connectors_status();
$title = $PAGES[$page];
?>
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title><?php echo e($title); ?> · MedPark Dashboard</title>
<link rel="stylesheet" href="assets/dash.css?v=<?php echo MP_VERSION; ?>">
</head>
<body>
<div class="shell">

  <nav class="side">
    <div class="side__brand">
      <b><?php echo e(mp_get('brand_name')); ?></b>
      <span>Performance dashboard</span>
    </div>
    <?php
      $groups = array(
        'Report'   => array('overview','conversions','traffic'),
        'Channels' => array('seo','local','ai'),
        'Technical'=> array('health','issues'),
        ''         => array('settings'),
      );
      foreach ($groups as $label => $items):
        if ($label !== '') echo '<div class="side__sep">' . e($label) . '</div>';
        foreach ($items as $k): ?>
          <a href="?p=<?php echo $k; ?>&amp;r=<?php echo e($R['preset']); ?>"
             class="<?php echo $page === $k ? 'on' : ''; ?>"><?php echo e($PAGES[$k]); ?></a>
    <?php endforeach; endforeach; ?>
    <div class="side__sep">Session</div>
    <a href="logout.php">Sign out</a>
  </nav>

  <main class="main">
    <div class="top">
      <div>
        <h1><?php echo e($title); ?></h1>
        <p><?php echo e($R['label']); ?>, <?php echo e($R['from']); ?> to <?php echo e($R['to']); ?>.
           Compared against <?php echo e($R['prev_from']); ?> to <?php echo e($R['prev_to']); ?>.</p>
      </div>
      <div class="tools">
        <div class="seg">
          <?php foreach (array('7d'=>'7 days','28d'=>'28 days','90d'=>'90 days','365d'=>'12 months') as $k=>$lab): ?>
            <a href="?p=<?php echo e($page); ?>&amp;r=<?php echo $k; ?>"
               class="<?php echo $R['preset'] === $k ? 'on' : ''; ?>"><?php echo e($lab); ?></a>
          <?php endforeach; ?>
        </div>
        <a class="btn" href="export.php?r=<?php echo e($R['preset']); ?>&amp;f=csv">Export CSV</a>
        <a class="btn" href="export.php?r=<?php echo e($R['preset']); ?>&amp;f=report" target="_blank">Monthly report</a>
        <form method="post" style="display:inline">
          <input type="hidden" name="csrf" value="<?php echo e(mp_csrf()); ?>">
          <input type="hidden" name="act" value="refresh">
          <button class="btn btn--pri" type="submit">Refresh data</button>
        </form>
      </div>
    </div>

    <?php if ($flash): ?>
      <div class="note note--<?php echo e($flash['t']); ?>"><?php echo e($flash['m']); ?></div>
    <?php endif; ?>

    <?php require __DIR__ . '/views/' . $page . '.php'; ?>
  </main>
</div>
</body>
</html>
