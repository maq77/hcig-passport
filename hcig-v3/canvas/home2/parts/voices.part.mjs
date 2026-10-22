// 9 · Voices (COPY.md): the CEO quote word for word, then three real patient videos. The videos are used as video;
// each cover is a designed tile (never a still from the video). Tap a tile: the cover lifts and the video plays.
export default ({ B, kit }) => {
  const k = "vc";
  const VIDS = [["testimonial-1", "Patient story 01", "tall"], ["testimonial-2", "Patient story 02", "tall"], ["testimonial-3", "Patient story 03", "wide"]];
  const PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10.5"/><path d="M10 8.2l6 3.8-6 3.8z"/></svg>';
  const tile = ([key, label, shape], i) => `<li class="vc-tile vc-${shape} rv" style="--d:${120 + i * 120}">
<video src="${B[key] || ""}" controls playsinline preload="none" ref="{{vref${i}}}" aria-label="${label}"></video>
<sc-if value="{{cover${i}}}" hint-placeholder-val="{{ true }}"><button type="button" class="vc-cover" onClick="{{play${i}}}" aria-label="Play ${label}"><span class="vc-ring">${PLAY}</span><span class="vc-lab">${label}</span></button></sc-if>
</li>`;
  const css = `${kit.TOKENS(k)}
.vc-top{display:flex;flex-direction:column;gap:18px;max-width:880px}
.vc-grid{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:clamp(32px,5cqi,72px);align-items:center;margin-top:64px}
/* the CEO quote */
.vc-quote{position:relative;margin:0;padding:48px 44px 40px;border:1px solid var(--line);border-radius:28px;background:var(--card);transition:border-color 1s var(--sweep-ease) 1s,background-color 1.3s var(--sweep-ease) .9s}
.vc-mark{width:56px;height:56px;fill:none;stroke:var(--accent);stroke-width:1.25;stroke-linecap:round;stroke-linejoin:round}
.vc-mark path{stroke-dasharray:1;stroke-dashoffset:0}
.vc.arm .vc-mark path{stroke-dashoffset:1}.vc.in .vc-mark path{stroke-dashoffset:0;transition:stroke-dashoffset 1.4s var(--ease) .3s}
.vc-quote p{margin:22px 0 0;font-family:var(--serif);font-weight:600;font-synthesis:weight;font-size:30px;line-height:1.3;text-wrap:pretty}
.vc-who{display:flex;align-items:center;gap:14px;margin-top:30px;font-size:15px;color:var(--ink2)}
.vc-who:before{content:"";width:40px;height:1px;background:var(--accent)}
.vc-who b{color:var(--ink);font-weight:600}
/* three real stories */
.vc-tiles{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:1fr 1fr 1.6fr;gap:14px;align-items:end}
.vc-tile{position:relative;border-radius:22px;overflow:hidden;background:#000000;box-shadow:0 0 0 1px var(--line)}
.vc-tall{aspect-ratio:9/16}.vc-wide{aspect-ratio:16/9;align-self:center}
.vc-tile video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;background:#000000}
.vc-cover{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;border:0;cursor:pointer;color:#FFFFFF;font:600 13px/1.3 var(--sans);letter-spacing:.12em;text-transform:uppercase;background:radial-gradient(120% 90% at 50% 100%,rgba(18,192,198,.35),rgba(0,0,0,0) 60%),linear-gradient(160deg,#000000,#1A1A1A 60%,#000000)}
.vc-cover:before{content:"";position:absolute;inset:14px;border:1px solid rgba(255,255,255,.14);border-radius:14px;pointer-events:none}
.vc-ring{display:flex;width:72px;height:72px;transition:transform .45s var(--ease)}
.vc-ring svg{width:100%;height:100%;fill:none;stroke:#12C0C6;stroke-width:1;stroke-linejoin:round}
.vc-ring path{fill:#12C0C6;stroke:none}
.vc-cover:hover .vc-ring{transform:scale(1.08)}
.vc-cover:focus-visible{outline:2px solid var(--accent);outline-offset:-4px}
/* phone first: the quote, then the stories as a swipeable row */
@container vc (max-width:900px){
  .vc-grid{grid-template-columns:minmax(0,1fr);gap:28px;margin-top:32px}
  .vc-quote{padding:32px 24px 28px}
  .vc-mark{width:44px;height:44px}
  .vc-quote p{font-size:22px;margin-top:16px}
  .vc-tiles{display:flex;gap:12px;overflow-x:auto;scroll-snap-type:x mandatory;margin:0 calc(var(--gutter) * -1);padding:0 var(--gutter) 6px;scrollbar-width:none}
  .vc-tiles::-webkit-scrollbar{display:none}
  .vc-tile{flex:0 0 62%;scroll-snap-align:center}
  .vc-wide{flex-basis:88%}
}
${kit.REVEAL(k)}
@media (prefers-reduced-motion:reduce){.vc-mark path{stroke-dashoffset:0!important}.vc-cover:hover .vc-ring{transform:none}}`;
  const body = `<section class="vc {{cls}}" ref="{{rootRef}}" aria-labelledby="vc-h"><div class="in-w">
<div class="vc-top"><p class="eye rv">Voices</p><h2 class="h2 rv" id="vc-h" style="--d:80">Cared for when it <span class="acc">mattered most.</span></h2></div>
<div class="vc-grid">
<figure class="vc-quote rv"><svg class="vc-mark" viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 18.5c0-5.2 1.6-9.4 5.5-12" pathLength="1"/><path d="M13.5 18.5c0-5.2 1.6-9.4 5.5-12" pathLength="1"/></svg>
<blockquote style="margin:0"><p>Success isn’t measured only by the number of visitors a destination attracts. It’s measured by how well those visitors are cared for when they need help the most.</p></blockquote>
<figcaption class="vc-who"><span><b>Dr. Amr Abbass</b>, CEO, HCIG</span></figcaption></figure>
<ul class="vc-tiles" aria-label="Patient stories">${VIDS.map(tile).join("")}</ul>
</div>
</div></section>`;
  const vals = `    this.v = this.v || [];
    const mk = (i) => (el) => { if (el) this.v[i] = el; };
    this.refs = this.refs || [mk(0), mk(1), mk(2)];
    const play = (i) => () => { this.setState({ ['on' + i]: true }); const el = this.v[i]; if (el) { this.v.forEach((o, j) => { if (o && j !== i) o.pause(); }); const p = el.play(); if (p && p.catch) p.catch(() => {}); } };
    this.plays = this.plays || [play(0), play(1), play(2)];
    return {
      rootRef, cls: ${kit.CLS},
      vref0: this.refs[0], vref1: this.refs[1], vref2: this.refs[2],
      play0: this.plays[0], play1: this.plays[1], play2: this.plays[2],
      cover0: !s.on0, cover1: !s.on1, cover2: !s.on2,
    };`;
  return { css, body, vals, h: 1150, ph: 1500 };
};
