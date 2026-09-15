export const STATUS_LABEL: Record<string, string> = {
  SUBMITTED: "Permohonan Dihantar",
  DOCUMENTS_RECEIVED: "Dokumen Diterima",
  APPLICANT_REVIEW: "Maklumat Permohonan Dalam Semakan",
  DOCUMENTS_REVIEW: "Dokumen Sokongan Dalam Semakan",
  PENDING_APPROVAL: "Dalam Proses Kelulusan",
  APPROVED: "Permohonan Diluluskan",
  REJECTED: "Permohonan Ditolak",
  DISBURSED: "Bantuan Diagihkan",
};

export const NEXT_STATUSES: Record<string, { status: string; label: string }[]> = {
  SUBMITTED: [{ status: "DOCUMENTS_RECEIVED", label: "Sahkan Dokumen Diterima" }],
  DOCUMENTS_RECEIVED: [{ status: "APPLICANT_REVIEW", label: "Mula Semakan Maklumat Pemohon" }],
  APPLICANT_REVIEW: [{ status: "DOCUMENTS_REVIEW", label: "Mula Semakan Dokumen Sokongan" }],
  DOCUMENTS_REVIEW: [{ status: "PENDING_APPROVAL", label: "Hantar untuk Kelulusan" }],
  PENDING_APPROVAL: [
    { status: "APPROVED", label: "Luluskan Permohonan" },
    { status: "REJECTED", label: "Tolak Permohonan" },
  ],
  APPROVED: [{ status: "DISBURSED", label: "Sahkan Bantuan Diagihkan" }],
  REJECTED: [],
  DISBURSED: [],
};
