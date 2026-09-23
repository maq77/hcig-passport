import { WaButton } from "@/components/ui/Buttons";
import { BRIEF } from "@/content/brief";
import { BASE } from "@/data/facts";

/* A real 404. It still offers help first. */
export default function NotFound() {
  return (
    <section className="section" style={{ paddingTop: "calc(var(--header-h) + 96px)", minHeight: "70vh" }}>
      <div className="container stack" style={{ alignItems: "flex-start", maxWidth: 760 }}>
        <span className="eyebrow">404</span>
        <h1 className="h2">{BRIEF.needHelp}</h1>
        <div className="cta-row">
          <WaButton placement="404">{BRIEF.waUs}</WaButton>
          <a className="btn btn-secondary" href={`${BASE}/`}>24/7 Clinic</a>
        </div>
      </div>
    </section>
  );
}
