import { redirect } from "next/navigation";
import Link from "next/link";
import { ClipboardList, Clock, CheckCircle2, XCircle, AlertTriangle, FileBarChart } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PegawaiHeader } from "@/components/pegawai-header";
import { LegacyFooter } from "@/components/legacy-footer";
import styles from "./pegawai.module.css";

const ACTIVE_STATUSES = [
  "SUBMITTED",
  "DOCUMENTS_RECEIVED",
  "APPLICANT_REVIEW",
  "DOCUMENTS_REVIEW",
  "PENDING_APPROVAL",
] as const;

export default async function PegawaiPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "PEGAWAI") redirect("/login");

  const pegawai = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { adunId: true, adun: { select: { name: true } } },
  });

  if (!pegawai?.adunId) {
    return (
      <div className={styles.page}>
        <PegawaiHeader />
        <div className={styles.container}>
          <div className={styles.pageTitle}>
            <h1>Papan Utama Pegawai</h1>
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

  const statusCounts = await prisma.application.groupBy({
    by: ["status"],
    where: { adunId: pegawai.adunId },
    _count: { _all: true },
  });

  const countFor = (statuses: readonly string[]) =>
    statusCounts.filter((s) => statuses.includes(s.status)).reduce((sum, s) => sum + s._count._all, 0);

  const stats = [
    {
      label: "Jumlah Permohonan",
      value: statusCounts.reduce((sum, s) => sum + s._count._all, 0),
      icon: ClipboardList,
    },
    { label: "Perlu Tindakan", value: countFor(ACTIVE_STATUSES), icon: Clock },
    { label: "Diluluskan", value: countFor(["APPROVED", "DISBURSED"]), icon: CheckCircle2 },
    { label: "Ditolak", value: countFor(["REJECTED"]), icon: XCircle },
  ];

  return (
    <div className={styles.page}>
      <PegawaiHeader />

      <div className={styles.container}>
        <div className={styles.pageTitle}>
          <h1>
            Papan Utama Pegawai &middot; <span className={styles.pageTitleAdun}>{pegawai.adun?.name}</span>
          </h1>
        </div>

        <div className={styles.statsRow}>
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className={styles.statTile}>
              <div className={styles.statIcon}>
                <Icon size={20} />
              </div>
              <div>
                <p className={styles.statValue}>{value}</p>
                <p className={styles.statLabel}>{label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.quickAccess}>
          <p className={styles.sectionLabel}>Akses Pantas</p>
          <div className={styles.cardContainer}>
            <Link href="/pegawai/applications" className={styles.dashboardCard}>
              <div className={styles.cardIcon}>
                <ClipboardList size={26} />
              </div>
              <p className={styles.cardTitle}>Senarai Permohonan</p>
              <p className={styles.cardDesc}>Semak dan kemas kini status permohonan bantuan</p>
            </Link>
            <Link href="/pegawai/report" className={styles.dashboardCard}>
              <div className={styles.cardIcon}>
                <FileBarChart size={26} />
              </div>
              <p className={styles.cardTitle}>Laporan</p>
              <p className={styles.cardDesc}>Muat turun laporan permohonan (CSV)</p>
            </Link>
          </div>
        </div>
      </div>

      <LegacyFooter variant="static-black" />
    </div>
  );
}
