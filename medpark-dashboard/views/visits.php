<?php
/* ==========================================================================
   Visits, one at a time.

   Added 2026-09-03. Aggregates tell you a page loses people. A single visit
   tells you why: the order the pages were opened, how long each was read,
   where the scroll stopped, what was pressed, and what happened immediately
   before the person left or got in touch.

   Two modes in one file, because they are one idea: a list, and a visit.

   Nothing here identifies anybody. There is no address and no device
   identifier in the database at all. The visitor id is a salted hash that is
   regenerated every day, which is also why "other visits by this person" only
   ever reaches back to this morning. That is said on the page.
   ========================================================================== */

$f = $R['from']; $t = $R['to'];

$sid = isset($_GET['sid']) ? preg_replace('~[^a-f0-9]~', '', (string)$_GET['sid']) : '';

$mins = function (float $seconds): string {
    if ($seconds <= 0) return '--';
    if ($seconds < 60) return round($seconds) . 's';
    return floor($seconds / 60) . 'm ' . str_pad((string)round(fmod($seconds, 60)), 2, '0', STR_PAD_LEFT) . 's';
};
$pathLabel = function (string $p): string { return $p === '' ? '-' : ($p === '/' ? '/ (home)' : $p); };
$place = function (string $p): string {
    return $p === '' ? '' : ' · ' . mpa_placement_label($p);
};
$when = function (int $ts): string {
    $ago = max(0, time() - $ts);
    if ($ago < 90)     return $ago . 's ago';
    if ($ago < 5400)   return round($ago / 60) . 'm ago';
    if ($ago < 172800) return round($ago / 3600) . 'h ago';
    return round($ago / 86400) . 'd ago';
};

/* The current filter, and a helper that builds a link keeping everything else. */
$F = array();
foreach (mpa_visit_filter_cols() as $col) {
    if (isset($_GET['f_' . $col]) && $_GET['f_' . $col] !== '') {
        $F[$col] = substr(preg_replace('~[^A-Za-z0-9 _.\-]~', '', (string)$_GET['f_' . $col]) ?? '', 0, 60);
    }
}
if (!empty($_GET['conv']))  $F['converted'] = 1;
if (!empty($_GET['sort']))  $F['sort'] = (string)$_GET['sort'];
if (!empty($_GET['path']))  $F['path'] = substr((string)$_GET['path'], 0, 200);

$link = function (array $over = array()) use ($R, $F) {
    $q = array('p' => 'visits', 'r' => $R['preset']);
    foreach (mpa_visit_filter_cols() as $col) {
        if (!empty($F[$col])) $q['f_' . $col] = $F[$col];
    }
    if (!empty($F['converted'])) $q['conv'] = 1;
    if (!empty($F['sort']))      $q['sort'] = $F['sort'];
    if (!empty($F['path']))      $q['path'] = $F['path'];
    foreach ($over as $k => $v) {
        if ($v === null || $v === '') unset($q[$k]); else $q[$k] = $v;
    }
    return '?' . http_build_query($q);
};
?>

<?php if ($sid !== '' && ($V = mpa_session($sid))): /* ---------- one visit ---------- */ ?>

<p style="margin:0 0 12px">
  <a class="btn btn--sm" href="<?php echo e($link(array('sid' => null))); ?>">Back to all visits</a>
</p>

<div class="grid g4">
  <?php
    ui_kpi('Pages opened', mp_num($V['pageviews']), null,
           (int)$V['bounced'] === 1 ? 'Left from the page they arrived on' : 'Moved through the site', true);
    ui_kpi('Time reading', $mins((float)$V['engaged']), null, 'Only while the tab was in front');
    ui_kpi('Read as far as', (int)$V['max_scroll'] . '%', null, 'Deepest point of any page');
    ui_kpi('Got in touch', (int)$V['converted'] === 1 ? 'Yes' : 'No', null,
           (int)$V['converted'] === 1 ? 'Called, messaged, emailed or sent the form' : 'No contact made');
  ?>
</div>

<div class="card">
  <h3>Who this was <span class="hint">as much as is recorded, which is deliberately not much</span></h3>
  <div class="tw"><table><tbody>
    <?php
      $city = trim((string)$V['city'] . (($V['region'] !== '' && $V['city'] !== '') ? ', ' : '') . (string)$V['region']);
      $rows = array(
        'Arrived'       => str_replace('T', ' ', substr((string)$V['started_at'], 0, 16)) . ' UTC, ' . $when((int)$V['started_ts']),
        'Where'         => ((string)$V['country'] !== '' ? mpa_country_name((string)$V['country']) : 'Not recorded')
                           . ($city !== '' ? ' (' . $city . ')' : ''),
        'Reading in'    => (string)$V['lang'] !== '' ? mpa_lang_label((string)$V['lang']) : 'Not recorded',
        'Device'        => trim((string)$V['device'] . ' · ' . (string)$V['browser'] . ' · ' . (string)$V['os'], ' ·'),
        'Came from'     => mpa_channel_label((string)$V['ref_type'])
                           . ((string)$V['source'] !== '' ? ' · ' . (string)$V['source'] : '')
                           . ((string)$V['campaign'] !== '' ? ' · campaign ' . (string)$V['campaign'] : ''),
        'Landed on'     => $pathLabel((string)$V['entry_path']),
        'Left from'     => $pathLabel((string)$V['exit_path']),
        'First visit'   => (int)$V['is_new'] === 1 ? 'Yes' : 'No, seen before',
      );
      foreach ($rows as $k => $v) {
          echo '<tr><td class="muted" style="width:150px">' . e($k) . '</td>'
             . '<td><strong>' . e($v) . '</strong></td></tr>';
      }
    ?>
  </tbody></table></div>
</div>

<div class="card card--pad0">
  <h3>What happened, in order
      <span class="hint">time counted from the start of the visit</span></h3>
  <?php
    $tl = mpa_session_timeline($sid);
    if (!$tl) {
        ui_empty('Nothing recorded for this visit', 'The rows may have been pruned.', 'pulse');
    } else {
        $start = (int)$V['started_ts'];
        echo '<div class="tw"><table><thead><tr><th style="width:70px">At</th><th style="width:110px">What</th>'
           . '<th>Detail</th><th>Page</th><th class="n">Read</th><th class="n">Depth</th>'
           . '</tr></thead><tbody>';
        foreach ($tl as $r) {
            $off = max(0, (int)$r['ts'] - $start);
            $isPage = $r['kind'] === 'page';
            $what = $isPage
                ? 'Opened page ' . (int)$r['seq']
                : str_replace('_', ' ', (string)($r['name'] ?? 'event'));
            $detail = $isPage
                ? ((string)$r['label'] !== '' ? (string)$r['label'] : '-')
                : ((string)$r['label'] !== '' ? (string)$r['label'] : '-') . $place((string)$r['placement']);
            /* Contact events are the point of the whole system, so they are the
               one thing on this table allowed to shout. */
            $isContact = !$isPage && in_array((string)($r['name'] ?? ''), mpa_conversion_events(), true);
            echo '<tr' . ($isContact ? ' style="background:color-mix(in srgb, var(--c1) 9%, transparent)"' : '') . '>'
               . '<td class="muted nw">+' . e($off < 60 ? $off . 's' : floor($off / 60) . 'm' . str_pad((string)($off % 60), 2, '0', STR_PAD_LEFT)) . '</td>'
               . '<td>' . ($isPage ? '<span class="muted">' . e($what) . '</span>'
                                   : '<strong>' . e($what) . '</strong>') . '</td>'
               . '<td class="trunc" title="' . e($detail) . '">' . e($detail) . '</td>'
               . '<td class="trunc muted" title="' . e($r['path']) . '">' . e($pathLabel((string)$r['path'])) . '</td>'
               . '<td class="n muted">' . ($isPage ? e($mins((float)$r['engaged'])) : '') . '</td>'
               . '<td class="n muted">' . ($isPage && (int)$r['max_scroll'] > 0 ? (int)$r['max_scroll'] . '%' : '') . '</td>'
               . '</tr>';
        }
        echo '</tbody></table></div>';
    }
  ?>
</div>

<div class="card card--pad0">
  <h3>Other visits by the same person</h3>
  <?php
    $others = mpa_visitor_sessions((string)$V['vid'], $sid, 10);
    if (!$others) {
        ui_empty('No other visits found',
                 'By default the visitor id is a salted hash that is regenerated every day, so this '
               . 'can only ever find visits from the same day. It reaches further back only for '
               . 'visitors who have accepted the cookie.', 'users');
    } else {
        echo '<div class="tw"><table><thead><tr><th>When</th><th>Landed on</th>'
           . '<th class="n">Pages</th><th class="n">Read</th><th>Got in touch</th><th></th>'
           . '</tr></thead><tbody>';
        foreach ($others as $o) {
            echo '<tr><td class="muted">' . e($when((int)$o['started_ts'])) . '</td>'
               . '<td class="trunc">' . e($pathLabel((string)$o['entry_path'])) . '</td>'
               . '<td class="n">' . e(mp_num($o['pageviews'])) . '</td>'
               . '<td class="n muted">' . e($mins((float)$o['engaged'])) . '</td>'
               . '<td>' . ((int)$o['converted'] === 1 ? '<span class="pill pill--ok">Yes</span>' : '<span class="muted">No</span>') . '</td>'
               . '<td class="n"><a class="btn btn--sm" href="' . e($link(array('sid' => (string)$o['sid']))) . '">Open</a></td></tr>';
        }
        echo '</tbody></table></div>';
    }
  ?>
</div>

<?php else: /* ---------- the list ---------- */ ?>

<?php
$total = mpa_sessions_count($f, $t, $F);
$per   = 40;
$page  = max(1, (int)($_GET['pg'] ?? 1));
$rows  = mpa_sessions_list($f, $t, array_merge($F, array('limit' => $per, 'offset' => ($page - 1) * $per)));
?>

<div class="card">
  <h3>Filter <span class="hint">only values that actually occurred are offered</span></h3>
  <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:flex-start;padding:2px 0">
    <?php
      $group = function (string $label, string $col, callable $fmt = null) use ($f, $t, $F, $link) {
          $vals = mpa_visit_filter_values($col, $f, $t, 8);
          if (!$vals) return;
          echo '<div style="min-width:150px"><div style="font-size:10.5px;text-transform:uppercase;'
             . 'letter-spacing:.08em;color:var(--ink-3);font-weight:700;margin-bottom:6px">' . e($label) . '</div>'
             . '<div style="display:flex;flex-wrap:wrap;gap:5px">';
          $on = isset($F[$col]) ? (string)$F[$col] : '';
          echo '<a class="pill ' . ($on === '' ? 'pill--info' : 'pill--idle') . '" style="text-decoration:none" '
             . 'href="' . e($link(array('f_' . $col => null, 'pg' => null))) . '">Any</a>';
          foreach ($vals as $v) {
              $raw = (string)$v['dim'];
              $lab = $fmt ? $fmt($raw) : $raw;
              $sel = $on === $raw;
              echo '<a class="pill ' . ($sel ? 'pill--info' : 'pill--idle') . '" style="text-decoration:none" '
                 . 'title="' . e(mp_num($v['v']) . ' visits') . '" '
                 . 'href="' . e($link(array('f_' . $col => $sel ? null : $raw, 'pg' => null))) . '">' . e($lab) . '</a>';
          }
          echo '</div></div>';
      };
      $group('Country', 'country', function ($c) { return mpa_country_name($c); });
      $group('Device', 'device');
      $group('Channel', 'ref_type', function ($c) { return ucfirst($c); });
      $group('Language', 'lang', function ($c) { return mpa_lang_label($c); });
    ?>
    <div style="min-width:150px">
      <div style="font-size:10.5px;text-transform:uppercase;letter-spacing:.08em;color:var(--ink-3);font-weight:700;margin-bottom:6px">Show</div>
      <div style="display:flex;flex-wrap:wrap;gap:5px">
        <a class="pill <?php echo empty($F['converted']) ? 'pill--info' : 'pill--idle'; ?>" style="text-decoration:none"
           href="<?php echo e($link(array('conv' => null, 'pg' => null))); ?>">All visits</a>
        <a class="pill <?php echo !empty($F['converted']) ? 'pill--info' : 'pill--idle'; ?>" style="text-decoration:none"
           href="<?php echo e($link(array('conv' => 1, 'pg' => null))); ?>">Only enquiries</a>
      </div>
      <div style="font-size:10.5px;text-transform:uppercase;letter-spacing:.08em;color:var(--ink-3);font-weight:700;margin:10px 0 6px">Order</div>
      <div style="display:flex;flex-wrap:wrap;gap:5px">
        <?php foreach (array('' => 'Newest', 'longest' => 'Longest read', 'deepest' => 'Most pages') as $k => $lab): ?>
          <a class="pill <?php echo (string)($F['sort'] ?? '') === $k ? 'pill--info' : 'pill--idle'; ?>"
             style="text-decoration:none"
             href="<?php echo e($link(array('sort' => $k === '' ? null : $k, 'pg' => null))); ?>"><?php echo e($lab); ?></a>
        <?php endforeach; ?>
      </div>
    </div>
  </div>
  <?php if (!empty($F['path'])): ?>
    <p style="margin:10px 0 0">
      <span class="pill pill--info">Visits that opened <?php echo e($F['path']); ?></span>
      <a class="btn btn--sm" href="<?php echo e($link(array('path' => null, 'pg' => null))); ?>">Clear</a>
    </p>
  <?php endif; ?>
</div>

<div class="card card--pad0">
  <h3><?php echo e(mp_num($total)); ?> <?php echo $total === 1 ? 'visit' : 'visits'; ?>
      <span class="hint">newest first, open one to see everything that happened in it</span></h3>
  <?php
    if (!$rows) {
        ui_empty('No visits match',
                 $total === 0 && !$F
                   ? 'Nothing has been collected for these dates yet.'
                   : 'Clear a filter, or widen the date range at the top of the page.', 'users');
    } else {
        echo '<div class="tw"><table><thead><tr><th>When</th><th>Where</th><th>Device</th>'
           . '<th>Came from</th><th>Landed on</th><th class="n">Pages</th><th class="n">Read</th>'
           . '<th class="n">Depth</th><th>Enquiry</th><th></th></tr></thead><tbody>';
        foreach ($rows as $r) {
            $where = (string)$r['country'] !== '' ? mpa_country_name((string)$r['country']) : '-';
            if ((string)$r['city'] !== '') $where .= ' · ' . (string)$r['city'];
            echo '<tr>'
               . '<td class="muted nw">' . e($when((int)$r['started_ts'])) . '</td>'
               . '<td class="trunc" title="' . e($where) . '">' . e($where) . '</td>'
               . '<td class="muted">' . e((string)$r['device']) . '</td>'
               . '<td class="trunc muted" title="' . e((string)$r['ref_type'] . ' ' . (string)$r['source']) . '">'
               . e((string)$r['source'] !== '' ? (string)$r['source'] : mpa_channel_label((string)$r['ref_type'])) . '</td>'
               . '<td class="trunc" title="' . e((string)$r['entry_path']) . '">'
               . e($pathLabel((string)$r['entry_path'])) . '</td>'
               . '<td class="n">' . e(mp_num($r['pageviews'])) . '</td>'
               . '<td class="n muted nw">' . e($mins((float)$r['engaged'])) . '</td>'
               . '<td class="n muted nw">' . (int)$r['max_scroll'] . '%</td>'
               . '<td>' . ((int)$r['converted'] === 1
                   ? '<span class="pill pill--ok">Yes</span>'
                   : ((int)$r['bounced'] === 1 ? '<span class="muted">Bounced</span>' : '<span class="muted">No</span>')) . '</td>'
               . '<td class="n"><a class="btn btn--sm" href="' . e($link(array('sid' => (string)$r['sid']))) . '">Open</a></td>'
               . '</tr>';
        }
        echo '</tbody></table></div>';

        $pages = (int)ceil($total / $per);
        if ($pages > 1) {
            echo '<div style="display:flex;gap:8px;align-items:center;padding:12px 15px;border-top:1px solid var(--line-2)">';
            if ($page > 1) {
                echo '<a class="btn btn--sm" href="' . e($link(array('pg' => $page - 1))) . '">Newer</a>';
            }
            echo '<span class="muted" style="font-size:12.5px">Page ' . $page . ' of ' . $pages . '</span>';
            if ($page < $pages) {
                echo '<a class="btn btn--sm" href="' . e($link(array('pg' => $page + 1))) . '">Older</a>';
            }
            echo '</div>';
        }
    }
  ?>
</div>

<p class="muted" style="font-size:12.5px;margin-top:14px;max-width:80ch">
  There is no address, no name and no device identifier in any of this. A visit is grouped by a
  salted hash that is regenerated every day, so the same person is a different row tomorrow unless
  they have accepted the cookie. That is the whole reason this can be shown at all.
</p>

<?php endif; ?>
