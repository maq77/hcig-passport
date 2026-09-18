// Alerts: a Windows desktop toast for the events that need a person, and an
// optional phone push through ntfy (off until a topic is set in config.json).
const { spawn } = require('child_process');
const https = require('https');
const S = require('./store');

const TOAST = `
[Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] > $null
$t = [Windows.UI.Notifications.ToastNotificationManager]::GetTemplateContent([Windows.UI.Notifications.ToastTemplateType]::ToastText02)
$x = $t.GetElementsByTagName('text')
$x.Item(0).AppendChild($t.CreateTextNode($env:HIVE_T)) > $null
$x.Item(1).AppendChild($t.CreateTextNode($env:HIVE_B)) > $null
$n = [Windows.UI.Notifications.ToastNotification]::new($t)
[Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier('{1AC14E77-02E7-4E5D-B744-2EB1AE5198B7}\\WindowsPowerShell\\v1.0\\powershell.exe').Show($n)
`;

function toast(title, body) {
  try {
    const p = spawn('powershell', ['-NoProfile', '-NonInteractive', '-Command', TOAST], { env: { ...process.env, HIVE_T: title, HIVE_B: body.slice(0, 240) }, windowsHide: true, stdio: 'ignore' });
    p.on('error', () => {});
  } catch {}
}

function ntfy(topic, title, body, priority = 'default') {
  const req = https.request({ host: 'ntfy.sh', path: '/' + encodeURIComponent(topic), method: 'POST', headers: { Title: title, Priority: priority } });
  req.on('error', () => {});
  req.end(body.slice(0, 1000));
}

function send(title, body, { urgent = false } = {}) {
  const n = S.config().notify || {};
  if (n.desktop !== false) toast(title, body);
  if (n.ntfyTopic) ntfy(n.ntfyTopic, title, body, urgent ? 'high' : 'default');
}

// Which events deserve an alert.
function onEvent(ev) {
  const n = S.config().notify || {};
  const want = n.on || ['run.end', 'deploy.alert', 'budget', 'quota', 'order', 'standup'];
  const kind = ev.type.startsWith('budget') ? 'budget' : ev.type;
  if (!want.includes(kind)) return;
  if (ev.type === 'run.end') send(ev.data && ev.data.state === 'done' ? 'Hive: worker finished' : 'Hive: worker stopped', ev.msg);
  else if (ev.type === 'deploy.alert') send('Hive: DEPLOY command', ev.msg, { urgent: true });
  else if (kind === 'budget') send('Hive: token budget', ev.msg, { urgent: ev.type === 'budget.stop' });
  else if (ev.type === 'quota') send('Hive: quota hit', ev.msg);
  else if (ev.type === 'order') send('Hive: order for Claude', ev.msg);
  else if (ev.type === 'standup') send('Hive: morning standup', ev.msg.replace(/^Standup: /, ''));
}

module.exports = { send, onEvent, toast };
