export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ sent: boolean; skipped?: boolean }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    return { sent: false, skipped: true };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [params.to],
        subject: params.subject,
        html: params.html,
      }),
    });
    return { sent: res.ok };
  } catch {
    return { sent: false };
  }
}

export async function sendOrderConfirmationEmail(order: {
  orderNumber: string;
  total: number;
  paymentMethod: string;
  customer: { firstName: string; email: string };
  items: { title: string; qty: number; price: number }[];
}) {
  const rows = order.items
    .map(
      (i) =>
        `<li>${i.title} × ${i.qty} — ₹${(i.price * i.qty).toLocaleString("en-IN")}</li>`
    )
    .join("");

  return sendEmail({
    to: order.customer.email,
    subject: `Order Confirmed: ${order.orderNumber} — Mariya Plywoods Furniture`,
    html: `
      <h2>Thank you for your order, ${order.customer.firstName}!</h2>
      <p>Your order <strong>${order.orderNumber}</strong> has been received.</p>
      <ul>${rows}</ul>
      <p><strong>Total:</strong> ₹${order.total.toLocaleString("en-IN")} (${order.paymentMethod.toUpperCase()})</p>
      <p>You can track your order and download your invoice from your account page.</p>
    `,
  });
}

export async function sendOrderStatusEmail(order: {
  orderNumber: string;
  status: string;
  customer: { firstName: string; email: string };
}) {
  return sendEmail({
    to: order.customer.email,
    subject: `Order ${order.orderNumber} Status Update: ${order.status.toUpperCase()}`,
    html: `
      <p>Hello ${order.customer.firstName},</p>
      <p>Your order <strong>${order.orderNumber}</strong> status is now: <strong>${order.status.toUpperCase()}</strong>.</p>
      <p>Thank you for shopping with Mariya Plywoods Furniture.</p>
    `,
  });
}

