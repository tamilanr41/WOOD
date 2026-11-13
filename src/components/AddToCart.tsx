"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { CatalogProduct } from "@/lib/seed";
import { useCart } from "@/components/CartProvider";

export default function AddToCart({ product }: { product: CatalogProduct }) {
  const { add, toggleWishlist, isWishlisted, trackViewed } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const sizes = product.options?.sizes?.length
    ? product.options.sizes
    : [];
  const finishes = product.options?.finishes?.length
    ? product.options.finishes
    : [];
  const colors = product.options?.colors?.length
    ? product.options.colors
    : [];

  const [size, setSize] = useState(sizes[0] || "");
  const [finish, setFinish] = useState(finishes[0] || "");
  const [color, setColor] = useState(colors[0] || "");
  const [customDim, setCustomDim] = useState("");

  useEffect(() => {
    trackViewed(product.slug);
  }, [product.slug, trackViewed]);

  const wished = isWishlisted(product.slug);
  const outOfStock = (product.stock ?? 20) <= 0;

  function buildOptionLabel(): string {
    const parts: string[] = [];
    if (size) parts.push(`Size: ${size}`);
    if (finish) parts.push(`Finish: ${finish}`);
    if (color) parts.push(`Color: ${color}`);
    if (customDim.trim()) parts.push(`Custom: ${customDim.trim()}`);
    return parts.join(" · ");
  }

  return (
    <div>
      {(sizes.length > 0 || finishes.length > 0 || colors.length > 0) && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 12,
            marginBottom: 16,
          }}
        >
          {sizes.length > 0 && (
            <div className="field" style={{ marginBottom: 0 }}>
              <label htmlFor="opt-size">Size</label>
              <select
                id="opt-size"
                value={size}
                onChange={(e) => setSize(e.target.value)}
              >
                {sizes.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          )}
          {finishes.length > 0 && (
            <div className="field" style={{ marginBottom: 0 }}>
              <label htmlFor="opt-finish">Finish</label>
              <select
                id="opt-finish"
                value={finish}
                onChange={(e) => setFinish(e.target.value)}
              >
                {finishes.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
          )}
          {colors.length > 0 && (
            <div className="field" style={{ marginBottom: 0 }}>
              <label htmlFor="opt-color">Color / Shade</label>
              <select
                id="opt-color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              >
                {colors.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {product.options?.customDimensionsAllowed && (
        <div className="field" style={{ marginBottom: 16 }}>
          <label htmlFor="opt-custom">
            Custom Dimensions (optional — e.g., 6ft × 4ft × 18mm)
          </label>
          <input
            id="opt-custom"
            placeholder="Leave blank for standard size"
            value={customDim}
            onChange={(e) => setCustomDim(e.target.value)}
          />
        </div>
      )}

      <div className="qty-row" style={{ flexWrap: "wrap" }}>
        <div className="qty-control">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span>{qty}</span>
          <button
            type="button"
            onClick={() => setQty((q) => q + 1)}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
        <button
          type="button"
          className="btn"
          disabled={outOfStock}
          onClick={() => {
            add(product, qty, buildOptionLabel());
            setAdded(true);
          }}
        >
          {outOfStock ? "Out of stock" : "Add to cart"}
        </button>
        <button
          type="button"
          className="btn btn--outline"
          onClick={() => toggleWishlist(product.slug)}
        >
          {wished ? "♥ Saved" : "♡ Wishlist"}
        </button>
      </div>

      {added && (
        <p style={{ color: "var(--main)", fontWeight: 600, marginTop: 10 }}>
          Added to cart.{" "}
          <Link href="/cart" style={{ textDecoration: "underline" }}>
            View cart
          </Link>
        </p>
      )}
    </div>
  );
}
