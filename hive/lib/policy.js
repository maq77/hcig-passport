// Triage: who does a ticket. Claude is the head and decides by severity, risk and
// token pressure; the rules live in config.json "policy" so the user can change them
// from Settings or the CLI. First matching rule wins. See hive/PLAYBOOK.md.
const S = require('./store');
const M = require('./models');

const PRIORITIES = ['low', 'normal', 'high', 'critical'];
const ROLES = () => { delete require.cache[require.resolve('../agents/roles')]; return require('../agents/roles'); };

// The specialist for a piece of work: most keyword hits in the title and brief.
function pickAgent(task) {
  if (task.agent) return ROLES().find(r => r.id === task.agent) || null;
  const text = `${task.title || ''} ${task.description || ''}`.toLowerCase();
  let best = null, score = 0;
  for (const r of ROLES()) {
    const hits = (text.match(new RegExp(r.match, 'gi')) || []).length;
    if (hits > score) { best = r; score = hits; }
  }
  return best;
}

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
    const ag = pickAgent(task);
    return { assignee, rule: rule.id, why, kind, priority: task.priority || 'normal', pressure, agent: ag ? ag.id : null, agentName: ag ? ag.name : null };
  }
  return { assignee: '@agy-cli', rule: 'fallback', why: 'No rule matched. A worker does it; Claude reviews.', kind, priority: task.priority || 'normal', pressure };
}

module.exports = { triage, claudePressure, pickAgent, ROLES, PRIORITIES };
