import type { Metadata } from "next";
import { PageHeader, LogosRow } from "@/components/Sections";
import GalleryGrid from "@/components/GalleryGrid";
import { IMG } from "@/lib/data";

export const metadata: Metadata = { title: "Gallery — 4 Columns" };

export default function GalleryFourPage() {
  return (
    <>
      <PageHeader title="Gallery 4 Columns" crumb="Gallery" image={IMG.gallery[4]} />
      <section className="section">
        <div className="container">
          <GalleryGrid columns={4} />
        </div>
      </section>
      <LogosRow />
    </>
  );
}
