# TMASI Global v3: Graphic Design Slots

Deliverables specification for graphic designer Reham. Every slot defines its destination, exact dimensions, aspect ratio, safe margin area, format, and artistic purpose.

## Summary Table

| Slot ID | Section | Purpose | Dimensions | Ratio | Format | Safe Area |
|---|---|---|---|---|---|---|
| `SLOT-HERO-MAP` | Homepage Hero | Interactive dark global operational map with 5 office pins | 2560 x 1440 | 16:9 | SVG / WebP | 80px all sides |
| `SLOT-SHARE-OG` | Meta Header | Social media share card for OpenGraph and Twitter | 1200 x 630 | 1.91:1 | PNG / WebP | 60px all sides |
| `SLOT-FAVICON` | Browser Tab | High-resolution brand favicon and touch icon set | 512 x 512 | 1:1 | PNG / ICO | 32px padding |
| `SLOT-SVC-MED` | Services Grid | Medical Assistance card graphic illustration | 800 x 600 | 4:3 | WebP / PNG | 40px padding |
| `SLOT-SVC-VIP` | Services Grid | Elite Medical Concierge card graphic illustration | 800 x 600 | 4:3 | WebP / PNG | 40px padding |
| `SLOT-SVC-TRV` | Services Grid | Travel Assistance card graphic illustration | 800 x 600 | 4:3 | WebP / PNG | 40px padding |
| `SLOT-SVC-TOU` | Services Grid | Medical Tourism card graphic illustration | 800 x 600 | 4:3 | WebP / PNG | 40px padding |
| `SLOT-SVC-INS` | Services Grid | Insurance Assistance card graphic illustration | 800 x 600 | 4:3 | WebP / PNG | 40px padding |
| `SLOT-SVC-ADD` | Services Grid | Additional Services card graphic illustration | 800 x 600 | 4:3 | WebP / PNG | 40px padding |
| `SLOT-NEWS-HANSA` | News / Blog | Hansa Medica Grand Egyptian Museum banner | 1600 x 900 | 16:9 | WebP / JPG | 60px safe margin |
| `SLOT-NEWS-ITIC` | News / Blog | ITIC Global 2026 Istanbul official sponsor card | 1600 x 900 | 16:9 | WebP / JPG | 60px safe margin |
| `SLOT-LEAD-AMBA` | Leadership | Dr. Amr Abbass executive portrait frame | 800 x 1000 | 4:5 | WebP / PNG | Centered headshot |
| `SLOT-LEAD-NOUH` | Leadership | Dr. Ahmed Nouh executive portrait frame | 800 x 1000 | 4:5 | WebP / PNG | Centered headshot |
| `SLOT-OFFICE-EGY` | Offices Grid | Cairo & Red Sea operational dispatch hub | 1000 x 750 | 4:3 | WebP | 40px safe margin |
| `SLOT-OFFICE-DEU` | Offices Grid | Germany European liaison hub visual | 1000 x 750 | 4:3 | WebP | 40px safe margin |
| `SLOT-OFFICE-ESP` | Offices Grid | Spain Mediterranean liaison hub visual | 1000 x 750 | 4:3 | WebP | 40px safe margin |
| `SLOT-OFFICE-UAE` | Offices Grid | UAE Middle East liaison hub visual | 1000 x 750 | 4:3 | WebP | 40px safe margin |
| `SLOT-OFFICE-USA` | Offices Grid | USA North America liaison hub visual | 1000 x 750 | 4:3 | WebP | 40px safe margin |

## Detailed Slot Specifications

### 1. `SLOT-HERO-MAP`: Dark Global Operations Map
- Purpose: Primary hero visual showing worldwide operational coverage with exact pins on Egypt, Germany, Spain, UAE, and USA.
- Color Scheme: Deep navy dark background (`#0A1128` or `#0F205C`). Continental outlines in subtle slate or muted teal. Glowing pulse marks in TMASI Teal (`#009A9C`) at office coordinates.
- Pin Coordinates:
  - Egypt: Cairo (30.0444, 31.2357)
  - Germany: Frankfurt / Berlin (50.1109, 8.6821)
  - Spain: Madrid / Barcelona (40.4168, -3.7038)
  - UAE: Dubai (25.2048, 55.2708)
  - USA: New York / Washington (38.9072, -77.0369)
- Technical Output: SVG vector preferred for crisp scaling. Fallback to 2560x1440 WebP. Must remain legible on mobile screens down to 375px width.

### 2. `SLOT-SHARE-OG`: Social OpenGraph Share Card
- Purpose: Displayed when tmasi.net links are shared on LinkedIn, WhatsApp, Facebook, or Twitter.
- Visual Content: TMASI Global logo, bold headline "Care Without Borders", secondary tagline "Global Medical, Travel & Insurance Assistance", subtle world grid background.
- Dimensions: 1200 x 630 px.
- Safe Area: Keep text and logos within a central 1080 x 510 px box to avoid cropping on circular or truncated previews.

### 3. `SLOT-FAVICON`: Global Brand Favicon & Touch Icon
- Purpose: Multi-platform favicon for desktop browser tabs, bookmarks, and mobile home screen shortcuts.
- Design: Clean isolation of the TMASI circular globe mark. High contrast against both dark and light browser chrome.
- Export: 512x512 master PNG, 192x192 Android icon, 180x180 Apple touch icon, and multi-size ICO.

### 4. `SLOT-SVC-*`: Service Group Graphics (6 Cards)
- Purpose: Clear, professional illustration or photo treatment for each of the six core services.
- Dimensions: 800 x 600 px (4:3 ratio).
- Style: Consistent lighting and treatment. Modern medical assistance aesthetic. No generic clip art.
- Themes:
  - Medical Assistance: Air ambulance, ground paramedic transport, patient monitoring.
  - Elite Medical Concierge: Private hospital suite, personal executive doctor consultation.
  - Travel Assistance: Hotel room physician call, 24/7 multilingual communication desk.
  - Medical Tourism: World-class specialized clinical facility, patient welcome.
  - Insurance Assistance: Direct billing clearance, cashless authorization documentation.
  - Additional Services: Compassionate mortal remains transport, certified medical coordination.

### 5. `SLOT-NEWS-*`: Feature News Banners
- Purpose: Editorial header visuals for major corporate milestones.
- Hansa Medica Banner (`SLOT-NEWS-HANSA`): Highlighting partnership agreement signed at the Grand Egyptian Museum. Incorporate museum architectural aesthetic and corporate signage.
- ITIC Global Banner (`SLOT-NEWS-ITIC`): ITIC Global Istanbul 2026 conference sponsorship branding. Premium conference atmosphere.

### 6. `SLOT-LEAD-*`: Leadership Executive Portrait Frames
- Purpose: Consistent executive portrait framing for Dr. Amr Abbass and Dr. Ahmed Nouh.
- Dimensions: 800 x 1000 px (4:5 ratio).
- Style: Corporate editorial photography. Clean neutral studio background with subtle teal or navy lighting accent.
