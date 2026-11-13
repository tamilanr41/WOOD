import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { connectDB } from "@/lib/mongodb";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { sendEmail, isEmailConfigured } from "@/lib/email";
import { User } from "@/models/User";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limit = checkRateLimit(`forgot:${ip}`, 5, 60_000);
    if (!limit.allowed) {
      return NextResponse.json(
        { ok: false, error: `Too many requests. Retry in ${limit.retryAfterSec}s.` },
        { status: 429 }
      );
    }

    await connectDB();
    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        { ok: false, error: "Please enter your email address" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });
    if (user) {
      const rawToken = crypto.randomBytes(24).toString("hex");
      const tokenHash = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");

      user.resetTokenHash = tokenHash;
      user.resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await user.save();

      const appUrl =
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const resetLink = `${appUrl}/my-account?reset=${rawToken}&email=${encodeURIComponent(
        email
      )}`;

      await sendEmail({
        to: email,
        subject: "Reset your Mariya Plywoods account password",
        html: `
          <p>Hello ${user.name},</p>
          <p>Click the link below to reset your password (valid for 1 hour):</p>
          <p><a href="${resetLink}">${resetLink}</a></p>
          <p>If you did not request this, you can safely ignore this email.</p>
        `,
      });
    }

    // Always return generic success message to prevent email enumeration
    return NextResponse.json({
      ok: true,
      emailConfigured: isEmailConfigured(),
      message: isEmailConfigured()
        ? "If an account exists for that email, a password reset link has been sent."
        : "Reset token generated, but email sending is not configured yet (set RESEND_API_KEY and EMAIL_FROM).",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to process reset request";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

