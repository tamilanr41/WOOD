import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { User } from "@/models/User";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limit = checkRateLimit(`pwd:${ip}`, 5, 60_000);
    if (!limit.allowed) {
      return NextResponse.json(
        { ok: false, error: `Too many requests. Retry in ${limit.retryAfterSec}s.` },
        { status: 429 }
      );
    }

    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json(
        { ok: false, error: "Sign in to update your password" },
        { status: 401 }
      );
    }

    await connectDB();
    const body = await request.json();
    const currentPassword = String(body.currentPassword ?? "");
    const newPassword = String(body.newPassword ?? "");

    if (!currentPassword || newPassword.length < 6) {
      return NextResponse.json(
        { ok: false, error: "Current password and new password (min 6 chars) required" },
        { status: 400 }
      );
    }

    const user = await User.findById(session.userId);
    if (!user) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
    }

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { ok: false, error: "Current password is incorrect" },
        { status: 401 }
      );
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    return NextResponse.json({ ok: true, message: "Password updated successfully" });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update password";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

