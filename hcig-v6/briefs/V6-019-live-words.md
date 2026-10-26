# V6-019: Live words of every inner page into content files, word for word

Read `hcig-v6/BRAIN.md` and `hcig-v6/AGENTS.md` first. Rule 1 (the words are theirs) is the whole job.

Goal: turn the captured live pages into structured JSON content files, keeping every visible string EXACTLY as the page
shows it (same words, same capitals, same punctuation, including any typos and the " - " separators). No rewriting,
no fixing, no summarising, no new words.

Work in: `D:/hcig-v6-wt-V6-019` (branch `v6/V6-019`). Touch only: `hcig-v6/src/content/live/` and
`hcig-v6/handbacks/V6-019.md`.

Inputs (read-only, outside your worktree, local files):
`D:/Healthcare international group/hcig-v6/material/live-capture/2026-10-26/` holds `<page>.html` (raw) and
`<page>.txt` (visible text, one block per line) for: about_, services_, partner_, contacts_, blog_, blog_news1.php to
blog_news15.php, de_, de_ueber-uns_, de_leistungen_, de_kontakt_, group_ceo.php, group_chairman.php, group_coo.php.
Also `i18n.js` in the same folder: its `de: { ... }` dictionary holds the German words the German pages switch to.

Output, one file per page, UTF-8 JSON, 2-space indent:
- `about.json`, `services.json`, `partner.json`, `contacts.json`, `blog.json` (the index: every post card with title,
  teaser, link), `posts/news1.json` ... `posts/news15.json`, `leadership.json` (the three leadership pages: names,
  titles, links), `de.json` (the German strings from `i18n.js` `de`, keys kept as in the file).
- Shape of a page file:
  `{ "path": "/about/", "title": "<the <title> text>", "description": "<meta description or null>",
     "sections": [ { "id": "<short-slug>", "heading": "<visible heading or null>", "blocks": [
        { "type": "p" | "li" | "h3" | "label" | "button" | "stat", "text": "<exact text>" } ] } ],
     "images": [ { "src": "<as in the html>", "alt": "<alt text or empty>" } ],
     "videos": [ { "src": "<as in the html>" } ] }`
- A post file adds `"date"` (only if the page shows one) and keeps the post body paragraphs in order.
- Leave out the shared header, footer, nav and contact block (they are the same on every page); list them once in
  `shared.json` (nav labels, partner line, contact lines, footer line).

Done when: every `text` value appears verbatim in that page's `.txt` file (write a small check script
`hcig-v6/src/content/live/check.mjs` that proves it and prints any miss), and the check prints zero misses.

Hand back: `hcig-v6/handbacks/V6-019.md` with the file list, block counts per page, the check result, open questions.
Commit in your branch. Do not push. Never edit a string, never add words, never use dashes of your own or emojis.
