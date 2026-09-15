import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CitizenHeader } from "@/components/citizen-header";
import { LegacyFooter } from "@/components/legacy-footer";
import { PermohonanForm } from "./permohonan-form";
import styles from "./permohonan.module.css";

export default async function PermohonanPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const [user, aduns, aidTypes, pendingApplications] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id } }),
    prisma.adun.findMany({ orderBy: { name: "asc" } }),
    prisma.aidType.findMany({ orderBy: { name: "asc" } }),
    prisma.application.findMany({
      where: { applicantId: session.user.id, status: { notIn: ["REJECTED"] } },
      select: { aidTypeId: true },
    }),
  ]);
  if (!user) redirect("/login");

  const pendingAidTypeIds = pendingApplications.map((a) => a.aidTypeId);

  return (
    <div className={styles.page}>
      <CitizenHeader />

      <div className={styles.mainWrapper}>
        <div className={styles.pageTitle}>
          <h1>Permohonan Bantuan</h1>
        </div>

        <PermohonanForm
          user={{ fullname: user.fullname, idNumber: user.idNumber, phone: user.phone }}
          aduns={aduns.map((a) => ({ id: a.id, name: a.name }))}
          aidTypes={aidTypes.map((a) => ({
            id: a.id,
            name: a.name,
            conditions: a.conditions,
            eligibleAge: a.eligibleAge,
            amount: a.amount,
            description: a.description,
          }))}
          pendingAidTypeIds={pendingAidTypeIds}
        />
      </div>

      <LegacyFooter variant="static-black" />
    </div>
  );
}
