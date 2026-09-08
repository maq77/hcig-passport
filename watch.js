#!/usr/bin/env node
/**
 * Watch the content and publish when it settles.
 *
 *   npm run watch
 *
 * Save anything under content/ or docs/ and, five seconds after the last save,
 * this rebuilds, checks, commits and pushes. Vercel redeploys on that push.
 *
 * Three guards, because an auto-pusher without them is a liability:
 *
 *   1. It never pushes if the check fails. publish.js enforces that; this only
 *      calls it. A failed run leaves the working tree untouched and keeps
 *      watching, so you fix the problem and the next save publishes.
 *   2. It is debounced. A burst of saves, or an editor writing a file three
 *      times, becomes one commit rather than three.
 *   3. It is opt-in and in the foreground. It runs only while this terminal is
 *      open. Nothing auto-pushes behind your back.
 *
 * Ctrl+C stops it.
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const ROOT = __dirname;
const WATCH = ['content', 'docs'].filter((d) => fs.existsSync(path.join(ROOT, d)));
const SETTLE_MS = 5000;

// activity.json is written by the publish run itself; watching it would loop
const IGNORE = new Set(['activity.json']);

let timer = null;
let running = false;
let queued = false;
let pending = new Set();

function publish() {
  if (running) {
    queued = true;
    return;
  }
  running = true;

  const files = [...pending];
  pending.clear();
  const subject =
    files.length === 1 ? `Update ${files[0]}` : `Update the site (${files.length} files)`;

  console.log(`\n${'-'.repeat(60)}\n  ${new Date().toLocaleTimeString()}  publishing`);

  const child = spawn('node', [path.join('scripts', 'publish.js'), subject], {
    cwd: ROOT,
    stdio: 'inherit',
  });

  child.on('close', (code) => {
    running = false;
    if (code !== 0) {
      console.log('\n  Not published. Nothing was pushed. Fix it and save again.\n');
    }
    console.log(`  watching ${WATCH.join(', ')}\n`);
    if (queued) {
      queued = false;
      schedule();
    }
  });
}

function schedule() {
  clearTimeout(timer);
  timer = setTimeout(publish, SETTLE_MS);
}

if (!WATCH.length) {
  console.error('\n  Nothing to watch: content/ and docs/ are both missing.\n');
  process.exit(1);
}

for (const dir of WATCH) {
  fs.watch(path.join(ROOT, dir), { recursive: true }, (event, file) => {
    if (!file) return;
    const base = path.basename(file);
    if (IGNORE.has(base) || base.startsWith('.') || base.endsWith('~')) return;
    pending.add(`${dir}/${file.replace(/\\/g, '/')}`);
    schedule();
  });
}

console.log(`\n  HCIG Work, watching ${WATCH.join(', ')}`);
console.log(`  Publishes ${SETTLE_MS / 1000}s after you stop typing. It will not push if the check fails.`);
console.log('  Ctrl+C to stop.\n');
