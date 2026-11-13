import type { Metadata } from "next";
import { PageHeader } from "@/components/Sections";
import { IMG, site } from "@/lib/data";

export const metadata: Metadata = {
  title: "Shipping & Refund Policy",
  description: `Shipping, Cancellation, Return and Refund Policy for ${site.name}.`,
};

export default function RefundPolicyPage() {
  return (
    <>
      <PageHeader
        title="Shipping & Refund Policy"
        crumb="Shipping & Refunds"
        image={IMG.hero[2]}
      />
      <section className="section">
        <div className="container" style={{ maxWidth: 820 }}>
          <div className="account-card" style={{ display: "grid", gap: 18, lineHeight: 1.8 }}>
            <h2>1. Shipping &amp; Delivery</h2>
            <p>
              Standard orders are dispatched within 3–5 business days across our serviceable
              delivery zones. Store pickup is available free of charge from our Erode showroom
              during business hours ({site.workHours}).
            </p>

            <h2>2. Order Cancellation</h2>
            <p>
              You may cancel an order directly from your My Account dashboard while its status is
              still <strong>Pending</strong> or <strong>Paid</strong> (before processing/dispatch).
              Once shipped, cancellations cannot be processed online.
            </p>

            <h2>3. Returns &amp; Damaged Goods</h2>
            <p>
              If an item arrives damaged or defective, you can submit a Return Request from your
              account after delivery within 7 days. Custom-cut plywood or made-to-order furniture
              is eligible for return only in case of manufacturing defect or transit damage.
            </p>

            <h2>4. Refunds</h2>
            <p>
              Approved refunds for prepaid Razorpay orders are processed back to the original
              payment method within 5–7 business days after inspection.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

