import { SettingsManager } from "@/components/admin/settings-manager";
import styles from "../admin.module.css";

export default function SettingsAdminPage() {
  return <div className={styles.adminPage}><div className={styles.pageHeading}><div><p className={styles.kicker}>Content manager</p><h1>Settings</h1><p>Brand, business contact, social links, search appearance and footer.</p></div></div><SettingsManager /></div>;
}
