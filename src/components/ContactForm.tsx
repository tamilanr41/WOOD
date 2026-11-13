"use client";

import { useState } from "react";

export default function ContactForm() {
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (sent) {
    return (
      <div className="summary-box" style={{ background: "var(--gray-light)" }}>
        <h3>Message sent</h3>
        <p style={{ color: "#6d6f6c", lineHeight: 1.8 }}>
          Thank you for getting in touch. A member of our team will reply within
          one business day.
        </p>
        <button
          type="button"
          className="btn"
          style={{ marginTop: 20 }}
          onClick={() => setSent(false)}
        >
          Send another message
        </button>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      subject: String(fd.get("subject") ?? ""),
      message: String(fd.get("message") ?? ""),
    };

    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Could not send message. Please try again.");
      } else {
        setSent(true);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="checkout-form" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="c-name">Your name</label>
        <input id="c-name" name="name" placeholder="Full name" required />
      </div>
      <div className="field">
        <label htmlFor="c-email">Email</label>
        <input id="c-email" type="email" name="email" placeholder="you@example.com" required />
      </div>
      <div className="field">
        <label htmlFor="c-phone">Phone</label>
        <input id="c-phone" name="phone" placeholder="Phone number" />
      </div>
      <div className="field">
        <label htmlFor="c-subject">Subject</label>
        <input id="c-subject" name="subject" placeholder="How can we help?" />
      </div>
      <div className="field field--full">
        <label htmlFor="c-message">Message</label>
        <textarea
          id="c-message"
          name="message"
          rows={6}
          placeholder="Tell us about your project"
          required
        />
      </div>
      {error && (
        <div className="field field--full">
          <p style={{ color: "#b42318", fontSize: 13.5 }}>{error}</p>
        </div>
      )}
      <div className="field field--full">
        <button type="submit" className="btn" disabled={submitting}>
          {submitting ? "Sending…" : "Send message"}
        </button>
      </div>
    </form>
  );
}
