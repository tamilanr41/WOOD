import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ensureSeeded } from "@/lib/seed";
import { getSessionUser } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { calculateServerOrder, reserveStockAtomically } from "@/lib/order-calc";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { Order } from "@/models/Order";
import { Coupon } from "@/models/Coupon";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json(
        { ok: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    await connectDB();
    const filter =
      session.role === "admin"
        ? {}
        : {
            $or: [
              { userId: session.userId },
              { "customer.email": session.email },
            ],
          };

    const orders = await Order.find(filter).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ ok: true, orders });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch orders";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limit = checkRateLimit(`order:${ip}`, 15, 60_000);
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
      if (existing) {
        return NextResponse.json({ ok: true, order: existing });
      }
    }

    const rawItems = Array.isArray(body.items) ? body.items : [];
    const customer = body.customer ?? {};
    const paymentMethod = ["cod", "bank_transfer"].includes(body.paymentMethod)
      ? (body.paymentMethod as "cod" | "bank_transfer")
      : "cod";
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

    if (paymentMethod === "cod" && !calc.settings.enableCod) {
      return NextResponse.json(
        { ok: false, error: "Cash on Delivery is currently disabled" },
        { status: 400 }
      );
    }
    if (paymentMethod === "bank_transfer" && !calc.settings.enableBankTransfer) {
      return NextResponse.json(
        { ok: false, error: "Bank Transfer is currently disabled" },
        { status: 400 }
      );
    }

    await reserveStockAtomically(calc.items);

    const orderNumber = `MP-${new Date().getFullYear()}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;

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
      paymentMethod,
      paymentStatus: "pending",
      status: "pending",
    });

    if (calc.appliedCoupon) {
      await Coupon.updateOne(
        { code: calc.appliedCoupon },
        { $inc: { usedCount: 1 } }
      );
    }

    await sendOrderConfirmationEmail(order);

    return NextResponse.json({ ok: true, order }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to place order";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
