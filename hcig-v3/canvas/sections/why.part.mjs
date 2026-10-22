// 6 · Why partners choose HCIG: "seven reasons, one system", a bento of seven cards.
// Every word is the live text (src/hcig-live/index.html, section-why). Our own hairline icons, drawn in on reveal and
// redrawn on hover (his rule 2026-10-22: live icons optional, make better ones). Three cards carry a Gemini image.
export const why = ({ B, TOKENS, REVEAL }) => {
  const P = (d) => `<path d="${d}" pathLength="1"/>`;
  const C = (cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r}" pathLength="1"/>`;
  const ICON = {
    own: P("M12 3l7 3v5.5c0 4.4-3 8-7 9.5-4-1.5-7-5.1-7-9.5V6l7-3z") + P("M8.8 12.2l2.2 2.2 4.4-4.6"),
    net: C(12, 12, 2.4) + C(5, 5.5, 1.8) + C(19, 5.5, 1.8) + C(5, 18.5, 1.8) + C(19, 18.5, 1.8) + P("M10.3 10.3L6.3 6.8M13.7 10.3l4-3.5M10.3 13.7l-4 3.5M13.7 13.7l4 3.5M6.8 5.5h10.4M6.8 18.5h10.4"),
    speed: C(12, 13.5, 7.5) + P("M10 3h4M12 3v3M12 13.5l3.6-3.2M19.4 6.4l1.4-1.4"),
    std: C(11, 11, 7.5) + P("M3.5 11h15M11 3.5c2.2 2.3 3.2 4.8 3.2 7.5s-1 5.2-3.2 7.5M11 3.5C8.8 5.8 7.8 8.3 7.8 11s1 5.2 3.2 7.5") + C(18.5, 18.5, 3.2) + P("M17.1 18.6l1 1 1.9-2"),
    host: P("M3.5 18h17M5 18a7 7 0 0 1 14 0M12 9.2V11M10.6 9.2h2.8M12 13v3.2M10.4 14.6h3.2"),
    culture: P("M3.5 5.5h10a2 2 0 0 1 2 2v4.5a2 2 0 0 1-2 2H8.6L5.5 17v-3H3.5a2 2 0 0 1-2-2V7.5a2 2 0 0 1 2-2z") + P("M17.5 9.5h1a2 2 0 0 1 2 2V15a2 2 0 0 1-2 2h-.8v2.6L15 17h-3a2 2 0 0 1-1.9-1.4"),
    grow: P("M3 19.5h4.2v-4h4.2v-4h4.2v-4H20") + P("M16.2 4.5H20v3.8"),
  };
  const icon = (k) => `<span class="wy-ic" aria-hidden="true"><svg viewBox="0 0 24 24">${ICON[k]}</svg></span>`;
  const img = (k) => (B[k] ? `<div class="wy-img"><img src="${B[k]}" alt=""></div>` : "");
  const card = (k, cls, title, text, d, image) => `<article class="wy-card ${cls} rv" style="--d:${d}">${image ? img(image) : ""}<div class="wy-body">${icon(k)}<h3 class="wy-t">${title}</h3><p class="wy-p">${text}</p></div></article>`;
  const css = `${TOKENS("wy", "wy")}
.wy-in{max-width:1440px;margin:0 auto;padding:128px var(--gutter) 128px;display:flex;flex-direction:column;gap:56px}
.wy-top{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);gap:clamp(32px,6cqi,96px);align-items:end}
.wy-h{margin:0;font-family:var(--serif);font-weight:600;font-synthesis:weight;font-size:64px;line-height:1.02;letter-spacing:-.015em;text-wrap:balance}
.wy-h .acc{color:var(--accent)}
.wy-sub{margin:0;font-size:20px;line-height:1.5;color:var(--ink2);max-width:36ch;transition:color 1s var(--sweep-ease) 1s}
/* the bento: one message per card */
.wy-grid{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:16px}
.wy-card{position:relative;display:flex;flex-direction:column;border:1px solid var(--line);border-radius:26px;overflow:hidden;min-width:0;background:linear-gradient(180deg,rgba(255,255,255,.035),rgba(255,255,255,0));transition:border-color .45s var(--ease),transform .45s var(--ease),box-shadow .45s var(--ease)}
.wy.light .wy-card{background:#FFFFFF}
.wy-card:hover{border-color:var(--accent);transform:translateY(-4px);box-shadow:0 40px 80px -50px rgba(18,192,198,.55)}
.wy-body{display:flex;flex-direction:column;gap:14px;padding:30px 30px 32px;flex:1}
/* cards without a picture: the icon at the top, the words settle at the bottom */
.wy-card:not(:has(.wy-img)) .wy-t{margin-top:auto;padding-top:28px}
.wy-c1{grid-column:span 7;grid-row:span 2}.wy-c2,.wy-c3{grid-column:span 5}.wy-c4,.wy-c5,.wy-c6{grid-column:span 4}
.wy-c7{grid-column:span 12;flex-direction:row-reverse}
.wy-c7 .wy-img{flex:0 0 44%;aspect-ratio:auto}.wy-c7 .wy-body{justify-content:center;padding:48px;max-width:760px}
.wy-img{position:relative;aspect-ratio:16/10;overflow:hidden;background:#000000}
.wy-c1 .wy-img{aspect-ratio:auto;flex:1;min-height:300px}
.wy-img img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transform:scale(1.04);transition:transform 1.4s var(--ease)}
.wy-card:hover .wy-img img{transform:scale(1.09)}
.wy-img:after{content:"";position:absolute;inset:auto 0 0 0;height:40%;background:linear-gradient(180deg,transparent,rgba(0,0,0,.35))}
.wy.light .wy-img:after{display:none}
.wy-ic{display:flex;align-items:center;justify-content:center;width:60px;height:60px;border-radius:50%;border:1px solid var(--line);transition:border-color .45s var(--ease)}
.wy-card:hover .wy-ic{border-color:var(--accent)}
.wy-ic svg{width:30px;height:30px;fill:none;stroke:var(--accent);stroke-width:1.25;stroke-linecap:round;stroke-linejoin:round;overflow:visible}
.wy-ic path,.wy-ic circle{stroke-dasharray:1;stroke-dashoffset:0}
.wy.arm .wy-ic path,.wy.arm .wy-ic circle{stroke-dashoffset:1}
.wy.in .wy-ic path,.wy.in .wy-ic circle{stroke-dashoffset:0;transition:stroke-dashoffset 1.2s var(--ease) calc(var(--d) * 1ms + 350ms)}
.wy-card:hover .wy-ic path,.wy-card:hover .wy-ic circle{animation:wyDraw 1.1s var(--ease)}
@keyframes wyDraw{0%{stroke-dashoffset:1}100%{stroke-dashoffset:0}}
.wy-t{margin:6px 0 0;font-family:var(--serif);font-weight:600;font-synthesis:weight;font-size:28px;line-height:1.15;letter-spacing:-.005em;text-wrap:balance}
.wy-c1 .wy-t,.wy-c7 .wy-t{font-size:36px}
.wy-p{margin:0;font-size:16.5px;line-height:1.65;color:var(--ink2);text-wrap:pretty;transition:color 1s var(--sweep-ease) 1s}
.wy-c1 .wy-p,.wy-c7 .wy-p{font-size:18px}
/* phone first: one column; the four icon cards sit as rows, icon beside the words */
@container wy (max-width:900px){
  .wy-in{padding:76px var(--gutter) 72px;gap:32px}
  .wy-top{grid-template-columns:minmax(0,1fr);gap:14px}
  .wy-h{font-size:36px;line-height:1.08}
  .wy-sub{font-size:17px}
  .wy-grid{grid-template-columns:minmax(0,1fr);gap:12px}
  .wy-c1,.wy-c2,.wy-c3,.wy-c4,.wy-c5,.wy-c6,.wy-c7{grid-column:auto;grid-row:auto}
  .wy-c7{flex-direction:column}
  .wy-c7 .wy-img,.wy-c1 .wy-img{flex:none;aspect-ratio:16/10;min-height:0}
  .wy-c7 .wy-body,.wy-body{padding:22px 22px 24px;gap:10px}
  .wy-c2 .wy-body,.wy-c3 .wy-body,.wy-c4 .wy-body,.wy-c6 .wy-body{display:grid;grid-template-columns:52px minmax(0,1fr);column-gap:16px;row-gap:6px;align-items:start}
  .wy-c2 .wy-ic,.wy-c3 .wy-ic,.wy-c4 .wy-ic,.wy-c6 .wy-ic{grid-row:span 2}
  .wy-ic{width:52px;height:52px}.wy-ic svg{width:26px;height:26px}
  .wy-t,.wy-c1 .wy-t,.wy-c7 .wy-t{font-size:23px;margin:0}
  .wy-card:not(:has(.wy-img)) .wy-t{margin-top:0;padding-top:0}
  .wy-p,.wy-c1 .wy-p,.wy-c7 .wy-p{font-size:15.5px}
}
@container wy (max-width:370px){.wy-h{font-size:32px}}
${REVEAL("wy")}
@media (prefers-reduced-motion:reduce){.wy-ic path,.wy-ic circle{stroke-dashoffset:0!important;animation:none!important}.wy-card:hover{transform:none}.wy-card:hover .wy-img img{transform:scale(1.04)}}`;
  const body = `<section class="wy {{cls}}" ref="{{rootRef}}" aria-labelledby="wy-h"><div class="wy-in">
<div class="wy-top">
<h2 class="wy-h rv" id="wy-h">Why partners choose <span class="acc">HCIG</span></h2>
<p class="wy-sub rv" style="--d:100">Designed for insurers, global partners, and international patients.</p>
</div>
<div class="wy-grid">
${card("own", "wy-c1", "Full Patient Ownership", "We take full responsibility for every patient journey from first contact to full recovery.", 0, "why1")}
${card("net", "wy-c2", "Connected Care Delivery", "We operate a healthcare ecosystem where all services work as one coordinated system.", 100)}
${card("speed", "wy-c3", "Speed &amp; Responsiveness", "We act immediately, ensuring fast access to care when every moment matters.", 180)}
${card("std", "wy-c4", "Global Standards &amp; Accreditation", "We operate in line with internationally recognized medical standards and trusted global partnerships.", 120)}
${card("host", "wy-c5", "Hospitality Integration", "We seamlessly integrate healthcare into the hospitality experience for international patients.", 200, "why3")}
${card("culture", "wy-c6", "Cultural Intelligence", "We understand international patients and adapt care to their expectations, culture, and mindset.", 280)}
${card("grow", "wy-c7", "Partner Development &amp; Accreditation Support", "We don’t just work with partners we develop them. Through training, operational support, and accreditation guidance, we help healthcare providers reach international standards and integrate into the global medical tourism ecosystem.", 120, "why2")}
</div>
</div></section>`;
  const vals = `    return { rootRef, cls: theme + (s.arm ? ' arm' : '') + (s.inv ? ' in' : '') };`;
  return { css, body, vals };
};
