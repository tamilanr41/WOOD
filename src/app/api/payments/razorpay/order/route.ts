import { NextResponse } from "next/server";
import { ensureSeeded } from "@/lib/seed";
import { getSessionUser } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { calculateServerOrder } from "@/lib/order-calc";
import { createRazorpayOrder, getRazorpayPublicKey } from "@/lib/razorpay";
import { Order } from "@/models/Order";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limit = checkRateLimit(`rzp-order:${ip}`, 15, 60_000);
    if (!limit.allowed) {
      return NextResponse.json(
        { ok: false, error: `Too many requests. Retry in ${limit.retryAfterSec}s.` },
        { status: 429 }
      );
    }

    await ensureSeeded();
    const session = await getSessionUser();
    const body = await request.json();

    const idempotencyKey = body.idempotencyKey
      ? String(body.idempotencyKey).trim()
      : undefined;
    if (idempotencyKey) {
      const existing = await Order.findOne({ idempotencyKey }).lean();
      if (existing && existing.razorpayOrderId) {
        return NextResponse.json({
          ok: true,
          order: existing,
          razorpayOrderId: existing.razorpayOrderId,
          amountPaise: Math.round(existing.total * 100),
          currency: "INR",
          keyId: getRazorpayPublicKey(),
          mode: existing.razorpayOrderId.startsWith("order_test_")
            ? "simulated_test"
            : "razorpay",
        });
      }
    }

    const rawItems = Array.isArray(body.items) ? body.items : [];
    const customer = body.customer ?? {};
    const deliveryMethod =
      body.deliveryMethod === "pickup" ? "pickup" : "delivery";

    const firstName = String(customer.firstName ?? "").trim();
    const lastName = String(customer.lastName ?? "").trim();
    const email = String(customer.email ?? "").trim().toLowerCase();
    const phone = String(customer.phone ?? "").trim();
    const address = String(customer.address ?? "").trim();
    const city = String(customer.city ?? "").trim();
    const postcode = String(customer.postcode ?? "").trim();

    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      (deliveryMethod === "delivery" && (!address || !city || !postcode))
    ) {
      return NextResponse.json(
        { ok: false, error: "Please fill in all required billing and delivery fields" },
        { status: 400 }
      );
    }

    if (rawItems.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Your cart is empty" },
        { status: 400 }
      );
    }

    const calc = await calculateServerOrder({
      rawItems,
      couponCode: body.couponCode,
      deliveryMethod,
    });

    const orderNumber = `MP-${new Date().getFullYear()}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;

    const rzpOrder = await createRazorpayOrder({
      amountInRupees: calc.total,
      receipt: orderNumber,
      notes: { email, orderNumber },
    });

    const order = await Order.create({
      orderNumber,
      idempotencyKey,
      userId: session?.userId ?? null,
      customer: {
        firstName,
        lastName,
        company: String(customer.company ?? "").trim(),
        email,
        phone,
        address: address || "Store Pickup",
        city: city || "Erode",
        postcode: postcode || "638011",
        notes: String(customer.notes ?? "").trim(),
      },
      deliveryMethod,
      items: calc.items,
      couponCode: calc.appliedCoupon,
      discount: calc.discount,
      subtotal: calc.subtotal,
      shipping: calc.shipping,
      taxAmount: calc.taxAmount,
      total: calc.total,
      paymentMethod: "razorpay",
      paymentStatus: "pending",
      razorpayOrderId: rzpOrder.id,
      status: "pending",
    });

    return NextResponse.json(
      {
        ok: true,
        order,
        razorpayOrderId: rzpOrder.id,
        amountPaise: rzpOrder.amount,
        currency: rzpOrder.currency,
        keyId: getRazorpayPublicKey(),
        mode: rzpOrder.mode,
      },
      { status: 201 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to initialize payment";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}

