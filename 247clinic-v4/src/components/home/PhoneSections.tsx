/* The phone layout of On-site care, How it works and Insurance (the owner's pick, 2026-11-17: Set 1 for the first
   two, Set 2 for Insurance, which marketing asked to keep off black). Phones only (.pm-m, hidden from 768px);
   desktop keeps its own sections untouched. The shortened phone lines are logged in
   content/247clinic/approved-edits.json (kind "trim", 2026-11-17); a title with no short line keeps its full text. */
import { Hospital, House, Stethoscope } from "lucide-react";
import { section } from "@/content/load";
import { BRIEF } from "@/content/brief";
import { asset } from "@/data/facts";
import { INSURERS, INTRO, PHOTOS } from "@/data/media";
import { WaButton } from "@/components/ui/Buttons";
import { Head } from "@/components/ui/Bits";
import { Watch } from "@/components/ui/Viewer";
import { Marquee } from "@/components/ui/Marquee";
import { ChatSteps, Scene, Sweep } from "./PhoneMotion";

const SHORT: Record<string, string> = {
  "Inside Your Resort": "Care is already where you are staying.",
  "Treated On-Site": "Consultation, diagnostics and treatment close to your room.",
  "Hospital Only When Needed": "Our team arranges the right hospital, ambulance or next medical step.",
  "We Arrange Your Medical Visit": "If your hotel has a 24/7 Clinic, we direct you there. If not, we promptly send our agent to pick you up.",
  "We Check Your Insurance": "Where applicable, we coordinate directly with your insurer.",
};
const short = (title: string, text: string | null) => SHORT[title] ?? text;
const v = (name: string, n: number) => ({ [`--${name}` as string]: n });

/* A ring that draws itself around each point's icon, then fills. */
function Ring({ children }: { children: React.ReactNode }) {
  return (
    <span className="pm-ic" aria-hidden="true">
      <span className="pm-ic-bg" />
      <svg className="pm-ring" viewBox="0 0 48 48"><circle cx="24" cy="24" r="23.5" pathLength={1} /></svg>
      <span className="pm-ic-g">{children}</span>
    </span>
  );
}

const CARE_ICONS = [House, Stethoscope, Hospital];
export function CarePhone() {
  const s = section("home", "what-is-247-clinic");
  const words = (s.body[0] ?? "").split(" ");
  return (
    <section className="section pm-m pm-care" aria-labelledby="intro-m-h">
      <div className="container">
        <Head eyebrow="On-site care" id="intro-m-h" title={s.heading} />
        <Scene className="pm-care-scene">
          <div className="pm-photos">
            <div className="pm-main pm-ph">
              <img src={asset(PHOTOS.why.src)} alt="" width={PHOTOS.why.w} height={PHOTOS.why.h} loading="lazy" />
              <Watch src={INTRO.full} label="Watch video" />
            </div>
            <div className="pm-inset">
              <span className="pm-ph"><img src={asset(PHOTOS.whyResort.src)} alt="" width={PHOTOS.whyResort.w} height={PHOTOS.whyResort.h} loading="lazy" /></span>
            </div>
          </div>
          <p className="pm-line">
            {words.map((w, i) => <span key={i}><span className="pm-w"><span style={v("i", i)}>{w}</span></span>{i < words.length - 1 ? " " : null}</span>)}
          </p>
          <ul className="pm-pts">
            {s.items.map((it, i) => {
              const Ico = CARE_ICONS[i] ?? House;
              return (
                <li key={it.title} className="pm-pt" style={v("i", i)}>
                  <Ring><Ico size={20} strokeWidth={1.25} /></Ring>
                  <div><h3>{it.title}</h3>{it.text && <p>{short(it.title, it.text)}</p>}</div>
                </li>
              );
            })}
          </ul>
        </Scene>
      </div>
    </section>
  );
}

export function HowPhone() {
  const how = section("home", "how-it-works");
  return (
    <section className="section pm-m pm-how" aria-labelledby="how-m-h">
      <div className="container">
        <Head eyebrow="How it works" id="how-m-h" title={how.heading} />
        <ChatSteps steps={how.items.map((it) => ({ title: it.title, text: short(it.title, it.text) }))}
          mark={asset("/logos/marks/247-mark.svg")} labels={{ you: "You", clinic: "24/7 Clinic", play: "Play" }}>
          <WaButton placement="section-how-it-works" block>{how.ctas[0]?.label}</WaButton>
        </ChatSteps>
      </div>
    </section>
  );
}

export function InsurancePhone() {
  const s = section("home", "insurance-cashless-care");
  return (
    <section className="section pm-m pm-ins" aria-labelledby="ins-m-h">
      <div className="container">
        <Head eyebrow="Insurance & cashless" id="ins-m-h" title={s.heading} />
      </div>
      <Scene className="pm-ins-scene">
        <div className="pm-strip">
          <Marquee label={BRIEF.insurancePartners} speed={14} gap={10}>
            {INSURERS.map((l, i) => (
              <li key={l.name} className="pm-logo" style={v("i", i)}><img src={asset(l.src)} alt={l.name} width={l.w} height={l.h} loading="lazy" /></li>
            ))}
          </Marquee>
        </div>
        <div className="container">
          <div className="pm-ins-card">
            <p className="pm-ins-sub">{s.subheading}</p>
            <ol className="pm-chks">
              {s.items.map((it, i) => (
                <li key={it.title} className="pm-chk" style={v("i", i)}>
                  <span className="pm-tk" aria-hidden="true">
                    <svg viewBox="0 0 28 28" width="28" height="28"><circle cx="14" cy="14" r="14" /><path d="m8.4 14.6 3.8 3.8 7.6-8.4" pathLength={1} /></svg>
                  </span>
                  <div><h3>{it.title}</h3>{it.text && <p>{it.text}</p>}</div>
                </li>
              ))}
            </ol>
            <p className="pm-cash">{s.body[0]}</p>
          </div>
          <Sweep><WaButton placement="section-insurance" ctx="insurance" block>{s.ctas[0]?.label}</WaButton></Sweep>
        </div>
      </Scene>
    </section>
  );
}
