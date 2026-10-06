import Image from "@/components/store-image";
import Link from "next/link";
import { ArrowRight, Sprout } from "lucide-react";
import { getHomepageContent, type HomeSection } from "@/lib/cms/homepage";
import { ProductGrid } from "@/components/product-card";
import { Reveal } from "@/components/reveal";
import { MadeInMotion } from "@/components/made-in-motion";
import { homeFaqs } from "@/lib/cms/default-content";
import { ViewportVideo } from "@/components/viewport-video";
import { TextRoll } from "@/components/core/text-roll";

export const dynamic = "force-dynamic";


function text(value: string, fallback: string) { return value.trim() || fallback; }

function HeroSection({ section }: { section: HomeSection }) {
  const media = section.media[0];
  const heading = text(section.heading, "Handcrafted\nTreasures");
  return <Reveal><section className="home-hero relative overflow-hidden bg-beige">
    {media?.type === "video" ? <ViewportVideo src={media.url} poster={media.thumbnail} className="home-hero-cms-video absolute inset-0" /> : <Image src={media?.url || "/images/hero.png"} alt={media?.altText || "Embroidered cushion, jute bag and ceramic vase in a warm handmade home"} fill priority sizes="100vw" className="object-cover" />}
    <div className="home-hero-shade absolute inset-0" />
    <div className="hero-floating-seal hidden md:flex" aria-hidden="true"><Sprout size={20} strokeWidth={1.3} /><span>Made<br />with care</span></div>
    <div className="shell relative flex h-full items-center"><div className="home-hero-copy max-w-[540px] text-ink">
      <p className="hidden text-[11px] font-semibold uppercase tracking-[.21em] text-forest md:block">{text(section.subheading, "Handmade with heart")}</p>
      <h1 className="whitespace-pre-line font-serif font-medium leading-[.9] tracking-[-.045em]">{heading.split(/(treasures?)/i).map((part, index) => /^treasures?$/i.test(part) ? <TextRoll key={index}>{part}</TextRoll> : part)}</h1>
      <p className="mt-3 max-w-xs text-[12px] leading-[1.45] md:mt-6 md:max-w-md md:text-[16px] md:leading-7">{text(section.description, "Artisanal products for a more mindful home.")}</p>
      <Link href={section.button?.url || "/collections"} className="home-hero-cta mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[11px] font-semibold shadow-sm transition md:mt-8 md:px-7 md:py-4 md:text-[13px]">{section.button?.label || "Explore Collection"} <ArrowRight size={14} /></Link>
    </div></div>
  </section></Reveal>;
}

function FeaturedSection({ section }: { section: HomeSection }) {
  if (!section.products.length) return null;
  return <Reveal><section className="shell py-7 md:py-24"><div className="mb-4 flex items-end justify-between md:mb-10"><div><p className="eyebrow hidden text-forest md:block">{text(section.subheading, "A considered edit")}</p><h2 className="font-sans text-[15px] font-semibold md:mt-2 md:font-serif md:text-5xl md:font-medium">{text(section.heading, "Featured Collection")}</h2></div><Link href={section.button?.url || "/collections"} className="flex items-center gap-1 text-[11px] text-muted md:text-sm">{section.button?.label || "View All"} <ArrowRight size={13} /></Link></div><ProductGrid items={section.products} /></section></Reveal>;
}

function CategoriesSection({ section }: { section: HomeSection }) {
  if (!section.categories.length) return null;
  return <>
    <Reveal><section className="mobile-category-strip shell py-4 md:hidden" aria-label="Shop categories"><div className="grid grid-cols-4 gap-2">{section.categories.map(category => <Link key={category.slug} href={`/collections/${category.slug}`} className="min-w-0 text-center"><span className="relative mx-auto block h-[62px] w-[62px] overflow-hidden rounded-full bg-beige"><Image src={category.image} alt="" fill sizes="62px" className="object-cover" /></span><span className="mt-2 block truncate text-[10px] font-medium">{category.name}</span></Link>)}</div></section></Reveal>
    <Reveal><section className="hidden bg-ivory py-20 md:block"><div className="shell"><div className="mb-9 flex items-end justify-between"><div><p className="eyebrow text-forest">{text(section.subheading, "Explore by category")}</p><h2 className="mt-2 font-serif text-5xl">{text(section.heading, "Find your kind of beautiful.")}</h2></div><Link href={section.button?.url || "/collections"} className="text-sm font-semibold">{section.button?.label || "Explore all"} <ArrowRight size={15} className="inline" /></Link></div><div className="grid grid-cols-4 gap-5">{section.categories.map(category => <Link href={`/collections/${category.slug}`} key={category.slug} className="group"><div className="relative aspect-[4/5] overflow-hidden rounded-[14px] bg-beige"><Image src={category.image} alt={category.name} fill sizes="25vw" className="object-cover transition duration-500 group-hover:scale-105" /></div><div className="mt-4 flex justify-between"><span className="font-serif text-[27px]">{category.name}</span><ArrowRight size={19} /></div></Link>)}</div></div></section></Reveal>
  </>;
}

function StorySection({ section }: { section: HomeSection }) {
  const media = section.media[0];
  return <Reveal><section className="shell grid gap-6 py-12 md:grid-cols-2 md:items-center md:gap-16 md:py-28"><div className="relative aspect-[4/3] overflow-hidden rounded-xl md:aspect-[5/4]">{media?.type === "video" ? <ViewportVideo src={media.url} poster={media.thumbnail} className="section-cms-video absolute inset-0" /> : <Image src={media?.url || "/images/artisan.png"} alt={media?.altText || "Artisan working on hand embroidery"} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />}</div><div><p className="eyebrow text-forest">{text(section.subheading, "Our story")}</p><h2 className="mt-3 font-serif text-[33px] leading-none md:text-[61px]">{text(section.heading, "A human touch you can feel.")}</h2><p className="mt-4 max-w-md text-[12px] leading-5 text-muted md:mt-7 md:text-[15px] md:leading-7">{text(section.description, "Ammaai began with a simple belief: what we bring into our homes should carry a story.")}</p><Link href={section.button?.url || "/about"} className="mt-5 inline-flex items-center gap-2 border-b border-ink pb-1 text-[12px] font-semibold md:mt-8 md:text-sm">{section.button?.label || "Discover our story"} <ArrowRight size={14} /></Link></div></section></Reveal>;
}

function ExperienceSection({ section }: { section: HomeSection }) {
  const defaults = [
    { title: "Thoughtful details", copy: "Explore materials, dimensions, and the story behind every piece.", image: "/images/embroidered-tote.png", href: "/collections", action: "Discover pieces", span: "md:col-span-5" },
    { title: "Easy enquiries", copy: "A conversation is just one tap away when you want to know more.", image: "/images/artisan.png", href: "/contact", action: "Get in touch", span: "md:col-span-3" },
    { title: "Saved favourites", copy: "Keep the pieces you love close and return whenever you’re ready.", image: "/images/painted-vase.png", href: "/wishlist", action: "View wishlist", span: "md:col-span-4" },
  ];
  return <Reveal><section className="experience-section bg-deep py-12 text-white md:py-24"><div className="shell"><div className="mb-6 flex flex-col gap-2 md:mb-10 md:flex-row md:items-end md:justify-between"><div><p className="eyebrow text-[#d7c9a7]">{text(section.subheading, "The Ammaai experience")}</p><h2 className="mt-2 max-w-xl font-serif text-[35px] leading-[.95] md:text-[59px]">{text(section.heading, "The little things make it personal.")}</h2></div><p className="max-w-xs text-[12px] leading-5 text-white/65 md:text-sm md:leading-6">{text(section.description, "A simple way to explore, save, and ask about pieces you love.")}</p></div><div className="experience-grid grid gap-3 md:grid-cols-12 md:gap-5">{(section.items ?? []).map((card, index) => { const item = { ...defaults[index % defaults.length], title: card.title, copy: card.description, href: card.url || "/collections", action: card.label || "Learn more" }; const media = section.media[index]; return <Link key={item.title} href={item.href} className={`experience-card group relative flex min-h-[240px] flex-col justify-between overflow-hidden rounded-[18px] p-5 md:min-h-[350px] md:p-7 ${item.span}`}>{media?.type === "video" ? <ViewportVideo src={media.url} poster={media.thumbnail} className="section-cms-video experience-card-image absolute inset-0" /> : <Image src={media?.url || item.image} alt="" fill sizes="(max-width: 768px) 100vw, 40vw" className="experience-card-image object-cover" />}<span className="experience-card-shade absolute inset-0" /><span className="relative flex items-start justify-between"><span className="font-serif text-[25px] text-white/90">0{index + 1}</span><ArrowRight size={18} className="transition-transform duration-300 group-hover:-rotate-45" /></span><span className="relative block"><span className="block font-serif text-[29px] leading-none md:text-[37px]">{item.title}</span><span className="mt-2 block max-w-[250px] text-[12px] leading-5 text-white/80 md:text-[13px]">{item.copy}</span><span className="mt-4 inline-block border-b border-white/70 pb-1 text-[11px] font-semibold">{item.action}</span></span></Link>; })}</div></div></section></Reveal>;
}

function FaqSection({ section }: { section: HomeSection }) {
  return <Reveal><section id="faq" className="shell py-10 md:py-20"><div className="mx-auto max-w-3xl"><p className="eyebrow text-forest">{text(section.subheading, "A few helpful details")}</p><h2 className="mt-2 font-serif text-3xl md:text-5xl">{text(section.heading, "Frequently asked questions")}</h2>{section.description && <p className="mt-3 text-sm text-muted">{section.description}</p>}<div className="mt-5 divide-y divide-line border-y border-line md:mt-8">{(section.faqs ?? homeFaqs).map(({ question, answer }) => <details key={question} className="faq-item group py-3 md:py-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[12px] font-semibold md:text-sm"><span>{question}</span><span className="faq-plus text-lg font-normal text-forest">+</span></summary><p className="faq-answer max-w-2xl text-[12px] leading-5 text-muted md:text-sm md:leading-6">{answer}</p></details>)}</div></div></section></Reveal>;
}

export default async function Home() {
  const content = await getHomepageContent();
  return <>{content.sections.filter(section => section.visible).sort((a, b) => a.order - b.order).map(section => {
    if (section.type === "hero") return <HeroSection key={section.id} section={section} />;
    if (section.type === "featured-products") return <FeaturedSection key={section.id} section={section} />;
    if (section.type === "category-grid") return <CategoriesSection key={section.id} section={section} />;
    if (section.type === "made-in-motion") return <Reveal key={section.id}><section className="made-in-motion shell py-12 md:py-24"><div className="mb-6 md:mb-10"><p className="eyebrow text-forest">{text(section.subheading, "See the craft in motion")}</p><h2 className="mt-2 font-serif text-[36px] leading-none md:text-5xl">{text(section.heading, "Made in Motion")}</h2><p className="mt-3 max-w-xl text-[12px] leading-5 text-muted md:text-sm">{text(section.description, "A closer look at the pieces, textures, and details made by hand.")}</p></div><MadeInMotion items={section.reels ?? content.reels} /></section></Reveal>;
    if (section.type === "story") return <StorySection key={section.id} section={section} />;
    if (section.type === "experience") return <ExperienceSection key={section.id} section={section} />;
    if (section.type === "cta" && (section.heading || section.description)) return <Reveal key={section.id}><section className="about-finale relative overflow-hidden py-14 text-center text-white md:py-24"><div className="shell relative"><p className="eyebrow text-[#d7c9a7]">{section.subheading}</p><h2 className="mx-auto mt-3 max-w-3xl font-serif text-[38px] leading-none md:text-6xl">{section.heading}</h2><p className="mx-auto mt-4 max-w-xl text-sm text-white/70">{section.description}</p>{section.button && <Link href={section.button.url} className="about-finale-cta mt-7 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold">{section.button.label}<ArrowRight size={15} /></Link>}</div></section></Reveal>;
    if (section.type === "faq") return <FaqSection key={section.id} section={section} />;
    return null;
  })}</>;
}
