import type { Metadata } from "next";
import { PageHeader } from "@/components/Sections";
import CheckoutView from "@/components/CheckoutView";
import { IMG } from "@/lib/data";

export const metadata: Metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return (
    <>
      <PageHeader title="Checkout" crumb="Checkout" image={IMG.hero[3]} />
      <section className="section">
        <div className="container">
          <CheckoutView />
        </div>
      </section>
    </>
  );
}
