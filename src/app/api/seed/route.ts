import { NextResponse } from "next/server";
import { ensureSeeded } from "@/lib/seed";

export async function POST() {
  try {
    const result = await ensureSeeded();
    return NextResponse.json({
      ok: true,
      message: "Database seeded successfully",
      ...result,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to seed database";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

