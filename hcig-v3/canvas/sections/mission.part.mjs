// 5 · Our mission / Our vision: "two promises". The live photo stays put on the left while the promises pass on the right.
// Every word is the live text (src/hcig-live/index.html, section-mission); the button is the live "Talk to our team".
export const mission = ({ B, TOKENS, REVEAL }) => {
  const css = `${TOKENS("mv", "mv")}
.mv-in{max-width:1440px;margin:0 auto;padding:128px var(--gutter) 128px;display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:clamp(40px,6cqi,104px);align-items:start}
.mv-media{margin:0;position:sticky;top:24px}
.mv-frame{position:relative;aspect-ratio:4/5;border-radius:26px;overflow:hidden;box-shadow:0 0 0 1px #333333,0 50px 120px -50px rgba(18,192,198,.5);transition:box-shadow 1.3s var(--sweep-ease) .9s,clip-path 1.5s var(--ease)}
.mv.light .mv-frame{box-shadow:0 0 0 1px #DDDDDF,0 40px 90px -60px rgba(0,0,0,.35)}
.mv-par{position:absolute;inset:-6% 0}
.mv-par img{display:block;width:100%;height:100%;object-fit:cover;object-position:52% 50%;transition:transform 1.8s var(--ease)}
.mv.arm .mv-frame{clip-path:inset(0 0 14% 0 round 26px)}.mv.in .mv-frame{clip-path:inset(0 0 0 0 round 26px)}
.mv.arm .mv-par img{transform:scale(1.1)}.mv.in .mv-par img{transform:none}
@supports (animation-timeline:view()){.mv-par{animation:mvPar linear both;animation-timeline:view();animation-range:cover}@keyframes mvPar{from{transform:translateY(-5%)}to{transform:translateY(5%)}}}
.mv-copy{display:flex;flex-direction:column;gap:0;min-width:0}
.mv-h{margin:0 0 28px;font-family:var(--serif);font-weight:600;font-synthesis:weight;font-size:60px;line-height:1.02;letter-spacing:-.015em}
.mv-h .acc{color:var(--accent)}
/* the mission: three promises, each under a line that draws */
.mv-list{list-style:none;margin:0;padding:0;display:grid}
.mv-list li{position:relative;padding:26px 0 26px 0;border-top:1px solid var(--line);font-size:20px;line-height:1.55;color:var(--ink);text-wrap:pretty;transition:border-color 1s var(--sweep-ease) 1s,color 1s var(--sweep-ease) 1s}
.mv-list li:last-child{border-bottom:1px solid var(--line)}
.mv-list li:before{content:"";position:absolute;left:0;top:-1px;width:72px;height:1px;background:var(--accent);transform-origin:left}
.mv.arm .mv-list li:before{transform:scaleX(0)}.mv.in .mv-list li:before{transform:scaleX(1);transition:transform 1s var(--ease) calc(var(--d) * 1ms + 250ms)}
/* the vision: its first sentence as the large line */
.mv-vision{margin-top:88px}
.mv-big{margin:0 0 22px;font-family:var(--serif);font-weight:600;font-synthesis:weight;font-size:38px;line-height:1.22;letter-spacing:-.005em;text-wrap:pretty}
.mv-p{margin:0;font-size:18px;line-height:1.7;color:var(--ink2);max-width:60ch;text-wrap:pretty;transition:color 1s var(--sweep-ease) 1s}
.mv-cta{margin-top:44px}
.btn{white-space:nowrap;display:inline-flex;align-items:center;gap:12px;min-height:56px;padding:0 30px;border-radius:999px;background:var(--accent);color:#000000;font:600 15px/1 var(--sans);text-decoration:none;border:1px solid var(--accent);position:relative;overflow:hidden;transition:transform .25s var(--ease),box-shadow .35s}
.btn:after{content:"";position:absolute;inset:0;background:linear-gradient(110deg,transparent 30%,rgba(255,255,255,.55) 50%,transparent 70%);transform:translateX(-120%);transition:transform .9s var(--ease)}
.btn:hover{transform:translateY(-1px);box-shadow:0 16px 36px -14px rgba(18,192,198,.8)}.btn:hover:after{transform:translateX(120%)}
.btn:focus-visible{outline:2px solid var(--accent);outline-offset:3px}
.btn svg{flex:none}
/* phone first: the photo as a band on top, then the promises, the button full width */
@container mv (max-width:900px){
  .mv-in{grid-template-columns:minmax(0,1fr);padding:0 0 72px;gap:0}
  .mv-media{position:static}
  .mv-frame{aspect-ratio:16/11;border-radius:0;box-shadow:none}
  .mv.light .mv-frame{box-shadow:none}
  .mv.arm .mv-frame{clip-path:inset(0 0 14% 0)}.mv.in .mv-frame{clip-path:inset(0)}
  .mv-copy{padding:44px var(--gutter) 0}
  .mv-h{font-size:38px;margin-bottom:18px}
  .mv-list li{font-size:17px;padding:20px 0}
  .mv-vision{margin-top:56px}
  .mv-big{font-size:26px}
  .mv-p{font-size:16px}
  .mv-cta{margin-top:34px}
  .btn{width:100%;justify-content:center;min-height:54px}
}
@container mv (max-width:370px){.mv-h{font-size:34px}.mv-big{font-size:24px}}
${REVEAL("mv")}
@media (prefers-reduced-motion:reduce){.mv-frame{clip-path:none!important}.mv-par{animation:none!important}.mv-list li:before{transform:scaleX(1)!important}}`;
  const arrow = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13.5 6.5L19 12l-5.5 5.5"/></svg>';
  const body = `<section class="mv {{cls}}" ref="{{rootRef}}" aria-label="Our mission and our vision"><div class="mv-in">
<figure class="mv-media rv"><div class="mv-frame"><div class="mv-par"><img src="${B["missio"]}" alt="HCIG medical tourism in Egypt"></div></div></figure>
<div class="mv-copy">
<h2 class="mv-h rv">Our <span class="acc">mission</span></h2>
<ul class="mv-list">
<li class="rv" style="--d:100">To build and scale a healthcare ecosystem that redefines how patient care is accessed, managed, and delivered across international markets.</li>
<li class="rv" style="--d:220">To take full responsibility for the patient journey ensuring speed, clarity, and control from the first point of contact to resolution.</li>
<li class="rv" style="--d:340">To lead the transformation of healthcare by working with insurers, providers, and global partners to eliminate fragmentation and establish a more efficient, transparent, and globally connected model of care.</li>
</ul>
<div class="mv-vision">
<h2 class="mv-h rv">Our <span class="acc">vision</span></h2>
<p class="mv-big rv" style="--d:100">To define the future of global healthcare by setting a new standard for how medical services are delivered across borders.</p>
<p class="mv-p rv" style="--d:200">We envision a world where healthcare is no longer fragmented or reactive, but structured, predictable, and seamlessly embedded into global travel, hospitality, and everyday life.</p>
</div>
<div class="mv-cta rv" style="--d:120"><a href="mailto:partner@healthcareig.com" class="btn">Talk to our team${arrow}</a></div>
</div>
</div></section>`;
  const vals = `    return { rootRef, cls: theme + (s.arm ? ' arm' : '') + (s.inv ? ' in' : '') };`;
  return { css, body, vals };
};
