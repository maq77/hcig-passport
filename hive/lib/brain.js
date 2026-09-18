// The shared brain: one briefing file every agent reads before it works.
// Rebuilt whenever memory, rules or the board change. Lives in .hive/ (gitignored),
// because the memory it copies holds server names that must not reach the public repo.
const fs = require('fs');
const path = require('path');
const S = require('./store');

function read(p, max = 40000) {
  try { const s = fs.readFileSync(p, 'utf8'); return s.length > max ? s.slice(0, max) + '\n\n[truncated]' : s; } catch { return ''; }
}

function build() {
  const cfg = S.config();
  const parts = [];
  parts.push(`# HCIG Hive brain`, '', `Rebuilt ${S.now()}. Read this before any work. It is the shared memory of every agent in the Hive.`, '');
  parts.push('## Who is who', '',
    '- **@claude** (Claude Code) is the head. It plans, assigns, reviews and merges. Its word wins.',
    '- **@agy-cli** workers are Antigravity CLI runs started by the Hive dispatcher, one per ticket, each in its own git worktree.',
    '- **@agy-desktop** is the Antigravity Desktop app. It takes tickets assigned to it from TASK_BOARD.md.',
    '- **The user** (Mohamed) gives the orders. Irina Rise approves anything a visitor reads.', '');
  parts.push('## How to report', '',
    '- Progress note: `node hive/cli.js note <ID> "what you did"` (run from the main repo folder).',
    '- Finished: `node hive/cli.js status <ID> needs_review` plus a note listing files changed and checks run.',
    '- Stuck: `node hive/cli.js status <ID> blocked` plus a note saying exactly what you need.',
    '- Anything you deploy to a live server: `node hive/cli.js note <ID> "DEPLOYED: <what, where, backup path>"`. Always back up the server file first.',
    '', `Board: \`TASK_BOARD.md\`. Dashboard: http://localhost:${cfg.port}.`, '');

  for (const d of cfg.memoryDirs || []) {
    const dir = S.abs(d);
    const handover = read(path.join(dir, 'HANDOVER.md'));
    const index = read(path.join(dir, 'MEMORY.md'));
    if (handover) parts.push('## Handover (state of play)', '', handover, '');
    if (index) parts.push('## Memory index', '', `Full memory files live in \`${dir}\`. Open the ones your task needs.`, '', index, '');
  }
  for (const f of cfg.rulesFiles || []) {
    const r = read(S.abs(f));
    if (r) parts.push(`## Rules (${f})`, '', r.replace(/^---[\s\S]*?---\n/, ''), '');
  }

  const tasks = S.loadTasks().filter(t => t.status !== 'done');
  parts.push('## Open tickets', '');
  for (const t of tasks) parts.push(`- **${t.id}** \`${t.status}\` ${t.assignee}: ${t.title}`);
  parts.push('', '## Latest activity', '');
  for (const e of S.readEvents(30).filter(e => e.type !== 'files.changed')) parts.push(`- ${e.ts.slice(5, 16).replace('T', ' ')} ${e.actor}: ${e.msg}`);

  const out = parts.join('\n') + '\n';
  fs.writeFileSync(S.P.brain, out);
  return out;
}

module.exports = { build };
