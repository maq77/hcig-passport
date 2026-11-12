"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { asset } from "@/lib/asset";
import {
  ASSIST as T,
  COUNTRIES,
  PAUSE,
  PLACE_PH,
  PTYPES,
  SEND_LABELS,
  STEPS,
  WA_PHONE,
  buildMessage,
  priorities,
  type Answers,
  type Fields,
} from "@/content/assist";

// TMASI chatbot (replaces the Jotform agent): canvas board "Chatbot C. Side drawer", approved 2026-11-12.
// Launcher with greeting bubble, scrim, and a side drawer (full screen sheet on phones) that asks the intake
// questions one at a time, sends the request to the same endpoint as the quote form and opens WhatsApp.

const ENDPOINT = process.env.NEXT_PUBLIC_QUOTE_ENDPOINT || "https://tmasi.net/send.php";
const BUBBLE_KEY = "tmasi-assist-bubble";

type Phase = "welcome" | "chat" | "sending" | "done";
type HistItem = { i: number; text: string };
type State = {
  open: boolean;
  bubble: boolean;
  phase: Phase;
  hist: HistItem[];
  cur: number;
  typing: boolean;
  a: Answers;
  f: Fields;
  consent: boolean;
  sendStep: number;
  err: string;
  mailFail: boolean;
};

const emptyFields = (): Fields => ({ name: "", country: "", city: "", place: "", ptype: "Hotel", company: "", policy: "", phone: "" });
const fresh = (): State => ({ open: false, bubble: false, phase: "welcome", hist: [], cur: 0, typing: false, a: {}, f: emptyFields(), consent: false, sendStep: 0, err: "", mailFail: false });
const nextIdx = (i: number, a: Answers) => {
  let j = i + 1;
  while (j < STEPS.length && STEPS[j].when && !STEPS[j].when!(a)) j++;
  return j;
};

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])';

function Check({ size = 13, w = 3 }: { size?: number; w?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12l5 5L20 7" />
    </svg>
  );
}
function Cross({ size, w = 2.4 }: { size: number; w?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={w} strokeLinecap="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
function Card() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#009A9C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: "none" }}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 10h18M7 15h4" />
    </svg>
  );
}
function Chevron() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

export default function AssistChat() {
  const [s, setS] = useState<State>(fresh);
  const listId = useId();
  const launcherRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const timers = useRef<number[]>([]);
  const alive = useRef(true);
  const gone = useRef(false); // bubble gone for the rest of the visit
  const wasOpen = useRef(false);
  const msgRef = useRef("");
  const timerDone = useRef(false);
  const net = useRef<"pending" | "ok" | "fail">("pending");
  const opened = useRef(false); // WhatsApp already opened for this request

  const patch = useCallback((p: Partial<State> | ((c: State) => Partial<State>)) => {
    setS((c) => ({ ...c, ...(typeof p === "function" ? p(c) : p) }));
  }, []);
  const later = useCallback((ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);
  const pause = () => (reduced() ? 300 : PAUSE);

  // Greeting bubble: 1600 ms after mount, once per visit.
  useEffect(() => {
    alive.current = true;
    try {
      if (sessionStorage.getItem(BUBBLE_KEY)) gone.current = true;
    } catch {}
    const ts = timers.current;
    if (!gone.current) later(1600, () => { if (!gone.current) patch({ bubble: true }); });
    return () => {
      alive.current = false;
      ts.forEach(clearTimeout);
    };
  }, [later, patch]);

  const hideBubble = useCallback(() => {
    gone.current = true;
    try {
      sessionStorage.setItem(BUBBLE_KEY, "1");
    } catch {}
    patch({ bubble: false });
  }, [patch]);

  const close = useCallback(() => patch({ open: false }), [patch]);
  const toggle = () => {
    hideBubble();
    patch((c) => ({ open: !c.open }));
  };

  // Focus in, focus back, body scroll lock on phones.
  useEffect(() => {
    if (s.open) {
      wasOpen.current = true;
      const raf = requestAnimationFrame(() => {
        drawerRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
      });
      const phone = window.matchMedia("(max-width: 699px)").matches;
      const prev = document.body.style.overflow;
      if (phone) document.body.style.overflow = "hidden";
      return () => {
        cancelAnimationFrame(raf);
        document.body.style.overflow = prev;
      };
    }
    if (wasOpen.current) {
      wasOpen.current = false;
      launcherRef.current?.focus();
    }
  }, [s.open]);

  // Escape closes, Tab stays inside the drawer.
  useEffect(() => {
    if (!s.open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab" || !drawerRef.current) return;
      const els = Array.from(drawerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null);
      if (!els.length) return;
      const first = els[0];
      const last = els[els.length - 1];
      const act = document.activeElement;
      if (!drawerRef.current.contains(act)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && act === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && act === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [s.open, close]);

  const step = STEPS[s.cur];
  const chat = s.phase === "chat";
  const ready = chat && !s.typing;
  const total = s.a.ins === "Yes" ? 7 : 6;
  const answered = Math.min(s.hist.length, total);
  const stepNo = step.t === "consent" ? T.lastStep : T.questionOf(Math.min(answered + 1, total), total);
  const msg = buildMessage(s.a, s.f);
  const waUrl = "https://api.whatsapp.com/send/?phone=" + WA_PHONE + "&text=" + encodeURIComponent(msg) + "&type=phone_number&app_absent=0";

  const answer = (value: string, text: string) => {
    const a = { ...s.a, [step.id]: value };
    const nx = nextIdx(s.cur, a);
    patch({ a, hist: s.hist.concat([{ i: s.cur, text }]), typing: true, err: "" });
    later(pause(), () => patch({ cur: nx, typing: false }));
  };

  const submit = () => {
    const f = s.f;
    if (s.typing) return;
    if (step.t === "text") {
      if (f.name.trim().length < 2) return patch({ err: step.err });
      return answer(f.name.trim(), f.name.trim());
    }
    if (step.t === "loc") {
      if (!f.country.trim() || !f.city.trim() || !f.place.trim()) return patch({ err: step.err });
      return answer(f.place.trim(), f.city.trim() + ", " + f.country.trim() + "\n" + f.ptype + ": " + f.place.trim());
    }
    if (step.t === "insco") {
      const t = f.company.trim() ? f.company.trim() + (f.policy.trim() ? "\nPolicy: " + f.policy.trim() : "") : "I will share it in WhatsApp";
      return answer(f.company.trim(), t);
    }
    if (step.t === "phone") {
      if ((f.phone.match(/\d/g) || []).length < 7) return patch({ err: step.err });
      return answer(f.phone.trim(), f.phone.trim());
    }
  };

  const finish = () => {
    if (!alive.current || !timerDone.current || net.current === "pending") return;
    patch({ phase: "done", mailFail: net.current === "fail" });
  };

  const post = async (m: string, subject: string) => {
    try {
      const body = new URLSearchParams();
      body.append("fname", s.f.name.trim());
      body.append("mail", "");
      body.append("mobile", s.f.phone.trim());
      body.append("subject", subject);
      body.append("msg", m);
      // Marks a chat request: the live send.php mails these to marketing@healthcareig.com and marketing.hcig@gmail.com (his pick, 2026-11-12).
      body.append("assist", "1");
      if (ENDPOINT.startsWith("/")) {
        const res = await fetch(ENDPOINT, { method: "POST", body });
        const text = await res.text();
        if (!res.ok || !/success/i.test(text)) throw new Error(text);
      } else {
        await fetch(ENDPOINT, { method: "POST", mode: "no-cors", body });
      }
      net.current = "ok";
    } catch {
      net.current = "fail";
    }
    finish();
  };

  const send = () => {
    if (!s.consent) return patch({ err: STEPS[s.cur].err });
    const pri = priorities(s.a, s.f);
    const subject = (pri.length ? pri.join(" + ") + ": " : "") + "TMASI medical assistance request";
    msgRef.current = msg;
    timerDone.current = false;
    net.current = "pending";
    opened.current = false;
    patch({ phase: "sending", sendStep: 1, err: "", mailFail: false });
    later(950, () => patch({ sendStep: 2 }));
    later(1900, () => patch({ sendStep: 3 }));
    later(2850, () => patch({ sendStep: 4 }));
    later(3250, () => {
      timerDone.current = true;
      finish();
    });
    void post(msg, subject);
  };

  // Done screen: open WhatsApp once; the button stays as the fallback for popup blockers.
  useEffect(() => {
    if (s.phase !== "done" || opened.current) return;
    opened.current = true;
    const url = "https://api.whatsapp.com/send/?phone=" + WA_PHONE + "&text=" + encodeURIComponent(msgRef.current) + "&type=phone_number&app_absent=0";
    window.open(url, "_blank", "noopener");
  }, [s.phase]);

  const edit = (k: number) => {
    if (s.typing) return;
    const h = s.hist[k];
    const a: Answers = {};
    s.hist.slice(0, k).forEach((x) => { a[STEPS[x.i].id] = s.a[STEPS[x.i].id]; });
    patch({ hist: s.hist.slice(0, k), cur: h.i, a, err: "" });
  };

  const setF = (k: keyof Fields, v: string) => patch((c) => ({ f: { ...c.f, [k]: v }, err: "" }));
  const onEnter = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    }
  };
  const start = () => {
    patch({ phase: "chat", typing: true });
    later(pause(), () => patch({ typing: false }));
  };
  const reset = () => {
    timerDone.current = false;
    net.current = "pending";
    opened.current = false;
    patch({ ...fresh(), open: true, bubble: false });
  };

  const showBubble = !s.open && s.bubble;
  const labelsOk = (k: number) => s.sendStep > k + 1;

  return (
    <>
      <div className="asc-l" lang="en">
        {showBubble && (
          <div className="asc-bub" role="status">
            <button type="button" className="asc-bgo" onClick={toggle}>
              <b>{T.bubbleTitle}</b>
              {T.bubbleText}
            </button>
            <button type="button" className="asc-bx" aria-label={T.bubbleDismiss} onClick={hideBubble}>
              <Cross size={14} />
            </button>
          </div>
        )}
        <div className="asc-avw">
          <button ref={launcherRef} type="button" className="asc-av" aria-label={T.launcherLabel} aria-expanded={s.open} onClick={toggle}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset("/img/assist/avatar-head.webp")} alt="" width={66} height={66} />
          </button>
          <span className="asc-tag" aria-hidden="true"><i />{T.tag}</span>
        </div>
      </div>

      <div className={"asc-scrim" + (s.open ? " asc-open" : "")} lang="en" onClick={close} />
      <aside
        ref={drawerRef}
        className={"asc-drw" + (s.open ? " asc-open" : "")}
        role="dialog"
        aria-modal="true"
        aria-label={T.drawerLabel}
        aria-hidden={!s.open}
        inert={!s.open}
        lang="en"
      >
        <div className="asc-dh">
          <div className="asc-glow" aria-hidden="true" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="asc-fig" src={asset("/img/assist/avatar-half.webp")} alt="" width={487} height={560} />
          <div className="asc-tx"><b>{T.name}</b><span>{T.role}</span></div>
          <button type="button" className="asc-x" onClick={close}><Cross size={16} />{T.close}</button>
        </div>
        <div className="asc-sos" role="note">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: "none" }}>
            <path d="M12 9v4M12 17h.01" />
            <path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
          </svg>
          <span><b>{T.sosBold}</b>{T.sosRest}</span>
        </div>

        <div className="asc-tl" aria-live="polite">
          {s.phase === "welcome" && (
            <div className="asc-wel">
              <h3>{T.welcomeTitle}</h3>
              <p>{T.welcomeText}</p>
              <ul className="asc-wl">
                {T.ticks.map((t) => (
                  <li key={t}><span><Check /></span>{t}</li>
                ))}
              </ul>
              <button type="button" className="asc-btn" onClick={start}>
                {T.start}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </button>
            </div>
          )}

          {chat && (
            <>
              {s.hist.map((h, k) => (
                <div className="asc-it" key={h.i + "-" + k}>
                  <span className="asc-dot"><Check /></span>
                  <div className="asc-qq">{STEPS[h.i].q}</div>
                  <div className="asc-aa">
                    <span>{h.text}</span>
                    <button type="button" className="asc-ed" onClick={() => edit(k)} aria-label={T.changeAnswer + STEPS[h.i].q}>{T.edit}</button>
                  </div>
                </div>
              ))}
              <div className="asc-cur">
                <span className="asc-dot" aria-hidden="true" />
                <div className="asc-qc">
                  {s.typing && <div className="asc-skel" aria-label={T.loadingNext}><i /><i /><i /></div>}
                  {ready && (
                    <>
                      <div className="asc-who">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={asset("/img/assist/avatar-head.webp")} alt="" width={22} height={22} />
                        {stepNo}
                      </div>
                      <h4>{step.q}</h4>

                      {step.t === "choice" && (
                        <div className="asc-chips">
                          {(step.opts || []).map((o, k) => (
                            <button type="button" key={o} className="asc-chip" style={{ animationDelay: k * 70 + "ms" }} onClick={() => { if (!s.typing) answer(o, o); }}>
                              {o}<Chevron />
                            </button>
                          ))}
                        </div>
                      )}

                      {step.t === "text" && (
                        <>
                          <input className="asc-fi" value={s.f.name} onChange={(e) => setF("name", e.target.value)} onKeyDown={onEnter} placeholder={T.namePh} aria-label={T.nameLabel} autoComplete="name" />
                          <button type="button" className="asc-btn" onClick={submit}>{T.cont}</button>
                        </>
                      )}

                      {step.t === "loc" && (
                        <>
                          <div className="asc-row2">
                            <label className="asc-fl" style={{ flex: 1 }}>{T.country}
                              <input className="asc-fi" list={listId} value={s.f.country} onChange={(e) => setF("country", e.target.value)} placeholder={T.countryPh} autoComplete="country-name" />
                            </label>
                            <label className="asc-fl" style={{ flex: 1 }}>{T.city}
                              <input className="asc-fi" value={s.f.city} onChange={(e) => setF("city", e.target.value)} placeholder={T.cityPh} autoComplete="address-level2" />
                            </label>
                          </div>
                          <datalist id={listId}>{COUNTRIES.map((c) => <option key={c} value={c} />)}</datalist>
                          <div className="asc-seg" role="group" aria-label={T.whereExactly}>
                            {PTYPES.map((p) => (
                              <button type="button" key={p} className={s.f.ptype === p ? "asc-sel" : ""} aria-pressed={s.f.ptype === p} onClick={() => patch((c) => ({ f: { ...c.f, ptype: p } }))}>{p}</button>
                            ))}
                          </div>
                          <label className="asc-fl">{T.placeLabel}
                            <input className="asc-fi" value={s.f.place} onChange={(e) => setF("place", e.target.value)} onKeyDown={onEnter} placeholder={PLACE_PH[s.f.ptype]} />
                          </label>
                          <button type="button" className="asc-btn" onClick={submit}>{T.cont}</button>
                        </>
                      )}

                      {step.t === "insco" && (
                        <>
                          <label className="asc-fl">{T.company}
                            <input className="asc-fi" value={s.f.company} onChange={(e) => setF("company", e.target.value)} placeholder={T.companyPh} />
                          </label>
                          <label className="asc-fl">{T.policy}
                            <input className="asc-fi" value={s.f.policy} onChange={(e) => setF("policy", e.target.value)} onKeyDown={onEnter} placeholder={T.policyPh} />
                          </label>
                          <div className="asc-note"><Card /><span>{T.insNote}</span></div>
                          <div className="asc-row2">
                            <button type="button" className="asc-btn asc-ghost" style={{ flex: 1 }} onClick={() => answer("", "I will share it in WhatsApp")}>{T.skip}</button>
                            <button type="button" className="asc-btn" style={{ flex: 1 }} onClick={submit}>{T.cont}</button>
                          </div>
                        </>
                      )}

                      {step.t === "phone" && (
                        <>
                          <input className="asc-fi" type="tel" value={s.f.phone} onChange={(e) => setF("phone", e.target.value)} onKeyDown={onEnter} placeholder={T.phonePh} aria-label={T.phoneLabel} autoComplete="tel" />
                          <button type="button" className="asc-btn" onClick={submit}>{T.cont}</button>
                        </>
                      )}

                      {step.t === "consent" && (
                        <>
                          <label className="asc-cons">
                            <input type="checkbox" checked={s.consent} onChange={() => patch((c) => ({ consent: !c.consent, err: "" }))} />
                            <span>{T.consent}</span>
                          </label>
                          <button type="button" className="asc-btn" onClick={send}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z" /></svg>
                            {T.send}
                          </button>
                        </>
                      )}

                      {s.err && <div className="asc-err" role="alert">{s.err}</div>}
                    </>
                  )}
                </div>
              </div>
            </>
          )}

          {s.phase === "sending" && (
            <div className="asc-snd">
              <h3>{T.sending}</h3>
              {SEND_LABELS.map((l, k) => (
                <div key={l} className={labelsOk(k) ? "asc-st asc-ok" : s.sendStep === k + 1 ? "asc-st asc-act" : "asc-st"}>
                  <span className="asc-ico">{labelsOk(k) && <Check size={14} />}</span>{l}
                </div>
              ))}
            </div>
          )}

          {s.phase === "done" && (
            <div className="asc-done">
              <svg className="asc-ck" viewBox="0 0 84 84" fill="none" aria-hidden="true">
                <circle cx="42" cy="42" r="38" stroke="#009A9C" strokeWidth="4" />
                <path d="M26 43l11 11 21-23" stroke="#009A9C" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="asc-fm">{T.final}</p>
              <div className="asc-acts">
                <a className="asc-btn asc-wa" href={waUrl} target="_blank" rel="noopener noreferrer">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2z" /></svg>
                  {T.whatsapp}
                </a>
                {s.mailFail && <div className="asc-calm">{T.mailFail}</div>}
                {s.a.ins === "Yes" && <div className="asc-note" style={{ textAlign: "left" }}><Card /><span>{T.cardNote}</span></div>}
              </div>
              <button type="button" className="asc-lnk" onClick={reset}>{T.again}</button>
            </div>
          )}
        </div>
        <div className="asc-df">{T.footer}</div>
      </aside>

      <style dangerouslySetInnerHTML={{ __html: CSS }} />
    </>
  );
}

const CSS = `
.asc-l,.asc-scrim,.asc-drw{font-family:var(--font-montserrat),Montserrat,system-ui,sans-serif;color:#1C2229;-webkit-font-smoothing:antialiased}
.asc-drw button,.asc-drw input,.asc-l button{font-family:inherit}
.asc-l{position:fixed;right:28px;bottom:28px;z-index:9000;display:flex;align-items:flex-end;gap:14px}
.asc-avw{position:relative;display:flex;flex-direction:column;align-items:center}
.asc-av{position:relative;width:72px;height:72px;border:0;padding:0;border-radius:50%;cursor:pointer;background:#fff;box-shadow:0 14px 34px rgba(8,17,51,.35);transition:transform .5s cubic-bezier(.34,1.56,.64,1)}
.asc-av:hover{transform:translateY(-4px)}
.asc-av:active{transform:scale(.95)}
.asc-av:focus-visible,.asc-drw button:focus-visible,.asc-drw a:focus-visible,.asc-bgo:focus-visible,.asc-bx:focus-visible{outline:3px solid #007AB5;outline-offset:3px}
.asc-av img{position:absolute;inset:3px;width:66px;height:66px;border-radius:50%;object-fit:cover;background:#F1F5F9}
.asc-av:before{content:"";position:absolute;inset:-5px;border-radius:50%;border:2px solid rgba(0,154,156,.55);animation:asc-ripple 2.6s cubic-bezier(.16,1,.3,1) infinite}
.asc-av:after{content:"";position:absolute;inset:-5px;border-radius:50%;border:2px solid rgba(0,154,156,.45);animation:asc-ripple 2.6s 1.3s cubic-bezier(.16,1,.3,1) infinite}
@keyframes asc-ripple{from{transform:scale(1);opacity:1}to{transform:scale(1.45);opacity:0}}
.asc-tag{position:relative;margin-top:-12px;z-index:1;display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:999px;background:#0F205C;color:#fff;font-size:11.5px;font-weight:700;letter-spacing:.03em;white-space:nowrap;pointer-events:none;box-shadow:0 4px 12px rgba(8,17,51,.3)}
.asc-tag i{width:7px;height:7px;border-radius:50%;background:#22C55E;box-shadow:0 0 0 3px rgba(34,197,94,.25)}
.asc-bub{position:relative;max-width:250px;background:#fff;border-radius:18px 18px 4px 18px;padding:14px 38px 14px 16px;box-shadow:0 12px 34px rgba(8,17,51,.22);font-size:14px;line-height:1.45;color:#1C2229;margin-bottom:22px;animation:asc-bubin .7s cubic-bezier(.16,1,.3,1)}
.asc-bub b{display:block;color:#0F205C;font-size:14.5px;margin-bottom:2px}
.asc-bx{position:absolute;top:6px;right:6px;width:28px;height:28px;border-radius:50%;border:0;background:transparent;color:#64748B;cursor:pointer;display:flex;align-items:center;justify-content:center}
.asc-bgo{all:unset;cursor:pointer;display:block;font-family:inherit}
@keyframes asc-bubin{from{opacity:0;transform:translateX(12px) scale(.94)}}
.asc-scrim{position:fixed;inset:0;z-index:10000;background:rgba(8,17,51,.42);opacity:0;visibility:hidden;transition:opacity .5s cubic-bezier(.23,1,.32,1),visibility 0s .5s}
.asc-scrim.asc-open{opacity:1;visibility:visible;transition:opacity .5s cubic-bezier(.23,1,.32,1),visibility 0s}
.asc-drw{position:fixed;top:12px;right:12px;bottom:12px;z-index:10001;width:440px;max-width:calc(100vw - 24px);display:flex;flex-direction:column;background:#fff;border-radius:26px;overflow:hidden;box-shadow:0 30px 90px rgba(8,17,51,.4);transform:translateX(calc(100% + 24px));visibility:hidden;transition:transform .7s cubic-bezier(.32,.72,0,1),visibility 0s .7s}
.asc-drw.asc-open{transform:none;visibility:visible;transition:transform .7s cubic-bezier(.32,.72,0,1),visibility 0s}
.asc-dh{position:relative;flex:none;height:150px;background:radial-gradient(120% 120% at 15% 0%,#123A7A,#0F205C 55%,#081133);color:#fff;overflow:hidden}
.asc-fig{position:absolute;right:6px;bottom:-70px;height:250px;width:auto;animation:asc-fig .9s cubic-bezier(.16,1,.3,1) both}
@keyframes asc-fig{from{opacity:0;transform:translateY(30px)}}
.asc-glow{position:absolute;right:-40px;top:-40px;width:260px;height:260px;border-radius:50%;background:radial-gradient(circle,rgba(0,154,156,.45),transparent 65%)}
.asc-tx{position:absolute;left:22px;top:20px;right:200px}
.asc-tx b{display:block;font-size:20px}
.asc-tx span{display:block;font-size:13px;color:rgba(255,255,255,.75);margin-top:4px;line-height:1.45}
.asc-x{position:absolute;left:22px;bottom:16px;display:inline-flex;align-items:center;gap:6px;min-height:36px;padding:0 12px 0 8px;border-radius:999px;border:1px solid rgba(255,255,255,.3);background:rgba(255,255,255,.08);color:#fff;font-size:13px;font-weight:600;cursor:pointer;transition:background .2s}
.asc-x:hover{background:rgba(255,255,255,.18)}
.asc-sos{display:flex;align-items:center;gap:10px;padding:10px 20px;background:#FEF3F2;color:#9A1C13;font-size:12.5px;line-height:1.4;border-bottom:1px solid #FECDCA}
.asc-sos b{font-weight:700}
.asc-tl{flex:1;overflow-y:auto;padding:20px 20px 14px;background:#F8FAFC}
.asc-it{position:relative;padding:0 0 14px 34px;animation:asc-in .6s cubic-bezier(.16,1,.3,1) both}
.asc-it:before{content:"";position:absolute;left:11px;top:26px;bottom:0;width:2px;background:#DCE5EE}
.asc-it .asc-dot{position:absolute;left:0;top:2px;width:24px;height:24px;border-radius:50%;background:#009A9C;color:#fff;display:flex;align-items:center;justify-content:center;animation:asc-pop .45s cubic-bezier(.34,1.56,.64,1) both}
@keyframes asc-pop{from{transform:scale(.3)}}
@keyframes asc-in{from{opacity:0;transform:translateY(12px)}}
.asc-qq{font-size:12.5px;color:#64748B;line-height:1.45}
.asc-aa{display:flex;align-items:flex-start;gap:10px;margin-top:4px}
.asc-aa span{flex:1;font-size:14.5px;font-weight:600;color:#0F205C;white-space:pre-line;line-height:1.45;overflow-wrap:anywhere}
.asc-ed{flex:none;min-height:30px;padding:0 10px;border-radius:999px;border:1px solid #CBD5E1;background:#fff;color:#54606E;font-size:12px;font-weight:600;cursor:pointer;transition:background .2s,color .2s}
.asc-ed:hover{background:#0F205C;color:#fff;border-color:#0F205C}
.asc-cur{position:relative;padding-left:34px;animation:asc-in .65s cubic-bezier(.16,1,.3,1) both}
.asc-cur .asc-dot{position:absolute;left:0;top:14px;width:24px;height:24px;border-radius:50%;border:2px solid #009A9C;box-sizing:border-box;background:#fff}
.asc-cur .asc-dot:after{content:"";position:absolute;inset:5px;border-radius:50%;background:#009A9C;animation:asc-blink 1.6s ease-in-out infinite}
@keyframes asc-blink{50%{transform:scale(.5);opacity:.5}}
.asc-qc{background:#fff;border:1px solid #E2E8F0;border-radius:20px;padding:16px;box-shadow:0 10px 30px -18px rgba(15,32,92,.35);display:flex;flex-direction:column;gap:12px}
.asc-qc h4{margin:0;font-size:17px;line-height:1.4;color:#0F205C}
.asc-who{display:flex;align-items:center;gap:8px;font-size:12px;font-weight:600;color:#009A9C}
.asc-who img{width:22px;height:22px;border-radius:50%;object-fit:cover}
.asc-skel{display:flex;flex-direction:column;gap:10px}
.asc-skel i{display:block;height:14px;border-radius:8px;background:linear-gradient(90deg,#EEF2F6 0%,#F8FAFC 40%,#EEF2F6 80%);background-size:200% 100%;animation:asc-shim 1.1s linear infinite}
.asc-skel i:nth-child(1){width:70%}.asc-skel i:nth-child(2){width:92%;height:42px;border-radius:12px}.asc-skel i:nth-child(3){width:92%;height:42px;border-radius:12px}
@keyframes asc-shim{from{background-position:200% 0}to{background-position:0 0}}
.asc-chips{display:flex;flex-direction:column;gap:8px}
.asc-chip{display:flex;align-items:center;justify-content:space-between;min-height:48px;padding:10px 14px;border-radius:14px;border:1.5px solid #E2E8F0;background:#fff;color:#0F205C;font-size:14.5px;font-weight:600;cursor:pointer;text-align:left;animation:asc-in .5s cubic-bezier(.16,1,.3,1) both;transition:border-color .2s,background .2s,transform .35s cubic-bezier(.34,1.56,.64,1)}
.asc-chip:hover{border-color:#009A9C;background:#F4FBFB;transform:translateX(3px)}
.asc-chip svg{color:#009A9C;flex:none;transition:transform .35s cubic-bezier(.34,1.56,.64,1)}
.asc-chip:hover svg{transform:translateX(3px)}
.asc-fl{display:flex;flex-direction:column;gap:5px;font-size:12.5px;font-weight:600;color:#54606E;min-width:0}
.asc-fi{width:100%;box-sizing:border-box;min-height:46px;padding:10px 12px;border:1.5px solid #E2E8F0;border-radius:12px;font-size:16px;font-weight:500;color:#1C2229;background:#fff;outline:none;transition:border-color .2s,box-shadow .2s}
.asc-fi:focus{border-color:#009A9C;box-shadow:0 0 0 4px rgba(0,154,156,.14)}
.asc-row2{display:flex;gap:8px}
.asc-seg{display:flex;gap:4px;padding:4px;background:#F1F5F9;border-radius:12px}
.asc-seg button{flex:1;min-height:36px;border:0;border-radius:9px;background:transparent;font-size:13px;font-weight:600;color:#54606E;cursor:pointer;transition:background .25s,color .25s,box-shadow .25s}
.asc-seg button.asc-sel{background:#fff;color:#0F205C;box-shadow:0 1px 3px rgba(15,32,92,.12)}
.asc-note{display:flex;gap:8px;font-size:12.5px;line-height:1.5;color:#54606E;background:#F0FAFA;border-radius:12px;padding:10px 12px}
.asc-cons{display:flex;gap:10px;align-items:flex-start;font-size:13.5px;line-height:1.5;color:#1C2229;cursor:pointer}
.asc-cons input{width:20px;height:20px;margin:1px 0 0;accent-color:#009A9C;flex:none}
.asc-err{font-size:12.5px;color:#B42318;font-weight:600;animation:asc-in .35s ease both}
.asc-btn{position:relative;overflow:hidden;display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:48px;padding:0 22px;border-radius:14px;border:0;background:linear-gradient(135deg,#009A9C,#007AB5);color:#fff !important;font-size:14.5px;font-weight:700;cursor:pointer;text-decoration:none;transition:transform .4s cubic-bezier(.34,1.56,.64,1),box-shadow .35s}
.asc-btn:after{content:"";position:absolute;top:0;bottom:0;left:-60%;width:45%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.38),transparent);transform:skewX(-18deg);animation:asc-shine 2.8s cubic-bezier(.4,0,.2,1) infinite}
.asc-btn:hover{transform:translateY(-2px);box-shadow:0 12px 26px -10px rgba(0,122,181,.7)}
.asc-btn:active{transform:scale(.98)}
.asc-btn.asc-ghost{background:#fff;color:#0F205C !important;border:1.5px solid #CBD5E1}
.asc-btn.asc-ghost:after{display:none}
.asc-btn.asc-wa{background:linear-gradient(135deg,#1FAF5A,#128C7E)}
@keyframes asc-shine{0%{left:-60%}55%,100%{left:130%}}
.asc-wel{display:flex;flex-direction:column;gap:12px;animation:asc-in .7s cubic-bezier(.16,1,.3,1) both}
.asc-wel h3{margin:0;font-size:22px;color:#0F205C}
.asc-wel p{margin:0;font-size:14.5px;line-height:1.6;color:#54606E}
.asc-wl{display:flex;flex-direction:column;gap:8px;margin:2px 0 6px;padding:0;list-style:none}
.asc-wl li{display:flex;align-items:center;gap:10px;font-size:13.5px;color:#1C2229}
.asc-wl li span{width:24px;height:24px;border-radius:50%;background:#E6F6F6;color:#009A9C;display:flex;align-items:center;justify-content:center;flex:none}
.asc-snd{display:flex;flex-direction:column;gap:12px;animation:asc-in .5s cubic-bezier(.16,1,.3,1) both}
.asc-snd h3{margin:0 0 4px;font-size:20px;color:#0F205C}
.asc-st{display:flex;align-items:center;gap:12px;padding:14px 16px;border-radius:16px;background:#fff;border:1px solid #E2E8F0;font-size:14.5px;font-weight:600;color:#94A3B8;transition:color .4s,border-color .4s,box-shadow .4s}
.asc-ico{width:26px;height:26px;border-radius:50%;flex:none;border:2px solid #CBD5E1;box-sizing:border-box;display:flex;align-items:center;justify-content:center}
.asc-st.asc-act{color:#0F205C;border-color:#9ED9DA;box-shadow:0 6px 18px -8px rgba(0,154,156,.5)}
.asc-st.asc-act .asc-ico{border-color:#009A9C;border-right-color:transparent;animation:asc-spin .8s linear infinite}
.asc-st.asc-ok{color:#0F205C}
.asc-st.asc-ok .asc-ico{border:0;background:#009A9C;color:#fff;animation:asc-pop .4s cubic-bezier(.34,1.56,.64,1)}
@keyframes asc-spin{to{transform:rotate(360deg)}}
.asc-done{display:flex;flex-direction:column;align-items:center;text-align:center;gap:14px;padding-top:10px}
.asc-ck{width:84px;height:84px}
.asc-ck circle{stroke-dasharray:240;stroke-dashoffset:240;animation:asc-draw .8s cubic-bezier(.65,0,.35,1) forwards}
.asc-ck path{stroke-dasharray:60;stroke-dashoffset:60;animation:asc-draw .5s .65s cubic-bezier(.65,0,.35,1) forwards}
@keyframes asc-draw{to{stroke-dashoffset:0}}
.asc-fm{margin:0;font-size:15.5px;line-height:1.65;color:#1C2229;animation:asc-in .7s .9s cubic-bezier(.16,1,.3,1) both}
.asc-acts{display:flex;flex-direction:column;gap:10px;width:100%;animation:asc-in .7s 1.1s cubic-bezier(.16,1,.3,1) both}
.asc-calm{font-size:12.5px;line-height:1.5;color:#54606E;text-align:center}
.asc-lnk{background:none;border:0;font-size:13px;font-weight:600;color:#54606E;cursor:pointer;min-height:36px;text-decoration:underline}
.asc-df{padding:9px 20px 12px;text-align:center;font-size:11px;color:#64748B;border-top:1px solid #F1F5F9}
@media (max-width:699px){
  .asc-l{right:16px;bottom:18px}
  .asc-bub{max-width:min(250px,calc(100vw - 130px))}
  .asc-drw{top:0;right:0;bottom:0;left:0;width:auto;max-width:none;height:100dvh;border-radius:0;transform:translateY(100%)}
  .asc-drw.asc-open{transform:none}
}
@media (prefers-reduced-motion:reduce){
  [class*="asc-"],[class*="asc-"]::before,[class*="asc-"]::after{animation-duration:.01ms !important;animation-iteration-count:1 !important;transition-duration:.15s !important}
}
`;
