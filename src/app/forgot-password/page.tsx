"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LegacyHeader } from "@/components/legacy-header";
import { LegacyFooter } from "@/components/legacy-footer";
import { PasswordInput } from "@/components/password-input";
import styles from "./forgot-password.module.css";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [idNumber, setIdNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idNumber, phone, newPassword }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Ralat semasa proses. Sila cuba lagi.");
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/login"), 1500);
  }

  return (
    <div className={styles.page}>
      <LegacyHeader />

      <div className={styles.container}>
        <div className={styles.resetContent}>
          <div>
            <img src="/images/forgot.png" alt="Reset Password Image" height={170} width={180} />
          </div>
          <div className={styles.resetBox}>
            <form className={styles.resetForm} onSubmit={handleSubmit}>
              <h2>Lupa Kata Laluan</h2>

              <label htmlFor="idnumber">No. Kad Pengenalan</label>
              <input
                type="text"
                id="idnumber"
                placeholder="Masukkan No. Kad Pengenalan"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                required
              />

              <label htmlFor="phone">No. Tel</label>
              <input
                type="text"
                id="phone"
                placeholder="Masukkan No. Telefon"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />

              <label htmlFor="newPassword">Kata Laluan Baru</label>
              <PasswordInput
                id="newPassword"
                placeholder="Masukkan Kata Laluan Baru"
                value={newPassword}
                onChange={setNewPassword}
                autoComplete="new-password"
                required
              />

              {error && <p className={styles.errorText}>{error}</p>}
              {success && <p className={styles.successText}>Kata laluan telah ditetapkan semula!</p>}

              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? "SEDANG PROSES..." : "RESET KATA LALUAN"}
              </button>
              <p>
                Ingat kata laluan? <Link href="/login">Log Masuk</Link>
              </p>
            </form>
          </div>
        </div>
      </div>

      <LegacyFooter variant="fixed-black" />
    </div>
  );
}
