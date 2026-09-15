import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/admin-header";
import { LegacyFooter } from "@/components/legacy-footer";
import { UsersTable } from "./users-table";
import styles from "../admin.module.css";

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/login");

  const [users, aduns] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        fullname: true,
        idNumber: true,
        phone: true,
        role: true,
        createdAt: true,
        adunId: true,
        adun: { select: { name: true } },
      },
    }),
    prisma.adun.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <div className={styles.page}>
      <AdminHeader />

      <div className={styles.container}>
        <div className={styles.pageTitle}>
          <h1>Urus Pengguna</h1>
        </div>

        <UsersTable
          users={users.map((u) => ({
            ...u,
            createdAt: u.createdAt.toISOString(),
            adunName: u.adun?.name ?? null,
          }))}
          aduns={aduns}
          currentUserId={session.user.id}
        />
      </div>

      <LegacyFooter variant="static-black" />
    </div>
  );
}
