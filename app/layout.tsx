import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MobileNav } from "@/components/mobile-nav";
import { WishlistProvider } from "@/components/wishlist-provider";

const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-serif", display: "swap" });
const sans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://meerahini.example"),
  title: { default: "MeeraHini — Handmade with Heart", template: "%s | MeeraHini" },
  description: "Thoughtfully crafted handmade bags, decor, textiles and jewellery for a warmer everyday.",
  openGraph: { title: "MeeraHini — Handmade with Heart", description: "Thoughtfully crafted pieces with warmth and character.", images: ["/images/hero.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${serif.variable} ${sans.variable} font-sans antialiased`}>
        <WishlistProvider><SiteHeader /><main>{children}</main><SiteFooter /><MobileNav /></WishlistProvider>
      </body>
    </html>
  );
}
