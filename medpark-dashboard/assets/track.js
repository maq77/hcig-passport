/* ==========================================================================
   MedPark first-party analytics.

   Added 2026-09-03.

   Sends ONE beacon per page, when the page is hidden. That beacon carries the
   whole visit to that page: how long it was actually read, how far it was
   scrolled, which sections were seen, and every control that was used. No
   request per event, no polling, no library.

   WHAT MAKES THIS DIFFERENT FROM THE GOOGLE TAG
   Engaged time is counted honestly: only while the tab is visible AND the
   person has done something in the last thirty seconds. A page left open in a
   background tab for an hour reports the seconds it was actually read.

   NO STORAGE BY DEFAULT
   Nothing is written to the device unless the visitor has accepted. There is
   no session identifier, because the server works sessions out from the
   pattern of arrivals rather than from anything stored here. That is what
   makes the default tier genuinely cookieless.

   ON DO NOT TRACK
   The default tier sets nothing, stores nothing and cannot follow anyone
   between days, so it is not tracking in the sense the header objects to, and
   it is not honoured here. The cookie tier is never enabled without an
   explicit acceptance. If you would rather honour the header anyway, set
   HONOUR_DNT to true below and it will stand down completely.

   NEVER BREAKS THE PAGE
   Every listener is wrapped. A failure here loses a measurement and nothing
   else.
   ========================================================================== */
(function () {
  'use strict';

  if (typeof window === 'undefined' || !window.JSON || !document.querySelectorAll) return;

  /* The hub serves this file and injects where to post. A same-origin default
     is kept so the file still works if it is ever hosted beside a site the old
     way. Nothing else in this tracker knows or cares which property it is on:
     the hub decides that from the token in the script URL. */
  var CFG         = window.__MP_CFG || {};
  var ENDPOINT    = CFG.e || '/track/a.php';
  var HONOUR_DNT  = false;
  var IDLE_MS     = 30000;   /* no activity for this long means not reading */
  var MAX_EVENTS  = 110;
  var COOKIE_ID   = 'mp_vid';
  var COOKIE_OK   = 'mp_consent';

  if (HONOUR_DNT && (navigator.doNotTrack === '1' || window.doNotTrack === '1')) return;

  /* ---- small helpers ---------------------------------------------------- */
  function cookie(name) {
    try {
      var m = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
      return m ? decodeURIComponent(m[2]) : '';
    } catch (e) { return ''; }
  }

  function setCookie(name, value, days) {
    try {
      var d = new Date();
      d.setTime(d.getTime() + days * 86400000);
      document.cookie = name + '=' + encodeURIComponent(value) +
        ';expires=' + d.toUTCString() + ';path=/;SameSite=Lax' +
        (location.protocol === 'https:' ? ';Secure' : '');
    } catch (e) {}
  }

  function clean(s) {
    return String(s == null ? '' : s).replace(/\s+/g, ' ').trim().slice(0, 80);
  }

  /* ---- consent ----------------------------------------------------------
     Two tiers, as agreed. Nothing is stored until accept() is called, and
     only the banner calls it. Until the wording is approved, nobody calls
     anything and the whole site runs on the cookieless tier. */
  var consent = cookie(COOKIE_OK) === '1' ? 1 : 0;
  var visitorId = consent ? cookie(COOKIE_ID) : '';

  function newId() {
    try {
      if (window.crypto && window.crypto.getRandomValues) {
        var a = new Uint8Array(10);
        window.crypto.getRandomValues(a);
        return Array.prototype.map.call(a, function (b) {
          return ('0' + b.toString(16)).slice(-2);
        }).join('');
      }
    } catch (e) {}
    return (Date.now().toString(36) + Math.random().toString(36).slice(2, 10));
  }

  window.mpAnalytics = {
    accept: function () {
      consent = 1;
      if (!visitorId) visitorId = newId();
      setCookie(COOKIE_OK, '1', 365);
      setCookie(COOKIE_ID, visitorId, 365);
      track('consent_accept', 'consent', '');
    },
    decline: function () {
      consent = 0; visitorId = '';
      setCookie(COOKIE_OK, '0', 365);
      setCookie(COOKIE_ID, '', -1);
      track('consent_decline', 'consent', '');
    },
    /* So other scripts, and the assistant, can record their own events. */
    event: function (name, category, label, value, meta) {
      track(name, category, label, value, meta);
    },
    state: function () {
      return { consent: consent, engaged: engaged, scroll: maxScroll, events: events.length };
    }
  };

  /* ---- context ----------------------------------------------------------
     Language and page family are worked out exactly as mp-track.js does, so
     the two data sets line up without a translation table. */
  function pageLanguage() {
    var p = location.pathname;
    if (p.indexOf('/de/') === 0) return 'de';
    if (p.indexOf('/pl/') === 0) return 'pl';
    return (document.documentElement.lang || 'en').slice(0, 2).toLowerCase();
  }

  function deviceClass() {
    var w = window.innerWidth || document.documentElement.clientWidth || 0;
    if (w <= 768) return 'mobile';
    if (w <= 1024) return 'tablet';
    return 'desktop';
  }

  /* Where on the page a control sits. "Header WhatsApp" and "Footer WhatsApp"
     are different questions and should not share a row. */
  function placementOf(el) {
    try {
      if (el.closest('header, .header, .navbar, .top-bar, nav')) return 'header';
      if (el.closest('footer, .footer')) return 'footer';
      if (el.closest('.hero, .banner, .slider, .carousel, [class*="hero"]')) return 'hero';
      if (el.closest('.sticky, .fixed, .floating, [class*="sticky"], [class*="float"]')) return 'sticky';
      if (el.closest('form')) return 'form';
      if (el.closest('.modal, .popup, dialog')) return 'modal';
      return 'body';
    } catch (e) { return 'body'; }
  }

  /* ---- the collected visit ---------------------------------------------- */
  var events   = [];
  var sections = {};
  var engaged  = 0;
  var maxScroll = 0;
  var sent = false;
  var lastActivity = Date.now();
  var scrollMarks = { 25: false, 50: false, 75: false, 100: false };

  function track(name, category, label, value, meta) {
    try {
      if (events.length >= MAX_EVENTS) return;
      events.push({
        n: String(name).slice(0, 40),
        c: String(category || '').slice(0, 30),
        l: clean(label),
        pl: '',
        v: typeof value === 'number' ? value : 0,
        m: meta ? String(meta).slice(0, 300) : '',
        t: Math.floor(Date.now() / 1000)
      });
    } catch (e) {}
  }

  function trackEl(name, category, label, el, value) {
    try {
      if (events.length >= MAX_EVENTS) return;
      events.push({
        n: name, c: category, l: clean(label),
        pl: el ? placementOf(el) : '',
        v: typeof value === 'number' ? value : 0,
        m: '', t: Math.floor(Date.now() / 1000)
      });
    } catch (e) {}
  }

  /* ---- engaged time -----------------------------------------------------
     One tick a second, counted only when the tab is visible and something has
     happened recently. This is the number GA4 gets wrong and the one that
     actually answers whether a page is being read. */
  ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'wheel'].forEach(function (t) {
    window.addEventListener(t, function () { lastActivity = Date.now(); }, { passive: true, capture: true });
  });

  setInterval(function () {
    try {
      if (document.visibilityState !== 'visible') return;
      if (Date.now() - lastActivity > IDLE_MS) return;
      engaged++;
    } catch (e) {}
  }, 1000);

  /* ---- scroll depth ------------------------------------------------------ */
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      ticking = false;
      try {
        var doc = document.documentElement;
        var room = doc.scrollHeight - window.innerHeight;
        var pct = room > 0 ? Math.round(((window.pageYOffset || doc.scrollTop) / room) * 100) : 100;
        pct = Math.max(0, Math.min(100, pct));
        if (pct > maxScroll) maxScroll = pct;
        [25, 50, 75, 100].forEach(function (m) {
          if (!scrollMarks[m] && maxScroll >= m) {
            scrollMarks[m] = true;
            track('scroll_' + m, 'behaviour', '', m);
          }
        });
      } catch (e) {}
    });
  }, { passive: true });

  /* ---- sections ---------------------------------------------------------
     The site has seventy six pages and none of them are going to be edited to
     add tracking attributes, so sections are found automatically. An explicit
     data-mp-section always wins where somebody has added one.

     What is recorded is seconds visible, not merely whether it scrolled past,
     because "did anyone read the insurance section" is the actual question. */
  function sectionName(el, i) {
    var n = el.getAttribute('data-mp-section');
    if (n) return clean(n);
    if (el.id && !/^[0-9]/.test(el.id)) return clean(el.id);
    var h = el.querySelector('h1, h2, h3');
    if (h && h.textContent.trim()) return clean(h.textContent);
    var c = (el.className || '').toString().split(/\s+/).filter(function (x) {
      return x && !/^(row|col|container|wrapper|inner|clearfix)/.test(x);
    })[0];
    if (c) return clean(c);
    return 'block ' + (i + 1);
  }

  function watchSections() {
    if (!window.IntersectionObserver) return;
    try {
      var found = document.querySelectorAll('[data-mp-section]');
      if (found.length === 0) {
        found = document.querySelectorAll(
          'main > section, main > div[id], body > section, section[id], ' +
          '.section, [class*="section-"], footer'
        );
      }
      var list = [];
      for (var i = 0; i < found.length && list.length < 25; i++) {
        var el = found[i];
        /* Anything shorter than a phone screen is not a section. */
        if (el.offsetHeight < 120) continue;
        list.push(el);
      }
      if (!list.length) return;

      var since = {};
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          var key = en.target.__mpName;
          if (!key) return;
          if (en.isIntersecting) {
            since[key] = Date.now();
          } else if (since[key]) {
            sections[key] = (sections[key] || 0) + Math.round((Date.now() - since[key]) / 1000);
            delete since[key];
          }
        });
      }, { threshold: 0.35 });

      list.forEach(function (el, i) {
        el.__mpName = sectionName(el, i);
        obs.observe(el);
      });

      /* Anything still on screen when the page closes has to be settled up. */
      window.__mpCloseSections = function () {
        var now = Date.now(), k;
        for (k in since) {
          if (since.hasOwnProperty(k)) {
            sections[k] = (sections[k] || 0) + Math.round((now - since[k]) / 1000);
          }
        }
      };
    } catch (e) {}
  }

  /* ---- what was clicked -------------------------------------------------
     One delegated listener in the capture phase, so it also covers controls
     added to the page later. */
  function describe(a) {
    var href = (a.getAttribute('href') || '').trim();
    if (href.slice(0, 4) === 'tel:')                  return ['call_click', 'contact', 'Phone ' + href.slice(4)];
    if (/wa\.me|api\.whatsapp|whatsapp/i.test(href))  return ['whatsapp_click', 'contact', 'WhatsApp'];
    if (href.slice(0, 7) === 'mailto:')               return ['email_click', 'contact', 'Email'];
    if (/google\.[a-z.]+\/maps|maps\.app\.goo/i.test(href)) return ['directions_click', 'contact', 'Directions'];

    var text = clean(a.textContent) || clean(a.getAttribute('aria-label')) || '';

    if (href && href.charAt(0) !== '#') {
      try {
        var u = new URL(href, location.href);
        if (u.host && u.host !== location.host) {
          return ['outbound_click', 'navigation', text || u.host];
        }
      } catch (e) {}
    }
    return [null, null, text];
  }

  document.addEventListener('click', function (ev) {
    try {
      var el = ev.target;
      if (!el || !el.closest) return;

      var a = el.closest('a[href], button, [role="button"], input[type="submit"]');
      if (a) {
        var d = describe(a);
        if (d[0]) {
          trackEl(d[0], d[1], d[2], a);
        } else if (d[2]) {
          /* Named controls that are not contact links still matter: which
             menu item, which package, which tab. */
          trackEl('control_click', 'interaction', d[2], a);
        }

        /* Language switching is its own question in a three language site. */
        var href = (a.getAttribute('href') || '');
        if (/^\/(de|pl)\//.test(href) || /^\/$/.test(href)) {
          var to = href.indexOf('/de/') === 0 ? 'de' : (href.indexOf('/pl/') === 0 ? 'pl' : 'en');
          if (to !== pageLanguage()) trackEl('language_switch', 'navigation', pageLanguage() + ' to ' + to, a);
        }
      } else {
        /* A click on something that looks clickable but is not. Usually a
           styled heading or an image people expect to open. */
        try {
          if (window.getComputedStyle(el).cursor === 'pointer') {
            trackEl('dead_click', 'frustration', clean(el.textContent) || el.tagName, el);
          }
        } catch (e2) {}
      }

      rage(ev);
    } catch (e) {}
  }, true);

  /* Three clicks in the same small area inside a second means somebody is
     jabbing at something that is not responding. */
  var recent = [];
  function rage(ev) {
    var now = Date.now();
    recent.push({ x: ev.clientX, y: ev.clientY, t: now });
    recent = recent.filter(function (r) { return now - r.t < 900; });
    if (recent.length < 3) return;
    var near = recent.filter(function (r) {
      return Math.abs(r.x - ev.clientX) < 40 && Math.abs(r.y - ev.clientY) < 40;
    });
    if (near.length >= 3) {
      recent = [];
      var t = ev.target;
      trackEl('rage_click', 'frustration', clean(t && t.textContent) || (t && t.tagName) || '', t);
    }
  }

  /* ---- forms ------------------------------------------------------------
     Start, submit, and abandonment with the field it was abandoned on, which
     is the one thing that tells you why a form is not being completed. */
  (function forms() {
    var started = {};
    var lastField = {};

    document.addEventListener('focusin', function (ev) {
      try {
        var f = ev.target.closest && ev.target.closest('form');
        if (!f) return;
        var id = f.getAttribute('id') || f.getAttribute('name') || 'form';
        lastField[id] = ev.target.getAttribute('name') || ev.target.getAttribute('id') || ev.target.type || 'field';
        if (!started[id]) {
          started[id] = true;
          trackEl('form_start', 'enquiry', id, f);
        }
      } catch (e) {}
    }, true);

    document.addEventListener('submit', function (ev) {
      try {
        var f = ev.target;
        var id = f.getAttribute('id') || f.getAttribute('name') || 'form';
        started[id] = 'sent';
        trackEl('enquiry_submit', 'enquiry', id, f);
      } catch (e) {}
    }, true);

    window.__mpCloseForms = function () {
      var id;
      for (id in started) {
        if (started.hasOwnProperty(id) && started[id] !== 'sent') {
          track('form_abandon', 'frustration', id + ' at ' + (lastField[id] || 'unknown'));
        }
      }
    };
  })();

  /* ---- content ----------------------------------------------------------
     Video, and the folding panels the site uses for questions and packages. */
  document.addEventListener('play', function (ev) {
    try {
      var v = ev.target;
      if (!v || (v.tagName !== 'VIDEO' && v.tagName !== 'AUDIO')) return;
      trackEl('video_play', 'content', v.getAttribute('title') || v.currentSrc || 'video', v);
    } catch (e) {}
  }, true);

  document.addEventListener('ended', function (ev) {
    try {
      var v = ev.target;
      if (!v || v.tagName !== 'VIDEO') return;
      trackEl('video_complete', 'content', v.getAttribute('title') || 'video', v,
              Math.round(v.duration || 0));
    } catch (e) {}
  }, true);

  document.addEventListener('toggle', function (ev) {
    try {
      var d = ev.target;
      if (d && d.tagName === 'DETAILS' && d.open) {
        var s = d.querySelector('summary');
        trackEl('faq_open', 'content', s ? s.textContent : 'panel', d);
      }
    } catch (e) {}
  }, true);

  /* Somebody copying text is almost always copying the phone number or the
     address, and that is a contact attempt we would otherwise never see. */
  document.addEventListener('copy', function () {
    try {
      var s = String(window.getSelection ? window.getSelection() : '').trim();
      if (!s) return;
      var kind = /[0-9]{6,}/.test(s.replace(/\s/g, '')) ? 'number' :
                 (s.length > 60 ? 'passage' : 'text');
      track('copy_text', 'interaction', kind, s.length);
    } catch (e) {}
  }, true);

  window.addEventListener('beforeprint', function () { track('print_page', 'interaction', ''); });

  /* ---- things that went wrong -------------------------------------------
     A script error on the enquiry page is a lost patient, and at the moment
     nobody would ever hear about it. */
  window.addEventListener('error', function (ev) {
    try {
      if (!ev || !ev.message) return;
      var where = (ev.filename || '').split('/').pop() + ':' + (ev.lineno || 0);
      track('js_error', 'technical', String(ev.message).slice(0, 80), 0, where);
    } catch (e) {}
  });

  window.addEventListener('unhandledrejection', function (ev) {
    try {
      track('js_error', 'technical', 'promise: ' + String(ev.reason).slice(0, 70));
    } catch (e) {}
  });

  /* ---- how fast the page really was ------------------------------------- */
  function loadMs() {
    try {
      var nav = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
      if (nav && nav.loadEventEnd > 0) return Math.round(nav.loadEventEnd);
      var t = performance.timing;
      if (t && t.loadEventEnd && t.navigationStart) return t.loadEventEnd - t.navigationStart;
    } catch (e) {}
    return 0;
  }

  /* ---- send once --------------------------------------------------------- */
  function campaign() {
    var out = {};
    try {
      var q = new URLSearchParams(location.search);
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
       'gclid', 'fbclid', 'msclkid'].forEach(function (k) {
        var v = q.get(k);
        if (v) out[k] = v.slice(0, 100);
      });
    } catch (e) {}
    return out;
  }

  function flush() {
    if (sent) return;
    sent = true;
    try {
      if (window.__mpCloseSections) window.__mpCloseSections();
      if (window.__mpCloseForms) window.__mpCloseForms();

      var now = new Date();
      var body = JSON.stringify({
        p: location.pathname,
        t: (document.title || '').slice(0, 200),
        r: document.referrer || '',
        q: campaign(),
        l: pageLanguage(),
        d: deviceClass(),
        vw: window.innerWidth || 0,
        vh: window.innerHeight || 0,
        s: maxScroll,
        e: engaged,
        lt: loadMs(),
        h: now.getHours(),
        w: now.getDay(),
        cs: consent,
        cid: consent ? visitorId : '',
        ev: events,
        sec: sections
      });

      /* text/plain, not application/json, and that is deliberate.
         The hub is on another origin now. A JSON content type is not on the
         CORS safelist, so every beacon would trigger a preflight OPTIONS
         request first: two requests per page instead of one, and sendBeacon
         cannot report or recover from a preflight that fails. text/plain is
         safelisted, so the beacon goes straight out. The collector reads the
         raw body and parses it as JSON regardless of the header. */
      if (navigator.sendBeacon) {
        navigator.sendBeacon(ENDPOINT, new Blob([body], { type: 'text/plain;charset=UTF-8' }));
        return;
      }
      fetch(ENDPOINT, {
        mode: 'cors',
        credentials: 'omit',
        method: 'POST', body: body, keepalive: true,
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' }
      });
    } catch (e) {}
  }

  /* pagehide is the reliable one on iOS; visibilitychange covers tab switches
     everywhere else. Both are guarded against sending twice. */
  window.addEventListener('pagehide', flush);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') flush();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', watchSections);
  } else {
    watchSections();
  }
})();
