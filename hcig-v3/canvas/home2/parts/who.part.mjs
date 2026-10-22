// 3 · Who we are, cinematic (his direction 2026-10-22): a full photo tile with the statement large over it and the
// three pillars on a glass strip, then a white tile with mission and vision as two big lines (COPY.md).
export default ({ B, kit }) => {
  const k = "wh", { P, C, icon } = kit;
  const PILLARS = [
    ["On-site care", "Clinics inside hotels and resorts, with 24/7 cover in key travel destinations.", P("M4 20.5V8.2l8-4.7 8 4.7v12.3") + P("M2.8 20.5h18.4") + P("M12 9.8v5.6M9.2 12.6h5.6")],
    ["Hospital care", "Advanced treatment across our hospital network.", P("M3 18.5v-12M3 13.5h18v5M21 13.5v-2.2a3 3 0 0 0-3-3h-7.5v5.2") + C(6.6, 10.4, 1.7)],
    ["International coordination", "Direct work with insurers and assistance partners, across borders.", C(12, 12, 8.2) + P("M3.8 12h16.4M12 3.8c2.4 2.4 3.5 5.1 3.5 8.2s-1.1 5.8-3.5 8.2M12 3.8c-2.4 2.4-3.5 5.1-3.5 8.2s1.1 5.8 3.5 8.2")],
  ];
  const pillar = ([t, p, ic], i) => `<li class="wh-pil hov rv" style="--d:${300 + i * 140}">${icon(ic)}<div><h3 class="wh-t">${t}</h3><p class="wh-p">${p}</p></div></li>`;
  const css = `${kit.TOKENS(k)}
${kit.ICONS(k, 52)}
/* the photo tile */
.wh-hero{position:relative;min-height:940px;display:flex;align-items:flex-end;color:#FFFFFF;overflow:hidden;background:#000000}
.wh-hero .in-w{position:relative;z-index:1;width:100%;padding-top:160px;padding-bottom:56px;display:flex;flex-direction:column;gap:28px}
.wh-hero .eye{color:#12C0C6}
.wh-hero .h2{color:#FFFFFF;font-size:104px;max-width:12ch}
.wh-hero .lead{color:rgba(255,255,255,.86);max-width:40ch}
.wh-strip{list-style:none;margin:40px 0 0;padding:28px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:28px;border-radius:24px;background:rgba(0,0,0,.38);backdrop-filter:blur(18px) saturate(140%);-webkit-backdrop-filter:blur(18px) saturate(140%);box-shadow:inset 0 0 0 1px rgba(255,255,255,.14)}
.wh-pil{display:flex;gap:18px;align-items:flex-start;min-width:0}
.wh .wh-pil .ic{border-color:rgba(255,255,255,.28)}
.wh-t{margin:4px 0 6px;font-family:var(--serif);font-weight:600;font-synthesis:weight;font-size:26px;line-height:1.15;color:#FFFFFF}
.wh-p{margin:0;font-size:16px;line-height:1.55;color:rgba(255,255,255,.78)}
.wh.arm .tile-img img{transform:scale(1.08)}.wh.in .tile-img img{transform:none;transition:transform 2.4s var(--ease)}
/* mission and vision on white */
.wh-mv{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:clamp(40px,6cqi,112px)}
.wh-mv div{display:flex;flex-direction:column;gap:22px;padding-top:28px;border-top:1px solid var(--line);transition:border-color 1s var(--sweep-ease) 1s}
.wh-mv p.big{margin:0;font-family:var(--serif);font-weight:600;font-synthesis:weight;font-size:44px;line-height:1.12;letter-spacing:-.015em;text-wrap:balance}
@container wh (max-width:900px){
  .wh-hero{min-height:860px}
  .wh-hero .in-w{padding-top:120px;padding-bottom:28px;gap:20px}
  .wh-hero .h2{font-size:50px}
  .wh-strip{grid-template-columns:minmax(0,1fr);gap:22px;padding:22px;margin-top:20px}
  .wh-t{font-size:22px}
  .wh-p{font-size:15.5px}
  .wh-mv{grid-template-columns:minmax(0,1fr);gap:40px}
  .wh-mv p.big{font-size:30px}
}
@container wh (max-width:370px){.wh-hero .h2{font-size:44px}}
${kit.REVEAL(k)}`;
  const body = `<section class="wh {{cls}}" ref="{{rootRef}}" aria-labelledby="wh-h">
<div class="wh-hero">
<div class="tile-img"><img src="${B["svc1"]}" alt="An on-site clinic room inside a Red Sea resort at dusk"></div>
<div class="in-w">
<p class="eye rv">Who we are</p>
<h2 class="h2 rv" id="wh-h" style="--d:80">We don’t just provide healthcare. <span class="acc">We manage it.</span></h2>
<p class="lead rv" style="--d:160">HCIG brings urgent care, hospital treatment and international coordination into one model, so every patient journey has one owner, from first contact to full recovery.</p>
<ol class="wh-strip" aria-label="One model">${PILLARS.map(pillar).join("")}</ol>
</div>
</div>
<div class="in-w">
<div class="wh-mv">
<div class="rv"><p class="eye">Our mission</p><p class="big">To take full responsibility for the patient journey, with speed, clarity and <span class="acc">control.</span></p></div>
<div class="rv" style="--d:120"><p class="eye">Our vision</p><p class="big">Healthcare that is structured, predictable and part of travel, hospitality and <span class="acc">everyday life.</span></p></div>
</div>
</div>
</section>`;
  const vals = `    return { rootRef, cls: ${kit.CLS} };`;
  return { css, body, vals, h: 1560, ph: 1960 };
};
