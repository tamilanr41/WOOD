"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CatalogProduct } from "@/lib/seed";

export type CartLine = {
  slug: string;
  title: string;
  price: number;
  unit?: string;
  image: string;
  qty: number;
  selectedOptions?: string;
};

type CartContextValue = {
  lines: CartLine[];
  savedForLater: CartLine[];
  wishlist: string[];
  recentlyViewed: string[];
  count: number;
  subtotal: number;
  add: (
    product: CatalogProduct,
    qty?: number,
    selectedOptions?: string
  ) => void;
  remove: (slug: string, selectedOptions?: string) => void;
  setQty: (slug: string, qty: number, selectedOptions?: string) => void;
  saveForLater: (slug: string, selectedOptions?: string) => void;
  moveToCart: (slug: string, selectedOptions?: string) => void;
  removeSaved: (slug: string, selectedOptions?: string) => void;
  toggleWishlist: (slug: string) => void;
  isWishlisted: (slug: string) => boolean;
  trackViewed: (slug: string) => void;
  clear: () => void;
  ready: boolean;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "lumbert-cart-v1";
const SAVED_KEY = "lumbert-saved-v1";
const WISHLIST_KEY = "lumbert-wishlist-v1";
const RECENT_KEY = "lumbert-recent-v1";

function matchLine(l: CartLine, slug: string, selectedOptions?: string) {
  return (
    l.slug === slug &&
    (selectedOptions === undefined ||
      (l.selectedOptions || "") === (selectedOptions || ""))
  );
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [activeUserId, setActiveUserId] = useState<string | null | undefined>(
    undefined
  );
  const [lines, setLines] = useState<CartLine[]>([]);
  const [savedForLater, setSavedForLater] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  const loadUserState = useCallback(
    (userId: string | null, serverWishlist: string[] = []) => {
      setReady(false);
      if (!userId) {
        setLines([]);
        setSavedForLater([]);
        setWishlist([]);
        setRecentlyViewed([]);
        setActiveUserId(null);
        setReady(true);
        return;
      }

      try {
        const raw = window.localStorage.getItem(`${STORAGE_KEY}:${userId}`);
        if (raw) {
          const saved = JSON.parse(raw) as CartLine[];
          setLines(
            saved.flatMap((line) => {
              const qty = Number.isFinite(line.qty) ? Math.floor(line.qty) : 0;
              const price = Number(line.price);
              if (!line.slug || !line.title || !Number.isFinite(price) || qty < 1) {
                return [];
              }
              return [
                {
                  slug: line.slug,
                  title: line.title,
                  price,
                  unit: line.unit || "item",
                  image: line.image,
                  qty,
                  selectedOptions: line.selectedOptions || "",
                },
              ];
            })
          );
        } else {
          setLines([]);
        }

        const rawSaved = window.localStorage.getItem(`${SAVED_KEY}:${userId}`);
        setSavedForLater(rawSaved ? JSON.parse(rawSaved) : []);

        const rawWish = window.localStorage.getItem(`${WISHLIST_KEY}:${userId}`);
        if (rawWish) {
          const localWish = JSON.parse(rawWish) as string[];
          const merged = Array.from(new Set([...localWish, ...serverWishlist]));
          setWishlist(merged);
        } else {
          setWishlist(serverWishlist);
        }

        const rawRecent = window.localStorage.getItem(`${RECENT_KEY}:${userId}`);
        setRecentlyViewed(rawRecent ? JSON.parse(rawRecent) : []);
      } catch {
        setLines([]);
        setSavedForLater([]);
        setWishlist(serverWishlist);
        setRecentlyViewed([]);
      }

      setActiveUserId(userId);
      setReady(true);
    },
    []
  );

  useEffect(() => {
    let mounted = true;
    const syncAuth = () => {
      fetch("/api/auth/me")
        .then((r) => r.json())
        .then((d) => {
          if (!mounted) return;
          const uid = d?.user?.id ? String(d.user.id) : null;
          const serverWish = Array.isArray(d?.user?.wishlist)
            ? (d.user.wishlist as string[])
            : [];
          loadUserState(uid, serverWish);
        })
        .catch(() => {
          if (mounted) loadUserState(null, []);
        });
    };

    syncAuth();
    window.addEventListener("mp-auth-changed", syncAuth);
    return () => {
      mounted = false;
      window.removeEventListener("mp-auth-changed", syncAuth);
    };
  }, [loadUserState]);

  useEffect(() => {
    if (!ready || !activeUserId) return;
    try {
      window.localStorage.setItem(
        `${STORAGE_KEY}:${activeUserId}`,
        JSON.stringify(lines)
      );
      window.localStorage.setItem(
        `${SAVED_KEY}:${activeUserId}`,
        JSON.stringify(savedForLater)
      );
      window.localStorage.setItem(
        `${WISHLIST_KEY}:${activeUserId}`,
        JSON.stringify(wishlist)
      );
      window.localStorage.setItem(
        `${RECENT_KEY}:${activeUserId}`,
        JSON.stringify(recentlyViewed)
      );
    } catch {
      /* ignore */
    }
  }, [lines, savedForLater, wishlist, recentlyViewed, ready, activeUserId]);

  const add = useCallback(
    (product: CatalogProduct, qty = 1, selectedOptions = "") => {
      if (!activeUserId) {
        window.location.href = "/my-account";
        return;
      }
      const effectivePrice =
        product.salePrice != null &&
        product.salePrice > 0 &&
        product.salePrice < product.price
          ? product.salePrice
          : product.price;

      setLines((prev) => {
        const existing = prev.find((l) =>
          matchLine(l, product.slug, selectedOptions)
        );
        if (existing) {
          return prev.map((l) =>
            matchLine(l, product.slug, selectedOptions)
              ? { ...l, qty: l.qty + qty }
              : l
          );
        }
        return [
          ...prev,
          {
            slug: product.slug,
            title: product.title,
            price: effectivePrice,
            unit: product.unit || "item",
            image: product.image,
            qty,
            selectedOptions,
          },
        ];
      });
    },
    [activeUserId]
  );

  const remove = useCallback((slug: string, selectedOptions?: string) => {
    setLines((prev) => prev.filter((l) => !matchLine(l, slug, selectedOptions)));
  }, []);

  const setQty = useCallback(
    (slug: string, qty: number, selectedOptions?: string) => {
      setLines((prev) =>
        qty <= 0
          ? prev.filter((l) => !matchLine(l, slug, selectedOptions))
          : prev.map((l) =>
              matchLine(l, slug, selectedOptions) ? { ...l, qty } : l
            )
      );
    },
    []
  );

  const saveForLater = useCallback(
    (slug: string, selectedOptions?: string) => {
      setLines((prev) => {
        const target = prev.find((l) => matchLine(l, slug, selectedOptions));
        if (target) {
          setSavedForLater((s) =>
            s.some((x) => matchLine(x, slug, selectedOptions))
              ? s
              : [...s, target]
          );
        }
        return prev.filter((l) => !matchLine(l, slug, selectedOptions));
      });
    },
    []
  );

  const moveToCart = useCallback((slug: string, selectedOptions?: string) => {
    setSavedForLater((prev) => {
      const target = prev.find((l) => matchLine(l, slug, selectedOptions));
      if (target) {
        setLines((curr) => [...curr, target]);
      }
      return prev.filter((l) => !matchLine(l, slug, selectedOptions));
    });
  }, []);

  const removeSaved = useCallback((slug: string, selectedOptions?: string) => {
    setSavedForLater((prev) =>
      prev.filter((l) => !matchLine(l, slug, selectedOptions))
    );
  }, []);

  const toggleWishlist = useCallback(
    (slug: string) => {
      if (!activeUserId) {
        window.location.href = "/my-account";
        return;
      }
      setWishlist((prev) => {
        const next = prev.includes(slug)
          ? prev.filter((s) => s !== slug)
          : [...prev, slug];
        fetch("/api/auth/me", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wishlist: next }),
        }).catch(() => {});
        return next;
      });
    },
    [activeUserId]
  );

  const isWishlisted = useCallback(
    (slug: string) => wishlist.includes(slug),
    [wishlist]
  );

  const trackViewed = useCallback((slug: string) => {
    setRecentlyViewed((prev) => {
      const next = [slug, ...prev.filter((s) => s !== slug)].slice(0, 8);
      return next;
    });
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const count = useMemo(() => lines.reduce((n, l) => n + l.qty, 0), [lines]);
  const subtotal = useMemo(
    () => lines.reduce((n, l) => n + l.qty * l.price, 0),
    [lines]
  );

  return (
    <CartContext.Provider
      value={{
        lines,
        savedForLater,
        wishlist,
        recentlyViewed,
        count,
        subtotal,
        add,
        remove,
        setQty,
        saveForLater,
        moveToCart,
        removeSaved,
        toggleWishlist,
        isWishlisted,
        trackViewed,
        clear,
        ready,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
