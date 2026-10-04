import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/products";
import { formatPrice } from "@/lib/products";
import { WishlistButton } from "./wishlist-button";

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  return (
    <article className="product-card group min-w-0">
      <Link href={`/products/${product.slug}`} className="image-zoom relative block aspect-[4/5] overflow-hidden rounded-lg bg-beige md:rounded-2xl">
        <Image src={product.image} alt={product.name} fill priority={priority} sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" className="object-cover" />
        {product.isNew && <span className="absolute left-2 top-2 rounded-full bg-ivory px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-forest md:left-3 md:top-3 md:px-3">New</span>}
        <WishlistButton id={product.id} className="absolute right-2 top-2 md:right-3 md:top-3" />
      </Link>
      <div className="pt-2 md:pt-4">
        <p className="mb-1 hidden text-[10px] font-bold uppercase tracking-[.14em] text-muted md:block">{product.categoryLabel}</p>
        <Link href={`/products/${product.slug}`}><h3 className="font-sans text-[11px] font-medium leading-[1.3] transition group-hover:text-forest md:font-serif md:text-2xl">{product.name}</h3></Link>
        <p className="mt-1 text-[11px] font-semibold md:mt-2 md:text-sm">{formatPrice(product.price)}</p>
      </div>
    </article>
  );
}

export function ProductGrid({ items }: { items: Product[] }) {
  return <div className="grid grid-cols-2 gap-x-3 gap-y-5 md:grid-cols-3 md:gap-x-6 md:gap-y-12 lg:grid-cols-4">{items.map((product, index) => <ProductCard key={product.id} product={product} priority={index < 4} />)}</div>;
}
