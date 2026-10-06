import { PageManager } from "@/components/admin/page-manager";
import styles from "../admin.module.css";

export default function PagesAdminPage() {
  return <div className={styles.adminPage}><div className={styles.pageHeading}><div><p className={styles.kicker}>Content</p><h1>Pages</h1><p>Edit content inside predefined sections while Next.js controls the design.</p></div></div><PageManager /></div>;
}
