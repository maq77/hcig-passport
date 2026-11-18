"use client";

/* Header, v6 (spec 015 section 4).
   Desktop: an ink top bar (36px) with the brief's three promises, email and phone, over the main
   bar: 88px that settles to 68px on scroll, ivory at 92% with blur, a hairline once scrolled, the
   nav underline drawing in. Phone and tablet: a 60px bar that slides away on scroll down and comes
   back on scroll up (transform only, rAF throttled), never while the menu is open or near the top.
   The menu is a full screen ivory sheet that opens as a circle from the burger: numbered links,
   the destinations, then WhatsApp, call and email. Focus is trapped inside, Escape closes it, focus
   returns to the burger, the page under it does not scroll. Reduced motion: a 200ms fade. */
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown, Clock, Globe, Mail, Phone, ShieldCheck } from "lucide-react";
import { SocialIcon, type SocialName } from "@/components/ui/Icon";
import { CallButton, WaButton } from "@/components/ui/Buttons";
import { asset, BASE, PHONE, SOCIAL } from "@/data/facts";
import { NAV } from "@/data/nav";
import { DESTINATIONS } from "@/data/clinics";
import { telHref } from "@/lib/wa";

type Labels = { nav: string[]; waLong: string; waShort: string; promises: string[]; email: string; address: string; accredited: string; partOf: string };

const PROMISE_ICONS = [Clock, ShieldCheck, Globe];
const NEAR_TOP = 120;
const FOLLOW = "Follow";

/* Desktop "Follow" item: a real button that opens the four network links. Click, hover and focus-within open it
   for pointer users; Escape, an outside click and focus leaving close it. */
function FollowMenu() {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const timer = useRef(0);
  const byHover = useRef(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); btn.current?.focus(); } };
    const onDown = (e: PointerEvent) => { if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("pointerdown", onDown); };
  }, [open]);
  const hover = (on: boolean, e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    window.clearTimeout(timer.current);
    if (on) { byHover.current = !open; setOpen(true); } else timer.current = window.setTimeout(() => { byHover.current = false; setOpen(false); }, 140);
  };
  return (
    <div ref={wrap} className={`follow ${open ? "open" : ""}`} onPointerEnter={(e) => hover(true, e)} onPointerLeave={(e) => hover(false, e)}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false); }}>
      <button ref={btn} type="button" className="follow-btn" aria-expanded={open} aria-controls="follow-panel" onClick={() => { if (byHover.current) { byHover.current = false; return; } setOpen((o) => !o); }}>
        {FOLLOW}<ChevronDown size={14} aria-hidden="true" />
      </button>
      <div id="follow-panel" className="follow-panel" hidden={!open}>
        {SOCIAL.map((s) => (
          <a key={s.id} href={s.href} target="_blank" rel="noopener" aria-label={s.label}>
            <i aria-hidden="true"><SocialIcon name={s.id as SocialName} size={16} /></i>{s.label}
          </a>
        ))}
      </div>
    </div>
  );
}

const pad = (n: number) => String(n).padStart(2, "0");

export function Header({ labels }: { labels: Labels }) {
  const [scrolled, setScrolled] = useState(false);
  const [away, setAway] = useState(false);
  const [open, setOpen] = useState(false);
  const [origin, setOrigin] = useState<{ x: number; y: number; r: number } | null>(null);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const sheet = useRef<HTMLDivElement>(null);
  const openRef = useRef(open);
  useEffect(() => { openRef.current = open; }, [open]);

  /* Scroll: one read per frame. */
  useEffect(() => {
    let last = window.scrollY;
    let raf = 0;
    const read = () => {
      raf = 0;
      const y = window.scrollY;
      setScrolled(y > 12);
      if (openRef.current || y < NEAR_TOP) setAway(false);
      else if (y > last + 6) setAway(true);
      else if (y < last - 6) setAway(false);
      last = y;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(read); };
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, []);

  const openMenu = useCallback(() => {
    const b = menuBtn.current?.getBoundingClientRect();
    const w = window.innerWidth, h = window.innerHeight;
    const x = b ? b.left + b.width / 2 : w - 38;
    const y = b ? b.top + b.height / 2 : 30;
    setOrigin({ x, y, r: Math.ceil(Math.hypot(Math.max(x, w - x), Math.max(y, h - y))) + 2 });
    setAway(false);
    setOpen(true);
  }, []);
  const closeMenu = useCallback(() => setOpen(false), []);

  /* While open: scroll lock, focus inside, Escape, a focus trap; on close, focus back to the burger. */
  useEffect(() => {
    if (!open) return;
    const burger = menuBtn.current;
    const body = document.body;
    const prev = body.style.overflow;
    body.style.overflow = "hidden";
    body.classList.add("has-layer");
    const t = window.setTimeout(() => closeBtn.current?.focus(), 60);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); setOpen(false); return; }
      if (e.key !== "Tab" || !sheet.current) return;
      const items = Array.from(sheet.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"));
      if (!items.length) return;
      const first = items[0], lastEl = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastEl.focus(); }
      else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      body.style.overflow = prev;
      body.classList.remove("has-layer");
      window.removeEventListener("keydown", onKey);
      burger?.focus({ preventScroll: true });
    };
  }, [open]);

  /* The menu item of the page you are on. Clinic and destination pages sit under Find a Clinic;
     the B2B pages under For Hotels & Partners. */
  const path = (usePathname() || "/").replace(/\/$/, "") || "/";
  const section = (p: string) =>
    p === "/" ? "/" :
    /^\/(our-clinics|clinics|hurghada|sahl-hasheesh|soma-bay|marsa-alam|el-quseir|north-coast)(\/|$)/.test(p) ? "/our-clinics" :
    /^\/(for-hotels|hotel-clinics|insurance-assistance-partners)(\/|$)/.test(p) ? "/for-hotels" :
    /^\/(services|beauty-wellness)(\/|$)/.test(p) ? "/services" :
    /^\/(about-us|international-accreditation)(\/|$)/.test(p) ? "/about-us" : p;
  const here = section(path);
  const links = NAV.map((n, i) => ({ href: `${BASE}${n.path}`, label: labels.nav[i], home: n.path === here }));

  const sheetStyle = origin ? ({ ["--mx" as string]: `${origin.x}px`, ["--my" as string]: `${origin.y}px`, ["--mr" as string]: `${origin.r}px` }) : undefined;

  return (
    <>
      <div className="topbar v6">
        <div className="topbar-in">
          <ul className="promises">
            {labels.promises.map((p, i) => {
              const Ico = PROMISE_ICONS[i] ?? Clock;
              return <li key={p}><Ico size={15} aria-hidden="true" />{p}</li>;
            })}
          </ul>
          <div className="topbar-contact">
            <a href={`mailto:${labels.email}`}><Mail size={15} aria-hidden="true" />{labels.email}</a>
            <a href={telHref} className="tb-phone" data-ev="phone_click" data-placement="topbar"><Phone size={15} aria-hidden="true" />{PHONE.display}</a>
            <span className="tb-div" aria-hidden="true" />
            <span className="tb-soc">
              {SOCIAL.map((s) => (
                <a key={s.id} href={s.href} target="_blank" rel="noopener" aria-label={s.label}><SocialIcon name={s.id as SocialName} size={s.id === "linkedin" ? 14 : 15} /></a>
              ))}
            </span>
          </div>
        </div>
      </div>

      <header className={`site-header v6 ${scrolled ? "scrolled" : ""} ${away && !open ? "away" : ""}`}>
        <div className="hdr">
          <a href={`${BASE}/`} className="logo" aria-label="24/7 Clinic">
            <img src={asset("/logos/marks/247-mark.svg")} alt="24/7 Clinic" width={60} height={58} />
          </a>
          <nav className="nav" aria-label="Main">
            {links.map((l) => (
              <a key={l.href} href={l.href} aria-current={l.home ? "page" : undefined}><span>{l.label}</span></a>
            ))}
            <FollowMenu />
          </nav>
          <div className="hdr-actions">
            <CallButton placement="header" iconOnly className="hdr-call" />
            <WaButton placement="header" small className="wa-long">{labels.waLong}</WaButton>
            <WaButton placement="header" small className="wa-short">{labels.waShort}</WaButton>
            <button ref={menuBtn} type="button" className="menu-btn" aria-label="Menu" aria-expanded={open} aria-controls="site-menu" onClick={openMenu}>
              <span className="bars" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <div ref={sheet} id="site-menu" className={`menu v6 ${open ? "open" : ""}`} role="dialog" aria-modal="true" aria-label="Menu"
        aria-hidden={!open} inert={!open} style={sheetStyle}>
        <div className="menu-top">
          <img src={asset("/logos/marks/247-mark.svg")} alt="24/7 Clinic" width={42} height={40} />
          <button ref={closeBtn} type="button" className="menu-btn close" aria-label="Close" onClick={closeMenu}>
            <span className="bars" aria-hidden="true" />
          </button>
        </div>
        <div className="menu-body">
          <nav aria-label="Main">
            <ol className="menu-list">
              {links.map((l, i) => (
                <li key={l.href} style={{ ["--i" as string]: i }}>
                  <a href={l.href} onClick={closeMenu} aria-current={l.home ? "page" : undefined}>
                    <span className="menu-n num" aria-hidden="true">{pad(i + 1)}</span>
                    <span className="menu-t">{l.label}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <div className="menu-dest">
            <span className="label">Destinations</span>
            <ul>
              {DESTINATIONS.map((d, i) => (
                <li key={d.id} style={{ ["--i" as string]: links.length + i }}><a href={`${BASE}/${d.id}`} onClick={closeMenu}>{d.name}</a></li>
              ))}
            </ul>
          </div>
          <div className="menu-foot">
            <WaButton placement="menu" block>{labels.waLong}</WaButton>
            <CallButton placement="menu" className="btn-block" />
            <a className="menu-mail" href={`mailto:${labels.email}`}><Mail size={16} aria-hidden="true" /><span>{labels.email}</span></a>
          </div>
          <div className="menu-follow" style={{ ["--i" as string]: links.length + DESTINATIONS.length }}>
            <span className="menu-follow-l">{FOLLOW}</span>
            {SOCIAL.map((s) => (
              <a key={s.id} href={s.href} target="_blank" rel="noopener" aria-label={s.label} onClick={closeMenu}><SocialIcon name={s.id as SocialName} /></a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
