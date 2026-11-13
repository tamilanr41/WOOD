import type { Metadata } from "next";
import { PageHeader } from "@/components/Sections";
import CartView from "@/components/CartView";
import { IMG } from "@/lib/data";

export const metadata: Metadata = { title: "Cart" };

export default function CartPage() {
  return (
    <>
      <PageHeader title="Cart" crumb="Cart" image={IMG.hero[1]} />
      <section className="section">
        <div className="container">
          <CartView />
        </div>
      </section>
    </>
  );
}
