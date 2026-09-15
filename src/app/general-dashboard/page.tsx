import { Suspense } from "react";
import { CheckCircle2, Clock, XCircle, PackageCheck, FileText } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { RoleAwareHeader } from "@/components/role-aware-header";
import { LegacyFooter } from "@/components/legacy-footer";
import { CategoryBarChart } from "./category-bar-chart";
import { CategoryDonutChart } from "./category-donut-chart";
import { YearFilter } from "./year-filter";
import styles from "./general-dashboard.module.css";

export const dynamic = "force-dynamic";

const ACTIVE_STATUSES = [
  "SUBMITTED",
  "DOCUMENTS_RECEIVED",
  "APPLICANT_REVIEW",
  "DOCUMENTS_REVIEW",
  "PENDING_APPROVAL",
] as const;

const FIRST_YEAR = 2024;

export default async function GeneralDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const session = await auth();
  const role = session?.user?.role;

  const { year: yearParam } = await searchParams;
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - FIRST_YEAR + 1 }, (_, i) => FIRST_YEAR + i);

  const selectedYear = yearParam && years.includes(Number(yearParam)) ? Number(yearParam) : null;
  const createdAtFilter = selectedYear
    ? { gte: new Date(`${selectedYear}-01-01T00:00:00.000Z`), lt: new Date(`${selectedYear + 1}-01-01T00:00:00.000Z`) }
    : undefined;

  const [statusCounts, aidTypes, aduns] = await Promise.all([
    prisma.application.groupBy({
      by: ["status"],
      where: createdAtFilter ? { createdAt: createdAtFilter } : undefined,
      _count: { _all: true },
    }),
    prisma.aidType.findMany({
      orderBy: { name: "asc" },
      select: {
        name: true,
        _count: { select: { applications: createdAtFilter ? { where: { createdAt: createdAtFilter } } : true } },
      },
    }),
    prisma.adun.findMany({
      select: {
        name: true,
        _count: { select: { applications: createdAtFilter ? { where: { createdAt: createdAtFilter } } : true } },
      },
    }),
  ]);

  const countFor = (statuses: readonly string[]) =>
    statusCounts.filter((s) => statuses.includes(s.status)).reduce((sum, s) => sum + s._count._all, 0);

  const total = statusCounts.reduce((sum, s) => sum + s._count._all, 0);
  const dalamProses = countFor(ACTIVE_STATUSES);
  const lulus = countFor(["APPROVED"]);
  const ditolak = countFor(["REJECTED"]);
  const diagih = countFor(["DISBURSED"]);

  const stats = [
    { label: "Jumlah Permohonan", value: total, icon: FileText },
    { label: "Dalam Proses", value: dalamProses, icon: Clock },
    { label: "Jumlah Lulus", value: lulus, icon: CheckCircle2 },
    { label: "Ditolak", value: ditolak, icon: XCircle },
    { label: "Diagihkan", value: diagih, icon: PackageCheck },
  ];

  const aidTypeData = aidTypes.map((a) => ({ name: a.name, count: a._count.applications }));
  const adunData = aduns
    .map((a) => ({ name: a.name, count: a._count.applications }))
    .filter((a) => a.count > 0)
    .sort((a, b) => b.count - a.count);

  return (
    <div className={styles.page}>
      <RoleAwareHeader role={role} />

      <div className={styles.container}>
        <div className={styles.pageTitle}>
          <h1>Statistik Keseluruhan Bantuan</h1>
        </div>

        <Suspense fallback={null}>
          <YearFilter years={years} />
        </Suspense>

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
          <div className={styles.panelHeader}>Permohonan Mengikut Jenis Bantuan</div>
          <div className={styles.panelBody}>
            <CategoryDonutChart data={aidTypeData} />
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}>Permohonan Mengikut ADUN</div>
          <div className={styles.panelBody}>
            {adunData.length === 0 ? (
              <p className={styles.emptyState}>Tiada permohonan buat masa ini.</p>
            ) : (
              <CategoryBarChart data={adunData} />
            )}
          </div>
        </div>
      </div>

      <LegacyFooter variant="static-black" />
    </div>
  );
}
