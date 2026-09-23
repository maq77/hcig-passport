/* Footer, rewritten 2026-09-23 (the user: "re write footer"). A help band first
   (brief section 42 and 27), then brand, menu, destinations and contact.
   Accreditation lines are the ones he named: UCA only, part of HCIG.
   The full logo (with its tagline) is shown at 132px, above the 120px minimum. */
import { Mail, MapPin, Phone } from "lucide-react";
import { asset, BASE, PHONE } from "@/data/facts";
import { DESTINATIONS } from "@/data/clinics";
import { FOOTER_ONLY, NAV } from "@/data/nav";
import { APPROVED, BRIEF, THEIRS } from "@/content/brief";
import { section } from "@/content/load";
import { CallButton, WaButton } from "@/components/ui/Buttons";
import { WhatsAppGlyph } from "@/components/ui/Icon";
import { telHref, waHref } from "@/lib/wa";

export function Footer({ nav, footerOnly }: { nav: string[]; footerOnly: string[] }) {
  const year = new Date().getFullYear();
  const contact = section("contact", "contact");
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="help-band rv">
          <div>
            <h2 className="h2">{BRIEF.needHelp}</h2>
            {contact.subheading && <p className="lead">{contact.subheading}</p>}
          </div>
          <div className="cta-row">
            <WaButton placement="footer-band">{BRIEF.waUs}</WaButton>
            <CallButton placement="footer-band" />
          </div>
        </div>

        <div className="foot">
          <div className="brand">
            <img src={asset("/logos/marks/247-logo.svg")} alt="24/7 Clinic" width={132} height={128} loading="lazy" />
            <p>{THEIRS.about}</p>
            <ul className="badges">
              <li><img src={asset("/logos/marks/uca.png")} alt="" width={48} height={48} loading="lazy" /><span>{APPROVED.accredited}</span></li>
              <li><img src={asset("/logos/marks/hcig.png")} alt="" width={50} height={48} loading="lazy" /><span>{APPROVED.partOf}</span></li>
            </ul>
          </div>
          <nav aria-label="Footer">
            <h4>Menu</h4>
            <ul>{NAV.map((n, i) => <li key={n.path}><a href={`${BASE}${n.path}`}>{nav[i]}</a></li>)}</ul>
          </nav>
          <div>
            <h4>Destinations</h4>
            <ul>{DESTINATIONS.map((d) => <li key={d.id}><a href={`${BASE}/#clinics-${d.id}`}>{d.name}</a></li>)}</ul>
          </div>
          <div>
            <h4>Contact</h4>
            <ul className="contact">
              <li><a href={waHref("general")} target="_blank" rel="noopener" data-ev="whatsapp_medical_click" data-placement="footer"><WhatsAppGlyph size={17} /><span>{PHONE.display}</span></a></li>
              <li><a href={telHref} data-ev="phone_click" data-placement="footer"><Phone size={17} aria-hidden="true" /><span>{PHONE.display}</span></a></li>
              <li><a href={`mailto:${THEIRS.email}`}><Mail size={17} aria-hidden="true" /><span>{THEIRS.email}</span></a></li>
              <li><MapPin size={17} aria-hidden="true" /><span>{THEIRS.address}</span></li>
            </ul>
          </div>
        </div>

        <div className="foot-base">
          <span>&copy; {year} 24/7 Clinic. {THEIRS.rights}</span>
          <ul>{FOOTER_ONLY.map((n, i) => <li key={n.path}><a href={`${BASE}${n.path}`}>{footerOnly[i]}</a></li>)}</ul>
        </div>
      </div>
    </footer>
  );
}
