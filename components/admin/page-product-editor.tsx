"use client";
import { useState, type FormEvent } from "react";
import type { ProductItem, CategoryItem } from "./cms-types";
import { MediaPickerDialog } from "./media-picker-dialog";
import styles from "@/app/admin/admin.module.css";

export function PageProductEditor({ product, categories, onApply, onClose }: { product: ProductItem; categories: CategoryItem[]; onApply: (product: ProductItem) => void; onClose: () => void }) {
  const [draft, setDraft] = useState(product);
  const [mediaOpen, setMediaOpen] = useState(false);
  function submit(event: FormEvent) { event.preventDefault(); onApply(draft); onClose(); }
  return <div className={styles.editorBackdrop} role="dialog" aria-modal="true" aria-label="Edit linked product"><form className={styles.pickerDialog} onSubmit={submit}>
    <header className={styles.editorHeader}><div><h2>Edit product</h2><p>Changes apply everywhere when you Save page.</p></div><button type="button" onClick={onClose}>×</button></header>
    <div className={styles.formGrid} style={{ padding: 20, overflowY: "auto" }}>
      {([['title', 'Product name'], ['slug', 'Product slug'], ['sku', 'SKU'], ['material', 'Material'], ['dimensions', 'Dimensions'], ['reelTitle', 'Motion title']] as const).map(([key, label]) => <label key={key} className={styles.field}><span>{label}</span><input required={key === 'title' || key === 'slug'} value={draft[key] ?? ''} onChange={event => setDraft({ ...draft, [key]: event.target.value })} /></label>)}
      <label className={styles.field}><span>Price (₹)</span><input type="number" min="0" step="0.01" required value={draft.price} onChange={event => setDraft({ ...draft, price: Number(event.target.value) })} /></label>
      <label className={styles.field}><span>Category</span><select required value={draft.category?._id ?? ''} onChange={event => setDraft({ ...draft, category: categories.find(category => category._id === event.target.value)! })}>{categories.map(category => <option key={category._id} value={category._id}>{category.name}</option>)}</select></label>
      <label className={`${styles.field} ${styles.fieldWide}`}><span>Description</span><textarea required value={draft.description} onChange={event => setDraft({ ...draft, description: event.target.value })} /></label>
      {(['featured', 'available', 'showInReels'] as const).map(key => <label key={key}><input type="checkbox" checked={draft[key] ?? false} onChange={event => setDraft({ ...draft, [key]: event.target.checked })} /> {key === 'showInReels' ? 'Show in Made in Motion' : key}</label>)}
      <button type="button" className={styles.secondaryButton} onClick={() => setMediaOpen(true)}>Edit product media ({draft.media.length})</button>
    </div>
    <footer className={styles.editorFooter}><span>Draft only until Save page.</span><button className={styles.primaryButton} type="submit">Apply product changes</button></footer>
  </form><MediaPickerDialog open={mediaOpen} title="Product media" initialItems={draft.media} maxVideos={1} maxImages={4} maxTotal={5} onClose={() => setMediaOpen(false)} onConfirm={media => setDraft({ ...draft, media: [...media.filter(item => item.type === "video"), ...media.filter(item => item.type === "image")] })} /></div>;
}
