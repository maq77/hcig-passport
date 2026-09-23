import { Facilities, FinalCta, Finder, Hero, HotelBand, HowItWorks, Insurance, Intro, Posts, Services, Stories, WhyHotel } from "@/components/home/Sections";
import { WA_MESSAGES } from "@/lib/wa";
import layout from "@/content/home-layout.json";
import "./editor-overrides.css";
import "./theme-overrides.css";
import dynamic from 'next/dynamic';
import React from 'react';

const EditorOverlay = process.env.NODE_ENV === 'development'
  ? dynamic(() => import('@/components/editor/EditorOverlay'))
  : () => null;

const Block = dynamic(() => import('@/components/editor/Block'));

const sectionMap: Record<string, React.FC<any>> = {
  Hero, Facilities, Intro, WhyHotel, Services, Insurance, HowItWorks, Stories, Posts, HotelBand, Finder, FinalCta
};

export default function Home() {
  return (
    <>
      {process.env.NODE_ENV === 'development' && <EditorOverlay />}
      {(layout as any).order.filter((name: string) => !(layout as any).hidden.includes(name)).map((name: string, idx: number) => {
        const Comp = sectionMap[name];
        const style = ((layout as any).styles && (layout as any).styles[name]) || {};
        if (Comp) return (
          <div key={idx} style={style as any} data-e-section={name}>
            <Comp insuranceMessage={name === 'Insurance' ? WA_MESSAGES.insurance : undefined} />
          </div>
        );
        return (
          <div key={idx} style={style as any} data-e-section={name}>
            <Block name={name} />
          </div>
        );
      })}
    </>
  );
}
