import Link from "next/link";
import { Instagram, MessageCircle } from "lucide-react";
import { whatsappUrl } from "@/lib/whatsapp";

export function SiteFooter() {
  return (
    <footer className="bg-deep pb-24 pt-16 text-white md:pb-8 md:pt-20">
      <div className="shell grid gap-12 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <p className="font-serif text-4xl">MeeraHini</p>
          <p className="mt-4 max-w-xs text-sm leading-6 text-white/65">Handmade pieces with warmth, character, and a little more meaning for everyday life.</p>
        </div>
        <div><p className="eyebrow text-white/55">Explore</p><div className="mt-5 grid gap-3 text-sm"><Link href="/collections">All products</Link><Link href="/collections/bags">Bags</Link><Link href="/collections/home-decor">Home decor</Link></div></div>
        <div><p className="eyebrow text-white/55">MeeraHini</p><div className="mt-5 grid gap-3 text-sm"><Link href="/about">Our story</Link><Link href="/contact">Contact</Link><Link href="/wishlist">Wishlist</Link></div></div>
        <div><p className="eyebrow text-white/55">Stay close</p><div className="mt-5 flex gap-3"><a className="grid h-11 w-11 place-items-center rounded-full border border-white/20" href={whatsappUrl("Hi MeeraHini! I'd like to know more about your collection.")} target="_blank" rel="noreferrer" aria-label="WhatsApp"><MessageCircle size={18} /></a><span className="grid h-11 w-11 place-items-center rounded-full border border-white/20" aria-label="Instagram coming soon"><Instagram size={18} /></span></div></div>
      </div>
      <div className="shell mt-16 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-white/45 md:flex-row md:justify-between"><span>© {new Date().getFullYear()} MeeraHini</span><span>Made by hand. Chosen with heart.</span></div>
    </footer>
  );
}
