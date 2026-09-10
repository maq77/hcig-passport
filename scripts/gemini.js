#!/usr/bin/env node
/**
 * Generate and edit images with the Gemini API.
 *
 *   node scripts/gemini.js models
 *   node scripts/gemini.js gen "<prompt>" <name> [--model lite|flash|pro] [--ar 16:9] [--size 1K]
 *   node scripts/gemini.js edit <source> "<prompt>" <name> [--model ...] [--ar ...]
 *   node scripts/gemini.js cost
 *
 * The key lives in `.env.local`, which is gitignored. This repo is public, so a
 * key must never reach a committed file.
 *
 * Every generation appends a line to `src/assets/AI-IMAGES.md` recording the
 * model, the prompt, the date and the price. Two reasons. An AI image with no
 * record of how it was made is a liability the day a client asks. And it is the
 * only way to know what this is costing without opening a billing console.
 *
 * A note on what this must not be used for is in docs/ai-images-guide.md. The
 * short version: never generate something that would be read as a photograph of
 * a real 24/7 Clinic, a real MedPark building, real staff, or a real patient.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const ASSETS = path.join(ROOT, 'src', 'assets');
const LOG = path.join(ASSETS, 'AI-IMAGES.md');

/* Priced from ai.google.dev/gemini-api/docs/pricing, read 2026-09-10. Per
   image, US dollars. Checked with `node scripts/gemini.js cost`. */
const MODELS = {
  lite: { id: 'gemini-3.1-flash-lite-image', price: { '1K': 0.0336 }, note: 'cheapest. icons, textures, simple flat art' },
  flash: { id: 'gemini-3.1-flash-image', price: { '512px': 0.045, '1K': 0.067, '2K': 0.101, '4K': 0.151 }, note: 'the workhorse. heroes, banners, illustration' },
  pro: { id: 'gemini-3-pro-image', price: { '1K': 0.134, '2K': 0.134, '4K': 0.24 }, note: 'best text rendering and composition. use sparingly' },
};

function key() {
  const f = path.join(ROOT, '.env.local');
  if (!fs.existsSync(f)) fail('No .env.local. Put GEMINI_API_KEY=... in it.');
  const m = fs.readFileSync(f, 'utf8').match(/^GEMINI_API_KEY=(.+)$/m);
  if (!m) fail('No GEMINI_API_KEY in .env.local.');
  return m[1].trim();
}

function fail(msg) {
  console.error('\n  ' + msg + '\n');
  process.exit(1);
}

function post(model, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request(
      {
        host: 'generativelanguage.googleapis.com',
        path: `/v1beta/models/${model}:generateContent`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data), 'X-goog-api-key': key() },
      },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          let json;
          try {
            json = JSON.parse(Buffer.concat(chunks).toString());
          } catch (e) {
            return reject(new Error('Unreadable reply: ' + Buffer.concat(chunks).toString().slice(0, 200)));
          }
          if (json.error) {
            const e = json.error;
            if (e.code === 429 && /credit/i.test(e.message || '')) {
              return reject(new Error('Out of credits. Top up at https://ai.studio/projects, then run this again.'));
            }
            return reject(new Error(`${e.code} ${e.status}: ${e.message}`));
          }
          resolve(json);
        });
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

/* Saved as it comes back, then converted to webp only if ffmpeg is here. The
   original is kept either way, because he has asked more than once that nothing
   be re-encoded behind his back. */
function save(buf, mime, name) {
  fs.mkdirSync(ASSETS, { recursive: true });
  const ext = mime.includes('png') ? 'png' : 'jpg';
  const raw = path.join(ASSETS, `${name}.${ext}`);
  fs.writeFileSync(raw, buf);

  const webp = path.join(ASSETS, `${name}.webp`);
  const ff = spawnSync('ffmpeg', ['-y', '-i', raw, '-quality', '92', webp], { encoding: 'utf8' });
  if (ff.status === 0 && fs.existsSync(webp)) {
    console.log(`  ${name}.${ext}   ${Math.round(buf.length / 1024)} KB   (original kept)`);
    console.log(`  ${name}.webp   ${Math.round(fs.statSync(webp).size / 1024)} KB`);
    return [raw, webp];
  }
  console.log(`  ${name}.${ext}   ${Math.round(buf.length / 1024)} KB`);
  return [raw];
}

function logIt({ name, model, size, ar, prompt, price, source }) {
  if (!fs.existsSync(LOG)) {
    fs.writeFileSync(
      LOG,
      '# Images made with Gemini\n\n' +
        'Every AI generated image on any HCIG surface, with the prompt that made\n' +
        'it and what it cost. Nothing here is a photograph of a real place, a real\n' +
        'member of staff or a real patient. See docs/ai-images-guide.md.\n\n'
    );
  }
  const when = new Date().toISOString().slice(0, 10);
  fs.appendFileSync(
    LOG,
    `## ${name}\n` +
      `- ${when}, \`${model}\`, ${size}, ${ar}, $${price.toFixed(4)}\n` +
      (source ? `- edited from \`${source}\`\n` : '') +
      `- prompt: ${prompt.replace(/\n/g, ' ')}\n\n`
  );
}

function flags(argv) {
  const f = { model: 'flash', ar: '16:9', size: '2K' };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--model') f.model = argv[i + 1];
    if (argv[i] === '--ar') f.ar = argv[i + 1];
    if (argv[i] === '--size') f.size = argv[i + 1];
  }
  if (!MODELS[f.model]) fail(`Unknown model "${f.model}". One of: ${Object.keys(MODELS).join(', ')}`);
  return f;
}

function priceOf(modelKey, size) {
  const table = MODELS[modelKey].price;
  return table[size] || Object.values(table).slice(-1)[0];
}

function pickImage(json) {
  for (const c of json.candidates || []) {
    for (const p of c.content?.parts || []) {
      if (p.inlineData) return { buf: Buffer.from(p.inlineData.data, 'base64'), mime: p.inlineData.mimeType };
    }
  }
  const text = json.candidates?.[0]?.content?.parts?.find((p) => p.text)?.text;
  fail('No image came back.' + (text ? ' The model said: ' + text.slice(0, 300) : ''));
}

async function gen(prompt, name, f) {
  const m = MODELS[f.model];
  console.log(`\n  ${m.id}  ${f.size}  ${f.ar}  ~$${priceOf(f.model, f.size).toFixed(4)}\n`);
  const json = await post(m.id, {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: f.ar, imageSize: f.size } },
  });
  const { buf, mime } = pickImage(json);
  save(buf, mime, name);
  logIt({ name, model: m.id, size: f.size, ar: f.ar, prompt, price: priceOf(f.model, f.size) });
  console.log('');
}

async function edit(source, prompt, name, f) {
  const src = path.isAbsolute(source) ? source : path.join(ROOT, source);
  if (!fs.existsSync(src)) fail('No such file: ' + source);
  const mime = src.endsWith('.png') ? 'image/png' : src.endsWith('.webp') ? 'image/webp' : 'image/jpeg';
  const m = MODELS[f.model];
  console.log(`\n  ${m.id}  editing ${path.basename(src)}  ~$${priceOf(f.model, f.size).toFixed(4)}\n`);
  const json = await post(m.id, {
    contents: [
      { parts: [{ text: prompt }, { inline_data: { mime_type: mime, data: fs.readFileSync(src).toString('base64') } }] },
    ],
    generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: f.ar, imageSize: f.size } },
  });
  const out = pickImage(json);
  save(out.buf, out.mime, name);
  logIt({ name, model: m.id, size: f.size, ar: f.ar, prompt, price: priceOf(f.model, f.size), source });
  console.log('');
}

function cost() {
  console.log('\n  Per image, US dollars. From ai.google.dev/gemini-api/docs/pricing.\n');
  for (const [k, m] of Object.entries(MODELS)) {
    const sizes = Object.entries(m.price).map(([s, p]) => `${s} $${p}`).join('   ');
    console.log(`  ${k.padEnd(6)} ${m.id.padEnd(30)} ${sizes}`);
    console.log(`         ${m.note}\n`);
  }
  if (fs.existsSync(LOG)) {
    const spent = [...fs.readFileSync(LOG, 'utf8').matchAll(/\$([0-9.]+)$/gm)].reduce((a, x) => a + Number(x[1]), 0);
    const n = (fs.readFileSync(LOG, 'utf8').match(/^## /gm) || []).length;
    console.log(`  So far: ${n} images, $${spent.toFixed(2)}.\n`);
  } else {
    console.log('  Nothing generated yet.\n');
  }
}

async function models() {
  const list = await new Promise((resolve, reject) => {
    https
      .get(
        { host: 'generativelanguage.googleapis.com', path: '/v1beta/models', headers: { 'X-goog-api-key': key() } },
        (res) => {
          const c = [];
          res.on('data', (x) => c.push(x));
          res.on('end', () => resolve(JSON.parse(Buffer.concat(c).toString())));
        }
      )
      .on('error', reject);
  });
  console.log('');
  for (const m of list.models || []) {
    const n = m.name.replace('models/', '');
    if (/image|imagen|banana/.test(n)) console.log('  ' + n);
  }
  console.log('');
}

(async () => {
  const [cmd, ...rest] = process.argv.slice(2);
  const f = flags(rest);
  try {
    if (cmd === 'gen') {
      const [prompt, name] = rest;
      if (!prompt || !name) fail('node scripts/gemini.js gen "<prompt>" <name> [--model lite|flash|pro] [--ar 16:9] [--size 2K]');
      await gen(prompt, name, f);
    } else if (cmd === 'edit') {
      const [source, prompt, name] = rest;
      if (!source || !prompt || !name) fail('node scripts/gemini.js edit <source> "<prompt>" <name>');
      await edit(source, prompt, name, f);
    } else if (cmd === 'cost') {
      cost();
    } else if (cmd === 'models') {
      await models();
    } else {
      console.log(`
  node scripts/gemini.js models
  node scripts/gemini.js gen "<prompt>" <name> [--model lite|flash|pro] [--ar 16:9] [--size 1K|2K|4K]
  node scripts/gemini.js edit <source> "<prompt>" <name>
  node scripts/gemini.js cost
`);
    }
  } catch (e) {
    fail(e.message);
  }
})();
