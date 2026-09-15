import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { fullname, idNumber, phone, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { idNumber } });
  if (existing) {
    return NextResponse.json(
      { error: { idNumber: ["No. Kad Pengenalan telah didaftarkan"] } },
      { status: 409 },
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { fullname, idNumber, phone, passwordHash },
  });

  return NextResponse.json({ success: true }, { status: 201 });
}
