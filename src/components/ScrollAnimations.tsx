"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Faithful CSS/IntersectionObserver port of the original theme's GSAP scroll
 * animations (wp-content/plugins/lte-ext/assets/js/gsap/gsap-animations.js).
 *
 * - `data-lte-animation="fadeUp|fadeDown|fadeLeft|fadeRight|scaleUp|scaleDown|..."`
 *   animates the element itself when its top passes 80% of the viewport.
 * - `data-lte-cascade="true"` additionally staggers the `li / .lte-item /
 *   article` children, using `data-lte-cascade-animation` and `data-lte-stagger`.
 * - duration defaults to 0.8s, delay defaults to 0, trigger defaults to "top 80%".
 */
const CASCADE_SELECTOR =
  "li, .lte-item, article, .service-card, .price-item, .master-card, .testimonial-card, .team-card, .product-card, .gallery-item, .faq-item, .post-card";

const REVEALS: Array<[selector: string, animation: string]> = [
  [".section:not(.logos-strip-section), .page-header__inner", "fadeUp"],
  [".about-media, .pricing-media, .faq-media, .masters-featured", "fadeLeft"],
  [".about-copy, .masters-intro", "fadeRight"],
  [".section-head, .video-banner__inner, .appointment__grid > *, .appointment__card", "fadeUp"],
  [".service-card, .price-item, .master-card, .team-card, .product-card, .gallery-item, .faq-item, .post-card", "fadeUp"],
];

const CASCADE_GROUPS =
  ".services-grid, .price-list, .masters-list, .testimonials-grid, .team-grid, .products-grid, .gallery-grid, .faq-list, .logos-row, .post-list";

export default function ScrollAnimations() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      root.classList.add("lte-anim-off");
      return;
    }
    root.classList.remove("lte-anim-off");

    const seen = new WeakSet<Element>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("lte-inview");
          observer.unobserve(entry.target);
        });
      },
      // Equivalent of ScrollTrigger's "top 80%": the element must reach
      // 80% of the viewport height, i.e. the bottom 20% is the trigger zone.
      { threshold: 0, rootMargin: "0px 0px -20% 0px" }
    );

    const observe = (element: Element) => {
      if (seen.has(element)) return;
      seen.add(element);
      observer.observe(element);
    };

    const arm = (element: HTMLElement, type: string, duration: string, delay: string) => {
      element.setAttribute("data-lte-anim-type", type);
      element.style.setProperty("--lte-duration", `${duration}s`);
      element.style.setProperty("--lte-delay", `${delay}s`);
      observe(element);
    };

    REVEALS.forEach(([selector, animation]) => {
      document.querySelectorAll<HTMLElement>(selector).forEach((element) => {
        if (!element.hasAttribute("data-lte-animation")) {
          element.setAttribute("data-lte-animation", animation);
        }
      });
    });

    document.querySelectorAll<HTMLElement>(CASCADE_GROUPS).forEach((element) => {
      element.setAttribute("data-lte-cascade", "true");
      if (!element.hasAttribute("data-lte-stagger")) {
        element.setAttribute("data-lte-stagger", "0.12");
      }
    });

    document.querySelectorAll<HTMLElement>("[data-lte-animation]").forEach((element) => {
      const type = element.getAttribute("data-lte-animation") || "fadeUp";
      const durationValue = parseFloat(element.getAttribute("data-lte-duration") || "0.8");
      const delayValue = parseFloat(element.getAttribute("data-lte-delay") || "0");
      const duration = String(Number.isFinite(durationValue) ? durationValue : 0.8);
      const delay = String(Number.isFinite(delayValue) ? delayValue : 0);

      arm(element, type, duration, delay);

      if (element.getAttribute("data-lte-cascade") === "true") {
        const staggerValue = parseFloat(element.getAttribute("data-lte-stagger") || "0.15");
        const stagger = Number.isFinite(staggerValue) ? staggerValue : 0.15;
        const cascadeType =
          element.getAttribute("data-lte-cascade-animation") || "fadeUp";

        element.querySelectorAll<HTMLElement>(CASCADE_SELECTOR).forEach((item, index) => {
          item.classList.add("lte-anim-item");
          arm(item, cascadeType, "0.8", (index * stagger).toFixed(2));
        });
      }
    });

    root.classList.add("lte-anim-ready");

    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
