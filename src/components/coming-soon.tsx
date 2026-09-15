import Link from "next/link";
import { CitizenHeader } from "@/components/citizen-header";
import { LegacyFooter } from "@/components/legacy-footer";
import styles from "./coming-soon.module.css";

export function ComingSoon({ title, text }: { title: string; text: string }) {
  return (
    <div className={styles.page}>
      <CitizenHeader />
      <div className={styles.mainWrapper}>
        <div className={styles.card}>
          <div className={styles.title}>{title}</div>
          <p className={styles.text}>{text}</p>
          <Link href="/dashboard" className={styles.backLink}>
            Kembali ke Papan Utama
          </Link>
        </div>
      </div>
      <LegacyFooter variant="static-black" />
    </div>
  );
}
