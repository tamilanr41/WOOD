import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/auth";
import { restoreStock } from "@/lib/order-calc";
import { Order } from "@/models/Order";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
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
        { ok: false, error: "You can only cancel your own orders" },
        { status: 403 }
      );
    }

    if (!["pending", "paid"].includes(order.status)) {
      return NextResponse.json(
        {
          ok: false,
          error: `Orders in "${order.status}" state cannot be cancelled online. Please contact support.`,
        },
        { status: 400 }
      );
    }

    order.status = "cancelled";
    await order.save();
    await restoreStock(order.items);

    return NextResponse.json({ ok: true, order });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to cancel order";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

