import { MediaLibrary } from "@/components/admin/media-library";
import styles from "../admin.module.css";

export default function MediaAdminPage() {
  return (
    <div className={styles.adminPage}>
      <div className={styles.pageHeading}>
        <div><p className={styles.kicker}>Content manager</p><h1>Media Library</h1><p>Upload once and reuse assets across Ammaai content.</p></div>
      </div>
      <MediaLibrary />
    </div>
  );
}
