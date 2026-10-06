"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import type { Product } from "@/lib/products";
import { ProductGrid } from "./product-card";

export function SearchClient({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return [];
    const words = value.split(/\s+/);
    return products.filter((product) => { const text = [product.name, product.categoryLabel, product.description, product.material].filter(Boolean).join(" ").toLowerCase(); return words.every(word => text.includes(word)); });
  }, [products, query]);
  const suggestions = ["embroidered bag", "ceramic vase", "cushion", "earrings"];

  return (
    <div>
      <div className="relative mx-auto max-w-3xl">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted" size={21} />
        <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search handmade products..." className="h-16 w-full rounded-full border border-line bg-ivory px-14 text-base shadow-soft outline-none placeholder:text-muted/70 focus:border-forest" aria-label="Search products" />
        {query && <button onClick={() => setQuery("")} className="absolute right-5 top-1/2 -translate-y-1/2" aria-label="Clear search"><X size={19} /></button>}
      </div>
      {!query ? <div className="mx-auto mt-10 max-w-3xl text-center"><p className="eyebrow text-muted">Popular searches</p><div className="mt-5 flex flex-wrap justify-center gap-2">{suggestions.map((item) => <button key={item} onClick={() => setQuery(item)} className="rounded-full border border-line bg-ivory px-4 py-2 text-sm hover:border-forest">{item}</button>)}</div></div> : <div className="mt-14">{results.length ? <><p className="mb-7 text-sm text-muted">{results.length} results for “{query}”</p><ProductGrid items={results} /></> : <div className="rounded-3xl bg-beige p-12 text-center"><h2 className="font-serif text-3xl">Nothing found</h2><p className="mt-2 text-sm text-muted">Try a product name, category, or material.</p></div>}</div>}
    </div>
  );
}
