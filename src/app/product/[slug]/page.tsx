import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader, LogosRow } from "@/components/Sections";
import ProductGallery from "@/components/ProductGallery";
import ProductCard from "@/components/ProductCard";
import ProductReviews from "@/components/ProductReviews";
import AddToCart from "@/components/AddToCart";
import { IMG } from "@/lib/data";
import { getCatalogProductBySlug, getCatalogProducts } from "@/lib/seed";
import { money } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getCatalogProductBySlug(slug);
  return {
    title: product ? product.title : "Product",
    description: product?.description,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [product, { products }] = await Promise.all([
    getCatalogProductBySlug(slug),
    getCatalogProducts(),
  ]);

  if (!product) notFound();

  const gallery =
    product.gallery && product.gallery.length > 0
      ? product.gallery
      : [product.image, IMG.shop[0], IMG.shop[4], IMG.shop[2]];
  const related = products
    .filter((p) => p.slug !== product.slug && p.category === product.category)
    .slice(0, 3);
  const fallback = products.filter((p) => p.slug !== product.slug).slice(0, 3);
  const suggestions = related.length ? related : fallback;

  const stock = product.stock ?? 20;
  const hasSale =
    product.salePrice != null &&
    product.salePrice > 0 &&
    product.salePrice < product.price;
  const activePrice = hasSale ? product.salePrice! : product.price;
  const unitSuffix =
    product.unit && product.unit !== "item" ? ` per ${product.unit}` : "";

  return (
    <>
      <PageHeader title={product.title} crumb="Shop" image={IMG.hero[2]} />

      <section className="section">
        <div className="container">
          <div className="product-detail">
            <ProductGallery images={gallery} title={product.title} />

            <div className="product-info">
              <span className="product-card__cat">
                {product.category}
                {product.brand ? ` · ${product.brand}` : ""}
              </span>
              <h1>{product.title}</h1>
              <div className="product-info__price">
                {hasSale && (
                  <span
                    style={{
                      textDecoration: "line-through",
                      color: "#8a8c88",
                      fontSize: "0.75em",
                      marginRight: 10,
                    }}
                  >
                    {money(product.price)}
                  </span>
                )}
                {money(activePrice)}
                {unitSuffix && (
                  <span style={{ fontSize: "0.55em", color: "#6d6f6c" }}>
                    {unitSuffix}
                  </span>
                )}
              </div>
              <p
                style={{
                  fontSize: 13.5,
                  marginBottom: 14,
                  color: stock > 0 ? "#2e6f40" : "#b42318",
                  fontWeight: 600,
                }}
              >
                {stock > 0 ? `In stock (${stock} available)` : "Out of stock"}
                {product.sku ? ` · SKU: ${product.sku}` : ""}
              </p>
              <p className="product-info__desc">{product.description}</p>

              <AddToCart product={product} />

              {/* Specifications Table */}
              <div
                style={{
                  marginTop: 28,
                  padding: 16,
                  background: "var(--gray-light)",
                  border: "1px solid var(--border)",
                  fontSize: 13.5,
                  display: "grid",
                  gap: 6,
                }}
              >
                {product.material && (
                  <div>
                    <strong>Material:</strong> {product.material}
                  </div>
                )}
                {product.thickness && (
                  <div>
                    <strong>Thickness:</strong> {product.thickness}
                  </div>
                )}
                {product.dimensions && (
                  <div>
                    <strong>Dimensions:</strong> {product.dimensions}
                  </div>
                )}
                {product.finish && (
                  <div>
                    <strong>Finish:</strong> {product.finish}
                  </div>
                )}
                <div>
                  <strong>Warranty:</strong> {product.warranty || "2 Years"}
                </div>
                <div>
                  <strong>Estimated Delivery:</strong>{" "}
                  {product.deliveryEstimate || "3–5 business days"}
                </div>
              </div>

              <div style={{ marginTop: 18 }}>
                <Link
                  href="/contacts"
                  className="link-arrow"
                  style={{ fontSize: 14 }}
                >
                  Need bulk pricing or custom dimensions? Request a quote
                </Link>
              </div>
            </div>
          </div>

          <ProductReviews productSlug={product.slug} />
        </div>
      </section>

      <section className="section section--cream">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">You may also like</span>
              <h2 className="h2">Related Products</h2>
            </div>
            <Link href="/shop" className="link-arrow">
              Shop all products
            </Link>
          </div>
          <div className="products-grid">
            {suggestions.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </div>
      </section>

      <LogosRow />
    </>
  );
}
