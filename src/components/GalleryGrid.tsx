"use client";

import { useEffect, useState } from "react";
import { gallery } from "@/lib/data";

export default function GalleryGrid({ columns = 3 }: { columns?: 3 | 4 }) {
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (open === null) return;
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight")
        setOpen((i) => (i === null ? i : (i + 1) % gallery.length));
      if (e.key === "ArrowLeft")
        setOpen((i) =>
          i === null ? i : (i - 1 + gallery.length) % gallery.length
        );
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open !== null ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <div className={`gallery-grid gallery-grid--${columns}`}>
        {gallery.map((item, i) => (
          <button
            key={item.title}
            type="button"
            className="gallery-item"
            onClick={() => setOpen(i)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.image} alt={item.title} />
            <span className="gallery-item__label">{item.title}</span>
          </button>
        ))}
      </div>

      {open !== null && (
        <div className="lightbox" onClick={() => setOpen(null)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={gallery[open].image}
            alt={gallery[open].title}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            className="lightbox__close"
            onClick={() => setOpen(null)}
            aria-label="Close"
          >
            ×
          </button>
          <button
            type="button"
            className="lightbox__nav prev"
            onClick={(e) => {
              e.stopPropagation();
              setOpen((i) =>
                i === null ? i : (i - 1 + gallery.length) % gallery.length
              );
            }}
            aria-label="Previous"
          >
            ‹
          </button>
          <button
            type="button"
            className="lightbox__nav next"
            onClick={(e) => {
              e.stopPropagation();
              setOpen((i) => (i === null ? i : (i + 1) % gallery.length));
            }}
            aria-label="Next"
          >
            ›
          </button>
        </div>
      )}
    </>
  );
}
