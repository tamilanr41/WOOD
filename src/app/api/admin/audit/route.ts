import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/auth";
import { AuditLog } from "@/models/AuditLog";

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
    const logs = await AuditLog.find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    return NextResponse.json({ ok: true, logs });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load audit logs";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

