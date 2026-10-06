"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { FolderTree, LoaderCircle, Pencil, Plus, Trash2, X } from "lucide-react";
import { MediaPickerDialog } from "./media-picker-dialog";
import type { MediaItem } from "./media-library";
import { adminRequest, cachedAdminItems, fetchAllRecords, responseError, slugify, type CategoryItem } from "./cms-types";
import styles from "@/app/admin/admin.module.css";

type CategoryDraft = { _id?: string; name: string; slug: string; description: string; image: MediaItem | null; order: string; active: boolean };
const emptyDraft: CategoryDraft = { name: "", slug: "", description: "", image: null, order: "0", active: true };
const IMAGE_ONLY: Array<"image"> = ["image"];

export function CategoryManager() {
  const [categories, setCategories] = useState<CategoryItem[]>(() => cachedAdminItems<CategoryItem>("/api/categories") ?? []);
  const [draft, setDraft] = useState<CategoryDraft | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [loading, setLoading] = useState(() => !cachedAdminItems("/api/categories"));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(!cachedAdminItems("/api/categories"));
    try {
      const response = await fetchAllRecords("/api/categories?limit=100", { cache: "no-store" });
      if (!response.ok) throw new Error(await responseError(response));
      const data = await response.json() as { items: CategoryItem[] };
      setCategories(data.items);
      setMessage(null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load categories.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);

  function edit(category: CategoryItem) {
    setSuccessMessage(null);
    setMessage(null);
    setDraft({ _id: category._id, name: category.name, slug: category.slug, description: category.description, image: category.image ?? null, order: String(category.order), active: category.active });
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!draft || saving) return;
    setSaving(true);
    setMessage(null);
    setSuccessMessage(null);
    try {
      const isEditing = Boolean(draft._id);
      const response = await adminRequest(draft._id ? `/api/categories/${draft._id}` : "/api/categories", {
        method: draft._id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: draft.name, slug: draft.slug || slugify(draft.name), description: draft.description, image: draft.image?._id ?? null, order: Number(draft.order), active: draft.active }),
      });
      if (!response.ok) throw new Error(await responseError(response));
      setDraft(null);
      setSuccessMessage(isEditing ? "Category updated successfully." : "Category created successfully.");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save the category.");
    } finally { setSaving(false); }
  }

  async function remove(category: CategoryItem) {
    if (!window.confirm(`Delete “${category.name}”?`)) return;
    setMessage(null);
    setSuccessMessage(null);
    const response = await adminRequest(`/api/categories/${category._id}`, { method: "DELETE" });
    if (!response.ok) return setMessage(await responseError(response));
    setCategories(current => current.filter(item => item._id !== category._id));
    setSuccessMessage(`Category “${category.name}” deleted.`);
  }

  return <>
    <div className={styles.managerToolbar}><div><strong>{categories.length} categories</strong><span>Images are selected from the centralized Media Library.</span></div><button type="button" className={styles.primaryButton} onClick={() => { setSuccessMessage(null); setMessage(null); setDraft({ ...emptyDraft }); }}><Plus size={16} /> Add category</button></div>
    {successMessage && <div className={styles.successAlert}>{successMessage}<button onClick={() => setSuccessMessage(null)}><X size={15} /></button></div>}
    {message && <div className={styles.alert}>{message}<button type="button" onClick={() => void load()}>Retry loading</button><button onClick={() => setMessage(null)}><X size={15} /></button></div>}
    {loading ? <div className={styles.libraryState}><LoaderCircle className={styles.spinner} size={23} /> Loading categories…</div> : categories.length === 0 ? <div className={styles.libraryState}><FolderTree size={26} /><strong>No categories yet</strong></div> : <div className={styles.contentTable}>
      <div className={`${styles.tableHeader} ${styles.categoryColumns}`}><span>Category</span><span>Order</span><span>Status</span><span>Actions</span></div>
      {categories.map(category => <div key={category._id} className={`${styles.tableRow} ${styles.categoryColumns}`}>
        <div className={styles.tableIdentity}>{category.image ? <img src={category.image.thumbnail || category.image.cloudinaryUrl} alt="" /> : <span className={styles.emptyThumb}><FolderTree size={18} /></span>}<div><strong>{category.name}</strong><small>{category.slug}</small></div></div>
        <span>{category.order}</span><span className={styles.statusList}><i className={category.active ? styles.statusOn : styles.statusOff}>{category.active ? "Active" : "Inactive"}</i></span>
        <span className={styles.rowActions}><button type="button" onClick={() => edit(category)}><Pencil size={15} /> Edit</button><button type="button" onClick={() => void remove(category)}><Trash2 size={15} /></button></span>
      </div>)}</div>}

    {draft && <div className={styles.editorBackdrop} onClick={() => setDraft(null)}><form className={`${styles.editorDialog} ${styles.editorDialogSmall}`} onSubmit={save} onClick={event => event.stopPropagation()}>
      <header className={styles.editorHeader}><div><h2>{draft._id ? "Edit category" : "Add category"}</h2><p>Category content and listing order.</p></div><button type="button" onClick={() => setDraft(null)}><X size={19} /></button></header>
      <div className={styles.editorBody}>{message && <div role="alert" className={styles.alert}>{message}</div>}<div className={styles.formGrid}>
        <label className={styles.field}><span>Name</span><input required value={draft.name} onChange={event => setDraft({ ...draft, name: event.target.value, slug: draft._id ? draft.slug : slugify(event.target.value) })} /></label>
        <label className={styles.field}><span>Slug</span><input required value={draft.slug} onChange={event => setDraft({ ...draft, slug: slugify(event.target.value) })} /></label>
        <label className={`${styles.field} ${styles.fieldWide}`}><span>Description</span><textarea rows={5} value={draft.description} onChange={event => setDraft({ ...draft, description: event.target.value })} /></label>
        <label className={styles.field}><span>Order</span><input type="number" value={draft.order} onChange={event => setDraft({ ...draft, order: event.target.value })} /></label>
      </div>
      <div className={styles.formSection}><div className={styles.formSectionHeading}><div><strong>Category image</strong><p>Reuse one image from the Media Library.</p></div><button type="button" className={styles.secondaryButton} onClick={() => setPickerOpen(true)}>Select image</button></div>{draft.image ? <div className={styles.singleMedia}><img src={draft.image.thumbnail || draft.image.cloudinaryUrl} alt="" /><div><strong>{draft.image.filename}</strong><button type="button" onClick={() => setDraft({ ...draft, image: null })}>Remove</button></div></div> : <div className={styles.compactEmpty}>No image selected.</div>}</div>
      <div className={styles.switchRow}><label><input type="checkbox" checked={draft.active} onChange={event => setDraft({ ...draft, active: event.target.checked })} /><span>Active category</span></label></div></div>
      <footer className={styles.editorFooter}><span>Deleting a category in use is blocked.</span><div><button type="button" className={styles.secondaryButton} onClick={() => setDraft(null)}>Cancel</button><button type="submit" className={styles.primaryButton} disabled={saving}>{saving ? "Saving…" : "Save category"}</button></div></footer>
    </form></div>}
    <MediaPickerDialog open={pickerOpen} title="Select category image" initialItems={draft?.image ? [draft.image] : []} allowedTypes={IMAGE_ONLY} maxImages={1} maxTotal={1} onClose={() => setPickerOpen(false)} onConfirm={items => setDraft(current => current ? { ...current, image: items[0] ?? null } : current)} />
  </>;
}
