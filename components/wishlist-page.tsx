"use client";

import Link from "next/link";
import type { Product } from "@/lib/products";
import { useWishlist } from "./wishlist-provider";
import { ProductGrid } from "./product-card";
import Image from "next/image";
import { formatPrice } from "@/lib/products";
import { WishlistButton } from "./wishlist-button";

export function WishlistPage({ products }: { products: Product[] }) {
  const { ids, ready } = useWishlist();
  const items = products.filter((product) => ids.includes(product.id));
  if (!ready) return <div className="h-56 animate-pulse rounded-3xl bg-beige" />;
  if (!items.length) return <div className="rounded-[28px] border border-line bg-ivory px-6 py-20 text-center"><span className="text-4xl">♡</span><h2 className="mt-4 font-serif text-4xl">Your favourites, kept close</h2><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">Save the pieces you love and return to them whenever you’re ready.</p><Link href="/collections" className="mt-8 inline-flex rounded-full bg-forest px-6 py-3 text-sm font-semibold text-white">Explore collection</Link></div>;
  return <><div className="grid gap-2 md:hidden">{items.map(product => <div key={product.id} className="flex items-center gap-3 rounded-xl bg-ivory p-2"><Link href={`/products/${product.slug}`} className="relative h-[76px] w-[67px] shrink-0 overflow-hidden rounded-lg bg-beige"><Image src={product.image} alt={product.name} fill sizes="67px" className="object-cover" /></Link><Link href={`/products/${product.slug}`} className="min-w-0 flex-1"><span className="block truncate text-[11px] font-medium">{product.name}</span><span className="mt-2 block text-[11px] font-semibold">{formatPrice(product.price)}</span></Link><WishlistButton id={product.id} className="border-0 text-[#d8445d]" /></div>)}</div><div className="hidden md:block"><ProductGrid items={items} /></div></>;
}
