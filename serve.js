#!/usr/bin/env node
/**
 * Local preview of dist/ — mirrors Vercel's cleanUrls behaviour so
 * /business-case and /ui-kit resolve the same way they will in production.
 *
 *   npm run dev        (builds, then serves on http://localhost:4173)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const DIST = path.join(__dirname, 'dist');
const PORT = Number(process.env.PORT) || 4173;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
};

if (!fs.existsSync(DIST)) {
  console.error('\n  dist/ not found — run `npm run build` first.\n');
  process.exit(1);
}

http
  .createServer((req, res) => {
    let url = decodeURIComponent(req.url.split('?')[0]);
    if (url.endsWith('/')) url += 'index.html';

    let file = path.join(DIST, path.normalize(url).replace(/^([/\\])+/, ''));
    // guard against path traversal
    if (!file.startsWith(DIST)) {
      res.writeHead(403).end('forbidden');
      return;
    }
    // cleanUrls: /ui-kit -> /ui-kit.html
    if (!fs.existsSync(file) && fs.existsSync(file + '.html')) file += '.html';

    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<h1>404</h1><p><a href="/">Back to index</a></p>');
      return;
    }

    res.writeHead(200, {
      'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'X-Robots-Tag': 'noindex, nofollow',
    });
    fs.createReadStream(file).pipe(res);
  })
  .listen(PORT, () => {
    console.log(`\n  HCIG Passport — local preview\n`);
    console.log(`  http://localhost:${PORT}/`);
    console.log(`  http://localhost:${PORT}/business-case`);
    console.log(`  http://localhost:${PORT}/ui-kit\n`);
    console.log('  Ctrl+C to stop\n');
  });
