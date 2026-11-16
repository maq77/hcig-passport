"use client";

/* General & Business Enquiries (brief 27: "Keep the existing form below for: Hotel
   partnerships, Insurance partnerships, General enquiries, Careers, Corporate
   communication"). A static site has no server, so the form writes the email for the
   visitor's own mail app, addressed to info@247clinic.net. Urgent patients never fill it.
   v6: hairline fields, labels above, 17px inputs (never under 16px, so phones do not zoom), a clear
   red focus ring. */
import { useState } from "react";
import { ChevronDown, Mail } from "lucide-react";

export function EnquiryForm({ topics, email, labels }: {
  topics: string[]; email: string; labels: { topic: string; name: string; email: string; phone: string; message: string; send: string };
}) {
  const [topic, setTopic] = useState(topics[0]);
  return (
    <form className="pg-form rv" onSubmit={(e) => {
      e.preventDefault();
      const f = new FormData(e.currentTarget);
      const body = [`${labels.name}: ${f.get("name")}`, `${labels.email}: ${f.get("email")}`, `${labels.phone}: ${f.get("phone") || ""}`, "", String(f.get("message") || "")].join("\n");
      window.location.href = `mailto:${email}?subject=${encodeURIComponent(topic)}&body=${encodeURIComponent(body)}`;
    }}>
      <label className="field"><span>{labels.topic}</span>
        <span className="field-in">
          <select name="topic" value={topic} onChange={(e) => setTopic(e.target.value)}>
            {topics.map((t) => <option key={t}>{t}</option>)}
          </select>
          <ChevronDown size={18} aria-hidden="true" />
        </span>
      </label>
      <div className="row2">
        <label className="field"><span>{labels.name}</span><input name="name" required autoComplete="name" /></label>
        <label className="field"><span>{labels.email}</span><input name="email" type="email" required autoComplete="email" /></label>
      </div>
      <label className="field"><span>{labels.phone}</span><input name="phone" type="tel" autoComplete="tel" /></label>
      <label className="field"><span>{labels.message}</span><textarea name="message" required /></label>
      <button type="submit" className="btn btn-call"><Mail size={18} aria-hidden="true" /><span>{labels.send}</span></button>
    </form>
  );
}
