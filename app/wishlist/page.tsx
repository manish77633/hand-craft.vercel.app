import type { Metadata } from "next";
import { WishlistPage } from "@/components/wishlist-page";
import { products } from "@/lib/products";

export const metadata: Metadata = { title: "Wishlist" };
export default function Page() { return <section className="min-h-[65vh] py-6 md:py-24"><div className="shell"><div className="mb-5 md:mb-10"><p className="eyebrow hidden text-forest md:block">Saved for later</p><h1 className="text-[16px] font-medium md:mt-3 md:font-serif md:text-7xl">My Wishlist</h1></div><WishlistPage products={products} /></div></section>; }
