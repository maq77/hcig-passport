// Prepares the first-draft translation jobs for agy (read-only runs; the translation comes back in the reply):
// i18n/jobs/<lang>-<n>.json (the English strings of one chunk) and i18n/jobs/<lang>-<n>.brief.txt.
// Then scripts/i18n-merge.mjs reads each result.json and fills i18n/<lang>.json. Claude reviews before any build.
//   node scripts/i18n-briefs.mjs de pl fr it es cs
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const V6 = join(dirname(fileURLToPath(import.meta.url)), "..");
const NAMES = { de: "German", pl: "Polish", fr: "French", it: "Italian", es: "Spanish (Spain)", cs: "Czech" };
const PATHS = ["/about/", "/about/leadership/", "/services/", "/services/hospital-specialty-services/", "/services/medical-tourism-facilitation/", "/services/emergency-urgent-care/", "/services/wellness-longevity-aesthetic-care/", "/services/corporate-healthcare-solutions/", "/services/elite-medical-concierge/", "/services/accreditation-training/", "/maritime-cruise-healthcare/", "/partner/", "/partner/insurance-assistance-companies/", "/partner/embassies-government/", "/partner/hotels-and-resorts/", "/partner/tour-operators-travel-agencies/", "/partner/healthcare-providers/", "/partner/corporate-international-organisations/", "/contacts/", "/blog/", "/group/", "/network/", "/trust/", "/press/"];
const LIVE_DE = { "/about/": "/ueber-uns/", "/services/": "/leistungen/", "/contacts/": "/kontakt/" };
const CHUNK = Number(process.env.CHUNK || 30000);
const START = Number(process.env.START || 1); // first job number (re-runs get fresh names)

const langs = process.argv.slice(2);
const dir = join(V6, "i18n", "jobs");
mkdirSync(dir, { recursive: true });
for (const lang of langs) {
  const f = join(V6, "i18n", `todo-${lang}.json`);
  const todo = JSON.parse(readFileSync(existsSync(f) ? f : join(V6, "i18n", "strings.json"), "utf8"));
  const chunks = [[]];
  let size = 0;
  for (const s of todo) {
    if (size + s.length > CHUNK && chunks.at(-1).length) { chunks.push([]); size = 0; }
    chunks.at(-1).push(s);
    size += s.length;
  }
  chunks.forEach((c, i) => {
    const n = i + START;
    writeFileSync(join(dir, `${lang}-${n}.json`), JSON.stringify(c, null, 1));
    const slugs = i === 0 ? `

ALSO, in the same reply, translate these page addresses into ${NAMES[lang]} URL slugs (lowercase ASCII letters,
digits and hyphens only, no accents: transliterate, e.g. German ä to ae, ü to ue, ß to ss; short, natural, the words a
${NAMES[lang]} buyer would search). Keep the same depth and the trailing slash. Keep /blog/ as /blog/.${lang === "de" ? `
These German addresses already exist on the live site and must stay exactly: ${JSON.stringify(LIVE_DE)}.` : ""}
Paths: ${JSON.stringify(PATHS)}` : "";
    writeFileSync(join(dir, `${lang}-${n}.brief.txt`), `You are translating the website of Healthcare International Group (HCIG), a B2B healthcare group in Egypt
(clients: insurers, assistance companies, hotels, cruise lines, tour operators, embassies, corporates), into ${NAMES[lang]}.
This is a read-only task. Do not edit any file. Put the whole answer in your final reply.

Read the file i18n/jobs/${lang}-${n}.json in this workspace. It is a JSON array of ${c.length} English strings.
${lang === "de" ? `Also read i18n/ref-de-live.txt: the text of the current live German pages of this site. Where an English
string has a matching sentence there, use the live German sentence exactly (same words), only removing any dash.
` : ""}
Translate every string into natural, professional ${NAMES[lang]} for B2B readers (formal address${lang === "de" ? ", Sie" : lang === "fr" ? ", vous" : lang === "cs" ? ", vykání" : lang === "pl" ? ", Państwo" : ""}).

Rules (all of them matter):
1. Same meaning, nothing added, nothing left out. Never add claims, numbers or superlatives that are not in the English.
2. Keep exactly as written: organisation and brand names (Healthcare International Group, HCIG, MedPark Health Group,
   MedPark Health Hub, MedPark Hospital, 24/7 Clinic, 24/7 Clinics, MedOne, TMASI GLOBAL, One Medical Center, One Medical
   Spa, Shakankiry Clinics Medical Group, SCMG, UCA MENA, Urgent Care Association, Global Healthcare Accreditation, GHA,
   German Medical Wellness Association, DMWV, ITIC, ITB, PULSE Marketing, insurer names), people's names and titles
   like Dr., numbers and figures (40+, 600K+, 350+, 135+, 24/7, 30,000+), K+, email addresses, phone numbers, street
   addresses, and the words in brackets after a name such as (Florida - USA).
3. Never use an em dash or an en dash, and never a hyphen with spaces around it as a dash. Use a full stop, a comma or
   a colon instead. Normal compound hyphens are fine.
4. Never write that HCIG is "accredited". HCIG is an "official partner" of GHA and DMWV.
5. Short labels (buttons, menu items, headings) stay short. Use the capitalisation that is normal in ${NAMES[lang]}
   (English Title Case becomes normal ${NAMES[lang]} capitalisation).
6. Keep any line breaks and the punctuation style of each string. Keep typographic apostrophes natural for ${NAMES[lang]}.
7. Place names: use the usual ${NAMES[lang]} name for cities and countries (for example Venice, Egypt).

Reply format: ONE JSON object and nothing else, no code fences, no comments:
{"t": [ ...exactly ${c.length} translated strings, in the same order as the input array... ]${i === 0 ? `, "slugs": { "/about/": "/.../", ... }` : ""}}
The "t" array must have exactly ${c.length} entries. Check the count before you answer.${slugs}
`);
  });
  console.log(`${lang}: ${chunks.length} jobs (${chunks.map((c) => c.length).join(", ")} strings)`);
}
