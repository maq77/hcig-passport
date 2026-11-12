/* FAQs (brief 28), at the live URL /faqs. The eleven questions, one open at a time,
   with FAQPage data for search and AI answers. */
import { section } from "@/content/load";
import { BRIEF } from "@/content/brief";
import { BASE } from "@/data/facts";
import { LinkButton, WaButton } from "@/components/ui/Buttons";
import { FaqList } from "@/components/home/FaqList";
import { Band, PageHero, pageMeta } from "@/components/page/Page";

const s = section("faq", "faq");
const home = section("home", "faq-home");
export const metadata = pageMeta(home.heading, home.body[0], "/faqs");

export default function Faqs() {
  const items = s.items.map((it) => ({ q: it.title, a: it.text ?? "" }));
  const ld = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({ "@type": "Question", name: it.q, acceptedAnswer: { "@type": "Answer", text: it.a } })),
  };
  return (
    <>
      <PageHero eyebrow="FAQ" title={home.heading} lead={home.body} img="/img/why-bedside.webp" pos="50% 50%" posM="62% 50%"
        trail={[{ name: "Home", path: "/" }, { name: "FAQs", path: "/faqs" }]}>
        <WaButton placement="faq-hero">{BRIEF.waUs}</WaButton>
      </PageHero>
      <Band id="f-list">
        <div className="pg-faq"><FaqList items={items} /></div>
        <div className="cta-row center mt-cta rv">
          <LinkButton href={`${BASE}/our-clinics`} placement="faq-page" ev="find_clinic_click">Find Your Nearest Clinic</LinkButton>
        </div>
      </Band>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </>
  );
}
