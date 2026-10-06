"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  FolderTree,
  Home,
  Image as ImageIcon,
  LayoutDashboard,
  PanelsTopLeft,
  Settings,
} from "lucide-react";
import styles from "@/app/admin/admin.module.css";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/media", label: "Media Library", icon: ImageIcon },
  { href: "/admin/products", label: "Products", icon: Boxes },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/pages", label: "Pages", icon: PanelsTopLeft },
  { href: "/admin/homepage", label: "Homepage", icon: Home },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminNavigation() {
  const pathname = usePathname();

  return (
    <nav className={styles.navigation} aria-label="Admin navigation">
      {links.map(({ href, label, icon: Icon }) => {
        const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`${styles.navLink} ${active ? styles.navLinkActive : ""}`}
          >
            <Icon size={18} strokeWidth={1.8} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
