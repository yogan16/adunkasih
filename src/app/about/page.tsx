import { auth } from "@/auth";
import { RoleAwareHeader } from "@/components/role-aware-header";
import { LegacyFooter } from "@/components/legacy-footer";
import styles from "./about.module.css";

export default async function AboutPage() {
  const session = await auth();
  const role = session?.user?.role;

  return (
    <div className={styles.page}>
      <RoleAwareHeader role={role} />

      <div className={styles.mainWrapper}>
        <div className={styles.aboutContainer}>
          <div className={styles.aboutIcon}>i</div>
          <div className={styles.aboutTitle}>TENTANG KAMI</div>

          <div className={styles.aboutBody}>
            <div className={styles.innerTextContainer}>
              <div className={styles.aboutText}>
                AdunKasih@Kedah ialah platform pengurusan kebajikan berasaskan web yang direka untuk
                menyelaraskan pengagihan bantuan di Kedah. Ia membolehkan rakyat mendaftar, memohon
                bantuan kebajikan, dan menjejaki status permohonan. Disepadukan dengan pangkalan
                data kerajaan seperti JKM dan Zakat, ia memastikan penilaian yang telus, kemas kini
                masa nyata dan pemantauan yang cekap untuk pengagihan kebajikan yang saksama.
              </div>
            </div>
          </div>
        </div>
      </div>

      <LegacyFooter variant="fixed-translucent" />
    </div>
  );
}
