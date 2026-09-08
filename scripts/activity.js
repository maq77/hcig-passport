#!/usr/bin/env node
/**
 * Write `content/activity.json` from the git history.
 *
 * This runs locally, before a commit, and the result is committed. It is
 * deliberately NOT part of `build.js`: Vercel shallow-clones the repo, so
 * running `git log` inside a Vercel build would silently produce a short or
 * empty history and the activity page would quietly lose most of itself.
 *
 * Each entry is a date, a subject, and any projects the message names, matched
 * against the registry so the mapping can never drift from the real project
 * list.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const { COMPANIES } = require('../content/registry');

const OUT = path.join(__dirname, '..', 'content', 'activity.json');
const MAX = 300;

/** name and slug for every visible project, so a commit subject can be matched */
const KNOWN = COMPANIES.flatMap((c) =>
  c.projects
    .filter((p) => !p.hidden)
    .map((p) => ({ label: `${c.short}: ${p.name}`, name: p.name, slug: `${c.slug}/${p.slug}` }))
);

/**
 * A held-back project must not surface anywhere, and a commit subject is text
 * like any other: "Hold back HCIG Passport" would put the name straight onto
 * the activity feed. Redact rather than drop the commit, so the history stays
 * honest about the fact that something changed.
 */
const HIDDEN = COMPANIES.flatMap((c) =>
  c.projects.filter((p) => p.hidden).flatMap((p) => [p.name, `${c.slug}/${p.slug}`])
);

function redact(subject) {
  let out = subject;
  for (const needle of HIDDEN) {
    const re = new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    out = out.replace(re, 'a held-back project');
  }
  // collapse "a held-back project and the a held-back project" into one
  return out.replace(/(a held-back project)(\s+and\s+the\s+\1)+/gi, '$1').replace(/\s{2,}/g, ' ').trim();
}

function gitLog() {
  // %x1f is a unit separator, safe inside a commit subject in a way | is not
  const raw = execFileSync(
    'git',
    ['log', `-${MAX}`, '--no-merges', '--date=short', '--pretty=format:%ad%x1f%s'],
    { cwd: path.join(__dirname, '..'), encoding: 'utf8' }
  );
  return raw
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const [date, subject] = line.split('\x1f');
      return { date, subject: redact((subject || '').trim()) };
    })
    .filter((e) => /^\d{4}-\d{2}-\d{2}$/.test(e.date) && e.subject);
}

function tag(entry) {
  const hay = entry.subject.toLowerCase();
  const hits = KNOWN.filter((k) => hay.includes(k.name.toLowerCase()) || hay.includes(k.slug)).map((k) => k.label);
  return [...new Set(hits)];
}

let log;
try {
  log = gitLog();
} catch (e) {
  console.error('\n  Could not read git history. Is this a git repository?\n');
  process.exit(1);
}

const entries = log.map((e) => {
  const projects = tag(e);
  return projects.length ? { ...e, projects } : e;
});

fs.writeFileSync(OUT, JSON.stringify(entries, null, 2) + '\n');

const tagged = entries.filter((e) => e.projects).length;
console.log(`  activity.json  ${entries.length} entries, ${tagged} matched to a project`);
