"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/components/CartProvider";
import { money } from "@/lib/format";

type PlacedOrder = {
  orderNumber: string;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  deliveryMethod: string;
};

type StoreSettingsPublic = {
  shippingCharge: number;
  freeShippingThreshold: number;
  estimatedDeliveryDays: string;
  enablePickup: boolean;
  enableCod: boolean;
  enableBankTransfer: boolean;
  bankDetails: string;
  taxEnabled: boolean;
  taxLabel: string;
  taxRatePercent: number;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

export default function CheckoutView() {
  const { lines, subtotal, clear, ready } = useCart();
  const [placed, setPlaced] = useState<PlacedOrder | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<"delivery" | "pickup">(
    "delivery"
  );
  const [paymentMethod, setPaymentMethod] = useState<
    "razorpay" | "cod" | "bank_transfer"
  >("razorpay");

  const [settings, setSettings] = useState<StoreSettingsPublic>({
    shippingCharge: 250,
    freeShippingThreshold: 47000,
    estimatedDeliveryDays: "3–5 business days",
    enablePickup: true,
    enableCod: true,
    enableBankTransfer: false,
    bankDetails: "",
    taxEnabled: false,
    taxLabel: "GST",
    taxRatePercent: 0,
  });

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState("");

  const idempotencyKey = useMemo(
    () => `chk-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    []
  );

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    company: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postcode: "",
    notes: "",
  });

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data?.user) {
          const parts = String(data.user.name || "").trim().split(/\s+/);
          setForm((prev) => ({
            ...prev,
            firstName: prev.firstName || parts[0] || "",
            lastName: prev.lastName || parts.slice(1).join(" ") || "",
            email: prev.email || data.user.email || "",
            phone: prev.phone || data.user.phone || "",
            company: prev.company || data.user.savedAddress?.company || "",
            address: prev.address || data.user.savedAddress?.address || "",
            city: prev.city || data.user.savedAddress?.city || "",
            postcode: prev.postcode || data.user.savedAddress?.postcode || "",
          }));
        }
      })
      .catch(() => {});

    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d?.ok && d.settings) setSettings(d.settings);
      })
      .catch(() => {});
  }, []);

  const discountedSubtotal = Math.max(0, subtotal - discount);
  const shipping =
    lines.length === 0 || deliveryMethod === "pickup"
      ? 0
      : discountedSubtotal >= settings.freeShippingThreshold
      ? 0
      : settings.shippingCharge;
  const taxAmount = settings.taxEnabled
    ? Math.round((discountedSubtotal * settings.taxRatePercent) / 100)
    : 0;
  const total = discountedSubtotal + shipping + taxAmount;

  async function applyCoupon() {
    setCouponMsg("");
    const res = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: couponInput, subtotal }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      setDiscount(0);
      setAppliedCoupon("");
      setCouponMsg(data.error || "Invalid coupon");
    } else {
      setDiscount(data.discount);
      setAppliedCoupon(data.coupon.code);
      setCouponMsg(`Coupon ${data.coupon.code} applied (−${money(data.discount)})`);
    }
  }

  function loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const payload = {
        customer: form,
        items: lines.map((l) => ({
          slug: l.slug,
          qty: l.qty,
          selectedOptions: l.selectedOptions || "",
        })),
        couponCode: appliedCoupon,
        deliveryMethod,
        paymentMethod,
        idempotencyKey,
      };

      if (paymentMethod === "razorpay") {
        const res = await fetch("/api/payments/razorpay/order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          setError(data.error || "Could not initialize Razorpay order.");
          setSubmitting(false);
          return;
        }

        // If Razorpay test/live keys are not yet configured, run simulated test-mode verification
        if (data.mode === "simulated_test" || !data.keyId) {
          const verifyRes = await fetch("/api/payments/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: data.order._id,
              razorpayOrderId: data.razorpayOrderId,
              razorpayPaymentId: `pay_test_${Date.now()}`,
              razorpaySignature: "simulated_test_sig",
            }),
          });
          const verifyData = await verifyRes.json();
          if (!verifyRes.ok || !verifyData.ok) {
            setError(verifyData.error || "Test payment verification failed.");
            setSubmitting(false);
            return;
          }
          clear();
          setPlaced({
            orderNumber: verifyData.order.orderNumber,
            total: verifyData.order.total,
            paymentMethod: "Razorpay (Test Mode)",
            paymentStatus: verifyData.order.paymentStatus,
            deliveryMethod: verifyData.order.deliveryMethod,
          });
          setSubmitting(false);
          return;
        }

        const loaded = await loadRazorpayScript();
        if (!loaded || !window.Razorpay) {
          setError("Could not load Razorpay checkout script.");
          setSubmitting(false);
          return;
        }

        const rzp = new window.Razorpay({
          key: data.keyId,
          amount: data.amountPaise,
          currency: data.currency,
          name: "Mariya Plywoods Furniture",
          description: `Order ${data.order.orderNumber}`,
          order_id: data.razorpayOrderId,
          prefill: {
            name: `${form.firstName} ${form.lastName}`,
            email: form.email,
            contact: form.phone,
          },
          handler: async (response: {
            razorpay_order_id: string;
            razorpay_payment_id: string;
            razorpay_signature: string;
          }) => {
            const verifyRes = await fetch("/api/payments/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: data.order._id,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.ok) {
              setError(verifyData.error || "Payment verification failed.");
              setSubmitting(false);
              return;
            }
            clear();
            setPlaced({
              orderNumber: verifyData.order.orderNumber,
              total: verifyData.order.total,
              paymentMethod: "Razorpay",
              paymentStatus: verifyData.order.paymentStatus,
              deliveryMethod: verifyData.order.deliveryMethod,
            });
            setSubmitting(false);
          },
          modal: {
            ondismiss: () => {
              setError("Payment window closed before completion.");
              setSubmitting(false);
            },
          },
        });
        rzp.open();
        return;
      }

      // COD or Bank Transfer
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Could not place order. Please try again.");
        setSubmitting(false);
        return;
      }

      clear();
      setPlaced({
        orderNumber: data.order.orderNumber,
        total: data.order.total,
        paymentMethod: data.order.paymentMethod.toUpperCase(),
        paymentStatus: data.order.paymentStatus,
        deliveryMethod: data.order.deliveryMethod,
      });
    } catch {
      setError("Network error while placing order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (placed) {
    return (
      <div className="empty-state">
        <h2>Thank you for your order</h2>
        <p style={{ marginBottom: 10, fontWeight: 600 }}>
          Order Number: {placed.orderNumber}
        </p>
        <p style={{ marginBottom: 24 }}>
          Total: {money(placed.total)} · Payment: {placed.paymentMethod} (
          {placed.paymentStatus}) ·{" "}
          {placed.deliveryMethod === "pickup"
            ? "Store Pickup"
            : `Delivery (${settings.estimatedDeliveryDays})`}
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center" }}>
          <Link href="/my-account" className="btn btn--outline">
            View My Orders &amp; Invoice
          </Link>
          <Link href="/shop" className="btn">
            Back to shop
          </Link>
        </div>
      </div>
    );
  }

  if (ready && lines.length === 0) {
    return (
      <div className="empty-state">
        <h2>Nothing to check out</h2>
        <p style={{ marginBottom: 24 }}>Your cart is currently empty.</p>
        <Link href="/shop" className="btn">
          Go to shop
        </Link>
      </div>
    );
  }

  return (
    <form className="cart-layout" onSubmit={handleSubmit}>
      <div className="checkout-form">
        <h3 className="form-title">Billing &amp; Delivery details</h3>

        {settings.enablePickup && (
          <div className="field field--full">
            <label htmlFor="deliveryMethod">Fulfillment Method</label>
            <select
              id="deliveryMethod"
              value={deliveryMethod}
              onChange={(e) =>
                setDeliveryMethod(e.target.value as "delivery" | "pickup")
              }
            >
              <option value="delivery">
                Home Delivery ({settings.estimatedDeliveryDays})
              </option>
              <option value="pickup">
                Store Pickup — Erode Showroom (Free)
              </option>
            </select>
          </div>
        )}

        <div className="field">
          <label htmlFor="first">First name</label>
          <input
            id="first"
            name="first"
            placeholder="First name"
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="last">Last name</label>
          <input
            id="last"
            name="last"
            placeholder="Last name"
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            required
          />
        </div>
        <div className="field field--full">
          <label htmlFor="company">Company (optional)</label>
          <input
            id="company"
            name="company"
            placeholder="Company name"
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
          />
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="phone">Phone</label>
          <input
            id="phone"
            name="phone"
            placeholder="Phone number"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            required
          />
        </div>

        {deliveryMethod === "delivery" && (
          <>
            <div className="field field--full">
              <label htmlFor="address">Street address</label>
              <input
                id="address"
                name="address"
                placeholder="House number and street"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="city">City</label>
              <input
                id="city"
                name="city"
                placeholder="City"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="postcode">Postcode</label>
              <input
                id="postcode"
                name="postcode"
                placeholder="Postcode"
                value={form.postcode}
                onChange={(e) => setForm({ ...form, postcode: e.target.value })}
                required
              />
            </div>
          </>
        )}

        <div className="field field--full">
          <label htmlFor="paymentMethod">Payment method</label>
          <select
            id="paymentMethod"
            value={paymentMethod}
            onChange={(e) =>
              setPaymentMethod(
                e.target.value as "razorpay" | "cod" | "bank_transfer"
              )
            }
          >
            <option value="razorpay">
              Razorpay (UPI, Cards, NetBanking — Test Mode)
            </option>
            {settings.enableCod && (
              <option value="cod">Cash on Delivery (Pay on arrival)</option>
            )}
            {settings.enableBankTransfer && (
              <option value="bank_transfer">Manual Bank Transfer</option>
            )}
          </select>
          {paymentMethod === "bank_transfer" && settings.bankDetails && (
            <p style={{ fontSize: 12.5, color: "#6d6f6c", marginTop: 6 }}>
              {settings.bankDetails}
            </p>
          )}
        </div>

        <div className="field field--full">
          <label htmlFor="notes">Order notes (optional)</label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            placeholder="Delivery instructions or custom cut notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>
      </div>

      <aside className="summary-box">
        <h3>Your order</h3>
        {lines.map((line) => (
          <div
            className="summary-row"
            key={`${line.slug}-${line.selectedOptions || ""}`}
          >
            <span>
              {line.title} × {line.qty}
              {line.selectedOptions ? ` (${line.selectedOptions})` : ""}
            </span>
            <span>{money(line.price * line.qty)}</span>
          </div>
        ))}

        <div style={{ display: "flex", gap: 8, margin: "12px 0" }}>
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
          <button
            type="button"
            className="btn btn--sm btn--outline"
            onClick={applyCoupon}
          >
            Apply
          </button>
        </div>
        {couponMsg && (
          <p
            style={{
              fontSize: 12.5,
              color: discount > 0 ? "var(--main)" : "#b42318",
              marginBottom: 8,
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
            <span>Discount ({appliedCoupon})</span>
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
        {error && (
          <p style={{ color: "#b42318", fontSize: 13.5, marginBottom: 14 }}>
            {error}
          </p>
        )}
        <button type="submit" className="btn" disabled={submitting}>
          {submitting
            ? "Processing…"
            : paymentMethod === "razorpay"
            ? `Pay ${money(total)}`
            : "Place order"}
        </button>
      </aside>
    </form>
  );
}
