import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IContactMessage extends Document {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  status: "new" | "replied";
  createdAt: Date;
}

const ContactMessageSchema = new Schema<IContactMessage>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true, default: "" },
    subject: { type: String, trim: true, default: "" },
    message: { type: String, required: true, trim: true },
    status: { type: String, enum: ["new", "replied"], default: "new" },
  },
  { timestamps: true }
);

export const ContactMessage: Model<IContactMessage> =
  mongoose.models.ContactMessage ||
  mongoose.model<IContactMessage>("ContactMessage", ContactMessageSchema);

