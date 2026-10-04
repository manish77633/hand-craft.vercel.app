"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Heart, Menu, Search, X, Home, Grid2X2, MessageCircle, Info, Mail, CircleHelp } from "lucide-react";
import { WishlistCount } from "./wishlist-button";
import { whatsappUrl } from "@/lib/whatsapp";

const shopLinks = [
  { href: "/collections", label: "All products" },
  { href: "/collections/bags", label: "Bags" },
  { href: "/collections/home-decor", label: "Home Decor" },
  { href: "/collections/textiles", label: "Textiles" },
  { href: "/collections/jewellery", label: "Jewellery" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return <>
    <div className="announcement bg-deep px-4 py-2 text-center text-[10px] font-medium tracking-[.16em] text-white/85">HANDMADE WITH HEART · ENQUIRIES ON WHATSAPP</div>
    <header className="site-header relative z-40 border-b border-line bg-ivory">
      <div className="shell flex h-[58px] items-center justify-between md:h-[78px]">
        <div className="flex flex-1 items-center gap-8">
          <button aria-label="Open menu" className="grid h-9 w-9 place-items-center md:hidden" onClick={() => setOpen(true)}><Menu size={19} /></button>
          <nav aria-label="Primary navigation" className="hidden items-center gap-8 text-[13px] font-medium md:flex">
            <div className="group relative py-7"><Link href="/collections" className="hover:text-forest">Shop</Link><div className="invisible absolute left-0 top-full z-50 min-w-48 border border-line bg-ivory p-3 opacity-0 shadow-soft transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">{shopLinks.map(item => <Link key={item.href} href={item.href} className="block px-3 py-2 hover:bg-cream">{item.label}</Link>)}</div></div>
            <Link href="/collections" className="hover:text-forest">Categories</Link>
            <Link href="/about" className="hover:text-forest">Our Story</Link>
          </nav>
        </div>
        <Link href="/" aria-label="MeeraHini home" className="font-serif text-[25px] leading-none tracking-[-.04em] md:text-[34px]">MeeraHini</Link>
        <div className="flex flex-1 items-center justify-end gap-1 md:gap-5">
          <Link href="/search" aria-label="Search" className="grid h-9 w-9 place-items-center"><Search size={19} strokeWidth={1.7} /></Link>
          <Link href="/wishlist" aria-label="Wishlist" className="relative hidden h-9 w-9 place-items-center md:grid"><Heart size={19} strokeWidth={1.7} /><WishlistCount /></Link>
          <Link href="/contact" className="hidden rounded-full border border-forest px-5 py-2.5 text-xs font-semibold text-forest hover:bg-forest hover:text-white md:block">Get in touch</Link>
        </div>
      </div>
    </header>
    {open && <div className="fixed inset-0 z-50 bg-deep/55 md:hidden" role="dialog" aria-modal="true" aria-label="Mobile menu" onClick={() => setOpen(false)}>
      <div className="ml-auto flex h-full w-[min(100%,390px)] flex-col bg-deep" onClick={event => event.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-7 text-white"><span className="font-serif text-[27px]">MeeraHini</span><button aria-label="Close menu" onClick={() => setOpen(false)}><X size={20} /></button></div>
        <nav className="mx-2 flex-1 rounded-t-xl bg-ivory px-5 pt-5 text-[13px]" aria-label="Mobile menu links">
          {[
            {href:"/",label:"Home",Icon:Home}, {href:"/collections",label:"Categories",Icon:Grid2X2},
            {href:"/wishlist",label:"Wishlist",Icon:Heart}, {href:"/contact",label:"Chat on WhatsApp",Icon:MessageCircle},
            {href:"/about",label:"About Us",Icon:Info}, {href:"/contact",label:"Contact Us",Icon:Mail},
            {href:"/contact",label:"FAQs",Icon:CircleHelp}
          ].map(({href,label,Icon},index) => <Link key={`${label}-${index}`} href={href} onClick={() => setOpen(false)} className={`flex items-center gap-4 py-4 ${index === 4 ? "mt-3 border-t border-line" : ""}`}><Icon size={17} strokeWidth={1.7} />{label}</Link>)}
          <div className="relative mt-8 h-36 overflow-hidden rounded-xl"><Image src="/images/hero.png" alt="Handmade collection" fill sizes="360px" className="object-cover" /><div className="absolute inset-0 bg-gradient-to-r from-cream/90 to-transparent" /><p className="absolute left-5 top-1/2 -translate-y-1/2 font-serif text-2xl leading-none">Handmade<br />with Heart</p></div>
        </nav>
        <a href={whatsappUrl("Hi MeeraHini! I'd like to know more about your collection.")} target="_blank" rel="noreferrer" className="mx-2 flex items-center justify-center gap-2 bg-ivory px-5 pb-8 pt-4 text-xs font-semibold text-forest"><MessageCircle size={17} /> Chat on WhatsApp</a>
      </div>
    </div>}
  </>;
}
