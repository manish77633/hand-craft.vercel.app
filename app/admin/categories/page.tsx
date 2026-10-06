import { CategoryManager } from "@/components/admin/category-manager";
import styles from "../admin.module.css";

export default function CategoriesAdminPage() {
  return <div className={styles.adminPage}><div className={styles.pageHeading}><div><p className={styles.kicker}>Catalogue</p><h1>Categories</h1><p>Manage category content, ordering, visibility, and imagery.</p></div></div><CategoryManager /></div>;
}
