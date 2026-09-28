# Implementation Plan: TMASI Global Website (v2 & v3)

**Branch**: `008-tmasi-website` | **Date**: 2026-09-27 | **Spec**: `specs/008-tmasi-website/spec.md`

## Summary

Execute the design, architecture, and rebuild of the TMASI Global website across two complementary tracks. Track 1 establishes Phase B2 (in-place v2 enhancements previewed via `?preview=2`). Track 2 builds Phase B (the bespoke v3 platform previewed on HCIG Work at `/tmasi/v3`, then deployed to production).

All work strictly preserves client words, numbers, and statements from `tmasi.net`. Incorporates the approved brand guideline: Big Noodle Titling headlines, Montserrat body typography, dark global map hero and footer, light content sections, TMASI Teal (`#009A9C`) accents, and designated graphic slots for Reham.

## Technical Context

- Technology Stack: Static HTML, modern CSS with responsive variables, lightweight vanilla JavaScript modules. Compatible with Node static export pipeline (`build.js`) and Apache PHP 8.1 hosting on GoDaddy.
- Dependencies: Zero runtime node dependencies in production. Build-time image optimization, SVG generation, and word-for-word string validation.
- Typography: Big Noodle Titling (Latin WOFF2 subset) and Montserrat (variable WOFF2).
- Brand Assets: TMASI logo, vector world map with 5 verified hubs, designated design slots (`docs/tmasi-v3-design-slots.md`).
- Target Hosts: Staging on HCIG Work (Vercel). Production on GoDaddy cPanel (Apache, PHP 8.1).

## Constitution & Rule Compliance Check

| Requirement | Implementation Strategy |
|---|---|
| Zero Em or En Dashes | Build linter rejects Unicode U+2013 and U+2014 across all output files. Clean full stops or commas used exclusively |
| Word-for-Word Text Preservation | Automated check validates all DOM copy against baseline strings in `content/tmasi/` |
| Exact Building Names | Not applicable to TMASI. Where MedPark is referenced, names strictly adhere to MedPark Health Hub (Hurghada) and MedPark Hospital (El Quseir) |
| Exact Accreditation Copy | Exact phrases required: "Official Partner of Global Healthcare Accreditation™ (GHA)" and "Official Partner of German Medical Wellness Association (DMWV)" |
| Non-Destructive Deployment | Remote tarball backup generated before any file upload to production |
| Preview Security | Staging sends `X-Robots-Tag: noindex, nofollow` to prevent premature search indexing |

## Project Structure

```text
specs/008-tmasi-website/
├── spec.md                       # Approved specification
├── plan.md                       # Implementation roadmap
├── research.md                   # Technical decisions & competitor analysis
├── data-model.md                 # Entity schemas & multilingual routing
├── quickstart.md                 # Verification and local testing commands
├── contracts/
│   ├── urls.md                   # Clean URL mapping & 301 redirects
│   ├── content.md                # Verbatim content preservation rules
│   ├── cpanel-deploy.md          # GoDaddy deployment and rollback protocols
│   └── whatsapp-events.md        # Telemetry and communications hooks
├── checklists/
│   └── requirements.md           # Acceptance criteria tracker
└── tasks.md                      # Dependency-ordered execution tickets

docs/
└── tmasi-v3-design-slots.md      # Graphic design specification for Reham
```

## Phased Implementation Roadmap

### Phase 0: Intelligence & Content Extraction
- Extract every text block from production into structured JSON (`content/tmasi/`).
- Catalog all 6 news articles with English, German, Polish, and Spanish source copies.
- Complete graphic design slots specification for Reham (`docs/tmasi-v3-design-slots.md`).

### Phase 1: High-Fidelity SVG World Map
- Construct responsive SVG world map with deep navy styling.
- Pinpoint accurate coordinates for Egypt, Germany, Spain, UAE, and USA.
- Integrate interactive pulse rings and office preview cards on hover or tap.

### Phase 2: TMASI v3 Architecture & HCIG Work Preview
- Set up route `/tmasi/v3` inside HCIG Work static pipeline.
- Implement responsive layout engine: sticky header with emergency hotline, hero dark map, B2B partner trust bar, 6 core service cards, leadership profiles, interactive news carousel, and dark global footer.
- Test at 375px (mobile) and 1440px (desktop) viewpoints.

### Phase 3: Inner Pages & Multilingual Structure
- Build dedicated service group templates.
- Build global office directory templates.
- Implement multilingual dictionary architecture supporting EN, DE, PL, ES, FR, IT, and CS.

### Phase 4: Telemetry, AEO & Production Readiness
- Embed JSON-LD schema for MedicalOrganization, EmergencyService, and LocalBusiness.
- Generate `llms.txt` and semantic answer-first Q&A blocks.
- Configure `.htaccess` with clean URL rewrites, caching rules, and 301 redirects.
- Prepare deployment package for GoDaddy cPanel preview via `?preview=2`.
