"use client";

import Link from "next/link";
import type { CatalogProduct } from "@/lib/seed";
import { useCart } from "@/components/CartProvider";
import { money } from "@/lib/format";

export default function ProductCard({ product }: { product: CatalogProduct }) {
  const { add, toggleWishlist, isWishlisted } = useCart();
  const hasSale =
    product.salePrice != null &&
    product.salePrice > 0 &&
    product.salePrice < product.price;
  const displayPrice = hasSale ? product.salePrice! : product.price;
  const unitSuffix =
    product.unit && product.unit !== "item" ? ` / ${product.unit}` : "";
  const wished = isWishlisted(product.slug);

  return (
    <article className="product-card">
      <Link href={`/product/${product.slug}`} className="product-card__media">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={product.image} alt={product.title} />
      </Link>
      <div className="product-card__body">
        <span className="product-card__cat">{product.category}</span>
        <Link href={`/product/${product.slug}`} className="product-card__title">
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
          style={{ display: "flex", gap: 8, alignItems: "center" }}
        >
          <button
            type="button"
            className="btn btn--sm"
            disabled={(product.stock ?? 20) <= 0}
            onClick={() => add(product)}
          >
            {(product.stock ?? 20) <= 0 ? "Out of stock" : "Add to cart"}
          </button>
          <button
            type="button"
            className="btn btn--sm btn--outline"
            onClick={() => toggleWishlist(product.slug)}
            aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
            title={wished ? "Saved in wishlist" : "Save to wishlist"}
          >
            {wished ? "♥" : "♡"}
          </button>
        </div>
      </div>
    </article>
  );
}
