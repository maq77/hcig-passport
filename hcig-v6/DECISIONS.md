# DECISIONS.md: HCIG v6 (newest first, the owner's words quoted)

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
