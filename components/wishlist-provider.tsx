"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type WishlistValue = {
  ids: string[];
  ready: boolean;
  toggle: (id: string) => void;
  has: (id: string) => boolean;
};

const WishlistContext = createContext<WishlistValue | null>(null);
const KEY = "ammaai-wishlist";

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let storedIds: string[] = [];
    try {
      const stored = JSON.parse(localStorage.getItem(KEY) ?? "[]");
      if (Array.isArray(stored)) storedIds = [...new Set(stored.filter((id): id is string => typeof id === "string"))];
    } catch {}
    queueMicrotask(() => {
      setIds(storedIds);
      setReady(true);
    });
  }, []);

  const toggle = useCallback((id: string) => {
    setIds((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const value = useMemo(() => ({ ids, ready, toggle, has: (id: string) => ids.includes(id) }), [ids, ready, toggle]);
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const value = useContext(WishlistContext);
  if (!value) throw new Error("useWishlist must be used inside WishlistProvider");
  return value;
}
