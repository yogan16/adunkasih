import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { advanceStatusSchema } from "@/lib/validations/pegawai";
import { NEXT_STATUSES } from "@/lib/application-status";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "PEGAWAI") {
    return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = advanceStatusSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const pegawai = await prisma.user.findUnique({ where: { id: session.user.id }, select: { adunId: true } });
  if (!pegawai?.adunId) {
    return NextResponse.json(
      { error: "Akaun anda belum ditugaskan kepada mana-mana ADUN." },
      { status: 403 },
    );
  }

  const application = await prisma.application.findUnique({ where: { id }, select: { status: true, adunId: true } });
  if (!application) {
    return NextResponse.json({ error: "Permohonan tidak ditemui." }, { status: 404 });
  }
  if (application.adunId !== pegawai.adunId) {
    return NextResponse.json(
      { error: "Anda hanya boleh mengemas kini permohonan bagi ADUN anda." },
      { status: 403 },
    );
  }

  const allowedNext = NEXT_STATUSES[application.status] ?? [];
  const isAllowed = allowedNext.some((n) => n.status === parsed.data.status);
  if (!isAllowed) {
    return NextResponse.json(
      { error: "Peralihan status tidak sah untuk peringkat semasa permohonan ini." },
      { status: 409 },
    );
  }

  const { status, note } = parsed.data;

  await prisma.$transaction([
    prisma.application.update({ where: { id }, data: { status } }),
    prisma.statusChange.create({
      data: { applicationId: id, status, note: note || null, changedBy: session.user.id },
    }),
  ]);

  return NextResponse.json({ success: true });
}
