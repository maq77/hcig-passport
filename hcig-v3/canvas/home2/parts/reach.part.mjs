// 8 · Global reach (COPY.md): the network drawn on a dotted map, three facts, the closing statement.
// Map: Natural Earth land dots (../../sections/map-dots.json), pins at the true places from the film brief, routes from Hurghada.
import { readFileSync } from "node:fs";
export default ({ kit }) => {
  const k = "rc", { P, C, icon } = kit;
  const LAND = JSON.parse(readFileSync(new URL("../../sections/map-dots.json", import.meta.url), "utf8"));
  const PINS = { hurghada: [27.26, 33.81], clearwater: [27.97, -82.8], barcelona: [41.39, 2.17], munich: [48.14, 11.58], dubai: [25.2, 55.27] };
  const LON0 = -104, LON1 = 66, LAT0 = 64, LAT1 = 10, W = 1000, H = Math.round((W * (LAT0 - LAT1)) / (LON1 - LON0));
  const X = (lon) => ((lon - LON0) / (LON1 - LON0)) * W, Y = (lat) => ((LAT0 - lat) / (LAT0 - LAT1)) * H;
  const dots = LAND.filter(([lon, lat]) => lon >= LON0 && lon <= LON1 && lat <= LAT0 && lat >= LAT1).map(([lon, lat]) => `<circle cx="${X(lon).toFixed(1)}" cy="${Y(lat).toFixed(1)}" r="2.6"/>`).join("");
  const pt = (key) => [X(PINS[key][1]), Y(PINS[key][0])];
  const [hx, hy] = pt("hurghada");
  const PLACES = [["Hurghada", "hurghada"], ["Clearwater", "clearwater"], ["Barcelona", "barcelona"], ["Munich", "munich"], ["Dubai", "dubai"]];
  const arcs = PLACES.slice(1).map(([, key], i) => { const [x, y] = pt(key); const mx = (hx + x) / 2, my = Math.min(hy, y) - Math.abs(hx - x) * 0.22 - 18; return `<path class="rc-arc" style="--d:${i * 160}" d="M${hx.toFixed(1)} ${hy.toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}" pathLength="1"/>`; }).join("");
  const pins = PLACES.map(([name, key], i) => { const [x, y] = pt(key); return `<span class="rc-pin rc-${key}${key === "hurghada" ? " rc-home" : ""}" style="left:${((x / W) * 100).toFixed(2)}%;top:${((y / H) * 100).toFixed(2)}%;--d:${i * 140}"><i></i><b>${name}</b></span>`; }).join("");
  const FACTS = [
    ["Multilingual medical teams", P("M4 5h16a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 20 16h-9l-4 3.5V16H4a1.5 1.5 0 0 1-1.5-1.5v-8A1.5 1.5 0 0 1 4 5z") + P("M7.2 13.2l2.4-5.6 2.4 5.6M8.1 11.3h3") + P("M14.6 8.4h4.2M16.7 8.4c0 2.1-1 3.6-2.2 4.6M15.8 11.4c.8.7 1.8 1.3 2.6 1.6")],
    ["24/7 medical coverage in key travel destinations", C(12, 12, 8.2) + P("M12 7.2V12l3.4 2.2")],
    ["Direct partnerships with global insurers", P("M12 3l7 3v5.5c0 4.4-3 8-7 9.5-4-1.5-7-5.1-7-9.5V6l7-3z") + P("M8.8 12.2l2.2 2.2 4.4-4.6")],
  ];
  const fact = ([t, ic], i) => `<li class="rc-fact hov rv" style="--d:${i * 120}">${icon(ic)}<span>${t}</span></li>`;
  const css = `${kit.TOKENS(k)}
${kit.ICONS(k, 52)}
.rc-top{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);gap:clamp(32px,6cqi,96px);align-items:end}
.rc-copy{display:flex;flex-direction:column;gap:18px}
.rc-map{position:relative;aspect-ratio:${W}/${H};width:100%;margin-top:40px}
.rc-map svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
.rc-dots circle{fill:#FFFFFF;opacity:.17}
.rc-arc{fill:none;stroke:var(--accent);stroke-width:1.8;filter:drop-shadow(0 0 4px rgba(18,192,198,.8));stroke-linecap:round;stroke-dasharray:1;stroke-dashoffset:0}
.rc.arm .rc-arc{stroke-dashoffset:1}.rc.in .rc-arc{stroke-dashoffset:0;transition:stroke-dashoffset 1.6s var(--ease) calc(var(--d) * 1ms + 600ms)}
.rc-pin{position:absolute;width:0;height:0}
.rc-pin i{position:absolute;left:-6px;top:-6px;width:12px;height:12px;border-radius:50%;background:var(--accent);box-shadow:0 0 0 4px rgba(18,192,198,.18)}
.rc-pin i:after{content:"";position:absolute;inset:-6px;border-radius:50%;border:1px solid var(--accent);opacity:0;animation:rcPing 2.6s ease-out infinite;animation-delay:calc(var(--d) * 1ms + 1.6s)}
.rc-home i{left:-8px;top:-8px;width:16px;height:16px}
.rc-pin b{position:absolute;left:12px;top:-9px;white-space:nowrap;font:600 13px/1.4 var(--sans);letter-spacing:.04em;color:var(--ink)}
.rc-dubai b{left:-24px;top:10px}
.rc.arm .rc-pin{opacity:0;transform:scale(.4)}
.rc.in .rc-pin{opacity:1;transform:none;transition:opacity .5s var(--ease) calc(var(--d) * 1ms + 400ms),transform .8s cubic-bezier(.34,1.56,.64,1) calc(var(--d) * 1ms + 400ms)}
@keyframes rcPing{0%{transform:scale(.6);opacity:.9}100%{transform:scale(2.6);opacity:0}}
.rc-facts{list-style:none;margin:40px 0 0;padding:28px 0 0;border-top:1px solid var(--line);display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px;transition:border-color 1s var(--sweep-ease) 1s}
.rc-fact{display:flex;align-items:center;gap:18px;font-family:var(--serif);font-weight:600;font-synthesis:weight;font-size:28px;line-height:1.18}
.rc-say{margin:112px auto 0;max-width:20ch;text-align:center;font-family:var(--serif);font-weight:600;font-synthesis:weight;font-size:72px;letter-spacing:-.02em;line-height:1.1;letter-spacing:-.01em;text-wrap:balance}
@container rc (max-width:900px){
  .rc-top{grid-template-columns:minmax(0,1fr);gap:14px}
  .rc-map{margin:28px calc(var(--gutter) * -1) 0;width:auto;overflow:hidden;padding-block:14px;box-sizing:content-box}
  .rc-pin b{font-size:12px;letter-spacing:0}
  .rc-pin i{left:-5px;top:-5px;width:10px;height:10px}.rc-home i{left:-6px;top:-6px;width:12px;height:12px}
  .rc-hurghada b{left:-40px;top:12px}.rc-dubai b{left:-34px;top:-30px}
  .rc-facts{grid-template-columns:minmax(0,1fr);gap:16px;margin-top:24px;padding-top:22px}
  .rc-fact{font-size:20px}
  .rc-say{font-size:36px;margin-top:64px}
}
@container rc (max-width:370px){.rc-say{font-size:27px}}
${kit.REVEAL(k)}
@media (prefers-reduced-motion:reduce){.rc-arc{stroke-dashoffset:0!important}.rc-pin{opacity:1!important;transform:none!important}.rc-pin i:after{animation:none}}`;
  const body = `<section class="rc tile-dark {{cls}}" ref="{{rootRef}}" aria-labelledby="rc-h"><div class="in-w">
<div class="rc-top"><div class="rc-copy"><p class="eye rv">Global reach</p><h2 class="h2 rv" id="rc-h" style="--d:80">Built for global <span class="acc">healthcare delivery.</span></h2></div></div>
<div class="rc-map rv" role="img" aria-label="Map: Hurghada linked to Clearwater, Barcelona, Munich and Dubai"><svg viewBox="0 0 ${W} ${H}" aria-hidden="true"><g class="rc-dots">${dots}</g>${arcs}</svg>${pins}</div>
<ul class="rc-facts">${FACTS.map(fact).join("")}</ul>
<p class="rc-say rv">Built to perform under pressure. <span class="acc">Structured to deliver at scale.</span></p>
</div></section>`;
  const vals = `    return { rootRef, cls: ${kit.CLS} };`;
  return { css, body, vals, h: 1420, ph: 1250 };
};
