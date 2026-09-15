"use client";

import { useState, type FormEvent } from "react";
import styles from "./contact.module.css";

export function ContactForm({ email, phone: contactPhone }: { email: string; phone: string }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, comment }),
    });

    setLoading(false);
    setSubmitted(true);
    setName("");
    setPhone("");
    setComment("");
  }

  return (
    <div className={styles.contactBody}>
      <div className={styles.leftPanel}>
        <div className={styles.innerLeftContainer}>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="contactName">Nama</label>
              <input
                type="text"
                id="contactName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="contactPhone">Nombor Telefon</label>
              <input
                type="text"
                id="contactPhone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="contactComment">Komen</label>
              <textarea
                id="contactComment"
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
              />
            </div>
            <button type="submit" className={styles.btnSubmit} disabled={loading}>
              {loading ? "Menghantar..." : "Hantar"}
            </button>
            {submitted && <p className={styles.successText}>Maklumat anda telah berjaya dihantar!</p>}
          </form>
        </div>
      </div>

      <div className={styles.rightPanel}>
        <div className={styles.innerRightContainer}>
          <div className={styles.rightPanelText}>
            Untuk pertanyaan, bantuan teknikal, melalui maklumat hubungan yang diberikan:
          </div>
          <div className={styles.infoItem}>
            <div className={styles.infoIcon}>
              <img src="/images/phone-icon.png" alt="Phone Icon" />
            </div>
            <span>{contactPhone || "Tiada Nombor Telefon"}</span>
          </div>
          <div className={styles.infoItem}>
            <div className={styles.infoIcon}>
              <img src="/images/email-icon.png" alt="Email Icon" />
            </div>
            <span>{email || "Tiada Email"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
