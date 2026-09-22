#!/usr/bin/env node
/**
 * Watchdog: before and after screenshots for a branch.
 *
 * A diff does not show that a hero collapsed on a phone. This builds the site
 * twice, once from the base branch and once from the branch under review, and
 * photographs every page that actually changed at desktop and phone width.
 *
 * Usage:
 *   node scripts/watchdog/shots.js                     compare HEAD against main
 *   node scripts/watchdog/shots.js --branch hive/t-015 compare that branch
 *   node scripts/watchdog/shots.js --base main         change the base
 *   node scripts/watchdog/shots.js --limit 20          cap the pages photographed
 *   node scripts/watchdog/shots.js --json              machine-readable report
 *
 * How it works, and why:
 *   - The base build happens in a throwaway git worktree, so the working tree
 *     is never touched and nothing has to be stashed. No manual setup.
 *   - Pages are compared by the bytes of their built HTML. A page whose output
 *     is identical is reported as unchanged and is never photographed. That is
 *     what keeps a hundred-page site down to the handful that moved.
 *   - Images land in .hive/shots/, which is gitignored, so they can never end
 *     up in the site output.
 *   - Chromium comes from the Playwright browser cache and is driven with the
 *     headless screenshot flag. No new dependency, no browser download.
 *
 * It reads and photographs only. It changes nothing on any site.
 */

const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { execFileSync, execSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const SHOTS = path.join(ROOT, '.hive', 'shots');

const WIDTHS = [
  { name: 'desktop', w: 1440, h: 900 },
  { name: 'phone', w: 390, h: 844 },
];

// ---------- args ----------

const args = process.argv.slice(2);
function flag(name, fallback = null) {
  const i = args.indexOf(name);
  if (i === -1) return fallback;
  const v = args[i + 1];
  return v && !v.startsWith('--') ? v : true;
}
const jsonMode = args.includes('--json');
const limit = parseInt(flag('--limit', '40'), 10);

function log(...a) { if (!jsonMode) console.log(...a); }

// ---------- git ----------

function git(cmd, cwd = ROOT) {
  return execSync(`git ${cmd}`, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function currentBranch() {
  try { return git('rev-parse --abbrev-ref HEAD'); } catch { return 'HEAD'; }
}

// ---------- chromium ----------

/**
 * Find a browser that can take a screenshot from the command line.
 *
 * chrome-headless-shell is strongly preferred over the full Chromium: the full
 * browser's --screenshot flag hangs indefinitely in this environment and never
 * writes the file, while the shell returns in about two seconds. The full
 * browser is kept only as a fallback for machines that have no shell.
 *
 * Nothing is added as a dependency. Playwright already put these on the machine.
 */
function findChromium() {
  const roots = [
    process.env.PLAYWRIGHT_BROWSERS_PATH,
    path.join(os.homedir(), 'AppData', 'Local', 'ms-playwright'),
    path.join(os.homedir(), '.cache', 'ms-playwright'),
  ].filter(Boolean);

  // Ordered best first. The shell is what actually works.
  const candidates = [
    { prefix: 'chromium_headless_shell-', rels: [
      ['chrome-headless-shell-win64', 'chrome-headless-shell.exe'],
      ['chrome-headless-shell-linux64', 'chrome-headless-shell'],
      ['chrome-headless-shell-mac', 'chrome-headless-shell'],
    ] },
    { prefix: 'chromium-', rels: [
      ['chrome-win64', 'chrome.exe'],
      ['chrome-win', 'chrome.exe'],
      ['chrome-linux', 'chrome'],
      ['chrome-mac', 'Chromium.app', 'Contents', 'MacOS', 'Chromium'],
    ] },
  ];

  for (const c of candidates) {
    for (const root of roots) {
      let entries = [];
      try { entries = fs.readdirSync(root); } catch { continue; }
      const dirs = entries.filter(e => e.startsWith(c.prefix)).sort().reverse();
      for (const d of dirs) {
        for (const rel of c.rels) {
          const p = path.join(root, d, ...rel);
          if (fs.existsSync(p)) return p;
        }
      }
    }
  }
  return null;
}

/** Photograph one local HTML file at one width. */
function shoot(chromium, htmlPath, outPath, width, height) {
  const url = 'file:///' + htmlPath.replace(/\\/g, '/');
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'hcig-shot-'));
  try {
    execFileSync(chromium, [
      '--headless',
      '--disable-gpu',
      '--hide-scrollbars',
      '--no-sandbox',
      '--no-first-run',
      '--force-device-scale-factor=1',
      // A page that phones home would make the shot depend on the network.
      // These pages load Google Fonts, and without a time budget Chromium
      // waits on that fetch forever and never writes the file.
      '--disable-background-networking',
      '--disable-extensions',
      '--disable-sync',
      '--virtual-time-budget=8000',
      '--run-all-compositor-stages-before-draw',
      `--user-data-dir=${profile}`,
      `--window-size=${width},${height}`,
      `--screenshot=${outPath}`,
      url,
    ], { stdio: 'ignore', timeout: 45000 });
    return fs.existsSync(outPath) && fs.statSync(outPath).size > 0;
  } catch {
    return false;
  } finally {
    try { fs.rmSync(profile, { recursive: true, force: true }); } catch {}
  }
}

// ---------- build ----------

function build(cwd) {
  execSync('node build.js', { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  return path.join(cwd, 'dist');
}

/** Every built HTML page under a dist dir, keyed by its path relative to dist. */
function pageMap(distDir) {
  const out = new Map();
  if (!fs.existsSync(distDir)) return out;
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else if (e.name.endsWith('.html')) {
        out.set(path.relative(distDir, full).replace(/\\/g, '/'), full);
      }
    }
  };
  walk(distDir);
  return out;
}

// ---------- main ----------

function main() {
  const branch = flag('--branch') || currentBranch();
  const base = flag('--base') || 'main';

  const chromium = findChromium();
  if (!chromium) {
    const msg = 'No Chromium found. Install one with: npx playwright install chromium';
    if (jsonMode) { console.log(JSON.stringify({ ok: false, error: msg })); process.exit(2); }
    console.error(`\n  ${msg}\n`);
    process.exit(2);
  }

  // A dirty tree is compared as it stands, which is usually what a reviewer
  // wants. Saying so matters: otherwise "main to main" looks like a bug when
  // it is really uncommitted work showing up as changed pages.
  let dirty = 0;
  try { dirty = git('status --porcelain').split('\n').filter(Boolean).length; } catch {}

  log(`\n  Before and after: ${base} to ${branch}`);
  if (dirty) log(`  Working tree has ${dirty} uncommitted file(s). They are included in "after".`);
  log(`  Browser: ${chromium}\n`);

  // ---------- build the branch (the working tree as it stands) ----------
  log('  Building the branch...');
  const afterDist = build(ROOT);

  // Snapshot it: the base build overwrites dist/ in this same tree otherwise.
  const afterCopy = fs.mkdtempSync(path.join(os.tmpdir(), 'hcig-after-'));
  fs.cpSync(afterDist, afterCopy, { recursive: true });

  // ---------- build the base in a throwaway worktree ----------
  log(`  Building ${base} in a temporary worktree...`);
  const wt = fs.mkdtempSync(path.join(os.tmpdir(), 'hcig-base-'));
  let beforeCopy = null;
  let baseError = null;
  try {
    git(`worktree add --detach "${wt}" ${base}`);
    const beforeDist = build(wt);
    beforeCopy = beforeDist;
  } catch (err) {
    baseError = err.message;
  }

  const before = beforeCopy ? pageMap(beforeCopy) : new Map();

  // ---------- decide what actually changed ----------
  const changed = [];
  const unchanged = [];
  const added = [];
  const removed = [];

  // The snapshot is the source of truth from here on: the base build below
  // overwrote dist/ in this tree.
  const afterPages = pageMap(afterCopy);

  for (const [rel, afterPath] of afterPages) {
    const beforePath = before.get(rel);
    if (!beforePath) { added.push(rel); continue; }
    const a = fs.readFileSync(afterPath);
    const b = fs.readFileSync(beforePath);
    if (a.equals(b)) unchanged.push(rel);
    else changed.push(rel);
  }
  for (const rel of before.keys()) {
    if (!afterPages.has(rel)) removed.push(rel);
  }

  log(`\n  ${changed.length} changed, ${added.length} added, ${removed.length} removed, ${unchanged.length} unchanged\n`);

  // ---------- photograph only what moved ----------
  const outDir = path.join(SHOTS, branch.replace(/[^a-z0-9._-]/gi, '-'));
  fs.mkdirSync(outDir, { recursive: true });

  const shots = [];
  const targets = [...changed.map(r => ({ rel: r, kind: 'changed' })),
                   ...added.map(r => ({ rel: r, kind: 'added' }))].slice(0, limit);

  for (const t of targets) {
    const safe = t.rel.replace(/[/\\]/g, '_').replace(/\.html$/, '');
    const entry = { page: t.rel, kind: t.kind, images: {} };

    for (const w of WIDTHS) {
      if (t.kind === 'changed') {
        const bOut = path.join(outDir, `${safe}--before--${w.name}.png`);
        if (shoot(chromium, before.get(t.rel), bOut, w.w, w.h)) {
          entry.images[`before_${w.name}`] = bOut;
        }
      }
      const aOut = path.join(outDir, `${safe}--after--${w.name}.png`);
      if (shoot(chromium, afterPages.get(t.rel), aOut, w.w, w.h)) {
        entry.images[`after_${w.name}`] = aOut;
      }
    }

    shots.push(entry);
    log(`    ${t.kind === 'added' ? '+' : '~'} ${t.rel}  (${Object.keys(entry.images).length} images)`);
  }

  // ---------- clean up the worktree ----------
  try { git(`worktree remove "${wt}" --force`); } catch {}
  try { fs.rmSync(afterCopy, { recursive: true, force: true }); } catch {}

  const report = {
    ok: true,
    branch,
    base,
    dirtyFiles: dirty,
    baseError,
    outDir,
    counts: {
      changed: changed.length,
      added: added.length,
      removed: removed.length,
      unchanged: unchanged.length,
      photographed: shots.length,
    },
    // Named explicitly, because "no image" must mean "did not change",
    // never "we forgot".
    unchanged,
    removed,
    shots,
  };

  if (jsonMode) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    if (baseError) {
      console.log(`\n  WARNING: could not build ${base} (${baseError}).`);
      console.log('  Every page is being treated as new. Before images are missing.\n');
    }
    if (targets.length < changed.length + added.length) {
      console.log(`\n  Capped at ${limit}. ${changed.length + added.length - targets.length} more changed pages were not photographed.`);
      console.log('  Raise it with --limit.');
    }
    console.log(`\n  ${shots.length} page(s) photographed into ${outDir}`);
    console.log(`  ${unchanged.length} page(s) unchanged, no image produced.\n`);
  }

  const reportPath = path.join(outDir, 'report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log(`  Report: ${reportPath}\n`);
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    if (jsonMode) console.log(JSON.stringify({ ok: false, error: err.message }));
    else console.error(`\n  Screenshot run failed: ${err.message}\n`);
    process.exit(2);
  }
}

module.exports = { findChromium, pageMap, WIDTHS };
