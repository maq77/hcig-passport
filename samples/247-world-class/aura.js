/* ==========================================================================
   world-class-aura · aura.js
   Tiny, dependency-free sensory decorators. Works next to Bootstrap or alone.
     data-aura-reveal            content flows in on scroll (data-aura-delay="120")
     data-aura-magnetic          leans toward the cursor (data-aura-strength="0.35")
     data-aura-tilt              tilts toward the cursor with a spotlight (data-aura-max="5")
     data-aura-scrolled="80"     on <header>: adds .is-scrolled after 80px
   Every effect is skipped under prefers-reduced-motion, and pointer effects
   only run on devices with a fine pointer.
   ========================================================================== */
(() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* Reveal */
  const reveals = document.querySelectorAll('[data-aura-reveal]');
  if (!reduce && 'IntersectionObserver' in window && reveals.length) {
    root.classList.add('aura-ready');
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add('is-shown');
        io.unobserve(e.target);
      }
    }, { rootMargin: '0px 0px -12% 0px' });
    reveals.forEach((el) => {
      if (el.dataset.auraDelay) el.style.setProperty('--aura-delay', `${parseInt(el.dataset.auraDelay, 10)}ms`);
      io.observe(el);
    });
  }

  /* Header state */
  document.querySelectorAll('[data-aura-scrolled]').forEach((el) => {
    const at = parseInt(el.dataset.auraScrolled, 10) || 80;
    const update = () => el.classList.toggle('is-scrolled', window.scrollY > at);
    update();
    addEventListener('scroll', update, { passive: true });
  });

  if (reduce || !fine) return;

  /* Magnetic */
  document.querySelectorAll('[data-aura-magnetic]').forEach((el) => {
    const strength = parseFloat(el.dataset.auraStrength) || 0.35;
    const max = parseFloat(el.dataset.auraMax) || 10;
    const clamp = (v) => Math.max(-max, Math.min(max, v));
    let raf = 0, tx = 0, ty = 0, x = 0, y = 0;
    const loop = () => {
      x += (tx - x) * 0.18; y += (ty - y) * 0.18;
      el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
      raf = (Math.abs(tx - x) > 0.05 || Math.abs(ty - y) > 0.05) ? requestAnimationFrame(loop) : 0;
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      tx = clamp((e.clientX - (r.left + r.width / 2)) * strength);
      ty = clamp((e.clientY - (r.top + r.height / 2)) * strength);
      kick();
    });
    el.addEventListener('pointerleave', () => { tx = 0; ty = 0; kick(); });
  });

  /* Tilt and spotlight */
  document.querySelectorAll('[data-aura-tilt]').forEach((el) => {
    const max = parseFloat(el.dataset.auraMax) || 5;
    let raf = 0;
    el.addEventListener('pointermove', (e) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        el.style.setProperty('--x', `${(px * 100).toFixed(1)}%`);
        el.style.setProperty('--y', `${(py * 100).toFixed(1)}%`);
        el.style.setProperty('--rx', `${((0.5 - py) * 2 * max).toFixed(2)}deg`);
        el.style.setProperty('--ry', `${((px - 0.5) * 2 * max).toFixed(2)}deg`);
        el.style.setProperty('--glow', '1');
      });
    });
    el.addEventListener('pointerleave', () => {
      cancelAnimationFrame(raf);
      el.style.setProperty('--rx', '0deg');
      el.style.setProperty('--ry', '0deg');
      el.style.setProperty('--glow', '0');
    });
  });
})();
