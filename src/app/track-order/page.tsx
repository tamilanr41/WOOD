import type { Metadata } from "next";
import { PageHeader } from "@/components/Sections";
import TrackOrderView from "@/components/TrackOrderView";
import { IMG } from "@/lib/data";

export const metadata: Metadata = { title: "Track Order" };

export default function TrackOrderPage() {
  return (
    <>
      <PageHeader title="Track Order" crumb="Track Order" image={IMG.hero[0]} />
      <section className="section">
        <div className="container">
          <TrackOrderView />
        </div>
      </section>
    </>
  );
}

