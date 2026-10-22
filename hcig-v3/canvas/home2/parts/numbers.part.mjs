// 2 · The group in numbers, v4 (his notes 2026-10-22: "make stats more less ... just add it as secondary", "redesign
// stats", "you can use glassmorphism and apple design.md"). A slim photo strip (the resort lobby at blue hour) with one
// frosted-glass panel floating on it: four numbers, quiet labels, hairline dividers, a single count-up. Apple restraint:
// no drawings, no chrome, the glass and the photograph carry the mood. Figures from the live site only.
export default ({ B, kit }) => {
  const k = "nb";
  const stat = (i) => `<div class="nb-item" role="listitem"><span class="nb-num">{{n${i}}}<span class="acc">+</span></span><span class="nb-lab">{{l${i}}}</span></div>`;
  const css = `${kit.TOKENS(k)}
.nb-strip{position:relative;overflow:hidden;background:#000000}
.nb-strip .tile-img img{object-position:50% 55%;filter:saturate(1.05)}
.nb-strip .tile-img:after{background:linear-gradient(180deg,rgba(0,0,0,.35),rgba(0,0,0,.2) 50%,rgba(0,0,0,.45))}
.nb-strip .in-w{position:relative;z-index:1;padding-top:88px;padding-bottom:88px}
.nb-glass{position:relative;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));padding:34px 12px;border-radius:28px;background:rgba(255,255,255,.12);backdrop-filter:blur(26px) saturate(170%);-webkit-backdrop-filter:blur(26px) saturate(170%);box-shadow:inset 0 0 0 1px rgba(255,255,255,.22),inset 0 1px 0 rgba(255,255,255,.35),0 40px 90px -40px rgba(0,0,0,.6);color:#FFFFFF}
.nb-glass:before{content:"";position:absolute;inset:0;border-radius:inherit;background:linear-gradient(115deg,rgba(255,255,255,.18),rgba(255,255,255,0) 38%);pointer-events:none}
.nb-item{position:relative;display:flex;flex-direction:column;align-items:center;gap:8px;padding:2px 16px;min-width:0;text-align:center}
.nb-item+.nb-item:before{content:"";position:absolute;left:0;top:14%;bottom:14%;width:1px;background:rgba(255,255,255,.22)}
.nb-num{font-family:var(--serif);font-weight:600;font-synthesis:weight;font-size:60px;line-height:1;letter-spacing:-.025em;font-variant-numeric:tabular-nums;white-space:nowrap}
.nb-num .acc{color:#12C0C6}
.nb-lab{font-size:15px;line-height:1.35;color:rgba(255,255,255,.82)}
.nb-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.nb.arm .nb-glass{opacity:0;transform:translateY(24px) scale(.98)}
.nb.in .nb-glass{opacity:1;transform:none;transition:opacity 1s var(--ease) .1s,transform 1.2s var(--ease) .1s}
.nb.arm .tile-img img{transform:scale(1.08)}.nb.in .tile-img img{transform:none;transition:transform 2.4s var(--ease)}
@container nb (max-width:900px){
  .nb-strip .in-w{padding-top:48px;padding-bottom:48px}
  .nb-glass{grid-template-columns:repeat(2,minmax(0,1fr));row-gap:22px;padding:24px 4px;border-radius:24px}
  .nb-item:nth-child(3):before{display:none}
  .nb-num{font-size:40px}
  .nb-lab{font-size:13px}
}
@media (prefers-reduced-motion:reduce){.nb-glass{opacity:1!important;transform:none!important}}`;
  const body = `<section class="nb {{cls}}" ref="{{rootRef}}" aria-labelledby="nb-h"><div class="nb-strip">
<div class="tile-img"><img src="${B["why3"]}" alt=""></div>
<div class="in-w"><h2 class="nb-sr" id="nb-h">The group in numbers</h2>
<div class="nb-glass" role="list">${[1, 2, 3, 4].map(stat).join("")}</div></div>
</div></section>`;
  const vals = `    const p = s.p === undefined ? 1 : s.p;
    return {
      rootRef, cls: ${kit.CLS},
      n1: String(Math.round(40 * p)), n2: Math.round(600 * p) + 'K', n3: String(Math.round(350 * p)), n4: String(Math.round(135 * p)),
      l1: 'Years of experience', l2: 'Patients served', l3: 'Medical professionals', l4: 'On-site clinics across Egypt',
    };`;
  return { css, body, vals, h: 330, ph: 380 };
};
