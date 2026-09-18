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

function takesEffort(model) { return (S.config().models.effortFlag || ['gemini-']).some(p => model.startsWith(p)); }

module.exports = { takesEffort, route, fallback, classify, clampEffort, markExhausted, recordUsage, usageSummary, allowed };
