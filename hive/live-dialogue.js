#!/usr/bin/env node
// HCIG Hive Live Dual-Agent Dialogue & Human Steering Console
// Enables two specialized AI models (Claude Opus 4.6 and Gemini 3.1 Pro)
// to conduct a real-time, turn-by-turn engineering discussion while the
// human supervisor monitors and injects guidance or steering at any turn.

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { spawn } = require('child_process');
const S = require('./lib/store');
const M = require('./lib/models');

// ANSI formatting
const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  gray: '\x1b[90m',
  white: '\x1b[37m',
  bgDark: '\x1b[40m'
};

const argv = process.argv.slice(2);
const flag = (n, d) => {
  const i = argv.indexOf('--' + n);
  if (i < 0) return d;
  const v = argv[i + 1];
  return (v && !v.startsWith('--')) ? v : true;
};

const taskId = flag('task', '');
const customTopic = flag('topic', '');
const model1 = flag('model1', 'claude-opus-4-6-thinking');
const model2 = flag('model2', 'gemini-3.1-pro-high');
const maxTurns = parseInt(flag('turns', '30'), 10);

function cleanDashes(text) {
  if (!text) return '';
  return text.replace(/\u2014/g, '. ').replace(/\u2013/g, ' to ');
}

async function ask(rl, q) {
  return new Promise(resolve => rl.question(q, ans => resolve(ans.trim())));
}

function queryAgy(model, prompt) {
  return new Promise((resolve, reject) => {
    const args = ['-p', prompt, '--model', model];
    if (model.startsWith('gemini-3.1-pro') || model.startsWith('gemini-3.8-flash')) {
      args.push('--effort', 'high');
    }
    const started = Date.now();
    const p = spawn('agy', args, { cwd: S.ROOT, stdio: ['ignore', 'pipe', 'pipe'] });

    let stdout = '';
    let stderr = '';

    p.stdout.on('data', d => { stdout += d; });
    p.stderr.on('data', d => { stderr += d; });

    p.on('close', code => {
      const elapsed = ((Date.now() - started) / 1000).toFixed(1);
      if (code !== 0 && !stdout.trim()) {
        return reject(new Error(stderr.trim() || `Process exited with code ${code}`));
      }
      const answer = cleanDashes(stdout.trim());
      resolve({ answer, elapsed, model });
    });

    p.on('error', err => reject(err));
  });
}

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.clear();
  console.log(`${C.bold}${C.cyan}================================================================================${C.reset}`);
  console.log(`${C.bold}${C.white}  HCIG HIVE: LIVE DUAL-AGENT DIALOGUE & USER STEERING CONSOLE${C.reset}`);
  console.log(`${C.bold}${C.cyan}================================================================================${C.reset}`);
  console.log(`${C.gray}  Autonomous Collaboration with Human-in-the-Loop Real-Time Steering${C.reset}\n`);

  let topic = customTopic;
  let taskObj = null;

  if (taskId) {
    taskObj = S.getTask(taskId);
    if (taskObj) {
      topic = `[${taskObj.id}] ${taskObj.title}\nDescription: ${taskObj.description || 'None'}\nAcceptance Criteria: ${(taskObj.acceptance || []).join('; ')}`;
      console.log(`${C.yellow}Loaded Ticket:${C.reset} ${C.bold}${taskObj.id} - ${taskObj.title}${C.reset}`);
    }
  }

  if (!topic) {
    console.log(`${C.bold}${C.white}Select a discussion topic for the agents:${C.reset}`);
    console.log(`  ${C.bold}1${C.reset}) 24/7 Clinic: Homepage Rebuild, Urgent Care Repositioning & Cashless Care`);
    console.log(`  ${C.bold}2${C.reset}) 24/7 Clinic: Hotel Landing Pages, Irina Brief Alignment & GA4 Tracking`);
    console.log(`  ${C.bold}3${C.reset}) MedPark Hospitals: SEO Page 1 Rankings, Mobile Speed & LCP Optimization`);
    console.log(`  ${C.bold}4${C.reset}) Medcierge: Multi-Language Static Export, Routing & Performance`);
    console.log(`  ${C.bold}5${C.reset}) Custom Topic (type your own)\n`);

    const choice = await ask(rl, `${C.yellow}Enter selection [1-5] (Default: 1): ${C.reset}`);

    if (choice === '2') {
      topic = '24/7 Clinic in-hotel landing pages (Design 1-4, Premier Le Reve, Steigenberger Ras Soma, Amwaj Beach Club). Review pack sign-off, open items, phone numbers, and GA4 event tracking.';
    } else if (choice === '3') {
      topic = 'MedPark Hospitals search rankings for the 8 priority terms (medpark, medpark hospital, hurghada hospital, hurghada medical center). Mobile LCP reduction and Core Web Vitals.';
    } else if (choice === '4') {
      topic = 'Medcierge Next.js static export: 529 pages in 7 languages, zero broken links, partner logo integration, and coast route destinations explorer.';
    } else if (choice === '5') {
      topic = await ask(rl, `${C.yellow}Enter custom topic: ${C.reset}`);
      if (!topic) topic = 'Coordination on active HCIG engineering priorities';
    } else {
      topic = '24/7 Clinic Homepage Rebuild per WEBSITE.docx and clinic247 design tokens (Poppins, Calisto MT, Classic Red #C00000, warm ground #FAF8F6). Hotel urgent care repositioning, UCA/GHA/GMWA accreditation wording, on-site treatments, cashless travel insurance coordination, and WhatsApp booking.';
    }
  }

  console.log(`\n${C.bold}${C.white}SESSION SETUP:${C.reset}`);
  console.log(`- ${C.cyan}Agent 1 (Chief Architect):${C.reset} ${model1}`);
  console.log(`- ${C.green}Agent 2 (Lead Implementer & QA):${C.reset} ${model2}`);
  console.log(`- ${C.yellow}Topic:${C.reset} ${topic.split('\n')[0]}`);
  console.log(`\n${C.gray}Instructions for Supervisor:${C.reset}`);
  console.log(`  * Watch the agents debate, plan, and refine the work turn-by-turn.`);
  console.log(`  * At each turn, press [ENTER] to let them continue, or type guidance to steer them.`);
  console.log(`  * Type 'exit' or 'quit' to end the session and save the transcript.\n`);
  console.log(`${C.bold}${C.cyan}--------------------------------------------------------------------------------${C.reset}\n`);

  const history = [
    `PRIMARY TOPIC:\n${topic}\n\nSTANDING RULES: Zero em dashes and zero en dashes anywhere. Short copy and restraint. Exact accreditation phrasing. White and warm canvas ground (#FFFFFF / #FAF8F6).`
  ];

  const logFile = path.join(S.P.root, '.hive', 'dialogue.log');
  fs.appendFileSync(logFile, `\n\n================================================================================\nSESSION START: ${new Date().toISOString()}\nTOPIC: ${topic}\n================================================================================\n\n`, 'utf8');

  let currentSpeaker = 1;

  for (let turn = 1; turn <= maxTurns; turn++) {
    const isAgent1 = (currentSpeaker === 1);
    const agentName = isAgent1 ? 'Agent 1 (Claude Code - Chief Architect)' : 'Agent 2 (Gemini 3.1 Pro - Implementer & QA)';
    const agentColor = isAgent1 ? C.cyan : C.green;
    const model = isAgent1 ? model1 : model2;

    process.stdout.write(`${agentColor}${C.bold}>>> [TURN ${turn}/${maxTurns}] ${agentName} is thinking...${C.reset}`);

    const prompt = [
      `You are ${agentName} in a live engineering conference with your colleague.`,
      isAgent1
        ? 'Your focus: System architecture, compliance, brand fidelity, rigorous verification, and overall technical direction.'
        : 'Your focus: Concrete code structure, edge case handling, performance optimization, build commands, and execution precision.',
      '',
      'Shared Rules: Never use em dashes or en dashes anywhere. Use a full stop and short sentence. Keep copy concise.',
      '',
      'Dialogue transcript so far:',
      history.slice(-5).join('\n\n---\n\n'),
      '',
      'Your turn to speak. Address the last points made directly and advance the technical plan with actionable clarity.'
    ].join('\n');

    let result;
    try {
      result = await queryAgy(model, prompt);
      process.stdout.write(`\r${agentColor}${C.bold}>>> [TURN ${turn}/${maxTurns}] ${agentName} (${result.elapsed}s):${C.reset}\n\n`);
    } catch (err) {
      process.stdout.write(`\r${C.red}>>> [TURN ${turn}/${maxTurns}] ${agentName} error: ${err.message}${C.reset}\n\n`);
      result = { answer: 'Let us proceed directly to the technical verification phase.', elapsed: '0.0' };
    }

    console.log(`${agentColor}${result.answer}${C.reset}\n`);

    history.push(`[${agentName}]:\n${result.answer}`);
    fs.appendFileSync(logFile, `[TURN ${turn}] [${agentName}] (${result.elapsed}s):\n${result.answer}\n\n`, 'utf8');

    // Human in the loop steering prompt
    console.log(`${C.gray}--------------------------------------------------------------------------------${C.reset}`);
    const guidance = await ask(rl, `${C.magenta}${C.bold}[SUPERVISOR STEERING]${C.reset} ${C.white}Type guidance or press [ENTER] to continue:${C.reset} `);

    if (guidance.toLowerCase() === 'exit' || guidance.toLowerCase() === 'quit') {
      console.log(`\n${C.yellow}Session concluded by supervisor. Full transcript saved to .hive/dialogue.log${C.reset}`);
      break;
    }

    if (guidance) {
      console.log(`\n${C.magenta}${C.bold}>>> [STEERING INJECTED BY SUPERVISOR]:${C.reset} ${C.yellow}${guidance}${C.reset}\n`);
      history.push(`[SUPERVISOR GUIDANCE FROM USER]:\n${guidance}`);
      fs.appendFileSync(logFile, `[SUPERVISOR GUIDANCE]:\n${guidance}\n\n`, 'utf8');
    }

    currentSpeaker = isAgent1 ? 2 : 1;
  }

  rl.close();
}

main().catch(err => {
  console.error('Fatal error in dialogue console:', err);
  process.exit(1);
});
