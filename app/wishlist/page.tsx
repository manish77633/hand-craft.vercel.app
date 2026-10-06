import type { Metadata } from "next";
import { WishlistPage } from "@/components/wishlist-page";
import { getCatalogue } from "@/lib/cms/products";
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Wishlist" };
export default async function Page() { const { products } = await getCatalogue(true); return <section className="min-h-[65vh] py-6 md:py-24"><div className="shell"><div className="mb-5 md:mb-10"><p className="eyebrow hidden text-forest md:block">Saved for later</p><h1 className="text-[16px] font-medium md:mt-3 md:font-serif md:text-7xl">My Wishlist</h1></div><WishlistPage products={products} /></div></section>; }
