import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Order";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get("orderNumber")?.trim().toUpperCase();

    if (!orderNumber) {
      return NextResponse.json(
        { ok: false, error: "Please enter an order number (e.g. MP-10001)" },
        { status: 400 }
      );
    }

    await connectDB();
    const order = await Order.findOne({ orderNumber }).lean();

    if (!order) {
      return NextResponse.json(
        { ok: false, error: `No order found with number ${orderNumber}` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      order: {
        _id: String(order._id),
        orderNumber: order.orderNumber,
        status: order.status,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        deliveryMethod: order.deliveryMethod,
        city: order.customer?.city || "",
        total: order.total,
        itemCount: order.items?.reduce((sum, i) => sum + (i.qty || 1), 0) || 0,
        items: (order.items || []).map((i) => ({
          title: i.title,
          qty: i.qty,
          image: i.image,
          slug: i.slug,
        })),
        tracking: order.tracking || null,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to track order";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

