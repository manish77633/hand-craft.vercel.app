import Image from "@/components/store-image";
import Link from "next/link";
import { ArrowUpRight, Instagram, MessageCircle, ExternalLink } from "lucide-react";
import { whatsappUrl } from "@/lib/whatsapp";

import type { StoreSettings } from "@/lib/cms/site-settings";
import { BrandLogo } from "./brand-logo";

export function SiteFooter({ settings, categories }: { settings: StoreSettings; categories: Array<{ name: string; slug: string }> }) {
  return <footer className="site-footer relative isolate overflow-hidden bg-deep pb-20 pt-0 text-white md:pb-8">
    <div className="footer-invitation relative overflow-hidden border-b border-white/10 py-9 md:py-14">
      <div className="footer-botanical footer-botanical-top"><Image src="/images/footer-botanical.png" alt="" fill sizes="50vw" /></div>
      <div className="shell relative z-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div><p className="eyebrow text-[#d7c9a7]">A little something made with care</p><h2 className="mt-3 max-w-2xl font-serif text-[36px] leading-[.95] md:text-[58px]">Find a piece that feels like home.</h2></div>
        <Link href="/collections" className="footer-cta inline-flex w-fit items-center gap-3 rounded-full px-6 py-3 text-xs font-semibold transition md:px-7 md:py-4 md:text-sm">Explore the collection <ArrowUpRight size={17} /></Link>
      </div>
    </div>

    <div className="shell relative grid gap-9 py-9 md:grid-cols-[1.5fr_1fr_1fr_1fr] md:gap-12 md:py-14">
      <div className="relative z-10"><Link href="/" className="inline-flex items-center gap-3"><BrandLogo src={settings.logo} tone="dark" /></Link><p className="mt-4 max-w-xs text-[12px] leading-6 text-white/65 md:text-sm">{settings.footerDescription}</p><p className="mt-4 text-[10px] uppercase tracking-[.18em] text-white/45">Handmade with heart</p></div>
      <div><p className="eyebrow text-[#d7c9a7]">Explore</p><div className="footer-links mt-4 grid gap-3 text-[12px] text-white/75 md:mt-5 md:text-sm"><Link href="/collections">All products</Link>{categories.map(category => <Link key={category.slug} href={`/collections/${category.slug}`}>{category.name}</Link>)}</div></div>
      <div><p className="eyebrow text-[#d7c9a7]">Ammaai</p><div className="footer-links mt-4 grid gap-3 text-[12px] text-white/75 md:mt-5 md:text-sm"><Link href="/about">Our story</Link><Link href="/contact">Contact</Link><Link href="/wishlist">Wishlist</Link><Link href="/#faq">FAQs</Link></div></div>
      <div><p className="eyebrow text-[#d7c9a7]">Let’s connect</p><p className="mt-4 max-w-[230px] text-[12px] leading-5 text-white/65 md:mt-5 md:text-sm md:leading-6">Questions about a piece? We’re happy to help you choose.</p><div className="mt-4 flex gap-2"><a className="footer-social grid h-10 w-10 place-items-center rounded-full border border-white/20 text-white transition" href={whatsappUrl("Hi Ammaai! I'd like to know more about your collection.", settings.whatsapp)} target="_blank" rel="noreferrer" aria-label="WhatsApp"><MessageCircle size={17} /></a>{settings.socialLinks.map(social => <a key={social.platform} href={social.url} target="_blank" rel="noreferrer" aria-label={social.platform} className="footer-social grid h-10 w-10 place-items-center rounded-full border border-white/20 text-white">{social.platform.toLowerCase() === "instagram" ? <Instagram size={17} /> : <ExternalLink size={17} />}</a>)}</div></div>
    </div>
    <div className="shell relative z-10 flex flex-col gap-2 border-t border-white/10 pt-5 text-[10px] text-white/45 md:flex-row md:justify-between md:text-xs"><span>© {new Date().getFullYear()} {settings.copyright}</span><span>Made by hand. Chosen with heart.</span></div>
  </footer>;
}
