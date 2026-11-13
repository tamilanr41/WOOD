import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IReview extends Document {
  productSlug: string;
  userId?: mongoose.Types.ObjectId | null;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    productSlug: { type: String, required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    userName: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export const Review: Model<IReview> =
  mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema);

