import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, MessageCircle, Leaf, ShieldCheck } from "lucide-react";
import { formatPrice, products } from "@/lib/products";
import { getCmsProduct, getRelatedProducts } from "@/lib/cms/products";
import { productWhatsAppMessage, whatsappUrl } from "@/lib/whatsapp";
import { WishlistButton } from "@/components/wishlist-button";
import { getStoreSettings } from "@/lib/cms/site-settings";
import { siteUrl } from "@/lib/site-url";
import { ProductGallery } from "@/components/product-gallery";
import { ProductGrid } from "@/components/product-card";

type Props = { params: Promise<{ "product-slug": string }> };
export async function generateStaticParams() { return products.map(product => ({ "product-slug": product.slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> { const { "product-slug": slug } = await params; const product = await getCmsProduct(slug); return product ? { title: product.name, description: product.description } : {}; }

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: Props) {
  const { "product-slug": slug } = await params;
  const product = await getCmsProduct(slug);
  if (!product) notFound();
  const [related, settings] = await Promise.all([getRelatedProducts(product), getStoreSettings()]);
  const price = formatPrice(product.price);
  const chatUrl = whatsappUrl(productWhatsAppMessage(product.name, price, `${siteUrl}/products/${product.slug}`), settings.whatsapp);
  const structuredImage = product.image.startsWith("http") ? product.image : `${siteUrl}${product.image}`;
  const structuredData = { "@context": "https://schema.org", "@type": "Product", name: product.name, image: [structuredImage], description: product.description, offers: { "@type": "Offer", priceCurrency: "INR", price: product.price, availability: product.available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock" } };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
    <section className="product-detail bg-ivory md:py-12"><div className="shell product-shell">
      <div className="hidden pb-5 text-xs text-muted md:block"><Link href="/collections">Collection</Link> / <Link href={`/collections/${product.category}`}>{product.categoryLabel}</Link> / {product.name}</div>
      <div className="grid gap-0 md:grid-cols-[minmax(0,1.1fr)_minmax(350px,.9fr)] md:gap-12 lg:gap-20">
        <div className="product-main-image relative min-w-0"><ProductGallery name={product.name} image={product.image} media={product.media} />
          <Link href={`/collections/${product.category}`} aria-label="Back to category" className="absolute left-[72px] top-4 grid h-9 w-9 place-items-center rounded-full bg-ivory/90 md:hidden"><ArrowLeft size={18} /></Link><div className="absolute right-4 top-4 md:hidden"><WishlistButton id={product.id} /></div>
        </div>
        <div className="product-copy py-5 md:pt-6"><p className="eyebrow hidden text-forest md:block">{product.categoryLabel} · Handmade</p><div className="flex items-start justify-between gap-4"><h1 className="text-[17px] font-semibold leading-tight md:mt-4 md:font-serif md:text-[52px] md:font-medium">{product.name}</h1><div className="hidden md:block"><WishlistButton id={product.id} /></div></div><p className="mt-1 text-[17px] font-semibold md:mt-4 md:text-[22px]">{price}</p>
          <p className="mt-5 text-[12px] leading-[1.65] text-muted md:mt-7 md:text-[15px] md:leading-7">{product.description}</p>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[10px] text-forest md:mt-8 md:text-xs"><span className="flex items-center gap-1.5"><Leaf size={14} /> Handmade</span><span className="flex items-center gap-1.5"><ShieldCheck size={14} /> Carefully packed</span></div>
          <a href={chatUrl} target={settings.whatsapp ? "_blank" : undefined} rel="noreferrer" className="product-whatsapp-cta mt-7 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-[12px] font-semibold transition md:mt-10 md:rounded-full md:py-4 md:text-sm"><span>{settings.whatsapp ? "Chat on WhatsApp" : "Enquire about this product"}</span><MessageCircle size={17} /></a>
          <details open className="mt-6 border-t border-line py-4 md:mt-9"><summary className="cursor-pointer text-[12px] font-semibold md:text-sm">Product Details</summary><dl className="mt-4 grid grid-cols-2 gap-3 text-[12px] md:text-sm"><dt className="text-muted">Material</dt><dd>{product.material ?? "Not specified"}</dd><dt className="text-muted">Dimensions</dt><dd>{product.dimensions ?? "Not specified"}</dd><dt className="text-muted">Availability</dt><dd>{product.available ? "Available" : "Unavailable"}</dd></dl></details>
        </div>
      </div>
    </div></section>
    {related.length > 0 && <section className="shell py-10 md:py-20"><h2 className="mb-5 text-[15px] font-semibold md:mb-10 md:font-serif md:text-4xl">You may also like</h2><ProductGrid items={related} /></section>}
  </>;
}
