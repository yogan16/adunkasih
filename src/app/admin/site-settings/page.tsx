import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/admin-header";
import { LegacyFooter } from "@/components/legacy-footer";
import { SiteSettingsForm } from "./site-settings-form";
import styles from "../admin.module.css";

export default async function AdminSiteSettingsPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/login");

  const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });

  return (
    <div className={styles.page}>
      <AdminHeader />

      <div className={styles.container}>
        <div className={styles.pageTitle}>
          <h1>Maklumat Hubungan Laman Web</h1>
        </div>

        <SiteSettingsForm email={settings?.email ?? ""} phone={settings?.phone ?? ""} />
      </div>

      <LegacyFooter variant="static-black" />
    </div>
  );
}
