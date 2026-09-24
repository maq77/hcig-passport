// Talks to the hub over HTTP. Starts the hub in the background if it is not up,
// so any entry point (CLI, MCP, an agent) can be the first thing that runs.
const http = require('http');
const path = require('path');
const { spawn } = require('child_process');
const S = require('./store');

const PORT = +process.env.HIVE_PORT || S.config().port;

function call(method, p, data) {
  return new Promise((resolve, reject) => {
    const payload = data ? JSON.stringify(data) : null;
    const req = http.request({ host: '127.0.0.1', port: PORT, path: p, method, headers: payload ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } : {} }, res => {
      let b = ''; res.on('data', d => b += d);
      res.on('end', () => { let j; try { j = JSON.parse(b); } catch { j = { raw: b }; } res.statusCode >= 400 ? reject(new Error(j.error || b)) : resolve(j); });
    });
    req.on('error', reject);
    const timeout = (p.includes('consult') || p.includes('critic') || p.includes('merge') || p.includes('bestof')) ? 300000 : 30000;
    req.setTimeout(timeout, () => req.destroy(new Error('hub timeout')));
    if (payload) req.write(payload);
    req.end();
  });
}

async function up() { try { await call('GET', '/api/usage'); return true; } catch { return false; } }

async function ensureHub() {
  if (await up()) return;
  const p = spawn(process.execPath, [path.join(__dirname, '..', 'hub.js')], { cwd: S.ROOT, detached: true, stdio: 'ignore', windowsHide: true });
  p.unref();
  for (let i = 0; i < 40; i++) { await new Promise(r => setTimeout(r, 250)); if (await up()) return; }
  throw new Error('Could not start the Hive hub');
}

async function api(method, p, data) { await ensureHub(); return call(method, p, data); }

module.exports = { api, ensureHub, PORT };
