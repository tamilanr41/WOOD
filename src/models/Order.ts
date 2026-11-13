import mongoose, { Schema, type Document, type Model } from "mongoose";

export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type PaymentMethod = "razorpay" | "cod" | "bank_transfer";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface IOrderItem {
  productId?: mongoose.Types.ObjectId;
  slug: string;
  title: string;
  price: number;
  unit?: string;
  image: string;
  qty: number;
  selectedOptions?: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  idempotencyKey?: string;
  userId?: mongoose.Types.ObjectId | null;
  customer: {
    firstName: string;
    lastName: string;
    company?: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postcode: string;
    notes?: string;
  };
  deliveryMethod: "delivery" | "pickup";
  items: IOrderItem[];
  couponCode?: string;
  discount: number;
  subtotal: number;
  shipping: number;
  taxAmount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  status: OrderStatus;
  tracking?: {
    carrier?: string;
    trackingNumber?: string;
    trackingUrl?: string;
    currentLocation?: string;
    estimatedDelivery?: string;
    note?: string;
    updatedAt?: Date;
  };
  returnRequest?: {
    requested: boolean;
    reason: string;
    status: "none" | "pending" | "approved" | "rejected" | "refunded";
    requestedAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    idempotencyKey: { type: String, sparse: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    customer: {
      firstName: { type: String, required: true, trim: true },
      lastName: { type: String, required: true, trim: true },
      company: { type: String, trim: true, default: "" },
      email: { type: String, required: true, lowercase: true, trim: true },
      phone: { type: String, required: true, trim: true },
      address: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      postcode: { type: String, required: true, trim: true },
      notes: { type: String, trim: true, default: "" },
    },
    deliveryMethod: {
      type: String,
      enum: ["delivery", "pickup"],
      default: "delivery",
    },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: "Product" },
        slug: { type: String, required: true },
        title: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        unit: { type: String, default: "item" },
        image: { type: String, required: true },
        qty: { type: Number, required: true, min: 1 },
        selectedOptions: { type: String, default: "" },
      },
    ],
    couponCode: { type: String, default: "" },
    discount: { type: Number, default: 0, min: 0 },
    subtotal: { type: Number, required: true, min: 0 },
    shipping: { type: Number, required: true, min: 0 },
    taxAmount: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    paymentMethod: {
      type: String,
      enum: ["razorpay", "cod", "bank_transfer"],
      default: "razorpay",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    razorpayOrderId: { type: String, default: "" },
    razorpayPaymentId: { type: String, default: "" },
    razorpaySignature: { type: String, default: "" },
    status: {
      type: String,
      enum: [
        "pending",
        "paid",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
      ],
      default: "pending",
    },
    tracking: {
      carrier: { type: String, trim: true, default: "" },
      trackingNumber: { type: String, trim: true, default: "" },
      trackingUrl: { type: String, trim: true, default: "" },
      currentLocation: { type: String, trim: true, default: "" },
      estimatedDelivery: { type: String, trim: true, default: "" },
      note: { type: String, trim: true, default: "" },
      updatedAt: { type: Date },
    },
    returnRequest: {
      requested: { type: Boolean, default: false },
      reason: { type: String, default: "" },
      status: {
        type: String,
        enum: ["none", "pending", "approved", "rejected", "refunded"],
        default: "none",
      },
      requestedAt: { type: Date },
    },
  },
  { timestamps: true }
);

export const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
