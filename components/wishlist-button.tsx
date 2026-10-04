"use client";

import { Heart } from "lucide-react";
import { useWishlist } from "./wishlist-provider";

export function WishlistButton({ id, className = "" }: { id: string; className?: string }) {
  const { has, toggle, ready } = useWishlist();
  const active = ready && has(id);
  return (
    <button
      type="button"
      onClick={(event) => { event.preventDefault(); toggle(id); }}
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={active}
      className={`grid h-8 w-8 place-items-center rounded-full border border-line bg-ivory/90 text-ink transition hover:border-forest hover:text-forest md:h-10 md:w-10 ${className}`}
    >
      <Heart size={16} fill={active ? "currentColor" : "none"} className={active ? "text-[#b65348]" : ""} />
    </button>
  );
}

export function WishlistCount() {
  const { ids, ready } = useWishlist();
  if (!ready || !ids.length) return null;
  return <span className="absolute -right-2 -top-2 grid min-h-5 min-w-5 place-items-center rounded-full bg-forest px-1 text-[10px] font-bold text-white">{ids.length}</span>;
}
