"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, LogOut } from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";
import styles from "./legacy-header.module.css";
import staffStyles from "./citizen-header.module.css";

export function PegawaiHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className={styles.header}>
      <Link href="/pegawai" className={styles.logoLink} onClick={() => setMenuOpen(false)}>
        <img src="/images/logo1.png" alt="Logo Malaysia" />
        <img src="/images/logo2.png" alt="Logo Kedah" />
        <div className={styles.logo}>ADUNKASIH</div>
      </Link>
      <button
        type="button"
        className={styles.menuToggle}
        onClick={() => setMenuOpen((o) => !o)}
        aria-label="Togol menu"
        aria-expanded={menuOpen}
      >
        {menuOpen ? <X size={26} /> : <Menu size={26} />}
      </button>
      <nav className={`${styles.navLinks} ${menuOpen ? styles.navLinksActive : ""}`}>
        <Link href="/pegawai" onClick={() => setMenuOpen(false)}>
          Papan Utama
        </Link>
        <Link href="/pegawai/applications" onClick={() => setMenuOpen(false)}>
          Senarai Permohonan
        </Link>
        <Link href="/pegawai/report" onClick={() => setMenuOpen(false)}>
          Laporan
        </Link>

        <form action={logoutAction}>
          <button type="submit" className={staffStyles.logoutBtn}>
            <LogOut size={16} />
            Log Keluar
          </button>
        </form>
      </nav>
    </header>
  );
}
