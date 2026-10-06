import type { Metadata } from "next";
import Image from "@/components/store-image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Heart, MapPin, MessageCircle, PackageSearch, PenLine } from "lucide-react";
import { whatsappUrl } from "@/lib/whatsapp";
import { getCmsPage, type CmsSection } from "@/lib/cms/storefront-pages";
import { ContactForm } from "@/components/contact-form";
import { getStoreSettings, type StoreSettings } from "@/lib/cms/site-settings";
import { contactFaqs } from "@/lib/cms/default-content";
import { ViewportVideo } from "@/components/viewport-video";

export const dynamic = "force-dynamic";

const topics = [
  { icon: PackageSearch, title: "A product caught your eye?", copy: "Ask about a piece, its details, or availability before deciding.", href: "/collections", action: "Browse pieces", external: false },
  { icon: PenLine, title: "A custom idea in mind?", copy: "Tell us what you are imagining and start a conversation.", href: whatsappUrl("Hi Ammaai! I'd like to discuss a custom request."), action: "Start a chat", external: true },
  { icon: Heart, title: "Need a little guidance?", copy: "We can help you compare pieces and find one that feels right.", href: whatsappUrl("Hi Ammaai! Could you help me choose a handmade piece?"), action: "Ask us", external: true },
];


const experienceFallbacks: CmsSection[] = [
  { id: "experience-hero", type: "experience-hero", heading: "Let’s make it personal.", subheading: "Contact Ammaai", description: "Have a question about a handmade piece? Tell us what you have in mind. We’re happy to help you find the right details.", media: [], button: { label: "Chat on WhatsApp", url: whatsappUrl("Hi Ammaai! I'd like to know more about your handmade collection.") }, products: [], categories: [], visible: true, order: 0 },
  { id: "experience-features", type: "experience-features", heading: "Every question is welcome.", subheading: "How can we help?", description: "", media: [], products: [], categories: [], visible: true, order: 1 },
  { id: "experience-cta", type: "experience-cta", heading: "Tell us what you’re looking for.", subheading: "Write to us", description: "Share the details here and continue the conversation in WhatsApp. Your message stays in your hands until you press send.", media: [], products: [], categories: [], visible: true, order: 2 },
];

const faqFallback: CmsSection = { id: "faq-list", type: "faq-list", heading: "Good to know.", subheading: "Before we chat", description: "", media: [], products: [], categories: [], visible: true, order: 0 };

export async function generateMetadata(): Promise<Metadata> {
  const page = await getCmsPage("experience");
  return { title: page?.seoTitle || "Contact Us", description: page?.seoDescription || "Ask Ammaai about handmade products, availability, care, and custom requests." };
}

function ExperienceHero({ section, settings }: { section: CmsSection; settings: StoreSettings }) {
  const media = section.media[0];
  return <section className="contact-hero relative isolate overflow-hidden bg-deep text-white">{media ? <div className="absolute inset-0 opacity-30">{media.type === "video" ? <ViewportVideo src={media.url} poster={media.thumbnail} className="section-cms-video absolute inset-0" /> : <Image src={media.url} alt="" fill sizes="100vw" className="object-cover" />}</div> : <div className="contact-hero-flower pointer-events-none absolute -right-20 -top-10 hidden h-[480px] w-[700px] opacity-30 md:block"><Image src="/images/footer-botanical.png" alt="" fill sizes="700px" className="object-contain" /></div>}<div className="shell relative z-10 grid gap-8 py-12 md:grid-cols-[.55fr_.45fr] md:items-end md:gap-16 md:py-24"><div><p className="eyebrow text-[#d7c9a7]">{section.subheading || "Contact Ammaai"}</p><h1 className="mt-4 max-w-3xl font-serif text-[55px] leading-[.84] tracking-tight md:text-[clamp(5rem,8vw,9rem)]">{section.heading || "Let’s make it personal."}</h1></div><div className="max-w-md md:pb-3"><p className="text-[13px] leading-6 text-white/75 md:text-[16px] md:leading-8">{section.description || experienceFallbacks[0].description}</p><a href={settings.whatsapp ? whatsappUrl("Hi Ammaai! I'd like to know more about your handmade collection.", settings.whatsapp) : "/contact#contact-form"} target={settings.whatsapp ? "_blank" : undefined} rel="noreferrer" className="contact-hero-cta mt-6 inline-flex items-center gap-3 rounded-full px-6 py-3 text-xs font-semibold md:mt-8 md:px-8 md:py-4 md:text-sm"><MessageCircle size={18} /> {settings.whatsapp ? section.button?.label || "Chat on WhatsApp" : "Get in touch"} <ArrowUpRight size={16} /></a></div></div></section>;
}

function ExperienceFeatures({ section }: { section: CmsSection }) {
  const linked = [
    ...section.products.map(product => ({ title: product.name, copy: product.description, href: `/products/${product.slug}`, action: "View product" })),
    ...section.categories.map(category => ({ title: category.name, copy: category.description, href: `/collections/${category.slug}`, action: "Explore category" })),
  ];
  const cards = linked.length ? linked.slice(0, 3).map((item, index) => ({ ...item, icon: topics[index % topics.length].icon, external: false })) : (section.items ?? []).map((item, index) => ({ title: item.title, copy: item.description, href: item.url || "/contact", action: item.label || "Learn more", icon: topics[index % topics.length].icon, external: Boolean(item.url?.startsWith("https://")) }));
  return <section className="bg-cream py-12 md:py-24"><div className="shell"><div className="mb-6 md:mb-10"><p className="eyebrow text-forest">{section.subheading || "How can we help?"}</p><h2 className="mt-2 font-serif text-[38px] leading-none md:text-[60px]">{section.heading || "Every question is welcome."}</h2>{section.description && <p className="mt-3 max-w-xl text-sm text-muted">{section.description}</p>}</div><div className="grid gap-3 md:grid-cols-3 md:gap-5">{cards.map(({ icon: Icon, title, copy, href, action, external }) => <article key={title} className="contact-topic-card group flex min-h-[220px] flex-col justify-between rounded-[18px] border border-line bg-ivory p-6 md:min-h-[300px] md:p-8"><div className="flex items-start justify-between"><span className="grid h-12 w-12 place-items-center rounded-full bg-beige text-forest"><Icon size={22} strokeWidth={1.5} /></span><ArrowUpRight size={20} className="text-forest transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" /></div><div><h3 className="max-w-xs font-serif text-[27px] leading-none md:text-[32px]">{title}</h3><p className="mt-3 max-w-xs text-[12px] leading-5 text-muted md:text-sm md:leading-6">{copy}</p><Link href={href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined} className="mt-5 inline-flex items-center gap-2 border-b border-forest pb-1 text-xs font-semibold text-forest">{action} <ArrowRight size={14} /></Link></div></article>)}</div></div></section>;
}

function ExperienceCta({ section, settings }: { section: CmsSection; settings: StoreSettings }) {
  const media = section.media[0];
  return <>
    <section className="bg-ivory py-12 md:py-24"><div className="shell grid gap-10 md:grid-cols-[.9fr_1.1fr] md:items-start md:gap-20"><div className="contact-form-intro md:sticky md:top-24"><p className="eyebrow text-forest">{section.subheading || "Write to us"}</p><h2 className="mt-3 max-w-md font-serif text-[43px] leading-[.95] md:text-[70px]">{section.heading || "Tell us what you’re looking for."}</h2><p className="mt-5 max-w-sm text-[12px] leading-6 text-muted md:mt-7 md:text-sm md:leading-7">{section.description || experienceFallbacks[2].description}</p><div className="contact-form-photo relative mt-7 hidden aspect-[4/2.5] max-w-md overflow-hidden rounded-[18px] md:block">{media?.type === "video" ? <ViewportVideo src={media.url} poster={media.thumbnail} className="section-cms-video absolute inset-0" /> : <Image src={media?.url || "/images/painted-vase.png"} alt="" fill sizes="35vw" className="object-cover" />}</div></div><div className="rounded-[20px] border border-line bg-cream p-5 shadow-soft md:rounded-[28px] md:p-10"><div className="mb-7"><p className="eyebrow text-forest">A note for us</p><h3 className="mt-2 font-serif text-[32px] md:text-[42px]">Start a conversation</h3></div><ContactForm /></div></div></section>
    <section className="bg-beige py-12 md:py-24"><div className="shell grid gap-7 md:grid-cols-[.8fr_1.2fr] md:items-center md:gap-16"><div><p className="eyebrow text-forest">Find us</p><h2 className="mt-3 max-w-md font-serif text-[42px] leading-none md:text-[64px]">A place for the pieces to begin.</h2><p className="mt-5 max-w-md text-[12px] leading-6 text-muted md:text-sm md:leading-7">{settings.contact.address || "Contact us for studio and collection details."}</p><div className="mt-6 flex items-center gap-3 rounded-xl border border-forest/15 bg-ivory p-4 text-[12px] text-forest md:mt-8"><MapPin size={20} /><span>{settings.contact.address || "Studio details available on request"}</span></div></div><div className="map-frame relative overflow-hidden rounded-[20px] border border-line bg-[#d9dfcf] shadow-soft"><iframe title="General map of India; Ammaai studio location not yet confirmed" src="https://www.openstreetmap.org/export/embed.html?bbox=68.0%2C6.0%2C98.0%2C36.0&layer=mapnik" loading="lazy" referrerPolicy="no-referrer" className="absolute inset-0 h-full w-full border-0" /><span className="absolute bottom-3 left-3 rounded-full bg-ivory/95 px-3 py-1.5 text-[10px] font-semibold text-forest shadow-sm">General map preview · no studio pin</span></div></div></section>
  </>;
}

function FaqSection({ section }: { section: CmsSection }) {
  return <section id="faq" className="bg-ivory py-12 md:py-20"><div className="shell grid gap-7 md:grid-cols-[.45fr_.55fr] md:gap-16"><div><p className="eyebrow text-forest">{section.subheading || "Before we chat"}</p><h2 className="mt-2 font-serif text-[38px] leading-none md:text-[58px]">{section.heading || "Good to know."}</h2>{section.description && <p className="mt-4 text-sm leading-6 text-muted">{section.description}</p>}</div><div className="divide-y divide-line border-y border-line">{(section.faqs ?? contactFaqs).map(({ question, answer }) => <details key={question} className="faq-item py-4 md:py-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[12px] font-semibold md:text-sm"><span>{question}</span><span className="faq-plus text-lg font-normal text-forest">+</span></summary><p className="faq-answer max-w-xl text-[12px] leading-6 text-muted md:text-sm">{answer}</p></details>)}</div></div></section>;
}

export default async function ContactPage() {
  const [experiencePage, faqPage, settings] = await Promise.all([getCmsPage("experience"), getCmsPage("faq"), getStoreSettings()]);
  const experienceSections = experiencePage ? experiencePage.sections.filter(section => section.visible) : experienceFallbacks;
  const faqSections = faqPage ? faqPage.sections.filter(section => section.visible) : [faqFallback];
  const faqList = faqSections.find(section => section.type === "faq-list");
  const faqHero = faqSections.find(section => section.type === "faq-hero");
  const mergedFaq = faqList ? { ...faqList, heading: faqHero?.heading || faqList.heading, subheading: faqHero?.subheading || faqList.subheading, description: faqHero?.description || faqList.description } : null;
  return <>{experienceSections.map(section => {
    if (section.type === "experience-hero") return <ExperienceHero key={section.id} section={section} settings={settings} />;
    if (section.type === "experience-features") return <ExperienceFeatures key={section.id} section={section} />;
    if (section.type === "experience-cta") return <ExperienceCta key={section.id} section={section} settings={settings} />;
    return null;
  })}{mergedFaq && <FaqSection section={mergedFaq} />}</>;
}
