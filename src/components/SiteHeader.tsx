"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { nav, IMG, site } from "@/lib/data";
import BrandMark from "@/components/BrandMark";
import { useCart } from "@/components/CartProvider";
import {
  SearchIcon,
  UserIcon,
  CartIcon,
  HeartIcon,
  InstagramIcon,
  TwitterIcon,
  FacebookIcon,
} from "@/components/Icons";

type HeaderUser = {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
};

export default function SiteHeader({ transparent = false }: { transparent?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMobileSub, setOpenMobileSub] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [user, setUser] = useState<HeaderUser | null>(null);
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const { count, wishlist } = useCart();

  const loadUser = () => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        setUser(d?.user ?? null);
      })
      .catch(() => {
        setUser(null);
      });
  };

  useEffect(() => {
    loadUser();
    const onAuthChanged = () => loadUser();
    window.addEventListener("mp-auth-changed", onAuthChanged);
    return () => window.removeEventListener("mp-auth-changed", onAuthChanged);
  }, [pathname]);

  useEffect(() => {
    let ticking = false;

    const update = () => {
      setScrolled(window.scrollY > 40);
      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setOpenMobileSub(null);
    setSearchOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setUserMenuOpen(false);
    setMobileOpen(false);
    window.dispatchEvent(new Event("mp-auth-changed"));
    if (pathname.startsWith("/admin")) {
      router.push("/my-account");
    }
  }

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const firstName = user?.name?.trim().split(/\s+/)[0] || "Account";

  return (
    <>
      <header
        className={`site-header ${transparent && !scrolled ? "" : "is-solid"} ${
          scrolled ? "has-scrolled" : ""
        }`}
      >
        <div className="topbar" aria-hidden={scrolled}>
          <div className="container topbar__inner topbar__inner--icons">
            <div className="topbar__socials">
              <a
                href={site.instagram}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                title="Instagram"
                className="topbar__social-link"
              >
                <InstagramIcon width={15} height={15} />
              </a>
              <a
                href={site.x}
                target="_blank"
                rel="noreferrer"
                aria-label="X"
                title="X"
                className="topbar__social-link"
              >
                <TwitterIcon width={14} height={14} />
              </a>
              <a
                href={site.facebook}
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                title="Facebook"
                className="topbar__social-link"
              >
                <FacebookIcon width={15} height={15} />
              </a>
            </div>
          </div>
        </div>

        <div className="container">
          <div className="navbar">
            <Link href="/" className="logo" aria-label={`${site.name} home`}>
              <BrandMark />
            </Link>

            <ul className="nav-menu">
              {nav.map((item) => (
                <li
                  key={item.label}
                  className={`${item.mega ? "has-mega" : ""} ${
                    item.children && !item.mega ? "has-drop" : ""
                  } ${isActive(item.href) ? "is-active" : ""}`}
                >
                  <Link href={item.href}>{item.label}</Link>

                  {item.mega && (
                    <div className="mega">
                      {item.children?.map((child, i) => (
                        <Link key={child.label} href={child.href} className="mega__item">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={IMG.services[i]} alt={child.label} />
                          <span>{child.label.replace("Home ", "")}</span>
                        </Link>
                      ))}
                    </div>
                  )}

                  {!item.mega && item.children && (
                    <ul className="dropdown">
                      {item.children.map((child) => (
                        <li key={child.label}>
                          <Link href={child.href}>{child.label}</Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>

            <div className="nav-actions" style={{ gap: 16 }}>
              <button
                className="nav-action"
                type="button"
                onClick={() => setSearchOpen((v) => !v)}
                aria-label="Search"
                title="Search"
              >
                <SearchIcon />
              </button>

              <Link
                href="/wishlist"
                className="nav-action"
                aria-label="Wishlist"
                title="Wishlist"
              >
                <HeartIcon />
                {wishlist.length > 0 && (
                  <span className="cart-count">{wishlist.length}</span>
                )}
              </Link>

              <Link
                href="/cart"
                className="nav-action"
                aria-label="Cart"
                title="Cart"
              >
                <CartIcon />
                {count > 0 && <span className="cart-count">{count}</span>}
              </Link>

              <div
                ref={userMenuRef}
                className="nav-profile-wrap"
                style={{ position: "relative" }}
                onMouseEnter={() => setUserMenuOpen(true)}
                onMouseLeave={() => setUserMenuOpen(false)}
              >
                {user ? (
                  <button
                    type="button"
                    className="nav-action"
                    onClick={() => setUserMenuOpen((v) => !v)}
                    aria-expanded={userMenuOpen}
                    aria-haspopup="menu"
                  >
                    <UserIcon />
                    <span>{firstName} ▾</span>
                  </button>
                ) : (
                  <Link
                    href="/my-account"
                    className="nav-action"
                    aria-expanded={userMenuOpen}
                    aria-haspopup="menu"
                  >
                    <UserIcon />
                    <span>Login</span>
                  </Link>
                )}

                {userMenuOpen && (
                  <div
                    role="menu"
                    style={{
                      position: "absolute",
                      top: "100%",
                      right: 0,
                      paddingTop: 8,
                      zIndex: 120,
                    }}
                  >
                    <div
                      style={{
                        minWidth: 230,
                        background: "#ffffff",
                        color: "#1b1c1a",
                        border: "1px solid var(--border)",
                        boxShadow: "0 14px 36px rgba(0, 0, 0, 0.14)",
                        padding: "8px 0",
                      }}
                    >
                      {user ? (
                        <>
                          <div
                            style={{
                              padding: "10px 16px",
                              borderBottom: "1px solid var(--border)",
                            }}
                          >
                            <div style={{ fontWeight: 700, fontSize: 14 }}>
                              {user.name}
                            </div>
                            <div style={{ fontSize: 12, color: "#6d6f6c" }}>
                              {user.email}
                            </div>
                          </div>

                          <Link
                            href="/my-account?tab=orders"
                            role="menuitem"
                            onClick={() => setUserMenuOpen(false)}
                            style={{
                              display: "block",
                              padding: "9px 16px",
                              fontSize: 13.5,
                            }}
                          >
                            My Orders &amp; Invoices
                          </Link>
                          <Link
                            href="/track-order"
                            role="menuitem"
                            onClick={() => setUserMenuOpen(false)}
                            style={{
                              display: "block",
                              padding: "9px 16px",
                              fontSize: 13.5,
                            }}
                          >
                            Track Order
                          </Link>
                          <Link
                            href="/my-account?tab=profile"
                            role="menuitem"
                            onClick={() => setUserMenuOpen(false)}
                            style={{
                              display: "block",
                              padding: "9px 16px",
                              fontSize: 13.5,
                            }}
                          >
                            Profile &amp; Saved Address
                          </Link>
                          <Link
                            href="/wishlist"
                            role="menuitem"
                            onClick={() => setUserMenuOpen(false)}
                            style={{
                              display: "block",
                              padding: "9px 16px",
                              fontSize: 13.5,
                            }}
                          >
                            Wishlist ({wishlist.length})
                          </Link>
                          <Link
                            href="/my-account?tab=security"
                            role="menuitem"
                            onClick={() => setUserMenuOpen(false)}
                            style={{
                              display: "block",
                              padding: "9px 16px",
                              fontSize: 13.5,
                            }}
                          >
                            Security &amp; Password
                          </Link>

                          {user.role === "admin" && (
                            <Link
                              href="/admin"
                              role="menuitem"
                              onClick={() => setUserMenuOpen(false)}
                              style={{
                                display: "block",
                                padding: "9px 16px",
                                fontSize: 13.5,
                                fontWeight: 700,
                                color: "var(--main)",
                                borderTop: "1px solid var(--border)",
                              }}
                            >
                              Admin Dashboard
                            </Link>
                          )}

                          <button
                            type="button"
                            role="menuitem"
                            onClick={handleLogout}
                            style={{
                              display: "block",
                              width: "100%",
                              textAlign: "left",
                              padding: "9px 16px",
                              fontSize: 13.5,
                              fontWeight: 600,
                              color: "#991b1b",
                              background: "transparent",
                              border: "none",
                              borderTop: "1px solid var(--border)",
                              cursor: "pointer",
                              fontFamily: "inherit",
                            }}
                          >
                            Logout
                          </button>
                        </>
                      ) : (
                        <>
                          <div
                            style={{
                              padding: "10px 16px",
                              borderBottom: "1px solid var(--border)",
                            }}
                          >
                            <div style={{ fontWeight: 700, fontSize: 14 }}>
                              Welcome to Mariya Plywoods
                            </div>
                            <div style={{ fontSize: 12, color: "#6d6f6c" }}>
                              Sign in to manage orders &amp; profile
                            </div>
                          </div>
                          <Link
                            href="/my-account"
                            role="menuitem"
                            onClick={() => setUserMenuOpen(false)}
                            style={{
                              display: "block",
                              padding: "9px 16px",
                              fontSize: 13.5,
                              fontWeight: 600,
                              color: "var(--main)",
                            }}
                          >
                            Login / Register
                          </Link>
                          <Link
                            href="/track-order"
                            role="menuitem"
                            onClick={() => setUserMenuOpen(false)}
                            style={{
                              display: "block",
                              padding: "9px 16px",
                              fontSize: 13.5,
                            }}
                          >
                            Track Order
                          </Link>
                          <Link
                            href="/wishlist"
                            role="menuitem"
                            onClick={() => setUserMenuOpen(false)}
                            style={{
                              display: "block",
                              padding: "9px 16px",
                              fontSize: 13.5,
                            }}
                          >
                            Wishlist ({wishlist.length})
                          </Link>
                          <Link
                            href="/cart"
                            role="menuitem"
                            onClick={() => setUserMenuOpen(false)}
                            style={{
                              display: "block",
                              padding: "9px 16px",
                              fontSize: 13.5,
                            }}
                          >
                            Cart ({count})
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button
                className="nav-toggle"
                type="button"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
              >
                <span />
                <span />
                <span />
              </button>
            </div>
          </div>
        </div>

        {searchOpen && (
          <div className="search-bar">
            <div className="container">
              <form action="/shop" method="get" className="search-bar__form">
                <input
                  type="search"
                  name="q"
                  placeholder="Search products, services…"
                  autoFocus
                />
                <button type="submit" className="btn btn--sm">Search</button>
                <button
                  type="button"
                  className="search-bar__close"
                  onClick={() => setSearchOpen(false)}
                  aria-label="Close search"
                >
                  ×
                </button>
              </form>
            </div>
          </div>
        )}
      </header>

      <div className={`mobile-menu ${mobileOpen ? "is-open" : ""}`}>
        <div className="mobile-menu__head">
          <Link href="/" className="mobile-menu__brand" aria-label={`${site.name} home`}>
            <BrandMark />
          </Link>
          <button
            className="mobile-close"
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            ×
          </button>
        </div>
        <nav>
          <ul>
            {nav.map((item) => {
              const hasKids = Boolean(item.children && item.children.length > 0);
              const isOpen = openMobileSub === item.label;
              return (
                <li key={item.label}>
                  {hasKids ? (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setOpenMobileSub((cur) =>
                            cur === item.label ? null : item.label
                          )
                        }
                        aria-expanded={isOpen}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          width: "100%",
                          background: "none",
                          border: "none",
                          color: "inherit",
                          font: "inherit",
                          padding: "16px 0",
                          textTransform: "uppercase",
                          letterSpacing: "0.12em",
                          fontSize: 14,
                          fontWeight: 600,
                          cursor: "pointer",
                          textAlign: "left",
                        }}
                      >
                        <span>{item.label}</span>
                        <span style={{ fontSize: 13, opacity: 0.75 }}>
                          {isOpen ? "▴" : "▾"}
                        </span>
                      </button>
                      {isOpen && (
                        <ul
                          style={{
                            paddingLeft: 14,
                            margin: "4px 0 8px",
                            borderLeft: "1px solid rgba(255, 255, 255, 0.18)",
                          }}
                        >
                          {item.children!.map((child) => (
                            <li key={child.label}>
                              <Link
                                href={child.href}
                                onClick={() => setMobileOpen(false)}
                              >
                                {child.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  ) : (
                    <Link href={item.href} onClick={() => setMobileOpen(false)}>
                      {item.label}
                    </Link>
                  )}
                </li>
              );
            })}
            <li>
              <Link
                href="/wishlist"
                onClick={() => setMobileOpen(false)}
              >
                Wishlist ({wishlist.length})
              </Link>
            </li>
            {user ? (
              <>
                <li>
                  <Link
                    href="/my-account?tab=orders"
                    onClick={() => setMobileOpen(false)}
                  >
                    {user.name} — My Orders
                  </Link>
                </li>
                <li>
                  <Link
                    href="/my-account?tab=profile"
                    onClick={() => setMobileOpen(false)}
                  >
                    Profile &amp; Address
                  </Link>
                </li>
                {user.role === "admin" && (
                  <li>
                    <Link href="/admin" onClick={() => setMobileOpen(false)}>
                      Admin Dashboard
                    </Link>
                  </li>
                )}
                <li>
                  <button
                    type="button"
                    onClick={handleLogout}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#ffb4ab",
                      font: "inherit",
                      padding: "8px 0",
                      cursor: "pointer",
                    }}
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <li>
                <Link href="/my-account" onClick={() => setMobileOpen(false)}>
                  Login / Register
                </Link>
              </li>
            )}
            <li>
              <Link href="/cart" onClick={() => setMobileOpen(false)}>
                Cart ({count})
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
}
