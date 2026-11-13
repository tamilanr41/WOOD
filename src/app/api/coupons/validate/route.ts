import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Coupon } from "@/models/Coupon";

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const code = String(body.code ?? "").trim().toUpperCase();
    const subtotal = Number(body.subtotal ?? 0);

    if (!code) {
      return NextResponse.json(
        { ok: false, error: "Please enter a coupon code" },
        { status: 400 }
      );
    }

    const coupon = await Coupon.findOne({ code, active: true }).lean();
    if (!coupon) {
      return NextResponse.json(
        { ok: false, error: "Invalid or inactive coupon code" },
        { status: 404 }
      );
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json(
        { ok: false, error: "This coupon has expired" },
        { status: 400 }
      );
    }

    if (subtotal < coupon.minOrderAmount) {
      return NextResponse.json(
        {
          ok: false,
          error: `Minimum order of ₹${coupon.minOrderAmount} required for ${coupon.code}`,
        },
        { status: 400 }
      );
    }

    let discount =
      coupon.type === "percent"
        ? Math.round((subtotal * coupon.value) / 100)
        : coupon.value;

    if (coupon.maxDiscount > 0) {
      discount = Math.min(discount, coupon.maxDiscount);
    }
    discount = Math.min(discount, subtotal);

    return NextResponse.json({
      ok: true,
      coupon: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
      },
      discount,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to validate coupon";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

