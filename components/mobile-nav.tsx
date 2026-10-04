"use client";

import Link from "next/link";
import { Grid2X2, Heart, Home, MessageCircle } from "lucide-react";
import { whatsappUrl } from "@/lib/whatsapp";
import { WishlistCount } from "./wishlist-button";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/collections", label: "Categories", icon: Grid2X2 },
  { href: "/wishlist", label: "Wishlist", icon: Heart, count: true },
];

export function MobileNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 grid h-[58px] grid-cols-4 border-t border-line bg-ivory/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden" aria-label="Mobile navigation">
      {items.map(({ href, label, icon: Icon, count }) => (
        <Link key={href} href={href} className="grid place-items-center py-1 text-[9px] text-muted">
          <span className="relative"><Icon size={18} strokeWidth={1.8} />{count && <WishlistCount />}</span><span>{label}</span>
        </Link>
      ))}
      <a href={whatsappUrl("Hi MeeraHini! I'd like to know more about your handmade collection.")} target="_blank" rel="noreferrer" className="grid place-items-center py-1 text-[9px] text-muted">
        <MessageCircle size={18} strokeWidth={1.8} /><span>Chat</span>
      </a>
    </nav>
  );
}
