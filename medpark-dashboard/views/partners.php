<?php
/* ==========================================================================
   Partners.

   Added 2026-09-04. The hotels, resorts, insurers, cruise lines and operators
   that send guests who need care. This is the commercial engine of the group
   and nothing measured it before.

   Ranked by enquiries, never by clicks. A partner whose link is opened two
   hundred times and produces nothing is worth less than one opened twenty
   times that produces four calls, and a table sorted by traffic hides that.
   ========================================================================== */

$f = $R['from']; $t = $R['to'];

$rows   = mp_partner_performance($f, $t);
$totals = mp_partner_totals($f, $t);
$kinds  = mp_partner_kinds();

$mins = function (float $s): string {
    if ($s <= 0) return '--';
    if ($s < 60) return round($s) . 's';
    return floor($s / 60) . 'm ' . str_pad((string)round(fmod($s, 60)), 2, '0', STR_PAD_LEFT) . 's';
};
?>

<div class="qa" role="group" aria-label="About this page">
  <span class="qa__btn" title="A partner link is an ordinary tagged address. The tracker has recorded these tags since it went live, so a partner can be switched on in the middle of a conversation with them.">
    <?php echo ui_icon('list', 15); ?> <?php echo (int)$totals['active']; ?> active
  </span>
  <?php if ($totals['silent'] > 0): ?>
    <span class="qa__btn" style="color:var(--bad)"
          title="Registered, active, and sent nobody at all in this period. Usually a link that has stopped working on their side.">
      <?php echo ui_icon('alert', 15); ?> <?php echo (int)$totals['silent']; ?> sent nobody
    </span>
  <?php endif; ?>
  <a class="qa__btn" href="#add" title="Add a partner and get their link.">
    <?php echo ui_icon('sparkles', 15); ?> Add a partner
  </a>
  <a class="qa__btn" href="?p=leads&amp;r=<?php echo e($R['preset']); ?>"
     title="The requests these visits produced."><?php echo ui_icon('inbox', 15); ?> Appointment requests</a>
</div>

<div class="grid g4">
  <?php
    ui_kpi('Visits from partners', mp_num($totals['visits']), null,
           'Opened a partner link in this period', true);
    ui_kpi('Contact attempts', mp_num($totals['contacts']), null,
           'Calls, WhatsApp, email or a form from those visits');
    ui_kpi('Enquiry rate', $totals['rate'] . '%', null,
           'Compare this against the site as a whole');
    ui_kpi('Partners registered', (string)(int)$totals['active'], null,
           $totals['silent'] > 0
             ? (int)$totals['silent'] . ' of them sent nobody'
             : 'All of them sent somebody', $totals['silent'] > 0);
  ?>
</div>

<div class="card card--pad0">
  <h3>Who actually sends patients
      <span class="hint">ranked by enquiries, not by clicks</span></h3>
  <?php
    if (!$rows) {
        ui_empty('No partners yet',
                 'Add one below and hand them the link it produces. Every visit that arrives '
               . 'through it is counted from that moment, with no change to the website.', 'users');
    } else {
        $best = 0.0;
        foreach ($rows as $r) $best = max($best, (float)$r['rate']);
        echo '<div class="tw"><table><thead><tr><th>Partner</th><th>Kind</th>'
           . '<th class="n">Visits</th><th class="n">Contacts</th><th style="width:100px"></th>'
           . '<th class="n">Rate</th><th class="n">Requests</th><th class="n">Time on site</th>'
           . '<th>Last seen</th></tr></thead><tbody>';
        foreach ($rows as $code => $r) {
            $p = $r['partner'];
            $w = $best > 0 ? ((float)$r['rate'] / $best) * 100 : 0;
            $silent = $r['visits'] <= 0 && empty($p['unregistered']);
            echo '<tr>'
               . '<td><strong>' . e((string)$p['label']) . '</strong>'
               . (!empty($p['unregistered'])
                   ? ' <span class="pill pill--wait" title="A tag arriving from a partner nobody registered here. Usually a link somebody sent without telling us.">not registered</span>'
                   : '')
               . '<div class="muted" style="font-size:11.5px">' . e($code) . '</div></td>'
               . '<td class="muted">' . e($kinds[(string)$p['kind']] ?? 'Other') . '</td>'
               . '<td class="n">' . e(mp_num($r['visits'])) . '</td>'
               . '<td class="n"><strong>' . e(mp_num($r['contacts'])) . '</strong></td>'
               . '<td><span class="bar"><i style="width:' . round($w) . '%"></i></span></td>'
               . '<td class="n"><strong' . ($silent ? ' class="down"' : '') . '>'
               . e(number_format((float)$r['rate'], 1)) . '%</strong></td>'
               . '<td class="n">' . ($r['requests'] > 0 ? e(mp_num($r['requests'])) : '<span class="muted">-</span>') . '</td>'
               . '<td class="n muted nw">' . e($mins((float)$r['engaged'])) . '</td>'
               . '<td class="muted nw">' . e($r['last_seen'] !== '' ? (string)$r['last_seen'] : 'never') . '</td>'
               . '</tr>';
        }
        echo '</tbody></table></div>';
    }
  ?>
  <p class="card__note">
    Visits and contact attempts belong to the visit, which carries the partner tag, so both are
    attributed exactly. Appointment requests are not attributed yet: the booking form posts without
    saying which visit it came from. One hidden field carrying the partner code makes that column
    fill in, and the dashboard already reads it.
  </p>
</div>

<div class="grid g-2-1">
  <div class="card card--pad0" id="add">
    <h3>Add a partner <span class="hint">the link is generated for you</span></h3>
    <form method="post" style="padding:14px 15px;display:grid;gap:10px">
      <input type="hidden" name="csrf" value="<?php echo e(mp_csrf()); ?>">
      <input type="hidden" name="act" value="partner_save">
      <div class="field">
        <label>Name</label>
        <p class="hint">As you would say it out loud. "Steigenberger Al Dau Beach".</p>
        <input type="text" name="label" required placeholder="Steigenberger Al Dau Beach">
      </div>
      <div class="field">
        <label>Code</label>
        <p class="hint">Short, lowercase, no spaces. It appears in the link and in every report.</p>
        <input type="text" name="code" required placeholder="steigenberger">
      </div>
      <div class="field">
        <label>Kind</label>
        <select name="kind">
          <?php foreach ($kinds as $k => $lab): ?>
            <option value="<?php echo e($k); ?>"><?php echo e($lab); ?></option>
          <?php endforeach; ?>
        </select>
      </div>
      <div class="field">
        <label>Where the link should land</label>
        <p class="hint">The home page suits most partners. A German resort might prefer /de/.</p>
        <input type="text" name="landing" value="/" placeholder="/">
      </div>
      <div class="field">
        <label>Who to talk to <span class="muted">optional</span></label>
        <input type="text" name="contact" placeholder="Front desk manager, name and number">
      </div>
      <div class="field">
        <label>Note <span class="muted">optional</span></label>
        <input type="text" name="note" placeholder="Agreement renews in March">
      </div>
      <div><button class="btn btn--pri" type="submit">Add partner</button></div>
    </form>
  </div>

  <div class="card card--pad0">
    <h3>Their links <span class="hint">hand these over, nothing else is needed</span></h3>
    <?php
      $ps = mp_partners();
      if (!$ps) {
          ui_empty('Nothing to hand out yet', 'Add a partner and its link appears here.', 'list');
      } else {
          echo '<div class="tw"><table><thead><tr><th>Partner</th><th>Link</th><th></th></tr></thead><tbody>';
          foreach ($ps as $p) {
              $url = mp_partner_link($p);
              echo '<tr><td><strong>' . e((string)$p['label']) . '</strong>'
                 . ((int)$p['active'] !== 1 ? ' <span class="pill pill--idle">paused</span>' : '')
                 . '</td>'
                 . '<td><code style="font-size:11.5px;word-break:break-all">' . e($url) . '</code></td>'
                 . '<td class="n">'
                 . '<form method="post" style="display:inline">'
                 . '<input type="hidden" name="csrf" value="' . e(mp_csrf()) . '">'
                 . '<input type="hidden" name="act" value="partner_toggle">'
                 . '<input type="hidden" name="id" value="' . (int)$p['id'] . '">'
                 . '<input type="hidden" name="on" value="' . ((int)$p['active'] === 1 ? '0' : '1') . '">'
                 . '<button class="btn btn--sm" type="submit">'
                 . ((int)$p['active'] === 1 ? 'Pause' : 'Resume') . '</button></form>'
                 . '</td></tr>';
          }
          echo '</tbody></table></div>';
          echo '<p class="card__note">Print one as a QR code for a hotel front desk and the same '
             . 'link works: a guest scanning it is a tracked visit like any other. That is how an '
             . 'offline referral becomes measurable.</p>';
      }
    ?>
  </div>
</div>

<p class="muted" style="font-size:12.5px;margin-top:14px;max-width:85ch">
  A partner link is an ordinary address with a tag on the end, so nothing has to be installed on
  their side and nothing changes on ours. The tag has been recorded on every visit since the
  tracker went live, which means a partner can be switched on in the middle of a conversation with
  them and start counting the same day.
</p>
