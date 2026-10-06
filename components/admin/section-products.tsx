"use client";

import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import type { ProductItem } from "./cms-types";
import { homepageProductIds, type ProductSource } from "@/lib/cms/product-selection";
import styles from "@/app/admin/admin.module.css";
import { SortHandle, moveItem } from "./sort-handle";

export function sectionProductIds(type: string, source: ProductSource, ids: string[], products: ProductItem[]) {
  return homepageProductIds(type, source, ids, products.map(product => ({ ...product, id: product._id, hasVideo: product.media?.some(media => media.type === "video") })));
}

export function SectionProducts({ type, source, ids, products, onChange, group, onEdit }: { type: string; source: ProductSource; ids: string[]; products: ProductItem[]; onChange: (source: ProductSource, ids: string[]) => void; group: string; onEdit: (product: ProductItem) => void }) {
  const effective = sectionProductIds(type, source, ids, products);
  const automatic = type === "featured-products" || type === "made-in-motion";
  function move(index: number, direction: number) {
    const next = [...effective];
    [next[index], next[index + direction]] = [next[index + direction], next[index]];
    onChange("manual", next);
  }
  return <div className={styles.sectionProductPreview}>
    {automatic && <label className={styles.field}><span>Product selection</span><select value={source} onChange={event => onChange(event.target.value as ProductSource, event.target.value === "manual" ? effective : [])}><option value="automatic">Automatic — use product settings</option><option value="manual">Manual — choose products and order</option></select></label>}
    <p>{automatic && source === "automatic" ? "Showing the same products as the homepage. New eligible products appear automatically. Reordering or removing switches to manual selection." : "Homepage display order: first to last. Save page to publish changes. Unavailable products are excluded."}</p>
    <div className={styles.sectionProductGrid}>{effective.map((id, index) => {
      const product = products.find(product => product._id === id)!;
      const video = product.media?.find(media => media.type === "video");
      const image = product.media?.find(media => media.type === "image");
      const poster = type === "made-in-motion" ? video?.thumbnail || image?.thumbnail || image?.cloudinaryUrl : image?.thumbnail || image?.cloudinaryUrl;
      return <article key={id} data-product-id={id} data-sort-group={group} data-sort-index={index} className={styles.sectionProductCard}>
        <SortHandle index={index} group={group} label={product.title} onMove={(from, to) => onChange("manual", moveItem(effective, from, to))} />
        <img src={poster || "/images/hero.png"} alt={product.title} />
        <div><small>Position {index + 1}{type === "made-in-motion" ? ` · ${video ? "Video" : "Image"}` : ""}</small><strong>{type === "made-in-motion" ? product.reelTitle || product.title : product.title}</strong><span>{product.category?.name} · ₹{product.price.toLocaleString("en-IN")}</span></div>
        <button type="button" className={styles.secondaryButton} onClick={() => onEdit(product)}>Edit product</button>
        <div className={styles.mediaOrderActions}><button type="button" aria-label={`Move ${product.title} earlier`} disabled={index === 0} onClick={() => move(index, -1)}><ArrowUp size={16} /></button><button type="button" aria-label={`Move ${product.title} later`} disabled={index === effective.length - 1} onClick={() => move(index, 1)}><ArrowDown size={16} /></button><button type="button" aria-label={`Remove ${product.title} from section`} onClick={() => onChange("manual", effective.filter(item => item !== id))}><Trash2 size={16} /></button></div>
      </article>;
    })}</div>
    {!effective.length && <p>No products selected for this section. Use Choose products to add them.</p>}
  </div>;
}
