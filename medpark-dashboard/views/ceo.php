<?php
/* ==========================================================================
   The CEO screen.

   One page. A sentence before a number, an explanation on everything, and an
   action against anything that needs one.

   The audit that produced this: the old overview had 8 cards, 0 explanations,
   1 button, and metrics reading "Connect GA4" on an executive's screen. This
   page answers the three questions actually being asked. Are we winning. What
   is broken. What do I do about it.
   ========================================================================== */

$f = $R['from']; $t = $R['to']; $pf = $R['prev_from']; $pt = $R['prev_to'];
$today = gmdate('Y-m-d');

$N = mp_narrative($R);

$chat  = mp_count_leads($f, $today);
$pchat = mp_count_leads($pf, $pt);
$calls = mp_sum('ga4','events',$f,$t,'call_click');
$pcalls= mp_sum('ga4','events',$pf,$pt,'call_click');
$wa    = mp_sum('ga4','events',$f,$t,'whatsapp_click');
$pwa   = mp_sum('ga4','events',$pf,$pt,'whatsapp_click');
$forms = mp_sum('ga4','events',$f,$t,'enquiry_submit');
$pforms= mp_sum('ga4','events',$pf,$pt,'enquiry_submit');
$enq   = $calls + $wa + $forms + $chat;
$penq  = $pcalls + $pwa + $pforms + $pchat;

$impr  = mp_sum('gsc','impressions',$f,$t);
$pimpr = mp_sum('gsc','impressions',$pf,$pt);
$mapCalls = mp_sum('gbp','call_clicks',$f,$t);
$pmapCalls= mp_sum('gbp','call_clicks',$pf,$pt);
$dirs  = mp_sum('gbp','direction_requests',$f,$t);
$pdirs = mp_sum('gbp','direction_requests',$pf,$pt);

$aiRow = mp_db()->query("SELECT COUNT(*) c, SUM(mentioned) m FROM ai_checks WHERE checked_at >= date('now','-45 day')")->fetch();
$aiC = $aiRow ? (int)$aiRow['c'] : 0;
$aiM = $aiRow ? (int)$aiRow['m'] : 0;

$findings = mp_insights($R);
/* Recommendations carry evidence and an expected outcome, which is what turns
   "something is wrong" into a decision a chief executive can actually take. */
$recs = mp_recommendations($R);
$urgent = array_values(array_filter($recs, function ($x) { return $x['severity'] === 'high'; }));
$wins   = array_values(array_filter($recs, function ($x) { return $x['severity'] === 'good'; }));

/* A tile that explains itself. The caption is the difference between a number
   an executive trusts and one they ignore. */
function ceo_tile(string $key, string $value, ?array $delta, bool $hero = false, string $fallback = ''): void {
    $d = mp_def($key);
    $label = $d ? $d['label'] : $key;
    echo '<div class="kpi' . ($hero ? ' kpi--hero' : '') . '" title="' . e(mp_def_text($key)) . '">';
    echo '<div class="kpi__l">' . e($label);
    echo ' <span class="kpi__q" aria-hidden="true">?</span></div>';
    echo '<div class="kpi__v">' . e($value) . '</div>';
    if ($delta && $delta['pct'] !== null) {
        $icon = $delta['dir'] === 'up' ? ui_icon('up', 11) : ($delta['dir'] === 'down' ? ui_icon('down', 11) : ui_icon('dot', 11));
        echo '<div class="kpi__d ' . e($delta['dir']) . '">' . $icon
           . '<span>' . e(number_format(abs($delta['pct']), 1)) . '% vs previous</span></div>';
    } elseif ($fallback !== '') {
        echo '<div class="kpi__d flat">' . e($fallback) . '</div>';
    } else {
        echo '<div class="kpi__d flat">First period on record</div>';
    }
    if ($d) echo '<div class="kpi__cap">' . e($d['what']) . '</div>';
    echo '</div>';
}
?>

<!-- ---------- quick actions, replacing Refresh / CSV / Report ---------- -->
<div class="qa" role="group" aria-label="Quick actions">
  <form method="post" style="display:contents">
    <input type="hidden" name="csrf" value="<?php echo e(mp_csrf()); ?>">
    <input type="hidden" name="act" value="schedule_report">
    <button class="qa__btn qa__btn--pri" type="submit"
            title="Sets this report to arrive by email on the first of every month. Set once, never touched again.">
      <?php echo ui_icon('inbox', 15); ?> Email this to me monthly
    </button>
  </form>

  <a class="qa__btn" href="#what-changed"
     title="A written comparison of this period against the last one.">
    <?php echo ui_icon('pulse', 15); ?> What changed?
  </a>

  <a class="qa__btn" href="#fix-first"
     title="The issues most likely to be costing enquiries, ranked by effect rather than technical severity.">
    <?php echo ui_icon('alert', 15); ?> What should we fix first?
  </a>

  <form method="post" style="display:contents">
    <input type="hidden" name="csrf" value="<?php echo e(mp_csrf()); ?>">
    <input type="hidden" name="act" value="toggle_alerts">
    <button class="qa__btn" type="submit"
            title="Emails you if any headline number falls sharply week on week, so a problem is caught between reports.">
      <?php echo ui_icon('target', 15); ?>
      <?php echo mp_get('alerts_on') === '1' ? 'Alerts are on' : 'Alert me if enquiries drop'; ?>
    </button>
  </form>

  <a class="qa__btn" href="export.php?r=<?php echo e($R['preset']); ?>&amp;f=report" target="_blank"
     title="A printable one-page report with the same numbers and their explanations.">
    <?php echo ui_icon('download', 15); ?> Share with the board
  </a>
</div>

<?php if (mp_get('report_email_on') === '1'): ?>
  <div class="note note--ok">
    The monthly report is scheduled. It will arrive on the first of each month at
    <strong><?php echo e(mp_get('staff_email')); ?></strong>. Nobody needs to remember to send it.
  </div>
<?php endif; ?>

<!-- ---------- the sentence, before any number ---------- -->
<div class="say say--<?php echo e($N['tone']); ?>" id="what-changed">
  <p class="say__head"><?php echo e($N['headline']); ?></p>
  <?php foreach ($N['lines'] as $l): ?>
    <p class="say__line"><?php echo e($l); ?></p>
  <?php endforeach; ?>
</div>

<!-- ---------- four numbers, each explaining itself ---------- -->
<div class="grid g4">
  <?php
    ceo_tile('enquiries', mp_num($enq), mp_delta($enq, $penq), true);
    ceo_tile('cost_per_enquiry', '--', null,  false, 'Connect advertising to see this');
    ceo_tile('impressions', $impr > 0 ? mp_num($impr) : '--',
             $impr > 0 ? mp_delta($impr, $pimpr) : null, false, 'Waiting on Search Console');
    ceo_tile('ai_mentions', $aiC > 0 ? $aiM . ' of ' . $aiC : '--', null,
             $aiC > 0 ? 'Checked in the last 45 days' : 'Run the monthly check to start');
  ?>
</div>

<div class="grid g4">
  <?php
    ceo_tile('calls', $calls > 0 || mp_has_data('ga4') ? mp_num($calls) : '--',
             mp_has_data('ga4') ? mp_delta($calls, $pcalls) : null, false, 'Waiting on Analytics');
    ceo_tile('whatsapp', $wa > 0 || mp_has_data('ga4') ? mp_num($wa) : '--',
             mp_has_data('ga4') ? mp_delta($wa, $pwa) : null, false, 'Waiting on Analytics');
    ceo_tile('assistant', mp_num($chat), mp_delta($chat, $pchat), false, 'Live now, needs no setup');
    ceo_tile('directions', $dirs > 0 ? mp_num($dirs) : '--',
             $dirs > 0 ? mp_delta($dirs, $pdirs) : null, false, 'Waiting on Business Profile');
  ?>
</div>

<!-- ---------- enquiries over time ---------- -->
<div class="card">
  <h3>Enquiries over time
    <span class="hint">Everything that counts as somebody making contact</span></h3>
  <?php
    $st = mp_db()->prepare("SELECT day, SUM(value) v FROM metrics WHERE source='ga4' AND metric='events'
                            AND dim IN ('call_click','whatsapp_click','enquiry_submit')
                            AND day BETWEEN :a AND :b GROUP BY day ORDER BY day");
    $st->execute(array(':a'=>$f, ':b'=>$t));
    $series = $st->fetchAll();
    if (count($series) > 1) {
        ui_line(array(array('name'=>'Enquiries', 'rows'=>$series)));
    } else {
        ui_empty('Not enough days yet for a trend',
          'Conversion tracking went live on 2 September 2026. A line needs at least two days of history, and it will fill in on its own.', 'pulse');
    }
  ?>
</div>

<!-- ---------- what to fix ---------- -->
<div class="card card--pad0" id="fix-first">
  <h3>What should we fix first
    <span class="hint">Ranked by likely effect on enquiries, not by technical severity</span></h3>
  <?php if (!$urgent): ?>
    <?php ui_empty('Nothing urgent',
      'No issue in the connected sources is currently likely to be costing enquiries.', 'target'); ?>
  <?php else: foreach (array_slice($urgent, 0, 3) as $i => $x): ?>
    <div class="find s-high">
      <div class="find__sev"></div>
      <div class="find__b">
        <div class="find__t"><?php echo ($i + 1) . '. ' . e($x['finding']); ?>
          <span class="tag"><?php echo e($x['area']); ?></span></div>
        <div class="find__d"><?php echo e($x['problem'] !== '' ? $x['problem'] : $x['evidence']); ?></div>
        <div class="find__a"><b>Do this.</b> <?php echo e($x['solution']); ?></div>
        <?php if ($x['expect'] !== ''): ?>
          <div class="find__x"><b>Expect.</b> <?php echo e($x['expect']); ?>
            <?php if ($x['timeframe'] !== ''): ?>
              <span class="find__t2"><?php echo e($x['timeframe']); ?></span>
            <?php endif; ?>
          </div>
        <?php endif; ?>
      </div>
    </div>
  <?php endforeach; endif; ?>
  <?php if (count($findings) > count(array_slice($urgent, 0, 3))): ?>
    <div style="padding:13px 15px;border-top:1px solid var(--line-2)">
      <a class="btn btn--sm" href="?p=issues&amp;r=<?php echo e($R['preset']); ?>">
        See all <?php echo count($recs); ?>, including the less urgent
      </a>
    </div>
  <?php endif; ?>
</div>

<!-- ---------- reach and momentum ---------- -->
<div class="grid g-2-1">
  <div class="card card--pad0">
    <h3>How far the brand reached <span class="hint">Everywhere someone could have seen us</span></h3>
    <div class="tw">
      <table>
        <thead><tr><th>Channel</th><th class="n">Reach</th><th>What it means</th></tr></thead>
        <tbody>
          <tr>
            <td>Google search</td>
            <td class="n"><strong><?php echo $impr > 0 ? mp_num($impr) : '&ndash;'; ?></strong></td>
            <td>Times we were put in front of somebody searching. Moves before clicks do, so it is the earliest sign the search work is landing.</td>
          </tr>
          <tr>
            <td>Google Maps</td>
            <td class="n"><strong><?php
              $mapViews = mp_sum('gbp','impressions_maps_mobile',$f,$t) + mp_sum('gbp','impressions_maps_desktop',$f,$t)
                        + mp_sum('gbp','impressions_search_mobile',$f,$t) + mp_sum('gbp','impressions_search_desktop',$f,$t);
              echo $mapViews > 0 ? mp_num($mapViews) : '&ndash;'; ?></strong></td>
            <td>For a local search the map sits above the website, so this is often the larger audience of the two.</td>
          </tr>
          <tr>
            <td>AI assistants</td>
            <td class="n"><strong><?php echo $aiC > 0 ? $aiM . ' / ' . $aiC : '&ndash;'; ?></strong></td>
            <td>Questions where an assistant named MedPark. A growing share of travellers ask before they search.</td>
          </tr>
          <tr>
            <td>Knew us already</td>
            <td class="n"><strong><?php
              $direct = mp_sum('ga4','sessions_channel',$f,$t,'Direct');
              echo $direct > 0 ? mp_num($direct) : '&ndash;'; ?></strong></td>
            <td>People who typed the address or searched the name. The clearest measure of brand awareness we have.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <div class="card">
    <h3>Position over time <span class="hint">Falling means moving up the page</span></h3>
    <?php
      $posSeries = mp_series('gsc','position',$f,$t);
      if (count($posSeries) >= 5) {
          ui_line(array(array('name'=>'Average position', 'rows'=>$posSeries)), 'chart chart--sm');
          echo '<p class="card__note">Averaged across every term we appear for. A fall of one place across the whole site is a large move.</p>';
      } else {
          ui_empty('Not enough history yet',
            'Ranking history arrives with Search Console access, and it carries up to 16 months, so this chart will fill in backwards rather than starting from today.', 'search');
      }
    ?>
  </div>
</div>

<?php if ($wins): ?>
<div class="card card--pad0">
  <h3>What is already working <span class="hint">Groundwork that removes the obstacles</span></h3>
  <?php foreach (array_slice($wins, 0, 2) as $w): ?>
    <div class="find s-low">
      <div class="find__sev" style="background:var(--ok)"></div>
      <div class="find__b">
        <div class="find__t"><?php echo e($w['finding']); ?></div>
        <div class="find__d"><?php echo e($w['evidence']); ?></div>
        <?php if ($w['expect'] !== ''): ?>
          <div class="find__x"><b>Why it matters.</b> <?php echo e($w['expect']); ?></div>
        <?php endif; ?>
      </div>
    </div>
  <?php endforeach; ?>
</div>
<?php endif; ?>

<!-- ---------- where it came from ---------- -->
<div class="grid g3">
  <div class="card card--pad0">
    <h3>Where visitors are <span class="hint">Top five countries</span></h3>
    <?php mp_has_data('ga4')
      ? ui_top_table(mp_top('ga4','sessions_country',$f,$t), 'Country', 'Visits')
      : ui_empty('Waiting on Analytics', 'This fills in as soon as the Google account is connected.', 'globe'); ?>
  </div>
  <div class="card card--pad0">
    <h3>What they searched <span class="hint">Top five queries</span></h3>
    <?php mp_has_data('gsc')
      ? ui_top_table(mp_top('gsc','clicks_query',$f,$t), 'Search term', 'Clicks')
      : ui_empty('Waiting on Search Console', 'This fills in as soon as the Google account is connected.', 'search'); ?>
  </div>
  <div class="card card--pad0">
    <h3>From the map listings <span class="hint">Never touches the website</span></h3>
    <?php if (mp_has_data('gbp')): ?>
      <div class="grid g2" style="padding:14px 15px;margin:0">
        <?php ceo_tile('map_calls', mp_num($mapCalls), mp_delta($mapCalls, $pmapCalls));
              ceo_tile('directions', mp_num($dirs), mp_delta($dirs, $pdirs)); ?>
      </div>
    <?php else: ui_empty('Waiting on Business Profile',
      'A tourist with a problem searches Maps, not a website. Until this is connected, that demand is invisible.', 'map'); endif; ?>
  </div>
</div>

<div class="note note--info">
  <b>Every number on this page explains itself.</b> Hover any tile, or tap it on a phone, to see what
  it measures, why it matters and what a good result looks like. The same definitions appear in the
  report, so the printed version can never disagree with the screen.
</div>
