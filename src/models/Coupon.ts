import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface ICoupon extends Document {
  code: string;
  type: "percent" | "fixed";
  value: number;
  minOrderAmount: number;
  maxDiscount: number;
  active: boolean;
  expiresAt?: Date | null;
  usedCount: number;
  createdAt: Date;
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ["percent", "fixed"], default: "percent" },
    value: { type: Number, required: true, min: 0 },
    minOrderAmount: { type: Number, default: 0, min: 0 },
    maxDiscount: { type: Number, default: 0, min: 0 },
    active: { type: Boolean, default: true },
    expiresAt: { type: Date, default: null },
    usedCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Coupon: Model<ICoupon> =
  mongoose.models.Coupon || mongoose.model<ICoupon>("Coupon", CouponSchema);

