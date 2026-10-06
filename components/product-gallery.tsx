"use client";
import Image from "@/components/store-image";
import { useState } from "react";
import type { Product } from "@/lib/products";
export function ProductGallery({ name, image, media }: { name: string; image: string; media?: Product["media"] }) {
  const items = media?.length ? media : [{ type: "image" as const, url: image }];
  const [active, setActive] = useState(() => Math.max(0, items.findIndex(item => item.type === "image")));
  const selected = items[active] || items[0];
  return <div className="product-gallery flex items-start gap-2 md:gap-3">
    {items.length > 1 && <div role="group" aria-label="Product media thumbnails" className="product-thumbnail-rail flex w-12 shrink-0 flex-col gap-2 py-2 md:w-[72px] md:py-0">{items.map((item, index) => <button key={`${item.url}-${index}`} type="button" aria-label={item.type === "video" ? "Play product video" : `View product image ${index + 1}`} aria-pressed={active === index} onClick={() => setActive(index)} className={`relative aspect-square w-full overflow-hidden rounded-lg border-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest ${active === index ? "border-forest" : "border-transparent"}`}>{item.type === "video" ? <>{item.thumbnail && <Image src={item.thumbnail} alt="" fill sizes="72px" className="object-cover" />}<span className="absolute inset-0 grid place-items-center bg-black/25 text-xs font-semibold text-white">▶</span></> : <Image src={item.thumbnail || item.url} alt="" fill sizes="72px" className="object-cover" />}</button>)}</div>}
    <div className="product-gallery-stage relative aspect-[4/4.6] min-w-0 flex-1 overflow-hidden rounded-xl bg-beige">{selected.type === "video" ? <video key={selected.url} controls playsInline poster={selected.thumbnail} src={selected.url} className="absolute inset-0 h-full w-full object-contain" /> : <Image src={selected.url} alt={name} fill priority sizes="(max-width: 768px) 85vw, 48vw" className="object-cover" />}</div>
  </div>;
}
