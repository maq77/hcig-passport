// 2 · The group in numbers: proof right under the hero. Live figures only (About stats and Our Impact).
// A quiet band: four numbers that count up once, divided by hairlines, a Turquoise line drawing across the top.
export default ({ kit }) => {
  const k = "nb";
  const stat = (i, d) => `<div class="nb-stat rv" role="listitem" style="--d:${d}"><span class="nb-num">{{n${i}}}<span class="acc">+</span></span><span class="nb-lab">{{l${i}}}</span></div>`;
  const css = `${kit.TOKENS(k)}
.nb .in-w{padding-top:112px;padding-bottom:112px}
.nb{text-align:center}
.nb-eye{margin-bottom:48px}
.nb-row{position:relative;display:grid;grid-template-columns:repeat(4,minmax(0,1fr))}
.nb-row:before{content:"";position:absolute;left:12%;right:12%;top:-28px;height:1px;background:linear-gradient(90deg,transparent,var(--accent),transparent);transform-origin:center}
.nb.arm .nb-row:before{transform:scaleX(0)}.nb.in .nb-row:before{transform:scaleX(1);transition:transform 2s var(--ease) .2s}
.nb-stat{display:flex;flex-direction:column;align-items:center;gap:16px;padding:8px 16px;min-width:0}
.nb-stat+.nb-stat{border-left:1px solid var(--line)}
.nb-num{font-family:var(--serif);font-weight:600;font-synthesis:weight;font-size:clamp(64px,6.6cqi,104px);line-height:.95;letter-spacing:-.02em;font-variant-numeric:tabular-nums;white-space:nowrap}
.nb-lab{font-size:15px;line-height:1.4;letter-spacing:.12em;text-transform:uppercase;font-weight:600;color:var(--muted);transition:color 1s var(--sweep-ease) 1s}
/* phone first: two by two */
@container nb (max-width:900px){
  .nb .in-w{padding-top:72px;padding-bottom:72px}
  .nb-eye{margin-bottom:36px}
  .nb-row{grid-template-columns:repeat(2,minmax(0,1fr))}
  .nb-stat{padding:22px 8px;gap:8px}
  .nb-stat:nth-child(3){border-left:0}
  .nb-stat:nth-child(n+3){border-top:1px solid var(--line)}
  .nb-num{font-size:56px}
  .nb-lab{font-size:13px;letter-spacing:0;text-transform:none;line-height:1.3}
}
@container nb (max-width:370px){.nb-num{font-size:48px}}
${kit.REVEAL(k)}
@media (prefers-reduced-motion:reduce){.nb-row:before{transform:scaleX(1)!important}}`;
  const body = `<section class="nb tile-dark {{cls}}" ref="{{rootRef}}" aria-labelledby="nb-h"><div class="in-w">
<h2 class="eye nb-eye rv" id="nb-h">The group in numbers</h2>
<div class="nb-row" role="list">${stat(1, 0)}${stat(2, 100)}${stat(3, 200)}${stat(4, 300)}</div>
</div></section>`;
  const vals = `    const p = s.p === undefined ? 1 : s.p;
    return {
      rootRef, cls: ${kit.CLS},
      n1: String(Math.round(40 * p)), n2: Math.round(600 * p) + 'K', n3: String(Math.round(350 * p)), n4: String(Math.round(135 * p)),
      l1: 'Years of experience', l2: 'Patients served', l3: 'Medical professionals', l4: 'On-site clinics across Egypt',
    };`;
  return { css, body, vals, h: 470, ph: 520 };
};
