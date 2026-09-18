// Scheduled jobs. Checked once a minute. Two kinds:
//   standup: a summary built from the event log. Free, no model runs.
//   ticket:  creates a ticket from a template and, if asked, starts a worker.
// A job runs at most once per day at or after its time, and catches up once if the
// PC was asleep at that time. Last-run dates live in .hive/state/schedule.json.
const fs = require('fs');
const path = require('path');
const S = require('./store');
const M = require('./models');

const FILE = path.join(S.P.state, 'schedule.json');
const load = () => { try { return JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch { return {}; } };
const save = s => fs.writeFileSync(FILE, JSON.stringify(s, null, 2));

function localDay(d = new Date()) { return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); }
function hhmm(d = new Date()) { return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; }

function due(job, last, now = new Date()) {
  if (!job.enabled) return false;
  const day = now.getDay();
  if (job.days === 'weekdays' && (day === 0 || day === 6)) return false;
  if (Array.isArray(job.days) && !job.days.includes(day)) return false;
  return hhmm(now) >= job.at && last !== localDay(now);
}

// ---------- standup ----------
function standup(sinceHours = 24) {
  const since = Date.now() - sinceHours * 3600e3;
  const ev = S.readEvents(3000).filter(e => Date.parse(e.ts) >= since);
  const tasks = S.loadTasks();
  const title = id => (tasks.find(t => t.id === id) || {}).title || '';
  const uniq = a => [...new Set(a)];
  const doneIds = uniq(ev.filter(e => e.type === 'task.update' && e.data && e.data.status === 'done').map(e => e.data.id));
  const runs = ev.filter(e => e.type === 'run.end');
  const out = {
    since: new Date(since).toISOString(),
    done: doneIds.map(id => ({ id, title: title(id) })),
    review: tasks.filter(t => t.status === 'needs_review').map(t => ({ id: t.id, title: t.title })),
    blocked: tasks.filter(t => t.status === 'blocked').map(t => ({ id: t.id, title: t.title, why: (t.notes[t.notes.length - 1] || {}).text || '' })),
    running: tasks.filter(t => t.status === 'in_progress').map(t => ({ id: t.id, title: t.title, who: t.assignee })),
    runs: { total: runs.length, ok: runs.filter(e => e.data && e.data.state === 'done').length },
    deploys: ev.filter(e => e.type === 'deploy.alert').map(e => ({ ts: e.ts, msg: e.msg })),
    quota: ev.filter(e => e.type === 'quota').map(e => e.msg),
    orders: S.readInbox().filter(i => !i.read).length,
    budget: M.budget(),
  };
  const parts = [];
  if (out.done.length) parts.push(`${out.done.length} done`);
  if (out.review.length) parts.push(`${out.review.length} to review`);
  if (out.blocked.length) parts.push(`${out.blocked.length} blocked`);
  if (out.deploys.length) parts.push(`${out.deploys.length} deploy command${out.deploys.length > 1 ? 's' : ''}`);
  if (out.orders) parts.push(`${out.orders} order${out.orders > 1 ? 's' : ''} waiting`);
  out.line = parts.length ? parts.join(', ') + '.' : 'Quiet day. Nothing done, nothing waiting.';
  return out;
}

function runJob(job, reason = 'schedule') {
  if (job.kind === 'standup') {
    const s = standup(job.sinceHours || 24);
    fs.writeFileSync(path.join(S.P.state, 'standup.json'), JSON.stringify(s, null, 2));
    S.emit('standup', `Standup: ${s.line}`, { job: job.id }, 'schedule');
    return s;
  }
  if (job.kind === 'ticket') {
    const D = require('./dispatch');
    const tpl = job.ticket || {};
    const t = S.createTask({ ...tpl, title: `${tpl.title} (${localDay()})`, assignee: tpl.assignee || '@agy-cli' }, 'schedule');
    S.emit('schedule', `${job.label || job.id} created ${t.id}`, { job: job.id, id: t.id }, 'schedule');
    if (job.dispatch && t.assignee === '@agy-cli') {
      try { D.dispatch(t.id); } catch (e) { S.updateTask(t.id, { note: `Scheduled start failed: ${e.message}` }, 'schedule'); }
    }
    return t;
  }
  throw new Error(`Unknown job kind ${job.kind}`);
}

function tick() {
  const jobs = S.config().schedules || [];
  const state = load();
  for (const job of jobs) {
    if (!due(job, state[job.id])) continue;
    state[job.id] = localDay();
    save(state);
    try { runJob(job); } catch (e) { S.emit('hive.error', `Scheduled job ${job.id} failed: ${e.message}`); }
  }
}

function list() {
  const state = load();
  return (S.config().schedules || []).map(j => ({ ...j, lastRun: state[j.id] || null }));
}

function start() { tick(); return setInterval(tick, 60000); }

module.exports = { start, tick, runJob, standup, list };
