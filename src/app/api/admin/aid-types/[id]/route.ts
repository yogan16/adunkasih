import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { aidTypeSchema } from "@/lib/validations/aid-type";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return null;
  return session;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = aidTypeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const conflict = await prisma.aidType.findUnique({ where: { name: parsed.data.name } });
  if (conflict && conflict.id !== id) {
    return NextResponse.json({ error: { name: ["Jenis bantuan ini sudah wujud"] } }, { status: 409 });
  }

  const aidType = await prisma.aidType.update({ where: { id }, data: parsed.data });

  return NextResponse.json({ aidType });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 403 });
  }

  const { id } = await params;

  try {
    await prisma.aidType.delete({ where: { id } });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
      return NextResponse.json(
        { error: "Tidak dapat memadam jenis bantuan ini kerana ia mempunyai permohonan berkaitan." },
        { status: 409 },
      );
    }
    throw err;
  }

  return NextResponse.json({ success: true });
}
