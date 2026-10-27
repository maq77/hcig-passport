"use client";
// Section modals (his idea, 2026-10-27): the page stays minimal, the modal holds the full details and the image, with a
// style of its own per section. Desktop: a card that opens out of the clicked card; phones: a bottom sheet that slides
// up and closes on a drag down. Escape, the X or a click outside closes it; focus goes in and comes back to the card.
import { AnimatePresence, motion, useReducedMotion, type PanInfo } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { UI } from "@/content/home.mjs";
import { Icon } from "./Icon";
import { EASE } from "./Motion";

export type ModalItem = { title: string; text: string; icon?: string; img?: string; href?: string };
type Props = {
  items: ModalItem[];
  index: number | null;
  origin: { x: number; y: number } | null;
  variant: "why" | "built" | "care";
  section: string;
  onIndex: (i: number) => void;
  onClose: () => void;
  render: (item: ModalItem, i: number, nav: ReactNode) => ReactNode;
};

const PHONE = "(max-width: 760px)";

export function DetailModal({ items, index, origin, variant, section, onIndex, onClose, render }: Props) {
  const reduce = useReducedMotion();
  const [phone, setPhone] = useState(false);
  const [mounted, setMounted] = useState(false);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const open = index !== null;

  useEffect(() => { setMounted(true); setPhone(matchMedia(PHONE).matches); }, []);
  useEffect(() => {
    if (!open) return;
    setPhone(matchMedia(PHONE).matches);
    document.documentElement.classList.add("modal-open");
    const t = setTimeout(() => closeBtn.current?.focus(), 60);
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onIndex(((index as number) + 1) % items.length);
      if (e.key === "ArrowLeft") onIndex(((index as number) - 1 + items.length) % items.length);
    };
    addEventListener("keydown", key);
    return () => { clearTimeout(t); removeEventListener("keydown", key); document.documentElement.classList.remove("modal-open"); };
  }, [open, index, items.length, onClose, onIndex]);

  if (!mounted) return null;
  const i = index ?? 0;
  const go = (d: number) => onIndex((i + d + items.length) % items.length);
  const nav = (
    <div className="dm-nav">
      <b>{String(i + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</b>
      <button type="button" className="dm-arrow" onClick={() => go(-1)} aria-label={UI.prev.text}><Icon name="arrow" size={18} className="flip-x" /></button>
      <button type="button" className="dm-arrow" onClick={() => go(1)} aria-label={UI.next.text}><Icon name="arrow" size={18} /></button>
    </div>
  );
  const ox = origin ? `calc(50% + ${Math.round(origin.x)}px)` : "50%";
  const oy = origin ? `calc(50% + ${Math.round(origin.y)}px)` : "50%";
  const desktopIn = reduce ? { opacity: 0 } : { opacity: 0, scale: 0.86, y: 24 };
  const sheetIn = reduce ? { opacity: 0 } : { y: "100%" };
  const onDragEnd = (_: unknown, info: PanInfo) => { if (info.offset.y > 110 || info.velocity.y > 600) onClose(); };

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div key="dm" className={`dm dm-${variant}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.3 } }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
          <motion.div
            className="dm-card"
            role="dialog"
            aria-modal="true"
            aria-label={`${section}: ${items[i].title}`}
            style={phone ? undefined : { transformOrigin: `${ox} ${oy}` }}
            initial={phone ? sheetIn : desktopIn}
            animate={phone ? { y: 0, opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
            exit={phone ? { y: "100%", transition: { duration: 0.35, ease: [0.7, 0, 0.84, 0] } } : { opacity: 0, scale: 0.94, y: 16, transition: { duration: 0.28, ease: [0.7, 0, 0.84, 0] } }}
            transition={{ duration: phone ? 0.55 : 0.6, ease: EASE }}
            drag={phone && !reduce ? "y" : false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={onDragEnd}
          >
            {phone ? <span className="dm-grab" aria-hidden="true" /> : null}
            <button ref={closeBtn} type="button" className="dm-x" onClick={onClose} aria-label={UI.close.text}><Icon name="close" size={20} /></button>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={i} className="dm-body" initial={{ opacity: 0, x: reduce ? 0 : 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: reduce ? 0 : -18 }} transition={{ duration: 0.35, ease: EASE }}>
                {render(items[i], i, nav)}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

/** Open a modal from a card: remembers where the card is, so the modal can open out of it. */
export function useDetail() {
  const [index, setIndex] = useState<number | null>(null);
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null);
  const last = useRef<HTMLElement | null>(null);
  const openAt = (i: number, el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    // offset of the card centre from the screen centre, where the modal sits
    setOrigin({ x: r.left + r.width / 2 - innerWidth / 2, y: r.top + r.height / 2 - innerHeight / 2 });
    last.current = el;
    setIndex(i);
  };
  const close = () => { setIndex(null); setTimeout(() => last.current?.focus(), 80); };
  /** Props for a card that opens the modal: a real button for keyboard and screen readers. */
  const trigger = (i: number) => ({
    role: "button" as const,
    tabIndex: 0,
    onClick: (e: React.MouseEvent<HTMLElement>) => { if ((e.target as Element).closest("a")) e.preventDefault(); openAt(i, e.currentTarget); },
    onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openAt(i, e.currentTarget); } },
  });
  return { index, origin, setIndex, close, trigger };
}
