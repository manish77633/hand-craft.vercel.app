import Link from "next/link";
import { ArrowRight, Boxes, FolderTree, Image as ImageIcon, PanelsTopLeft } from "lucide-react";
import styles from "./admin.module.css";

const cards = [
  { href: "/admin/media", title: "Media Library", copy: "Upload and reuse images or videos.", icon: ImageIcon },
  { href: "/admin/products", title: "Products", copy: "Manage catalogue details and ordered media.", icon: Boxes },
  { href: "/admin/categories", title: "Categories", copy: "Manage category content and visibility.", icon: FolderTree },
  { href: "/admin/pages", title: "Pages", copy: "Edit content inside predefined page sections.", icon: PanelsTopLeft },
];

export default function AdminDashboard() {
  return (
    <div className={styles.adminPage}>
      <div className={styles.pageHeading}>
        <div><p className={styles.kicker}>Content manager</p><h1>Dashboard</h1></div>
      </div>
      <div className={styles.dashboardGrid}>
        {cards.map(({ href, title, copy, icon: Icon }) => (
          <Link key={href} href={href} className={styles.dashboardCard}>
            <span className={styles.dashboardIcon}><Icon size={22} /></span>
            <h2>{title}</h2><p>{copy}</p>
            <span className={styles.cardAction}>Open <ArrowRight size={15} /></span>
          </Link>
        ))}
      </div>
      <section className={styles.phaseNote}>
        <strong>Storefront content</strong>
        <p>Manage products, categories, homepage sections, FAQs, content cards and media. Use Settings for the logo, WhatsApp number, contact details and footer.</p>
      </section>
    </div>
  );
}
