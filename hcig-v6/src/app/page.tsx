// The home, in the live site's order (owner, 2026-10-26), with the maritime block and the CEO quote added.
import { HeroB } from "@/components/home/HeroB";
import { About } from "@/components/home/About";
import { Premises } from "@/components/home/Premises";
import { Built, MissionVision, OurHealthcare, SystemWorks, Why } from "@/components/home/Middle";
import { CeoQuote, ClosingBand, Impact, Insurers, Maritime, Testimonials, WhoWeWorkWith } from "@/components/home/Lower";
import { ContactSheet, Footer } from "@/components/home/Footer";

export default function Home() {
  return (
    <>
      <HeroB />
      <main id="main">
        <About />
        <Premises />
        <MissionVision />
        <Why />
        <Built />
        <SystemWorks />
        <OurHealthcare />
        <Maritime />
        <Testimonials />
        <CeoQuote />
        <Insurers />
        <WhoWeWorkWith />
        <Impact />
        <ClosingBand />
      </main>
      <Footer />
      <ContactSheet />
    </>
  );
}
