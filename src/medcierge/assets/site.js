/* Elite Medical Concierge. Small, dependency free. Every feature degrades to a
   working page without it: links are real links, forms fall back to WhatsApp. */
(function () {
  'use strict';
  var doc = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* header: solid once the page has scrolled */
  var hdr = document.querySelector('[data-hdr]');
  if (hdr) {
    var onScroll = function () { hdr.classList.toggle('is-solid', window.scrollY > 12); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* mobile menu */
  var menuBtn = document.querySelector('[data-menu-btn]');
  var menu = document.getElementById('menu');
  if (menuBtn && menu) {
    var close = function (focusBack) {
      menu.hidden = true;
      menuBtn.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('is-locked');
      if (focusBack) menuBtn.focus();
    };
    var open = function () {
      menu.hidden = false;
      menuBtn.setAttribute('aria-expanded', 'true');
      document.body.classList.add('is-locked');
      var first = menu.querySelector('a');
      if (first) first.focus();
    };
    menuBtn.addEventListener('click', function () { menu.hidden ? open() : close(true); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) close(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) close(true); });
    window.addEventListener('resize', function () { if (window.innerWidth >= 1180 && !menu.hidden) close(false); });
  }

  /* reveal on scroll, opt in. Position based rather than IntersectionObserver:
     a fast scroll or an anchor jump must never leave content invisible, so
     anything at or above the fold edge is shown, including what was skipped. */
  var pending = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
  if (!reduce && pending.length) {
    var edge = function () { return window.innerHeight * 0.94; };
    var sweep = function (instant) {
      var limit = edge();
      pending = pending.filter(function (el) {
        if (el.getBoundingClientRect().top < limit) {
          if (instant) el.style.transitionDelay = '0ms';
          el.classList.add('is-in');
          return false;
        }
        return true;
      });
      if (!pending.length) window.removeEventListener('scroll', onRevealScroll);
    };
    var ticking = false;
    var onRevealScroll = function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { ticking = false; sweep(false); });
    };
    sweep(true);
    doc.classList.add('js-reveal');
    window.addEventListener('scroll', onRevealScroll, { passive: true });
    window.addEventListener('resize', onRevealScroll);
    window.addEventListener('beforeprint', function () { pending.forEach(function (el) { el.classList.add('is-in'); }); pending = []; });
  }

  /* service area map: list and dots drive one detail card */
  document.querySelectorAll('[data-areas]').forEach(function (root) {
    var data = JSON.parse(root.getAttribute('data-areas'));
    var btns = root.querySelectorAll('[data-area]');
    var pts = root.querySelectorAll('[data-pt]');
    var label = root.querySelector('[data-map-label]');
    var card = root.querySelector('[data-area-card]');
    var pick = function (name, moveFocus) {
      var a = data.filter(function (d) { return d.name === name; })[0];
      if (!a) return;
      btns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-area') === name)); });
      pts.forEach(function (p) {
        var on = p.getAttribute('data-pt') === name;
        p.classList.toggle('is-on', on);
        if (on && label) {
          label.textContent = name;
          var x = +p.getAttribute('data-x'), y = +p.getAttribute('data-y');
          var right = x > 400;
          label.setAttribute('x', String(right ? x - 14 : x + 14));
          label.setAttribute('y', String(y + 4));
          label.setAttribute('text-anchor', right ? 'end' : 'start');
        }
      });
      if (card) {
        card.querySelector('[data-f="name"]').textContent = a.name;
        card.querySelector('[data-f="region"]').textContent = a.region;
        card.querySelector('[data-f="hours"]').textContent = a.hours;
        var more = card.querySelector('[data-f="more"]');
        if (more) {
          more.hidden = !a.href;
          if (a.href) more.setAttribute('href', a.href);
        }
      }
      if (moveFocus) {
        var b = root.querySelector('[data-area="' + name + '"]');
        if (b) b.focus();
      }
    };
    btns.forEach(function (b) { b.addEventListener('click', function () { pick(b.getAttribute('data-area')); }); });
    pts.forEach(function (p) {
      p.addEventListener('click', function () { pick(p.getAttribute('data-pt'), true); });
    });
    pick(root.getAttribute('data-start') || data[0].name);
  });

  /* testimonial carousel: manual only, never autoplay */
  document.querySelectorAll('[data-tcar]').forEach(function (root) {
    var track = root.querySelector('.tcar__track');
    var prev = root.querySelector('[data-prev]');
    var next = root.querySelector('[data-next]');
    var step = function () {
      var card = track.querySelector('.tcard');
      return card ? card.getBoundingClientRect().width + 16 : track.clientWidth;
    };
    var sync = function () {
      prev.disabled = track.scrollLeft <= 4;
      next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
    };
    prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: reduce ? 'auto' : 'smooth' }); });
    next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: reduce ? 'auto' : 'smooth' }); });
    track.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    sync();
  });

  /* "Book Now" on a service card preselects it in the booking form */
  document.querySelectorAll('[data-book]').forEach(function (a) {
    a.addEventListener('click', function () {
      var sel = document.getElementById('bk-service');
      var val = a.getAttribute('data-book');
      if (sel && val) sel.value = val;
    });
  });
  var date = document.getElementById('bk-date');
  if (date) {
    var t = new Date();
    date.min = new Date(t.getTime() - t.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  }

  /* forms hand the request to the team on WhatsApp, with every field filled in */
  document.querySelectorAll('form[data-wa]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstBad = null;
      form.querySelectorAll('[required]').forEach(function (f) {
        var bad = !f.value.trim();
        f.setAttribute('aria-invalid', String(bad));
        if (bad && !firstBad) firstBad = f;
      });
      if (firstBad) { firstBad.focus(); return; }
      var lines = [form.getAttribute('data-title') || ''];
      form.querySelectorAll('input, select, textarea').forEach(function (f) {
        if (!f.value.trim()) return;
        var lab = form.querySelector('label[for="' + f.id + '"]');
        var name = lab ? lab.childNodes[0].textContent.trim() : f.name;
        lines.push(name + ': ' + f.value.trim());
      });
      var url = form.getAttribute('data-wa') + '?text=' + encodeURIComponent(lines.join('\n'));
      var status = form.querySelector('[data-status]');
      if (status) status.textContent = 'WhatsApp';
      window.open(url, '_blank', 'noopener');
    });
    form.addEventListener('input', function (e) {
      if (e.target.getAttribute('aria-invalid') === 'true' && e.target.value.trim()) e.target.setAttribute('aria-invalid', 'false');
    });
  });

  /* ================= homepage motion upgrade, 2026-09-14 ================= */
  var motionOK = !reduce;
  var finePointer = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var hdrH = 72;
  var clamp01 = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };

  /* one rAF-throttled scroll pass drives every scrubbed effect */
  var scrubbers = [];
  var scrubQueued = false;
  var runScrub = function () { scrubQueued = false; for (var i = 0; i < scrubbers.length; i++) scrubbers[i](); };
  var queueScrub = function () { if (!scrubQueued) { scrubQueued = true; requestAnimationFrame(runScrub); } };
  window.addEventListener('scroll', queueScrub, { passive: true });
  window.addEventListener('resize', queueScrub);

  /* hero depth: planes drift at their own rate, the stage turns toward the pointer */
  var h3d = document.querySelector('[data-h3d]');
  if (h3d && motionOK) {
    var stage = h3d.querySelector('[data-h3d-stage]');
    var planes = Array.prototype.slice.call(stage.querySelectorAll('[data-depth]'));
    var heroSec = h3d.closest('section');
    var tx = 0, ty = 0, cx = 0, cy = 0, visible = true, looping = false;
    var tick = function () {
      cx += (tx - cx) * 0.07;
      cy += (ty - cy) * 0.07;
      var r = heroSec.getBoundingClientRect();
      var p = clamp01(-r.top / Math.max(1, r.height));
      stage.style.setProperty('--ry', (cx * 7).toFixed(2) + 'deg');
      stage.style.setProperty('--rx', (-cy * 5 + p * 6).toFixed(2) + 'deg');
      stage.style.setProperty('--s', (1 - p * 0.05).toFixed(4));
      for (var i = 0; i < planes.length; i++) {
        planes[i].style.setProperty('--ty', (p * +planes[i].getAttribute('data-depth') * 110).toFixed(1) + 'px');
      }
      if (visible) requestAnimationFrame(tick); else looping = false;
    };
    var start = function () { if (!looping) { looping = true; requestAnimationFrame(tick); } };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) start(); }).observe(heroSec);
    }
    start();
    if (finePointer) {
      window.addEventListener('pointermove', function (e) {
        tx = (e.clientX / window.innerWidth - 0.5) * 2;
        ty = (e.clientY / window.innerHeight - 0.5) * 2;
      }, { passive: true });
      document.addEventListener('pointerleave', function () { tx = 0; ty = 0; });
    }
  }

  /* numbers count up once, when half of them is on screen */
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length && motionOK && 'IntersectionObserver' in window) {
    var fmt = function (n, comma) {
      var s = String(Math.round(n));
      return comma ? s.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : s;
    };
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        cio.unobserve(en.target);
        var el = en.target;
        el.setAttribute('data-done', '');
        var raw = el.getAttribute('data-count');
        var to = +raw.replace(/,/g, '');
        var comma = raw.indexOf(',') > -1;
        var suf = el.getAttribute('data-suffix') || '';
        var t0 = null;
        var step = function (t) {
          if (t0 === null) t0 = t;
          var k = Math.min(1, (t - t0) / 1500);
          el.textContent = fmt(to * (1 - Math.pow(1 - k, 3)), comma) + suf;
          if (k < 1) requestAnimationFrame(step); else el.setAttribute('data-done', '');
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });
    var waiting = [];
    counters.forEach(function (el) {
      if (el.getBoundingClientRect().top > window.innerHeight * 0.9) {
        el.setAttribute('data-final', el.textContent);
        el.textContent = '0' + (el.getAttribute('data-suffix') || '');
        cio.observe(el);
        waiting.push(el);
      }
    });
    /* a counter scrolled past before it was ever half on screen shows its real value */
    scrubbers.push(function () {
      waiting = waiting.filter(function (el) {
        if (el.getBoundingClientRect().bottom < 0) { cio.unobserve(el); el.textContent = el.getAttribute('data-final'); return false; }
        return !el.hasAttribute('data-done');
      });
    });
  }

  /* logo marquee: a real pause control, and no work while off screen */
  var trust = document.querySelector('[data-trust]');
  if (trust) {
    var tog = trust.querySelector('[data-marquee-toggle]');
    if (tog) {
      tog.addEventListener('click', function () {
        var paused = tog.getAttribute('aria-pressed') !== 'true';
        tog.setAttribute('aria-pressed', String(paused));
        tog.setAttribute('aria-label', paused ? 'Play' : 'Pause');
        trust.classList.toggle('is-paused', paused);
      });
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { trust.classList.toggle('is-offscreen', !en[0].isIntersecting); }).observe(trust);
    }
  }

  /* facilities: vertical scroll becomes a sideways tour on a wide screen */
  var pan = document.querySelector('[data-pan]');
  if (pan) {
    var rail = pan.querySelector('[data-pan-rail]');
    var mqPan = window.matchMedia('(min-width: 1024px) and (min-height: 680px)');
    var travel = 0;
    var panScrub = function () {
      if (!travel) return;
      var r = pan.getBoundingClientRect();
      var p = clamp01(-r.top / Math.max(1, r.height - window.innerHeight));
      rail.style.transform = 'translate3d(' + (-p * travel).toFixed(1) + 'px,0,0)';
    };
    var measurePan = function () {
      if (motionOK && mqPan.matches) {
        pan.classList.add('is-pinned');
        travel = Math.max(0, rail.scrollWidth - window.innerWidth);
        pan.style.height = (travel + window.innerHeight) + 'px';
      } else {
        pan.classList.remove('is-pinned');
        pan.style.height = '';
        rail.style.transform = '';
        travel = 0;
      }
      panScrub();
    };
    scrubbers.push(panScrub);
    measurePan();
    window.addEventListener('resize', measurePan);
    window.addEventListener('load', measurePan);
  }

  /* steps: the line fills and each step switches on as it is reached */
  var stepsSec = document.querySelector('[data-steps]');
  if (stepsSec && motionOK) {
    var stepEls = stepsSec.querySelectorAll('[data-step]');
    var track = stepsSec.querySelector('.steps-track');
    var stepsScrub = function () {
      var r = track.getBoundingClientRect();
      var p = clamp01((window.innerHeight * 0.8 - r.top) / Math.max(1, r.height + window.innerHeight * 0.25));
      track.style.setProperty('--p', p.toFixed(3));
      for (var i = 0; i < stepEls.length; i++) stepEls[i].classList.toggle('is-on', p >= (i + 0.4) / stepEls.length);
    };
    scrubbers.push(stepsScrub);
    stepsScrub();
  }

  /* map: the gold route draws down the coast and each town lights as it is reached */
  document.querySelectorAll('[data-areas]').forEach(function (root) {
    var route = root.querySelector('[data-route]');
    if (!route || !motionOK) return;
    var pts = root.querySelectorAll('[data-pt]');
    var pin = root.closest('[data-route-pin]');
    root.classList.add('route-armed');
    var routeScrub = function () {
      var p;
      if (pin && pin.firstElementChild && getComputedStyle(pin.firstElementChild).position === 'sticky') {
        var r = pin.getBoundingClientRect();
        p = (hdrH + 20 - r.top) / Math.max(1, pin.offsetHeight - window.innerHeight);
      } else {
        var r2 = root.getBoundingClientRect();
        p = (window.innerHeight * 0.85 - r2.top) / Math.max(1, r2.height * 0.85);
      }
      var f = clamp01((p - 0.04) / 0.72);
      route.style.strokeDashoffset = (1 - f).toFixed(4);
      for (var i = 0; i < pts.length; i++) pts[i].classList.toggle('is-lit', f >= +pts[i].getAttribute('data-at') - 0.002);
    };
    scrubbers.push(routeScrub);
    routeScrub();
  });

  queueScrub();
})();
