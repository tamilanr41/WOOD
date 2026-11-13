import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ScrollAnimations from "@/components/ScrollAnimations";
import { IMG, site } from "@/lib/data";

export const metadata: Metadata = {
  title: {
    default: `${site.name} — Plywoods, Furniture & Interiors`,
    template: `%s | ${site.name}`,
  },
  description:
    "Mariya Plywoods Furniture offers plywoods, laminates, furniture and home interior products in Erode, Tamil Nadu.",
  icons: {
    icon: IMG.favicon,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <ScrollAnimations />
          <SiteHeader transparent />
          <main>{children}</main>
          <SiteFooter />
        </CartProvider>
      </body>
    </html>
  );
}
