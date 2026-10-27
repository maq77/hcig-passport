"use client";
// Site header, his picks 2026-10-26: D2 on desktop (tall and clear over the hero, then a slim frosted bar that follows
// the reader down), M1 on phones (a floating frosted bar; the 3 lines open a full-screen white menu whose numbered
// Helma links rise one by one), and on phones the bar hides while scrolling down and returns on the way up.
// The logo is never squeezed: it keeps its own 3.1 : 1 shape at 60 px, 44 px once scrolled, 40 px on phones.
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { NAV, LANGS, HERO, UI } from "@/content/home.mjs";
import { asset, href } from "@/lib/site";
import { Icon } from "@/components/ui/Icon";
import { SheetLink, openSheet } from "@/components/ui/Sheet";
import { EASE } from "@/components/ui/Motion";
import type { IconName } from "@/lib/icons";
import { useTheme } from "./Theme";

export const SOCIAL: { name: string; icon: IconName; url: string }[] = [
  { name: "Facebook", icon: "facebook", url: "https://www.facebook.com/profile.php?id=61573961671310" },
  { name: "LinkedIn", icon: "linkedin", url: "https://www.linkedin.com/company/healthcareig/" },
  { name: "Instagram", icon: "instagram", url: "https://www.instagram.com/hcig.egypt" },
];

const langHref = (code: string) => href("/" + (code === "en" ? "" : code + "/"));
const PHONE = "(max-width: 1080px)";

export function Header() {
  const pathname = usePathname() || "/";
  const isCurrent = (p: string) => (p === "/" ? pathname === "/" : pathname.startsWith(p));
  const { night, toggle: onTheme } = useTheme();
  const [lang, setLang] = useState(false);
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const burger = useRef<HTMLButtonElement>(null);
  const first = useRef<HTMLAnchorElement>(null);
  const reduce = useReducedMotion();

  // scrolled state, and on phones: hide while scrolling down, come back on the way up
  useEffect(() => {
    let last = scrollY;
    const onScroll = () => {
      const y = scrollY;
      setScrolled(y > 24);
      if (matchMedia(PHONE).matches) {
        if (y > 140 && y > last + 4) setHidden(true);
        else if (y < last - 4 || y < 140) setHidden(false);
      } else setHidden(false);
      last = y;
    };
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, []);

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

  // the open menu holds the page still and takes the focus; closing gives it back to the 3 lines
  useEffect(() => {
    const root = document.documentElement;
    if (menu) {
      root.classList.add("menu-open");
      setTimeout(() => first.current?.focus(), 300);
    } else {
      root.classList.remove("menu-open");
    }
    return () => root.classList.remove("menu-open");
  }, [menu]);

  const close = (refocus = true) => {
    setMenu(false);
    if (refocus) setTimeout(() => burger.current?.focus(), 50);
  };

  const soc = (size: number) =>
    SOCIAL.map((s) => (
      <a key={s.name} href={s.url} target="_blank" rel="noopener" aria-label={s.name}><Icon name={s.icon} size={size} /></a>
    ));

  const logo = (cls: string) => (
    <span className={`lg ${cls}`}>
      <img className="hd-full th-d" src={asset("logo-h-white")} alt="Healthcare International Group" width={703} height={227} />
      <img className="hd-full th-l" src={asset("logo-h-black")} alt="" aria-hidden="true" width={703} height={227} />
    </span>
  );

  const D = reduce ? 0 : 1;
  return (
    <>
      <header className={`hd ${scrolled || !night ? "theme-day" : "theme-night"}${scrolled ? " hd-sc" : ""}${hidden && !menu ? " hd-hide" : ""}`}>
        <div className="hd-in">
          <a href={href("/")} className="hd-logo" aria-label={UI.home.text}>{logo("hd-full-box")}</a>
          <nav className="hd-nav" aria-label={UI.mainNav.text}>
            <ul>
              {NAV.map((n) => (
                <li key={n.path}><a href={href(n.path)} aria-current={isCurrent(n.path) ? "page" : undefined}>{n.label}</a></li>
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
            <button ref={burger} type="button" className="menu-btn" onClick={() => setMenu(true)} aria-label={UI.menu.text} aria-expanded={menu} aria-controls="site-menu">
              <Icon name="menu" size={22} />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menu ? (
          <motion.div
            id="site-menu"
            className="menu"
            role="dialog"
            aria-modal="true"
            aria-label={UI.menu.text}
            initial={reduce ? { opacity: 0 } : { clipPath: "circle(0% at calc(100% - 44px) 44px)" }}
            animate={reduce ? { opacity: 1 } : { clipPath: "circle(150% at calc(100% - 44px) 44px)" }}
            exit={reduce ? { opacity: 0 } : { clipPath: "circle(0% at calc(100% - 44px) 44px)", transition: { duration: 0.45, ease: [0.7, 0, 0.84, 0] } }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <div className="menu-bar">
              <a href={href("/")} className="hd-logo" aria-label={UI.home.text} onClick={() => close(false)}>
                <img className="menu-logo" src={asset("logo-h-black")} alt="Healthcare International Group" width={703} height={227} />
              </a>
              <button type="button" className="menu-x" onClick={() => close()} aria-label={UI.close.text}><Icon name="close" size={22} /></button>
            </div>
            <nav aria-label={UI.mainNav.text}>
              <ol className="menu-links">
                {NAV.map((n, i) => (
                  <motion.li
                    key={n.path}
                    initial={{ opacity: 0, y: 28 * D }}
                    animate={{ opacity: 1, y: 0, transition: { delay: 0.18 + i * 0.055, duration: 0.7, ease: EASE } }}
                    exit={{ opacity: 0, transition: { duration: 0.15 } }}
                  >
                    <span className="menu-n" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                    <a ref={i === 0 ? first : undefined} href={href(n.path)} aria-current={isCurrent(n.path) ? "page" : undefined} onClick={() => close(false)}>{n.label}</a>
                  </motion.li>
                ))}
              </ol>
            </nav>
            <motion.div className="menu-foot" initial={{ opacity: 0, y: 16 * D }} animate={{ opacity: 1, y: 0, transition: { delay: 0.6, duration: 0.6, ease: EASE } }} exit={{ opacity: 0 }}>
              <div className="menu-langs">
                {LANGS.map((l) => <a key={l.code} href={langHref(l.code)} lang={l.code} className={l.code === "en" ? "on" : ""}>{l.name}</a>)}
              </div>
              <div className="menu-soc">{soc(20)}</div>
              <button type="button" className="btn menu-cta" onClick={() => { close(false); setTimeout(openSheet, 350); }}>
                {HERO.ctaPrimary.text}<Icon name="arrow" />
              </button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
