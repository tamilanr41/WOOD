import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ensureSeeded } from "@/lib/seed";
import { getSessionUser } from "@/lib/auth";
import { Product } from "@/models/Product";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    await ensureSeeded();
    const { slug } = await context.params;
    const product = await Product.findOne({ slug }).lean();
    if (!product) {
      return NextResponse.json(
        { ok: false, error: "Product not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ ok: true, product });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch product";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { ok: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    await connectDB();
    const { slug } = await context.params;
    const body = await request.json();

    const updates: Record<string, unknown> = {};
    if (body.title !== undefined) updates.title = String(body.title).trim();
    if (body.brand !== undefined) updates.brand = String(body.brand).trim();
    if (body.price !== undefined) updates.price = Math.max(0, Number(body.price));
    if (body.salePrice !== undefined) {
      updates.salePrice =
        body.salePrice !== "" && body.salePrice !== null && Number(body.salePrice) > 0
          ? Number(body.salePrice)
          : null;
    }
    if (body.unit && ["item", "sheet", "sq.ft"].includes(body.unit)) {
      updates.unit = body.unit;
    }
    if (body.stock !== undefined) updates.stock = Math.max(0, Number(body.stock));
    if (body.category !== undefined) updates.category = String(body.category).trim();
    if (body.description !== undefined) updates.description = String(body.description).trim();
    if (body.image !== undefined) updates.image = String(body.image).trim();
    if (body.sku !== undefined) updates.sku = String(body.sku).trim();
    if (body.dimensions !== undefined) updates.dimensions = String(body.dimensions).trim();
    if (body.thickness !== undefined) updates.thickness = String(body.thickness).trim();
    if (body.material !== undefined) updates.material = String(body.material).trim();
    if (body.finish !== undefined) updates.finish = String(body.finish).trim();
    if (body.warranty !== undefined) updates.warranty = String(body.warranty).trim();
    if (body.deliveryEstimate !== undefined) {
      updates.deliveryEstimate = String(body.deliveryEstimate).trim();
    }
    if (body.rating !== undefined) {
      updates.rating = Math.min(5, Math.max(1, Number(body.rating)));
    }
    if (Array.isArray(body.tags)) {
      updates.tags = body.tags.map((t: unknown) => String(t).trim()).filter(Boolean);
    }
    if (Array.isArray(body.gallery)) {
      updates.gallery = body.gallery.map((g: unknown) => String(g).trim()).filter(Boolean);
    }
    if (body.featured !== undefined) updates.featured = Boolean(body.featured);

    const product = await Product.findOneAndUpdate(
      { slug },
      { $set: updates },
      { new: true }
    ).lean();

    if (!product) {
      return NextResponse.json(
        { ok: false, error: "Product not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ ok: true, product });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update product";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { ok: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    await connectDB();
    const { slug } = await context.params;
    const deleted = await Product.findOneAndDelete({ slug }).lean();
    if (!deleted) {
      return NextResponse.json(
        { ok: false, error: "Product not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ ok: true, deleted: slug });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete product";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

