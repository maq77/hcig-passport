#!/usr/bin/env node
/**
 * Local preview of dist/. It mirrors Vercel's cleanUrls and directory-index
 * behaviour so /workflow and /medpark/website-v2 resolve here exactly as they
 * will in production.
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
  /* Without these two the preview served the stylesheet and the script as
     application/octet-stream, so the browser dropped them and every portal
     page rendered unstyled with no theme toggle and no search. */
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
};

if (!fs.existsSync(DIST)) {
  console.error('\n  dist/ not found. Run `npm run build` first.\n');
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
    // cleanUrls: /workflow -> /workflow.html
    if (!fs.existsSync(file) && fs.existsSync(file + '.html')) file += '.html';
    // directory index: /medpark -> /medpark/index.html
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
      const idx = path.join(file, 'index.html');
      if (fs.existsSync(idx)) file = idx;
    }

    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<h1>404</h1><p><a href="/">Back to index</a></p>');
      return;
    }

    const type = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
    const size = fs.statSync(file).size;
    const head = { 'Content-Type': type, 'X-Robots-Tag': 'noindex, nofollow' };

    /* Byte ranges. Without them Chrome will not start an mp4 at all: it asks
       for the first slice, gets the whole file with no length, and the hero
       film sits at readyState 0 forever. Vercel serves ranges in production,
       so only the local preview was ever affected. */
    const range = req.headers.range;
    if (range && /^bytes=\d*-\d*$/.test(range)) {
      const [rawStart, rawEnd] = range.replace('bytes=', '').split('-');
      const start = rawStart ? Number(rawStart) : 0;
      const end = rawEnd ? Math.min(Number(rawEnd), size - 1) : size - 1;

      if (start >= size || start > end) {
        res.writeHead(416, { 'Content-Range': `bytes */${size}` }).end();
        return;
      }
      head['Content-Range'] = `bytes ${start}-${end}/${size}`;
      head['Accept-Ranges'] = 'bytes';
      head['Content-Length'] = end - start + 1;
      res.writeHead(206, head);
      fs.createReadStream(file, { start, end }).pipe(res);
      return;
    }

    head['Accept-Ranges'] = 'bytes';
    head['Content-Length'] = size;
    if (req.method === 'HEAD') {
      res.writeHead(200, head).end();
      return;
    }
    res.writeHead(200, head);
    fs.createReadStream(file).pipe(res);
  })
  .listen(PORT, () => {
    console.log(`\n  HCIG Work local preview\n`);
    console.log(`  http://localhost:${PORT}/`);
    console.log(`  http://localhost:${PORT}/workflow`);
    console.log(`  http://localhost:${PORT}/medpark`);
    console.log(`  http://localhost:${PORT}/hcig/passport/ui-kit\n`);
    console.log('  Ctrl+C to stop\n');
  });
