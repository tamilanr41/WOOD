"use client";

import { useEffect, useState } from "react";
import { IMG, testimonials } from "@/lib/data";

function visibleCards() {
  if (window.innerWidth <= 680) return 1;
  if (window.innerWidth <= 1180) return 2;
  return 3;
}

export default function TestimonialsCarousel() {
  const [visible, setVisible] = useState(3);
  const [active, setActive] = useState(0);
  const lastStart = Math.max(0, testimonials.length - visible);

  useEffect(() => {
    const updateVisible = () => setVisible(visibleCards());
    updateVisible();
    window.addEventListener("resize", updateVisible);
    return () => window.removeEventListener("resize", updateVisible);
  }, []);

  useEffect(() => {
    setActive((current) => Math.min(current, lastStart));
  }, [lastStart]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = window.setInterval(() => {
      setActive((current) => (current >= lastStart ? 0 : current + 1));
    }, 5600);

    return () => window.clearInterval(id);
  }, [lastStart]);

  const highlighted = (active + Math.floor(visible / 2)) % testimonials.length;
  const shiftPercent = (active * 100) / visible;
  const shiftPixels = (active * 24) / visible;

  return (
    <>
      <div
        className="testimonials-slider"
        role="region"
        aria-label="Customer testimonials"
        aria-roledescription="carousel"
      >
        <div
          className="testimonials-track"
          style={{
            transform: `translateX(calc(-${shiftPercent}% - ${shiftPixels}px))`,
          }}
        >
          {testimonials.map((testimonial, index) => (
            <article
              className={`testimonial-card ${index === highlighted ? "is-highlighted" : ""}`}
              key={testimonial.name + index}
              aria-roledescription="slide"
            >
              <p className="testimonial-card__quote">{testimonial.quote}</p>
              <div className="testimonial-card__author">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={IMG.testimonialAvatars[index]} alt={testimonial.name} />
                <div>
                  <div className="testimonial-card__name">{testimonial.name}</div>
                  <div className="testimonial-card__role">{testimonial.role}</div>
                </div>
              </div>
              <div className="testimonial-card__stars" aria-label="Rated 5 out of 5">
                ★★★★★
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="testimonials-pagination" aria-label="Choose testimonial slide">
        {Array.from({ length: lastStart + 1 }, (_, index) => (
          <button
            className={index === active ? "is-active" : ""}
            key={index}
            type="button"
            aria-label={`Go to slide ${index + 1}`}
            aria-current={index === active ? "true" : undefined}
            onClick={() => setActive(index)}
          />
        ))}
      </div>
    </>
  );
}
