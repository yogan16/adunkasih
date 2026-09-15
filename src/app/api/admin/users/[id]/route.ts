import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { updateUserSchema } from "@/lib/validations/admin";
import { usernameForAdunRole } from "@/lib/adun-username";

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
  const parsed = updateUserSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  if (id === session.user.id && parsed.data.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Anda tidak boleh menukar peranan akaun anda sendiri." },
      { status: 400 },
    );
  }

  const { fullname, phone, role, password, adunId: requestedAdunId } = parsed.data;
  const passwordHash = password ? await bcrypt.hash(password, 10) : undefined;

  let idNumberUpdate: string | undefined;
  let adunIdUpdate: string | null = null;

  if (role === "PEGAWAI" || role === "WAKIL_ADUN") {
    const adun = await prisma.adun.findUnique({ where: { id: requestedAdunId } });
    if (!adun) {
      return NextResponse.json({ error: { adunId: ["ADUN tidak ditemui"] } }, { status: 400 });
    }
    const derivedIdNumber = usernameForAdunRole(adun.name, role);
    const conflict = await prisma.user.findUnique({ where: { idNumber: derivedIdNumber } });
    if (conflict && conflict.id !== id) {
      return NextResponse.json(
        {
          error: {
            adunId: [`ADUN ini sudah mempunyai ${role === "PEGAWAI" ? "pegawai" : "wakil ADUN"} yang ditugaskan`],
          },
        },
        { status: 409 },
      );
    }
    idNumberUpdate = derivedIdNumber;
    adunIdUpdate = adun.id;
  }

  const user = await prisma.user.update({
    where: { id },
    data: {
      fullname,
      role,
      phone: role === "CITIZEN" ? (phone ?? "") : "",
      adunId: adunIdUpdate,
      ...(idNumberUpdate ? { idNumber: idNumberUpdate } : {}),
      ...(passwordHash ? { passwordHash } : {}),
    },
    select: { id: true, fullname: true, idNumber: true, phone: true, role: true, createdAt: true },
  });

  return NextResponse.json({ user });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 403 });
  }

  const { id } = await params;

  if (id === session.user.id) {
    return NextResponse.json({ error: "Anda tidak boleh memadam akaun anda sendiri." }, { status: 400 });
  }

  try {
    await prisma.user.delete({ where: { id } });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
      return NextResponse.json(
        { error: "Tidak dapat memadam pengguna ini kerana ia mempunyai permohonan berkaitan." },
        { status: 409 },
      );
    }
    throw err;
  }

  return NextResponse.json({ success: true });
}
