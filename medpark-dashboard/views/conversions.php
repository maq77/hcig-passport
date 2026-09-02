<?php
/* Enquiries. Every event the tracking script sends, broken down by the thing
   the CEO cares about: which control produced the contact, in which language. */
$hasGA = mp_has_data('ga4');
$f = $R['from']; $t = $R['to']; $pf = $R['prev_from']; $pt = $R['prev_to'];

$calls = mp_sum('ga4','events',$f,$t,'call_click');
$whats = mp_sum('ga4','events',$f,$t,'whatsapp_click');
$mail  = mp_sum('ga4','events',$f,$t,'email_click');
$dirs  = mp_sum('ga4','events',$f,$t,'directions_click');
$forms = mp_sum('ga4','events',$f,$t,'enquiry_submit');
$scroll= mp_sum('ga4','events',$f,$t,'scroll_half');
$lang  = mp_sum('ga4','events',$f,$t,'language_switch');
$sessions = mp_sum('ga4','sessions',$f,$t);
$enq = $calls + $whats + $mail + $forms;
?>

<div class="note note--info">
  Conversion tracking went live on 2 September 2026. Anything before that date has no history,
  so the first full month is the baseline every later month is measured against.
</div>

<?php if (!$hasGA): ?>
  <div class="card"><?php ui_not_connected($conn,'ga4'); ?></div>
<?php else: ?>

<div class="grid g4" style="margin-bottom:16px">
  <?php
    ui_kpi('All enquiries', mp_num($enq),
           mp_delta($enq, mp_sum('ga4','events',$pf,$pt,'call_click') + mp_sum('ga4','events',$pf,$pt,'whatsapp_click')
                        + mp_sum('ga4','events',$pf,$pt,'email_click') + mp_sum('ga4','events',$pf,$pt,'enquiry_submit')),
           '', true);
    ui_kpi('Calls', mp_num($calls), mp_delta($calls, mp_sum('ga4','events',$pf,$pt,'call_click')));
    ui_kpi('WhatsApp', mp_num($whats), mp_delta($whats, mp_sum('ga4','events',$pf,$pt,'whatsapp_click')));
    ui_kpi('Enquiry rate', $sessions > 0 ? number_format(($enq/$sessions)*100, 2).'%' : '0%',
           null, 'Of ' . mp_num($sessions) . ' sessions');
  ?>
</div>

<div class="grid g4" style="margin-bottom:16px">
  <?php
    ui_kpi('Email clicks', mp_num($mail), mp_delta($mail, mp_sum('ga4','events',$pf,$pt,'email_click')));
    ui_kpi('Form submissions', mp_num($forms), mp_delta($forms, mp_sum('ga4','events',$pf,$pt,'enquiry_submit')));
    ui_kpi('Direction requests', mp_num($dirs), mp_delta($dirs, mp_sum('ga4','events',$pf,$pt,'directions_click')));
    ui_kpi('Read half the page', mp_num($scroll), mp_delta($scroll, mp_sum('ga4','events',$pf,$pt,'scroll_half')));
  ?>
</div>

<div class="grid g2" style="margin-bottom:16px">
  <div class="card">
    <h3>Calls per day</h3>
    <?php
      $st = mp_db()->prepare("SELECT day, SUM(value) v FROM metrics WHERE source='ga4' AND metric='events'
                              AND dim='call_click' AND day BETWEEN :a AND :b GROUP BY day ORDER BY day");
      $st->execute(array(':a'=>$f, ':b'=>$t)); ui_spark($st->fetchAll());
    ?>
  </div>
  <div class="card">
    <h3>WhatsApp per day</h3>
    <?php
      $st = mp_db()->prepare("SELECT day, SUM(value) v FROM metrics WHERE source='ga4' AND metric='events'
                              AND dim='whatsapp_click' AND day BETWEEN :a AND :b GROUP BY day ORDER BY day");
      $st->execute(array(':a'=>$f, ':b'=>$t)); ui_spark($st->fetchAll(), '#128C7E');
    ?>
  </div>
</div>

<div class="grid g2" style="margin-bottom:16px">
  <div class="card card--pad0">
    <h3>Every tracked event</h3>
    <?php ui_top_table(mp_top('ga4','events',$f,$t,20), 'Event', 'Count', null, 20); ?>
  </div>
  <div class="card">
    <h3>How to read this</h3>
    <p style="color:var(--ink-2);font-size:13px;margin:0 0 12px">
      Each enquiry event carries the placement, the page type, the branch and the language.
      That detail lives in GA4 as event parameters. To see it broken down by placement, register
      <b>placement</b>, <b>page_language</b> and <b>page_type</b> as custom dimensions in GA4 once,
      and they become available here and in every GA4 report.
    </p>
    <table>
      <tbody>
        <tr><td><b>call_click</b></td><td>Someone tapped the phone number</td></tr>
        <tr><td><b>whatsapp_click</b></td><td>Someone opened WhatsApp</td></tr>
        <tr><td><b>email_click</b></td><td>Someone tapped an email address</td></tr>
        <tr><td><b>enquiry_submit</b></td><td>A contact or callback form was sent</td></tr>
        <tr><td><b>directions_click</b></td><td>Someone asked for directions, they are coming in person</td></tr>
        <tr><td><b>scroll_half</b></td><td>The page was actually read, not bounced</td></tr>
        <tr><td><b>language_switch</b></td><td>A visitor moved to the German or Polish site</td></tr>
      </tbody>
    </table>
  </div>
</div>

<div class="card">
  <h3>Language switching</h3>
  <p style="margin:0;color:var(--ink-2);font-size:13.5px">
    <b><?php echo mp_num($lang); ?></b> visitors switched language in this period.
    A high number here means people are landing on the wrong language version first, which is a
    search visibility problem for the German and Polish pages rather than a design one.
  </p>
</div>

<?php endif; ?>
