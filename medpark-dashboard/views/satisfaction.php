<?php
/* ==========================================================================
   Satisfaction and trust.

   Added 2026-09-04. Four things a hospital website can honestly say about how
   it treats people, none of which need an account we do not have:

     how long somebody waits after leaving their number,
     what the public rating is doing over time,
     what people ask that the site does not answer,
     and where they visibly struggle.

   The first one is the sharpest. A four star rating and a patient left waiting
   two days are the same story told twice, and only one of them was measurable
   before today.
   ========================================================================== */

$f = $R['from']; $t = $R['to'];

$RT       = mp_response_times($f, $t);
$ratings  = mp_ratings_latest();
$topics   = mp_assistant_topics($f, $t);
$unknown  = mp_assistant_unanswered($f, $t);
$friction = mp_friction($f, $t);
$fPages   = mp_friction_pages($f, $t);
$links    = mp_review_links();

$hours = function (float $h): string {
    if ($h <= 0) return '--';
    if ($h < 1)  return round($h * 60) . ' min';
    if ($h < 48) return round($h, 1) . ' h';
    return round($h / 24, 1) . ' days';
};
?>

<div class="qa" role="group" aria-label="Satisfaction">
  <span class="qa__btn" title="Measured from the moment a request arrived to the moment somebody marked it contacted.">
    <?php echo ui_icon('pulse', 15); ?>
    <?php echo $RT['answered'] > 0 ? 'Typical reply in ' . e($hours($RT['median_hours'])) : 'No replies recorded yet'; ?>
  </span>
  <?php if ($RT['waiting'] > 0): ?>
    <span class="qa__btn" style="color:var(--bad)"
          title="Still marked new. The oldest has been waiting this long.">
      <?php echo ui_icon('alert', 15); ?>
      <?php echo (int)$RT['waiting']; ?> waiting, oldest <?php echo e($hours($RT['oldest_waiting_hours'])); ?>
    </span>
  <?php endif; ?>
  <a class="qa__btn" href="?p=leads&amp;r=<?php echo e($R['preset']); ?>">
    <?php echo ui_icon('inbox', 15); ?> Appointment requests
  </a>
  <a class="qa__btn" href="#rating" title="Record this month's rating for each listing.">
    <?php echo ui_icon('sparkles', 15); ?> Record a rating
  </a>
</div>

<!-- ---------- how long people wait --------------------------------------- -->
<div class="grid g4">
  <?php
    ui_kpi('Typical reply time', $hours($RT['median_hours']), null,
           $RT['answered'] > 0 ? 'Across ' . $RT['answered'] . ' answered requests' : 'Nothing answered yet',
           true);
    ui_kpi('Answered within an hour',
           $RT['answered'] > 0 ? round($RT['within_hour'] / max(1, $RT['answered']) * 100) . '%' : '--',
           null, 'The standard worth holding');
    ui_kpi('Answered within a day',
           $RT['answered'] > 0 ? round($RT['within_day'] / max(1, $RT['answered']) * 100) . '%' : '--',
           null, 'Below this is a complaint waiting to happen');
    ui_kpi('Longest anyone waited', $hours($RT['worst_hours']), null,
           $RT['waiting'] > 0 ? (int)$RT['waiting'] . ' still unanswered' : 'None outstanding',
           $RT['waiting'] > 0);
  ?>
</div>

<?php if ($RT['answered'] === 0 && $RT['waiting'] === 0): ?>
  <div class="card">
    <?php ui_empty('No reply times recorded yet',
      'This measures the gap between a request arriving and somebody marking it contacted on the '
    . 'Appointment requests page. It fills in as requests are worked through, and it is the '
    . 'clearest thing this dashboard can say about how a patient was treated.', 'pulse'); ?>
  </div>
<?php endif; ?>

<!-- ---------- the public rating ------------------------------------------ -->
<div class="grid g-2-1">
  <div class="card card--pad0">
    <h3>What the listings say <span class="hint">recorded by hand, so it has a direction</span></h3>
    <?php
      if (!$ratings) {
          ui_empty('No ratings recorded yet',
                   'Record each listing once a month and this becomes a trend rather than a '
                 . 'screenshot. The Business Profile API would do it automatically, and needs the '
                 . 'Google service account that is still outstanding.', 'sparkles');
      } else {
          echo '<div class="tw"><table><thead><tr><th>Listing</th><th class="n">Rating</th>'
             . '<th class="n">Reviews</th><th class="n">Since last</th><th>Recorded</th>'
             . '</tr></thead><tbody>';
          foreach ($ratings as $r) {
              $dr = $r['prev_rating']  !== null ? $r['rating'] - $r['prev_rating'] : null;
              $dn = $r['prev_reviews'] !== null ? $r['reviews'] - $r['prev_reviews'] : null;
              echo '<tr><td><strong>' . e($r['listing']) . '</strong></td>'
                 . '<td class="n"><strong>' . e(number_format($r['rating'], 2)) . '</strong></td>'
                 . '<td class="n">' . e(mp_num($r['reviews'])) . '</td>'
                 . '<td class="n">'
                 . ($dr === null ? '<span class="muted">first</span>'
                    : '<span class="' . ($dr >= 0 ? 'up' : 'down') . '">'
                      . ($dr >= 0 ? '+' : '') . number_format($dr, 2) . '</span>'
                      . ($dn !== null ? ' <span class="muted">(' . ($dn >= 0 ? '+' : '') . $dn . ' reviews)</span>' : ''))
                 . '</td>'
                 . '<td class="muted nw">' . e($r['recorded_at']) . '</td></tr>';
          }
          echo '</tbody></table></div>';

          foreach ($ratings as $r) {
              $s = mp_ratings_series($r['listing']);
              if (count($s) > 1) {
                  echo '<div style="padding:0 15px 12px"><h3 style="padding-left:0">'
                     . e($r['listing']) . ' over time</h3>';
                  ui_line(array(array('name' => $r['listing'], 'rows' => $s)), 'chart chart--sm');
                  echo '</div>';
              }
          }
      }
    ?>
    <p class="card__note">
      A rating is the most public number this business has, and it is currently watched by nobody.
      Recording it monthly costs a minute and turns it into something that can be reported on.
    </p>
  </div>

  <div class="card card--pad0" id="rating">
    <h3>Record this month's rating</h3>
    <form method="post" style="padding:14px 15px;display:grid;gap:10px">
      <input type="hidden" name="csrf" value="<?php echo e(mp_csrf()); ?>">
      <input type="hidden" name="act" value="rating_add">
      <div class="field">
        <label>Listing</label>
        <input type="text" name="listing" required
               placeholder="MedPark Health Hub, Hurghada"
               list="mp-listings">
        <datalist id="mp-listings">
          <?php foreach (array_keys($ratings) as $l): ?>
            <option value="<?php echo e($l); ?>"></option>
          <?php endforeach; ?>
          <option value="MedPark Health Hub, Hurghada"></option>
          <option value="MedPark Hospital, El Quseir"></option>
        </datalist>
      </div>
      <div class="field">
        <label>Rating</label>
        <p class="hint">As shown on the listing, to one decimal.</p>
        <input type="number" name="rating" step="0.01" min="1" max="5" required placeholder="4.8">
      </div>
      <div class="field">
        <label>Number of reviews</label>
        <input type="number" name="reviews" min="0" required placeholder="271">
      </div>
      <div class="field">
        <label>Note <span class="muted">optional</span></label>
        <input type="text" name="note" placeholder="Two one-star reviews about waiting time">
      </div>
      <div><button class="btn btn--pri" type="submit">Record</button></div>
    </form>
  </div>
</div>

<!-- ---------- asking for reviews ----------------------------------------- -->
<div class="card card--pad0">
  <h3>Asking for a review <span class="hint">the link staff send a patient who was happy</span></h3>
  <?php
    if (!$links) {
        ui_empty('No review links set yet',
                 'Each listing has its own "write a review" link, which comes from its Google '
               . 'Business Profile. Paste them into Settings, one per line, as: '
               . 'listing name | link. They are not guessed here, because a wrong link sends a '
               . 'patient to review the wrong hospital.', 'map');
    } else {
        echo '<div class="tw"><table><thead><tr><th>Listing</th><th>Link to send</th></tr></thead><tbody>';
        foreach ($links as $name => $url) {
            echo '<tr><td><strong>' . e($name) . '</strong></td>'
               . '<td><code style="font-size:11.5px;word-break:break-all">' . e($url) . '</code></td></tr>';
        }
        echo '</tbody></table></div>';
        echo '<p class="card__note">The moment to send one is when a request is marked booked or '
           . 'closed and the visit went well. That is a habit rather than a feature, and it is '
           . 'the single cheapest way to move a public rating.</p>';
    }
  ?>
</div>

<!-- ---------- what people ask -------------------------------------------- -->
<div class="grid g-2-1">
  <div class="card card--pad0">
    <h3>What people could not get answered
        <span class="hint">every line is something the website does not say clearly enough</span></h3>
    <?php
      if (!$unknown) {
          ui_empty('Nothing unanswered in this period',
                   'This lists questions the assistant had no answer for. An empty list means it '
                 . 'handled everything it was asked, which is the result you want.', 'chat');
      } else {
          echo '<div class="tw"><table><thead><tr><th>They asked</th><th>When</th></tr></thead><tbody>';
          foreach ($unknown as $u) {
              echo '<tr><td>' . e(mb_substr((string)$u['text'], 0, 160)) . '</td>'
                 . '<td class="muted nw">' . e(substr((string)$u['at'], 0, 10)) . '</td></tr>';
          }
          echo '</tbody></table></div>';
          echo '<p class="card__note">Answer these on the website and the assistant stops being '
             . 'asked them. Both improvements come from the same edit.</p>';
      }
    ?>
  </div>
  <div class="card card--pad0">
    <h3>What they ask about most</h3>
    <?php
      if ($topics) ui_hbars($topics, 10, 'var(--c4)');
      else ui_empty('No questions recorded yet',
                    'This counts what people asked about, not the steps the assistant walks them '
                  . 'through when booking. Those are in the panel below.', 'chat');
    ?>
    <h3 style="margin-top:18px">How far booking conversations get
        <span class="hint">where they stop is where it asks for too much</span></h3>
    <?php
      $flow = mp_assistant_flow($f, $t);
      $top  = 0;
      foreach ($flow as $s2) $top = max($top, (int)$s2['n']);
      if ($top === 0) {
          ui_empty('No booking conversations yet', 'Fills in as people use the assistant to book.', 'chat');
      } else {
          echo '<div class="hb">';
          foreach ($flow as $i => $s2) {
              $pct = ($s2['n'] / max(1, $top)) * 100;
              echo '<div class="hb__r"><span class="hb__l">' . e($s2['step']) . '</span>'
                 . '<span class="hb__t"><i style="width:' . round($pct) . '%;background:var(--c'
                 . (($i % 6) + 1) . ')"></i></span>'
                 . '<b class="hb__v">' . (int)$s2['n'] . '</b></div>';
          }
          echo '</div>';
      }
    ?>
  </div>
</div>

<!-- ---------- friction ---------------------------------------------------- -->
<div class="grid g-2-1">
  <div class="card card--pad0">
    <h3>Where people struggle
        <span class="hint">nobody reports any of this, and all of it costs trust</span></h3>
    <?php
      $rows = array(
        array('dim' => 'Rage clicks',      'v' => $friction['rage']),
        array('dim' => 'Dead clicks',      'v' => $friction['dead']),
        array('dim' => 'Forms abandoned',  'v' => $friction['abandon']),
        array('dim' => 'Script errors',    'v' => $friction['errors']),
      );
      $any = false;
      foreach ($rows as $r) if ($r['v'] > 0) $any = true;
      if ($any) ui_hbars($rows, 4, 'var(--c6)');
      else ui_empty('Nothing recorded',
                    'No rage clicks, dead clicks, abandoned forms or script errors in this period.', 'pulse');
    ?>
  </div>
  <div class="card card--pad0">
    <h3>Which pages it happens on</h3>
    <?php
      if ($fPages) {
          foreach ($fPages as &$p) { $p['dim'] = $p['dim'] === '/' ? '/ (home)' : $p['dim']; }
          unset($p);
          ui_hbars($fPages, 6, 'var(--c3)');
      } else {
          ui_empty('Nothing to show', 'Fills in if anybody struggles.', 'pulse');
      }
    ?>
  </div>
</div>

<p class="muted" style="font-size:12.5px;margin-top:14px;max-width:85ch">
  Reply time is measured from the moment a request arrived to the moment somebody marked it
  contacted on the Appointment requests page, so it reflects what was actually done rather than
  what was intended. Ratings are recorded by hand until the Google service account exists. Nothing
  on this page identifies a patient.
</p>
