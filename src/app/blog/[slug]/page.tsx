import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/Sections";
import { IMG, blogPosts } from "@/lib/data";

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  return { title: post ? post.title : "Blog" };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) notFound();

  const related = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <>
      <PageHeader title={post.title} crumb="Blog" image={post.image} />

      <section className="section">
        <div className="container">
          <article className="post-body" style={{ margin: "0 auto" }}>
            <div className="post-card__meta">
              <span>{post.category}</span>
              <span className="muted">{post.date}</span>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.image}
              alt={post.title}
              style={{
                width: "100%",
                height: "clamp(220px, 52vw, 460px)",
                objectFit: "cover",
                margin: "8px 0 30px",
              }}
            />
            <p>{post.excerpt}</p>
            <p>
              Wood has its own character, and the craft lies in revealing its best
              qualities while bringing a functional idea to life. Carpentry has
              evolved over centuries, yet the foundation of the craft remains
              rooted in traditional methods. Hand-shaping wood, measuring by eye
              and understanding how a board will move are skills that still set
              great work apart.
            </p>
            <h3>Respecting the material</h3>
            <p>
              Every project begins with careful selection. Grain direction,
              moisture content and the natural defects that give timber its
              personality all inform the way a piece is built. We dry and grade
              our stock in-house so that what arrives on site behaves exactly as
              expected.
            </p>
            <blockquote className="post-quote">
              “Practice does not make perfect. Only perfect practice makes
              perfect.”
              <cite>Vince Lombardi</cite>
            </blockquote>
            <p>
              The result is furniture and joinery that feels calm, honest and
              built to be lived with. It is a slower way of working, but the
              pieces last for generations rather than seasons.
            </p>
            <p style={{ marginTop: 34 }}>
              <Link href="/blog" className="link-arrow">
                Back to all posts
              </Link>
            </p>
          </article>

          <div style={{ marginTop: 70 }}>
            <div className="section-head">
              <div>
                <span className="eyebrow">Keep reading</span>
                <h2 className="h2">Related Posts</h2>
              </div>
            </div>
            <div className="products-grid">
              {related.map((item) => (
                <article className="post-card" key={item.slug} style={{ borderBottom: "none" }}>
                  <Link href={`/blog/${item.slug}`} className="post-card__media">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image} alt={item.title} style={{ height: 260 }} />
                  </Link>
                  <div className="post-card__meta">
                    <span>{item.category}</span>
                    <span className="muted">{item.date}</span>
                  </div>
                  <h2 style={{ fontSize: 20 }}>
                    <Link href={`/blog/${item.slug}`}>{item.title}</Link>
                  </h2>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
