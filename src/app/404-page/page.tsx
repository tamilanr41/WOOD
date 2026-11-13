import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "404 Page" };

export default function FourOhFourPage() {
  return (
    <section className="notfound">
      <div>
        <div className="notfound__code">404</div>
        <h1>Page not found</h1>
        <p>
          The page you are looking for may have been moved, renamed or is no
          longer available. Let us take you back to solid ground.
        </p>
        <Link href="/" className="btn">
          Back to home
        </Link>
      </div>
    </section>
  );
}
