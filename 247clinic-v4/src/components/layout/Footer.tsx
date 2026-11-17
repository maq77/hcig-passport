/* Footer, rewritten 2026-09-23 (the user: "re write footer"). A help band first
   (brief section 42 and 27), then brand, menu, destinations and contact.
   v6 (spec 015): the help band is the closing line in Cormorant on ivory, then a solid ink footer: the
   newsletter as one hairline input row, four labelled columns, the UCA and group lines, the copyright.
   Accreditation lines are the ones he named: UCA only, part of HCIG.
   The full logo (with its tagline) is shown at 132px, above the 120px minimum. */
import { Mail, MapPin, Phone } from "lucide-react";
import { asset, BASE, PHONE } from "@/data/facts";
import { DESTINATIONS } from "@/data/clinics";
import { FOOTER_ONLY, MORE_PAGES, NAV } from "@/data/nav";
import { APPROVED, BRIEF, THEIRS } from "@/content/brief";
import { section } from "@/content/load";
import { CallButton, WaButton } from "@/components/ui/Buttons";
import { WhatsAppGlyph } from "@/components/ui/Icon";
import { telHref, waHref } from "@/lib/wa";
import { NewsletterBand } from "./NewsletterBand";

export function Footer({ nav, footerOnly }: { nav: string[]; footerOnly: string[] }) {
  const year = new Date().getFullYear();
  /* One closing message for the whole site: the brief's final call (section 16), said once. The home shows it
     at the foot of its FAQ, so there the band is hidden (body:has(.final-close) in chrome.css). */
  const close = section("home", "final-cta");
  return (
    <footer className="site-footer v6">
      <div className="help-band">
        <div className="container help-in">
          <span className="rule rv" aria-hidden="true" />
          <h2 className="h2 rv">{close.heading}</h2>
          <p className="lead rv">{close.body[0]}</p>
          <div className="cta-row center rv">
            <WaButton placement="footer-band">{BRIEF.waUs}</WaButton>
            <CallButton placement="footer-band" />
          </div>
        </div>
      </div>

      <div className="foot-ink on-ink">
        <div className="container">
          <div className="foot-top">
            <div className="brand">
              <img src={asset("/logos/marks/247-logo-ivory.svg")} alt="24/7 Clinic" width={132} height={128} loading="lazy" />
              <p>{THEIRS.about}</p>
            </div>
            <NewsletterBand email={THEIRS.email} title="Stay in Touch" line="Subscribe for news from 24/7 Clinic." label="Email address" button="Subscribe" />
          </div>

          <div className="foot">
            <nav aria-label="Footer">
              <h4>Menu</h4>
              <ul>{NAV.map((n, i) => <li key={n.path}><a href={`${BASE}${n.path}`}>{nav[i]}</a></li>)}</ul>
            </nav>
            <div>
              <h4>Destinations</h4>
              <ul>{DESTINATIONS.map((d) => <li key={d.id}><a href={`${BASE}/${d.id}`}>{d.name}</a></li>)}</ul>
            </div>
            <div>
              <h4>More</h4>
              <ul>
                {FOOTER_ONLY.map((n, i) => <li key={n.path}><a href={`${BASE}${n.path}`}>{footerOnly[i]}</a></li>)}
                {MORE_PAGES.map((n) => <li key={n.path}><a href={`${BASE}${n.path}`}>{n.name}</a></li>)}
              </ul>
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
            <ul className="badges">
              <li><span className="badge-plate"><img src={asset("/logos/marks/uca.png")} alt="" width={48} height={48} loading="lazy" /></span><span>{APPROVED.accredited}</span></li>
              <li><span className="badge-plate"><img src={asset("/logos/marks/hcig.png")} alt="" width={50} height={48} loading="lazy" /></span><span>{APPROVED.partOf}</span></li>
            </ul>
            <span className="copy">&copy; {year} 24/7 Clinic. {THEIRS.rights} <span className="powered">Powered by Pulse Marketing</span></span>
          </div>
        </div>
      </div>
    </footer>
  );
}
