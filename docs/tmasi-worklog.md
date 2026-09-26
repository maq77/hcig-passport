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
- The dark world map stays and gets a sharper image.
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
- Security items: the urgent edits and the v3 plan come first; Mohamed informs his managers before any security change. Details kept privately.
- v3: partners first; the world map hero as on the original site, made sharp; light pages with the dark map and footer; all-teal buttons; Big Noodle Titling headlines (Mohamed has permission); a page per service group and per office; today's titles kept except wrong-language ones; EN, DE, PL, ES plus FR, IT, CS; one footer line for HCIG; a logo row of only the organisations the site names; news only, keyword articles later.

### Done, not yet on the live site
- Spanish, German and Polish drafts of both news posts made: first draft by Gemini, reviewed by Claude (grammar only: Spanish "se enorgullece de", "cuando sean necesarios", "sin fisuras"; German commas and one compound). Saved in `tmasi sponsor\translations\`. Waiting for a native speaker's check.

### Fixed on the live site
- Nothing yet. Waiting for the SSH login.
