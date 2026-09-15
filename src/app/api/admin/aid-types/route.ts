import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { aidTypeSchema } from "@/lib/validations/aid-type";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 403 });
  }

  const aidTypes = await prisma.aidType.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { applications: true } } },
  });

  return NextResponse.json({ aidTypes });
}

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = aidTypeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const existing = await prisma.aidType.findUnique({ where: { name: parsed.data.name } });
  if (existing) {
    return NextResponse.json({ error: { name: ["Jenis bantuan ini sudah wujud"] } }, { status: 409 });
  }

  const aidType = await prisma.aidType.create({ data: parsed.data });

  return NextResponse.json({ aidType }, { status: 201 });
}
