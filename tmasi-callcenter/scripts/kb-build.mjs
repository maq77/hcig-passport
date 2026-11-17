// npm run kb:build: compile the TMASI sources into data/kb/ (markdown, manifest.json, excluded.txt).
import { buildKb } from "@tc/kb";

const { manifest, excluded, perLang } = buildKb();
console.log(`kb:build wrote ${manifest.docs.length} docs`);
for (const [lang, n] of Object.entries(perLang).sort()) console.log(`  ${lang}: ${n}`);
console.log(`excluded sentences: ${excluded.length} (see data/kb/excluded.txt)`);
