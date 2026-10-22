// 7 · For partners: who we serve and why they choose us (COPY.md).
// Interactive partner selector with six partner profiles, four core promises, and the global insurer band.
export default ({ kit }) => {
  const k = "pt", { P, C, icon } = kit;

  const TYPES = [
    {
      title: "Insurance & Assistance Companies",
      line: "Direct medical coordination, case management and integration with global insurance networks.",
      ic: P("M12 3.2L4.5 6.5v5c0 4.8 3.2 8.8 7.5 9.8 4.3-1 7.5-5 7.5-9.8v-5L12 3.2z") + P("M12 8.5v6M9 11.5h6"),
    },
    {
      title: "Hotels, Resorts & Cruise Lines",
      line: "On-site clinics, emergency response and integrated medical services for guests.",
      ic: P("M3 20.5h18") + P("M4.5 20.5V6a1.5 1.5 0 0 1 1.5-1.5h6a1.5 1.5 0 0 1 1.5 1.5v4") + P("M7.5 8h2M7.5 11.5h2M7.5 15h2") + P("M16.5 10v1.5") + P("M13 16.5c0-2 1.5-3.5 3.5-3.5s3.5 1.5 3.5 3.5h-7z") + P("M12 18h9M14.5 18v2.5h4V18"),
    },
    {
      title: "Tour Operators & Travel Agencies",
      line: "Medical support for travellers, from emergency response to access to care.",
      ic: P("M6 7.5h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2z") + P("M9 7.5V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v2.5") + P("M9 7.5v13M15 7.5v13"),
    },
    {
      title: "Embassies & Government Institutions",
      line: "Medical support for diplomatic missions, consular staff and delegations.",
      ic: P("M3 7.5L12 3.2l9 4.3H3z") + P("M2.5 8.8h19") + P("M5.5 8.8v8.7M9.8 8.8v8.7M14.2 8.8v8.7M18.5 8.8v8.7") + P("M3.5 17.5h17M2 20.5h20"),
    },
    {
      title: "Corporate Clients & International Organisations",
      line: "Tailored healthcare for companies working across borders.",
      ic: P("M3.5 7.5h17a1.5 1.5 0 0 1 1.5 1.5v10a1.5 1.5 0 0 1-1.5 1.5H3.5A1.5 1.5 0 0 1 2 19V9a1.5 1.5 0 0 1 1.5-1.5z") + P("M8.5 7.5V5a1.5 1.5 0 0 1 1.5-1.5h4A1.5 1.5 0 0 1 15.5 5v2.5") + P("M2 12.5h20M10.5 11h3v3h-3z"),
    },
    {
      title: "Healthcare Providers",
      line: "Partnerships, referrals and access to international patient flow.",
      ic: P("M6.5 3.5h2M15.5 3.5h2") + P("M7.5 3.5v3.8a4.5 4.5 0 0 0 9 0V3.5") + P("M12 11.8v2.2a4 4 0 0 0 8 0v-3.5") + C(20, 8.5, 2) + P("M19 8.5h2"),
    },
  ];

  const PROMISES = [
    {
      title: "Full patient ownership",
      ic: C(12, 12, 9.5) + C(12, 9.2, 2.8) + P("M6.8 18.2a5.5 5.5 0 0 1 10.4 0"),
    },
    {
      title: "Speed when every moment matters",
      ic: P("M10 2h4M12 2v2.5") + C(12, 13.5, 7.8) + P("M12 13.5l3.2-3.2") + P("M18 7.5l1.5-1.5"),
    },
    {
      title: "International standards",
      ic: C(11, 11, 7.5) + P("M3.5 11h15M11 3.5c2 2 3 4.5 3 7.5s-1 5.5-3 7.5M11 3.5c-2 2-3 4.5-3 7.5s1 5.5 3 7.5") + P("M14.5 18l2.2 2.2 4.8-4.8"),
    },
    {
      title: "Care inside hospitality",
      ic: C(7.5, 12, 4) + C(7.5, 12, 1.8) + P("M11.5 12h9") + P("M17.5 12v3M20.5 12v2"),
    },
  ];

  const typeItem = (t, i) => `
<div class="pt-item pt-item-${i} {{cls${i}}}">
  <button type="button" class="pt-tab {{cls${i}}}" onClick="{{pick${i}}}" aria-pressed="{{on${i}}}">
    <span class="pt-tab-txt">${t.title}</span>
    <span class="pt-tab-arr" aria-hidden="true"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${P("M6 9l6 6 6-6")}</svg></span>
  </button>
  <sc-if value="{{on${i}}}" hint-placeholder-val="{{ ${i === 0} }}">
    <div class="pt-panel">
      ${icon(t.ic)}
      <h3 class="pt-panel-t">${t.title}</h3>
      <p class="pt-panel-p">${t.line}</p>
    </div>
  </sc-if>
</div>`;

  const promiseItem = (p, i) => `
<div class="pt-prom hov rv" role="listitem" style="--d:${240 + i * 80}">
  ${icon(p.ic)}
  <h4 class="pt-prom-t">${p.title}</h4>
</div>`;

  const css = `${kit.TOKENS(k)}
${kit.ICONS(k, 56)}

/* Header and selector */
.pt-head{display:flex;flex-direction:column;gap:18px}
.pt-selector{
  display:grid;
  grid-template-columns:minmax(360px,440px) minmax(0,1fr);
  grid-template-rows:repeat(6,56px);
  column-gap:clamp(40px,6cqi,96px);
  row-gap:8px;
  align-items:stretch;
  margin-top:64px;
}
.pt-item{display:contents}
.pt-selector sc-if{display:contents}

.pt-tab{
  grid-column:1;
  width:100%;
  height:56px;
  min-height:56px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:0 20px 0 22px;
  background:transparent;
  border:none;
  border-left:2px solid transparent;
  color:var(--ink2);
  font:600 17px/1.3 var(--sans);
  text-align:left;
  cursor:pointer;
  transition:color .25s var(--ease),border-color .25s var(--ease),background-color .25s var(--ease);
}
.pt-tab:hover{
  color:var(--ink);
  background:rgba(255,255,255,.02);
}
.pt.light .pt-tab:hover{
  background:rgba(0,0,0,.02);
}
.pt-tab.on,
.pt-tab[aria-pressed="true"]{
  color:var(--accent);
  border-left-color:var(--accent);
  background:rgba(18,192,198,.05);
}
.pt-tab:focus-visible{
  outline:2px solid var(--accent);
  outline-offset:2px;
}

.pt-item-0 .pt-tab{grid-row:1}
.pt-item-1 .pt-tab{grid-row:2}
.pt-item-2 .pt-tab{grid-row:3}
.pt-item-3 .pt-tab{grid-row:4}
.pt-item-4 .pt-tab{grid-row:5}
.pt-item-5 .pt-tab{grid-row:6}

.pt-tab-arr{display:none}

/* Desktop Panel */
.pt-panel{
  grid-column:2;
  grid-row:1 / span 6;
  min-height:376px;
  background:var(--card);
  border:1px solid var(--line);
  border-radius:24px;
  padding:clamp(36px,5cqi,56px);
  display:flex;
  flex-direction:column;
  justify-content:center;
  align-items:flex-start;
  gap:22px;
  animation:ptFadeIn .5s var(--ease) both;
  transition:border-color 1s var(--sweep-ease) 1s,background-color 1.3s var(--sweep-ease) .9s;
}
@keyframes ptFadeIn{
  from{opacity:0;transform:translateY(10px)}
  to{opacity:1;transform:translateY(0)}
}

.pt-panel .ic{
  width:64px;
  height:64px;
  background:var(--paper);
  transition:border-color .45s var(--ease),background-color 1.3s var(--sweep-ease) .9s;
}
.pt-panel .ic svg{
  width:32px;
  height:32px;
}
.pt-panel-t{
  margin:0;
  font-family:var(--serif);
  font-size:40px;
  font-weight:600;
  font-synthesis:weight;
  line-height:1.15;
  letter-spacing:-.01em;
  color:var(--ink);
  text-wrap:balance;
  transition:color 1s var(--sweep-ease) 1s;
}
.pt-panel-p{
  margin:0;
  font-size:20px;
  line-height:1.55;
  color:var(--ink2);
  max-width:48ch;
  text-wrap:pretty;
  transition:color 1s var(--sweep-ease) 1s;
}

/* Promises Row */
.pt-proms{
  margin-top:clamp(64px,8cqi,96px);
  display:grid;
  grid-template-columns:repeat(4,minmax(0,1fr));
  gap:clamp(24px,3.5cqi,48px);
}
.pt-prom{
  display:flex;
  flex-direction:column;
  align-items:flex-start;
  gap:16px;
  min-width:0;
}
.pt-prom .ic{
  width:48px;
  height:48px;
  background:var(--paper);
  transition:border-color .45s var(--ease),background-color 1.3s var(--sweep-ease) .9s;
}
.pt-prom .ic svg{
  width:24px;
  height:24px;
}
.pt-prom-t{
  margin:0;
  font-family:var(--serif);
  font-size:22px;
  font-weight:600;
  font-synthesis:weight;
  line-height:1.25;
  color:var(--ink);
  text-wrap:pretty;
  transition:color 1s var(--sweep-ease) 1s;
}

/* Insurer Band */
.pt-band{
  margin-top:clamp(64px,8cqi,104px);
  padding-top:clamp(40px,5cqi,56px);
  border-top:1px solid var(--line);
  position:relative;
  display:grid;
  grid-template-columns:minmax(0,5fr) minmax(0,7fr);
  gap:clamp(32px,5cqi,80px);
  align-items:center;
  transition:border-color 1s var(--sweep-ease) 1s;
}
.pt-band:before{
  content:"";
  position:absolute;
  left:0;
  right:0;
  top:-1px;
  height:1px;
  background:var(--accent);
  transform-origin:left;
}
.pt.arm .pt-band:before{transform:scaleX(0)}
.pt.in .pt-band:before{transform:scaleX(1);transition:transform 1.8s var(--ease) .3s}

.pt-band-t{
  margin:0;
  font-family:var(--serif);
  font-size:30px;
  font-weight:600;
  font-synthesis:weight;
  line-height:1.25;
  color:var(--ink);
  text-wrap:balance;
  transition:color 1s var(--sweep-ease) 1s;
}
.pt-band-r{
  display:flex;
  flex-direction:column;
  gap:8px;
}
.pt-band-lead{
  margin:0;
  font-size:18px;
  font-weight:500;
  line-height:1.5;
  color:var(--ink);
  transition:color 1s var(--sweep-ease) 1s;
}
.pt-band-sub{
  margin:0;
  font-size:16px;
  line-height:1.5;
  color:var(--ink2);
  transition:color 1s var(--sweep-ease) 1s;
}

/* Phone Layout */
@container pt (max-width:900px){
  .pt-selector{
    display:flex;
    flex-direction:column;
    gap:12px;
    margin-top:40px;
  }
  .pt-item{
    display:block;
    border:1px solid var(--line);
    border-radius:16px;
    background:var(--card);
    overflow:hidden;
    transition:border-color .3s var(--ease);
  }
  .pt-item.on{
    border-color:var(--accent);
  }
  .pt-selector sc-if{
    display:block;
  }
  .pt-tab{
    width:100%;
    min-height:56px;
    height:auto;
    padding:16px 20px;
    border-left:none;
    font-size:16px;
  }
  .pt-tab.on,
  .pt-tab[aria-pressed="true"]{
    border-left:none;
    background:transparent;
  }
  .pt-tab-arr{
    display:inline-flex;
    margin-left:12px;
    flex:none;
    color:var(--muted);
    transition:transform .3s var(--ease),color .3s var(--ease);
  }
  .pt-tab.on .pt-tab-arr,
  .pt-tab[aria-pressed="true"] .pt-tab-arr{
    transform:rotate(180deg);
    color:var(--accent);
  }
  .pt-panel{
    min-height:0;
    border:none;
    border-top:1px solid var(--line);
    border-radius:0;
    background:transparent;
    padding:22px 20px 26px;
    gap:16px;
  }
  .pt-panel .ic{
    width:52px;
    height:52px;
  }
  .pt-panel .ic svg{
    width:26px;
    height:26px;
  }
  .pt-panel-t{
    font-size:26px;
    line-height:1.2;
  }
  .pt-panel-p{
    font-size:16px;
    line-height:1.5;
  }

  .pt-proms{
    grid-template-columns:repeat(2,minmax(0,1fr));
    gap:28px 20px;
    margin-top:48px;
  }
  .pt-prom-t{
    font-size:19px;
  }

  .pt-band{
    grid-template-columns:minmax(0,1fr);
    gap:18px;
    margin-top:52px;
    padding-top:32px;
  }
  .pt-band-t{
    font-size:24px;
    line-height:1.25;
  }
  .pt-band-lead{
    font-size:16px;
  }
  .pt-band-sub{
    font-size:15px;
  }
}

@container pt (max-width:370px){
  .pt-tab{font-size:15px;padding:14px 16px}
  .pt-panel{padding:18px 16px 22px}
  .pt-panel-t{font-size:23px}
  .pt-prom-t{font-size:17px}
  .pt-band-t{font-size:22px}
}

${kit.REVEAL(k)}
@media (prefers-reduced-motion:reduce){
  .pt-panel{animation:none!important}
  .pt-band:before{transform:scaleX(1)!important}
}`;

  const body = `<section class="pt {{cls}}" ref="{{rootRef}}" aria-labelledby="pt-h"><div class="in-w">
  <div class="pt-head">
    <p class="eye rv">For partners</p>
    <h2 class="h2 rv" id="pt-h" style="--d:80">Built for the partners who <span class="acc">trust us with their people</span>.</h2>
  </div>

  <div class="pt-selector rv" style="--d:160">
    ${TYPES.map(typeItem).join("")}
  </div>

  <div class="pt-proms" role="list">
    ${PROMISES.map(promiseItem).join("")}
  </div>

  <div class="pt-band">
    <h3 class="pt-band-t rv" style="--d:120">Trusted by global insurance &amp; assistance networks</h3>
    <div class="pt-band-r rv" style="--d:180">
      <p class="pt-band-lead">Direct integration. Faster decisions. Seamless care delivery.</p>
      <p class="pt-band-sub">A fully cashless patient experience</p>
    </div>
  </div>
</div></section>`;

  const vals = `    const sel = s.sel === undefined ? 0 : s.sel;
    const set = (i) => this.setState({ sel: i });
    return {
      rootRef, cls: ${kit.CLS},
      on0: sel === 0, on1: sel === 1, on2: sel === 2, on3: sel === 3, on4: sel === 4, on5: sel === 5,
      cls0: sel === 0 ? 'on' : '', cls1: sel === 1 ? 'on' : '', cls2: sel === 2 ? 'on' : '',
      cls3: sel === 3 ? 'on' : '', cls4: sel === 4 ? 'on' : '', cls5: sel === 5 ? 'on' : '',
      pick0: () => set(0), pick1: () => set(1), pick2: () => set(2),
      pick3: () => set(3), pick4: () => set(4), pick5: () => set(5),
    };`;

  return { css, body, vals, h: 1300, ph: 1680 };
};
