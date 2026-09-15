import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { announcementSchema } from "@/lib/validations/announcement";

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

  const announcements = await prisma.announcement.findMany({ orderBy: { createdAt: "desc" } });

  return NextResponse.json({ announcements });
}

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = announcementSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const announcement = await prisma.announcement.create({ data: parsed.data });

  return NextResponse.json({ announcement }, { status: 201 });
}
