import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/auth";
import { Review } from "@/models/Review";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    if (!slug) {
      return NextResponse.json({ ok: true, reviews: [] });
    }
    await connectDB();
    const reviews = await Review.find({ productSlug: slug })
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json({ ok: true, reviews });
  } catch {
    return NextResponse.json({ ok: true, reviews: [] });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const session = await getSessionUser();
    const body = await request.json();

    const productSlug = String(body.productSlug ?? "").trim();
    const userName = String(body.userName ?? session?.name ?? "").trim();
    const rating = Math.min(5, Math.max(1, Math.round(Number(body.rating ?? 5))));
    const comment = String(body.comment ?? "").trim();

    if (!productSlug || !userName || !comment) {
      return NextResponse.json(
        { ok: false, error: "Name, rating, and review comment are required" },
        { status: 400 }
      );
    }

    const review = await Review.create({
      productSlug,
      userId: session?.userId ?? null,
      userName,
      rating,
      comment,
    });

    return NextResponse.json({ ok: true, review }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to submit review";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

