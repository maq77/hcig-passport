// 5 · The patient journey: eyebrow, heading, six steps along one line (COPY.md).
// Desktop: horizontal line across the width, drawn icon above each node, 44px circle with 01..06 on the line, title and desc below.
// Accent line sweeps left to right on reveal (scaleX, 2.4s), nodes turn accent in sequence, glowing dot travels along the line.
// Phone: vertical line down the left with nodes, steps stacked to its right.
export default ({ B, kit }) => {
  const k = "jr", { P, icon } = kit;
  const STEPS = [
    {
      num: "01",
      title: "First response",
      desc: "Immediate care through on-site clinics and urgent care centres.",
      icon: P("M3 12h4.5l1.8 2.5 2.2-9.5 2.5 14 2-7H21"),
    },
    {
      num: "02",
      title: "Case ownership",
      desc: "One team coordinates providers, insurers and partners.",
      icon: P("M3 7V6a1 1 0 0 1 1-1h4.5l2 2H20a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7z") + P("M8.5 13.5l2.5 2.5 5-5"),
    },
    {
      num: "03",
      title: "Advanced care",
      desc: "Hospital treatment in our network or partner facilities when needed.",
      icon: P("M9.5 20V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v15M13 20v-3.5h3V20") + P("M14.5 7.5v3M13 9h3") + P("M3.5 18.5l5.5-5.5M5.5 13h3.5v3.5"),
    },
    {
      num: "04",
      title: "Evacuation & repatriation",
      desc: "Across countries, medically and logistically arranged.",
      icon: P("M12 2.5a1.5 1.5 0 0 1 1.5 1.5V9l7 4v2l-7-2.2V18l2 1.5V21l-3.5-1-3.5 1v-1.5l2-1.5v-5.2L3.5 15v-2l7-4V4a1.5 1.5 0 0 1 1.5-1.5z"),
    },
    {
      num: "05",
      title: "Insurance & claims",
      desc: "Approvals, documents and claims handled directly with insurers.",
      icon: P("M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8l-5-5zM14 3v5h5") + P("M8 6.5h3.5") + P("M8 13.5l4-1.8 4 1.8v3.2c0 2.8-2.2 4.8-4 5.8-1.8-1-4-3-4-5.8v-3.2z"),
    },
    {
      num: "06",
      title: "Recovery & closure",
      desc: "We stay with the case until full recovery.",
      icon: P("M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5") + P("M8.5 12l2.5 2.5 5-5"),
    },
  ];

  const step = (s, i) => `<li class="jr-step hov rv" style="--d:${140 + i * 80};--nd:${250 + i * 400}ms">
<div class="jr-ic-box">${icon(s.icon)}</div>
<div class="jr-node"><span>${s.num}</span></div>
<div class="jr-body">
<h3 class="jr-t">${s.title}</h3>
<p class="jr-p">${s.desc}</p>
</div>
</li>`;

  const css = `${kit.TOKENS(k)}
${kit.ICONS(k, 56)}
.jr-head{display:flex;flex-direction:column;gap:18px;max-width:820px;margin-bottom:88px}
.jr-track{position:relative}
.jr-line{position:absolute;left:28px;right:28px;top:102px;height:1px;background:var(--line);transition:background-color 1s var(--sweep-ease) 1s}
.jr-line:before{content:"";position:absolute;inset:0;background:var(--accent);transform-origin:left}
.jr.arm .jr-line:before{transform:scaleX(0)}
.jr.in .jr-line:before{transform:scaleX(1);transition:transform 2.4s var(--ease) .2s}
.jr-line i{position:absolute;top:-3px;left:0;width:7px;height:7px;border-radius:50%;background:var(--accent);box-shadow:0 0 0 5px rgba(18,192,198,.18),0 0 18px 2px rgba(18,192,198,.7);animation:jrRun 6s cubic-bezier(.45,.05,.35,1) 2.6s infinite}
@keyframes jrRun{0%{left:0;opacity:0}6%{opacity:1}94%{opacity:1}100%{left:calc(100% - 7px);opacity:0}}
.jr-steps{position:relative;list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:clamp(16px,2cqi,36px)}
.jr-step{display:flex;flex-direction:column;align-items:flex-start;min-width:0;position:relative;cursor:default}
.jr-ic-box{display:flex;align-items:center;height:56px;margin-bottom:24px}
.jr .ic{background:var(--paper);transition:border-color .45s var(--ease),background-color 1.3s var(--sweep-ease) .9s}
.jr-node{position:relative;z-index:2;flex:none;width:44px;height:44px;margin-left:6px;margin-bottom:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font:600 13px/1 var(--sans);font-variant-numeric:tabular-nums;background:var(--paper);border:1px solid var(--accent);color:var(--accent);box-shadow:0 0 0 3px rgba(18,192,198,.12);transition:border-color .5s var(--ease) var(--nd,0ms),color .5s var(--ease) var(--nd,0ms),box-shadow .5s var(--ease) var(--nd,0ms),background-color 1.3s var(--sweep-ease) .9s}
.jr.arm .jr-node{border-color:var(--line);color:var(--muted);box-shadow:none}
.jr.in .jr-node{border-color:var(--accent);color:var(--accent);box-shadow:0 0 0 3px rgba(18,192,198,.12)}
.jr-body{display:flex;flex-direction:column;gap:10px}
.jr-t{margin:0;font-family:var(--serif);font-weight:600;font-synthesis:weight;font-size:24px;line-height:1.15;letter-spacing:-.01em;text-wrap:balance;transition:color .3s var(--ease)}
.jr-p{margin:0;font-size:15.5px;line-height:1.55;color:var(--ink2);text-wrap:pretty;transition:color 1s var(--sweep-ease) 1s}
.jr .hov:hover .jr-node{border-color:var(--accent);color:var(--accent);box-shadow:0 0 0 5px rgba(18,192,198,.22),0 0 16px rgba(18,192,198,.35)}
.jr .hov:hover .jr-t{color:var(--accent)}
@container jr (max-width:900px){
  .jr-head{gap:14px;margin-bottom:48px}
  .jr-line{left:21px;right:auto;top:22px;bottom:22px;width:1px;height:auto}
  .jr-line:before{transform-origin:top}
  .jr.arm .jr-line:before{transform:scaleY(0)}
  .jr.in .jr-line:before{transform:scaleY(1);transition:transform 2.4s var(--ease) .2s}
  .jr-line i{left:-3px;top:0;animation-name:jrRunY}
  @keyframes jrRunY{0%{top:0;opacity:0}6%{opacity:1}94%{opacity:1}100%{top:calc(100% - 7px);opacity:0}}
  .jr-steps{grid-template-columns:minmax(0,1fr);gap:40px}
  .jr-step{display:grid;grid-template-columns:44px minmax(0,1fr);grid-template-areas:"node ic" "node body";column-gap:20px;row-gap:14px;align-items:start}
  .jr-ic-box{grid-area:ic;margin-bottom:0}
  .jr-node{grid-area:node;margin-left:0;margin-bottom:0}
  .jr-body{grid-area:body}
  .jr-t{font-size:22px}
  .jr-p{font-size:15px}
}
${kit.REVEAL(k)}
@media (prefers-reduced-motion:reduce){
  .jr-line:before{transform:none!important}
  .jr-line i{display:none!important}
  .jr-node{transition:none!important}
}`;

  const body = `<section class="jr {{cls}}" ref="{{rootRef}}" aria-labelledby="jr-h"><div class="in-w">
<div class="jr-head">
<p class="eye rv">How our system works</p>
<h2 class="h2 rv" id="jr-h" style="--d:80">One journey. <span class="acc">One owner.</span></h2>
</div>
<div class="jr-track">
<div class="jr-line" aria-hidden="true"><i></i></div>
<ol class="jr-steps" aria-label="The patient journey">${STEPS.map(step).join("")}</ol>
</div>
</div></section>`;

  const vals = `    return { rootRef, cls: ${kit.CLS} };`;
  return { css, body, vals, h: 780, ph: 1740 };
};
