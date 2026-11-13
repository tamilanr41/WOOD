"use client";

import Link from "next/link";
import { useMemo, useEffect, useState } from "react";
import { categories, IMG } from "@/lib/data";
import { money } from "@/lib/format";
import OrderTracker, { type OrderTrackingInfo } from "@/components/OrderTracker";

type Order = {
  _id: string;
  orderNumber: string;
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
  deliveryMethod?: string;
  items: {
    slug: string;
    title: string;
    price: number;
    qty: number;
    selectedOptions?: string;
  }[];
  couponCode?: string;
  discount?: number;
  subtotal: number;
  shipping: number;
  taxAmount?: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  tracking?: OrderTrackingInfo;
  returnRequest?: {
    requested: boolean;
    reason: string;
    status: string;
  };
  createdAt: string;
};

type Product = {
  _id: string;
  slug: string;
  title: string;
  brand?: string;
  price: number;
  salePrice?: number | null;
  unit?: "item" | "sheet" | "sq.ft";
  category: string;
  image: string;
  gallery?: string[];
  rating?: number;
  stock: number;
  sku?: string;
  dimensions?: string;
  thickness?: string;
  material?: string;
  finish?: string;
  warranty?: string;
  deliveryEstimate?: string;
  tags?: string[];
  description: string;
  featured?: boolean;
};

type ContactMsg = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  status?: "new" | "replied";
  createdAt: string;
};

type Appointment = {
  _id: string;
  firstName: string;
  lastName: string;
  phone: string;
  service: string;
  notes?: string;
  status?: "pending" | "confirmed" | "completed";
  createdAt: string;
};

type CouponItem = {
  _id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  minOrderAmount: number;
  maxDiscount: number;
  active: boolean;
  usedCount: number;
};

type CustomerItem = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  createdAt: string;
};

type AuditItem = {
  _id: string;
  actorEmail: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  createdAt: string;
};

type SettingsState = {
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
  deliveryZonesText: string;
};

type ProductFormState = {
  title: string;
  brand: string;
  price: string;
  salePrice: string;
  unit: "item" | "sheet" | "sq.ft";
  category: string;
  stock: string;
  sku: string;
  rating: string;
  dimensions: string;
  thickness: string;
  material: string;
  finish: string;
  warranty: string;
  deliveryEstimate: string;
  tagsText: string;
  image: string;
  gallery: string[];
  description: string;
  featured: boolean;
};

const EMPTY_FORM: ProductFormState = {
  title: "",
  brand: "Mariya Plywoods",
  price: "",
  salePrice: "",
  unit: "item",
  category: categories[0],
  stock: "20",
  sku: "",
  rating: "5",
  dimensions: "",
  thickness: "",
  material: "",
  finish: "",
  warranty: "2 Years",
  deliveryEstimate: "3–5 business days",
  tagsText: "",
  image: IMG.shop[0],
  gallery: [],
  description: "",
  featured: false,
};

const STATUS_COLORS: Record<string, { bg: string; fg: string }> = {
  pending: { bg: "#fef3c7", fg: "#92400e" },
  paid: { bg: "#dcfce7", fg: "#166534" },
  confirmed: { bg: "#dbeafe", fg: "#1e40af" },
  processing: { bg: "#e0e7ff", fg: "#3730a3" },
  shipped: { bg: "#ede9fe", fg: "#5b21b6" },
  delivered: { bg: "#dcfce7", fg: "#166534" },
  completed: { bg: "#dcfce7", fg: "#166534" },
  replied: { bg: "#dcfce7", fg: "#166534" },
  approved: { bg: "#dbeafe", fg: "#1e40af" },
  new: { bg: "#fef3c7", fg: "#92400e" },
  cancelled: { bg: "#fee2e2", fg: "#991b1b" },
  refunded: { bg: "#f3e8ff", fg: "#6b21a8" },
  rejected: { bg: "#fee2e2", fg: "#991b1b" },
  failed: { bg: "#fee2e2", fg: "#991b1b" },
};

function Badge({ label }: { label: string }) {
  const style = STATUS_COLORS[label.toLowerCase()] ?? {
    bg: "#f3f4f6",
    fg: "#374151",
  };
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        textTransform: "capitalize",
        background: style.bg,
        color: style.fg,
      }}
    >
      {label}
    </span>
  );
}

const helperStyle: React.CSSProperties = {
  fontSize: 12,
  color: "#6d6f6c",
  marginTop: 4,
  display: "block",
};

export default function AdminDashboard() {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [tab, setTab] = useState<
    "orders" | "tracking" | "products" | "coupons" | "customers" | "reports"
  >("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [contacts, setContacts] = useState<ContactMsg[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditItem[]>([]);
  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);

  // Filters
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [productSearch, setProductSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [dateRange, setDateRange] = useState<"all" | "7d" | "30d">("all");

  // Add / Edit Product State
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [prodForm, setProdForm] = useState<ProductFormState>(EMPTY_FORM);

  // Coupon Form
  const [couponForm, setCouponForm] = useState({
    code: "",
    type: "percent" as "percent" | "fixed",
    value: "",
    minOrderAmount: "0",
    maxDiscount: "0",
  });

  // Store Settings Form
  const [settingsForm, setSettingsForm] = useState<SettingsState>({
    shippingCharge: 250,
    freeShippingThreshold: 47000,
    estimatedDeliveryDays: "3–5 business days",
    enablePickup: true,
    enableCod: true,
    enableBankTransfer: false,
    bankDetails: "",
    taxEnabled: false,
    taxLabel: "GST",
    taxRatePercent: 0,
    gstin: "",
    deliveryZonesText: "Erode, Coimbatore, Salem, Tiruppur, Tamil Nadu",
  });

  async function loadAll() {
    try {
      const me = await fetch("/api/auth/me").then((r) => r.json());
      if (!me?.user || me.user.role !== "admin") {
        setAuthorized(false);
        return;
      }
      setAuthorized(true);

      const [
        ordRes,
        prodRes,
        conRes,
        appRes,
        coupRes,
        custRes,
        setRes,
        audRes,
      ] = await Promise.all([
        fetch("/api/orders").then((r) => r.json()),
        fetch("/api/products").then((r) => r.json()),
        fetch("/api/contacts").then((r) => r.json()),
        fetch("/api/appointments").then((r) => r.json()),
        fetch("/api/coupons").then((r) => r.json()),
        fetch("/api/admin/customers").then((r) => r.json()),
        fetch("/api/settings").then((r) => r.json()),
        fetch("/api/admin/audit").then((r) => r.json()),
      ]);
      if (ordRes?.ok) setOrders(ordRes.orders || []);
      if (prodRes?.ok) setProducts(prodRes.products || []);
      if (conRes?.ok) setContacts(conRes.messages || []);
      if (appRes?.ok) setAppointments(appRes.appointments || []);
      if (coupRes?.ok) setCoupons(coupRes.coupons || []);
      if (custRes?.ok) setCustomers(custRes.customers || []);
      if (audRes?.ok) setAuditLogs(audRes.logs || []);
      if (setRes?.ok && setRes.settings) {
        const s = setRes.settings;
        setSettingsForm({
          shippingCharge: s.shippingCharge ?? 250,
          freeShippingThreshold: s.freeShippingThreshold ?? 47000,
          estimatedDeliveryDays: s.estimatedDeliveryDays ?? "3–5 business days",
          enablePickup: s.enablePickup ?? true,
          enableCod: s.enableCod ?? true,
          enableBankTransfer: s.enableBankTransfer ?? false,
          bankDetails: s.bankDetails ?? "",
          taxEnabled: s.taxEnabled ?? false,
          taxLabel: s.taxLabel ?? "GST",
          taxRatePercent: s.taxRatePercent ?? 0,
          gstin: s.gstin ?? "",
          deliveryZonesText: (s.deliveryZones || []).join(", "),
        });
      }
    } catch {
      setAuthorized(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  // Date-filtered orders for reports/KPIs
  const dateFilteredOrders = useMemo(() => {
    if (dateRange === "all") return orders;
    const days = dateRange === "7d" ? 7 : 30;
    const cutoff = Date.now() - days * 86400_000;
    return orders.filter((o) => new Date(o.createdAt).getTime() >= cutoff);
  }, [orders, dateRange]);

  const totalRevenue = useMemo(
    () =>
      dateFilteredOrders
        .filter((o) => !["cancelled", "refunded"].includes(o.status))
        .reduce((sum, o) => sum + o.total, 0),
    [dateFilteredOrders]
  );
  const pendingOrders = useMemo(
    () => dateFilteredOrders.filter((o) => o.status === "pending").length,
    [dateFilteredOrders]
  );
  const lowStockCount = useMemo(
    () => products.filter((p) => p.stock <= 5).length,
    [products]
  );
  const pendingInquiries = useMemo(
    () =>
      appointments.filter((a) => (a.status || "pending") === "pending").length +
      contacts.filter((c) => (c.status || "new") === "new").length,
    [appointments, contacts]
  );

  const filteredOrders = useMemo(() => {
    const q = orderSearch.trim().toLowerCase();
    return orders.filter((o) => {
      if (orderStatusFilter !== "all" && o.status !== orderStatusFilter) {
        return false;
      }
      if (!q) return true;
      const fullName = `${o.customer.firstName} ${o.customer.lastName}`.toLowerCase();
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        fullName.includes(q) ||
        o.customer.email.toLowerCase().includes(q) ||
        o.customer.phone.toLowerCase().includes(q)
      );
    });
  }, [orders, orderSearch, orderStatusFilter]);

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.sku || "").toLowerCase().includes(q)
    );
  }, [products, productSearch]);

  const filteredCustomers = useMemo(() => {
    const q = customerSearch.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.phone || "").toLowerCase().includes(q)
    );
  }, [customers, customerSearch]);

  async function uploadImageFile(file: File): Promise<string | null> {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      setErrorMsg(data.error || "Image upload failed");
      return null;
    }
    return data.url as string;
  }

  async function handleMainImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMsg("");
    setStatusMsg("");
    setUploadingMain(true);
    try {
      const url = await uploadImageFile(file);
      if (url) {
        setProdForm((prev) => ({ ...prev, image: url }));
        setStatusMsg("Main product image uploaded from your computer!");
      }
    } finally {
      setUploadingMain(false);
      e.target.value = "";
    }
  }

  async function handleGalleryPick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setErrorMsg("");
    setStatusMsg("");
    setUploadingGallery(true);
    try {
      const uploaded: string[] = [];
      for (const file of files) {
        const url = await uploadImageFile(file);
        if (url) uploaded.push(url);
      }
      if (uploaded.length > 0) {
        setProdForm((prev) => ({
          ...prev,
          gallery: [...prev.gallery, ...uploaded],
        }));
        setStatusMsg(`${uploaded.length} gallery image(s) uploaded!`);
      }
    } finally {
      setUploadingGallery(false);
      e.target.value = "";
    }
  }

  function startEditProduct(p: Product) {
    setEditingSlug(p.slug);
    setErrorMsg("");
    setStatusMsg(`Editing "${p.title}" — update any field or upload a new photo.`);
    setProdForm({
      title: p.title,
      brand: p.brand || "Mariya Plywoods",
      price: String(p.price),
      salePrice: p.salePrice ? String(p.salePrice) : "",
      unit: p.unit || "item",
      category: p.category,
      stock: String(p.stock),
      sku: p.sku || "",
      rating: String(p.rating ?? 5),
      dimensions: p.dimensions || "",
      thickness: p.thickness || "",
      material: p.material || "",
      finish: p.finish || "",
      warranty: p.warranty || "2 Years",
      deliveryEstimate: p.deliveryEstimate || "3–5 business days",
      tagsText: (p.tags || []).join(", "),
      image: p.image,
      gallery: p.gallery || [],
      description: p.description,
      featured: Boolean(p.featured),
    });
    window.scrollTo({ top: 320, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingSlug(null);
    setProdForm(EMPTY_FORM);
    setErrorMsg("");
    setStatusMsg("");
  }

  async function handleSaveProduct(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setStatusMsg("");
    setSavingProduct(true);

    const payload = {
      title: prodForm.title,
      brand: prodForm.brand,
      price: Number(prodForm.price),
      salePrice: prodForm.salePrice ? Number(prodForm.salePrice) : null,
      unit: prodForm.unit,
      category: prodForm.category,
      stock: Number(prodForm.stock),
      sku: prodForm.sku,
      rating: Number(prodForm.rating),
      dimensions: prodForm.dimensions,
      thickness: prodForm.thickness,
      material: prodForm.material,
      finish: prodForm.finish,
      warranty: prodForm.warranty,
      deliveryEstimate: prodForm.deliveryEstimate,
      tags: prodForm.tagsText
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      image: prodForm.image,
      gallery: prodForm.gallery,
      description: prodForm.description,
      featured: prodForm.featured,
    };

    try {
      const endpoint = editingSlug
        ? `/api/products/${editingSlug}`
        : "/api/products";
      const method = editingSlug ? "PATCH" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setErrorMsg(data.error || "Could not save product");
        return;
      }

      if (editingSlug) {
        setProducts((prev) =>
          prev.map((p) => (p.slug === editingSlug ? data.product : p))
        );
        setStatusMsg(`Saved changes to "${data.product.title}"`);
        setEditingSlug(null);
      } else {
        setProducts((prev) => [...prev, data.product]);
        setStatusMsg(`Added new product "${data.product.title}"`);
      }
      setProdForm(EMPTY_FORM);
    } finally {
      setSavingProduct(false);
    }
  }

  async function updateStock(slug: string, stock: number) {
    const res = await fetch(`/api/products/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stock: Math.max(0, stock) }),
    });
    const data = await res.json();
    if (data?.ok) {
      setProducts((prev) =>
        prev.map((p) => (p.slug === slug ? data.product : p))
      );
      setStatusMsg(`Stock updated for "${data.product.title}" (${data.product.stock} left)`);
    }
  }

  async function deleteProduct(slug: string, title: string) {
    if (!window.confirm(`Delete "${title}" permanently from the store?`)) return;
    const res = await fetch(`/api/products/${slug}`, { method: "DELETE" });
    const data = await res.json();
    if (data?.ok) {
      setProducts((prev) => prev.filter((p) => p.slug !== slug));
      if (editingSlug === slug) cancelEdit();
      setStatusMsg(`Deleted "${title}"`);
    }
  }

  async function updateOrder(
    id: string,
    field: "status" | "paymentStatus" | "returnStatus",
    value: string
  ) {
    const res = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    const data = await res.json();
    if (data?.ok) {
      setOrders((prev) => prev.map((o) => (o._id === id ? data.order : o)));
      setStatusMsg(`Updated order ${data.order.orderNumber}`);
    }
  }

  async function saveOrderTracking(
    id: string,
    tracking: {
      carrier: string;
      trackingNumber: string;
      currentLocation: string;
      estimatedDelivery: string;
      trackingUrl: string;
      note: string;
    }
  ) {
    const res = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tracking }),
    });
    const data = await res.json();
    if (data?.ok) {
      setOrders((prev) => prev.map((o) => (o._id === id ? data.order : o)));
      setStatusMsg(`Updated tracking for ${data.order.orderNumber}`);
      return true;
    }
    setErrorMsg(data?.error || "Failed to update tracking");
    return false;
  }

  async function updateCustomerRole(userId: string, role: "customer" | "admin") {
    setErrorMsg("");
    const res = await fetch("/api/admin/customers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role }),
    });
    const data = await res.json();
    if (data?.ok) {
      setCustomers((prev) =>
        prev.map((c) => (c._id === userId ? { ...c, role: data.customer.role } : c))
      );
      setStatusMsg(`Updated role for ${data.customer.email} to ${data.customer.role}`);
    } else {
      setErrorMsg(data?.error || "Failed to update role");
    }
  }

  function printAdminInvoice(ord: Order) {
    const w = window.open("", "_blank", "width=760,height=900");
    if (!w) return;
    const rows = ord.items
      .map(
        (i) =>
          `<tr><td style="padding:8px;border-bottom:1px solid #ddd">${i.title}${
            i.selectedOptions ? ` (${i.selectedOptions})` : ""
          }</td><td style="padding:8px;border-bottom:1px solid #ddd">${i.qty}</td><td style="padding:8px;border-bottom:1px solid #ddd">${money(
            i.price * i.qty
          )}</td></tr>`
      )
      .join("");
    w.document.write(`
      <html><head><title>Invoice ${ord.orderNumber}</title></head>
      <body style="font-family:Arial,sans-serif;padding:32px;color:#111">
        <h2 style="margin-bottom:4px">Mariya Plywoods Furniture — Tax Invoice</h2>
        <p style="color:#555;margin-top:0">Order #: <strong>${ord.orderNumber}</strong> · Date: ${new Date(
          ord.createdAt
        ).toLocaleString()}</p>
        <p><strong>Customer:</strong> ${ord.customer.firstName} ${ord.customer.lastName} (${ord.customer.phone})<br/>
        <strong>Address:</strong> ${ord.customer.address}, ${ord.customer.city} - ${ord.customer.postcode}<br/>
        <strong>Status:</strong> ${ord.status.toUpperCase()} · <strong>Payment:</strong> ${ord.paymentMethod.toUpperCase()} (${ord.paymentStatus})</p>
        <table style="width:100%;border-collapse:collapse;margin:20px 0">
          <thead><tr><th align="left" style="padding:8px;border-bottom:2px solid #111">Item</th><th align="left" style="padding:8px;border-bottom:2px solid #111">Qty</th><th align="left" style="padding:8px;border-bottom:2px solid #111">Total</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <p style="text-align:right">Subtotal: ${money(ord.subtotal)}<br/>
        ${ord.discount ? `Discount: -${money(ord.discount)}<br/>` : ""}
        Shipping: ${money(ord.shipping)}<br/>
        ${ord.taxAmount ? `Tax: ${money(ord.taxAmount)}<br/>` : ""}
        <strong style="font-size:18px">Grand Total: ${money(ord.total)}</strong></p>
        <script>window.print()</script>
      </body></html>
    `);
    w.document.close();
  }

  async function createCoupon(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    const res = await fetch("/api/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: couponForm.code,
        type: couponForm.type,
        value: Number(couponForm.value),
        minOrderAmount: Number(couponForm.minOrderAmount || 0),
        maxDiscount: Number(couponForm.maxDiscount || 0),
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      setErrorMsg(data.error || "Could not create coupon");
    } else {
      setCoupons((prev) => [data.coupon, ...prev]);
      setCouponForm({
        code: "",
        type: "percent",
        value: "",
        minOrderAmount: "0",
        maxDiscount: "0",
      });
      setStatusMsg(`Created coupon ${data.coupon.code}`);
    }
  }

  async function deleteCoupon(id: string, code: string) {
    await fetch(`/api/coupons?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    setCoupons((prev) => prev.filter((c) => c._id !== id));
    setStatusMsg(`Deleted coupon ${code}`);
  }

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...settingsForm,
        deliveryZones: settingsForm.deliveryZonesText
          .split(",")
          .map((z) => z.trim())
          .filter(Boolean),
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      setErrorMsg(data.error || "Could not save settings");
    } else {
      setStatusMsg("Store shipping, payment, and tax settings saved.");
    }
  }

  async function updateAppointmentStatus(id: string, status: string) {
    const res = await fetch("/api/appointments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    const data = await res.json();
    if (data?.ok && data.appointment) {
      setAppointments((prev) =>
        prev.map((a) => (a._id === id ? data.appointment : a))
      );
      setStatusMsg("Appointment status updated");
    }
  }

  async function updateContactStatus(id: string, status: string) {
    const res = await fetch("/api/contacts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    const data = await res.json();
    if (data?.ok && data.message) {
      setContacts((prev) =>
        prev.map((c) => (c._id === id ? data.message : c))
      );
      setStatusMsg("Message status updated");
    }
  }

  function downloadCsv(filename: string, rows: string[][]) {
    const csv = rows
      .map((r) =>
        r.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportOrdersCsv() {
    downloadCsv("mariya-plywoods-orders.csv", [
      ["OrderNumber", "Date", "Customer", "Email", "Phone", "Total", "PaymentMethod", "PaymentStatus", "OrderStatus"],
      ...dateFilteredOrders.map((o) => [
        o.orderNumber,
        new Date(o.createdAt).toISOString(),
        `${o.customer.firstName} ${o.customer.lastName}`,
        o.customer.email,
        o.customer.phone,
        String(o.total),
        o.paymentMethod,
        o.paymentStatus,
        o.status,
      ]),
    ]);
  }

  function exportInventoryCsv() {
    downloadCsv("mariya-plywoods-inventory.csv", [
      ["SKU", "Title", "Category", "Price", "SalePrice", "Unit", "Stock"],
      ...products.map((p) => [
        p.sku || "",
        p.title,
        p.category,
        String(p.price),
        p.salePrice ? String(p.salePrice) : "",
        p.unit || "item",
        String(p.stock),
      ]),
    ]);
  }

  if (authorized === null) {
    return <p>Checking admin access…</p>;
  }

  if (!authorized) {
    return (
      <div className="empty-state">
        <h2>Admin access required</h2>
        <p style={{ marginBottom: 20 }}>
          Please sign in with an administrator account on the My Account page to
          manage orders, inventory, and store settings.
        </p>
        <Link href="/my-account" className="btn">
          Go to My Account
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Store Overview Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 28,
        }}
      >
        <div className="account-card" style={{ padding: 20 }}>
          <span style={{ fontSize: 12.5, color: "#6d6f6c", textTransform: "uppercase" }}>
            Sales Revenue
          </span>
          <div style={{ fontSize: 26, fontWeight: 700, marginTop: 6 }}>
            {money(totalRevenue)}
          </div>
          <span style={helperStyle}>{dateFilteredOrders.length} order(s) in range</span>
        </div>

        <div className="account-card" style={{ padding: 20 }}>
          <span style={{ fontSize: 12.5, color: "#6d6f6c", textTransform: "uppercase" }}>
            Pending Orders
          </span>
          <div style={{ fontSize: 26, fontWeight: 700, marginTop: 6 }}>
            {pendingOrders}
          </div>
          <span style={helperStyle}>Registered Customers: {customers.length}</span>
        </div>

        <div className="account-card" style={{ padding: 20 }}>
          <span style={{ fontSize: 12.5, color: "#6d6f6c", textTransform: "uppercase" }}>
            Catalog Products
          </span>
          <div style={{ fontSize: 26, fontWeight: 700, marginTop: 6 }}>
            {products.length}
          </div>
          <span style={helperStyle}>
            {lowStockCount > 0
              ? `${lowStockCount} low-stock alert(s)`
              : "All items well stocked"}
          </span>
        </div>

        <div className="account-card" style={{ padding: 20 }}>
          <span style={{ fontSize: 12.5, color: "#6d6f6c", textTransform: "uppercase" }}>
            Customer Inquiries
          </span>
          <div style={{ fontSize: 26, fontWeight: 700, marginTop: 6 }}>
            {appointments.length + contacts.length}
          </div>
          <span style={helperStyle}>{pendingInquiries} awaiting reply</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          marginBottom: 20,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            type="button"
            className={tab === "orders" ? "btn btn--sm" : "btn btn--sm btn--outline"}
            onClick={() => setTab("orders")}
          >
            Orders &amp; Returns ({orders.length})
          </button>
          <button
            type="button"
            className={tab === "tracking" ? "btn btn--sm" : "btn btn--sm btn--outline"}
            onClick={() => setTab("tracking")}
          >
            Status &amp; Tracking
          </button>
          <button
            type="button"
            className={tab === "products" ? "btn btn--sm" : "btn btn--sm btn--outline"}
            onClick={() => setTab("products")}
          >
            Products &amp; Images ({products.length})
          </button>
          <button
            type="button"
            className={tab === "coupons" ? "btn btn--sm" : "btn btn--sm btn--outline"}
            onClick={() => setTab("coupons")}
          >
            Coupons &amp; Settings
          </button>
          <button
            type="button"
            className={tab === "customers" ? "btn btn--sm" : "btn btn--sm btn--outline"}
            onClick={() => setTab("customers")}
          >
            Customers &amp; Inquiries
          </button>
          <button
            type="button"
            className={tab === "reports" ? "btn btn--sm" : "btn btn--sm btn--outline"}
            onClick={() => setTab("reports")}
          >
            Reports &amp; Audit Log
          </button>
        </div>

        <button
          type="button"
          className="btn btn--sm btn--outline"
          onClick={loadAll}
        >
          Refresh Data
        </button>
      </div>

      {statusMsg && (
        <div
          style={{
            padding: "12px 16px",
            background: "#dcfce7",
            color: "#166534",
            marginBottom: 20,
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          {statusMsg}
        </div>
      )}
      {errorMsg && (
        <div
          style={{
            padding: "12px 16px",
            background: "#fee2e2",
            color: "#991b1b",
            marginBottom: 20,
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          {errorMsg}
        </div>
      )}

      {/* TAB 1: ORDERS & RETURNS */}
      {tab === "orders" && (
        <div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
            <input
              type="search"
              placeholder="Search by Order #, customer name, email, or phone…"
              value={orderSearch}
              onChange={(e) => setOrderSearch(e.target.value)}
              style={{
                flex: "1 1 260px",
                padding: "10px 12px",
                border: "1px solid var(--border)",
                fontFamily: "inherit",
                fontSize: 14,
              }}
            />
            <select
              value={orderStatusFilter}
              onChange={(e) => setOrderStatusFilter(e.target.value)}
              style={{
                padding: "10px 12px",
                border: "1px solid var(--border)",
                fontFamily: "inherit",
                fontSize: 14,
              }}
            >
              <option value="all">All Order Statuses</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          <div style={{ display: "grid", gap: 18 }}>
            {filteredOrders.length === 0 ? (
              <div className="account-card">
                <p>No matching orders found.</p>
              </div>
            ) : (
              filteredOrders.map((ord) => (
                <div key={ord._id} className="account-card">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: 12,
                      paddingBottom: 14,
                      borderBottom: "1px solid var(--border)",
                      marginBottom: 14,
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                        <strong style={{ fontSize: 17 }}>{ord.orderNumber}</strong>
                        <Badge label={ord.status} />
                        <Badge label={ord.paymentStatus} />
                        {ord.returnRequest?.requested && (
                          <Badge label={`Return: ${ord.returnRequest.status}`} />
                        )}
                      </div>
                      <div style={{ fontSize: 13, color: "#6d6f6c", marginTop: 4 }}>
                        {new Date(ord.createdAt).toLocaleString()} ·{" "}
                        {ord.paymentMethod.toUpperCase()} ·{" "}
                        {ord.deliveryMethod === "pickup" ? "Store Pickup" : "Home Delivery"}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 12, color: "#6d6f6c" }}>Grand Total</div>
                      <div style={{ fontWeight: 700, fontSize: 20 }}>
                        {money(ord.total)}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                      gap: 18,
                      marginBottom: 16,
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: 12.5, textTransform: "uppercase", color: "#6d6f6c" }}>
                        Customer &amp; Delivery Address
                      </strong>
                      <p style={{ marginTop: 6, fontSize: 14, lineHeight: 1.6 }}>
                        <strong>
                          {ord.customer.firstName} {ord.customer.lastName}
                        </strong>
                        <br />
                        Phone: {ord.customer.phone} · {ord.customer.email}
                        <br />
                        {ord.customer.address}, {ord.customer.city} - {ord.customer.postcode}
                      </p>
                      {ord.customer.notes && (
                        <p style={{ fontSize: 13, color: "#6d6f6c", marginTop: 6 }}>
                          <em>Note: {ord.customer.notes}</em>
                        </p>
                      )}
                    </div>

                    <div>
                      <strong style={{ fontSize: 12.5, textTransform: "uppercase", color: "#6d6f6c" }}>
                        Items Ordered
                      </strong>
                      <ul style={{ fontSize: 14, paddingLeft: 18, marginTop: 6, lineHeight: 1.7 }}>
                        {ord.items.map((item, idx) => (
                          <li key={idx}>
                            {item.title} × {item.qty}
                            {item.selectedOptions ? ` (${item.selectedOptions})` : ""} —{" "}
                            {money(item.price * item.qty)}
                          </li>
                        ))}
                      </ul>
                      <div style={{ fontSize: 13, color: "#6d6f6c", marginTop: 6 }}>
                        Subtotal: {money(ord.subtotal)}
                        {ord.discount ? ` · Discount (${ord.couponCode}): −${money(ord.discount)}` : ""}
                        {" · "}Shipping: {ord.shipping === 0 ? "Free" : money(ord.shipping)}
                        {ord.taxAmount ? ` · Tax: ${money(ord.taxAmount)}` : ""}
                      </div>
                      {ord.returnRequest?.requested && (
                        <p style={{ fontSize: 13, color: "#92400e", marginTop: 6 }}>
                          <strong>Return Reason:</strong> {ord.returnRequest.reason}
                        </p>
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: 16,
                      flexWrap: "wrap",
                      paddingTop: 12,
                      borderTop: "1px solid var(--border)",
                    }}
                  >
                    <label style={{ fontSize: 13.5 }}>
                      <strong>Order Status: </strong>
                      <select
                        value={ord.status}
                        onChange={(e) =>
                          updateOrder(ord._id, "status", e.target.value)
                        }
                        style={{ marginLeft: 6, padding: "7px 10px", border: "1px solid var(--border)" }}
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="refunded">Refunded</option>
                      </select>
                    </label>

                    <label style={{ fontSize: 13.5 }}>
                      <strong>Payment Status: </strong>
                      <select
                        value={ord.paymentStatus}
                        onChange={(e) =>
                          updateOrder(ord._id, "paymentStatus", e.target.value)
                        }
                        style={{ marginLeft: 6, padding: "7px 10px", border: "1px solid var(--border)" }}
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="failed">Failed</option>
                        <option value="refunded">Refunded</option>
                      </select>
                    </label>

                    {ord.returnRequest?.requested && (
                      <label style={{ fontSize: 13.5 }}>
                        <strong>Return Request: </strong>
                        <select
                          value={ord.returnRequest.status}
                          onChange={(e) =>
                            updateOrder(ord._id, "returnStatus", e.target.value)
                          }
                          style={{ marginLeft: 6, padding: "7px 10px", border: "1px solid var(--border)" }}
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                          <option value="refunded">Refunded</option>
                        </select>
                      </label>
                    )}

                    <button
                      type="button"
                      className="btn btn--sm btn--outline"
                      onClick={() => printAdminInvoice(ord)}
                    >
                      Print Invoice
                    </button>
                  </div>

                  <AdminOrderTrackingEditor order={ord} onSave={saveOrderTracking} />
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB: STATUS & TRACKING */}
      {tab === "tracking" && (
        <div>
          <div
            className="account-card"
            style={{
              marginBottom: 20,
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <input
              type="search"
              placeholder="Search by Order #, customer, phone, or tracking ID…"
              value={orderSearch}
              onChange={(e) => setOrderSearch(e.target.value)}
              style={{
                flex: "1 1 260px",
                padding: "10px 12px",
                border: "1px solid var(--border)",
                fontSize: 14,
              }}
            />
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {["all", "pending", "paid", "processing", "shipped", "delivered", "cancelled"].map(
                (st) => (
                  <button
                    key={st}
                    type="button"
                    className={
                      orderStatusFilter === st ? "btn btn--sm" : "btn btn--sm btn--outline"
                    }
                    onClick={() => setOrderStatusFilter(st)}
                    style={{ textTransform: "capitalize" }}
                  >
                    {st}
                  </button>
                )
              )}
            </div>
          </div>

          <div style={{ display: "grid", gap: 18 }}>
            {filteredOrders.length === 0 ? (
              <div className="account-card">
                <p style={{ color: "#6d6f6c" }}>No matching orders to track.</p>
              </div>
            ) : (
              filteredOrders.map((ord) => (
                <div key={ord._id} className="account-card">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: 10,
                      marginBottom: 14,
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        <strong style={{ fontSize: 17 }}>{ord.orderNumber}</strong>
                        <Badge label={ord.status} />
                        <Badge label={ord.paymentStatus} />
                      </div>
                      <div style={{ fontSize: 13, color: "#6d6f6c", marginTop: 4 }}>
                        {ord.customer.firstName} {ord.customer.lastName} · {ord.customer.phone} ·{" "}
                        {ord.customer.city} ({ord.deliveryMethod === "pickup" ? "Store Pickup" : "Delivery"})
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <strong>{money(ord.total)}</strong>
                      <button
                        type="button"
                        className="btn btn--sm btn--outline"
                        onClick={() => printAdminInvoice(ord)}
                      >
                        Invoice
                      </button>
                    </div>
                  </div>

                  <OrderTracker order={ord} />

                  <div style={{ marginTop: 12, marginBottom: 12 }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        color: "#6d6f6c",
                        marginBottom: 8,
                      }}
                    >
                      Quick Status Update (1-Click)
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {[
                        "pending",
                        "paid",
                        "processing",
                        "shipped",
                        "delivered",
                        "cancelled",
                        "refunded",
                      ].map((st) => (
                        <button
                          key={st}
                          type="button"
                          className={
                            ord.status === st ? "btn btn--sm" : "btn btn--sm btn--outline"
                          }
                          onClick={() => updateOrder(ord._id, "status", st)}
                          style={{ textTransform: "capitalize" }}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  <AdminOrderTrackingEditor
                    order={ord}
                    onSave={saveOrderTracking}
                    defaultOpen
                  />
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCTS & IMAGES */}
      {tab === "products" && (
        <div className="account-grid">
          <div className="account-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3>{editingSlug ? "Edit Product Details" : "Add New Product"}</h3>
              {editingSlug && (
                <button type="button" className="btn btn--sm btn--outline" onClick={cancelEdit}>
                  Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleSaveProduct}>
              <div className="field">
                <label htmlFor="p-title">Product Name *</label>
                <input
                  id="p-title"
                  placeholder="e.g. Century BWR Marine Plywood 18mm"
                  value={prodForm.title}
                  onChange={(e) => setProdForm({ ...prodForm, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-row-2">
                <div className="field">
                  <label htmlFor="p-brand">Brand</label>
                  <input
                    id="p-brand"
                    value={prodForm.brand}
                    onChange={(e) => setProdForm({ ...prodForm, brand: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label htmlFor="p-unit">Pricing Unit</label>
                  <select
                    id="p-unit"
                    value={prodForm.unit}
                    onChange={(e) =>
                      setProdForm({
                        ...prodForm,
                        unit: e.target.value as "item" | "sheet" | "sq.ft",
                      })
                    }
                  >
                    <option value="item">Per Item</option>
                    <option value="sheet">Per Sheet</option>
                    <option value="sq.ft">Per Sq.Ft</option>
                  </select>
                </div>
              </div>

              <div className="form-row-3">
                <div className="field">
                  <label htmlFor="p-price">Price (₹) *</label>
                  <input
                    id="p-price"
                    type="number"
                    min="0"
                    value={prodForm.price}
                    onChange={(e) => setProdForm({ ...prodForm, price: e.target.value })}
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="p-sale">Sale Price (₹)</label>
                  <input
                    id="p-sale"
                    type="number"
                    min="0"
                    placeholder="Optional"
                    value={prodForm.salePrice}
                    onChange={(e) => setProdForm({ ...prodForm, salePrice: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label htmlFor="p-stock">Stock *</label>
                  <input
                    id="p-stock"
                    type="number"
                    min="0"
                    value={prodForm.stock}
                    onChange={(e) => setProdForm({ ...prodForm, stock: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="field">
                  <label htmlFor="p-cat">Category *</label>
                  <select
                    id="p-cat"
                    value={prodForm.category}
                    onChange={(e) => setProdForm({ ...prodForm, category: e.target.value })}
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="p-sku">SKU / Code</label>
                  <input
                    id="p-sku"
                    placeholder="e.g. MP-015"
                    value={prodForm.sku}
                    onChange={(e) => setProdForm({ ...prodForm, sku: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="field">
                  <label htmlFor="p-dim">Dimensions</label>
                  <input
                    id="p-dim"
                    placeholder="e.g. 8ft × 4ft"
                    value={prodForm.dimensions}
                    onChange={(e) => setProdForm({ ...prodForm, dimensions: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label htmlFor="p-thick">Thickness</label>
                  <input
                    id="p-thick"
                    placeholder="e.g. 18 mm"
                    value={prodForm.thickness}
                    onChange={(e) => setProdForm({ ...prodForm, thickness: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="field">
                  <label htmlFor="p-mat">Material</label>
                  <input
                    id="p-mat"
                    placeholder="e.g. Gurjan BWR Plywood"
                    value={prodForm.material}
                    onChange={(e) => setProdForm({ ...prodForm, material: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label htmlFor="p-fin">Finish</label>
                  <input
                    id="p-fin"
                    placeholder="e.g. Matte Laminate"
                    value={prodForm.finish}
                    onChange={(e) => setProdForm({ ...prodForm, finish: e.target.value })}
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor="p-tags">Tags (comma separated)</label>
                <input
                  id="p-tags"
                  placeholder="furniture, plywood, modular"
                  value={prodForm.tagsText}
                  onChange={(e) => setProdForm({ ...prodForm, tagsText: e.target.value })}
                />
              </div>

              {/* Main Image Upload from Local System */}
              <div
                className="field"
                style={{ border: "1px dashed var(--border)", padding: 14, background: "var(--gray-light)" }}
              >
                <label htmlFor="p-file">Main Product Image (Upload from computer) *</label>
                <div style={{ display: "flex", gap: 14, alignItems: "center", marginTop: 8, flexWrap: "wrap" }}>
                  {prodForm.image && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={prodForm.image}
                      alt="Product preview"
                      style={{ width: 68, height: 68, objectFit: "cover", border: "1px solid var(--border)" }}
                    />
                  )}
                  <div style={{ flex: 1 }}>
                    <input
                      id="p-file"
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                      onChange={handleMainImagePick}
                      disabled={uploadingMain}
                    />
                    <span style={helperStyle}>
                      {uploadingMain ? "Uploading…" : "JPG, PNG, or WebP (max 5 MB)."}
                    </span>
                  </div>
                </div>
                <input
                  id="p-img"
                  style={{ marginTop: 8 }}
                  value={prodForm.image}
                  onChange={(e) => setProdForm({ ...prodForm, image: e.target.value })}
                  required
                />
              </div>

              {/* Gallery Upload */}
              <div
                className="field"
                style={{ border: "1px dashed var(--border)", padding: 14, background: "var(--gray-light)" }}
              >
                <label htmlFor="p-gallery">Gallery Photos (Upload multiple)</label>
                <input
                  id="p-gallery"
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                  onChange={handleGalleryPick}
                  disabled={uploadingGallery}
                  style={{ marginTop: 6 }}
                />
                {prodForm.gallery.length > 0 && (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                    {prodForm.gallery.map((gUrl, idx) => (
                      <div key={idx} style={{ position: "relative" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={gUrl}
                          alt={`Gallery ${idx + 1}`}
                          style={{ width: 50, height: 50, objectFit: "cover", border: "1px solid var(--border)" }}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setProdForm((prev) => ({
                              ...prev,
                              gallery: prev.gallery.filter((_, i) => i !== idx),
                            }))
                          }
                          style={{
                            position: "absolute",
                            top: -6,
                            right: -6,
                            width: 18,
                            height: 18,
                            borderRadius: "50%",
                            border: "none",
                            background: "#991b1b",
                            color: "#fff",
                            fontSize: 11,
                            cursor: "pointer",
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="field">
                <label htmlFor="p-desc">Description *</label>
                <textarea
                  id="p-desc"
                  rows={3}
                  value={prodForm.description}
                  onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn"
                disabled={savingProduct || uploadingMain || uploadingGallery}
              >
                {savingProduct
                  ? "Saving…"
                  : editingSlug
                  ? "Save Product Changes"
                  : "Create Product"}
              </button>
            </form>
          </div>

          <div className="account-card">
            <h3 style={{ marginBottom: 12 }}>Store Inventory ({filteredProducts.length})</h3>
            <input
              type="search"
              placeholder="Search products by name, category, or SKU…"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid var(--border)",
                marginBottom: 16,
                fontSize: 14,
              }}
            />
            <div style={{ display: "grid", gap: 12 }}>
              {filteredProducts.map((p) => (
                <div
                  key={p.slug}
                  style={{
                    border: editingSlug === p.slug ? "2px solid var(--main)" : "1px solid var(--border)",
                    padding: 12,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.image}
                      alt={p.title}
                      style={{ width: 52, height: 52, objectFit: "cover" }}
                    />
                    <div>
                      <strong>{p.title}</strong>
                      <div style={{ fontSize: 13, color: "#6d6f6c" }}>
                        {p.category} · {money(p.price)} / {p.unit || "item"}
                        {p.sku ? ` · ${p.sku}` : ""}
                      </div>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: p.stock <= 5 ? "#991b1b" : "#166534" }}>
                        {p.stock === 0 ? "Out of Stock" : `Stock: ${p.stock} left`}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button type="button" className="btn btn--sm" onClick={() => startEditProduct(p)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn--sm btn--outline"
                      onClick={() => updateStock(p.slug, p.stock + 5)}
                    >
                      +5 Stock
                    </button>
                    <button
                      type="button"
                      className="btn btn--sm btn--outline"
                      onClick={() => deleteProduct(p.slug, p.title)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: COUPONS & STORE SETTINGS */}
      {tab === "coupons" && (
        <div className="account-grid">
          <div className="account-card">
            <h3 style={{ marginBottom: 14 }}>Discount Coupons ({coupons.length})</h3>
            <form onSubmit={createCoupon} style={{ marginBottom: 20 }}>
              <div className="form-row-2">
                <div className="field">
                  <label htmlFor="c-code">Coupon Code *</label>
                  <input
                    id="c-code"
                    placeholder="e.g. WELCOME10"
                    value={couponForm.code}
                    onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value })}
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="c-type">Discount Type</label>
                  <select
                    id="c-type"
                    value={couponForm.type}
                    onChange={(e) =>
                      setCouponForm({
                        ...couponForm,
                        type: e.target.value as "percent" | "fixed",
                      })
                    }
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
              </div>
              <div className="form-row-3">
                <div className="field">
                  <label htmlFor="c-val">Value *</label>
                  <input
                    id="c-val"
                    type="number"
                    min="1"
                    value={couponForm.value}
                    onChange={(e) => setCouponForm({ ...couponForm, value: e.target.value })}
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="c-min">Min Order (₹)</label>
                  <input
                    id="c-min"
                    type="number"
                    min="0"
                    value={couponForm.minOrderAmount}
                    onChange={(e) => setCouponForm({ ...couponForm, minOrderAmount: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label htmlFor="c-max">Max Cap (₹)</label>
                  <input
                    id="c-max"
                    type="number"
                    min="0"
                    value={couponForm.maxDiscount}
                    onChange={(e) => setCouponForm({ ...couponForm, maxDiscount: e.target.value })}
                  />
                </div>
              </div>
              <button type="submit" className="btn btn--sm">
                Create Coupon
              </button>
            </form>

            <div style={{ display: "grid", gap: 10 }}>
              {coupons.map((c) => (
                <div
                  key={c._id}
                  style={{
                    border: "1px solid var(--border)",
                    padding: 10,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <strong>{c.code}</strong> —{" "}
                    {c.type === "percent" ? `${c.value}% off` : `${money(c.value)} off`}
                    <div style={{ fontSize: 12.5, color: "#6d6f6c" }}>
                      Min: {money(c.minOrderAmount)} · Used: {c.usedCount} time(s)
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn--sm btn--outline"
                    onClick={() => deleteCoupon(c._id, c.code)}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="account-card">
            <h3 style={{ marginBottom: 14 }}>Shipping, Payment &amp; Tax Settings</h3>
            <form onSubmit={saveSettings}>
              <div className="form-row-2">
                <div className="field">
                  <label htmlFor="s-ship">Shipping Charge (₹)</label>
                  <input
                    id="s-ship"
                    type="number"
                    min="0"
                    value={settingsForm.shippingCharge}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, shippingCharge: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="field">
                  <label htmlFor="s-free">Free Shipping Over (₹)</label>
                  <input
                    id="s-free"
                    type="number"
                    min="0"
                    value={settingsForm.freeShippingThreshold}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        freeShippingThreshold: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor="s-est">Estimated Delivery Time</label>
                <input
                  id="s-est"
                  value={settingsForm.estimatedDeliveryDays}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, estimatedDeliveryDays: e.target.value })
                  }
                />
              </div>

              <div className="field">
                <label htmlFor="s-zones">Delivery Zones (comma separated)</label>
                <input
                  id="s-zones"
                  value={settingsForm.deliveryZonesText}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, deliveryZonesText: e.target.value })
                  }
                />
              </div>

              <div style={{ display: "grid", gap: 8, marginBottom: 14 }}>
                <label style={{ fontSize: 14 }}>
                  <input
                    type="checkbox"
                    checked={settingsForm.enablePickup}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, enablePickup: e.target.checked })
                    }
                  />{" "}
                  Allow Store Pickup
                </label>
                <label style={{ fontSize: 14 }}>
                  <input
                    type="checkbox"
                    checked={settingsForm.enableCod}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, enableCod: e.target.checked })
                    }
                  />{" "}
                  Enable Cash on Delivery (COD)
                </label>
                <label style={{ fontSize: 14 }}>
                  <input
                    type="checkbox"
                    checked={settingsForm.enableBankTransfer}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        enableBankTransfer: e.target.checked,
                      })
                    }
                  />{" "}
                  Enable Manual Bank Transfer
                </label>
              </div>

              {settingsForm.enableBankTransfer && (
                <div className="field">
                  <label htmlFor="s-bank">Bank Account Details for Customers</label>
                  <textarea
                    id="s-bank"
                    rows={2}
                    value={settingsForm.bankDetails}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, bankDetails: e.target.value })
                    }
                  />
                </div>
              )}

              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14, marginTop: 14 }}>
                <label style={{ fontSize: 14, display: "block", marginBottom: 10 }}>
                  <input
                    type="checkbox"
                    checked={settingsForm.taxEnabled}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, taxEnabled: e.target.checked })
                    }
                  />{" "}
                  Enable GST / Tax Calculation at Checkout
                </label>
                {settingsForm.taxEnabled && (
                  <div className="form-row-3">
                    <div className="field">
                      <label htmlFor="s-taxlbl">Tax Label</label>
                      <input
                        id="s-taxlbl"
                        value={settingsForm.taxLabel}
                        onChange={(e) =>
                          setSettingsForm({ ...settingsForm, taxLabel: e.target.value })
                        }
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="s-taxrate">Rate (%)</label>
                      <input
                        id="s-taxrate"
                        type="number"
                        min="0"
                        max="50"
                        value={settingsForm.taxRatePercent}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            taxRatePercent: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="s-gstin">GSTIN (Optional)</label>
                      <input
                        id="s-gstin"
                        value={settingsForm.gstin}
                        onChange={(e) =>
                          setSettingsForm({ ...settingsForm, gstin: e.target.value })
                        }
                      />
                    </div>
                  </div>
                )}
              </div>

              <button type="submit" className="btn">
                Save Store Settings
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 4: CUSTOMERS & INQUIRIES */}
      {tab === "customers" && (
        <div style={{ display: "grid", gap: 24 }}>
          <div className="account-card">
            <h3 style={{ marginBottom: 12 }}>Customer Lookup ({filteredCustomers.length})</h3>
            <input
              type="search"
              placeholder="Search customers by name, email, or phone…"
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid var(--border)",
                marginBottom: 14,
                fontSize: 14,
              }}
            />
            <div style={{ display: "grid", gap: 10 }}>
              {filteredCustomers.map((c) => (
                <div
                  key={c._id}
                  style={{
                    border: "1px solid var(--border)",
                    padding: 10,
                    display: "flex",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <strong>{c.name}</strong> ({c.email})
                    <div style={{ fontSize: 12.5, color: "#6d6f6c" }}>
                      {c.phone || "No phone"} · Role: {c.role} · Joined:{" "}
                      {new Date(c.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <label style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                    <span>Role:</span>
                    <select
                      value={c.role}
                      onChange={(e) =>
                        updateCustomerRole(c._id, e.target.value as "customer" | "admin")
                      }
                      style={{ padding: "5px 8px", border: "1px solid var(--border)" }}
                    >
                      <option value="customer">Customer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="account-grid">
            <div className="account-card">
              <h3 style={{ marginBottom: 14 }}>
                Appointments ({appointments.length})
              </h3>
              <div style={{ display: "grid", gap: 12 }}>
                {appointments.map((a) => (
                  <div key={a._id} style={{ border: "1px solid var(--border)", padding: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <strong>
                        {a.firstName} {a.lastName} — {a.service}
                      </strong>
                      <Badge label={a.status || "pending"} />
                    </div>
                    <div style={{ fontSize: 13, color: "#6d6f6c", marginBottom: 8 }}>
                      {a.phone} · {a.notes}
                    </div>
                    <select
                      value={a.status || "pending"}
                      onChange={(e) => updateAppointmentStatus(a._id, e.target.value)}
                      style={{ padding: "5px 8px", border: "1px solid var(--border)" }}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>

            <div className="account-card">
              <h3 style={{ marginBottom: 14 }}>Contact Messages ({contacts.length})</h3>
              <div style={{ display: "grid", gap: 12 }}>
                {contacts.map((c) => (
                  <div key={c._id} style={{ border: "1px solid var(--border)", padding: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <strong>
                        {c.name} ({c.email})
                      </strong>
                      <Badge label={c.status || "new"} />
                    </div>
                    <p style={{ fontSize: 13.5, marginBottom: 8 }}>{c.message}</p>
                    <select
                      value={c.status || "new"}
                      onChange={(e) => updateContactStatus(c._id, e.target.value)}
                      style={{ padding: "4px 8px", border: "1px solid var(--border)" }}
                    >
                      <option value="new">New</option>
                      <option value="replied">Replied</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: REPORTS & AUDIT LOG */}
      {tab === "reports" && (
        <div className="account-grid">
          <div className="account-card">
            <h3 style={{ marginBottom: 14 }}>Sales &amp; Inventory Reports</h3>
            <div className="field">
              <label htmlFor="rep-range">Date Range</label>
              <select
                id="rep-range"
                value={dateRange}
                onChange={(e) =>
                  setDateRange(e.target.value as "all" | "7d" | "30d")
                }
              >
                <option value="all">All Time</option>
                <option value="30d">Last 30 Days</option>
                <option value="7d">Last 7 Days</option>
              </select>
            </div>
            <p style={{ fontSize: 14, marginBottom: 16 }}>
              Revenue in range: <strong>{money(totalRevenue)}</strong> across{" "}
              <strong>{dateFilteredOrders.length}</strong> order(s).
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button type="button" className="btn btn--sm" onClick={exportOrdersCsv}>
                Export Orders CSV
              </button>
              <button
                type="button"
                className="btn btn--sm btn--outline"
                onClick={exportInventoryCsv}
              >
                Export Inventory CSV
              </button>
            </div>
          </div>

          <div className="account-card">
            <h3 style={{ marginBottom: 14 }}>Admin Audit Log ({auditLogs.length})</h3>
            {auditLogs.length === 0 ? (
              <p style={{ color: "#6d6f6c" }}>No admin actions recorded yet.</p>
            ) : (
              <div style={{ display: "grid", gap: 8, maxHeight: 420, overflowY: "auto" }}>
                {auditLogs.map((log) => (
                  <div
                    key={log._id}
                    style={{ borderBottom: "1px solid var(--border)", paddingBottom: 8, fontSize: 13 }}
                  >
                    <strong>{log.action}</strong> on {log.targetType} ({log.targetId})
                    <div style={{ color: "#6d6f6c" }}>
                      By {log.actorEmail} · {new Date(log.createdAt).toLocaleString()}
                      {log.details ? ` · ${log.details}` : ""}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function AdminOrderTrackingEditor({
  order,
  onSave,
  defaultOpen = false,
}: {
  order: Order;
  onSave: (
    id: string,
    tracking: {
      carrier: string;
      trackingNumber: string;
      currentLocation: string;
      estimatedDelivery: string;
      trackingUrl: string;
      note: string;
    }
  ) => Promise<boolean>;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    carrier: order.tracking?.carrier || "",
    trackingNumber: order.tracking?.trackingNumber || "",
    currentLocation: order.tracking?.currentLocation || "",
    estimatedDelivery: order.tracking?.estimatedDelivery || "",
    trackingUrl: order.tracking?.trackingUrl || "",
    note: order.tracking?.note || "",
  });

  useEffect(() => {
    setForm({
      carrier: order.tracking?.carrier || "",
      trackingNumber: order.tracking?.trackingNumber || "",
      currentLocation: order.tracking?.currentLocation || "",
      estimatedDelivery: order.tracking?.estimatedDelivery || "",
      trackingUrl: order.tracking?.trackingUrl || "",
      note: order.tracking?.note || "",
    });
  }, [order.tracking]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const ok = await onSave(order._id, form);
    setSaving(false);
    if (ok) setOpen(false);
  }

  return (
    <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px dashed var(--border)" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div style={{ fontSize: 13, color: "#4d4f4c" }}>
          <strong>Tracking: </strong>
          {order.tracking?.trackingNumber || order.tracking?.currentLocation ? (
            <span>
              {order.tracking.carrier ? `${order.tracking.carrier} · ` : ""}
              {order.tracking.trackingNumber ? `#${order.tracking.trackingNumber}` : ""}
              {order.tracking.currentLocation ? ` · ${order.tracking.currentLocation}` : ""}
              {order.tracking.estimatedDelivery
                ? ` · ETA: ${order.tracking.estimatedDelivery}`
                : ""}
            </span>
          ) : (
            <span style={{ color: "#8a8c88" }}>Not set yet</span>
          )}
        </div>
        <button
          type="button"
          className="btn btn--sm btn--outline"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Close Tracking" : "Set / Update Tracking"}
        </button>
      </div>

      {open && (
        <form
          onSubmit={handleSubmit}
          style={{
            marginTop: 12,
            padding: 14,
            background: "var(--gray-light)",
            border: "1px solid var(--border)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 10,
          }}
        >
          <input
            type="text"
            placeholder="Carrier (e.g. Mariya Van, DTDC)"
            value={form.carrier}
            onChange={(e) => setForm({ ...form, carrier: e.target.value })}
            style={{ padding: "8px 10px", border: "1px solid var(--border)", background: "#fff" }}
          />
          <input
            type="text"
            placeholder="Tracking Number (e.g. TRK-9021)"
            value={form.trackingNumber}
            onChange={(e) => setForm({ ...form, trackingNumber: e.target.value })}
            style={{ padding: "8px 10px", border: "1px solid var(--border)", background: "#fff" }}
          />
          <input
            type="text"
            placeholder="Current Location (e.g. Erode Hub)"
            value={form.currentLocation}
            onChange={(e) => setForm({ ...form, currentLocation: e.target.value })}
            style={{ padding: "8px 10px", border: "1px solid var(--border)", background: "#fff" }}
          />
          <input
            type="text"
            placeholder="Est. Delivery (e.g. 15 Nov 2026)"
            value={form.estimatedDelivery}
            onChange={(e) => setForm({ ...form, estimatedDelivery: e.target.value })}
            style={{ padding: "8px 10px", border: "1px solid var(--border)", background: "#fff" }}
          />
          <input
            type="url"
            placeholder="Courier Tracking URL (optional)"
            value={form.trackingUrl}
            onChange={(e) => setForm({ ...form, trackingUrl: e.target.value })}
            style={{
              gridColumn: "1 / -1",
              padding: "8px 10px",
              border: "1px solid var(--border)",
              background: "#fff",
            }}
          />
          <input
            type="text"
            placeholder="Tracking Update / Note (e.g. Dispatched from warehouse)"
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            style={{
              gridColumn: "1 / -1",
              padding: "8px 10px",
              border: "1px solid var(--border)",
              background: "#fff",
            }}
          />
          <div style={{ gridColumn: "1 / -1", display: "flex", gap: 8 }}>
            <button type="submit" className="btn btn--sm" disabled={saving}>
              {saving ? "Saving…" : "Save Tracking"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
