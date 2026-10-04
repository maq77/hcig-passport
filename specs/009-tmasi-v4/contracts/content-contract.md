# Content contract: words in, words out

## Sources (the only text allowed on the page)

1. `tmasi-next/src/content/live/en.json`: `home`, `shell`, `posts` (titles, dates), `contact.offices[4].email` (usa@tmasi.net only).
2. `tmasi-next/src/content/ui.ts`, English block: labels approved in v3.
3. `tmasi-v4/src/content/approved-labels.json`: any new label, each with his words and date.

`scripts/pull-content.mjs` copies these into `src/content/home.en.json`. Components read nothing else.

## The word check (`npm run check:words`, part of `npm run build`)

- Reads `out/index.html`, takes every visible text node plus `alt`, `aria-label` and `title` values.
- Normalises only spacing, curly versus straight quotes and the `·` dateline separator.
- **Fails** when a sentence on the page is not in the sources (foreign sentence).
- **Fails** when a source sentence for a home section is missing from the page, including text inside
  read-more panels (missing sentence).
- Prints each failure with its section key, so the fix is obvious.
- Text drawn inside the 3D scene is not allowed; labels are HTML, so the check sees them.

## Allowed without asking (each logged in `docs/tmasi-worklog.md`)

Grammar, punctuation, spacing and capital fixes that keep the same words and meaning. Each one is
written to `tmasi-v4/src/content/approved-edits.json` (source sentence, fixed sentence, reason, date);
the word check accepts the fixed form only when it is listed there, so no fix slips in unlogged. A fact
that looks wrong stays and is flagged once in chat.

## Not allowed without his yes

Any new sentence, label, heading, button text or alt text that makes a claim; shortening; merging;
reordering words inside a sentence.
