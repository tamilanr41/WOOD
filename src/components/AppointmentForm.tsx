"use client";

import { useState } from "react";
import { site } from "@/lib/data";
import { PhoneIcon } from "@/components/Icons";

const options = [
  "Carpenter Service",
  "Door Installation",
  "Wall Paneling",
  "Deck Framing",
  "Interior Finish",
  "Custom Furniture",
];

export default function AppointmentForm() {
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (sent) {
    return (
      <div className="appointment-form" style={{ gridTemplateColumns: "1fr" }}>
        <p className="appointment-form__success" aria-live="polite">
          Thank you — your appointment request has been received. Our team will
          call you back shortly to confirm a time.
        </p>
        <button
          type="button"
          className="btn"
          onClick={() => setSent(false)}
        >
          Send another request
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
      firstName: String(fd.get("firstName") ?? ""),
      lastName: String(fd.get("lastName") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      service: String(fd.get("service") ?? options[0]),
      notes: `Email: ${String(fd.get("email") ?? "")}`,
    };

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Could not submit appointment request.");
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
    <form className="appointment-form" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="first-name">First name</label>
        <input
          id="first-name"
          name="firstName"
          placeholder="First name"
          autoComplete="given-name"
          required
        />
      </div>
      <div className="field">
        <label htmlFor="last-name">Last name</label>
        <input
          id="last-name"
          name="lastName"
          placeholder="Last name"
          autoComplete="family-name"
          required
        />
      </div>
      <div className="field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="Email"
          autoComplete="email"
          required
        />
      </div>
      <div className="field">
        <label htmlFor="phone">Phone number</label>
        <input
          id="phone"
          name="phone"
          type="tel"
          placeholder="Phone Number"
          autoComplete="tel"
          required
        />
      </div>
      <div className="field">
        <label htmlFor="service">Service</label>
        <select id="service" name="service" defaultValue={options[0]}>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </div>
      {error && (
        <p style={{ color: "#ffb4ab", fontSize: 13.5, gridColumn: "1 / -1" }}>
          {error}
        </p>
      )}
      <div className="appointment-form__footer">
        <button type="submit" className="btn" disabled={submitting}>
          {submitting ? "Submitting…" : "Submit"}
        </button>
        <div className="appointment__phone">
          <PhoneIcon width={22} height={22} />
          <div>
            <span>Make an appointment by phone:</span>
            <strong>{site.appointmentPhone}</strong>
          </div>
        </div>
      </div>
    </form>
  );
}
