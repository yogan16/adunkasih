"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import styles from "../admin.module.css";

type Errors = Partial<Record<"email" | "phone", string[]>>;

export function SiteSettingsForm({ email: initialEmail, phone: initialPhone }: { email: string; phone: string }) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState(initialPhone);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors({});
    setFormError(null);
    setSuccess(false);
    setLoading(true);

    const res = await fetch("/api/admin/site-settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, phone }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      if (typeof data?.error === "string") {
        setFormError(data.error);
      } else {
        setErrors(data?.error ?? {});
      }
      return;
    }

    setSuccess(true);
    router.refresh();
  }

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>Maklumat Hubungan Awam</div>
      <div className={styles.panelBody}>
        <p className={styles.helperNote} style={{ marginTop: 0, marginBottom: 16 }}>
          Maklumat ini dipaparkan pada halaman &quot;Hubungi Kami&quot; awam.
        </p>
        <form onSubmit={handleSubmit}>
          <div className={styles.formRow}>
            <label htmlFor="ss-email">Alamat Email</label>
            <input
              type="text"
              id="ss-email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contoh: adunkasih@kedah.gov.my"
            />
            {errors.email?.map((err) => (
              <p key={err} className={styles.fieldError}>
                {err}
              </p>
            ))}
          </div>
          <div className={styles.formRow}>
            <label htmlFor="ss-phone">Nombor Telefon</label>
            <input
              type="text"
              id="ss-phone"
              className={styles.input}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="contoh: 0451234567"
            />
            {errors.phone?.map((err) => (
              <p key={err} className={styles.fieldError}>
                {err}
              </p>
            ))}
          </div>

          {formError && <p className={styles.formError}>{formError}</p>}

          <div className={styles.modalButtonRow}>
            {success && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#15803d", fontSize: 13.5, fontWeight: 600 }}>
                <CheckCircle2 size={16} />
                Berjaya disimpan.
              </span>
            )}
            <button type="submit" className={styles.btnSubmit} disabled={loading}>
              {loading ? "MENYIMPAN..." : "SIMPAN"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
