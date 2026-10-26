# DELEGATION.md: how work goes to Antigravity on HCIG v6

## What may be delegated (low priority only)

Logo hunting from official sources, alt-text drafts, first-draft UI translations, keyword list expansion, link
inventories, crawl and QA reports, images for gaps (never people shown as staff, patients or testimonials), read-only
second opinions on a spec, plan, diff or copy.

**Never delegated:** design, components, canvas, CSS, animation, page copy, medical, price, accreditation, insurance or
legal claims, anything live (deploy, cPanel, DNS, `.htaccess`, canonical, hreflang, sitemaps, schema, tracking tags),
credentials.

## agy-delegate (Claude dispatches)

1. Write the brief in `hcig-v6/briefs/<ID>.md` (template below). Paths, not file contents.
2. Clean worktree: `git worktree add D:/hcig-v6-wt-<ID> -b v6/<ID> main`
3. Run in the background:
   `node ~/.claude/skills/agy-delegate/scripts/relay.mjs --brief "D:/Healthcare international group/hcig-v6/briefs/<ID>.md" --cd D:/hcig-v6-wt-<ID> --model gemini-3.8-flash --effort high`
   Add `--read-only` for reviews and questions. Read `result.json` when it finishes.
4. Review (checklist below), then merge or send a delta with `--resume-last`.

## agy-2 (the owner's second account)

The owner opens Antigravity on that account in this repo and says: "Read hcig-v6/AGENTS.md and do task <ID>."
Same worktree rule, hand-back in `handbacks/<ID>.md`, Claude reviews and merges.

## Brief template

```
# <ID>: <title>
Read hcig-v6/BRAIN.md and hcig-v6/AGENTS.md first.
Goal: <one sentence>
Work in: D:/hcig-v6-wt-<ID> (branch v6/<ID>). Touch only: <paths>.
Inputs: <file paths and URLs>
Output: <files, exact shape>
Done when: <checks>
Never: invent facts, use dashes or emojis, touch other files, push, deploy, open secrets.
Hand back: hcig-v6/handbacks/<ID>.md with files touched, sources, how checked, open questions.
```

## Review checklist (Claude, before any merge)

- [ ] The diff touches only the listed paths.
- [ ] Every asset has an official source URL in `SOURCES.md`; logos are the brand's own files in their own colours.
- [ ] Every fact checked against the live site or the named source.
- [ ] No dashes, no emojis, no invented content, no secrets.
- [ ] Gates pass.
- [ ] Merged; `TASKS.md` and `WORKLOG.md` updated; the chat says what came from Gemini and what was checked.
