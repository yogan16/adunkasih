"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
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
  Flag,
  X,
  type LucideIcon,
} from "lucide-react";
import { NEXT_STATUSES, STATUS_LABEL } from "@/lib/application-status";
import styles from "../pegawai.module.css";

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
  adunName: string;
  aidTypeName: string;
  aidTypeAmount: number;
  dependents: DependentRow[];
  statusHistory: StatusChangeRow[];
  priorDisbursements: { applicationId: string; aidTypeName: string; disbursedAt: string }[];
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

function ApplicationCard({
  application,
  onChanged,
  onShowHistory,
}: {
  application: ApplicationRow;
  onChanged: () => void;
  onShowHistory: (application: ApplicationRow) => void;
}) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const badge = BADGE[application.status] ?? BADGE.SUBMITTED;
  const BadgeIcon = badge.icon;
  const nextOptions = NEXT_STATUSES[application.status] ?? [];

  async function handleAdvance(status: string) {
    setFormError(null);
    setLoading(status);

    const res = await fetch(`/api/pegawai/applications/${application.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, note: note.trim() || undefined }),
    });

    setLoading(null);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setFormError(typeof data?.error === "string" ? data.error : "Gagal mengemas kini status.");
      return;
    }

    setNote("");
    onChanged();
  }

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
          {application.priorDisbursements.length > 0 && (
            <span
              role="button"
              tabIndex={0}
              className={styles.flagBtn}
              title="Pernah menerima bantuan sebelum ini"
              onClick={(e) => {
                e.stopPropagation();
                onShowHistory(application);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  onShowHistory(application);
                }
              }}
            >
              <Flag size={14} />
            </span>
          )}
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
              <span>ADUN</span>
              <span>{application.adunName}</span>
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

          <div className={styles.actionPanel}>
            {nextOptions.length === 0 ? (
              <p className={styles.terminalNote}>
                {application.status === "REJECTED"
                  ? "Permohonan ini telah ditolak. Tiada tindakan lanjut."
                  : "Permohonan ini telah selesai diproses sepenuhnya."}
              </p>
            ) : (
              <>
                <textarea
                  className={styles.noteInput}
                  placeholder="Catatan (pilihan)..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
                {formError && <p className={styles.formError}>{formError}</p>}
                <div className={styles.actionRow}>
                  {nextOptions.map((opt) => (
                    <button
                      key={opt.status}
                      type="button"
                      className={`${styles.actionBtn} ${
                        opt.status === "APPROVED"
                          ? styles.actionBtnApprove
                          : opt.status === "REJECTED"
                            ? styles.actionBtnReject
                            : ""
                      }`}
                      onClick={() => handleAdvance(opt.status)}
                      disabled={loading !== null}
                    >
                      {loading === opt.status ? "MEMPROSES..." : opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function formatDateOnly(iso: string) {
  return new Date(iso).toLocaleDateString("ms-MY", { day: "2-digit", month: "long", year: "numeric" });
}

function PriorDisbursementsModal({
  application,
  onClose,
}: {
  application: ApplicationRow;
  onClose: () => void;
}) {
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeaderRow}>
          <h3 className={styles.modalTitle}>
            <Flag size={16} style={{ verticalAlign: -2, marginRight: 8 }} />
            Sejarah Bantuan Diterima
          </h3>
          <button type="button" className={styles.iconBtn} onClick={onClose} aria-label="Tutup">
            <X size={16} />
          </button>
        </div>
        <p className={styles.modalSubtext}>
          <strong>{application.applicant.fullname}</strong> ({application.applicant.idNumber}) pernah menerima
          bantuan berikut sebelum ini:
        </p>
        <table className={styles.dependentTable}>
          <thead>
            <tr>
              <th>Jenis Bantuan</th>
              <th>Tarikh Diagihkan</th>
            </tr>
          </thead>
          <tbody>
            {application.priorDisbursements.map((d) => (
              <tr key={d.applicationId}>
                <td>{d.aidTypeName}</td>
                <td>{formatDateOnly(d.disbursedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className={styles.modalButtonRow}>
          <button type="button" className={styles.btnCancel} onClick={onClose}>
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

export function ApplicationsList({ applications }: { applications: ApplicationRow[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [historyApp, setHistoryApp] = useState<ApplicationRow | null>(null);

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
    <>
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
              <ApplicationCard
                key={a.id}
                application={a}
                onChanged={() => router.refresh()}
                onShowHistory={setHistoryApp}
              />
            ))}
          </div>
        )}
        </div>
      </div>

      {historyApp && <PriorDisbursementsModal application={historyApp} onClose={() => setHistoryApp(null)} />}
    </>
  );
}
