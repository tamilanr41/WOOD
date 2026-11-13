"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/components/CartProvider";
import { money } from "@/lib/format";

type StoreSettingsPublic = {
  shippingCharge: number;
  freeShippingThreshold: number;
  taxEnabled: boolean;
  taxLabel: string;
  taxRatePercent: number;
};

export default function CartView() {
  const {
    lines,
    savedForLater,
    subtotal,
    remove,
    setQty,
    saveForLater,
    moveToCart,
    removeSaved,
    ready,
  } = useCart();

  const [settings, setSettings] = useState<StoreSettingsPublic>({
    shippingCharge: 250,
    freeShippingThreshold: 47000,
    taxEnabled: false,
    taxLabel: "GST",
    taxRatePercent: 0,
  });
  const [couponInput, setCouponInput] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d?.ok && d.settings) setSettings(d.settings);
      })
      .catch(() => {});
  }, []);

  const discountedSubtotal = Math.max(0, subtotal - discount);
  const shipping =
    lines.length === 0
      ? 0
      : discountedSubtotal >= settings.freeShippingThreshold
      ? 0
      : settings.shippingCharge;
  const taxAmount = settings.taxEnabled
    ? Math.round((discountedSubtotal * settings.taxRatePercent) / 100)
    : 0;
  const total = discountedSubtotal + shipping + taxAmount;

  async function applyCoupon(e: React.FormEvent) {
    e.preventDefault();
    setCouponMsg("");
    const res = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: couponInput, subtotal }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      setDiscount(0);
      setCouponMsg(data.error || "Invalid coupon");
    } else {
      setDiscount(data.discount);
      setCouponMsg(`Applied ${data.coupon.code}: −${money(data.discount)}`);
    }
  }

  if (!ready) {
    return (
      <div className="empty-state">
        <p>Loading cart…</p>
      </div>
    );
  }

  return (
    <div>
      {lines.length === 0 ? (
        <div className="empty-state">
          <h2>Your cart is empty</h2>
          <p style={{ marginBottom: 24 }}>
            Browse the shop and add a handcrafted piece or plywood sheet to get
            started.
          </p>
          <Link href="/shop" className="btn">
            Go to shop
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div>
            <table className="cart-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line) => (
                  <tr key={`${line.slug}-${line.selectedOptions || ""}`}>
                    <td>
                      <div className="cart-line">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={line.image} alt={line.title} />
                        <div>
                          <Link
                            href={`/product/${line.slug}`}
                            className="cart-line__title"
                          >
                            {line.title}
                          </Link>
                          {line.selectedOptions && (
                            <div style={{ fontSize: 12.5, color: "#6d6f6c" }}>
                              {line.selectedOptions}
                            </div>
                          )}
                          <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
                            <button
                              type="button"
                              className="cart-line__remove"
                              onClick={() =>
                                saveForLater(line.slug, line.selectedOptions)
                              }
                            >
                              Save for later
                            </button>
                            <button
                              type="button"
                              className="cart-line__remove"
                              onClick={() =>
                                remove(line.slug, line.selectedOptions)
                              }
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      {money(line.price)}
                      {line.unit && line.unit !== "item"
                        ? ` / ${line.unit}`
                        : ""}
                    </td>
                    <td>
                      <div className="qty-control">
                        <button
                          type="button"
                          onClick={() =>
                            setQty(
                              line.slug,
                              line.qty - 1,
                              line.selectedOptions
                            )
                          }
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span>{line.qty}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setQty(
                              line.slug,
                              line.qty + 1,
                              line.selectedOptions
                            )
                          }
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td>{money(line.price * line.qty)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <aside className="summary-box">
            <h3>Cart totals</h3>
            <form
              onSubmit={applyCoupon}
              style={{ display: "flex", gap: 8, marginBottom: 14 }}
            >
              <input
                placeholder="Coupon code"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                style={{
                  flex: 1,
                  padding: "8px 10px",
                  border: "1px solid var(--border)",
                  fontSize: 13.5,
                }}
              />
              <button type="submit" className="btn btn--sm btn--outline">
                Apply
              </button>
            </form>
            {couponMsg && (
              <p
                style={{
                  fontSize: 12.5,
                  color: discount > 0 ? "var(--main)" : "#b42318",
                  marginBottom: 10,
                }}
              >
                {couponMsg}
              </p>
            )}

            <div className="summary-row">
              <span>Subtotal</span>
              <span>{money(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="summary-row">
                <span>Discount</span>
                <span>−{money(discount)}</span>
              </div>
            )}
            <div className="summary-row">
              <span>Shipping</span>
              <span>{shipping === 0 ? "Free" : money(shipping)}</span>
            </div>
            {settings.taxEnabled && (
              <div className="summary-row">
                <span>
                  {settings.taxLabel} ({settings.taxRatePercent}%)
                </span>
                <span>{money(taxAmount)}</span>
              </div>
            )}
            <div className="summary-row total">
              <span>Total</span>
              <span>{money(total)}</span>
            </div>
            <Link href="/checkout" className="btn" style={{ width: "100%", textAlign: "center" }}>
              Proceed to checkout
            </Link>
          </aside>
        </div>
      )}

      {savedForLater.length > 0 && (
        <div style={{ marginTop: 48 }}>
          <h3 style={{ marginBottom: 16 }}>
            Saved for later ({savedForLater.length})
          </h3>
          <div style={{ display: "grid", gap: 12 }}>
            {savedForLater.map((item) => (
              <div
                key={`${item.slug}-${item.selectedOptions || ""}`}
                className="account-card"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 12,
                  padding: 14,
                }}
              >
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.title}
                    style={{ width: 52, height: 52, objectFit: "cover" }}
                  />
                  <div>
                    <strong>{item.title}</strong>
                    <div style={{ fontSize: 13, color: "#6d6f6c" }}>
                      {money(item.price)}
                      {item.selectedOptions ? ` · ${item.selectedOptions}` : ""}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    type="button"
                    className="btn btn--sm"
                    onClick={() =>
                      moveToCart(item.slug, item.selectedOptions)
                    }
                  >
                    Move to cart
                  </button>
                  <button
                    type="button"
                    className="btn btn--sm btn--outline"
                    onClick={() =>
                      removeSaved(item.slug, item.selectedOptions)
                    }
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
