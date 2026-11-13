import { Product } from "@/models/Product";
import { Coupon } from "@/models/Coupon";
import { StoreSettings } from "@/models/StoreSettings";
import type { IOrderItem } from "@/models/Order";

export type RawOrderItemInput = {
  slug: string;
  qty: number;
  selectedOptions?: string;
};

export async function calculateServerOrder(params: {
  rawItems: RawOrderItemInput[];
  couponCode?: string;
  deliveryMethod: "delivery" | "pickup";
}) {
  const slugs = params.rawItems.map((i) => String(i.slug ?? ""));
  const dbProducts = await Product.find({ slug: { $in: slugs } });
  const productMap = new Map(dbProducts.map((p) => [p.slug, p]));

  const items: IOrderItem[] = [];
  let subtotal = 0;

  for (const raw of params.rawItems) {
    const slug = String(raw.slug ?? "");
    const qty = Math.floor(Number(raw.qty));
    const product = productMap.get(slug);

    if (!product || !Number.isFinite(qty) || qty < 1) {
      throw new Error(`Invalid product or quantity: ${slug}`);
    }
    if (product.stock < qty) {
      throw new Error(
        `Only ${product.stock} left in stock for ${product.title}`
      );
    }

    const effectivePrice =
      product.salePrice != null && product.salePrice > 0 && product.salePrice < product.price
        ? product.salePrice
        : product.price;

    items.push({
      productId: product._id,
      slug: product.slug,
      title: product.title,
      price: effectivePrice,
      unit: product.unit || "item",
      image: product.image,
      qty,
      selectedOptions: String(raw.selectedOptions ?? "").trim(),
    });
    subtotal += effectivePrice * qty;
  }

  let discount = 0;
  let appliedCoupon = "";
  if (params.couponCode?.trim()) {
    const code = params.couponCode.trim().toUpperCase();
    const coupon = await Coupon.findOne({ code, active: true }).lean();
    if (
      coupon &&
      (!coupon.expiresAt || new Date(coupon.expiresAt) >= new Date()) &&
      subtotal >= coupon.minOrderAmount
    ) {
      discount =
        coupon.type === "percent"
          ? Math.round((subtotal * coupon.value) / 100)
          : coupon.value;
      if (coupon.maxDiscount > 0) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
      discount = Math.min(discount, subtotal);
      appliedCoupon = coupon.code;
    }
  }

  const settings = (await StoreSettings.findOne({ key: "default" }).lean()) ?? {
    shippingCharge: 250,
    freeShippingThreshold: 47000,
    taxEnabled: false,
    taxRatePercent: 0,
    enableCod: true,
    enableBankTransfer: false,
    enablePickup: true,
  };

  const discountedSubtotal = Math.max(0, subtotal - discount);
  const shipping =
    params.deliveryMethod === "pickup"
      ? 0
      : discountedSubtotal >= settings.freeShippingThreshold
      ? 0
      : settings.shippingCharge;

  const taxAmount = settings.taxEnabled
    ? Math.round((discountedSubtotal * settings.taxRatePercent) / 100)
    : 0;

  const total = discountedSubtotal + shipping + taxAmount;

  return {
    items,
    subtotal,
    discount,
    appliedCoupon,
    shipping,
    taxAmount,
    total,
    settings,
  };
}

/**
 * Atomically decrement stock for each item, guarding against overselling.
 * Rolls back previously decremented items if any item lacks sufficient stock.
 */
export async function reserveStockAtomically(items: IOrderItem[]): Promise<void> {
  const decremented: IOrderItem[] = [];
  for (const item of items) {
    const res = await Product.updateOne(
      { _id: item.productId, stock: { $gte: item.qty } },
      { $inc: { stock: -item.qty } }
    );
    if (res.modifiedCount === 0) {
      // Roll back
      await Promise.all(
        decremented.map((d) =>
          Product.updateOne({ _id: d.productId }, { $inc: { stock: d.qty } })
        )
      );
      throw new Error(`Insufficient stock for ${item.title}`);
    }
    decremented.push(item);
  }
}

export async function restoreStock(items: IOrderItem[]): Promise<void> {
  await Promise.all(
    items.map((item) =>
      Product.updateOne(
        { slug: item.slug },
        { $inc: { stock: item.qty } }
      )
    )
  );
}

