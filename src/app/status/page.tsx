import { redirect } from "next/navigation";
import Link from "next/link";
import { ClipboardList, FileEdit } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CitizenHeader } from "@/components/citizen-header";
import { LegacyFooter } from "@/components/legacy-footer";
import { StatusList } from "./status-list";
import styles from "./status.module.css";

export const dynamic = "force-dynamic";

export default async function StatusPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const applications = await prisma.application.findMany({
    where: { applicantId: session.user.id },
    include: {
      aidType: true,
      statusHistory: { orderBy: { changedAt: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className={styles.page}>
      <CitizenHeader />

      <div className={styles.mainWrapper}>
        <div className={styles.pageTitle}>
          <h1>Semakan Status Permohonan</h1>
        </div>

        {applications.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <ClipboardList size={26} />
            </div>
            <p>Anda belum mempunyai sebarang permohonan bantuan.</p>
            <Link href="/permohonan" className={styles.emptyCta}>
              <FileEdit size={16} />
              Mohon Bantuan Sekarang
            </Link>
          </div>
        ) : (
          <StatusList
            applications={applications.map((a) => ({
              id: a.id,
              aidTypeName: a.aidType.name,
              status: a.status,
              createdAt: a.createdAt.toISOString(),
              statusHistory: a.statusHistory.map((s) => ({
                status: s.status,
                note: s.note,
                changedAt: s.changedAt.toISOString(),
              })),
            }))}
          />
        )}
      </div>

      <LegacyFooter variant="static-black" />
    </div>
  );
}
