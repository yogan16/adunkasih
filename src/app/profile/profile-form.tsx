"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { User, IdCard, KeyRound, CheckCircle2 } from "lucide-react";
import { PasswordInput } from "@/components/password-input";
import styles from "./profile.module.css";

type FieldErrors = Partial<
  Record<"fullname" | "phone" | "currentPassword" | "newPassword" | "confirmNewPassword", string[]>
>;

export function ProfileForm({
  user,
}: {
  user: { fullname: string; idNumber: string; phone: string };
}) {
  const router = useRouter();
  const [fullname, setFullname] = useState(user.fullname);
  const [phone, setPhone] = useState(user.phone);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors({});
    setFormError(null);
    setSuccess(false);

    if (newPassword && newPassword !== confirmNewPassword) {
      setErrors({ confirmNewPassword: ["Pengesahan kata laluan tidak sepadan"] });
      return;
    }

    setLoading(true);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullname, phone, currentPassword, newPassword }),
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

    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setSuccess(true);
    router.refresh();
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.avatarRow}>
        <div className={styles.avatar}>{user.fullname.trim().charAt(0).toUpperCase()}</div>
        <div>
          <p className={styles.avatarName}>{user.fullname}</p>
          <p className={styles.avatarIc}>{user.idNumber}</p>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <User size={16} />
          Maklumat Peribadi
        </div>
        <div className={styles.sectionBody}>
          <div className={styles.formRow}>
            <div className={styles.formColumn}>
              <label htmlFor="fullname">Nama Penuh</label>
              <input
                type="text"
                id="fullname"
                className={styles.input}
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                required
              />
              {errors.fullname?.map((err) => (
                <p key={err} className={styles.fieldError}>
                  {err}
                </p>
              ))}
            </div>
            <div className={styles.formColumn}>
              <label htmlFor="phone">No. Tel</label>
              <input
                type="text"
                id="phone"
                className={styles.input}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              {errors.phone?.map((err) => (
                <p key={err} className={styles.fieldError}>
                  {err}
                </p>
              ))}
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formColumn}>
              <label htmlFor="idnumber">
                <IdCard size={13} /> No. Kad Pengenalan
              </label>
              <input type="text" id="idnumber" className={styles.input} value={user.idNumber} disabled />
              <p className={styles.helperNote}>No. Kad Pengenalan tidak boleh diubah kerana ia digunakan untuk log masuk.</p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <KeyRound size={16} />
          Tukar Kata Laluan
        </div>
        <div className={styles.sectionBody}>
          <p className={styles.helperNote} style={{ marginTop: 0, marginBottom: 16 }}>
            Biarkan ruangan ini kosong jika anda tidak mahu menukar kata laluan.
          </p>
          <div className={styles.formRow}>
            <div className={styles.formColumn}>
              <label htmlFor="currentPassword">Kata Laluan Semasa</label>
              <PasswordInput
                id="currentPassword"
                className={styles.input}
                value={currentPassword}
                onChange={setCurrentPassword}
              />
              {errors.currentPassword?.map((err) => (
                <p key={err} className={styles.fieldError}>
                  {err}
                </p>
              ))}
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formColumn}>
              <label htmlFor="newPassword">Kata Laluan Baharu</label>
              <PasswordInput
                id="newPassword"
                className={styles.input}
                value={newPassword}
                onChange={setNewPassword}
              />
              {errors.newPassword?.map((err) => (
                <p key={err} className={styles.fieldError}>
                  {err}
                </p>
              ))}
            </div>
            <div className={styles.formColumn}>
              <label htmlFor="confirmNewPassword">Sahkan Kata Laluan Baharu</label>
              <PasswordInput
                id="confirmNewPassword"
                className={styles.input}
                value={confirmNewPassword}
                onChange={setConfirmNewPassword}
              />
              {errors.confirmNewPassword?.map((err) => (
                <p key={err} className={styles.fieldError}>
                  {err}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.buttonRow}>
        {success && (
          <span className={styles.successNote}>
            <CheckCircle2 size={16} />
            Profil berjaya dikemaskini.
          </span>
        )}
        {formError && <span className={styles.formError}>{formError}</span>}
        <button type="submit" className={styles.btnSubmit} disabled={loading}>
          {loading ? "MENYIMPAN..." : "SIMPAN PERUBAHAN"}
        </button>
      </div>
    </form>
  );
}
