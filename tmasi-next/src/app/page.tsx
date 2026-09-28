import Header from "@/components/Header";
import Hero from "@/components/Hero";
import About from "@/components/About";
import RelaxBanner from "@/components/RelaxBanner";
import CoreValues from "@/components/CoreValues";
import MissionVision from "@/components/MissionVision";
import WhyChoose from "@/components/WhyChoose";
import Services from "@/components/Services";
import QuoteSection from "@/components/QuoteSection";
import WorldMap from "@/components/WorldMap";
import Blog from "@/components/Blog";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <About />
        <RelaxBanner />
        <CoreValues />
        <MissionVision />
        <WhyChoose />
        <Services />
        <QuoteSection />
        <WorldMap />
        <Blog />
      </main>
      <Footer />
    </>
  );
}
