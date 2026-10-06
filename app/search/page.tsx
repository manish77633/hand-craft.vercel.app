import type { Metadata } from "next";
import { SearchClient } from "@/components/search-client";
import { getCatalogue } from "@/lib/cms/products";
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Search" };
export default async function SearchPage() { const { products } = await getCatalogue(); return <section className="min-h-[65vh] py-6 md:py-24"><div className="shell"><div className="mb-4 text-center md:mb-10"><p className="eyebrow hidden text-forest md:block">Find a piece</p><h1 className="font-serif text-3xl md:text-7xl">What are you looking for?</h1></div><SearchClient products={products} /></div></section>; }
