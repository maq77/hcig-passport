#!/usr/bin/env node
// Claude Code hook -> Hive notification. Wired in .claude/settings.json:
//   Notification: Claude needs an answer or a permission from the user.
//   Stop:         Claude finished its turn.
// Reads the hook's JSON from stdin. Never blocks Claude: every failure is swallowed.
const kind = process.argv[2] || 'notification';
let raw = '';
process.stdin.on('data', d => { raw += d; });
process.stdin.on('end', () => {
  let j = {};
  try { j = JSON.parse(raw || '{}'); } catch {}
  try {
    const notify = require('../lib/notify');
    const S = require('../lib/store');
    if (kind === 'stop') {
      notify.send('Claude finished', 'Claude is done with this turn and waiting for you.', { category: 'done' });
      S.emit('claude.stop', 'Claude finished its turn', {}, '@claude');
    } else {
      const msg = String(j.message || 'Claude needs your input.');
      notify.send('Claude needs you', msg, { category: 'prompt', urgent: true });
      S.emit('claude.ask', msg, {}, '@claude');
    }
  } catch {}
  setTimeout(() => process.exit(0), 300);
});
setTimeout(() => process.exit(0), 4000);
