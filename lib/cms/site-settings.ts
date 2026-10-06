import { cache } from "react";
import { connectToDatabase } from "@/lib/mongodb";
import SiteSettings from "@/models/SiteSettings";
import Footer from "@/models/Footer";
import "@/models/Media";
import Category from "@/models/Category";
import { categories as fallbackCategories } from "@/lib/products";

export const getStoreCategories = cache(async (): Promise<Array<{ name: string; slug: string }>> => {
  if (!process.env.MONGODB_URI) return fallbackCategories.map(c => ({ name: c.name, slug: c.slug }));
  try { await connectToDatabase(); const categories = await Category.find({ active: true }).sort("order name").select("name slug").lean(); return categories.map(c => ({ name: String(c.name), slug: String(c.slug) })); }
  catch (error) { console.error("Could not load category navigation", error); return []; }
});

export type StoreSettings = { logo: string; whatsapp: string; contact: { email: string; phone: string; address: string }; socialLinks: Array<{ platform: string; url: string }>; seoTitle: string; seoDescription: string; footerDescription: string; copyright: string; footerLinks: Array<{ label: string; url: string }> };
export const defaultSettings: StoreSettings = { logo: "/images/ammaai-logo.webp", whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "", contact: { email: "", phone: "", address: "" }, socialLinks: [], seoTitle: "Ammaai — Handmade with Heart", seoDescription: "Thoughtfully crafted handmade bags, decor, textiles and jewellery for a warmer everyday.", footerDescription: "Thoughtfully made pieces with warmth, character, and a little more meaning for everyday living.", copyright: "Ammaai", footerLinks: [] };
export const getStoreSettings = cache(async (): Promise<StoreSettings> => {
  if (!process.env.MONGODB_URI) return defaultSettings;
  try {
    await connectToDatabase();
    const [settings, footer] = await Promise.all([SiteSettings.findOne({ key: "global" }).populate("logo").lean(), Footer.findOne({ key: "global" }).lean()]);
    return { ...defaultSettings, logo: settings?.logo?.cloudinaryUrl || defaultSettings.logo, whatsapp: settings?.whatsapp || defaultSettings.whatsapp, contact: { ...defaultSettings.contact, ...settings?.contact }, socialLinks: settings?.socialLinks ?? [], seoTitle: settings?.defaultSeo?.title || defaultSettings.seoTitle, seoDescription: settings?.defaultSeo?.description || defaultSettings.seoDescription, footerDescription: footer?.description || defaultSettings.footerDescription, copyright: footer?.copyright || defaultSettings.copyright, footerLinks: (footer?.links ?? []).map((item: { label: string; url: string }) => ({ label: item.label, url: item.url })) };
  } catch (error) { console.error("Could not load site settings", error); return defaultSettings; }
});
