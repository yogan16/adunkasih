import { redirect } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { WakilAdunHeader } from "@/components/wakil-adun-header";
import { LegacyFooter } from "@/components/legacy-footer";
import { ApplicationsList } from "./applications-list";
import styles from "../wakil-adun.module.css";

export const dynamic = "force-dynamic";

export default async function WakilAdunApplicationsPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "WAKIL_ADUN") redirect("/login");

  const wakil = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { adunId: true, adun: { select: { name: true } } },
  });

  if (!wakil?.adunId) {
    return (
      <div className={styles.page}>
        <WakilAdunHeader />
        <div className={styles.container}>
          <div className={styles.pageTitle}>
            <h1>Permohonan</h1>
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

  const applications = await prisma.application.findMany({
    where: { adunId: wakil.adunId },
    orderBy: { createdAt: "desc" },
    include: {
      applicant: { select: { fullname: true, idNumber: true, phone: true } },
      aidType: { select: { name: true, amount: true } },
      dependents: true,
      statusHistory: { orderBy: { changedAt: "asc" } },
    },
  });

  return (
    <div className={styles.page}>
      <WakilAdunHeader />

      <div className={styles.container}>
        <div className={styles.pageTitle}>
          <h1>
            Permohonan &middot; <span className={styles.pageTitleAdun}>{wakil.adun?.name}</span>
          </h1>
        </div>

        <ApplicationsList
          applications={applications.map((a) => ({
            id: a.id,
            status: a.status,
            createdAt: a.createdAt.toISOString(),
            gender: a.gender,
            occupation: a.occupation,
            incomeRange: a.incomeRange,
            maritalStatus: a.maritalStatus,
            address: a.address,
            postcode: a.postcode,
            city: a.city,
            otherAidDetail: a.otherAidDetail,
            description: a.description,
            applicant: a.applicant,
            aidTypeName: a.aidType.name,
            aidTypeAmount: a.aidType.amount,
            dependents: a.dependents.map((d) => ({
              id: d.id,
              name: d.name,
              icNumber: d.icNumber,
              relationship: d.relationship,
              income: d.income,
            })),
            statusHistory: a.statusHistory.map((s) => ({
              status: s.status,
              note: s.note,
              changedAt: s.changedAt.toISOString(),
            })),
          }))}
        />
      </div>

      <LegacyFooter variant="static-black" />
    </div>
  );
}
