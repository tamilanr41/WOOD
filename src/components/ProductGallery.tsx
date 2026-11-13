"use client";

import { useState } from "react";

export default function ProductGallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [active, setActive] = useState(0);

  return (
    <div className="product-gallery">
      <div className="product-gallery__main">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={images[active]} alt={title} />
      </div>
      <div className="product-gallery__thumbs">
        {images.map((image, i) => (
          <button
            key={image + i}
            type="button"
            className={i === active ? "is-active" : ""}
            onClick={() => setActive(i)}
            aria-label={`View image ${i + 1}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt={`${title} ${i + 1}`} />
          </button>
        ))}
      </div>
    </div>
  );
}
