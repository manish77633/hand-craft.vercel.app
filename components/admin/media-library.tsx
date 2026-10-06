"use client";
import { adminRequest } from "./cms-types";

import { ChangeEvent, DragEvent, useCallback, useEffect, useRef, useState } from "react";
import {
  Check,
  FileImage,
  Film,
  Image as ImageIcon,
  LoaderCircle,
  Play,
  RefreshCw,
  Search,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import styles from "@/app/admin/admin.module.css";

type MediaType = "image" | "video";

export type MediaItem = {
  _id: string;
  filename: string;
  type: MediaType;
  cloudinaryUrl: string;
  publicId: string;
  thumbnail?: string;
  width?: number;
  height?: number;
  duration?: number;
  altText?: string;
  createdAt: string;
};

type CloudinaryUpload = {
  secure_url: string;
  public_id: string;
  resource_type: MediaType;
  width?: number;
  height?: number;
  duration?: number;
  format?: string;
};

type UploadItem = {
  id: string;
  file: File;
  status: "queued" | "signing" | "uploading" | "saving" | "complete" | "error";
  progress: number;
  error?: string;
  cloudinary?: CloudinaryUpload;
};

type Signature = {
  timestamp: number;
  folder: string;
  signature: string;
  cloudName: string;
  apiKey: string;
};

function videoThumbnail(url: string) {
  const transformed = url.replace("/upload/", "/upload/so_0,w_800,c_limit/");
  return transformed.replace(/\.[a-z0-9]+$/i, ".jpg");
}

async function errorMessage(response: Response) {
  const data = await response.json().catch(() => null) as { error?: string; usedBy?: string[] } | null;
  if (data?.usedBy?.length) return `${data.error}. Used by: ${data.usedBy.join(", ")}.`;
  return data?.error ?? `Request failed with status ${response.status}`;
}

export function MediaLibrary({ onSelect }: { onSelect?: (items: MediaItem[]) => void } = {}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [filter, setFilter] = useState<"all" | MediaType>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [dragging, setDragging] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [preview, setPreview] = useState<MediaItem | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const loadMedia = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (filter !== "all") params.set("type", filter);
      if (search.trim()) params.set("q", search.trim());
      const response = await adminRequest(`/api/media?${params}`, { cache: "no-store", signal });
      if (!response.ok) throw new Error(await errorMessage(response));
      const data = await response.json() as { items: MediaItem[] };
      setItems(data.items);
      setMessage(null);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setMessage(error instanceof Error ? error.message : "Could not load the Media Library.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [filter, search]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => void loadMedia(controller.signal), 250);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [loadMedia]);

  function updateUpload(id: string, update: Partial<UploadItem>) {
    setUploads(current => current.map(item => item.id === id ? { ...item, ...update } : item));
  }

  function sendToCloudinary(file: File, signature: Signature, id: string) {
    return new Promise<CloudinaryUpload>((resolve, reject) => {
      const request = new XMLHttpRequest();
      request.open("POST", `https://api.cloudinary.com/v1_1/${signature.cloudName}/auto/upload`);
      request.upload.onprogress = event => {
        if (event.lengthComputable) updateUpload(id, { progress: Math.round((event.loaded / event.total) * 100) });
      };
      request.onerror = () => reject(new Error("The upload connection failed."));
      request.onload = () => {
        try {
          const response = JSON.parse(request.responseText || "{}") as CloudinaryUpload & { error?: { message?: string } };
          if (request.status >= 200 && request.status < 300) resolve(response);
          else reject(new Error(response.error?.message ?? "Cloudinary rejected the upload."));
        } catch {
          reject(new Error("Cloudinary returned an invalid upload response."));
        }
      };

      const form = new FormData();
      form.append("file", file);
      form.append("api_key", signature.apiKey);
      form.append("timestamp", String(signature.timestamp));
      form.append("signature", signature.signature);
      form.append("folder", signature.folder);
      request.send(form);
    });
  }

  async function saveMetadata(file: File, upload: CloudinaryUpload) {
    const type: MediaType = upload.resource_type === "video" ? "video" : "image";
    const response = await adminRequest("/api/media", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: file.name,
        type,
        cloudinaryUrl: upload.secure_url,
        publicId: upload.public_id,
        thumbnail: type === "video" ? videoThumbnail(upload.secure_url) : upload.secure_url,
        width: upload.width,
        height: upload.height,
        duration: upload.duration,
        altText: "",
      }),
    });
    if (!response.ok) throw new Error(await errorMessage(response));
  }

  async function processUpload(entry: UploadItem) {
    try {
      let cloudinaryUpload = entry.cloudinary;
      if (!cloudinaryUpload) {
        updateUpload(entry.id, { status: "signing", progress: 0, error: undefined });
        const signatureResponse = await adminRequest("/api/media/signature", { method: "POST" });
        if (!signatureResponse.ok) throw new Error(await errorMessage(signatureResponse));
        const signature = await signatureResponse.json() as Signature;
        updateUpload(entry.id, { status: "uploading" });
        cloudinaryUpload = await sendToCloudinary(entry.file, signature, entry.id);
        updateUpload(entry.id, { cloudinary: cloudinaryUpload });
      }

      updateUpload(entry.id, { status: "saving", progress: 100 });
      await saveMetadata(entry.file, cloudinaryUpload);
      updateUpload(entry.id, { status: "complete", progress: 100 });
      await loadMedia();
    } catch (error) {
      updateUpload(entry.id, {
        status: "error",
        error: error instanceof Error ? error.message : "Upload failed.",
      });
    }
  }

  function addFiles(fileList: FileList | File[]) {
    const accepted = Array.from(fileList).filter(file => file.type.startsWith("image/") || file.type.startsWith("video/"));
    if (!accepted.length) {
      setMessage("Choose image or video files to upload.");
      return;
    }

    const entries: UploadItem[] = accepted.map(file => ({
      id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
      file,
      status: "queued",
      progress: 0,
    }));
    setMessage(null);
    setUploads(current => [...entries, ...current].slice(0, 30));
    entries.forEach(entry => void processUpload(entry));
  }

  function handleInput(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files) addFiles(event.target.files);
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    addFiles(event.dataTransfer.files);
  }

  async function deleteItem(item: MediaItem) {
    if (!window.confirm(`Delete “${item.filename}” from the Media Library and Cloudinary?`)) return;
    setMessage(null);
    const response = await adminRequest(`/api/media/${item._id}`, { method: "DELETE" });
    if (!response.ok) {
      setMessage(await errorMessage(response));
      return;
    }
    setItems(current => current.filter(candidate => candidate._id !== item._id));
    setSelected(current => {
      const next = new Set(current);
      next.delete(item._id);
      return next;
    });
    setPreview(null);
  }

  function toggleSelection(item: MediaItem) {
    setSelected(current => {
      const next = new Set(current);
      if (next.has(item._id)) next.delete(item._id);
      else next.add(item._id);
      return next;
    });
  }

  function retryUpload(upload: UploadItem) {
    const retry = { ...upload, status: "queued" as const, error: undefined };
    updateUpload(upload.id, retry);
    void processUpload(retry);
  }

  const selectedItems = items.filter(item => selected.has(item._id));

  return (
    <div className={styles.mediaLibrary}>
      <div
        className={`${styles.dropzone} ${dragging ? styles.dropzoneActive : ""}`}
        onDragEnter={event => { event.preventDefault(); setDragging(true); }}
        onDragOver={event => event.preventDefault()}
        onDragLeave={event => { if (event.currentTarget === event.target) setDragging(false); }}
        onDrop={handleDrop}
      >
        <input ref={inputRef} type="file" accept="image/*,video/*" multiple hidden onChange={handleInput} />
        <span className={styles.dropIcon}><UploadCloud size={25} /></span>
        <div><strong>Drop images or videos here</strong><p>Upload multiple files directly to Cloudinary.</p></div>
        <button className={styles.primaryButton} type="button" onClick={() => inputRef.current?.click()}>Choose files</button>
      </div>

      {uploads.length > 0 && (
        <section className={styles.uploadPanel} aria-label="Upload progress">
          <div className={styles.panelHeading}><h2>Uploads</h2><button type="button" onClick={() => setUploads(current => current.filter(item => item.status !== "complete"))}>Clear completed</button></div>
          <div className={styles.uploadList}>
            {uploads.map(upload => (
              <div key={upload.id} className={styles.uploadRow}>
                <span className={styles.fileTypeIcon}>{upload.file.type.startsWith("video/") ? <Film size={18} /> : <FileImage size={18} />}</span>
                <div className={styles.uploadDetails}>
                  <div><strong>{upload.file.name}</strong><span>{upload.status === "error" ? upload.error : upload.status}</span></div>
                  <div className={styles.progressTrack}><span style={{ width: `${upload.progress}%` }} /></div>
                </div>
                {upload.status === "complete" && <Check className={styles.successIcon} size={18} />}
                {upload.status === "error" && <button className={styles.iconButton} type="button" title="Retry upload" onClick={() => retryUpload(upload)}><RefreshCw size={17} /></button>}
                {!["complete", "error"].includes(upload.status) && <LoaderCircle className={styles.spinner} size={18} />}
              </div>
            ))}
          </div>
        </section>
      )}

      <div className={styles.libraryToolbar}>
        <div className={styles.filterGroup} aria-label="Filter media">
          {(["all", "image", "video"] as const).map(value => (
            <button key={value} type="button" className={filter === value ? styles.filterActive : ""} onClick={() => setFilter(value)}>
              {value === "all" ? "All media" : value === "image" ? "Images" : "Videos"}
            </button>
          ))}
        </div>
        <label className={styles.searchField}><Search size={17} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search media" /></label>
        <button
          type="button"
          className={`${styles.secondaryButton} ${selectionMode ? styles.selectionButtonActive : ""}`}
          onClick={() => { setSelectionMode(value => !value); setSelected(new Set()); }}
        >
          <Check size={16} /> {selectionMode ? "Done selecting" : "Select media"}
        </button>
      </div>

      {message && <div className={styles.alert} role="alert">{message}<button onClick={() => setMessage(null)} aria-label="Dismiss"><X size={16} /></button></div>}

      {loading ? (
        <div className={styles.libraryState}><LoaderCircle className={styles.spinner} size={24} /> Loading media…</div>
      ) : items.length === 0 ? (
        <div className={styles.libraryState}><ImageIcon size={28} /><strong>No media found</strong><span>Upload a file or change the current search and filter.</span></div>
      ) : (
        <div className={styles.mediaGrid}>
          {items.map(item => {
            const isSelected = selected.has(item._id);
            return (
              <article key={item._id} className={`${styles.mediaCard} ${isSelected ? styles.mediaCardSelected : ""}`}>
                <button className={styles.mediaPreview} type="button" onClick={() => selectionMode ? toggleSelection(item) : setPreview(item)}>
                  {item.type === "video" ? (
                    <><img src={item.thumbnail || videoThumbnail(item.cloudinaryUrl)} alt="" /><span className={styles.playBadge}><Play size={17} fill="currentColor" /></span></>
                  ) : <img src={item.thumbnail || item.cloudinaryUrl} alt={item.altText || item.filename} />}
                  {selectionMode && <span className={styles.selectBadge}>{isSelected && <Check size={14} />}</span>}
                </button>
                <div className={styles.mediaMeta}>
                  <div><strong title={item.filename}>{item.filename}</strong><span>{item.type}{item.width && item.height ? ` · ${item.width}×${item.height}` : ""}</span></div>
                  <button type="button" className={styles.deleteButton} title="Delete media" onClick={() => void deleteItem(item)}><Trash2 size={16} /></button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {selectionMode && selectedItems.length > 0 && (
        <div className={styles.selectionTray}>
          <div><strong>{selectedItems.length} selected</strong><span>Ready to reuse in products, categories, home, or pages.</span></div>
          <button type="button" className={styles.primaryButton} onClick={() => {
            onSelect?.(selectedItems);
            setMessage(`${selectedItems.length} media item${selectedItems.length === 1 ? "" : "s"} selected for reuse.`);
            setSelectionMode(false);
          }}>Use selected media</button>
        </div>
      )}

      {preview && (
        <div className={styles.previewBackdrop} role="dialog" aria-modal="true" aria-label={`Preview ${preview.filename}`} onClick={() => setPreview(null)}>
          <div className={styles.previewDialog} onClick={event => event.stopPropagation()}>
            <div className={styles.previewTopbar}><div><strong>{preview.filename}</strong><span>{preview.type}</span></div><button type="button" onClick={() => setPreview(null)} aria-label="Close preview"><X size={19} /></button></div>
            <div className={styles.previewCanvas}>
              {preview.type === "video" ? <video src={preview.cloudinaryUrl} controls preload="metadata" /> : <img src={preview.cloudinaryUrl} alt={preview.altText || preview.filename} />}
            </div>
            <div className={styles.previewFooter}>
              <span>{preview.width && preview.height ? `${preview.width} × ${preview.height}` : "Dimensions unavailable"}{preview.duration ? ` · ${preview.duration.toFixed(1)} seconds` : ""}</span>
              <button type="button" className={styles.dangerButton} onClick={() => void deleteItem(preview)}><Trash2 size={15} /> Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
