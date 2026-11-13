"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import type { CatalogProduct } from "@/lib/seed";
import { money } from "@/lib/format";

export default function WishlistItems({
  compact = false,
}: {
  compact?: boolean;
}) {
  const { wishlist, toggleWishlist, add, ready } = useCart();
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!ready || wishlist.length === 0) return;
    let cancelled = false;
    setLoading(true);
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data?.ok && Array.isArray(data.products)) {
          setProducts(data.products);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [ready, wishlist.length]);

  const bySlug = useMemo(() => {
    const map = new Map<string, CatalogProduct>();
    for (const p of products) {
      map.set(p.slug, p);
    }
    return map;
  }, [products]);

  if (!ready || (loading && products.length === 0)) {
    return (
      <div style={{ padding: "24px 0", color: "#6d6f6c" }}>
        Loading your wishlist…
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="empty-state" style={{ padding: compact ? "24px 12px" : undefined }}>
        <h3>Your wishlist is empty</h3>
        <p style={{ margin: "10px 0 22px", color: "#6d6f6c" }}>
          Save your favourite plywood, timber, veneers, and interior materials here.
        </p>
        <Link href="/shop" className="btn">
          Browse Shop
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 22,
        }}
      >
        <p style={{ color: "#6d6f6c", margin: 0 }}>
          {wishlist.length} saved {wishlist.length === 1 ? "item" : "items"}
        </p>
        <Link href="/shop" className="btn btn--sm btn--outline">
          Continue Shopping
        </Link>
      </div>

      <div
        className="products-grid"
        style={
          compact
            ? { gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 18 }
            : undefined
        }
      >
        {wishlist.map((slug) => {
          const product = bySlug.get(slug);
          if (!product) {
            return (
              <article key={slug} className="product-card">
                <div className="product-card__body">
                  <span className="product-card__cat">Saved Item</span>
                  <Link href={`/product/${slug}`} className="product-card__title">
                    {slug.replace(/-/g, " ")}
                  </Link>
                  <div
                    className="product-card__actions"
                    style={{ display: "flex", gap: 8, alignItems: "center" }}
                  >
                    <Link href={`/product/${slug}`} className="btn btn--sm">
                      View
                    </Link>
                    <button
                      type="button"
                      className="btn btn--sm btn--outline"
                      onClick={() => toggleWishlist(slug)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </article>
            );
          }

          const hasSale =
            product.salePrice != null &&
            product.salePrice > 0 &&
            product.salePrice < product.price;
          const displayPrice = hasSale ? product.salePrice! : product.price;
          const unitSuffix =
            product.unit && product.unit !== "item" ? ` / ${product.unit}` : "";
          const outOfStock = (product.stock ?? 20) <= 0;

          return (
            <article key={slug} className="product-card">
              <Link
                href={`/product/${product.slug}`}
                className="product-card__media"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={product.image} alt={product.title} />
              </Link>
              <div className="product-card__body">
                <span className="product-card__cat">{product.category}</span>
                <Link
                  href={`/product/${product.slug}`}
                  className="product-card__title"
                >
                  {product.title}
                </Link>
                <div className="product-card__price">
                  {hasSale && (
                    <span
                      style={{
                        textDecoration: "line-through",
                        color: "#8a8c88",
                        marginRight: 8,
                        fontSize: "0.85em",
                      }}
                    >
                      {money(product.price)}
                    </span>
                  )}
                  <span>
                    {money(displayPrice)}
                    {unitSuffix}
                  </span>
                </div>
                <div
                  className="product-card__actions"
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    type="button"
                    className="btn btn--sm"
                    disabled={outOfStock}
                    onClick={() => add(product)}
                  >
                    {outOfStock ? "Out of stock" : "Add to cart"}
                  </button>
                  <button
                    type="button"
                    className="btn btn--sm btn--outline"
                    onClick={() => toggleWishlist(slug)}
                    aria-label="Remove from wishlist"
                    title="Remove from wishlist"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

