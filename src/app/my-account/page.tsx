import type { Metadata } from "next";
import { PageHeader } from "@/components/Sections";
import AccountForms from "@/components/AccountForms";
import { IMG } from "@/lib/data";

export const metadata: Metadata = { title: "My Account" };

export default function AccountPage() {
  return (
    <>
      <PageHeader title="My Account" crumb="My Account" image={IMG.hero[2]} />
      <section className="section">
        <div className="container">
          <AccountForms />
        </div>
      </section>
    </>
  );
}
