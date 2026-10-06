import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "@/components/store-image";
import type { Metadata } from "next";
import { categories, products } from "@/lib/products";
import { getCmsCollection, type CmsSection } from "@/lib/cms/storefront-pages";
import { CollectionExplorer } from "@/components/collection-explorer";
import { ViewportVideo } from "@/components/viewport-video";

type Props = { params: Promise<{ "category-slug": string }> };

export const dynamic = "force-dynamic";
export async function generateStaticParams() { return categories.map(category => ({ "category-slug": category.slug })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { "category-slug": slug } = await params;
  const fallback = categories.find(item => item.slug === slug);
  const { page, category } = await getCmsCollection(slug);
  return { title: page?.seoTitle || page?.title || category?.name || fallback?.name, description: page?.seoDescription || category?.description || fallback?.copy };
}

function CollectionHero({ section, name, description, image }: { section?: CmsSection; name: string; description: string; image: string }) {
  const media = section?.media[0];
  const Heading = section?.type === "category-story" ? "h2" : "h1";
  return <section className="bg-ivory"><div className="shell grid items-center gap-8 py-5 md:grid-cols-2 md:py-16"><div><p className="eyebrow hidden text-forest md:block">{section?.subheading || "Shop by category"}</p><Heading className="text-[16px] font-medium md:mt-4 md:font-serif md:text-8xl">{section?.heading || name}</Heading><p className="mt-5 hidden max-w-md text-sm leading-7 text-muted md:block">{section?.description || description}</p>{section?.button && <Link href={section.button.url} className="mt-5 inline-flex rounded-full bg-forest px-5 py-3 text-sm font-semibold text-white">{section.button.label}</Link>}</div><div className="relative hidden aspect-[16/9] overflow-hidden rounded-[24px] md:block">{media?.type === "video" ? <ViewportVideo src={media.url} poster={media.thumbnail} className="section-cms-video absolute inset-0" /> : <Image src={media?.url || image} alt={media?.altText || name} fill priority sizes="50vw" className="object-cover" />}</div></div></section>;
}

export default async function CategoryPage({ params }: Props) {
  const { "category-slug": slug } = await params;
  const fallbackCategory = categories.find(item => item.slug === slug);
  const cms = await getCmsCollection(slug);
  if (process.env.MONGODB_URI ? !cms.category : !fallbackCategory) notFound();
  const name = cms.category?.name || fallbackCategory?.name || cms.page?.title || slug;
  const description = cms.category?.description || fallbackCategory?.copy || "";
  const image = cms.category?.image || fallbackCategory?.image || "/images/hero.png";
  const fallbackItems = products.filter(product => product.category === slug);

  if (!cms.page) {
    return <><CollectionHero name={name} description={description} image={image} /><section className="py-3 md:py-20"><div className="shell"><CollectionExplorer initialProducts={cms.category ? cms.products : fallbackItems} lockedCategory={slug} /></div></section></>;
  }

  return <>{cms.page.sections.filter(section => section.visible).map(section => {
    if (section.type === "collection-hero" || section.type === "category-story") return <CollectionHero key={section.id} section={section} name={name} description={description} image={image} />;
    if (section.type === "product-grid") return <section key={section.id} className="py-3 md:py-20"><div className="shell"><p className="eyebrow text-forest">{section.subheading}</p>{section.heading && <h2 className="mb-5 font-serif text-3xl">{section.heading}</h2>}{section.description && <p className="mb-5 text-sm text-muted">{section.description}</p>}<CollectionExplorer initialProducts={cms.category ? [...cms.products, ...section.products.filter(p => !cms.products.some(item => item.id === p.id))] : fallbackItems} lockedCategory={slug} /></div></section>;
    return null;
  })}</>;
}
