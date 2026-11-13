import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ensureSeeded } from "@/lib/seed";
import { getSessionUser } from "@/lib/auth";
import { Product } from "@/models/Product";

export async function GET(request: Request) {
  try {
    await ensureSeeded();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const q = searchParams.get("q")?.trim();
    const tag = searchParams.get("tag")?.trim();
    const sort = searchParams.get("sort") ?? "default";

    const filter: Record<string, unknown> = {};
    if (category && category !== "All") {
      filter.category = category;
    }
    if (tag) {
      filter.tags = tag;
    }
    if (q) {
      const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [
        { title: regex },
        { category: regex },
        { description: regex },
        { tags: regex },
      ];
    }

    const sortMap: Record<string, Record<string, 1 | -1>> = {
      default: { createdAt: 1 },
      "price-asc": { price: 1 },
      "price-desc": { price: -1 },
      name: { title: 1 },
    };

    const items = await Product.find(filter)
      .sort(sortMap[sort] ?? sortMap.default)
      .lean();

    return NextResponse.json({ ok: true, products: items });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch products";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
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

    const title = String(body.title ?? "").trim();
    const category = String(body.category ?? "").trim();
    const description = String(body.description ?? "").trim();
    const image = String(body.image ?? "").trim();
    const price = Number(body.price);
    const stock = body.stock !== undefined ? Number(body.stock) : 20;
    const rating = body.rating !== undefined ? Number(body.rating) : 5;

    if (!title || !category || !description || !image || !Number.isFinite(price) || price < 0) {
      return NextResponse.json(
        { ok: false, error: "Title, category, price, image, and description are required" },
        { status: 400 }
      );
    }

    const rawSlug = String(body.slug ?? title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const existing = await Product.findOne({ slug: rawSlug }).lean();
    const slug = existing ? `${rawSlug}-${Date.now().toString().slice(-4)}` : rawSlug;

    const tags = Array.isArray(body.tags)
      ? body.tags.map((t: unknown) => String(t).trim()).filter(Boolean)
      : [];

    const product = await Product.create({
      slug,
      title,
      brand: String(body.brand ?? "Mariya Plywoods").trim(),
      price,
      salePrice:
        body.salePrice !== undefined && body.salePrice !== "" && Number(body.salePrice) > 0
          ? Number(body.salePrice)
          : null,
      unit: ["item", "sheet", "sq.ft"].includes(body.unit) ? body.unit : "item",
      category,
      image,
      gallery: Array.isArray(body.gallery) && body.gallery.length ? body.gallery : [image],
      rating: Math.min(5, Math.max(1, rating)),
      stock: Math.max(0, stock),
      sku: String(body.sku ?? `MP-${Date.now().toString().slice(-5)}`),
      dimensions: String(body.dimensions ?? "").trim(),
      thickness: String(body.thickness ?? "").trim(),
      material: String(body.material ?? "").trim(),
      finish: String(body.finish ?? "").trim(),
      warranty: String(body.warranty ?? "2 Years").trim(),
      deliveryEstimate: String(body.deliveryEstimate ?? "3–5 business days").trim(),
      tags,
      description,
      featured: Boolean(body.featured),
    });

    return NextResponse.json({ ok: true, product }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create product";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

