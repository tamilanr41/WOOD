import mongoose, { Schema, type Document, type Model } from "mongoose";

export type PricingUnit = "item" | "sheet" | "sq.ft";

export interface IProduct extends Document {
  slug: string;
  title: string;
  brand: string;
  price: number;
  salePrice?: number | null;
  unit: PricingUnit;
  category: string;
  image: string;
  gallery: string[];
  rating: number;
  stock: number;
  sku: string;
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
  tags: string[];
  description: string;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true, trim: true },
    brand: { type: String, trim: true, default: "Mariya Plywoods" },
    price: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, default: null, min: 0 },
    unit: {
      type: String,
      enum: ["item", "sheet", "sq.ft"],
      default: "item",
    },
    category: { type: String, required: true, trim: true },
    image: { type: String, required: true },
    gallery: { type: [String], default: [] },
    rating: { type: Number, default: 5, min: 1, max: 5 },
    stock: { type: Number, default: 20, min: 0 },
    sku: { type: String, trim: true, default: "" },
    dimensions: { type: String, trim: true, default: "" },
    thickness: { type: String, trim: true, default: "" },
    material: { type: String, trim: true, default: "Solid Wood / BWR Plywood" },
    finish: { type: String, trim: true, default: "Natural Matte" },
    warranty: { type: String, trim: true, default: "2 Years" },
    deliveryEstimate: { type: String, trim: true, default: "3–5 business days" },
    options: {
      sizes: { type: [String], default: [] },
      finishes: { type: [String], default: [] },
      colors: { type: [String], default: [] },
      customDimensionsAllowed: { type: Boolean, default: false },
    },
    tags: { type: [String], default: [] },
    description: { type: String, required: true },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ProductSchema.index({ title: "text", category: "text", description: "text" });

export const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);
