import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: "customer" | "admin";
  phone?: string;
  savedAddress?: {
    company?: string;
    address?: string;
    city?: string;
    postcode?: string;
  };
  wishlist: string[];
  notificationPrefs: {
    orderUpdates: boolean;
    promotions: boolean;
  };
  resetTokenHash?: string;
  resetTokenExpires?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },
    phone: { type: String, trim: true, default: "" },
    savedAddress: {
      company: { type: String, trim: true, default: "" },
      address: { type: String, trim: true, default: "" },
      city: { type: String, trim: true, default: "" },
      postcode: { type: String, trim: true, default: "" },
    },
    wishlist: { type: [String], default: [] },
    notificationPrefs: {
      orderUpdates: { type: Boolean, default: true },
      promotions: { type: Boolean, default: false },
    },
    resetTokenHash: { type: String, default: "" },
    resetTokenExpires: { type: Date, default: null },
  },
  { timestamps: true }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
