<?php
/* Keywords and rank targets.

   Two different questions, kept separate on purpose:

   1. What are we DELIBERATELY trying to rank for, and how far off are we?
      That is the target table, and it is the one to read first.
   2. What do we happen to rank for, and what is close enough to push?
      That comes out of Search Console.

   There is no search volume column anywhere on this page. Volume and
   difficulty are modelled numbers that only a paid tool sells. Rather than
   dress a guess as data, this page shows what is real: positions and
   impressions for your own site, and the queries Google itself suggests. */

$f = $R['from']; $t = $R['to']; $pf = $R['prev_from']; $pt = $R['prev_to'];
$hasGSC = mp_has_data('gsc');

function kw_all(string $sql, array $a = array()): array {
    try { $st = mp_db()->prepare($sql); $st->execute($a); return $st->fetchAll(); }
    catch (Throwable $e) { return array(); }
}

/* ---------- rank targets --------------------------------------------------- */
$tLang = isset($_GET['tl']) && in_array($_GET['tl'], array('all','en','de','pl'), true) ? (string)$_GET['tl'] : 'all';
$where = $tLang === 'all' ? '' : ' WHERE lang = :l';
$targets = kw_all("SELECT * FROM kw_targets$where ORDER BY lang, term",
                  $tLang === 'all' ? array() : array(':l'=>$tLang));

/* Current and previous position for a term, straight from Search Console. */
function kw_pos(string $term, string $from, string $to): ?float {
    $st = mp_db()->prepare("SELECT AVG(value) FROM metrics
                            WHERE source='gsc' AND metric='clicks_query_pos'
                            AND LOWER(dim) = :t AND day BETWEEN :a AND :b");
    $st->execute(array(':t'=>mb_strtolower($term), ':a'=>$from, ':b'=>$to));
    $v = $st->fetchColumn();
    return ($v === false || $v === null) ? null : (float)$v;
}
function kw_impr(string $term, string $from, string $to): float {
    $st = mp_db()->prepare("SELECT COALESCE(SUM(value),0) FROM metrics
                            WHERE source='gsc' AND metric='clicks_query_impr'
                            AND LOWER(dim) = :t AND day BETWEEN :a AND :b");
    $st->execute(array(':t'=>mb_strtolower($term), ':a'=>$from, ':b'=>$to));
    return (float)$st->fetchColumn();
}

$atTarget = 0; $ranking = 0; $notSeen = 0;
foreach ($targets as $tg) {
    $p = kw_pos((string)$tg['term'], $f, $t);
    if ($p === null) { $notSeen++; continue; }
    $ranking++;
    if ($p <= (float)$tg['target_pos']) $atTarget++;
}
$totalTargets = count($targets);
?>

<div class="grid g4">
  <?php
    ui_kpi('Target keywords', mp_num($totalTargets), null,
           $totalTargets ? 'Across three languages' : 'None set yet', true);
    ui_kpi('At target position', $totalTargets ? mp_num($atTarget) . ' of ' . mp_num($totalTargets) : '--', null, 'Hit the goal');
    ui_kpi('Ranking somewhere', $totalTargets ? mp_num($ranking) : '--', null, 'Has at least one impression');
    ui_kpi('Not yet visible', $totalTargets ? mp_num($notSeen) : '--', null, 'No impressions recorded');
  ?>
</div>

<div class="card card--pad0">
  <h3>
    Rank targets
    <span class="hint">The keywords you have decided to win, and how far off you are</span>
  </h3>

  <div style="padding:12px 15px;border-bottom:1px solid var(--line-2);display:flex;gap:8px;flex-wrap:wrap;align-items:center">
    <div class="seg">
      <?php foreach (array('all'=>'All','en'=>'English','de'=>'German','pl'=>'Polish') as $lk=>$lab): ?>
        <a href="?p=keywords&amp;r=<?php echo e($R['preset']); ?>&amp;tl=<?php echo e($lk); ?>"
           class="<?php echo $tLang === $lk ? 'on' : ''; ?>"><?php echo e($lab); ?></a>
      <?php endforeach; ?>
    </div>
    <?php if (!$targets && $tLang === 'all'): ?>
      <form method="post" style="display:inline">
        <input type="hidden" name="csrf" value="<?php echo e(mp_csrf()); ?>">
        <input type="hidden" name="act" value="kw_seed">
        <button class="btn btn--pri" type="submit">Load the Hurghada target set</button>
      </form>
    <?php endif; ?>
  </div>

  <?php if (!$targets): ?>
    <?php ui_empty('No target keywords yet',
      'Press the button above to load the Hurghada and Red Sea set in English, German and Polish, including "hospitals in hurghada" and "hurghada hospitals". You can add or remove any of them afterwards.', 'target'); ?>
  <?php else: ?>
    <div class="tw">
      <table style="min-width:820px">
        <thead>
          <tr>
            <th>Keyword</th><th>Lang</th>
            <th class="n">Now</th><th class="n">Before</th><th class="n">Change</th>
            <th class="n">Impressions</th>
            <th style="width:150px">Distance to target</th>
            <th class="n">Target</th><th></th>
          </tr>
        </thead>
        <tbody>
        <?php foreach ($targets as $tg):
          $term = (string)$tg['term'];
          $goal = (float)$tg['target_pos'];
          $now  = kw_pos($term, $f, $t);
          $prev = kw_pos($term, $pf, $pt);
          $impr = kw_impr($term, $f, $t);

          /* Position improves as the number falls, so the comparison is inverted. */
          $d = ($now !== null && $prev !== null) ? mp_delta($prev, $now) : array('pct'=>null, 'dir'=>'flat');

          if ($now === null)        { $bar = 0;   $cls = 'pill--idle'; $state = 'not visible'; }
          elseif ($now <= $goal)    { $bar = 100; $cls = 'pill--ok';   $state = 'at target'; }
          else {
            /* How far along the road from position 30 to the goal. */
            $bar = max(4, min(96, round((1 - (($now - $goal) / max(1, 30 - $goal))) * 100)));
            $cls = $now <= 10 ? 'pill--wait' : 'pill--off';
            $state = $now <= 10 ? 'page one' : 'page ' . (int)ceil($now / 10);
          }
        ?>
          <tr>
            <td><strong><?php echo e($term); ?></strong>
              <?php if ((string)$tg['landing'] !== ''): ?>
                <span style="color:var(--ink-3);font-size:11.5px"> &rarr; <?php echo e((string)$tg['landing']); ?></span>
              <?php endif; ?>
            </td>
            <td><span class="tag"><?php echo e(strtoupper((string)$tg['lang'])); ?></span></td>
            <td class="n">
              <?php echo $now !== null
                ? '<span class="pill ' . $cls . '">' . number_format($now, 1) . '</span>'
                : '<span class="pill pill--idle">-</span>'; ?>
            </td>
            <td class="n" style="color:var(--ink-3)"><?php echo $prev !== null ? number_format($prev, 1) : '-'; ?></td>
            <td class="n">
              <?php if ($d['pct'] !== null): ?>
                <span class="<?php echo e($d['dir']); ?>" style="font-weight:700">
                  <?php echo $d['dir'] === 'up' ? '&#9650;' : ($d['dir'] === 'down' ? '&#9660;' : '&#9679;'); ?>
                  <?php echo e(number_format(abs($d['pct']), 1)); ?>%
                </span>
              <?php else: ?><span style="color:var(--ink-3)">-</span><?php endif; ?>
            </td>
            <td class="n"><?php echo $impr > 0 ? mp_num($impr) : '<span style="color:var(--ink-3)">0</span>'; ?></td>
            <td>
              <span class="bar" style="min-width:90px"><i style="width:<?php echo (int)$bar; ?>%"></i></span>
              <div style="font-size:11px;color:var(--ink-3);margin-top:3px"><?php echo e($state); ?></div>
            </td>
            <td class="n"><?php echo (int)$goal; ?></td>
            <td class="n">
              <form method="post" style="display:inline">
                <input type="hidden" name="csrf" value="<?php echo e(mp_csrf()); ?>">
                <input type="hidden" name="act" value="kw_del">
                <input type="hidden" name="id" value="<?php echo (int)$tg['id']; ?>">
                <button class="btn btn--sm" type="submit" title="Remove this target">&times;</button>
              </form>
            </td>
          </tr>
        <?php endforeach; ?>
        </tbody>
      </table>
    </div>
    <?php if (!$hasGSC): ?>
      <p class="card__note"><b>Positions are blank because Search Console is not connected.</b>
        The targets are recorded and will start filling in from the first pull after access is granted.
        Nothing is lost in the meantime.</p>
    <?php else: ?>
      <p class="card__note">Position is the average over the selected period, from Search Console.
        A keyword with impressions but no clicks is ranking too low to be chosen, which is a titles
        problem. A keyword with no impressions at all is not ranking, which is a content problem.</p>
    <?php endif; ?>
  <?php endif; ?>
</div>

<div class="card">
  <h3>Add a target</h3>
  <form method="post">
    <input type="hidden" name="csrf" value="<?php echo e(mp_csrf()); ?>">
    <input type="hidden" name="act" value="kw_add">
    <div class="grid g4" style="margin-bottom:0">
      <div class="field" style="margin-bottom:0">
        <label>Keyword</label>
        <input type="text" name="term" placeholder="hospitals in hurghada" required>
      </div>
      <div class="field" style="margin-bottom:0">
        <label>Language</label>
        <select name="lang">
          <option value="en">English</option>
          <option value="de">German</option>
          <option value="pl">Polish</option>
        </select>
      </div>
      <div class="field" style="margin-bottom:0">
        <label>Target position</label>
        <input type="text" name="target_pos" value="1">
      </div>
      <div class="field" style="margin-bottom:0">
        <label>Page that should rank</label>
        <input type="text" name="landing" placeholder="/">
      </div>
    </div>
    <button class="btn btn--pri" type="submit" style="margin-top:13px">Add target</button>
  </form>
</div>

<?php if ($hasGSC): ?>
<div class="grid g-2-1">
  <div class="card card--pad0">
    <h3>Closest to page one <span class="hint">Position 4 to 20, ordered by demand</span></h3>
    <?php
      $near = kw_all(
        "SELECT q.dim dim, AVG(p.value) pos, SUM(i.value) impr, SUM(q.value) clicks
         FROM metrics q
         JOIN metrics p ON p.day=q.day AND p.dim=q.dim AND p.source='gsc' AND p.metric='clicks_query_pos'
         JOIN metrics i ON i.day=q.day AND i.dim=q.dim AND i.source='gsc' AND i.metric='clicks_query_impr'
         WHERE q.source='gsc' AND q.metric='clicks_query' AND q.day BETWEEN :a AND :b
         GROUP BY q.dim HAVING pos BETWEEN 4 AND 20 AND impr >= 10
         ORDER BY impr DESC LIMIT 25", array(':a'=>$f, ':b'=>$t));
      if (!$near) { ui_empty('Nothing in this band yet', 'Either there is not enough data, or everything is already on page one.', 'search'); }
      else {
        echo '<div class="tw"><table><thead><tr><th class="rank"></th><th>Query</th><th class="n">Position</th><th class="n">Impressions</th><th class="n">Clicks</th><th></th></tr></thead><tbody>';
        foreach ($near as $i => $n) {
          $pos = (float)$n['pos'];
          $cls = $pos <= 6 ? 'pill--ok' : ($pos <= 12 ? 'pill--wait' : 'pill--idle');
          echo '<tr><td class="rank">' . ($i + 1) . '</td>'
             . '<td class="trunc" title="' . e($n['dim']) . '">' . e($n['dim']) . '</td>'
             . '<td class="n"><span class="pill ' . $cls . '">' . number_format($pos, 1) . '</span></td>'
             . '<td class="n">' . mp_num($n['impr']) . '</td>'
             . '<td class="n"><strong>' . mp_num($n['clicks']) . '</strong></td>'
             . '<td style="color:var(--ink-3);font-size:11.5px;white-space:nowrap">'
             . ($pos <= 6 ? 'one push' : ($pos <= 12 ? 'reachable' : 'needs work')) . '</td></tr>';
        }
        echo '</tbody></table></div>';
      }
    ?>
    <p class="card__note">The cheapest gains available. A keyword at position 6 moving to 3 roughly
       doubles its clicks. Strengthen the page that already ranks rather than writing a new one.</p>
  </div>

  <div class="card">
    <h3>Where you sit</h3>
    <?php
      $posRows = kw_all("SELECT dim, AVG(value) pos FROM metrics WHERE source='gsc' AND metric='clicks_query_pos'
                         AND day BETWEEN :a AND :b GROUP BY dim", array(':a'=>$f, ':b'=>$t));
      $t3 = 0; $t10 = 0; $p2 = 0; $rest = 0;
      foreach ($posRows as $r) {
        $p = (float)$r['pos'];
        if ($p <= 3) $t3++; elseif ($p <= 10) $t10++; elseif ($p <= 20) $p2++; else $rest++;
      }
      ui_donut(array(
        array('dim'=>'Top 3',          'v'=>$t3),
        array('dim'=>'Position 4-10',  'v'=>$t10),
        array('dim'=>'Page 2',         'v'=>$p2),
        array('dim'=>'Beyond page 2',  'v'=>$rest),
      ));
    ?>
  </div>
</div>

<div class="grid g2">
  <div class="card card--pad0">
    <h3>Best performing queries</h3>
    <?php ui_top_table(mp_top('gsc','clicks_query',$f,$t,12), 'Query', 'Clicks', null, 12); ?>
  </div>
  <div class="card card--pad0">
    <h3>Seen a lot, clicked rarely <span class="hint">A titles problem, not a ranking one</span></h3>
    <?php
      $lowCtr = kw_all(
        "SELECT i.dim dim, SUM(i.value) v FROM metrics i
         JOIN metrics c ON c.day=i.day AND c.dim=i.dim AND c.source='gsc' AND c.metric='clicks_query'
         WHERE i.source='gsc' AND i.metric='clicks_query_impr' AND i.day BETWEEN :a AND :b
         GROUP BY i.dim HAVING v >= 50 AND (SUM(c.value) * 1.0 / SUM(i.value)) < 0.02
         ORDER BY v DESC LIMIT 12", array(':a'=>$f, ':b'=>$t));
      ui_top_table($lowCtr, 'Query', 'Impressions', null, 12);
    ?>
    <p class="card__note">Google shows you and people choose someone else. Fixed in the title and
       description, which is the cheapest change in search.</p>
  </div>
</div>
<?php else: ?>
<div class="card"><?php ui_not_connected($conn, 'gsc'); ?></div>
<?php endif; ?>

<?php
  $iLang = isset($_GET['kl']) && in_array($_GET['kl'], array('en','de','pl'), true) ? (string)$_GET['kl'] : 'en';
  $ideas = kw_all("SELECT term, seed FROM keywords WHERE lang = :l ORDER BY seed, term LIMIT 400", array(':l'=>$iLang));
?>
<div class="card card--pad0">
  <h3>What people actually type <span class="hint">Google suggest, free, no subscription</span></h3>
  <div style="padding:12px 15px;border-bottom:1px solid var(--line-2)">
    <div class="seg">
      <?php foreach (array('en'=>'English','de'=>'German','pl'=>'Polish') as $lk=>$lab): ?>
        <a href="?p=keywords&amp;r=<?php echo e($R['preset']); ?>&amp;tl=<?php echo e($tLang); ?>&amp;kl=<?php echo e($lk); ?>"
           class="<?php echo $iLang === $lk ? 'on' : ''; ?>"><?php echo e($lab); ?></a>
      <?php endforeach; ?>
    </div>
  </div>
  <?php if (!$ideas): ?>
    <?php ui_empty('No keyword ideas collected yet',
      'Press Refresh. This pulls live suggestions from Google for each seed phrase in all three languages. It needs no key and costs nothing.', 'sparkles'); ?>
  <?php else:
    $bySeed = array();
    foreach ($ideas as $r) { $bySeed[(string)$r['seed']][] = (string)$r['term']; }
    $ranking = array();
    foreach (kw_all("SELECT DISTINCT dim FROM metrics WHERE source='gsc' AND metric='clicks_query'") as $r) {
      $ranking[mb_strtolower((string)$r['dim'])] = true;
    }
    $targeted = array();
    foreach (kw_all("SELECT term FROM kw_targets") as $r) { $targeted[mb_strtolower((string)$r['term'])] = true; }
  ?>
    <div style="padding:14px 15px;display:flex;flex-direction:column;gap:15px">
      <?php foreach ($bySeed as $seed => $terms): ?>
        <div>
          <div style="font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:var(--ink-3);font-weight:700;margin-bottom:7px">
            <?php echo e($seed); ?>
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:6px">
            <?php foreach ($terms as $term):
              $lk = mb_strtolower($term);
              $isT = isset($targeted[$lk]); $have = isset($ranking[$lk]);
              $cls = $isT ? 'pill--info' : ($have ? 'pill--ok' : 'pill--idle');
              $why = $isT ? 'Already a target' : ($have ? 'You appear for this' : 'Real demand, not visible yet');
            ?>
              <span class="pill <?php echo $cls; ?>" title="<?php echo e($why); ?>"><?php echo e($term); ?></span>
            <?php endforeach; ?>
          </div>
        </div>
      <?php endforeach; ?>
    </div>
    <p class="card__note">Blue is already a rank target. Green means Search Console has recorded
       impressions. Grey is real demand you are not visible for, and the grey German and Polish ones
       are the shortlist worth writing for next.</p>
  <?php endif; ?>
</div>

<div class="card card--pad0">
  <h3>Competitors <span class="hint">What can be measured without a paid tool</span></h3>
  <?php
    $day = mp_db()->query("SELECT MAX(day) FROM metrics WHERE source='competitor'")->fetchColumn();
    $sites = $day ? kw_all("SELECT DISTINCT dim FROM metrics WHERE source='competitor' AND day = :d", array(':d'=>$day)) : array();
    if (!$sites) {
      ui_empty('No competitor checks yet',
        'Add competitor domains in Settings, then press Refresh. This compares speed, technical setup and whether they serve German, which is a real competitive picture for a local market and costs nothing.', 'search');
    } else {
      $g = function ($site, $metric) use ($day) {
        $q = mp_db()->prepare("SELECT value FROM metrics WHERE source='competitor' AND metric=:m AND dim=:d AND day=:y");
        $q->execute(array(':m'=>$metric, ':d'=>$site, ':y'=>$day));
        $v = $q->fetchColumn(); return $v === false ? null : (float)$v;
      };
      $yn = function ($v) { return $v === null ? '<span class="pill pill--idle">?</span>'
          : ($v >= 1 ? '<span class="pill pill--ok">Yes</span>' : '<span class="pill pill--off">No</span>'); };

      $ownDay = mp_db()->query("SELECT MAX(day) FROM metrics WHERE source='health'")->fetchColumn();
      $own = function ($metric) use ($ownDay) {
        if (!$ownDay) return null;
        $q = mp_db()->prepare("SELECT value FROM metrics WHERE source='health' AND metric=:m AND dim='/' AND day=:y");
        $q->execute(array(':m'=>$metric, ':y'=>$ownDay));
        $v = $q->fetchColumn(); return $v === false ? null : (float)$v;
      };

      echo '<div class="tw"><table><thead><tr><th>Site</th><th class="n">Status</th><th class="n">Server response</th><th class="n">Page size</th><th>Schema</th><th>German</th><th>WhatsApp</th></tr></thead><tbody>';
      echo '<tr style="background:var(--a-w)"><td><strong>' . e(preg_replace('~^https?://~','',mp_get('site_url'))) . '</strong> <span class="tag">you</span></td>'
         . '<td class="n"><span class="pill pill--ok">200</span></td>'
         . '<td class="n">' . ($own('page_ttfb_ms') !== null ? round($own('page_ttfb_ms')) . ' ms' : '-') . '</td>'
         . '<td class="n">' . ($own('page_bytes') !== null ? mp_num($own('page_bytes') / 1024) . ' KB' : '-') . '</td>'
         . '<td>' . $yn($own('has_schema')) . '</td><td>' . $yn($own('has_hreflang')) . '</td><td><span class="pill pill--ok">Yes</span></td></tr>';
      foreach ($sites as $srow) {
        $site = (string)$srow['dim'];
        $code = (int)($g($site, 'status') ?? 0);
        echo '<tr><td>' . e($site) . '</td>'
           . '<td class="n">' . ($code >= 200 && $code < 400 ? '<span class="pill pill--ok">' . $code . '</span>' : '<span class="pill pill--off">' . ($code ?: 'down') . '</span>') . '</td>'
           . '<td class="n">' . ($g($site, 'ttfb_ms') !== null ? round($g($site, 'ttfb_ms')) . ' ms' : '-') . '</td>'
           . '<td class="n">' . ($g($site, 'bytes') !== null ? mp_num($g($site, 'bytes') / 1024) . ' KB' : '-') . '</td>'
           . '<td>' . $yn($g($site, 'has_schema')) . '</td>'
           . '<td>' . $yn($g($site, 'has_german')) . '</td>'
           . '<td>' . $yn($g($site, 'has_whatsapp')) . '</td></tr>';
      }
      echo '</tbody></table></div>';
    }
  ?>
  <p class="card__note">This does not show their traffic or their rankings. Nobody can without a paid
     tool, and any figure claiming otherwise is modelled. What it does show is whether they are faster
     than you, whether they serve German, and whether they have structured data. In this market those
     three decide a lot.</p>
</div>
