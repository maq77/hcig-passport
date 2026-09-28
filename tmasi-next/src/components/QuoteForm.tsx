"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState, type FormEvent } from "react";
import { useSite } from "./site/SiteProvider";

// The live tmasi.net "Request My Free Quote" form: same eight fields, same field names, same handler.
// On tmasi.net itself the endpoint is "/send.php" and the reply is read; from the preview the browser
// may send but not read a cross-site reply, so "delivered" counts as sent.
const QUOTE_ENDPOINT = process.env.NEXT_PUBLIC_QUOTE_ENDPOINT || "https://tmasi.net/send.php";
const WHATSAPP = "https://wa.me/201206788566";

// Field type and autofill hint per live field name. The labels come from each language's live form.
const META: Record<string, { type: string; auto: string }> = {
  fname: { type: "text", auto: "given-name" },
  lname: { type: "text", auto: "family-name" },
  mail: { type: "email", auto: "email" },
  mobile: { type: "tel", auto: "tel" },
  company: { type: "text", auto: "organization" },
  jtitle: { type: "text", auto: "organization-title" },
  subject: { type: "text", auto: "address-level1" },
  country: { type: "text", auto: "country-name" },
  msg: { type: "textarea", auto: "off" },
};

type Status = "idle" | "sending" | "sent" | "error";

// Handshake line icon; each stroke draws itself in on success.
const HANDSHAKE = [
  "m11 17 2 2a1 1 0 1 0 3-3",
  "m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4",
  "m21 3 1 11h-2",
  "M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3",
  "M3 4h8",
];

function Success({ title, text }: { title: string; text: string }) {
  const reduce = useReducedMotion();
  const burst = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2;
    return { x: Math.cos(a) * 78, y: Math.sin(a) * 78, c: i % 3 === 0 ? "#0F205C" : "#009A9C" };
  });
  return (
    <motion.div
      className="qf-success"
      role="status"
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="qf-success-mark" aria-hidden="true">
        {!reduce && burst.map((b, i) => (
          <motion.span
            key={i}
            className="qf-burst"
            style={{ background: b.c }}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0.4 }}
            animate={{ x: b.x, y: b.y, opacity: [0, 1, 0], scale: [0.4, 1, 0.6] }}
            transition={{ duration: 1.1, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          />
        ))}
        <motion.span
          className="qf-success-ring"
          initial={reduce ? false : { scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
            {HANDSHAKE.map((d, i) => (
              <motion.path
                key={i}
                d={d}
                initial={reduce ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.9, delay: 0.25 + i * 0.08, ease: "easeInOut" }}
              />
            ))}
          </svg>
        </motion.span>
      </div>
      <h3 className="qf-success-title">{title}</h3>
      <p className="qf-success-text">{text}</p>
    </motion.div>
  );
}

// variant "quote": the live "Request My Free Quote" form. variant "message": the live contact page's
// "Leave Your Message" form. Both post to the same live handler with the live field names.
export default function QuoteForm({ idPrefix, columns = 4, variant = "quote" }: { idPrefix: string; columns?: 2 | 4; variant?: "quote" | "message" }) {
  const { live, ui, quoteThanks } = useSite();
  const source = variant === "quote" ? live.shell.quote : live.contact.form;
  const fields = Object.entries(source.fields as Record<string, string>).map(([name, label]) => ({
    name, label, ...(META[name] || { type: "text", auto: "on" }),
    ...(variant === "message" && name === "fname" ? { auto: "name" } : {}),
    ...(variant === "message" && name === "subject" ? { auto: "off" } : {}),
  }));
  const submitLabel = source.submit;
  const successText = variant === "quote" ? quoteThanks : ui.messageReceived;
  const [status, setStatus] = useState<Status>("idle");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    setStatus("sending");
    const body = new URLSearchParams();
    new FormData(form).forEach((v, k) => body.append(k, String(v)));
    try {
      if (QUOTE_ENDPOINT.startsWith("/")) {
        const res = await fetch(QUOTE_ENDPOINT, { method: "POST", body });
        const text = await res.text();
        if (!res.ok || !/success/i.test(text)) throw new Error(text);
      } else {
        await fetch(QUOTE_ENDPOINT, { method: "POST", mode: "no-cors", body });
      }
      form.reset();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className={`qf qf--${columns}`}>
      <AnimatePresence mode="wait" initial={false}>
        {status === "sent" ? (
          <Success key="sent" title={ui.thankYou} text={successText} />
        ) : (
          <motion.form
            key="form"
            className="qf-grid"
            onSubmit={submit}
            noValidate
            exit={{ opacity: 0, y: -8, transition: { duration: 0.25 } }}
          >
            {fields.map((f) => (
              <label key={f.name} className={`qf-field${f.type === "textarea" ? " qf-field--wide" : ""}`} htmlFor={`${idPrefix}-${f.name}`}>
                <span className="qf-label">{f.label}</span>
                {f.type === "textarea" ? (
                  <textarea id={`${idPrefix}-${f.name}`} className="qf-input qf-textarea" name={f.name} rows={5} required />
                ) : (
                  <input
                    id={`${idPrefix}-${f.name}`}
                    className="qf-input"
                    type={f.type}
                    name={f.name}
                    autoComplete={f.auto}
                    required
                  />
                )}
              </label>
            ))}
            <div className="qf-actions">
              <button type="submit" className="qf-submit" disabled={status === "sending"}>
                {status === "sending" ? <span className="qf-spinner" aria-hidden="true" /> : null}
                {status === "sending" ? ui.sending : submitLabel}
              </button>
              {status === "error" && (
                <p className="qf-error" role="alert">
                  {ui.errorBefore} <a href={WHATSAPP} target="_blank" rel="noopener noreferrer">{live.shell.call}</a> {ui.errorAfter}
                </p>
              )}
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{__html: `
        .qf-grid { display: grid; gap: 20px 18px; grid-template-columns: repeat(4, minmax(0, 1fr)); }
        .qf--2 .qf-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .qf-field { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
        .qf-label { font-size: 11.5px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: var(--lx-body); }
        .qf-input {
          height: 50px; box-sizing: border-box; width: 100%; border: 1px solid var(--lx-line); border-radius: 10px;
          background: #F8FAFC; padding: 0 16px; font-size: 15px; font-family: inherit; color: var(--lx-ink);
          transition: border-color .2s ease, box-shadow .2s ease, background-color .2s ease;
        }
        .qf-input:hover { border-color: #cfd8e3; }
        .qf-field--wide { grid-column: 1 / -1; }
        .qf-textarea { height: auto; min-height: 140px; padding: 14px 16px; line-height: 1.6; resize: vertical; }
        .qf-input:focus { outline: none; background: #ffffff; border-color: var(--tmasi-teal); box-shadow: 0 0 0 4px rgba(0,154,156,0.14); }
        .qf-input:user-invalid { border-color: #c2410c; box-shadow: 0 0 0 4px rgba(194,65,12,0.10); }
        .qf-actions { grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; gap: 14px; margin-top: 8px; }
        .qf-submit {
          display: inline-flex; align-items: center; justify-content: center; gap: 10px;
          width: min(320px, 100%); height: 56px; border: none; border-radius: 999px; background: var(--tmasi-teal); color: #ffffff;
          font-family: inherit; font-size: 14px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase;
          cursor: pointer; transition: background-color .25s ease, transform .2s ease, box-shadow .25s ease;
        }
        .qf-submit:hover { background: #008486; box-shadow: 0 12px 28px -12px rgba(0,154,156,0.6); }
        .qf-submit:active { transform: scale(0.98); }
        .qf-submit:disabled { cursor: progress; opacity: 0.85; }
        .qf-spinner { width: 16px; height: 16px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.4); border-top-color: #ffffff; animation: qf-spin .8s linear infinite; }
        @keyframes qf-spin { to { transform: rotate(360deg); } }
        .qf-error { margin: 0; font-size: 14px; color: #9a3412; text-align: center; }
        .qf-error a { color: var(--tmasi-teal); font-weight: 700; }

        .qf-success { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 12px 0 8px; }
        .qf-success-mark { position: relative; width: 112px; height: 112px; display: flex; align-items: center; justify-content: center; margin-bottom: 22px; }
        .qf-success-ring {
          width: 112px; height: 112px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
          background: rgba(0,154,156,0.08); border: 2px solid var(--tmasi-teal); color: var(--tmasi-teal);
          box-shadow: 0 0 0 10px rgba(0,154,156,0.06);
        }
        .qf-success-ring svg { width: 54px; height: 54px; }
        .qf-burst { position: absolute; left: 50%; top: 50%; width: 8px; height: 8px; margin: -4px 0 0 -4px; border-radius: 50%; }
        .qf-success-title {
          margin: 0 0 10px; color: var(--lx-ink);
          font-family: var(--font-bignoodle), var(--font-montserrat), sans-serif; font-weight: 400;
          font-size: clamp(34px, 3.4vw, 44px); letter-spacing: 0.02em; text-transform: uppercase;
        }
        .qf-success-text { margin: 0; max-width: 46ch; font-size: 16px; line-height: 1.7; color: var(--lx-body); }

        @media (max-width: 1024px) { .qf--4 .qf-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        @media (max-width: 600px) {
          .qf-grid, .qf--2 .qf-grid, .qf--4 .qf-grid { grid-template-columns: 1fr; gap: 16px; }
          .qf-input { font-size: 16px; }
          .qf-submit { width: 100%; }
        }
      `}} />
    </div>
  );
}
