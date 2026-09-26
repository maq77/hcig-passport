---
trigger: always_on
---

# HCIG Core Memory & Working Rules (Synchronized from Claude Code)

## 1. Hard Rules & User Directives
- **Never use em dashes or en dashes** anywhere (including chat replies, copy, documentation). Use a full stop and a short sentence instead.
- **Short copy and restraint**: Headlines plus one short note, never paragraphs. Long prose "looks like AI made that".
- **Clean formatting in CLI and Hive**: Never clutter CLI replies or Hive notes with raw markdown hashes (###) or asterisk bolding (**). Use clean uppercase headings, plain dashes, or simple indentation so terminal output displays cleanly.
- **Visuals are not decoration**: Never strip icons, images, or videos during a redesign. Every page keeps its own hero.
- **Keep every word as written**: client wording and content stay exactly as written unless Mohamed says otherwise (his most important rule, 2026-09-26). Dark designs are allowed; the old no-dark rule was removed 2026-09-26.
- **Never screenshot inside a video**: Video is used as video. Stills grabbed from videos look amateur. Use library photos, official posters, or stock.
- **Stock photography is allowed** to fill real gaps (Pexels in `scripts/pexels.js`), but real photography first. Check what stock photos actually show (e.g. no "DIAL 911" in Egypt).
- **Accreditation wording is exact**: "Official Partner of Global Healthcare Accreditation™ (GHA)" and "Official Partner of German Medical Wellness Association (DMWV)". Never "accredited by" or "certified by".
- **One name per building**:
  - Sahl Hasheesh Road, Hurghada = **MedPark Health Hub**
  - Al Owina, El Quseir = **MedPark Hospital**
  - Spelling is strictly **"El Quseir"**.
- **Demos must read as live**: No markers, dotted underlines, or review tags on a live page under review. Open questions live in their own document.
- **Work order**: Technical first, copy last. Invisible fixes go live immediately; visitor-facing copy waits for review.
- **Act on clear defects without asking**: Obvious bugs get fixed immediately; new copy goes to Irina/user for review.
- **Always include ticket titles with ticket codes**: Never reference bare ticket IDs like T-015 or TASK-247-01 alone. Always attach the title or a brief explanation of what it is, e.g. T-015 (24/7 Clinic: Phase 2 inner pages), in chat, ticket descriptions, cross-references, and notes.

---

## 2. Key Stakeholders
- **Dr. Amr Abbas**: Chief Executive Officer, HCIG. Signs B2B outreach (`partner@healthcareig.com`, `+201001828828`).
- **Irina Rise**: Marketing Director, HCIG (`marketing@healthcareig.com`). Approver for MedPark, 24/7 Clinic, and Medcierge design/content.

---

## 3. Brand & Palette Guidelines
- **HCIG**: Helma + Inter · Turquoise `#12C0C6` · Dim Gray `#565759`.
- **MedPark**: Organo + Helvetica World · Turquoise `#12C0C6` + Navy `#0A2A4A`.
- **24/7 Clinic**: Poppins + Calisto MT · Red `#C00000`.
- **TMASI GLOBAL**: BigNoodleTitling + Montserrat · Teal `#009A9C`.
- **Medcierge**: Cormorant + Montserrat · Navy `#07142E` / `#0B1F44` + Gold `#D4AF63` + Ivory `#F5EFE3`.

---

## 4. Technical Traps to Avoid
- `aspect-ratio` must always be paired with `height: auto` or image `width`/`height` attributes will override it.
- Grids containing images should use `align-items: start` to prevent unwanted stretching.
- Do not let reveal animations hide content by default. Gate `opacity: 0` behind JS classes with a timeout failsafe.
- Never commit API keys to this public GitHub repository (`maq77/hcig-passport`). Secrets stay in `.env.local`.
- In MedPark PHP, OPcache revalidates every 90 seconds. Wait 95s before verifying server changes.
- In Next.js static export (`medcierge-next`), `scripts/flatten-rsc.mjs` flattens segment payloads. Always copy `out/` to `src/medcierge-home/` and `git add -f`.
- In MedPark `v2.js`, always guard DOM selectors like `#drawerClose` before binding listeners.
- Scroll and resize handlers must be throttled via `requestAnimationFrame` to avoid main thread stutters.
- Animations and transitions must only touch `transform` and `opacity`. Never animate `box-shadow` or layout properties like `width`.
- Interactive elements on mobile must satisfy the 44px by 44px touch target minimum.
- Clear dead CSS declarations overridden by later `!important` blocks before publishing stylesheets.
