import Link from "next/link";
import { site } from "@/lib/data";
import BrandMark from "@/components/BrandMark";
import {
  PinIcon,
  PhoneIcon,
  ClockIcon,
  InstagramIcon,
} from "@/components/Icons";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <BrandMark className="brand-mark--footer" />
            <h3>{site.tagline}</h3>
            <p>
              Quality plywood, laminates, bespoke furniture and home interiors,
              selected to bring lasting value to every space.
            </p>
            <div className="footer-socials">
              <a href={site.instagram} target="_blank" rel="noreferrer" aria-label="Instagram">
                <InstagramIcon width={19} height={19} />
                <span>Follow us on Instagram</span>
              </a>
            </div>
          </div>

          <div className="footer-col">
            <h4>Explore</h4>
            <ul>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/about-us">About</Link></li>
              <li><Link href="/blog">Blog</Link></li>
              <li><Link href="/shop">Store</Link></li>
              <li><Link href="/contacts">Contacts</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Contact Info</h4>
            <ul className="footer-contact">
              <li>
                <PinIcon width={18} height={18} />
                <a href={site.mapUrl} target="_blank" rel="noreferrer">{site.address}</a>
              </li>
              <li>
                <PhoneIcon width={18} height={18} />
                <a href="tel:+919443548290">{site.phone}</a>
              </li>
              <li>
                <InstagramIcon width={18} height={18} />
                <a href={site.instagram} target="_blank" rel="noreferrer">{site.instagramHandle}</a>
              </li>
              <li>
                <ClockIcon width={18} height={18} />
                <span>{site.workHours}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </span>
          <span>
            <Link href="/privacy-policy">Privacy Policy</Link>
            {"  ·  "}
            <Link href="/terms">Terms &amp; Conditions</Link>
            {"  ·  "}
            <Link href="/refund-policy">Shipping &amp; Refunds</Link>
            {"  ·  "}
            <Link href="/contacts">Support</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
