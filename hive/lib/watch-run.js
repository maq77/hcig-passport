#!/usr/bin/env node
// Live CLI Monitor: tails a Hive worker run in real time inside Windows Terminal.
const fs = require('fs');
const path = require('path');

const runId = process.argv[2];
if (!runId) {
  console.log('Usage: node hive/lib/watch-run.js <runId>');
  process.exit(1);
}

const ROOT = path.resolve(__dirname, '..', '..');
const file = path.join(ROOT, '.hive', 'runs', `${runId}.jsonl`);

// ANSI styles
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';
const CYAN = '\x1b[38;2;18;192;198m'; // HCIG Turquoise
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const GRAY = '\x1b[90m';

console.clear();
console.log(`${CYAN}================================================================${RESET}`);
console.log(`${BOLD}${CYAN}  HCIG HIVE - LIVE AGENT MONITOR${RESET}`);
console.log(`  Run: ${BOLD}${runId}${RESET}`);
console.log(`${CYAN}================================================================${RESET}\n`);

let pos = 0;
let runFinished = false;
let stepCounter = 0;
let waitingLogged = false;

function cleanOutput(str) {
  if (!str) return '';
  return String(str)
    .replace(/[—–]/g, '.')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1');
}

function readNew() {
  if (!fs.existsSync(file)) {
    if (!waitingLogged) {
      console.log(`${GRAY}Waiting for worker process to initialize...${RESET}`);
      waitingLogged = true;
    }
    return;
  }
  const stat = fs.statSync(file);
  if (stat.size <= pos) return;

  const fd = fs.openSync(file, 'r');
  const buf = Buffer.alloc(stat.size - pos);
  fs.readSync(fd, buf, 0, buf.length, pos);
  fs.closeSync(fd);
  pos = stat.size;

  const lines = buf.toString('utf8').split('\n');
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    let ev;
    try { ev = JSON.parse(line); } catch { continue; }

    if (ev.event === 'init') {
      console.log(`${GREEN}[INIT]${RESET} Worker started in ${ev.cwd || 'workspace'}`);
      if (ev.model) console.log(`${CYAN}[MODEL]${RESET} ${ev.model}`);
      console.log(`${GRAY}----------------------------------------------------------------${RESET}\n`);
    } else if (ev.event === 'step_update') {
      const s = ev.step_update;
      if (s.step_type === 'tool' && s.state === 'ACTIVE') {
        stepCounter++;
        console.log(`\n${BOLD}${CYAN}>>> [STEP ${stepCounter}] TOOL: ${s.tool_name}${RESET}`);
        if (s.tool_info && s.tool_info.parameters) {
          const p = s.tool_info.parameters;
          const target = p.CommandLine || p.AbsolutePath || p.TargetFile || p.Url || p.Query || '';
          if (target) console.log(`    ${GRAY}Target:${RESET} ${cleanOutput(target)}`);
        }
      } else if (s.tool_info && s.tool_info.output) {
        const out = cleanOutput(String(s.tool_info.output).trim());
        if (out) {
          const preview = out.slice(0, 300);
          console.log(`    ${GRAY}Output:${RESET} ${preview}${out.length > 300 ? ' ... [truncated]' : ''}`);
        }
      } else if (s.text_delta) {
        process.stdout.write(cleanOutput(s.text_delta));
      }
    } else if (ev.event === 'result') {
      runFinished = true;
      console.log(`\n${CYAN}----------------------------------------------------------------${RESET}`);
      const isSuccess = ev.result.status === 'SUCCESS';
      const statusColor = isSuccess ? GREEN : RED;
      console.log(`[FINISHED] Status: ${statusColor}${ev.result.status}${RESET}`);
      if (ev.result.usage) {
        console.log(`[USAGE] Total tokens: ${ev.result.usage.total_tokens || 0}`);
      }
      if (ev.result.response) {
        console.log(`\n${BOLD}[FINAL ANSWER]:${RESET}\n${cleanOutput(ev.result.response)}`);
      }
      console.log(`\n${CYAN}================================================================${RESET}`);
      console.log('Run finished. You can review the output above or close this window.\n');
    } else if (ev.event === 'stderr') {
      if (ev.text) {
        console.log(`${RED}[STDERR]${RESET} ${cleanOutput(ev.text.trim())}`);
      }
    }
  }
}

// Initial read
readNew();

// Polling interval for robust file watching on Windows
const interval = setInterval(() => {
  readNew();
  if (runFinished) {
    clearInterval(interval);
  }
}, 400);
