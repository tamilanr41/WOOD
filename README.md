# Mariya Plywoods Furniture — Full-Stack E-Commerce Platform

A full-stack Next.js (App Router) + MongoDB (Mongoose) + Razorpay e-commerce platform for **Mariya Plywoods Furniture** (plywoods, laminates, custom furniture, and home interiors).

---

## 1. Local Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env.local` and configure your environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Required variables:
   - `MONGODB_URI` — Local MongoDB (`mongodb://127.0.0.1:27017/mariya_plywoods`) or MongoDB Atlas URI.
   - `JWT_SECRET` — A random 32+ character string for signing HTTP-only session cookies.
   - `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET` — Razorpay **Test Mode** keys (leave blank to use the built-in simulated test-mode checkout).
   - `RAZORPAY_WEBHOOK_SECRET` — Secret configured in Razorpay Dashboard -> Webhooks.

3. Start the development server:
   ```bash
   npm run dev
   ```
   The product catalog and default store settings are automatically seeded on first database request (`src/lib/seed.ts`).

---

## 2. Creating the First Administrator

Public admin registration is disabled. Create or promote your first admin account securely from the terminal:

```bash
npm run create-admin -- admin@mariyaplywoods.com "StrongPass@123" "Store Admin"
```

Then sign in at `/my-account` and open `/admin`.

---

## 3. Razorpay Payment & Webhook Configuration

1. In your **Razorpay Dashboard (Test Mode)**, copy `Key ID` and `Key Secret` into `.env.local`.
2. Add a Webhook pointing to:
   ```
   https://<your-domain>/api/payments/razorpay/webhook
   ```
   Subscribe to events: `payment.captured`, `payment.failed`, and `refund.processed`.
3. Copy the Webhook Secret into `RAZORPAY_WEBHOOK_SECRET`.
4. All prices, discounts, shipping, tax, and payment signature verifications are performed strictly on the server (`/api/payments/razorpay/order`, `/api/payments/razorpay/verify`, `/api/payments/razorpay/webhook`).

---

## 4. Deployment: Static Netlify Drop vs Full-Stack Netlify

- **Static Netlify Drop (`output: "export"`)**: Suitable **only** for a static brochure/catalog preview. It does **not** support Next.js API routes, server-side authentication cookies, MongoDB connections, local image uploads, or Razorpay signature/webhook verification.
- **Full-Stack Deployment (Recommended & Configured)**:
  1. Push this repository to GitHub/GitLab.
  2. Connect the repository in **Netlify** (configured via `netlify.toml` with `@netlify/plugin-nextjs`).
  3. Set `MONGODB_URI`, `JWT_SECRET`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET` in Netlify Site Environment Variables.
  4. Deploy. Netlify will run `npm run build` and provision serverless/edge functions for all API routes and dynamic SSR pages.

