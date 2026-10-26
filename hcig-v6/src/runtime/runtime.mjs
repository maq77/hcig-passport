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

export function initRuntime(page = document.querySelector(".page")) {
  if (!page || page.dataset.runtime === "on") return;
  page.dataset.runtime = "on";
  const state = { langOpen: false, menuOpen: false };

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
