"use client";

import { useEffect, useState } from "react";

type ReviewItem = {
  _id: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export default function ProductReviews({ productSlug }: { productSlug: string }) {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [userName, setUserName] = useState("");
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch(`/api/reviews?slug=${encodeURIComponent(productSlug)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d?.ok) setReviews(d.reviews || []);
      })
      .catch(() => {});
  }, [productSlug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    setBusy(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productSlug,
          userName,
          rating: Number(rating),
          comment,
        }),
      });
      const data = await res.json();
      if (data?.ok) {
        setReviews((prev) => [data.review, ...prev]);
        setUserName("");
        setComment("");
        setMsg("Thank you! Your review has been published.");
      } else {
        setMsg(data?.error || "Could not submit review.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ marginTop: 48, paddingTop: 36, borderTop: "1px solid var(--border)" }}>
      <h2 className="h2" style={{ marginBottom: 20 }}>
        Customer Reviews ({reviews.length})
      </h2>

      <div className="account-grid">
        <div className="account-card">
          <h3 style={{ marginBottom: 14 }}>Write a Review</h3>
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="rev-name">Your Name</label>
              <input
                id="rev-name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Full name"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="rev-rating">Rating</label>
              <select
                id="rev-rating"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
              >
                <option value="5">★★★★★ (5/5)</option>
                <option value="4">★★★★☆ (4/5)</option>
                <option value="3">★★★☆☆ (3/5)</option>
                <option value="2">★★☆☆☆ (2/5)</option>
                <option value="1">★☆☆☆☆ (1/5)</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="rev-comment">Your Review</label>
              <textarea
                id="rev-comment"
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with quality, finish, and delivery"
                required
              />
            </div>
            {msg && (
              <p style={{ color: "var(--main)", fontSize: 13.5, marginBottom: 10 }}>
                {msg}
              </p>
            )}
            <button type="submit" className="btn btn--sm" disabled={busy}>
              {busy ? "Submitting…" : "Submit Review"}
            </button>
          </form>
        </div>

        <div className="account-card">
          <h3 style={{ marginBottom: 14 }}>Verified Feedback</h3>
          {reviews.length === 0 ? (
            <p style={{ color: "#6d6f6c" }}>
              No reviews yet. Be the first to review this product!
            </p>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {reviews.map((r) => (
                <div
                  key={r._id}
                  style={{ borderBottom: "1px solid var(--border)", paddingBottom: 12 }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <strong>{r.userName}</strong>
                    <span style={{ color: "#c28b48" }}>
                      {"★".repeat(r.rating)}
                      {"☆".repeat(5 - r.rating)}
                    </span>
                  </div>
                  <p style={{ fontSize: 14, marginTop: 4 }}>{r.comment}</p>
                  <span style={{ fontSize: 12, color: "#6d6f6c" }}>
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

