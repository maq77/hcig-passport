/* HCIG Studio: the only client-side script on the portal.
   Two jobs: the theme toggle, and search. No dependencies, no build step. */

(function () {
  'use strict';

  /* ------------------------------------------------------------- theme */

  var root = document.documentElement;
  var btn = document.getElementById('theme');

  function systemDark() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  if (btn) {
    btn.addEventListener('click', function () {
      var current = root.getAttribute('data-theme') || (systemDark() ? 'dark' : 'light');
      var next = current === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('hcig-theme', next); } catch (e) {}
      btn.setAttribute('aria-label', next === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    });
  }

  /* --------------------------------------------------------- the stage */

  /* While the WebGL hero is on screen the chrome floats over it. This lives
     here rather than in the scene module so it still works when WebGL is
     unavailable or motion is reduced and the gradient carries the hero. */
  var hero = document.getElementById('hero');
  if (hero) {
    var bar = 60;
    var setOverStage = function () {
      var past = hero.getBoundingClientRect().bottom <= bar;
      if (past) root.removeAttribute('data-over-stage');
      else root.setAttribute('data-over-stage', '');
    };
    setOverStage();
    window.addEventListener('scroll', setOverStage, { passive: true });
    window.addEventListener('resize', setOverStage);
  }

  /* ------------------------------------------------------------ search */

  var dim = document.getElementById('sdim');
  var input = document.getElementById('sq');
  var list = document.getElementById('sres');
  var opener = document.getElementById('sopen');
  if (!dim || !input || !list) return;

  var raw = document.getElementById('sindex');
  var INDEX = [];
  try { INDEX = JSON.parse(raw.textContent) || []; } catch (e) { INDEX = []; }

  var shown = [];
  var cursor = 0;
  var lastFocus = null;

  var ICONS = {
    company: '<path d="M4 21V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v16"/><path d="M15 9h3a2 2 0 0 1 2 2v10"/><path d="M2.5 21h19"/>',
    project: '<path d="M3 7.5A1.5 1.5 0 0 1 4.5 6h4L11 8.5h8.5A1.5 1.5 0 0 1 21 10v7.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5Z"/>',
    item: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z"/><path d="M14 3v5h5"/>',
    page: '<path d="M4 21V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v16"/>'
  };

  function svg(type) {
    return '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      (ICONS[type] || ICONS.item) + '</svg>';
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* Rank: a hit at the start of the name beats a hit in the middle, which beats
     a hit in the breadcrumb path. Everything is a plain substring match, which
     is all a list of this size needs. */
  function score(entry, q) {
    var name = entry.n.toLowerCase();
    var path = (entry.p || '').toLowerCase();
    if (name.indexOf(q) === 0) return 0;
    if (name.indexOf(q) > -1) return 1;
    if (path.indexOf(q) > -1) return 2;
    return -1;
  }

  function render(q) {
    q = q.trim().toLowerCase();
    shown = q
      ? INDEX.map(function (e) { return { e: e, s: score(e, q) }; })
          .filter(function (r) { return r.s > -1; })
          .sort(function (a, b) { return a.s - b.s || a.e.n.length - b.e.n.length; })
          .slice(0, 40)
          .map(function (r) { return r.e; })
      : INDEX.slice(0, 12);

    cursor = 0;

    if (!shown.length) {
      list.innerHTML = '<p class="none">Nothing matches "' + escapeHtml(q) + '"</p>';
      return;
    }

    list.innerHTML = shown
      .map(function (e, i) {
        return '<a href="' + escapeHtml(e.u) + '" role="option"' +
          (e.x ? ' target="_blank" rel="noopener noreferrer"' : '') +
          (i === 0 ? ' data-on' : '') + '>' +
          '<span class="kind" aria-hidden="true" style="width:30px;height:30px;flex:none;border-radius:8px;display:grid;place-items:center;background:var(--surface-3);border:1px solid var(--line);color:var(--ink-3)">' +
          svg(e.t) + '</span>' +
          '<span class="t"><span class="name">' + escapeHtml(e.n) + '</span>' +
          '<span class="path">' + escapeHtml(e.p || '') + '</span></span></a>';
      })
      .join('');
  }

  function move(step) {
    var links = list.querySelectorAll('a');
    if (!links.length) return;
    links[cursor].removeAttribute('data-on');
    cursor = (cursor + step + links.length) % links.length;
    links[cursor].setAttribute('data-on', '');
    links[cursor].scrollIntoView({ block: 'nearest' });
  }

  function open() {
    lastFocus = document.activeElement;
    dim.classList.add('on');
    input.value = '';
    render('');
    input.focus();
  }

  function close() {
    dim.classList.remove('on');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  if (opener) opener.addEventListener('click', open);

  input.addEventListener('input', function () { render(input.value); });

  dim.addEventListener('mousedown', function (e) { if (e.target === dim) close(); });

  document.addEventListener('keydown', function (e) {
    var typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName) ||
      document.activeElement.isContentEditable;

    if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      dim.classList.contains('on') ? close() : open();
      return;
    }
    if (e.key === '/' && !typing && !dim.classList.contains('on')) {
      e.preventDefault();
      open();
      return;
    }
    if (!dim.classList.contains('on')) return;

    if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
    else if (e.key === 'Enter') {
      var on = list.querySelector('a[data-on]');
      if (on) { e.preventDefault(); on.click(); }
    }
  });

  /* Match the shortcut label to the platform rather than telling a Mac user
     to press a key that does nothing. */
  if (/Mac|iPhone|iPad/.test(navigator.platform || '')) {
    var kbd = opener && opener.querySelector('.kbd');
    if (kbd) kbd.textContent = '⌘ K';
  }
})();
