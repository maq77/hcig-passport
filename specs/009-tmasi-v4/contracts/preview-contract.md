# Preview contract: where v4 lives and what it links to

| Item | Value |
|---|---|
| Preview URL | https://hcig-passport.vercel.app/tmasi/v4 |
| App | `tmasi-v4/` (Next.js static export, basePath `/tmasi/v4`, trailing slash) |
| Served copy | `src/tmasi-v4/` via `npm run sync`; `build.js` copies it to `out/tmasi/v4` |
| Search | every page `noindex, nofollow`; no sitemap entry; robots disallows the path |
| v3 | `/tmasi/v3` and `tmasi-next/` are never edited by v4 work |
| Registry | TMASI, project "Website v4 home", status follows the stages |
| Push | only on his explicit yes (push gate 2026-09-29); commits by named path |

## Links out of the home

| Link | Opens |
|---|---|
| Menu: About Us, Services, Contact, Blog | `/tmasi/v3/about/`, `/tmasi/v3/services/`, `/tmasi/v3/contacts/`, `/tmasi/v3/blog/` [verified 2026-10-01 in `src/tmasi-v3`] |
| Language switch DE, PL, ES | `/tmasi/v3/de/`, `/tmasi/v3/pl/`, `/tmasi/v3/es/` |
| Service "View Details" | `/tmasi/v3/services/<medical-assistance, elite-medical-concierge, travel-assistance, medical-tourism, insurance-assistance>/`; Additional Services has no page and opens `/tmasi/v3/services/` |
| Office cards | `/tmasi/v3/contacts/` (v3 has no page per office) |
| News cards, "View All News", partner logos | `/tmasi/v3/blog/<post>/` and `/tmasi/v3/blog/`. Logos: EHA `egypt-healthcare-authority-agreement-africa-health-excon-2025`, Hansa Medica `hansa-medica-group-partnership-grand-egyptian-museum`, ITIC `itic-global-2026-istanbul-official-sponsor`, Uniglobal `uniglobal-global-insurance-conference-barcelona` |
| CALL THE TEAM | https://wa.me/201206788566 |
| Request A Quote | the quote form on the page (posts to https://tmasi.net/send.php with no-cors, as v3) |
| Social | the live Facebook, Instagram and LinkedIn links (from v3 `SocialLinks.tsx`) |
| Powered by PULSE Marketing | https://pulsemarketing.global/ |
