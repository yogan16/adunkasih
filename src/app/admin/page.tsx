import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, ShieldCheck, MessageSquare, FileText, HeartHandshake, Megaphone, Wallet } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/admin-header";
import { LegacyFooter } from "@/components/legacy-footer";
import styles from "./admin.module.css";

export default async function AdminPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/login");

  const [citizenCount, pegawaiCount, feedbackCount, applicationCount] = await Promise.all([
    prisma.user.count({ where: { role: "CITIZEN" } }),
    prisma.user.count({ where: { role: "PEGAWAI" } }),
    prisma.contactMessage.count(),
    prisma.application.count(),
  ]);

  const stats = [
    { label: "Jumlah Warganegara", value: citizenCount, icon: Users },
    { label: "Jumlah Pegawai", value: pegawaiCount, icon: ShieldCheck },
    { label: "Mesej Maklum Balas", value: feedbackCount, icon: MessageSquare },
    { label: "Jumlah Permohonan", value: applicationCount, icon: FileText },
  ];

  return (
    <div className={styles.page}>
      <AdminHeader />

      <div className={styles.container}>
        <div className={styles.pageTitle}>
          <h1>Papan Utama Pentadbir</h1>
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
            <Link href="/admin/users" className={styles.dashboardCard}>
              <div className={styles.cardIcon}>
                <Users size={26} />
              </div>
              <p className={styles.cardTitle}>Urus Pengguna</p>
              <p className={styles.cardDesc}>Tambah, kemaskini &amp; padam akaun pengguna</p>
            </Link>
            <Link href="/admin/aid-types" className={styles.dashboardCard}>
              <div className={styles.cardIcon}>
                <HeartHandshake size={26} />
              </div>
              <p className={styles.cardTitle}>Jenis Bantuan</p>
              <p className={styles.cardDesc}>Urus kategori dan syarat bantuan</p>
            </Link>
            <Link href="/admin/announcements" className={styles.dashboardCard}>
              <div className={styles.cardIcon}>
                <Megaphone size={26} />
              </div>
              <p className={styles.cardTitle}>Pengumuman</p>
              <p className={styles.cardDesc}>Urus pengumuman untuk warganegara</p>
            </Link>
            <Link href="/admin/adun-budgets" className={styles.dashboardCard}>
              <div className={styles.cardIcon}>
                <Wallet size={26} />
              </div>
              <p className={styles.cardTitle}>Peruntukan ADUN</p>
              <p className={styles.cardDesc}>Tetapkan peruntukan bagi setiap ADUN</p>
            </Link>
            <Link href="/admin/feedback" className={styles.dashboardCard}>
              <div className={styles.cardIcon}>
                <MessageSquare size={26} />
              </div>
              <p className={styles.cardTitle}>Maklum Balas</p>
              <p className={styles.cardDesc}>Semak mesej daripada orang ramai</p>
            </Link>
          </div>
        </div>
      </div>

      <LegacyFooter variant="static-black" />
    </div>
  );
}
