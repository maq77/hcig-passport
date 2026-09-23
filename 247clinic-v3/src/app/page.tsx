import { Facilities, FinalCta, Finder, Hero, HotelBand, HowItWorks, Insurance, Intro, Posts, Services, Stories, WhyHotel } from "@/components/home/Sections";
import { WA_MESSAGES } from "@/lib/wa";

/* Home, round 2 (the user's notes, 2026-09-23): image hero, the film in its own
   facilities and accreditation section, posts from their site, Find a Clinic on
   Google Maps near the end, the final call to action over a photograph. */
export default function Home() {
  return (
    <>
      <Hero />
      <Facilities />
      <Intro />
      <WhyHotel />
      <Services />
      <Insurance insuranceMessage={WA_MESSAGES.insurance} />
      <HowItWorks />
      <Stories />
      <Posts />
      <HotelBand />
      <Finder />
      <FinalCta />
    </>
  );
}
