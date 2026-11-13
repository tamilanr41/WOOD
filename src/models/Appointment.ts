import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IAppointment extends Document {
  firstName: string;
  lastName: string;
  phone: string;
  service: string;
  preferredDate?: string;
  notes?: string;
  status: "pending" | "confirmed" | "completed";
  createdAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    service: { type: String, required: true, trim: true },
    preferredDate: { type: String, trim: true, default: "" },
    notes: { type: String, trim: true, default: "" },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const Appointment: Model<IAppointment> =
  mongoose.models.Appointment ||
  mongoose.model<IAppointment>("Appointment", AppointmentSchema);

