import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { getSessionUser } from "@/lib/auth";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

async function uploadToCloudinary(file: File): Promise<string> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME!;
  const apiKey = process.env.CLOUDINARY_API_KEY!;
  const apiSecret = process.env.CLOUDINARY_API_SECRET!;
  const folder = "mariya-plywoods/products";
  const timestamp = Math.floor(Date.now() / 1000);

  const signatureBase = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto
    .createHash("sha1")
    .update(signatureBase)
    .digest("hex");

  const body = new FormData();
  body.append("file", file);
  body.append("api_key", apiKey);
  body.append("timestamp", String(timestamp));
  body.append("folder", folder);
  body.append("signature", signature);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body }
  );

  const data = await res.json();
  if (!res.ok || !data.secure_url) {
    throw new Error(data?.error?.message || "Cloudinary upload failed");
  }
  return data.secure_url as string;
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

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { ok: false, error: "Please select an image file to upload" },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Unsupported file type. Please upload JPG, PNG, WebP, GIF, or AVIF.",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { ok: false, error: "Image is too large. Maximum size is 5 MB." },
        { status: 400 }
      );
    }

    // Use Cloudinary in production when configured
    if (
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    ) {
      const url = await uploadToCloudinary(file);
      return NextResponse.json({ ok: true, url, storage: "cloudinary" }, { status: 201 });
    }

    // Local disk fallback for local development
    const ext = path.extname(file.name).toLowerCase() || ".jpg";
    const baseName =
      path
        .basename(file.name, ext)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
        .slice(0, 40) || "product";

    const fileName = `${Date.now()}-${baseName}${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
    await mkdir(uploadDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, fileName), buffer);

    return NextResponse.json(
      { ok: true, url: `/uploads/products/${fileName}`, storage: "local" },
      { status: 201 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to upload image";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
