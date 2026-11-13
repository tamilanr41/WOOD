import { connectDB } from "@/lib/mongodb";
import { products as staticProducts, IMG, type Product as StaticProduct } from "@/lib/data";
import { Product, type PricingUnit } from "@/models/Product";
import { StoreSettings } from "@/models/StoreSettings";

const DEFAULT_TAGS_BY_CATEGORY: Record<string, string[]> = {
  "Living Room": ["furniture", "handcrafted", "interior"],
  Bedroom: ["storage", "solid wood", "custom"],
  "Modular Kitchen": ["modular", "plywood", "laminates"],
  "Table & Chair": ["dining", "oak", "furniture"],
  "Stairs & Railings": ["joinery", "architectural", "timber"],
};

let seedPromise: Promise<{ productsSeeded: number }> | null = null;

/**
 * Idempotently seeds MongoDB with initial catalog products and default store settings.
 * Note: Admin accounts are never auto-seeded with hardcoded passwords; use `npm run create-admin`.
 */
export async function ensureSeeded(): Promise<{ productsSeeded: number }> {
  if (seedPromise) return seedPromise;

  seedPromise = (async () => {
    await connectDB();

    let productsSeeded = 0;
    const existingCount = await Product.countDocuments();
    if (existingCount === 0) {
      const docs = staticProducts.map((p, index) => ({
        slug: p.slug,
        title: p.title,
        brand: "Mariya Plywoods",
        price: p.price,
        salePrice: null,
        unit: "item" as PricingUnit,
        category: p.category,
        image: p.image,
        gallery: [p.image, IMG.shop[0], IMG.shop[4], IMG.shop[2]],
        rating: p.rating,
        stock: 20,
        sku: `MP-${String(index + 1).padStart(3, "0")}`,
        dimensions: "Standard Custom Fit",
        thickness: p.category === "Modular Kitchen" ? "18 mm BWR" : "Solid Timber",
        material: p.category === "Modular Kitchen" ? "BWR Marine Plywood & Laminate" : "Kiln-Dried Solid Oak / Teak",
        finish: "Natural Satin Oil",
        warranty: "2 Years",
        deliveryEstimate: "3–5 business days",
        options: {
          sizes: ["Standard", "Compact", "Large"],
          finishes: ["Natural Matte", "Walnut Stain", "Teak Gloss"],
          colors: ["Natural Oak", "Warm Walnut", "Cream"],
          customDimensionsAllowed: true,
        },
        tags: DEFAULT_TAGS_BY_CATEGORY[p.category] ?? ["woodwork", "quality"],
        description: p.description,
        featured: index < 6,
      }));
      await Product.insertMany(docs);
      productsSeeded = docs.length;
    }

    const existingSettings = await StoreSettings.findOne({ key: "default" }).lean();
    if (!existingSettings) {
      await StoreSettings.create({ key: "default" });
    }

    return { productsSeeded };
  })().finally(() => {
    seedPromise = null;
  });

  return seedPromise;
}

export type CatalogProduct = StaticProduct & {
  brand?: string;
  salePrice?: number | null;
  unit?: PricingUnit;
  stock?: number;
  sku?: string;
  dimensions?: string;
  thickness?: string;
  material?: string;
  finish?: string;
  warranty?: string;
  deliveryEstimate?: string;
  options?: {
    sizes: string[];
    finishes: string[];
    colors: string[];
    customDimensionsAllowed: boolean;
  };
  tags?: string[];
  gallery?: string[];
  featured?: boolean;
};

function mapProductDoc(d: Record<string, unknown>): CatalogProduct {
  return {
    slug: String(d.slug),
    title: String(d.title),
    brand: d.brand ? String(d.brand) : "Mariya Plywoods",
    price: Number(d.price),
    salePrice: d.salePrice != null ? Number(d.salePrice) : null,
    unit: (d.unit as PricingUnit) || "item",
    category: String(d.category),
    image: String(d.image),
    rating: Number(d.rating ?? 5),
    description: String(d.description),
    stock: Number(d.stock ?? 20),
    sku: d.sku ? String(d.sku) : "",
    dimensions: d.dimensions ? String(d.dimensions) : "",
    thickness: d.thickness ? String(d.thickness) : "",
    material: d.material ? String(d.material) : "",
    finish: d.finish ? String(d.finish) : "",
    warranty: d.warranty ? String(d.warranty) : "2 Years",
    deliveryEstimate: d.deliveryEstimate ? String(d.deliveryEstimate) : "3–5 business days",
    options: (d.options as CatalogProduct["options"]) ?? undefined,
    tags: Array.isArray(d.tags) ? (d.tags as string[]) : [],
    gallery: Array.isArray(d.gallery) ? (d.gallery as string[]) : [],
    featured: Boolean(d.featured),
  };
}

export async function getCatalogProducts(): Promise<{
  products: CatalogProduct[];
  source: "mongodb" | "fallback";
}> {
  try {
    await ensureSeeded();
    const docs = await Product.find({}).sort({ createdAt: 1 }).lean();
    return {
      source: "mongodb",
      products: docs.map((d) => mapProductDoc(d as unknown as Record<string, unknown>)),
    };
  } catch {
    return {
      source: "fallback",
      products: staticProducts,
    };
  }
}

export async function getCatalogProductBySlug(
  slug: string
): Promise<CatalogProduct | null> {
  try {
    await ensureSeeded();
    const d = await Product.findOne({ slug }).lean();
    if (!d) return null;
    return mapProductDoc(d as unknown as Record<string, unknown>);
  } catch {
    return staticProducts.find((p) => p.slug === slug) ?? null;
  }
}
