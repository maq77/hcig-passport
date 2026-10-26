// Site header: logo, main nav, social, day/night switch, language menu, "Talk to our team", phone drawer.
import { bind, esc, icon } from "./_bind.mjs";
import { NAV, LANGS, HERO, UI } from "../content/home.mjs";

// Live header links (captured 2026-10-26 from healthcareig.com)
export const SOCIAL = [
  { name: "Facebook", icon: "facebook", url: "https://www.facebook.com/profile.php?id=61573961671310" },
  { name: "LinkedIn", icon: "linkedin", url: "https://www.linkedin.com/company/healthcareig/" },
  { name: "Instagram", icon: "instagram", url: "https://www.instagram.com/hcig.egypt" },
];

export function header(ctx, { current = "/", lang = "en" } = {}) {
  const b = bind(ctx);
  const soc = (size) =>
    SOCIAL.map((s) => `<a href="${s.url}" target="_blank" rel="noopener" aria-label="${s.name}">${icon(s.icon, size)}</a>`).join("");
  const nav = NAV.map(
    (n) => `<li><a href="${b.href(n.path)}"${n.path === current ? ' aria-current="page"' : ""}>${esc(n.label)}</a></li>`,
  ).join("");
  const langs = LANGS.map((l) => `<li><a href="${b.href("/" + (l.code === "en" ? "" : l.code + "/"))}" lang="${l.code}">${esc(l.name)}</a></li>`).join("");
  const drawerNav = NAV.map(
    (n) => `<li><a href="${b.href(n.path)}" ${b.on("closeMenu")}>${esc(n.label)}${icon("arrow", 20)}</a></li>`,
  ).join("");
  const drawerLangs = LANGS.map((l) => `<a href="${b.href("/" + (l.code === "en" ? "" : l.code + "/"))}" lang="${l.code}">${esc(l.name)}</a>`).join("");

  return `<header class="hd">
<a href="${b.href("/")}" class="hd-logo" aria-label="${esc(UI.home.text)}"><span class="lg hd-full-box"><img class="hd-full th-d" src="${b.asset("logo-h-white")}" alt="Healthcare International Group" width="372" height="120"><img class="hd-full th-l" src="${b.asset("logo-h-black")}" alt="" aria-hidden="true" width="372" height="120"></span><span class="lg hd-mark-box"><img class="hd-mark th-d" src="${b.asset("mark-white")}" alt="Healthcare International Group" width="45" height="46"><img class="hd-mark th-l" src="${b.asset("mark-black")}" alt="" aria-hidden="true" width="45" height="46"></span></a>
<nav class="hd-nav" aria-label="${esc(UI.mainNav.text)}"><ul>${nav}</ul></nav>
<div class="hd-tools"><div class="soc">${soc(18)}</div>
<button type="button" class="theme-btn" ${b.on("toggleTheme")} data-to-day="${esc(UI.toDay.text)}" data-to-night="${esc(UI.toNight.text)}" aria-label="${b.hole("themeLabel", UI.toNight.text)}" aria-pressed="${b.hole("themePressed", "true")}"><span class="ti ti-sun">${icon("sun", 19)}</span><span class="ti ti-moon">${icon("moon", 18)}</span></button>
<div class="lang"><button type="button" class="lang-btn" ${b.on("toggleLang")} aria-haspopup="true" aria-expanded="${b.hole("langExp", "false")}">${icon("globe", 17)}<span>${lang.toUpperCase()}</span>${icon("chevron", 15)}</button>${b.when("langOpen", `<ul class="lang-menu">${langs}</ul>`)}</div>
<a href="${b.href("/contacts/")}" class="btn btn-sm" ${b.on("openSheet")}>${esc(HERO.ctaPrimary.text)}</a>
<button type="button" class="menu-btn" ${b.on("toggleMenu")} aria-label="${esc(UI.menu.text)}" aria-expanded="${b.hole("menuExp", "false")}">${b.when("menuOpen", icon("close", 24))}${b.when("menuShut", icon("menu", 24), true)}</button></div>
${b.when("menuOpen", `<div class="drawer"><ul>${drawerNav}</ul><div class="drawer-langs">${drawerLangs}</div><div class="drawer-soc">${soc(20)}</div><a href="${b.href("/contacts/")}" class="btn" ${b.on("closeMenu")}>${esc(HERO.ctaPrimary.text)}</a></div>`)}
</header>`;
}
