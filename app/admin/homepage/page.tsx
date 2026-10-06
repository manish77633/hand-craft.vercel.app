import { PageManager } from "@/components/admin/page-manager";
import styles from "../admin.module.css";

export default function HomepageAdminPage() {
  return <div className={styles.adminPage}><div className={styles.pageHeading}><div><p className={styles.kicker}>Content</p><h1>Homepage</h1><p>Manage existing homepage sections and their display order.</p></div></div><PageManager initialSlug="home" /></div>;
}
