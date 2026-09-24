---
name: hcig-writing
description: Write HCIG emails and reports in Mohamed Amin's own voice and HCIG's brand. Use for ANY email, reply, follow-up, status update, weekly update, approval request, information request, partner, insurer, hotel or clinic outreach, and for ANY report, one-page report, audit report, review pack, open-items document, handover, proposal summary or meeting notes for HCIG, MedPark, 24/7 Clinic or TMASI. Produces paste-ready email text, Gmail drafts, Word (.docx), PDF, or an HCIG Work page.
---

# HCIG writing: emails and reports

Mohamed Amin writes for busy people who read fast. The reader must get the
point in five seconds and trust it. Every piece reads as his own voice, never
as agency or AI prose.

**Load with it:** skill `hcig` (facts, contacts, brand), and the format skill the
output needs: `docx`, `pdf`, `pptx`, `xlsx`. `internal-comms` and
`doc-coauthoring` supply structure only; the voice rules below override them.

## 1. Before writing: three answers

| Question | Options |
|---|---|
| **Who reads it?** | Irina (approver) · CEO or management · clinic or hotel manager · partner, insurer, tour operator · agency (Pulse Marketing) · a guest |
| **What must they do?** | approve · answer · decide · know · reply |
| **Where does it go?** | email body · Gmail draft · .docx · .pdf · HCIG Work page |

If the ask is not one sentence, the piece is not ready to write.

## 2. The voice (non-negotiable)

1. **Headline, then one short note.** No paragraphs longer than three lines.
2. **Short flat sentences. One fact per sentence.** "The site opens on four
   addresses." Not "The site is currently accessible via four distinct address
   variants."
3. **His words stay his words.** When he gives a question or phrase, use it
   verbatim as the heading, grammar included. Offer a polish separately in chat.
4. **No em dashes, no en dashes.** Anywhere. A full stop and a new sentence.
   A middle dot `·` for separators in titles and meta lines.
5. **Facts get numbers and dates.** "13.6 s to 5.8 s". "Due 30 Sep 2026". Never
   "much faster" or "soon".
6. **Never invent.** No figure, price, date, partner, accreditation or outcome
   that is not in hcig memory or given by him. Missing fact: `[needed: X]` in a
   draft, and the question listed in chat.
7. **Explanations go in chat, never in the document** he will send.
8. **No marketing adjectives, no hedging, no filler openers.** Cut "I hope this
   email finds you well", "leading", "world-class", "seamless", "just", "very".
9. **One ask per email**, stated in the first two lines and again at the end.
10. **Accreditation wording is exact:** "Official Partner of GHA and DMWV".
    Never "accredited by".

**Emoji** (his set 🎉 🔥 👑 🚀 ⭐ 🎁): at most one, only in internal team or
marketing updates. Never to Irina's management chain as a formal report, never
to partners, insurers, hotels, clinics, guests, or anything clinical.

## 3. Pick the template

| Need | File |
|---|---|
| Any email | `references/emails.md` |
| Any report or document | `references/reports.md` |

## 4. Output formats

| Format | How |
|---|---|
| **Email text** | Subject line, then the body in plain Markdown he can paste. Put it in a code-free block in chat |
| **Gmail draft** | Gmail connector when authenticated. **Create drafts only. Never send.** |
| **.docx** | skill `docx`. Styling below |
| **.pdf** | Best: build the HTML with the brand tokens, print with Playwright (`page.pdf`, A4, 16mm margins). Or skill `pdf` |
| **HCIG Work page** | a project in `content/registry.js`, then `npm run publish` after he confirms what to commit |
| **Status report to Irina** | `npm run report` writes `report.md` from the registry. **Update the registry, then generate; never hand-write this one** |

**Brand styling for documents.** Use the brand the document is about:
`hcig/references/design-md/<brand>/DESIGN.md` (hcig, medpark, clinic247,
tmasi). Group or multi-brand documents use HCIG. White page, black or navy text,
the accent for rules and headings only, tables with hairlines, tabular numerals.
Document fonts: Inter (HCIG), Arial for Helvetica World (MedPark), Poppins
(24/7), Montserrat (TMASI). Logo from `D:\Healthcare international group\src\assets\`
on white, top left. Never two brands' colours in one block.

**Files go in** `D:\Healthcare international group\docs\` named
`<brand>-<topic>-<yyyy-mm-dd>.<ext>`. Email drafts go in `docs\emails\`.

## 5. Before handing over: run the check

```bash
python "C:/Users/maqmo/.claude/skills/hcig-writing/scripts/check_writing.py" <file> [--partner] [--one-page]
```

It fails on dashes, long sentences, long paragraphs, banned filler, and emoji in
partner mode. Then check by hand:

- [ ] Every number traces to hcig memory or his message
- [ ] Every link opens (check the status code)
- [ ] The ask is in the first two lines
- [ ] Client report fits one page
- [ ] No patient names or records
- [ ] Medical or ad claims checked against `hcig/references/compliance.md`

## 6. After

- A deliverable document: add or update it in HCIG Work (`content/registry.js`).
- A new preference about how he writes: record it in this file, section 2.
- German or Polish text: say in chat that a native speaker should check it.
