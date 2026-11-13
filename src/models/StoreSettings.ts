import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IStoreSettings extends Document {
  key: string;
  shippingCharge: number;
  freeShippingThreshold: number;
  estimatedDeliveryDays: string;
  enablePickup: boolean;
  enableCod: boolean;
  enableBankTransfer: boolean;
  bankDetails: string;
  taxEnabled: boolean;
  taxLabel: string;
  taxRatePercent: number;
  gstin: string;
  deliveryZones: string[];
  updatedAt: Date;
}

const StoreSettingsSchema = new Schema<IStoreSettings>(
  {
    key: { type: String, required: true, unique: true, default: "default" },
    shippingCharge: { type: Number, default: 250, min: 0 },
    freeShippingThreshold: { type: Number, default: 47000, min: 0 },
    estimatedDeliveryDays: { type: String, default: "3–5 business days" },
    enablePickup: { type: Boolean, default: true },
    enableCod: { type: Boolean, default: true },
    enableBankTransfer: { type: Boolean, default: false },
    bankDetails: {
      type: String,
      default: "Configure your store bank account details in Admin Settings.",
    },
    taxEnabled: { type: Boolean, default: false },
    taxLabel: { type: String, default: "GST" },
    taxRatePercent: { type: Number, default: 0, min: 0, max: 50 },
    gstin: { type: String, default: "" },
    deliveryZones: {
      type: [String],
      default: ["Erode", "Coimbatore", "Salem", "Tiruppur", "Tamil Nadu"],
    },
  },
  { timestamps: true }
);

export const StoreSettings: Model<IStoreSettings> =
  mongoose.models.StoreSettings ||
  mongoose.model<IStoreSettings>("StoreSettings", StoreSettingsSchema);

