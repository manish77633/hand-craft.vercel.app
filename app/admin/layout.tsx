import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { AdminNavigation } from "@/components/admin/admin-navigation";
import styles from "./admin.module.css";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.adminRoot}>
      <aside className={styles.sidebar}>
        <Link href="/admin" className={styles.adminBrand}>
          <span><BrandLogo tone="dark" /><small>Content manager</small></span>
        </Link>
        <AdminNavigation />
        <Link href="/" className={styles.viewSite} target="_blank">
          View website <ExternalLink size={14} />
        </Link>
      </aside>
      <div className={styles.adminWorkspace}>
        <header className={styles.mobileHeader}>
          <Link href="/admin" className={styles.mobileBrand}>Ammaai Admin</Link>
          <Link href="/" target="_blank" aria-label="View website"><ExternalLink size={17} /></Link>
        </header>
        <div className={styles.mobileNavigation}><AdminNavigation /></div>
        {children}
      </div>
    </div>
  );
}
