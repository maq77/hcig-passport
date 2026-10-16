# Content contract: v6 words

- **Sources**: `tmasi-v6/src/content/live/<lang>.json` and `src/content/ui.ts`, copied from v3 unchanged. Any v3 word fix
  made later is carried into v6 before go-live.
- **The check** (`npm run check:words`) reads every built page in `out/` per language. It fails on a sentence not in
  that language's sources (foreign) and on a source sentence missing from its page (missing), with the page and
  section named. Text inside read-more panels counts.
- **Allowed without asking**: grammar, punctuation, spacing and capital fixes that keep the words and meaning, each
  listed in `src/content/approved-edits.json` and logged in `docs/tmasi-worklog.md`.
- **Needs his yes first**: any new heading, label, caption, alt text that says something, the film credit, and any
  group (HCIG) mention.
- **Never**: "accredited" without a certificate in TMASI's name; a generated face presented as staff, doctor, patient
  or testimonial; text baked into a video or generated image.
