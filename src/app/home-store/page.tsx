import type { Metadata } from "next";
import Link from "next/link";
import HeroSlider from "@/components/HeroSlider";
import {
  ServicesSection,
  TestimonialsSection,
  LogosRow,
  Newsletter,
  AppointmentSection,
} from "@/components/Sections";
import ProductCard from "@/components/ProductCard";
import { IMG, products } from "@/lib/data";

export const metadata: Metadata = { title: "Home Store" };

const slides = [
  {
    image: IMG.hero[3],
    eyebrow: "Handcrafted timber products, delivered",
    title: "Mariya Plywoods Furniture Online Store",
  },
  {
    image: IMG.hero[0],
    eyebrow: "Furniture and joinery for every room",
    title: "Mariya Plywoods Furniture Online Store",
  },
];

export default function HomeStorePage() {
  return (
    <>
      <HeroSlider
        slides={slides}
        title="Mariya Plywoods Furniture Online Store"
        eyebrow="Handcrafted timber products, delivered"
        primaryHref="/shop"
      />

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Our shop</span>
              <h2 className="h2">Featured Products</h2>
            </div>
            <Link href="/shop" className="link-arrow">
              Shop all products
            </Link>
          </div>
          <div className="products-grid">
            {products.slice(0, 6).map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </div>
      </section>

      <ServicesSection eyebrow="Our store" title="Made for Your Home" />
      <TestimonialsSection />
      <LogosRow />
      <Newsletter />
      <AppointmentSection />
    </>
  );
}
