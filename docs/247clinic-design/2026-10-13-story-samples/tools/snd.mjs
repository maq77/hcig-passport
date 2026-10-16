import { chromium } from 'playwright-core';
import { readdirSync } from 'node:fs'; import { join } from 'node:path'; import os from 'node:os';
const r=join(os.homedir(),'AppData','Local','ms-playwright'); const d=readdirSync(r).filter(x=>/^chromium-\d+$/.test(x)).sort().reverse()[0];
const [page,w,h,...pts]=process.argv.slice(2);
const b=await chromium.launch({executablePath:join(r,d,'chrome-win64','chrome.exe'),args:['--autoplay-policy=no-user-gesture-required']});
const p=await b.newPage({viewport:{width:+w,height:+h}}); const errs=[];
p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{if(m.type()==='error'&&!/404/.test(m.text()))errs.push(m.text())});
await p.goto('http://127.0.0.1:8777/'+page,{waitUntil:'networkidle'}); await p.waitForTimeout(1500);
await p.click('[data-sound]');
await p.evaluate(()=>{const el=document.querySelector('[data-story]'); const {ctx,master}=el.__audio; const an=ctx.createAnalyser(); an.fftSize=2048; master.connect(an); el.__an=an;});
const lbl=await p.evaluate(()=>[document.querySelector('[data-sound]').getAttribute('aria-pressed'),document.querySelector('[data-sound]').textContent.trim()]);
console.log('button',JSON.stringify(lbl));
for (const t of pts){
  const res=await p.evaluate(async t=>{const el=document.querySelector('[data-story]'); el.__tl.p=+t-0.004; el.__tl.playing=true;
    const an=el.__an, buf=new Float32Array(an.fftSize); let peak=0, sum=0, n=0; const s=performance.now();
    while(performance.now()-s<3000){ await new Promise(r=>setTimeout(r,50)); an.getFloatTimeDomainData(buf); for(const v of buf){peak=Math.max(peak,Math.abs(v)); sum+=v*v; n++;} }
    return {p:+el.__tl.p.toFixed(3), peak:+peak.toFixed(3), rmsDb:+(10*Math.log10(sum/n+1e-12)).toFixed(1), score:el.__score()};},t);
  console.log(JSON.stringify(res));
}
await p.click('[data-sound]'); await p.waitForTimeout(1200);
console.log('after off', await p.evaluate(()=>{const el=document.querySelector('[data-story]'); const an=el.__an, buf=new Float32Array(an.fftSize); an.getFloatTimeDomainData(buf); return Math.max(...buf.map(Math.abs)).toFixed(4)}));
console.log('errors',JSON.stringify(errs.slice(0,6)));
await b.close();
