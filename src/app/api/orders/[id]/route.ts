import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/auth";
import { restoreStock } from "@/lib/order-calc";
import { sendOrderStatusEmail } from "@/lib/email";
import { logAudit } from "@/lib/audit";
import { Order } from "@/models/Order";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { ok: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    await connectDB();
    const { id } = await context.params;
    const body = await request.json();

    const existing = await Order.findById(id);
    if (!existing) {
      return NextResponse.json(
        { ok: false, error: "Order not found" },
        { status: 404 }
      );
    }

    const prevStatus = existing.status;
    const validStatuses = [
      "pending",
      "paid",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
      "refunded",
    ];
    if (body.status && validStatuses.includes(body.status)) {
      existing.status = body.status;
    }
    if (
      body.paymentStatus &&
      ["pending", "paid", "failed", "refunded"].includes(body.paymentStatus)
    ) {
      existing.paymentStatus = body.paymentStatus;
    }
    if (
      body.returnStatus &&
      ["none", "pending", "approved", "rejected", "refunded"].includes(
        body.returnStatus
      )
    ) {
      if (!existing.returnRequest) {
        existing.returnRequest = {
          requested: false,
          reason: "",
          status: "none",
        };
      }
      existing.returnRequest.status = body.returnStatus;
      if (body.returnStatus === "refunded") {
        existing.status = "refunded";
        existing.paymentStatus = "refunded";
      }
    }

    if (body.tracking && typeof body.tracking === "object") {
      const t = body.tracking as Record<string, unknown>;
      existing.tracking = {
        carrier: typeof t.carrier === "string" ? t.carrier.trim() : existing.tracking?.carrier || "",
        trackingNumber:
          typeof t.trackingNumber === "string"
            ? t.trackingNumber.trim()
            : existing.tracking?.trackingNumber || "",
        trackingUrl:
          typeof t.trackingUrl === "string"
            ? t.trackingUrl.trim()
            : existing.tracking?.trackingUrl || "",
        currentLocation:
          typeof t.currentLocation === "string"
            ? t.currentLocation.trim()
            : existing.tracking?.currentLocation || "",
        estimatedDelivery:
          typeof t.estimatedDelivery === "string"
            ? t.estimatedDelivery.trim()
            : existing.tracking?.estimatedDelivery || "",
        note: typeof t.note === "string" ? t.note.trim() : existing.tracking?.note || "",
        updatedAt: new Date(),
      };
    }

    // Restore stock once when transitioning into cancelled or refunded
    const wasRestorable = !["cancelled", "refunded"].includes(prevStatus);
    const nowRestored = ["cancelled", "refunded"].includes(existing.status);
    if (wasRestorable && nowRestored) {
      await restoreStock(existing.items);
    }

    await existing.save();

    if (body.status && body.status !== prevStatus) {
      await sendOrderStatusEmail(existing);
    }

    await logAudit({
      actor: session,
      action: "UPDATE_ORDER",
      targetType: "Order",
      targetId: existing.orderNumber,
      details: `status=${existing.status}, payment=${existing.paymentStatus}`,
    });

    return NextResponse.json({ ok: true, order: existing });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update order";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
