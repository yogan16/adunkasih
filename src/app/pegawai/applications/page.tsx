import { redirect } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PegawaiHeader } from "@/components/pegawai-header";
import { LegacyFooter } from "@/components/legacy-footer";
import { ApplicationsList } from "./applications-list";
import styles from "../pegawai.module.css";

export const dynamic = "force-dynamic";

export default async function PegawaiApplicationsPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "PEGAWAI") redirect("/login");

  const pegawai = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { adunId: true, adun: { select: { name: true } } },
  });

  if (!pegawai?.adunId) {
    return (
      <div className={styles.page}>
        <PegawaiHeader />
        <div className={styles.container}>
          <div className={styles.pageTitle}>
            <h1>Senarai Permohonan</h1>
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
    where: { adunId: pegawai.adunId },
    orderBy: { createdAt: "asc" },
    include: {
      applicant: { select: { fullname: true, idNumber: true, phone: true } },
      adun: { select: { name: true } },
      aidType: { select: { name: true, amount: true } },
      dependents: true,
      statusHistory: { orderBy: { changedAt: "asc" } },
    },
  });

  const applicantIds = [...new Set(applications.map((a) => a.applicantId))];
  const disbursedApplications = await prisma.application.findMany({
    where: { applicantId: { in: applicantIds }, status: "DISBURSED" },
    select: {
      id: true,
      applicantId: true,
      aidType: { select: { name: true } },
      statusHistory: {
        where: { status: "DISBURSED" },
        orderBy: { changedAt: "desc" },
        take: 1,
        select: { changedAt: true },
      },
    },
  });

  const priorDisbursementsByApplicant = new Map<
    string,
    { applicationId: string; aidTypeName: string; disbursedAt: string }[]
  >();
  for (const d of disbursedApplications) {
    const list = priorDisbursementsByApplicant.get(d.applicantId) ?? [];
    list.push({
      applicationId: d.id,
      aidTypeName: d.aidType.name,
      disbursedAt: (d.statusHistory[0]?.changedAt ?? new Date()).toISOString(),
    });
    priorDisbursementsByApplicant.set(d.applicantId, list);
  }

  return (
    <div className={styles.page}>
      <PegawaiHeader />

      <div className={styles.container}>
        <div className={styles.pageTitle}>
          <h1>
            Senarai Permohonan &middot; <span className={styles.pageTitleAdun}>{pegawai.adun?.name}</span>
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
            adunName: a.adun.name,
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
            priorDisbursements: (priorDisbursementsByApplicant.get(a.applicantId) ?? []).filter(
              (d) => d.applicationId !== a.id,
            ),
          }))}
        />
      </div>

      <LegacyFooter variant="static-black" />
    </div>
  );
}
