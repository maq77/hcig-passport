// 6 · What we deliver (COPY.md): the seven services as an explorer. Desktop: the list on the left, the chosen
// service's image and line on the right; it moves on by itself (a thin line shows the time) until someone picks.
// Phone: an accordion, the open item shows its image. Images by Gemini (no faces, no text); training reuses why2.
export default ({ B, kit }) => {
  const k = "dl";
  const SV = [
    ["Emergency &amp; Urgent Care", "24/7 access through on-site clinics, urgent care centres and pharmacy support.", "svc1"],
    ["Hospital &amp; Specialty Services", "Inpatient and outpatient care with full diagnostics, laboratory and imaging.", "svc2"],
    ["Medical Tourism Facilitation", "Treatment, travel logistics and follow-up arranged end to end.", "svc3"],
    ["Elite Medical Concierge", "Personal, high-touch coordination across every HCIG service.", "svc4"],
    ["Corporate Healthcare", "Programmes for companies, insurers and international partners.", "svc5"],
    ["Wellness, Longevity &amp; Aesthetics", "Preventive, recovery and lifestyle-focused medicine.", "svc6"],
    ["Accreditation &amp; Training", "Helping providers reach international standards.", "why2"],
  ];
  const n = (i) => String(i + 1).padStart(2, "0");
  const item = ([t, p, img], i) => `<li class="dl-item">
<button type="button" class="dl-btn {{c${i}}}" onClick="{{pick${i}}}" aria-expanded="{{x${i}}}"><span class="dl-n">${n(i)}</span><span class="dl-t">${t}</span><span class="dl-bar" aria-hidden="true"></span></button>
<sc-if value="{{on${i}}}" hint-placeholder-val="{{ ${i === 0} }}"><div class="dl-open"><img src="${B[img]}" alt=""><p>${p}</p></div></sc-if>
</li>`;
  const stage = SV.map(([t, p, img], i) => `<figure class="dl-slide {{c${i}}}"><img src="${B[img]}" alt=""><figcaption><span class="dl-cap-n">${n(i)}</span><b>${t}</b><span>${p}</span></figcaption></figure>`).join("");
  const css = `${kit.TOKENS(k)}
.dl-top{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);gap:clamp(32px,6cqi,96px);align-items:end}
.dl-copy{display:flex;flex-direction:column;gap:18px}
.dl-body{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:clamp(32px,5cqi,72px);margin-top:64px;align-items:stretch}
.dl-list{list-style:none;margin:0;padding:0;border-top:1px solid var(--line);transition:border-color 1s var(--sweep-ease) 1s}
.dl-item{border-bottom:1px solid var(--line);transition:border-color 1s var(--sweep-ease) 1s}
.dl-btn{position:relative;width:100%;display:flex;align-items:center;gap:20px;min-height:72px;padding:0;border:0;background:none;cursor:pointer;text-align:left;color:var(--ink2);font:inherit;transition:color .35s var(--ease)}
.dl-btn:hover,.dl-btn.sel{color:var(--ink)}
.dl-n{flex:none;width:28px;font:600 13px/1 var(--sans);letter-spacing:.06em;font-variant-numeric:tabular-nums;color:var(--muted)}
.dl-btn.sel .dl-n{color:var(--accent)}
.dl-t{font-family:var(--serif);font-weight:600;font-synthesis:weight;font-size:26px;line-height:1.2}
.dl-bar{position:absolute;left:0;right:0;bottom:-1px;height:2px;background:var(--accent);transform-origin:left;transform:scaleX(0)}
.dl-btn.sel .dl-bar{transform:scaleX(1);transition:transform 6s linear}
.dl.held .dl-btn.sel .dl-bar{transition:transform .5s var(--ease)}
.dl-btn:focus-visible{outline:2px solid var(--accent);outline-offset:4px}
.dl-open{display:none}
/* the stage: every image is there, the chosen one shows */
.dl-stage{position:relative;min-height:560px;border-radius:28px;overflow:hidden;background:#000000;box-shadow:0 0 0 1px var(--line)}
.dl-slide{position:absolute;inset:0;margin:0;opacity:0;transition:opacity .9s var(--ease)}
.dl-slide.sel{opacity:1}
.dl-slide img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transform:scale(1.06);transition:transform 6.5s linear}
.dl-slide.sel img{transform:scale(1)}
.dl-slide figcaption{position:absolute;left:24px;right:24px;bottom:24px;display:grid;gap:8px;padding:22px 24px;border-radius:20px;background:rgba(255,255,255,.88);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);color:#000000;transform:translateY(12px);opacity:0;transition:opacity .6s var(--ease) .25s,transform .8s var(--ease) .25s}
.dl.dark .dl-slide figcaption{background:rgba(0,0,0,.72);color:#FFFFFF}
.dl-slide.sel figcaption{opacity:1;transform:none}
.dl-cap-n{font:600 12px/1 var(--sans);letter-spacing:.14em;color:#12C0C6}
.dl-slide b{font-family:var(--serif);font-weight:600;font-synthesis:weight;font-size:26px;line-height:1.2}
.dl-slide figcaption span:last-child{font-size:16px;line-height:1.5;color:inherit;opacity:.82}
/* phone first: an accordion, the open item shows its picture and line */
@container dl (max-width:900px){
  .dl-top{grid-template-columns:minmax(0,1fr);gap:14px}
  .dl-body{grid-template-columns:minmax(0,1fr);margin-top:28px}
  .dl-stage{display:none}
  .dl-btn{min-height:64px;gap:14px}
  .dl-t{font-size:21px}
  .dl-bar{display:none}
  .dl-open{display:grid;gap:12px;padding:0 0 22px}
  .dl-open img{width:100%;aspect-ratio:16/10;object-fit:cover;border-radius:18px}
  .dl-open p{margin:0;font-size:16px;line-height:1.6;color:var(--ink2)}
}
${kit.REVEAL(k)}
@media (prefers-reduced-motion:reduce){.dl-slide,.dl-slide img,.dl-slide figcaption,.dl-btn.sel .dl-bar{transition:none!important}}`;
  const body = `<section class="dl {{cls}}" ref="{{rootRef}}" aria-labelledby="dl-h"><div class="in-w">
<div class="dl-top"><div class="dl-copy"><p class="eye rv">What we deliver</p><h2 class="h2 rv" id="dl-h" style="--d:80">Care at <span class="acc">every level.</span></h2></div><p class="lead rv" style="--d:160">Delivered across multiple levels of care within one structured system.</p></div>
<div class="dl-body">
<ol class="dl-list rv" style="--d:120">${SV.map(item).join("")}</ol>
<div class="dl-stage rv" style="--d:200" aria-live="polite">${stage}</div>
</div>
</div></section>`;
  const vals = `    const N = ${SV.length};
    const sel = s.sel === undefined ? 0 : s.sel;
    // moves on by itself every 6 s on wide screens until someone picks; never on phones or with reduced motion
    if (!this.tick && typeof window !== 'undefined' && !(window.matchMedia && (matchMedia('(prefers-reduced-motion: reduce)').matches || matchMedia('(max-width: 900px)').matches))) {
      this.tick = setInterval(() => { if (this.state && this.state.held) return; this.setState({ sel: (((this.state && this.state.sel) || 0) + 1) % N }); }, 6000);
    }
    this.pk = this.pk || Array.from({ length: N }, (_, i) => () => this.setState({ sel: i, held: true }));
    const out = { rootRef, cls: ${kit.CLS} + (s.held ? ' held' : '') };
    for (let i = 0; i < N; i++) { out['pick' + i] = this.pk[i]; out['c' + i] = i === sel ? 'sel' : ''; out['on' + i] = i === sel; out['x' + i] = i === sel ? 'true' : 'false'; }
    return out;`;
  return { css, body, vals, h: 1100, ph: 1250 };
};
