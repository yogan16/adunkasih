import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CitizenHeader } from "@/components/citizen-header";
import { LegacyFooter } from "@/components/legacy-footer";
import { ProfileForm } from "./profile-form";
import styles from "./profile.module.css";

export default async function ProfilePage() {
  const session = await auth();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/login");

  return (
    <div className={styles.page}>
      <CitizenHeader />

      <div className={styles.mainWrapper}>
        <div className={styles.pageTitle}>
          <h1>Kemaskini Profil</h1>
        </div>

        <ProfileForm
          user={{ fullname: user.fullname, idNumber: user.idNumber, phone: user.phone }}
        />
      </div>

      <LegacyFooter variant="static-black" />
    </div>
  );
}
