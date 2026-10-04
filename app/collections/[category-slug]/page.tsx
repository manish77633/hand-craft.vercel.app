import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { categories, products } from "@/lib/products";
import { CollectionExplorer } from "@/components/collection-explorer";

type Props = { params: Promise<{ "category-slug": string }> };

export async function generateStaticParams() { return categories.map((category) => ({ "category-slug": category.slug })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { "category-slug": slug } = await params;
  const category = categories.find((item) => item.slug === slug);
  return category ? { title: category.name, description: category.copy } : {};
}

export default async function CategoryPage({ params }: Props) {
  const { "category-slug": slug } = await params;
  const category = categories.find((item) => item.slug === slug);
  if (!category) notFound();
  const items = products.filter((product) => product.category === slug);
  return <><section className="bg-ivory"><div className="shell grid items-center gap-8 py-5 md:grid-cols-2 md:py-16"><div><p className="eyebrow hidden text-forest md:block">Shop by category</p><h1 className="text-[16px] font-medium md:mt-4 md:font-serif md:text-8xl">{category.name}</h1><p className="mt-5 hidden max-w-md text-sm leading-7 text-muted md:block">{category.copy}</p></div><div className="relative hidden aspect-[16/9] overflow-hidden rounded-[24px] md:block"><Image src={category.image} alt={category.name} fill priority sizes="50vw" className="object-cover" /></div></div></section><section className="py-3 md:py-20"><div className="shell"><CollectionExplorer initialProducts={items} lockedCategory={slug} /></div></section></>;
}
