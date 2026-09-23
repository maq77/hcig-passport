import { asset, BASE } from "@/data/facts";
import { FOOTER_ONLY, NAV } from "@/data/nav";
import { CallButton, WaButton } from "@/components/ui/Buttons";

export function Footer({ nav, footerOnly, message, waLabel }: { nav: string[]; footerOnly: string[]; message: string; waLabel: string }) {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="foot">
          <div className="brand">
            <img src={asset("/logos/marks/247-logo.svg")} alt="24/7 Clinic" width={66} height={64} />
            <p>{message}</p>
            <div className="cta-row">
              <WaButton placement="footer" small>{waLabel}</WaButton>
              <CallButton placement="footer" small />
            </div>
          </div>
          <nav aria-label="Footer">
            <h4>Menu</h4>
            <ul>{NAV.map((n, i) => <li key={n.path}><a href={`${BASE}${n.path}`}>{nav[i]}</a></li>)}</ul>
          </nav>
          <div>
            <h4>More</h4>
            <ul>{FOOTER_ONLY.map((n, i) => <li key={n.path}><a href={`${BASE}${n.path}`}>{footerOnly[i]}</a></li>)}</ul>
          </div>
          <div>
            <h4>Accreditation</h4>
            <div className="marks">
              <img src={asset("/logos/marks/uca.png")} alt="Urgent Care Association" width={64} height={64} loading="lazy" />
              <img src={asset("/logos/marks/hcig.png")} alt="Healthcare International Group" width={67} height={64} loading="lazy" />
            </div>
          </div>
        </div>
        <div className="foot-base">
          <span>&copy; {year} 24/7 Clinic</span>
        </div>
      </div>
    </footer>
  );
}
