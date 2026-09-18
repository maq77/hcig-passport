#!/usr/bin/env node
// HCIG Hive hub: the one process that owns the watcher, the dispatcher, the API
// and the live event stream. Dashboard: http://localhost:4400
const http = require('http');
const fs = require('fs');
const path = require('path');
const S = require('./lib/store');
const D = require('./lib/dispatch');
const M = require('./lib/models');
const brain = require('./lib/brain');
const watch = require('./lib/watch');
const notify = require('./lib/notify');

const cfg = S.config();
const PORT = +process.env.HIVE_PORT || cfg.port;

function agents() {
  const runs = D.listRuns();
  const running = runs.filter(r => r.state === 'running');
  const tasks = S.loadTasks();
  const ev = S.readEvents(400);
  const lastBy = a => { const e = [...ev].reverse().find(x => x.actor === a || x.actor.startsWith(a)); return e ? { ts: e.ts, msg: e.msg } : null; };
  const out = [{ id: 'claude', label: 'Claude Code', role: 'Head', kind: 'head', model: 'claude-opus-5', state: 'on duty',
    doing: tasks.filter(t => t.assignee === '@claude' && t.status === 'in_progress').map(t => t.id), last: lastBy('@claude') }];
  for (const a of cfg.accounts) {
    if (a.kind === 'cli') {
      const mine = running.filter(r => r.account === a.id);
      out.push({ id: a.id, label: a.label, role: 'Worker', kind: 'cli', enabled: a.enabled, note: a.note,
        state: !a.enabled ? 'off' : mine.length ? 'working' : 'idle', maxParallel: a.maxParallel,
        runs: mine.map(r => ({ id: r.id, task: r.task, model: r.model, effort: r.effort, steps: r.steps, lastStep: r.lastStep, started: r.started })),
        last: lastBy('agy:' + a.id) });
    } else {
      const mine = tasks.filter(t => t.assignee === '@agy-desktop' && t.status !== 'done');
      out.push({ id: a.id, label: a.label, role: 'Designer', kind: 'desktop', enabled: a.enabled, note: a.note,
        state: mine.some(t => t.status === 'in_progress') ? 'working' : mine.length ? 'has tickets' : 'idle',
        doing: mine.map(t => `${t.id} ${t.status}`), last: lastBy('board') });
    }
  }
  return out;
}

function state() {
  return { now: S.now(), port: PORT, tasks: S.loadTasks(), runs: D.listRuns().slice(-40).reverse(), agents: agents(),
    events: S.readEvents(150).reverse(), usage: M.usageSummary(), budget: M.budget(), inbox: S.readInbox().filter(i => !i.read),
    models: { allowed: M.allowed(), routes: cfg.models.routes.map(r => ({ kind: r.kind, model: r.model, effort: r.effort })), effort: cfg.models.effort } };
}

const clients = new Set();
S.onEvent(ev => { try { notify.onEvent(ev); } catch {} });
S.onEvent(ev => { if (ev.type === 'task.update' && ev.data && ev.data.status === 'done') setTimeout(() => D.releaseReady(), 200); });

// Settings the dashboard may change. Everything else in config.json is edited by hand.
function patchConfig(b) {
  const file = path.join(__dirname, 'config.json');
  const c = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (b.budget) Object.assign(c.budget, pick(b.budget, ['dailyTokens', 'warnAt', 'hardStop']));
  if (b.notify) Object.assign(c.notify, pick(b.notify, ['desktop', 'ntfyTopic', 'on']));
  if (typeof b.allowBelowBest === 'boolean') c.models.allowBelowBest = b.allowBelowBest;
  if (b.routes) for (const r of b.routes) { const x = c.models.routes.find(y => y.kind === r.kind); if (x) { if (r.model) x.model = r.model; if (r.effort) x.effort = M.clampEffort(r.effort); } }
  if (b.accounts) for (const a of b.accounts) { const x = c.accounts.find(y => y.id === a.id); if (x) Object.assign(x, pick(a, ['enabled', 'maxParallel', 'label'])); }
  fs.writeFileSync(file, JSON.stringify(c, null, 2));
  S.emit('config', 'Settings changed from the dashboard', {}, 'dashboard');
  return publicConfig();
}
function pick(o, keys) { return Object.fromEntries(keys.filter(k => o[k] !== undefined).map(k => [k, o[k]])); }
function publicConfig() {
  const c = S.config();
  return { budget: c.budget, notify: c.notify, models: c.models, accounts: c.accounts, fullAccess: c.agy.fullAccess, port: c.port };
}
S.onEvent(ev => { const s = `data: ${JSON.stringify(ev)}\n\n`; for (const c of clients) c.write(s); });

function body(req) {
  return new Promise((res, rej) => { let b = ''; req.on('data', d => b += d); req.on('end', () => { try { res(b ? JSON.parse(b) : {}); } catch (e) { rej(e); } }); });
}
function send(res, code, obj, type = 'application/json') {
  res.writeHead(code, { 'Content-Type': type + '; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(type === 'application/json' ? JSON.stringify(obj) : obj);
}

const routes = [
  ['GET', /^\/api\/state$/, () => state()],
  ['GET', /^\/api\/brain$/, () => ({ text: fs.readFileSync(S.P.brain, 'utf8') })],
  ['POST', /^\/api\/brain\/rebuild$/, () => ({ text: brain.build() })],
  ['GET', /^\/api\/tasks$/, () => S.loadTasks()],
  ['POST', /^\/api\/tasks$/, async (req) => { const b = await body(req); const t = S.createTask(b, b.actor || '@claude'); if (b.dispatch) D.dispatch(t.id, b.dispatch === true ? {} : b.dispatch); return t; }],
  ['PATCH', /^\/api\/tasks\/([\w-]+)$/, async (req, m) => { const b = await body(req); const actor = b.actor || '@claude'; delete b.actor; return S.updateTask(m[1], b, actor); }],
  ['POST', /^\/api\/tasks\/([\w-]+)\/dispatch$/, async (req, m) => D.dispatch(m[1], await body(req))],
  ['GET', /^\/api\/tasks\/([\w-]+)\/diff$/, (req, m) => D.diff(m[1])],
  ['POST', /^\/api\/tasks\/([\w-]+)\/merge$/, async (req, m) => ({ output: D.merge(m[1], await body(req)) })],
  ['GET', /^\/api\/tasks\/([\w-]+)\/route$/, (req, m) => M.route(S.getTask(m[1]))],
  ['GET', /^\/api\/runs$/, () => D.listRuns().reverse()],
  ['GET', /^\/api\/runs\/([\w-]+)\/log$/, (req, m, q) => ({ lines: D.runLog(m[1], +(q.get('tail') || 80)) })],
  ['POST', /^\/api\/runs\/([\w-]+)\/kill$/, (req, m) => D.kill(m[1])],
  ['GET', /^\/api\/usage$/, () => M.usageSummary()],
  ['GET', /^\/api\/analytics$/, (req, m, q) => M.analytics(Math.min(90, Math.max(1, +(q.get('days') || 14))))],
  ['GET', /^\/api\/runs\/([\w-]+)\/steps$/, (req, m) => ({ steps: D.steps(m[1]), run: D.listRuns().find(r => r.id === m[1]) || null })],
  ['POST', /^\/api\/tasks\/([\w-]+)\/bestof$/, async (req, m) => D.bestOf(m[1], (await body(req)).models)],
  ['POST', /^\/api\/tasks\/([\w-]+)\/critic$/, (req, m) => D.critic(m[1])],
  ['GET', /^\/api\/config$/, () => publicConfig()],
  ['PATCH', /^\/api\/config$/, async (req) => patchConfig(await body(req))],
  ['POST', /^\/api\/notify\/test$/, () => { notify.send('Hive: test alert', 'Alerts reach you. This is what a finished worker looks like.'); return { ok: true }; }],
  ['GET', /^\/api\/inbox$/, (req, m, q) => S.readInbox({ markRead: q.get('read') === '1' })],
  ['POST', /^\/api\/orders$/, async (req) => { const b = await body(req); return S.pushInbox(b.text, b.from || 'dashboard'); }],
  ['POST', /^\/api\/launch$/, async (req) => { const b = await body(req); return D.launch(b.what, b); }],
  ['POST', /^\/api\/events$/, async (req) => { const b = await body(req); return S.emit(b.type || 'note', b.msg, b.data || {}, b.actor || 'agent'); }],
];

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (req.headers.origin && !/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(req.headers.origin)) return send(res, 403, { error: 'local only' });
  if (url.pathname === '/api/stream') {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
    res.write(': hello\n\n');
    clients.add(res);
    const ping = setInterval(() => res.write(': ping\n\n'), 20000);
    req.on('close', () => { clearInterval(ping); clients.delete(res); });
    return;
  }
  for (const [method, re, fn] of routes) {
    const m = url.pathname.match(re);
    if (m && req.method === method) {
      try { return send(res, 200, await fn(req, m, url.searchParams)); }
      catch (e) { return send(res, 400, { error: e.message }); }
    }
  }
  if (req.method === 'GET') {
    const file = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
    const p = path.join(__dirname, 'ui', path.normalize(file).replace(/^(\.\.[\/\\])+/, ''));
    if (fs.existsSync(p) && fs.statSync(p).isFile()) {
      const type = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' }[path.extname(p)] || 'text/plain';
      return send(res, 200, fs.readFileSync(p), type);
    }
  }
  send(res, 404, { error: 'not found' });
});

server.on('error', e => {
  if (e.code === 'EADDRINUSE') { console.log(`Hive hub already running on http://localhost:${PORT}`); process.exit(0); }
  throw e;
});

server.listen(PORT, '127.0.0.1', () => {
  D.recoverLost();
  const n = S.importLegacyBoard();
  if (!n) S.renderBoard();
  fs.writeFileSync(path.join(S.P.state, 'hub.pid'), String(process.pid));
  watch.start({
    attribute: file => {
      for (const { run } of D.live.values()) if (run.isolated && file.startsWith(run.cwd)) return `agy:${run.account}`;
      return null;
    },
  });
  S.emit('hive.start', `Hive hub up on http://localhost:${PORT}`);
  console.log(`HCIG Hive hub on http://localhost:${PORT}`);
});

process.on('uncaughtException', e => { S.emit('hive.error', 'Hub error: ' + e.message); console.error(e); });
