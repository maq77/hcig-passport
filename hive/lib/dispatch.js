// Dispatcher: starts an Antigravity CLI worker for a ticket and follows it to the end.
// One worker per ticket, in its own git worktree when the ticket's folder is tracked
// in git. Streams every step into .hive/runs/<run>.jsonl and the event feed, flags
// deploy commands, rotates model or account on quota, and records token usage.
const fs = require('fs');
const path = require('path');
const { spawn, execFileSync } = require('child_process');
const S = require('./store');
const M = require('./models');

const RUNS = path.join(S.P.state, 'runs.json');
const live = new Map(); // runId -> { proc, run }

function loadRuns() { try { return JSON.parse(fs.readFileSync(RUNS, 'utf8')); } catch { return []; } }
function saveRun(run) {
  const runs = loadRuns().filter(r => r.id !== run.id);
  runs.push(run);
  fs.writeFileSync(RUNS, JSON.stringify(runs.slice(-300), null, 2));
}
function listRuns() {
  const runs = loadRuns();
  // A run left "running" by a hub that died is not running any more.
  for (const r of runs) if (r.state === 'running' && !live.has(r.id)) { r.state = 'lost'; }
  return runs;
}

function git(args, cwd = S.ROOT) {
  return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function agyExe() {
  const p = S.expand(S.config().agy.exe);
  return fs.existsSync(p) ? p : 'agy';
}

function accountEnv(acc) {
  const env = { ...process.env };
  if (acc && acc.profile) {
    const home = S.abs(acc.profile);
    fs.mkdirSync(home, { recursive: true });
    Object.assign(env, { USERPROFILE: home, HOME: home });
  }
  return env;
}

function pickAccount(want) {
  const accs = S.config().accounts.filter(a => a.kind === 'cli' && a.enabled);
  if (want) { const a = accs.find(x => x.id === want); if (!a) throw new Error(`Account ${want} is not an enabled CLI account`); return a; }
  const busy = id => [...live.values()].filter(l => l.run.account === id).length;
  const free = accs.filter(a => busy(a.id) < (a.maxParallel || 1)).sort((a, b) => busy(a.id) - busy(b.id));
  if (!free.length) throw new Error('Every enabled account is at its parallel limit. Wait for a run to finish or raise maxParallel.');
  return free[0];
}

// Worktree when the folder is tracked, otherwise the main folder (untracked work
// such as medcierge-next/ would not exist inside a fresh worktree).
function workspaceFor(task, mode) {
  const tracked = (() => { try { return !task.folder || !!git(['ls-files', '--', task.folder.replace(/\/$/, '')]).split('\n')[0]; } catch { return false; } })();
  if (mode === 'main' || (mode !== 'worktree' && !tracked)) return { cwd: S.ROOT, branch: '', isolated: false, reason: tracked ? 'asked for main' : `${task.folder} is not tracked in git` };
  const wtRoot = path.resolve(S.ROOT, S.config().worktreeRoot);
  const dir = path.join(wtRoot, task.id);
  const branch = `hive/${task.id.toLowerCase()}`;
  if (!fs.existsSync(dir)) {
    let exists = false; try { git(['rev-parse', '--verify', branch]); exists = true; } catch {}
    git(['worktree', 'add', dir, ...(exists ? [branch] : ['-b', branch])]);
  }
  return { cwd: dir, branch, isolated: true };
}

function brief(task, ws, route, extra) {
  const cfg = S.config();
  return [
    `# Hive ticket ${task.id}: ${task.title}`, '',
    `You are an Antigravity worker in the HCIG Hive. Claude Code (@claude) is the head and reviews your work.`,
    `Model ${route.model}, effort ${route.effort}, task kind ${route.kind}.`, '',
    `## First`, `Read the shared brain: ${S.P.brain}`, `It holds the rules, the state of play and the memory index. Follow it.`, '',
    `## Where you work`,
    ws.isolated ? `Your own git worktree: ${ws.cwd} on branch ${ws.branch}. Commit your work there with message "feat(${task.id.toLowerCase()}): <summary>". Do not touch the main folder.`
                : `The main repo folder ${ws.cwd} (no worktree: ${ws.reason}). Change only files inside your ticket's scope. Do not commit unrelated files.`,
    '', `## The ticket`, task.description || '(no description)',
    task.folder ? `Folder: ${task.folder}` : '',
    task.acceptance.length ? `Acceptance criteria:\n${task.acceptance.map((a, i) => `${i + 1}. ${a}`).join('\n')}` : '',
    task.details ? `Details:\n${task.details}` : '',
    extra ? `\n## Extra instructions from @claude\n${extra}` : '',
    '', `## Rules`,
    `- No em dashes or en dashes in anything you write.`,
    `- Never invent medical claims, prices, statistics or accreditations.`,
    `- Before changing a live server file, back it up on the server and record the backup path.`,
    `- Report with the Hive CLI from ${S.ROOT}: node hive/cli.js note ${task.id} "..."`,
    cfg.agy.fullAccess ? `- You have full access. Deploys are allowed, and every deploy is logged and flagged on the dashboard.` : `- Do not deploy, push or SSH. Stop at a committed branch.`,
    '', `## Finish`,
    `End with a short summary: files changed, checks run and their result, anything deployed, anything left open.`,
  ].filter(x => x !== '').join('\n');
}

function dispatch(taskId, opts = {}) {
  const task = S.getTask(taskId);
  if (!task) throw new Error(`No task ${taskId}`);
  const cfg = S.config();
  const acc = pickAccount(opts.account);
  const r = M.route(task, { model: opts.model, effort: opts.effort, account: acc.id });
  const ws = workspaceFor(task, opts.workspace);
  const id = `${task.id}-${Date.now().toString(36)}`;
  const briefPath = path.join(S.P.runs, `${id}.brief.md`);
  fs.writeFileSync(briefPath, brief(task, ws, r, opts.instructions));

  const args = ['-p', `Your full brief is in ${briefPath}. Read it and the brain file it names, then do the work.`,
    '--output-format', 'stream-json', '--model', r.model,
    '--add-dir', S.HIVE, '--add-dir', S.ROOT, '--print-timeout', '0'];
  // agy takes --effort only for Gemini. Claude models think at a fixed level and
  // GPT-OSS carries its effort in the slug. Verified 2026-09-18.
  if (M.takesEffort(r.model)) args.push('--effort', r.effort); else r.effort = 'fixed';
  if (cfg.agy.fullAccess) args.push('--dangerously-skip-permissions');

  const run = { id, task: task.id, account: acc.id, model: r.model, effort: r.effort, kind: r.kind, cwd: ws.cwd, branch: ws.branch,
    isolated: ws.isolated, state: 'running', started: S.now(), steps: 0, attempt: opts.attempt || 1, conversation: null, response: '', pid: null };
  const log = fs.createWriteStream(path.join(S.P.runs, `${id}.jsonl`), { flags: 'a' });
  const proc = spawn(agyExe(), args, { cwd: ws.cwd, env: accountEnv(acc), windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
  run.pid = proc.pid;
  live.set(id, { proc, run });
  saveRun(run);
  S.updateTask(task.id, { status: 'in_progress', branch: ws.branch || task.branch, runs: [...(task.runs || []), id] }, 'hive');
  S.emit('run.start', `${task.id} started on ${acc.label} with ${r.model} (${r.effort})${ws.isolated ? ' in ' + ws.branch : ' in the main folder'}`, { run: id, task: task.id, account: acc.id, model: r.model }, `agy:${acc.id}`);

  const deployRe = new RegExp(cfg.deployPatterns.join('|'), 'i');
  const quotaRe = new RegExp(cfg.quotaPatterns.join('|'), 'i');
  let buf = '', errBuf = '', quotaHit = false, usage = null, status = null;

  proc.stdout.on('data', chunk => {
    buf += chunk;
    let i;
    while ((i = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, i); buf = buf.slice(i + 1);
      if (!line.trim()) continue;
      log.write(line + '\n');
      let ev; try { ev = JSON.parse(line); } catch { continue; }
      if (ev.event === 'init') { run.conversation = ev.conversation_id; saveRun(run); }
      if (ev.event === 'step_update') {
        const s = ev.step_update;
        if (s.text_delta) run.response += s.text_delta;
        if (s.step_type === 'tool' && s.state === 'ACTIVE') {
          run.steps++;
          const p = (s.tool_info && s.tool_info.parameters) || {};
          const what = p.CommandLine || p.AbsolutePath || p.TargetFile || p.Url || p.Query || '';
          run.lastStep = `${s.tool_name} ${String(what).slice(0, 160)}`;
          S.emit('run.step', `${task.id}: ${run.lastStep}`, { run: id, tool: s.tool_name }, `agy:${acc.id}`);
          if (p.CommandLine && deployRe.test(p.CommandLine)) {
            S.emit('deploy.alert', `${task.id} ran a deploy or server command: ${String(p.CommandLine).slice(0, 200)}`, { run: id, task: task.id }, `agy:${acc.id}`);
          }
          saveRun(run);
        }
      }
      if (ev.event === 'result') {
        status = ev.result.status; usage = ev.result.usage;
        if (ev.result.response) run.response = ev.result.response;
        if (status !== 'SUCCESS' && quotaRe.test(JSON.stringify(ev.result))) quotaHit = true;
      }
      if (ev.event === 'error' && quotaRe.test(line)) quotaHit = true;
    }
  });
  proc.stderr.on('data', d => { errBuf += d; log.write(JSON.stringify({ event: 'stderr', text: String(d) }) + '\n'); if (quotaRe.test(String(d))) quotaHit = true; });

  proc.on('close', code => {
    live.delete(id);
    log.end();
    const secs = (Date.now() - Date.parse(run.started)) / 1000;
    run.state = code === 0 && status === 'SUCCESS' ? 'done' : (run.state === 'killed' ? 'killed' : 'failed');
    run.ended = S.now(); run.code = code; run.status = status;
    M.recordUsage(acc.id, r.model, usage || {}, { seconds: secs, failed: run.state !== 'done' });
    if (run.isolated) { try { run.diffstat = git(['diff', '--stat', `main...${run.branch}`]); } catch {} }
    saveRun(run);

    if (quotaHit && run.state === 'failed') {
      M.markExhausted(acc.id, r.model);
      const next = M.fallback(r.model, acc.id);
      if (next && run.attempt < 3) {
        S.emit('run.retry', `${task.id} ran out of quota on ${r.model}. Retrying with ${next}.`, { run: id }, 'router');
        try { return dispatch(task.id, { ...opts, model: next, attempt: run.attempt + 1 }); } catch (e) { S.emit('hive.error', e.message); }
      }
    }
    const fresh = S.getTask(task.id);
    const summary = (run.response || errBuf || '').trim().slice(0, 1200);
    if (run.state === 'done') {
      if (fresh.status === 'in_progress') S.updateTask(task.id, { status: 'needs_review', note: `Worker finished (${r.model}, ${Math.round(secs)} s). ${summary}` }, `agy:${acc.id}`);
      else S.updateTask(task.id, { note: `Worker finished. ${summary}` }, `agy:${acc.id}`);
    } else if (run.state !== 'killed') {
      S.updateTask(task.id, { status: 'blocked', note: `Worker failed (exit ${code}, ${status || 'no result'}). ${summary.slice(0, 600)}` }, `agy:${acc.id}`);
    }
    S.emit('run.end', `${task.id} ${run.state} after ${Math.round(secs)} s, ${run.steps} steps, ${usage ? usage.total_tokens : 0} tokens`, { run: id, state: run.state, task: task.id }, `agy:${acc.id}`);
  });
  return run;
}

function kill(runId) {
  const l = live.get(runId);
  if (!l) throw new Error(`Run ${runId} is not running`);
  l.run.state = 'killed';
  try { execFileSync('taskkill', ['/PID', String(l.proc.pid), '/T', '/F'], { stdio: 'ignore' }); } catch { l.proc.kill(); }
  S.emit('run.kill', `${l.run.task} stopped by @claude`, { run: runId }, '@claude');
  return l.run;
}

function runLog(runId, tail = 60) {
  const f = path.join(S.P.runs, `${runId}.jsonl`);
  if (!fs.existsSync(f)) return [];
  const out = [];
  for (const line of fs.readFileSync(f, 'utf8').trim().split('\n')) {
    try {
      const e = JSON.parse(line);
      if (e.event === 'step_update') {
        const s = e.step_update;
        if (s.step_type === 'tool' && s.state === 'ACTIVE') { const p = (s.tool_info && s.tool_info.parameters) || {}; out.push(`> ${s.tool_name} ${String(p.CommandLine || p.AbsolutePath || p.TargetFile || p.Url || JSON.stringify(p)).slice(0, 240)}`); }
        if (s.step_type === 'tool' && s.state === 'DONE' && s.tool_info && s.tool_info.output) out.push(`  ${String(s.tool_info.output).trim().split('\n').slice(0, 4).join(' | ').slice(0, 300)}`);
        if (s.text_delta && s.state === 'DONE') out.push(`: ${s.text_delta.trim().slice(0, 400)}`);
      } else if (e.event === 'result') out.push(`= ${e.result.status}: ${String(e.result.response || '').slice(0, 1500)}`);
      else if (e.event === 'stderr') out.push(`! ${e.text.trim().slice(0, 300)}`);
    } catch {}
  }
  return out.slice(-tail);
}

// Review: the diff a worker produced, for @claude to judge.
function diff(taskId, maxChars = 60000) {
  const t = S.getTask(taskId);
  if (!t) throw new Error(`No task ${taskId}`);
  if (!t.branch) return { note: 'This ticket ran in the main folder, not a worktree. Use git diff in the main repo.', stat: git(['diff', '--stat']) };
  const stat = git(['diff', '--stat', `main...${t.branch}`]);
  const body = git(['diff', `main...${t.branch}`]);
  const log = git(['log', '--oneline', `main..${t.branch}`]);
  return { branch: t.branch, commits: log, stat, diff: body.length > maxChars ? body.slice(0, maxChars) + '\n[diff truncated]' : body };
}

// Merge a reviewed branch into main and remove its worktree.
function merge(taskId, { cleanup = true } = {}) {
  const t = S.getTask(taskId);
  if (!t || !t.branch) throw new Error(`${taskId} has no branch to merge`);
  const out = git(['merge', '--no-ff', '-m', `Merge ${t.branch}: ${t.title}

Reviewed by the Hive head.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`, t.branch]);
  if (cleanup) {
    const dir = path.join(path.resolve(S.ROOT, S.config().worktreeRoot), t.id);
    try { git(['worktree', 'remove', '--force', dir]); } catch {}
    try { git(['branch', '-d', t.branch]); } catch {}
  }
  S.updateTask(taskId, { status: 'done', note: `Reviewed and merged into main by @claude.` }, '@claude');
  return out;
}

// Open an interactive agy (or claude) in a Windows Terminal tab, under an account.
function launch(what, { account, cwd } = {}) {
  const cfg = S.config();
  const dir = cwd ? S.abs(cwd) : S.ROOT;
  if (what === 'desktop') {
    spawn(S.expand(cfg.agy.desktopExe), [dir], { detached: true, stdio: 'ignore' }).unref();
    S.emit('launch', 'Antigravity Desktop opened', {}, '@claude');
    return { ok: true };
  }
  const acc = what === 'agy' ? pickAccount(account) : null;
  const cmd = what === 'claude' ? ['claude'] : [agyExe()];
  const envSet = acc && acc.profile ? `set "USERPROFILE=${S.abs(acc.profile)}" && set "HOME=${S.abs(acc.profile)}" && ` : '';
  const title = what === 'claude' ? 'Claude (head)' : `agy ${acc.id}`;
  spawn('wt', ['-w', 'hive', 'new-tab', '--title', title, '-d', dir, 'cmd', '/k', `${envSet}${cmd.map(c => `"${c}"`).join(' ')}`], { detached: true, stdio: 'ignore', shell: false }).unref();
  S.emit('launch', `${title} opened in Windows Terminal`, {}, '@claude');
  return { ok: true, title };
}

module.exports = { dispatch, kill, runLog, diff, merge, launch, listRuns, live };
