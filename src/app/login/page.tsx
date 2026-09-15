"use client";

import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LegacyHeader } from "@/components/legacy-header";
import { LegacyFooter } from "@/components/legacy-footer";
import styles from "./login.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [idNumber, setIdNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await signIn("credentials", {
      idNumber,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Akaun tidak ditemui atau kata laluan tidak sah!");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className={styles.page}>
      <LegacyHeader hideLoginLink />

      <div className={styles.container}>
        <div className={styles.loginContent}>
          <div>
            <img src="/images/login.png" alt="Login Image" height={180} width={180} />
          </div>
          <div className={styles.loginBox}>
            <form className={styles.loginForm} onSubmit={handleSubmit}>
              <h2>Log Masuk</h2>

              <label htmlFor="idnumber">No. Kad Pengenalan</label>
              <input
                type="text"
                id="idnumber"
                placeholder="Masukkan No. Kad Pengenalan"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                autoComplete="username"
                required
              />

              <label htmlFor="password">Kata Laluan</label>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Masukkan Kata Laluan"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />

              <div className={styles.showHideContainer}>
                <input
                  type="checkbox"
                  id="showHidePassword"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                />
                <label htmlFor="showHidePassword">Tunjuk/Sembunyi</label>
              </div>

              {error && <p className={styles.errorText}>{error}</p>}

              <button type="submit" disabled={loading}>
                {loading ? "SEDANG LOG MASUK..." : "LOG MASUK"}
              </button>
              <p>
                Tidak mempunyai akaun? <Link href="/register">Daftar Masuk</Link>
              </p>
              <p>
                <Link href="/forgot-password">Lupa Kata Laluan?</Link>
              </p>
            </form>
          </div>
        </div>
      </div>

      <LegacyFooter variant="fixed-black" />
    </div>
  );
}
