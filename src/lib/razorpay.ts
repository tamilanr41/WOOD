import crypto from "node:crypto";

export function isRazorpayConfigured(): boolean {
  return Boolean(
    process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
  );
}

export function getRazorpayPublicKey(): string {
  return process.env.RAZORPAY_KEY_ID || "";
}

export async function createRazorpayOrder(params: {
  amountInRupees: number;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<{
  id: string;
  amount: number;
  currency: string;
  mode: "razorpay" | "simulated_test";
}> {
  const amountPaise = Math.round(params.amountInRupees * 100);
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    // Test-mode fallback when Razorpay credentials are not yet configured
    return {
      id: `order_test_${Date.now()}`,
      amount: amountPaise,
      currency: "INR",
      mode: "simulated_test",
    };
  }

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: amountPaise,
      currency: "INR",
      receipt: params.receipt,
      notes: params.notes ?? {},
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Razorpay order creation failed: ${errText}`);
  }

  const data = await res.json();
  return {
    id: data.id,
    amount: data.amount,
    currency: data.currency,
    mode: "razorpay",
  };
}

export function verifyRazorpayPaymentSignature(params: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): boolean {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    // Allow simulated test-mode verification only when no live/test keys exist
    return params.razorpayOrderId.startsWith("order_test_");
  }

  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(`${params.razorpayOrderId}|${params.razorpayPaymentId}`)
    .digest("hex");

  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(params.razorpaySignature, "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function verifyRazorpayWebhookSignature(
  rawBody: string,
  signatureHeader: string
): boolean {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret || !signatureHeader) return false;

  const expected = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signatureHeader, "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

