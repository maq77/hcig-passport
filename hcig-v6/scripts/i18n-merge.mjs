// Merges the agy translation replies into i18n/<lang>.json and i18n/slugs.json, then checks every pair.
//   node scripts/i18n-merge.mjs <runsDir>        (runsDir holds <lang>-<n>/result.json from the relay)
// Checks (a failing string is left out, so it stays English and shows up in missing-<lang>.json):
//   same count as the job; no em or en dash, no spaced hyphen; every number of the English kept; brand names kept;
//   no "accredit" next to HCIG; length within a sane range.
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const V6 = join(dirname(fileURLToPath(import.meta.url)), "..");
const runs = process.argv[2];
const BRANDS = ["HCIG", "MedPark", "TMASI", "GHA", "DMWV", "UCA", "MedOne", "SCMG", "ITIC", "PULSE"];
const nums = (s) => (s.match(/\d+(?:[.,]\d+)*/g) || []).map((n) => n.replace(/[.,]/g, ""));

function check(en, tr) {
  const why = [];
  if (typeof tr !== "string" || !tr.trim()) return ["empty"];
  if (/[–—]| - /.test(tr) && !/[–—]| - /.test(en)) why.push("dash");
  const ne = nums(en), nt = nums(tr).join(" ");
  for (const n of ne) if (!nt.includes(n)) { why.push(`number ${n}`); break; }
  for (const b of BRANDS) if (en.includes(b) && !tr.includes(b)) { why.push(`name ${b}`); break; }
  if (/akkredit|accredit|acredit|akredit|accrédit/i.test(tr) && /HCIG/.test(tr) && !/accredit/i.test(en)) why.push("accredited");
  const r = tr.length / Math.max(en.length, 1);
  if (en.length > 30 && (r < 0.5 || r > 2.2)) why.push(`length ${r.toFixed(2)}`);
  return why;
}

const SLUGS = existsSync(join(V6, "i18n/slugs.json")) ? JSON.parse(readFileSync(join(V6, "i18n/slugs.json"), "utf8")) : {};
const report = {};
for (const job of readdirSync(runs).sort()) {
  const [lang] = job.split("-");
  const rf = join(runs, job, "result.json");
  const input = join(V6, "i18n/jobs", `${job}.json`);
  if (!existsSync(rf) || !existsSync(input)) continue;
  const res = JSON.parse(readFileSync(rf, "utf8"));
  const en = JSON.parse(readFileSync(input, "utf8"));
  const msg = String(res.finalMessage || "");
  const a = msg.indexOf("{"), b = msg.lastIndexOf("}");
  let data;
  try { data = JSON.parse(msg.slice(a, b + 1)); } catch (e) { report[job] = `unreadable reply (${res.status})`; continue; }
  const t = data.t || [];
  if (t.length !== en.length) { report[job] = `count ${t.length} of ${en.length}`; continue; }
  const f = join(V6, "i18n", `${lang}.json`);
  const dict = existsSync(f) ? JSON.parse(readFileSync(f, "utf8")) : {};
  const bad = [];
  en.forEach((s, i) => {
    const why = check(s, t[i]);
    if (why.length) bad.push({ en: s.slice(0, 80), tr: String(t[i]).slice(0, 80), why });
    else dict[s] = t[i].replace(/ /g, " ").trim();
  });
  writeFileSync(f, JSON.stringify(dict, null, 1));
  if (data.slugs) {
    const ok = Object.fromEntries(Object.entries(data.slugs).filter(([k, v]) => /^\/[a-z0-9/-]+\/$/.test(v) && k.split("/").length === v.split("/").length));
    SLUGS[lang] = { ...(SLUGS[lang] || {}), ...ok };
  }
  report[job] = { ok: en.length - bad.length, bad };
}
writeFileSync(join(V6, "i18n/slugs.json"), JSON.stringify(SLUGS, null, 1));
writeFileSync(join(V6, "i18n/merge-report.json"), JSON.stringify(report, null, 1));
for (const [j, r] of Object.entries(report)) console.log(j, typeof r === "string" ? r : `${r.ok} ok, ${r.bad.length} held back`);
