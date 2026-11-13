import type { Metadata } from "next";
import { PageHeader } from "@/components/Sections";
import { IMG, site } from "@/lib/data";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Privacy Policy for ${site.name}.`,
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageHeader title="Privacy Policy" crumb="Privacy Policy" image={IMG.hero[0]} />
      <section className="section">
        <div className="container" style={{ maxWidth: 820 }}>
          <div className="account-card" style={{ display: "grid", gap: 18, lineHeight: 1.8 }}>
            <h2>1. Information We Collect</h2>
            <p>
              When you browse {site.name}, create an account, place an order, or submit an
              appointment or contact inquiry, we collect the information you provide such as
              your name, email address, phone number, billing/delivery address, and order details.
            </p>

            <h2>2. How We Use Your Information</h2>
            <p>
              We use your information strictly to process and fulfill your orders, verify
              payments, provide customer support, send order updates (when opted in), and improve
              our catalog and carpentry services.
            </p>

            <h2>3. Payment Security</h2>
            <p>
              Online payments are processed through Razorpay. We do not store your credit/debit
              card numbers, CVV, or UPI PIN on our servers. All payment verifications are
              performed securely on the server.
            </p>

            <h2>4. Cookies &amp; Sessions</h2>
            <p>
              We use secure HTTP-only session cookies to keep you signed in and local storage to
              preserve your shopping cart and wishlist across visits.
            </p>

            <h2>5. Contact Us</h2>
            <p>
              For any privacy-related questions or data deletion requests, contact us at{" "}
              {site.phone} or visit us at {site.address}.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

