# Contract: live build, upload and rollback on GoDaddy cPanel

Recipe proven on tmasi.net (2026-10-16). Every step needs his word; nothing here runs automatically.

## Live build

`cd hcig-v3 && LIVE_OUT=build-<date> npm run build:live` with `HCIG_BASE_PATH=""`, `SITE_URL=https://healthcareig.com`,
`NEXT_PUBLIC_LEAD_ENDPOINT=/api/lead.php`, live tags on. Output: `hcig-live/build-<date>/` (gitignored, a fresh copy
each run). The preview build is untouched; rebuild it before the next `npm run sync`.

## `.htaccess` (in this order)

1. `DirectoryIndex index.html index.php` and `ErrorDocument 404 /404.html`.
2. `RewriteEngine On`, then the one-hop 301 rules from `urls.md`, then the `?lang=` rules.
3. Host traps: `RemoveHandler .pl`, `SetHandler default-handler` for `.txt`, `SetEnvIf Request_Method HEAD no-gzip`.
4. Cache: `/_next/static/` one year immutable; images and fonts 30 days; HTML and `.txt` no-cache.
5. Headers: `Strict-Transport-Security max-age=31536000`, `X-Content-Type-Options nosniff`,
   `Referrer-Policy strict-origin-when-cross-origin`, `Permissions-Policy camera=(), microphone=(), geolocation=()`,
   `X-Frame-Options SAMEORIGIN`; `X-Robots-Tag noindex` for `/kit/*.pdf`.
6. Deny dotfiles, backups, logs, `.ini` and `.csv` anywhere in `public_html`.

Old and new versions of the file are kept in `hcig-live/` (`htaccess.live`, `htaccess.new`), as on TMASI.

## Upload

1. Backup: `tar` of `public_html` to `~/backups/<step>-<date>.tgz`, plus a local mirror in `hcig-live/backup-<date>/`.
2. Stage: upload to `~/hcig-stage-<date>/` (outside the web root), changed files only (hash diff against the last
   build). One SFTP connection at a time; give the parent folder as the target of `put -r`.
3. Swap: move the replaced English PHP files to `~/old-site-<date>/` (kept, never deleted); move the staged files in;
   put `.htaccess` last. `/de/`, `i18n.js`, `css/`, `img/`, `fonts/`, `send.php` stay until wave two.
4. Rollback (`hcig-live/rollback.sftp`): put the old `.htaccess` back and move the old files back. Under 15 minutes.

## Verify (`hcig-live/verify.sh`)

- Every old address: 200 or one 301 to a 200.
- Rendered head of every template on the live host: no noindex, canonical correct, hreflang reciprocal, schema parses,
  `lang` right, title and description present.
- Lead endpoint health check and one real test lead seen in the inbox, the CSV, GA4 and the hub.
- Tags load only after consent.
- Then: sitemap submitted in Search Console and Bing, IndexNow sent, 14 days of daily checks.
