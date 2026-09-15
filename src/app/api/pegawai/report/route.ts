import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { buildAdunApplicationReportCsv } from "@/lib/adun-report";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "PEGAWAI") {
    return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 403 });
  }

  const pegawai = await prisma.user.findUnique({ where: { id: session.user.id }, select: { adunId: true } });
  if (!pegawai?.adunId) {
    return NextResponse.json({ error: "Akaun anda belum ditugaskan kepada mana-mana ADUN." }, { status: 400 });
  }

  const csv = await buildAdunApplicationReportCsv(pegawai.adunId);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="laporan-permohonan-${pegawai.adunId}.csv"`,
    },
  });
}
