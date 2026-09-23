import { Accreditation, FinalCta, Finder, Hero, HotelBand, HowItWorks, Insurance, Intro, Services, Stories, WhyHotel } from "@/components/home/Sections";
import { WA_MESSAGES } from "@/lib/wa";

/* Home, in spec FR-007 order (brief section 6, Find a Clinic and numbers at the end). */
export default function Home() {
  return (
    <>
      <Hero />
      <Accreditation />
      <Intro />
      <WhyHotel />
      <Services />
      <Insurance insuranceMessage={WA_MESSAGES.insurance} />
      <HowItWorks />
      <Stories />
      <HotelBand />
      <Finder />
      <FinalCta />
    </>
  );
}
