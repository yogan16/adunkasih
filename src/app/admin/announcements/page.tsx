import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/admin-header";
import { LegacyFooter } from "@/components/legacy-footer";
import { AnnouncementsList } from "./announcements-list";
import styles from "../admin.module.css";

export default async function AdminAnnouncementsPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/login");

  const announcements = await prisma.announcement.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className={styles.page}>
      <AdminHeader />

      <div className={styles.container}>
        <div className={styles.pageTitle}>
          <h1>Urus Pengumuman</h1>
        </div>

        <AnnouncementsList
          announcements={announcements.map((a) => ({
            id: a.id,
            text: a.text,
            createdAt: a.createdAt.toISOString(),
          }))}
        />
      </div>

      <LegacyFooter variant="static-black" />
    </div>
  );
}
