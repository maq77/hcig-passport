# Contract: words and the word checker

## Sources, in order of authority

1. **Live words** (`hcig-v3/src/content/source/<lang>.json`): extracted from the live HTML of the 10 pages and 15 news
   posts by `scripts/extract-live.py` (adapted from TMASI's `extract-live-content.py`). Whitespace collapsed, `<br>`
   to a space, entities decoded, nothing else changed. Desktop and phone copies of the same section (`.section-do` and
   `.section-do1`) are extracted once. Hidden markup (HTML comments, for example the commented-out board block on
   /services/) is not a source.
2. **Approved new copy** (`content/approved/<lang>.json`): every entry carries `approvedBy` and `approvedOn`. Written
   short, from facts only. Enters this file only after his yes, then Irina's.
3. **Translations** (`content/dict/<lang>.json`): from the English source and approved copy. Claude writes, Gemini
   cross-checks, Opus reviews. A term list per language keeps names fixed (brand names, "Official Partner", partner
   types).
4. **Facts** (`content/facts.ts`): every number, name and partnership with its source (data-model.md, Fact).

## Allowed edits to live words

Grammar, punctuation, capitals and spacing fixes that keep the same words and meaning. Each one logged in
`content/source/fixes.json` with the before, the after and the date. Example already noted: "egypt" to "Egypt" in a
title. Wording that looks wrong stays and is listed once for Irina (spec FR-005).

## The checker (`npm run check` in `hcig-v3/`)

Runs on the exported HTML, every page, every language:

| Check | Fails when |
|---|---|
| Unknown sentence | A visible sentence on a migrated or new page is in none of the sources above |
| Dashes | U+2013 or U+2014 appears anywhere in output or content files |
| Emoji | Any Extended_Pictographic character appears |
| Claims | "accredited by" or "certified by" appears with HCIG as the subject; "guaranteed"; a number not in `facts.ts` |
| Partnership wording | A GHA or DMWV mention differs from the fixed strings |
| Language | A page's `lang` differs from its route's language |
| Duplicates | The same title or description is used by two pages in one language |

## Review pack

New copy goes to him as one document per batch (`docs/hcig-website-new-copy-<n>.md`): page, place, the proposed words,
the fact each line rests on. His answers, then Irina's, are copied into `approved/` with names and dates.
