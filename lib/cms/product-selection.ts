export type ProductSource = "automatic" | "manual";
export type SelectableProduct = { id: string; available?: boolean; featured?: boolean; showInReels?: boolean; reelOrder?: number; hasVideo?: boolean };

// Shared by the editor and storefront so their previews and ordering agree.
export function homepageProductIds(type: string, source: ProductSource, selected: string[], products: SelectableProduct[]): string[] {
  const available = products.filter(product => product.available !== false);
  const valid = new Set(available.map(product => product.id));
  const chosen = [...new Set(selected)].filter(id => valid.has(id));
  if (source === "manual") return chosen;
  if (type === "featured-products") return [...new Set([...chosen, ...available.filter(product => product.featured).sort((a, b) => a.id.localeCompare(b.id)).map(product => product.id)])];
  if (type === "made-in-motion") {
    const reels = available.filter(product => product.showInReels === true).sort((a, b) => (a.reelOrder ?? 0) - (b.reelOrder ?? 0) || a.id.localeCompare(b.id));
    if (reels.length) return reels.map(product => product.id);
    return available.filter(product => product.showInReels === undefined && product.hasVideo).sort((a, b) => a.id.localeCompare(b.id)).slice(0, 1).map(product => product.id);
  }
  return chosen;
}
