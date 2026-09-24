"use client";

/* The home editor (dev only: npm run edit, then open the home with ?edit=1).
   The page loads twice: the outer copy is the editor panel, the inner copy runs in
   an iframe at a chosen device width and takes the clicks, typing and image drops.
   Pending changes show live in the iframe through an injected stylesheet; Save hands
   them to the save server (editor/server.mjs), which writes the source files. */
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  AlignCenter, AlignLeft, AlignRight, ArrowDown, ArrowUp, Eye, EyeOff, ImagePlus, Minus,
  Monitor, Plus, Redo2, RotateCcw, Smartphone, Tablet, Trash2, Undo2,
} from "lucide-react";
import initialLayout from "@/content/home-layout.json";
import { BLOCK_PLACEHOLDER, BLOCK_TYPES } from "./blocks";

const API = "http://127.0.0.1:3100";

type Layout = {
  order: string[];
  hidden: string[];
  styles?: Record<string, Record<string, string>>;
  blocks?: Record<string, Record<string, string>>;
};
type Theme = Record<"--primary" | "--ink" | "--surface" | "font-size", string>;
type Draft = {
  layout: Layout;
  theme: Theme | null; // null: untouched, the file is not written
  themeReset: boolean;
  texts: { from: string; to: string }[];
  rules: Record<string, string>; // "selector|property" -> value
};
type Selected = { selector: string; label: string };
type Note = { id: number; ok: boolean; text: string };

const NAMES: Record<string, string> = {
  Hero: "Hero", HotelBand: "Hotel logos", Facilities: "Facilities film", Services: "Services",
  Intro: "Care in your hotel", WhyHotel: "Why a hotel clinic", HowItWorks: "How it works",
  Insurance: "Insurance", Stories: "Patient stories", Posts: "Blog posts", Finder: "Find a clinic",
  FinalCta: "Final call",
};
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

function luminance(hex: string) {
  const c = hex.replace("#", "").match(/.{2}/g)?.map((x) => parseInt(x, 16) / 255) ?? [1, 1, 1];
  const [r, g, b] = c.map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const contrast = (a: string, b: string) => {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

const ruleText = (key: string, value: string) => {
  const [selector, prop] = key.split("|");
  return `${selector} { ${prop}: ${value} !important; }`;
};

/* Everything pending, as one stylesheet for the iframe. */
function previewCss(d: Draft): string {
  const css: string[] = ["main{display:flex;flex-direction:column}"];
  if (d.theme) css.push(`:root{${Object.entries(d.theme).map(([k, v]) => `${k}:${v}`).join(";")}}`);
  d.layout.order.forEach((n, i) => {
    css.push(`[data-e-section="${n}"]{order:${i};display:${d.layout.hidden.includes(n) ? "none" : "block"}!important}`);
  });
  for (const [n, st] of Object.entries(d.layout.styles ?? {})) {
    const sec = `[data-e-section="${n}"]>section`;
    if (st["--pad-top"]) css.push(`${sec}{padding-top:${st["--pad-top"]}!important}`);
    if (st["--pad-bottom"]) css.push(`${sec}{padding-bottom:${st["--pad-bottom"]}!important}`);
    if (st["--heading-scale"]) css.push(`${sec} :is(h1,h2,h3){zoom:${st["--heading-scale"]}}`);
  }
  for (const [k, v] of Object.entries(d.rules)) css.push(ruleText(k, v));
  return css.join("\n");
}

/* ------------------------------------------------------------ inside the iframe */

function selectorFor(el: Element): string {
  const parts: string[] = [];
  let cur: Element | null = el;
  while (cur && cur !== document.body) {
    const sec = cur.getAttribute("data-e-section");
    if (sec) return [`[data-e-section="${sec}"]`, ...parts].join(" > ");
    if (cur.id) return [`#${CSS.escape(cur.id)}`, ...parts].join(" > ");
    let i = 1;
    for (let s = cur.previousElementSibling; s; s = s.previousElementSibling) if (s.tagName === cur.tagName) i++;
    parts.unshift(`${cur.tagName.toLowerCase()}:nth-of-type(${i})`);
    cur = cur.parentElement;
  }
  return ["body", ...parts].join(" > ");
}

function EditorInner() {
  useEffect(() => {
    const post = (msg: object) => window.parent.postMessage(msg, location.origin);
    const style = document.createElement("style");
    style.id = "e-preview";
    const marks = document.createElement("style");
    marks.textContent = `
      [data-e-hover]{outline:2px dashed #c00000!important;outline-offset:2px;cursor:pointer}
      [data-e-selected]{outline:2px solid #c00000!important;outline-offset:2px}
      [data-e-drop]{outline:3px solid #25d366!important;outline-offset:-3px}
      [contenteditable]{cursor:text;background:rgba(192,0,0,.04)}`;
    document.head.append(style, marks);

    let selected: HTMLElement | null = null;
    let original = "";
    const editable = (el: HTMLElement) => el.children.length === 0 && !!el.textContent?.trim();

    const over = (e: MouseEvent) => (e.target as HTMLElement).setAttribute?.("data-e-hover", "");
    const out = (e: MouseEvent) => (e.target as HTMLElement).removeAttribute?.("data-e-hover");
    const click = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      if (el.isContentEditable) return;
      e.preventDefault();
      e.stopPropagation();
      selected?.removeAttribute("data-e-selected");
      selected = el;
      el.setAttribute("data-e-selected", "");
      const text = (el.textContent ?? "").trim().replace(/\s+/g, " ");
      post({ type: "select", selector: selectorFor(el), label: `${el.tagName.toLowerCase()}${text ? `: ${text.slice(0, 48)}` : ""}` });
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
        post({ type: "text", from: original, to: now, block: el.dataset.eBlock, field: el.dataset.eField });
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
      const name = slot.dataset.slot!;
      try {
        const res = await fetch(`${API}/save/image`, { method: "POST", headers: { "X-Slot-Name": name }, body: file });
        const out = await res.json();
        if (!res.ok) throw new Error(out.error);
        post({ type: "image", text: `Saved ${out.file} (${out.width} x ${out.height}).` });
      } catch (err) {
        post({ type: "note", ok: false, text: `Image not saved: ${(err as Error).message}. Is npm run edit running?` });
      }
    };

    const message = (e: MessageEvent) => {
      if (e.origin === location.origin && e.data?.type === "css") style.textContent = e.data.css;
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
      style.remove();
      marks.remove();
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
      <div className="mb-3 flex items-center justify-between">
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

function Slider({ label, value, min, max, step, unit = "", onChange, onClear }: {
  label: string; value: number | null; min: number; max: number; step: number; unit?: string;
  onChange: (v: number) => void; onClear: () => void;
}) {
  return (
    <label className="grid grid-cols-[88px_1fr_52px_20px] items-center gap-2 text-xs text-stone-600">
      <span>{label}</span>
      <input type="range" min={min} max={max} step={step} value={value ?? min} onChange={(e) => onChange(Number(e.target.value))}
        className={`accent-[#c00000] ${value === null ? "opacity-40" : ""}`} />
      <span className="text-right tabular-nums text-stone-800">{value === null ? "auto" : `${value}${unit}`}</span>
      <button type="button" onClick={onClear} aria-label={`Reset ${label}`} className="text-stone-400 hover:text-stone-800" disabled={value === null}>
        <RotateCcw size={12} />
      </button>
    </label>
  );
}

function EditorShell() {
  const [baseline, setBaseline] = useState<Layout>(() => clone(initialLayout as Layout));
  const [hist, setHist] = useState<{ list: Draft[]; ptr: number }>(() => ({ list: [fresh(initialLayout as Layout)], ptr: 0 }));
  const draft = hist.list[hist.ptr];
  const [brand, setBrand] = useState<Theme | null>(null);
  const [width, setWidth] = useState(1440);
  const [area, setArea] = useState({ w: 1000, h: 800 });
  const [selected, setSelected] = useState<Selected | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [log, setLog] = useState("");
  const [online, setOnline] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const frame = useRef<HTMLIFrameElement>(null);
  const stage = useRef<HTMLDivElement>(null);

  const note = useCallback((ok: boolean, text: string) => {
    setNotes((n) => [{ id: Date.now() + Math.random(), ok, text }, ...n].slice(0, 6));
  }, []);

  const push = useCallback((fn: (d: Draft) => Draft) => {
    setHist((h) => {
      const next = fn(clone(h.list[h.ptr]));
      return { list: [...h.list.slice(0, h.ptr + 1), next].slice(-120), ptr: Math.min(h.ptr + 1, 119) };
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

  /* The brand values, read from the page's own stylesheet. */
  useEffect(() => {
    const cs = getComputedStyle(document.documentElement);
    setBrand({
      "--primary": cs.getPropertyValue("--primary").trim(),
      "--ink": cs.getPropertyValue("--ink").trim(),
      "--surface": cs.getPropertyValue("--surface").trim(),
      "font-size": cs.fontSize,
    });
    refreshLog();
  }, [refreshLog]);

  /* Send the pending stylesheet to the iframe whenever the draft changes. */
  const sendCss = useCallback(() => {
    frame.current?.contentWindow?.postMessage({ type: "css", css: previewCss(draft) }, location.origin);
  }, [draft]);
  useEffect(sendCss, [sendCss]);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== location.origin || e.source !== frame.current?.contentWindow) return;
      const m = e.data;
      if (m.type === "ready") sendCss();
      if (m.type === "select") setSelected({ selector: m.selector, label: m.label });
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
          push((d) => ({ ...d, texts: [...d.texts, { from: m.from, to: m.to }] }));
        }
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [note, push, refreshLog, sendCss]);

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
  const move = (i: number, by: number) => push((d) => {
    const o = d.layout.order;
    const j = i + by;
    if (j < 0 || j >= o.length) return d;
    [o[i], o[j]] = [o[j], o[i]];
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
  const setRule = (prop: string, value: string | null) => {
    if (!selected) return;
    push((d) => {
      const k = `${selected.selector}|${prop}`;
      if (value === null) delete d.rules[k]; else d.rules[k] = value;
      return d;
    });
  };
  const ruleOf = (prop: string) => (selected ? draft.rules[`${selected.selector}|${prop}`] : undefined);

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
      else if (draft.theme) { await call("/save/theme", { vars: draft.theme }); note(true, "Colours saved."); }
      const rules = Object.entries(draft.rules).map(([k, v]) => ruleText(k, v));
      if (rules.length) { await call("/save/rules", { rules }); note(true, `${rules.length} element change${rules.length > 1 ? "s" : ""} saved.`); }
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
  if (theme && /^#[0-9a-f]{6}$/i.test(theme["--primary"]) && contrast("#ffffff", theme["--primary"]) < 4.5) {
    warnings.push(`White on the red is ${contrast("#ffffff", theme["--primary"]).toFixed(1)}:1, under 4.5:1.`);
  }
  if (theme && /^#[0-9a-f]{6}$/i.test(theme["--ink"]) && /^#[0-9a-f]{6}$/i.test(theme["--surface"]) && contrast(theme["--ink"], theme["--surface"]) < 4.5) {
    warnings.push(`Text on the surface is ${contrast(theme["--ink"], theme["--surface"]).toFixed(1)}:1, under 4.5:1.`);
  }

  return (
    <div className="fixed inset-0 z-[999999] flex bg-stone-100 font-sans text-sm text-stone-900">
      <aside className="flex h-full w-[340px] shrink-0 flex-col border-r border-stone-200 bg-white">
        <header className="flex items-center justify-between gap-2 border-b border-stone-200 px-4 py-3">
          <div>
            <p className="text-[15px] font-semibold">Home editor</p>
            <p className="text-[11px] text-stone-500">
              {online === false ? <span className="text-[#c00000]">Save server off. Run npm run edit.</span> : "Click text to type. Drop images on pictures."}
            </p>
          </div>
          <div className="flex gap-1.5">
            <IconBtn label="Undo (Ctrl Z)" onClick={undo} disabled={hist.ptr === 0}><Undo2 size={15} /></IconBtn>
            <IconBtn label="Redo (Ctrl Y)" onClick={redo} disabled={hist.ptr === hist.list.length - 1}><Redo2 size={15} /></IconBtn>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          {selected && (
            <Panel title="Selected" extra={<button type="button" className="text-xs text-stone-500 hover:text-stone-900" onClick={() => setSelected(null)}>Close</button>}>
              <p className="mb-3 truncate rounded-md bg-stone-100 px-2 py-1.5 font-mono text-[11px] text-stone-600" title={selected.selector}>{selected.label}</p>
              <div className="grid gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-[88px] text-xs text-stone-600">Size</span>
                  <IconBtn label="Smaller" onClick={() => setRule("zoom", String(Math.max(0.5, Number(ruleOf("zoom") ?? 1) - 0.1).toFixed(1)))}><Minus size={14} /></IconBtn>
                  <span className="w-10 text-center text-xs tabular-nums">{Math.round(Number(ruleOf("zoom") ?? 1) * 100)}%</span>
                  <IconBtn label="Bigger" onClick={() => setRule("zoom", String(Math.min(2, Number(ruleOf("zoom") ?? 1) + 0.1).toFixed(1)))}><Plus size={14} /></IconBtn>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-[88px] text-xs text-stone-600">Align</span>
                  <IconBtn label="Left" active={ruleOf("text-align") === "left"} onClick={() => setRule("text-align", "left")}><AlignLeft size={14} /></IconBtn>
                  <IconBtn label="Centre" active={ruleOf("text-align") === "center"} onClick={() => setRule("text-align", "center")}><AlignCenter size={14} /></IconBtn>
                  <IconBtn label="Right" active={ruleOf("text-align") === "right"} onClick={() => setRule("text-align", "right")}><AlignRight size={14} /></IconBtn>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-[88px] text-xs text-stone-600">Colour</span>
                  {SWATCHES.map((s) => (
                    <button key={s.label} type="button" title={s.label} aria-label={s.label} onClick={() => setRule("color", s.value)}
                      className={`h-7 w-7 rounded-full border ${ruleOf("color") === s.value ? "ring-2 ring-[#c00000] ring-offset-2" : "border-stone-300"}`}
                      style={{ background: s.hex }} />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setRule("display", ruleOf("display") ? null : "none")}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-stone-200 py-2 text-xs hover:border-stone-400">
                    {ruleOf("display") ? <><Eye size={14} /> Show again</> : <><EyeOff size={14} /> Hide this</>}
                  </button>
                  <button type="button" onClick={() => push((d) => {
                    for (const k of Object.keys(d.rules)) if (k.startsWith(`${selected.selector}|`)) delete d.rules[k];
                    return d;
                  })} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-stone-200 py-2 text-xs hover:border-stone-400">
                    <RotateCcw size={14} /> Undo its changes
                  </button>
                </div>
              </div>
            </Panel>
          )}

          <Panel title="Sections">
            <ol className="grid gap-2">
              {L.order.map((name, i) => {
                const st = L.styles?.[name] ?? {};
                const hidden = L.hidden.includes(name);
                const px = (v?: string) => (v ? Number(v.replace("px", "")) : null);
                return (
                  <li key={name} className={`rounded-xl border px-3 py-2.5 ${hidden ? "border-dashed border-stone-300 bg-stone-50" : "border-stone-200 bg-white"}`}>
                    <div className="flex items-center gap-1.5">
                      <span className="w-5 text-[11px] tabular-nums text-stone-400">{i + 1}</span>
                      <span className={`flex-1 truncate text-[13px] ${hidden ? "text-stone-400 line-through" : "font-medium"}`}>{labelOf(name)}</span>
                      <IconBtn label="Move up" onClick={() => move(i, -1)} disabled={i === 0}><ArrowUp size={13} /></IconBtn>
                      <IconBtn label="Move down" onClick={() => move(i, 1)} disabled={i === L.order.length - 1}><ArrowDown size={13} /></IconBtn>
                      <IconBtn label={hidden ? "Show" : "Hide"} onClick={() => toggle(name)}>{hidden ? <EyeOff size={13} /> : <Eye size={13} />}</IconBtn>
                      {blockType(name) && <IconBtn label="Remove" onClick={() => removeBlock(name)}><Trash2 size={13} /></IconBtn>}
                    </div>
                    {!hidden && (
                      <details className="mt-2 group">
                        <summary className="cursor-pointer list-none text-[11px] text-stone-500 hover:text-stone-900">Spacing and heading size</summary>
                        <div className="mt-2 grid gap-2">
                          <Slider label="Space above" value={px(st["--pad-top"])} min={0} max={160} step={4} unit="px"
                            onChange={(v) => setStyle(name, "--pad-top", `${v}px`)} onClear={() => setStyle(name, "--pad-top", null)} />
                          <Slider label="Space below" value={px(st["--pad-bottom"])} min={0} max={160} step={4} unit="px"
                            onChange={(v) => setStyle(name, "--pad-bottom", `${v}px`)} onClear={() => setStyle(name, "--pad-bottom", null)} />
                          <Slider label="Heading size" value={st["--heading-scale"] ? Number(st["--heading-scale"]) : null} min={0.7} max={1.5} step={0.05} unit="x"
                            onChange={(v) => setStyle(name, "--heading-scale", String(v))} onClear={() => setStyle(name, "--heading-scale", null)} />
                        </div>
                      </details>
                    )}
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
                <Slider label="Base text" value={Number(theme["font-size"].replace("px", ""))} min={14} max={20} step={1} unit="px"
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
