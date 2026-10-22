// The group section: the full film with a sound button, the eight brands under it. Brand palette only (2026-10-22).
// Night and day are both in the page and crossfade with the hero's timing, so a page can switch them together.
export const groupFilm = (B, PHONE_DAY) => {
  // short name on the list; the live full name and line in the hover card; the live site link (MedOne has no site, its live card links to Facebook)
  const brands = [
    ["24/7 Clinic", "24/7 Clinic", "On-Site Urgent Care &amp; Emergency Services in Hotels &amp; Resorts", "https://www.247clinic.net/", "logo-247"],
    ["MedPark", "MedPark Health Group", "Advanced Hospital &amp; Emergency Medical Services", "http://www.medparkhospitals.com/", "logo-medpark"],
    ["MedOne", "MedOne Group", "Travel Medical Services &amp; Care Coordination", "https://www.facebook.com/profile.php?id=61573961671310", "logo-medone"],
    ["TMASI", "TMASI GLOBAL", "International Medical Assistance &amp; Case Coordination", "https://tmasi.net/", "logo-tmasi"],
    ["One Medical Center", "One Medical Center (Florida - USA)", "Urgent Care &amp; Outpatient Medical Services", "https://www.onemedicalcenters.com/", "logo-onemedical"],
    ["One Medical Spa", "One Medical Spa (Florida - USA)", "Aesthetic &amp; Medical Wellness Services", "https://www.onemedspa.net/", "logo-onespa"],
    ["SCMG", "Shakankiry Clinics Medical Group", "Travel Medical Services", "https://scmg-egypt.com/", "logo-scmg"],
    ["UCA MENA", "UCA MENA", "Urgent Care Association Egypt &amp; MENA", "https://ucamena.org/", "logo-uca"],
  ];
  const icon = (d) => `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const SPK = '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/>';
  const label = "The HCIG group film: the HC mark opens into the eight group brands";
  const vid = (cls, th, src, poster) => `<video class="${cls}" data-th="${th}" src="${src}" poster="${poster}" muted="" loop="" playsinline="" preload="auto" ref="{{vref}}" aria-label="${label}"></video>`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>HCIG v3 Group film section</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&amp;family=Bodoni+Moda:opsz,wght@6..96,400&amp;display=swap">
<style>
@font-face{font-family:'Helma';src:url('/_blob/dd74c2cb45ea68cbd798ea38d33c7729') format('woff2');font-weight:400;font-style:normal;font-display:swap}
body{margin:0}
.gf{--accent:#12C0C6;--ink:#FFFFFF;--ink2:#DDDDDF;--line:#333333;--paper:#000000;--serif:'Helma','Bodoni Moda',Didot,Georgia,serif;--sans:'Inter',system-ui,-apple-system,'Segoe UI',Arial,sans-serif;--gutter:clamp(20px,5cqi,80px);--ease:cubic-bezier(.16,1,.3,1);--sweep-ease:cubic-bezier(.45,.05,.35,1);
  container-type:inline-size;container-name:gf;background:var(--paper);color:var(--ink);font-family:var(--sans);-webkit-font-smoothing:antialiased;font-synthesis:none;
  transition:background-color 1.3s var(--sweep-ease) .9s,color 1s var(--sweep-ease) 1s}
.gf.light{--ink:#000000;--ink2:#565759;--line:#DDDDDF;--paper:#FFFFFF}
.gf-in{display:flex;flex-direction:column;gap:36px;padding:112px var(--gutter) 104px;max-width:1440px;margin:0 auto;box-sizing:border-box}
.gf-head{display:flex;flex-direction:column;gap:14px;align-items:center;text-align:center}
.gf-eye{margin:0;font:600 13px/1 var(--sans);letter-spacing:.16em;text-transform:uppercase;color:var(--accent);transition:color 1s var(--sweep-ease) 1s}
.gf-h{margin:0;font-family:var(--serif);font-weight:600;font-synthesis:weight;font-size:54px;line-height:1.08;letter-spacing:-.01em;text-wrap:balance;max-width:20ch}
.gf-film{position:relative;width:100%;max-width:1280px;margin:0 auto}
.gf-layer{transition:opacity 1.3s var(--sweep-ease) .9s}
.gf-d{position:absolute;inset:0}
.gf:not(.light) .gf-d,.gf.light .gf-n{opacity:0}
.gf-film video{display:block;width:100%;height:auto}
.gf-film .gf-tall{display:none}
.gf-sound{position:absolute;right:16px;bottom:16px;display:inline-flex;align-items:center;gap:10px;min-height:44px;padding:0 18px;border-radius:999px;border:1px solid var(--line);background:color-mix(in srgb,var(--paper) 72%,transparent);color:var(--ink);font:500 14px/1 var(--sans);cursor:pointer;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);transition:border-color .3s,background-color 1.3s var(--sweep-ease) .9s,color 1s var(--sweep-ease) 1s}
.gf-sound:hover{border-color:var(--accent)}
.gf-sound:focus-visible{outline:2px solid var(--accent);outline-offset:3px}
.gf-brands{list-style:none;margin:0;padding:24px 0 0;border-top:1px solid var(--line);display:flex;flex-wrap:wrap;justify-content:center;gap:10px 36px;transition:border-color 1s var(--sweep-ease) 1s}
.gf-brands li{position:relative}
.gf-brands a{display:inline-flex;align-items:center;gap:10px;min-height:44px;color:var(--ink2);text-decoration:none;font:500 15px/1 var(--sans);transition:color .25s}
.gf-brands a:hover,.gf-brands a:focus-visible{color:var(--accent)}
.gf-chip{display:none}
/* hover or keyboard focus: the company's own logo rises above its name, on white so every logo shows in its own colours */
.gf-card{position:absolute;left:50%;bottom:calc(100% + 14px);z-index:5;width:260px;padding:20px 20px 18px;border-radius:18px;background:#FFFFFF;color:#000000;box-shadow:0 0 0 1px #DDDDDF,0 30px 60px -24px rgba(0,0,0,.45);display:grid;gap:12px;justify-items:center;text-align:center;pointer-events:none;opacity:0;transform:translate(-50%,10px) scale(.96);transform-origin:50% 100%;transition:opacity .25s var(--ease),transform .45s var(--ease)}
.gf-card:after{content:"";position:absolute;left:50%;top:100%;width:12px;height:12px;background:#FFFFFF;transform:translate(-50%,-6px) rotate(45deg);box-shadow:1px 1px 0 #DDDDDF}
.gf-card img{display:block;height:64px;width:auto;max-width:200px;object-fit:contain}
.gf-card b{font:600 14px/1.3 var(--sans);color:#000000}
.gf-card small{font:400 13px/1.45 var(--sans);color:#565759}
.gf-brands li:hover .gf-card,.gf-brands li:focus-within .gf-card{opacity:1;transform:translate(-50%,0) scale(1)}
.gf-brands a:focus-visible{outline:2px solid var(--accent);outline-offset:4px;border-radius:4px}
/* phone first: the tall cut fills the width, the words above, the brands as two columns */
@container gf (max-width:700px){
  .gf-in{padding:72px var(--gutter) 64px;gap:28px}
  .gf-h{font-size:34px;line-height:1.12}
  .gf-film .gf-wide{display:none}.gf-film .gf-tall{display:block}
  .gf-film{margin:0 calc(var(--gutter) * -1);width:auto}
  .gf-sound{right:var(--gutter);bottom:20px}
  .gf-brands{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 16px;padding-top:12px}
  .gf-brands a{min-height:60px;border-bottom:1px solid var(--line);width:100%}
  /* phone: no hover, so each name carries its logo on a small white chip */
  .gf-chip{display:flex;flex:none;align-items:center;justify-content:center;width:44px;height:44px;border-radius:12px;background:#FFFFFF;box-shadow:0 0 0 1px #DDDDDF;padding:5px}
  .gf-chip img{display:block;max-width:100%;max-height:100%;object-fit:contain}
  .gf-card{display:none}
}
@media (prefers-reduced-motion:reduce){.gf,.gf-layer,.gf-sound,.gf-eye{transition:none}}
</style>
</helmet>
<section class="gf {{themeCls}}" aria-labelledby="gf-h"><div class="gf-in">
<div class="gf-head"><p class="gf-eye">Healthcare International Group</p><h2 class="gf-h" id="gf-h">Integrated healthcare group all over the world</h2></div>
<div class="gf-film">
<div class="gf-layer gf-n">${vid("gf-wide", "dark", B["film-full-night-black"], B["film-poster-dark-1920x1080-black"])}${vid("gf-tall", "dark", B["film-full-phone-night-black"], B["film-poster-dark-1080x1920-black"])}</div>
<div class="gf-layer gf-d">${vid("gf-wide", "light", B["film-full-day"], B["film-poster-light-1920x1080"])}${vid("gf-tall", "light", PHONE_DAY, B["film-poster-light-1080x1920"])}</div>
<button type="button" class="gf-sound" onClick="{{toggleSound}}" aria-pressed="{{soundPressed}}"><sc-if value="{{soundOn}}" hint-placeholder-val="{{ false }}">${icon(SPK + '<path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>')}<span>Sound off</span></sc-if><sc-if value="{{soundOff}}" hint-placeholder-val="{{ true }}">${icon(SPK + '<path d="M16 9.5l5 5M21 9.5l-5 5"/>')}<span>Play with sound</span></sc-if></button>
</div>
<ul class="gf-brands" aria-label="The group brands">${brands.map(([n, full, line, url, logo]) => `<li><a href="${url}" target="_blank" rel="noopener"><span class="gf-chip" aria-hidden="true"><img src="${B[logo]}" alt=""></span><span>${n}</span></a><span class="gf-card" aria-hidden="true"><img src="${B[logo]}" alt="${full} logo"><b>${full}</b><small>${line}</small></span></li>`).join("")}</ul>
</div></section>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{"theme":{"editor":"enum","options":["dark","light"],"default":"dark","section":"Section"},"$preview":{"width":1440,"height":1210}}'>
class Component extends DCLogic {
  // only the film of the current theme, at the current size, is heard; the other plays muted under the crossfade
  syncSound() {
    const theme = this.props.theme === 'light' ? 'light' : 'dark', on = !!(this.state && this.state.sound);
    const vs = [...(this.vids || [])].filter((v) => v.isConnected);
    const lead = vs.find((v) => v.dataset.th === theme && v.offsetParent !== null);
    for (const v of vs) {
      const hear = on && v === lead;
      if (hear && v.muted) { const from = vs.find((o) => o !== v && !o.muted); if (from) v.currentTime = from.currentTime; }
      v.muted = !hear;
    }
  }
  componentDidUpdate(prev) { if ((prev.theme || 'dark') !== (this.props.theme || 'dark')) this.syncSound(); }
  renderVals() {
    const s = this.state || {};
    const theme = this.props.theme === 'light' ? 'light' : 'dark';
    this.vids = this.vids || new Set();
    const vref = this.vref || (this.vref = (el) => {
      if (!el) return;
      this.vids.add(el);
      el.muted = true; el.loop = true; el.playsInline = true; el.setAttribute('playsinline', '');
      if (el.offsetParent !== null && !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) { const p = el.play(); if (p && p.catch) p.catch(() => {}); }
    });
    return {
      vref,
      themeCls: theme,
      soundOn: !!s.sound, soundOff: !s.sound, soundPressed: s.sound ? 'true' : 'false',
      toggleSound: () => {
        const on = !s.sound;
        const vs = [...this.vids].filter((v) => v.isConnected && v.offsetParent !== null);
        if (on) for (const v of vs) v.currentTime = 0;
        for (const v of vs) { const p = v.play(); if (p && p.catch) p.catch(() => {}); }
        this.setState({ sound: on }, () => this.syncSound());
      },
    };
  }
}
</script>
</body>
</html>
`;
};
