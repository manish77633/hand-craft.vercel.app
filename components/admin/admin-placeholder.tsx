import { Construction } from "lucide-react";
import styles from "@/app/admin/admin.module.css";

export function AdminPlaceholder({ title, description }: { title: string; description: string }) {
  return (
    <div className={styles.adminPage}>
      <div className={styles.pageHeading}><div><p className={styles.kicker}>Content manager</p><h1>{title}</h1></div></div>
      <section className={styles.placeholder}>
        <span><Construction size={24} /></span>
        <h2>{title} foundation</h2>
        <p>{description}</p>
      </section>
    </div>
  );
}
