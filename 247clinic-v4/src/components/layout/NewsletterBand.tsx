"use client";

/* Newsletter band at the end of every page (the user, 2026-11-12: "add band for newsletter subscription at the
   end with great design"). His words: "Stay in Touch" and "Subscribe for news from 24/7 Clinic.". No newsletter
   service is connected yet, so Subscribe opens the visitor's email with a ready message to info@247clinic.net
   (his choice); nothing is stored on the site. v6: on the ink footer, the words kept, the field as one hairline row. */
import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";

export function NewsletterBand({ email, title, line, label, button }: { email: string; title: string; line: string; label: string; button: string }) {
  const [sent, setSent] = useState(false);
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const v = (new FormData(e.currentTarget).get("email") as string || "").trim();
    if (!v) return;
    const subject = encodeURIComponent("Newsletter subscription");
    const body = encodeURIComponent(`Please subscribe ${v} to the 24/7 Clinic newsletter.`);
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    setSent(true);
  };
  return (
    <section className="news-band rv" aria-labelledby="news-h">
      <div className="news-copy">
        <h2 id="news-h" className="news-h">{title}</h2>
        <p>{line}</p>
      </div>
      <form className="news-form" onSubmit={submit}>
        <label htmlFor="news-email" className="sr-only">{label}</label>
        <input id="news-email" name="email" type="email" required autoComplete="email" placeholder={label} />
        <button type="submit" className="news-go">
          <span>{button}</span>{sent ? <Check size={18} aria-hidden="true" /> : <ArrowRight size={18} aria-hidden="true" />}
        </button>
      </form>
    </section>
  );
}
