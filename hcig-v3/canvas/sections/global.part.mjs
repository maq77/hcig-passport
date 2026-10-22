// 7 · Built for Global Healthcare Delivery: "the network, drawn". A dotted map of the band from Florida to the Gulf, with
// pins at the group's true places (from the film brief: Hurghada, Clearwater, Barcelona, Munich, Dubai) and routes that
// draw out from Hurghada; under it the six live cards with our own drawn icons, then the live closing line.
import { readFileSync } from "node:fs";
export const global = ({ TOKENS, REVEAL, globePath }) => {
  const G = JSON.parse(readFileSync(globePath, "utf8"));
  const LAND = JSON.parse(readFileSync(new URL("./map-dots.json", import.meta.url), "utf8")); // make-map-dots.mjs
  // map window: lon -100..70, lat 66..8 (equirectangular), 1000 units wide
  const LON0 = -104, LON1 = 66, LAT0 = 64, LAT1 = 10, W = 1000, H = Math.round((W * (LAT0 - LAT1)) / (LON1 - LON0));
  const X = (lon) => ((lon - LON0) / (LON1 - LON0)) * W, Y = (lat) => ((LAT0 - lat) / (LAT0 - LAT1)) * H;
  const dots = LAND.filter(([lon, lat]) => lon >= LON0 && lon <= LON1 && lat <= LAT0 && lat >= LAT1).map(([lon, lat]) => `<circle cx="${X(lon).toFixed(1)}" cy="${Y(lat).toFixed(1)}" r="2.6"/>`).join("");
  const PLACES = [["Hurghada", "hurghada"], ["Clearwater", "clearwater"], ["Barcelona", "barcelona"], ["Munich", "munich"], ["Dubai", "dubai"]];
  const pt = (k) => { const [lat, lon] = G.pins[k].latlon; return [X(lon), Y(lat)]; };
  const [hx, hy] = pt("hurghada");
  const arcs = PLACES.slice(1).map(([, k], i) => { const [x, y] = pt(k); const mx = (hx + x) / 2, my = Math.min(hy, y) - Math.abs(hx - x) * 0.22 - 18; return `<path class="gl-arc" style="--d:${i * 160}" d="M${hx.toFixed(1)} ${hy.toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}" pathLength="1"/>`; }).join("");
  const pins = PLACES.map(([name, k], i) => { const [x, y] = pt(k); return `<span class="gl-pin${k === "hurghada" ? " gl-home" : ""} gl-${k}" style="left:${((x / W) * 100).toFixed(2)}%;top:${((y / H) * 100).toFixed(2)}%;--d:${i * 140}"><i></i><b>${name}</b></span>`; }).join("");
  const P = (d) => `<path d="${d}" pathLength="1"/>`;
  const ICON = {
    lang: P("M4 5h16a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 20 16h-9l-4 3.5V16H4a1.5 1.5 0 0 1-1.5-1.5v-8A1.5 1.5 0 0 1 4 5z") + P("M7.2 13.2l2.4-5.6 2.4 5.6M8.1 11.3h3") + P("M14.6 8.4h4.2M16.7 8.4c0 2.1-1 3.6-2.2 4.6M15.8 11.4c.8.7 1.8 1.3 2.6 1.6"),
    pin: P("M12 21.2s-6.6-5.7-6.6-11.1a6.6 6.6 0 0 1 13.2 0c0 5.4-6.6 11.1-6.6 11.1z") + `<circle cx="12" cy="10.1" r="2.4" pathLength="1"/>`,
    ins: P("M7 3.5h7l4 4v13H7z") + P("M14 3.5v4h4") + P("M9.6 14l1.8 1.8 3.6-3.8"),
    train: P("M2.5 9.2L12 4.6l9.5 4.6L12 13.8z") + P("M6.5 11.2v4.2c1.5 1.4 3.4 2.1 5.5 2.1s4-.7 5.5-2.1v-4.2") + P("M21.5 9.2v5.2"),
    travel: P("M4 8h16v11.5H4z") + P("M9 8V5.5h6V8") + P("M12 11.2v5.2M9.4 13.8h5.2"),
    scale: P("M5.5 20v-5.5M5.5 10.5V4M12 20v-8M12 8V4M18.5 20v-3.5M18.5 12.5V4") + P("M3.3 14.5h4.4M9.8 8h4.4M16.3 16.5h4.4"),
  };
  const card = (k, t, p, d) => `<article class="gl-card rv" style="--d:${d}"><span class="gl-ic" aria-hidden="true"><svg viewBox="0 0 24 24">${ICON[k]}</svg></span><h3 class="gl-t">${t}</h3><p class="gl-p">${p}</p></article>`;
  const css = `${TOKENS("gl", "gl")}
.gl-in{max-width:1440px;margin:0 auto;padding:128px var(--gutter) 120px;display:flex;flex-direction:column;gap:48px}
.gl-top{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);gap:clamp(32px,6cqi,96px);align-items:end}
.gl-h{margin:0;font-family:var(--serif);font-weight:600;font-synthesis:weight;font-size:64px;line-height:1.02;letter-spacing:-.015em;text-wrap:balance}
.gl-h .acc{color:var(--accent)}
.gl-sub{margin:0;font-size:19px;line-height:1.55;color:var(--ink2);max-width:40ch;transition:color 1s var(--sweep-ease) 1s}
/* the network, drawn */
.gl-map{position:relative;aspect-ratio:${W}/${H};width:100%}
.gl-map svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
.gl-dots circle{fill:#FFFFFF;opacity:.16;transition:fill 1s var(--sweep-ease) 1s,opacity 1s}
.gl.light .gl-dots circle{fill:#565759;opacity:.22}
.gl-arc{fill:none;stroke:var(--accent);stroke-width:1.5;stroke-linecap:round;stroke-dasharray:1;stroke-dashoffset:0}
.gl.arm .gl-arc{stroke-dashoffset:1}
.gl.in .gl-arc{stroke-dashoffset:0;transition:stroke-dashoffset 1.6s var(--ease) calc(var(--d) * 1ms + 600ms)}
.gl-pin{position:absolute;width:0;height:0}
.gl-pin i{position:absolute;left:-6px;top:-6px;width:12px;height:12px;border-radius:50%;background:var(--accent);box-shadow:0 0 0 4px rgba(18,192,198,.18)}
.gl-pin i:after{content:"";position:absolute;inset:-6px;border-radius:50%;border:1px solid var(--accent);opacity:0;animation:glPing 2.6s ease-out infinite;animation-delay:calc(var(--d) * 1ms + 1.6s)}
.gl-home i{left:-8px;top:-8px;width:16px;height:16px}
.gl-pin b{position:absolute;left:12px;top:-9px;white-space:nowrap;font:600 13px/1.4 var(--sans);letter-spacing:.04em;color:var(--ink)}
.gl-pin.gl-dubai b{left:-24px;top:10px}
.gl.arm .gl-pin{opacity:0;transform:scale(.4)}
.gl.in .gl-pin{opacity:1;transform:none;transition:opacity .5s var(--ease) calc(var(--d) * 1ms + 400ms),transform .8s cubic-bezier(.34,1.56,.64,1) calc(var(--d) * 1ms + 400ms)}
@keyframes glPing{0%{transform:scale(.6);opacity:.9}100%{transform:scale(2.6);opacity:0}}
/* the six capabilities */
.gl-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
.gl-card{display:flex;flex-direction:column;gap:14px;padding:30px 30px 32px;border:1px solid var(--line);border-radius:24px;background:linear-gradient(180deg,rgba(255,255,255,.035),rgba(255,255,255,0));transition:border-color .45s var(--ease),transform .45s var(--ease),box-shadow .45s var(--ease)}
.gl.light .gl-card{background:#FFFFFF}
.gl-card:hover{border-color:var(--accent);transform:translateY(-4px);box-shadow:0 40px 80px -50px rgba(18,192,198,.55)}
.gl-ic{display:flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:50%;border:1px solid var(--line);transition:border-color .45s var(--ease)}
.gl-card:hover .gl-ic{border-color:var(--accent)}
.gl-ic svg{width:28px;height:28px;fill:none;stroke:var(--accent);stroke-width:1.25;stroke-linecap:round;stroke-linejoin:round;overflow:visible}
.gl-ic path,.gl-ic circle{stroke-dasharray:1;stroke-dashoffset:0}
.gl.arm .gl-ic path,.gl.arm .gl-ic circle{stroke-dashoffset:1}
.gl.in .gl-ic path,.gl.in .gl-ic circle{stroke-dashoffset:0;transition:stroke-dashoffset 1.2s var(--ease) calc(var(--d) * 1ms + 350ms)}
.gl-card:hover .gl-ic path,.gl-card:hover .gl-ic circle{animation:glDraw 1.1s var(--ease)}
@keyframes glDraw{0%{stroke-dashoffset:1}100%{stroke-dashoffset:0}}
.gl-t{margin:12px 0 0;font-family:var(--serif);font-weight:600;font-synthesis:weight;font-size:26px;line-height:1.18;text-wrap:balance}
.gl-p{margin:0;font-size:16px;line-height:1.65;color:var(--ink2);text-wrap:pretty;transition:color 1s var(--sweep-ease) 1s}
/* the close */
.gl-say{margin:24px auto 0;max-width:22ch;text-align:center;font-family:var(--serif);font-weight:600;font-synthesis:weight;font-size:52px;line-height:1.1;letter-spacing:-.01em;text-wrap:balance}
.gl-say .acc{color:var(--accent)}
/* phone first */
@container gl (max-width:900px){
  .gl-in{padding:76px var(--gutter) 72px;gap:32px}
  .gl-top{grid-template-columns:minmax(0,1fr);gap:14px}
  .gl-h{font-size:36px;line-height:1.08}
  .gl-sub{font-size:17px}
  .gl-map{margin:0 calc(var(--gutter) * -1);width:auto;overflow:hidden;padding-block:14px;box-sizing:content-box}
  .gl-pin b{font-size:12px;letter-spacing:0}
  .gl-pin.gl-hurghada b{left:-40px;top:12px}.gl-pin.gl-dubai b{left:-34px;top:-30px}
  .gl-pin i{left:-5px;top:-5px;width:10px;height:10px}.gl-home i{left:-6px;top:-6px;width:12px;height:12px}
  .gl-grid{grid-template-columns:minmax(0,1fr);gap:10px}
  .gl-card{display:grid;grid-template-columns:52px minmax(0,1fr);column-gap:16px;row-gap:6px;padding:20px 20px 22px}
  .gl-ic{grid-row:span 2;width:52px;height:52px}.gl-ic svg{width:26px;height:26px}
  .gl-t{margin:0;font-size:22px}
  .gl-p{font-size:15.5px}
  .gl-say{font-size:30px;margin-top:12px}
}
@container gl (max-width:370px){.gl-h{font-size:32px}.gl-say{font-size:27px}}
${REVEAL("gl")}
@media (prefers-reduced-motion:reduce){.gl-arc,.gl-ic path,.gl-ic circle{stroke-dashoffset:0!important;animation:none!important}.gl-pin{opacity:1!important;transform:none!important}.gl-pin i:after{animation:none}.gl-card:hover{transform:none}}`;
  const body = `<section class="gl {{cls}}" ref="{{rootRef}}" aria-labelledby="gl-h"><div class="gl-in">
<div class="gl-top">
<h2 class="gl-h rv" id="gl-h">Built for Global <span class="acc">Healthcare Delivery</span></h2>
<p class="gl-sub rv" style="--d:100">Designed to operate across borders, support international patients, and deliver consistent care in complex environments</p>
</div>
<div class="gl-map rv" role="img" aria-label="Map: Hurghada linked to Clearwater, Barcelona, Munich and Dubai"><svg viewBox="0 0 ${W} ${H}" aria-hidden="true"><g class="gl-dots">${dots}</g>${arcs}</svg>${pins}</div>
<div class="gl-grid">
${card("lang", "Multilingual Medical Teams", "Our teams operate across multiple languages, ensuring clear communication with international patients, insurers, and global partners.", 0)}
${card("pin", "Global Presence &amp; Network", "We operate across key international markets, with facilities and trusted partners in major travel destinations.", 100)}
${card("ins", "Insurance &amp; Assistance Integration", "We work directly with global insurers and assistance companies, ensuring faster approvals, efficient coordination, and streamlined case management.", 200)}
${card("train", "Training &amp; Partner Development", "We support healthcare providers through training, operational guidance, and accreditation pathways helping them meet international standards and grow within the global medical tourism ecosystem.", 80)}
${card("travel", "Hospitality &amp; Travel Integration", "Our model is designed to operate inside hotels, resorts, and travel environments bringing healthcare closer to the patient.", 180)}
${card("scale", "Operational Control &amp; Scalability", "Our system is built to scale across regions while maintaining full control, transparency, and consistency in care delivery.", 280)}
</div>
<p class="gl-say rv">Built to perform under pressure. <span class="acc">Structured to deliver at scale.</span></p>
</div></section>`;
  const vals = `    return { rootRef, cls: theme + (s.arm ? ' arm' : '') + (s.inv ? ' in' : '') };`;
  return { css, body, vals };
};
