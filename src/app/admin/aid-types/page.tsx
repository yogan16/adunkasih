import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/admin-header";
import { LegacyFooter } from "@/components/legacy-footer";
import { AidTypesTable } from "./aid-types-table";
import styles from "../admin.module.css";

export default async function AdminAidTypesPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/login");

  const aidTypes = await prisma.aidType.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { applications: true } } },
  });

  return (
    <div className={styles.page}>
      <AdminHeader />

      <div className={styles.container}>
        <div className={styles.pageTitle}>
          <h1>Urus Jenis Bantuan</h1>
        </div>

        <AidTypesTable
          aidTypes={aidTypes.map((a) => ({
            id: a.id,
            name: a.name,
            conditions: a.conditions,
            eligibleAge: a.eligibleAge,
            amount: a.amount,
            description: a.description,
            applicationCount: a._count.applications,
          }))}
        />
      </div>

      <LegacyFooter variant="static-black" />
    </div>
  );
}
