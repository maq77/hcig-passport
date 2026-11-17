import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const targets = [join(root, "agent"), join(root, "apps", "web", "src")];
const skip = new Set(["node_modules", ".next"]);
const binary = /\.(png|jpe?g|gif|webp|ico|mp3|wav|woff2?|ttf|otf|pdf)$/i;
const rules = [
  [/\u2014/, "em dash"],
  [/\u2013/, "en dash"],
  [/accredited/i, 'the word "accredited"'],
];

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    if (skip.has(name)) continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) yield* walk(full);
    else if (!binary.test(name)) yield full;
  }
}

// The word "accredited" may appear in the agent's own rules that forbid it: a line under a
// "## Never say" heading, or an agent/ line that says "never" or "not". Nowhere else.
const agentDir = join(root, "agent");
const isForbiddingRule = (file, line, inNeverSection) =>
  file.startsWith(agentDir) && (inNeverSection || /\b(never|not)\b/i.test(line));

const problems = [];
for (const t of targets) {
  if (!existsSync(t)) continue;
  for (const file of walk(t)) {
    let inNeverSection = false;
    readFileSync(file, "utf8").split(/\r?\n/).forEach((line, i) => {
      if (/^#{1,6}\s/.test(line)) inNeverSection = /never say/i.test(line);
      for (const [re, label] of rules) {
        if (!re.test(line)) continue;
        if (label.includes("accredited") && isForbiddingRule(file, line, inNeverSection)) continue;
        problems.push(`${file}:${i + 1}: ${label}`);
      }
    });
  }
}
if (problems.length) {
  console.error("check-copy failed:\n" + problems.join("\n"));
  process.exit(1);
}
console.log("check-copy ok");
