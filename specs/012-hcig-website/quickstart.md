# Quickstart: run, check, preview, ship (spec 012)

## The live copy on HCIG Work (exists now)

```bash
node scripts/mirror-hcig-live.mjs     # copies today's healthcareig.com into src/hcig-live
npm test                              # root build and check
git add src/hcig-live && git commit && git push   # https://hcig-passport.vercel.app/hcig-live
```

Expected: 25 pages, Helma loads, every image loads, no gtag or ym on the page, robots noindex, forms do not send.

## The new site

```bash
cd hcig-v3
npm install
npm run dev            # http://127.0.0.1:3000/hcig/v3 (use 127.0.0.1, not localhost)
npm run build          # static export to out/, base path /hcig/v3, noindex, no tags
npm run check          # words, dashes, emoji, claims, language, hreflang, links, weight budget
npm run sync           # out/ -> ../src/hcig-v3, served at /hcig/v3 by build.js
cd .. && npm test      # root HCIG Work build and check, then commit and push
```

## Quality runs before each review round

```bash
cd hcig-v3
npx playwright test                    # 360, 390, 768, 1280, 1440; reduced motion; JavaScript off; axe
npx lighthouse http://127.0.0.1:3000/hcig/v3/ --preset=perf --form-factor=mobile   # per template
php -l server/lead.php && php server/tests/run.php                                  # lead endpoint
node scripts/check-redirects.mjs https://healthcareig.com                           # old-address list
```

## Live build and deploy (his word first, every time)

```bash
cd hcig-v3 && LIVE_OUT=build-YYYY-MM-DD npm run build:live    # -> ../hcig-live/build-YYYY-MM-DD
```

Then follow `contracts/deploy-cpanel.md`: backup, stage, swap, `.htaccess` last, `verify.sh`, sitemaps, IndexNow.

## Scenarios that prove it works

| Scenario | Proves |
|---|---|
| Crawl the old-address list after go-live: all 200 or one 301 | SC-003 |
| `npm run check` passes on every language | SC-004, FR-001, FR-007 |
| Lighthouse mobile on home, service, partner, brand, news, contact templates | SC-001 |
| Ten test leads (enquiry, kit, newsletter) arrive in inbox, CSV, GA4 and hub within 5 minutes | SC-006 |
| Reject in the consent banner: no analytics or ads cookie set, forms still work | FR-031 |
| Switch language on every page: the same page opens | US8 |
| Five-person 60-second test on the home | SC-005 |
