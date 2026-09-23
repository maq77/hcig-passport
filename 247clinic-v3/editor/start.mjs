import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const server = spawn('node', [join(__dirname, 'server.mjs')], { stdio: 'inherit' });
const next = spawn('npx', ['next', 'dev'], { stdio: 'inherit', shell: true, cwd: join(__dirname, '..') });

process.on('SIGINT', () => {
  server.kill();
  next.kill();
  process.exit();
});
