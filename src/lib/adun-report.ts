import { prisma } from "@/lib/prisma";
import { STATUS_LABEL } from "@/lib/application-status";
import { toCsv } from "@/lib/csv";

const REPORT_COLUMNS = [
  { key: "applicantName", header: "Nama Pemohon" },
  { key: "idNumber", header: "No. Kad Pengenalan" },
  { key: "aidType", header: "Jenis Bantuan" },
  { key: "amount", header: "Jumlah (RM)" },
  { key: "status", header: "Status" },
  { key: "submittedAt", header: "Tarikh Mohon" },
];

export async function buildAdunApplicationReportCsv(adunId: string): Promise<string> {
  const applications = await prisma.application.findMany({
    where: { adunId },
    orderBy: { createdAt: "desc" },
    select: {
      applicant: { select: { fullname: true, idNumber: true } },
      aidType: { select: { name: true, amount: true } },
      status: true,
      createdAt: true,
    },
  });

  const rows = applications.map((a) => ({
    applicantName: a.applicant.fullname,
    idNumber: a.applicant.idNumber,
    aidType: a.aidType.name,
    amount: a.aidType.amount.toFixed(2),
    status: STATUS_LABEL[a.status] ?? a.status,
    submittedAt: a.createdAt.toLocaleDateString("ms-MY", { day: "2-digit", month: "short", year: "numeric" }),
  }));

  return toCsv(rows, REPORT_COLUMNS);
}
