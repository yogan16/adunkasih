import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { permohonanSchema } from "@/lib/validations/permohonan";

export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Sila log masuk terlebih dahulu." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = permohonanSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { dependents, hasMykadFile: _hasMykadFile, ...applicationData } = parsed.data;

  const existingPending = await prisma.application.findFirst({
    where: {
      applicantId: session.user.id,
      aidTypeId: applicationData.aidTypeId,
      status: { notIn: ["REJECTED"] },
    },
  });
  if (existingPending) {
    return NextResponse.json(
      {
        error:
          "Anda sudah mempunyai permohonan aktif untuk jenis bantuan ini. Sila tunggu keputusan sebelum memohon semula.",
      },
      { status: 409 },
    );
  }

  const application = await prisma.application.create({
    data: {
      ...applicationData,
      applicantId: session.user.id,
      dependents: {
        create: dependents.map((d) => ({
          name: d.name,
          icNumber: d.icNumber || null,
          relationship: d.relationship,
          income: d.income,
        })),
      },
      statusHistory: {
        create: { status: "SUBMITTED", changedBy: session.user.id },
      },
    },
  });

  return NextResponse.json({ success: true, id: application.id }, { status: 201 });
}
