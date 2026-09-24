# 24/7 CLINIC HOMEPAGE REBUILD SPECIFICATION

Generated for Claude Code (@claude) and the HCIG Fleet.
Source: 247 material/WEBSITE.docx, brand guideline/design-md/clinic247/DESIGN.md, and ui-ux-pro-max.

================================================================================
1. EXECUTIVE DIRECTIVE & ARCHITECTURE
================================================================================

Track 1 is chosen by the user.
Instead of an in-place patch that damaged original animations and visual cohesion, we are executing a clean rebuild and refactor.
Claude Code (@claude) leads the design architecture, visual decisions, and styling.
Antigravity supports with asset preparation, markup validation, and automated checks.

Core conversion objective:
Visitor -> WhatsApp contact -> Medical coordination -> Hotel clinic visit.

Hard rules:
- No em dashes or en dashes anywhere. Use a full stop and a short sentence.
- Restraint in copy: Headlines plus one short note. Never AI filler paragraphs.
- White and warm canvas ground (#FFFFFF / #FAF8F6). No dark themes.
- Red is reserved for the brand identity and the call action (#C00000).
- WhatsApp is green (#25D366 / #1FA855).
- Exact accreditation wording:
  "24/7 Clinic is the first international urgent care network outside the United States accredited by the Urgent Care Association through CAUCQ."
  "Official Partner of Global Healthcare Accreditation (GHA)"
  "Official Partner of German Medical Wellness Association (DMWV)"
  Never say accredited by GHA or DMWV.
  Never promise cashless care flat. State: "Cashless treatment may be available subject to insurance approval."

================================================================================
2. DESIGN TOKENS & UI/UX PRO MAX FOUNDATIONS
================================================================================

PALETTE:
- Primary Brand Red: #C00000
- Primary Red Hover: #960000
- Primary Red Tint: #FCEDED
- Primary Red Border: #F0C9C9
- WhatsApp Green: #1FA855 (hover #177F41, tint #E7F6ED)
- Primary Ink: #131110 (headings, key text, contrast > 10:1)
- Secondary Ink: #4C4643 (body, lede)
- Muted Ink: #7B736E (meta, captions)
- Canvas Ground: #FFFFFF
- Warm Surface: #FAF8F6
- Subtle Border Hairline: #E4DED7
- Strong Border Line: #CFC6BC

TYPOGRAPHY:
- Primary Interface & Headings: Poppins (Weights 400, 500, 600, 700)
- Tagline & Accent Headings: Calisto MT (Fallback: Georgia, serif)
- Eyebrow / Monospace: IBM Plex Mono or uppercase Poppins with letter spacing 0.15em

INTERACTION & ELEVATION:
- Flat cards with 1px solid border (#E4DED7), border radius 12px. No heavy drop shadows.
- Buttons: Pill shape (border radius 999px), min height 44px (touch standard), 54px for hero CTAs.
- Active feedback: scale(0.98) on press.
- Floating WhatsApp button: Bottom right corner with pulse glow or clean pill text.
- Mobile Sticky CTA: Bottom bar fixed on mobile screens (Need a Doctor? Chat on WhatsApp).

================================================================================
3. PAGE SECTION BLUEPRINT (WEBSITE.DOCX)
================================================================================

SECTION 0: HEADER & NAVIGATION
- Logo: 24/7 Clinic logo (src/assets/logo-247.png).
- Navigation links:
  1. Home
  2. Medical Services
  3. Insurance & Cashless Care
  4. Find a Clinic
  5. For Hotels & Partners
  6. About Us
  7. Contact
- Desktop Header CTA: "WhatsApp Us 24/7" (Green pill button).
- Mobile Header CTA: "Need a Doctor?" or direct WhatsApp icon.

SECTION 1: HERO
- Eyebrow: ON-SITE HOTEL & RESORT MEDICAL CARE IN EGYPT
- H1: Urgent Medical Care. Right Inside Your Hotel.
- Supporting Note:
  24/7 Clinic operates a network of on-site urgent care clinics inside hotels and resorts across Egypt. Fast medical access for international travelers without unnecessary hospital visits.
- Feature Badges / Highlights:
  - 24/7 On-Site Medical Care
  - Cashless Travel Insurance
  - Multilingual Medical Staff
- Action Group:
  - Primary CTA (WhatsApp): "WhatsApp Us 24/7" (Pre-filled message: "Hello, I need medical assistance. I am currently staying at [Hotel Name / Location].")
  - Secondary CTA: "Find Your Clinic" (Smooth scroll to clinic directory)
- Trust Statement below buttons:
  "Internationally Accredited Urgent Care Network"
- Hero Visual:
  Real hotel clinic photo or doctor assisting a traveler inside a resort room.

SECTION 2: ACCREDITATION BLOCK
- Placement: Directly below hero.
- Heading: Internationally Accredited Urgent Care
- Copy:
  24/7 Clinic is the first international urgent care network outside the United States to achieve accreditation through the Urgent Care Association and CAUCQ.
- Four Core Standards:
  1. International Clinical Standards
  2. Patient Safety Protocols
  3. Continuous Clinical Quality
  4. Operational Excellence
- Partner Marks:
  - UCA / CAUCQ Accredited Urgent Care mark (src/247site/assets/accreditation/c7acc-uca.png)
  - Official Partner of Global Healthcare Accreditation (src/247site/assets/accreditation/c7acc-gha.png)
  - Official Partner of German Medical Wellness Association (src/247site/assets/accreditation/c7acc-gmwa.png)
- CTA Link: "Learn About Our Accreditation" -> contact or accreditation section.

SECTION 3: WHY HOTEL-BASED MEDICAL CARE (VALUE PROPOSITION)
- Section Title: Medical Care Without Leaving Your Resort
- Subtitle: Why travel to an outside hospital when qualified care is already steps away?
- 4 Value Cards:
  1. No Lost Holiday Time: Immediate evaluation inside your resort. Avoid hours in transit or hospital waiting rooms.
  2. Cashless Insurance Direct: We coordinate directly with international travel insurers to verify coverage and request payment guarantees.
  3. Doctor in Your Room: When mobility is difficult, our physicians examine and treat you directly in your guest room.
  4. Hospital Transfer If Needed: If intensive diagnostics or surgery are required, our group coordinates immediate hospital admission.

SECTION 4: WHAT WE TREAT ON-SITE (SERVICES GRID)
- Section Title: Primary & Urgent Care Services
- Subtitle: Comprehensive on-site diagnosis and treatment for acute holiday conditions.
- 6 Treatment Service Cards:
  1. Urgent Medical Care: Sudden infections, high fevers, acute gastrointestinal illness, food poisoning, respiratory symptoms, and dehydration.
  2. Injuries & Minor Procedures: Cuts, wound dressing, laceration repair, minor fractures, sprains, marine stings, and burns.
  3. Diagnostics & Lab Tests: On-site rapid blood analysis, infection markers, ECG, urinalysis, and vital sign monitoring.
  4. IV Therapy & Rehydration: Fast recovery intravenous fluids, antiemetic infusions, electrolyte rebalancing, and symptom relief.
  5. Specialist Consultations: Direct access to pediatric, orthopedic, cardiology, and internal medicine specialist support.
  6. Hotel Room Doctor Visits: Complete bedside consultation and treatment for guests unable to walk to the clinic.

SECTION 5: INSURANCE & CASHLESS CARE
- Section Title: International Travel Insurance & Cashless Care
- Subtitle: Direct coordination with major global assistance and insurance networks.
- Verification Note:
  Cashless treatment may be available subject to insurance approval. We assist with documentation and claim processing for all international policies.
- 3 Step Insurance Process:
  1. Contact via WhatsApp: Share your insurance details and policy number.
  2. Assistance Coordination: We submit medical reports and request a Guarantee of Payment (GOP).
  3. Direct Settlement: When approved, your insurer settles medical fees directly with us.
- Partner Marquee / Grid: Allianz, AXA, Bupa, Cigna, Europ Assistance, Falck, Mapfre.

SECTION 6: HOW IT WORKS (PATIENT JOURNEY)
- Section Title: How It Works
- 4 Sequential Steps:
  1. Contact via WhatsApp: Tap the 24/7 medical coordination button and tell us your hotel and symptoms.
  2. Medical Triage: A coordination physician reviews your case within minutes.
  3. Clinic or Room Visit: Walk into the hotel clinic or welcome the doctor to your room.
  4. Direct Insurance Care: We handle medical treatment and coordinate cashless billing with your insurer.

SECTION 7: FIND A CLINIC (DIRECTORY)
- Section Title: Find a Clinic in Your Resort
- Subtitle: Operating across 30 resorts in Egypt key tourist destinations.
- Active Destinations:
  - Marsa Alam (11 clinics including Jaz Coraya resorts)
  - Hurghada (5 clinics)
  - Sahl Hasheesh (4 clinics including Premier Le Reve)
  - Soma Bay & Abu Soma (4 clinics)
  - North Coast (5 clinics)
  - El Quseir (1 clinic)
- Search / Filter by Destination and Hotel.
- Dedicated Links to In-Hotel Landing Pages (Steigenberger, Premier Le Reve, Amwaj).

SECTION 8: VERIFIED PATIENT TESTIMONIALS
- Section Title: What Our Patients Say
- Patient quotes from verified international travelers (German, British, Polish, Italian).
- Real feedback on bedside manner, fast IV recovery, and seamless insurance handling.

SECTION 9: FINAL CONVERSION BANNER
- Headline: Need Medical Assistance in Your Hotel Right Now?
- Subtitle: Our doctors are on call 24/7 across Egypt coastal resorts.
- Big Primary Action: "Chat with a Doctor on WhatsApp"
- Direct Emergency Phone Call Option.

SECTION 10: GLOBAL WHATSAPP SYSTEM
- Floating Pill Button:
  Fixed bottom right corner.
  Text: "Need a Doctor? Chat on WhatsApp"
  Pre-filled text: "Hello, I need medical assistance. I am currently staying at [Hotel Name / Location]."
- Mobile Sticky Bottom Bar:
  Visible on screens under 768px.
  Full width tap target: "WhatsApp Medical Support 24/7" (height 54px).

================================================================================
4. TECHNICAL STACK & PREVIEW WORKSPACE
================================================================================

- Build Destination: src/247site/ (or dedicated preview in src/247-rebuild/)
- Build Command: npm run build
- Verification Command: npm test / npm run check
- Staging Preview: https://hcig-passport.vercel.app/247clinic/website-preview
- Lead Agent: @claude
- Support Agent: @agy-cli
