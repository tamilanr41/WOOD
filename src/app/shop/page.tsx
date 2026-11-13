import type { Metadata } from "next";
import { PageHeader, LogosRow } from "@/components/Sections";
import ShopView from "@/components/ShopView";
import { IMG } from "@/lib/data";
import { getCatalogProducts } from "@/lib/seed";

export const metadata: Metadata = { title: "Shop" };
export const dynamic = "force-dynamic";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const params = await searchParams;
  const { products } = await getCatalogProducts();

  return (
    <>
      <PageHeader title="Shop" crumb="Shop" image={IMG.hero[2]} />
      <section className="section">
        <div className="container">
          <ShopView
            initialProducts={products}
            initialQuery={params.q ?? ""}
            initialCategory={params.category ?? "All"}
          />
        </div>
      </section>
      <LogosRow />
    </>
  );
}
