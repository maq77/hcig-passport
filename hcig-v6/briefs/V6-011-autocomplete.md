# V6-011: Google autocomplete expansion, seven languages (raw suggestions only)

Read `hcig-v6/BRAIN.md` and `hcig-v6/AGENTS.md` first. Their rules apply.

Goal: for each seed below, collect Google's autocomplete suggestions in seven languages, as raw research data. No
analysis, no copywriting.

Work in: `D:/hcig-v6-wt-V6-011` (branch `v6/V6-011`). Touch only: `hcig-v6/incoming/V6-011/` and
`hcig-v6/handbacks/V6-011.md`.

Method:
- Endpoint: `https://suggestqueries.google.com/complete/search?client=firefox&hl=<lang>&gl=<country>&q=<query>`
  (returns JSON). Languages and countries: en/GB and en/US, de/DE, pl/PL, fr/FR, it/IT, es/ES, cs/CZ.
- For each seed: translate it naturally into the language (how a buyer in that country would type it), query it, then
  query it again with each letter a to z appended (`seed a`, `seed b` ...). One request per second at most.
- A small Node script in `hcig-v6/incoming/V6-011/collect.mjs` is fine; keep it in the folder.

Seeds (English; translate per language):
1. medical assistance egypt
2. medical provider network egypt
3. direct billing hospital egypt
4. travel insurance hospital egypt
5. guarantee of payment hospital egypt
6. medical evacuation egypt
7. medical repatriation egypt
8. cruise ship medical services
9. cruise ship medical staffing
10. onboard medical clinic cruise
11. port medical assistance red sea
12. yacht doctor hurghada
13. hotel medical services egypt
14. on-site clinic hotel egypt
15. medical tourism egypt
16. medical tourism company egypt
17. healthcare partner egypt
18. GHA accreditation egypt
19. corporate healthcare egypt
20. embassy medical support egypt
21. healthcare international group

Output:
- `hcig-v6/incoming/V6-011/suggestions.csv`: columns `lang,country,seed_en,query,suggestion` (UTF-8, one row each).
- `hcig-v6/incoming/V6-011/seeds-translated.csv`: `lang,seed_en,seed_translated`.
- `hcig-v6/handbacks/V6-011.md`: row counts per language, any blocked requests, open questions.
- Commit in your branch. Do not push.

Never: invent suggestions, add volumes or rankings, touch other files, push, deploy, use dashes or emojis.
