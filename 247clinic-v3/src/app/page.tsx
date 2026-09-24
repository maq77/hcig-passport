import { Facilities, FinalCta, Finder, Hero, HotelBand, HowItWorks, Insurance, Intro, Posts, Services, Stories, WhyHotel } from "@/components/home/Sections";
import { WA_MESSAGES } from "@/lib/wa";
import layout from "@/content/home-layout.json";
import Block from "@/components/editor/Block";
import dynamic from "next/dynamic";
import type { CSSProperties, FC } from "react";
import "./editor-overrides.css";
import "./theme-overrides.css";

/* Home order, rebuilt as an argument (the user, 2026-09-23: "services must be at top
   ... high standards and then our services ... logical building up to convince patients").
   Each section answers the next question a guest has before messaging on WhatsApp:
   what is this, can I trust it, what do you treat, why here, how do I start, who pays,
   who else used it, where are you. Find a Clinic stays last before the final call
   (his rule of 2026-09-19).
   The order, hidden sections, spacing and added blocks live in home-layout.json, which
   the dev-only editor writes (npm run edit, then ?edit=1). Production builds strip it. */
/* In development hidden sections still render (with the hidden attribute) so the
   editor can bring one back live. Production leaves them out. */
const DEV = process.env.NODE_ENV === "development";
const EditorOverlay = process.env.NODE_ENV === "development"
  ? dynamic(() => import("@/components/editor/EditorOverlay"))
  : () => null;

const SECTIONS: Record<string, FC> = {
  Hero, HotelBand, Facilities, Services, Intro, WhyHotel, HowItWorks,
  Insurance: () => <Insurance insuranceMessage={WA_MESSAGES.insurance} />,
  Stories, Posts, Finder, FinalCta,
};

type Layout = {
  order: string[];
  hidden: string[];
  styles?: Record<string, Record<string, string>>;
  blocks?: Record<string, Record<string, string>>;
};
const L = layout as Layout;

export default function Home() {
  return (
    <>
      {DEV && <EditorOverlay />}
      {L.order.filter((name) => DEV || !L.hidden.includes(name)).map((name) => {
        const Comp = SECTIONS[name];
        return (
          <div key={name} data-e-section={name} hidden={L.hidden.includes(name) || undefined} style={L.styles?.[name] as CSSProperties | undefined}>
            {Comp ? <Comp /> : <Block name={name} content={L.blocks?.[name] ?? {}} />}
          </div>
        );
      })}
    </>
  );
}
