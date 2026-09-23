import { Facilities, FinalCta, Finder, Hero, HotelBand, HowItWorks, Insurance, Intro, Posts, Services, Stories, WhyHotel } from "@/components/home/Sections";
import { WA_MESSAGES } from "@/lib/wa";

/* Home order, rebuilt as an argument (the user, 2026-09-23: "services must be at top
   ... high standards and then our services ... logical building up to convince patients").
   Each section answers the next question a guest has before messaging on WhatsApp:
   what is this, can I trust it, what do you treat, why here, how do I start, who pays,
   who else used it, where are you. Find a Clinic stays last before the final call
   (his rule of 2026-09-19). */
export default function Home() {
  return (
    <>
      <Hero />
      <HotelBand />
      <Facilities />
      <Services />
      <Intro />
      <WhyHotel />
      <HowItWorks />
      <Insurance insuranceMessage={WA_MESSAGES.insurance} />
      <Stories />
      <Posts />
      <Finder />
      <FinalCta />
    </>
  );
}
