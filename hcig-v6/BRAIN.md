# HCIG v6 BRAIN: the single source of truth for every agent

Read this first, then `TASKS.md`. Claude owns this file. Other agents propose changes in their hand-back note.
Last updated: 2026-10-26 by Claude.

## 1. The business, in the owner's words

- "Healthcare + International + Group = HCIG"
- "We build healthcare ecosystem for tourists, For b2b only"
- "Global + Full one end to end ecosystem + for patients : from first to end + Full Group"
- "we are one complete group for patients without need to fragmentation, we take the patient from end to end, we are
  connected on full group that takes patient from first to end and everything is on our group with our full connected
  ecosystem"
- Contact: partner@healthcareig.com
- The feeling every visitor must get (reference image `hcig material/ref image.jpeg`, local only): the traveller at
  the centre, every service around them, connected worldwide. "Wherever the journey leads, support is already around you."

**Who we talk to (B2B only):** insurance and assistance companies; embassies and government institutions; hotels,
resorts and cruise lines; tour operators and travel agencies; healthcare providers; corporate clients and international
organisations. Patients are routed to the group brands.

**Facts we may use (the live site is the single source of truth):** 40+ Years of Experience; 600K+ Patients Served;
350+ Medical Professionals; 135+ On-Site Clinics Across Egypt; 24/7 Medical Coverage in Key Travel Destinations; Direct
Partnerships with Global Insurers; Official Partner of Global Healthcare Accreditation (GHA) and the German Medical
Wellness Association (DMWV) in Egypt. **Never write "accredited by" about HCIG.**

**The eight group brands (live lines):**
| Brand | Line |
|---|---|
| 24/7 Clinic | On-Site Urgent Care & Emergency Services in Hotels & Resorts |
| MedOne Group | Travel Medical Services & Care Coordination |
| MedPark Health Group | Advanced Hospital & Emergency Medical Services |
| TMASI GLOBAL | International Medical Assistance & Case Coordination |
| One Medical Center (Florida - USA) | Urgent Care & Outpatient Medical Services |
| One Medical Spa (Florida - USA) | Aesthetic & Medical Wellness Services |
| UCA MENA | Urgent Care Association Egypt & MENA |
| Shakankiry Clinics Medical Group | Travel Medical Services |

## 2. Hard rules (break one and the work is thrown away)

1. **The words are theirs.** Every sentence on the live site stays exactly as written. Grammar, punctuation and
   capital fixes that keep the same words are allowed and logged in `WORKLOG.md`. The manager's Maritime & Cruise copy
   is used word for word. A new sentence only comes from a verified fact, is marked new, and needs the owner's approval.
2. **No em dashes or en dashes** anywhere, in copy or documents, and no spaced hyphen used as a dash. Use a full
   stop. Compound-word hyphens (On-Site, Shore-Side) and phone numbers are fine.
3. **Brand palette only:** Black #000000, Dim Gray #565759, Turquoise #12C0C6, White #FFFFFF, and their lighter tints
   only (black #333333 #666666 #999999 #CCCCCC; dim gray #78797B #9A9A9C #BBBCBE #DDDDDF; turquoise #42CDD1 #71D9DD
   #A0E6E8 #D0F2F4). No darker turquoise, no navy, no off-palette near-blacks.
4. **Fonts:** Helma (single Regular file, shown at weight 600 by synthetic bold, like the live site) and Inter.
5. **Turquoise text** only for accent words in headings (owner's rule, by day and by night, never underlined). Body,
   links and button labels never in Turquoise. Text on a Turquoise fill is always Black.
6. **No emojis.** Icons are hairline SVG.
7. **Never invent** numbers, partners, accreditations, prices or outcomes.
8. **AI-made people** are never shown as named staff, leaders, patients or testimonials.
9. **Never take a frame or screenshot from a video.** Video stays video; posters are designed tiles.
10. **Logos in their own colours**; marquees pause on hover; two rows when many.
11. **Mobile first.** The phone gets its own composition. Native scrolling only (no Lenis). Every motion has a still
    version under reduced motion.
12. **Canvas first** for the important pages; code copies the approved canvas exactly. Other pages follow the approved
    templates in code.
13. **The live site is not touched** until go-live, and nothing goes live without the owner's word.
14. **No secrets** in any file, brief, commit or chat with another agent. Never open `prompt hcig.txt` or key files.
15. Day theme is the default; night is a switch. "Powered by PULSE Marketing" stays in the footer.

## 3. Locked decisions (2026-10-26)

| Topic | Decision |
|---|---|
| Carry over from v3 | Hero B only (no HC watermark, no film loop), day default with the dawn switch to night. The group section as approved (group film, 8 brands, hover logos) under the live H2 "Our Premises and Facilities" with the line "Integrated healthcare group all over the world" under it. All other v3 work is reference only |
| Maritime & Cruise | Menu item, home block, full page `/maritime-cruise-healthcare/` with its own form and brochure request |
| Pages | Full B2B site, about 52 pages per language (see section 6) |
| Languages | All seven at launch: EN, DE, PL, FR, IT, ES, CS. Existing German words kept. Translated slugs |
| Hotel-name SEO | Belongs to 247clinic.net; HCIG links to it |
| Canvas | Only the important pages (owner, 2026-10-26); the rest built directly after he approves them |
| Design | One system from Hero B + the group section; ui-ux-pro-max leads; Claude Design is the canvas |
| Contact | JotForm AI agent is the only float; "Talk to our team" opens a sheet: WhatsApp +20 100 182 8828, call, email, form |
| Trust | Testimonial videos + live MedPark Google reviews (our widget, Elfsight look) + one photo row like TMASI's trust section |
| Tracking | GA4 + Google Ads + Yandex + our first-party tracker, all behind consent, live build only |
| Newsletter | Our own lead store on the HCIG host |
| Articles | None unless Irina writes them; we give her keywords and ideas |
| New page copy and legal pages | Claude writes them from verified facts; the owner approves |
| Review chain | Owner, then Irina (finished preview only), then live |

## 4. Where things live

| What | Where |
|---|---|
| Spec and living plan | `specs/013-hcig-v6/spec.md`, `specs/013-hcig-v6/plan.md` (includes the Gemini review changes) |
| Live site | https://healthcareig.com (GoDaddy cPanel, SFTP only, no shell). Deploys are Claude's alone |
| Backup of the live site | `hcig-v6/material/backup/` (local, gitignored); `old_hcig_backup_website.zip` in the host home folder |
| Live words today | `brand guideline/HCIG Content.txt` (home), `src/hcig-live/` (25 pages, 2026-10-18 mirror) |
| Maritime copy | `brand guideline/chatgpt_longest_messages.txt`: page lines 1139 to 1402, home block 1423 to 1434 |
| Hero B and group section sources | `hcig-v3/canvas/heroes/build-heroes.mjs`, `build-film-boards.mjs`, `film-section.part.mjs`; assets in `hcig-v3/material/hero-assets/` and `hcig-v3/material/motion-film/` (local only) |
| Logos | `hcig-v3/motion/logos/`, `247clinic-v4/public/logos/insurers/`, `TMASI-logo-pack.zip`, `hcig-v3/material/canvas-assets/img/` |
| Preview (later) | https://hcig-passport.vercel.app/hcig/v6 |
| Canvas | added here when created |

## 5. Current phase and next step

- **Phase P0** (safety, access, backup, workspace): in progress.
- **Next:** P1, the spec in `specs/013-hcig-v6/`, then a Gemini review of the spec and plan.

## 6. Pages and home order

**Pages:** `/`, `/about/`, `/about/leadership/`, `/services/` + 7 service lines, `/maritime-cruise-healthcare/`,
`/partner/` + 6 partner types, `/group/` + 8 brands, `/network/`, `/trust/`, `/press/`, `/blog/` + 15 posts,
`/contacts/`, `/partner-kit/`, `/privacy/`, `/cookies/`, `/imprint/`. Final slugs come from keyword research.

**Home order:** header; Hero B; About Us; Our Premises and Facilities; Our mission / Our vision; Why partners choose
HCIG; Built for Global Healthcare Delivery; How Our System Works; Our Healthcare; Maritime & Cruise block (new);
Testimonials with trusted by patients; CEO quote (new); 100% Trusted by Global Insurance & Assistance Networks; Who We
Work With; Our Impact; Let's Build Healthcare Without Fragmentation with a newsletter field (new); footer.

## 7. Lanes (one owner per task, set by Claude)

| Lane | Does | Never |
|---|---|---|
| claude | spec, design system, canvas, all frontend, animation, motion, visual, SEO architecture, content model, reviews, merges, deploys | |
| agy-delegate | low-priority tasks Claude dispatches: logo hunting, alt-text drafts, first-draft UI translations, keyword expansion, link inventories, crawl reports, gap images, read-only reviews | design, components, canvas, tokens, words files, BRAIN.md, secrets, deploys |
| agy-2 | the owner's second Antigravity account: only tasks marked `agy-2` in TASKS.md, same kinds as agy-delegate | same as agy-delegate |
