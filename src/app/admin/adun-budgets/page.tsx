import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/admin-header";
import { LegacyFooter } from "@/components/legacy-footer";
import { AdunBudgetsTable } from "./adun-budgets-table";
import styles from "../admin.module.css";

export default async function AdminAdunBudgetsPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/login");

  const aduns = await prisma.adun.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, budget: { select: { allocatedAmount: true } } },
  });

  return (
    <div className={styles.page}>
      <AdminHeader />

      <div className={styles.container}>
        <div className={styles.pageTitle}>
          <h1>Peruntukan ADUN</h1>
        </div>

        <AdunBudgetsTable
          aduns={aduns.map((a) => ({ id: a.id, name: a.name, allocatedAmount: a.budget?.allocatedAmount ?? 0 }))}
        />
      </div>

      <LegacyFooter variant="static-black" />
    </div>
  );
}
