import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/admin-header";
import { LegacyFooter } from "@/components/legacy-footer";
import { FeedbackList } from "./feedback-list";
import styles from "../admin.module.css";

export default async function AdminFeedbackPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/login");

  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className={styles.page}>
      <AdminHeader />

      <div className={styles.container}>
        <div className={styles.pageTitle}>
          <h1>Maklum Balas</h1>
        </div>

        <FeedbackList
          messages={messages.map((m) => ({ ...m, createdAt: m.createdAt.toISOString() }))}
        />
      </div>

      <LegacyFooter variant="static-black" />
    </div>
  );
}
