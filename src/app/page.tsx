import HeroSlider from "@/components/HeroSlider";
import {
  AboutSection,
  ServicesSection,
  PricingSection,
  MastersSection,
  TestimonialsSection,
  VideoBanner,
  LogosRow,
  FaqSection,
  AppointmentSection,
} from "@/components/Sections";
import { heroSlides } from "@/lib/data";

export default function HomePage() {
  return (
    <>
      <HeroSlider slides={heroSlides} />
      <AboutSection />
      <ServicesSection />
      <PricingSection />
      <MastersSection />
      <TestimonialsSection />
      <VideoBanner />
      <LogosRow />
      <FaqSection />
      <AppointmentSection />
    </>
  );
}
