import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { passwordSchema } from "@/lib/validations/auth";

const resetSchema = z.object({
  idNumber: z.string().min(1),
  phone: z.string().min(1),
  newPassword: passwordSchema,
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = resetSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Kata Laluan mestilah sekurang-kurangnya 6 aksara, mengandungi huruf besar, huruf kecil, nombor dan aksara khas." },
      { status: 400 },
    );
  }

  const { idNumber, phone, newPassword } = parsed.data;

  const user = await prisma.user.findUnique({ where: { idNumber } });
  if (!user || user.phone !== phone) {
    return NextResponse.json(
      { error: "Maklumat tidak sepadan. Sila semak No. Kad Pengenalan dan No. Telefon anda." },
      { status: 404 },
    );
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  return NextResponse.json({ success: true });
}
