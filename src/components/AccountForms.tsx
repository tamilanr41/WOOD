"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/components/CartProvider";
import WishlistItems from "@/components/WishlistItems";
import OrderTracker, { type OrderTrackingInfo } from "@/components/OrderTracker";
import { money } from "@/lib/format";

type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
  phone?: string;
  savedAddress?: {
    company?: string;
    address?: string;
    city?: string;
    postcode?: string;
  };
  notificationPrefs?: {
    orderUpdates: boolean;
    promotions: boolean;
  };
};

type OrderItem = {
  slug: string;
  title: string;
  price: number;
  qty: number;
  selectedOptions?: string;
};

type OrderRecord = {
  _id: string;
  orderNumber: string;
  subtotal: number;
  discount?: number;
  shipping: number;
  taxAmount?: number;
  total: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  deliveryMethod?: string;
  createdAt: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postcode: string;
  };
  items: OrderItem[];
  tracking?: OrderTrackingInfo;
  returnRequest?: {
    requested: boolean;
    reason: string;
    status: string;
  };
};

export default function AccountForms() {
  const { wishlist } = useCart();
  const [tab, setTab] = useState<"login" | "register" | "forgot" | "reset">(
    "login"
  );
  const [resetEmail, setResetEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [resetNewPass, setResetNewPass] = useState("");
  const [accountTab, setAccountTab] = useState<
    "orders" | "profile" | "security" | "wishlist"
  >("orders");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    company: "",
    address: "",
    city: "",
    postcode: "",
    orderUpdates: true,
    promotions: false,
  });

  const [pwdForm, setPwdForm] = useState({
    currentPassword: "",
    newPassword: "",
  });

  async function loadAccount() {
    setLoading(true);
    try {
      const meRes = await fetch("/api/auth/me");
      const meData = await meRes.json();
      if (meData?.user) {
        setUser(meData.user);
        setProfileForm({
          name: meData.user.name || "",
          phone: meData.user.phone || "",
          company: meData.user.savedAddress?.company || "",
          address: meData.user.savedAddress?.address || "",
          city: meData.user.savedAddress?.city || "",
          postcode: meData.user.savedAddress?.postcode || "",
          orderUpdates: meData.user.notificationPrefs?.orderUpdates ?? true,
          promotions: meData.user.notificationPrefs?.promotions ?? false,
        });
        const ordRes = await fetch("/api/orders");
        const ordData = await ordRes.json();
        if (ordData?.ok) setOrders(ordData.orders || []);
      } else {
        setUser(null);
        setOrders([]);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("tab");
    if (t === "orders" || t === "profile" || t === "security" || t === "wishlist") {
      setAccountTab(t);
    }
    const rToken = params.get("reset");
    const rEmail = params.get("email");
    if (rToken && rEmail) {
      setResetToken(rToken);
      setResetEmail(rEmail);
      setTab("reset");
    }
    loadAccount();
    const onAuthChanged = () => {
      loadAccount();
    };
    window.addEventListener("mp-auth-changed", onAuthChanged);
    return () => window.removeEventListener("mp-auth-changed", onAuthChanged);
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Login failed");
      } else {
        await loadAccount();
        window.dispatchEvent(new Event("mp-auth-changed"));
      }
    } catch {
      setError("Network error while logging in");
    } finally {
      setBusy(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          phone: regPhone,
          password: regPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Registration failed");
      } else {
        await loadAccount();
        window.dispatchEvent(new Event("mp-auth-changed"));
      }
    } catch {
      setError("Network error while creating account");
    } finally {
      setBusy(false);
    }
  }

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profileForm.name,
          phone: profileForm.phone,
          savedAddress: {
            company: profileForm.company,
            address: profileForm.address,
            city: profileForm.city,
            postcode: profileForm.postcode,
          },
          notificationPrefs: {
            orderUpdates: profileForm.orderUpdates,
            promotions: profileForm.promotions,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Could not update profile");
      } else {
        setUser(data.user);
        setMessage("Profile, saved address, and notification preferences updated.");
      }
    } finally {
      setBusy(false);
    }
  }

  async function handlePasswordReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pwdForm),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Could not update password");
      } else {
        setPwdForm({ currentPassword: "", newPassword: "" });
        setMessage("Password updated successfully.");
      }
    } finally {
      setBusy(false);
    }
  }

  async function cancelOrder(orderId: string) {
    if (!window.confirm("Cancel this order and restore items to inventory?")) {
      return;
    }
    const res = await fetch(`/api/orders/${orderId}/cancel`, { method: "POST" });
    const data = await res.json();
    if (data?.ok) {
      setOrders((prev) => prev.map((o) => (o._id === orderId ? data.order : o)));
      setMessage(`Order ${data.order.orderNumber} cancelled.`);
    } else {
      setError(data?.error || "Could not cancel order.");
    }
  }

  async function requestReturn(orderId: string) {
    const reason = window.prompt("Please enter the reason for your return request:");
    if (!reason || !reason.trim()) return;
    const res = await fetch(`/api/orders/${orderId}/return`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    const data = await res.json();
    if (data?.ok) {
      setOrders((prev) => prev.map((o) => (o._id === orderId ? data.order : o)));
      setMessage("Return request submitted. Our team will review it shortly.");
    } else {
      setError(data?.error || "Could not submit return request.");
    }
  }

  function printInvoice(ord: OrderRecord) {
    const win = window.open("", "_blank", "width=760,height=800");
    if (!win) return;
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
    win.document.write(`
      <html><head><title>Invoice ${ord.orderNumber}</title></head>
      <body style="font-family:sans-serif;padding:32px;color:#222">
        <h2>Mariya Plywoods Furniture — Tax / Order Invoice</h2>
        <p><strong>Order #:</strong> ${ord.orderNumber}<br/>
        <strong>Date:</strong> ${new Date(ord.createdAt).toLocaleString()}<br/>
        <strong>Status:</strong> ${ord.status} · <strong>Payment:</strong> ${ord.paymentMethod.toUpperCase()} (${ord.paymentStatus})</p>
        <p><strong>Bill To:</strong> ${ord.customer.firstName} ${ord.customer.lastName}, ${ord.customer.address}, ${ord.customer.city} - ${ord.customer.postcode} · Phone: ${ord.customer.phone}</p>
        <table style="width:100%;border-collapse:collapse;margin-top:20px">
          <thead><tr><th align="left" style="border-bottom:2px solid #222;padding:8px">Item</th><th align="left" style="border-bottom:2px solid #222;padding:8px">Qty</th><th align="left" style="border-bottom:2px solid #222;padding:8px">Total</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <p style="margin-top:20px">
          Subtotal: ${money(ord.subtotal)}<br/>
          ${ord.discount ? `Discount: −${money(ord.discount)}<br/>` : ""}
          Shipping: ${ord.shipping === 0 ? "Free" : money(ord.shipping)}<br/>
          ${ord.taxAmount ? `Tax: ${money(ord.taxAmount)}<br/>` : ""}
          <strong>Grand Total: ${money(ord.total)}</strong>
        </p>
        <script>window.print();</script>
      </body></html>
    `);
    win.document.close();
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setOrders([]);
    setMessage("");
    setError("");
    window.dispatchEvent(new Event("mp-auth-changed"));
  }

  if (loading) {
    return (
      <div className="account-card">
        <p>Loading your account…</p>
      </div>
    );
  }

  if (user) {
    return (
      <div>
        <div
          className="account-card"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 20,
          }}
        >
          <div>
            <h3 style={{ marginBottom: 4 }}>Hello, {user.name}</h3>
            <p style={{ fontSize: 13.5, color: "#6d6f6c" }}>
              {user.email} · Role: <strong>{user.role}</strong>
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {user.role === "admin" && (
              <Link href="/admin" className="btn btn--sm">
                Admin Dashboard
              </Link>
            )}
            <button
              type="button"
              className="btn btn--sm btn--outline"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
          <button
            type="button"
            className={accountTab === "orders" ? "btn btn--sm" : "btn btn--sm btn--outline"}
            onClick={() => setAccountTab("orders")}
          >
            Orders ({orders.length})
          </button>
          <button
            type="button"
            className={accountTab === "profile" ? "btn btn--sm" : "btn btn--sm btn--outline"}
            onClick={() => setAccountTab("profile")}
          >
            Profile &amp; Address
          </button>
          <button
            type="button"
            className={accountTab === "wishlist" ? "btn btn--sm" : "btn btn--sm btn--outline"}
            onClick={() => setAccountTab("wishlist")}
          >
            Wishlist ({wishlist.length})
          </button>
          <button
            type="button"
            className={accountTab === "security" ? "btn btn--sm" : "btn btn--sm btn--outline"}
            onClick={() => setAccountTab("security")}
          >
            Security
          </button>
        </div>

        {error && <p style={{ color: "#b42318", marginBottom: 14 }}>{error}</p>}
        {message && <p style={{ color: "var(--main)", marginBottom: 14 }}>{message}</p>}

        {accountTab === "orders" && (
          <div className="account-card">
            <h3 style={{ marginBottom: 18 }}>Your Order History</h3>
            {orders.length === 0 ? (
              <div style={{ color: "#6d6f6c" }}>
                <p style={{ marginBottom: 18 }}>You have not placed any orders yet.</p>
                <Link href="/shop" className="btn btn--sm">
                  Browse products
                </Link>
              </div>
            ) : (
              <div style={{ display: "grid", gap: 14 }}>
                {orders.map((ord) => (
                  <div
                    key={ord._id}
                    style={{
                      border: "1px solid var(--border)",
                      padding: 16,
                      background: "var(--gray-light)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 8,
                        fontWeight: 600,
                      }}
                    >
                      <span>{ord.orderNumber}</span>
                      <span>{money(ord.total)}</span>
                    </div>
                    <div style={{ fontSize: 13, color: "#6d6f6c", marginBottom: 10 }}>
                      {new Date(ord.createdAt).toLocaleDateString()} · Status:{" "}
                      <strong style={{ textTransform: "capitalize" }}>{ord.status}</strong> ·
                      Payment: {ord.paymentMethod.toUpperCase()} ({ord.paymentStatus})
                      {ord.returnRequest?.requested && (
                        <span> · Return: {ord.returnRequest.status}</span>
                      )}
                    </div>
                    <OrderTracker order={ord} />
                    <ul style={{ fontSize: 13.5, paddingLeft: 18, marginBottom: 12 }}>
                      {ord.items.map((item, idx) => (
                        <li key={idx}>
                          {item.title} × {item.qty} ({money(item.price * item.qty)})
                        </li>
                      ))}
                    </ul>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <button
                        type="button"
                        className="btn btn--sm btn--outline"
                        onClick={() => printInvoice(ord)}
                      >
                        Print Invoice
                      </button>
                      {["pending", "paid"].includes(ord.status) && (
                        <button
                          type="button"
                          className="btn btn--sm btn--outline"
                          onClick={() => cancelOrder(ord._id)}
                        >
                          Cancel Order
                        </button>
                      )}
                      {ord.status === "delivered" && !ord.returnRequest?.requested && (
                        <button
                          type="button"
                          className="btn btn--sm btn--outline"
                          onClick={() => requestReturn(ord._id)}
                        >
                          Request Return
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {accountTab === "profile" && (
          <div className="account-card">
            <h3 style={{ marginBottom: 16 }}>Profile, Saved Address &amp; Notifications</h3>
            <form onSubmit={handleProfileSave}>
              <div className="field">
                <label htmlFor="prof-name">Full name</label>
                <input
                  id="prof-name"
                  value={profileForm.name}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="prof-phone">Phone</label>
                <input
                  id="prof-phone"
                  value={profileForm.phone}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, phone: e.target.value })
                  }
                />
              </div>
              <div className="field">
                <label htmlFor="prof-address">Saved street address</label>
                <input
                  id="prof-address"
                  value={profileForm.address}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, address: e.target.value })
                  }
                />
              </div>
              <div className="form-row-2">
                <div className="field">
                  <label htmlFor="prof-city">City</label>
                  <input
                    id="prof-city"
                    value={profileForm.city}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, city: e.target.value })
                    }
                  />
                </div>
                <div className="field">
                  <label htmlFor="prof-post">Postcode</label>
                  <input
                    id="prof-post"
                    value={profileForm.postcode}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, postcode: e.target.value })
                    }
                  />
                </div>
              </div>
              <div style={{ display: "grid", gap: 8, marginBottom: 16 }}>
                <label style={{ fontSize: 14 }}>
                  <input
                    type="checkbox"
                    checked={profileForm.orderUpdates}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        orderUpdates: e.target.checked,
                      })
                    }
                  />{" "}
                  Receive order &amp; delivery updates
                </label>
                <label style={{ fontSize: 14 }}>
                  <input
                    type="checkbox"
                    checked={profileForm.promotions}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        promotions: e.target.checked,
                      })
                    }
                  />{" "}
                  Receive seasonal promotions &amp; new collection alerts
                </label>
              </div>
              <button type="submit" className="btn" disabled={busy}>
                {busy ? "Saving…" : "Save profile"}
              </button>
            </form>
          </div>
        )}

        {accountTab === "wishlist" && (
          <div className="account-card">
            <h3 style={{ marginBottom: 14 }}>Saved Wishlist ({wishlist.length})</h3>
            <WishlistItems compact />
          </div>
        )}

        {accountTab === "security" && (
          <div className="account-card">
            <h3 style={{ marginBottom: 14 }}>Change Password</h3>
            <form onSubmit={handlePasswordReset}>
              <div className="field">
                <label htmlFor="cur-pwd">Current password</label>
                <input
                  id="cur-pwd"
                  type="password"
                  value={pwdForm.currentPassword}
                  onChange={(e) =>
                    setPwdForm({ ...pwdForm, currentPassword: e.target.value })
                  }
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="new-pwd">New password (min 6 characters)</label>
                <input
                  id="new-pwd"
                  type="password"
                  minLength={6}
                  value={pwdForm.newPassword}
                  onChange={(e) =>
                    setPwdForm({ ...pwdForm, newPassword: e.target.value })
                  }
                  required
                />
              </div>
              <button type="submit" className="btn" disabled={busy}>
                {busy ? "Updating…" : "Update password"}
              </button>
            </form>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="account-grid">
      <div className="account-card">
        <div style={{ display: "flex", gap: 18, marginBottom: 24 }}>
          <button
            type="button"
            className={tab === "login" ? "btn btn--sm" : "btn btn--sm btn--outline"}
            onClick={() => {
              setTab("login");
              setError("");
            }}
          >
            Login
          </button>
          <button
            type="button"
            className={tab === "register" ? "btn btn--sm" : "btn btn--sm btn--outline"}
            onClick={() => {
              setTab("register");
              setError("");
            }}
          >
            Register
          </button>
        </div>

        {tab === "login" ? (
          <form onSubmit={handleLogin}>
            <h3>Welcome back</h3>
            <div className="field">
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="login-pass">Password</label>
              <input
                id="login-pass"
                type="password"
                placeholder="Password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <p style={{ marginBottom: 14, color: "#b42318", fontSize: 13.5 }}>
                {error}
              </p>
            )}
            {message && (
              <p style={{ marginBottom: 14, color: "var(--main)", fontSize: 13.5 }}>
                {message}
              </p>
            )}
            <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
              <button type="submit" className="btn" disabled={busy}>
                {busy ? "Signing in…" : "Login"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab("forgot");
                  setError("");
                  setMessage("");
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--main)",
                  textDecoration: "underline",
                  cursor: "pointer",
                  font: "inherit",
                  fontSize: 13.5,
                }}
              >
                Forgot password?
              </button>
            </div>
          </form>
        ) : tab === "forgot" ? (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setError("");
              setMessage("");
              setBusy(true);
              try {
                const res = await fetch("/api/auth/forgot-password", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email: resetEmail }),
                });
                const data = await res.json();
                if (!res.ok || !data.ok) {
                  setError(data.error || "Could not send reset email.");
                } else {
                  setMessage(data.message);
                }
              } finally {
                setBusy(false);
              }
            }}
          >
            <h3>Reset your password</h3>
            <p style={{ fontSize: 13.5, color: "#6d6f6c", marginBottom: 14 }}>
              Enter your registered email and we will send you a password reset link.
            </p>
            <div className="field">
              <label htmlFor="forgot-email">Email</label>
              <input
                id="forgot-email"
                type="email"
                placeholder="you@example.com"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
              />
            </div>
            {error && (
              <p style={{ marginBottom: 14, color: "#b42318", fontSize: 13.5 }}>
                {error}
              </p>
            )}
            {message && (
              <p style={{ marginBottom: 14, color: "var(--main)", fontSize: 13.5 }}>
                {message}
              </p>
            )}
            <button type="submit" className="btn" disabled={busy}>
              {busy ? "Sending…" : "Send Reset Link"}
            </button>
          </form>
        ) : tab === "reset" ? (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setError("");
              setMessage("");
              setBusy(true);
              try {
                const res = await fetch("/api/auth/reset-password-token", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    email: resetEmail,
                    token: resetToken,
                    newPassword: resetNewPass,
                  }),
                });
                const data = await res.json();
                if (!res.ok || !data.ok) {
                  setError(data.error || "Reset failed.");
                } else {
                  setMessage(data.message);
                  setTab("login");
                }
              } finally {
                setBusy(false);
              }
            }}
          >
            <h3>Choose a new password</h3>
            <div className="field">
              <label htmlFor="reset-new-pass">New password (min 6 characters)</label>
              <input
                id="reset-new-pass"
                type="password"
                minLength={6}
                value={resetNewPass}
                onChange={(e) => setResetNewPass(e.target.value)}
                required
              />
            </div>
            {error && (
              <p style={{ marginBottom: 14, color: "#b42318", fontSize: 13.5 }}>
                {error}
              </p>
            )}
            <button type="submit" className="btn" disabled={busy}>
              {busy ? "Resetting…" : "Set New Password"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <h3>Create an account</h3>
            <div className="field">
              <label htmlFor="reg-name">Full name</label>
              <input
                id="reg-name"
                placeholder="Full name"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="reg-email">Email</label>
              <input
                id="reg-email"
                type="email"
                placeholder="you@example.com"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="reg-phone">Phone (optional)</label>
              <input
                id="reg-phone"
                placeholder="+91 ..."
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="reg-pass">Password (min 6 characters)</label>
              <input
                id="reg-pass"
                type="password"
                placeholder="Choose a password"
                minLength={6}
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <p style={{ marginBottom: 14, color: "#b42318", fontSize: 13.5 }}>
                {error}
              </p>
            )}
            <button type="submit" className="btn" disabled={busy}>
              {busy ? "Creating account…" : "Register"}
            </button>
          </form>
        )}
      </div>

      <div className="account-card">
        <h3>Why create an account?</h3>
        <p style={{ color: "#6d6f6c", lineHeight: 1.8, marginBottom: 18 }}>
          Track your orders in real time, download invoices, save delivery
          addresses, manage your wishlist, and request cancellations or returns.
        </p>
        <ul className="check-list" style={{ gridTemplateColumns: "1fr" }}>
          <li>Faster checkout with saved address</li>
          <li>Live order history, invoices &amp; tracking</li>
          <li>Wishlist &amp; notification preferences</li>
          <li>Easy order cancellation &amp; returns</li>
        </ul>
      </div>
    </div>
  );
}
