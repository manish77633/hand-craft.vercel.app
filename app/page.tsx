import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { categories, products } from "@/lib/products";
import { ProductGrid } from "@/components/product-card";
import { Reveal } from "@/components/reveal";

export default function Home() {
  return <>
    <Reveal><section className="home-hero relative overflow-hidden bg-beige">
      <Image src="/images/hero.png" alt="Embroidered cushion, jute bag and ceramic vase in a warm handmade home" fill priority sizes="100vw" className="object-cover" />
      <div className="home-hero-shade absolute inset-0" />
      <div className="shell relative flex h-full items-center"><div className="home-hero-copy max-w-[540px] text-ink">
        <p className="hidden text-[11px] font-semibold uppercase tracking-[.21em] text-forest md:block">Handmade with heart</p>
        <h1 className="font-serif font-medium leading-[.9] tracking-[-.045em]">Handcrafted<br />Treasures</h1>
        <p className="mt-3 max-w-xs text-[12px] leading-[1.45] md:mt-6 md:max-w-md md:text-[16px] md:leading-7">Artisanal products for a more mindful home.</p>
        <Link href="/collections" className="home-hero-cta mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[11px] font-semibold shadow-sm transition md:mt-8 md:px-7 md:py-4 md:text-[13px]">Explore Collection <ArrowRight size={14} /></Link>
      </div></div>
    </section></Reveal>

    <Reveal><section className="mobile-category-strip shell py-4 md:hidden" aria-label="Shop categories"><div className="grid grid-cols-4 gap-2">{categories.map(category => <Link key={category.slug} href={`/collections/${category.slug}`} className="min-w-0 text-center"><span className="relative mx-auto block h-[62px] w-[62px] overflow-hidden rounded-full bg-beige"><Image src={category.image} alt="" fill sizes="62px" className="object-cover" /></span><span className="mt-2 block truncate text-[10px] font-medium">{category.name}</span></Link>)}</div></section></Reveal>

    <Reveal><section className="shell py-7 md:py-24"><div className="mb-4 flex items-end justify-between md:mb-10"><div><p className="eyebrow hidden text-forest md:block">A considered edit</p><h2 className="font-sans text-[15px] font-semibold md:mt-2 md:font-serif md:text-5xl md:font-medium">Featured Collection</h2></div><Link href="/collections" className="flex items-center gap-1 text-[11px] text-muted md:text-sm">View All <ArrowRight size={13} /></Link></div><ProductGrid items={products.filter(product => product.featured)} /></section></Reveal>

    <Reveal><section className="hidden bg-ivory py-20 md:block"><div className="shell"><div className="mb-9 flex items-end justify-between"><div><p className="eyebrow text-forest">Explore by category</p><h2 className="mt-2 font-serif text-5xl">Find your kind of beautiful.</h2></div><Link href="/collections" className="text-sm font-semibold">Explore all <ArrowRight size={15} className="inline" /></Link></div><div className="grid grid-cols-4 gap-5">{categories.map(category => <Link href={`/collections/${category.slug}`} key={category.slug} className="group"><div className="relative aspect-[4/5] overflow-hidden rounded-[14px] bg-beige"><Image src={category.image} alt={category.name} fill sizes="25vw" className="object-cover transition duration-500 group-hover:scale-105" /></div><div className="mt-4 flex justify-between"><span className="font-serif text-[27px]">{category.name}</span><ArrowRight size={19} /></div></Link>)}</div></div></section></Reveal>

    <Reveal><section className="shell grid gap-6 py-12 md:grid-cols-2 md:items-center md:gap-16 md:py-28"><div className="relative aspect-[4/3] overflow-hidden rounded-xl md:aspect-[5/4]"><Image src="/images/artisan.png" alt="Artisan working on hand embroidery" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" /></div><div><p className="eyebrow text-forest">Our story</p><h2 className="mt-3 font-serif text-[33px] leading-none md:text-[61px]">A human touch you can feel.</h2><p className="mt-4 max-w-md text-[12px] leading-5 text-muted md:mt-7 md:text-[15px] md:leading-7">MeeraHini began with a simple belief: what we bring into our homes should carry a story. Our collection celebrates the texture and beautiful variations that make handmade work personal.</p><Link href="/about" className="mt-5 inline-flex items-center gap-2 border-b border-ink pb-1 text-[12px] font-semibold md:mt-8 md:text-sm">Discover our story <ArrowRight size={14} /></Link></div></section></Reveal>

    <Reveal><section className="bg-ivory py-10 md:py-20"><div className="shell grid gap-6 md:grid-cols-3 md:gap-8">{[["Thoughtful details","Explore product materials, dimensions, and availability on each product page."],["Easy enquiries","Ask us about a piece directly on WhatsApp before making a decision."],["Saved favourites","Keep your favourite finds in a wishlist on this device."]].map(([title,copy],index)=><div key={title} className="border-t border-line pt-4 md:pt-6"><span className="font-serif text-2xl text-forest">0{index+1}</span><h2 className="mt-2 font-serif text-xl md:mt-4 md:text-3xl">{title}</h2><p className="mt-2 max-w-sm text-[12px] leading-5 text-muted md:text-sm md:leading-6">{copy}</p></div>)}</div></section></Reveal>

    <Reveal><section className="shell py-10 md:py-20"><div className="mx-auto max-w-3xl"><p className="eyebrow text-forest">A few helpful details</p><h2 className="mt-2 font-serif text-3xl md:text-5xl">Frequently asked questions</h2><div className="mt-5 divide-y divide-line border-y border-line md:mt-8">{[
      ["How do I order a product?","Open a product and tap ‘Chat on WhatsApp’ to ask about its availability and next steps."],
      ["Can I save products for later?","Yes. Tap the heart on a product card to add it to your wishlist. Your saved items stay in this browser."],
      ["Can I ask for more product details?","Yes. Send us a WhatsApp enquiry and mention the product you are interested in."],
      ["Do handmade items look exactly alike?","Handmade work can have small variations in texture and finish. Ask us about the specific piece before ordering."],
    ].map(([question,answer])=><details key={question} className="faq-item group py-3 md:py-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[12px] font-semibold md:text-sm"><span>{question}</span><span className="faq-plus text-lg font-normal text-forest">+</span></summary><p className="faq-answer max-w-2xl text-[12px] leading-5 text-muted md:text-sm md:leading-6">{answer}</p></details>)}</div></div></section></Reveal>
  </>;
}
