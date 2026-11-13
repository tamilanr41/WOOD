"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Slide = {
  image: string;
  eyebrow: string;
  title: string;
};

export default function HeroSlider({
  slides,
  eyebrow,
  title,
  primaryHref = "/about-us",
}: {
  slides: Slide[];
  eyebrow?: string;
  title?: string;
  primaryHref?: string;
}) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = window.setInterval(() => {
      setActive((a) => (a + 1) % slides.length);
    }, 6500);
    return () => window.clearInterval(id);
  }, [slides.length]);

  return (
    <section className="hero">
      {slides.map((slide, i) => (
        <div
          key={slide.image + i}
          className={`hero__slide ${i === active ? "is-active" : ""}`}
          style={{ backgroundImage: `url(${slide.image})` }}
          aria-hidden={i !== active}
        />
      ))}
      <div className="hero__overlay" />

      <div key={active} className="container hero__inner">
        <p className="hero__sub">{eyebrow ?? slides[active].eyebrow}</p>
        <h1 className="hero__title">{title ?? slides[active].title}</h1>
        <div className="hero__actions">
          <Link href={primaryHref} className="btn">
            Read More
          </Link>
          <a
            href="https://www.youtube.com/watch?v=jnLSYfObARA"
            target="_blank"
            rel="noreferrer"
            className="video-link"
          >
            <span className="video-link__play" />
            <span>
              Carpentry
              <br />
              Video Tour
            </span>
          </a>
        </div>
      </div>

      <div className="hero__bullets">
        {slides.map((slide, i) => (
          <button
            key={slide.image + i}
            type="button"
            className={i === active ? "is-active" : ""}
            onClick={() => setActive(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
