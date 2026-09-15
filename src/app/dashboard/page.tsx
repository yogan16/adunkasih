import { redirect } from "next/navigation";
import Link from "next/link";
import { FileEdit, ListChecks, UserCog, IdCard, FileText, Clock, CheckCircle2, XCircle } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CitizenHeader } from "@/components/citizen-header";
import { LegacyFooter } from "@/components/legacy-footer";
import styles from "./dashboard.module.css";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role === "ADMIN") redirect("/admin");
  if (session.user.role === "PEGAWAI") redirect("/pegawai");
  if (session.user.role === "WAKIL_ADUN") redirect("/wakil-adun");

  const [user, statusCounts, announcements] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id } }),
    prisma.application.groupBy({
      by: ["status"],
      where: { applicantId: session.user.id },
      _count: { _all: true },
    }),
    prisma.announcement.findMany({ orderBy: { createdAt: "desc" }, take: 3 }),
  ]);
  if (!user) redirect("/login");

  const countFor = (statuses: string[]) =>
    statusCounts
      .filter((s) => statuses.includes(s.status))
      .reduce((sum, s) => sum + s._count._all, 0);

  const stats = [
    { label: "Jumlah Permohonan", value: statusCounts.reduce((sum, s) => sum + s._count._all, 0), icon: FileText },
    {
      label: "Dalam Proses",
      value: countFor([
        "SUBMITTED",
        "DOCUMENTS_RECEIVED",
        "APPLICANT_REVIEW",
        "DOCUMENTS_REVIEW",
        "PENDING_APPROVAL",
      ]),
      icon: Clock,
    },
    { label: "Diluluskan", value: countFor(["APPROVED", "DISBURSED"]), icon: CheckCircle2 },
    { label: "Ditolak", value: countFor(["REJECTED"]), icon: XCircle },
  ];

  return (
    <div className={styles.page}>
      <CitizenHeader />

      <div className={styles.container}>
        <div className={styles.profileCard}>
          <div className={styles.avatar}>{user.fullname.trim().charAt(0).toUpperCase()}</div>
          <div className={styles.profileInfo}>
            <p className={styles.greeting}>Selamat Datang</p>
            <h1 className={styles.userName}>{user.fullname}</h1>
            <p className={styles.userIc}>
              <IdCard size={16} />
              {user.idNumber}
            </p>
          </div>
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

        <div className={styles.mainGrid}>
          <div className={styles.quickAccess}>
            <p className={styles.sectionLabel}>Akses Pantas</p>
            <div className={styles.cardContainer}>
              <Link href="/permohonan" className={styles.dashboardCard}>
                <div className={styles.cardIcon}>
                  <FileEdit size={26} />
                </div>
                <p className={styles.cardTitle}>Permohonan</p>
                <p className={styles.cardDesc}>Mohon bantuan baharu</p>
              </Link>
              <Link href="/status" className={styles.dashboardCard}>
                <div className={styles.cardIcon}>
                  <ListChecks size={26} />
                </div>
                <p className={styles.cardTitle}>Semakan Status</p>
                <p className={styles.cardDesc}>Jejak permohonan anda</p>
              </Link>
              <Link href="/profile" className={styles.dashboardCard}>
                <div className={styles.cardIcon}>
                  <UserCog size={26} />
                </div>
                <p className={styles.cardTitle}>Kemaskini Profil</p>
                <p className={styles.cardDesc}>Urus maklumat peribadi</p>
              </Link>
            </div>
          </div>

          <div className={styles.announcementsPanel}>
            <p className={styles.sectionLabel}>Pengumuman Terkini</p>
            {announcements.length === 0 ? (
              <p className={styles.announcementEmpty}>Tiada pengumuman buat masa ini.</p>
            ) : (
              <ul className={styles.announcementList}>
                {announcements.map((a) => (
                  <li key={a.id} className={styles.announcementItem}>
                    <p className={styles.announcementText}>{a.text}</p>
                    <p className={styles.announcementDate}>
                      {a.createdAt.toLocaleDateString("ms-MY", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <LegacyFooter variant="static-black" />
    </div>
  );
}
