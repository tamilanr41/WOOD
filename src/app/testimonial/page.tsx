import type { Metadata } from "next";
import {
  PageHeader,
  TestimonialsSection,
  LogosRow,
  AppointmentSection,
} from "@/components/Sections";
import { IMG } from "@/lib/data";

export const metadata: Metadata = { title: "Testimonials" };

export default function TestimonialsPage() {
  return (
    <>
      <PageHeader
        title="Testimonials"
        crumb="Testimonials"
        image={IMG.hero[3]}
      />
      <TestimonialsSection />
      <LogosRow />
      <AppointmentSection />
    </>
  );
}
