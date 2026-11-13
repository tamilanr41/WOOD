import type { Metadata } from "next";
import {
  PageHeader,
  AboutSection,
  StatsRow,
  TestimonialsSection,
  LogosRow,
  Newsletter,
} from "@/components/Sections";
import GalleryGrid from "@/components/GalleryGrid";
import { IMG } from "@/lib/data";

export const metadata: Metadata = { title: "About Us" };

export default function AboutPage() {
  return (
    <>
      <PageHeader title="About Us" crumb="About Us" image={IMG.aboutAlt[0]} />

      <AboutSection images={IMG.aboutAlt} />

      <section className="section section--cream">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Our work</span>
              <h2 className="h2">
                A collection of handcrafted wooden pieces highlighting our
                mastery and unique craftsmanship
              </h2>
            </div>
          </div>
          <GalleryGrid columns={3} />
        </div>
      </section>

      <StatsRow />
      <TestimonialsSection />
      <LogosRow />
      <Newsletter />
    </>
  );
}
