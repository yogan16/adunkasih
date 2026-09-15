"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X, Bell, LogOut } from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";
import styles from "./legacy-header.module.css";
import citizenStyles from "./citizen-header.module.css";

export function CitizenHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header className={styles.header}>
      <Link href="/dashboard" className={styles.logoLink} onClick={() => setMenuOpen(false)}>
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
        <Link href="/dashboard" onClick={() => setMenuOpen(false)}>
          Papan Utama
        </Link>
        <Link href="/about" onClick={() => setMenuOpen(false)}>
          Tentang Kami
        </Link>
        <Link href="/contact" onClick={() => setMenuOpen(false)}>
          Hubungi Kami
        </Link>

        <div className={citizenStyles.notifWrapper}>
          <button
            type="button"
            className={citizenStyles.notifBell}
            onClick={() => setNotifOpen((o) => !o)}
            aria-label="Pemberitahuan"
          >
            <Bell size={20} />
          </button>
          {notifOpen && (
            <div className={citizenStyles.notifPanel}>
              <p className={citizenStyles.notifTitle}>PEMBERITAHUAN</p>
              <p className={citizenStyles.notifEmpty}>Tiada pemberitahuan buat masa ini.</p>
            </div>
          )}
        </div>

        <form action={logoutAction}>
          <button type="submit" className={citizenStyles.logoutBtn}>
            <LogOut size={16} />
            Log Keluar
          </button>
        </form>
      </nav>
    </header>
  );
}
