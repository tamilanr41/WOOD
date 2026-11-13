import type { Metadata } from "next";
import HeroSlider from "@/components/HeroSlider";
import {
  AboutSection,
  ServicesSection,
  PricingSection,
  MastersSection,
  VideoBanner,
  LogosRow,
  FaqSection,
  AppointmentSection,
} from "@/components/Sections";
import { IMG } from "@/lib/data";

export const metadata: Metadata = { title: "Home Woodworks" };

const slides = [
  {
    image: IMG.hero[2],
    eyebrow: "Craftsmanship in every joint",
    title: "Woodworks and Joinery Studio",
  },
  {
    image: IMG.hero[0],
    eyebrow: "Bespoke furniture, built to last",
    title: "Woodworks and Joinery Studio",
  },
];

export default function HomeWoodworksPage() {
  return (
    <>
      <HeroSlider
        slides={slides}
        title="Woodworks and Joinery Studio"
        eyebrow="Craftsmanship in every joint"
      />
      <AboutSection />
      <ServicesSection
        eyebrow="Our workshop"
        title="Woodworks Made to Measure"
      />
      <PricingSection />
      <MastersSection />
      <VideoBanner image={IMG.hero[2]} />
      <LogosRow />
      <FaqSection />
      <AppointmentSection />
    </>
  );
}
