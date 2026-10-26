# V6-005: Critical review of the HCIG v6 spec and plan (read-only)

Read first: `hcig-v6/BRAIN.md`, then `specs/013-hcig-v6/spec.md` and `specs/013-hcig-v6/plan.md`.
You may also read `brand guideline/HCIG Content.txt` (the live home words) and
`brand guideline/chatgpt_longest_messages.txt` lines 1139 to 1434 (the manager's maritime copy).

Goal: find what is wrong, missing, risky or contradictory before any design or code starts. Be blunt and concrete.

Review these angles:
1. Business fit: does the plan make a B2B buyer (insurer, assistance company, cruise line, hotel group, tour operator,
   embassy, corporate, provider) understand "one connected group, from first contact to case closure" within seconds?
   Missing pages, sections or proof a B2B buyer expects?
2. Content rules: any place where the plan risks changing the client's live words, inventing facts, or adding claims?
3. Information architecture: page list, URL plan, keyword cannibalisation (for example the hotels partner page vs the
   maritime page vs 247clinic.net hotel pages).
4. SEO, GEO/AEO: gaps in the technical SEO, schema, hreflang for seven languages, AI visibility tactics, off-page.
5. Architecture: risks in "one React section library renders both the Claude Design canvas boards and the Next.js
   static site", the canvas limits (512 files, 40 pages, no iframes, literal markup), static export with seven
   languages and translated slugs, the PHP lead endpoint on a cPanel host with no shell.
6. Sequencing and gates: anything done in the wrong order, missing gates, or likely rework.
7. Go-live: risks in the cutover on a GoDaddy cPanel host with SFTP only.

Output, in your final answer only (write no files):
- A numbered list of findings. Each: severity (high, medium, low), the angle number, what is wrong, and the exact fix.
- Then the five changes you would make first.
- Do not invent business facts. If a fact is needed, say "needs a source".
- No em dashes, no emojis.
