"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Film, Image as ImageIcon, LoaderCircle, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { MediaPickerDialog } from "./media-picker-dialog";
import type { MediaItem } from "./media-library";
import { adminRequest, cachedAdminItems, fetchAllRecords, responseError, slugify, type CategoryItem, type ProductItem } from "./cms-types";
import styles from "@/app/admin/admin.module.css";
import { SortHandle, moveItem } from "./sort-handle";

type ProductDraft = {
  _id?: string;
  title: string;
  slug: string;
  sku: string;
  description: string;
  material: string;
  dimensions: string;
  price: string;
  category: string;
  media: MediaItem[];
  featured: boolean;
  available: boolean;
  showInReels: boolean;
  reelOrder: string;
  reelTitle: string;
};

const emptyDraft: ProductDraft = { title: "", slug: "", sku: "", description: "", material: "", dimensions: "", price: "", category: "", media: [], featured: false, available: true, showInReels: false, reelOrder: "0", reelTitle: "" };

export function ProductManager() {
  const [products, setProducts] = useState<ProductItem[]>(() => cachedAdminItems<ProductItem>("/api/products") ?? []);
  const [categories, setCategories] = useState<CategoryItem[]>(() => cachedAdminItems<CategoryItem>("/api/categories") ?? []);
  const [draft, setDraft] = useState<ProductDraft | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [loading, setLoading] = useState(() => !cachedAdminItems("/api/products") || !cachedAdminItems("/api/categories"));
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(!cachedAdminItems("/api/products") || !cachedAdminItems("/api/categories"));
    try {
      const [productsResponse, categoriesResponse] = await Promise.all([
        fetchAllRecords("/api/products?limit=100", { cache: "no-store" }),
        fetchAllRecords("/api/categories?limit=100", { cache: "no-store" }),
      ]);
      if (!productsResponse.ok) throw new Error(await responseError(productsResponse));
      if (!categoriesResponse.ok) throw new Error(await responseError(categoriesResponse));
      const productData = await productsResponse.json() as { items: ProductItem[] };
      const categoryData = await categoriesResponse.json() as { items: CategoryItem[] };
      setProducts(productData.items);
      setCategories(categoryData.items);
      setMessage(null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load products.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);

  function editProduct(product: ProductItem) {
    setSuccessMessage(null);
    setDraft({ _id: product._id, title: product.title, slug: product.slug, sku: product.sku ?? "", description: product.description, material: product.material ?? "", dimensions: product.dimensions ?? "", price: String(product.price), category: product.category?._id ?? "", media: product.media ?? [], featured: product.featured, available: product.available, showInReels: product.showInReels ?? false, reelOrder: String(product.reelOrder ?? 0), reelTitle: product.reelTitle ?? "" });
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!draft || saving) return;
    setSaving(true);
    setMessage(null);
    setSuccessMessage(null);
    try {
      const isEditing = Boolean(draft._id);
      const response = await adminRequest(draft._id ? `/api/products/${draft._id}` : "/api/products", {
        method: draft._id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: draft.title,
          slug: draft.slug || slugify(draft.title),
          sku: draft.sku.trim().toUpperCase(),
          description: draft.description,
          material: draft.material,
          dimensions: draft.dimensions,
          price: Number(draft.price),
          category: draft.category,
          media: draft.media.map(item => item._id),
          featured: draft.featured,
          available: draft.available,
          showInReels: draft.showInReels,
          reelOrder: Number(draft.reelOrder),
          reelTitle: draft.reelTitle,
        }),
      });
      if (!response.ok) throw new Error(await responseError(response));
      setDraft(null);
      setSuccessMessage(isEditing ? "Product updated successfully." : "Product created successfully.");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save the product.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(product: ProductItem) {
    if (!window.confirm(`Delete “${product.title}”?`)) return;
    const response = await adminRequest(`/api/products/${product._id}`, { method: "DELETE" });
    if (!response.ok) return setMessage(await responseError(response));
    setProducts(current => current.filter(item => item._id !== product._id));
  }

  function setMedia(items: MediaItem[]) {
    const video = items.find(item => item.type === "video");
    const images = items.filter(item => item.type === "image").slice(0, 4);
    setDraft(current => current ? { ...current, media: video ? [video, ...images] : images } : current);
  }

  function moveImage(index: number, direction: -1 | 1) {
    setDraft(current => {
      if (!current) return current;
      const video = current.media.filter(item => item.type === "video");
      const images = current.media.filter(item => item.type === "image");
      const next = index + direction;
      if (next < 0 || next >= images.length) return current;
      [images[index], images[next]] = [images[next], images[index]];
      return { ...current, media: [...video, ...images] };
    });
  }

      const filteredProducts = products.filter(product => {
        if (!search.trim()) return true;
        const query = search.trim().toLowerCase();
        return (
          product.title.toLowerCase().includes(query) ||
          product.slug.toLowerCase().includes(query) ||
          (product.sku && product.sku.toLowerCase().includes(query)) ||
          (product.category?.name && product.category.name.toLowerCase().includes(query))
        );
      });

      return (
        <>
          <div className={styles.managerToolbar}>
            <div>
              <strong>{products.length} products</strong>
              <span>Manage catalogue content and reusable media.</span>
            </div>
            <div className={styles.searchField}>
              <Search size={16} />
              <input
                type="search"
                placeholder="Search by title, SKU, category…"
                value={search}
                onChange={event => setSearch(event.target.value)}
              />
            </div>
            <button type="button" className={styles.primaryButton} onClick={() => { setSuccessMessage(null); setDraft({ ...emptyDraft }); }}>
              <Plus size={16} /> Add product
            </button>
          </div>

          {successMessage && (
            <div className={styles.successAlert}>
              {successMessage}
              <button onClick={() => setSuccessMessage(null)}><X size={15} /></button>
            </div>
          )}
          {message && (
            <div className={styles.alert}>
              {message}
              <button onClick={() => setMessage(null)}><X size={15} /></button>
            </div>
          )}

          {loading ? (
            <div className={styles.libraryState}><LoaderCircle className={styles.spinner} size={23} /> Loading products…</div>
          ) : filteredProducts.length === 0 ? (
            <div className={styles.libraryState}>
              <ImageIcon size={26} />
              <strong>{products.length === 0 ? "No products yet" : "No matching products found"}</strong>
              <span>{products.length === 0 ? "Add the first product to begin." : "Try adjusting your search query."}</span>
            </div>
          ) : (
            <div className={styles.contentTable}>
              <div className={styles.tableHeader}><span>Product</span><span>Category</span><span>Price</span><span>Status</span><span>Actions</span></div>
              {filteredProducts.map(product => {
                const cover = product.media?.find(item => item.type === "image");
                return (
                  <div key={product._id} className={styles.tableRow}>
                    <div className={styles.tableIdentity}>
                      {cover ? <img src={cover.thumbnail || cover.cloudinaryUrl} alt="" /> : <span className={styles.emptyThumb}><ImageIcon size={18} /></span>}
                      <div>
                        <strong>{product.title}</strong>
                        <small>{product.sku ? <><span style={{ fontWeight: 600, color: "var(--admin-ink, #202822)" }}>{product.sku}</span> · </> : null}{product.slug}</small>
                      </div>
                    </div>
                    <span>{product.category?.name ?? "Uncategorised"}</span>
                    <span>₹{product.price.toLocaleString("en-IN")}</span>
                    <span className={styles.statusList}>
                      <i className={product.available ? styles.statusOn : styles.statusOff}>{product.available ? "Available" : "Unavailable"}</i>
                      {product.featured && <i>Featured</i>}
                      {product.showInReels && <i>Made in Motion</i>}
                    </span>
                    <span className={styles.rowActions}>
                      <button type="button" onClick={() => editProduct(product)}><Pencil size={15} /> Edit</button>
                      <button type="button" onClick={() => void remove(product)}><Trash2 size={15} /></button>
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {draft && (
            <div className={styles.editorBackdrop} onClick={() => setDraft(null)}>
              <form className={styles.editorDialog} onSubmit={save} onClick={event => event.stopPropagation()}>
                <header className={styles.editorHeader}>
                  <div><h2>{draft._id ? "Edit product" : "Add product"}</h2><p>Product content, SKU, and Media Library assets.</p></div>
                  <button type="button" onClick={() => setDraft(null)}><X size={19} /></button>
                </header>
                <div className={styles.editorBody}>
                  {message && <div role="alert" className={styles.alert}>{message}</div>}
                  <div className={styles.formGrid}>
                    <label className={styles.field}>
                      <span>Title</span>
                      <input required value={draft.title} onChange={event => setDraft({ ...draft, title: event.target.value, slug: draft._id ? draft.slug : slugify(event.target.value) })} />
                    </label>
                    <label className={styles.field}>
                      <span>SKU</span>
                      <input value={draft.sku} placeholder="e.g. AM-BAG-001" onChange={event => setDraft({ ...draft, sku: event.target.value.toUpperCase() })} />
                    </label>
                    <label className={styles.field}>
                      <span>Slug</span>
                      <input required value={draft.slug} onChange={event => setDraft({ ...draft, slug: slugify(event.target.value) })} />
                    </label>
                    <label className={styles.field}>
                      <span>Price (₹)</span>
                      <input required min="0" step="0.01" type="number" value={draft.price} onChange={event => setDraft({ ...draft, price: event.target.value })} />
                    </label>
                    <label className={styles.field}>
                      <span>Category</span>
                      <select aria-label="Category" required value={draft.category} onChange={event => setDraft({ ...draft, category: event.target.value })}>
                        <option value="">Choose category</option>
                        {categories.map(category => <option key={category._id} value={category._id}>{category.name}</option>)}
                      </select>
                    </label>
                    <label className={styles.field}><span>Material</span><input value={draft.material} onChange={event => setDraft({ ...draft, material: event.target.value })} /></label>
                    <label className={styles.field}><span>Dimensions</span><input value={draft.dimensions} onChange={event => setDraft({ ...draft, dimensions: event.target.value })} /></label>
                    <label className={`${styles.field} ${styles.fieldWide}`}>
                      <span>Description</span>
                      <textarea aria-label="Description" rows={5} value={draft.description} onChange={event => setDraft({ ...draft, description: event.target.value })} />
                    </label>
                  </div>
                  <div className={styles.formSection}>
                    <div className={styles.formSectionHeading}>
                      <div><strong>Product media</strong><p>One optional video followed by up to four ordered images.</p></div>
                      <button type="button" className={styles.secondaryButton} onClick={() => setPickerOpen(true)}>Select from Media Library</button>
                    </div>
                    {draft.media.length === 0 ? <div className={styles.compactEmpty}>No media selected.</div> : (
                      <div className={styles.orderedMedia}>
                        {draft.media.map((item, mediaIndex) => {
                          const images = draft.media.filter(media => media.type === "image");
                          const imageIndex = item.type === "image" ? images.findIndex(image => image._id === item._id) : -1;
                          return (
                            <div key={item._id} data-sort-group={item.type === "image" ? "product-images" : undefined} data-sort-index={imageIndex} className={styles.orderedMediaItem}>
                              {item.type === "image" && <SortHandle index={imageIndex} group="product-images" label={`image ${imageIndex + 1}`} onMove={(from, to) => setDraft({ ...draft, media: [...draft.media.filter(media => media.type === "video"), ...moveItem(images, from, to)] })} />}
                              <div>
                                {item.type === "video" ? <video src={item.cloudinaryUrl} muted preload="metadata" /> : <img src={item.thumbnail || item.cloudinaryUrl} alt="" />}
                                <span>{item.type === "video" ? <Film size={12} /> : `Image ${imageIndex + 1}`}</span>
                              </div>
                              <strong>{mediaIndex === 0 && item.type === "video" ? "Video" : item.filename}</strong>
                              <div className={styles.mediaOrderActions}>
                                {item.type === "image" && (
                                  <>
                                    <button type="button" disabled={imageIndex === 0} onClick={() => moveImage(imageIndex, -1)}><ArrowUp size={14} /></button>
                                    <button type="button" disabled={imageIndex === images.length - 1} onClick={() => moveImage(imageIndex, 1)}><ArrowDown size={14} /></button>
                                  </>
                                )}
                                <button type="button" onClick={() => setDraft({ ...draft, media: draft.media.filter(media => media._id !== item._id) })}><X size={14} /></button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div className={styles.switchRow}>
                    <label><input type="checkbox" checked={draft.featured} onChange={event => setDraft({ ...draft, featured: event.target.checked })} /><span>Featured product</span></label>
                    <label><input type="checkbox" checked={draft.available} onChange={event => setDraft({ ...draft, available: event.target.checked })} /><span>Available</span></label>
                  </div>
                  <div className={styles.formSection}>
                    <div className={styles.formSectionHeading}>
                      <div><strong>Made in Motion</strong><p>Reuse this product’s video—or its first image when no video exists.</p></div>
                    </div>
                    <div className={styles.formGrid}>
                      <label className={styles.field}>
                        <span>Reel title</span>
                        <input value={draft.reelTitle} onChange={event => setDraft({ ...draft, reelTitle: event.target.value })} placeholder={draft.title || "Reel title"} />
                      </label>
                      <label className={styles.field}>
                        <span>Reel order</span>
                        <input type="number" value={draft.reelOrder} onChange={event => setDraft({ ...draft, reelOrder: event.target.value })} />
                      </label>
                    </div>
                    <div className={styles.switchRow}>
                      <label><input type="checkbox" checked={draft.showInReels} onChange={event => setDraft({ ...draft, showInReels: event.target.checked })} /><span>Show in Made in Motion</span></label>
                    </div>
                  </div>
                </div>
                <footer className={styles.editorFooter}>
                  <span>Media is reused from the centralized library.</span>
                  <div>
                    <button type="button" className={styles.secondaryButton} onClick={() => setDraft(null)}>Cancel</button>
                    <button type="submit" className={styles.primaryButton} disabled={saving}>{saving ? "Saving…" : "Save product"}</button>
                  </div>
                </footer>
              </form>
            </div>
          )}
          <MediaPickerDialog open={pickerOpen} title="Select product media" initialItems={draft?.media ?? []} maxImages={4} maxVideos={1} maxTotal={5} onClose={() => setPickerOpen(false)} onConfirm={setMedia} />
        </>
      );
}
