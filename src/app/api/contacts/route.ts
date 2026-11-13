import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/auth";
import { ContactMessage } from "@/models/ContactMessage";

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
    const messages = await ContactMessage.find({})
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json({ ok: true, messages });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load messages";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();

    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const phone = String(body.phone ?? "").trim();
    const subject = String(body.subject ?? "").trim();
    const message = String(body.message ?? "").trim();

    if (!name || !email || !message) {
      return NextResponse.json(
        { ok: false, error: "Name, email, and message are required" },
        { status: 400 }
      );
    }

    const doc = await ContactMessage.create({
      name,
      email,
      phone,
      subject,
      message,
    });

    return NextResponse.json({ ok: true, id: doc._id.toString() }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save contact message";
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

    await connectDB();
    const body = await request.json();
    const id = String(body.id ?? "");
    const status = String(body.status ?? "");
    if (!id || !["new", "replied"].includes(status)) {
      return NextResponse.json(
        { ok: false, error: "Valid message id and status are required" },
        { status: 400 }
      );
    }

    const updated = await ContactMessage.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true }
    ).lean();
    return NextResponse.json({ ok: true, message: updated });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update message";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

