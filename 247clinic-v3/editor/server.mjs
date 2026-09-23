import { createServer } from 'http';
import { readFileSync, writeFileSync, appendFileSync, mkdirSync } from 'fs';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';
import { globSync } from 'fs'; // wait, node 20 has globSync? No, fs doesn't have globSync.
import { readdirSync, statSync } from 'fs';
import { spawn } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '../..'); // D:\hcig-wt\T-042
const V3 = join(ROOT, '247clinic-v3');
const CONTENT = join(ROOT, 'content/247clinic');

function getFiles() {
  const files = [];
  const enDir = join(CONTENT, 'en');
  if (statSync(enDir).isDirectory()) {
    readdirSync(enDir).forEach(f => {
      if (f.endsWith('.json')) files.push(join(enDir, f));
    });
  }
  ['reviews.json', 'approved-edits.json'].forEach(f => {
    files.push(join(CONTENT, f));
  });
  files.push(join(V3, 'src/content/brief.ts'));
  files.push(join(V3, 'src/content/ui-labels.json'));
  return files;
}

function logChange(what, file) {
  const d = new Date().toISOString();
  appendFileSync(join(__dirname, 'changes.log'), `${d} - ${what} - ${file}\n`);
}

function handleCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

const server = createServer(async (req, res) => {
  handleCors(res);
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  if (req.url === '/save/layout' && req.method === 'POST') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      const data = JSON.parse(body);
      const target = join(V3, 'src/content/home-layout.json');
      writeFileSync(target, JSON.stringify(data, null, 2));
      logChange('Updated home layout', 'src/content/home-layout.json');
      res.writeHead(200);
      res.end('OK');
    });
  } else if (req.url === '/save/css' && req.method === 'POST') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      const data = JSON.parse(body);
      const target = join(V3, `src/app/${data.file}`);
      writeFileSync(target, data.content);
      logChange(`Updated ${data.file}`, `src/app/${data.file}`);
      res.writeHead(200);
      res.end('OK');
    });
  } else if (req.url === '/save/append-css' && req.method === 'POST') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      const data = JSON.parse(body);
      const target = join(V3, `src/app/${data.file}`);
      appendFileSync(target, `\n${data.content}\n`);
      logChange(`Appended to ${data.file}`, `src/app/${data.file}`);
      res.writeHead(200);
      res.end('OK');
    });
  } else if (req.url === '/save/text' && req.method === 'POST') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      const data = JSON.parse(body);
      const { from, to, fileToReplace } = data;
      
      const files = getFiles();
      const matches = [];
      
      for (const f of files) {
        try {
          const content = readFileSync(f, 'utf8');
          if (content.includes(from)) {
            matches.push(f);
          }
        } catch(e) {}
      }

      if (matches.length > 1 && !fileToReplace) {
        res.writeHead(300, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ options: matches }));
        return;
      }

      const targetFile = fileToReplace || matches[0];
      if (targetFile) {
        let content = readFileSync(targetFile, 'utf8');
        content = content.replace(from, to);
        writeFileSync(targetFile, content);
        logChange(`Replaced text`, targetFile.replace(ROOT, ''));

        const editsPath = join(CONTENT, 'approved-edits.json');
        try {
          const editsContent = JSON.parse(readFileSync(editsPath, 'utf8'));
          editsContent.edits = editsContent.edits || [];
          editsContent.edits.push({ date: new Date().toISOString(), by: "the user (editor)", kind: "edit", from, to });
          writeFileSync(editsPath, JSON.stringify(editsContent, null, 2));
        } catch(e) {
          // If approved-edits.json has wrong format or missing, create basic struct
          writeFileSync(editsPath, JSON.stringify({edits: [{ date: new Date().toISOString(), by: "the user (editor)", kind: "edit", from, to }]}, null, 2));
        }

        res.writeHead(200);
        res.end('OK');
      } else {
        res.writeHead(404);
        res.end('String not found');
      }
    });
  } else if (req.url === '/save/image' && req.method === 'POST') {
     // We will receive slot name in header, and raw image bytes in body
     const slotName = req.headers['x-slot-name'];
     const chunks = [];
     req.on('data', c => chunks.push(c));
     req.on('end', async () => {
       const buf = Buffer.concat(chunks);
       // use sharp which is locally installed in 247clinic-v3
       // we can spawn a small node script or require sharp if we use dynamic import
       try {
         const sharp = (await import(join(V3, 'node_modules', 'sharp', 'lib', 'index.js'))).default;
         const outPath = join(V3, 'public/slots', `${slotName}.webp`);
         mkdirSync(dirname(outPath), { recursive: true });
         await sharp(buf).webp().toFile(outPath);
         logChange(`Uploaded image ${slotName}`, `public/slots/${slotName}.webp`);
         res.writeHead(200);
         res.end('OK');
       } catch(e) {
         console.error(e);
         res.writeHead(500);
         res.end(e.toString());
       }
     });
  } else if (req.url === '/changes' && req.method === 'GET') {
     try {
       const log = readFileSync(join(__dirname, 'changes.log'), 'utf8');
       res.writeHead(200);
       res.end(log);
     } catch(e) {
       res.writeHead(200);
       res.end('');
     }
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(3100, '127.0.0.1', () => {
  console.log('Save server on http://127.0.0.1:3100');
});
