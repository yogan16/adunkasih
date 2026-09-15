"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import styles from "./legacy-header.module.css";

export function LegacyHeader({
  hideLoginLink = false,
  variant = "solid",
}: {
  hideLoginLink?: boolean;
  variant?: "solid" | "transparent";
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header
      className={`${styles.header} ${variant === "transparent" ? styles.headerTransparent : ""}`}
    >
      <Link href="/" className={styles.logoLink} onClick={() => setMenuOpen(false)}>
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
        <Link href="/" onClick={() => setMenuOpen(false)}>
          Utama
        </Link>
        <Link href="/about" onClick={() => setMenuOpen(false)}>
          Tentang Kami
        </Link>
        <Link href="/general-dashboard" onClick={() => setMenuOpen(false)}>
          Maklumat Agihan
        </Link>
        <Link href="/contact" onClick={() => setMenuOpen(false)}>
          Hubungi Kami
        </Link>
        {!hideLoginLink && (
          <Link href="/login" className={styles.loginBtn} onClick={() => setMenuOpen(false)}>
            Log Masuk
          </Link>
        )}
      </nav>
    </header>
  );
}
