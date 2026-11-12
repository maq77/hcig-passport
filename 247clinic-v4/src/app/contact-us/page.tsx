/* Contact (brief 27): built around urgent patient communication. WhatsApp first, what to
   tell us, then the business form below. */
import { Mail, MapPin, Phone } from "lucide-react";
import { section } from "@/content/load";
import { THEIRS } from "@/content/brief";
import { PHONE } from "@/data/facts";
import { telHref, waHref } from "@/lib/wa";
import { CallButton, WaButton } from "@/components/ui/Buttons";
import { WhatsAppGlyph } from "@/components/ui/Icon";
import { Band, Checks, PageHero, pageMeta } from "@/components/page/Page";
import { EnquiryForm } from "@/components/page/EnquiryForm";

const s = section("contact", "contact");
export const metadata = pageMeta(s.heading, s.subheading ?? "", "/contact-us");

export default function Contact() {
  const tell = s.items.slice(0, 5).map((it) => it.title);
  const topics = s.items.slice(5).map((it) => it.title);
  return (
    <>
      <PageHero eyebrow="Contact" title={s.heading} lead={[s.subheading ?? ""]} img="/img/hero-message.webp" pos="72% 50%" posM="92% 50%"
        trail={[{ name: "Home", path: "/" }, { name: "Contact", path: "/contact-us" }]}>
        <WaButton placement="contact-hero" ctx="general">{s.ctas[0].label}</WaButton>
        <CallButton placement="contact-hero" />
      </PageHero>

      <Band id="c-tell">
        <div className="pg-two">
          <Checks title="When contacting us, please tell us:" items={tell} />
          <div className="contact-card rv">
            <a href={waHref("general")} target="_blank" rel="noopener" data-ev="whatsapp_medical_click" data-placement="contact-card">
              <span className="tile-ico" aria-hidden="true"><WhatsAppGlyph size={20} /></span><span><small>WhatsApp</small>{PHONE.display}</span>
            </a>
            <a href={telHref} data-ev="phone_click" data-placement="contact-card">
              <span className="tile-ico" aria-hidden="true"><Phone size={20} /></span><span><small>Phone</small>{PHONE.display}</span>
            </a>
            <a href={`mailto:${THEIRS.email}`}>
              <span className="tile-ico" aria-hidden="true"><Mail size={20} /></span><span><small>Email</small>{THEIRS.email}</span>
            </a>
            <div>
              <span className="tile-ico" aria-hidden="true"><MapPin size={20} /></span><span><small>Address</small>{THEIRS.address}</span>
            </div>
          </div>
        </div>
      </Band>

      <section className="section pg-band bg-surface" id="business" aria-labelledby="c-biz">
        <div className="container pg-narrow">
          <div className="head">
            <h2 id="c-biz" className="h2 rv">{s.body[0]}</h2>
          </div>
          <EnquiryForm topics={topics} email={THEIRS.email}
            labels={{ topic: "General & Business Enquiries", name: "Your name", email: "Email", phone: "Phone", message: "Message", send: "Send" }} />
        </div>
      </section>
    </>
  );
}
