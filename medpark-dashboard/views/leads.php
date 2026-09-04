<?php
/* ==========================================================================
   Leads.

   Added 2026-09-03, when the v2 booking form started capturing real requests.

   Every enquiry that arrives with a name and a number attached, in one place
   you can work through: the booking form on the website, and the assistant.
   Both write to chat_leads; `kind` tells them apart.

   This is the only page in the dashboard holding patient details, so it is
   deliberately plain: no charts, no cleverness, just the request, who it is
   from, and whether anyone has dealt with it yet.

   Status is editable here. The handler sits at the top of this view rather
   than in index.php because this page was added while another session owned
   that file; updating a row after output has started is harmless, it just
   cannot redirect afterwards.
   ========================================================================== */

$f = $R['from']; $t = $R['to'];

/* ---- status changes ---------------------------------------------------- */
$leadFlash = null;
if ($_SERVER['REQUEST_METHOD'] === 'POST'
    && ($_POST['act'] ?? '') === 'lead_status'
    && mp_csrf_ok($_POST['csrf'] ?? null)) {

    $allowed = array('new', 'contacted', 'booked', 'closed');
    $to  = (string)($_POST['status'] ?? '');
    $id  = (int)($_POST['id'] ?? 0);
    if ($id > 0 && in_array($to, $allowed, true)) {
        /* status_at is what makes "how long did somebody wait" answerable at
           all. Set on the first move away from new, and left alone after that,
           so it records the first response rather than the last edit. */
        mp_db()->prepare(
            "UPDATE chat_leads SET status = :s,
                    status_at = CASE WHEN status_at = '' THEN :now ELSE status_at END
             WHERE id = :i AND site = :site")
               ->execute(array(':s' => $to, ':now' => gmdate('c'),
                               ':i' => $id, ':site' => mp_current_site()));
        $leadFlash = 'Request #' . $id . ' marked ' . $to . '.';
    }
}

/* Both bind the current property, but only for statements that ask for it. */
function ld_all(string $sql, array $a = array()): array {
    try { $st = mp_db()->prepare($sql); $st->execute(mp_bind_site($a, $sql)); return $st->fetchAll(); }
    catch (Throwable $e) { return array(); }
}
function ld_one(string $sql, array $a = array()) {
    try { $st = mp_db()->prepare($sql); $st->execute(mp_bind_site($a, $sql)); return $st->fetchColumn(); }
    catch (Throwable $e) { return 0; }
}

$args = array(':a' => $f, ':b' => $t);
/* Carries the property as well as the dates, so every count on this page is
   scoped by construction rather than by remembering. */
$inRange = "site = :site AND date(created_at) BETWEEN :a AND :b";

$total  = (int)ld_one("SELECT COUNT(*) FROM chat_leads WHERE $inRange", $args);
$form   = (int)ld_one("SELECT COUNT(*) FROM chat_leads WHERE kind = 'appointment_form' AND $inRange", $args);
$bot    = $total - $form;
$open   = (int)ld_one("SELECT COUNT(*) FROM chat_leads WHERE status = 'new' AND $inRange", $args);
$mailed = (int)ld_one("SELECT COUNT(*) FROM chat_leads WHERE notified = 1 AND $inRange", $args);
$ever   = (int)ld_one("SELECT COUNT(*) FROM chat_leads WHERE site = :site");

/* Anything still unanswered, whenever it arrived. A request from last week
   that nobody has called is more urgent than the date filter. */
$stale = ld_all("SELECT * FROM chat_leads WHERE site = :site AND status = 'new' ORDER BY id DESC LIMIT 100");
$rows  = ld_all("SELECT * FROM chat_leads WHERE $inRange ORDER BY id DESC LIMIT 200", $args);

$src = function (string $kind): string {
    return $kind === 'appointment_form' ? 'Booking form' : 'Assistant';
};
$when = function (string $iso): string {
    $ts = strtotime($iso);
    if (!$ts) return $iso;
    $ago = time() - $ts;
    if ($ago < 3600)  return max(1, (int)round($ago / 60)) . 'm ago';
    if ($ago < 86400) return (int)round($ago / 3600) . 'h ago';
    return gmdate('j M H:i', $ts);
};
?>

<div class="qa" role="group" aria-label="Quick actions">
  <span class="qa__btn" title="Requests are stored by the website's own booking form and the assistant, so they are counted the same way whichever analytics source is selected elsewhere.">
    <?php echo ui_icon('inbox', 15); ?> <?php echo e(mp_num($ever)); ?> requests all time
  </span>
  <?php if ($open > 0): ?>
    <span class="qa__btn" style="color:var(--bad)" title="Nobody has marked these contacted, booked or closed.">
      <?php echo ui_icon('alert', 15); ?> <?php echo (int)$open; ?> waiting for a reply
    </span>
  <?php endif; ?>
  <a class="qa__btn" href="?p=ceo&amp;r=<?php echo e($R['preset']); ?>"
     title="The chief executive's screen, where these requests are the headline number."><?php echo ui_icon('gauge', 15); ?> Summary</a>
  <a class="qa__btn" href="?p=chat&amp;r=<?php echo e($R['preset']); ?>"
     title="The conversations behind the assistant requests."><?php echo ui_icon('chat', 15); ?> Assistant</a>
  <a class="qa__btn" href="?p=settings"
     title="Where these are emailed the moment they arrive."><?php echo ui_icon('settings', 15); ?> Who gets the email</a>
</div>

<?php if ($leadFlash): ?>
  <div class="note note--ok" role="status"><?php echo e($leadFlash); ?></div>
<?php endif; ?>

<div class="grid g4">
  <?php
    ui_kpi('Requests', mp_num($total), null, 'In the selected period', true);
    ui_kpi('From the booking form', mp_num($form), null, $ever > 0 ? 'kind = appointment_form' : 'none yet');
    ui_kpi('From the assistant', mp_num($bot), null, 'Chat conversations that left details');
    ui_kpi('Waiting for a reply', mp_num($open), null,
           $open > 0 ? 'Nobody has marked these done' : 'All dealt with', $open > 0);
  ?>
</div>

<?php if ($ever === 0): ?>
  <div class="card">
    <?php ui_empty('No requests yet',
      'The booking form on the website writes here the moment somebody sends it, and so does the '
    . 'assistant when a visitor leaves their details. Nothing else needs setting up.', 'inbox'); ?>
  </div>
<?php else: ?>

<?php if ($stale): ?>
<div class="card card--pad0">
  <h3>Waiting for a reply
      <span class="hint">every unanswered request, whatever the date filter says</span></h3>
  <div class="tw"><table>
    <thead><tr><th>Arrived</th><th>From</th><th>Name</th><th>Contact</th>
               <th>Wants</th><th>Emailed</th><th></th></tr></thead>
    <tbody>
    <?php foreach ($stale as $r): ?>
      <tr>
        <td class="muted"><?php echo e($when((string)$r['created_at'])); ?></td>
        <td><span class="pill pill--<?php echo $r['kind'] === 'appointment_form' ? 'info' : 'idle'; ?>">
            <?php echo e($src((string)$r['kind'])); ?></span></td>
        <td><strong><?php echo e((string)$r['name']); ?></strong></td>
        <td><a href="tel:<?php echo e(preg_replace('~[^0-9+]~', '', (string)$r['phone'])); ?>">
            <?php echo e((string)$r['phone']); ?></a></td>
        <td class="trunc"><?php echo e(trim((string)$r['service'] . ' ' . (string)$r['branch'])); ?></td>
        <td class="n"><?php echo (int)$r['notified'] === 1 ? 'yes' : '<span class="down">no</span>'; ?></td>
        <td class="n">
          <form method="post" style="display:inline">
            <input type="hidden" name="csrf" value="<?php echo e(mp_csrf()); ?>">
            <input type="hidden" name="act" value="lead_status">
            <input type="hidden" name="id" value="<?php echo (int)$r['id']; ?>">
            <input type="hidden" name="status" value="contacted">
            <button class="btn btn--sm" type="submit">Mark contacted</button>
          </form>
        </td>
      </tr>
    <?php endforeach; ?>
    </tbody>
  </table></div>
</div>
<?php endif; ?>

<div class="card card--pad0">
  <h3>Every request <span class="hint">in the selected period, newest first</span></h3>
  <?php if (!$rows): ?>
    <?php ui_empty('Nothing in this period',
      'There are requests, just not between these dates. Widen the range at the top of the page.', 'inbox'); ?>
  <?php else: ?>
  <div class="tw"><table>
    <thead><tr><th>Arrived</th><th>From</th><th>Name</th><th>Contact</th><th>Email</th>
               <th>Hospital</th><th>Wants</th><th>Preferred</th><th>Note</th>
               <th>Status</th><th></th></tr></thead>
    <tbody>
    <?php foreach ($rows as $r):
      $st = (string)$r['status'];
      $cls = $st === 'new' ? 'wait' : ($st === 'closed' ? 'idle' : 'ok');
    ?>
      <tr>
        <td class="muted" title="<?php echo e((string)$r['created_at']); ?>">
            <?php echo e($when((string)$r['created_at'])); ?></td>
        <td><span class="pill pill--<?php echo $r['kind'] === 'appointment_form' ? 'info' : 'idle'; ?>">
            <?php echo e($src((string)$r['kind'])); ?></span></td>
        <td><strong><?php echo e((string)$r['name']); ?></strong></td>
        <td><a href="tel:<?php echo e(preg_replace('~[^0-9+]~', '', (string)$r['phone'])); ?>">
            <?php echo e((string)$r['phone']); ?></a></td>
        <td class="trunc muted"><?php echo e((string)$r['email'] !== '' ? (string)$r['email'] : '-'); ?></td>
        <td class="trunc"><?php echo e((string)$r['branch'] !== '' ? (string)$r['branch'] : '-'); ?></td>
        <td class="trunc"><?php echo e((string)$r['service'] !== '' ? (string)$r['service'] : '-'); ?></td>
        <td class="muted"><?php echo e((string)$r['preferred_time'] !== '' ? (string)$r['preferred_time'] : '-'); ?></td>
        <td class="trunc" title="<?php echo e((string)$r['note']); ?>">
            <?php echo e((string)$r['note'] !== '' ? mb_substr((string)$r['note'], 0, 60) : '-'); ?></td>
        <td><span class="pill pill--<?php echo $cls; ?>"><?php echo e($st); ?></span></td>
        <td class="n">
          <form method="post" style="display:flex;gap:4px;justify-content:flex-end">
            <input type="hidden" name="csrf" value="<?php echo e(mp_csrf()); ?>">
            <input type="hidden" name="act" value="lead_status">
            <input type="hidden" name="id" value="<?php echo (int)$r['id']; ?>">
            <select name="status" onchange="this.form.submit()">
              <?php foreach (array('new','contacted','booked','closed') as $opt): ?>
                <option value="<?php echo $opt; ?>"<?php echo $st === $opt ? ' selected' : ''; ?>>
                  <?php echo $opt; ?></option>
              <?php endforeach; ?>
            </select>
          </form>
        </td>
      </tr>
    <?php endforeach; ?>
    </tbody>
  </table></div>
  <?php endif; ?>
</div>

<p class="muted" style="font-size:12.5px;margin-top:14px;max-width:80ch">
  This is the only page holding patient details. They are stored in the dashboard database, outside
  the web root, and reach the team by email when a request arrives. The analytics tables record that
  an enquiry happened, its service and its branch, and nothing that identifies a patient.
  <?php if ($mailed < $total): ?>
    <strong><?php echo (int)($total - $mailed); ?></strong> of these could not be emailed: check the
    staff address in Settings.
  <?php endif; ?>
</p>

<?php endif; ?>
