# Preview contract: v6 on HCIG Work

| Item | Rule |
|---|---|
| Address | `/tmasi/v6` on HCIG Work (https://hcig-passport.vercel.app/tmasi/v6) |
| Search | every page `noindex, nofollow` while basePath is set, as v3 |
| v3 | `/tmasi/v3` and `tmasi-next/` are never edited by v6 work |
| Flow | edit `tmasi-v6/`, `npm run build`, `npm run sync` (to `src/tmasi-v6`), root `npm test`, commit named paths only |
| Push | only on his explicit yes (push gate 2026-09-29). Never `npm run publish` (it stages everything) |
| Registry | TMASI on HCIG Work gets a "Website v6" project; v4 marked closed. Updated locally, pushed with the first approved push |
| Links | menu, footer and every link inside v6 stay inside `/tmasi/v6` once that page exists in v6 |
| Go-live | basePath "", pages indexable, redirects and backups as in spec 008, only on his yes and Irina's approval |
