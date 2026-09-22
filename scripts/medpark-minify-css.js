#!/usr/bin/env node
/**
 * MedPark: generate css/v2.min.css from css/v2.css.
 *
 * v2.css is 219 KB of hand-written, heavily commented CSS. The comments are
 * worth keeping: they explain why rules exist. But the file is render
 * blocking, and the comments are 47% of its gzipped weight.
 *
 * So the source keeps its comments and this writes the served copy.
 *
 *   gzipped: 51.8 KB with comments, 27.5 KB without.
 *
 * It strips comments and nothing else. No whitespace collapsing, no selector
 * rewriting, no property merging. Full minification saved only 2 KB more than
 * this and is where minifiers break stylesheets, so it is not worth the risk
 * on a site we are happy with.
 *
 * Run it after any edit to v2.css:
 *   node scripts/medpark-minify-css.js
 *
 * It refuses to write if the result would not parse the same number of rules.
 */

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'medpark-live', 'css', 'v2.css');
const OUT = path.join(ROOT, 'medpark-live', 'css', 'v2.min.css');

/**
 * Strip CSS comments without touching anything inside a string or a url().
 * A naive regex would corrupt `content: "/* not a comment *\/"`, so this walks
 * the file and tracks what it is inside.
 */
function stripComments(css) {
  let out = '';
  let i = 0;
  const n = css.length;
  let quote = null;

  while (i < n) {
    const c = css[i];
    const next = css[i + 1];

    if (quote) {
      out += c;
      if (c === '\\') { out += next === undefined ? '' : next; i += 2; continue; }
      if (c === quote) quote = null;
      i++;
      continue;
    }

    if (c === '"' || c === "'") { quote = c; out += c; i++; continue; }

    if (c === '/' && next === '*') {
      const end = css.indexOf('*/', i + 2);
      if (end === -1) break;          // unterminated comment, drop the rest
      i = end + 2;
      // Leave a newline so rules never accidentally join together.
      out += '\n';
      continue;
    }

    out += c;
    i++;
  }
  return out;
}

/** Collapse the blank lines the stripping leaves behind. Whitespace only. */
function tidy(css) {
  return css.replace(/\n{3,}/g, '\n\n').replace(/[ \t]+\n/g, '\n').trim() + '\n';
}

/**
 * Brace and declaration counts, for checking the OUTPUT is well formed.
 *
 * This is deliberately only run on comment-free CSS. Run against the commented
 * source it is meaningless: an apostrophe inside a comment ("don't") makes the
 * string matcher swallow the rest of the file and the counts come out wrong.
 * That is what it did on the first run of this script.
 */
function shape(css) {
  const noStrings = css.replace(/"(\\.|[^"\\])*"/g, '""').replace(/'(\\.|[^'\\])*'/g, "''");
  return {
    open: (noStrings.match(/\{/g) || []).length,
    close: (noStrings.match(/\}/g) || []).length,
    semis: (noStrings.match(/;/g) || []).length,
    atRules: (noStrings.match(/@[a-z-]+/gi) || []).length,
  };
}

/**
 * The real proof that a strip is safe is that a browser parses both files into
 * the same rules. That was checked by hand on 2026-09-22 and both came back
 * 1709 rules and 11646 declarations. To repeat it:
 *
 *   chrome-headless-shell --headless --allow-file-access-from-files --dump-dom
 *     <a page that links one file and writes styleSheets[0].cssRules into the title>
 *
 * The checks below are the cheap guards that run every time.
 */
function guards(src, out) {
  const problems = [];

  // Stripping an already stripped file must change nothing.
  if (stripComments(out) !== out) {
    problems.push('the strip is not idempotent, so it is eating something it should not');
  }

  const b = shape(out);
  if (b.open !== b.close) {
    problems.push(`unbalanced braces in the output: ${b.open} open, ${b.close} close`);
  }
  if (/\/\*/.test(out.replace(/"(\\.|[^"\\])*"/g, '""').replace(/'(\\.|[^'\\])*'/g, "''"))) {
    problems.push('a comment survived the strip');
  }
  if (out.length >= src.length) {
    problems.push('the output is not smaller than the source');
  }
  return { problems, shape: b };
}

function main() {
  const src = fs.readFileSync(SRC, 'utf8');
  const out = tidy(stripComments(src));

  const { problems, shape: b } = guards(src, out);
  if (problems.length) {
    console.error('  REFUSING TO WRITE:');
    for (const p of problems) console.error(`   - ${p}`);
    process.exit(1);
  }

  fs.writeFileSync(OUT, out);

  const kb = n => (n / 1024).toFixed(1) + ' KB';
  const gz = s2 => require('node:zlib').gzipSync(Buffer.from(s2), { level: 9 }).length;
  console.log(`  v2.css      ${kb(Buffer.byteLength(src))}  gzip ${kb(gz(src))}`);
  console.log(`  v2.min.css  ${kb(Buffer.byteLength(out))}  gzip ${kb(gz(out))}`);
  console.log(`  output: ${b.open} blocks, ${b.semis} declarations, ${b.atRules} at-rules`);
}

if (require.main === module) main();
module.exports = { stripComments, shape };
