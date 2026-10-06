import { connectToDatabase } from "@/lib/mongodb";
import { cache } from "react";
import { getProduct as getFallbackProduct, products as fallbackProducts, categories as fallbackCategories, type Product } from "@/lib/products";
import Category from "@/models/Category";
import Media from "@/models/Media";
import ProductModel from "@/models/Product";

type DbMedia = { type: "image" | "video"; cloudinaryUrl: string; thumbnail?: string };
type DbCategory = { _id: unknown; name: string; slug: string };
type DbProduct = { _id: unknown; title: string; slug: string; description?: string; material?: string; dimensions?: string; price: number; category?: DbCategory; media?: DbMedia[]; featured?: boolean; available?: boolean };

function mapProduct(product: DbProduct): Product {
  const image = product.media?.find(media => media.type === "image");
  return { id: String(product._id), slug: product.slug, name: product.title, description: product.description ?? "", material: product.material, dimensions: product.dimensions, price: product.price, category: product.category?.slug ?? "collections", categoryLabel: product.category?.name ?? "Collection", image: image?.cloudinaryUrl ?? image?.thumbnail ?? "/images/hero.png", featured: product.featured ?? false, available: product.available ?? true };
}

export const getCmsProduct = cache(async (slug: string) => {
  if (!process.env.MONGODB_URI) return getFallbackProduct(slug);
  try {
    await connectToDatabase();
    void Category; void Media;
    const product = await ProductModel.findOne({ slug }).populate("category media").lean() as DbProduct | null;
    return product ? { ...mapProduct(product), material: product.material, dimensions: product.dimensions, media: product.media?.filter(Boolean).map(item => ({ type: item.type, url: item.cloudinaryUrl, thumbnail: item.thumbnail })) } : undefined;
  } catch (error) {
    console.error("Could not read product", error);
    throw error;
  }
});

export async function getCatalogue(includeUnavailable = false) {
  if (!process.env.MONGODB_URI) return { products: fallbackProducts, categories: fallbackCategories };
  await connectToDatabase();
  void Media;
  const categoryDocs = await Category.find({ active: true }).populate("image").sort("order name").lean();
  const docs = await ProductModel.find({ category: { $in: categoryDocs.map(c => c._id) }, ...(includeUnavailable ? {} : { available: true }) }).populate("category media").sort("-createdAt").lean() as DbProduct[];
  return { products: docs.map(mapProduct), categories: categoryDocs.map(c => ({ name: c.name as string, slug: c.slug as string, copy: c.description as string, image: c.image?.cloudinaryUrl || "/images/hero.png" })) };
}

export async function getRelatedProducts(product: Product) {
  if (!process.env.MONGODB_URI) return fallbackProducts.filter(item => item.id !== product.id).sort((a, b) => Number(b.category === product.category) - Number(a.category === product.category)).slice(0, 4);
  try {
    await connectToDatabase();
    const items = await ProductModel.find({ slug: { $ne: product.slug }, available: true }).populate("category media").limit(12).lean() as DbProduct[];
    return items.map(mapProduct).sort((a, b) => Number(b.category === product.category) - Number(a.category === product.category)).slice(0, 4);
  } catch {
    return fallbackProducts.filter(item => item.id !== product.id).slice(0, 4);
  }
}
