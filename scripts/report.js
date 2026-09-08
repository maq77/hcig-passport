#!/usr/bin/env node
/**
 * Write `report.md`, the same report as `/report` in text you can paste into
 * an email.
 *
 * It reads the same registry the page does, so the two can never disagree.
 * The page is the link you send; this is for when she reads mail and not links.
 */

const fs = require('fs');
const path = require('path');

const { COMPANIES, REVIEWER, OWNER } = require('../content/registry');

const OUT = path.join(__dirname, '..', 'report.md');
const SITE = 'https://hcig-passport.vercel.app';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const nice = (iso) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
};

// hidden projects stay out of the report, exactly as they stay off the site
const all = COMPANIES.flatMap((c) => c.projects.filter((p) => !p.hidden).map((p) => ({ c, p })));

const pick = (...s) => all.filter(({ p }) => s.includes(p.status));
const waiting = pick('review');
const stuck = pick('blocked');
const building = pick('draft', 'changes');
const approved = pick('approved');
const live = pick('live').sort((a, b) => b.p.updated.localeCompare(a.p.updated));

const today = new Date().toISOString().slice(0, 10);
const out = [];

out.push('# Where the work stands');
out.push('');
out.push(`${nice(today)} · ${OWNER} · for ${REVIEWER.split(',')[0]}`);
out.push('');
out.push(
  `**${waiting.length} waiting on you · ${stuck.length} stuck · ${building.length} being built · ` +
    `${approved.length} ready to deploy · ${live.length} live**`
);
out.push('');

function section(title, note, list, extra) {
  out.push(`## ${title} (${list.length})`);
  out.push('');
  if (note) {
    out.push(note);
    out.push('');
  }
  if (!list.length) {
    out.push('Nothing.');
    out.push('');
    return;
  }
  for (const x of list) {
    const tail = extra ? extra(x) : '';
    out.push(`- **${x.p.name}** (${x.c.short}) ${SITE}/${x.c.slug}/${x.p.slug}`);
    out.push(`  ${x.p.summary}${tail ? ' ' + tail : ''}`);
  }
  out.push('');
}

section('Waiting on you', 'Sent for review. Nothing moves until you look.', waiting);
section('Stuck on someone', 'Blocked outside the team.', stuck, ({ p }) =>
  p.detail && p.detail[0] ? `\n  Why: ${p.detail[0]}` : ''
);
section('Being built now', '', building, ({ p }) => (p.due ? `\n  Due ${nice(p.due)}.` : ''));
section('Approved, ready to go live', '', approved);
section('Live on their site', '', live);

out.push('---');
out.push('');
out.push(`Everything above is on ${SITE}. Every line links to the thing itself.`);
out.push('');

fs.writeFileSync(OUT, out.join('\n'));
console.log(`  report.md  ${out.length} lines, ${all.length} projects`);
