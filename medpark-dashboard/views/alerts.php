<?php
/* ==========================================================================
   Alerts.

   Added 2026-09-04. Every rule here watches for something going to zero that
   was not zero before, because that is the shape a silent failure takes: the
   site looks normal, nobody complains, and the first sign is a quiet month.

   The page shows what is wrong now, what has fired before, and exactly what
   each rule watches, so nobody has to trust a black box.
   ========================================================================== */

/* Checked on load as well as on the cron, so opening this page always shows
   the current state rather than the state at the last cron run. */
$fired   = mp_alerts_run(true);
$history = mp_alerts_history(30);
$on      = mp_get('alerts_on') === '1';
$to      = array_values(array_unique(array_filter(array_map('trim', array_merge(
              explode(',', mp_get('staff_alert_email')),
              explode(',', mp_get('staff_email')))))));

$when = function (string $iso): string {
    $ts = strtotime($iso);
    if (!$ts) return $iso;
    $ago = time() - $ts;
    if ($ago < 5400)   return max(1, (int)round($ago / 60)) . 'm ago';
    if ($ago < 172800) return (int)round($ago / 3600) . 'h ago';
    return gmdate('j M H:i', $ts);
};
?>

<div class="qa" role="group" aria-label="Alert status">
  <form method="post" style="display:inline">
    <input type="hidden" name="csrf" value="<?php echo e(mp_csrf()); ?>">
    <input type="hidden" name="act" value="toggle_alerts">
    <button class="qa__btn <?php echo $on ? 'qa__btn--pri' : ''; ?>" type="submit"
            title="When on, anything below is emailed the moment it is noticed, at most once every twelve hours per rule.">
      <?php echo ui_icon('alert', 15); ?>
      <?php echo $on ? 'Emailing is on' : 'Emailing is off'; ?>
    </button>
  </form>
  <span class="qa__btn" title="Where alerts are sent. Change it in Settings.">
    <?php echo ui_icon('inbox', 15); ?>
    <?php echo $to ? e(implode(', ', array_slice($to, 0, 2))) : 'no address set'; ?>
  </span>
  <a class="qa__btn" href="?p=settings" title="Set who receives these.">
    <?php echo ui_icon('settings', 15); ?> Settings
  </a>
  <a class="qa__btn" href="?p=leads&amp;r=<?php echo e($R['preset']); ?>">
    <?php echo ui_icon('list', 15); ?> Appointment requests
  </a>
</div>

<?php if (!$to && $on): ?>
  <div class="note note--bad" role="status">
    Emailing is on but there is no address to send to. Add one in Settings, or these alerts exist
    only on this page.
  </div>
<?php endif; ?>

<div class="card card--pad0">
  <h3>Needs a look now
      <span class="hint">checked every time this page is opened, and on a schedule</span></h3>
  <?php
    if (!$fired) {
        ui_empty('Nothing is wrong',
                 'Every rule below was checked just now and none of them fired. This is the '
               . 'state you want: it means the buttons are being used, the tracker is sending, '
               . 'and nobody is waiting for a call.', 'pulse');
    } else {
        echo '<div class="tw"><table><thead><tr><th></th><th>What is wrong</th>'
           . '<th>What proves it</th><th>What to do</th></tr></thead><tbody>';
        foreach ($fired as $a) {
            $cls = $a['severity'] === 'high' ? 'off' : 'wait';
            echo '<tr><td><span class="pill pill--' . $cls . '">'
               . e($a['severity'] === 'high' ? 'Urgent' : 'Check') . '</span></td>'
               . '<td><strong>' . e((string)$a['title']) . '</strong>'
               . (empty($a['new']) ? '<div class="muted" style="font-size:11.5px;margin-top:3px">'
                                   . 'Already reported, not emailed again yet</div>' : '')
               . '</td>'
               . '<td class="muted">' . e((string)$a['evidence']) . '</td>'
               . '<td>' . e((string)$a['action']) . '</td></tr>';
        }
        echo '</tbody></table></div>';
    }
  ?>
</div>

<div class="grid g-2-1">
  <div class="card card--pad0">
    <h3>What has fired before <span class="hint">newest first</span></h3>
    <?php
      if (!$history) {
          ui_empty('Nothing has fired yet',
                   'This fills in the first time something goes wrong, and stays as a record '
                 . 'of what happened and when.', 'list');
      } else {
          echo '<div class="tw"><table><thead><tr><th>When</th><th>What</th>'
             . '<th>Emailed</th></tr></thead><tbody>';
          foreach ($history as $h) {
              echo '<tr><td class="muted nw">' . e($when((string)$h['fired_at'])) . '</td>'
                 . '<td class="trunc" title="' . e((string)$h['evidence']) . '">'
                 . e((string)$h['title']) . '</td>'
                 . '<td>' . ((int)$h['notified'] === 1
                     ? '<span class="pill pill--ok">sent</span>'
                     : '<span class="muted">no</span>') . '</td></tr>';
          }
          echo '</tbody></table></div>';
      }
    ?>
  </div>

  <div class="card">
    <h3>What is being watched</h3>
    <p class="muted" style="font-size:12.5px;margin:0 0 10px">
      Every rule compares this site against its own recent behaviour rather than a number somebody
      typed in. A hospital with three enquiries a day and one with thirty need different
      thresholds, and neither should have to set one.
    </p>
    <?php
      echo '<div class="hb">';
      foreach (array(
        'Tracking stopped'        => 'No visits recorded for twelve hours on a site that normally sees many a day.',
        'Enquiries stopped'       => 'Nothing for four times the usual gap between enquiries.',
        'Script errors'           => 'Errors in real browsers, three times the fortnightly average.',
        'A contact button unused' => 'Used often for a fortnight, then not once for a week.',
        'Requests unanswered'     => 'Somebody left a number more than a day ago and is still marked new.',
        'Certificate expiring'    => 'Fourteen days or fewer left on the security certificate.',
      ) as $name => $what) {
          echo '<div class="hb__r" title="' . e($what) . '">'
             . '<span class="hb__l">' . e($name) . '</span>'
             . '<span></span><b class="hb__v">on</b></div>';
      }
      echo '</div>';
    ?>
    <p class="card__note">
      Nothing fires without enough history to know what normal looks like, and nothing repeats
      within twelve hours. An alert that arrives hourly becomes a mail filter, and then the system
      has no way left to reach anyone.
    </p>
  </div>
</div>

<p class="muted" style="font-size:12.5px;margin-top:14px;max-width:85ch">
  None of these rules look at anything Google holds, so they keep working with no connected
  accounts. They are measured from the same first-party tracking as the rest of this dashboard.
</p>
