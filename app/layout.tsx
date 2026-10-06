import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";
import { SiteShell } from "@/components/site-shell";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MobileNav } from "@/components/mobile-nav";
import { SiteEffects } from "@/components/site-effects";
import { getStoreSettings, getStoreCategories } from "@/lib/cms/site-settings";
import { siteUrl } from "@/lib/site-url";

const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-serif", display: "swap" });
const sans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-sans", display: "swap" });
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettings();
  return {
  metadataBase: new URL(siteUrl),
  title: { default: settings.seoTitle, template: "%s | Ammaai" },
  description: settings.seoDescription,
  icons: { icon: "/images/ammaai-logo.webp", apple: "/images/ammaai-logo.webp" },
  openGraph: { title: "Ammaai — Handmade with Heart", description: "Thoughtfully crafted pieces with warmth and character.", images: ["/images/hero.png"] },
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [settings, categories] = await Promise.all([getStoreSettings(), getStoreCategories()]);
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`${serif.variable} ${sans.variable} font-sans antialiased`}>
        <SiteShell
          settings={settings}
          effects={<SiteEffects />}
          header={<SiteHeader categories={categories} />}
          footer={<SiteFooter settings={settings} categories={categories} />}
          mobileNavigation={<MobileNav />}
        >
          {children}
        </SiteShell>
      </body>
    </html>
  );
}
