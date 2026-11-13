"use client";

export type OrderTrackingInfo = {
  carrier?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  currentLocation?: string;
  estimatedDelivery?: string;
  note?: string;
  updatedAt?: string;
};

export type TrackableOrder = {
  orderNumber: string;
  status: string;
  deliveryMethod?: string;
  createdAt?: string;
  tracking?: OrderTrackingInfo | null;
};

const STEPS = [
  { key: "placed", label: "Order Placed" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
];

function getStepIndex(status: string): number {
  switch (status) {
    case "pending":
    case "paid":
      return 0;
    case "processing":
      return 1;
    case "shipped":
      return 2;
    case "delivered":
      return 3;
    default:
      return -1;
  }
}

export default function OrderTracker({ order }: { order: TrackableOrder }) {
  const isCancelled = order.status === "cancelled" || order.status === "refunded";
  const currentStep = getStepIndex(order.status);
  const t = order.tracking;
  const hasTrackingDetails = Boolean(
    t &&
      (t.carrier ||
        t.trackingNumber ||
        t.currentLocation ||
        t.estimatedDelivery ||
        t.note ||
        t.trackingUrl)
  );

  const steps = STEPS.map((s) => {
    if (order.deliveryMethod === "pickup") {
      if (s.key === "shipped") return { ...s, label: "Ready for Pickup" };
      if (s.key === "delivered") return { ...s, label: "Picked Up" };
    }
    return s;
  });

  return (
    <div
      style={{
        border: "1px solid var(--border)",
        background: "#fff",
        padding: 14,
        marginBottom: 12,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 12,
        }}
      >
        <strong style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Order Tracking
        </strong>
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            textTransform: "uppercase",
            padding: "3px 10px",
            background: isCancelled ? "#fee2e2" : "rgba(200, 155, 92, 0.16)",
            color: isCancelled ? "#991b1b" : "var(--black)",
          }}
        >
          {order.status}
        </span>
      </div>

      {isCancelled ? (
        <div
          style={{
            padding: "10px 12px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#991b1b",
            fontSize: 13,
          }}
        >
          This order was <strong>{order.status}</strong>.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: 8,
            alignItems: "start",
          }}
        >
          {steps.map((step, idx) => {
            const done = idx <= currentStep;
            const active = idx === currentStep;
            return (
              <div key={step.key} style={{ textAlign: "center" }}>
                <div
                  style={{
                    height: 5,
                    borderRadius: 3,
                    background: done ? "var(--main)" : "#e5e5e3",
                    marginBottom: 8,
                    transition: "background 0.3s ease",
                  }}
                />
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    fontSize: 11,
                    fontWeight: 700,
                    marginBottom: 4,
                    background: done ? "var(--main)" : "#f2f2ef",
                    color: done ? "#fff" : "#777",
                    border: active ? "2px solid var(--black)" : "none",
                  }}
                >
                  {done ? "✓" : idx + 1}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: active ? 700 : 500,
                    color: done ? "var(--black)" : "#8a8c88",
                    lineHeight: 1.25,
                  }}
                >
                  {step.label}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {hasTrackingDetails && t && (
        <div
          style={{
            marginTop: 12,
            paddingTop: 10,
            borderTop: "1px dashed var(--border)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
            gap: 8,
            fontSize: 12.5,
            color: "#4d4f4c",
          }}
        >
          {t.carrier && (
            <div>
              <strong>Carrier:</strong> {t.carrier}
            </div>
          )}
          {t.trackingNumber && (
            <div>
              <strong>Tracking ID:</strong> {t.trackingNumber}
            </div>
          )}
          {t.currentLocation && (
            <div>
              <strong>Location:</strong> {t.currentLocation}
            </div>
          )}
          {t.estimatedDelivery && (
            <div>
              <strong>Est. Delivery:</strong> {t.estimatedDelivery}
            </div>
          )}
          {t.note && (
            <div style={{ gridColumn: "1 / -1" }}>
              <strong>Update:</strong> {t.note}
              {t.updatedAt && (
                <span style={{ color: "#8a8c88", marginLeft: 8 }}>
                  ({new Date(t.updatedAt).toLocaleString()})
                </span>
              )}
            </div>
          )}
          {t.trackingUrl && (
            <div style={{ gridColumn: "1 / -1" }}>
              <a
                href={t.trackingUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn--sm btn--outline"
              >
                Track on Courier Website ↗
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

