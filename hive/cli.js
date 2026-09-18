#!/usr/bin/env node
// HCIG Hive command line. Used by the user, by Claude, and by the agy workers to report.
//   node hive/cli.js status                      fleet, tickets, usage at a glance
//   node hive/cli.js add "title" [--to @agy-cli] [--desc ".."] [--folder x] [--accept "a;b"] [--kind code] [--go]
//   node hive/cli.js go <ID> [--account a1] [--model m] [--effort high] [--main] [--say ".."]
//   node hive/cli.js note <ID> "text"            add a progress note
//   node hive/cli.js status <ID> <status>        todo | in_progress | needs_review | blocked | done
//   node hive/cli.js log <RUN> [n]               last n steps of a worker run
//   node hive/cli.js kill <RUN>                  stop a worker
//   node hive/cli.js diff <ID> | merge <ID>      review and merge a worker branch
//   node hive/cli.js bestof <ID> [models..] | critic <ID> | analytics [days]
//   add ... --after T-001,T-002 --auto            wait for tickets, then start on its own
//   node hive/cli.js event <type> "msg"          post an event (standup, deploy, note)
//   node hive/cli.js policy | triage "title" | set <path> <value> | config [path]
//   node hive/cli.js consult "question" [--files a,b] [--model m]   read-only answer from agy (/delegate)
//   node hive/cli.js standup | jobs | job <id>
//   node hive/cli.js agents | role <id> [prompt] [--claude]    list specialists, open one live
//   add ... --agent seo-specialist                pick the specialist (default: chosen from the wording)
//   node hive/cli.js usage | inbox | brain | open | launch <agy|claude|desktop> [--account a1]
const { api, PORT } = require('./lib/client');

const argv = process.argv.slice(2);
const flag = (n, d) => { const i = argv.indexOf('--' + n); if (i < 0) return d; const v = argv[i + 1]; argv.splice(i, v && !v.startsWith('--') ? 2 : 1); return v && !v.startsWith('--') ? v : true; };
const actor = process.env.HIVE_ACTOR || (process.env.CLAUDECODE ? '@claude' : 'cli');

const pad = (s, n) => String(s).padEnd(n).slice(0, n);
const k = n => n > 1e6 ? (n / 1e6).toFixed(1) + 'M' : n > 1e3 ? Math.round(n / 1e3) + 'k' : n;

async function main() {
  const cmd = argv.shift();
  if (!cmd || (cmd === 'status' && !argv.length)) {
    const s = await api('GET', '/api/state');
    console.log(`HCIG Hive  http://localhost:${PORT}\n\nAGENTS`);
    for (const a of s.agents) {
      console.log(`  ${pad(a.label, 22)} ${pad(a.state, 12)} ${(a.runs || []).map(r => `${r.task} ${r.model} ${r.steps} steps`).join('; ') || (a.doing || []).join(', ')}`);
    }
    console.log('\nTICKETS');
    for (const t of s.tasks.filter(t => t.status !== 'done')) console.log(`  ${pad(t.id, 18)} ${pad(t.status, 13)} ${pad(t.assignee, 14)} ${t.title.slice(0, 70)}`);
    console.log('\nUSAGE TODAY');
    for (const u of s.usage.today) console.log(`  ${pad(u.account, 8)} ${pad(u.model, 28)} ${u.runs} runs  ${k(u.total)} tokens  ${u.fails} failed`);
    const c = s.usage.claude; console.log(`  ${pad('claude', 8)} ${pad('Claude Code (head)', 28)} ${c.messages} msgs  ${k(c.output)} out  ${k(c.cacheRead)} cache read`);
    if (s.usage.exhausted.length) console.log('  resting: ' + s.usage.exhausted.map(e => `${e.key} until ${e.until.slice(11, 16)}`).join(', '));
    if (s.inbox.length) console.log(`\nINBOX: ${s.inbox.length} unread order(s). Run: node hive/cli.js inbox`);
    return;
  }
  switch (cmd) {
    case 'add': {
      const after = flag('after', ''), auto = flag('auto'), agent = flag('agent');
      const to = flag('to', 'auto'), desc = flag('desc', ''), folder = flag('folder', ''), accept = flag('accept', ''), kind = flag('kind'), go = flag('go'), prio = flag('priority', 'normal');
      const t = await api('POST', '/api/tasks', { title: argv.join(' '), assignee: to, description: desc, folder, kind, priority: prio, acceptance: accept ? accept.split(';').map(s => s.trim()) : [], actor, dispatch: go ? {} : undefined, dependsOn: after ? after.split(',') : [], autoDispatch: !!auto, agent });
      return console.log(`${t.id} created for ${t.assignee}${t.triage ? ` (${t.triage.rule}: ${t.triage.why})` : ''}${go ? ', worker started' : ''}`);
    }
    case 'go': case 'dispatch': {
      const id = argv.shift();
      const r = await api('POST', `/api/tasks/${id}/dispatch`, { account: flag('account'), model: flag('model'), effort: flag('effort'), workspace: flag('main') ? 'main' : flag('worktree') ? 'worktree' : undefined, instructions: flag('say') });
      return console.log(`${r.id} running on ${r.account} with ${r.model} (${r.effort}) in ${r.cwd}`);
    }
    case 'note': { const id = argv.shift(); await api('PATCH', `/api/tasks/${id}`, { note: argv.join(' '), actor }); return console.log('noted'); }
    case 'status': { const [id, st] = argv; await api('PATCH', `/api/tasks/${id}`, { status: st, actor }); return console.log(`${id} is ${st}`); }
    case 'log': { const r = await api('GET', `/api/runs/${argv[0]}/log?tail=${argv[1] || 60}`); return console.log(r.lines.join('\n')); }
    case 'kill': { await api('POST', `/api/runs/${argv[0]}/kill`); return console.log('stopped'); }
    case 'diff': { const d = await api('GET', `/api/tasks/${argv[0]}/diff`); return console.log([d.note, d.commits, d.stat, d.diff].filter(Boolean).join('\n\n')); }
    case 'merge': { const r = await api('POST', `/api/tasks/${argv[0]}/merge`, {}); return console.log(r.output); }
    case 'bestof': { const id = argv.shift(); const r = await api('POST', `/api/tasks/${id}/bestof`, { models: argv.length ? argv : undefined }); return console.log(r.map(x => `${x.id} on ${x.model}`).join('\n')); }
    case 'critic': { const r = await api('POST', `/api/tasks/${argv[0]}/critic`); return console.log(`${r.id} reviewing with ${r.model}`); }
    case 'analytics': { const a = await api('GET', `/api/analytics?days=${argv[0] || 14}`); return console.log(JSON.stringify({ totals: a.totals, perModel: a.perModel, kinds: a.kinds, budget: a.budget }, null, 2)); }
    case 'set': { const r = await api('POST', '/api/config/set', { path: argv[0], value: argv.slice(1).join(' ') }); return console.log(`${r.path}: ${JSON.stringify(r.before)} -> ${JSON.stringify(r.value)}`); }
    case 'config': case 'settings': { const c = await api('GET', '/api/config'); return console.log(JSON.stringify(argv[0] ? argv[0].split('.').reduce((o, k) => Array.isArray(o) ? o.find(x => x.id === k || x.kind === k) : o && o[k], c) : c, null, 2)); }
    case 'policy': {
      const c = await api('GET', '/api/config');
      console.log(`Triage mode ${c.policy.mode}, auto start ${c.policy.autoStart}, Claude output today ${Math.round(c.pressure.used / 1000)}k of ${Math.round(c.pressure.soft / 1000)}k soft line${c.pressure.busy ? ' (busy: shifting work to agy)' : ''}
`);
      for (const r of c.policy.rules) console.log(`  ${r.enabled === false ? 'off' : 'on '} ${pad(r.id, 14)} -> ${pad(r.assign, 12)} ${r.label}`);
      return console.log('\nChange: node hive/cli.js set policy.rules.<id>.assign @claude   |   set policy.claudeOutputSoftLimit 600000');
    }
    case 'triage': { const r = await api('POST', '/api/triage', { title: argv.join(' '), description: flag('desc', ''), priority: flag('priority', 'normal') }); return console.log(`${r.assignee} (${r.rule}, ${r.kind}): ${r.why}`); }
    case 'consult': case 'ask': {
      const files = flag('files', ''); const model = flag('model');
      const r = await api('POST', '/api/consult', { question: argv.join(' '), files: files ? files.split(',') : [], model });
      return console.log(`[${r.model}, ${r.seconds}s, ${k(r.tokens)} tokens]

${r.answer}`);
    }
    case 'standup': { const s = await api('GET', '/api/standup'); console.log(s.line); for (const [h, xs] of [['Done', s.done], ['To review', s.review], ['Blocked', s.blocked], ['Running', s.running]]) if (xs.length) console.log(`
${h}
` + xs.map(x => `  ${pad(x.id, 18)} ${x.title}`).join('\n')); return; }
    case 'jobs': { const j = await api('GET', '/api/schedules'); return console.log(j.map(x => `  ${x.enabled ? 'on ' : 'off'} ${pad(x.id, 16)} ${x.at} ${pad(Array.isArray(x.days) ? x.days.join(',') : x.days, 9)} last ${x.lastRun || 'never'}  ${x.label}`).join('\n')); }
    case 'job': { const r = await api('POST', `/api/schedules/${argv[0]}/run`); return console.log(r.line || r.id || 'ran'); }
    case 'agents': { const a = await api('GET', '/api/agents'); return console.log(a.map(r => `  ${pad(r.id, 24)} ${pad(r.lead, 12)} ${pad(r.agyModel, 26)} open ${r.open}${r.running.length ? '  RUNNING' : ''}\n      ${r.when}`).join('\n')); }
    case 'role': { const id = argv.shift(); const w = flag('claude') ? 'claude' : 'agy'; const r = await api('POST', '/api/launch', { what: 'role', role: id, with: w, prompt: argv.join(' ') }); return console.log(`${r.title} opened`); }
    case 'route': { const r = await api('GET', `/api/tasks/${argv[0]}/route`); return console.log(JSON.stringify(r, null, 2)); }
    case 'usage': { const u = await api('GET', '/api/usage'); return console.log(JSON.stringify(u, null, 2)); }
    case 'inbox': { const items = await api('GET', '/api/inbox?read=1'); return console.log(items.filter(i => !i.read).map(i => `${i.ts.slice(0, 16)} ${i.from}: ${i.text}`).join('\n') || 'Inbox empty.'); }
    case 'event': { const type = argv.shift(); await api('POST', '/api/events', { type, msg: argv.join(' '), actor }); return console.log('logged'); }
    case 'brain': { const b = await api('GET', '/api/brain'); return console.log(b.text); }
    case 'launch': { const r = await api('POST', '/api/launch', { what: argv[0], account: flag('account') }); return console.log(r.title || 'opened'); }
    case 'open': { require('child_process').spawn('cmd', ['/c', 'start', '', `http://localhost:${PORT}`], { detached: true, stdio: 'ignore' }).unref(); return; }
    case 'notify': { const category = flag('category', 'update'), url = flag('url', `http://localhost:${PORT}`), urgent = !!flag('urgent'); const title = argv.shift() || 'Hive Alert'; const body = argv.join(' ') || ''; require('./lib/notify').send(title, body, { category, url, urgent }); return console.log('Notification triggered'); }
    case 'hub': { await require('./lib/client').ensureHub(); return console.log(`Hub running on http://localhost:${PORT}`); }
    default: console.log(require('fs').readFileSync(__filename, 'utf8').split('\n').filter(l => l.startsWith('//')).join('\n'));
  }
}
main().catch(e => { console.error('Hive: ' + e.message); process.exit(1); });
