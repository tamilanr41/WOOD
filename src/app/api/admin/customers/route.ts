import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { User } from "@/models/User";

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
    const customers = await User.find({})
      .select("-passwordHash -resetTokenHash -resetTokenExpires")
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json({ ok: true, customers });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load customers";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { ok: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const userId = String(body.userId || "").trim();
    const role = String(body.role || "").trim();

    if (!userId || !["customer", "admin"].includes(role)) {
      return NextResponse.json(
        { ok: false, error: "Valid userId and role (customer/admin) required" },
        { status: 400 }
      );
    }

    if (userId === session.userId && role !== "admin") {
      return NextResponse.json(
        { ok: false, error: "You cannot demote your own admin account" },
        { status: 400 }
      );
    }

    await connectDB();
    const updated = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    )
      .select("-passwordHash -resetTokenHash -resetTokenExpires")
      .lean();

    if (!updated) {
      return NextResponse.json(
        { ok: false, error: "User not found" },
        { status: 404 }
      );
    }

    await logAudit({
      actor: session,
      action: "UPDATE_USER_ROLE",
      targetType: "User",
      targetId: updated.email,
      details: `role=${role}`,
    });

    return NextResponse.json({ ok: true, customer: updated });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update user role";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

