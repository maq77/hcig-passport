import { chromium } from 'playwright-core';
import { readdirSync } from 'node:fs'; import { join } from 'node:path'; import os from 'node:os';
const r=join(os.homedir(),'AppData','Local','ms-playwright'); const d=readdirSync(r).filter(x=>/^chromium-\d+$/.test(x)).sort().reverse()[0];
const [page,out,w,h,...pts]=process.argv.slice(2);
const b=await chromium.launch({executablePath:join(r,d,'chrome-win64','chrome.exe'),args:['--use-angle=d3d11','--enable-gpu','--ignore-gpu-blocklist']});
const p=await b.newPage({viewport:{width:+w,height:+h}}); const errs=[];
p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.goto('http://127.0.0.1:8777/'+page,{waitUntil:'networkidle'}); await p.waitForTimeout(3500);
for (const t of pts){ await p.evaluate(t=>{const el=document.querySelector('[data-story]'); el.__tl.p=+t; el.__tl.playing=false;},t); await p.waitForTimeout(1600); await p.screenshot({path:`${out}-${t}.jpg`,type:'jpeg',quality:80}); }
const fps=await p.evaluate(()=>new Promise(res=>{let n=0;const s=performance.now();const f=()=>{n++; if(performance.now()-s<2000) requestAnimationFrame(f); else res(n/2)};requestAnimationFrame(f)}));
console.log('errors',JSON.stringify(errs.slice(0,6)),'fps',fps, 'err-attr', await p.evaluate(()=>document.querySelector('[data-story]').getAttribute('data-story-error')));
await b.close();
