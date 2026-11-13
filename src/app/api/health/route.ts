import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { isRazorpayConfigured, getRazorpayPublicKey } from "@/lib/razorpay";
import { Product } from "@/models/Product";
import { Order } from "@/models/Order";
import { User } from "@/models/User";

export async function GET() {
  try {
    await connectDB();
    const [products, orders, users] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      User.countDocuments(),
    ]);
    const rzpConfigured = isRazorpayConfigured();
    const pubKey = getRazorpayPublicKey();
    return NextResponse.json({
      ok: true,
      database: "connected",
      counts: { products, orders, users },
      razorpay: {
        configured: rzpConfigured,
        keyIdPrefix: pubKey ? `${pubKey.slice(0, 8)}...` : null,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Database connection failed";
    return NextResponse.json(
      { ok: false, database: "disconnected", error: message },
      { status: 503 }
    );
  }
}

