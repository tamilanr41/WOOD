"use client";

import { useState } from "react";
import Link from "next/link";
import OrderTracker, { type OrderTrackingInfo } from "@/components/OrderTracker";
import { money } from "@/lib/format";

type TrackedOrderResult = {
  _id: string;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  deliveryMethod?: string;
  city?: string;
  total: number;
  itemCount: number;
  items: { title: string; qty: number; image: string; slug: string }[];
  tracking?: OrderTrackingInfo | null;
  createdAt: string;
};

export default function TrackOrderView() {
  const [orderNumber, setOrderNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<TrackedOrderResult | null>(null);

  async function handleTrack(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = orderNumber.trim();
    if (!cleaned) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch(
        `/api/orders/track?orderNumber=${encodeURIComponent(cleaned)}`
      );
      const data = await res.json();
      if (!data?.ok) {
        setError(data?.error || "Order not found");
      } else {
        setResult(data.order);
      }
    } catch {
      setError("Network error while tracking order.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      <div className="account-card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 8 }}>Track Your Order</h3>
        <p style={{ color: "#6d6f6c", fontSize: 14, marginBottom: 16 }}>
          Enter your Mariya Plywoods order number (for example{" "}
          <code>MP-10001</code>) to view live delivery status and courier details.
        </p>
        <form
          onSubmit={handleTrack}
          style={{ display: "flex", gap: 10, flexWrap: "wrap" }}
        >
          <input
            type="text"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="Enter Order Number (e.g. MP-10001)"
            required
            style={{
              flex: "1 1 240px",
              padding: "12px 14px",
              border: "1px solid var(--border)",
              fontFamily: "inherit",
              fontSize: 14,
            }}
          />
          <button type="submit" className="btn" disabled={loading}>
            {loading ? "Checking…" : "Track Order"}
          </button>
        </form>
        {error && (
          <p style={{ color: "#991b1b", marginTop: 12, fontSize: 14 }}>{error}</p>
        )}
      </div>

      {result && (
        <div className="account-card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 10,
              marginBottom: 14,
            }}
          >
            <div>
              <strong style={{ fontSize: 18 }}>{result.orderNumber}</strong>
              <div style={{ fontSize: 13, color: "#6d6f6c", marginTop: 2 }}>
                Placed on {new Date(result.createdAt).toLocaleDateString()} ·{" "}
                {result.deliveryMethod === "pickup"
                  ? "Store Pickup"
                  : `Delivery${result.city ? ` to ${result.city}` : ""}`}
              </div>
            </div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>
              {money(result.total)}
            </div>
          </div>

          <OrderTracker order={result} />

          <div style={{ marginTop: 14 }}>
            <strong style={{ fontSize: 13, textTransform: "uppercase" }}>
              Items ({result.itemCount})
            </strong>
            <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
              {result.items.map((item, idx) => (
                <Link
                  key={idx}
                  href={`/product/${item.slug}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: 10,
                    border: "1px solid var(--border)",
                    background: "var(--gray-light)",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.title}
                    style={{
                      width: 52,
                      height: 52,
                      objectFit: "cover",
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{item.title}</div>
                    <div style={{ fontSize: 12.5, color: "#6d6f6c" }}>
                      Qty: {item.qty}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

