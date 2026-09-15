"use client";

import { useState } from "react";
import {
  ChevronDown,
  FileClock,
  FileCheck2,
  UserSearch,
  FileSearch,
  Hourglass,
  CheckCircle2,
  XCircle,
  PackageCheck,
  type LucideIcon,
} from "lucide-react";
import styles from "./status.module.css";

type StatusChange = { status: string; note: string | null; changedAt: string };
type ApplicationRow = {
  id: string;
  aidTypeName: string;
  status: string;
  createdAt: string;
  statusHistory: StatusChange[];
};

const BADGE: Record<string, { label: string; className: string; icon: LucideIcon }> = {
  SUBMITTED: { label: "Dihantar", className: "badgeSubmitted", icon: FileClock },
  DOCUMENTS_RECEIVED: { label: "Dokumen Diterima", className: "badgeDocumentsReceived", icon: FileCheck2 },
  APPLICANT_REVIEW: { label: "Dalam Semakan", className: "badgeApplicantReview", icon: UserSearch },
  DOCUMENTS_REVIEW: { label: "Dokumen Disemak", className: "badgeDocumentsReview", icon: FileSearch },
  PENDING_APPROVAL: { label: "Proses Kelulusan", className: "badgePendingApproval", icon: Hourglass },
  APPROVED: { label: "Diluluskan", className: "badgeApproved", icon: CheckCircle2 },
  REJECTED: { label: "Ditolak", className: "badgeRejected", icon: XCircle },
  DISBURSED: { label: "Bantuan Diagihkan", className: "badgeDisbursed", icon: PackageCheck },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ms-MY", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const PRE_DECISION_STEPS = [
  { status: "SUBMITTED", title: "Permohonan Dihantar" },
  { status: "DOCUMENTS_RECEIVED", title: "Dokumen Diterima" },
  { status: "APPLICANT_REVIEW", title: "Maklumat Permohonan Dalam Semakan" },
  { status: "DOCUMENTS_REVIEW", title: "Dokumen Sokongan Dalam Semakan" },
  { status: "PENDING_APPROVAL", title: "Dalam Proses Kelulusan" },
];
const PRE_DECISION_ORDER = PRE_DECISION_STEPS.map((s) => s.status);

function ApplicationTimeline({ application }: { application: ApplicationRow }) {
  const timestampFor = (status: string) =>
    application.statusHistory.find((s) => s.status === status)?.changedAt;
  const noteFor = (status: string) => application.statusHistory.find((s) => s.status === status)?.note;

  const approvedAt = timestampFor("APPROVED");
  const rejectedAt = timestampFor("REJECTED");
  const disbursedAt = timestampFor("DISBURSED");
  const isRejected = application.status === "REJECTED" || Boolean(rejectedAt);
  const isDisbursed = application.status === "DISBURSED" || Boolean(disbursedAt);
  const isApproved = isDisbursed || application.status === "APPROVED" || Boolean(approvedAt);
  const isDecided = isRejected || isApproved;

  const currentPreDecisionIndex = isDecided
    ? PRE_DECISION_ORDER.length - 1
    : PRE_DECISION_ORDER.indexOf(application.status);

  const preSteps = PRE_DECISION_STEPS.map((step, i) => {
    const at = timestampFor(step.status);
    return {
      title: step.title,
      at,
      note: noteFor(step.status),
      reached: Boolean(at) || i <= currentPreDecisionIndex,
      rejected: false,
      notApplicable: false,
    };
  });

  const decisionStep = {
    title: isDecided ? (isRejected ? "Permohonan Ditolak" : "Permohonan Diluluskan") : "Menunggu Keputusan",
    at: isRejected ? rejectedAt : approvedAt,
    note: isRejected ? noteFor("REJECTED") : noteFor("APPROVED"),
    reached: isDecided,
    rejected: isRejected,
    notApplicable: false,
  };

  const disbursedStep = {
    title: "Bantuan Diagihkan",
    at: disbursedAt,
    note: noteFor("DISBURSED"),
    reached: isDisbursed,
    rejected: false,
    notApplicable: isRejected,
  };

  const steps = [...preSteps, decisionStep, disbursedStep];

  return (
    <div className={styles.timeline}>
      {steps.map((step, i) => (
        <div key={i} className={styles.timelineStep}>
          <div
            className={`${styles.timelineDot} ${
              step.reached ? (step.rejected ? styles.timelineDotRejected : styles.timelineDotActive) : ""
            }`}
          />
          <div className={styles.timelineInfo}>
            <span className={styles.timelineTitle}>{step.title}</span>
            <span className={styles.timelineDate}>
              {step.notApplicable
                ? "Tidak berkenaan"
                : step.at
                  ? formatDate(step.at)
                  : "Belum sampai peringkat ini"}
            </span>
            {step.note && <div className={styles.timelineNote}>{step.note}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

function ApplicationCard({ application }: { application: ApplicationRow }) {
  const [open, setOpen] = useState(false);
  const badge = BADGE[application.status] ?? BADGE.SUBMITTED;
  const BadgeIcon = badge.icon;

  return (
    <div className={styles.card}>
      <button type="button" className={styles.cardHeader} onClick={() => setOpen((o) => !o)}>
        <div className={styles.cardHeaderLeft}>
          <span className={styles.aidTypeName}>{application.aidTypeName}</span>
          <span className={styles.submittedDate}>Dihantar: {formatDate(application.createdAt)}</span>
        </div>
        <div className={styles.cardHeaderRight}>
          <span className={`${styles.badge} ${styles[badge.className]}`}>
            <BadgeIcon size={13} />
            {badge.label}
          </span>
          <span className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}>
            <ChevronDown size={18} />
          </span>
        </div>
      </button>
      {open && (
        <div className={styles.cardBody}>
          <ApplicationTimeline application={application} />
        </div>
      )}
    </div>
  );
}

export function StatusList({ applications }: { applications: ApplicationRow[] }) {
  return (
    <div className={styles.list}>
      {applications.map((app) => (
        <ApplicationCard key={app.id} application={app} />
      ))}
    </div>
  );
}
