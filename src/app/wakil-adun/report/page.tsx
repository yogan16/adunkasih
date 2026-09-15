import { redirect } from "next/navigation";
import { Download, AlertTriangle, FileBarChart } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { WakilAdunHeader } from "@/components/wakil-adun-header";
import { LegacyFooter } from "@/components/legacy-footer";
import styles from "../wakil-adun.module.css";

export default async function WakilAdunReportPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "WAKIL_ADUN") redirect("/login");

  const wakil = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { adunId: true, adun: { select: { name: true } } },
  });

  if (!wakil?.adunId) {
    return (
      <div className={styles.page}>
        <WakilAdunHeader />
        <div className={styles.container}>
          <div className={styles.pageTitle}>
            <h1>Laporan</h1>
          </div>
          <div className={styles.panel}>
            <div className={styles.panelBody}>
              <p className={styles.emptyState}>
                <AlertTriangle size={16} style={{ verticalAlign: -3, marginRight: 6 }} />
                Akaun anda belum ditugaskan kepada mana-mana ADUN. Sila hubungi pentadbir sistem.
              </p>
            </div>
          </div>
        </div>
        <LegacyFooter variant="static-black" />
      </div>
    );
  }

  const count = await prisma.application.count({ where: { adunId: wakil.adunId } });

  return (
    <div className={styles.page}>
      <WakilAdunHeader />

      <div className={styles.container}>
        <div className={styles.pageTitle}>
          <h1>
            Laporan &middot; <span className={styles.pageTitleAdun}>{wakil.adun?.name}</span>
          </h1>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}>Laporan Permohonan</div>
          <div className={`${styles.panelBody} ${styles.reportPanel}`}>
            <FileBarChart size={40} className={styles.reportIcon} />
            <p className={styles.reportText}>
              Muat turun senarai penuh <strong>{count}</strong> permohonan bagi ADUN anda dalam format CSV
              (boleh dibuka dengan Excel).
            </p>
            <a href="/api/wakil-adun/report" download className={styles.downloadBtn}>
              <Download size={15} />
              Muat Turun Laporan (CSV)
            </a>
          </div>
        </div>
      </div>

      <LegacyFooter variant="static-black" />
    </div>
  );
}
