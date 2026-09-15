import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createUserSchema } from "@/lib/validations/admin";
import { usernameForAdunRole } from "@/lib/adun-username";

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

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      fullname: true,
      idNumber: true,
      phone: true,
      role: true,
      createdAt: true,
      adunId: true,
      adun: { select: { name: true } },
    },
  });

  return NextResponse.json({ users });
}

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createUserSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { fullname, password, role } = parsed.data;

  let idNumber: string;
  let phone: string;
  let adunId: string | null = null;

  if (role === "PEGAWAI" || role === "WAKIL_ADUN") {
    const adun = await prisma.adun.findUnique({ where: { id: parsed.data.adunId } });
    if (!adun) {
      return NextResponse.json({ error: { adunId: ["ADUN tidak ditemui"] } }, { status: 400 });
    }
    idNumber = usernameForAdunRole(adun.name, role);
    phone = "";
    adunId = adun.id;
  } else if (role === "CITIZEN") {
    idNumber = parsed.data.idNumber!;
    phone = parsed.data.phone ?? "";
  } else {
    idNumber = parsed.data.idNumber!;
    phone = "";
  }

  const existing = await prisma.user.findUnique({ where: { idNumber } });
  if (existing) {
    const isAdunRole = role === "PEGAWAI" || role === "WAKIL_ADUN";
    return NextResponse.json(
      {
        error: {
          [isAdunRole ? "adunId" : "idNumber"]: [
            isAdunRole
              ? `ADUN ini sudah mempunyai ${role === "PEGAWAI" ? "pegawai" : "wakil ADUN"} yang ditugaskan`
              : "No. Kad Pengenalan / Username telah digunakan",
          ],
        },
      },
      { status: 409 },
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { fullname, idNumber, phone, passwordHash, role, adunId },
    select: { id: true, fullname: true, idNumber: true, phone: true, role: true, createdAt: true },
  });

  return NextResponse.json({ user }, { status: 201 });
}
