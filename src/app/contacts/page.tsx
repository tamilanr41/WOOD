import type { Metadata } from "next";
import { PageHeader, LogosRow } from "@/components/Sections";
import ContactForm from "@/components/ContactForm";
import { IMG, site } from "@/lib/data";
import { PhoneIcon, PinIcon, InstagramIcon, ClockIcon } from "@/components/Icons";

export const metadata: Metadata = { title: "Contacts" };

export default function ContactsPage() {
  return (
    <>
      <PageHeader title="Contacts" crumb="Contacts" image={IMG.hero[0]} />

      <section className="section">
        <div className="container">
          <div className="about-grid">
            <div>
              <span className="eyebrow">Contact form</span>
              <h2 className="h2" style={{ marginBottom: 22 }}>
                Mariya Plywoods — get in touch
              </h2>
              <p className="lead" style={{ marginBottom: 34 }}>
                Visit us for plywoods, laminates, furniture and home interiors, or contact us to discuss your requirements.
              </p>

              <ul className="footer-contact" style={{ color: "var(--black-lighter)" }}>
                <li>
                  <PhoneIcon width={20} height={20} />
                  <a href="tel:+919443548290">{site.phone}</a>
                </li>
                <li>
                  <PinIcon width={20} height={20} />
                  <a href={site.mapUrl} target="_blank" rel="noreferrer">{site.address}</a>
                </li>
                <li>
                  <InstagramIcon width={20} height={20} />
                  <a href={site.instagram} target="_blank" rel="noreferrer">{site.instagramHandle}</a>
                </li>
                <li>
                  <ClockIcon width={20} height={20} />
                  <span>{site.workHours}</span>
                </li>
              </ul>
            </div>

            <div className="summary-box" style={{ background: "var(--gray-light)" }}>
              <h3>Send us a message</h3>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      <section className="contacts-map-section" aria-label="Mariya Plywoods location">
        <iframe
          className="contacts-map"
          src={site.mapEmbedUrl}
          title="Mariya Plywoods location on Google Maps"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </section>

      <LogosRow />
    </>
  );
}
