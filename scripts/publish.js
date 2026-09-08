#!/usr/bin/env node
/**
 * One command: refresh the activity feed, build, check, commit, push.
 *
 *   npm run publish              auto-generated commit message
 *   npm run publish "message"    your own
 *
 * It REFUSES TO PUSH IF THE CHECK FAILS. That guard is the whole reason this
 * exists rather than a shell alias: a broken page is worse than an unpublished
 * one, and Vercel deploys whatever reaches main.
 *
 * Nothing to commit is a success, not an error. Running it twice is safe.
 */

const path = require('path');
const { execFileSync, spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
/* No shell. On Windows, cmd re-parses the arguments and destroys the quoting on
   a multi-word commit message, which fails the commit with "The syntax of the
   command is incorrect". git and node are both real executables on PATH, so
   there is nothing a shell is needed for. */
const run = (cmd, args, opts = {}) =>
  spawnSync(cmd, args, { cwd: ROOT, stdio: 'inherit', ...opts });

const quiet = (cmd, args) => execFileSync(cmd, args, { cwd: ROOT, encoding: 'utf8' }).trim();

function die(msg) {
  console.error(`\n  STOPPED  ${msg}\n`);
  process.exit(1);
}

const message = process.argv.slice(2).join(' ').trim();

console.log('\n1/5  activity');
if (run('node', ['scripts/activity.js']).status !== 0) die('could not read the git history');

console.log('\n2/5  build');
if (run('node', ['build.js']).status !== 0) die('the build failed');

console.log('\n3/5  check');
if (run('node', ['check.js']).status !== 0) die('the check failed. Nothing was committed or pushed.');

console.log('\n4/5  commit');
let status;
try {
  status = quiet('git', ['status', '--porcelain']);
} catch (e) {
  die('not a git repository');
}
if (!status) {
  console.log('     nothing changed');
  console.log('\n  Already published.\n');
  process.exit(0);
}

const changed = status.split('\n').length;
const subject = message || `Update the site (${changed} file${changed === 1 ? '' : 's'})`;

run('git', ['add', '-A']);
if (
  run('git', [
    'commit',
    '-q',
    '-m',
    subject,
    '-m',
    'Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>',
  ]).status !== 0
) {
  die('the commit failed');
}
console.log(`     ${subject}`);

console.log('\n5/5  push');
if (run('git', ['push', 'origin', 'HEAD']).status !== 0) die('the push failed. The commit is still here locally.');

console.log('\n  Published. Vercel is rebuilding https://hcig-passport.vercel.app/\n');
