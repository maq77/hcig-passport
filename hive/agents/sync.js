#!/usr/bin/env node
// Writes the roles in roles.js out for both Claude Code and Antigravity.
//   node hive/agents/sync.js
const fs = require('fs');
const os = require('os');
const path = require('path');
const ROLES = require('./roles');

const ROOT = path.resolve(__dirname, '..', '..');
const CLAUDE_DIR = path.join(ROOT, '.claude', 'agents');
const AGY_DIR = path.join(__dirname, 'skills');
const SKILLS_JSON = path.join(os.homedir(), '.gemini', 'config', 'skills.json');

const SHARED = `## Rules for every HCIG agent
- Read \`.hive/brain.md\` first when you work inside the Hive; it holds the state of play and the rules.
- No em dashes or en dashes anywhere. Short lines; headline plus one short note, never filler paragraphs.
- Never invent medical claims, outcomes, prices, statistics, times or accreditations. Mark a missing fact as a placeholder.
- HCIG brand guidelines, light designs and real photography win over any skill's defaults.
- Verify before claiming: check the live page, the real file, the actual number. Say "verified" only when you did.
- **Evidence or nothing.** Every number in a report comes from a tool output you can point to (a saved JSON, a command's output). If a tool fails (quota, 429, timeout), write that it failed and stop. Never fill a report with numbers you did not measure, and never state a threshold nobody set.
- Live sites: back up before changing, and only the head (Claude) deploys.
- Never hunt for credentials in other tools' files, transcripts or browser data, and never write a key into a file. Missing a key means blocked, not improvised.
- Report on a Hive ticket with \`node hive/cli.js note <ID> "..."\`; finished means checks passed and the ticket is \`needs_review\`.`;

const esc = s => s.replace(/"/g, '\\"');

function claudeAgent(r) {
  return `---
name: ${r.id}
description: "${esc(r.name)}. Use for: ${esc(r.when)}"
model: ${r.claudeModel || 'inherit'}
---

# ${r.name}

You are the HCIG Hive's ${r.name}. The head (Claude Code) hands you focused work; do it fully and report back in short lines.

**Use me for:** ${r.when}

## How I work
${r.body}

${r.skills && r.skills.length ? `## Skills to load when they fit\n${r.skills.map(s => `- \`${s}\``).join('\n')}\n` : ''}${r.mcp && r.mcp.length ? `## Tools\n${r.mcp.map(m => `- MCP \`${m}\``).join('\n')}\n` : ''}
${SHARED}
`;
}

function agySkill(r) {
  return `---
name: role-${r.id}
description: "Act as the HCIG ${esc(r.name)}. Use when the ticket or user names this role, or the work is: ${esc(r.when)}"
---

# Role: ${r.name}

**Use for:** ${r.when}

## How to work
${r.body}

${r.skills && r.skills.length ? `## Load these skills when they fit\n${r.skills.map(s => `- \`${s}\``).join('\n')}\n` : ''}${r.mcp && r.mcp.length ? `## MCP servers to use\n${r.mcp.map(m => `- \`${m}\``).join('\n')}\n` : ''}
${SHARED}
`;
}

fs.mkdirSync(CLAUDE_DIR, { recursive: true });
fs.mkdirSync(AGY_DIR, { recursive: true });
const ids = new Set(ROLES.map(r => r.id));

// Remove generated files for roles that no longer exist.
for (const f of fs.readdirSync(CLAUDE_DIR)) {
  const id = f.replace(/\.md$/, '');
  const txt = fs.readFileSync(path.join(CLAUDE_DIR, f), 'utf8');
  if (!ids.has(id) && txt.includes("The head (Claude Code) hands you focused work")) fs.unlinkSync(path.join(CLAUDE_DIR, f));
}
for (const d of fs.readdirSync(AGY_DIR)) if (!ids.has(d.replace(/^role-/, ''))) fs.rmSync(path.join(AGY_DIR, d), { recursive: true, force: true });

for (const r of ROLES) {
  fs.writeFileSync(path.join(CLAUDE_DIR, `${r.id}.md`), claudeAgent(r));
  fs.mkdirSync(path.join(AGY_DIR, `role-${r.id}`), { recursive: true });
  fs.writeFileSync(path.join(AGY_DIR, `role-${r.id}`, 'SKILL.md'), agySkill(r));
}

// Register the role skills with agy. Written with node: PowerShell 5.1 adds a BOM agy cannot parse.
try {
  const cfg = fs.existsSync(SKILLS_JSON) ? JSON.parse(fs.readFileSync(SKILLS_JSON, 'utf8').replace(/^﻿/, '')) : { entries: [] };
  const p = AGY_DIR.replace(/\\/g, '/');
  if (!cfg.entries.some(e => e.path === p)) cfg.entries.push({ path: p });
  fs.mkdirSync(path.dirname(SKILLS_JSON), { recursive: true });
  fs.writeFileSync(SKILLS_JSON, JSON.stringify(cfg, null, 2));
} catch (e) { console.error('Could not register with agy:', e.message); }

console.log(`${ROLES.length} roles written: .claude/agents/ (Claude) and hive/agents/skills/ (agy, registered in ${SKILLS_JSON})`);
