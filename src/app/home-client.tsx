"use client";

import { useState } from "react";
import { LegacyHeader } from "@/components/legacy-header";
import { LegacyFooter } from "@/components/legacy-footer";
import styles from "./home.module.css";

const MAX_LENGTH = 70;

type Announcement = {
  id: string;
  text: string;
  date: string;
};

export function HomeClient({ announcements }: { announcements: Announcement[] }) {
  const [modalText, setModalText] = useState<string | null>(null);

  return (
    <div className={styles.page}>
      <LegacyHeader variant="transparent" />

      <main>
        <h2 className={styles.heading2}>Portal Rasmi</h2>
        <h1 className={styles.heading1}>
          ADUNKASIH @ KEDAH <br />
          2024
        </h1>
        <div style={{ textAlign: "center" }}>
          <div className={styles.innovativeSystem}>- SISTEM KEBAJIKAN YANG INOVATIF -</div>
        </div>

        <div className={styles.announcementContainer}>
          <div className={styles.announcementTab}>PENGUMUMAN TERKINI</div>
          <div className={styles.announcementLine} />
        </div>

        <div className={styles.announcementsWrapper}>
          {announcements.map((a) => (
            <div key={a.id} className={styles.contentBox}>
              <div className={styles.announcementRow}>
                <div className={styles.announcementText}>
                  {a.text.length > MAX_LENGTH ? (
                    <>
                      {a.text.slice(0, MAX_LENGTH)}...{" "}
                      <span className={styles.seeAllLink} onClick={() => setModalText(a.text)}>
                        See all
                      </span>
                    </>
                  ) : (
                    a.text
                  )}
                </div>
                <div className={styles.announcementDate}>{a.date}</div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {modalText && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <button
              type="button"
              className={styles.closeModal}
              onClick={() => setModalText(null)}
              aria-label="Tutup"
            >
              &times;
            </button>
            <div className={styles.modalHeader}>
              <img src="/images/announce.png" alt="Announcement Icon" className={styles.modalAnnouncementIcon} />
            </div>
            <div className={styles.fullAnnouncementText}>{modalText}</div>
          </div>
        </div>
      )}

      <LegacyFooter variant="fixed-black" />
    </div>
  );
}
