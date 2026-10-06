import { connectToDatabase } from "@/lib/mongodb";
import { categories as fallbackCategories, products as fallbackProducts, type Product } from "@/lib/products";
import Category from "@/models/Category";
import Media from "@/models/Media";
import Page from "@/models/Page";
import PageSection from "@/models/PageSection";
import ProductModel from "@/models/Product";
import { defaultCards, defaultFaqs, type FaqItem, type ContentItem } from "./default-content";
import { homepageProductIds, type ProductSource } from "./product-selection";

export type HomeMedia = { id: string; type: "image" | "video"; url: string; thumbnail?: string; altText?: string };
export type HomeCategory = { id: string; name: string; slug: string; description: string; image: string };
export type HomeButton = { label: string; url: string };
export type HomeSection = {
  reels?: ReelItem[];
  faqs?: FaqItem[];
  items?: ContentItem[];
  id: string;
  type: string;
  heading: string;
  subheading: string;
  description: string;
  media: HomeMedia[];
  button?: HomeButton;
  products: Product[];
  categories: HomeCategory[];
  visible: boolean;
  order: number;
};
export type ReelItem = { id: string; slug: string; title: string; videoUrl?: string; poster: string; image: string; order: number };
export type HomepageContent = { sections: HomeSection[]; reels: ReelItem[] };

type DbMedia = { _id: unknown; type: "image" | "video"; cloudinaryUrl: string; thumbnail?: string; altText?: string };
type DbCategory = { _id: unknown; name: string; slug: string; description?: string; image?: DbMedia | null };
type DbProduct = { _id: unknown; title: string; slug: string; description?: string; price: number; category?: DbCategory | null; media?: DbMedia[]; featured?: boolean; available?: boolean; showInReels?: boolean; reelOrder?: number; reelTitle?: string };
type DbSection = { _id: unknown; type: string; heading?: string; subheading?: string; description?: string; faqs?: FaqItem[]; items?: ContentItem[]; media?: DbMedia[]; button?: HomeButton | null; products?: DbProduct[]; productSource?: ProductSource; categories?: DbCategory[]; visible?: boolean; order?: number };
type DbPage = { sections?: DbSection[] };

function mapMedia(media: DbMedia): HomeMedia {
  return { id: String(media._id), type: media.type, url: media.cloudinaryUrl, thumbnail: media.thumbnail, altText: media.altText };
}

function mapCategory(category: DbCategory): HomeCategory {
  return { id: String(category._id), name: category.name, slug: category.slug, description: category.description ?? "", image: category.image?.cloudinaryUrl ?? "/images/hero.png" };
}

function mapProduct(product: DbProduct): Product {
  const image = product.media?.find(media => media.type === "image");
  return {
    id: String(product._id),
    slug: product.slug,
    name: product.title,
    description: product.description ?? "",
    price: product.price,
    category: product.category?.slug ?? "collections",
    categoryLabel: product.category?.name ?? "Collection",
    image: image?.cloudinaryUrl ?? image?.thumbnail ?? "/images/hero.png",
    featured: product.featured ?? false,
    available: product.available ?? true,
  };
}

function fallbackSection(type: string, order: number): HomeSection {
  const defaults: Record<string, Partial<HomeSection>> = {
    hero: { heading: "Handcrafted\nTreasures", subheading: "Handmade with heart", description: "Artisanal products for a more mindful home.", media: [{ id: "hero", type: "image", url: "/images/hero.png" }], button: { label: "Explore Collection", url: "/collections" } },
    "featured-products": { heading: "Featured Collection", subheading: "A considered edit", products: fallbackProducts.filter(product => product.featured), button: { label: "View All", url: "/collections" } },
    "category-grid": { heading: "Find your kind of beautiful.", subheading: "Explore by category", categories: fallbackCategories.map(category => ({ id: category.slug, name: category.name, slug: category.slug, description: category.copy, image: category.image })), button: { label: "Explore all", url: "/collections" } },
    "made-in-motion": { heading: "Made in Motion", subheading: "See the craft in motion", description: "A closer look at the pieces, textures, and details made by hand." },
    story: { heading: "A human touch you can feel.", subheading: "Our story", description: "Ammaai began with a simple belief: what we bring into our homes should carry a story. Our collection celebrates the texture and beautiful variations that make handmade work personal.", media: [{ id: "artisan", type: "image", url: "/images/artisan.png" }], button: { label: "Discover our story", url: "/about" } },
    experience: { heading: "The little things make it personal.", subheading: "The Ammaai experience", description: "A simple way to explore, save, and ask about pieces you love." },
    faq: { heading: "Frequently asked questions", subheading: "A few helpful details" },
  };
  return { id: type, type, heading: "", subheading: "", description: "", faqs: defaultFaqs(type), items: defaultCards[type], media: [], products: [], categories: [], visible: true, order, ...defaults[type] };
}

function fallbackHomepage(): HomepageContent {
  const types = ["hero", "featured-products", "category-grid", "made-in-motion", "story", "experience", "faq"];
  return {
    sections: types.map(fallbackSection),
    reels: fallbackProducts.filter(product => product.featured).slice(0, 4).map((product, order) => ({ id: product.id, slug: product.slug, title: product.name, poster: product.image, image: product.image, order })),
  };
}

export async function getHomepageContent(): Promise<HomepageContent> {
  if (!process.env.MONGODB_URI) return fallbackHomepage();

  try {
    await connectToDatabase();
    void Category; void Media; void PageSection;
    const [page, allProducts, activeCategories] = await Promise.all([
      Page.findOne({ slug: "home", status: "published" }).populate({
        path: "sections",
        populate: [
          { path: "media" },
          { path: "categories", populate: { path: "image" } },
        ],
      }).lean() as Promise<DbPage | null>,
      ProductModel.find({ available: true }).populate("media category").sort("reelOrder createdAt").lean() as Promise<DbProduct[]>,
      Category.find({ active: true }).populate("image").sort("order name").lean() as Promise<DbCategory[]>,
    ]);

    const featuredProducts = allProducts.filter(product => product.featured);
    if (!page) {
      const defaults = fallbackHomepage();
      defaults.sections = defaults.sections.map(section => ({ ...section, products: section.type === "featured-products" ? featuredProducts.map(mapProduct) : [], categories: section.type === "category-grid" ? activeCategories.map(mapCategory) : [] }));
      defaults.reels = [];
      return defaults;
    }

    const sortedSections = [...(page.sections ?? [])].filter(Boolean).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const productIndex = new Map(allProducts.map(product => [String(product._id), product]));
    const selectionProducts = allProducts.map(product => ({ ...product, id: String(product._id), hasVideo: product.media?.some(media => media.type === "video") }));
    const selectedProducts = (section: DbSection) => homepageProductIds(section.type, section.productSource ?? "automatic", (section.products ?? []).filter(Boolean).map(product => String(product._id ?? product)), selectionProducts).map(id => productIndex.get(id)!);
    const mapReel = (product: DbProduct, order: number): ReelItem => {
      const video = product.media?.find(media => media.type === "video");
      const image = product.media?.find(media => media.type === "image");
      const fallbackImage = image?.cloudinaryUrl ?? video?.thumbnail ?? "/images/hero.png";
      return { id: String(product._id), slug: product.slug, title: product.reelTitle || product.title, videoUrl: video?.cloudinaryUrl, poster: video?.thumbnail ?? fallbackImage, image: fallbackImage, order };
    };
    const sections: HomeSection[] = sortedSections.map(section => ({
      id: String(section._id),
      type: section.type,
      heading: section.heading ?? "",
      subheading: section.subheading ?? "",
      description: section.description ?? "",
      faqs: section.faqs ?? defaultFaqs(section.type),
      items: section.items ?? defaultCards[section.type],
      media: (section.media ?? []).filter(Boolean).map(mapMedia),
      button: section.button?.label || section.button?.url ? { label: section.button.label ?? "Learn more", url: section.button.url ?? "#" } : undefined,
      products: selectedProducts(section).map(mapProduct),
      reels: section.type === "made-in-motion" ? selectedProducts(section).map(mapReel) : undefined,
      categories: (section.type === "category-grid" ? [...(section.categories ?? []).filter(c => c && activeCategories.some(a => String(a._id) === String(c._id))), ...activeCategories.filter(c => !section.categories?.some(a => a && String(a._id) === String(c._id)))] : section.categories ?? []).filter(Boolean).map(mapCategory),
      visible: section.visible ?? true,
      order: section.order ?? 0,
    }));

    let reelProducts = allProducts.filter(product => product.showInReels === true);
    if (reelProducts.length === 0) {
      const legacyDummy = allProducts.find(product => product.showInReels === undefined && product.media?.some(media => media.type === "video"));
      if (legacyDummy) reelProducts = [legacyDummy];
    }
    const reels = reelProducts.map(product => {
      const video = product.media?.find(media => media.type === "video");
      const image = product.media?.find(media => media.type === "image");
      const fallbackImage = image?.cloudinaryUrl ?? video?.thumbnail ?? "/images/hero.png";
      return { id: String(product._id), slug: product.slug, title: product.reelTitle || product.title, videoUrl: video?.cloudinaryUrl, poster: video?.thumbnail ?? fallbackImage, image: fallbackImage, order: product.reelOrder ?? 0 };
    }).sort((a, b) => a.order - b.order);

    return { sections, reels };
  } catch (error) {
    console.error("Could not load homepage content:", error);
    throw error;
  }
}
