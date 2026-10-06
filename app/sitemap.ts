import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";
import { getCatalogue } from "@/lib/cms/products";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { products, categories } = await getCatalogue();
  return ["", "/about", "/contact", "/collections", ...categories.map(c => `/collections/${c.slug}`), ...products.map(p => `/products/${p.slug}`)].map(path => ({ url: `${siteUrl}${path}` }));
}
