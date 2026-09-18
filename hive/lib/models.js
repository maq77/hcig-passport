// Model router and usage ledger.
// Rule set by the user 2026-09-18: only the best models, effort default high,
// never below medium. Routes pick a model by task kind; on quota the router moves
// to the next best model, and only drops below "best" when config allows it.
const fs = require('fs');
const path = require('path');
const S = require('./store');

const EFFORT = ['low', 'medium', 'high'];
const USAGE = path.join(S.P.state, 'usage.json');
const EXHAUSTED = path.join(S.P.state, 'exhausted.json');

function clampEffort(e) {
  const m = S.config().models.effort;
  const want = EFFORT.includes(e) ? e : m.default;
  return EFFORT.indexOf(want) < EFFORT.indexOf(m.minimum) ? m.minimum : want;
}

function allowed() {
  const m = S.config().models;
  return [...m.tiers.best, ...m.tiers.strong, ...(m.allowBelowBest ? m.tiers.fallbackBelowBest : [])];
}

function classify(task) {
  const m = S.config().models;
  if (task.kind) { const r = m.routes.find(x => x.kind === task.kind); if (r) return r; }
  const text = `${task.title} ${task.description || ''}`.toLowerCase();
  let best = null, score = 0;
  for (const r of m.routes) {
    const hits = (text.match(new RegExp(r.match, 'gi')) || []).length;
    if (hits > score) { best = r; score = hits; }
  }
  return best || m.default;
}

// Pick model + effort for a task and account, skipping anything out of quota.
function route(task, { model, effort, account } = {}) {
  const r = classify(task);
  const pool = allowed();
  const chain = [...new Set([model, r.model, ...pool].filter(Boolean))].filter(x => pool.includes(x) || x === model);
  const ex = loadExhausted();
  const pick = chain.find(x => !isExhausted(ex, account, x)) || chain[0];
  return { kind: r.kind, model: pick, effort: clampEffort(effort || r.effort), chain };
}

// Next model to try after a quota failure.
function fallback(current, account) {
  const pool = allowed();
  const ex = loadExhausted();
  return pool.find(x => x !== current && !isExhausted(ex, account, x)) || null;
}

// ---------- quota ----------
function loadExhausted() { try { return JSON.parse(fs.readFileSync(EXHAUSTED, 'utf8')); } catch { return {}; } }
function isExhausted(ex, account, model) {
  const until = ex[`${account}|${model}`] || ex[`${account}|*`];
  return until && Date.parse(until) > Date.now();
}
function markExhausted(account, model, minutes = 60) {
  const ex = loadExhausted();
  ex[`${account}|${model}`] = new Date(Date.now() + minutes * 60000).toISOString();
  fs.writeFileSync(EXHAUSTED, JSON.stringify(ex, null, 2));
  S.emit('quota', `${model} on ${account} hit its quota. Resting it for ${minutes} min.`, { account, model }, 'router');
}

// ---------- usage ledger ----------
function loadUsage() { try { return JSON.parse(fs.readFileSync(USAGE, 'utf8')); } catch { return {}; } }
function recordUsage(account, model, u = {}, extra = {}) {
  const all = loadUsage();
  const day = S.today();
  const k = `${day}|${account}|${model}`;
  const r = all[k] || { day, account, model, runs: 0, input: 0, output: 0, thinking: 0, cached: 0, total: 0, seconds: 0, fails: 0 };
  r.runs += 1;
  r.input += u.input_tokens || 0;
  r.output += u.output_tokens || 0;
  r.thinking += u.thinking_tokens || 0;
  r.cached += u.cache_read_tokens || 0;
  r.total += u.total_tokens || 0;
  r.seconds += Math.round(extra.seconds || 0);
  if (extra.failed) r.fails += 1;
  all[k] = r;
  fs.writeFileSync(USAGE, JSON.stringify(all, null, 2));
  return r;
}

// Claude Code's own usage, read from its local transcripts for this project.
function claudeUsageToday() {
  const os = require('os');
  const slug = S.ROOT.replace(/[:\\/ ]/g, '-');
  const dir = path.join(os.homedir(), '.claude', 'projects', slug);
  const day = S.today();
  const out = { day, messages: 0, input: 0, output: 0, cacheRead: 0, cacheWrite: 0, models: {} };
  let files = [];
  try { files = fs.readdirSync(dir).filter(f => f.endsWith('.jsonl')).map(f => path.join(dir, f)); } catch { return out; }
  for (const f of files) {
    let st; try { st = fs.statSync(f); } catch { continue; }
    if (st.mtime.toISOString().slice(0, 10) < day) continue;
    for (const line of fs.readFileSync(f, 'utf8').split('\n')) {
      if (!line.includes('"usage"') || !line.includes(day)) continue;
      try {
        const j = JSON.parse(line);
        if (!(j.timestamp || '').startsWith(day)) continue;
        const u = j.message && j.message.usage; if (!u) continue;
        out.messages++;
        out.input += u.input_tokens || 0; out.output += u.output_tokens || 0;
        out.cacheRead += u.cache_read_input_tokens || 0; out.cacheWrite += u.cache_creation_input_tokens || 0;
        const m = j.message.model || 'unknown'; out.models[m] = (out.models[m] || 0) + (u.output_tokens || 0);
      } catch {}
    }
  }
  return out;
}

function usageSummary() {
  const all = Object.values(loadUsage());
  const day = S.today();
  return {
    today: all.filter(r => r.day === day),
    last7: all.filter(r => r.day >= new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10)),
    exhausted: Object.entries(loadExhausted()).filter(([, t]) => Date.parse(t) > Date.now()).map(([k, until]) => ({ key: k, until })),
    claude: claudeUsageToday(),
  };
}


// ---------- daily token budget ----------
function budget() {
  const cfg = S.config().budget || {};
  const limit = cfg.dailyTokens || 0;
  const used = Object.values(loadUsage()).filter(r => r.day === S.today()).reduce((a, r) => a + r.total, 0);
  return { limit, used, pct: limit ? used / limit : 0, over: !!limit && used >= limit, warnAt: cfg.warnAt || 0.8, hardStop: cfg.hardStop !== false };
}
let warned = '';
function checkBudget() {
  const b = budget();
  if (!b.limit) return b;
  const key = S.today() + (b.over ? 'stop' : b.pct >= b.warnAt ? 'warn' : '');
  if (key !== warned && b.pct >= b.warnAt) {
    warned = key;
    S.emit(b.over ? 'budget.stop' : 'budget.warn', `Workers used ${Math.round(b.pct * 100)}% of today's token budget (${b.used.toLocaleString()} of ${b.limit.toLocaleString()}).${b.over && b.hardStop ? ' New workers are paused until tomorrow.' : ''}`, b, 'router');
  }
  return b;
}

// ---------- analytics ----------
function analytics(days = 14) {
  const since = new Date(Date.now() - (days - 1) * 864e5).toISOString().slice(0, 10);
  const rows = Object.values(loadUsage()).filter(r => r.day >= since);
  const dayList = [];
  for (let i = days - 1; i >= 0; i--) dayList.push(new Date(Date.now() - i * 864e5).toISOString().slice(0, 10));
  const models = [...new Set(rows.map(r => r.model))];
  const perDay = dayList.map(d => ({ day: d, ...Object.fromEntries(models.map(m => [m, rows.filter(r => r.day === d && r.model === m).reduce((a, r) => a + r.total, 0)])) }));
  const perModel = models.map(m => {
    const rs = rows.filter(r => r.model === m);
    const runs = rs.reduce((a, r) => a + r.runs, 0), fails = rs.reduce((a, r) => a + r.fails, 0);
    return { model: m, runs, fails, success: runs ? (runs - fails) / runs : null, tokens: rs.reduce((a, r) => a + r.total, 0), avgSeconds: runs ? Math.round(rs.reduce((a, r) => a + r.seconds, 0) / runs) : 0 };
  });
  let runs = [];
  try { runs = JSON.parse(fs.readFileSync(path.join(S.P.state, 'runs.json'), 'utf8')).filter(r => (r.started || '').slice(0, 10) >= since && r.state !== 'running'); } catch {}
  const kinds = [...new Set(runs.map(r => r.kind || 'general'))].map(k => {
    const rs = runs.filter(r => (r.kind || 'general') === k);
    const ok = rs.filter(r => r.state === 'done');
    return { kind: k, runs: rs.length, done: ok.length, avgSeconds: ok.length ? Math.round(ok.reduce((a, r) => a + (r.seconds || (Date.parse(r.ended) - Date.parse(r.started)) / 1000 || 0), 0) / ok.length) : 0 };
  });
  const byTicket = {};
  for (const r of runs) byTicket[r.task] = (byTicket[r.task] || 0) + (r.tokens || 0);
  const topTickets = Object.entries(byTicket).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([task, tokens]) => ({ task, tokens }));
  const totals = { runs: runs.length, done: runs.filter(r => r.state === 'done').length, tokens: rows.reduce((a, r) => a + r.total, 0) };

  // Flow of work, from the event log: tickets opened and finished per day,
  // and when the fleet is busy (events per weekday and hour, local time).
  const ev = S.readEvents(20000).filter(e => e.ts.slice(0, 10) >= since);
  const flow = dayList.map(d => ({
    day: d,
    created: ev.filter(e => e.type === 'task.create' && e.ts.slice(0, 10) === d).length,
    done: new Set(ev.filter(e => e.type === 'task.update' && e.data && e.data.status === 'done' && e.ts.slice(0, 10) === d).map(e => e.data.id)).size,
  }));
  const hours = Array.from({ length: 7 }, () => Array(24).fill(0));
  for (const e of ev) { if (e.type === 'files.changed') continue; const t = new Date(e.ts); hours[t.getDay()][t.getHours()]++; }
  const tasks = S.loadTasks();
  const workload = ['@claude', '@agy-cli', '@agy-desktop'].map(a => ({
    assignee: a,
    open: tasks.filter(t => t.assignee === a && t.status !== 'done').length,
    review: tasks.filter(t => t.assignee === a && t.status === 'needs_review').length,
    done: tasks.filter(t => t.assignee === a && t.status === 'done').length,
  }));
  const status = ['todo', 'in_progress', 'needs_review', 'blocked', 'done'].map(s => ({ status: s, count: tasks.filter(t => t.status === s).length }));
  const consults = ev.filter(e => e.type === 'consult.end').length;
  return { days, since, models, perDay, perModel, kinds, topTickets, totals, budget: budget(), flow, hours, workload, status, consults };
}

function takesEffort(model) { return (S.config().models.effortFlag || ['gemini-']).some(p => model.startsWith(p)); }

module.exports = { budget, checkBudget, analytics, takesEffort, route, fallback, classify, clampEffort, markExhausted, recordUsage, usageSummary, allowed };
