import type { Metadata } from "next";
import { SearchClient } from "@/components/search-client";
import { products } from "@/lib/products";

export const metadata: Metadata = { title: "Search" };
export default function SearchPage() { return <section className="min-h-[65vh] py-6 md:py-24"><div className="shell"><div className="mb-4 text-center md:mb-10"><p className="eyebrow hidden text-forest md:block">Find a piece</p><h1 className="hidden font-serif text-7xl md:block">What are you looking for?</h1></div><SearchClient products={products} /></div></section>; }
