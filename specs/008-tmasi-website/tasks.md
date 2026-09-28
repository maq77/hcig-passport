# Implementation Tasks: TMASI Global Website (v2 & v3)

Dependency-ordered task list for TMASI Global v2 and v3 implementation.

## Task Inventory

| Task ID | Task Title | Dependencies | Deliverable |
|---|---|---|---|
| **T-043** | TMASI v3: Extract live site content verbatim into structured JSON | None | `content/tmasi/` |
| **T-044** | TMASI v3: Vector SVG dark world map with verified 5-hub pins | None | `src/assets/tmasi-map.svg` |
| **T-045** | TMASI v3: Design slots and asset placeholder package for Reham | T-043 | `docs/tmasi-v3-design-slots.md` |
| **T-046** | TMASI v3: Homepage core architecture on HCIG Work | T-043, T-044 | `src/tmasi-v3/index.html` |
| **T-047** | TMASI v3: Service group and global office directory templates | T-046 | `src/tmasi-v3/services/` |
| **T-048** | TMASI v3: Multilingual blog and news system | T-043 | `src/tmasi-v3/news/` |
| **T-049** | TMASI v3: Structured data schema, AEO answer blocks, and llms.txt | T-046 | `src/tmasi-v3/schema.json` |
| **T-050** | TMASI v3: Word-for-word automated verification script | T-043, T-046 | `scripts/check-tmasi-content.mjs` |
| **T-051** | TMASI v3: Apache .htaccess rewrite rules and cPanel deploy script | T-046 | `tmasi-live/deploy-v3.py` |
| **T-052** | TMASI v3: Full responsive visual audit and Lighthouse performance | T-046, T-050 | `docs/tmasi-v3-audit.md` |

## Task Details

### T-043: TMASI v3: Extract live site content verbatim into structured JSON
- Priority: P1
- Description: Parse all live PHP templates from `tmasi-live/backup-2026-09-26/public_html/`. Extract every text string, phone number, address, executive biography, and service bullet into clean JSON files under `content/tmasi/`. Zero rewording.
- Acceptance Criteria:
  1. Complete extraction of all 6 service groups.
  2. Complete extraction of 5 global office directories.
  3. Verbatim leadership profiles for Dr. Amr Abbass and Dr. Ahmed Nouh.
  4. All news posts cataloged with multiline paragraphs intact.

### T-044: TMASI v3: Vector SVG dark world map with verified 5-hub pins
- Priority: P1
- Description: Construct a crisp, responsive SVG world map graphic. Background in deep navy (`#0F205C`). Accurate geographical coordinates for Cairo, Germany, Madrid/Barcelona, Dubai, and USA. Subtle pulsing rings at each pin.
- Acceptance Criteria:
  1. Crisp rendering across desktop (1440px+) and mobile (375px).
  2. Pins placed on precise geographical coordinates.
  3. Touch and hover state reveals hub summary card.

### T-045: TMASI v3: Design slots and asset placeholder package for Reham
- Priority: P2
- Description: Finalize visual asset briefing document in `docs/tmasi-v3-design-slots.md`. Create lightweight placeholder image templates with exact pixel dimensions and labels.
- Acceptance Criteria:
  1. Complete table of 18 design slots covering hero, services, news, and leadership.
  2. Aspect ratios and format requirements clearly documented.

### T-046: TMASI v3: Homepage core architecture on HCIG Work
- Priority: P1
- Description: Implement the primary homepage template at `/tmasi/v3` on HCIG Work. Incorporate Big Noodle Titling headlines, Montserrat body copy, TMASI Teal accents, dark map hero, partner trust row, service cards, statistics grid, and dark global footer.
- Acceptance Criteria:
  1. Fully responsive across 375px, 768px, 1024px, and 1440px.
  2. Zero em or en dashes in markup.
  3. Call button and emergency dispatch reachable in one tap on mobile.

### T-047: TMASI v3: Service group and global office directory templates
- Priority: P2
- Description: Build subpage templates for the six core service groups and five global operational hubs.
- Acceptance Criteria:
  1. Scannable card hierarchy for complex medical assistance workflows.
  2. Direct phone and email links for each regional operational desk.

### T-048: TMASI v3: Multilingual blog and news system
- Priority: P2
- Description: Build news overview and article reader templates supporting English, German, Polish, and Spanish.
- Acceptance Criteria:
  1. Hansa Medica GEM and ITIC Global Istanbul 2026 posts prominently featured.
  2. Language switcher links corresponding translations directly.

### T-049: TMASI v3: Structured data schema, AEO answer blocks, and llms.txt
- Priority: P2
- Description: Implement complete JSON-LD graph connecting MedicalOrganization, EmergencyService, and LocalBusiness entities. Author `llms.txt` and semantic Q&A blocks targeting priority AI assistance queries.
- Acceptance Criteria:
  1. Valid schema passing Google Rich Results test with zero errors.
  2. `llms.txt` documenting operational scope, emergency numbers, and regional coverage.

### T-050: TMASI v3: Word-for-word automated verification script
- Priority: P1
- Description: Create test script `scripts/check-tmasi-content.mjs`. Assert that every text block rendered on the v3 homepage and inner pages matches source strings verbatim.
- Acceptance Criteria:
  1. Exits with code 0 when all source strings exist.
  2. Fails build if any unauthorized sentence or em dash is detected.

### T-051: TMASI v3: Apache .htaccess rewrite rules and cPanel deploy script
- Priority: P2
- Description: Configure production `.htaccess` with extensionless clean URL rewrites, HTTPS enforcement, non-WWW canonicalization, and security headers. Author safe SFTP deploy script with automatic remote backup.
- Acceptance Criteria:
  1. All 19 legacy `.php` URLs redirect cleanly with 301.
  2. Pre-deploy backup generated automatically before any remote file modification.

### T-052: TMASI v3: Full responsive visual audit and Lighthouse performance
- Priority: P2
- Description: Conduct Playwright cross-device screenshots (375x667, 1440x900) and run Lighthouse mobile performance audit.
- Acceptance Criteria:
  1. Mobile performance score of 90 or higher.
  2. Cumulative Layout Shift under 0.1.
  3. Zero console errors or broken resource links.
