import type { Metadata } from "next";
import { CollectionExplorer } from "@/components/collection-explorer";
import { products } from "@/lib/products";
import { categories } from "@/lib/products";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = { title: "The Collection", description: "Explore handmade bags, decor, textiles and jewellery by MeeraHini." };

export default function CollectionsPage() {
  return <><section className="bg-deep py-6 text-white md:hidden"><div className="shell"><h1 className="text-[15px] font-semibold">Categories</h1><h2 className="mt-6 text-[17px] font-semibold">Explore by Category</h2><p className="mt-1 text-[11px] text-white/75">Find something special, handpicked for you.</p><div className="mt-5 grid grid-cols-2 gap-2">{categories.map(category => <Link href={`/collections/${category.slug}`} key={category.slug} className="overflow-hidden rounded-lg bg-ivory text-ink"><div className="relative aspect-[1.5/1]"><Image src={category.image} alt="" fill sizes="50vw" className="object-cover" /></div><div className="p-2"><p className="text-[11px] font-semibold">{category.name}</p><p className="mt-0.5 text-[9px] text-muted">Explore collection</p></div></Link>)}</div></div></section><section className="hidden border-b border-line bg-ivory py-24 md:block"><div className="shell"><p className="eyebrow text-forest">The collection</p><div className="mt-4 grid gap-5 md:grid-cols-[1fr_420px] md:items-end"><h1 className="balance font-serif text-7xl leading-[.95] tracking-tight">Objects with a story to tell.</h1><p className="text-sm leading-7 text-muted">Explore tactile bags, warm home accents, hand-worked textiles, and small-batch jewellery—each selected for its character.</p></div></div></section><section className="py-8 md:py-20"><div className="shell"><div className="mb-6 text-[15px] font-semibold md:hidden">All Products</div><CollectionExplorer initialProducts={products} /></div></section></>;
}
