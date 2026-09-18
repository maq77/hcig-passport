#!/usr/bin/env node
// HCIG Hive MCP server (stdio). Gives Claude Code, the head, native tools to run
// the fleet. Every tool is a thin call to the hub, which it starts if needed.
const { api } = require('./lib/client');

const str = (d) => ({ type: 'string', description: d });
const TOOLS = [
  { name: 'hive_status', description: 'Fleet at a glance: agents and what each is doing, open tickets, running workers, usage today, unread orders from the dashboard.', inputSchema: { type: 'object', properties: {} },
    run: async () => {
      const s = await api('GET', '/api/state');
      return { agents: s.agents, tickets: s.tasks.filter(t => t.status !== 'done').map(t => ({ id: t.id, status: t.status, assignee: t.assignee, title: t.title, updated: t.updated })),
        running: s.runs.filter(r => r.state === 'running'), usage: s.usage, unreadOrders: s.inbox, recent: s.events.filter(e => e.type !== 'files.changed').slice(0, 25) };
    } },
  { name: 'hive_create_task', description: 'Create a ticket. Set dispatch=true to start an agy worker on it right away. The model is picked by the router from the task kind unless you pass one.',
    inputSchema: { type: 'object', required: ['title'], properties: {
      title: str('Short title'), description: str('What to do, in full. The worker starts cold.'), acceptance: { type: 'array', items: { type: 'string' }, description: 'Acceptance criteria' },
      assignee: str('Omit (or "auto") to let the triage rules decide. Or @agy-cli, @agy-desktop, @claude'), folder: str('Folder or path the work is in'), priority: str('low | normal | high | critical'),
      kind: str('Force a route: design | content | code | review | bulk | research'), dispatch: { type: 'boolean' },
      dependsOn: { type: 'array', items: { type: 'string' }, description: 'Ticket ids that must be done first' }, autoDispatch: { type: 'boolean', description: 'Start a worker automatically once dependsOn are all done' } } },
    run: a => api('POST', '/api/tasks', { ...a, actor: '@claude', dispatch: a.dispatch ? {} : undefined }) },
  { name: 'hive_dispatch', description: 'Start an Antigravity CLI worker on a ticket. Account, model and effort are chosen automatically (best models only, effort high by default, never below medium). Override if needed.',
    inputSchema: { type: 'object', required: ['id'], properties: { id: str('Ticket id'), account: str('a1 | a2'), model: str('agy model slug'), effort: str('medium | high'),
      workspace: str('worktree | main. Default: worktree when the folder is tracked in git'), instructions: str('Extra instructions for this run') } },
    run: a => api('POST', `/api/tasks/${a.id}/dispatch`, a) },
  { name: 'hive_update_task', description: 'Change a ticket: status (todo, in_progress, needs_review, blocked, done), assignee, description, or add a note.',
    inputSchema: { type: 'object', required: ['id'], properties: { id: str('Ticket id'), status: str('New status'), assignee: str('New assignee'), note: str('A note to append'), description: str('New description') } },
    run: ({ id, ...rest }) => api('PATCH', `/api/tasks/${id}`, { ...rest, actor: '@claude' }) },
  { name: 'hive_run_log', description: 'Read what a worker run did: its tool steps, outputs and final answer.',
    inputSchema: { type: 'object', required: ['run'], properties: { run: str('Run id'), tail: { type: 'number' } } },
    run: a => api('GET', `/api/runs/${a.run}/log?tail=${a.tail || 80}`) },
  { name: 'hive_review', description: 'The diff a worker produced on its branch against main, with commits and stat, for review.',
    inputSchema: { type: 'object', required: ['id'], properties: { id: str('Ticket id') } },
    run: a => api('GET', `/api/tasks/${a.id}/diff`) },
  { name: 'hive_merge', description: 'Merge a reviewed worker branch into main, remove its worktree and mark the ticket done. Run npm test first.',
    inputSchema: { type: 'object', required: ['id'], properties: { id: str('Ticket id') } },
    run: a => api('POST', `/api/tasks/${a.id}/merge`, {}) },
  { name: 'hive_bestof', description: 'Best of N: run the same ticket on several best models at once, each in its own branch, so the user can pick the better result. Good for design and copy options.',
    inputSchema: { type: 'object', required: ['id'], properties: { id: str('Ticket id'), models: { type: 'array', items: { type: 'string' }, description: 'Models to compare. Default: the best tier.' } } },
    run: a => api('POST', `/api/tasks/${a.id}/bestof`, { models: a.models }) },
  { name: 'hive_critic', description: 'Second opinion: a different model from the author reviews the work on a ticket and writes findings as notes, without editing.',
    inputSchema: { type: 'object', required: ['id'], properties: { id: str('Ticket id to review') } },
    run: a => api('POST', `/api/tasks/${a.id}/critic`) },
  { name: 'hive_analytics', description: 'Analytics over N days: tokens per model per day, success rate and average time per model, time per task kind, most expensive tickets, budget.',
    inputSchema: { type: 'object', properties: { days: { type: 'number' } } },
    run: a => api('GET', `/api/analytics?days=${a.days || 14}`) },
  { name: 'hive_triage', description: 'Ask the triage rules who should do a piece of work (Claude or an agy worker) and why, before creating a ticket. Tickets created with no assignee are triaged automatically.',
    inputSchema: { type: 'object', required: ['title'], properties: { title: str('Title'), description: str('Description'), priority: str('low | normal | high | critical') } },
    run: a => api('POST', '/api/triage', a) },
  { name: 'hive_consult', description: 'The /delegate pattern: ask an agy model a read-only question (second opinion, large file or folder reading) and get the answer back now. No ticket, no edits. Usage is tracked. Prefer this over dispatch when you need an answer, not a change.',
    inputSchema: { type: 'object', required: ['question'], properties: { question: str('The question, with everything the model needs'), files: { type: 'array', items: { type: 'string' }, description: 'Absolute paths to read' }, model: str('Default gemini-3.1-pro-high') } },
    run: a => api('POST', '/api/consult', a) },
  { name: 'hive_settings', description: 'Read Hive settings (budget, triage policy and rules, schedules, review, accounts, models) or change one by dotted path, e.g. budget.dailyTokens, policy.rules.design.assign, schedules.standup.at, review.autoCritic.',
    inputSchema: { type: 'object', properties: { path: str('Dotted path to change. Omit to read everything.'), value: str('New value') } },
    run: a => a.path ? api('POST', '/api/config/set', { path: a.path, value: a.value }) : api('GET', '/api/config') },
  { name: 'hive_standup', description: 'What happened in the last N hours: done, to review, blocked, running, deploys, orders.',
    inputSchema: { type: 'object', properties: { hours: { type: 'number' } } },
    run: a => api('GET', `/api/standup?hours=${a.hours || 24}`) },
  { name: 'hive_kill', description: 'Stop a running worker.', inputSchema: { type: 'object', required: ['run'], properties: { run: str('Run id') } },
    run: a => api('POST', `/api/runs/${a.run}/kill`) },
  { name: 'hive_inbox', description: 'Read and clear orders the user typed into the dashboard for Claude.', inputSchema: { type: 'object', properties: {} },
    run: async () => (await api('GET', '/api/inbox?read=1')).filter(i => !i.read) },
  { name: 'hive_usage', description: 'Token usage per account and model today and over 7 days, models resting after a quota hit, and Claude Code usage today.', inputSchema: { type: 'object', properties: {} },
    run: () => api('GET', '/api/usage') },
  { name: 'hive_launch', description: 'Open an interactive session in Windows Terminal: agy (under an account), claude, or the Antigravity Desktop app.',
    inputSchema: { type: 'object', required: ['what'], properties: { what: str('agy | claude | desktop'), account: str('a1 | a2') } },
    run: a => api('POST', '/api/launch', a) },
  { name: 'hive_brain', description: 'The shared brain every agent reads: rules, handover, memory index, open tickets, latest activity. Pass rebuild=true after changing memory.',
    inputSchema: { type: 'object', properties: { rebuild: { type: 'boolean' } } },
    run: a => a.rebuild ? api('POST', '/api/brain/rebuild') : api('GET', '/api/brain') },
];

function reply(id, result) { process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id, result }) + '\n'); }
function fail(id, code, message) { process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id, error: { code, message } }) + '\n'); }

async function handle(msg) {
  const { id, method, params } = msg;
  if (method === 'initialize') return reply(id, { protocolVersion: (params && params.protocolVersion) || '2025-06-18', capabilities: { tools: {} }, serverInfo: { name: 'hcig-hive', version: '1.0.0' } });
  if (method === 'ping') return reply(id, {});
  if (method === 'tools/list') return reply(id, { tools: TOOLS.map(({ run, ...t }) => t) });
  if (method === 'tools/call') {
    const t = TOOLS.find(x => x.name === params.name);
    if (!t) return fail(id, -32602, `Unknown tool ${params.name}`);
    try {
      const out = await t.run(params.arguments || {});
      return reply(id, { content: [{ type: 'text', text: typeof out === 'string' ? out : JSON.stringify(out, null, 2) }] });
    } catch (e) { return reply(id, { content: [{ type: 'text', text: 'Hive error: ' + e.message }], isError: true }); }
  }
  if (id !== undefined) fail(id, -32601, `Method not found: ${method}`);
}

let buf = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', d => {
  buf += d;
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1);
    if (!line) continue;
    try { handle(JSON.parse(line)); } catch (e) { fail(null, -32700, 'Parse error'); }
  }
});
