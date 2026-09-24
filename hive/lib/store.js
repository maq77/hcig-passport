// Shared state for the Hive: config, tasks, events, and the TASK_BOARD.md mirror.
// Everything lives in .hive/ (gitignored). TASK_BOARD.md is rendered from tasks.json,
// and edits an agent makes to the board by hand are read back in.
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..', '..');
const HIVE = path.join(ROOT, '.hive');
const P = {
  tasks: path.join(HIVE, 'tasks.json'),
  events: path.join(HIVE, 'events.jsonl'),
  runs: path.join(HIVE, 'runs'),
  state: path.join(HIVE, 'state'),
  inbox: path.join(HIVE, 'inbox.jsonl'),
  brain: path.join(HIVE, 'brain.md'),
  board: path.join(ROOT, 'TASK_BOARD.md'),
};
for (const d of [HIVE, P.runs, P.state]) fs.mkdirSync(d, { recursive: true });

function expand(p) {
  if (!p) return p;
  return p.replace(/^~(?=\/|\\|$)/, os.homedir())
    .replace(/%([A-Z_]+)%/gi, (_, v) => process.env[v] || '');
}
function abs(p) { p = expand(p); return path.isAbsolute(p) ? p : path.join(ROOT, p); }

function config() {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'config.json'), 'utf8'));
}

function now() { return new Date().toISOString(); }
function today() { return now().slice(0, 10); }

// ---------- events ----------
const listeners = new Set();
function emit(type, msg, data = {}, actor = 'hive') {
  const ev = { ts: now(), type, actor, msg, ...(Object.keys(data).length ? { data } : {}) };
  fs.appendFileSync(P.events, JSON.stringify(ev) + '\n');
  for (const fn of listeners) { try { fn(ev); } catch {} }
  return ev;
}
function onEvent(fn) { listeners.add(fn); return () => listeners.delete(fn); }
function readEvents(limit = 200) {
  if (!fs.existsSync(P.events)) return [];
  const lines = fs.readFileSync(P.events, 'utf8').trim().split('\n').filter(Boolean);
  return lines.slice(-limit).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
}

// ---------- tasks ----------
const STATUSES = ['todo', 'in_progress', 'needs_review', 'blocked', 'done'];
const BOARD_TAG = { todo: 'TODO', in_progress: 'IN_PROGRESS', needs_review: 'NEEDS_REVIEW', blocked: 'BLOCKED', done: 'DONE' };
const TAG_STATUS = Object.fromEntries(Object.entries(BOARD_TAG).map(([k, v]) => [v, k]));

function loadTasks() {
  if (!fs.existsSync(P.tasks)) return [];
  try { return JSON.parse(fs.readFileSync(P.tasks, 'utf8')); } catch { return []; }
}
function saveTasks(tasks, { render = true } = {}) {
  const tmp = P.tasks + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(tasks, null, 2));
  fs.renameSync(tmp, P.tasks);
  if (render) renderBoard(tasks);
}
function nextId(tasks, prefix = 'T') {
  let n = 1;
  for (const t of tasks) { const m = t.id.match(new RegExp('^' + prefix + '-(\\d+)$')); if (m) n = Math.max(n, +m[1] + 1); }
  return `${prefix}-${String(n).padStart(3, '0')}`;
}
function createTask(fields, actor = '@claude') {
  const tasks = loadTasks();
  const t = {
    id: fields.id || nextId(tasks, fields.prefix || 'T'),
    title: fields.title,
    description: fields.description || '',
    acceptance: fields.acceptance || [],
    assignee: fields.assignee || '@agy-cli',
    priority: fields.priority || 'normal',
    status: fields.status || 'todo',
    folder: fields.folder || '',
    branch: fields.branch || '',
    dependsOn: fields.dependsOn || [],
    autoDispatch: !!fields.autoDispatch,
    kind: fields.kind || undefined,
    parent: fields.parent || undefined,
    epic: fields.epic || undefined,
    files: fields.files || [],
    agent: fields.agent || undefined,
    notes: [],
    runs: [],
    created: now(),
    updated: now(),
  };
  tasks.push(t);
  saveTasks(tasks);
  emit('task.create', `${t.id} created: ${t.title}`, { id: t.id, assignee: t.assignee }, actor);
  return t;
}
function updateTask(id, patch, actor = '@claude') {
  const tasks = loadTasks();
  const t = tasks.find(x => x.id === id);
  if (!t) throw new Error(`No task ${id}`);
  const changed = [];
  for (const [k, v] of Object.entries(patch)) {
    if (k === 'note') { t.notes.push({ ts: now(), by: actor, text: v }); changed.push('note'); continue; }
    if (k === 'status' && !STATUSES.includes(v)) throw new Error(`Bad status ${v}. Use ${STATUSES.join(', ')}`);
    if (JSON.stringify(t[k]) !== JSON.stringify(v)) { t[k] = v; changed.push(k); }
  }
  t.updated = now();
  saveTasks(tasks);
  if (changed.length) emit('task.update', `${id} ${patch.status ? 'is now ' + patch.status : 'updated'}${patch.note ? ': ' + String(patch.note).slice(0, 140) : ''}`, { id, changed, status: t.status }, actor);
  return t;
}
function getTask(id) { return loadTasks().find(t => t.id === id); }

// ---------- TASK_BOARD.md mirror ----------
let lastBoardHash = '';
function hash(s) { return crypto.createHash('sha1').update(s).digest('hex'); }
function cell(s) { return String(s || '').replace(/\|/g, '/').replace(/\n/g, ' '); }

function renderBoard(tasks = loadTasks()) {
  const order = { in_progress: 0, needs_review: 1, blocked: 2, todo: 3, done: 4 };
  const sorted = [...tasks].sort((a, b) => order[a.status] - order[b.status] || a.id.localeCompare(b.id));
  const L = [];
  L.push('# Multi-Agent Task Board (`TASK_BOARD.md`)', '');
  L.push('*Generated by HCIG Hive from `.hive/tasks.json`. Edit the Status or Assignee column and the Hive reads it back. Everything else: use `node hive/cli.js` or the dashboard at http://localhost:4400.*', '');
  L.push('## Status legend', '- `[TODO]` ready to claim', '- `[IN_PROGRESS]` being worked', '- `[NEEDS_REVIEW]` done by the worker, waiting for Claude', '- `[BLOCKED]` stuck, see notes', '- `[DONE]` reviewed and merged', '');
  L.push('## Active queue', '');
  L.push('| ID | Task | Assignee | Branch / Folder | Status | Last Updated |');
  L.push('| :--- | :--- | :--- | :--- | :--- | :--- |');
  for (const t of sorted) {
    L.push(`| **${t.id}** | ${cell(t.title)} | \`${cell(t.assignee)}\` | \`${cell(t.branch || t.folder || '-')}\` | \`[${BOARD_TAG[t.status]}]\` | ${t.updated.slice(0, 10)} |`);
  }
  L.push('', '---', '', '## Ticket details', '');
  for (const t of sorted) {
    L.push(`### ${t.id}: ${t.title}`);
    L.push(`- **Assignee**: \`${t.assignee}\``, `- **Priority**: ${t.priority}`, `- **Status**: \`[${BOARD_TAG[t.status]}]\``);
    if (t.folder) L.push(`- **Folder**: \`${t.folder}\``);
    if (t.dependsOn && t.dependsOn.length) L.push(`- **Waits on**: ${t.dependsOn.join(', ')}`);
    if (t.description) L.push(`- **Description**: ${t.description.trim()}`);
    if (t.acceptance && t.acceptance.length) { L.push('- **Acceptance Criteria**:'); t.acceptance.forEach((a, i) => L.push(`  ${i + 1}. ${a}`)); }
    if (t.details) L.push('', t.details.trim());
    if (t.notes.length) { L.push('- **Notes**:'); for (const n of t.notes.slice(-12)) L.push(`  - ${n.ts.slice(0, 16).replace('T', ' ')} ${n.by}: ${n.text.replace(/\n/g, ' ')}`); }
    L.push('');
  }
  const out = L.join('\n');
  lastBoardHash = hash(out);
  fs.writeFileSync(P.board, out);
  return out;
}

// Parse a board file (ours or the legacy hand-written one) into rows + detail blocks.
function parseBoard(md) {
  const rows = [];
  for (const line of md.split('\n')) {
    const m = line.match(/^\|\s*\*{0,2}([A-Z0-9][A-Z0-9-]+)\*{0,2}\s*\|(.*)\|\s*$/);
    if (!m || /^ID$/i.test(m[1])) continue;
    const c = m[2].split('|').map(s => s.trim().replace(/^`|`$/g, ''));
    if (c.length < 5) continue;
    const tag = (c[3].match(/\[([A-Z_]+)\]/) || [])[1];
    rows.push({ id: m[1], title: c[0], assignee: c[1], branch: c[2], status: TAG_STATUS[tag] || 'todo', updated: c[4] });
  }
  const details = {};
  const parts = md.split(/^### /m).slice(1);
  for (const p of parts) {
    const m = p.match(/^([A-Z0-9][A-Z0-9-]+):\s*(.*)\n([\s\S]*)/);
    if (m) details[m[1]] = m[3].split(/\n---\s*\n/)[0].trim();
  }
  return { rows, details };
}

// First run: adopt the existing hand-written board so nothing is lost.
function importLegacyBoard() {
  if (fs.existsSync(P.tasks) || !fs.existsSync(P.board)) return 0;
  const { rows, details } = parseBoard(fs.readFileSync(P.board, 'utf8'));
  const tasks = rows.map(r => ({
    id: r.id, title: r.title, description: '', acceptance: [], assignee: r.assignee, priority: 'normal',
    status: r.status, folder: r.branch, branch: '', notes: [], runs: [], details: details[r.id] || '',
    created: now(), updated: /^\d{4}-\d\d-\d\d$/.test(r.updated) ? r.updated + 'T00:00:00.000Z' : now(),
  }));
  fs.copyFileSync(P.board, path.join(P.state, `TASK_BOARD.legacy-${today()}.md`));
  saveTasks(tasks);
  emit('hive.import', `Imported ${tasks.length} tickets from the old TASK_BOARD.md`);
  return tasks.length;
}

// An agent edited TASK_BOARD.md by hand: read status and assignee changes back.
function syncBoardEdits() {
  if (!fs.existsSync(P.board)) return;
  const md = fs.readFileSync(P.board, 'utf8');
  if (hash(md) === lastBoardHash) return;
  const { rows } = parseBoard(md);
  const tasks = loadTasks();
  let changed = 0;
  for (const r of rows) {
    const t = tasks.find(x => x.id === r.id);
    if (!t) {
      tasks.push({ id: r.id, title: r.title, description: '', acceptance: [], assignee: r.assignee, priority: 'normal', status: r.status, folder: r.branch, branch: '', notes: [], runs: [], created: now(), updated: now() });
      emit('task.create', `${r.id} added on the board by hand: ${r.title}`, { id: r.id }, 'board');
      changed++; continue;
    }
    if (t.status !== r.status || t.assignee !== r.assignee) {
      emit('task.update', `${t.id} changed on the board: ${t.status} to ${r.status}`, { id: t.id, status: r.status }, 'board');
      t.status = r.status; t.assignee = r.assignee; t.updated = now(); changed++;
    }
  }
  if (changed) saveTasks(tasks); else lastBoardHash = hash(md);
}

// ---------- inbox (orders for the head) ----------
function pushInbox(text, from = 'dashboard', files = []) {
  const item = { id: crypto.randomUUID().slice(0, 8), ts: now(), from, text, files, read: false };
  fs.appendFileSync(P.inbox, JSON.stringify(item) + '\n');
  emit('order', `New order for Claude: ${text.slice(0, 160)}`, { id: item.id }, from);
  return item;
}
function readInbox({ markRead = false } = {}) {
  if (!fs.existsSync(P.inbox)) return [];
  const items = fs.readFileSync(P.inbox, 'utf8').trim().split('\n').filter(Boolean).map(l => JSON.parse(l));
  if (markRead) fs.writeFileSync(P.inbox, items.map(i => JSON.stringify({ ...i, read: true })).join('\n') + '\n');
  return items;
}

module.exports = {
  ROOT, HIVE, P, STATUSES, expand, abs, config, now, today,
  emit, onEvent, readEvents,
  loadTasks, saveTasks, createTask, updateTask, getTask,
  renderBoard, importLegacyBoard, syncBoardEdits,
  pushInbox, readInbox,
};
