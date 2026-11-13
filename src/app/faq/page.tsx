import type { Metadata } from "next";
import {
  PageHeader,
  FaqSection,
  AppointmentSection,
  LogosRow,
} from "@/components/Sections";
import { IMG } from "@/lib/data";

export const metadata: Metadata = { title: "FAQ" };

export default function FaqPage() {
  return (
    <>
      <PageHeader title="FAQ" crumb="FAQ" image={IMG.faq} />
      <FaqSection />
      <LogosRow />
      <AppointmentSection />
    </>
  );
}
