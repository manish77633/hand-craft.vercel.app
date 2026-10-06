import type { MediaItem } from "./media-library";

export type CategoryItem = {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image?: MediaItem | null;
  order: number;
  active: boolean;
};

export type ProductItem = {
  _id: string;
  title: string;
  material?: string;
  dimensions?: string;
  slug: string;
  sku?: string;
  description: string;
  price: number;
  category: CategoryItem;
  media: MediaItem[];
  featured: boolean;
  available: boolean;
  showInReels: boolean;
  reelOrder: number;
  reelTitle: string;
};

export function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function responseError(response: Response) {
  const data = await response.json().catch(() => null) as { error?: string } | null;
  return data?.error ?? `Request failed with status ${response.status}`;
}

// The API caps each response at 100; editors must retain references outside the first page.
async function fetchRecords(url: string, init?: RequestInit): Promise<Response> {
  const [path, query = ""] = url.split("?");
  const params = new URLSearchParams(query); params.set("limit", "100"); params.set("page", "1");
  const response = await fetch(`${path}?${params}`, init);
  if (!response.ok) return response;
  const data = await response.json(); const items = [...data.items];
  for (let page = 2; items.length < data.pagination.total; page++) {
    params.set("page", String(page)); const next = await fetch(`${path}?${params}`, init);
    if (!next.ok) return next;
    const batch = await next.json(); if (!batch.items.length) break; items.push(...batch.items);
  }
  return Response.json({ ...data, items });
}

type CacheEntry = { response?: Response; pending?: Promise<Response> };
const recordCache = new Map<string, CacheEntry>();
function cacheKey(url: string) {
  const [path, query = ""] = url.split("?");
  if (path !== "/api/products" && path !== "/api/categories") return null;
  const params = new URLSearchParams(query); params.delete("limit"); params.delete("page"); params.sort();
  return `${path}?${params}`;
}

export function cachedAdminItems<T>(path: string): T[] | undefined {
  // A synchronous snapshot avoids flashing a loader on a cached tab.
  return typeof window === "undefined" ? undefined : snapshots.get(`${path}?`) as T[] | undefined;
}
const snapshots = new Map<string, unknown[]>();

export async function fetchAllRecords(url: string, init?: RequestInit): Promise<Response> {
  const key = typeof window !== "undefined" ? cacheKey(url) : null;
  if (!key || init?.signal) return fetchRecords(url, init);
  const existing = recordCache.get(key);
  if (existing?.response) return existing.response.clone();
  if (existing?.pending) return (await existing.pending).clone();
  const entry: CacheEntry = {};
  recordCache.set(key, entry);
  entry.pending = fetchRecords(url, init).then(async response => {
    if (recordCache.get(key) === entry) {
      if (response.ok) { entry.response = response.clone(); snapshots.set(key, (await response.clone().json()).items); }
      else recordCache.delete(key);
    }
    return response;
  }).catch(error => { if (recordCache.get(key) === entry) recordCache.delete(key); throw error; });
  return (await entry.pending).clone();
}

export async function adminRequest(url: string, init?: RequestInit): Promise<Response> {
  const response = await fetch(url, init);
  if (response.ok && init?.method && init.method.toUpperCase() !== "GET") {
    const path = url.split("?")[0];
    const affected = path.startsWith("/api/categories") || path.startsWith("/api/media") ? ["/api/categories", "/api/products"] : path.startsWith("/api/products") ? ["/api/products"] : [];
    for (const key of recordCache.keys()) if (affected.some(path => key.startsWith(`${path}?`))) { recordCache.delete(key); snapshots.delete(key); }
  }
  return response;
}
