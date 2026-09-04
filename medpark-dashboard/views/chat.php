<?php
/* Assistant. Conversations, leads, appointment requests and the emergencies it
   caught. This is the page that shows whether the chatbot is producing patients
   or just producing chat. */
$f = $R['from']; $t = $R['to']; $pf = $R['prev_from']; $pt = $R['prev_to'];
/* Sessions are stamped with a full timestamp, so the range is compared on the
   date portion. Include today, because a chatbot is judged on what it did an
   hour ago, not on what it did yesterday. */
$a = $f; $b = gmdate('Y-m-d');

function ch_one(string $sql, array $args = array()) {
    $st = mp_db()->prepare($sql); $st->execute(mp_bind_site($args, $sql)); return $st->fetchColumn();
}
function ch_all(string $sql, array $args = array()): array {
    $st = mp_db()->prepare($sql); $st->execute(mp_bind_site($args, $sql)); return $st->fetchAll();
}

/* Carries the property as well as the dates, so every conversation query on
   this page is scoped by construction rather than by remembering. */
$inRange = "site = :site AND date(started_at) BETWEEN :a AND :b";
$args = array(':a'=>$a, ':b'=>$b);
$prevArgs = array(':a'=>$pf, ':b'=>$pt);

$convs  = (int)ch_one("SELECT COUNT(*) FROM chat_sessions WHERE $inRange", $args);
$pconvs = (int)ch_one("SELECT COUNT(*) FROM chat_sessions WHERE $inRange", $prevArgs);
$leads  = (int)ch_one("SELECT COUNT(*) FROM chat_leads WHERE site = :site AND date(created_at) BETWEEN :a AND :b", $args);
$pleads = (int)ch_one("SELECT COUNT(*) FROM chat_leads WHERE site = :site AND date(created_at) BETWEEN :a AND :b", $prevArgs);
$emerg  = (int)ch_one("SELECT COUNT(*) FROM chat_sessions WHERE emergency=1 AND $inRange", $args);
$wa     = (int)ch_one("SELECT COUNT(*) FROM chat_sessions WHERE handed_to_whatsapp=1 AND $inRange", $args);
$msgs   = (int)ch_one("SELECT COUNT(*) FROM chat_messages WHERE site = :site AND date(at) BETWEEN :a AND :b", $args);
$rate   = $convs > 0 ? ($leads / $convs) * 100 : 0;
$prate  = $pconvs > 0 ? ($pleads / $pconvs) * 100 : 0;
$avgMsg = $convs > 0 ? $msgs / $convs : 0;
$anyChat = (int)ch_one("SELECT COUNT(*) FROM chat_sessions WHERE site = :site") > 0;
?>

<?php if (!$anyChat): ?>
  <div class="card">
    <?php ui_empty('The assistant has not had a conversation yet',
      'It is live on every page, in English, German and Polish. This page fills in as soon as someone uses it. Nothing here needs a credential.'); ?>
  </div>
<?php else: ?>

<div class="grid g4" style="margin-bottom:16px">
  <?php
    ui_kpi('Appointment requests', mp_num($leads), mp_delta((float)$leads, (float)$pleads), '', true);
    ui_kpi('Conversations', mp_num($convs), mp_delta((float)$convs, (float)$pconvs));
    ui_kpi('Request rate', number_format($rate, 1) . '%', mp_delta($rate, $prate), 'Of all conversations');
    ui_kpi('Urgent cases caught', mp_num($emerg), null, $emerg > 0 ? 'Each one was told to call' : 'None in this period');
  ?>
</div>

<div class="grid g4" style="margin-bottom:16px">
  <?php
    ui_kpi('Messages', mp_num($msgs), null, 'Both sides');
    ui_kpi('Messages per conversation', number_format($avgMsg, 1), null, 'Higher means more engaged');
    ui_kpi('Handed to WhatsApp', mp_num($wa), null, 'Continued with your team');
    $abandoned = (int)ch_one("SELECT COUNT(*) FROM chat_sessions WHERE outcome='open' AND messages <= 1 AND $inRange", $args);
    ui_kpi('Opened and left', mp_num($abandoned), null, 'No question asked');
  ?>
</div>

<?php if ($emerg > 0): ?>
<div class="card card--pad0" style="margin-bottom:16px;border-color:#F3C6C0">
  <h3 style="color:var(--bad)">Urgent cases the assistant caught</h3>
  <p style="padding:0 18px;margin:-4px 0 12px;color:var(--ink-2);font-size:13px">
    Each of these was shown the emergency number immediately and staff were emailed.
    The assistant gave no medical advice and asked no further questions.</p>
  <table>
    <thead><tr><th>When</th><th>Language</th><th>What they wrote</th></tr></thead>
    <tbody>
    <?php foreach (ch_all("SELECT s.sid, s.started_at, s.lang,
              (SELECT text FROM chat_messages m WHERE m.sid=s.sid AND m.role='visitor' ORDER BY m.id DESC LIMIT 1) txt
              FROM chat_sessions s WHERE s.emergency=1 AND $inRange ORDER BY s.id DESC LIMIT 20", $args) as $r): ?>
      <tr>
        <td><?php echo e(str_replace('T', ' ', substr((string)$r['started_at'], 0, 16))); ?></td>
        <td><span class="pill pill--wait"><?php echo e(strtoupper((string)$r['lang'])); ?></span></td>
        <td class="trunc" title="<?php echo e((string)$r['txt']); ?>"><?php echo e((string)$r['txt']); ?></td>
      </tr>
    <?php endforeach; ?>
    </tbody>
  </table>
</div>
<?php endif; ?>

<div class="card card--pad0" style="margin-bottom:16px">
  <h3>Appointment requests</h3>
  <p style="padding:0 18px;margin:-4px 0 12px;color:var(--ink-3);font-size:13px">
    Nothing here was confirmed to the patient. Each person was told the team would come back to them.</p>
  <?php $rows = ch_all("SELECT * FROM chat_leads WHERE site = :site AND date(created_at) BETWEEN :a AND :b ORDER BY id DESC LIMIT 50", $args);
  if (!$rows): ui_empty('No requests in this period', 'Conversations happened but nobody asked for an appointment.');
  else: ?>
  <div style="overflow-x:auto">
  <table style="min-width:820px">
    <thead><tr><th>When</th><th>Name</th><th>Phone</th><th>Lang</th><th>Branch</th><th>Needs</th><th>Preferred</th><th>Emailed</th></tr></thead>
    <tbody>
    <?php foreach ($rows as $r): ?>
      <tr>
        <td><?php echo e(str_replace('T', ' ', substr((string)$r['created_at'], 0, 16))); ?></td>
        <td><b><?php echo e((string)$r['name']); ?></b></td>
        <td><a href="tel:<?php echo e((string)$r['phone']); ?>"><?php echo e((string)$r['phone']); ?></a></td>
        <td><?php echo e(strtoupper((string)$r['lang'])); ?></td>
        <td><?php echo e((string)$r['branch'] === 'elquseir' ? 'El Quseir' : 'Hurghada'); ?></td>
        <td class="trunc" title="<?php echo e((string)$r['note']); ?>"><?php echo e((string)$r['service']); ?></td>
        <td><?php echo e((string)$r['preferred_time']); ?></td>
        <td><?php echo ui_pill((int)$r['notified'] === 1, 'Sent', 'Not sent'); ?></td>
      </tr>
    <?php endforeach; ?>
    </tbody>
  </table>
  </div>
  <?php endif; ?>
</div>

<div class="grid g3" style="margin-bottom:16px">
  <div class="card card--pad0">
    <h3>Language</h3>
    <?php ui_top_table(ch_all("SELECT lang dim, COUNT(*) v FROM chat_sessions WHERE $inRange GROUP BY lang ORDER BY v DESC", $args), 'Language', 'Conversations'); ?>
  </div>
  <div class="card card--pad0">
    <h3>Where they started</h3>
    <?php ui_top_table(ch_all("SELECT entry_page dim, COUNT(*) v FROM chat_sessions WHERE $inRange AND entry_page <> '' GROUP BY entry_page ORDER BY v DESC LIMIT 8", $args), 'Page', 'Conversations', null, 8); ?>
  </div>
  <div class="card card--pad0">
    <h3>How conversations ended</h3>
    <?php ui_top_table(ch_all("SELECT outcome dim, COUNT(*) v FROM chat_sessions WHERE $inRange GROUP BY outcome ORDER BY v DESC", $args), 'Outcome', 'Count', null, 8); ?>
  </div>
</div>

<div class="grid g2" style="margin-bottom:16px">
  <div class="card card--pad0">
    <h3>What people actually ask about</h3>
    <p style="padding:0 18px;margin:-4px 0 10px;color:var(--ink-3);font-size:13px">
      The topics behind real questions. A large "handed to menu" number means the assistant is being
      asked things it cannot answer, which is the signal to add a key or extend what it knows.</p>
    <?php ui_top_table(ch_all("SELECT intent dim, COUNT(*) v FROM chat_messages
        WHERE site = :site AND role='assistant' AND intent NOT IN ('','greeting') AND date(at) BETWEEN :a AND :b
        GROUP BY intent ORDER BY v DESC LIMIT 12", $args), 'Topic', 'Times', null, 12); ?>
  </div>
  <div class="card card--pad0">
    <h3>Device and engine</h3>
    <?php ui_top_table(ch_all("SELECT device dim, COUNT(*) v FROM chat_sessions WHERE $inRange AND device <> '' GROUP BY device", $args), 'Device', 'Conversations'); ?>
    <h3 style="padding:18px 18px 0">Running as</h3>
    <?php ui_top_table(ch_all("SELECT engine dim, COUNT(*) v FROM chat_sessions WHERE $inRange GROUP BY engine", $args), 'Engine', 'Conversations'); ?>
  </div>
</div>

<div class="card card--pad0">
  <h3>Recent conversations</h3>
  <?php
    $sel = isset($_GET['c']) ? preg_replace('~[^a-f0-9]~', '', (string)$_GET['c']) : '';
    $list = ch_all("SELECT * FROM chat_sessions WHERE $inRange ORDER BY id DESC LIMIT 30", $args);
  ?>
  <div style="display:grid;grid-template-columns:minmax(0,320px) 1fr;gap:0;border-top:1px solid var(--line)">
    <div style="border-right:1px solid var(--line);max-height:520px;overflow-y:auto">
      <?php foreach ($list as $s):
        $on = $sel === $s['sid']; ?>
        <a href="?p=chat&amp;r=<?php echo e($R['preset']); ?>&amp;c=<?php echo e((string)$s['sid']); ?>"
           style="display:block;padding:12px 16px;border-bottom:1px solid var(--line-2, #F0F4F8);text-decoration:none;color:inherit;<?php echo $on ? 'background:var(--brand-l)' : ''; ?>">
          <div style="display:flex;justify-content:space-between;gap:8px;align-items:baseline">
            <b style="font-size:13px"><?php echo e(str_replace('T', ' ', substr((string)$s['started_at'], 0, 16))); ?></b>
            <span class="pill <?php echo (int)$s['emergency'] ? 'pill--off' : ((string)$s['outcome'] === 'lead' ? 'pill--ok' : 'pill--wait'); ?>">
              <?php echo e((int)$s['emergency'] ? 'urgent' : (string)$s['outcome']); ?>
            </span>
          </div>
          <div style="font-size:12.5px;color:var(--ink-3);margin-top:3px">
            <?php echo e(strtoupper((string)$s['lang'])); ?> ·
            <?php echo (int)$s['messages']; ?> messages ·
            <?php echo e((string)$s['device']); ?>
          </div>
        </a>
      <?php endforeach; ?>
    </div>
    <div style="padding:16px;max-height:520px;overflow-y:auto;background:#F6F9FB">
      <?php if ($sel === ''): ?>
        <?php ui_empty('Pick a conversation', 'The full transcript appears here, exactly as the visitor saw it.'); ?>
      <?php else:
        $tr = ch_all("SELECT * FROM chat_messages WHERE sid=:s ORDER BY id", array(':s'=>$sel));
        if (!$tr) { ui_empty('Nothing recorded', 'This conversation has no messages.'); }
        foreach ($tr as $m):
          $me = (string)$m['role'] === 'visitor'; ?>
        <div style="max-width:82%;margin:0 0 9px <?php echo $me ? 'auto' : '0'; ?>;
                    padding:10px 13px;border-radius:14px;font-size:13.5px;line-height:1.5;white-space:pre-wrap;
                    <?php echo $me ? 'background:var(--brand);color:#04282A;border-bottom-right-radius:4px'
                                   : 'background:#fff;border:1px solid var(--line);border-bottom-left-radius:4px'; ?>">
          <?php echo e((string)$m['text']); ?>
        </div>
      <?php endforeach; endif; ?>
    </div>
  </div>
</div>

<?php endif; ?>
