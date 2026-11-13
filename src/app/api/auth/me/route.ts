import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/auth";
import { User } from "@/models/User";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ ok: true, user: null });
    }

    await connectDB();
    const user = await User.findById(session.userId)
      .select("-passwordHash")
      .lean();
    if (!user) {
      return NextResponse.json({ ok: true, user: null });
    }

    return NextResponse.json({
      ok: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone ?? "",
        savedAddress: user.savedAddress ?? {},
        wishlist: user.wishlist ?? [],
        notificationPrefs: user.notificationPrefs ?? {
          orderUpdates: true,
          promotions: false,
        },
      },
    });
  } catch {
    return NextResponse.json({ ok: true, user: null });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json(
        { ok: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    await connectDB();
    const body = await request.json();

    const updates: Record<string, unknown> = {};
    if (body.name !== undefined) updates.name = String(body.name).trim();
    if (body.phone !== undefined) updates.phone = String(body.phone).trim();
    if (body.savedAddress && typeof body.savedAddress === "object") {
      updates.savedAddress = {
        company: String(body.savedAddress.company ?? "").trim(),
        address: String(body.savedAddress.address ?? "").trim(),
        city: String(body.savedAddress.city ?? "").trim(),
        postcode: String(body.savedAddress.postcode ?? "").trim(),
      };
    }
    if (Array.isArray(body.wishlist)) {
      updates.wishlist = body.wishlist
        .map((s: unknown) => String(s).trim())
        .filter(Boolean);
    }
    if (body.notificationPrefs && typeof body.notificationPrefs === "object") {
      updates.notificationPrefs = {
        orderUpdates: Boolean(body.notificationPrefs.orderUpdates),
        promotions: Boolean(body.notificationPrefs.promotions),
      };
    }

    const user = await User.findByIdAndUpdate(
      session.userId,
      { $set: updates },
      { new: true }
    )
      .select("-passwordHash")
      .lean();

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone ?? "",
        savedAddress: user.savedAddress ?? {},
        wishlist: user.wishlist ?? [],
        notificationPrefs: user.notificationPrefs ?? {
          orderUpdates: true,
          promotions: false,
        },
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update profile";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

