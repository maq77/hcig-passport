<?php
/* Site health and speed. This page needs no credentials, so it works from the
   first minute the dashboard is installed. */
$day = mp_db()->query("SELECT MAX(day) FROM metrics WHERE source='health'")->fetchColumn();
$psiDay = mp_db()->query("SELECT MAX(day) FROM metrics WHERE source='psi'")->fetchColumn();

function h_val(string $metric, string $dim, string $day) {
    $st = mp_db()->prepare("SELECT value FROM metrics WHERE source='health' AND metric=:m AND dim=:d AND day=:y");
    $st->execute(array(':m'=>$metric, ':d'=>$dim, ':y'=>$day));
    $v = $st->fetchColumn();
    return $v === false ? null : (float)$v;
}
?>

<?php if (!$day): ?>
  <div class="card">
    <?php ui_empty('No health check has run yet', 'Press Refresh data. This page needs no credentials, so it fills in immediately.'); ?>
  </div>
<?php else: ?>

<?php
  $sslRow = mp_db()->prepare("SELECT value FROM metrics WHERE source='health' AND metric='ssl_days_left' AND day=:y");
  $sslRow->execute(array(':y'=>$day)); $ssl = $sslRow->fetchColumn();
  $variants = mp_db()->prepare("SELECT dim, value FROM metrics WHERE source='health' AND metric='variant_status' AND day=:y ORDER BY dim");
  $variants->execute(array(':y'=>$day)); $variants = $variants->fetchAll();
  $answering = 0; foreach ($variants as $v) { if ((int)$v['value'] === 200) $answering++; }
?>

<div class="grid g4" style="margin-bottom:16px">
  <?php
    ui_kpi('Address variants answering', (string)$answering . ' of ' . count($variants), null,
           $answering > 1 ? 'Should be 1. The rest should redirect.' : 'Correct');
    ui_kpi('SSL valid for', $ssl !== false ? (int)$ssl . ' days' : '--', null, 'Renews automatically in cPanel');
    $perf = mp_db()->prepare("SELECT AVG(value) FROM metrics WHERE source='psi' AND metric='score_performance' AND day=:y AND dim LIKE '%mobile'");
    $perf->execute(array(':y'=>$psiDay));
    $perfV = (float)$perf->fetchColumn();
    ui_kpi('Mobile speed score', $psiDay ? round($perfV) . ' / 100' : '--', null, 'Average across checked pages');
    $seoS = mp_db()->prepare("SELECT AVG(value) FROM metrics WHERE source='psi' AND metric='score_seo' AND day=:y");
    $seoS->execute(array(':y'=>$psiDay));
    ui_kpi('Technical SEO score', $psiDay ? round((float)$seoS->fetchColumn()) . ' / 100' : '--', null, 'Lighthouse SEO audit');
  ?>
</div>

<div class="grid g2" style="margin-bottom:16px">
  <div class="card card--pad0">
    <h3>Address variants</h3>
    <p style="padding:0 18px;margin:-4px 0 12px;color:var(--ink-3);font-size:13px">
      One address should answer with 200. Every other one should return a 301 redirect to it.</p>
    <table>
      <thead><tr><th>Address</th><th class="n">Response</th></tr></thead>
      <tbody>
      <?php foreach ($variants as $v):
        $c = (int)$v['value'];
        $good = ($c >= 300 && $c < 400) || $c === 200; ?>
        <tr>
          <td><?php echo e($v['dim']); ?></td>
          <td class="n">
            <?php if ($c === 200): ?><span class="pill <?php echo $answering > 1 ? 'pill--wait' : 'pill--ok'; ?>">200 direct</span>
            <?php elseif ($c >= 300 && $c < 400): ?><span class="pill pill--ok"><?php echo $c; ?> redirect</span>
            <?php else: ?><span class="pill pill--off"><?php echo $c ?: 'no reply'; ?></span><?php endif; ?>
          </td>
        </tr>
      <?php endforeach; ?>
      </tbody>
    </table>
  </div>

  <div class="card card--pad0">
    <h3>Things the report depends on</h3>
    <table>
      <tbody>
      <?php
        $checks = array(
          'has_tracking'  => 'Conversion tracking script',
          'has_ga4'       => 'GA4 tag',
          'has_schema'    => 'Structured data',
          'has_canonical' => 'Canonical tag',
          'has_hreflang'  => 'Hreflang tags',
        );
        foreach ($checks as $k => $label) {
          $st = mp_db()->prepare("SELECT value FROM metrics WHERE source='health' AND metric=:m AND day=:y");
          $st->execute(array(':m'=>$k, ':y'=>$day));
          $v = $st->fetchColumn();
          $ok = $v !== false && (float)$v >= 1;
          echo '<tr><td>' . e($label) . '</td><td class="n">' . ui_pill($ok, 'Present', 'Missing') . '</td></tr>';
        }
      ?>
      </tbody>
    </table>
  </div>
</div>

<div class="card card--pad0" style="margin-bottom:16px">
  <h3>Key pages</h3>
  <table>
    <thead><tr><th>Page</th><th class="n">Status</th><th class="n">Server response</th><th class="n">Size</th></tr></thead>
    <tbody>
    <?php
      $st = mp_db()->prepare("SELECT dim, value FROM metrics WHERE source='health' AND metric='page_status' AND day=:y ORDER BY dim");
      $st->execute(array(':y'=>$day));
      foreach ($st->fetchAll() as $p) {
        $code = (int)$p['value'];
        $ttfb = h_val('page_ttfb_ms', $p['dim'], (string)$day);
        $bytes= h_val('page_bytes', $p['dim'], (string)$day);
        echo '<tr><td>' . e($p['dim']) . '</td>'
           . '<td class="n">' . ui_pill($code >= 200 && $code < 400, (string)$code, $code ? (string)$code : 'no reply') . '</td>'
           . '<td class="n">' . ($ttfb !== null ? round($ttfb) . ' ms' : '-') . '</td>'
           . '<td class="n">' . ($bytes !== null ? mp_num($bytes / 1024) . ' KB' : '-') . '</td></tr>';
      }
    ?>
    </tbody>
  </table>
</div>

<div class="card card--pad0">
  <h3>Speed and Core Web Vitals<?php if ($psiDay) echo ' <span class="tag">measured ' . e((string)$psiDay) . '</span>'; ?></h3>
  <?php if (!$psiDay): ui_empty('No speed measurement yet', 'Press Refresh data. PageSpeed Insights needs no key, it is just slow, so allow a minute.');
  else: ?>
    <table>
      <thead><tr><th>Page</th><th class="n">Performance</th><th class="n">SEO</th><th class="n">Accessibility</th><th class="n">LCP</th><th class="n">CLS</th></tr></thead>
      <tbody>
      <?php
        $st = mp_db()->prepare("SELECT DISTINCT dim FROM metrics WHERE source='psi' AND day=:y ORDER BY dim");
        $st->execute(array(':y'=>$psiDay));
        foreach ($st->fetchAll() as $row) {
          $d = $row['dim'];
          $g = function ($m) use ($d, $psiDay) {
            $q = mp_db()->prepare("SELECT value FROM metrics WHERE source='psi' AND metric=:m AND dim=:d AND day=:y");
            $q->execute(array(':m'=>$m, ':d'=>$d, ':y'=>$psiDay));
            $v = $q->fetchColumn(); return $v === false ? null : (float)$v;
          };
          $p = $g('score_performance');
          $cls = $p === null ? '' : ($p >= 90 ? 'pill--ok' : ($p >= 50 ? 'pill--wait' : 'pill--off'));
          echo '<tr><td>' . e(str_replace('|', ', ', $d)) . '</td>'
             . '<td class="n">' . ($p !== null ? '<span class="pill ' . $cls . '">' . round($p) . '</span>' : '-') . '</td>'
             . '<td class="n">' . ($g('score_seo') !== null ? round($g('score_seo')) : '-') . '</td>'
             . '<td class="n">' . ($g('score_accessibility') !== null ? round($g('score_accessibility')) : '-') . '</td>'
             . '<td class="n">' . ($g('lcp') !== null ? number_format($g('lcp') / 1000, 1) . 's' : '-') . '</td>'
             . '<td class="n">' . ($g('cls') !== null ? number_format($g('cls'), 3) : '-') . '</td></tr>';
        }
      ?>
      </tbody>
    </table>
    <p style="padding:14px 18px;margin:0;color:var(--ink-3);font-size:13px;border-top:1px solid #F0F4F8">
      Targets Google uses: performance 90 or above, largest contentful paint under 2.5 seconds,
      cumulative layout shift under 0.1. Mobile is the score that matters here, most visitors are on a phone.</p>
  <?php endif; ?>
</div>

<?php endif; ?>
