import type { Metadata } from "next";
import HeroSlider from "@/components/HeroSlider";
import {
  AboutSection,
  ServicesSection,
  MastersSection,
  TestimonialsSection,
  VideoBanner,
  LogosRow,
  AppointmentSection,
} from "@/components/Sections";
import { IMG } from "@/lib/data";

export const metadata: Metadata = { title: "Home Forestry" };

const slides = [
  {
    image: IMG.hero[1],
    eyebrow: "Sustainable forestry and responsible harvesting",
    title: "Forestry and Timber Services",
  },
  {
    image: IMG.hero[3],
    eyebrow: "From the forest to the finished build",
    title: "Forestry and Timber Services",
  },
];

export default function HomeForestryPage() {
  return (
    <>
      <HeroSlider
        slides={slides}
        title="Forestry and Timber Services"
        eyebrow="Sustainable forestry and responsible harvesting"
      />
      <AboutSection images={IMG.aboutAlt} />
      <ServicesSection
        eyebrow="Forestry and wood production"
        title="Timber for a Better Tomorrow"
      />
      <MastersSection />
      <TestimonialsSection />
      <VideoBanner image={IMG.hero[1]} />
      <LogosRow />
      <AppointmentSection />
    </>
  );
}
