// HCIG v6 behaviour runtime for the site (site mode of the section templates). Tiny, no framework.
// Actions come from data-action attributes; open and closed blocks are [data-when] elements toggled with `hidden`.
// The canvas boards get the same behaviour from their DCLogic block instead.

const STORE = "hcig-theme";

function setTheme(page, theme, animate) {
  const night = theme === "night";
  page.classList.toggle("theme-night", night);
  page.classList.toggle("theme-day", !night);
  if (animate) page.classList.add("sw"); // the band and flare play only after a real press
  page.querySelectorAll('[data-action="toggleTheme"]').forEach((b) => {
    b.setAttribute("aria-pressed", String(!night));
    b.setAttribute("aria-label", night ? b.dataset.toDay || "Switch to day" : b.dataset.toNight || "Switch to night");
  });
}

function setOpen(page, name, open) {
  page.querySelectorAll(`[data-when="${name}"]`).forEach((el) => (el.hidden = !open));
}

const reduced = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

// Fade-up reveals and count-ups when a block enters the screen. The real number is in the HTML; we only animate it.
function initReveal(page) {
  const els = page.querySelectorAll("[data-reveal], [data-count]");
  if (!("IntersectionObserver" in window) || reduced()) { els.forEach((el) => el.classList.add("in")); return; }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const el = e.target;
      el.classList.add("in");
      if (el.dataset.count) countUp(el);
      io.unobserve(el);
    }
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
  els.forEach((el) => io.observe(el));
}
function countUp(el) {
  const to = Number(el.dataset.count);
  if (!to) return;
  const t0 = performance.now(), dur = 1400;
  const step = (t) => {
    const k = Math.min(1, (t - t0) / dur), eased = 1 - Math.pow(1 - k, 3);
    el.textContent = String(Math.round(to * eased));
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// Group film: only the cut for the current theme and screen plays, and only while the section is on screen.
function initFilms(page, state) {
  const vids = [...page.querySelectorAll("video[data-film]")];
  if (!vids.length) return () => {};
  const film = page.querySelector(".gf-film");
  let onScreen = false;
  const current = () => {
    const theme = page.classList.contains("theme-night") ? "night" : "day";
    return vids.find((v) => v.dataset.th === theme && v.offsetParent !== null);
  };
  const sync = () => {
    const lead = current();
    for (const v of vids) {
      const play = v === lead && onScreen && (!reduced() || state.sound);
      if (v === lead && state.sound) v.muted = false; else v.muted = true;
      if (play) {
        if (v.preload === "none") { v.preload = "auto"; v.load(); }
        const from = vids.find((o) => o !== v && !o.paused);
        if (from && from.currentTime) v.currentTime = from.currentTime;
        const p = v.play(); if (p && p.catch) p.catch(() => {});
      } else if (!v.paused) v.pause();
    }
  };
  if ("IntersectionObserver" in window) {
    new IntersectionObserver((es) => { onScreen = es[0].isIntersecting; sync(); }, { threshold: 0.25 }).observe(film);
  } else { onScreen = true; }
  addEventListener("resize", () => sync(), { passive: true });
  return sync;
}

export function initRuntime(page = document.querySelector(".page")) {
  if (!page || page.dataset.runtime === "on") return;
  page.dataset.runtime = "on";
  page.classList.add("js");
  const state = { langOpen: false, menuOpen: false, sound: false };
  initReveal(page);
  const syncFilms = initFilms(page, state);

  let saved = null;
  try { saved = localStorage.getItem(STORE); } catch {}
  if (saved === "night" || saved === "day") setTheme(page, saved, false);

  const sync = () => {
    setOpen(page, "langOpen", state.langOpen);
    setOpen(page, "menuOpen", state.menuOpen);
    setOpen(page, "menuShut", !state.menuOpen);
    page.querySelectorAll('[data-action="toggleLang"]').forEach((b) => b.setAttribute("aria-expanded", String(state.langOpen)));
    page.querySelectorAll('[data-action="toggleMenu"]').forEach((b) => b.setAttribute("aria-expanded", String(state.menuOpen)));
  };

  page.addEventListener("click", (e) => {
    const t = e.target.closest("[data-action]");
    if (!t) {
      if (state.langOpen && !e.target.closest(".lang")) { state.langOpen = false; sync(); }
      return;
    }
    const a = t.dataset.action;
    if (a === "toggleTheme") {
      const toNight = page.classList.contains("theme-day");
      setTheme(page, toNight ? "night" : "day", true);
      try { localStorage.setItem(STORE, toNight ? "night" : "day"); } catch {}
      state.menuOpen = false; state.langOpen = false; sync();
      setTimeout(syncFilms, 900); // switch the film with the dawn
    } else if (a === "toggleSound") {
      state.sound = !state.sound;
      t.setAttribute("aria-pressed", String(state.sound));
      syncFilms();
    } else if (a === "toggleMore") {
      const box = t.closest(".clampable");
      if (box) { const open = box.classList.toggle("open"); t.setAttribute("aria-expanded", String(open)); }
    } else if (a === "toggleLang") { state.langOpen = !state.langOpen; sync(); }
    else if (a === "toggleMenu") { state.menuOpen = !state.menuOpen; state.langOpen = false; sync(); }
    else if (a === "closeMenu") { state.menuOpen = false; sync(); }
    // openSheet: the contact sheet arrives with its own section; until then the link goes to the contact page.
  });

  page.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && (state.langOpen || state.menuOpen)) { state.langOpen = false; state.menuOpen = false; sync(); }
  });
  sync();
}
