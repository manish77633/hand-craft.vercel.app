"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Film, Image as ImageIcon, LoaderCircle, Play, Search, X } from "lucide-react";
import type { MediaItem } from "./media-library";
import styles from "@/app/admin/admin.module.css";
import { SortHandle, moveItem } from "./sort-handle";

const DEFAULT_MEDIA_TYPES: Array<"image" | "video"> = ["image", "video"];

type MediaPickerDialogProps = {
  open: boolean;
  title?: string;
  initialItems?: MediaItem[];
  allowedTypes?: Array<"image" | "video">;
  maxImages?: number;
  maxVideos?: number;
  maxTotal?: number;
  onClose: () => void;
  onConfirm: (items: MediaItem[]) => void;
};

function videoThumbnail(url: string) {
  return url.replace("/upload/", "/upload/so_0,w_600,c_limit/").replace(/\.[a-z0-9]+$/i, ".jpg");
}

export function MediaPickerDialog({
  open,
  title = "Select media",
  initialItems = [],
  allowedTypes = DEFAULT_MEDIA_TYPES,
  maxImages,
  maxVideos,
  maxTotal,
  onClose,
  onConfirm,
}: MediaPickerDialogProps) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "image" | "video">("all");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const allowedTypesKey = allowedTypes.join(",");

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => { setSelectedIds(initialItems.map(item => item._id)); setMessage(null); }, 0);
    return () => window.clearTimeout(timer);
  }, [open, initialItems]);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ limit: "100" });
        if (filter !== "all") params.set("type", filter);
        if (search.trim()) params.set("q", search.trim());
        const response = await fetch(`/api/media?${params}`, { cache: "no-store", signal: controller.signal });
        const data = await response.json() as { items?: MediaItem[]; error?: string };
        if (!response.ok) throw new Error(data.error ?? "Could not load media.");
        setItems((data.items ?? []).filter(item => allowedTypesKey.split(",").includes(item.type)));
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setMessage(error instanceof Error ? error.message : "Could not load media.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 200);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [open, search, filter, allowedTypesKey]);

  const allKnownItems = useMemo(() => {
    const map = new Map(initialItems.map(item => [item._id, item]));
    items.forEach(item => map.set(item._id, item));
    return map;
  }, [initialItems, items]);

  if (!open) return null;

  function toggle(item: MediaItem) {
    if (selectedIds.includes(item._id)) {
      setSelectedIds(current => current.filter(id => id !== item._id));
      setMessage(null);
      return;
    }

    const selectedItems = selectedIds.map(id => allKnownItems.get(id)).filter(Boolean) as MediaItem[];
    if (maxTotal !== undefined && selectedIds.length >= maxTotal) return setMessage(`Select no more than ${maxTotal} media items.`);
    if (item.type === "image" && maxImages !== undefined && selectedItems.filter(media => media.type === "image").length >= maxImages) return setMessage(`Select no more than ${maxImages} images.`);
    if (item.type === "video" && maxVideos !== undefined && selectedItems.filter(media => media.type === "video").length >= maxVideos) return setMessage(`Select no more than ${maxVideos} video${maxVideos === 1 ? "" : "s"}.`);
    setSelectedIds(current => [...current, item._id]);
    setMessage(null);
  }

  function confirm() {
    const selected = selectedIds.map(id => allKnownItems.get(id)).filter(Boolean) as MediaItem[];
    onConfirm(selected);
    onClose();
  }

  const availableFilters = (["all", "image", "video"] as const).filter(value => value === "all" || allowedTypes.includes(value));

  return (
    <div className={styles.editorBackdrop} role="dialog" aria-modal="true" aria-label={title} onClick={onClose}>
      <div className={`${styles.pickerDialog} ${styles.mediaPickerDialog}`} onClick={event => event.stopPropagation()}>
        <header className={styles.editorHeader}><div><h2>{title}</h2><p>Select existing assets. Nothing is uploaded again.</p></div><button type="button" onClick={onClose} aria-label="Close"><X size={19} /></button></header>
        <div className={styles.pickerToolbar}>
          <div className={styles.filterGroup}>{availableFilters.map(value => <button key={value} type="button" className={filter === value ? styles.filterActive : ""} onClick={() => setFilter(value)}>{value === "all" ? "All" : value === "image" ? "Images" : "Videos"}</button>)}</div>
          <label className={styles.searchField}><Search size={16} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search Media Library" /></label>
        </div>
        {message && <div className={styles.inlineAlert}>{message}</div>}
        <div className={styles.pickerBody}>
          {selectedIds.length > 0 && <section className={styles.selectedMediaPanel} aria-label="Selected media order"><h3>Selected media order — drag to reorder</h3><div className={styles.selectedMediaGrid}>{selectedIds.map((id, index) => { const item = allKnownItems.get(id); if (!item) return null; return <article key={id} data-sort-group="media-selection" data-sort-index={index} className={styles.selectedMediaCard}><SortHandle index={index} group="media-selection" label={`selected media ${index + 1}`} onMove={(from, to) => setSelectedIds(moveItem(selectedIds, from, to))} /><img src={item.thumbnail || (item.type === "video" ? videoThumbnail(item.cloudinaryUrl) : item.cloudinaryUrl)} alt={item.altText || item.filename} /><div><small>Position {index + 1} · {item.type}</small><strong title={item.filename}>{item.filename || item.altText || "Media"}</strong></div><button type="button" aria-label={`Remove selected ${item.filename}`} onClick={() => toggle(item)}><X size={14} /></button></article>; })}</div></section>}
          {loading ? <div className={styles.libraryState}><LoaderCircle className={styles.spinner} size={22} /> Loading media…</div> : items.length === 0 ? <div className={styles.libraryState}><ImageIcon size={25} /><strong>No matching media</strong><span>Upload it from the Media Library first.</span></div> : (
            <div className={styles.pickerGrid}>
              {items.map(item => {
                const selected = selectedIds.includes(item._id);
                return <button key={item._id} type="button" className={`${styles.pickerItem} ${selected ? styles.pickerItemSelected : ""}`} onClick={() => toggle(item)}>
                  <span className={styles.pickerThumb}>{item.type === "video" ? <><img src={item.thumbnail || videoThumbnail(item.cloudinaryUrl)} alt="" /><span className={styles.playBadge}><Play size={14} fill="currentColor" /></span></> : <img src={item.thumbnail || item.cloudinaryUrl} alt={item.altText || item.filename} />}<span className={styles.selectBadge}>{selected && <Check size={13} />}</span></span>
                  <span className={styles.pickerName}>{item.type === "video" && <Film size={12} />}{item.filename}</span>
                </button>;
              })}
            </div>
          )}
        </div>
        <footer className={styles.editorFooter}><span>{selectedIds.length} selected</span><div><button type="button" className={styles.secondaryButton} onClick={onClose}>Cancel</button><button type="button" className={styles.primaryButton} onClick={confirm}>Use selected media</button></div></footer>
      </div>
    </div>
  );
}
