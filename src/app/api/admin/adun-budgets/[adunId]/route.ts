import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  allocatedAmount: z.coerce.number().min(0, "Jumlah mestilah 0 atau lebih"),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ adunId: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 403 });
  }

  const { adunId } = await params;
  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const adun = await prisma.adun.findUnique({ where: { id: adunId } });
  if (!adun) {
    return NextResponse.json({ error: "ADUN tidak ditemui." }, { status: 404 });
  }

  const budget = await prisma.adunBudget.upsert({
    where: { adunId },
    update: { allocatedAmount: parsed.data.allocatedAmount },
    create: { adunId, allocatedAmount: parsed.data.allocatedAmount },
  });

  return NextResponse.json({ budget });
}
