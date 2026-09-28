"use client";

import Reveal from "./Reveal";

export default function GlobalHubs() {
  return (
    <section className="footer" id="offices" style={{ paddingBottom: 20 }}>
      <div className="footer-content">
        <Reveal>
          <h2 className="headline-titling center" style={{ color: "var(--tmasi-white)", textAlign: "center", marginBottom: 40, fontSize: 34 }}>
            Global Operational Hubs
          </h2>
        </Reveal>

        <Reveal delay={0.08} className="offices-grid">
          <div className="office-card">
            <div className="office-country">Egypt (HQ)</div>
            <div className="office-address">Airport Road, Hurghada, Red Sea, Egypt.</div>
            <div className="office-contact">
              <a href="tel:+201206788566">+20 120 678 8566</a>
              <a href="mailto:egypt@tmasi.net">egypt@tmasi.net</a>
            </div>
          </div>

          <div className="office-card">
            <div className="office-country">Germany</div>
            <div className="office-address">LeopoldstraÃŸe 244, Munich, Germany, 80807</div>
            <div className="office-contact">
              <a href="tel:+491709350490">+49 170 9350490</a>
              <a href="mailto:germany@tmasi.net">germany@tmasi.net</a>
            </div>
          </div>

          <div className="office-card">
            <div className="office-country">United Arab Emirates</div>
            <div className="office-address">Dubai, United Arab Emirates</div>
            <div className="office-contact">
              <a href="tel:+971586824247">+971 586 824 247</a>
              <a href="mailto:uae@tmasi.net">uae@tmasi.net</a>
            </div>
          </div>

          <div className="office-card">
            <div className="office-country">Spain</div>
            <div className="office-address">Barcelona, Spain</div>
            <div className="office-contact">
              <a href="tel:+34930414953">+34 930 414 953</a>
              <a href="mailto:spain@tmasi.net">spain@tmasi.net</a>
            </div>
          </div>

          <div className="office-card">
            <div className="office-country">United States</div>
            <div className="office-address">Florida, USA</div>
            <div className="office-contact">
              <a href="tel:+17275919010">+1 727 591 9010</a>
              <a href="mailto:info@tmasi.net">info@tmasi.net</a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
