#!/usr/bin/env node
/**
 * Pull stock photography from Pexels into `src/assets`.
 *
 *   node scripts/pexels.js search "doctor examining patient"        list matches
 *   node scripts/pexels.js get 7579824 px-consult 1400              download one
 *
 * The key lives in `.env.local`, which is gitignored. This repo is public, so a
 * key must never reach a committed file.
 *
 * Downloads land as `.jpg` and are converted to `.webp` by the caller (ffmpeg),
 * or kept as jpg if ffmpeg is absent. Every download appends a line to
 * `src/assets/CREDITS.md` naming the photographer and the Pexels page, because
 * a stock image with no traceable source is a liability the day someone asks.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const ASSETS = path.join(ROOT, 'src', 'assets');
const CREDITS = path.join(ASSETS, 'CREDITS.md');

function key() {
  const f = path.join(ROOT, '.env.local');
  if (!fs.existsSync(f)) {
    console.error('\n  No .env.local. Put PEXELS_API_KEY=... in it.\n');
    process.exit(1);
  }
  const m = fs.readFileSync(f, 'utf8').match(/PEXELS_API_KEY=(.+)/);
  if (!m) {
    console.error('\n  .env.local has no PEXELS_API_KEY line.\n');
    process.exit(1);
  }
  return m[1].trim();
}

function api(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { Authorization: key() } }, (res) => {
        let body = '';
        res.on('data', (d) => (body += d));
        res.on('end', () => {
          if (res.statusCode !== 200) return reject(new Error(`Pexels ${res.statusCode}: ${body.slice(0, 200)}`));
          resolve(JSON.parse(body));
        });
      })
      .on('error', reject);
  });
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          file.close();
          return download(res.headers.location, dest).then(resolve, reject);
        }
        if (res.statusCode !== 200) return reject(new Error(`download ${res.statusCode}`));
        res.pipe(file);
        file.on('finish', () => file.close(resolve));
      })
      .on('error', reject);
  });
}

function credit(line) {
  const head = '# Image credits\n\nStock photography used on HCIG pages, with its source.\n\n';
  if (!fs.existsSync(CREDITS)) fs.writeFileSync(CREDITS, head);
  fs.appendFileSync(CREDITS, line + '\n');
}

async function main() {
  const [cmd, ...rest] = process.argv.slice(2);

  if (cmd === 'search') {
    const q = rest.join(' ');
    const orientation = 'landscape';
    const data = await api(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&per_page=12&orientation=${orientation}`
    );
    console.log(`\n  "${q}"  ${data.total_results} results\n`);
    for (const p of data.photos) {
      console.log(`  ${String(p.id).padEnd(10)} ${String(p.width + 'x' + p.height).padEnd(12)} ${p.photographer.padEnd(22)} ${(p.alt || '').slice(0, 62)}`);
    }
    console.log('');
    return;
  }

  if (cmd === 'get') {
    const [id, name, width = '1400'] = rest;
    if (!id || !name) {
      console.error('\n  node scripts/pexels.js get <id> <name> [width]\n');
      process.exit(1);
    }
    const p = await api(`https://api.pexels.com/v1/photos/${id}`);
    const url = `${p.src.original}?auto=compress&cs=tinysrgb&w=${width}`;
    const jpg = path.join(ASSETS, `${name}.jpg`);
    await download(url, jpg);

    /* webp is roughly a third the weight at the same quality. */
    const webp = path.join(ASSETS, `${name}.webp`);
    const out = spawnSync('ffmpeg', ['-v', 'error', '-y', '-i', jpg, '-c:v', 'libwebp', '-quality', '82', webp]);
    if (out.status === 0) {
      fs.unlinkSync(jpg);
      console.log(`  ${name}.webp  ${(fs.statSync(webp).size / 1024).toFixed(0)} KB`);
    } else {
      console.log(`  ${name}.jpg  ${(fs.statSync(jpg).size / 1024).toFixed(0)} KB  (ffmpeg unavailable, kept as jpg)`);
    }

    credit(`- \`${name}\` . ${p.photographer} on Pexels . ${p.url} . ${(p.alt || '').replace(/\n/g, ' ')}`);
    return;
  }

  console.log(`
  node scripts/pexels.js search "doctor examining patient"
  node scripts/pexels.js get 7579824 px-consult 1400
`);
}

main().catch((e) => {
  console.error(`\n  ${e.message}\n`);
  process.exit(1);
});
