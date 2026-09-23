# Contract: content and the word-for-word gate

## Where words come from

1. `content/247clinic/en/{page}.json`: the brief, split per page (T-012, approved). Fields:
   `sections[].heading`, `subheading`, `body[]`, `items[].title|text`, `ctas[].label`.
   `devNotes[]` are instructions to us and are **never rendered**.
2. `content/247clinic/en/global.json`: nav, footer-only links, WhatsApp texts and messages.
3. `247clinic-v3/src/content/ui-labels.json`: our interface words, nothing else. Allowed
   kinds: section eyebrows that restate the heading's topic in 1 to 3 words, control
   labels ("Menu", "Close", "Play", "Pause", "Watch", "Next", "Previous"), language names,
   the logo marquee labels, form field labels taken from the brief's own lists. No claim,
   no number, no adjective about care.
4. Facts set by the user (numbers, phone): `247clinic-v3/src/data/facts.ts`, each with
   its source and date.

## The gate (`scripts/check-brief.mjs`)

Runs after every export. Fails the build when:

- a visible sentence, `alt`, `aria-label` or `title` is not found in the brief text or in
  `ui-labels.json` (normalised: whitespace, curly quotes, bullets, `•`, and a dash
  replaced by a comma or full stop count as equal);
- output contains U+2013 or U+2014;
- "cashless" appears in a sentence that is not a brief sentence;
- "accredited" or "accreditation" sits next to GHA, DMWV or German Medical Wellness;
- "Lorem", "TODO", "placeholder" appear outside a design slot.

It prints each failure with page, element and the nearest brief sentence.

## Gaps

When a layout needs a line the brief does not have, the page leaves it out and the gap
goes to `docs/247clinic-v3-gaps.md` with page, place and what would be needed. Known now:
meta titles and descriptions (brief gives none; spec assumption), per-clinic hours and
services, a B2B WhatsApp message, the choice between the two insurance messages.
