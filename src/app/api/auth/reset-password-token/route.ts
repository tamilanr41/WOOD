import { NextResponse } from "next/server";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const token = String(body.token ?? "").trim();
    const newPassword = String(body.newPassword ?? "");

    if (!email || !token || newPassword.length < 6) {
      return NextResponse.json(
        { ok: false, error: "Valid email, reset token, and password (min 6 chars) required" },
        { status: 400 }
      );
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      email,
      resetTokenHash: tokenHash,
      resetTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "Invalid or expired password reset link" },
        { status: 400 }
      );
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.resetTokenHash = "";
    user.resetTokenExpires = null;
    await user.save();

    return NextResponse.json({
      ok: true,
      message: "Your password has been reset. You can now sign in.",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to reset password";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

