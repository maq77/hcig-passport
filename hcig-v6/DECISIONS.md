# DECISIONS.md: HCIG v6 (newest first, the owner's words quoted)

## 2026-10-26 (late night): home round 2, brand guideline review, phone first

- **Stack** [stated]: Next.js + Framer Motion + Tailwind with one `globals.css`, built locally and uploaded compiled (TMASI v3 way).
  The home is now React components in `src/components/`, one stylesheet `src/app/globals.css`.
- **Day/night changes only the hero** [his answer]; every other section is always day; the hero melts into the page.
- **About band: Dim Gray depth**, no pure black [his answer]. The CEO band uses the same depth.
- **"Mission & Vision"** as the section title, check marks instead of dashes [stated].
- **Strict brand guideline** [stated: "make sure that design system was built from brand guidlines"]. Review of the guideline
  PDF (25 pages, read by eye) found and fixed: Helma now at its own Regular weight (was a synthetic bold copied from the live
  site); section titles use the guideline's motif, the Helma title between two black hairlines (was an invented turquoise bar);
  footer logo at the 120 px minimum (mark alone on phones, which the guideline allows); the HC mark as a watermark and the
  stationery's flowing lines added as brand motifs. Palette, tints, Inter roles and Dim Gray bands already matched.
- **Phone first, own phone layouts** [stated: "you can make horizontal with sliders and arrow on phone ... mobile first"]:
  Why, Built, Our Healthcare, Who We Work With and the testimonial videos are sliders with arrows and a counter on phones.
- **Google reviews** [stated, with the pasted widget]: MedPark Health Hub's real Google reviews (4.8, 292), word for word,
  sliding on their own. Verified on medparkhospitals.com/healthhub.php the same day. Relative dates left out (they go stale).
- **CEO portrait round** [stated: "make ceo face as round icon or so, like round profile"].
- **Closing band background** [stated: "more better and meaningful"]: a generated coast where resort, hospital, marina and
  airport are joined by turquoise light, one connected system.
- **Images with brand identity**: Nano Banana scenes with a clean surface, the real HC mark placed in post
  (`scripts/place-logo.py`), never an AI-drawn logo [his answer].

## 2026-10-26 (night): original order, About image

- **Same content and the same order as the live site** [stated]: "i want same content and ordering, like about us first and
  then etc like original website". Home order: Hero, About Us, Our Premises and Facilities, Mission and Vision, Why
  partners, Built for Global, How Our System Works, Our Healthcare, (Maritime block), Testimonials, (CEO quote), 100%
  Trusted by Global Insurance & Assistance Networks, Who We Work With, Our Impact, the closing band, contact and footer.
  The earlier idea of moving the insurer band up is dropped.
- **About Us gets a better, generated image and a better design** [stated]: "use /imagine or claude in chrome into gemini
  account and generate using nano banana and make better design for about us section and you can learn from tmasi v3
  about us section".

## 2026-10-26 (evening): deadline and scope

- **Two days, full website** [stated]: "i need to finish in two days, so make website full first and push to hcig passport
  vercel to give to irina for review ... i prefer quality ... give agy low to mid priority tasks to save tokens in claude,
  and only make claude review its work too, and claude must work on all design and home page as it is highest priority".
- **English complete first**; the six other languages are drafted by agy against a locked glossary while Irina reviews,
  checked by Claude, shipped before go-live.
- **Full website, one design system** [stated]: "i want full website ... only home page has day and night, but the other
  day only for now until we finish then we may add night later. and give more priority to important pages, but the other
  pages are ok, only care about redesign with the new design system, to keep all website consistent".
- **Review on the live preview** (HCIG Work `/hcig/v6`) instead of canvas rounds, to meet the date.

## 2026-10-26 (later): fact sheet, sitemap, leadership, presence, security

- **Fact sheet and sitemap approved** ("Approve both"). The hotels partner page is `/partner/hotels-and-resorts/`.
- **Leadership uses the company profile titles:** Board: Dr. Mostafa Elshakankery Group Chairman, Dr. Amr Abbass Group
  Vice Chairman, Mr. Mohsen Mohamed HCIG Board Member. Executive committee: Dr. Amr Abbass Group CEO, Dr. Ahmed Safwat
  Group Deputy CEO, Dr. Mohamed Aziz Group CSO, Dr. Hesham Abdalla Group COO.
- **Network page names five countries** (Egypt, UAE, Germany, Spain, USA) with the Cairo and Clearwater offices.
- **Security fix on the live site, reversible:** "Block now, reversibly". The public `hcigdb.sql` (admins table with a
  plain-text looking password), `hcigadmins/`, `datastore.php`, `inscomment.php`, `contactconf.php`, `test_mail.php`
  move out of `public_html` into a private folder. That admin password counts as leaked.

## 2026-10-26: v6 starts, five question rounds

- **Start:** "now i want it to be hcig v6, this is complete and full and best version in all aspects ... forget v3,
  only take hero B and group section only from claude canvas, and begin v6 on new folder called hcig v6". Folder named
  `hcig-v6` (hyphen, like the other builds).
- **Words:** "most important to keep original content as written" and "we allow to optimize or add another sections".
  His pick: keep every live sentence; add the manager's maritime copy word for word; new lines need his approval.
- **Maritime & Cruise:** all of it (menu item, home block, full page with form and brochure request).
- **Pages:** full B2B site, about 52 per language.
- **Hotel-name SEO:** 247clinic.net ranks for hotels; HCIG links to it.
- **Languages:** all seven at launch (EN, DE, PL, FR, IT, ES, CS).
- **Live site:** "touch nothing on live site, only make backup, and then after we finish v6, we will replace current
  with our new v6, and keeping only the backup zip on hosting, call it old_hcig_backup_website".
- **Tracking:** "All + our own tracker": GA4, Google Ads, Yandex and the HCIG tracker, all behind consent.
- **Skills:** "keep all, and use them wisely and best. use what actually helps us and get us best results."
- **Irina:** sees only the finished preview.
- **Design base:** one system from Hero B + the group section.
- **Contact:** JotForm AI agent stays the only float; WhatsApp +20 100 182 8828 inside the "Talk to our team" sheet.
- **Newsletter:** our own lead store.
- **Group heading:** "Both": live H2 "Our Premises and Facilities" with "Integrated healthcare group all over the world".
- **Hero B:** "B only, No HC and No Group film."
- **Trusted by patients:** "Videos + Group reviews from google of medpark reviews + ... images with same design and ui
  like in tmasi trust section ... choose some of each so that it doesnt feel overwhelming". Claude agreed and proposed
  one bento section with a curated few of each.
- **Google reviews:** "google reviews live like choice 1, but better if we get it same style like in medpark health hub
  google reviews part" (that part is the Elfsight widget on `medpark-live/v2/healthhub.php`).
- **Articles:** "No new articles unless irina approves and she writes the content herself, i only give her the
  keywords and idea of the articles."
- **New page copy:** "you do all". **Legal pages:** "you do all and it is already approved."
- **Canvas scope:** "only add important pages to canvas, and rest you can impl directly after i approve important
  pages".
