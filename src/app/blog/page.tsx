import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/Sections";
import { IMG, blogPosts } from "@/lib/data";

export const metadata: Metadata = { title: "Blog" };

const categories = ["Company", "Experts", "Feedback", "Our Services", "Strategy"];
const tags = ["delivery", "experts", "feedback", "services", "technology"];

export default function BlogPage() {
  return (
    <>
      <PageHeader
        title="Classic Blog without Sidebar"
        crumb="Blog"
        image={IMG.headerBlog}
      />

      <section className="section">
        <div className="container blog-layout">
          <div>
            {blogPosts.map((post) => (
              <article className="post-card" key={post.slug}>
                <Link href={`/blog/${post.slug}`} className="post-card__media">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={post.image} alt={post.title} />
                </Link>
                <div className="post-card__meta">
                  <Link href={`/blog/${post.slug}`}>{post.category}</Link>
                  <span className="muted">{post.date}</span>
                </div>
                <h2>
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h2>
                <p>{post.excerpt}</p>
                <Link href={`/blog/${post.slug}`} className="link-arrow">
                  Read more
                </Link>
              </article>
            ))}

            <blockquote className="post-quote">
              “Practice does not make perfect. Only perfect practice makes
              perfect.”
              <cite>Vince Lombardi</cite>
            </blockquote>

            <div className="pagination">
              <span className="is-active">1</span>
              <Link href="/blog">2</Link>
            </div>
          </div>

          <aside className="blog-sidebar">
            <div className="widget">
              <h4>Search</h4>
              <form action="/blog" method="get">
                <input
                  type="search"
                  name="q"
                  placeholder="Search…"
                  aria-label="Search blog"
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    border: "1px solid var(--border)",
                    fontFamily: "inherit",
                    fontSize: 14,
                  }}
                />
              </form>
            </div>

            <div className="widget">
              <h4>Categories</h4>
              <ul>
                {categories.map((category) => (
                  <li key={category}>
                    <Link href="/blog">{category}</Link>
                    <span style={{ color: "#9a9c95", fontSize: 12 }}>
                      {blogPosts.filter((p) => p.category === category).length}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="widget">
              <h4>Recent Posts</h4>
              <ul>
                {blogPosts.slice(0, 5).map((post) => (
                  <li key={post.slug}>
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="widget">
              <h4>Tags</h4>
              <div className="widget__tags">
                {tags.map((tag) => (
                  <Link key={tag} href="/blog">
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
