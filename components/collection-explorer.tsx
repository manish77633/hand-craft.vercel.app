"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/lib/products";
import { ProductGrid } from "./product-card";
import { SlidersHorizontal } from "lucide-react";

export function CollectionExplorer({ initialProducts, lockedCategory }: { initialProducts: Product[]; lockedCategory?: string }) {
  const [category, setCategory] = useState(lockedCategory ?? "all");
  const [sort, setSort] = useState("featured");
  const priceCeiling = Math.max(4000, Math.ceil(Math.max(0, ...initialProducts.map(p => p.price)) / 250) * 250);
  const [maxPrice, setMaxPrice] = useState(priceCeiling);
  const categoryOptions = Array.from(new Map(initialProducts.map(p => [p.category, p.categoryLabel])).entries());
  const filtered = useMemo(() => {
    const list = initialProducts.filter((product) => (category === "all" || product.category === category) && product.price <= maxPrice);
    return [...list].sort((a, b) => sort === "low" ? a.price - b.price : sort === "high" ? b.price - a.price : Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
  }, [category, initialProducts, maxPrice, sort]);

  return (
    <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
      <aside className="h-fit border-y border-line py-6 lg:sticky lg:top-28 lg:border-y-0 lg:border-r lg:py-0 lg:pr-8">
        <div className="mb-6 flex items-center gap-2"><SlidersHorizontal size={17} /><span className="eyebrow">Refine</span></div>
        {!lockedCategory && <fieldset><legend className="mb-3 text-sm font-semibold">Category</legend><div className="flex flex-wrap gap-2 lg:grid">{[
          ["all", "All pieces"], ...categoryOptions
        ].map(([value, label]) => <button key={value} onClick={() => setCategory(value)} className={`rounded-full border px-4 py-2 text-left text-xs transition ${category === value ? "border-forest bg-forest text-white" : "border-line bg-ivory hover:border-forest"}`}>{label}</button>)}</div></fieldset>}
        <div className="mt-7"><label className="mb-3 block text-sm font-semibold" htmlFor="price">Up to {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(maxPrice)}</label><input id="price" type="range" min="0" max={priceCeiling} step="250" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full accent-forest" /></div>
      </aside>
      <div>
        <div className="mb-7 flex items-center justify-between"><p className="text-sm text-muted">{filtered.length} handmade pieces</p><label className="flex items-center gap-2 text-xs"><span className="hidden sm:inline">Sort by</span><select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-full border border-line bg-ivory px-4 py-2 outline-none"><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></label></div>
        {filtered.length ? <ProductGrid items={filtered} /> : <div className="rounded-3xl bg-beige p-12 text-center"><h2 className="font-serif text-3xl">No pieces found</h2><p className="mt-2 text-sm text-muted">Try increasing the price range.</p></div>}
      </div>
    </div>
  );
}
