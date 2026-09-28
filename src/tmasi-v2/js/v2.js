/**
 * TMASI Global v2 - Motion and Interaction Engine
 *
 * Modeled after the 247clinic v3 Motion.tsx reveal system.
 * Uses IntersectionObserver with scroll catch-up, staggered entrances,
 * numeric count-up, sticky header, mobile drawer, and scroll spy.
 *
 * Content is always visible by default. The JS class on html enables
 * reveal animations. A 3000ms safety timeout guarantees visibility.
 */

(function () {
  'use strict';

  /* ---- Flag JS-ready on <html> ---- */
  var root = document.documentElement;
  root.classList.add('js');

  /* ---- Safety: if reveals don't complete in 3s, force all visible ---- */
  var safetyTimer = setTimeout(function () {
    root.classList.remove('js');
  }, 3000);

  document.addEventListener('DOMContentLoaded', function () {
    clearTimeout(safetyTimer);
    initStickyHeader();
    initMobileMenu();
    initScrollSpy();
    initReveals();
    initCountUp();
  });

  /* =================================================================
     Sticky Glassmorphic Header
     ================================================================= */
  function initStickyHeader() {
    var header = document.querySelector('.header');
    if (!header) return;

    var ticking = false;
    var onScroll = function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        if (window.scrollY > 24) {
          header.classList.add('header-scrolled');
        } else {
          header.classList.remove('header-scrolled');
        }
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* =================================================================
     Mobile Navigation Drawer
     ================================================================= */
  function initMobileMenu() {
    var burger = document.getElementById('burger');
    var menu = document.getElementById('mobileMenu');
    var close = document.getElementById('closeMenu');
    if (!burger || !menu) return;

    var open = function () {
      menu.classList.add('active');
      document.body.style.overflow = 'hidden';
      burger.setAttribute('aria-expanded', 'true');
    };
    var shut = function () {
      menu.classList.remove('active');
      document.body.style.overflow = '';
      burger.setAttribute('aria-expanded', 'false');
    };

    burger.addEventListener('click', open);
    if (close) close.addEventListener('click', shut);

    menu.addEventListener('click', function (e) {
      if (e.target === menu || e.target.closest('a')) shut();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('active')) shut();
    });
  }

  /* =================================================================
     ScrollSpy: Active Nav Links
     ================================================================= */
  function initScrollSpy() {
    var sections = document.querySelectorAll('section[id], footer[id]');
    var links = document.querySelectorAll('.nav-link');
    if (!sections.length || !links.length) return;

    var ticking = false;
    var onScroll = function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        var scrollPos = window.scrollY + 100;
        var activeId = '';

        for (var i = sections.length - 1; i >= 0; i--) {
          if (scrollPos >= sections[i].offsetTop) {
            activeId = sections[i].getAttribute('id');
            break;
          }
        }

        links.forEach(function (link) {
          link.classList.toggle('active', link.getAttribute('href') === '#' + activeId);
        });
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* =================================================================
     Reveal Engine (247 v3 pattern)
     IntersectionObserver + scroll catch-up for fast flings
     ================================================================= */
  function initReveals() {
    var els = Array.from(document.querySelectorAll('.rv'));
    if (!els.length) return;

    /* Also map legacy .v2-reveal to .rv */
    document.querySelectorAll('.v2-reveal').forEach(function (el) {
      if (!el.classList.contains('rv')) el.classList.add('rv');
    });
    els = Array.from(document.querySelectorAll('.rv'));

    /* Reduced motion: reveal everything instantly */
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      els.forEach(function (el) { el.classList.add('in'); });
      return;
    }

    /* IntersectionObserver */
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('in'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -8% 0px',
      threshold: 0.08
    });

    els.forEach(function (el) { io.observe(el); });

    /* Scroll catch-up for fast flings and anchor jumps */
    var raf = 0;
    var catchUp = function () {
      raf = 0;
      var line = window.innerHeight * 0.92;
      els.forEach(function (el) {
        if (!el.classList.contains('in') && el.getBoundingClientRect().top < line) {
          el.classList.add('in');
          io.unobserve(el);
        }
      });
    };
    var onScroll = function () {
      if (!raf) raf = requestAnimationFrame(catchUp);
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    /* Initial check for above-the-fold elements */
    requestAnimationFrame(catchUp);
  }

  /* =================================================================
     Numeric Count-Up (247 v3 pattern)
     4th-order ease-out over 1400ms, triggered at threshold 0.5
     ================================================================= */
  function initCountUp() {
    var counters = document.querySelectorAll('[data-counter-target]');
    if (!counters.length) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!('IntersectionObserver' in window)) return;

    var animateCount = function (el) {
      var target = parseInt(el.getAttribute('data-counter-target'), 10);
      var suffix = el.getAttribute('data-counter-suffix') || '';
      var duration = 1400;
      var startTime = performance.now();

      var step = function (now) {
        var t = Math.min(1, (now - startTime) / duration);
        var eased = 1 - Math.pow(1 - t, 4);
        var current = Math.round(eased * target);
        el.textContent = current.toLocaleString() + suffix;
        if (t < 1) requestAnimationFrame(step);
        else el.textContent = target.toLocaleString() + suffix;
      };

      el.textContent = '0' + suffix;
      requestAnimationFrame(step);
    };

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(function (el) { io.observe(el); });
  }

})();
