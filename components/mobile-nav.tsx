"use client";

import Link from "next/link";
import { Grid2X2, Heart, Home, Info, Mail } from "lucide-react";
import { WishlistCount } from "./wishlist-button";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/collections", label: "Categories", icon: Grid2X2 },
  { href: "/wishlist", label: "Wishlist", icon: Heart, count: true },
  { href: "/about", label: "About", icon: Info },
  { href: "/contact", label: "Contact", icon: Mail },
];

export function MobileNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 grid h-[58px] grid-cols-5 border-t border-line bg-ivory/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden" aria-label="Mobile navigation">
      {items.map(({ href, label, icon: Icon, count }) => (
        <Link key={href} href={href} className="grid place-items-center py-1 text-[9px] text-muted">
          <span className="relative"><Icon size={18} strokeWidth={1.8} />{count && <WishlistCount />}</span><span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}
