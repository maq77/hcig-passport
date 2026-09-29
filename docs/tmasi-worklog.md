# TMASI work log

Everything done and fixed for TMASI Global (tmasi.net), newest first. Kept from day one
so the report and email at the end are complete and exact.

How entries are written: one line per change, the page or URL, what it was before and
after, and how it was checked. Words on the site are never changed unless Mohamed says so.

## 2026-09-26

### Set up
- Server access (SSH) to tmasi.net set up. The server accepts our key. Login waits on one local step by Mohamed.
- TMASI added to HCIG Work with two projects, urgent edits and website v3: https://hcig-passport.vercel.app/tmasi
- v3 spec drafted: `specs/008-tmasi-website/spec.md`
- Mohamed's news folder: `tmasi sponsor\` (text and photos for each post).

### Found on the live site (all 25 sitemap pages, desktop and phone)
- Favicon and share image (og:image) both point to `/img/logo.jpg`, which does not exist (404). No icon in browser tabs, no picture when a link is shared. Five pages have no icon tag at all.
- `www.tmasi.net` answers as a second copy of the site instead of redirecting.
- No canonical and no hreflang on any page.
- Every page is marked as English, including the German, Polish and Spanish pages.
- German titles on the Polish home, Polish about and Spanish about pages. Left as they are, by decision.
- `/pl/uslugi/` is listed in the sitemap and returns 404.
- The sitemap uses the wrong format header, and the news posts are not listed in it.
- Most pages have no H1.
- The Google tag loads twice on every page.
- The German and Polish blogs do not exist (404). News exists in English and Spanish only.
- On phones the Sofia chat opens by itself over the whole screen. Left as it is, by decision.
- Text alignment is mixed across sections (hero left, headings centred, lists left).
- The world map image is 800 x 421 px, stretched across the full screen, so it looks soft. Its Germany pin sits over Central Asia and its UAE pin over South East Asia.
- The logo on the site is a blurry raster picture (1185 x 569, JPEG artefacts).
- The brand guideline PDF is 30 flat slide pictures (1920 x 1080 each) with no vector logo. Its logo is no sharper than the site's. A sharp logo needs the original file (on the server, or from Mohamed's manager) or a faithful vector redraw.

### Security review
- The hosting account was reviewed on 2026-09-26. Findings are kept privately (not in this public log) and were shared with Mohamed. Nothing was changed.
- A full backup of the site folder was downloaded before any change.

### Decided with Mohamed
- Every word stays exactly as written. Content changes only when Mohamed brings new ideas.
- Fix every UI and UX issue found on the live site. Words untouched.
- Centre the About Us lines.
- New news posts come from the folder Mohamed fills, published in all four languages. We translate, a native speaker checks.
- Technical fixes ship once SSH works. Titles stay untouched.
- Edits go straight to the live site after a server backup, with before and after screenshots.
- The Sofia chat stays as it is.
- The dark world map stays. Mohamed chose the original map image over the rebuilt one (2026-09-26).
- We own the site now. The "Powered by Pulse Marketing" credit stays, better styled.
- Mohamed approves TMASI changes alone.
- v3 is a complete new design and rebuild, with keyword planning, SEO and AEO.
- World map: rebuilt sharp, same dark look and labels, each pin on its real country (Gemini and Nano Banana allowed).
- Favicon: the original logo's arch mark, in every size browsers and phones need.
- Share image: the best we can make now. Mohamed's graphic designer makes the final one later.
- Logo: the original file from the server if it exists, otherwise from the brand guideline PDF, until Mohamed gets the original from his manager.
- Live site: finished images only, never placeholders. v3: labelled design slots with sizes for the graphic designer, Reham.
- The website is the single source of truth for TMASI facts.
- Clear typos on the live site are fixed, each one logged here with before and after.
- Keyword research: free Google tools plus Mohamed's Semrush free account, through Chrome.
- Analytics: Mohamed asks Pulse for access to the current Analytics, Tag Manager and Search Console. No tag changes until then.
- Domain and DNS are held by someone at TMASI.
- Two new posts received and in Mohamed's folder `tmasi sponsor\`, text checked word for word against his message: the Hansa Medica Group partnership at the Grand Egyptian Museum (card date "June 2026") and the ITIC Global 2026 Istanbul sponsorship (card date "October 2026"). Photos arrived the same day: four for the Hansa Medica post (the ambulance at the Grand Egyptian Museum, the team at the entrance, equipment), one ITIC sponsor banner.
- Found: the ITIC banner and the conference site say 1 to 5 November 2026, but the post's dateline says "October 2026". Mohamed decided: keep the text exactly as written, even if it is wrong.
- No floating WhatsApp button: the Sofia assistant already sits on the right.
- Content rule, final wording: the text stays even where it looks wrong; only grammar, punctuation and styling fixes that keep the same words and meaning, each logged here.
- News goes live in English first; German, Polish and Spanish follow after a native speaker's check.
- Order of work: the urgent edits first, news included; then v3 with its full plan.
- v3 spec approved by Mohamed.
- Three stages (Mohamed, 2026-09-26): urgent edits; **v2** = the same design, colours and feeling, fully improved with new CSS (ui-ux-pro-max), every word kept; **v3** = a complete new design from the brand guideline with its full plan. Order: v2 first, then v3.
- v2 is reviewed at tmasi.net/?preview=2 (hidden from Google), home first, then every page and language. Gemini builds it, Claude reviews and deploys.
- Security items: the urgent edits and the v3 plan come first; Mohamed informs his managers before any security change. Details kept privately.
- v3: partners first; the world map hero as on the original site, made sharp; light pages with the dark map and footer; all-teal buttons; Big Noodle Titling headlines (Mohamed has permission); a page per service group and per office; today's titles kept except wrong-language ones; EN, DE, PL, ES plus FR, IT, CS; one footer line for HCIG; a logo row of only the organisations the site names; news only, keyword articles later.

### Done, not yet on the live site
- Spanish, German and Polish drafts of both news posts made: first draft by Gemini, reviewed by Claude (grammar only: Spanish "se enorgullece de", "cuando sean necesarios", "sin fisuras"; German commas and one compound). Saved in `tmasi sponsor\translations\`. Waiting for a native speaker's check.

### Fixed on the live site (2026-09-26, each file backed up on the server first under `~/backups/batch1-technical-news/`)
- `www.tmasi.net` now redirects to `tmasi.net` (one address for the whole site).
- Canonical and hreflang (EN, DE, PL, ES) added to 36 pages, so Google can tell the languages apart.
- Each page now declares its real language (German, Polish and Spanish pages were marked English).
- Favicon added in every size (tab icon, phone home screen), from the original logo mark.
- Share image fixed on every page: a branded image for main pages, each post's own photo for news, each doctor's photo for the leadership pages. Share addresses corrected (they pointed to old or placeholder addresses).
- Broken image links in the structured data fixed (logo and doctor photos pointed to files that do not exist).
- One H1 heading per page. Where a page had none, its first heading became the H1 with its look unchanged.
- The Google tags no longer load twice on the four home pages.
- Sitemap rebuilt: correct format, 27 addresses, no broken link, new posts included.
- `/pl/uslugi/` (404) now redirects to the real Polish services page. 11 old duplicate pages (about.php, servises.php, news1-4.php and others) now redirect to their current pages.
- "Your Care. One Call Away." now sits on the left, in line with the lines under it (desktop and phone).
- Service cards: the picture always sits above the heading, centred. Fixes "TRAVEL / ASSISTANCE SERVICES" breaking beside the picture.
- Two new English news posts live, first on the blog, word for word from Mohamed's text: ITIC Global 2026 Istanbul sponsorship (/blog/news6.php, "October 2026") and the Hansa Medica Group partnership at the Grand Egyptian Museum (/blog/news5.php, "June 2026", 4 photos). Styled like the older posts: key names in bold, a lead paragraph, a subheading-style dateline, a quote block for the closing line.
- World map: a sharp new map with every pin on its real country went live, then was switched back to the original map at Mohamed's request the same day. The new map files stay on the server, unused (`img/map-2026.jpg`, `img/mapmob-2026.jpg`).
- Checked after deploy: all 27 sitemap addresses answer 200; language, canonical, hreflang, H1, favicon and share image verified in each live page.

## 2026-09-27

### Fixed on the live site
- Latest news image updated: The hero and card image for the newest post (/blog/news6.php, ITIC Global 2026 Istanbul) replaced with `1.jpeg` from `tmasi sponsor/news 2 image/`. The previous server file was backed up locally (`tmasi-live/itic-global-2026-istanbul-old-server.jpg`). Optimized to 193.5 KB (1280x1280 progressive JPEG) and deployed over SFTP to `public_html/blog/img/itic-global-2026-istanbul.jpg`. Verified live with HTTP 200 on both the image and article page.
- Blog card dimensions and layout upgraded: All 6 cards now feature uniform widths, identical 220px image crops, and full fill width and height without letterboxing. The first card (Istanbul) uses full cover to match the grid. All cards show metadata formatted as "City, Country · Month Year" with teal accent badges, 2-line clamped titles, 3-line clamped excerpts, and aligned buttons.
- "Your Care. One Call Away." centered on one line across desktop and mobile versions.
- "TMASI Global: Core Values" heading made fully responsive: On desktop it renders on one clean line (`TMASI GLOBAL: CORE VALUES`). On mobile it separates cleanly into two balanced lines (`TMASI GLOBAL` and `CORE VALUES`) at 26px font size with no dangling punctuation.
- Removed legacy 200px width constraint on `.center` headings in `stylesmob.css` so mobile section headings wrap naturally across the site.
- Cleaned character encodings and replaced em/en dashes with dots, colons, and full stops across home page templates.
- Desktop container centering: Resolved alignment on `.section-about.perv` where flex container left `.about-content.ctd` offset by 200px. With `justify-content: center` and auto margins, "Your Care. One Call Away." aligns with "ABOUT US" with zero pixel deviation.
- Mobile heading alignment across all home sections:
  - Slogan ("TMASI Global: Where RELAX & ENJOY Is All You Need to Do.") breaks into 3 balanced lines with no dangling words and symmetric padding.
  - "Our Mission & Vision" styled at 24px so it displays on one bold, centered line on mobile.
  - "Why Choose TMASI Global?" breaks cleanly into two balanced lines ("Why Choose" / "TMASI Global?") on mobile, remaining on one line on desktop.
  - "Our Services" subtitle ("One Call, Endless Support: TMASI Global Has You Covered.") formatted as two centered, balanced lines.
- Changes backed up to server backup directory `backups/layout-2026-09-27/` and deployed live via SFTP. Verified on production with HTTP 200 and Playwright visual checks.


## 2026-09-28

### Website v3 (preview only, not on the live site)
- Home redesigned by agy: services as a card grid with a details window, two-column phone grids for About and Core Values, "Show More" on Mission & Vision.
- Checked word for word against the live site: 63 of 135 text pieces were not on it. All restored:
  - Office phones and emails were invented (e.g. +1 212 555 1234, @tmasiglobal.com). Now the five real offices from the live footer, with @tmasi.net emails.
  - Head office showed Cairo and Spain showed Madrid. Now Airport Road, Hurghada and Barcelona, as on the live site.
  - Every service text had been rewritten. Now the six live service groups with every live item and sentence.
  - Three made-up news posts replaced by the three newest real posts.
  - Menu labels, "CALL THE TEAM", footer links and footer contact now use the live wording. Pulse Marketing credit added back.
- Real Facebook, Instagram and LinkedIn icons in the header and footer (Twitter removed: TMASI has none).
- Favicon: the one live on tmasi.net.
- Kept on Mohamed's approval: the stat labels (Cases handled, Medical repatriations, Operational desk, Global hubs) and the "Ready to partner with TMASI Global?" band. The band's button now emails info@tmasi.net.
- Found on the live site, left as it is: the footer lists the Germany office as +49 170 9350490 / germany@tmasi.net, the contacts page as +49 1768 744 7551 / bc@tmasi.net.
- Home design pass for a calm, premium feel (words unchanged): one spacing system and one heading style for every section, hairline dividers instead of heavy shadows, soft grey and white sections in turn. Removed the moving background decoration (sliding text, floating crosses, spinning circles, flying plane). Core Values as open columns, the five "Why Choose" points in one row, the five offices in one panel, calmer news cards. "Our Mission & Vision" heading restored as on the live site; "Show More" now reveals the full live paragraphs instead of cut sentences. Visitors who ask for less motion get no entrance animations.
- Request My Free Quote added to the v3 home (preview only), right after Our Services: the live heading, paragraph and eight fields, word for word. A REQUEST A QUOTE button opens the form in place; the hero REQUEST A QUOTE button takes visitors there. A second Request a Quote button sits beside Get in Touch in the last band and opens the same form in a pop-up. Requests go to the same email handler as the live form; after sending, a thank-you with a handshake.
- The Sofia assistant (Jotform AI agent) added to v3, bottom right, the same as on the live site.
- Every CALL THE TEAM button opens WhatsApp (https://wa.me/201206788566), as Mohamed asked.
- Every page now built in English, German, Polish and Spanish (preview only): About, the two leaders, Services and its five groups, Contact and the five offices, the news list and each news post. All words are the live site's own, taken from each language's live pages. The language switcher opens the same page in the other language. Each page has a clean address.
- Menu links now open the new page at the top. Before, a click could land at the bottom, on the footer.
- Pages whose live title is in another language (Polish home, about, services and contact; Spanish about and blog) now take their own heading as title.
- News posts show their main picture whole, as on the live site. The Istanbul ITIC poster was cut to a wide frame before. Each post shows its own first picture behind its title, softened so a poster's text does not read through.
- Search and AI-answer setup for every v3 page (preview only, all still hidden from Google): the live site's own share picture (the TMASI logo card) on every page, and on news and leader pages their own photo, as on the live site. Every page now has its address on tmasi.net, its links to the same page in the other three languages, and a machine-readable description of TMASI (offices, phones, services, leaders, news). A sitemap, a robots file and an llms.txt page for AI assistants are generated on every build.
- Descriptions that the live site left in the wrong language (German on Polish pages, English on Spanish posts and on the leader pages) now use the page's own words. The English news post about the Egypt agreement carried the About page's title on the live site; it now uses its own headline.
