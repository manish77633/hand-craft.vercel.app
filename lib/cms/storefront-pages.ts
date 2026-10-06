import { connectToDatabase } from "@/lib/mongodb";
import type { Product } from "@/lib/products";
import Category from "@/models/Category";
import Media from "@/models/Media";
import Page from "@/models/Page";
import PageSection from "@/models/PageSection";
import ProductModel from "@/models/Product";
import { defaultCards, defaultFaqs, type FaqItem, type ContentItem } from "./default-content";

export type CmsMedia = { id: string; type: "image" | "video"; url: string; thumbnail?: string; altText?: string };
export type CmsCategory = { id: string; name: string; slug: string; description: string; image?: string };
export type CmsSection = { id: string; type: string; heading: string; subheading: string; description: string; faqs?: FaqItem[]; items?: ContentItem[]; media: CmsMedia[]; button?: { label: string; url: string }; products: Product[]; categories: CmsCategory[]; visible: boolean; order: number };
export type CmsPageContent = { title: string; slug: string; seoTitle: string; seoDescription: string; sections: CmsSection[] };

type DbMedia = { _id: unknown; type: "image" | "video"; cloudinaryUrl: string; thumbnail?: string; altText?: string };
type DbCategory = { _id: unknown; name: string; slug: string; description?: string; image?: DbMedia | null };
type DbProduct = { _id: unknown; title: string; slug: string; description?: string; price: number; category?: DbCategory | null; media?: DbMedia[]; featured?: boolean; available?: boolean };
type DbSection = { _id: unknown; type: string; heading?: string; subheading?: string; description?: string; faqs?: FaqItem[]; items?: ContentItem[]; media?: DbMedia[]; button?: { label?: string; url?: string } | null; products?: DbProduct[]; categories?: DbCategory[]; visible?: boolean; order?: number };
type DbPage = { title: string; slug: string; seoTitle?: string; seoDescription?: string; sections?: DbSection[] };

function mapProduct(product: DbProduct): Product {
  const image = product.media?.find(media => media.type === "image");
  return { id: String(product._id), slug: product.slug, name: product.title, description: product.description ?? "", price: product.price, category: product.category?.slug ?? "collections", categoryLabel: product.category?.name ?? "Collection", image: image?.cloudinaryUrl ?? image?.thumbnail ?? "/images/hero.png", featured: product.featured ?? false, available: product.available ?? true };
}

function mapCategory(category: DbCategory): CmsCategory {
  return { id: String(category._id), name: category.name, slug: category.slug, description: category.description ?? "", image: category.image?.cloudinaryUrl };
}

export async function getCmsPage(slug: string): Promise<CmsPageContent | null> {
  if (!process.env.MONGODB_URI) return null;
  try {
    await connectToDatabase();
    void Media; void PageSection; void ProductModel; void Category;
    const page = await Page.findOne({ slug, status: "published" }).populate({
      path: "sections",
      populate: [
        { path: "media" },
        { path: "products", populate: [{ path: "media" }, { path: "category" }] },
        { path: "categories", populate: { path: "image" } },
      ],
    }).lean() as DbPage | null;
    if (!page) return null;

    return {
      title: page.title,
      slug: page.slug,
      seoTitle: page.seoTitle ?? "",
      seoDescription: page.seoDescription ?? "",
      sections: [...(page.sections ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map(section => ({
        id: String(section._id),
        type: section.type,
        heading: section.heading ?? "",
        subheading: section.subheading ?? "",
        description: section.description ?? "",
        faqs: section.faqs ?? defaultFaqs(section.type),
        items: section.items ?? defaultCards[section.type],
        media: (section.media ?? []).map(media => ({ id: String(media._id), type: media.type, url: media.cloudinaryUrl, thumbnail: media.thumbnail, altText: media.altText })),
        button: section.button?.label || section.button?.url ? { label: section.button.label ?? "Learn more", url: section.button.url ?? "#" } : undefined,
        products: (section.products ?? []).filter(product => product && product.available !== false).map(mapProduct),
        categories: (section.categories ?? []).map(mapCategory),
        visible: section.visible ?? true,
        order: section.order ?? 0,
      })),
    };
  } catch (error) {
    console.error("Could not load CMS page", error);
    throw error;
  }
}

export async function getCmsCollection(slug: string) {
  const page = await getCmsPage(slug);
  if (!process.env.MONGODB_URI) return { page, category: null, products: [] as Product[] };
  try {
    await connectToDatabase();
    const category = await Category.findOne({ slug, active: true }).populate("image").lean() as DbCategory | null;
    if (!category) return { page, category: null, products: [] as Product[] };
    const products = await ProductModel.find({ category: category._id, available: true }).populate("media category").lean() as DbProduct[];
    return { page, category: mapCategory(category), products: products.map(mapProduct) };
  } catch (error) {
    console.error("Could not load collection", error);
    throw error;
  }
}
