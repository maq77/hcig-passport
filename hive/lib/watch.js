// The watch mechanism: one recursive watcher on the repo plus the memory folders.
// File changes are batched into one event every 2 s. Memory, rules and board
// changes rebuild the brain. New git commits become events of their own.
const fs = require('fs');
const path = require('path');
const S = require('./store');
const brain = require('./brain');

function start({ attribute = () => null } = {}) {
  const cfg = S.config();
  const ignore = cfg.watchIgnore.map(s => s.replace(/\\/g, '/'));
  let batch = new Map();
  let brainTimer = null;
  let lastHead = readHead();

  const rebuildBrain = () => { clearTimeout(brainTimer); brainTimer = setTimeout(() => { try { brain.build(); } catch (e) { S.emit('hive.error', 'Brain rebuild failed: ' + e.message); } }, 800); };

  function readHead() {
    try {
      const log = fs.readFileSync(path.join(S.ROOT, '.git', 'logs', 'HEAD'), 'utf8').trim().split('\n');
      return log[log.length - 1];
    } catch { return ''; }
  }

  function onRepo(_, file) {
    if (!file) return;
    const rel = file.replace(/\\/g, '/');
    if (rel === '.git/logs/HEAD') {
      const head = readHead();
      if (head && head !== lastHead) {
        lastHead = head;
        const msg = head.split('\t')[1] || 'git activity';
        S.emit('git', msg, { sha: head.split(' ')[1].slice(0, 8) }, 'git');
      }
      return;
    }
    if (rel === '.hive' || rel.startsWith('.hive/') || rel.startsWith('.git/') || ignore.some(i => rel.includes(i.replace(/^\//, '')))) return;
    if (rel === 'TASK_BOARD.md') { setTimeout(() => S.syncBoardEdits(), 300); rebuildBrain(); }
    if (rel.startsWith('.agents/') || rel === 'AGENTS.md' || rel === 'CLAUDE.md') rebuildBrain();
    batch.set(rel, attribute(path.join(S.ROOT, rel)) || 'main');
  }

  const watchers = [];
  try { watchers.push(fs.watch(S.ROOT, { recursive: true }, onRepo)); }
  catch (e) { S.emit('hive.error', 'Repo watcher failed: ' + e.message); }

  for (const d of cfg.memoryDirs || []) {
    const dir = S.abs(d);
    if (!fs.existsSync(dir)) continue;
    watchers.push(fs.watch(dir, { recursive: true }, (_, f) => {
      if (!f || !f.endsWith('.md')) return;
      batch.set('memory/' + f.replace(/\\/g, '/'), 'memory');
      rebuildBrain();
    }));
  }

  // Worktrees live outside the repo; watch that folder too so worker edits show up live.
  const wtRoot = path.resolve(S.ROOT, cfg.worktreeRoot);
  fs.mkdirSync(wtRoot, { recursive: true });
  watchers.push(fs.watch(wtRoot, { recursive: true }, (_, f) => {
    if (!f) return;
    const rel = f.replace(/\\/g, '/');
    if (ignore.some(i => rel.includes(i.replace(/^\//, ''))) || rel.includes('/.git')) return;
    const id = rel.split('/')[0];
    batch.set('wt/' + rel, id);
  }));

  setInterval(() => {
    if (!batch.size) return;
    const files = [...batch.entries()].slice(0, 60).map(([f, by]) => ({ f, by }));
    const who = [...new Set(files.map(x => x.by))].join(', ');
    S.emit('files.changed', `${batch.size} file${batch.size > 1 ? 's' : ''} changed (${who})`, { files }, 'watch');
    batch = new Map();
  }, 2000);

  rebuildBrain();
  return () => watchers.forEach(w => w.close());
}

module.exports = { start };
