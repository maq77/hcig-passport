// 10 · Partner with us: the closing call and the footer (COPY.md).
// A large centred panel with a soft Turquoise radial glow, then the four-column footer.
export default ({ kit }) => {
  const k = "ct", { ARROW } = kit;
  const css = `${kit.TOKENS(k)}
${kit.BUTTONS(k)}
.ct-call{position:relative;display:flex;justify-content:center}
.ct-glow{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:min(1120px,96cqi);height:min(720px,100%);border-radius:50%;background:radial-gradient(ellipse at center,rgba(18,192,198,.18) 0%,rgba(18,192,198,0) 70%);pointer-events:none;z-index:0;filter:blur(32px)}
.ct.arm .ct-glow{opacity:0}.ct.in .ct-glow{opacity:1;transition:opacity 1.4s var(--ease) .3s}
.ct-panel{position:relative;z-index:1;width:100%;max-width:1080px;margin:0 auto;padding:84px clamp(28px,5cqi,80px);text-align:center;border-radius:32px;border:1px solid var(--line);background:var(--card);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);box-shadow:0 30px 90px -40px rgba(0,0,0,.6);transition:border-color 1s var(--sweep-ease) 1s,background-color 1.3s var(--sweep-ease) .9s,box-shadow 1.3s var(--sweep-ease) .9s}
.ct.light .ct-panel{box-shadow:0 30px 90px -40px rgba(0,0,0,.08)}
.ct-eye{margin-bottom:20px}
.ct-h2{font-size:72px;line-height:1.04;letter-spacing:-.015em;max-width:22ch;margin:0 auto}
.ct-lead{max-width:52ch;margin:24px auto 0;text-align:center}
.ct-btns{display:flex;align-items:center;justify-content:center;gap:16px;margin-top:40px;flex-wrap:wrap}
.ct-news{margin-top:48px;display:flex;justify-content:center}
.ct-form{display:inline-flex;flex-direction:column;align-items:center;width:100%}
.ct-form-row{display:inline-flex;align-items:center;gap:14px}
.ct-label{font:600 13px/1 var(--sans);letter-spacing:.12em;text-transform:uppercase;color:var(--muted);white-space:nowrap;transition:color 1s var(--sweep-ease) 1s}
.ct-input{width:260px;min-height:56px;padding:0 22px;border-radius:999px;background:var(--paper);border:1px solid var(--line);color:var(--ink);font:400 15px/1 var(--sans);outline:none;transition:border-color .3s,color 1s var(--sweep-ease) 1s,background-color 1.3s var(--sweep-ease) .9s}
.ct-input::placeholder{color:var(--muted);opacity:.7}
.ct-input:focus-visible{border-color:var(--accent);outline:2px solid var(--accent);outline-offset:2px}
.ct-sub{min-height:56px;padding:0 28px}
.ct-live{min-height:56px;display:flex;align-items:center;justify-content:center}
.ct-thanks{margin:0;font:600 16px/1 var(--sans);color:var(--accent);letter-spacing:.02em;display:inline-flex;align-items:center;gap:8px}
.ct-dot{width:8px;height:8px;border-radius:50%;background:var(--accent);display:inline-block}
.ct-foot{margin-top:clamp(80px,10cqi,140px);padding-top:clamp(48px,6cqi,80px);border-top:1px solid var(--line);transition:border-color 1s var(--sweep-ease) 1s}
.ct-foot-cols{display:grid;grid-template-columns:minmax(0,3.2fr) minmax(0,2fr) minmax(0,3fr) minmax(0,2.2fr);gap:clamp(32px,4cqi,64px);align-items:start}
.ct-col{display:flex;flex-direction:column;min-width:0}
.ct-mark{margin:0;font-family:var(--serif);font-weight:600;font-synthesis:weight;font-size:22px;line-height:1.25;letter-spacing:-.01em;color:var(--ink);max-width:14ch;transition:color 1s var(--sweep-ease) 1s}
.ct-col-h{margin:0 0 18px;font:600 13px/1.3 var(--sans);letter-spacing:.14em;text-transform:uppercase;color:var(--muted);transition:color 1s var(--sweep-ease) 1s}
.ct-gap{height:35px}
.ct-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:12px}
.ct-link{font-size:15px;line-height:1.5;color:var(--ink2);text-decoration:none;transition:color .25s var(--ease)}
.ct-link:hover{color:var(--accent)}
.ct-link:focus-visible{outline:2px solid var(--accent);outline-offset:3px}
.ct-addrs{gap:18px}
.ct-addr{font-size:15px;line-height:1.6;color:var(--ink2);transition:color 1s var(--sweep-ease) 1s}
.ct-social{display:flex;flex-wrap:wrap;gap:16px;margin-top:20px;padding-top:16px;border-top:1px solid var(--line);transition:border-color 1s var(--sweep-ease) 1s}
.ct-bottom{margin-top:clamp(48px,6cqi,80px);padding-top:28px;border-top:1px solid var(--line);transition:border-color 1s var(--sweep-ease) 1s}
.ct-copy{margin:0;font-size:13px;line-height:1.5;color:var(--muted);transition:color 1s var(--sweep-ease) 1s}
@container ct (max-width:900px){
  .ct-panel{padding:48px 24px 44px;border-radius:24px}
  .ct-h2{font-size:40px;line-height:1.08}
  .ct-lead{font-size:17px;line-height:1.5;margin-top:18px}
  .ct-btns{flex-direction:column;gap:12px;margin-top:32px}
  .ct-news{margin-top:36px;width:100%}
  .ct-form-row{flex-direction:column;align-items:stretch;gap:10px;width:100%}
  .ct-label{text-align:center;margin-bottom:2px}
  .ct-input{width:100%;min-height:54px;text-align:center}
  .ct-sub{width:100%;min-height:54px}
  .ct-foot{margin-top:64px;padding-top:40px}
  .ct-foot-cols{grid-template-columns:minmax(0,1fr);gap:36px}
  .ct-gap{display:none}
  .ct-list{gap:0}
  .ct-link{min-height:44px;display:inline-flex;align-items:center;width:100%}
  .ct-social{flex-direction:column;gap:0;margin-top:14px;padding-top:14px}
  .ct-social .ct-link{min-height:44px}
  .ct-bottom{margin-top:36px;padding-top:20px}
}
@container ct (max-width:370px){
  .ct-h2{font-size:32px}
  .ct-panel{padding-left:16px;padding-right:16px}
  .ct-lead{font-size:16px}
}
${kit.REVEAL(k)}
@media (prefers-reduced-motion:reduce){
  .ct-panel{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}
  .ct-glow{display:none!important}
}`;

  const body = `<section id="partner" class="ct {{cls}}" ref="{{rootRef}}" aria-labelledby="ct-h"><div class="in-w">
<div class="ct-call">
<div class="ct-glow" aria-hidden="true"></div>
<div class="ct-panel">
<p class="eye ct-eye rv">Partner with us</p>
<h2 class="h2 ct-h2 rv" id="ct-h" style="--d:80">Let's build healthcare <span class="acc">without fragmentation.</span></h2>
<p class="lead ct-lead rv" style="--d:140">Partner with HCIG to deliver structured, reliable, and internationally integrated healthcare solutions.</p>
<div class="ct-btns rv" style="--d:200">
<a href="#partner" class="btn">Become a Partner${ARROW}</a>
<a href="mailto:partner@healthcareig.com" class="btn2">Talk to our team</a>
</div>
<div class="ct-news rv" style="--d:260">
<form class="ct-form" onSubmit="{{subscribe}}">
<sc-if value="{{notSent}}" hint-placeholder-val="{{ true }}">
<div class="ct-form-row">
<label for="ct-email" class="ct-label">News from HCIG</label>
<input id="ct-email" class="ct-input" type="email" required placeholder="Work email" autocomplete="email">
<button type="submit" class="btn2 ct-sub" onClick="{{subscribe}}">Subscribe</button>
</div>
</sc-if>
<div class="ct-live" role="status" aria-live="polite">
<sc-if value="{{sent}}" hint-placeholder-val="{{ false }}">
<p class="ct-thanks"><span class="ct-dot" aria-hidden="true"></span>Thank you.</p>
</sc-if>
</div>
</form>
</div>
</div>
</div>
<footer class="ct-foot" aria-label="Footer">
<div class="ct-foot-cols">
<div class="ct-col ct-col-1 rv" style="--d:320">
<p class="ct-mark">Healthcare International Group</p>
</div>
<div class="ct-col ct-col-2 rv" style="--d:380">
<h3 class="ct-col-h">Contact</h3>
<ul class="ct-list">
<li><a href="tel:+201001828828" class="ct-link">+2 01001828828</a></li>
<li><a href="tel:+201287766078" class="ct-link">+2 01287766078</a></li>
<li><a href="mailto:partner@healthcareig.com" class="ct-link">partner@healthcareig.com</a></li>
</ul>
</div>
<div class="ct-col ct-col-3 rv" style="--d:440">
<div class="ct-gap" aria-hidden="true"></div>
<ul class="ct-list ct-addrs">
<li class="ct-addr">123 Hassan ElMaamoun St., Sixth Floor, Suite 604, Nasr City, Cairo, Egypt</li>
<li class="ct-addr">2251 Drew St, Suite A, Clearwater, FL 33765, Florida, USA</li>
</ul>
</div>
<div class="ct-col ct-col-4 rv" style="--d:500">
<div class="ct-gap" aria-hidden="true"></div>
<nav class="ct-nav" aria-label="Footer Navigation">
<ul class="ct-list">
<li><a href="#top" class="ct-link">Home</a></li>
<li><a href="#who" class="ct-link">About Us</a></li>
<li><a href="#deliver" class="ct-link">Services</a></li>
<li><a href="#partners" class="ct-link">For Partners</a></li>
<li><a href="#partner" class="ct-link">Contact</a></li>
<li><a href="#blog" class="ct-link">Blog</a></li>
</ul>
</nav>
<div class="ct-social" aria-label="Social Media">
<a href="https://www.facebook.com/profile.php?id=61573961671310" target="_blank" rel="noopener" class="ct-link">Facebook</a>
<a href="https://www.linkedin.com/company/healthcareig/" target="_blank" rel="noopener" class="ct-link">LinkedIn</a>
<a href="https://www.instagram.com/hcig.egypt" target="_blank" rel="noopener" class="ct-link">Instagram</a>
</div>
</div>
</div>
<div class="ct-bottom rv" style="--d:560">
<p class="ct-copy">© 2026 Healthcare International Group. All Rights Reserved.</p>
</div>
</footer>
</div></section>`;

  const vals = `    const set = (o) => this.setState(o);
    const sent = !!s.sent;
    return {
      rootRef,
      cls: ${kit.CLS},
      sent,
      notSent: !sent,
      subscribe: (e) => {
        if (e && e.preventDefault) e.preventDefault();
        const form = e && e.target && (e.target.tagName === 'FORM' ? e.target : e.target.form);
        if (form && form.checkValidity && !form.checkValidity()) {
          if (form.reportValidity) form.reportValidity();
          return;
        }
        set({ sent: true });
      },
    };`;

  return { css, body, vals, h: 1280, ph: 1860 };
};
