import { redirect } from "next/navigation";
import Link from "next/link";
import { ClipboardList, Clock, CheckCircle2, XCircle, AlertTriangle, FileBarChart } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { WakilAdunHeader } from "@/components/wakil-adun-header";
import { LegacyFooter } from "@/components/legacy-footer";
import styles from "./wakil-adun.module.css";

const ACTIVE_STATUSES = [
  "SUBMITTED",
  "DOCUMENTS_RECEIVED",
  "APPLICANT_REVIEW",
  "DOCUMENTS_REVIEW",
  "PENDING_APPROVAL",
] as const;

function formatRM(amount: number) {
  return `RM ${amount.toLocaleString("ms-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default async function WakilAdunPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "WAKIL_ADUN") redirect("/login");

  const wakil = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { adunId: true, adun: { select: { name: true, budget: { select: { allocatedAmount: true } } } } },
  });

  if (!wakil?.adunId) {
    return (
      <div className={styles.page}>
        <WakilAdunHeader />
        <div className={styles.container}>
          <div className={styles.pageTitle}>
            <h1>Papan Utama Wakil ADUN</h1>
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

  const [statusCounts, disbursedApplications] = await Promise.all([
    prisma.application.groupBy({ by: ["status"], where: { adunId: wakil.adunId }, _count: { _all: true } }),
    prisma.application.findMany({
      where: { adunId: wakil.adunId, status: "DISBURSED" },
      select: { aidType: { select: { amount: true } } },
    }),
  ]);

  const countFor = (statuses: readonly string[]) =>
    statusCounts.filter((s) => statuses.includes(s.status)).reduce((sum, s) => sum + s._count._all, 0);

  const total = statusCounts.reduce((sum, s) => sum + s._count._all, 0);
  const dalamProses = countFor(ACTIVE_STATUSES);
  const lulus = countFor(["APPROVED", "DISBURSED"]);
  const ditolak = countFor(["REJECTED"]);

  const stats = [
    { label: "Jumlah Permohonan", value: total, icon: ClipboardList },
    { label: "Dalam Proses", value: dalamProses, icon: Clock },
    { label: "Diluluskan", value: lulus, icon: CheckCircle2 },
    { label: "Ditolak", value: ditolak, icon: XCircle },
  ];

  const allocated = wakil.adun?.budget?.allocatedAmount ?? 0;
  const used = disbursedApplications.reduce((sum, a) => sum + a.aidType.amount, 0);
  const balance = allocated - used;
  const usedPct = allocated > 0 ? Math.min(100, (used / allocated) * 100) : 0;

  return (
    <div className={styles.page}>
      <WakilAdunHeader />

      <div className={styles.container}>
        <div className={styles.pageTitle}>
          <h1>
            Papan Utama Wakil ADUN &middot; <span className={styles.pageTitleAdun}>{wakil.adun?.name}</span>
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

        <div className={styles.panel}>
          <div className={styles.panelHeader}>Peruntukan ADUN</div>
          <div className={styles.panelBody}>
            <div className={styles.budgetRow}>
              <div className={styles.budgetTile}>
                <p className={styles.budgetLabel}>Peruntukan</p>
                <p className={styles.budgetValue}>{formatRM(allocated)}</p>
              </div>
              <div className={styles.budgetTile}>
                <p className={styles.budgetLabel}>Digunakan</p>
                <p className={styles.budgetValue}>{formatRM(used)}</p>
              </div>
              <div className={styles.budgetTile}>
                <p className={styles.budgetLabel}>Baki</p>
                <p className={`${styles.budgetValue} ${balance < 0 ? styles.budgetValueBad : styles.budgetValueGood}`}>
                  {formatRM(balance)}
                </p>
              </div>
            </div>
            {allocated > 0 && (
              <div className={styles.budgetBarTrack}>
                <div className={styles.budgetBarFill} style={{ width: `${usedPct}%` }} />
              </div>
            )}
            {allocated === 0 && (
              <p className={styles.helperNote} style={{ marginTop: 12 }}>
                Peruntukan belum ditetapkan oleh pentadbir untuk ADUN ini.
              </p>
            )}
          </div>
        </div>

        <div className={styles.quickAccess}>
          <p className={styles.sectionLabel}>Akses Pantas</p>
          <div className={styles.cardContainer}>
            <Link href="/wakil-adun/applications" className={styles.dashboardCard}>
              <div className={styles.cardIcon}>
                <ClipboardList size={26} />
              </div>
              <p className={styles.cardTitle}>Permohonan</p>
              <p className={styles.cardDesc}>Semak permohonan bantuan bagi ADUN anda</p>
            </Link>
            <Link href="/wakil-adun/report" className={styles.dashboardCard}>
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
