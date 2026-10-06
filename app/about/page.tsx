import type { Metadata } from "next";
import Image from "@/components/store-image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Heart, Leaf, Sparkles } from "lucide-react";
import { getCmsPage, type CmsSection } from "@/lib/cms/storefront-pages";
import { ViewportVideo } from "@/components/viewport-video";

export const dynamic = "force-dynamic";

const values = [
  { icon: Heart, title: "A human touch", copy: "Small differences in texture and finish are part of what makes a handmade piece feel personal." },
  { icon: Leaf, title: "Natural character", copy: "We are drawn to warm materials, earthy colour, and objects that sit comfortably in everyday life." },
  { icon: Sparkles, title: "Quiet beauty", copy: "Useful things can also be lovely to look at, hold, and return to every day." },
];

const fallbacks: Record<string, CmsSection> = {
  "story-hero": { id: "story-hero", type: "story-hero", heading: "A little more meaning in the everyday.", subheading: "About Ammaai", description: "An appreciation for pieces that show the beauty of the hand and bring warmth to the places we call home.", media: [], button: { label: "Explore our collection", url: "/collections" }, products: [], categories: [], visible: true, order: 0 },
  "story-content": { id: "story-content", type: "story-content", heading: "Made with intention. Lived with love.", subheading: "Our point of view", description: "Ammaai began with a simple thought: the things around us can do more than fill a space. A hand worked surface, an earthy colour, or a familiar texture can make an ordinary moment feel special. This is the spirit behind the collection.", media: [], products: [], categories: [], visible: true, order: 1 },
  values: { id: "values", type: "values", heading: "Beautiful in the details.", subheading: "What matters to us", description: "", media: [], button: { label: "Explore Collection", url: "/collections" }, products: [], categories: [], visible: true, order: 2 },
};

export async function generateMetadata(): Promise<Metadata> {
  const page = await getCmsPage("story");
  return { title: page?.seoTitle || "Our Story", description: page?.seoDescription || "The Ammaai point of view: thoughtful pieces, honest texture, and handmade character." };
}

function StoryHero({ section }: { section: CmsSection }) {
  const media = section.media[0];
  return <section className="about-hero bg-ivory"><div className="shell grid gap-5 py-5 md:grid-cols-[.85fr_1.15fr] md:items-center md:gap-12 md:py-16">
    <div className="md:pr-5"><p className="eyebrow hidden text-forest md:block">{section.subheading || "About Ammaai"}</p><p className="text-[15px] font-medium md:hidden">About Us</p><h1 className="mt-5 hidden max-w-[570px] font-serif text-[clamp(4rem,6vw,7rem)] leading-[.82] tracking-tight md:block">{section.heading || "A little more meaning in the everyday."}</h1><p className="mt-7 hidden max-w-md text-[15px] leading-7 text-muted md:block">{section.description || fallbacks["story-hero"].description}</p><Link href={section.button?.url || "/collections"} className="about-hero-link mt-8 hidden w-fit items-center gap-2 border-b border-forest pb-1 text-sm font-semibold text-forest md:inline-flex">{section.button?.label || "Explore our collection"} <ArrowUpRight size={16} /></Link></div>
    <div className="about-hero-image relative aspect-[4/3] overflow-hidden rounded-lg md:aspect-[5/4] md:rounded-[26px]">{media?.type === "video" ? <ViewportVideo src={media.url} poster={media.thumbnail} className="section-cms-video absolute inset-0" /> : <Image src={media?.url || "/images/artisan.png"} alt={media?.altText || "Artisan working on embroidered textile"} fill priority sizes="(max-width: 768px) 100vw, 58vw" className="object-cover" />}<div className="absolute bottom-4 left-4 rounded-full bg-ivory/90 px-4 py-2 text-[10px] font-semibold text-forest backdrop-blur md:bottom-7 md:left-7 md:text-xs">Handmade with heart</div></div>
    <div className="md:hidden"><h1 className="font-serif text-[31px] leading-none">{section.heading || "A story in every stitch."}</h1><p className="mt-3 max-w-md text-[12px] leading-5 text-muted">{section.description || "Ammaai celebrates the texture, patience, and quiet character that make handmade pieces feel personal."}</p></div>
  </div></section>;
}

function StoryContent({ section }: { section: CmsSection }) {
  const mainMedia = section.media[0];
  const detailImages = section.media.filter(media => media.type === "image").slice(mainMedia?.type === "image" ? 1 : 0, 2);
  return <>
    <section className="bg-cream py-12 md:py-24"><div className="shell grid gap-7 md:grid-cols-[.38fr_.62fr] md:gap-16"><div><p className="eyebrow text-forest">{section.subheading || "Our point of view"}</p><div className="mt-4 h-px w-20 bg-forest/40" /></div><div><h2 className="max-w-3xl font-serif text-[37px] leading-[.98] md:text-[66px]">{section.heading || fallbacks["story-content"].heading}</h2><p className="mt-6 max-w-xl text-[12px] leading-6 text-muted md:mt-8 md:text-[15px] md:leading-8">{section.description || fallbacks["story-content"].description}</p><p className="mt-4 max-w-xl text-[12px] leading-6 text-muted md:text-[15px] md:leading-8">The collection is an invitation to take your time, notice the little details, and choose the pieces that speak to you.</p></div></div></section>
    <section className="bg-ivory py-12 md:py-24"><div className="shell grid gap-7 md:grid-cols-[1fr_1fr] md:items-center md:gap-16"><div className="about-detail-photo relative aspect-[4/4.5] overflow-hidden rounded-[18px] bg-beige md:aspect-[4/4]">{mainMedia?.type === "video" ? <ViewportVideo src={mainMedia.url} poster={mainMedia.thumbnail} className="section-cms-video absolute inset-0" /> : <Image src={mainMedia?.url || "/images/embroidered-cushion.png"} alt={mainMedia?.altText || "Close look at floral embroidery on a handmade cushion"} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />}</div><div className="md:pl-4"><p className="eyebrow text-forest">{section.subheading || "Texture tells a story"}</p><h2 className="mt-3 max-w-md font-serif text-[38px] leading-[.95] md:text-[64px]">{section.heading || "Look a little closer."}</h2><p className="mt-5 max-w-lg text-[12px] leading-6 text-muted md:mt-7 md:text-[15px] md:leading-8">{section.description || "The pleasure of handmade is often in the detail: the irregular rhythm of a stitch, a softly uneven ceramic surface, or the weight of a natural fibre."}</p><div className="mt-7 grid grid-cols-2 gap-3 md:mt-10"><div className="relative aspect-[4/3] overflow-hidden rounded-xl"><Image src={detailImages[0]?.url || "/images/painted-vase.png"} alt="" fill sizes="25vw" className="object-cover" /></div><div className="relative aspect-[4/3] overflow-hidden rounded-xl"><Image src={detailImages[1]?.url || "/images/embroidered-tote.png"} alt="" fill sizes="25vw" className="object-cover" /></div></div></div></div></section>
  </>;
}

function StoryValues({ section }: { section: CmsSection }) {
  return <>
    <section className="bg-beige py-12 md:py-24"><div className="shell"><div className="mb-7 flex items-end justify-between md:mb-12"><div><p className="eyebrow text-forest">{section.subheading || "What matters to us"}</p><h2 className="mt-2 font-serif text-[37px] leading-none md:text-[60px]">{section.heading || "Beautiful in the details."}</h2></div><span className="hidden font-serif text-[60px] leading-none text-forest/20 md:block">01 — 03</span></div><div className="grid gap-3 md:grid-cols-3 md:gap-5">{(section.items ?? values.map(item => ({ title: item.title, description: item.copy }))).map((item, index) => { const { title, description: copy } = item; const Icon = values[index % values.length].icon; return <article key={title} className="about-value-card group relative overflow-hidden rounded-[18px] bg-ivory p-6 md:min-h-[310px] md:p-8"><div className="flex items-start justify-between"><span className="grid h-12 w-12 place-items-center rounded-full bg-beige text-forest md:h-14 md:w-14"><Icon size={24} strokeWidth={1.4} /></span><span className="font-serif text-2xl text-forest/35">0{index + 1}</span></div><div className="mt-9 md:mt-20"><h3 className="font-serif text-[27px] leading-none md:text-[34px]">{title}</h3><p className="mt-3 max-w-xs text-[12px] leading-6 text-muted md:text-sm">{copy}</p></div></article>; })}</div></div></section>
    <section className="about-finale relative overflow-hidden bg-deep py-16 text-center text-white md:py-28"><div className="shell relative z-10"><p className="eyebrow text-[#d7c9a7]">Carry the feeling home</p><h2 className="mx-auto mt-4 max-w-4xl font-serif text-[44px] leading-[.9] md:text-[82px]">{section.description || "Find a piece that feels like you."}</h2><p className="mx-auto mt-5 max-w-md text-[12px] leading-6 text-white/70 md:text-sm">Explore handmade favourites, save what you love, and ask us about the details.</p><Link href={section.button?.url || "/collections"} className="about-finale-cta mt-7 inline-flex items-center gap-2 rounded-full px-6 py-3 text-[12px] font-semibold md:mt-9 md:px-8 md:py-4 md:text-sm">{section.button?.label || "Explore Collection"} <ArrowRight size={17} /></Link></div></section>
  </>;
}

export default async function AboutPage() {
  const page = await getCmsPage("story");
  const sections = page ? page.sections.filter(section => section.visible) : Object.values(fallbacks);
  return <>{sections.map(section => {
    if (section.type === "story-hero") return <StoryHero key={section.id} section={section} />;
    if (section.type === "story-content") return <StoryContent key={section.id} section={section} />;
    if (section.type === "values") return <StoryValues key={section.id} section={section} />;
    return null;
  })}</>;
}
