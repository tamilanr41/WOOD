import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { ensureSeeded } from "@/lib/seed";
import { User } from "@/models/User";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import {
  signSessionToken,
  sessionCookieOptions,
  SESSION_COOKIE,
} from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limit = checkRateLimit(`login:${ip}`, 10, 60_000);
    if (!limit.allowed) {
      return NextResponse.json(
        { ok: false, error: `Too many login attempts. Retry in ${limit.retryAfterSec}s.` },
        { status: 429 }
      );
    }
    await ensureSeeded();
    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { ok: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { ok: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const token = await signSessionToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const res = NextResponse.json({
      ok: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        savedAddress: user.savedAddress,
      },
    });
    res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
    return res;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Login failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

