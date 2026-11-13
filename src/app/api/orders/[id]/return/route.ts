import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/auth";
import { Order } from "@/models/Order";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json(
        { ok: false, error: "Sign in required" },
        { status: 401 }
      );
    }

    await connectDB();
    const { id } = await context.params;
    const body = await request.json();
    const reason = String(body.reason ?? "").trim();

    if (!reason) {
      return NextResponse.json(
        { ok: false, error: "Please provide a reason for your return request" },
        { status: 400 }
      );
    }

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json(
        { ok: false, error: "Order not found" },
        { status: 404 }
      );
    }

    const isOwner =
      order.userId?.toString() === session.userId ||
      order.customer.email === session.email;
    if (!isOwner && session.role !== "admin") {
      return NextResponse.json(
        { ok: false, error: "You can only request returns for your own orders" },
        { status: 403 }
      );
    }

    if (order.status !== "delivered") {
      return NextResponse.json(
        {
          ok: false,
          error: "Returns can only be requested after delivery",
        },
        { status: 400 }
      );
    }

    order.returnRequest = {
      requested: true,
      reason,
      status: "pending",
      requestedAt: new Date(),
    };
    await order.save();

    return NextResponse.json({ ok: true, order });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to submit return request";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

