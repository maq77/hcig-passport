#!/usr/bin/env node
/**
 * Local live preview: rebuild on save, serve at http://localhost:4173
 *
 *   node scripts/dev-watch.js      (or double click bat\live.bat)
 *
 * This is the local counterpart to `npm run watch`. It never commits and never
 * pushes. It only rebuilds `dist/` so the browser shows what you just saved,
 * which is what you want while a page is being designed.
 *
 * It watches `content/`, `docs/`, `src/` and `scripts/gen-247-pages.js`. Saving
 * the generator regenerates the landing pages first, then rebuilds, so editing
 * the content table shows up in the browser like any other edit.
 *
 * Ctrl+C, or closing the window, stops it.
 */

const fs = require('fs');
const path = require('path');
const { spawnSync, spawn } = require('child_process');

const ROOT = path.join(__dirname, '..');
const SETTLE_MS = 350;
const WATCH = ['content', 'docs', 'src', 'scripts'].filter((d) => fs.existsSync(path.join(ROOT, d)));

/* Written by a publish, not by a build. Watching it would loop. */
const IGNORE = new Set(['activity.json', 'dev-watch.js']);

let timer = null;
let building = false;
let queued = false;

function stamp() {
  return new Date().toTimeString().slice(0, 8);
}

function rebuild(reason) {
  if (building) {
    queued = true;
    return;
  }
  building = true;
  const t0 = Date.now();

  if (/gen-247-pages\.js$/.test(reason)) {
    const gen = spawnSync('node', ['scripts/gen-247-pages.js'], { cwd: ROOT, encoding: 'utf8' });
    if (gen.status !== 0) {
      console.log(`  ${stamp()}  generator failed\n${gen.stderr || gen.stdout}`);
      building = false;
      return;
    }
  }

  const out = spawnSync('node', ['build.js'], { cwd: ROOT, encoding: 'utf8' });
  building = false;

  if (out.status === 0) {
    console.log(`  ${stamp()}  rebuilt in ${Date.now() - t0} ms   ${reason}`);
  } else {
    /* build.js prints its own reason and exits non-zero. Show it and keep
       watching, so a typo does not kill the session. */
    console.log(`  ${stamp()}  BUILD FAILED  ${reason}`);
    console.log((out.stdout || '') + (out.stderr || ''));
  }

  if (queued) {
    queued = false;
    rebuild('queued change');
  }
}

for (const dir of WATCH) {
  fs.watch(path.join(ROOT, dir), { recursive: true }, (_event, file) => {
    if (!file) return;
    const base = path.basename(file);
    if (IGNORE.has(base) || base.startsWith('.') || base.endsWith('~')) return;
    clearTimeout(timer);
    timer = setTimeout(() => rebuild(file.replace(/\\/g, '/')), SETTLE_MS);
  });
}

console.log(`\n  Watching ${WATCH.join(', ')}. Serving on http://localhost:4173\n`);

/* The server is a child process so one window does both jobs. */
const server = spawn('node', ['serve.js'], { cwd: ROOT, stdio: 'inherit' });
const stop = () => {
  server.kill();
  process.exit(0);
};
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
server.on('exit', (code) => process.exit(code || 0));
