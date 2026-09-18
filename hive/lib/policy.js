// Triage: who does a ticket. Claude is the head and decides by severity, risk and
// token pressure; the rules live in config.json "policy" so the user can change them
// from Settings or the CLI. First matching rule wins. See hive/PLAYBOOK.md.
const S = require('./store');
const M = require('./models');

const PRIORITIES = ['low', 'normal', 'high', 'critical'];

function claudePressure() {
  const p = S.config().policy || {};
  const soft = p.claudeOutputSoftLimit || 0;
  const used = M.usageSummary().claude.output || 0;
  return { used, soft, busy: !!soft && used >= soft };
}

function matches(rule, task, kind) {
  const w = rule.when || {};
  const text = `${task.title || ''} ${task.description || ''} ${task.folder || ''}`.toLowerCase();
  if (w.priority && !w.priority.includes(task.priority || 'normal')) return false;
  if (w.kind && !w.kind.includes(kind)) return false;
  if (w.match && !new RegExp(w.match, 'i').test(text)) return false;
  return true;
}

function triage(task) {
  const policy = S.config().policy || { rules: [] };
  const kind = task.kind || M.classify(task).kind;
  const pressure = claudePressure();
  for (const rule of policy.rules) {
    if (rule.enabled === false || !matches(rule, task, kind)) continue;
    let assignee = rule.assign, why = rule.why;
    if (assignee === '@claude' && rule.unlessClaudeBusy && pressure.busy) {
      assignee = '@agy-cli';
      why = `${rule.why} Claude is past its daily output line (${Math.round(pressure.used / 1000)}k), so a worker takes it and Claude reviews.`;
    }
    return { assignee, rule: rule.id, why, kind, priority: task.priority || 'normal', pressure };
  }
  return { assignee: '@agy-cli', rule: 'fallback', why: 'No rule matched. A worker does it; Claude reviews.', kind, priority: task.priority || 'normal', pressure };
}

module.exports = { triage, claudePressure, PRIORITIES };
