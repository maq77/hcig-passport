"use client";

/* The home editor (dev only: npm run edit, then open the home with ?edit=1).
   The page loads twice: the outer copy is the editor panel, the inner copy runs in an
   iframe at a chosen device width and takes the clicks, typing, drags and image drops.
   Every change shows live through one stylesheet built by editor/css.mjs, the same code
   the save server uses, so what you see is what is saved. The iframe carries the class
   e-live, which switches the saved rules off while the live copy (saved + pending) runs,
   so a later change always wins over an earlier saved one.
   Changes apply to the device being viewed: Desktop, Tablet or Phone. */
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  AlignCenter, AlignLeft, AlignRight, ArrowDown, ArrowUp, Eye, EyeOff, GripVertical, ImagePlus, Minus,
  Monitor, Plus, Redo2, RotateCcw, Smartphone, Tablet, Trash2, Undo2,
} from "lucide-react";
import initialLayout from "@/content/home-layout.json";
import { BLOCK_PLACEHOLDER, BLOCK_TYPES } from "./blocks";
import { DEVICE_OF_WIDTH, editsCss, mergeRules } from "../../../editor/css.mjs";

const API = "http://127.0.0.1:3100";

type Layout = {
  order: string[];
  hidden: string[];
  styles?: Record<string, Record<string, string>>;
  blocks?: Record<string, Record<string, string>>;
};
/* --primary, --ink, --surface, font-size, and the space between sections: --section for
   every width, --section-m for phones only. */
type Theme = Record<string, string>;
type Rule = { media: string; selector: string; props: Record<string, string> };
type Draft = {
  layout: Layout;
  theme: Theme | null; // null: untouched, the file is not written
  themeReset: boolean;
  texts: { from: string; to: string; section?: string }[];
  rules: Record<string, string | null>; // media␁selector␁prop -> value (null removes)
};
type Computed = { zoom: number; mt: number; mb: number; lh: number; ls: number };
type Selected = { selector: string; label: string; computed: Computed | null };
type Sec = { name: string; pads: { top: number; bottom: number } | null };
type Note = { id: number; ok: boolean; text: string };

const SEP = "\u0001";
const keyOf = (media: string, selector: string, prop: string) => [media, selector, prop].join(SEP);
function changesOf(rules: Draft["rules"]) {
  const out: { media: string; selector: string; props: Record<string, string | null> }[] = [];
  for (const [k, v] of Object.entries(rules)) {
    const [media, selector, prop] = k.split(SEP);
    let c = out.find((x) => x.media === media && x.selector === selector);
    if (!c) out.push((c = { media, selector, props: {} }));
    c.props[prop] = v;
  }
  return out;
}

const NAMES: Record<string, string> = {
  Hero: "Hero", HotelBand: "Numbers and hotels", Facilities: "Accreditation film", Services: "Services",
  Intro: "Care in your resort", HowItWorks: "How it works", Insurance: "Insurance", Stories: "Patient stories",
  Posts: "Blog posts", Finder: "Find a clinic", FinalCta: "FAQs on the photo",
};
const DEVICE_LABEL: Record<string, string> = { desktop: "Desktop", tablet: "Tablet", phone: "Phone" };
const blockType = (name: string) => BLOCK_TYPES.find((b) => name.startsWith(`${b.type}-`));
const labelOf = (name: string) => NAMES[name] ?? `${blockType(name)?.label ?? "Section"} (added)`;

/* Brand colours only (brand guideline/design-md/clinic247/DESIGN.md). */
const SWATCHES = [
  { label: "Classic red", value: "var(--primary)", hex: "#c00000" },
  { label: "Deep red", value: "var(--primary-deep)", hex: "#9a0000" },
  { label: "Ink", value: "var(--ink)", hex: "#1a1414" },
  { label: "Soft ink", value: "var(--ink-2)", hex: "#4d4543" },
  { label: "White", value: "#ffffff", hex: "#ffffff" },
];

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));
const fresh = (layout: Layout): Draft => ({ layout: clone(layout), theme: null, themeReset: false, texts: [], rules: {} });
const num = (v: string | null | undefined) => (v == null || v === "" ? null : parseFloat(v));

function luminance(hex: string) {
  const c = hex.replace("#", "").match(/.{2}/g)?.map((x) => parseInt(x, 16) / 255) ?? [1, 1, 1];
  const [r, g, b] = c.map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const contrast = (a: string, b: string) => {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

/* Everything, saved and pending, as one stylesheet for the iframe. */
function previewCss(d: Draft, saved: Rule[]): string {
  const css: string[] = ["main{display:flex;flex-direction:column}"];
  if (d.theme) {
    const { "--section-m": sm, ...all } = d.theme;
    css.push(`:root{${Object.entries(all).map(([k, v]) => `${k}:${v}`).join(";")}}`);
    if (sm) css.push(`@media (max-width: 767px){:root{--section:${sm}}}`);
  }
  d.layout.order.forEach((n, i) => {
    css.push(`[data-e-section="${n}"]{order:${i};display:${d.layout.hidden.includes(n) ? "none" : "block"}!important}`);
  });
  css.push(editsCss(d.layout, { rules: mergeRules(saved, changesOf(d.rules)) }, "html.e-live"));
  return css.join("\n");
}

/* ------------------------------------------------------------ inside the iframe */

/* A selector that survives small markup changes: ids and section names first, then
   class names, and a position only where two siblings would otherwise match. */
const STATE = /^(rv|in|on|done|run|is-.*|scrolled|open|quiet|has-img)$/;
function selectorFor(el: Element): string {
  const cls = (e: Element) => [...e.classList].find((c) => /^[a-z][a-z0-9_-]*$/i.test(c) && !STATE.test(c));
  const parts: string[] = [];
  let cur: Element | null = el;
  while (cur && cur !== document.body) {
    if (cur.id) { parts.unshift(`#${CSS.escape(cur.id)}`); return parts.join(" > "); }
    const sec = cur.getAttribute("data-e-section");
    if (sec) { parts.unshift(`[data-e-section="${sec}"]`); return parts.join(" > "); }
    const tag = cur.tagName.toLowerCase();
    const c = cls(cur);
    let part = c ? `${tag}.${CSS.escape(c)}` : tag;
    const p: Element | null = cur.parentElement;
    const node: Element = cur;
    if (p && [...p.children].filter((s) => s.matches(part)).length > 1) {
      part += `:nth-of-type(${[...p.children].filter((s) => s.tagName === node.tagName).indexOf(node) + 1})`;
    }
    parts.unshift(part);
    cur = p;
  }
  return ["body", ...parts].join(" > ");
}

function EditorInner() {
  useEffect(() => {
    const post = (msg: object) => window.parent.postMessage(msg, location.origin);
    document.documentElement.classList.add("e-live");
    const style = document.createElement("style");
    style.id = "e-preview";
    const marks = document.createElement("style");
    marks.textContent = `
      [data-e-hover]{outline:2px dashed #c00000!important;outline-offset:2px;cursor:pointer}
      [data-e-drop]{outline:3px solid #25d366!important;outline-offset:-3px}
      [contenteditable]{cursor:text;background:rgba(192,0,0,.04)}
      .e-layer{position:absolute;left:0;top:0;width:100%;height:0;z-index:2147483000;pointer-events:none}
      .e-gap{position:absolute;left:0;right:0;height:22px;margin-top:-11px;pointer-events:auto;cursor:ns-resize;display:flex;align-items:center;justify-content:center;touch-action:none}
      .e-gap::before{content:"";position:absolute;left:0;right:0;top:10px;height:2px;background:#c00000;opacity:.18;transition:opacity .15s}
      .e-gap:hover::before,.e-gap.drag::before{opacity:1}
      .e-pill{position:relative;display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:999px;background:#c00000;color:#fff;font:600 12px/1.3 system-ui,sans-serif;box-shadow:0 6px 16px rgba(192,0,0,.3);white-space:nowrap}
      .e-gap .e-pill{opacity:0;transform:scale(.9);transition:opacity .15s,transform .15s}
      .e-gap:hover .e-pill,.e-gap.drag .e-pill{opacity:1;transform:none}
      .e-sel{position:absolute;outline:2px solid #c00000;outline-offset:2px;border-radius:4px;pointer-events:none}
      .e-h{position:absolute;pointer-events:auto;touch-action:none;background:#fff;border:2px solid #c00000;box-shadow:0 2px 8px rgba(26,20,20,.25)}
      .e-h-size{right:-9px;bottom:-9px;width:14px;height:14px;border-radius:4px;cursor:nwse-resize}
      .e-h-top,.e-h-bot{left:50%;width:34px;height:10px;margin-left:-17px;border-radius:999px;cursor:ns-resize}
      .e-h-top{top:-7px}.e-h-bot{bottom:-7px}
      .e-sel .e-pill{position:absolute;right:0;top:-34px}`;
    document.head.append(style, marks);

    const layer = document.createElement("div");
    layer.className = "e-layer";
    document.body.append(layer);
    const gaps = document.createElement("div");
    const box = document.createElement("div");
    box.className = "e-sel";
    box.hidden = true;
    box.innerHTML = `<span class="e-pill"></span><span class="e-h e-h-top" title="Drag: space above"></span><span class="e-h e-h-bot" title="Drag: space below"></span><span class="e-h e-h-size" title="Drag: size"></span>`;
    layer.append(gaps, box);
    const pill = box.querySelector(".e-pill") as HTMLElement;

    const inlined = new Set<HTMLElement>();
    let dragging = false;
    let selected: HTMLElement | null = null;
    let original = "";
    const px = (el: Element, p: "paddingTop" | "paddingBottom" | "marginTop" | "marginBottom") => parseFloat(getComputedStyle(el)[p]) || 0;
    const computedOf = (el: HTMLElement): Computed => {
      const cs = getComputedStyle(el);
      const fs = parseFloat(cs.fontSize) || 16;
      return {
        zoom: parseFloat(cs.zoom) || 1,
        mt: parseFloat(cs.marginTop) || 0,
        mb: parseFloat(cs.marginBottom) || 0,
        lh: cs.lineHeight === "normal" ? 1.2 : Math.round((parseFloat(cs.lineHeight) / fs) * 100) / 100,
        ls: cs.letterSpacing === "normal" ? 0 : parseFloat(cs.letterSpacing) || 0,
      };
    };

    /* The selection box and its three handles. */
    const drawSel = () => {
      if (!selected || !selected.isConnected) { box.hidden = true; return; }
      const r = selected.getBoundingClientRect();
      box.hidden = false;
      Object.assign(box.style, { left: `${r.left + scrollX}px`, top: `${r.top + scrollY}px`, width: `${r.width}px`, height: `${r.height}px` });
      const c = computedOf(selected);
      pill.textContent = `${Math.round(c.zoom * 100)}%  ·  ↑ ${Math.round(c.mt)}  ↓ ${Math.round(c.mb)}`;
    };
    const dragHandle = (cls: string, onMove: (dx: number, dy: number, start: Computed) => Record<string, string | null>) => {
      const h = box.querySelector(cls) as HTMLElement;
      h.addEventListener("pointerdown", (ev) => {
        if (!selected) return;
        ev.preventDefault();
        ev.stopPropagation();
        h.setPointerCapture(ev.pointerId);
        dragging = true;
        const el = selected, x0 = ev.clientX, y0 = ev.clientY, start = computedOf(el);
        let props: Record<string, string | null> = {};
        const move = (m: PointerEvent) => {
          props = onMove(m.clientX - x0, m.clientY - y0, start);
          for (const [k, v] of Object.entries(props)) el.style.setProperty(k, v ?? "", "important");
          inlined.add(el);
          drawSel();
        };
        h.addEventListener("pointermove", move);
        h.addEventListener("pointerup", () => {
          h.removeEventListener("pointermove", move);
          dragging = false;
          if (Object.keys(props).length) post({ type: "rule", selector: selectorFor(el), props });
        }, { once: true });
      });
    };
    dragHandle(".e-h-size", (dx, _dy, s) => {
      const z = Math.min(3, Math.max(0.3, Math.round((s.zoom * (1 + dx / 220)) / 0.05) * 0.05));
      return { zoom: z.toFixed(2) };
    });
    dragHandle(".e-h-top", (_dx, dy, s) => ({ "margin-top": `${Math.round(s.mt - dy)}px` }));
    dragHandle(".e-h-bot", (_dx, dy, s) => ({ "margin-bottom": `${Math.round(s.mb + dy)}px` }));

    /* Drag handles on every boundary between sections: drag to change the space. Half the
       change goes under the section above, half over the one below. */
    const placeGaps = () => {
      /* The page-wide gap itself, measured on a probe (a section may carry its own). */
      const probe = document.createElement("div");
      probe.style.cssText = "position:absolute;visibility:hidden;padding-top:var(--section)";
      layer.append(probe);
      post({ type: "metrics", section: px(probe, "paddingTop") });
      probe.remove();
      gaps.replaceChildren();
      const secs = [...document.querySelectorAll<HTMLElement>("[data-e-section]")]
        .filter((s) => s.firstElementChild && s.getClientRects().length)
        .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
      for (let k = 1; k < secs.length; k++) {
        const a = secs[k - 1], b = secs[k];
        const ai = a.firstElementChild as HTMLElement, bi = b.firstElementChild as HTMLElement;
        const h = document.createElement("div");
        h.className = "e-gap";
        h.style.top = `${b.getBoundingClientRect().top + scrollY}px`;
        const tag = document.createElement("span");
        tag.className = "e-pill";
        tag.textContent = `↕ ${Math.round(px(ai, "paddingBottom") + px(bi, "paddingTop"))}px, drag to change`;
        h.append(tag);
        h.addEventListener("pointerdown", (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          h.setPointerCapture(ev.pointerId);
          h.classList.add("drag");
          dragging = true;
          const y0 = ev.clientY, a0 = px(ai, "paddingBottom"), b0 = px(bi, "paddingTop");
          let aN = a0, bN = b0;
          const move = (m: PointerEvent) => {
            const dy = m.clientY - y0;
            aN = Math.max(0, Math.round((a0 + dy / 2) / 2) * 2);
            bN = Math.max(0, Math.round((b0 + dy / 2) / 2) * 2);
            ai.style.setProperty("padding-bottom", `${aN}px`, "important");
            bi.style.setProperty("padding-top", `${bN}px`, "important");
            inlined.add(ai);
            inlined.add(bi);
            tag.textContent = `↕ ${aN + bN}px`;
            h.style.top = `${b.getBoundingClientRect().top + scrollY}px`;
          };
          h.addEventListener("pointermove", move);
          h.addEventListener("pointerup", () => {
            h.removeEventListener("pointermove", move);
            h.classList.remove("drag");
            dragging = false;
            if (aN !== a0 || bN !== b0) post({ type: "gap", a: a.dataset.eSection, b: b.dataset.eSection, aBottom: aN, bTop: bN });
          }, { once: true });
        });
        gaps.append(h);
      }
    };
    let raf = 0;
    const redraw = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => { if (!dragging) { placeGaps(); drawSel(); } });
    };
    const ro = new ResizeObserver(redraw);
    ro.observe(document.body);
    window.addEventListener("load", redraw);

    const editable = (el: HTMLElement) => el.children.length === 0 && !!el.textContent?.trim();
    const over = (e: MouseEvent) => { const t = e.target as HTMLElement; if (!t.closest?.(".e-layer")) t.setAttribute?.("data-e-hover", ""); };
    const out = (e: MouseEvent) => (e.target as HTMLElement).removeAttribute?.("data-e-hover");
    const click = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      if (el.isContentEditable) return;
      e.preventDefault();
      e.stopPropagation();
      if (el.closest(".e-layer")) return;
      selected = el;
      drawSel();
      const text = (el.textContent ?? "").trim().replace(/\s+/g, " ");
      const sec = el.closest<HTMLElement>("[data-e-section]");
      const inner = sec?.firstElementChild;
      post({
        type: "select", selector: selectorFor(el), label: `${el.tagName.toLowerCase()}${text ? `: ${text.slice(0, 48)}` : ""}`,
        computed: computedOf(el),
        section: sec?.dataset.eSection, pads: inner ? { top: px(inner, "paddingTop"), bottom: px(inner, "paddingBottom") } : null,
      });
      if (editable(el)) {
        original = el.textContent!.trim();
        el.contentEditable = "plaintext-only";
        el.focus();
      }
    };
    const finish = (el: HTMLElement, keep: boolean) => {
      if (!el.isContentEditable) return;
      const now = (el.textContent ?? "").trim();
      if (!keep) el.textContent = original;
      el.removeAttribute("contenteditable");
      if (keep && now && now !== original) {
        post({ type: "text", from: original, to: now, block: el.dataset.eBlock, field: el.dataset.eField, section: el.closest<HTMLElement>("[data-e-section]")?.dataset.eSection });
        original = now;
      }
    };
    const blur = (e: FocusEvent) => finish(e.target as HTMLElement, true);
    const key = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (!el.isContentEditable) return;
      if (e.key === "Enter") { e.preventDefault(); el.blur(); }
      if (e.key === "Escape") { finish(el, false); }
    };

    const slotAt = (e: DragEvent) =>
      document.elementsFromPoint(e.clientX, e.clientY).find((n) => n.hasAttribute("data-slot")) as HTMLElement | undefined;
    let dropTarget: HTMLElement | undefined;
    const dragover = (e: DragEvent) => {
      e.preventDefault();
      const s = slotAt(e);
      if (s !== dropTarget) { dropTarget?.removeAttribute("data-e-drop"); dropTarget = s; s?.setAttribute("data-e-drop", ""); }
    };
    const drop = async (e: DragEvent) => {
      e.preventDefault();
      dropTarget?.removeAttribute("data-e-drop");
      const slot = slotAt(e);
      const file = e.dataTransfer?.files[0];
      if (!slot || !file?.type.startsWith("image/")) {
        post({ type: "note", ok: false, text: "Drop an image file on a picture or a design slot." });
        return;
      }
      try {
        const res = await fetch(`${API}/save/image`, { method: "POST", headers: { "X-Slot-Name": slot.dataset.slot! }, body: file });
        const outp = await res.json();
        if (!res.ok) throw new Error(outp.error);
        post({ type: "image", text: `Saved ${outp.file} (${outp.width} x ${outp.height}).` });
      } catch (err) {
        post({ type: "note", ok: false, text: `Image not saved: ${(err as Error).message}. Is npm run edit running?` });
      }
    };

    const message = (e: MessageEvent) => {
      if (e.origin !== location.origin) return;
      if (e.data?.type === "css") {
        style.textContent = e.data.css;
        /* The live stylesheet now carries every drag: drop the drags' inline values. */
        for (const el of inlined) {
          for (const p of ["padding-top", "padding-bottom", "zoom", "margin-top", "margin-bottom"]) el.style.removeProperty(p);
        }
        inlined.clear();
        redraw();
      }
      if (e.data?.type === "scrollTo") {
        document.querySelector(`[data-e-section="${CSS.escape(e.data.name)}"]`)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      if (e.data?.type === "deselect") { selected = null; drawSel(); }
    };

    document.addEventListener("mouseover", over);
    document.addEventListener("mouseout", out);
    document.addEventListener("click", click, true);
    document.addEventListener("blur", blur, true);
    document.addEventListener("keydown", key, true);
    document.addEventListener("dragover", dragover);
    document.addEventListener("drop", drop);
    window.addEventListener("message", message);
    post({ type: "ready" });
    return () => {
      document.removeEventListener("mouseover", over);
      document.removeEventListener("mouseout", out);
      document.removeEventListener("click", click, true);
      document.removeEventListener("blur", blur, true);
      document.removeEventListener("keydown", key, true);
      document.removeEventListener("dragover", dragover);
      document.removeEventListener("drop", drop);
      window.removeEventListener("message", message);
      window.removeEventListener("load", redraw);
      ro.disconnect();
      cancelAnimationFrame(raf);
      layer.remove();
      style.remove();
      marks.remove();
      document.documentElement.classList.remove("e-live");
    };
  }, []);
  return null;
}

/* ------------------------------------------------------------ the editor panel */

const WIDTHS = [
  { w: 375, icon: Smartphone, label: "Phone" },
  { w: 768, icon: Tablet, label: "Tablet" },
  { w: 1440, icon: Monitor, label: "Desktop" },
];

function Panel({ title, children, extra }: { title: string; children: React.ReactNode; extra?: React.ReactNode }) {
  return (
    <section className="border-b border-stone-200 px-4 py-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-500">{title}</h3>
        {extra}
      </div>
      {children}
    </section>
  );
}

function IconBtn({ label, onClick, children, disabled, active }: {
  label: string; onClick: () => void; children: React.ReactNode; disabled?: boolean; active?: boolean;
}) {
  return (
    <button type="button" title={label} aria-label={label} onClick={onClick} disabled={disabled}
      className={`grid h-8 w-8 place-items-center rounded-lg border transition-colors disabled:opacity-30 ${active ? "border-[#c00000] bg-[#fdf3f2] text-[#c00000]" : "border-stone-200 bg-white text-stone-700 hover:border-stone-400"}`}>
      {children}
    </button>
  );
}

function Slider({ label, value, min, max, step, unit = "", auto, format, onChange, onClear }: {
  label: string; value: number | null; min: number; max: number; step: number; unit?: string;
  auto?: number | null; format?: (v: number) => string; onChange: (v: number) => void; onClear: () => void;
}) {
  /* Unset, the slider sits at the size the page has now (auto) and shows it greyed. */
  const shown = value ?? (auto != null ? auto : null);
  const text = shown === null ? "auto" : format ? format(shown) : `${Math.round(shown * 100) / 100}${unit}`;
  return (
    <label className="grid grid-cols-[92px_1fr_56px_20px] items-center gap-2 text-xs text-stone-600">
      <span>{label}</span>
      <input type="range" min={min} max={max} step={step} value={shown ?? min} onChange={(e) => onChange(Number(e.target.value))}
        className={`w-full accent-[#c00000] ${value === null ? "opacity-50" : ""}`} />
      <span className={`text-right tabular-nums ${value === null ? "text-stone-400" : "font-medium text-stone-900"}`}>{text}</span>
      <button type="button" onClick={onClear} aria-label={`Reset ${label}`} title="Back to the design" className="text-stone-400 hover:text-stone-800 disabled:opacity-30" disabled={value === null}>
        <RotateCcw size={12} />
      </button>
    </label>
  );
}

function EditorShell() {
  const [baseline, setBaseline] = useState<Layout>(() => clone(initialLayout as Layout));
  const [hist, setHist] = useState<{ list: Draft[]; ptr: number }>(() => ({ list: [fresh(initialLayout as Layout)], ptr: 0 }));
  const draft = hist.list[hist.ptr];
  const [saved, setSaved] = useState<Rule[]>([]);
  const [brand, setBrand] = useState<Theme | null>(null);
  const [width, setWidth] = useState(1440);
  const [area, setArea] = useState({ w: 1000, h: 800 });
  const [selected, setSelected] = useState<Selected | null>(null);
  const [sec, setSec] = useState<Sec | null>(null);
  const [sectionPx, setSectionPx] = useState<number | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [log, setLog] = useState("");
  const [online, setOnline] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const stage = useRef<HTMLDivElement>(null);

  const device: string = DEVICE_OF_WIDTH(width);
  const phone = device === "phone";

  const note = useCallback((ok: boolean, text: string) => {
    setNotes((n) => [{ id: Date.now() + Math.random(), ok, text }, ...n].slice(0, 6));
  }, []);

  const push = useCallback((fn: (d: Draft) => Draft) => {
    setHist((h) => {
      const next = fn(clone(h.list[h.ptr]));
      return { list: [...h.list.slice(0, h.ptr + 1), next].slice(-150), ptr: Math.min(h.ptr + 1, 149) };
    });
  }, []);
  const undo = useCallback(() => setHist((h) => ({ ...h, ptr: Math.max(0, h.ptr - 1) })), []);
  const redo = useCallback(() => setHist((h) => ({ ...h, ptr: Math.min(h.list.length - 1, h.ptr + 1) })), []);

  const refreshLog = useCallback(async () => {
    try {
      const res = await fetch(`${API}/changes`);
      setLog(await res.text());
      setOnline(true);
    } catch {
      setOnline(false);
    }
  }, []);

  /* The brand values, read from the page's own stylesheet; the saved element changes. */
  useEffect(() => {
    const cs = getComputedStyle(document.documentElement);
    setBrand({
      "--primary": cs.getPropertyValue("--primary").trim(),
      "--ink": cs.getPropertyValue("--ink").trim(),
      "--surface": cs.getPropertyValue("--surface").trim(),
      "font-size": cs.fontSize,
    });
    refreshLog();
    fetch(`${API}/edits`).then((r) => r.json()).then((d) => setSaved(d.elements?.rules ?? [])).catch(() => {});
  }, [refreshLog]);

  /* Send the live stylesheet to the iframe whenever something changes. */
  const sendCss = useCallback(() => {
    frame.current?.contentWindow?.postMessage({ type: "css", css: previewCss(draft, saved) }, location.origin);
  }, [draft, saved]);
  useEffect(sendCss, [sendCss]);

  const setRules = useCallback((selector: string, props: Record<string, string | null>, media: string) => {
    push((d) => {
      for (const [p, v] of Object.entries(props)) d.rules[keyOf(media, selector, p)] = v;
      return d;
    });
  }, [push]);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== location.origin || e.source !== frame.current?.contentWindow) return;
      const m = e.data;
      if (m.type === "ready") sendCss();
      if (m.type === "metrics") setSectionPx(m.section);
      if (m.type === "select") {
        setSelected({ selector: m.selector, label: m.label, computed: m.computed ?? null });
        if (m.section) setSec({ name: m.section, pads: m.pads });
      }
      if (m.type === "rule") setRules(m.selector, m.props, device);
      if (m.type === "gap") {
        const [top, bottom] = phone ? ["--pad-top-m", "--pad-bottom-m"] : ["--pad-top", "--pad-bottom"];
        push((d) => {
          const styles = d.layout.styles ?? {};
          styles[m.a] = { ...(styles[m.a] ?? {}), [bottom]: `${m.aBottom}px` };
          styles[m.b] = { ...(styles[m.b] ?? {}), [top]: `${m.bTop}px` };
          d.layout.styles = styles;
          return d;
        });
      }
      if (m.type === "note") note(m.ok, m.text);
      if (m.type === "image") { note(true, m.text); refreshLog(); frame.current?.contentWindow?.location.reload(); }
      if (m.type === "text") {
        if (m.block && m.field) {
          push((d) => {
            d.layout.blocks = d.layout.blocks ?? {};
            d.layout.blocks[m.block] = { ...(d.layout.blocks[m.block] ?? {}), [m.field]: m.to };
            return d;
          });
        } else {
          push((d) => ({ ...d, texts: [...d.texts, { from: m.from, to: m.to, section: m.section }] }));
        }
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [note, push, refreshLog, sendCss, setRules, device, phone]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("input, textarea")) return;
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
      if (mod && (e.key.toLowerCase() === "y" || (e.shiftKey && e.key.toLowerCase() === "z"))) { e.preventDefault(); redo(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo]);

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setArea({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const L = draft.layout;
  const pending = hist.ptr;
  const theme = draft.theme ?? brand;

  const setStyle = (name: string, prop: string, value: string | null) => push((d) => {
    const styles = d.layout.styles ?? {};
    const st = { ...(styles[name] ?? {}) };
    if (value === null) delete st[prop]; else st[prop] = value;
    if (Object.keys(st).length) styles[name] = st; else delete styles[name];
    d.layout.styles = styles;
    return d;
  });
  const move = (i: number, j: number) => push((d) => {
    const o = d.layout.order;
    if (j < 0 || j >= o.length || i === j) return d;
    const [it] = o.splice(i, 1);
    o.splice(j, 0, it);
    return d;
  });
  const toggle = (name: string) => push((d) => {
    const h = d.layout.hidden;
    d.layout.hidden = h.includes(name) ? h.filter((n) => n !== name) : [...h, name];
    return d;
  });
  const addBlock = (type: string) => push((d) => {
    const name = `${type}-${Date.now().toString(36)}`;
    d.layout.order.push(name);
    d.layout.blocks = { ...(d.layout.blocks ?? {}), [name]: type === "FullImg" ? {} : { ...BLOCK_PLACEHOLDER } };
    return d;
  });
  const removeBlock = (name: string) => push((d) => {
    d.layout.order = d.layout.order.filter((n) => n !== name);
    d.layout.hidden = d.layout.hidden.filter((n) => n !== name);
    delete d.layout.blocks?.[name];
    delete d.layout.styles?.[name];
    return d;
  });

  /* An element's value on this device: pending first, then saved. */
  const savedProps = (selector: string) => saved.find((r) => r.media === device && r.selector === selector)?.props ?? {};
  const valueOf = (prop: string): string | null => {
    if (!selected) return null;
    const k = keyOf(device, selected.selector, prop);
    if (k in draft.rules) return draft.rules[k];
    return savedProps(selected.selector)[prop] ?? null;
  };
  const setRule = (prop: string, value: string | null) => { if (selected) setRules(selected.selector, { [prop]: value }, device); };
  const resetElement = () => {
    if (!selected) return;
    const props = { ...savedProps(selected.selector) } as Record<string, string | null>;
    for (const k of Object.keys(draft.rules)) {
      const [m, s, p] = k.split(SEP);
      if (m === device && s === selected.selector) props[p] = null;
    }
    for (const k of Object.keys(props)) props[k] = null;
    if (Object.keys(props).length) setRules(selected.selector, props, device);
  };
  const zoomNow = num(valueOf("zoom"));

  /* Section spacing: Phone edits phones only; Desktop and Tablet edit both of those. */
  const padKey = (side: "top" | "bottom") => `--pad-${side}${phone ? "-m" : ""}`;
  const padOf = (name: string, side: "top" | "bottom") => num(L.styles?.[name]?.[padKey(side)]);
  const pick = (name: string) => {
    setSec({ name, pads: null });
    frame.current?.contentWindow?.postMessage({ type: "scrollTo", name }, location.origin);
  };
  const gapKey = phone ? "--section-m" : "--section";
  const gapVal = num(draft.theme?.[gapKey]);
  const setGap = (v: number | null) => push((d) => {
    const t: Theme = { ...(d.theme ?? brand ?? {}) };
    if (v === null) delete t[gapKey]; else t[gapKey] = `${v}px`;
    return { ...d, themeReset: false, theme: t };
  });

  const reload = () => frame.current?.contentWindow?.location.reload();

  const save = async () => {
    setSaving(true);
    let failed = 0;
    const call = async (path: string, body: object) => {
      const res = await fetch(`${API}${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const out = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(out.error ?? res.statusText);
      return out;
    };
    try {
      for (const t of draft.texts) {
        try {
          const out = await call("/save/text", t);
          note(true, `Text saved in ${out.files.join(", ")}.`);
        } catch (e) { failed++; note(false, (e as Error).message); }
      }
      if (JSON.stringify(L) !== JSON.stringify(baseline)) {
        const added = Object.entries(L.blocks ?? {}).flatMap(([n, b]) => (L.order.includes(n) ? [b.title, b.body] : []))
          .filter((t) => t && t !== BLOCK_PLACEHOLDER.title && t !== BLOCK_PLACEHOLDER.body);
        await call("/save/layout", { layout: L, added });
        note(true, "Sections saved.");
      }
      if (draft.themeReset) { await call("/save/theme", { reset: true }); note(true, "Colours reset to the brand."); }
      else if (draft.theme) { await call("/save/theme", { vars: draft.theme }); note(true, "Colours and page spacing saved."); }
      const changes = changesOf(draft.rules);
      if (changes.length) {
        const out = await call("/save/elements", { changes });
        setSaved(out.rules ?? []);
        note(true, `${changes.length} element change${changes.length > 1 ? "s" : ""} saved.`);
      }
      setBaseline(clone(L));
      setHist({ list: [fresh(L)], ptr: 0 });
      if (failed) note(false, `${failed} text change${failed > 1 ? "s were" : " was"} not saved. See above.`);
    } catch (e) {
      note(false, `Save stopped: ${(e as Error).message}. Is npm run edit running?`);
    } finally {
      setSaving(false);
      refreshLog();
      reload();
    }
  };

  const discard = () => { setHist({ list: [fresh(baseline)], ptr: 0 }); reload(); };

  const scale = Math.min(1, (area.w - 32) / width);
  const frameH = (area.h - 32) / scale;

  const warnings: string[] = [];
  if (theme && /^#[0-9a-f]{6}$/i.test(theme["--primary"] ?? "") && contrast("#ffffff", theme["--primary"]) < 4.5) {
    warnings.push(`White on the red is ${contrast("#ffffff", theme["--primary"]).toFixed(1)}:1, under 4.5:1.`);
  }
  if (theme && /^#[0-9a-f]{6}$/i.test(theme["--ink"] ?? "") && /^#[0-9a-f]{6}$/i.test(theme["--surface"] ?? "") && contrast(theme["--ink"], theme["--surface"]) < 4.5) {
    warnings.push(`Text on the surface is ${contrast(theme["--ink"], theme["--surface"]).toFixed(1)}:1, under 4.5:1.`);
  }

  const deviceChip = (
    <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${phone ? "bg-[#e9f9ef] text-[#146c38]" : "bg-stone-100 text-stone-600"}`}>
      {DEVICE_LABEL[device]} only
    </span>
  );
  const c = selected?.computed;

  return (
    <div className="fixed inset-0 z-[999999] flex bg-stone-100 font-sans text-sm text-stone-900">
      <aside className="flex h-full w-[360px] shrink-0 flex-col border-r border-stone-200 bg-white">
        <header className="flex items-center justify-between gap-2 border-b border-stone-200 px-4 py-3">
          <div>
            <p className="text-[15px] font-semibold">Home editor</p>
            <p className="text-[11px] text-stone-500">
              {online === false ? <span className="text-[#c00000]">Save server off. Run npm run edit.</span> : "Click to select. Drag the red handles. Type on text."}
            </p>
          </div>
          <div className="flex gap-1.5">
            <IconBtn label="Undo (Ctrl Z)" onClick={undo} disabled={hist.ptr === 0}><Undo2 size={15} /></IconBtn>
            <IconBtn label="Redo (Ctrl Y)" onClick={redo} disabled={hist.ptr === hist.list.length - 1}><Redo2 size={15} /></IconBtn>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          {selected && (
            <Panel title="Selected" extra={<div className="flex items-center gap-2">{deviceChip}
              <button type="button" className="text-xs text-stone-500 hover:text-stone-900" onClick={() => { setSelected(null); frame.current?.contentWindow?.postMessage({ type: "deselect" }, location.origin); }}>Close</button></div>}>
              <p className="mb-3 truncate rounded-md bg-stone-100 px-2 py-1.5 font-mono text-[11px] text-stone-600" title={selected.selector}>{selected.label}</p>
              <div className="grid gap-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-[92px] text-xs text-stone-600">Size</span>
                  <IconBtn label="Smaller" onClick={() => setRule("zoom", Math.max(0.3, (zoomNow ?? c?.zoom ?? 1) - 0.05).toFixed(2))}><Minus size={14} /></IconBtn>
                  <span className={`w-12 text-center text-xs tabular-nums ${zoomNow === null ? "text-stone-400" : "font-medium"}`}>{Math.round((zoomNow ?? c?.zoom ?? 1) * 100)}%</span>
                  <IconBtn label="Bigger" onClick={() => setRule("zoom", Math.min(3, (zoomNow ?? c?.zoom ?? 1) + 0.05).toFixed(2))}><Plus size={14} /></IconBtn>
                  <button type="button" onClick={() => setRule("zoom", null)} aria-label="Reset size" title="Back to the design" className="ml-auto text-stone-400 hover:text-stone-800 disabled:opacity-30" disabled={zoomNow === null}><RotateCcw size={12} /></button>
                </div>
                <Slider label="Space above" value={num(valueOf("margin-top"))} auto={c ? Math.round(c.mt) : null} min={-40} max={200} step={2} unit="px"
                  onChange={(v) => setRule("margin-top", `${v}px`)} onClear={() => setRule("margin-top", null)} />
                <Slider label="Space below" value={num(valueOf("margin-bottom"))} auto={c ? Math.round(c.mb) : null} min={-40} max={200} step={2} unit="px"
                  onChange={(v) => setRule("margin-bottom", `${v}px`)} onClear={() => setRule("margin-bottom", null)} />
                <Slider label="Line spacing" value={num(valueOf("line-height"))} auto={c?.lh ?? null} min={0.8} max={2.4} step={0.05}
                  onChange={(v) => setRule("line-height", String(v))} onClear={() => setRule("line-height", null)} />
                <Slider label="Letter spacing" value={num(valueOf("letter-spacing"))} auto={c?.ls ?? null} min={-2} max={8} step={0.5} unit="px"
                  onChange={(v) => setRule("letter-spacing", `${v}px`)} onClear={() => setRule("letter-spacing", null)} />
                <div className="flex items-center gap-2">
                  <span className="w-[92px] text-xs text-stone-600">Align</span>
                  <IconBtn label="Left" active={valueOf("text-align") === "left"} onClick={() => setRule("text-align", valueOf("text-align") === "left" ? null : "left")}><AlignLeft size={14} /></IconBtn>
                  <IconBtn label="Centre" active={valueOf("text-align") === "center"} onClick={() => setRule("text-align", valueOf("text-align") === "center" ? null : "center")}><AlignCenter size={14} /></IconBtn>
                  <IconBtn label="Right" active={valueOf("text-align") === "right"} onClick={() => setRule("text-align", valueOf("text-align") === "right" ? null : "right")}><AlignRight size={14} /></IconBtn>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-[92px] text-xs text-stone-600">Colour</span>
                  {SWATCHES.map((s) => (
                    <button key={s.label} type="button" title={s.label} aria-label={s.label} onClick={() => setRule("color", valueOf("color") === s.value ? null : s.value)}
                      className={`h-7 w-7 rounded-full border ${valueOf("color") === s.value ? "ring-2 ring-[#c00000] ring-offset-2" : "border-stone-300"}`}
                      style={{ background: s.hex }} />
                  ))}
                </div>
                <div className="flex gap-2 pt-1">
                  <button type="button" onClick={() => setRule("display", valueOf("display") ? null : "none")}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-stone-200 py-2 text-xs hover:border-stone-400">
                    {valueOf("display") ? <><Eye size={14} /> Show again</> : <><EyeOff size={14} /> Hide this</>}
                  </button>
                  <button type="button" onClick={resetElement}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-stone-200 py-2 text-xs hover:border-stone-400">
                    <RotateCcw size={14} /> Back to the design
                  </button>
                </div>
                <p className="text-[11px] leading-relaxed text-stone-500">On the page: drag the corner square to resize, the top or bottom bar to change the space.</p>
              </div>
            </Panel>
          )}

          <Panel title="Space between sections" extra={deviceChip}>
            <div className="grid gap-2.5">
              <Slider label="Every section" value={gapVal} auto={sectionPx != null ? Math.round(sectionPx) : null} min={16} max={160} step={2} unit="px"
                onChange={(v) => setGap(v)} onClear={() => setGap(null)} />
              <p className="text-[11px] leading-relaxed text-stone-500">
                Or drag the red line between two sections on the page. A section&apos;s own space, below, wins over this one.
              </p>
              {sec ? (
                <div className="mt-1 grid gap-2 rounded-xl border border-[#f1d5d2] bg-[#fdf3f2] p-3">
                  <div className="flex items-center justify-between">
                    <b className="text-[12.5px] text-stone-900">{labelOf(sec.name)}</b>
                    <button type="button" className="text-[11px] text-stone-500 hover:text-stone-900" onClick={() => setSec(null)}>Close</button>
                  </div>
                  <Slider label="Space above" value={padOf(sec.name, "top")} auto={sec.pads ? Math.round(sec.pads.top) : null} min={0} max={200} step={2} unit="px"
                    onChange={(v) => setStyle(sec.name, padKey("top"), `${v}px`)} onClear={() => setStyle(sec.name, padKey("top"), null)} />
                  <Slider label="Space below" value={padOf(sec.name, "bottom")} auto={sec.pads ? Math.round(sec.pads.bottom) : null} min={0} max={200} step={2} unit="px"
                    onChange={(v) => setStyle(sec.name, padKey("bottom"), `${v}px`)} onClear={() => setStyle(sec.name, padKey("bottom"), null)} />
                  <Slider label="Heading size" value={num(L.styles?.[sec.name]?.["--heading-scale"])} min={0.7} max={1.5} step={0.05} unit="x"
                    onChange={(v) => setStyle(sec.name, "--heading-scale", String(v))} onClear={() => setStyle(sec.name, "--heading-scale", null)} />
                </div>
              ) : (
                <p className="text-[11px] text-stone-500">Click a section on the page, or its name below, to set its own space.</p>
              )}
            </div>
          </Panel>

          <Panel title="Sections" extra={<span className="text-[10.5px] text-stone-400">Drag to reorder</span>}>
            <ol className="grid gap-2">
              {L.order.map((name, i) => {
                const hidden = L.hidden.includes(name);
                const on = sec?.name === name;
                return (
                  <li key={name} draggable
                    onDragStart={(e) => { setDragFrom(i); e.dataTransfer.effectAllowed = "move"; }}
                    onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }}
                    onDrop={(e) => { e.preventDefault(); if (dragFrom !== null) move(dragFrom, i); setDragFrom(null); }}
                    onDragEnd={() => setDragFrom(null)}
                    className={`rounded-xl border px-2 py-2 transition-opacity ${dragFrom === i ? "opacity-40" : ""} ${hidden ? "border-dashed border-stone-300 bg-stone-50" : on ? "border-[#c00000] bg-[#fdf3f2]" : "border-stone-200 bg-white"}`}>
                    <div className="flex items-center gap-1.5">
                      <span className="grid w-5 cursor-grab place-items-center text-stone-400" aria-hidden="true"><GripVertical size={14} /></span>
                      <button type="button" onClick={() => pick(name)} title="Show it and set its space"
                        className={`flex-1 truncate text-left text-[13px] hover:text-[#c00000] ${hidden ? "text-stone-400 line-through" : "font-medium"}`}>{labelOf(name)}</button>
                      <IconBtn label="Move up" onClick={() => move(i, i - 1)} disabled={i === 0}><ArrowUp size={13} /></IconBtn>
                      <IconBtn label="Move down" onClick={() => move(i, i + 1)} disabled={i === L.order.length - 1}><ArrowDown size={13} /></IconBtn>
                      <IconBtn label={hidden ? "Show" : "Hide"} onClick={() => toggle(name)}>{hidden ? <EyeOff size={13} /> : <Eye size={13} />}</IconBtn>
                      {blockType(name) && <IconBtn label="Remove" onClick={() => removeBlock(name)}><Trash2 size={13} /></IconBtn>}
                    </div>
                  </li>
                );
              })}
            </ol>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-stone-500">Add</span>
              {BLOCK_TYPES.map((b) => (
                <button key={b.type} type="button" onClick={() => addBlock(b.type)}
                  className="flex items-center gap-1 rounded-lg border border-stone-200 px-2.5 py-1.5 text-xs hover:border-stone-400">
                  {b.type === "FullImg" ? <ImagePlus size={13} /> : <Plus size={13} />} {b.label}
                </button>
              ))}
            </div>
            {L.order.some((n) => blockType(n) && !baseline.order.includes(n)) && (
              <p className="mt-2 text-[11px] text-stone-500">New sections appear on the page after Save.</p>
            )}
          </Panel>

          <Panel title="Colours and type" extra={
            <button type="button" className="text-xs text-stone-500 hover:text-stone-900"
              onClick={() => push((d) => ({ ...d, theme: null, themeReset: true }))}>Reset to brand</button>
          }>
            {theme && (
              <div className="grid gap-2.5">
                {(["--primary", "--ink", "--surface"] as const).map((k) => (
                  <label key={k} className="flex items-center justify-between text-xs text-stone-600">
                    {{ "--primary": "Red (buttons, accents)", "--ink": "Text", "--surface": "Soft background" }[k]}
                    <span className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-stone-400">{theme[k]}</span>
                      <input type="color" value={theme[k]} onChange={(e) => push((d) => ({ ...d, themeReset: false, theme: { ...(d.theme ?? brand!), [k]: e.target.value } }))}
                        className="h-7 w-9 cursor-pointer rounded border border-stone-200" />
                    </span>
                  </label>
                ))}
                <Slider label="Base text" value={num(draft.theme?.["font-size"])} auto={num(brand?.["font-size"])} min={14} max={20} step={1} unit="px"
                  onChange={(v) => push((d) => ({ ...d, themeReset: false, theme: { ...(d.theme ?? brand!), "font-size": `${v}px` } }))}
                  onClear={() => push((d) => ({ ...d, theme: d.theme ? { ...d.theme, "font-size": brand!["font-size"] } : null }))} />
                {warnings.map((w) => <p key={w} className="rounded-md bg-[#fdf3f2] px-2 py-1.5 text-[11px] text-[#9a0000]">{w}</p>)}
                {draft.themeReset && <p className="text-[11px] text-stone-500">Saved colour changes will be removed on Save.</p>}
              </div>
            )}
          </Panel>

          <Panel title="Saved so far">
            <pre className="max-h-40 overflow-y-auto whitespace-pre-wrap text-[10.5px] leading-relaxed text-stone-500">{log.trim().split("\n").slice(-12).reverse().join("\n") || "Nothing saved yet."}</pre>
          </Panel>
        </div>

        <footer className="border-t border-stone-200 p-4">
          {notes.length > 0 && (
            <ul className="mb-3 grid max-h-28 gap-1 overflow-y-auto" aria-live="polite">
              {notes.map((n) => (
                <li key={n.id} className={`rounded-md px-2 py-1.5 text-[11px] ${n.ok ? "bg-[#e9f9ef] text-[#146c38]" : "bg-[#fdf3f2] text-[#9a0000]"}`}>{n.text}</li>
              ))}
            </ul>
          )}
          <div className="flex gap-2">
            <button type="button" onClick={save} disabled={saving || (pending === 0 && !draft.themeReset)}
              className="flex-1 rounded-xl bg-[#c00000] py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#9a0000] disabled:opacity-40">
              {saving ? "Saving..." : `Save${pending ? ` ${pending} change${pending > 1 ? "s" : ""}` : ""}`}
            </button>
            <button type="button" onClick={discard} disabled={saving || pending === 0}
              className="rounded-xl border border-stone-200 px-4 text-[13px] hover:border-stone-400 disabled:opacity-40">Discard</button>
          </div>
        </footer>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-center gap-1.5 border-b border-stone-200 bg-white py-2">
          {WIDTHS.map(({ w, icon: I, label }) => (
            <button key={w} type="button" onClick={() => setWidth(w)} aria-pressed={width === w}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs ${width === w ? "bg-stone-900 text-white" : "text-stone-600 hover:bg-stone-100"}`}>
              <I size={14} /> {label} <span className="tabular-nums opacity-60">{w}</span>
            </button>
          ))}
          <span className="ml-3 text-[11px] tabular-nums text-stone-400">{Math.round(scale * 100)}%</span>
        </div>
        <div ref={stage} className="relative flex-1 overflow-hidden">
          <div className="absolute left-1/2 top-4 overflow-hidden rounded-lg bg-white shadow-2xl"
            style={{ width: width * scale, height: area.h - 32, transform: "translateX(-50%)" }}>
            <iframe ref={frame} title="Home preview" src="?edit=1&iframe=1" className="origin-top-left border-0"
              style={{ width, height: frameH, transform: `scale(${scale})` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EditorOverlay() {
  const [mode, setMode] = useState<"none" | "shell" | "inner">("none");
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    if (q.get("edit") !== "1") return;
    /* Next's dev badge sits over the Save button and the page; errors still reach the terminal. */
    const quiet = document.createElement("style");
    quiet.textContent = "nextjs-portal{display:none!important}";
    document.head.append(quiet);
    if (q.get("iframe") === "1") { setMode("inner"); return; }
    setMode("shell");
    document.body.style.overflow = "hidden";
    /* The outer copy only hosts the panel: park its page so films and maps stay idle. */
    const main = document.getElementById("main");
    if (main) main.style.display = "none";
  }, []);
  if (mode === "inner") return <EditorInner />;
  if (mode === "shell") return createPortal(<EditorShell />, document.body);
  return null;
}
