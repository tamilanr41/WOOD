"use client";

import { useMemo, useState } from "react";
import { categories as defaultCategories } from "@/lib/data";
import type { CatalogProduct } from "@/lib/seed";
import { useCart } from "@/components/CartProvider";
import ProductCard from "@/components/ProductCard";

type Sort = "default" | "price-asc" | "price-desc" | "name";

const TAGS = ["furniture", "plywood", "modular", "oak", "handcrafted"];
const PAGE_SIZE = 9;

export default function ShopView({
  initialProducts,
  initialQuery = "",
  initialCategory = "All",
}: {
  initialProducts: CatalogProduct[];
  initialQuery?: string;
  initialCategory?: string;
}) {
  const { recentlyViewed } = useCart();
  const [category, setCategory] = useState(initialCategory);
  const [activeTag, setActiveTag] = useState<string>("");
  const [sort, setSort] = useState<Sort>("default");
  const [query, setQuery] = useState(initialQuery);
  const [page, setPage] = useState(1);

  const allCategories = useMemo(() => {
    const set = new Set(defaultCategories);
    for (const p of initialProducts) {
      if (p.category) set.add(p.category);
    }
    return Array.from(set);
  }, [initialProducts]);

  const visible = useMemo(() => {
    let list = initialProducts.slice();
    if (category !== "All") list = list.filter((p) => p.category === category);
    if (activeTag) {
      list = list.filter((p) =>
        p.tags?.some((t) => t.toLowerCase() === activeTag.toLowerCase())
      );
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    if (sort === "name") list.sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }, [initialProducts, category, activeTag, sort, query]);

  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = visible.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const recentProducts = useMemo(
    () =>
      recentlyViewed
        .map((slug) => initialProducts.find((p) => p.slug === slug))
        .filter((p): p is CatalogProduct => Boolean(p))
        .slice(0, 3),
    [recentlyViewed, initialProducts]
  );

  return (
    <div>
      {/* Promotional Banner */}
      <div
        style={{
          background: "var(--gray-light)",
          border: "1px solid var(--border)",
          padding: "14px 20px",
          marginBottom: 28,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <span style={{ fontSize: 14 }}>
          <strong>Workshop Direct Pricing:</strong> Free delivery on qualifying
          orders · Custom plywood sizing &amp; bulk quotes available.
        </span>
        <a href="/contacts" className="link-arrow" style={{ fontSize: 13.5 }}>
          Request Bulk Quote
        </a>
      </div>

      <div className="shop-layout">
        <aside className="shop-sidebar">
          <h4>Search</h4>
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search products…"
            style={{
              width: "100%",
              padding: "11px 12px",
              border: "1px solid var(--border)",
              marginBottom: 28,
              fontFamily: "inherit",
              fontSize: 14,
            }}
          />

          <h4>Product categories</h4>
          <ul>
            <li>
              <button
                type="button"
                className={category === "All" ? "is-active" : ""}
                onClick={() => {
                  setCategory("All");
                  setPage(1);
                }}
              >
                All products
              </button>
            </li>
            {allCategories.map((c) => (
              <li key={c}>
                <button
                  type="button"
                  className={category === c ? "is-active" : ""}
                  onClick={() => {
                    setCategory(c);
                    setPage(1);
                  }}
                >
                  {c}
                </button>
              </li>
            ))}
          </ul>

          <h4>Product tags</h4>
          <ul>
            {TAGS.map((tag) => (
              <li key={tag}>
                <button
                  type="button"
                  className={activeTag === tag ? "is-active" : ""}
                  onClick={() => {
                    setActiveTag((prev) => (prev === tag ? "" : tag));
                    setPage(1);
                  }}
                >
                  {tag}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div>
          <div className="shop-toolbar">
            <span>
              Showing{" "}
              {visible.length === 0
                ? 0
                : (currentPage - 1) * PAGE_SIZE + 1}
              –{Math.min(currentPage * PAGE_SIZE, visible.length)} of{" "}
              {visible.length} results
            </span>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value as Sort);
                setPage(1);
              }}
              aria-label="Sort products"
            >
              <option value="default">Default sorting</option>
              <option value="name">Sort by name</option>
              <option value="price-asc">Sort by price: low to high</option>
              <option value="price-desc">Sort by price: high to low</option>
            </select>
          </div>

          {paginated.length === 0 ? (
            <div className="empty-state">
              <h2>No products found</h2>
              <p>Try a different search term, tag, or category.</p>
            </div>
          ) : (
            <>
              <div className="products-grid">
                {paginated.map((p) => (
                  <ProductCard key={p.slug} product={p} />
                ))}
              </div>

              {totalPages > 1 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    flexWrap: "wrap",
                    gap: 8,
                    marginTop: 32,
                  }}
                >
                  <button
                    type="button"
                    className="btn btn--sm btn--outline"
                    disabled={currentPage <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (num) => (
                      <button
                        key={num}
                        type="button"
                        className={
                          num === currentPage
                            ? "btn btn--sm"
                            : "btn btn--sm btn--outline"
                        }
                        onClick={() => setPage(num)}
                      >
                        {num}
                      </button>
                    )
                  )}
                  <button
                    type="button"
                    className="btn btn--sm btn--outline"
                    disabled={currentPage >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}

          {recentProducts.length > 0 && (
            <div style={{ marginTop: 56 }}>
              <h3 style={{ marginBottom: 18 }}>Recently Viewed</h3>
              <div className="products-grid">
                {recentProducts.map((p) => (
                  <ProductCard key={p.slug} product={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
