// Alerts: Native Windows System Notification (Action Center) + Apple-styled banner.
const { spawn } = require('child_process');
const https = require('https');
const path = require('path');
const S = require('./store');

// Native Windows System Toast (Action Center with sound chime)
function winToast(title, body, { category = 'update', attribution = 'HCIG Hive' } = {}) {
  try {
    const script = path.join(__dirname, 'win-toast.ps1');
    const child = spawn('powershell', [
      '-NoProfile',
      '-ExecutionPolicy', 'Bypass',
      '-File', script,
      '-Title', title || 'HCIG Hive',
      '-Body', (body || '').slice(0, 240),
      '-Attribution', attribution,
      '-Category', category
    ], {
      detached: true,
      stdio: 'ignore'
    });
    child.unref();
  } catch (e) {}
}

// Apple-styled Center Screen HUD Notification Modal with Sound Chime
function appleHud(title, body, { category = 'update', url = 'http://localhost:4400', duration = 6500 } = {}) {
  try {
    const script = path.join(__dirname, 'apple-hud.ps1');
    const child = spawn('powershell', [
      '-NoProfile',
      '-ExecutionPolicy', 'Bypass',
      '-File', script,
      '-Title', title || 'Hive Alert',
      '-Body', (body || '').slice(0, 260),
      '-Category', category,
      '-Url', url,
      '-DurationMs', String(duration)
    ], {
      detached: true,
      stdio: 'ignore'
    });
    child.unref();
  } catch (e) {}
}

function ntfy(topic, title, body, priority = 'default') {
  const req = https.request({ host: 'ntfy.sh', path: '/' + encodeURIComponent(topic), method: 'POST', headers: { Title: title, Priority: priority } });
  req.on('error', () => {});
  req.end(body.slice(0, 1000));
}

function send(title, body, { category = 'update', url = 'http://localhost:4400', urgent = false } = {}) {
  const n = S.config().notify || {};
  if (n.desktop !== false) {
    winToast(title, body, { category, attribution: 'HCIG Hive · Claude' });
    appleHud(title, body, { category, url, duration: urgent ? 8500 : 6500 });
  }
  if (n.ntfyTopic) ntfy(n.ntfyTopic, title, body, urgent ? 'high' : 'default');
}

// Which events deserve an alert.
function onEvent(ev) {
  const n = S.config().notify || {};
  const want = n.on || [
    'run.start', 'run.end', 'task.create', 'task.update',
    'deploy.alert', 'budget', 'quota', 'order', 'inbox', 'standup', 'review', 'triage'
  ];
  const kind = ev.type.startsWith('budget') ? 'budget' : ev.type.startsWith('review') ? 'review' : ev.type;
  if (!want.includes(kind) && !want.includes(ev.type)) return;

  // 1. Beginning / Starting
  if (ev.type === 'run.start') {
    send('Worker Started', ev.msg, { category: 'start', url: 'http://localhost:4400/#/runs' });
  }
  // 2. Done / Finishing
  else if (ev.type === 'run.end') {
    const isDone = ev.data && ev.data.state === 'done';
    send(isDone ? 'Worker Finished' : 'Worker Stopped', ev.msg, { category: 'done', url: 'http://localhost:4400/#/runs' });
  }
  else if (ev.type === 'task.update') {
    if (ev.data && ev.data.status === 'needs_review') {
      send('Ready For Review', `${ev.data.id} is ready for Claude inspection`, { category: 'done', url: `http://localhost:4400/#/task/${ev.data.id}` });
    } else if (ev.data && ev.data.status === 'blocked') {
      send('Action Needed: Task Blocked', `${ev.data.id}: prompt answers or review needed`, { category: 'prompt', urgent: true, url: `http://localhost:4400/#/task/${ev.data.id}` });
    } else if (ev.data && ev.data.status === 'done') {
      send('Ticket Completed', `${ev.data.id} reviewed and closed`, { category: 'done', url: `http://localhost:4400/#/task/${ev.data.id}` });
    }
  }
  // 3. Making tasks
  else if (ev.type === 'task.create') {
    send('New Task Created', ev.msg, { category: 'task', url: 'http://localhost:4400/#/board' });
  }
  // 4. Planning / Reviews
  else if (kind === 'review' || ev.type === 'triage') {
    send('Planning & Triage', ev.msg, { category: 'plan', url: 'http://localhost:4400/#/board' });
  }
  // 5. Prompt answers / Claude orders / User action required
  else if (ev.type === 'order' || ev.type === 'inbox') {
    send('Prompt Answers Needed', ev.msg, { category: 'prompt', urgent: true, url: 'http://localhost:4400/#/home' });
  }
  else if (ev.type === 'deploy.alert') {
    send('DEPLOY Command Alert', ev.msg, { category: 'alert', urgent: true });
  }
  else if (kind === 'budget') {
    send('Token Budget Notice', ev.msg, { category: 'alert', urgent: ev.type === 'budget.stop' });
  }
  else if (ev.type === 'quota') {
    send('Daily Quota Hit', ev.msg, { category: 'alert' });
  }
  else if (ev.type === 'standup') {
    send('Morning Standup', ev.msg.replace(/^Standup: /, ''), { category: 'update', url: 'http://localhost:4400' });
  }
}

module.exports = { send, onEvent, winToast, appleHud };
