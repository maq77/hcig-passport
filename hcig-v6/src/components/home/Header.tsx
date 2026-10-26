"use client";
// Site header: logo, main nav, social, day/night switch (the hero only), language menu, "Talk to our team", phone drawer.
import { useEffect, useState } from "react";
import { NAV, LANGS, HERO, UI } from "@/content/home.mjs";
import { asset, href } from "@/lib/site";
import { Icon } from "@/components/ui/Icon";
import { SheetLink } from "@/components/ui/Sheet";
import type { IconName } from "@/lib/icons";

export const SOCIAL: { name: string; icon: IconName; url: string }[] = [
  { name: "Facebook", icon: "facebook", url: "https://www.facebook.com/profile.php?id=61573961671310" },
  { name: "LinkedIn", icon: "linkedin", url: "https://www.linkedin.com/company/healthcareig/" },
  { name: "Instagram", icon: "instagram", url: "https://www.instagram.com/hcig.egypt" },
];

const langHref = (code: string) => href("/" + (code === "en" ? "" : code + "/"));

export function Header({ night, onTheme }: { night: boolean; onTheme: () => void }) {
  const [lang, setLang] = useState(false);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setLang(false); setMenu(false); }
    };
    const click = (e: MouseEvent) => {
      if (!(e.target as Element).closest?.(".lang")) setLang(false);
    };
    addEventListener("keydown", key);
    addEventListener("click", click);
    return () => { removeEventListener("keydown", key); removeEventListener("click", click); };
  }, []);

  const soc = (size: number) =>
    SOCIAL.map((s) => (
      <a key={s.name} href={s.url} target="_blank" rel="noopener" aria-label={s.name}><Icon name={s.icon} size={size} /></a>
    ));

  return (
    <header className="hd">
      <a href={href("/")} className="hd-logo" aria-label={UI.home.text}>
        <span className="lg hd-full-box">
          <img className="hd-full th-d" src={asset("logo-h-white")} alt="Healthcare International Group" width={372} height={120} />
          <img className="hd-full th-l" src={asset("logo-h-black")} alt="" aria-hidden="true" width={372} height={120} />
        </span>
        <span className="lg hd-mark-box">
          <img className="hd-mark th-d" src={asset("mark-white")} alt="Healthcare International Group" width={45} height={46} />
          <img className="hd-mark th-l" src={asset("mark-black")} alt="" aria-hidden="true" width={45} height={46} />
        </span>
      </a>
      <nav className="hd-nav" aria-label={UI.mainNav.text}>
        <ul>
          {NAV.map((n) => (
            <li key={n.path}><a href={href(n.path)} aria-current={n.path === "/" ? "page" : undefined}>{n.label}</a></li>
          ))}
        </ul>
      </nav>
      <div className="hd-tools">
        <div className="soc">{soc(18)}</div>
        <button
          type="button"
          className="theme-btn"
          onClick={() => { setMenu(false); setLang(false); onTheme(); }}
          aria-label={night ? UI.toDay.text : UI.toNight.text}
          aria-pressed={!night}
        >
          <span className="ti ti-sun"><Icon name="sun" size={19} /></span>
          <span className="ti ti-moon"><Icon name="moon" size={18} /></span>
        </button>
        <div className="lang">
          <button type="button" className="lang-btn" onClick={() => setLang((v) => !v)} aria-haspopup="true" aria-expanded={lang}>
            <Icon name="globe" size={17} /><span>EN</span><Icon name="chevron" size={15} />
          </button>
          {lang ? (
            <ul className="lang-menu">
              {LANGS.map((l) => <li key={l.code}><a href={langHref(l.code)} lang={l.code}>{l.name}</a></li>)}
            </ul>
          ) : null}
        </div>
        <SheetLink className="btn btn-sm">{HERO.ctaPrimary.text}</SheetLink>
        <button type="button" className="menu-btn" onClick={() => { setMenu((v) => !v); setLang(false); }} aria-label={UI.menu.text} aria-expanded={menu}>
          <Icon name={menu ? "close" : "menu"} size={24} />
        </button>
      </div>
      {menu ? (
        <div className="drawer">
          <ul>
            {NAV.map((n) => (
              <li key={n.path}><a href={href(n.path)} onClick={() => setMenu(false)}>{n.label}<Icon name="arrow" size={20} /></a></li>
            ))}
          </ul>
          <div className="drawer-langs">{LANGS.map((l) => <a key={l.code} href={langHref(l.code)} lang={l.code}>{l.name}</a>)}</div>
          <div className="drawer-soc">{soc(20)}</div>
          <SheetLink className="btn" onClick={() => setMenu(false)}>{HERO.ctaPrimary.text}</SheetLink>
        </div>
      ) : null}
    </header>
  );
}
