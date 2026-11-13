import type { Metadata } from "next";
import { PageHeader } from "@/components/Sections";
import { IMG, site } from "@/lib/data";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: `Terms and Conditions for ${site.name}.`,
};

export default function TermsPage() {
  return (
    <>
      <PageHeader title="Terms & Conditions" crumb="Terms" image={IMG.hero[1]} />
      <section className="section">
        <div className="container" style={{ maxWidth: 820 }}>
          <div className="account-card" style={{ display: "grid", gap: 18, lineHeight: 1.8 }}>
            <h2>1. General</h2>
            <p>
              By accessing or purchasing from {site.name}, you agree to be bound by these Terms
              and Conditions. All products, plywood sheets, laminates, and custom furniture are
              subject to availability.
            </p>

            <h2>2. Pricing &amp; Taxes</h2>
            <p>
              All prices are listed in Indian Rupees (INR). Applicable shipping charges, discounts,
              and GST/tax (if enabled) are calculated at checkout prior to payment confirmation.
            </p>

            <h2>3. Custom Dimensions &amp; Wood Grain</h2>
            <p>
              Natural timber and veneer products carry unique grain and shade variations. Custom
              cut-to-size or made-to-measure orders require confirmation before production begins.
            </p>

            <h2>4. Orders &amp; Cancellations</h2>
            <p>
              Orders are confirmed once payment is verified (for online payments) or upon order
              acceptance (for Cash on Delivery). We reserve the right to cancel orders in case of
              pricing errors or stock unavailability, with a full refund of any paid amount.
            </p>

            <h2>5. Contact</h2>
            <p>
              {site.name} · {site.address} · Phone: {site.phone}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

