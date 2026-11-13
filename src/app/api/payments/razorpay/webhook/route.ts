import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { verifyRazorpayWebhookSignature } from "@/lib/razorpay";
import { reserveStockAtomically, restoreStock } from "@/lib/order-calc";
import { Order } from "@/models/Order";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature") || "";

    if (!verifyRazorpayWebhookSignature(rawBody, signature)) {
      return NextResponse.json(
        { ok: false, error: "Invalid webhook signature" },
        { status: 401 }
      );
    }

    await connectDB();
    const event = JSON.parse(rawBody);
    const eventType = String(event.event ?? "");
    const paymentEntity = event?.payload?.payment?.entity;
    const razorpayOrderId = paymentEntity?.order_id;
    const razorpayPaymentId = paymentEntity?.id;

    if (!razorpayOrderId) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    const order = await Order.findOne({ razorpayOrderId });
    if (!order) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    if (eventType === "payment.captured" && order.paymentStatus !== "paid") {
      await reserveStockAtomically(order.items);
      order.paymentStatus = "paid";
      order.status = "paid";
      if (razorpayPaymentId) order.razorpayPaymentId = razorpayPaymentId;
      await order.save();
    } else if (eventType === "payment.failed" && order.paymentStatus === "pending") {
      order.paymentStatus = "failed";
      await order.save();
    } else if (eventType === "refund.processed" && order.status !== "refunded") {
      if (!["cancelled", "refunded"].includes(order.status)) {
        await restoreStock(order.items);
      }
      order.status = "refunded";
      order.paymentStatus = "refunded";
      await order.save();
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Webhook processing failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

