"use client";

import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LegacyHeader } from "@/components/legacy-header";
import { LegacyFooter } from "@/components/legacy-footer";
import styles from "./register.module.css";

type FieldErrors = Partial<Record<"fullname" | "idNumber" | "phone" | "password", string[]>>;

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ fullname: "", idNumber: "", phone: "", password: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors({});
    setFormError(null);
    setLoading(true);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setErrors(data?.error ?? {});
      setFormError(data?.error ? null : "Pendaftaran gagal. Sila cuba lagi.");
      setLoading(false);
      return;
    }

    const signInRes = await signIn("credentials", {
      idNumber: form.idNumber,
      password: form.password,
      redirect: false,
    });

    setLoading(false);

    if (signInRes?.error) {
      router.push("/login");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className={styles.page}>
      <LegacyHeader />

      <div className={styles.container}>
        <div className={styles.registerContent}>
          <div>
            <img src="/images/register.png" alt="Register Image" height={190} width={190} />
          </div>
          <div className={styles.registerBox}>
            <form className={styles.registerForm} onSubmit={handleSubmit}>
              <h2>Daftar Masuk</h2>

              <label htmlFor="fullname">Nama Penuh</label>
              <input
                type="text"
                id="fullname"
                placeholder="contoh: Ahmad A/L Shaifudin"
                value={form.fullname}
                onChange={(e) => update("fullname", e.target.value)}
                required
              />
              {errors.fullname?.map((err) => (
                <p key={err} className={styles.errorText}>
                  {err}
                </p>
              ))}

              <label htmlFor="idnumber">No. Kad Pengenalan</label>
              <input
                type="text"
                id="idnumber"
                placeholder="contoh: 000203025264"
                value={form.idNumber}
                onChange={(e) => update("idNumber", e.target.value)}
                required
              />
              {errors.idNumber?.map((err) => (
                <p key={err} className={styles.errorText}>
                  {err}
                </p>
              ))}

              <label htmlFor="phone">No. Tel</label>
              <input
                type="text"
                id="phone"
                placeholder="contoh: 60131156985"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                required
              />
              {errors.phone?.map((err) => (
                <p key={err} className={styles.errorText}>
                  {err}
                </p>
              ))}

              <label htmlFor="password">Kata Laluan</label>
              <input
                type="password"
                id="password"
                placeholder="contoh: User@123"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                required
              />
              {errors.password?.map((err) => (
                <p key={err} className={styles.errorText}>
                  {err}
                </p>
              ))}

              {formError && <p className={styles.errorText}>{formError}</p>}

              <button type="submit" disabled={loading}>
                {loading ? "SEDANG DAFTAR..." : "DAFTAR"}
              </button>
              <p>
                Sudah mempunyai akaun? <Link href="/login">Log Masuk</Link>
              </p>
            </form>
          </div>
        </div>
      </div>

      <LegacyFooter variant="fixed-black" />
    </div>
  );
}
