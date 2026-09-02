<?php
/* AI visibility. There is no API that reports whether ChatGPT names MedPark,
   so this is a structured record of a monthly manual check. Structured means
   it can be charted and put in the report, which a spreadsheet cannot. */
$prompts = array_values(array_filter(array_map('trim', explode("\n", mp_get('ai_prompts')))));
$engines = array('ChatGPT','Google AI Overview','Gemini','Perplexity','Copilot','Claude');

$all = mp_db()->query("SELECT * FROM ai_checks ORDER BY checked_at DESC, id DESC LIMIT 200")->fetchAll();
$recent = mp_db()->query("SELECT COUNT(*) c, SUM(mentioned) m FROM ai_checks WHERE checked_at >= date('now','-45 day')")->fetch();
$rate = ($recent && (int)$recent['c'] > 0) ? ((float)$recent['m'] / (float)$recent['c']) * 100 : 0;

$byEngine = mp_db()->query(
  "SELECT engine dim, ROUND(100.0*SUM(mentioned)/COUNT(*),0) v FROM ai_checks
   WHERE checked_at >= date('now','-45 day') GROUP BY engine ORDER BY v DESC")->fetchAll();
?>

<div class="grid g4" style="margin-bottom:16px">
  <?php
    ui_kpi('Mention rate', $recent && (int)$recent['c'] ? round($rate).'%' : '--', null,
           $recent && (int)$recent['c'] ? (int)$recent['m'].' of '.(int)$recent['c'].' prompts, last 45 days' : 'No checks recorded yet', true);
    ui_kpi('Prompts in the set', (string)count($prompts), null, 'Edit the list in Settings');
    ui_kpi('Checks recorded', (string)($recent ? (int)$recent['c'] : 0), null, 'Last 45 days');
    ui_kpi('Engines covered', (string)count($byEngine), null, 'Of ' . count($engines) . ' worth testing');
  ?>
</div>

<div class="grid g2" style="margin-bottom:16px">
  <div class="card card--pad0">
    <h3>Mention rate by engine</h3>
    <?php ui_top_table($byEngine, 'Engine', 'Mentioned', function ($v) { return round($v).'%'; }, 8); ?>
  </div>
  <div class="card">
    <h3>How this is measured</h3>
    <p style="color:var(--ink-2);font-size:13px;margin:0 0 10px">
      Once a month, ask each engine the prompts below in a fresh session with no history, and record
      whether MedPark is named, in what position, and which competitors appeared instead.
      A fresh session matters: an engine that has been talking to you about MedPark all day will name it.</p>
    <p style="color:var(--ink-2);font-size:13px;margin:0">
      It takes about ten minutes and it is the only honest way to report this. Any tool claiming to
      automate it is sampling the same way, just less carefully.</p>
  </div>
</div>

<div class="card" style="margin-bottom:16px">
  <h3>Record a result</h3>
  <form method="post">
    <input type="hidden" name="csrf" value="<?php echo e(mp_csrf()); ?>">
    <input type="hidden" name="act" value="ai_add">
    <div class="grid g3">
      <div class="field">
        <label>Date checked</label>
        <input type="text" name="checked_at" value="<?php echo e(gmdate('Y-m-d')); ?>">
      </div>
      <div class="field">
        <label>Engine</label>
        <select name="engine">
          <?php foreach ($engines as $x) echo '<option>' . e($x) . '</option>'; ?>
        </select>
      </div>
      <div class="field">
        <label>Position in the answer</label>
        <p class="hint">Leave blank if not mentioned. 1 means named first.</p>
        <input type="text" name="rank_position" placeholder="1">
      </div>
    </div>
    <div class="field">
      <label>Prompt</label>
      <select name="prompt">
        <?php foreach ($prompts as $p) echo '<option>' . e($p) . '</option>'; ?>
      </select>
    </div>
    <div class="grid g2">
      <div class="field">
        <label>Which page it cited, if any</label>
        <input type="text" name="cited_url" placeholder="https://www.medparkhospitals.com/...">
      </div>
      <div class="field">
        <label>Competitors named instead</label>
        <input type="text" name="competitors" placeholder="Royal Hospital, Nile Hospital">
      </div>
    </div>
    <div class="field">
      <label>Notes</label>
      <input type="text" name="notes" placeholder="How it described MedPark, anything wrong in the answer">
    </div>
    <div class="field">
      <label style="display:flex;align-items:center;gap:9px;font-weight:600">
        <input type="checkbox" name="mentioned" value="1" style="width:auto">
        MedPark was named in the answer
      </label>
    </div>
    <button class="btn btn--pri" type="submit">Save result</button>
  </form>
</div>

<div class="card card--pad0">
  <h3>Recorded checks</h3>
  <?php if (!$all): ui_empty('Nothing recorded yet', 'Use the form above after running the prompt set. Two or three months of records is where this becomes a trend worth showing.');
  else: ?>
    <table>
      <thead><tr><th>Date</th><th>Engine</th><th>Prompt</th><th>Named</th><th class="n">Position</th><th>Competitors</th></tr></thead>
      <tbody>
      <?php foreach ($all as $r): ?>
        <tr>
          <td><?php echo e(substr((string)$r['checked_at'], 0, 10)); ?></td>
          <td><?php echo e($r['engine']); ?></td>
          <td class="trunc" title="<?php echo e($r['prompt']); ?>"><?php echo e($r['prompt']); ?></td>
          <td><?php echo (int)$r['mentioned'] ? '<span class="pill pill--ok">Yes</span>' : '<span class="pill pill--off">No</span>'; ?></td>
          <td class="n"><?php echo $r['rank_position'] !== null ? (int)$r['rank_position'] : '-'; ?></td>
          <td class="trunc" title="<?php echo e($r['competitors']); ?>"><?php echo e($r['competitors']); ?></td>
        </tr>
      <?php endforeach; ?>
      </tbody>
    </table>
  <?php endif; ?>
</div>
