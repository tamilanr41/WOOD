import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/auth";
import { Appointment } from "@/models/Appointment";

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
    const appointments = await Appointment.find({})
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json({ ok: true, appointments });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load appointments";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();

    const firstName = String(body.firstName ?? "").trim();
    const lastName = String(body.lastName ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const service = String(body.service ?? "").trim();
    const preferredDate = String(body.preferredDate ?? "").trim();
    const notes = String(body.notes ?? "").trim();

    if (!firstName || !lastName || !phone || !service) {
      return NextResponse.json(
        { ok: false, error: "All appointment fields are required" },
        { status: 400 }
      );
    }

    const doc = await Appointment.create({
      firstName,
      lastName,
      phone,
      service,
      preferredDate,
      notes,
    });

    return NextResponse.json({ ok: true, id: doc._id.toString() }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to book appointment";
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
    if (!id || !["pending", "confirmed", "completed"].includes(status)) {
      return NextResponse.json(
        { ok: false, error: "Valid appointment id and status are required" },
        { status: 400 }
      );
    }

    const updated = await Appointment.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true }
    ).lean();
    return NextResponse.json({ ok: true, appointment: updated });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update appointment";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

