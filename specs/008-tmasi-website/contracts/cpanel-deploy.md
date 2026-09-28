# Contract: cPanel & Apache Deployment Protocol

Establishes operational and deployment standards for publishing TMASI Global to GoDaddy cPanel hosting.

## 1. Environment Details

- Server Environment: Apache 2.4 on Linux, GoDaddy Shared Hosting.
- Runtime: PHP 8.1 FPM.
- Web Root: `/home/psm7qdsxi5d9/public_html/`.
- Access Protocols: SSH (Port 22, Key-based authentication), SFTP.
- Staging Preview: HCIG Work portal (`https://hcig-passport.vercel.app/tmasi/v3`).
- Production Preview Gate: `https://tmasi.net/?preview=2` (Cookie or query parameter gate serving redesigned layout exclusively to authorized reviewers).

## 2. Backup Requirement

Before any deployment modifying production files:
1. Generate an archival tarball of the current target directory on the remote host:
   ```bash
   tar -czf ~/backups/pre-deploy-$(date +%Y%m%d%H%M%S).tar.gz /home/psm7qdsxi5d9/public_html
   ```
2. Download an archive copy to local `tmasi-live/backup-<date>/`.
3. Log deployment intent and timestamp in `docs/tmasi-worklog.md`.

## 3. Apache Configuration (`.htaccess`) Standards

Production `.htaccess` must enforce:
- HTTP to HTTPS redirection (301).
- Non-WWW canonicalization (301).
- MIME types for modern formats (`image/webp`, `image/avif`, `font/woff2`).
- Browser caching directives:
  - Static images and fonts: `max-age=31536000, immutable`.
  - CSS and JavaScript: `max-age=604800, stale-while-revalidate=86400`.
  - HTML and PHP documents: `max-age=0, must-revalidate`.
- Security headers:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: SAMEORIGIN`
  - `Referrer-Policy: strict-origin-when-cross-origin`

## 4. Rollback Protocol

If visual defects, broken links, or tracking regressions appear:
1. Re-extract the pre-deploy backup immediately:
   ```bash
   tar -xzf ~/backups/pre-deploy-<timestamp>.tar.gz -C /
   ```
2. Verify HTTP response code 200 across all 25 canonical sitemap URLs.
3. Update `TASK_BOARD.md` and log rollback in `docs/tmasi-worklog.md`.
