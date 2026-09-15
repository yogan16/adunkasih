"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, LogOut } from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";
import styles from "./legacy-header.module.css";
import adminStyles from "./citizen-header.module.css";

export function AdminHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className={styles.header}>
      <Link href="/admin" className={styles.logoLink} onClick={() => setMenuOpen(false)}>
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
        <Link href="/admin" onClick={() => setMenuOpen(false)}>
          Papan Utama
        </Link>
        <Link href="/admin/users" onClick={() => setMenuOpen(false)}>
          Urus Pengguna
        </Link>
        <Link href="/admin/aid-types" onClick={() => setMenuOpen(false)}>
          Jenis Bantuan
        </Link>
        <Link href="/admin/announcements" onClick={() => setMenuOpen(false)}>
          Pengumuman
        </Link>
        <Link href="/admin/adun-budgets" onClick={() => setMenuOpen(false)}>
          Peruntukan ADUN
        </Link>
        <Link href="/admin/feedback" onClick={() => setMenuOpen(false)}>
          Maklum Balas
        </Link>
        <Link href="/admin/site-settings" onClick={() => setMenuOpen(false)}>
          Tetapan Laman
        </Link>

        <form action={logoutAction}>
          <button type="submit" className={adminStyles.logoutBtn}>
            <LogOut size={16} />
            Log Keluar
          </button>
        </form>
      </nav>
    </header>
  );
}
