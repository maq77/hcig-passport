# Contract: production build and upload to their server

Only after the user's separate yes. Nothing here runs during phases A to C.

## Build

`V3_TARGET=live npm run build` in `247clinic-v3/` exports with no basePath, index and
follow allowed, canonical on `https://www.247clinic.net`, into
`dist/247clinic-live/` (gitignored, never committed). `deploy/web.config` is copied in.

## web.config (static, no ASP.NET handler)

- `aspNetCore` handler removed; static file handler only.
- URL Rewrite: serve `/{path}` from `/{path}.html` when that file exists; strip a
  trailing slash with a 301; the redirect table from `urls.md`.
- `httpErrors`: 404 serves `/404.html` with status 404.
- MIME maps: `.webp`, `.avif`, `.woff2`, `.webm`, `.mp4`, `.json`, `.txt`, `.xml`,
  `.webmanifest`.
- Caching: `/_next/static/*` and `/media/*` one year immutable; HTML no-cache.
- Headers: `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, HSTS
  (Cloudflare also sets it), no `X-Powered-By` (as theirs already does).
- If the phase 0.5 probe finds no URL Rewrite module: research R3 fallback A or B.

## Upload

1. Backup: download `247clinic.net/wwwroot/` in full over FTP (account details in private HCIG memory, never here) to
   `~/backups/247clinic-{date}/`, and export the database backup already in
   `247clinic-src/db-backup/` for reference.
2. Upload the build into a fresh folder beside the app, `wwwroot/site-v3/`. FTP is not
   atomic, so nothing public points at it while it uploads. Test it on that hidden path.
3. Switch with one file: upload a new root `web.config` that rewrites every request into
   `site-v3/`. One small file is the whole cutover, and the old `web.config` back is the
   whole rollback. Without the URL Rewrite module: rename folders in the SolidCP file
   manager in a quiet hour instead.
4. Purge Cloudflare. Check the rendered head of 5 pages (robots, canonical, schema).
5. Submit the sitemap in Search Console. Watch rankings and 404s for 4 weeks.

## Rollback

Put the backed-up `web.config` and app files back, purge Cloudflare. Their app returns
as it was. The steps and timings go into `docs/247clinic-v3-golive.md` before the day.
