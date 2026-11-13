import Link from "next/link";
import {
  IMG,
  services,
  pricing,
  masters,
  faqs,
} from "@/lib/data";
import AppointmentForm from "@/components/AppointmentForm";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";

export function PageHeader({
  title,
  crumb,
  image = IMG.headerBlog,
}: {
  title: string;
  crumb: string;
  image?: string;
}) {
  return (
    <section
      className="page-header"
      style={{ backgroundImage: `url(${image})` }}
    >
      <div className="container page-header__inner">
        <div className="breadcrumb">
          <Link href="/">Home</Link>
          <span className="sep">/</span>
          <span>{crumb}</span>
        </div>
        <h1>{title}</h1>
      </div>
    </section>
  );
}

export function AboutSection({
  images = IMG.about,
  showBadge = true,
}: {
  images?: string[];
  showBadge?: boolean;
}) {
  return (
    <section className="section">
      <div className="container about-grid">
        <div className="about-media">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="about-media__main" src={images[0]} alt="Carpentry workshop" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="about-media__small" src={images[1]} alt="Timber detail" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="about-media__small" src={images[2]} alt="Finished joinery" />
        </div>

        <div className="about-copy">
          <span className="eyebrow">About Company</span>
          <h2 className="h2">
            Reliable carpentry services includes project planning and perfect
            finishing
          </h2>
          <p className="lead">
            Comprehensive service includes project planning, manufacturing,
            finishing and warranty support so clients can focus on design.
          </p>

          <ul className="check-list">
            <li>Sustainable Forestry</li>
            <li>Quality Control</li>
            <li>Expert Team</li>
            <li>Custom Processing</li>
          </ul>

          {showBadge && (
            <div className="experience-badge">
              <span className="experience-badge__num">16</span>
              <span className="experience-badge__label">
                Years of
                <br />
                Experience
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function ServicesSection({
  eyebrow = "The possibility of wood forestry",
  title = "Responsible Timber Production",
}: {
  eyebrow?: string;
  title?: string;
}) {
  return (
    <section className="section services-section">
      <div className="container">
        <div className="section-head section-head--center">
          <div>
            <span className="eyebrow">{eyebrow}</span>
            <h2 className="h2">{title}</h2>
          </div>
          <Link href="/shop" className="link-arrow">
            View all services
          </Link>
        </div>

        <div className="services-grid">
          {services.map((service, i) => (
            <Link key={service.title} href="/shop" className="service-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={service.image} alt={service.title} />
              <div className="service-card__body">
                <span className="service-card__index">0{i + 1}</span>
                <h3>{service.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PricingSection() {
  return (
    <section className="section">
      <div className="container">
        <div className="section-head section-head--center">
          <div>
            <span className="eyebrow">Our prices</span>
            <h2 className="h2">Carpenter services</h2>
          </div>
        </div>

        <div className="pricing-grid">
          <div className="price-list">
            {pricing.slice(0, 5).map((item) => (
              <div className="price-item" key={item.title}>
                <div className="price-item__top">
                  <span className="price-item__title">{item.title}</span>
                  <span className="price-item__dots" />
                  <span className="price-item__price">{item.price}</span>
                </div>
                <p className="price-item__desc">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="pricing-media">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={IMG.priceTree} alt="Carpenter pricing" />
          </div>

          <div className="price-list">
            {pricing.slice(5).map((item) => (
              <div className="price-item" key={item.title}>
                <div className="price-item__top">
                  <span className="price-item__title">{item.title}</span>
                  <span className="price-item__dots" />
                  <span className="price-item__price">{item.price}</span>
                </div>
                <p className="price-item__desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function MastersSection() {
  return (
    <section className="section section--cream2">
      <div className="container masters-grid">
        <div className="masters-copy">
          <div className="masters-intro">
            <span className="eyebrow">Craftsmanship</span>
            <h2 className="h2">Open your mind to the possibility of wood forestry</h2>
            <p>
              Every board is graded, dried and machined in-house. Our team combines
              traditional joinery with modern production so the result is both
              beautiful and dependable.
            </p>
          </div>

          <div className="masters-list">
            {masters.map((master) => (
              <div className="master-card" key={master.title}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={master.image} alt={master.title} />
                <div className="master-card__copy">
                  <h4>{master.title}</h4>
                  <p>{master.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="masters-featured">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={IMG.carpenter} alt="Master carpenter" />
        </div>
      </div>
    </section>
  );
}

export function TestimonialsSection() {
  return (
    <section className="section testimonials-section">
      <div className="container">
        <div className="section-head section-head--center">
          <div>
            <span className="eyebrow">Testimonials</span>
            <h2 className="h2">Customers’ Experience</h2>
          </div>
          <Link href="/testimonial" className="link-arrow">
            All testimonials
          </Link>
        </div>

        <TestimonialsCarousel />
      </div>
    </section>
  );
}

export function VideoBanner({ image = IMG.videoBg }: { image?: string }) {
  return (
    <section
      className="video-banner"
      style={{ backgroundImage: `url(${image})` }}
    >
      <div className="container video-banner__inner">
        <a
          href="https://www.youtube.com/watch?v=jnLSYfObARA"
          target="_blank"
          rel="noreferrer"
          className="video-link"
          style={{ display: "inline-flex", flexDirection: "column" }}
        >
          <span className="video-link__play" />
          <h2>Find the perfect woodwork</h2>
        </a>
      </div>
    </section>
  );
}

export function LogosRow() {
  return (
    <section className="section section--tight logos-strip-section">
      <div className="container logos-row" role="region" aria-label="Partner brands">
        <div className="logos-row__track">
          {[0, 1].map((copy) => (
            <div className="logos-row__group" aria-hidden={copy === 1} key={copy}>
              {IMG.logos.map((logo, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={`${logo}-${i}`} src={logo} alt={copy === 0 ? "Partner logo" : ""} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FaqSection({ limit }: { limit?: number }) {
  const items = limit ? faqs.slice(0, limit) : faqs;
  return (
    <section className="section section--cream" id="faq">
      <div className="container faq-grid">
        <div>
          <span className="eyebrow">Helpful information</span>
          <h2 className="h2" style={{ marginBottom: 30 }}>
            Frequently Asked Questions
          </h2>
          <div className="faq-list">
            {items.map((item) => (
              <details className="faq-item" key={item.q}>
                <summary className="faq-item__q">{item.q}</summary>
                <div className="faq-item__a">
                  <p>{item.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
        <div className="faq-media">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={IMG.faq} alt="Timber construction" />
        </div>
      </div>
    </section>
  );
}

export function StatsRow() {
  return (
    <section className="section section--tight">
      <div className="container stats-row">
        <div className="stat">
          <div className="stat__num">12600+</div>
          <div className="stat__label">Completed projects</div>
        </div>
        <div className="stat">
          <div className="stat__num">1270+</div>
          <div className="stat__label">Satisfied clients</div>
        </div>
        <div className="stat">
          <div className="stat__num">8592+</div>
          <div className="stat__label">Successful deliveries</div>
        </div>
      </div>
    </section>
  );
}

export function Newsletter() {
  return (
    <section className="newsletter">
      <div className="container newsletter__inner">
        <h3>
          Stay connected and receive the latest forestry news weekly
        </h3>
        <form>
          <input type="email" placeholder="Your email address" aria-label="Email" />
          <button type="submit" className="btn btn--light">
            Subscribe Now
          </button>
        </form>
      </div>
    </section>
  );
}

export function AppointmentSection() {
  return (
    <section
      className="appointment"
      id="appointment"
      style={{ backgroundImage: `url(${IMG.formBg})` }}
    >
      <div className="container appointment__container">
        <div className="appointment__card" data-lte-animation="fadeUp">
          <h2>Make an appointment</h2>
          <AppointmentForm />
        </div>
      </div>
    </section>
  );
}
