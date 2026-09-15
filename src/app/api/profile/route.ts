import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { profileUpdateSchema } from "@/lib/validations/profile";

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Sila log masuk terlebih dahulu." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = profileUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { fullname, phone, currentPassword, newPassword } = parsed.data;

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return NextResponse.json({ error: "Pengguna tidak ditemui." }, { status: 404 });
  }

  let passwordHash: string | undefined;
  if (newPassword) {
    const isValid = await bcrypt.compare(currentPassword!, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: { currentPassword: ["Kata laluan semasa tidak tepat"] } },
        { status: 400 },
      );
    }
    passwordHash = await bcrypt.hash(newPassword, 10);
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      fullname,
      phone,
      ...(passwordHash ? { passwordHash } : {}),
    },
  });

  return NextResponse.json({ success: true });
}
