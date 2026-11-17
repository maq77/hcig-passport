"use client";

/* Phone motion for three home sections (the owner's Set 1, 2026-11-17: "i want motions and graphic motions and
   animation and transition in and out ... like message is being written and being reply by our team ... shimmer
   and loading state ... it takes its time to feel more premium"). Phones only: the blocks that use these sit in
   .pm-m wrappers that are hidden from 768px, so desktop never runs them.
   - Scene: a wrapper that starts its CSS choreography when about 35% of it is on screen and resets when it has
     left the screen, so it plays again on return. Photos inside hold a shimmer until loaded (at least 700ms).
   - ChatSteps: How it works played as a WhatsApp conversation, typed, sent and answered.
   Without JS, and under reduced motion, both render their final state and nothing moves. */
import { useCallback, useEffect, useRef, useState } from "react";
import { RotateCcw, SendHorizontal } from "lucide-react";

const HOLD = 700;

function useReduced() {
  const [r, setR] = useState<boolean | null>(null);
  useEffect(() => {
    const m = matchMedia("(prefers-reduced-motion: reduce)");
    setR(m.matches);
    const on = () => setR(m.matches);
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);
  return r;
}

/* Calls play() once the element is about 35% visible (or fills half the screen, for tall blocks) and reset()
   once it is fully out of view. */
function useSeen(ref: React.RefObject<HTMLElement | null>, enabled: boolean, play: () => void, reset: () => void) {
  const fns = useRef({ play, reset });
  fns.current = { play, reset };
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled || !("IntersectionObserver" in window)) return;
    let on = false;
    const io = new IntersectionObserver(([e]) => {
      const need = Math.min(0.35 * e.boundingClientRect.height, 0.5 * window.innerHeight);
      if (e.isIntersecting && e.intersectionRect.height >= need - 1) {
        if (!on) { on = true; fns.current.play(); }
      } else if (!e.isIntersecting && on) {
        on = false; fns.current.reset();
      }
    }, { threshold: [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.5, 0.6, 0.75, 1] });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, enabled]);
}

export function Scene({ className = "", children }: { className?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReduced();
  const [s, setS] = useState<"static" | "idle" | "on">("static");
  const timers = useRef<number[]>([]);
  const armed = reduced === false;

  useEffect(() => { if (armed) setS("idle"); }, [armed]);

  const play = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setS("on");
    const t0 = performance.now();
    el.querySelectorAll<HTMLImageElement>("img").forEach((img) => {
      const box = img.closest<HTMLElement>(".pm-ph") ?? img.parentElement;
      if (!box) return;
      /* a photo hidden behind its clip would never count as on screen for lazy loading: ask for it now */
      if (img.loading === "lazy") img.loading = "eager";
      const show = () => {
        const wait = Math.max(0, HOLD - (performance.now() - t0));
        timers.current.push(window.setTimeout(() => box.setAttribute("data-ld", ""), wait));
      };
      if (img.complete && img.naturalWidth) show();
      else { img.addEventListener("load", show, { once: true }); img.addEventListener("error", show, { once: true }); }
    });
  }, []);
  const reset = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    ref.current?.querySelectorAll("[data-ld]").forEach((b) => b.removeAttribute("data-ld"));
    setS("idle");
  }, []);
  useSeen(ref, armed, play, reset);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  return <div ref={ref} className={`pm-scene ${className}`} data-s={s === "static" ? undefined : s}>{children}</div>;
}

type Msg = { title: string; text: string | null };

/* Stages: -1 final (no JS, reduced motion), 0 armed and waiting, 1 card in with a shimmer, 2 the guest types,
   3 send pressed, 4 the guest bubble lands, 5 its ticks turn green, 6/8/10 our team is typing, 7/9/11 a reply
   lands, 12 the button below shimmers once, 13 done (replay shows). */
export function ChatSteps({ steps, mark, labels, children }: {
  steps: Msg[]; mark: string; labels: { you: string; clinic: string; play: string }; children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLSpanElement>(null);
  const reduced = useReduced();
  const armed = reduced === false;
  const [st, setSt] = useState(-1);
  const [typed, setTyped] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const timers = useRef<number[]>([]);
  const [first, ...replies] = steps;
  const line = first?.text ?? "";

  const clear = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  const at = (ms: number, fn: () => void) => { timers.current.push(window.setTimeout(fn, ms)); };

  const play = useCallback(() => {
    clear();
    setLeaving(false);
    setTyped(0);
    setSt(1);
    let t = 900;
    at(t, () => setSt(2));
    /* the guest types at about 38ms a letter, a little uneven, a breath after a full stop or comma */
    let k = t + 220;
    for (let i = 1; i <= line.length; i++) {
      const ch = line[i - 1];
      k += 30 + Math.round(Math.random() * 18) + (ch === " " ? 14 : 0) + (/[.,]/.test(line[i - 2] ?? "") ? 120 : 0);
      at(k, () => setTyped(i));
    }
    t = k + 350;
    at(t, () => setSt(3));
    at((t += 180), () => { setSt(4); setTyped(0); });
    at((t += 600), () => setSt(5));
    const typing = [1300, 1150, 1450];
    replies.forEach((_, j) => {
      at((t += j === 0 ? 200 : 400), () => setSt(6 + j * 2));
      at((t += typing[j] ?? 1200), () => setSt(7 + j * 2));
    });
    at((t += 600), () => setSt(12));
    at((t += 900), () => setSt(13));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [line, replies.length]);
  const reset = useCallback(() => { clear(); setLeaving(false); setTyped(0); setSt(0); }, []);

  useEffect(() => { if (armed) setSt(0); }, [armed]);
  useSeen(ref, armed, play, reset);
  useEffect(() => () => clear(), []);
  /* keep the newest letters in sight while typing */
  useEffect(() => { const el = input.current; if (el) el.scrollLeft = el.scrollWidth; }, [typed]);

  const replay = () => {
    setLeaving(true);
    clear();
    at(380, () => { setSt(0); setTyped(0); at(60, play); });
  };

  const fin = st === -1;
  const on = (n: number) => fin || st >= n;
  return (
    <div ref={ref} className={`pm-chat ${st === 0 ? "pm-rs" : ""} ${leaving ? "pm-out" : ""}`} data-armed={fin ? undefined : ""}>
      <div className={`pm-card ${on(1) ? "on" : ""}`}>
        <div className="pm-ch">
          <span className="pm-av"><img src={mark} alt="" width={26} height={25} /></span>
          <b>{labels.clinic}</b>
          {armed && st >= 13 && (
            <button type="button" className="pm-replay" aria-label={labels.play} onClick={replay}>
              <span aria-hidden="true"><RotateCcw size={16} strokeWidth={1.5} /></span>
            </button>
          )}
        </div>
        <div className="pm-thread">
          <ol className={`pm-msgs ${leaving ? "out" : ""}`}>
            {first && (
              <li className="pm-row me">
                <span className={`pm-who ${on(4) ? "on" : ""}`}>{labels.you}</span>
                <div className={`pm-b pm-me ${on(4) ? "on" : ""}`}>
                  <b>{first.title}</b>
                  {first.text && <span>{first.text}</span>}
                  <svg className={`pm-ticks ${on(5) ? "read" : ""}`} width="18" height="12" viewBox="0 0 18 12" aria-hidden="true">
                    <path d="M1 6.5 4.2 9.6 10.6 2.4" />
                    <path d="M6.6 9.2 7 9.6 13.4 2.4" />
                  </svg>
                </div>
              </li>
            )}
            {replies.map((m, j) => (
              <li key={m.title} className="pm-row us">
                {j === 0 && <span className={`pm-who ${on(6) ? "on" : ""}`}>{labels.clinic}</span>}
                <div className="pm-slot">
                  <span className={`pm-typing ${!fin && st === 6 + j * 2 ? "on" : ""}`} aria-hidden="true"><i /><i /><i /></span>
                  <div className={`pm-b pm-us ${on(7 + j * 2) ? "on" : ""}`}>
                    <b>{m.title}</b>
                    {m.text && <span>{m.text}</span>}
                  </div>
                </div>
              </li>
            ))}
          </ol>
          <div className={`pm-skel ${st === 1 ? "on" : ""}`} aria-hidden="true"><i /><i /><i /></div>
        </div>
        <div className="pm-compose" aria-hidden="true">
          <span ref={input} className="pm-input">
            <span>{line.slice(0, typed)}</span>
            {st === 2 && <i className="pm-caret" />}
          </span>
          <span className={`pm-send ${st === 3 ? "press" : ""}`}><SendHorizontal size={18} strokeWidth={1.75} /></span>
        </div>
      </div>
      <div className={`pm-cta ${!fin && st >= 12 ? "sw" : ""}`}>
        {children}
        <span className="pm-sweep" aria-hidden="true"><i /></span>
      </div>
    </div>
  );
}

/* The one shimmer sweep across a button when its Scene plays (insurance). */
export function Sweep({ children }: { children: React.ReactNode }) {
  return (
    <div className="pm-cta pm-cta-scene">
      {children}
      <span className="pm-sweep" aria-hidden="true"><i /></span>
    </div>
  );
}
