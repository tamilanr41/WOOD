import { NextResponse } from "next/server";
import { ensureSeeded } from "@/lib/seed";
import { connectDB } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/auth";
import { StoreSettings } from "@/models/StoreSettings";
import { logAudit } from "@/lib/audit";

export async function GET() {
  try {
    await ensureSeeded();
    const settings = await StoreSettings.findOne({ key: "default" }).lean();
    return NextResponse.json({
      ok: true,
      settings: settings ?? {
        shippingCharge: 250,
        freeShippingThreshold: 47000,
        estimatedDeliveryDays: "3–5 business days",
        enablePickup: true,
        enableCod: true,
        enableBankTransfer: false,
        bankDetails: "",
        taxEnabled: false,
        taxLabel: "GST",
        taxRatePercent: 0,
        gstin: "",
        deliveryZones: ["Erode", "Coimbatore", "Salem", "Tiruppur", "Tamil Nadu"],
      },
    });
  } catch {
    return NextResponse.json({
      ok: true,
      settings: {
        shippingCharge: 250,
        freeShippingThreshold: 47000,
        estimatedDeliveryDays: "3–5 business days",
        enablePickup: true,
        enableCod: true,
        enableBankTransfer: false,
        bankDetails: "",
        taxEnabled: false,
        taxLabel: "GST",
        taxRatePercent: 0,
        gstin: "",
        deliveryZones: ["Erode", "Coimbatore", "Salem", "Tiruppur", "Tamil Nadu"],
      },
    });
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

    const updates: Record<string, unknown> = {};
    if (body.shippingCharge !== undefined) {
      updates.shippingCharge = Math.max(0, Number(body.shippingCharge));
    }
    if (body.freeShippingThreshold !== undefined) {
      updates.freeShippingThreshold = Math.max(0, Number(body.freeShippingThreshold));
    }
    if (body.estimatedDeliveryDays !== undefined) {
      updates.estimatedDeliveryDays = String(body.estimatedDeliveryDays).trim();
    }
    if (body.enablePickup !== undefined) updates.enablePickup = Boolean(body.enablePickup);
    if (body.enableCod !== undefined) updates.enableCod = Boolean(body.enableCod);
    if (body.enableBankTransfer !== undefined) {
      updates.enableBankTransfer = Boolean(body.enableBankTransfer);
    }
    if (body.bankDetails !== undefined) {
      updates.bankDetails = String(body.bankDetails).trim();
    }
    if (body.taxEnabled !== undefined) updates.taxEnabled = Boolean(body.taxEnabled);
    if (body.taxLabel !== undefined) updates.taxLabel = String(body.taxLabel).trim();
    if (body.taxRatePercent !== undefined) {
      updates.taxRatePercent = Math.min(50, Math.max(0, Number(body.taxRatePercent)));
    }
    if (body.gstin !== undefined) updates.gstin = String(body.gstin).trim();
    if (Array.isArray(body.deliveryZones)) {
      updates.deliveryZones = body.deliveryZones
        .map((z: unknown) => String(z).trim())
        .filter(Boolean);
    }

    const settings = await StoreSettings.findOneAndUpdate(
      { key: "default" },
      { $set: updates },
      { new: true, upsert: true }
    ).lean();

    await logAudit({
      actor: session,
      action: "UPDATE_SETTINGS",
      targetType: "StoreSettings",
      targetId: "default",
      details: Object.keys(updates).join(", "),
    });

    return NextResponse.json({ ok: true, settings });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update settings";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

