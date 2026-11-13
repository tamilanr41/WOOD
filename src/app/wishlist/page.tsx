import type { Metadata } from "next";
import { PageHeader } from "@/components/Sections";
import WishlistItems from "@/components/WishlistItems";
import { IMG } from "@/lib/data";

export const metadata: Metadata = { title: "Wishlist" };

export default function WishlistPage() {
  return (
    <>
      <PageHeader title="Wishlist" crumb="Wishlist" image={IMG.hero[2]} />
      <section className="section">
        <div className="container">
          <WishlistItems />
        </div>
      </section>
    </>
  );
}

