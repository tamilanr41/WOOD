import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/auth";
import { Coupon } from "@/models/Coupon";
import { logAudit } from "@/lib/audit";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { ok: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    await connectDB();
    const coupons = await Coupon.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ ok: true, coupons });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load coupons";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { ok: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    await connectDB();
    const body = await request.json();
    const code = String(body.code ?? "").trim().toUpperCase();
    const type = body.type === "fixed" ? "fixed" : "percent";
    const value = Number(body.value);
    const minOrderAmount = Math.max(0, Number(body.minOrderAmount ?? 0));
    const maxDiscount = Math.max(0, Number(body.maxDiscount ?? 0));

    if (!code || !Number.isFinite(value) || value <= 0) {
      return NextResponse.json(
        { ok: false, error: "Coupon code and positive value are required" },
        { status: 400 }
      );
    }

    const existing = await Coupon.findOne({ code }).lean();
    if (existing) {
      return NextResponse.json(
        { ok: false, error: "Coupon code already exists" },
        { status: 409 }
      );
    }

    const coupon = await Coupon.create({
      code,
      type,
      value,
      minOrderAmount,
      maxDiscount,
      active: body.active !== false,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
    });

    await logAudit({
      actor: session,
      action: "CREATE_COUPON",
      targetType: "Coupon",
      targetId: coupon.code,
      details: `${coupon.type} ${coupon.value}`,
    });

    return NextResponse.json({ ok: true, coupon }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create coupon";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { ok: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { ok: false, error: "Coupon id is required" },
        { status: 400 }
      );
    }

    await connectDB();
    await Coupon.findByIdAndDelete(id);
    await logAudit({
      actor: session,
      action: "DELETE_COUPON",
      targetType: "Coupon",
      targetId: id,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete coupon";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

