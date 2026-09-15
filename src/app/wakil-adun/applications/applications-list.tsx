"use client";

import { useState, useMemo } from "react";
import {
  Search,
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
import { STATUS_LABEL } from "@/lib/application-status";
import styles from "../wakil-adun.module.css";

type StatusChangeRow = { status: string; note: string | null; changedAt: string };
type DependentRow = { id: string; name: string; icNumber: string | null; relationship: string; income: number };
type ApplicationRow = {
  id: string;
  status: string;
  createdAt: string;
  gender: string;
  occupation: string;
  incomeRange: string;
  maritalStatus: string;
  address: string;
  postcode: string;
  city: string;
  otherAidDetail: string | null;
  description: string;
  applicant: { fullname: string; idNumber: string; phone: string };
  aidTypeName: string;
  aidTypeAmount: number;
  dependents: DependentRow[];
  statusHistory: StatusChangeRow[];
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

const PRE_DECISION_STEPS = [
  { status: "SUBMITTED", title: "Permohonan Dihantar" },
  { status: "DOCUMENTS_RECEIVED", title: "Dokumen Diterima" },
  { status: "APPLICANT_REVIEW", title: "Maklumat Permohonan Dalam Semakan" },
  { status: "DOCUMENTS_REVIEW", title: "Dokumen Sokongan Dalam Semakan" },
  { status: "PENDING_APPROVAL", title: "Dalam Proses Kelulusan" },
];
const PRE_DECISION_ORDER = PRE_DECISION_STEPS.map((s) => s.status);

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ms-MY", { day: "2-digit", month: "short", year: "numeric" });
}
function formatDateTime(iso: string) {
  return new Date(iso).toLocaleDateString("ms-MY", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ApplicationTimeline({
  statusHistory,
  currentStatus,
}: {
  statusHistory: StatusChangeRow[];
  currentStatus: string;
}) {
  const timestampFor = (status: string) => statusHistory.find((s) => s.status === status)?.changedAt;
  const noteFor = (status: string) => statusHistory.find((s) => s.status === status)?.note;

  const approvedAt = timestampFor("APPROVED");
  const rejectedAt = timestampFor("REJECTED");
  const disbursedAt = timestampFor("DISBURSED");
  const isRejected = currentStatus === "REJECTED" || Boolean(rejectedAt);
  const isDisbursed = currentStatus === "DISBURSED" || Boolean(disbursedAt);
  const isApproved = isDisbursed || currentStatus === "APPROVED" || Boolean(approvedAt);
  const isDecided = isRejected || isApproved;

  const currentPreDecisionIndex = isDecided
    ? PRE_DECISION_ORDER.length - 1
    : PRE_DECISION_ORDER.indexOf(currentStatus);

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
                  ? formatDateTime(step.at)
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
          <span className={styles.applicantName}>{application.applicant.fullname}</span>
          <span className={styles.cardMeta}>
            {application.aidTypeName} &middot; Dihantar: {formatDate(application.createdAt)}
          </span>
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
          <div className={styles.detailGrid}>
            <div>
              <span>No. Kad Pengenalan</span>
              <span>{application.applicant.idNumber}</span>
            </div>
            <div>
              <span>No. Tel</span>
              <span>{application.applicant.phone || "-"}</span>
            </div>
            <div>
              <span>Jantina</span>
              <span>{application.gender}</span>
            </div>
            <div>
              <span>Pekerjaan</span>
              <span>{application.occupation}</span>
            </div>
            <div>
              <span>Status Perkahwinan</span>
              <span>{application.maritalStatus}</span>
            </div>
            <div>
              <span>Julat Pendapatan</span>
              <span>{application.incomeRange}</span>
            </div>
            <div>
              <span>Alamat</span>
              <span>
                {application.address}, {application.postcode} {application.city}
              </span>
            </div>
            <div>
              <span>Jenis Bantuan</span>
              <span>
                {application.aidTypeName} (RM{application.aidTypeAmount.toFixed(2)})
              </span>
            </div>
            {application.otherAidDetail && (
              <div>
                <span>Butiran Lain-lain</span>
                <span>{application.otherAidDetail}</span>
              </div>
            )}
          </div>

          <p className={styles.detailSectionTitle}>Penerangan Permohonan</p>
          <p className={styles.descriptionText}>{application.description}</p>

          {application.dependents.length > 0 && (
            <>
              <p className={styles.detailSectionTitle}>Tanggungan</p>
              <table className={styles.dependentTable}>
                <thead>
                  <tr>
                    <th>Nama</th>
                    <th>No. Kad Pengenalan</th>
                    <th>Hubungan</th>
                    <th>Pendapatan (RM)</th>
                  </tr>
                </thead>
                <tbody>
                  {application.dependents.map((d) => (
                    <tr key={d.id}>
                      <td>{d.name}</td>
                      <td>{d.icNumber || "-"}</td>
                      <td>{d.relationship}</td>
                      <td>{d.income.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          <p className={styles.detailSectionTitle}>Sejarah Status</p>
          <ApplicationTimeline statusHistory={application.statusHistory} currentStatus={application.status} />
        </div>
      )}
    </div>
  );
}

export function ApplicationsList({ applications }: { applications: ApplicationRow[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = applications;
    if (q) {
      list = list.filter(
        (a) =>
          a.applicant.fullname.toLowerCase().includes(q) ||
          a.applicant.idNumber.toLowerCase().includes(q) ||
          a.aidTypeName.toLowerCase().includes(q),
      );
    }
    if (statusFilter !== "ALL") {
      list = list.filter((a) => a.status === statusFilter);
    }
    return list;
  }, [applications, search, statusFilter]);

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>Senarai Permohonan ({visible.length})</div>
      <div className={styles.panelBody}>
        <div className={styles.filterRow}>
          <div className={styles.searchRow}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Cari mengikut nama pemohon, No. Kad Pengenalan atau jenis bantuan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className={styles.statusFilterSelect}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Tapis mengikut status"
          >
            <option value="ALL">Semua Status</option>
            {Object.entries(STATUS_LABEL).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {visible.length === 0 ? (
          <p className={styles.emptyState}>Tiada permohonan ditemui.</p>
        ) : (
          <div className={styles.list}>
            {visible.map((a) => (
              <ApplicationCard key={a.id} application={a} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
