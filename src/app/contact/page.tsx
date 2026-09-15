import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { RoleAwareHeader } from "@/components/role-aware-header";
import { LegacyFooter } from "@/components/legacy-footer";
import { ContactForm } from "./contact-form";
import styles from "./contact.module.css";

export default async function ContactPage() {
  const session = await auth();
  const role = session?.user?.role;
  const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });

  return (
    <div className={styles.page}>
      <RoleAwareHeader role={role} />

      <div className={styles.mainWrapper}>
        <div className={styles.contactContainer}>
          <div className={styles.contactIcon}>
            <img src="/images/contact-icon.png" alt="Contact Icon" />
          </div>
          <div className={styles.contactTitle}>HUBUNGI KAMI</div>

          <ContactForm email={settings?.email ?? ""} phone={settings?.phone ?? ""} />
        </div>
      </div>

      <LegacyFooter variant="static-black" />
    </div>
  );
}
