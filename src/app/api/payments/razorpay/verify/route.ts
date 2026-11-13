import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { verifyRazorpayPaymentSignature } from "@/lib/razorpay";
import { reserveStockAtomically } from "@/lib/order-calc";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { Order } from "@/models/Order";
import { Coupon } from "@/models/Coupon";

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();

    const orderId = String(body.orderId ?? "");
    const razorpayOrderId = String(body.razorpayOrderId ?? "");
    const razorpayPaymentId = String(body.razorpayPaymentId ?? "");
    const razorpaySignature = String(body.razorpaySignature ?? "");

    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json(
        { ok: false, error: "Missing payment verification fields" },
        { status: 400 }
      );
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { ok: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Idempotent: already paid
    if (order.paymentStatus === "paid") {
      return NextResponse.json({ ok: true, order });
    }

    if (order.razorpayOrderId !== razorpayOrderId) {
      return NextResponse.json(
        { ok: false, error: "Razorpay order ID mismatch" },
        { status: 400 }
      );
    }

    const isValid = verifyRazorpayPaymentSignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    if (!isValid) {
      order.paymentStatus = "failed";
      await order.save();
      return NextResponse.json(
        { ok: false, error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    await reserveStockAtomically(order.items);

    order.paymentStatus = "paid";
    order.status = "paid";
    order.razorpayPaymentId = razorpayPaymentId;
    order.razorpaySignature = razorpaySignature;
    await order.save();

    if (order.couponCode) {
      await Coupon.updateOne(
        { code: order.couponCode },
        { $inc: { usedCount: 1 } }
      );
    }

    await sendOrderConfirmationEmail(order);

    return NextResponse.json({ ok: true, order });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Payment verification failed";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}

