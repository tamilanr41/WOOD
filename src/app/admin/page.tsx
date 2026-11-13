import type { Metadata } from "next";
import { PageHeader } from "@/components/Sections";
import AdminDashboard from "@/components/AdminDashboard";
import { IMG } from "@/lib/data";

export const metadata: Metadata = { title: "Admin Dashboard" };

export default function AdminPage() {
  return (
    <>
      <PageHeader title="Admin Dashboard" crumb="Admin" image={IMG.hero[1]} />
      <section className="section">
        <div className="container">
          <AdminDashboard />
        </div>
      </section>
    </>
  );
}

