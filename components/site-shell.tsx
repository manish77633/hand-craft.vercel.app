"use client";

import { usePathname } from "next/navigation";
import { WishlistProvider } from "@/components/wishlist-provider";
import { StoreSettingsProvider } from "./store-settings-provider";
import type { StoreSettings } from "@/lib/cms/site-settings";

type SiteShellProps = {
  settings: StoreSettings;
  children: React.ReactNode;
  effects: React.ReactNode;
  header: React.ReactNode;
  footer: React.ReactNode;
  mobileNavigation: React.ReactNode;
};

export function SiteShell({ children, effects, header, footer, mobileNavigation, settings }: SiteShellProps) {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return <main>{children}</main>;
  }

  return (
    <StoreSettingsProvider value={settings}><WishlistProvider>
      {effects}
      {header}
      <main>{children}</main>
      {footer}
      {mobileNavigation}
    </WishlistProvider></StoreSettingsProvider>
  );
}
