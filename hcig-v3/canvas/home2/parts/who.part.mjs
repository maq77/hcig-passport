// 3 · Who we are: the statement, the model as three pillars on one line, mission and vision in one line each (COPY.md).
// Signature: the line that joins the pillars draws in, then a small light keeps travelling along it: one model, alive.
export default ({ B, kit }) => {
  const k = "wh", { P, C, icon } = kit;
  const PILLARS = [
    ["On-site care", "Clinics inside hotels and resorts, with 24/7 cover in key travel destinations.", P("M4 20.5V8.2l8-4.7 8 4.7v12.3") + P("M2.8 20.5h18.4") + P("M12 9.8v5.6M9.2 12.6h5.6")],
    ["Hospital care", "Advanced treatment across our hospital network.", P("M3 18.5v-12M3 13.5h18v5M21 13.5v-2.2a3 3 0 0 0-3-3h-7.5v5.2") + C(6.6, 10.4, 1.7)],
    ["International coordination", "Direct work with insurers and assistance partners, across borders.", C(12, 12, 8.2) + P("M3.8 12h16.4M12 3.8c2.4 2.4 3.5 5.1 3.5 8.2s-1.1 5.8-3.5 8.2M12 3.8c-2.4 2.4-3.5 5.1-3.5 8.2s1.1 5.8 3.5 8.2")],
  ];
  const pillar = ([t, p, ic], i) => `<li class="wh-pil hov rv" style="--d:${200 + i * 160}">${icon(ic)}<h3 class="wh-t">${t}</h3><p class="wh-p">${p}</p></li>`;
  const css = `${kit.TOKENS(k)}
${kit.ICONS(k, 64)}
.wh-top{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);gap:clamp(40px,6cqi,96px);align-items:center}
.wh-copy{display:flex;flex-direction:column;gap:22px}
.wh-copy .h2{font-size:68px}
.wh-media{margin:0;position:relative;aspect-ratio:4/3;border-radius:26px;overflow:hidden;box-shadow:0 0 0 1px var(--line),0 50px 120px -60px rgba(18,192,198,.5);transition:box-shadow 1.3s var(--sweep-ease) .9s,clip-path 1.5s var(--ease)}
.wh-media img{position:absolute;inset:-4% 0;width:100%;height:108%;object-fit:cover;object-position:50% 62%}
.wh.arm .wh-media{clip-path:inset(0 0 0 18% round 26px)}.wh.in .wh-media{clip-path:inset(0 0 0 0 round 26px)}
@supports (animation-timeline:view()){.wh-media img{animation:whPar linear both;animation-timeline:view();animation-range:cover}@keyframes whPar{from{transform:translateY(-3%)}to{transform:translateY(3%)}}}
/* the model: three pillars on one line */
.wh-model{position:relative;margin-top:104px}
.wh-line{position:absolute;left:32px;right:32px;top:32px;height:1px;background:var(--line);transition:background-color 1s var(--sweep-ease) 1s}
.wh-line:before{content:"";position:absolute;inset:0;background:var(--accent);transform-origin:left}
.wh.arm .wh-line:before{transform:scaleX(0)}.wh.in .wh-line:before{transform:scaleX(1);transition:transform 1.8s var(--ease) .2s}
.wh-line i{position:absolute;top:-3px;left:0;width:7px;height:7px;border-radius:50%;background:var(--accent);box-shadow:0 0 0 5px rgba(18,192,198,.18),0 0 18px 2px rgba(18,192,198,.7);animation:whRun 5.5s cubic-bezier(.45,.05,.35,1) 2.2s infinite}
@keyframes whRun{0%{left:0;opacity:0}8%{opacity:1}92%{opacity:1}100%{left:calc(100% - 7px);opacity:0}}
.wh-pils{position:relative;list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:32px}
.wh-pil{display:flex;flex-direction:column;gap:14px;min-width:0}
.wh-pil .ic{background:var(--paper);transition:border-color .45s var(--ease),background-color 1.3s var(--sweep-ease) .9s}
.wh-t{margin:14px 0 0;font-family:var(--serif);font-weight:600;font-synthesis:weight;font-size:30px;line-height:1.15}
.wh-p{margin:0;font-size:17px;line-height:1.6;color:var(--ink2);max-width:34ch;transition:color 1s var(--sweep-ease) 1s}
/* mission and vision, one line each */
.wh-mv{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:clamp(32px,5cqi,80px);margin-top:104px;padding-top:44px;border-top:1px solid var(--line);transition:border-color 1s var(--sweep-ease) 1s}
.wh-mv div{display:flex;flex-direction:column;gap:14px}
.wh-mv p{margin:0;font-family:var(--serif);font-weight:600;font-synthesis:weight;font-size:30px;line-height:1.25;text-wrap:pretty}
/* phone first: the line runs down beside the pillars */
@container wh (max-width:900px){
  .wh-top{grid-template-columns:minmax(0,1fr);gap:28px}
  .wh-copy .h2{font-size:38px}
  .wh-media{aspect-ratio:16/11}
  .wh-model{margin-top:56px}
  .wh-line{left:27px;right:auto;top:28px;bottom:28px;width:1px;height:auto}
  .wh-line:before{transform-origin:top}
  .wh.arm .wh-line:before{transform:scaleY(0)}.wh.in .wh-line:before{transform:scaleY(1)}
  .wh-line i{left:-3px;top:0;animation-name:whRunY}
  @keyframes whRunY{0%{top:0;opacity:0}8%{opacity:1}92%{opacity:1}100%{top:calc(100% - 7px);opacity:0}}
  .wh-pils{grid-template-columns:minmax(0,1fr);gap:30px}
  .wh-pil{display:grid;grid-template-columns:56px minmax(0,1fr);column-gap:18px;row-gap:6px}
  .wh-pil .ic{grid-row:span 2;width:56px;height:56px}.wh-pil .ic svg{width:28px;height:28px}
  .wh-t{margin:6px 0 0;font-size:23px}
  .wh-p{font-size:16px}
  .wh-mv{grid-template-columns:minmax(0,1fr);margin-top:56px;padding-top:30px;gap:28px}
  .wh-mv p{font-size:23px}
}
${kit.REVEAL(k)}
@media (prefers-reduced-motion:reduce){.wh-line:before{transform:none!important}.wh-line i{display:none}.wh-media{clip-path:none!important}.wh-media img{animation:none!important}}`;
  const body = `<section class="wh {{cls}}" ref="{{rootRef}}" aria-labelledby="wh-h"><div class="in-w">
<div class="wh-top">
<div class="wh-copy">
<p class="eye rv">Who we are</p>
<h2 class="h2 rv" id="wh-h" style="--d:80">We don’t just provide healthcare. <span class="acc">We manage it.</span></h2>
<p class="lead rv" style="--d:160">HCIG brings urgent care, hospital treatment and international coordination into one model, so every patient journey has one owner, from first contact to full recovery.</p>
</div>
<figure class="wh-media rv" style="--d:120"><img src="${B["about2"]}" alt="A calm hospital corridor opening onto the sea"></figure>
</div>
<div class="wh-model">
<div class="wh-line" aria-hidden="true"><i></i></div>
<ol class="wh-pils" aria-label="One model">${PILLARS.map(pillar).join("")}</ol>
</div>
<div class="wh-mv">
<div class="rv"><p class="eye">Our mission</p><p>To take full responsibility for the patient journey, with speed, clarity and control.</p></div>
<div class="rv" style="--d:120"><p class="eye">Our vision</p><p>Healthcare that is structured, predictable and part of travel, hospitality and everyday life.</p></div>
</div>
</div></section>`;
  const vals = `    return { rootRef, cls: ${kit.CLS} };`;
  return { css, body, vals, h: 1240, ph: 1480 };
};
