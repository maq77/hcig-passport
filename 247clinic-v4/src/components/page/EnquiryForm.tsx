"use client";

/* General & Business Enquiries (brief 27: "Keep the existing form below for: Hotel
   partnerships, Insurance partnerships, General enquiries, Careers, Corporate
   communication"). A static site has no server, so the form writes the email for the
   visitor's own mail app, addressed to info@247clinic.net. Urgent patients never fill it. */
import { useState } from "react";
import { Mail } from "lucide-react";

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
      <label>{labels.topic}
        <select name="topic" value={topic} onChange={(e) => setTopic(e.target.value)}>
          {topics.map((t) => <option key={t}>{t}</option>)}
        </select>
      </label>
      <div className="row2">
        <label>{labels.name}<input name="name" required autoComplete="name" /></label>
        <label>{labels.email}<input name="email" type="email" required autoComplete="email" /></label>
      </div>
      <label>{labels.phone}<input name="phone" type="tel" autoComplete="tel" /></label>
      <label>{labels.message}<textarea name="message" required /></label>
      <button type="submit" className="btn btn-call"><Mail size={18} aria-hidden="true" /><span>{labels.send}</span></button>
    </form>
  );
}
