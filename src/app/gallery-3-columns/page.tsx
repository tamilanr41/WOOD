import type { Metadata } from "next";
import { PageHeader, LogosRow } from "@/components/Sections";
import GalleryGrid from "@/components/GalleryGrid";
import { IMG } from "@/lib/data";

export const metadata: Metadata = { title: "Gallery — 3 Columns" };

export default function GalleryThreePage() {
  return (
    <>
      <PageHeader title="Gallery 3 Columns" crumb="Gallery" image={IMG.gallery[1]} />
      <section className="section">
        <div className="container">
          <GalleryGrid columns={3} />
        </div>
      </section>
      <LogosRow />
    </>
  );
}
