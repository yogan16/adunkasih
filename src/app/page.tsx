import { prisma } from "@/lib/prisma";
import { HomeClient } from "./home-client";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <HomeClient
      announcements={announcements.map((a) => ({
        id: a.id,
        text: a.text,
        date: a.createdAt.toLocaleDateString("en-GB"),
      }))}
    />
  );
}
