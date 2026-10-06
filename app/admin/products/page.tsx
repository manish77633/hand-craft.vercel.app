import { ProductManager } from "@/components/admin/product-manager";
import styles from "../admin.module.css";

export default function ProductsAdminPage() {
  return <div className={styles.adminPage}><div className={styles.pageHeading}><div><p className={styles.kicker}>Catalogue</p><h1>Products</h1><p>Add products and control their ordered media.</p></div></div><ProductManager /></div>;
}
